# 合同全生命周期管理系统 - 一键暂停脚本
# Windows PowerShell 脚本

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  合同全生命周期管理系统 - 暂停脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$BACKEND_PORT = 38440
$FRONTEND_PORT = 38441

function Stop-ProcessByPort {
    param([int]$Port)
    
    Write-Host "  检查端口 $Port 上的进程..." -ForegroundColor White
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connections) {
            $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
            foreach ($pid in $pids) {
                try {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "  发现进程: $($process.ProcessName) (PID: $pid)" -ForegroundColor Yellow
                        $process | Stop-Process -Force
                        Write-Host "  进程已终止" -ForegroundColor Green
                    }
                } catch {
                    Write-Host "  无法终止进程 PID: $pid" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "  端口 $Port 上没有运行的进程" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  检查端口 $Port 时出错" -ForegroundColor Red
    }
}

function Stop-NodeProcesses {
    Write-Host ""
    Write-Host "[2/2] 检查并停止相关 Node.js 进程..." -ForegroundColor Yellow
    
    $nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
    $stoppedCount = 0
    
    foreach ($proc in $nodeProcesses) {
        try {
            $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine
            if ($cmdLine -like "*contract*" -or 
                $cmdLine -like "*server*" -or 
                $cmdLine -like "*client*" -or
                $cmdLine -like "*vite*" -or
                $cmdLine -like "*koa*" -or
                $cmdLine -like "*ts-node*") {
                Write-Host "  发现相关进程: PID $($proc.Id)" -ForegroundColor Yellow
                $proc | Stop-Process -Force
                $stoppedCount++
                Write-Host "  进程已终止" -ForegroundColor Green
            }
        } catch {
            Write-Host "  处理进程 PID $($proc.Id) 时出错" -ForegroundColor Red
        }
    }
    
    if ($stoppedCount -eq 0) {
        Write-Host "  未发现相关 Node.js 进程" -ForegroundColor Gray
    } else {
        Write-Host "  共终止 $stoppedCount 个相关进程" -ForegroundColor Green
    }
}

# 主程序
Write-Host "[1/2] 按端口停止服务..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  停止后端服务 (端口 $BACKEND_PORT)..." -ForegroundColor Yellow
Stop-ProcessByPort $BACKEND_PORT
Write-Host ""

Write-Host "  停止前端服务 (端口 $FRONTEND_PORT)..." -ForegroundColor Yellow
Stop-ProcessByPort $FRONTEND_PORT
Write-Host ""

# 额外停止相关 Node 进程
Stop-NodeProcesses
Write-Host ""

# 显示完成信息
Write-Host "========================================" -ForegroundColor Green
Write-Host "  服务已暂停！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  已停止的端口:" -ForegroundColor Cyan
Write-Host "    - 后端: $BACKEND_PORT" -ForegroundColor Cyan
Write-Host "    - 前端: $FRONTEND_PORT" -ForegroundColor Cyan
Write-Host ""
Write-Host "  如需重新启动服务，请运行 start.ps1 脚本" -ForegroundColor Yellow
Write-Host ""
