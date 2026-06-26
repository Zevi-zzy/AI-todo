// 前端 API 客户端：与本地后端（数据/store.json）通信。
// 时间视图偏好属于本机 UI 状态，仍存 localStorage。
import { Task, Priority, TaskCategory, TimeView, UserProfile } from '../types';

const BASE = '/api';
const VIEW_KEY = 'quadrant-todo-view';

export interface StateResponse {
  tasks: Task[];
  user: UserProfile;
  viewPreference: TimeView;
}
export interface MutationResponse {
  ok: boolean;
  task?: Task;
  tasks: Task[];
  user: UserProfile;
  error?: string;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `请求失败: ${res.status}`);
  }
  return data as T;
}

export const Api = {
  getState: () => req<StateResponse>('/state'),

  addTask: (content: string, priority: Priority, category: TaskCategory) =>
    req<MutationResponse>('/tasks', {
      method: 'POST',
      body: JSON.stringify({ content, priority, category }),
    }),

  toggleStatus: (id: string) =>
    req<MutationResponse>(`/tasks/${id}/toggle`, { method: 'POST', body: '{}' }),

  updateTask: (id: string, updates: Partial<Task>) =>
    req<MutationResponse>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),

  deleteTask: (id: string) => req<MutationResponse>(`/tasks/${id}`, { method: 'DELETE' }),

  restoreTask: (id: string, reason: string) =>
    req<MutationResponse>(`/tasks/${id}/restore`, { method: 'POST', body: JSON.stringify({ reason }) }),

  deleteArchivedTask: (id: string, reason: string) =>
    req<MutationResponse>(`/tasks/${id}/archive-delete`, { method: 'POST', body: JSON.stringify({ reason }) }),

  reorder: (activeId: string, overId: string) =>
    req<MutationResponse>('/tasks/reorder', { method: 'POST', body: JSON.stringify({ activeId, overId }) }),

  exportData: () => req<Record<string, unknown>>('/export'),

  importData: (raw: string) =>
    req<MutationResponse>('/import', { method: 'POST', body: raw }),

  // 时间视图偏好（本机 UI 状态）
  loadViewPreference(): TimeView | null {
    return localStorage.getItem(VIEW_KEY) as TimeView | null;
  },
  saveViewPreference(view: TimeView) {
    localStorage.setItem(VIEW_KEY, view);
  },
};

// 一次性迁移：把旧版 LocalStorage 里的数据推送到后端（仅在后端为空且本地有数据时）。
const MIGRATED_FLAG = 'quadrant-todo-migrated-to-server';
export async function migrateFromLocalStorageIfNeeded(serverTaskCount: number): Promise<boolean> {
  if (localStorage.getItem(MIGRATED_FLAG)) return false;
  const rawTasks = localStorage.getItem('quadrant-todo-tasks');
  if (serverTaskCount > 0 || !rawTasks) {
    localStorage.setItem(MIGRATED_FLAG, '1');
    return false;
  }
  try {
    const backup = {
      tasks: JSON.parse(rawTasks),
      userProfile: JSON.parse(localStorage.getItem('quadrant-todo-user') || 'null'),
      deletionLog: JSON.parse(localStorage.getItem('quadrant-todo-deletion-log') || '[]'),
      restoreLog: JSON.parse(localStorage.getItem('quadrant-todo-restore-log') || '[]'),
    };
    if (!Array.isArray(backup.tasks) || backup.tasks.length === 0) {
      localStorage.setItem(MIGRATED_FLAG, '1');
      return false;
    }
    // 后端 import 接受 { tasks, userProfile?, deletionLog?, restoreLog? }
    await Api.importData(JSON.stringify({ ...backup, user: backup.userProfile }));
    localStorage.setItem(MIGRATED_FLAG, '1');
    return true;
  } catch (e) {
    console.error('迁移旧数据失败', e);
    return false;
  }
}
