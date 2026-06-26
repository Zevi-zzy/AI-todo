#!/usr/bin/env node
// Zevi AI to-do · 命令行（供 Agent 直接增删改查任务）
// 直接读写 数据/store.json，无需后端在运行。与网页共享同一份数据。
import { loadState, saveState, mutate } from './store.mjs';
import * as domain from './domain.mjs';
import { PRIORITY_LABELS, CATEGORY_LABELS, PRIORITIES, CATEGORIES, VIEWS } from './domain.mjs';

// —— 参数解析 ——
const argv = process.argv.slice(2);
const cmd = argv[0];
const rest = argv.slice(1);
const flags = {};
const positionals = [];
for (let i = 0; i < rest.length; i++) {
  const a = rest[i];
  if (a.startsWith('--')) {
    const key = a.slice(2);
    const next = rest[i + 1];
    if (next === undefined || next.startsWith('--')) {
      flags[key] = true;
    } else {
      flags[key] = next;
      i++;
    }
  } else {
    positionals.push(a);
  }
}
const JSON_OUT = flags.json === true;

// 优先级别名，方便 Agent / 人类输入
const PRIORITY_ALIASES = {
  ui: 'urgent-important', '11': 'urgent-important', 重要紧急: 'urgent-important', 重要且紧急: 'urgent-important',
  ni: 'not-urgent-important', '01': 'not-urgent-important', 重要不紧急: 'not-urgent-important',
  un: 'urgent-not-important', '10': 'urgent-not-important', 紧急不重要: 'urgent-not-important',
  nn: 'not-urgent-not-important', '00': 'not-urgent-not-important', 不重要不紧急: 'not-urgent-not-important',
};
function resolvePriority(v) {
  if (v === undefined) return undefined;
  if (PRIORITIES.includes(v)) return v;
  if (PRIORITY_ALIASES[v]) return PRIORITY_ALIASES[v];
  fail(`priority 非法: ${v}（可用: ${PRIORITIES.join(', ')} 或别名 ui/ni/un/nn）`);
}
function resolveCategory(v) {
  if (v === undefined) return undefined;
  if (CATEGORIES.includes(v)) return v;
  const map = { 工作: 'work', 个人: 'personal', 其他: 'other' };
  if (map[v]) return map[v];
  fail(`category 非法: ${v}（可用: ${CATEGORIES.join(', ')}）`);
}

function fail(msg) {
  if (JSON_OUT) console.log(JSON.stringify({ ok: false, error: msg }));
  else console.error('✗ ' + msg);
  process.exit(1);
}

const shortId = (id) => id.slice(0, 8);
function fmtTask(t, idx) {
  const box = t.status === 'completed' ? '[✓]' : '[ ]';
  const arc = t.isArchived ? ' 🗃️收纳' : '';
  const n = idx !== undefined ? `#${idx + 1} ` : '';
  return `${n}${box} ${shortId(t.id)}  ${PRIORITY_LABELS[t.priority]}/${CATEGORY_LABELS[t.category]}  ${t.content}${arc}`;
}

function printTasks(list) {
  if (JSON_OUT) {
    console.log(JSON.stringify({ ok: true, count: list.length, tasks: list }, null, 2));
    return;
  }
  if (list.length === 0) {
    console.log('（无匹配任务）');
    return;
  }
  list.forEach((t, i) => console.log(fmtTask(t, i)));
  console.log(`\n共 ${list.length} 条`);
}

function printOne(task, label) {
  if (JSON_OUT) {
    console.log(JSON.stringify({ ok: true, task }, null, 2));
    return;
  }
  console.log(`✓ ${label}`);
  if (task) console.log('  ' + fmtTask(task));
}

const HELP = `Zevi AI to-do CLI

用法: node server/cli.mjs <命令> [参数] [--json]

查询
  list                      列出活动任务（默认不含收纳箱）
    [--status pending|completed|all] [--category work|personal|other]
    [--priority ui|ni|un|nn] [--view today|week|month|all] [--search 关键词]
    [--all] 含收纳箱   [--json] 输出 JSON
  get <id|#序号|内容>        查看单个任务详情
  archive                   列出逾期收纳箱里的任务
  stats                     查看等级 / 积分 / 数量统计

变更
  add "<内容>" [--priority ui|ni|un|nn] [--category work|personal|other]
  done <id|#序号|内容>       标记完成（+1 积分）
  undone <id>               取消完成（-1 积分）
  update <id> [--content ...] [--priority ...] [--category ...]
  delete <id>               直接删除活动任务（不写日志）
  restore <id> --reason ... 从收纳箱恢复（须填理由）
  archive-delete <id> --reason ...  从收纳箱彻底删除（写删除日志）

说明
  · <id> 可用完整 id、唯一前缀、#列表序号 或 精确内容文本。
  · 优先级别名: ui=重要且紧急 ni=重要不紧急 un=紧急不重要 nn=不重要不紧急。
  · 数据文件: 数据/store.json，与网页实时共享。`;

