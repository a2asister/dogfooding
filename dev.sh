#!/bin/bash

set -e

echo "========================================"
echo "  酒店订餐中心系统 - 开发环境启动"
echo "========================================"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "[1/4] 检查 Node.js 环境..."
if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "错误: 未找到 npm"
    exit 1
fi

echo "✓ Node.js 版本: $(node --version)"

echo "[2/4] 安装依赖..."
echo "安装根目录依赖..."
npm install

echo "安装前端依赖..."
cd frontend && npm install && cd ..

echo "安装后端依赖..."
cd backend && npm install && cd ..

echo "[3/4] 配置环境变量..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✓ 已创建后端 .env 配置文件"
fi

echo "[4/4] 启动开发服务器..."
echo ""
echo "========================================"
echo "  开发环境已准备就绪"
echo "========================================"
echo ""
echo "启动命令:"
echo "  同时启动前后端: npm run dev"
echo "  仅启动前端: npm run dev:frontend"
echo "  仅启动后端: npm run dev:backend"
echo ""
echo "访问地址:"
echo "  前端: http://localhost:3000"
echo "  后端 API: http://localhost:8080"
echo ""
echo "注意: 开发环境需要本地 MySQL 数据库"
echo "      或者使用 Docker 启动数据库: docker-compose up -d mysql"
echo ""
