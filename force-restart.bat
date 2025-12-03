@echo off
echo ===================================================
echo   FORCE RESTARTING ADILECTUS
echo ===================================================
echo.
echo 1. Killing stale processes...
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM electron.exe /T 2>nul

echo.
echo 2. Clearing cache...
del /f /q "%APPDATA%\Adilectus\Cache\*.*" 2>nul

echo.
echo 3. Starting application...
echo.
npm start
