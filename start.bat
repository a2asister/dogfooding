@echo off
chcp 65001 >nul
title RMS 分布式研发资产管理系统

echo ========================================
echo    RMS 分布式研发资产管理系统
echo    Research Management System
echo ========================================
echo.

:: 检查 Node.js 是否安装
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js (https://nodejs.org/)
    pause
    exit /b 1
)

echo [信息] Node.js 已安装
for /f "tokens=*" %%i in ('node --version') do echo [信息] Node 版本: %%i

echo.
echo ========================================
echo    步骤 1: 安装后端依赖
echo ========================================
echo.

cd backend
if not exist "node_modules" (
    echo [信息] 正在安装后端依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 后端依赖安装失败
        cd ..
        pause
        exit /b 1
    )
    echo [信息] 后端依赖安装完成
) else (
    echo [信息] 后端依赖已存在，跳过安装
)

cd ..

echo.
echo ========================================
echo    步骤 2: 安装前端依赖
echo ========================================
echo.

cd frontend
if not exist "node_modules" (
    echo [信息] 正在安装前端依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 前端依赖安装失败
        cd ..
        pause
        exit /b 1
    )
    echo [信息] 前端依赖安装完成
) else (
    echo [信息] 前端依赖已存在，跳过安装
)

cd ..

echo.
echo ========================================
echo    步骤 3: 启动服务
echo ========================================
echo.

echo [信息] 正在启动后端服务 (端口 3000)...
start "RMS Backend" cmd /k "cd /d %~dp0backend && node server.js"

echo [信息] 正在启动前端服务 (端口 5173)...
start "RMS Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo    启动完成！
echo ========================================
echo.
echo [信息] 后端服务地址: http://localhost:3000
echo [信息] 前端服务地址: http://localhost:5173
echo.
echo [提示] 浏览器将自动打开前端页面...
echo.

:: 等待几秒让服务启动
timeout /t 3 /nobreak >nul

:: 打开浏览器
start http://localhost:5173

echo [信息] 测试账号:
echo        管理员: admin / admin123
echo        开发人员: dev / dev123
echo        测试人员: tester / tester123
echo        项目经理: manager / manager123
echo.
echo [提示] 按 Ctrl+C 可以停止服务
echo.

pause
