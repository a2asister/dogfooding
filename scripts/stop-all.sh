#!/bin/bash

echo "=========================================="
echo "🛑 银行卡管理系统 - 停止所有服务"
echo "=========================================="

# 进入项目根目录
cd "$(dirname "$0")/.."

# 步骤 1: 停止前端服务
echo ""
echo "🌐 步骤 1: 停止前端服务 (端口 3002)..."

if lsof -i :3002 &> /dev/null; then
    echo "⏳ 正在停止前端服务..."
    # 获取占用端口的进程 ID 并停止
    FRONTEND_PID=$(lsof -t -i:3002)
    if [ -n "$FRONTEND_PID" ]; then
        kill -9 $FRONTEND_PID 2>/dev/null
        echo "✅ 前端服务已停止 (PID: $FRONTEND_PID)"
    fi
else
    echo "ℹ️  前端服务未运行"
fi

# 步骤 2: 停止后端服务
echo ""
echo "🔧 步骤 2: 停止后端服务 (端口 3003)..."

if lsof -i :3003 &> /dev/null; then
    echo "⏳ 正在停止后端服务..."
    # 获取占用端口的进程 ID 并停止
    BACKEND_PID=$(lsof -t -i:3003)
    if [ -n "$BACKEND_PID" ]; then
        kill -9 $BACKEND_PID 2>/dev/null
        echo "✅ 后端服务已停止 (PID: $BACKEND_PID)"
    fi
else
    echo "ℹ️  后端服务未运行"
fi

# 步骤 3: 停止数据库容器
echo ""
echo "🗄️  步骤 3: 停止 MySQL 数据库容器..."

# 检查 docker-compose 是否安装
if command -v docker-compose &> /dev/null; then
    # 检查 MySQL 容器是否在运行
    if docker-compose ps mysql 2>/dev/null | grep -q "Up"; then
        echo "⏳ 正在停止 MySQL 容器..."
        docker-compose down mysql
        echo "✅ MySQL 数据库容器已停止"
    else
        echo "ℹ️  MySQL 容器未运行"
    fi
else
    echo "⚠️  未找到 docker-compose，跳过数据库停止"
fi

echo ""
echo "=========================================="
echo "✅ 所有服务已停止！"
echo "=========================================="
echo ""
echo "📊 服务状态："
echo "  - 前端服务 (端口 3002): 已停止"
echo "  - 后端服务 (端口 3003): 已停止"
echo "  - MySQL 数据库 (端口 3306): 已停止"
echo ""
echo "📝 如需重新启动，请运行："
echo "  ./scripts/start-all.sh"
echo "=========================================="
