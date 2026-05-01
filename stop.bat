@echo off
chcp 65001 >nul
echo ========================================
echo    企业知识库语义检索平台 - 一键停止
echo ========================================
echo.

echo [1/2] 停止后端服务 (端口 38765)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":38765"') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo [OK] 后端服务已停止

echo.
echo [2/2] 停止前端服务 (端口 39876)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":39876"') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo [OK] 前端服务已停止

echo.
echo ========================================
echo    停止完成！
echo ========================================
echo.

pause
