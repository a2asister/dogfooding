#!/bin/bash

# 智能家居系统 - 停止所有服务脚本

echo "=========================================="
echo "正在停止智能家居系统所有服务..."
echo "=========================================="

# 获取项目根目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 停止前端服务
echo "正在停止前端服务..."
FRONTEND_PID=$(lsof -ti:5173 2>/dev/null)
if [ -n "$FRONTEND_PID" ]; then
    kill -9 $FRONTEND_PID 2>/dev/null
    echo "前端服务已停止 (PID: $FRONTEND_PID)"
else
    echo "前端服务未运行"
fi

# 停止后端服务
echo "正在停止后端服务..."
BACKEND_PID=$(lsof -ti:3000 2>/dev/null)
if [ -n "$BACKEND_PID" ]; then
    kill -9 $BACKEND_PID 2>/dev/null
    echo "后端服务已停止 (PID: $BACKEND_PID)"
else
    echo "后端服务未运行"
fi

# 停止 MySQL Docker 容器
echo "正在停止 MySQL Docker 容器..."
CONTAINER_NAME="smart_home_mysql"
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    docker stop $CONTAINER_NAME
    echo "MySQL 容器已停止"
else
    echo "MySQL 容器未运行"
fi

# 可选：删除容器（如果需要完全重置）
# echo "是否删除 MySQL 容器？(y/n)"
# read -r answer
# if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
#     docker rm $CONTAINER_NAME 2>/dev/null
#     echo "MySQL 容器已删除"
# fi

echo "=========================================="
echo "所有服务已停止"
echo "=========================================="