#!/bin/bash

# 家庭局域网管理系统一键启动脚本
# 适用于 macOS 和 Linux

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
PID_FILE="$SCRIPT_DIR/.server_pids"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  家庭局域网管理系统启动脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查 Node.js 是否安装
check_node() {
    if command -v node &> /dev/null; then
        echo -e "${GREEN}✓ Node.js 已安装: $(node --version)${NC}"
        return 0
    else
        echo -e "${RED}✗ Node.js 未安装${NC}"
        echo -e "${YELLOW}请先安装 Node.js (推荐 v18+)${NC}"
        echo -e "${YELLOW}下载地址: https://nodejs.org/${NC}"
        exit 1
    fi
}

# 检查 npm 是否安装
check_npm() {
    if command -v npm &> /dev/null; then
        echo -e "${GREEN}✓ npm 已安装: $(npm --version)${NC}"
        return 0
    else
        echo -e "${RED}✗ npm 未安装${NC}"
        exit 1
    fi
}

# 安装后端依赖
install_backend_deps() {
    echo ""
    echo -e "${YELLOW}正在检查后端依赖...${NC}"
    cd "$BACKEND_DIR"
    
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✓ 后端依赖已存在${NC}"
    else
        echo -e "${YELLOW}正在安装后端依赖...${NC}"
        npm install
        echo -e "${GREEN}✓ 后端依赖安装完成${NC}"
    fi
}

# 安装前端依赖
install_frontend_deps() {
    echo ""
    echo -e "${YELLOW}正在检查前端依赖...${NC}"
    cd "$FRONTEND_DIR"
    
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✓ 前端依赖已存在${NC}"
    else
        echo -e "${YELLOW}正在安装前端依赖...${NC}"
        npm install
        echo -e "${GREEN}✓ 前端依赖安装完成${NC}"
    fi
}

# 启动后端服务器
start_backend() {
    echo ""
    echo -e "${YELLOW}正在启动后端服务器...${NC}"
    cd "$BACKEND_DIR"
    
    # 检查是否已有进程在运行
    if [ -f "$PID_FILE" ]; then
        BACKEND_PID=$(grep "backend" "$PID_FILE" | awk '{print $2}')
        if [ ! -z "$BACKEND_PID" ] && kill -0 $BACKEND_PID 2>/dev/null; then
            echo -e "${YELLOW}后端服务器已在运行 (PID: $BACKEND_PID)${NC}"
            return
        fi
    fi
    
    # 启动后端服务器（后台运行）
    nohup npm start > "$SCRIPT_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    
    # 保存 PID
    echo "backend $BACKEND_PID" >> "$PID_FILE"
    
    # 等待服务器启动
    sleep 2
    
    # 检查是否启动成功
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${GREEN}✓ 后端服务器已启动 (PID: $BACKEND_PID)${NC}"
        echo -e "${GREEN}  地址: http://localhost:3000${NC}"
    else
        echo -e "${RED}✗ 后端服务器启动失败${NC}"
        echo -e "${YELLOW}请查看日志: $SCRIPT_DIR/backend.log${NC}"
        exit 1
    fi
}

# 启动前端服务器
start_frontend() {
    echo ""
    echo -e "${YELLOW}正在启动前端开发服务器...${NC}"
    cd "$FRONTEND_DIR"
    
    # 检查是否已有进程在运行
    if [ -f "$PID_FILE" ]; then
        FRONTEND_PID=$(grep "frontend" "$PID_FILE" | awk '{print $2}')
        if [ ! -z "$FRONTEND_PID" ] && kill -0 $FRONTEND_PID 2>/dev/null; then
            echo -e "${YELLOW}前端服务器已在运行 (PID: $FRONTEND_PID)${NC}"
            return
        fi
    fi
    
    # 启动前端服务器（后台运行）
    nohup npm run dev > "$SCRIPT_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    
    # 保存 PID
    echo "frontend $FRONTEND_PID" >> "$PID_FILE"
    
    # 等待服务器启动
    sleep 3
    
    # 检查是否启动成功
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${GREEN}✓ 前端开发服务器已启动 (PID: $FRONTEND_PID)${NC}"
        echo -e "${GREEN}  地址: http://localhost:5173${NC}"
    else
        echo -e "${RED}✗ 前端服务器启动失败${NC}"
        echo -e "${YELLOW}请查看日志: $SCRIPT_DIR/frontend.log${NC}"
        exit 1
    fi
}

