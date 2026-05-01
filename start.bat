@echo off
chcp 65001 >nul
echo ========================================
echo    企业知识库语义检索平台 - 一键启动
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] 检查 Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Node.js，请先安装 Node.js 18+ 版本
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js 已安装

echo.
echo [2/4] 安装后端依赖...
cd backend
if not exist "node_modules" (
    call npm install
    if errorlevel 1 (
        echo [错误] 后端依赖安装失败
        pause
        exit /b 1
    )
    echo [OK] 后端依赖安装完成
) else (
    echo [跳过] 后端依赖已存在
)
cd ..

echo.
echo [3/4] 安装前端依赖...
cd frontend
if not exist "node_modules" (
    call npm install
    if errorlevel 1 (
        echo [错误] 前端依赖安装失败
        pause
        exit /b 1
    )
    echo [OK] 前端依赖安装完成
) else (
    echo [跳过] 前端依赖已存在
)
cd ..

echo.
echo [4/4] 启动服务...
echo.
echo ========================================
echo    服务地址
echo ========================================
echo 后端服务: http://localhost:38765
echo 前端服务: http://localhost:39876
echo ========================================
echo.
echo 默认管理员账户:
echo   用户名: admin
echo   密码: admin123
echo.

echo 正在启动后端服务 (端口 38765)...
start "KB-Backend" cmd /c "cd /d "%~dp0backend" && npm run dev"

timeout /t 3 /nobreak >nul

echo 正在启动前端服务 (端口 39876)...
start "KB-Frontend" cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ========================================
echo    启动完成！
echo ========================================
echo 请在浏览器中打开: http://localhost:39876
echo.
echo 注意:
echo - 请勿关闭新打开的终端窗口
echo - 如需停止服务，请运行 stop.bat
echo ========================================
echo.

pause
