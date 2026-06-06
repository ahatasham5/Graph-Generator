@echo off
setlocal EnableExtensions
title GraphForge Installer

set "ROOT=%~dp0"
set "BACKEND_DIR=%ROOT%backend"
set "VENV_DIR=%BACKEND_DIR%\.venv"
set "VENV_PY=%VENV_DIR%\Scripts\python.exe"
set "REQUIREMENTS=%BACKEND_DIR%\requirements.txt"
set "PYTHON_CMD="

echo ========================================
echo   GraphForge Installer
echo ========================================
echo.

echo [1/4] Checking Python...
call :find_python
if not defined PYTHON_CMD (
    call :try_install_python
    call :find_python
)

if not defined PYTHON_CMD (
    echo.
    echo [ERROR] Python 3.8 or newer was not found.
    echo Install Python from https://www.python.org/downloads/windows/
    echo During install, tick "Add python.exe to PATH", then run this installer again.
    echo.
    pause
    exit /b 1
)

echo [OK] Python found: %PYTHON_CMD%

echo.
echo [2/4] Creating local virtual environment...
if exist "%VENV_PY%" (
    "%VENV_PY%" -c "import sys" >nul 2>nul
    if errorlevel 1 (
        echo [WARN] Existing local environment is broken. Rebuilding it...
        rmdir /s /q "%VENV_DIR%"
    )
)

if not exist "%VENV_PY%" (
    %PYTHON_CMD% -m venv "%VENV_DIR%"
    if errorlevel 1 (
        echo [ERROR] Could not create the virtual environment.
        pause
        exit /b 1
    )
) else (
    echo [OK] Existing local environment found.
)

echo.
echo [3/4] Installing backend dependencies...
"%VENV_PY%" -m pip install --upgrade pip
if errorlevel 1 (
    echo [ERROR] Could not upgrade pip.
    pause
    exit /b 1
)

if exist "%ROOT%wheels\*.whl" (
    "%VENV_PY%" -m pip install --no-index --find-links "%ROOT%wheels" -r "%REQUIREMENTS%"
) else (
    "%VENV_PY%" -m pip install -r "%REQUIREMENTS%"
)

if errorlevel 1 (
    echo.
    echo [ERROR] Dependency installation failed.
    echo Check the internet connection, then run this installer again.
    echo.
    pause
    exit /b 1
)

echo.
echo [4/4] Creating desktop shortcut...
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%create-desktop-shortcut.ps1" -Target "%ROOT%start-app.bat" -Name "GraphForge"
if errorlevel 1 (
    echo [WARN] App installed, but the desktop shortcut could not be created.
    echo You can still run start-app.bat directly.
) else (
    echo [OK] Desktop shortcut created.
)

echo.
echo GraphForge installation complete.
echo Use the GraphForge desktop shortcut to open the app.
echo.
pause
exit /b 0

:find_python
py -3 -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 8) else 1)" >nul 2>nul
if not errorlevel 1 (
    set "PYTHON_CMD=py -3"
    exit /b 0
)

python -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 8) else 1)" >nul 2>nul
if not errorlevel 1 (
    set "PYTHON_CMD=python"
    exit /b 0
)

python3 -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 8) else 1)" >nul 2>nul
if not errorlevel 1 (
    set "PYTHON_CMD=python3"
    exit /b 0
)

exit /b 0

:try_install_python
echo [WARN] Python was not found.
where winget >nul 2>nul
if errorlevel 1 (
    echo [WARN] winget is not available, so Python cannot be installed automatically.
    exit /b 0
)

echo [*] Trying to install Python 3.11 with winget...
winget install -e --id Python.Python.3.11 --accept-package-agreements --accept-source-agreements
if errorlevel 1 (
    echo [WARN] Automatic Python installation failed.
    exit /b 0
)

echo [OK] Python installer finished. Checking Python again...
exit /b 0
