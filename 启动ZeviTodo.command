#!/bin/bash
# Zevi AI to-do Launcher

# 尝试加载用户环境变量
if [ -f "$HOME/.zshrc" ]; then
    source "$HOME/.zshrc" >/dev/null 2>&1
elif [ -f "$HOME/.bash_profile" ]; then
    source "$HOME/.bash_profile" >/dev/null 2>&1
fi

# 手动添加常见的 Node 安装路径，防止环境变量未加载
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin

# 获取脚本所在目录
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# 优先使用项目内置的本地 Node.js 环境
if [ -d "$DIR/local_node/bin" ]; then
    export PATH="$DIR/local_node/bin:$PATH"
fi

echo "========================================"
echo "      正在启动 Zevi AI to-do..."
echo "========================================"

# 检查 node 是否可用
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js 环境。"
    echo "请确保您已安装 Node.js (https://nodejs.org/)"
    echo "或者尝试在终端中手动运行此脚本。"
    read -p "按任意键退出..."
    exit 1
fi

echo "✅ Node.js 环境检测通过: $(node -v)"

# 检查 node_modules 是否存在，如果不存在则安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败，请检查网络或配置。"
        read -p "按任意键退出..."
        exit 1
    fi
fi

# 启动服务
echo "🚀 服务启动中..."
echo "提示：服务启动成功后会自动打开浏览器。"
echo "如果不小心关闭了浏览器，请访问: http://localhost:5174"
echo "按 Ctrl+C 可以停止服务。"
echo "----------------------------------------"

npm run dev

# 如果 npm run dev 异常退出，保持窗口打开以便查看错误
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ 服务异常退出。"
    read -p "按任意键关闭窗口..."
fi
