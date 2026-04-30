#!/bin/bash

# 游戏礼包中心一键启动脚本
# 支持命令: start | stop | restart | status | logs

set +e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_DIR/frontend"
BACKEND_DIR="$PROJECT_DIR/backend"
LOGS_DIR="$PROJECT_DIR/logs"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 停止前端服务
stop_frontend() {
    log_info "停止前端服务..."
    
    if [ -f "$PROJECT_DIR/frontend.pid" ]; then
        FRONTEND_PID=$(cat "$PROJECT_DIR/frontend.pid" 2>/dev/null || true)
        if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
            kill -TERM "$FRONTEND_PID" 2>/dev/null || true
            sleep 1
            if kill -0 "$FRONTEND_PID" 2>/dev/null; then
                kill -9 "$FRONTEND_PID" 2>/dev/null || true
            fi
            log_info "前端服务已停止 (PID: $FRONTEND_PID)"
        else
            log_info "前端服务未运行"
        fi
        rm -f "$PROJECT_DIR/frontend.pid"
    else
        if command_exists lsof; then
            FRONTEND_PID=$(lsof -ti:3000 2>/dev/null || true)
            if [ -n "$FRONTEND_PID" ]; then
                kill -TERM $FRONTEND_PID 2>/dev/null || true
                sleep 1
                kill -9 $FRONTEND_PID 2>/dev/null || true
                log_info "前端服务已停止 (端口 3000)"
            else
                log_info "前端服务未运行"
            fi
        else
            log_info "无法检测前端服务状态"
        fi
    fi
}

# 停止后端服务
stop_backend() {
    log_info "停止后端服务..."
    
    if [ -f "$PROJECT_DIR/backend.pid" ]; then
        BACKEND_PID=$(cat "$PROJECT_DIR/backend.pid" 2>/dev/null || true)
        if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
            kill -TERM "$BACKEND_PID" 2>/dev/null || true
            sleep 1
            if kill -0 "$BACKEND_PID" 2>/dev/null; then
                kill -9 "$BACKEND_PID" 2>/dev/null || true
            fi
            log_info "后端服务已停止 (PID: $BACKEND_PID)"
        else
            log_info "后端服务未运行"
        fi
        rm -f "$PROJECT_DIR/backend.pid"
    else
        if command_exists lsof; then
            BACKEND_PID=$(lsof -ti:3001 2>/dev/null || true)
            if [ -n "$BACKEND_PID" ]; then
                kill -TERM $BACKEND_PID 2>/dev/null || true
                sleep 1
                kill -9 $BACKEND_PID 2>/dev/null || true
                log_info "后端服务已停止 (端口 3001)"
            else
                log_info "后端服务未运行"
            fi
        else
            log_info "无法检测后端服务状态"
        fi
    fi
}

# 停止 Docker 容器
stop_docker() {
    log_info "停止 Docker 容器..."
    
    if command_exists docker; then
        if cd "$PROJECT_DIR" && docker compose ps --format '{{.Name}}' 2>/dev/null | grep -q "game_gift"; then
            cd "$PROJECT_DIR" && docker compose down 2>/dev/null || true
            log_info "Docker 容器已停止"
        else
            log_info "Docker 容器未运行"
        fi
    else
        log_warn "Docker 命令未找到，跳过 Docker 容器操作"
    fi
}

# 停止所有服务
stop_all() {
    log_info "========================================"
    log_info "停止所有服务..."
    log_info "========================================"
    
    stop_frontend
    stop_backend
    stop_docker
    
    log_info "所有服务已停止"
}

# 检查端口状态
check_port() {
    local port=$1
    local name=$2
    
    if command_exists lsof; then
        if lsof -ti:$port >/dev/null 2>&1; then
            log_info "$name 服务运行中 (端口 $port)"
            return 0
        else
            log_warn "$name 服务未运行 (端口 $port)"
            return 1
        fi
    else
        log_warn "无法检查端口状态，请手动确认"
        return 0
    fi
}

# 检查服务状态
check_status() {
    log_info "========================================"
    log_info "服务状态检查"
    log_info "========================================"
    
    echo ""
    check_port 3000 "前端" || true
    check_port 3001 "后端" || true
    
    if command_exists docker; then
        echo ""
        log_info "Docker 容器状态:"
        cd "$PROJECT_DIR" && docker compose ps 2>/dev/null || log_warn "无运行中的 Docker 容器"
    fi
    
    echo ""
    log_info "========================================"
}