# 停止所有服务
stop_services() {
    echo ""
    echo -e "${YELLOW}正在停止所有服务...${NC}"
    
    if [ -f "$PID_FILE" ]; then
        while read -r line; do
            SERVICE=$(echo "$line" | awk '{print $1}')
            PID=$(echo "$line" | awk '{print $2}')
            
            if [ ! -z "$PID" ] && kill -0 $PID 2>/dev/null; then
                kill $PID 2>/dev/null || true
                echo -e "${GREEN}✓ 已停止 $SERVICE (PID: $PID)${NC}"
            fi
        done < "$PID_FILE"
        
        rm -f "$PID_FILE"
    else
        echo -e "${YELLOW}没有正在运行的服务${NC}"
    fi
    
    echo ""
}

# 显示状态
show_status() {
    echo ""
    echo -e "${GREEN}服务状态:${NC}"
    echo ""
    
    if [ -f "$PID_FILE" ]; then
        while read -r line; do
            SERVICE=$(echo "$line" | awk '{print $1}')
            PID=$(echo "$line" | awk '{print $2}')
            
            if [ ! -z "$PID" ] && kill -0 $PID 2>/dev/null; then
                if [ "$SERVICE" = "backend" ]; then
                    echo -e "${GREEN}  ● 后端服务器: 运行中 (PID: $PID)${NC}"
                    echo -e "${GREEN}    地址: http://localhost:3000${NC}"
                elif [ "$SERVICE" = "frontend" ]; then
                    echo -e "${GREEN}  ● 前端服务器: 运行中 (PID: $PID)${NC}"
                    echo -e "${GREEN}    地址: http://localhost:5173${NC}"
                fi
            fi
        done < "$PID_FILE"
    else
        echo -e "${YELLOW}  没有正在运行的服务${NC}"
    fi
    echo ""
}

# 显示帮助
show_help() {
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  start    - 启动所有服务 (默认)"
    echo "  stop     - 停止所有服务"
    echo "  restart  - 重启所有服务"
    echo "  status   - 显示服务状态"
    echo "  install  - 仅安装依赖，不启动服务"
    echo "  help     - 显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0           # 安装依赖并启动所有服务"
    echo "  $0 stop      # 停止所有服务"
    echo "  $0 restart   # 重启所有服务"
    echo ""
}

# 主逻辑
case "${1:-start}" in
    start)
        # 检查环境
        check_node
        check_npm
        
        # 安装依赖
        install_backend_deps
        install_frontend_deps
        
        # 启动服务
        start_backend
        start_frontend
        
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}  所有服务已启动成功!${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        echo -e "${GREEN}后端 API:  http://localhost:3000${NC}"
        echo -e "${GREEN}前端界面:  http://localhost:5173${NC}"
        echo ""
        echo -e "${YELLOW}日志文件:${NC}"
        echo -e "${YELLOW}  后端: $SCRIPT_DIR/backend.log${NC}"
        echo -e "${YELLOW}  前端: $SCRIPT_DIR/frontend.log${NC}"
        echo ""
        echo -e "${YELLOW}停止服务命令: ./start.sh stop${NC}"
        echo ""
        ;;
    
    stop)
        stop_services
        ;;
    
    restart)
        stop_services
        check_node
        check_npm
        install_backend_deps
        install_frontend_deps
        start_backend
        start_frontend
        
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}  所有服务已重启成功!${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        ;;
    
    status)
        show_status
        ;;
    
    install)
        check_node
        check_npm
        install_backend_deps
        install_frontend_deps
        echo ""
        echo -e "${GREEN}✓ 依赖安装完成${NC}"
        echo ""
        ;;
    
    help)
        show_help
        ;;
    
    *)
        echo -e "${RED}未知命令: $1${NC}"
        show_help
        exit 1
        ;;
esac
