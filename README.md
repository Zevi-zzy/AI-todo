# Zevi AI to-do



**Zevi AI to-do** 是一款基于四象限法则（艾森豪威尔矩阵）的本地化个人任务管理工具。它结合了现代 Web 技术与极简设计，帮助用户高效地管理日常事务，同时确保数据的绝对隐私和安全。

## 🎯 核心特色

- **四象限管理**：将任务智能分类为“重要紧急”、“重要不紧急”、“紧急不重要”和“不重要不紧急”，助您聚焦关键事务。
- **🛡️ 隐私优先**：所有数据均存储在本机文件（`数据/store.json`）中，配套一个仅监听本地回环地址的轻量后端，无需联网、无需注册，数据完全掌握在您手中。
- **🤖 Agent 控制（CLI）**：内置命令行工具，可让 AI Agent 直接增删改查任务；与网页共享同一份数据，Agent 一改，打开的页面几秒内自动刷新。详见下方「🤖 Agent 控制 / 命令行（CLI）」一节。
- **✨ AI 智能优化**：内置 AI 魔法棒功能（需配置 Key），可一键优化任务描述，使其更清晰、更具行动导向。
- **🗃️ 逾期收纳箱**：未完成任务若“最后编辑时间”超过 14 天会自动收纳；支持一键恢复或彻底删除（删除需填写原因，原因会写入本地删除记录并随备份导出）。
- **📘 使用手册**：右上角一键打开常用操作说明（创建/编辑/拖拽/筛选/备份/收纳箱等）。

![AI 智能优化演示](./public/ai-demo.png)

- **📝 便捷编辑**：支持点击任务卡片直接编辑，回车快速保存。
- **💾 数据备份**：支持一键导出/导入数据（JSON格式），轻松迁移或备份您的任务。
- **🎮 游戏化体验**：完成任务可获得经验值并升级，让任务管理变得更有趣。
- **🚀 极速启动**：提供便携式启动脚本，内置运行环境，双击即用，无需繁琐配置。

## 🛠️ 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **样式方案**：Tailwind CSS
- **状态管理**：Zustand
- **图标库**：Lucide React
- **本地数据后端**：Node 原生 `http`（零额外依赖），数据落盘为 `数据/store.json`
- **Agent 接口**：命令行 CLI（`server/cli.mjs`）+ Claude Code Skill（`.claude/skills/todo`）

## 🚀 快速开始

本项目为纯前端应用（Vite + React）。在 GitHub 源码仓库中默认不包含 Node 运行时，请先安装 Node.js（建议使用 LTS 版本）。

### 方式一：一键启动（推荐）

1.  下载本项目代码。
2.  找到项目根目录下的 **`启动ZeviTodo.command`** 文件。
3.  双击运行该脚本。
4.  脚本会自动启动服务并打开默认浏览器。

### 方式二：手动运行（适用于开发者）

如果您已安装 Node.js 环境，也可以通过命令行运行。注意本项目已改为**文件后端**，网页需要配套的本地数据服务，请开两个终端分别启动：

```bash
# 安装依赖
npm install

# 终端 1：启动本地数据后端（提供任务读写 API，落盘到 数据/store.json）
npm run server

# 终端 2：启动前端开发服务器
npm run dev
```

> 一键启动脚本 `启动ZeviTodo.command` 会自动同时拉起后端与前端，并在退出时清理进程，无需手动开两个终端。

## 🔐 AI Key 配置

AI 优化功能需要配置 DeepSeek Key：

1.  复制 `.env.example` 为 `.env`
2.  在 `.env` 中填写：
    - `VITE_DEEPSEEK_API_KEY=你的Key`

提示：`.env` 不应提交到 GitHub。

## 📖 使用指南

1.  **创建任务**：在对应象限点击“+”号，输入任务内容并回车。
2.  **AI 优化**：输入内容后点击右侧的“魔法棒”图标，AI 将为您优化任务描述。
3.  **拖拽排序**：支持在象限内或跨象限拖拽任务，系统会自动调整优先级。
4.  **完成任务**：点击任务卡片即可标记完成。
5.  **逾期收纳箱**：右上角“收纳箱”图标打开；可恢复或彻底删除（删除需填写原因）。
6.  **使用手册**：右上角“书本”图标打开。

## 🤖 Agent 控制 / 命令行（CLI）

