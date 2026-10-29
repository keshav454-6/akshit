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

:: Check for Node.js
set "NPM_EXEC="
where npm >nul 2>&1
if !errorlevel! equ 0 (
    set "NPM_EXEC=npm"
) else (
    if exist "%LOCALAPPDATA%\Programs\node\npm.cmd" (
        set "NPM_EXEC=%LOCALAPPDATA%\Programs\node\npm.cmd"
    ) else (
        for /d %%P in ("%LOCALAPPDATA%\Microsoft\WinGet\Packages\*Node*") do (
            for /d %%V in ("%%P\node*") do (
                if exist "%%V\npm.cmd" set "NPM_EXEC=%%V\npm.cmd"
            )
        )
    )
)

echo [*] Starting CyberShield Flask Security Backend on port 5000...
if exist "backend\app.py" (
    start "CyberShield Backend Engine" /min cmd /c "cd /d "%SCRIPT_DIR%backend" && %PY_EXEC% app.py"
) else if exist "api\app.py" (
    start "CyberShield Backend Engine" /min cmd /c "cd /d "%SCRIPT_DIR%api" && %PY_EXEC% app.py"
)

timeout /t 2 /nobreak >nul

if exist "frontend" (
    echo [*] Starting CyberShield React Frontend UI...
    if defined NPM_EXEC (
        start "CyberShield Frontend" /min cmd /c "cd /d "%SCRIPT_DIR%frontend" && %NPM_EXEC% run dev"
    ) else (
        echo [!] Node.js not detected; opening cloud dashboard fallback...
        start https://akshits-git-main-healix6.vercel.app
        goto done
    )
) else if exist "dist" (
    echo [*] Serving pre-built application from dist...
    start "" "%PY_EXEC%" -m http.server 5173 --directory dist
)

timeout /t 3 /nobreak >nul

echo [*] Launching CyberShield One in your browser...
start http://localhost:5173

:done
echo.
echo ======================================================================
echo  [+] CyberShield One System Engine is ACTIVE!
echo  [+] Web Dashboard: http://localhost:5173
echo  [+] Backend API:   http://127.0.0.1:5000/api/health
echo ======================================================================
echo.
pause
