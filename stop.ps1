# 项目风险全链路管控系统停止脚本
# 适用于 Windows PowerShell 环境

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  停止项目风险全链路管控系统" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 项目目录
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPidFile = Join-Path $scriptDir "backend.pid"
$frontendPidFile = Join-Path $scriptDir "frontend.pid"

# 停止后端服务
Write-Host "🛑 停止后端服务..." -ForegroundColor Yellow
$backendStopped = $false

if (Test-Path $backendPidFile) {
    try {
        $backendPid = Get-Content $backendPidFile
        $process = Get-Process -Id $backendPid -ErrorAction SilentlyContinue
        if ($process) {
            Stop-Process -Id $backendPid -Force
            Write-Host "✅ 后端服务已停止 (PID: $backendPid)" -ForegroundColor Green
            $backendStopped = $true
        } else {
            Write-Host "⚠️  后端服务已经停止" -ForegroundColor Yellow
        }
        Remove-Item $backendPidFile -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Host "⚠️  停止后端服务时出错: $_" -ForegroundColor Yellow
    }
}

if (-not $backendStopped) {
    # 尝试通过端口查找进程
    $backendProcesses = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
                        Select-Object -ExpandProperty OwningProcess -Unique
    
    foreach ($pid in $backendProcesses) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "✅ 后端服务已停止 (PID: $pid)" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  无法停止进程 (PID: $pid): $_" -ForegroundColor Yellow
        }
    }
}

# 停止前端服务
Write-Host "🛑 停止前端服务..." -ForegroundColor Yellow
$frontendStopped = $false

if (Test-Path $frontendPidFile) {
    try {
        $frontendPid = Get-Content $frontendPidFile
        $process = Get-Process -Id $frontendPid -ErrorAction SilentlyContinue
        if ($process) {
            Stop-Process -Id $frontendPid -Force
            Write-Host "✅ 前端服务已停止 (PID: $frontendPid)" -ForegroundColor Green
            $frontendStopped = $true
        } else {
            Write-Host "⚠️  前端服务已经停止" -ForegroundColor Yellow
        }
        Remove-Item $frontendPidFile -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Host "⚠️  停止前端服务时出错: $_" -ForegroundColor Yellow
    }
}

if (-not $frontendStopped) {
    # 尝试通过端口查找进程
    $frontendProcesses = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | 
                         Select-Object -ExpandProperty OwningProcess -Unique
    
    foreach ($pid in $frontendProcesses) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "✅ 前端服务已停止 (PID: $pid)" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  无法停止进程 (PID: $pid): $_" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  系统已停止" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
