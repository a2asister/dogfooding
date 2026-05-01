@echo off
chcp 65001 >nul
echo ============================================
echo   多端统一消息聚合中台 - 一键启动脚本
echo ============================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js (https://nodejs.org)
    pause
    exit /b 1
)

echo [1/4] 检查 Node.js 版本...
node --version
echo.

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo [2/4] 安装根目录依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 根目录依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo [2/4] 根目录依赖已存在，跳过安装
)

if not exist "server\node_modules" (
    echo [3/4] 安装后端服务依赖...
    cd server
    call npm install
    cd ..
    if %errorlevel% neq 0 (
        echo [错误] 后端依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo [3/4] 后端依赖已存在，跳过安装
)

if not exist "client\node_modules" (
    echo [4/4] 安装前端应用依赖...
    cd client
    call npm install
    cd ..
    if %errorlevel% neq 0 (
        echo [错误] 前端依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo [4/4] 前端依赖已存在，跳过安装
)

echo.
echo ============================================
echo   启动服务中...
echo ============================================
echo.
echo [信息] 后端服务将运行在: http://localhost:3002
echo [信息] 前端应用将运行在: http://localhost:3000
echo.
echo [提示] 按 Ctrl+C 可停止服务
echo.

call npm run dev

pause
