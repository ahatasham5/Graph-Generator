@echo off
setlocal
title GraphForge Frontend

set "ROOT=%~dp0"
set "VENV_PY=%ROOT%backend\.venv\Scripts\python.exe"

echo.
echo  ========================================
echo   GraphForge Frontend
echo  ========================================
echo.

if not exist "%VENV_PY%" (
    echo [ERROR] Local Python environment not found.
    echo Please run install-graphforge.bat first.
    echo.
    pause
    exit /b 1
)

echo [*] Starting local HTTP server on http://127.0.0.1:3001
echo [OK] Open http://127.0.0.1:3001 in your browser
echo.
echo  Make sure the backend is also running (start-backend.bat)
echo.

"%VENV_PY%" -m http.server 3001 --bind 127.0.0.1 --directory "%ROOT%frontend"
pause
