@echo off
echo ========================================
echo   EduSkillKit - 教育 AI 技能工作台
echo ========================================
echo.

echo [1/2] 启动后端 API (FastAPI)...
start /b cmd /c "cd /d %~dp0 && python -m uvicorn api.main:app --host 0.0.0.0 --port 8000"
timeout /t 2 /nobreak >nul

echo [2/2] 启动前端 (Vite)...
cd /d %~dp0frontend
start /b cmd /c "npx vite --host 0.0.0.0 --port 5173"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   启动完成！
echo   前端: http://localhost:5173
echo   后端: http://localhost:8000
echo ========================================
echo.
echo 按任意键关闭此窗口（服务将继续运行）
pause >nul
