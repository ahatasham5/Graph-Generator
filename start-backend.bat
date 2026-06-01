@echo off
title GraphForge — Backend
echo.
echo  ========================================
echo   GraphForge Backend (FastAPI)
echo  ========================================
echo.

cd /d "%~dp0backend"

:: Check if venv exists
if not exist "venv\Scripts\activate.bat" (
    echo [*] Creating virtual environment...
    python -m venv venv
    echo [OK] Virtual environment created.
)

:: Activate venv
call venv\Scripts\activate.bat

:: Install dependencies
echo [*] Installing dependencies...
pip install -r requirements.txt --quiet

echo.
echo [OK] Starting FastAPI server on http://localhost:8000
echo [OK] API docs at   http://localhost:8000/docs
echo.

python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
