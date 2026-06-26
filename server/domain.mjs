// Zevi AI to-do · 业务逻辑（前端 store / 后端 server / CLI 三方共用，确保行为一致）
// 与 src/lib/level.ts、src/lib/constants.ts、src/store/useStore.ts 保持同步。
import { randomUUID } from 'node:crypto';

// —— 常量 ——
export const OVERDUE_ARCHIVE_DAYS = 14;
export const OVERDUE_ARCHIVE_MS = OVERDUE_ARCHIVE_DAYS * 24 * 60 * 60 * 1000;

export const PRIORITIES = [
  'urgent-important',
  'urgent-not-important',
  'not-urgent-important',
  'not-urgent-not-important',
];
export const CATEGORIES = ['personal', 'work', 'other'];
export const VIEWS = ['today', 'week', 'month', 'all'];

export const PRIORITY_LABELS = {
  'urgent-important': '重要且紧急',
  'not-urgent-important': '重要不紧急',
  'urgent-not-important': '紧急不重要',
  'not-urgent-not-important': '不重要不紧急',
};
export const CATEGORY_LABELS = { work: '工作', personal: '个人', other: '其他' };

const BASE_XP = 10;
const XP_INCREMENT = 5;
const DEFAULT_INITIAL_LEVEL = 7;

// —— 等级 / 积分 ——
export function calculateLevel(points) {
  let level = 1;
  let need = BASE_XP;
  let p = points;
  while (p >= need) {
    p -= need;
    level++;
    need += XP_INCREMENT;
  }
  return level;
}

export function getMinimumPointsForLevel(targetLevel) {
  if (targetLevel <= 1) return 0;
  let total = 0;
  let need = BASE_XP;
  for (let l = 1; l < targetLevel; l++) {
    total += need;
    need += XP_INCREMENT;
  }
  return total;
}

// —— 归一化 ——
export function normalizeTask(t) {
  return {
    ...t,
    category: t.category || 'work',
    updatedAt: typeof t.updatedAt === 'number' ? t.updatedAt : t.createdAt,
    isArchived: Boolean(t.isArchived),
  };
}

export function applyAutoArchive(tasks, now) {
  let changed = false;
  const out = tasks.map((t) => {
    if (t.status === 'pending' && !t.isArchived && t.updatedAt <= now - OVERDUE_ARCHIVE_MS) {
      changed = true;
      return { ...t, isArchived: true, archivedAt: now };
    }
    return t;
  });
  return { tasks: out, changed };
}

export function defaultState() {
  const points = getMinimumPointsForLevel(DEFAULT_INITIAL_LEVEL);
  return {
    tasks: [],
    user: { level: DEFAULT_INITIAL_LEVEL, points },
    deletionLog: [],
    restoreLog: [],
    viewPreference: 'today',
    version: '1.0',
  };
}

// 载入时归一化：补默认字段、自动归档、按已完成数校准积分（与前端 store 初始化逻辑一致）
export function normalizeState(raw) {
  const base = defaultState();
  const state = { ...base, ...(raw || {}) };
  const now = Date.now();

  const tasks0 = (Array.isArray(state.tasks) ? state.tasks : []).map(normalizeTask);
  const { tasks } = applyAutoArchive(tasks0, now);
  state.tasks = tasks;

  const completed = tasks.filter((t) => t.status === 'completed').length;
  const userObj = state.user || raw?.userProfile; // 兼容旧备份的 userProfile 字段
  const storedPoints = userObj && typeof userObj.points === 'number' ? userObj.points : base.user.points;
  const points = Math.max(completed, storedPoints);
  state.user = { points, level: calculateLevel(points) };

  state.deletionLog = Array.isArray(state.deletionLog) ? state.deletionLog : [];
  state.restoreLog = Array.isArray(state.restoreLog) ? state.restoreLog : [];
  if (!VIEWS.includes(state.viewPreference)) state.viewPreference = 'today';
  state.version = state.version || '1.0';
  return state;
}

