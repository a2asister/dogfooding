$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue

if (-not $nodeProcesses) {
    Write-Host "没有找到正在运行的 Node.js 进程" -ForegroundColor Green
    exit 0
}

$count = $nodeProcesses.Count
Write-Host "找到 $count 个正在运行的 Node.js 进程：" -ForegroundColor Yellow
$nodeProcesses | Format-Table Id, ProcessName, CPU, WorkingSet64, StartTime

$confirm = Read-Host "是否确认停止所有 Node.js 进程？(Y/N)"
if ($confirm -eq 'Y' -or $confirm -eq 'y') {
    $nodeProcesses | Stop-Process -Force
    Write-Host "已停止所有 Node.js 进程" -ForegroundColor Green
} else {
    Write-Host "已取消操作" -ForegroundColor Gray
}
