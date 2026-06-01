@echo off
title GraphForge Launcher
echo ========================================
echo   Starting GraphForge (One-Click)
echo ========================================
echo.

echo [1/3] Starting Backend Server...
start "GraphForge - Backend" cmd /c "start-backend.bat"

echo [2/3] Starting Frontend Server...
start "GraphForge - Frontend" cmd /c "start-frontend.bat"

echo [3/3] Launching Browser...
:: Wait 2 seconds for servers to initialize
timeout /t 2 /nobreak >nul
start http://localhost:3001

echo.
echo GraphForge is now running! Both backend and frontend servers are open in new windows.
echo You can close this launcher window.
echo.
pause
