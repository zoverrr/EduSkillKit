"""Skill 引擎 — 加载、解析、渲染、执行 Skill"""

import re
import yaml
from pathlib import Path
from dataclasses import dataclass, field
from jinja2 import Template, TemplateError

from eduskilk.config import SKILLS_DIR


@dataclass
class SkillMeta:
    """Skill 元数据（从 SKILL.md frontmatter 解析）"""
    name: str = ""
    display_name: str = ""
    version: str = "1.0.0"
    description: str = ""
    category: str = ""
    tags: list = field(default_factory=list)
    parameters: list = field(default_factory=list)
    author: str = ""
    # 原始 SKILL.md 路径
    path: str = ""


@dataclass
class Skill:
    """完整的 Skill 对象"""
    meta: SkillMeta
    prompt_template: str = ""
    resources: dict = field(default_factory=dict)  # name -> content


@dataclass
class SkillParameter:
    """Skill 参数定义"""
    name: str = ""
    display_name: str = ""
    type: str = "text"       # text, textarea, select, number
    description: str = ""
    required: bool = True
    default: str = ""
    options: list = field(default_factory=list)  # type=select 时的选项


def parse_skill_md(content: str) -> tuple[dict, str]:
    """
    解析 SKILL.md 文件，分离 frontmatter 和 prompt body。

    Returns:
        (frontmatter_dict, prompt_template_str)
    """
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)', content, re.DOTALL)
    if not match:
        return {}, content

    fm_text, prompt = match.groups()
    try:
        fm = yaml.safe_load(fm_text) or {}
    except yaml.YAMLError:
        fm = {}

    return fm, prompt.strip()


def load_skill(skill_dir: Path) -> Skill | None:
    """
    从目录加载一个 Skill。

    目录结构：
        skill_dir/
        ├── SKILL.md          # 元数据 + 提示词模板
        └── resources/        # 可选：参考资源文件
    """
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        return None

    content = skill_md.read_text(encoding="utf-8")
    fm, prompt = parse_skill_md(content)

    # 解析参数列表
    parameters = []
    for p in fm.get("parameters", []):
        if isinstance(p, dict):
            parameters.append(SkillParameter(
                name=p.get("name", ""),
                display_name=p.get("display_name", p.get("name", "")),
                type=p.get("type", "text"),
                description=p.get("description", ""),
                required=p.get("required", True),
                default=p.get("default", ""),
                options=p.get("options", []),
            ))

    meta = SkillMeta(
        name=fm.get("name", skill_dir.name),
        display_name=fm.get("display_name", fm.get("name", skill_dir.name)),
        version=fm.get("version", "1.0.0"),
        description=fm.get("description", ""),
        category=fm.get("category", ""),
        tags=fm.get("tags", []),
        parameters=parameters,
        author=fm.get("author", ""),
        path=str(skill_md),
    )

    # 加载资源文件
    resources = {}
    res_dir = skill_dir / "resources"
    if res_dir.exists():
        for f in res_dir.iterdir():
            if f.is_file():
                resources[f.name] = f.read_text(encoding="utf-8")

    return Skill(meta=meta, prompt_template=prompt, resources=resources)


def load_all_skills(skills_dir: Path = None) -> list[Skill]:
    """加载指定目录下的所有 Skill"""
    skills_dir = skills_dir or SKILLS_DIR
    skills = []

    if not skills_dir.exists():
        return skills

    for item in sorted(skills_dir.iterdir()):
        if item.is_dir():
            skill = load_skill(item)
            if skill:
                skills.append(skill)

    return skills


def get_skill(name: str, skills_dir: Path = None) -> Skill | None:
    """按名称获取单个 Skill"""
    skills_dir = skills_dir or SKILLS_DIR
    skill_dir = skills_dir / name
    if skill_dir.exists():
        return load_skill(skill_dir)
    return None


def render_prompt(skill: Skill, params: dict) -> str:
    """
    渲染 Skill 的提示词模板。

    将用户填入的参数代入 Jinja2 模板，生成最终的 system prompt。
    """
    try:
        template = Template(skill.prompt_template)
        return template.render(**params)
    except TemplateError as e:
        raise ValueError(f"提示词模板渲染失败: {e}")


def build_messages(skill: Skill, params: dict, user_input: str = "") -> list[dict]:
    """
    构建发送给大模型的 messages 列表。

    结构：
        [0] system: skill 的渲染后提示词
        [1] user: 用户补充输入（如有）
    """
    system_prompt = render_prompt(skill, params)
    messages = [{"role": "system", "content": system_prompt}]

    if user_input:
        messages.append({"role": "user", "content": user_input})

    return messages


def save_skill_to_disk(skill: Skill, base_dir: Path = None):
    """将 Skill 保存到磁盘（用于教师创建的新 Skill）"""
    base_dir = base_dir or SKILLS_DIR
    skill_dir = base_dir / skill.meta.name
    skill_dir.mkdir(parents=True, exist_ok=True)

    # 构建 SKILL.md 内容
    fm = {
        "name": skill.meta.name,
        "display_name": skill.meta.display_name,
        "version": skill.meta.version,
        "description": skill.meta.description,
        "category": skill.meta.category,
        "tags": skill.meta.tags,
        "author": skill.meta.author,
        "parameters": [
            {
                "name": p.name,
                "display_name": p.display_name,
                "type": p.type,
                "description": p.description,
                "required": p.required,
                "default": p.default,
                "options": p.options,
            }
            for p in skill.meta.parameters
        ],
    }

    content = "---\n" + yaml.dump(fm, allow_unicode=True, default_flow_style=False) + "---\n\n"
    content += skill.prompt_template

    (skill_dir / "SKILL.md").write_text(content, encoding="utf-8")

    # 保存资源文件
    if skill.resources:
        res_dir = skill_dir / "resources"
        res_dir.mkdir(exist_ok=True)
        for name, content_text in skill.resources.items():
            (res_dir / name).write_text(content_text, encoding="utf-8")

    return skill_dir
