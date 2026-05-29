"""设置 API"""

import os
from fastapi import APIRouter
from eduskilk.config import AppConfig, BUILTIN_PROVIDERS, ENV_KEY_MAP

router = APIRouter()


@router.get("")
def get_settings():
    config = AppConfig.load()
    providers = {}
    for key, prov in BUILTIN_PROVIDERS.items():
        env_var = ENV_KEY_MAP.get(key, "")
        env_val = os.environ.get(env_var, "")
        cfg_val = config.api_keys.get(key, "")
        current = env_val or cfg_val
        providers[key] = {
            "name": prov["name"],
            "models": prov["models"],
            "configured": bool(current),
            "source": "env" if env_val else ("manual" if cfg_val else "none"),
        }
    return {
        "provider": config.provider,
        "model": config.model,
        "temperature": config.temperature,
        "max_tokens": config.max_tokens,
        "top_p": config.top_p,
        "frequency_penalty": config.frequency_penalty,
        "presence_penalty": config.presence_penalty,
        "providers": providers,
    }


@router.put("")
def save_settings(data: dict):
    config = AppConfig.load()
    if "provider" in data:
        config.provider = data["provider"]
    if "model" in data:
        config.model = data["model"]
    if "temperature" in data:
        config.temperature = float(data["temperature"])
    if "max_tokens" in data:
        config.max_tokens = int(data["max_tokens"])
    if "top_p" in data:
        config.top_p = float(data["top_p"])
    if "frequency_penalty" in data:
        config.frequency_penalty = float(data["frequency_penalty"])
    if "presence_penalty" in data:
        config.presence_penalty = float(data["presence_penalty"])
    config.save()
    return {"ok": True}


@router.put("/api-keys")
def save_api_keys(data: dict):
    config = AppConfig.load()
    for provider, key in data.items():
        if key:
            config.set_api_key(provider, key)
    config.save()
    return {"ok": True}
