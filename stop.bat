@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ==========================================
echo   线下门店数字化运营中台 - 一键停止脚本
echo ==========================================
echo.

:: 停止指定名称的进程
echo [1/2] 停止后端服务...
taskkill /FI "WINDOWTITLE eq Retail-Platform-Server*" /F >nul 2>&1
if %errorlevel% equ 0 (
    echo [信息] 后端服务已停止
) else (
    echo [信息] 未检测到运行中的后端服务
)

:: 停止前端服务
echo.
echo [2/2] 停止前端服务...
taskkill /FI "WINDOWTITLE eq Retail-Platform-Client*" /F >nul 2>&1
if %errorlevel% equ 0 (
    echo [信息] 前端服务已停止
) else (
    echo [信息] 未检测到运行中的前端服务
)

:: 清理可能残留的 Node.js 进程（根据端口号清理更安全）
echo.
echo [可选] 清理残留进程...

:: 尝试通过端口号查找并终止进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":35678"') do (
    set SERVER_PID=%%a
    if defined SERVER_PID (
        echo [信息] 找到后端进程 PID: !SERVER_PID!
        taskkill /PID !SERVER_PID! /F >nul 2>&1
        if !errorlevel! equ 0 (
            echo [信息] 已终止后端进程
        )
    )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":35679"') do (
    set CLIENT_PID=%%a
    if defined CLIENT_PID (
        echo [信息] 找到前端进程 PID: !CLIENT_PID!
        taskkill /PID !CLIENT_PID! /F >nul 2>&1
        if !errorlevel! equ 0 (
            echo [信息] 已终止前端进程
        )
    )
)

echo.
echo ==========================================
echo   服务已停止！
echo ==========================================
echo.
echo [提示]
echo   - 所有相关服务已停止
echo   - 如需重新启动，请运行 start.bat
echo.
pause
