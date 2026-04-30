#!/bin/bash

set -e

echo "========================================"
echo "  酒店订餐中心系统 - 启动脚本"
echo "========================================"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "[1/3] 检查 Docker 是否运行..."
if ! docker info >/dev/null 2>&1; then
    echo "错误: Docker 未运行，请先启动 Docker"
    exit 1
fi
echo "✓ Docker 正常运行"

echo "[2/3] 构建并启动服务..."
docker-compose up -d --build

echo "[3/3] 等待服务就绪..."
echo "正在等待 MySQL 初始化..."
sleep 10

echo ""
echo "========================================"
echo "  服务启动成功！"
echo "========================================"
echo ""
echo "访问地址:"
echo "  前端: http://localhost"
echo "  后端 API: http://localhost:8080"
echo "  数据库: localhost:3306"
echo ""
echo "测试账号:"
echo "  管理员: admin / 123456"
echo "  工作人员: staff / 123456"
echo "  住客: guest / 123456"
echo ""
echo "常用命令:"
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: ./stop.sh"
echo "  重启服务: ./restart.sh"
echo ""
