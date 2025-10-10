# PowerShell script to start the backend server with environment variables
$env:CORS_ORIGIN = "http://localhost:3000"
$env:NODE_ENV = "development"
$env:JWT_SECRET = "your_super_secret_jwt_key_here"
$env:MONGODB_URI = "mongodb+srv://kollivarshith123:dFPcEAViEYAN8OdI@cluster0.zzcuve5.mongodb.net/emergency_services"
$env:RATE_LIMIT_WINDOW_MS = "900000"
$env:RATE_LIMIT_MAX_REQUESTS = "100"

Write-Host "Starting Emergency Services Backend Server..."
Write-Host "CORS_ORIGIN: $env:CORS_ORIGIN"
Write-Host "NODE_ENV: $env:NODE_ENV"

node server.js
