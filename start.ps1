# 项目风险全链路管控系统一键启动脚本
# 适用于 Windows PowerShell 环境

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  项目风险全链路管控系统" -ForegroundColor Cyan
Write-Host "  Project Risk Management System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js 是否安装
Write-Host "🔍 检查 Node.js 环境..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未检测到 Node.js，请先安装 Node.js" -ForegroundColor Red
    Write-Host "   下载地址: https://nodejs.org/" -ForegroundColor Gray
    exit 1
}

try {
    $npmVersion = npm -v
    Write-Host "✅ npm 版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未检测到 npm" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 检测端口是否被占用的函数
function Test-PortInUse {
    param([int]$Port)
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connections -and $connections.Count -gt 0) {
            return $true
        }
        return $false
    } catch {
        return $false
    }
}

# 获取可用端口的函数
function Get-AvailablePort {
    param([int]$StartPort, [int]$MaxAttempts = 10)
    
    for ($i = 0; $i -lt $MaxAttempts; $i++) {
        $currentPort = $StartPort + $i
        if (-not (Test-PortInUse -Port $currentPort)) {
            return $currentPort
        }
        Write-Host "   端口 $currentPort 已被占用，尝试下一个..." -ForegroundColor Gray
    }
    Write-Host "❌ 错误: 无法找到可用端口 (尝试了 $MaxAttempts 个端口)" -ForegroundColor Red
    exit 1
}

# 项目目录
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $scriptDir "backend"
$frontendDir = Join-Path $scriptDir "frontend"
$logDir = Join-Path $scriptDir "logs"

# 创建日志目录
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

# 安装后端依赖
Write-Host "📦 安装后端依赖..." -ForegroundColor Yellow
$backendNodeModules = Join-Path $backendDir "node_modules"
if (-not (Test-Path $backendNodeModules)) {
    Write-Host "   正在安装依赖，请稍候..." -ForegroundColor Gray
    Set-Location $backendDir
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 后端依赖安装失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ 后端依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "✅ 后端依赖已存在，跳过安装" -ForegroundColor Green
}
Write-Host ""

# 安装前端依赖
Write-Host "📦 安装前端依赖..." -ForegroundColor Yellow
$frontendNodeModules = Join-Path $frontendDir "node_modules"
if (-not (Test-Path $frontendNodeModules)) {
    Write-Host "   正在安装依赖，请稍候..." -ForegroundColor Gray
    Set-Location $frontendDir
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 前端依赖安装失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ 前端依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "✅ 前端依赖已存在，跳过安装" -ForegroundColor Green
}
Write-Host ""

# 检测并选择后端端口
Write-Host "🔍 检测后端端口..." -ForegroundColor Yellow
$defaultBackendPort = 3000
$backendPort = Get-AvailablePort -StartPort $defaultBackendPort
if ($backendPort -eq $defaultBackendPort) {
    Write-Host "✅ 后端端口 $backendPort 可用" -ForegroundColor Green
} else {
    Write-Host "⚠️  默认端口 $defaultBackendPort 被占用，将使用端口 $backendPort" -ForegroundColor Yellow
}
Write-Host ""

# 检测并选择前端端口
Write-Host "🔍 检测前端端口..." -ForegroundColor Yellow
$defaultFrontendPort = 5173
$frontendPort = Get-AvailablePort -StartPort $defaultFrontendPort
if ($frontendPort -eq $defaultFrontendPort) {
    Write-Host "✅ 前端端口 $frontendPort 可用" -ForegroundColor Green
} else {
    Write-Host "⚠️  默认端口 $defaultFrontendPort 被占用，将使用端口 $frontendPort" -ForegroundColor Yellow
}
Write-Host ""

# 启动后端服务
Write-Host "🚀 启动后端服务 (端口: $backendPort)..." -ForegroundColor Yellow
$backendLog = Join-Path $logDir "backend.log"
$backendPidFile = Join-Path $scriptDir "backend.pid"

Set-Location $backendDir
$env:PORT = $backendPort
$backendProcess = Start-Process -FilePath "npm" -ArgumentList "start" -PassThru -WindowStyle Hidden -Environment @{
    "PORT" = $backendPort
}
$backendProcess.Id | Out-File -FilePath $backendPidFile -Encoding ascii

Write-Host "✅ 后端服务已启动，PID: $($backendProcess.Id)" -ForegroundColor Green
Write-Host "   日志文件: $backendLog" -ForegroundColor Gray

# 等待后端服务启动
Write-Host "   等待后端服务初始化..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# 启动前端服务
Write-Host "🚀 启动前端服务 (端口: $frontendPort)..." -ForegroundColor Yellow
$frontendLog = Join-Path $logDir "frontend.log"
$frontendPidFile = Join-Path $scriptDir "frontend.pid"

Set-Location $frontendDir
$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden -Environment @{
    "FRONTEND_PORT" = $frontendPort
    "BACKEND_PORT" = $backendPort
}
$frontendProcess.Id | Out-File -FilePath $frontendPidFile -Encoding ascii

Write-Host "✅ 前端服务已启动，PID: $($frontendProcess.Id)" -ForegroundColor Green
Write-Host "   日志文件: $frontendLog" -ForegroundColor Gray

# 等待服务启动
Write-Host "   等待服务完全启动..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  系统启动完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 访问地址:" -ForegroundColor Yellow
Write-Host "   前端应用: http://localhost:$frontendPort" -ForegroundColor White
Write-Host "   后端 API: http://localhost:$backendPort" -ForegroundColor White
Write-Host ""
Write-Host "📋 功能模块:" -ForegroundColor Yellow
Write-Host "   - 仪表盘: 项目风险概览" -ForegroundColor White
Write-Host "   - 项目管理: 管理项目信息" -ForegroundColor White
Write-Host "   - 风险预警: 多维度风险识别" -ForegroundColor White
Write-Host "   - 风险报告: 自动生成风险报告" -ForegroundColor White
Write-Host "   - 规则库: 自定义风险规则" -ForegroundColor White
Write-Host "   - 整改管理: 风险整改闭环" -ForegroundColor White
Write-Host ""
Write-Host "📁 日志目录: $logDir" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  停止服务命令:" -ForegroundColor Red
Write-Host "   运行 stop.ps1 脚本" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# 打开浏览器
$confirm = Read-Host "是否打开浏览器访问系统? (Y/N)"
if ($confirm -eq 'Y' -or $confirm -eq 'y') {
    Start-Process "http://localhost:$frontendPort"
}
