$ErrorActionPreference = "Stop"

# Check if Node.js dependencies are installed
if (-not (Test-Path node_modules)) {
    Write-Host "Installing dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies"
        exit 1
    }
}

Write-Host "Starting servers..."

# Start the Next.js development server
$nextServer = Start-Process -PassThru -NoNewWindow npm -ArgumentList "run", "dev"

# Start the Socket.IO server
$socketServer = Start-Process -PassThru -NoNewWindow npx -ArgumentList "tsx", "src/server.ts"

Write-Host "Both servers started. Press Enter to stop both servers..."

# Wait for user input
$null = Read-Host

# Stop both servers
if ($nextServer) { Stop-Process -Id $nextServer.Id -Force -ErrorAction SilentlyContinue }
if ($socketServer) { Stop-Process -Id $socketServer.Id -Force -ErrorAction SilentlyContinue }

Write-Host "Servers stopped."