// —— 查询 ——
function inTimeView(task, view) {
  if (view === 'all') return true;
  if (task.status === 'pending') return true; // 待办始终滚存显示（与前端一致）
  const ts = task.completedAt ?? task.createdAt;
  const d = new Date(ts);
  const now = new Date();
  if (view === 'today') {
    const s = new Date();
    s.setHours(0, 0, 0, 0);
    return ts >= s.getTime() && ts < s.getTime() + 86400000;
  }
  if (view === 'month') {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  if (view === 'week') {
    const s = new Date();
    const day = (s.getDay() + 6) % 7; // 周一为一周起点
    s.setHours(0, 0, 0, 0);
    s.setDate(s.getDate() - day);
    return ts >= s.getTime() && ts < s.getTime() + 7 * 86400000;
  }
  return true;
}

// opts: { status:'pending'|'completed'|'all', category, priority, search, view, archived:false|true|'only' }
export function queryTasks(state, opts = {}) {
  let list = state.tasks.slice();
  if (opts.archived === 'only') list = list.filter((t) => t.isArchived);
  else if (opts.archived === true) { /* 全部，含归档 */ }
  else list = list.filter((t) => !t.isArchived);

  if (opts.status && opts.status !== 'all') list = list.filter((t) => t.status === opts.status);
  if (opts.category && opts.category !== 'all') list = list.filter((t) => t.category === opts.category);
  if (opts.priority) list = list.filter((t) => t.priority === opts.priority);
  if (opts.search) {
    const q = String(opts.search).toLowerCase();
    list = list.filter((t) => t.content.toLowerCase().includes(q));
  }
  if (opts.view && opts.view !== 'all') list = list.filter((t) => inTimeView(t, opts.view));

  // 排序：未完成在前，再按 order 倒序（新任务在上）
  list.sort((a, b) => {
    const ac = a.status === 'completed';
    const bc = b.status === 'completed';
    if (ac !== bc) return ac ? 1 : -1;
    return b.order - a.order;
  });
  return list;
}

// 把用户输入（精确 id / id 前缀 / #序号 / 精确内容）解析为唯一 id
export function resolveTaskId(state, ref) {
  ref = String(ref).trim();
  if (!ref) throw new Error('未提供任务标识');
  if (ref.startsWith('#')) {
    const n = parseInt(ref.slice(1), 10);
    const visible = queryTasks(state, { archived: true });
    if (Number.isInteger(n) && n >= 1 && n <= visible.length) return visible[n - 1].id;
    throw new Error('序号超出范围: ' + ref);
  }
  if (state.tasks.some((t) => t.id === ref)) return ref;
  const byPrefix = state.tasks.filter((t) => t.id.startsWith(ref));
  if (byPrefix.length === 1) return byPrefix[0].id;
  if (byPrefix.length > 1) throw new Error('id 前缀不唯一，请补全: ' + ref);
  const byContent = state.tasks.filter((t) => t.content === ref);
  if (byContent.length === 1) return byContent[0].id;
  if (byContent.length > 1) throw new Error('内容匹配到多个任务，请用 id: ' + ref);
  throw new Error('找不到任务: ' + ref);
}

function getById(state, id) {
  const t = state.tasks.find((x) => x.id === id);
  if (!t) throw new Error('任务不存在: ' + id);
  return t;
}

function logSnapshot(t) {
  return {
    id: t.id,
    content: t.content,
    priority: t.priority,
    category: t.category,
    status: t.status,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    completedAt: t.completedAt,
    archivedAt: t.archivedAt,
  };
}

// —— 变更操作（纯函数，返回 { state, task }；非法输入抛错）——
export function addTask(state, { content, priority = 'urgent-important', category = 'work' } = {}) {
  content = String(content || '').trim();
  if (!content) throw new Error('content 不能为空');
  if (!PRIORITIES.includes(priority)) throw new Error('priority 非法: ' + priority);
  if (!CATEGORIES.includes(category)) throw new Error('category 非法: ' + category);
  const now = Date.now();
  const task = {
    id: randomUUID(),
    content,
    priority,
    category,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    order: now,
    isArchived: false,
  };
  const { tasks } = applyAutoArchive([task, ...state.tasks], now);
  return { state: { ...state, tasks }, task };
}

export function toggleStatus(state, id, force) {
  const target = getById(state, id);
  const now = Date.now();
  let delta = 0;
  const tasks0 = state.tasks.map((t) => {
    if (t.id !== target.id) return t;
    let ns = t.status === 'pending' ? 'completed' : 'pending';
    if (force === 'completed' || force === 'pending') ns = force;
    if (ns === t.status) return t;
    delta = ns === 'completed' ? 1 : -1;
    return { ...t, status: ns, completedAt: ns === 'completed' ? now : undefined, updatedAt: now };
  });
  const { tasks } = applyAutoArchive(tasks0, now);
  const points = Math.max(0, state.user.points + delta);
  const user = { points, level: calculateLevel(points) };
  return { state: { ...state, tasks, user }, task: tasks.find((t) => t.id === target.id) };
}

export function updateTask(state, id, updates = {}) {
  const target = getById(state, id);
  const clean = {};
  if (updates.content !== undefined) {
    const c = String(updates.content).trim();
    if (!c) throw new Error('content 不能为空');
    clean.content = c;
  }
  if (updates.priority !== undefined) {
    if (!PRIORITIES.includes(updates.priority)) throw new Error('priority 非法: ' + updates.priority);
    clean.priority = updates.priority;
  }
  if (updates.category !== undefined) {
    if (!CATEGORIES.includes(updates.category)) throw new Error('category 非法: ' + updates.category);
    clean.category = updates.category;
  }
  if (Object.keys(clean).length === 0) throw new Error('没有可更新的字段（content/priority/category）');
  const now = Date.now();
  const tasks0 = state.tasks.map((t) => (t.id === target.id ? { ...t, ...clean, updatedAt: now } : t));
  const { tasks } = applyAutoArchive(tasks0, now);
  return { state: { ...state, tasks }, task: tasks.find((t) => t.id === target.id) };
}

export function deleteTask(state, id) {
  const target = getById(state, id);
  const tasks = state.tasks.filter((t) => t.id !== target.id);
  return { state: { ...state, tasks }, task: target };
}

export function restoreTask(state, id, reason) {
  reason = String(reason || '').trim();
  if (!reason) throw new Error('reason 不能为空');
  const target = getById(state, id);
  if (!target.isArchived) throw new Error('该任务不在收纳箱中，无需恢复');
  const now = Date.now();
  const entry = { ...logSnapshot(target), restoredAt: now, reason };
  const restored = state.tasks.map((t) =>
    t.id === target.id ? { ...t, isArchived: false, archivedAt: undefined, updatedAt: now } : t
  );
  const { tasks } = applyAutoArchive(restored, now);
  return {
    state: { ...state, tasks, restoreLog: [entry, ...state.restoreLog] },
    task: tasks.find((t) => t.id === target.id),
  };
}

export function deleteArchivedTask(state, id, reason) {
  reason = String(reason || '').trim();
  if (!reason) throw new Error('reason 不能为空');
  const target = getById(state, id);
  const now = Date.now();
  const entry = { ...logSnapshot(target), deletedAt: now, reason };
  const remaining = state.tasks.filter((t) => t.id !== target.id);
  const { tasks } = applyAutoArchive(remaining, now);
  return {
    state: { ...state, tasks, deletionLog: [entry, ...state.deletionLog] },
    task: target,
  };
}

export function reorderTasks(state, activeId, overId) {
  const now = Date.now();
  const oldIndex = state.tasks.findIndex((t) => t.id === activeId);
  const newIndex = state.tasks.findIndex((t) => t.id === overId);
  if (oldIndex < 0 || newIndex < 0) return { state, task: null };
  const arr = [...state.tasks];
  const [moved] = arr.splice(oldIndex, 1);
  arr.splice(newIndex, 0, { ...moved, updatedAt: now });
  const { tasks } = applyAutoArchive(arr, now);
  return { state: { ...state, tasks }, task: tasks.find((t) => t.id === activeId) };
}
