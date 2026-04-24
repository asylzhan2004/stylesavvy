@echo off
echo ==========================================
echo    STARTING GRAVITY VIRTUAL TRY-ON
echo ==========================================

echo Starting Backend (Prisma + PostgreSQL, Port 5000)...
start cmd /k "cd backend && npm run dev"

echo Starting Frontend React App (Port 5173)...
start cmd /k "cd virtual-try-on && npm run dev"

echo Done! Two terminal windows opened.
echo You can safely close this main window.
pause
