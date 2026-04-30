#!/bin/bash

set -e

echo "=========================================="
echo "  京杭大运河污染大屏监控系统 - 一键启动"
echo "=========================================="
echo ""

PROJECT_DIR="京杭大运河污染大屏监控系统"

echo "📦 [1/6] 检查环境检查..."
command -v docker >/dev/null 2>&1 || { echo >&2 "错误: 未安装 Docker，请先安装 Docker"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo >&2 "错误: 未安装 Docker Compose，请先安装 Docker Compose"; exit 1; }
command -v node >/dev/null 2>&1 || { echo >&2 "错误: 未安装 Node.js，请先安装 Node.js"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo >&2 "错误: 未安装 npm，请先安装 npm"; exit 1; }

echo "✅ 环境检查通过"
echo ""

echo "🛑 [2/6] 停止所有运行中的服务..."

echo "   - 停止 Docker 容器..."
docker-compose down 2>/dev/null || true

echo "   - 停止可能运行的 Node.js 进程..."
pkill -f "node.*vite" 2>/dev/null || true
pkill -f "node.*tsx" 2>/dev/null || true
pkill -f "node.*koa" 2>/dev/null || true

echo "   - 清理占用端口的进程..."
lsof -ti:3010 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:3011 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:3307 2>/dev/null | xargs kill -9 2>/dev/null || true

echo "✅ 所有服务已停止"
echo ""

echo "🐳 [3/6] 启动 MySQL 数据库容器..."
docker-compose up -d

echo "   - 等待数据库初始化..."
for i in {1..30}; do
    if docker exec grand_canal_mysql mysql -ucanal_user -pcanal_pass123 -e "SELECT 1" >/dev/null 2>&1; then
        break
    fi
    echo "   - 等待数据库就绪... ($i/30)"
    sleep 2
done

echo "✅ 数据库已启动"
echo ""

echo "📦 [4/6] 安装项目依赖..."

echo "   - 安装根目录依赖..."
npm install

echo "   - 安装前端依赖..."
cd frontend && npm install && cd ..

echo "   - 安装后端依赖..."
cd backend && npm install && cd ..

echo "✅ 依赖安装完成"
echo ""

echo "🔧 [5/6] 配置检查..."

if [ ! -f "backend/.env" ]; then
    echo "   - 创建后端环境配置文件..."
    cat > backend/.env << 'EOF'
PORT=3011
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3307
DB_NAME=grand_canal_monitoring
DB_USER=canal_user
DB_PASSWORD=canal_pass123

LOG_LEVEL=info
LOG_DIR=./logs
EOF
fi

echo "✅ 配置检查完成"
echo ""

echo "🚀 [6/6] 启动所有服务..."

echo ""
echo "=========================================="
echo "  服务信息"
echo "=========================================="
echo "  前端地址: http://localhost:3010"
echo "  后端地址: http://localhost:3011"
echo "  API 地址: http://localhost:3011/api"
echo "  数据库: localhost:3307"
echo "=========================================="
echo ""

echo "📋 启动方式选择:"
echo "  1. 同时启动前后端 (推荐)"
echo "  2. 仅启动数据库"
echo "  3. 仅启动前端"
echo "  4. 仅启动后端"
echo "  5. 退出"
echo ""

read -p "请输入选项 (1-5): " choice

case $choice in
    1)
        echo "✅ 正在同时启动前后端..."
        npm run dev
        ;;
    2)
        echo "✅ 数据库已在运行，您可以单独启动其他服务"
        echo "   启动前端: npm run dev:frontend"
        echo "   启动后端: npm run dev:backend"
        ;;
    3)
        echo "✅ 启动前端..."
        npm run dev:frontend
        ;;
    4)
        echo "✅ 启动后端..."
        npm run dev:backend
        ;;
    5)
        echo "👋 退出"
        exit 0
        ;;
    *)
        echo "❌ 无效选项，退出"
        exit 1
        ;;
esac
