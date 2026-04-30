#!/bin/bash

echo "=========================================="
echo "正在停止 MySQL 数据库容器..."
echo "=========================================="

# 检查 docker-compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ 请先安装 Docker Compose"
    exit 1
fi

# 进入项目根目录
cd "$(dirname "$0")/.."

# 停止并移除 MySQL 容器
docker-compose down mysql

echo ""
echo "=========================================="
echo "✅ MySQL 数据库容器已停止！"
echo "=========================================="
