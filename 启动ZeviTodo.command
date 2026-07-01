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

# 自动修复被“拍平”的 .bin 软链接（项目被复制/打包后，软链接常被还原成普通文件，导致 vite 无法启动）
# 判断依据：node_modules/.bin/vite 正常应为软链接，若不是则说明链接已损坏，需重建
if [ -d "node_modules" ] && [ ! -L "node_modules/.bin/vite" ]; then
    echo "🔧 检测到依赖链接异常，正在自动修复 (npm rebuild)..."
    npm rebuild
    if [ $? -ne 0 ] || [ ! -L "node_modules/.bin/vite" ]; then
        echo "⚠️  自动修复未完全成功，正在尝试重新安装依赖..."
        npm install
    fi
fi

# 清理本项目上一次没退干净的残留进程（只清本项目，不动其它程序）
echo "🧹 检查并清理旧进程..."
pkill -f "$DIR/server/server.mjs" 2>/dev/null
pkill -f "$DIR/node_modules/vite" 2>/dev/null
sleep 1

# 端口占用检测：若 3456/5173 仍被占用，尝试释放（仅提示，避免误杀他人进程）
for PORT in 3456 5173; do
    PIDS=$(lsof -nP -iTCP:$PORT -sTCP:LISTEN -t 2>/dev/null)
    if [ -n "$PIDS" ]; then
        # 只清理属于本项目的占用进程
        for P in $PIDS; do
            if ps -p "$P" -o command= 2>/dev/null | grep -q "$DIR"; then
                kill "$P" 2>/dev/null && echo "   已释放端口 $PORT（本项目残留进程 $P）"
            else
                echo "   ⚠️  端口 $PORT 被其它程序占用（PID $P），如启动失败请手动检查。"
            fi
        done
        sleep 1
    fi
done

# 启动本地后端（任务数据 API，落盘到 数据/store.json）
echo "🗂️  启动本地数据服务..."
node server/server.mjs &
SERVER_PID=$!

# 退出时（Ctrl+C 或关闭窗口）一并关掉后端，避免端口残留
cleanup() {
    if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
        kill "$SERVER_PID" 2>/dev/null
    fi
}
trap cleanup EXIT INT TERM

# 启动前端服务
echo "🚀 服务启动中..."
echo "提示：服务启动成功后会自动打开浏览器。"
echo "如果不小心关闭了浏览器，请访问: http://localhost:5173"
echo "按 Ctrl+C 可以停止服务。"
echo "----------------------------------------"

npm run dev

# 如果 npm run dev 异常退出，保持窗口打开以便查看错误
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ 服务异常退出。"
    read -p "按任意键关闭窗口..."
fi