async function main() {
  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    console.log(HELP);
    return;
  }

  switch (cmd) {
    case 'list': {
      const state = await loadState();
      const list = domain.queryTasks(state, {
        status: flags.status,
        category: resolveCategory(flags.category),
        priority: resolvePriority(flags.priority),
        search: typeof flags.search === 'string' ? flags.search : undefined,
        view: flags.view && VIEWS.includes(flags.view) ? flags.view : undefined,
        archived: flags.all === true ? true : false,
      });
      printTasks(list);
      break;
    }

    case 'archive': {
      const state = await loadState();
      printTasks(domain.queryTasks(state, { archived: 'only' }));
      break;
    }

    case 'get': {
      const state = await loadState();
      const id = domain.resolveTaskId(state, positionals[0] ?? '');
      const task = state.tasks.find((t) => t.id === id);
      if (JSON_OUT) console.log(JSON.stringify({ ok: true, task }, null, 2));
      else {
        console.log(fmtTask(task));
        console.log('  id        : ' + task.id);
        console.log('  创建      : ' + new Date(task.createdAt).toLocaleString());
        console.log('  最后编辑  : ' + new Date(task.updatedAt).toLocaleString());
        if (task.completedAt) console.log('  完成      : ' + new Date(task.completedAt).toLocaleString());
        if (task.isArchived) console.log('  归档      : ' + new Date(task.archivedAt).toLocaleString());
      }
      break;
    }

    case 'stats': {
      const state = await loadState();
      const active = state.tasks.filter((t) => !t.isArchived);
      const stat = {
        level: state.user.level,
        points: state.user.points,
        pending: active.filter((t) => t.status === 'pending').length,
        completed: active.filter((t) => t.status === 'completed').length,
        archived: state.tasks.filter((t) => t.isArchived).length,
        total: state.tasks.length,
      };
      if (JSON_OUT) console.log(JSON.stringify({ ok: true, stats: stat }, null, 2));
      else {
        console.log(`等级 Lv.${stat.level} · 积分 ${stat.points}`);
        console.log(`待办 ${stat.pending} · 已完成 ${stat.completed} · 收纳箱 ${stat.archived} · 合计 ${stat.total}`);
      }
      break;
    }

    case 'add': {
      const content = positionals.join(' ').trim() || (typeof flags.content === 'string' ? flags.content : '');
      const { state, task } = await mutate((s) =>
        domain.addTask(s, {
          content,
          priority: resolvePriority(flags.priority) ?? 'urgent-important',
          category: resolveCategory(flags.category) ?? 'work',
        })
      );
      void state;
      printOne(task, '已创建任务');
      break;
    }

    case 'done':
    case 'undone': {
      const force = cmd === 'done' ? 'completed' : 'pending';
      const { state, task } = await mutate((s) => {
        const id = domain.resolveTaskId(s, positionals[0] ?? '');
        return domain.toggleStatus(s, id, force);
      });
      printOne(task, cmd === 'done' ? `已完成（当前积分 ${state.user.points}）` : `已取消完成（当前积分 ${state.user.points}）`);
      break;
    }

    case 'update': {
      const updates = {};
      if (typeof flags.content === 'string') updates.content = flags.content;
      if (flags.priority !== undefined) updates.priority = resolvePriority(flags.priority);
      if (flags.category !== undefined) updates.category = resolveCategory(flags.category);
      const { task } = await mutate((s) => {
        const id = domain.resolveTaskId(s, positionals[0] ?? '');
        return domain.updateTask(s, id, updates);
      });
      printOne(task, '已更新任务');
      break;
    }

    case 'delete': {
      const { task } = await mutate((s) => {
        const id = domain.resolveTaskId(s, positionals[0] ?? '');
        return domain.deleteTask(s, id);
      });
      printOne(task, '已删除任务');
      break;
    }

    case 'restore': {
      const reason = typeof flags.reason === 'string' ? flags.reason : '';
      const { task } = await mutate((s) => {
        const id = domain.resolveTaskId(s, positionals[0] ?? '');
        return domain.restoreTask(s, id, reason);
      });
      printOne(task, '已从收纳箱恢复');
      break;
    }

    case 'archive-delete': {
      const reason = typeof flags.reason === 'string' ? flags.reason : '';
      const { task } = await mutate((s) => {
        const id = domain.resolveTaskId(s, positionals[0] ?? '');
        return domain.deleteArchivedTask(s, id, reason);
      });
      printOne(task, '已从收纳箱彻底删除');
      break;
    }

    default:
      fail(`未知命令: ${cmd}（运行 node server/cli.mjs help 查看用法）`);
  }
}

main().catch((err) => fail(err.message));
