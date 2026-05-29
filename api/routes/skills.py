"""技能相关 API"""

from dataclasses import asdict
from fastapi import APIRouter, HTTPException
from eduskilk.engine import load_all_skills, get_skill, save_skill_to_disk, Skill, SkillMeta, SkillParameter

router = APIRouter()


def _skill_to_dict(s) -> dict:
    return {
        "name": s.meta.name,
        "display_name": s.meta.display_name,
        "version": s.meta.version,
        "description": s.meta.description,
        "category": s.meta.category,
        "tags": s.meta.tags,
        "author": s.meta.author,
        "parameters": [asdict(p) for p in s.meta.parameters],
        "prompt_template": s.prompt_template,
    }


@router.get("")
def list_skills(category: str = None, search: str = None):
    skills = load_all_skills()
    result = []
    for s in skills:
        if category and (s.meta.category or "未分类") != category:
            continue
        if search:
            q = search.lower()
            if q not in s.meta.display_name.lower() and q not in s.meta.description.lower() and not any(q in t for t in s.meta.tags):
                continue
        result.append(_skill_to_dict(s))
    return result


@router.get("/{name}")
def get_skill_detail(name: str):
    s = get_skill(name)
    if not s:
        raise HTTPException(status_code=404, detail="技能不存在")
    return _skill_to_dict(s)


@router.delete("/{name}")
def delete_skill(name: str):
    import shutil
    from pathlib import Path
    from eduskilk.config import SKILLS_DIR
    skill_dir = SKILLS_DIR / name
    if not skill_dir.exists():
        raise HTTPException(status_code=404, detail="技能不存在")
    shutil.rmtree(skill_dir)
    return {"ok": True}


@router.post("")
def create_skill(data: dict):
    ps = [SkillParameter(
        name=p.get("name", ""),
        display_name=p.get("display_name", ""),
        type=p.get("type", "text"),
        description=p.get("description", ""),
        required=p.get("required", True),
        default=p.get("default", ""),
        options=p.get("options", []),
    ) for p in data.get("parameters", [])]

    s = Skill(
        meta=SkillMeta(
            name=data.get("name", ""),
            display_name=data.get("display_name", ""),
            version="1.0.0",
            description=data.get("description", ""),
            category=data.get("category", ""),
            tags=data.get("tags", []),
            parameters=ps,
            author="教师自建",
        ),
        prompt_template=data.get("prompt_template", ""),
    )
    sd = save_skill_to_disk(s)
    return {"ok": True, "path": str(sd)}
