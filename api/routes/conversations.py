"""对话历史 CRUD API"""

from fastapi import APIRouter, HTTPException
from eduskilk.db import (
    save_conversation, list_conversations, get_conversation,
    update_conversation, delete_conversation,
)

router = APIRouter()


@router.get("")
def list_all(limit: int = 50):
    return list_conversations(limit)


@router.get("/{conv_id}")
def get_one(conv_id: int):
    conv = get_conversation(conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="对话不存在")
    return conv


@router.post("")
def create(data: dict):
    cid = save_conversation(
        title=data.get("title", "未命名对话"),
        skill_name=data.get("skill_name", ""),
        model=data.get("model", ""),
        provider=data.get("provider", ""),
        messages=data.get("messages", []),
    )
    return {"id": cid}


@router.put("/{conv_id}")
def update(conv_id: int, data: dict):
    update_conversation(conv_id, data.get("messages", []), data.get("title"))
    return {"ok": True}


@router.delete("/{conv_id}")
def delete(conv_id: int):
    delete_conversation(conv_id)
    return {"ok": True}
