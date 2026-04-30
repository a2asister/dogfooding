#!/bin/bash

echo "=========================================="
echo "🚀 银行卡管理系统 - 一键启动"
echo "=========================================="

# 检查必要的工具
command -v docker &> /dev/null || { echo "❌ 请先安装 Docker"; exit 1; }
command -v docker-compose &> /dev/null || { echo "❌ 请先安装 Docker Compose"; exit 1; }
command -v node &> /dev/null || { echo "❌ 请先安装 Node.js"; exit 1; }
command -v npm &> /dev/null || { echo "❌ 请先安装 npm"; exit 1; }

# 进入项目根目录
cd "$(dirname "$0")/.."

# 步骤 1: 检查依赖
echo ""
echo "📦 步骤 1: 检查项目依赖..."

if [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "⚠️  依赖未完全安装，正在安装..."
    cd backend
    npm install
    cd ../frontend
    npm install
    cd ..
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已安装"
fi

# 步骤 2: 启动数据库
echo ""
echo "🗄️  步骤 2: 启动 MySQL 数据库..."

# 检查 MySQL 容器是否已在运行
if docker-compose ps mysql 2>/dev/null | grep -q "Up"; then
    echo "✅ MySQL 数据库已在运行中"
else
    echo "⏳ 启动 MySQL 容器..."
    docker-compose up -d mysql
    
    if [ $? -ne 0 ]; then
        echo "❌ MySQL 容器启动失败"
        exit 1
    fi
    
    echo "⏳ 等待 MySQL 初始化完成..."
    sleep 10
    echo "✅ MySQL 数据库已启动"
fi

# 步骤 3: 启动后端服务
echo ""
echo "🔧 步骤 3: 启动后端服务..."

# 检查端口是否被占用
if lsof -i :3003 &> /dev/null; then
    echo "⚠️  端口 3003 已被占用，请检查是否已有后端服务在运行"
else
    echo "🚀 启动后端服务 (端口: 3003)..."
    cd backend
    
    # 在新终端窗口启动后端（macOS）
    if [ "$(uname)" = "Darwin" ]; then
        osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"' && npm run dev"'
    else
        # Linux 或其他系统
        gnome-terminal -- bash -c "cd $(pwd) && npm run dev; exec bash"
    fi
    cd ..
    echo "✅ 后端服务已启动"
fi

# 步骤 4: 启动前端服务
echo ""
echo "🌐 步骤 4: 启动前端服务..."

# 检查端口是否被占用
if lsof -i :3002 &> /dev/null; then
    echo "⚠️  端口 3002 已被占用，请检查是否已有前端服务在运行"
else
    echo "🚀 启动前端服务 (端口: 3002)..."
    cd frontend
    
    # 在新终端窗口启动前端（macOS）
    if [ "$(uname)" = "Darwin" ]; then
        osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"' && npm run dev"'
    else
        # Linux 或其他系统
        gnome-terminal -- bash -c "cd $(pwd) && npm run dev; exec bash"
    fi
    cd ..
    echo "✅ 前端服务已启动"
fi

# 等待服务启动
echo ""
echo "⏳ 等待服务完全启动..."
sleep 3

echo ""
echo "=========================================="
echo "✅ 所有服务已启动！"
echo "=========================================="
echo ""
echo "📡 服务地址："
echo "  - 前端界面: http://localhost:3002"
echo "  - 后端 API: http://localhost:3003"
echo "  - 数据库:   localhost:3306"
echo ""
echo "📝 使用说明："
echo "  1. 打开浏览器访问 http://localhost:3002"
echo "  2. 注册新账号或使用已有账号登录"
echo "  3. 开始管理您的银行卡和交易记录"
echo ""
echo "🛑 停止服务："
echo "  - 按 Ctrl+C 停止当前终端中的服务"
echo "  - 关闭其他终端窗口停止前后端服务"
echo "  - 运行 ./scripts/stop-db.sh 停止数据库"
echo "=========================================="
