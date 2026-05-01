@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ==========================================
echo   线下门店数字化运营中台 - 一键启动脚本
echo ==========================================
echo.

:: 设置端口号
set SERVER_PORT=35678
set CLIENT_PORT=35679

:: 检查 Node.js 是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [信息] 检测到 Node.js
node --version
echo.

:: 检查项目目录
if not exist "server" (
    echo [错误] 未找到 server 目录
    pause
    exit /b 1
)

if not exist "client" (
    echo [错误] 未找到 client 目录
    pause
    exit /b 1
)

:: 安装后端依赖
echo [1/5] 安装后端依赖...
cd server
if not exist "node_modules" (
    echo [信息] 正在安装 node_modules...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 后端依赖安装失败
        cd ..
        pause
        exit /b 1
    )
) else (
    echo [信息] node_modules 已存在，跳过安装
)
cd ..
echo.

:: 编译后端代码
echo [2/5] 编译后端代码...
cd server
if not exist "dist" (
    call npm run build
    if %errorlevel% neq 0 (
        echo [错误] 后端编译失败
        cd ..
        pause
        exit /b 1
    )
) else (
    echo [信息] dist 目录已存在，跳过编译
)
cd ..
echo.

:: 安装前端依赖
echo [3/5] 安装前端依赖...
cd client
if not exist "node_modules" (
    echo [信息] 正在安装 node_modules...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 前端依赖安装失败
        cd ..
        pause
        exit /b 1
    )
) else (
    echo [信息] node_modules 已存在，跳过安装
)
cd ..
echo.

:: 启动后端服务
echo [4/5] 启动后端服务...
echo [信息] 后端端口: %SERVER_PORT%
cd server
start "Retail-Platform-Server" cmd /c "npm start"
cd ..
echo [信息] 后端服务正在启动...
timeout /t 3 /nobreak >nul
echo.

:: 启动前端服务
echo [5/5] 启动前端服务...
echo [信息] 前端端口: %CLIENT_PORT%
cd client
start "Retail-Platform-Client" cmd /c "npm run dev"
cd ..
echo [信息] 前端服务正在启动...
timeout /t 5 /nobreak >nul
echo.

echo ==========================================
echo   启动完成！
echo ==========================================
echo.
echo [后端服务] http://localhost:%SERVER_PORT%
echo [前端应用] http://localhost:%CLIENT_PORT%
echo.
echo 功能模块:
echo   - 数据汇总看板
echo   - 门店管理
echo   - 客流统计
echo   - 库存管理
echo   - 会员管理
echo   - 营销活动
echo   - 员工考勤
echo   - 员工管理
echo.
echo 注意:
echo   - 请保持两个终端窗口打开
echo   - 使用 stop.bat 停止服务
echo   - 如需重新启动，请先运行 stop.bat
echo.
pause
