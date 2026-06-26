import { create } from 'zustand';
import { AppState, Priority, Task, TimeView, TaskCategory } from '../types';
import { Api, migrateFromLocalStorageIfNeeded } from '../services/api';

// 数据真相源在本地后端（数据/store.json）。store 负责调用 API 并同步本地视图，
// 方法签名与旧版保持一致，组件层无需改动。
export const useStore = create<AppState & {
  init: () => Promise<void>;
  refresh: () => Promise<void>;
}>((set, get) => {
  const applyResult = (res: { tasks: Task[]; user: AppState['user'] }) => {
    set({ tasks: res.tasks, user: res.user });
  };

  const logError = (action: string) => (err: unknown) => {
    console.error(`[zevi-todo] ${action} 失败：`, err);
  };

  return {
    tasks: [],
    currentView: Api.loadViewPreference() || 'today',
    currentCategory: 'work',
    searchQuery: '',
    user: { level: 7, points: 0 },
    isLoading: true,

    // 启动：拉取后端状态；首次运行时把旧 LocalStorage 数据迁移过来。
    init: async () => {
      try {
        let state = await Api.getState();
        const migrated = await migrateFromLocalStorageIfNeeded(state.tasks.length);
        if (migrated) state = await Api.getState();
        set({ tasks: state.tasks, user: state.user, isLoading: false });
      } catch (err) {
        logError('初始化')(err);
        set({ isLoading: false });
      }
    },

    // 轮询/窗口聚焦时刷新，让 Agent 在命令行做的改动也能反映到页面。
    refresh: async () => {
      try {
        const state = await Api.getState();
        set({ tasks: state.tasks, user: state.user });
      } catch (err) {
        logError('刷新')(err);
      }
    },

    addTask: (content: string, priority: Priority, category: TaskCategory) => {
      Api.addTask(content, priority, category).then(applyResult).catch(logError('新建任务'));
    },

    toggleTaskStatus: (taskId: string) => {
      Api.toggleStatus(taskId).then(applyResult).catch(logError('切换完成状态'));
    },

    deleteTask: (taskId: string) => {
      Api.deleteTask(taskId).then(applyResult).catch(logError('删除任务'));
    },

    restoreTask: (taskId: string, reason: string) => {
      if (!reason.trim()) return;
      Api.restoreTask(taskId, reason).then(applyResult).catch(logError('恢复任务'));
    },

    deleteArchivedTask: (taskId: string, reason: string) => {
      if (!reason.trim()) return;
      Api.deleteArchivedTask(taskId, reason).then(applyResult).catch(logError('彻底删除任务'));
    },

    reorderTasks: (activeId: string, overId: string) => {
      // 乐观更新：先本地交换，再请求后端，避免拖拽时闪烁。
      const { tasks } = get();
      const oldIndex = tasks.findIndex((t) => t.id === activeId);
      const newIndex = tasks.findIndex((t) => t.id === overId);
      if (oldIndex >= 0 && newIndex >= 0) {
        const next = [...tasks];
        const [moved] = next.splice(oldIndex, 1);
        next.splice(newIndex, 0, moved);
        set({ tasks: next });
      }
      Api.reorder(activeId, overId).then(applyResult).catch(logError('排序'));
    },

    setTimeView: (view: TimeView) => {
      set({ currentView: view });
      Api.saveViewPreference(view);
    },

    setCategory: (category: TaskCategory) => {
      set({ currentCategory: category });
    },

    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
    },

    updateTask: (taskId: string, updates: Partial<Task>) => {
      Api.updateTask(taskId, updates).then(applyResult).catch(logError('更新任务'));
    },
  };
});