# 安装依赖
install_dependencies() {
    log_info "========================================"
    log_info "检查并安装依赖..."
    log_info "========================================"
    
    if ! command_exists node; then
        log_error "Node.js 未安装，请先安装 Node.js (建议 v18+)"
        exit 1
    fi
    
    if ! command_exists npm; then
        log_error "npm 未安装"
        exit 1
    fi
    
    echo ""
    log_info "检查前端依赖..."
    if [ ! -d "$FRONTEND_DIR/node_modules" ] || [ "$FRONTEND_DIR/package.json" -nt "$FRONTEND_DIR/node_modules" ]; then
        log_info "安装/更新前端依赖..."
        (cd "$FRONTEND_DIR" && npm install 2>&1)
        if [ $? -ne 0 ]; then
            log_error "前端依赖安装失败"
            exit 1
        fi
        log_info "前端依赖安装完成"
    else
        log_info "前端依赖已存在且是最新的"
    fi
    
    echo ""
    log_info "检查后端依赖..."
    if [ ! -d "$BACKEND_DIR/node_modules" ] || [ "$BACKEND_DIR/package.json" -nt "$BACKEND_DIR/node_modules" ] || [ ! -d "$BACKEND_DIR/node_modules/tsx" ]; then
        log_info "安装/更新后端依赖..."
        (cd "$BACKEND_DIR" && npm install 2>&1)
        if [ $? -ne 0 ]; then
            log_error "后端依赖安装失败"
            exit 1
        fi
        log_info "后端依赖安装完成"
    else
        log_info "后端依赖已存在且是最新的"
    fi
}

# 启动 Docker 容器
start_docker() {
    log_info "========================================"
    log_info "启动 Docker 容器..."
    log_info "========================================"
    
    if ! command_exists docker; then
        log_error "Docker 未安装，请先安装 Docker 和 Docker Compose"
        exit 1
    fi
    
    log_info "检查 Docker 服务..."
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker 服务未运行，请先启动 Docker"
        exit 1
    fi
    
    log_info "启动 MySQL 和 Adminer 容器..."
    (cd "$PROJECT_DIR" && docker compose up -d 2>&1)
    if [ $? -ne 0 ]; then
        log_error "Docker 容器启动失败"
        exit 1
    fi
    
    log_info "等待 MySQL 初始化..."
    for i in {1..60}; do
        if (cd "$PROJECT_DIR" && docker exec game_gift_mysql mysql -uroot -proot123456 -e "SELECT 1" >/dev/null 2>&1); then
            log_info "MySQL 数据库已就绪"
            break
        fi
        if [ $i -eq 60 ]; then
            log_error "MySQL 启动超时，请检查 Docker 容器日志"
            (cd "$PROJECT_DIR" && docker compose logs mysql 2>&1)
            exit 1
        fi
        sleep 2
        log_info "等待中... ($i/60)"
    done
    
    log_info "Docker 容器启动完成"
}

# 启动后端服务
start_backend() {
    log_info "========================================"
    log_info "启动后端服务..."
    log_info "========================================"
    
    mkdir -p "$LOGS_DIR"
    
    if command_exists lsof && lsof -ti:3001 >/dev/null 2>&1; then
        log_warn "端口 3001 已被占用，先停止现有服务"
        stop_backend
        sleep 1
    fi
    
    log_info "启动后端服务 (端口 3001)..."
    
    cd "$BACKEND_DIR"
    
    log_info "使用 tsx 直接运行 TypeScript..."
    
    nohup npx tsx src/index.ts > "$LOGS_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    
    echo $BACKEND_PID > "$PROJECT_DIR/backend.pid"
    log_info "后端服务启动中 (PID: $BACKEND_PID)..."
    
    log_info "等待后端服务启动..."
    for i in {1..60}; do
        if curl -s http://localhost:3001/health >/dev/null 2>&1; then
            log_info "后端服务启动成功 (PID: $BACKEND_PID)"
            break
        fi
        if [ $i -eq 60 ]; then
            log_error "后端服务启动超时，请检查日志: $LOGS_DIR/backend.log"
            if [ -f "$LOGS_DIR/backend.log" ]; then
                tail -100 "$LOGS_DIR/backend.log"
            fi
            exit 1
        fi
        sleep 1
    done
}

