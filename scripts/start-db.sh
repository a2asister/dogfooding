#!/bin/bash

echo "=========================================="
echo "正在启动 MySQL 数据库容器..."
echo "=========================================="

# 检查 docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 请先安装 Docker"
    exit 1
fi

# 检查 docker-compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ 请先安装 Docker Compose"
    exit 1
fi

# 进入项目根目录
cd "$(dirname "$0")/.."

# 启动 MySQL 容器
docker-compose up -d mysql

# 检查容器是否启动成功
if [ $? -ne 0 ]; then
    echo "❌ MySQL 容器启动失败"
    exit 1
fi

echo ""
echo "⏳ 等待 MySQL 初始化完成..."
sleep 10

# 检查容器状态
docker-compose ps mysql

echo ""
echo "=========================================="
echo "✅ MySQL 数据库容器已启动！"
echo ""
echo "数据库连接信息："
echo "  - 主机: localhost"
echo "  - 端口: 3306"
echo "  - 数据库: bank_card_management"
echo "  - 用户名: bank"
echo "  - 密码: bank123456"
echo ""
echo "如需停止数据库，请运行: ./scripts/stop-db.sh"
echo "=========================================="
