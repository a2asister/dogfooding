#!/bin/bash

# 智能家居系统 - 启动后端服务脚本

echo "=========================================="
echo "正在启动后端服务..."
echo "=========================================="

# 获取项目根目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"

# 检查 Node.js 是否已安装
if ! command -v node &> /dev/null; then
    echo "错误: Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查后端目录是否存在
if [ ! -d "$BACKEND_DIR" ]; then
    echo "错误: 找不到后端目录: $BACKEND_DIR"
    exit 1
fi

cd "$BACKEND_DIR"

# 检查 package.json 是否存在
if [ ! -f "package.json" ]; then
    echo "错误: 找不到 package.json 文件"
    exit 1
fi

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "正在安装后端依赖..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "错误: 依赖安装失败"
        exit 1
    fi
fi

# 检查端口是否被占用
PORT=3000
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "端口 $PORT 已被占用，正在停止现有服务..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null
    sleep 2
fi

# 启动后端服务
echo "正在启动后端服务 (端口: $PORT)..."

# 使用 nohup 后台运行
if [ "$1" = "prod" ] || [ "$1" = "production" ]; then
    echo "生产模式启动..."
    nohup npm start > logs/app.log 2>&1 &
    BACKEND_PID=$!
else
    echo "开发模式启动..."
    # 检查是否有 nodemon，如果有则使用 nodemon
    if [ -f "node_modules/.bin/nodemon" ]; then
        npm run dev &
    else
        npm start &
    fi
    BACKEND_PID=$!
fi

# 等待服务启动
sleep 3

# 检查服务是否启动成功
if curl -s http://localhost:$PORT > /dev/null 2>&1; then
    echo "=========================================="
    echo "后端服务启动成功！"
    echo "=========================================="
    echo "服务地址: http://localhost:$PORT"
    echo "API 前缀: /api"
    echo "进程 PID: $BACKEND_PID"
    echo "=========================================="
else
    # 再次检查
    sleep 2
    if curl -s http://localhost:$PORT > /dev/null 2>&1; then
        echo "=========================================="
        echo "后端服务启动成功！"
        echo "=========================================="
        echo "服务地址: http://localhost:$PORT"
        echo "API 前缀: /api"
        echo "=========================================="
    else
        echo "警告: 无法确认服务是否启动成功，请检查日志"
        echo "可能的问题:"
        echo "1. 数据库连接失败"
        echo "2. 端口被占用"
        echo "3. 依赖缺失"
    fi
fi