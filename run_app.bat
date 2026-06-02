@echo off
echo Starting Focus Shield MERN Application...
echo.
echo Launching Backend Server on http://localhost:5000...
start cmd /k "cd backend && npm run dev"
echo Launching Frontend Development Server on http://localhost:5173...
start cmd /k "cd frontend && npm run dev"
echo.
echo System initialized. Press any key to close this installer.
pause > nul
