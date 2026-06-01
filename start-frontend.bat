@echo off
title GraphForge — Frontend
echo.
echo  ========================================
echo   GraphForge Frontend
echo  ========================================
echo.

cd /d "%~dp0frontend"

echo [*] Starting local HTTP server on http://localhost:3001
echo [OK] Open http://localhost:3001 in your browser
echo.
echo  Make sure the backend is also running (start-backend.bat)
echo.

python -m http.server 3001
pause
