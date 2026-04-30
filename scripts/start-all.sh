#!/bin/bash

# 智能家居系统 - 一键启动脚本
# 功能：先停止所有服务，然后依次启动数据库、后端、前端

echo "=========================================="
echo "        智能家居系统 - 一键启动"
echo "=========================================="
echo ""

# 获取项目根目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 显示启动时间
echo "启动时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 第一步：停止所有服务
echo "=========================================="
echo "[1/4] 停止所有现有服务..."
echo "=========================================="
"$SCRIPT_DIR/stop-all.sh"
echo ""

# 等待一下
sleep 2

# 第二步：启动数据库
echo "=========================================="
echo "[2/4] 启动 MySQL 数据库..."
echo "=========================================="
"$SCRIPT_DIR/start-db.sh"

# 检查数据库是否启动成功
CONTAINER_NAME="smart_home_mysql"
if [ ! "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo ""
    echo "错误: MySQL 数据库启动失败！"
    echo "请检查 Docker 是否正常运行，然后重新执行此脚本"
    exit 1
fi

# 等待数据库完全初始化
echo ""
echo "正在等待数据库完全初始化 (约 15 秒)..."
sleep 15

# 第三步：启动后端服务
echo ""
echo "=========================================="
echo "[3/4] 启动后端服务..."
echo "=========================================="
"$SCRIPT_DIR/start-backend.sh" $1

# 检查后端是否启动成功
sleep 3
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "后端服务已就绪"
else
    echo "警告: 后端服务可能还在启动中，请稍后检查"
fi

# 第四步：启动前端服务
echo ""
echo "=========================================="
echo "[4/4] 启动前端服务..."
echo "=========================================="
"$SCRIPT_DIR/start-frontend.sh" $1

# 等待前端启动
sleep 3

# 显示启动完成信息
echo ""
echo "=========================================="
echo "        智能家居系统启动完成！"
echo "=========================================="
echo ""
echo "服务状态："
echo "  - MySQL 数据库: http://localhost:3306"
echo "  - 后端 API 服务: http://localhost:3000"
echo "  - 前端 Web 服务: http://localhost:5173"
echo ""
echo "访问方式："
echo "  - 前端界面: http://localhost:5173"
echo "  - API 文档: http://localhost:3000 (如已配置)"
echo ""
echo "默认账号："
echo "  - 用户名: admin"
echo "  - 密码: 请查看数据库初始化脚本设置"
echo ""
echo "其他命令："
echo "  - 停止所有服务: sh $SCRIPT_DIR/stop-all.sh"
echo "  - 单独启动数据库: sh $SCRIPT_DIR/start-db.sh"
echo "  - 单独启动后端: sh $SCRIPT_DIR/start-backend.sh"
echo "  - 单独启动前端: sh $SCRIPT_DIR/start-frontend.sh"
echo ""
echo "=========================================="
echo "启动完成时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="

# 打开浏览器访问前端（可选）
if command -v open &> /dev/null; then
    read -p "是否现在打开前端界面？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open http://localhost:5173
    fi
fi