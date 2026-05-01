#!/bin/bash

echo "============================================"
echo "  多端统一消息聚合中台 - 一键启动脚本"
echo "============================================"
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到 Node.js，请先安装 Node.js (https://nodejs.org)"
    exit 1
fi

echo "[1/4] 检查 Node.js 版本..."
node --version
echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "[2/4] 安装根目录依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[错误] 根目录依赖安装失败"
        exit 1
    fi
else
    echo "[2/4] 根目录依赖已存在，跳过安装"
fi

if [ ! -d "server/node_modules" ]; then
    echo "[3/4] 安装后端服务依赖..."
    cd server && npm install && cd ..
    if [ $? -ne 0 ]; then
        echo "[错误] 后端依赖安装失败"
        exit 1
    fi
else
    echo "[3/4] 后端依赖已存在，跳过安装"
fi

if [ ! -d "client/node_modules" ]; then
    echo "[4/4] 安装前端应用依赖..."
    cd client && npm install && cd ..
    if [ $? -ne 0 ]; then
        echo "[错误] 前端依赖安装失败"
        exit 1
    fi
else
    echo "[4/4] 前端依赖已存在，跳过安装"
fi

echo ""
echo "============================================"
echo "  启动服务中..."
echo "============================================"
echo ""
echo "[信息] 后端服务将运行在: http://localhost:3002"
echo "[信息] 前端应用将运行在: http://localhost:3000"
echo ""
echo "[提示] 按 Ctrl+C 可停止服务"
echo ""

npm run dev
