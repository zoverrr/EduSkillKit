#!/bin/bash
echo "========================================"
echo "  EduSkillKit - 教育 AI 技能工作台"
echo "========================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "[1/2] 启动后端 API (FastAPI)..."
cd "$SCRIPT_DIR"
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

sleep 2

echo "[2/2] 启动前端 (Vite)..."
cd "$SCRIPT_DIR/frontend"
npx vite --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "  启动完成！"
echo "  前端: http://localhost:5173"
echo "  后端: http://localhost:8000"
echo "========================================"
echo ""
echo "按 Ctrl+C 停止所有服务"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
