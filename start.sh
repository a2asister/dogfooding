#!/bin/bash

echo "========================================"
echo "   RMS 分布式研发资产管理系统"
echo "   Research Management System"
echo "========================================"
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到 Node.js，请先安装 Node.js (https://nodejs.org/)"
    exit 1
fi

echo "[信息] Node.js 已安装"
echo "[信息] Node 版本: $(node --version)"
echo ""

echo "========================================"
echo "   步骤 1: 安装后端依赖"
echo "========================================"
echo ""

cd backend
if [ ! -d "node_modules" ]; then
    echo "[信息] 正在安装后端依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[错误] 后端依赖安装失败"
        cd ..
        exit 1
    fi
    echo "[信息] 后端依赖安装完成"
else
    echo "[信息] 后端依赖已存在，跳过安装"
fi

cd ..

echo ""
echo "========================================"
echo "   步骤 2: 安装前端依赖"
echo "========================================"
echo ""

cd frontend
if [ ! -d "node_modules" ]; then
    echo "[信息] 正在安装前端依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[错误] 前端依赖安装失败"
        cd ..
        exit 1
    fi
    echo "[信息] 前端依赖安装完成"
else
    echo "[信息] 前端依赖已存在，跳过安装"
fi

cd ..

echo ""
echo "========================================"
echo "   步骤 3: 启动服务"
echo "========================================"
echo ""

echo "[信息] 正在启动后端服务 (端口 3000)..."
cd backend
node server.js &
BACKEND_PID=$!
cd ..

echo "[信息] 正在启动前端服务 (端口 5173)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "   启动完成！"
echo "========================================"
echo ""
echo "[信息] 后端服务地址: http://localhost:3000"
echo "[信息] 前端服务地址: http://localhost:5173"
echo ""
echo "[信息] 测试账号:"
echo "       管理员: admin / admin123"
echo "       开发人员: dev / dev123"
echo "       测试人员: tester / tester123"
echo "       项目经理: manager / manager123"
echo ""
echo "[提示] 按 Ctrl+C 可以停止服务"
echo ""

# 等待用户中断
trap "echo ''; echo '[信息] 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '[信息] 服务已停止'; exit 0" SIGINT SIGTERM

wait
