#!/bin/bash

set -e

echo "=========================================="
echo "  自动化测试平台 - 一键启动脚本"
echo "=========================================="
echo ""

PROJECT_ROOT=$(cd "$(dirname "$0")" && pwd)
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
DATA_DIR="$BACKEND_DIR/src/data"

BACKEND_PORT=3001
FRONTEND_PORT=3000

BACKEND_PID_FILE="$PROJECT_ROOT/backend.pid"
FRONTEND_PID_FILE="$PROJECT_ROOT/frontend.pid"

check_node() {
    if ! command -v node &> /dev/null; then
        echo "❌ 未找到 Node.js，请先安装 Node.js"
        exit 1
    fi
    echo "✓ Node.js 版本: $(node --version)"
}

check_npm() {
    if ! command -v npm &> /dev/null; then
        echo "❌ 未找到 npm，请先安装 npm"
        exit 1
    fi
    echo "✓ npm 版本: $(npm --version)"
}

install_dependencies() {
    echo ""
    echo "=========================================="
    echo "  检查并安装依赖..."
    echo "=========================================="
    echo ""

    echo "[1/2] 检查后端依赖..."
    if [ ! -d "$BACKEND_DIR/node_modules" ]; then
        echo "    安装后端依赖..."
        cd "$BACKEND_DIR"
        npm install
        echo "    ✓ 后端依赖安装完成"
    else
        echo "    ✓ 后端依赖已存在"
    fi

    echo ""
    echo "[2/2] 检查前端依赖..."
    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
        echo "    安装前端依赖..."
        cd "$FRONTEND_DIR"
        npm install
        echo "    ✓ 前端依赖安装完成"
    else
        echo "    ✓ 前端依赖已存在"
    fi
}

create_data_dir() {
    echo ""
    echo "=========================================="
    echo "  初始化数据目录..."
    echo "=========================================="
    
    if [ ! -d "$DATA_DIR" ]; then
        mkdir -p "$DATA_DIR"
        echo "✓ 创建数据目录: $DATA_DIR"
    else
        echo "✓ 数据目录已存在"
    fi
}

stop_services() {
    echo ""
    echo "=========================================="
    echo "  停止现有服务..."
    echo "=========================================="
    
    if [ -f "$BACKEND_PID_FILE" ]; then
        PID=$(cat "$BACKEND_PID_FILE" 2>/dev/null || echo "")
        if [ -n "$PID" ] && kill -0 $PID 2>/dev/null; then
            kill $PID 2>/dev/null || true
            echo "✓ 停止后端服务 (PID: $PID)"
        fi
        rm -f "$BACKEND_PID_FILE"
    fi
    
    if [ -f "$FRONTEND_PID_FILE" ]; then
        PID=$(cat "$FRONTEND_PID_FILE" 2>/dev/null || echo "")
        if [ -n "$PID" ] && kill -0 $PID 2>/dev/null; then
            kill $PID 2>/dev/null || true
            echo "✓ 停止前端服务 (PID: $PID)"
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi
    
    lsof -ti:$BACKEND_PORT -sTCP:LISTEN 2>/dev/null | xargs kill -9 2>/dev/null || true
    lsof -ti:$FRONTEND_PORT -sTCP:LISTEN 2>/dev/null | xargs kill -9 2>/dev/null || true
}

start_backend() {
    echo ""
    echo "=========================================="
    echo "  启动后端服务..."
    echo "=========================================="
    echo ""
    
    cd "$BACKEND_DIR"
    
    nohup node src/index.js > "$PROJECT_ROOT/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$BACKEND_PID_FILE"
    
    echo "等待后端服务启动..."
    for i in {1..30}; do
        if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
            echo ""
            echo "✓ 后端服务启动成功!"
            echo "  - PID: $BACKEND_PID"
            echo "  - 端口: $BACKEND_PORT"
            echo "  - API: http://localhost:$BACKEND_PORT/api"
            echo "  - 日志: $PROJECT_ROOT/backend.log"
            return 0
        fi
        sleep 1
        printf "."
    done
    
    echo ""
    echo "❌ 后端服务启动超时，请检查日志: $PROJECT_ROOT/backend.log"
    exit 1
}

