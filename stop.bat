@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set PROJECT_DIR=%~dp0

echo ========================================
echo   组织人力效能分析系统 - 停止脚本
echo ========================================
echo.

echo [1/3] 停止相关服务进程...
echo.

echo 正在查找并停止相关进程...

set FOUND=0

for /f "tokens=2" %%a in ('tasklist /v ^| findstr "HRE_Backend" ^| findstr /v "findstr"') do (
    echo 正在停止后端服务进程 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] 后端服务已停止
        set FOUND=1
    )
)

for /f "tokens=2" %%a in ('tasklist /v ^| findstr "HRE_Frontend" ^| findstr /v "findstr"') do (
    echo 正在停止前端服务进程 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] 前端服务已停止
        set FOUND=1
    )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":38900" ^| findstr "LISTENING"') do (
    echo 正在停止端口38900上的进程 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] 端口38900进程已停止
        set FOUND=1
    )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":38901" ^| findstr "LISTENING"') do (
    echo 正在停止端口38901上的进程 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] 端口38901进程已停止
        set FOUND=1
    )
)

for /f "tokens=2" %%a in ('tasklist ^| findstr "node.exe"') do (
    wmic process where "processid=%%a" get commandline 2>nul | findstr /i "vite\|koa\|38900\|38901" >nul
    if !errorlevel! equ 0 (
        echo 正在停止Node.js服务进程 (PID: %%a)...
        taskkill /F /PID %%a >nul 2>&1
        if !errorlevel! equ 0 (
            echo [OK] Node.js进程已停止
            set FOUND=1
        )
    )
)

echo.
echo [2/3] 清理残留进程...

for /f "tokens=2" %%a in ('tasklist /v ^| findstr "cmd.exe" ^| findstr "HRE_" ^| findstr /v "findstr"') do (
    echo 正在停止残留窗口进程 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [3/3] 验证服务状态...

set RUNNING=0
netstat -ano | findstr ":38900" >nul 2>&1
if %errorlevel% equ 0 (
    echo [警告] 端口38900仍被占用
    set RUNNING=1
)

netstat -ano | findstr ":38901" >nul 2>&1
if %errorlevel% equ 0 (
    echo [警告] 端口38901仍被占用
    set RUNNING=1
)

echo.
echo ========================================
if %FOUND% equ 0 (
    echo   未找到运行中的服务进程
) else (
    echo   服务已停止
)

if %RUNNING% equ 0 (
    echo   端口已全部释放
    echo   [状态] 所有服务已停止
) else (
    echo   [状态] 部分端口仍被占用
    echo   提示: 请手动检查或重启计算机
)
echo ========================================
echo.
echo 端口状态:
echo   - 端口38900 (前端): %errorlevel%
netstat -ano | findstr ":38900" >nul 2>&1
if %errorlevel% equ 0 (
    echo     [警告] 被占用
) else (
    echo     [OK] 已释放
)

netstat -ano | findstr ":38901" >nul 2>&1
if %errorlevel% equ 0 (
    echo   - 端口38901 (后端): [警告] 被占用
) else (
    echo   - 端口38901 (后端): [OK] 已释放
)

echo.
echo 按任意键退出...
pause >nul
