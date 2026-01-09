@echo off
echo ========================================
echo Starting AEGIS uiG Frontend
echo ========================================

cd /d "C:\AEGIS\uiG"

echo Current directory:
cd

if not exist package.json (
    echo ERROR: package.json not found
    pause
    exit /b 1
)

echo Installing dependencies...
call npm install

echo ----------------------------------------
echo Launching Vite dev server...
echo ----------------------------------------
call npm run dev

echo If you see this, Vite failed to start.
pause
