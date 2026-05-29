"""EduSkillKit — FastAPI 后端 + 前端静态文件服务"""

from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from eduskilk.config import ensure_dirs, PROJECT_ROOT
from eduskilk.db import init_db
from api.routes import skills, chat, conversations, settings, upload

app = FastAPI(title="EduSkillKit", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(skills.router, prefix="/api/skills", tags=["skills"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(conversations.router, prefix="/api/conversations", tags=["conversations"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])


@app.on_event("startup")
def startup():
    ensure_dirs()
    init_db()


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "0.2.0"}


# ── 前端静态文件服务（生产模式） ──
FRONTEND_DIST = PROJECT_ROOT / "frontend" / "dist"

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="static-assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """SPA fallback — 所有非 /api 路径返回 index.html"""
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(FRONTEND_DIST / "index.html"))
