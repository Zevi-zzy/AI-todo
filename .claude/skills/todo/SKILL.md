---
name: todo
description: 操作 Zevi AI to-do 任务（创建/编辑/完成/删除/查询/收纳箱）。当用户要求增删改查待办、标记完成、整理任务、查看待办清单或四象限任务时使用。
---

# Zevi AI to-do 控制技能

通过命令行工具直接读写 Zevi AI to-do 的任务数据（`数据/store.json`），
与网页端共享同一份数据 —— 你改完后，开着的页面会在几秒内自动刷新。

## 运行方式

在项目根目录 `/Users/admin/zevi-todo` 下执行：

```bash
node server/cli.mjs <命令> [参数] [--json]
```

**重要约定：**
- 需要把多条任务/结果回传给自己处理时，**加 `--json`** 拿结构化输出，再解析。
- 展示给用户看时，用**不带 `--json`** 的人类可读输出，或自己整理成中文清单。
- `<id>` 可用：完整 id、**id 唯一前缀**（如 `47b5`）、`#列表序号`（如 `#2`）、或**精确内容文本**。优先用前缀或 id，避免歧义。
- 后端开不开都能用（CLI 直接读写文件）；网页打开时会自动同步。

## 命令速查

### 查询
```bash
node server/cli.mjs list                         # 活动任务（不含收纳箱）
node server/cli.mjs list --status pending|completed|all
node server/cli.mjs list --category work|personal|other
node server/cli.mjs list --priority ui|ni|un|nn
node server/cli.mjs list --view today|week|month|all
node server/cli.mjs list --search 关键词
node server/cli.mjs list --all --json            # 含收纳箱，JSON 输出
node server/cli.mjs get <id>                      # 单个任务详情
node server/cli.mjs archive                       # 逾期收纳箱
node server/cli.mjs stats                         # 等级/积分/数量
```

### 变更
```bash
node server/cli.mjs add "回复客户微信" --priority ui --category work
node server/cli.mjs done <id>                     # 标记完成（+1 积分）
node server/cli.mjs undone <id>                   # 取消完成
node server/cli.mjs update <id> --content "新文案" --priority ni
node server/cli.mjs move <id> --before <id2>      # 排到某任务上方(--after/--top/--bottom)
node server/cli.mjs delete <id>                   # 删除活动任务（不写日志）
node server/cli.mjs restore <id> --reason "重新开始处理"        # 从收纳箱恢复
node server/cli.mjs archive-delete <id> --reason "已不再需要"   # 收纳箱彻底删除
```

## 字段取值

**优先级（四象限）** —— 参数可填全称或别名：
| 别名 | 全称 | 含义 |
|------|------|------|
| `ui` | `urgent-important` | 重要且紧急 |
| `ni` | `not-urgent-important` | 重要不紧急 |
| `un` | `urgent-not-important` | 紧急不重要 |
| `nn` | `not-urgent-not-important` | 不重要不紧急 |

**分类**：`work`(工作) / `personal`(个人) / `other`(其他)。也接受中文「工作/个人/其他」。

**默认值**：`add` 不指定时，优先级=`urgent-important`、分类=`work`（与网页输入框一致）。

## 典型流程

1. 用户说「帮我把今天要做的列一下」→ `list --view today --json`，解析后用中文清单回复。
2. 用户说「加一条：下午三点开会，重要紧急」→ `add "下午三点开会" --priority ui`。
3. 用户说「把写方案那条标完成」→ 先 `list --search 方案 --json` 拿到 id，再 `done <id>`。
4. 改动后可顺带 `stats` 汇报等级/积分变化。

## 注意
- 删除活动任务用 `delete`（不可恢复、不写日志）；收纳箱里的任务才用 `restore`/`archive-delete`，且必须带 `--reason`。
- 批量操作时逐条调用即可；每次调用都是独立的读-改-写，天然串行安全。
