#!/bin/bash

echo "=========================================="
echo "正在启动后端服务..."
echo "=========================================="

# 检查 node 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装 Node.js"
    exit 1
fi

# 进入后端目录
cd "$(dirname "$0")/../backend"

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "⚠️  依赖未安装，正在安装..."
    npm install
fi

echo ""
echo "🚀 启动后端开发服务器..."
echo "📡 后端服务地址: http://localhost:3003"
echo ""

# 启动后端服务
npm run dev
