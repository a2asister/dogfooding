#!/bin/bash

node_processes=$(pgrep -l "node")

if [ -z "$node_processes" ]; then
    echo -e "\033[32m没有找到正在运行的 Node.js 进程\033[0m"
    exit 0
fi

count=$(echo "$node_processes" | wc -l)
echo -e "\033[33m找到 $count 个正在运行的 Node.js 进程：\033[0m"
echo "$node_processes"

read -p "是否确认停止所有 Node.js 进程？(Y/N) " confirm

if [ "$confirm" = "Y" ] || [ "$confirm" = "y" ] || [ "$confirm" = "yes" ]; then
    pkill -9 node
    echo -e "\033[32m已停止所有 Node.js 进程\033[0m"
else
    echo -e "\033[90m已取消操作\033[0m"
fi
