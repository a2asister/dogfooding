@echo off
chcp 65001 >nul
echo ==========================================
echo   跨团队异步协作中台 - 一键启动脚本
echo ==========================================
echo.

set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo [0/5] 正在停止现有服务...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo ✅ 现有服务已停止
echo.

if not exist "node_modules" (
    echo [1/5] 正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败，请检查网络连接后重试
        pause
        exit /b 1
    )
) else (
    echo [1/5] 依赖已安装，跳过安装步骤
)

if not exist "server\data" (
    echo [2/5] 初始化数据目录...
    mkdir server\data
    echo [] > server\data\topics.json
    echo [] > server\data\tasks.json
    echo [] > server\data\users.json
    echo [] > server\data\organizations.json
    echo [] > server\data\whitelist.json
) else (
    echo [2/5] 数据目录已存在
)

echo.
echo [3/5] 正在启动服务...
echo.
echo ==========================================
echo   服务地址:
echo   前端: http://localhost:3000
echo   后端: http://localhost:3001
echo ==========================================
echo.
echo 按 Ctrl+C 停止服务
echo.

call npm run dev
