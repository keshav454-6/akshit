@echo off
setlocal enabledelayedexpansion
title CyberShield One - All-in-One Defense Platform
color 0b

echo ======================================================================
echo           CYBERSHIELD ONE - ALL-IN-ONE DEFENSE PLATFORM
echo       "One Platform. Multiple Threats. One Smarter Defence."
echo ======================================================================
echo.

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

:: Check for Python
set "PY_EXEC="
where python >nul 2>&1
if !errorlevel! equ 0 (
    set "PY_EXEC=python"
) else (
    where py >nul 2>&1
    if !errorlevel! equ 0 (
        set "PY_EXEC=py"
    ) else (
        if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
            set "PY_EXEC=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
        ) else if exist "C:\Python311\python.exe" (
            set "PY_EXEC=C:\Python311\python.exe"
        )
    )
)

if not defined PY_EXEC (
    echo [!] Warning: Python was not found in PATH.
    echo [*] Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

echo [+] Using Python: %PY_EXEC%
echo [*] Starting CyberShield Unified Platform (Backend Engine + Web UI)...

if exist "backend\app.py" (
    start "CyberShield Platform" /min cmd /c "cd /d "%SCRIPT_DIR%backend" && %PY_EXEC% app.py"
) else if exist "api\app.py" (
    start "CyberShield Platform" /min cmd /c "cd /d "%SCRIPT_DIR%api" && %PY_EXEC% app.py"
) else (
    echo [!] Backend directory not found.
)

:: Also start frontend dev server if available
where npm >nul 2>&1
if !errorlevel! equ 0 (
    if exist "frontend\package.json" (
        echo [*] Starting Vite Frontend service...
        start "CyberShield Vite" /min cmd /c "cd /d "%SCRIPT_DIR%frontend" && npm run dev"
    )
)

timeout /t 2 /nobreak >nul

echo [*] Opening CyberShield One in your default browser...
start http://localhost:5000

echo.
echo ======================================================================
echo  [+] CyberShield One System Engine is ACTIVE!
echo  [+] Local Dashboard: http://localhost:5000
echo  [+] Alternate Port:  http://localhost:5173
echo  [+] Backend API:     http://127.0.0.1:5000/api/health
echo ======================================================================
echo.
echo You can keep this window open or close it when done.
pause
