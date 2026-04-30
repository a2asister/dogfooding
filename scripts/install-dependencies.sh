#!/bin/bash

echo "=========================================="
echo "正在安装项目依赖..."
echo "=========================================="

# 检查 node 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装 Node.js"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 请先安装 npm"
    exit 1
fi

echo "📦 安装后端依赖..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ 后端依赖安装失败"
    exit 1
fi
echo "✅ 后端依赖安装成功"

echo ""
echo "📦 安装前端依赖..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ 前端依赖安装失败"
    exit 1
fi
echo "✅ 前端依赖安装成功"

echo ""
echo "=========================================="
echo "✅ 所有依赖安装完成！"
echo "=========================================="
