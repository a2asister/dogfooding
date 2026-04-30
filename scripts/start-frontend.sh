#!/bin/bash

# 智能家居系统 - 启动前端服务脚本

echo "=========================================="
echo "正在启动前端服务..."
echo "=========================================="

# 获取项目根目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# 检查 Node.js 是否已安装
if ! command -v node &> /dev/null; then
    echo "错误: Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查前端目录是否存在
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "错误: 找不到前端目录: $FRONTEND_DIR"
    exit 1
fi

cd "$FRONTEND_DIR"

# 检查 package.json 是否存在
if [ ! -f "package.json" ]; then
    echo "错误: 找不到 package.json 文件"
    exit 1
fi

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "正在安装前端依赖..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "错误: 依赖安装失败"
        exit 1
    fi
fi

# 检查端口是否被占用
PORT=5173
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "端口 $PORT 已被占用，正在停止现有服务..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null
    sleep 2
fi

# 启动前端服务
echo "正在启动前端服务 (端口: $PORT)..."

# 使用 nohup 后台运行
if [ "$1" = "prod" ] || [ "$1" = "production" ]; then
    echo "生产模式启动 (需要先构建)..."
    
    # 检查是否已构建
    if [ ! -d "dist" ]; then
        echo "正在构建前端应用..."
        npm run build
        
        if [ $? -ne 0 ]; then
            echo "错误: 构建失败"
            exit 1
        fi
    fi
    
    # 生产模式需要使用静态文件服务器，这里使用 preview
    npm run preview &
    FRONTEND_PID=$!
else
    echo "开发模式启动..."
    npm run dev &
    FRONTEND_PID=$!
fi

# 等待服务启动
sleep 3

# 检查服务是否启动成功
if curl -s http://localhost:$PORT > /dev/null 2>&1; then
    echo "=========================================="
    echo "前端服务启动成功！"
    echo "=========================================="
    echo "服务地址: http://localhost:$PORT"
    echo "进程 PID: $FRONTEND_PID"
    echo "=========================================="
else
    # 再次检查
    sleep 2
    if curl -s http://localhost:$PORT > /dev/null 2>&1; then
        echo "=========================================="
        echo "前端服务启动成功！"
        echo "=========================================="
        echo "服务地址: http://localhost:$PORT"
        echo "=========================================="
    else
        echo "警告: 无法确认服务是否启动成功，请检查终端输出"
        echo "服务可能正在启动中，请稍后访问 http://localhost:$PORT"
    fi
fi