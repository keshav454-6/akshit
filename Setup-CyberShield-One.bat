@echo off
title CyberShield One - Windows App Installer
color 0a

echo ======================================================================
echo           CYBERSHIELD ONE - WINDOWS APP INSTALLER
echo       "One Platform. Multiple Threats. One Smarter Defence."
echo ======================================================================
echo.
echo [*] Installing CyberShield One to your Windows system...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$installDir = '$env:LOCALAPPDATA\Programs\CyberShield-One';" ^
    "if (-not (Test-Path $installDir)) { New-Item -ItemType Directory -Path $installDir -Force | Out-Null };" ^
    "Copy-Item 'cybershield.ico' '$installDir\cybershield.ico' -Force -ErrorAction SilentlyContinue;" ^
    "Copy-Item -Path 'dist' -Destination '$installDir\dist' -Recurse -Force -ErrorAction SilentlyContinue;" ^
    "Copy-Item -Path 'backend' -Destination '$installDir\backend' -Recurse -Force -ErrorAction SilentlyContinue;" ^
    "$wsh = New-Object -ComObject WScript.Shell;" ^
    "$startShortcut = $wsh.CreateShortcut('$env:APPDATA\Microsoft\Windows\Start Menu\Programs\CyberShield One.lnk');" ^
    "$startShortcut.TargetPath = '$installDir\Launch-CyberShield.cmd';" ^
    "$startShortcut.WorkingDirectory = $installDir;" ^
    "$startShortcut.IconLocation = '$installDir\cybershield.ico,0';" ^
    "$startShortcut.Description = 'CyberShield One - All-in-One Cybersecurity Defense Platform';" ^
    "$startShortcut.Save();" ^
    "$deskShortcut = $wsh.CreateShortcut('$env:USERPROFILE\Desktop\CyberShield One.lnk');" ^
    "$deskShortcut.TargetPath = '$installDir\Launch-CyberShield.cmd';" ^
    "$deskShortcut.WorkingDirectory = $installDir;" ^
    "$deskShortcut.IconLocation = '$installDir\cybershield.ico,0';" ^
    "$deskShortcut.Save();" ^
    "Write-Host '[+] Successfully Installed!' -ForegroundColor Green;"

echo.
echo ======================================================================
echo  [+] CyberShield One has been INSTALLED on your Windows System!
echo  [+] Start Menu: Type 'CyberShield One' in Windows Search
echo  [+] Desktop:    Double-click the 'CyberShield One' icon on your screen
echo ======================================================================
echo.
pause
