#!/bin/bash

# 项目风险全链路管控系统停止脚本
# 适用于 Linux/Unix 环境

echo "========================================"
echo "  停止项目风险全链路管控系统"
echo "========================================"
echo ""

# 项目目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 停止后端服务
echo "🛑 停止后端服务..."
if [ -f "$SCRIPT_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$SCRIPT_DIR/backend.pid")
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo "✅ 后端服务已停止 (PID: $BACKEND_PID)"
        rm -f "$SCRIPT_DIR/backend.pid"
    else
        echo "⚠️  后端服务已经停止"
        rm -f "$SCRIPT_DIR/backend.pid"
    fi
else
    # 尝试通过端口查找进程
    BACKEND_PID=$(lsof -ti:3000 2>/dev/null)
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID
        echo "✅ 后端服务已停止 (PID: $BACKEND_PID)"
    else
        echo "⚠️  未找到运行中的后端服务"
    fi
fi

# 停止前端服务
echo "🛑 停止前端服务..."
if [ -f "$SCRIPT_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$SCRIPT_DIR/frontend.pid")
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo "✅ 前端服务已停止 (PID: $FRONTEND_PID)"
        rm -f "$SCRIPT_DIR/frontend.pid"
    else
        echo "⚠️  前端服务已经停止"
        rm -f "$SCRIPT_DIR/frontend.pid"
    fi
else
    # 尝试通过端口查找进程
    FRONTEND_PID=$(lsof -ti:5173 2>/dev/null)
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID
        echo "✅ 前端服务已停止 (PID: $FRONTEND_PID)"
    else
        echo "⚠️  未找到运行中的前端服务"
    fi
fi

echo ""
echo "========================================"
echo "  系统已停止"
echo "========================================"
