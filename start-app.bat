@echo off
setlocal
title GraphForge Launcher

set "ROOT=%~dp0"
set "VENV_PY=%ROOT%backend\.venv\Scripts\python.exe"

echo ========================================
echo   Starting GraphForge
echo ========================================
echo.

if not exist "%VENV_PY%" (
    echo [ERROR] GraphForge is not installed on this computer yet.
    echo.
    echo Please run install-graphforge.bat first. It will create the local
    echo Python environment, install dependencies, and add the desktop shortcut.
    echo.
    pause
    exit /b 1
)

echo [1/3] Starting Backend Server...
start "GraphForge Backend" cmd /k ""%ROOT%start-backend.bat""

echo [2/3] Starting Frontend Server...
start "GraphForge Frontend" cmd /k ""%ROOT%start-frontend.bat""

echo [3/3] Launching Browser...
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:3001"

echo.
echo GraphForge is now running! Both backend and frontend servers are open in new windows.
echo Leave those two windows open while using the app.
echo.
pause
