@echo off
echo ==========================================
echo   Adilectus - Initial Setup Script
echo ==========================================
echo.

echo 1. Installing Root Dependencies (Electron)...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies.
    pause
    exit /b %errorlevel%
)
echo ✅ Root dependencies installed.
echo.

echo 2. Installing Server Dependencies (Backend)...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install server dependencies.
    cd ..
    pause
    exit /b %errorlevel%
)
cd ..
echo ✅ Server dependencies installed.
echo.

echo ==========================================
echo   🎉 Setup Complete!
echo   You can now run 'start_all.bat' to launch the app.
echo ==========================================
pause
