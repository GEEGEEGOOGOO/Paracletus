@echo off
echo ========================================
echo RESTARTING ADILECTUS (SILENT MODE)
echo ========================================
echo.
echo Step 1: Killing processes...
taskkill /F /IM electron.exe 2>nul
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Starting Backend (Background)...
cd /d "D:\PROJECT_101"
set NODE_OPTIONS=--dns-result-order=ipv4first --no-warnings

:: Start Backend Hidden
powershell -Command "Start-Process node -ArgumentList 'server/start.js' -WorkingDirectory 'D:\PROJECT_101' -WindowStyle Hidden"

echo Waiting for server...
timeout /t 5 /nobreak >nul

echo Step 3: Starting App (Background Console)...
:: Start Frontend Hidden (npm.cmd for Windows)
powershell -Command "Start-Process npm.cmd -ArgumentList 'start' -WorkingDirectory 'D:\PROJECT_101' -WindowStyle Hidden"

echo.
echo ========================================
echo App launched! 
echo Console windows are now hidden from taskbar.
echo ========================================
pause