除了网页操作，本项目提供一个命令行工具，让 **AI Agent 或你本人**在终端里直接管理任务。CLI 直接读写数据文件 `数据/store.json`，**与网页共享同一份数据**——所以：

- Agent / 命令行改动后，打开着的网页会在几秒内自动刷新（轮询 + 窗口聚焦刷新）。
- **后端开不开都能用**：CLI 走文件级读写，即使没启动网页服务也能操作。
- 与网页共用同一套业务规则（自动归档、积分、等级），行为完全一致。

### 数据架构

```
数据/store.json   ← 唯一数据源（任务 / 积分 / 删除·恢复日志）
      ↑     ↑
      │     └── 本地后端 API (server/server.mjs) ──→ 网页（读写 + 自动刷新）
      └───────── 命令行 CLI (server/cli.mjs) ───────→ 直接读写（Agent 用）
```

> 首次以文件后端启动时，会自动把旧版浏览器 LocalStorage 中的数据迁移到 `store.json`。

### 用法

在项目根目录执行：

```bash
node server/cli.mjs <命令> [参数] [--json]
# 也可用 npm 脚本：npm run todo -- <命令> ...
```

给结果加 `--json` 可得到结构化输出，便于 Agent 解析；不加则为人类可读格式。

### 查询命令

| 命令 | 说明 |
| --- | --- |
| `list` | 列出活动任务（默认不含收纳箱） |
| `list --status pending\|completed\|all` | 按状态筛选 |
| `list --category work\|personal\|other` | 按分类筛选 |
| `list --priority ui\|ni\|un\|nn` | 按象限筛选 |
| `list --view today\|week\|month\|all` | 按时间视图筛选 |
| `list --search 关键词` | 按内容搜索 |
| `list --all` | 包含收纳箱内的任务 |
| `get <id>` | 查看单个任务详情 |
| `archive` | 列出逾期收纳箱里的任务 |
| `stats` | 查看等级 / 积分 / 数量统计 |

### 变更命令

| 命令 | 说明 |
| --- | --- |
| `add "<内容>" [--priority ui] [--category work]` | 新建任务（默认 `重要且紧急 / 工作`） |
| `done <id>` | 标记完成（+1 积分） |
| `undone <id>` | 取消完成（-1 积分） |
| `update <id> [--content ...] [--priority ...] [--category ...]` | 修改任务 |
| `move <id> --before <id2>\|--after <id2>\|--top\|--bottom` | 调整任务在象限内的显示顺序 |
| `delete <id>` | 直接删除活动任务（不写日志） |
| `restore <id> --reason "..."` | 从收纳箱恢复（须填理由） |
| `archive-delete <id> --reason "..."` | 从收纳箱彻底删除（写删除日志） |

### 参数取值

**优先级（四象限）**——全称或别名均可：

| 别名 | 全称 | 含义 |
| --- | --- | --- |
| `ui` | `urgent-important` | 重要且紧急 |
| `ni` | `not-urgent-important` | 重要不紧急 |
| `un` | `urgent-not-important` | 紧急不重要 |
| `nn` | `not-urgent-not-important` | 不重要不紧急 |

**分类**：`work`（工作） / `personal`（个人） / `other`（其他），也接受中文「工作 / 个人 / 其他」。

**任务标识 `<id>`**：可用完整 id、**id 唯一前缀**（如 `47b5`）、`#列表序号`（如 `#2`）或**精确内容文本**。建议优先用前缀或完整 id，避免歧义。

### 示例

```bash
# 新建一条重要且紧急的工作任务
node server/cli.mjs add "回复客户微信" --priority ui --category work

# 查今天要做的，拿 JSON 给 Agent 解析
node server/cli.mjs list --view today --json

# 标记完成（用 id 前缀）
node server/cli.mjs done 47b5

# 把某任务排到另一条上方
node server/cli.mjs move 47b5 --before 9aa5

# 查看等级和积分
node server/cli.mjs stats
```

### 在 Claude Code 中使用（Skill）

项目内置 `/todo` 技能（`.claude/skills/todo/SKILL.md`）。在 Claude Code 里直接用自然语言即可，例如：

> “加一条：下午三点开会，重要紧急” → Agent 自动执行 `add "下午三点开会" --priority ui`
>
> “把写方案那条标完成” → Agent 先 `list --search 方案 --json` 拿到 id，再 `done <id>`

## 📄 许可证

MIT License

## 📮 联系方式

如果您有任何问题或建议，欢迎联系：zevi1102@163.com
