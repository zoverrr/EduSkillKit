"""python -m eduskilk 启动入口"""

import sys
import webbrowser
import threading
from pathlib import Path


def main():
    """启动 EduSkillKit 服务并打开浏览器"""
    try:
        import uvicorn
    except ImportError:
        print("缺少 uvicorn，请运行: pip install uvicorn")
        sys.exit(1)

    # 检查前端是否已构建
    from eduskilk.config import PROJECT_ROOT
    frontend_dist = PROJECT_ROOT / "frontend" / "dist"
    if not frontend_dist.exists():
        print("提示：前端未构建，API 模式启动")
        print(f"如需完整界面，请先构建前端：cd {PROJECT_ROOT / 'frontend'} && npm install && npm run build")
        print()

    port = 8000
    host = "127.0.0.1"

    # 延迟打开浏览器
    def open_browser():
        import time
        time.sleep(1.5)
        webbrowser.open(f"http://{host}:{port}")

    threading.Thread(target=open_browser, daemon=True).start()

    print("=" * 48)
    print("  EduSkillKit — 教育 AI 技能工作台")
    print("=" * 48)
    print(f"  地址: http://{host}:{port}")
    print(f"  API:  http://{host}:{port}/api/health")
    print("=" * 48)
    print("  按 Ctrl+C 停止服务")
    print()

    uvicorn.run(
        "api.main:app",
        host=host,
        port=port,
        log_level="info",
    )


if __name__ == "__main__":
    main()
