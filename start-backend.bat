@echo off
setlocal
title GraphForge Backend

set "ROOT=%~dp0"
set "VENV_PY=%ROOT%backend\.venv\Scripts\python.exe"

echo.
echo  ========================================
echo   GraphForge Backend (FastAPI)
echo  ========================================
echo.

if not exist "%VENV_PY%" (
    echo [ERROR] Local Python environment not found.
    echo Please run install-graphforge.bat first.
    echo.
    pause
    exit /b 1
)

cd /d "%ROOT%backend"

echo.
echo [OK] Starting FastAPI server on http://127.0.0.1:8000
echo [OK] API docs at   http://127.0.0.1:8000/docs
echo.

"%VENV_PY%" -m uvicorn main:app --host 127.0.0.1 --port 8000
pause
