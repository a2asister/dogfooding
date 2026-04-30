#!/bin/bash

set -e

echo "========================================"
echo "  酒店订餐中心系统 - 重启脚本"
echo "========================================"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "[1/2] 停止现有服务..."
docker-compose down

echo "[2/2] 重新启动服务..."
docker-compose up -d

echo ""
echo "========================================"
echo "  服务重启成功！"
echo "========================================"
echo ""
echo "访问地址:"
echo "  前端: http://localhost"
echo "  后端 API: http://localhost:8080"
echo ""