# 启动前端服务
start_frontend() {
    log_info "========================================"
    log_info "启动前端服务..."
    log_info "========================================"
    
    mkdir -p "$LOGS_DIR"
    
    if command_exists lsof && lsof -ti:3000 >/dev/null 2>&1; then
        log_warn "端口 3000 已被占用，先停止现有服务"
        stop_frontend
        sleep 1
    fi
    
    log_info "启动前端服务 (端口 3000)..."
    
    cd "$FRONTEND_DIR"
    
    nohup npm run dev > "$LOGS_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    
    echo $FRONTEND_PID > "$PROJECT_DIR/frontend.pid"
    log_info "前端服务启动中 (PID: $FRONTEND_PID)..."
    
    log_info "等待前端服务启动..."
    for i in {1..90}; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            log_info "前端服务启动成功 (PID: $FRONTEND_PID)"
            break
        fi
        if [ $i -eq 90 ]; then
            log_warn "前端服务启动较慢，请稍候或检查日志: $LOGS_DIR/frontend.log"
            if [ -f "$LOGS_DIR/frontend.log" ]; then
                tail -50 "$LOGS_DIR/frontend.log"
            fi
            break
        fi
        sleep 1
    done
}

# 启动所有服务
start_all() {
    log_info "========================================"
    log_info "游戏礼包中心 - 一键启动"
    log_info "========================================"
    echo ""
    log_info "项目目录: $PROJECT_DIR"
    echo ""
    
    stop_all
    
    echo ""
    log_info "开始启动所有服务..."
    echo ""
    
    install_dependencies
    
    echo ""
    
    start_docker
    
    echo ""
    
    start_backend
    
    echo ""
    
    start_frontend
    
    echo ""
    log_info "========================================"
    log_info "所有服务启动完成！"
    log_info "========================================"
    echo ""
    log_info "访问地址:"
    log_info "  - 前端: http://localhost:3000"
    log_info "  - 后端 API: http://localhost:3001"
    log_info "  - 数据库管理 (Adminer): http://localhost:8080"
    echo ""
    log_info "默认管理员账号:"
    log_info "  - 用户名: admin"
    log_info "  - 密码: admin123456"
    echo ""
    log_info "日志文件:"
    log_info "  - 前端: $LOGS_DIR/frontend.log"
    log_info "  - 后端: $LOGS_DIR/backend.log"
    echo ""
    log_info "PID 文件:"
    log_info "  - 前端 PID: $PROJECT_DIR/frontend.pid"
    log_info "  - 后端 PID: $PROJECT_DIR/backend.pid"
    echo ""
    log_info "使用以下命令管理服务:"
    log_info "  - 停止: ./start.sh stop"
    log_info "  - 重启: ./start.sh restart"
    log_info "  - 状态: ./start.sh status"
    log_info "  - 查看日志: ./start.sh logs [frontend|backend]"
    echo ""
}

# 查看日志
view_logs() {
    local service=$1
    local lines=${2:-100}
    
    case $service in
        frontend)
            log_file="$LOGS_DIR/frontend.log"
            ;;
        backend)
            log_file="$LOGS_DIR/backend.log"
            ;;
        *)
            log_error "请指定服务: frontend 或 backend"
            log_info "用法: ./start.sh logs [frontend|backend] [行数]"
            exit 1
            ;;
    esac
    
    if [ ! -f "$log_file" ]; then
        log_warn "日志文件不存在: $log_file"
        exit 0
    fi
    
    log_info "查看 $service 日志 (最近 $lines 行):"
    echo "----------------------------------------"
    tail -n "$lines" "$log_file"
}

# 主函数
main() {
    local action=${1:-start}
    
    mkdir -p "$LOGS_DIR"
    
    case $action in
        start)
            start_all
            ;;
        stop)
            stop_all
            ;;
        restart)
            log_info "重启所有服务..."
            stop_all
            sleep 2
            start_all
            ;;
        status)
            check_status
            ;;
        logs)
            view_logs "$2" "$3"
            ;;
        help)
            echo "用法: ./start.sh [命令]"
            echo ""
            echo "命令:"
            echo "  start    - 启动所有服务（默认）"
            echo "  stop     - 停止所有服务"
            echo "  restart  - 重启所有服务"
            echo "  status   - 查看服务状态"
            echo "  logs     - 查看日志 (logs [frontend|backend] [行数])"
            echo "  help     - 显示此帮助信息"
            echo ""
            echo "示例:"
            echo "  ./start.sh start"
            echo "  ./start.sh stop"
            echo "  ./start.sh logs backend 50"
            ;;
        *)
            log_error "未知命令: $action"
            log_info "使用 ./start.sh help 查看帮助"
            exit 1
            ;;
    esac
}

main "$@"
