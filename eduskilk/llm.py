"""统一 LLM 客户端 — 支持所有 OpenAI 兼容的国产大模型 API"""

import httpx
import json
from typing import Generator

from eduskilk.config import AppConfig


def chat_completion(
    messages: list[dict],
    config: AppConfig,
    stream: bool = True,
) -> Generator[str, None, None] | dict:
    """
    调用大模型 Chat Completion API（OpenAI 兼容格式）。

    Args:
        messages: [{"role": "user", "content": "..."}]
        config: 应用配置（含 provider、model、api_key）
        stream: 是否流式返回

    Yields/Returns:
        流式：逐个 token 字符串
        非流式：完整响应 dict
    """
    base_url = config.get_base_url()
    api_key = config.get_api_key()

    if not api_key:
        raise ValueError(f"未配置 {config.provider} 的 API Key，请在设置中填写")

    url = f"{base_url}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": config.model,
        "messages": messages,
        "temperature": config.temperature,
        "max_tokens": config.max_tokens,
        "top_p": config.top_p,
        "frequency_penalty": config.frequency_penalty,
        "presence_penalty": config.presence_penalty,
        "stream": stream,
    }

    if stream:
        return _stream_request(url, headers, payload)
    else:
        return _sync_request(url, headers, payload)


def _stream_request(url: str, headers: dict, payload: dict) -> Generator[str, None, None]:
    """流式请求"""
    with httpx.Client(timeout=120.0) as client:
        with client.stream("POST", url, headers=headers, json=payload) as resp:
            resp.raise_for_status()
            for line in resp.iter_lines():
                if not line or not line.startswith("data: "):
                    continue
                data_str = line[6:]
                if data_str.strip() == "[DONE]":
                    break
                try:
                    data = json.loads(data_str)
                    delta = data["choices"][0].get("delta", {})
                    content = delta.get("content", "")
                    if content:
                        yield content
                except (json.JSONDecodeError, KeyError, IndexError):
                    continue


def _sync_request(url: str, headers: dict, payload: dict) -> dict:
    """同步请求"""
    with httpx.Client(timeout=120.0) as client:
        resp = client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return {
            "content": data["choices"][0]["message"]["content"],
            "usage": data.get("usage", {}),
            "model": data.get("model", ""),
        }
