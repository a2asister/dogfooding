#!/bin/bash

PROJECT_DIR=$(cd "$(dirname "$0")" && pwd)
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

BACKEND_PORT=3000
FRONTEND_PORT=5173

echo "========================================"
echo "      动物园管理大屏系统启动脚本"
echo "========================================"
echo ""

check_node() {
    if ! command -v node &> /dev/null; then
        echo "❌ 错误: 未检测到 Node.js，请先安装 Node.js"
        echo "   下载地址: https://nodejs.org/"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ 错误: 未检测到 npm，请重新安装 Node.js"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    echo "✅ 检测到 Node.js 版本: $NODE_VERSION"
    echo ""
}

check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    fi
    return 1
}

kill_port() {
    local port=$1
    local pid=$(lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null)
    if [ -n "$pid" ]; then
        echo "   正在关闭端口 $port 上的进程..."
        kill -9 $pid 2>/dev/null
    fi
}

install_dependencies() {
    echo "📦 检查并安装依赖..."
    
    if [ -d "$BACKEND_DIR/node_modules" ]; then
        echo "   后端依赖已存在"
    else
        echo "   正在安装后端依赖..."
        cd "$BACKEND_DIR" && npm install --silent
        echo "   后端依赖安装完成"
    fi
    
    if [ -d "$FRONTEND_DIR/node_modules" ]; then
        echo "   前端依赖已存在"
    else
        echo "   正在安装前端依赖..."
        cd "$FRONTEND_DIR" && npm install --silent
        echo "   前端依赖安装完成"
    fi
    
    echo ""
}

start_backend() {
    echo "🖥️  启动后端服务 (端口: $BACKEND_PORT)..."
    
    if check_port $BACKEND_PORT; then
        kill_port $BACKEND_PORT
        sleep 1
    fi
    
    cd "$BACKEND_DIR"
    nohup npm start > "$PROJECT_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    
    echo "   后端服务启动中，PID: $BACKEND_PID"
    echo "   日志文件: $PROJECT_DIR/backend.log"
    
    for i in {1..15}; do
        if check_port $BACKEND_PORT; then
            echo "✅ 后端服务启动成功!"
            echo "   API 地址: http://localhost:$BACKEND_PORT/api"
            return 0
        fi
        sleep 1
        if [ $((i % 5)) -eq 0 ]; then
            echo "   等待后端服务启动... (${i}s)"
        fi
    done
    
    echo "❌ 后端服务启动超时，请检查日志: $PROJECT_DIR/backend.log"
    return 1
}

start_frontend() {
    echo "🌐 启动前端服务 (端口: $FRONTEND_PORT)..."
    
    if check_port $FRONTEND_PORT; then
        kill_port $FRONTEND_PORT
        sleep 1
    fi
    
    cd "$FRONTEND_DIR"
    nohup npm run dev > "$PROJECT_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    
    echo "   前端服务启动中，PID: $FRONTEND_PID"
    echo "   日志文件: $PROJECT_DIR/frontend.log"
    
    for i in {1..20}; do
        if check_port $FRONTEND_PORT; then
            echo "✅ 前端服务启动成功!"
            return 0
        fi
        sleep 1
        if [ $((i % 5)) -eq 0 ]; then
            echo "   等待前端服务启动... (${i}s)"
        fi
    done
    
    echo "❌ 前端服务启动超时，请检查日志: $PROJECT_DIR/frontend.log"
    return 1
}

save_pids() {
    echo "$BACKEND_PID" > "$PROJECT_DIR/.backend.pid"
    echo "$FRONTEND_PID" > "$PROJECT_DIR/.frontend.pid"
}

show_info() {
    echo ""
    echo "========================================"
    echo "           🎉 系统启动完成!"
    echo "========================================"
    echo ""
    echo "📊 访问地址:"
    echo "   前端大屏: http://localhost:$FRONTEND_PORT"
    echo "   后端 API: http://localhost:$BACKEND_PORT/api"
    echo ""
    echo "👤 默认账户:"
    echo "   管理员: admin / admin123"
    echo "   安保人员: security / security123"
    echo "   饲养员: keeper / keeper123"
    echo ""
    echo "📝 日志文件:"
    echo "   后端日志: $PROJECT_DIR/backend.log"
    echo "   前端日志: $PROJECT_DIR/frontend.log"
    echo "   系统日志: $PROJECT_DIR/backend/logs/"
    echo ""
    echo "🛑 停止服务:"
    echo "   按 Ctrl+C 退出此脚本"
    echo "   或执行: pkill -f 'node.*(backend|frontend)'"
    echo ""
    echo "========================================"
}

cleanup() {
    echo ""
    echo "🛑 正在停止服务..."
    
    if [ -f "$PROJECT_DIR/.backend.pid" ]; then
        PID=$(cat "$PROJECT_DIR/.backend.pid" 2>/dev/null)
        if [ -n "$PID" ] && kill -0 $PID 2>/dev/null; then
            kill $PID 2>/dev/null
            echo "   后端服务已停止 (PID: $PID)"
        fi
        rm -f "$PROJECT_DIR/.backend.pid"
    fi
    
    if [ -f "$PROJECT_DIR/.frontend.pid" ]; then
        PID=$(cat "$PROJECT_DIR/.frontend.pid" 2>/dev/null)
        if [ -n "$PID" ] && kill -0 $PID 2>/dev/null; then
            kill $PID 2>/dev/null
            echo "   前端服务已停止 (PID: $PID)"
        fi
        rm -f "$PROJECT_DIR/.frontend.pid"
    fi
    
    kill_port $BACKEND_PORT
    kill_port $FRONTEND_PORT
    
    rm -f "$PROJECT_DIR/backend.log" "$PROJECT_DIR/frontend.log"
    
    echo "✅ 所有服务已停止"
    exit 0
}

trap cleanup SIGINT SIGTERM

check_node

echo "🔧 正在准备启动..."
echo "   项目目录: $PROJECT_DIR"
echo ""

install_dependencies

start_backend
if [ $? -ne 0 ]; then
    echo "❌ 后端服务启动失败"
    exit 1
fi

echo ""

start_frontend
if [ $? -ne 0 ]; then
    echo "❌ 前端服务启动失败"
    echo "   正在停止后端服务..."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

save_pids
show_info

echo "⏳ 监控服务状态中... (按 Ctrl+C 停止)"
echo ""

while true; do
    sleep 3
    
    BACKEND_OK=0
    FRONTEND_OK=0
    
    if check_port $BACKEND_PORT; then
        BACKEND_OK=1
    fi
    
    if check_port $FRONTEND_PORT; then
        FRONTEND_OK=1
    fi
    
    if [ $BACKEND_OK -eq 0 ] || [ $FRONTEND_OK -eq 0 ]; then
        echo ""
        echo "⚠️  服务异常:"
        [ $BACKEND_OK -eq 0 ] && echo "   ❌ 后端服务已停止"
        [ $FRONTEND_OK -eq 0 ] && echo "   ❌ 前端服务已停止"
        echo "   正在停止所有服务..."
        cleanup
    fi
done
