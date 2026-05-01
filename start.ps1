# 合同全生命周期管理系统 - 一键启动脚本
# Windows PowerShell 脚本

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  合同全生命周期管理系统 - 启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$SERVER_DIR = Join-Path $PROJECT_ROOT "server"
$CLIENT_DIR = Join-Path $PROJECT_ROOT "client"

$BACKEND_PORT = 38440
$FRONTEND_PORT = 38441

# 检查 Node.js 是否安装
Write-Host "[1/5] 检查 Node.js 环境..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  错误: 未检测到 Node.js，请先安装 Node.js (https://nodejs.org)" -ForegroundColor Red
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Host "  npm 版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  错误: 未检测到 npm" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 安装后端依赖
Write-Host "[2/5] 检查并安装后端依赖..." -ForegroundColor Yellow
Set-Location $SERVER_DIR

if (Test-Path "node_modules") {
    Write-Host "  node_modules 已存在，跳过安装" -ForegroundColor Green
} else {
    Write-Host "  正在安装后端依赖..." -ForegroundColor White
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  错误: 后端依赖安装失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "  后端依赖安装成功" -ForegroundColor Green
}
Write-Host ""

# 安装前端依赖
Write-Host "[3/5] 检查并安装前端依赖..." -ForegroundColor Yellow
Set-Location $CLIENT_DIR

if (Test-Path "node_modules") {
    Write-Host "  node_modules 已存在，跳过安装" -ForegroundColor Green
} else {
    Write-Host "  正在安装前端依赖..." -ForegroundColor White
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  错误: 前端依赖安装失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "  前端依赖安装成功" -ForegroundColor Green
}
Write-Host ""

# 启动后端服务
Write-Host "[4/5] 启动后端服务..." -ForegroundColor Yellow
Set-Location $SERVER_DIR

$processes = Get-Process -Name node -ErrorAction SilentlyContinue
$backendRunning = $false
foreach ($proc in $processes) {
    $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine
    if ($cmdLine -like "*ts-node*" -or $cmdLine -like "*npm run dev*" -or $cmdLine -like "*server*index*") {
        $backendRunning = $true
        break
    }
}

if ($backendRunning) {
    Write-Host "  后端服务可能已在运行，尝试启动新实例..." -ForegroundColor Yellow
}

Write-Host "  后端服务将在端口 $BACKEND_PORT 运行" -ForegroundColor White

# 使用 Start-Process 在新窗口启动后端
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$SERVER_DIR'; npm run dev; pause" -WindowStyle Normal

Write-Host "  后端服务正在启动..." -ForegroundColor Green
Write-Host ""

# 等待后端启动
Write-Host "  等待后端服务启动 (5秒)..." -ForegroundColor White
Start-Sleep -Seconds 5
Write-Host ""

# 启动前端服务
Write-Host "[5/5] 启动前端服务..." -ForegroundColor Yellow
Set-Location $CLIENT_DIR

Write-Host "  前端服务将在端口 $FRONTEND_PORT 运行" -ForegroundColor White

# 使用 Start-Process 在新窗口启动前端
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$CLIENT_DIR'; npm run dev; pause" -WindowStyle Normal

Write-Host "  前端服务正在启动..." -ForegroundColor Green
Write-Host ""

# 等待前端启动
Write-Host "  等待前端服务启动 (5秒)..." -ForegroundColor White
Start-Sleep -Seconds 5
Write-Host ""

# 显示启动完成信息
Write-Host "========================================" -ForegroundColor Green
Write-Host "  系统启动完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  后端服务地址: http://localhost:$BACKEND_PORT" -ForegroundColor Cyan
Write-Host "  前端服务地址: http://localhost:$FRONTEND_PORT" -ForegroundColor Cyan
Write-Host ""
Write-Host "  请在浏览器中访问前端地址使用系统" -ForegroundColor Yellow
Write-Host "  如需停止服务，请运行 stop.ps1 脚本" -ForegroundColor Yellow
Write-Host ""

# 尝试打开浏览器
Write-Host "  正在尝试打开浏览器访问前端页面..." -ForegroundColor White
try {
    Start-Process "http://localhost:$FRONTEND_PORT"
    Write-Host "  浏览器已打开" -ForegroundColor Green
} catch {
    Write-Host "  请手动打开浏览器访问 http://localhost:$FRONTEND_PORT" -ForegroundColor Yellow
}

Write-Host ""
