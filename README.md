# EduSkillKit

面向教育的 AI 技能工作台 -- 让教师创建、分享、复用教学 AI 技能。

教师只需填写几个参数，即可借助国产大模型获得高质量的教学辅助输出：教案设计、课堂互动、学情分析、作业分层、试卷命题……共 27 个内置技能，覆盖 6 大教学场景。

## 功能特性

- **27 个内置教学技能**：教案设计、课堂互动、学情诊断、分层作业、试卷命题、教学反思等
- **9 家国产大模型**：DeepSeek、通义千问、智谱清言、月之暗面、腾讯混元、零一万物、百川智能、讯飞星火、MiMo
- **文件解析**：上传 Word / PDF / Excel / TXT 文件，自动提取内容并注入对话
- **技能创建**：四步式引导，教师可将教学经验封装为可复用的 AI 技能模板
- **对话管理**：历史对话保存、加载、删除

## 快速开始

### 方式一：命令行启动（推荐）

```bash
# 1. 安装依赖
pip install -e .

# 2. 配置 API Key
cp .env.example .env
# 编辑 .env 填入你的 API Key

# 3. 启动
eduskilk
# 浏览器自动打开 http://127.0.0.1:8000
```

### 方式二：开发模式

```bash
# 后端
pip install -e .
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000

# 前端（另开终端）
cd frontend
npm install
npm run dev
```

Windows 用户可双击 `dev.bat`，Linux/macOS 用户可运行 `bash dev.sh`。

## 项目结构

```
EduSkillKit/
├── eduskilk/           # 核心 Python 包
│   ├── config.py       # 配置管理、模型提供商定义
│   ├── engine.py       # Skill 加载、解析、渲染引擎
│   ├── llm.py          # 统一 LLM 客户端（OpenAI 兼容格式）
│   ├── db.py           # SQLite 数据层
│   ├── file_parser.py  # 文件解析（Word/PDF/Excel/TXT）
│   └── __main__.py     # CLI 入口
├── api/                # FastAPI 后端
│   ├── main.py         # 应用入口、CORS、静态文件服务
│   └── routes/         # API 路由
├── frontend/           # React 前端（Vite + Tailwind）
│   ├── src/
│   └── dist/           # 构建产物（npm run build）
├── skills/             # 内置教学技能（SKILL.md + Jinja2 模板）
├── .env.example        # API Key 配置模板
└── pyproject.toml      # 项目元数据与依赖
## 技能开发

每个技能是一个目录，包含 `SKILL.md` 文件：

```
skills/
└── lesson_plan/
    └── SKILL.md
```

`SKILL.md` 格式：

```markdown
---
name: lesson_plan
display_name: 教案设计助手
description: 根据课程主题生成教学设计方案
category: 教学实施
tags: [教案, 教学设计]
parameters:
  - name: topic
    display_name: 课程主题
    type: text
    required: true
---

你是一位教学设计专家……

请根据以下信息设计教案：
- 主题：{{ topic }}
```

## 支持的模型提供商

| 提供商 | 环境变量 | 模型 |
|--------|----------|------|
| DeepSeek | `DEEPSEEK_API_KEY` | deepseek-chat, deepseek-reasoner |
| 通义千问 | `DASHSCOPE_API_KEY` | qwen-plus, qwen-turbo, qwen-max |
| 智谱清言 | `ZHIPU_API_KEY` | glm-4-flash, glm-4-plus, glm-4-long |
| 月之暗面 | `MOONSHOT_API_KEY` | moonshot-v1-8k/32k/128k |
| 腾讯混元 | `HUNYUAN_API_KEY` | hunyuan-lite/standard/pro |
| 零一万物 | `YI_API_KEY` | yi-lightning, yi-large, yi-medium |
| 百川智能 | `BAICHUAN_API_KEY` | Baichuan4, Baichuan3-Turbo |
| 讯飞星火 | `SPARK_API_KEY` | generalv3.5, generalv3, 4.0Ultra |
| MiMo | `MIMO_API_KEY` | mimo-v2.5-pro, mimo-v2.5-flash |

## 许可证

[MIT License](LICENSE)