start_frontend() {
    echo ""
    echo "=========================================="
    echo "  启动前端服务..."
    echo "=========================================="
    echo ""
    
    cd "$FRONTEND_DIR"
    
    nohup npm run dev > "$PROJECT_ROOT/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$FRONTEND_PID_FILE"
    
    echo "等待前端服务启动..."
    for i in {1..60}; do
        if curl -s http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
            echo ""
            echo "✓ 前端服务启动成功!"
            echo "  - PID: $FRONTEND_PID"
            echo "  - 端口: $FRONTEND_PORT"
            echo "  - 地址: http://localhost:$FRONTEND_PORT"
            echo "  - 日志: $PROJECT_ROOT/frontend.log"
            return 0
        fi
        sleep 1
        printf "."
    done
    
    echo ""
    echo "❌ 前端服务启动超时，请检查日志: $PROJECT_ROOT/frontend.log"
    exit 1
}

show_status() {
    echo ""
    echo "=========================================="
    echo "  服务状态"
    echo "=========================================="
    echo ""
    
    if [ -f "$BACKEND_PID_FILE" ]; then
        PID=$(cat "$BACKEND_PID_FILE" 2>/dev/null || echo "")
        if [ -n "$PID" ] && kill -0 $PID 2>/dev/null; then
            echo "✓ 后端服务运行中 (PID: $PID, 端口: $BACKEND_PORT)"
        else
            echo "❌ 后端服务已停止"
        fi
    else
        echo "❌ 后端服务未启动"
    fi
    
    if [ -f "$FRONTEND_PID_FILE" ]; then
        PID=$(cat "$FRONTEND_PID_FILE" 2>/dev/null || echo "")
        if [ -n "$PID" ] && kill -0 $PID 2>/dev/null; then
            echo "✓ 前端服务运行中 (PID: $PID, 端口: $FRONTEND_PORT)"
        else
            echo "❌ 前端服务已停止"
        fi
    else
        echo "❌ 前端服务未启动"
    fi
}

show_help() {
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  start   - 启动所有服务 (默认)"
    echo "  stop    - 停止所有服务"
    echo "  restart - 重启所有服务"
    echo "  status  - 显示服务状态"
    echo "  help    - 显示此帮助信息"
    echo ""
    echo "服务信息:"
    echo "  - 后端: 端口 $BACKEND_PORT, PID 文件: $BACKEND_PID_FILE"
    echo "  - 前端: 端口 $FRONTEND_PORT, PID 文件: $FRONTEND_PID_FILE"
}

case "${1:-start}" in
    start)
        check_node
        check_npm
        stop_services
        install_dependencies
        create_data_dir
        start_backend
        start_frontend
        
        echo ""
        echo "=========================================="
        echo "  所有服务已启动成功!"
        echo "=========================================="
        echo ""
        echo "访问地址:"
        echo "  - 前端界面: http://localhost:$FRONTEND_PORT"
        echo "  - 后端 API: http://localhost:$BACKEND_PORT/api"
        echo ""
        echo "管理命令:"
        echo "  - 停止服务: $0 stop"
        echo "  - 重启服务: $0 restart"
        echo "  - 查看状态: $0 status"
        echo ""
        echo "日志文件:"
        echo "  - 后端日志: $PROJECT_ROOT/backend.log"
        echo "  - 前端日志: $PROJECT_ROOT/frontend.log"
        echo ""
        ;;
        
    stop)
        stop_services
        show_status
        ;;
        
    restart)
        check_node
        check_npm
        stop_services
        install_dependencies
        create_data_dir
        start_backend
        start_frontend
        
        echo ""
        echo "=========================================="
        echo "  所有服务已重启成功!"
        echo "=========================================="
        echo ""
        ;;
        
    status)
        show_status
        ;;
        
    help|--help|-h)
        show_help
        ;;
        
    *)
        echo "❌ 未知命令: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
