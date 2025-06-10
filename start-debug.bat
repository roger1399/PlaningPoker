@echo off
echo Starting Next.js and Socket.IO servers...

:: Start Next.js in one window
start "Next.js Server" cmd /k "npm run dev"

:: Start Socket.IO server in another window
start "Socket.IO Server" cmd /k "npx tsx src/server.ts"

echo Servers started in separate windows. Close the windows to stop the servers.
