"""应用配置管理"""

import os
import json
from pathlib import Path
from dataclasses import dataclass, field, asdict

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent
SKILLS_DIR = PROJECT_ROOT / "skills"
DATA_DIR = PROJECT_ROOT / "data"
DB_PATH = DATA_DIR / "eduskilk.db"
ENV_PATH = PROJECT_ROOT / ".env"


def load_env():
    """从 .env 文件加载环境变量（不覆盖已有的）"""
    if not ENV_PATH.exists():
        return
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" in line:
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and value and key not in os.environ:
                os.environ[key] = value


# 启动时自动加载 .env
load_env()

# .env 中的 API Key 环境变量名映射
ENV_KEY_MAP = {
    "deepseek": "DEEPSEEK_API_KEY",
    "qwen": "DASHSCOPE_API_KEY",
    "zhipu": "ZHIPU_API_KEY",
    "moonshot": "MOONSHOT_API_KEY",
    "hunyuan": "HUNYUAN_API_KEY",
    "yi": "YI_API_KEY",
    "baichuan": "BAICHUAN_API_KEY",
    "spark": "SPARK_API_KEY",
    "mimo": "MIMO_API_KEY",
}

# 预置国产大模型 API 端点（OpenAI 兼容格式）
BUILTIN_PROVIDERS = {
    "deepseek": {
        "name": "DeepSeek",
        "base_url": "https://api.deepseek.com/v1",
        "models": ["deepseek-chat", "deepseek-reasoner"],
    },
    "qwen": {
        "name": "通义千问",
        "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "models": ["qwen-plus", "qwen-turbo", "qwen-max"],
    },
    "zhipu": {
        "name": "智谱清言",
        "base_url": "https://open.bigmodel.cn/api/paas/v4",
        "models": ["glm-4-flash", "glm-4-plus", "glm-4-long"],
    },
    "moonshot": {
        "name": "月之暗面",
        "base_url": "https://api.moonshot.cn/v1",
        "models": ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"],
    },
    "hunyuan": {
        "name": "腾讯混元",
        "base_url": "https://api.hunyuan.cloud.tencent.com/v1",
        "models": ["hunyuan-lite", "hunyuan-standard", "hunyuan-pro"],
    },
    "yi": {
        "name": "零一万物",
        "base_url": "https://api.lingyiwanwu.com/v1",
        "models": ["yi-lightning", "yi-large", "yi-medium"],
    },
    "baichuan": {
        "name": "百川智能",
        "base_url": "https://api.baichuan-ai.com/v1",
        "models": ["Baichuan4", "Baichuan3-Turbo"],
    },
    "spark": {
        "name": "讯飞星火",
        "base_url": "https://spark-api-open.xf-yun.com/v1",
        "models": ["generalv3.5", "generalv3", "4.0Ultra"],
    },
    "mimo": {
        "name": "MiMo",
        "base_url": "https://api.mimo.ai/v1",
        "models": ["mimo-v2.5-pro", "mimo-v2.5-flash"],
    },
}

# 配置文件路径
CONFIG_PATH = DATA_DIR / "config.json"


@dataclass
class AppConfig:
    """应用运行时配置"""

    # 当前选中的模型提供商
    provider: str = "deepseek"
    model: str = "deepseek-chat"
    api_key: str = ""

    # 各提供商的 API Key
    api_keys: dict = field(default_factory=dict)

    # 生成参数
    temperature: float = 0.7
    max_tokens: int = 4096
    top_p: float = 1.0
    frequency_penalty: float = 0.0
    presence_penalty: float = 0.0

    # 自定义 skill 仓库 URL（GitHub raw 链接前缀）
    remote_skill_repo: str = ""

    def get_provider_config(self) -> dict:
        return BUILTIN_PROVIDERS.get(self.provider, {})

    def get_base_url(self) -> str:
        p = self.get_provider_config()
        return p.get("base_url", "")

    def get_api_key(self) -> str:
        """获取当前 provider 的 API Key，优先读环境变量"""
        # 1. 优先读 .env / 环境变量
        env_var = ENV_KEY_MAP.get(self.provider)
        if env_var:
            env_val = os.environ.get(env_var, "")
            if env_val:
                return env_val
        # 2. 回退到手动配置
        return self.api_keys.get(self.provider, self.api_key)

    def set_api_key(self, provider: str, key: str):
        """设置指定 provider 的 API Key"""
        self.api_keys[provider] = key

    def save(self):
        """保存配置（含 API Key，由用户自行管理安全性）"""
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        data = asdict(self)
        # 清空顶层 api_key（已迁移到 api_keys 字典）
        data["api_key"] = ""
        CONFIG_PATH.write_text(
            json.dumps(data, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    @classmethod
    def load(cls) -> "AppConfig":
        if CONFIG_PATH.exists():
            data = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
            return cls(**data)
        return cls()


def ensure_dirs():
    """确保必要的目录存在"""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
