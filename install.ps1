# 安装脚本 - Windows PowerShell
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  动态渐变融色艺术创作工具 - 安装" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] 安装根目录依赖..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "根目录依赖安装失败" -ForegroundColor Red
    exit 1
}
Write-Host "根目录依赖安装完成" -ForegroundColor Green
Write-Host ""

Write-Host "[2/4] 安装前端依赖..." -ForegroundColor Yellow
cd frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "前端依赖安装失败" -ForegroundColor Red
    exit 1
}
cd ..
Write-Host "前端依赖安装完成" -ForegroundColor Green
Write-Host ""

Write-Host "[3/4] 安装后端依赖..." -ForegroundColor Yellow
cd backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "后端依赖安装失败" -ForegroundColor Red
    exit 1
}
cd ..
Write-Host "后端依赖安装完成" -ForegroundColor Green
Write-Host ""

Write-Host "[4/4] 构建后端..." -ForegroundColor Yellow
cd backend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "后端构建失败" -ForegroundColor Red
    exit 1
}
cd ..
Write-Host "后端构建完成" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  安装完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "运行项目：" -ForegroundColor Yellow
Write-Host "  npm run dev   - 同时启动前后端"
Write-Host ""
Write-Host "前端地址: http://localhost:3456" -ForegroundColor Cyan
Write-Host "后端地址: http://localhost:7890" -ForegroundColor Cyan
Write-Host ""
