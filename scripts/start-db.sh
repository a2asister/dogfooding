#!/bin/bash

# 智能家居系统 - 启动 MySQL 数据库脚本

echo "=========================================="
echo "正在启动 MySQL 数据库..."
echo "=========================================="

# 获取项目根目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_ROOT/docker"

# 检查 Docker 是否已安装
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker 是否运行
if ! docker info &> /dev/null; then
    echo "错误: Docker 未运行，请先启动 Docker"
    exit 1
fi

# 检查 docker-compose 是否存在
cd "$DOCKER_DIR"
if [ ! -f "docker-compose.yml" ]; then
    echo "错误: 找不到 docker-compose.yml 文件"
    exit 1
fi

# 启动 MySQL 容器
echo "正在启动 MySQL Docker 容器..."
docker-compose up -d mysql

# 等待 MySQL 启动
echo "正在等待 MySQL 初始化..."
sleep 10

# 检查容器状态
CONTAINER_NAME="smart_home_mysql"
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "=========================================="
    echo "MySQL 数据库启动成功！"
    echo "=========================================="
    echo "容器名称: $CONTAINER_NAME"
    echo "端口: 3306"
    echo "数据库: smart_home"
    echo "用户名: smart_home"
    echo "密码: smart_home123"
    echo "-----------------------------------------"
    echo "管理用户: root"
    echo "管理密码: root123456"
    echo "=========================================="
else
    echo "错误: MySQL 容器启动失败"
    docker logs $CONTAINER_NAME 2>/dev/null
    exit 1
fi