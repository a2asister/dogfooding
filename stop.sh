#!/bin/bash

set -e

echo "========================================"
echo "  酒店订餐中心系统 - 停止脚本"
echo "========================================"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "[1/2] 停止所有服务..."
docker-compose down

echo "[2/2] 清理容器网络..."
echo "✓ 服务已停止"

echo ""
echo "========================================"
echo "  所有服务已停止"
echo "========================================"
echo ""
echo "如需保留数据卷，服务停止后数据不会丢失"
echo "如需重新启动，请执行: ./start.sh"
echo ""
