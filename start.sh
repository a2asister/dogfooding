#!/bin/bash

echo "=========================================="
echo "  跨团队异步协作中台 - 一键启动脚本"
echo "=========================================="
echo ""

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "[0/5] 正在停止现有服务..."
for port in 3000 3001; do
    pid=$(lsof -t -i:$port -sTCP:LISTEN 2>/dev/null)
    if [ -n "$pid" ]; then
        kill -9 $pid 2>/dev/null
    fi
done
echo "✅ 现有服务已停止"
echo ""

if [ ! -d "node_modules" ]; then
    echo "[1/5] 正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败，请检查网络连接后重试"
        exit 1
    fi
else
    echo "[1/5] 依赖已安装，跳过安装步骤"
fi

if [ ! -d "server/data" ]; then
    echo "[2/5] 初始化数据目录..."
    mkdir -p server/data
    echo '[]' > server/data/topics.json
    echo '[]' > server/data/tasks.json
    echo '[]' > server/data/users.json
    echo '[]' > server/data/organizations.json
    echo '[]' > server/data/whitelist.json
else
    echo "[2/5] 数据目录已存在"
fi

echo ""
echo "[3/5] 正在启动服务..."
echo ""
echo "=========================================="
echo "  服务地址:"
echo "  前端: http://localhost:3000"
echo "  后端: http://localhost:3001"
echo "=========================================="
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

npm run dev
