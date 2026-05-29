"""对话补全 API（SSE 流式）"""

import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from eduskilk.engine import get_skill, render_prompt
from eduskilk.llm import chat_completion
from eduskilk.config import AppConfig

router = APIRouter()


@router.post("")
async def chat(data: dict):
    skill_name = data.get("skill_name")
    params = data.get("params", {})
    message = data.get("message", "")
    provider = data.get("provider")
    model = data.get("model")

    skill = get_skill(skill_name)
    if not skill:
        raise HTTPException(status_code=404, detail="技能不存在")

    system_prompt = render_prompt(skill, params)
    messages = [{"role": "system", "content": system_prompt}]
    if message:
        messages.append({"role": "user", "content": message})

    config = AppConfig.load()
    if provider:
        config.provider = provider
    if model:
        config.model = model

    async def event_stream():
        try:
            gen = chat_completion(messages, config, stream=True)
            for chunk in gen:
                yield f"data: {json.dumps({'content': chunk}, ensure_ascii=False)}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
