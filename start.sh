#!/bin/bash

# 项目风险全链路管控系统一键启动脚本
# 适用于 Linux/Unix 环境

echo "========================================"
echo "  项目风险全链路管控系统"
echo "  Project Risk Management System"
echo "========================================"
echo ""

# 检查 Node.js 是否安装
echo "🔍 检查 Node.js 环境..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未检测到 Node.js，请先安装 Node.js"
    echo "   下载地址: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js 版本: $NODE_VERSION"

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未检测到 npm"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm 版本: $NPM_VERSION"
echo ""

# 项目目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# 安装后端依赖
echo "📦 安装后端依赖..."
cd "$BACKEND_DIR"
if [ ! -d "node_modules" ]; then
    echo "   正在安装依赖，请稍候..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 后端依赖安装失败"
        exit 1
    fi
    echo "✅ 后端依赖安装完成"
else
    echo "✅ 后端依赖已存在，跳过安装"
fi
echo ""

# 安装前端依赖
echo "📦 安装前端依赖..."
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
    echo "   正在安装依赖，请稍候..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 前端依赖安装失败"
        exit 1
    fi
    echo "✅ 前端依赖安装完成"
else
    echo "✅ 前端依赖已存在，跳过安装"
fi
echo ""

# 创建日志目录
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"

# 启动后端服务
echo "🚀 启动后端服务 (端口: 3000)..."
cd "$BACKEND_DIR"
nohup npm start > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo "✅ 后端服务已启动，PID: $BACKEND_PID"
echo "   日志文件: $LOG_DIR/backend.log"

# 等待后端服务启动
echo "   等待后端服务初始化..."
sleep 3

# 启动前端服务
echo "🚀 启动前端服务 (端口: 5173)..."
cd "$FRONTEND_DIR"
nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "✅ 前端服务已启动，PID: $FRONTEND_PID"
echo "   日志文件: $LOG_DIR/frontend.log"

# 保存 PID 到文件
echo "$BACKEND_PID" > "$SCRIPT_DIR/backend.pid"
echo "$FRONTEND_PID" > "$SCRIPT_DIR/frontend.pid"

# 等待服务启动
echo "   等待服务完全启动..."
sleep 5

echo ""
echo "========================================"
echo "  系统启动完成！"
echo "========================================"
echo ""
echo "🌐 访问地址:"
echo "   前端应用: http://localhost:5173"
echo "   后端 API: http://localhost:3000"
echo ""
echo "📋 功能模块:"
echo "   - 仪表盘: 项目风险概览"
echo "   - 项目管理: 管理项目信息"
echo "   - 风险预警: 多维度风险识别"
echo "   - 风险报告: 自动生成风险报告"
echo "   - 规则库: 自定义风险规则"
echo "   - 整改管理: 风险整改闭环"
echo ""
echo "📁 日志目录: $LOG_DIR"
echo ""
echo "⚠️  停止服务命令:"
echo "   停止后端: kill $BACKEND_PID"
echo "   停止前端: kill $FRONTEND_PID"
echo "   或运行 stop.sh 脚本"
echo ""
echo "========================================"
