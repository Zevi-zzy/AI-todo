#!/bin/bash
# Zevi AI to-do Launcher
# 这是一个简单的启动脚本，用于在本地启动 Zevi AI to-do 服务并打开浏览器

# 获取脚本所在目录
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "正在启动 Zevi AI to-do..."

# 检查 node_modules 是否存在，如果不存在则安装依赖
if [ ! -d "node_modules" ]; then
    echo "首次运行，正在安装依赖..."
    npm install
fi

# 在后台启动开发服务器
# 使用 nohup 让它在终端关闭后继续运行（可选，这里为了简单直接前台运行或者新窗口）
# 这里我们选择打开一个新的终端窗口来运行服务，或者直接在当前窗口运行

# 检查端口 5173 是否被占用，如果没有则使用 5173，否则 Vite 会自动选择下一个
# 我们直接运行 npm run dev，Vite 会处理端口

# 打开浏览器 (等待几秒让服务启动)
(sleep 3 && open http://localhost:5174) &

# 启动服务
echo "服务已启动！按 Ctrl+C 停止服务。"
npm run dev
