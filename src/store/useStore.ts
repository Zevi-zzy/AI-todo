import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { AppState, DeletedTaskLogEntry, Priority, RestoredTaskLogEntry, Task, TimeView, TaskCategory } from '../types';
import { LocalStorageService } from '../services/storage';
import { calculateLevel } from '../lib/level';
import { OVERDUE_ARCHIVE_MS } from '../lib/constants';

export const useStore = create<AppState>((set) => {
  const normalizeTask = (t: any): Task => ({
    ...t,
    category: t.category || 'work',
    updatedAt: typeof t.updatedAt === 'number' ? t.updatedAt : t.createdAt,
    isArchived: Boolean(t.isArchived),
  });

  const applyAutoArchive = (inputTasks: Task[], now: number) => {
    let changed = false;
    const tasks = inputTasks.map((t) => {
      if (t.status === 'pending' && !t.isArchived && t.updatedAt <= now - OVERDUE_ARCHIVE_MS) {
        changed = true;
        return { ...t, isArchived: true, archivedAt: now };
      }
      return t;
    });
    return { tasks, changed };
  };

  const loadedTasks = LocalStorageService.loadTasks().map(normalizeTask);
  const { tasks, changed } = applyAutoArchive(loadedTasks, Date.now());
  if (changed) {
    LocalStorageService.saveTasks(tasks);
  }

  // 初始化时计算历史任务积分
  const initialUser = LocalStorageService.loadUserProfile();
  
  // 如果是初次加载（积分还是0），或者需要重新校准，可以统计一下历史已完成的任务
  // 简单的策略：如果本地存储的积分明显少于已完成任务数，进行一次“补分”
  // 这里我们采取一个策略：每次初始化Store时，都重新计算一次总积分，确保数据一致性
  // 这样既解决了历史任务没分的问题，也解决了积分不同步的问题
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  
  // 如果本地存的积分小于已完成任务数，说明有历史任务没算分
  // 或者我们可以直接信任“已完成任务数”作为总积分（如果不考虑其他加分项的话）
  // 为了简单可靠，我们直接用 tasks 计算出来的积分覆盖 stored profile
  const realPoints = Math.max(completedTasksCount, initialUser.points);
  const realLevel = calculateLevel(realPoints);
  
  const userProfile = {
    level: realLevel,
    points: realPoints
  };
  
  // 如果计算出的和存储的不一样，更新一下存储
  if (userProfile.points !== initialUser.points) {
    LocalStorageService.saveUserProfile(userProfile);
  }

  return {
    tasks,
    currentView: LocalStorageService.loadViewPreference() || 'today',
    currentCategory: 'work',
    searchQuery: '',
    user: userProfile,
    isLoading: false,

    addTask: (content: string, priority: Priority, category: TaskCategory) => {
      const now = Date.now();
      const newTask: Task = {
        id: uuidv4(),
        content,
        priority,
        category,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        order: now,
        isArchived: false,
      };
    
      set((state) => {
        const merged = [newTask, ...state.tasks];
        const { tasks: archived } = applyAutoArchive(merged, now);
        LocalStorageService.saveTasks(archived);
        return { tasks: archived };
      });
    },

    setCategory: (category: TaskCategory) => {
      set({ currentCategory: category });
    },

    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
    },

    toggleTaskStatus: (taskId: string) => {
      set((state) => {
        let pointsDelta = 0;
        const now = Date.now();

        const newTasks = state.tasks.map((t) => {
          if (t.id === taskId) {
              const newStatus: "pending" | "completed" = t.status === 'pending' ? 'completed' : 'pending';
              // Calculate points delta
              if (newStatus === 'completed') {
                pointsDelta = 1;
              } else {
                pointsDelta = -1;
              }

              return {
                ...t,
                status: newStatus,
                completedAt: newStatus === 'completed' ? now : undefined,
                updatedAt: now,
              };
          }
          return t;
        });

        const { tasks: archivedTasks } = applyAutoArchive(newTasks, now);

        // Update user profile
        const currentPoints = state.user.points;
        // Prevent points from going below 0
        const newPoints = Math.max(0, currentPoints + pointsDelta);
        const newLevel = calculateLevel(newPoints);
        
        const newUserProfile = {
          level: newLevel,
          points: newPoints
        };

        LocalStorageService.saveTasks(archivedTasks);
        LocalStorageService.saveUserProfile(newUserProfile);
        
        return { 
          tasks: archivedTasks,
          user: newUserProfile
        };
      });
    },

    deleteTask: (taskId: string) => {
      set((state) => {
        const newTasks = state.tasks.filter((t) => t.id !== taskId);
        LocalStorageService.saveTasks(newTasks);
        return { tasks: newTasks };
      });
    },

    restoreTask: (taskId: string, reason: string) => {
      set((state) => {
        const trimmedReason = reason.trim();
        if (!trimmedReason) return state;

        const target = state.tasks.find((t) => t.id === taskId);
        if (!target || !target.isArchived) return state;

        const now = Date.now();
        const entry: RestoredTaskLogEntry = {
          id: target.id,
          content: target.content,
          priority: target.priority,
          category: target.category,
          status: target.status,
          createdAt: target.createdAt,
          updatedAt: target.updatedAt,
          completedAt: target.completedAt,
          archivedAt: target.archivedAt,
          restoredAt: now,
          reason: trimmedReason,
        };
        LocalStorageService.appendRestoreLog(entry);

        const restored = state.tasks.map((t) =>
          t.id === taskId ? { ...t, isArchived: false, archivedAt: undefined, updatedAt: now } : t
        );
        const { tasks: archivedTasks } = applyAutoArchive(restored, now);
        LocalStorageService.saveTasks(archivedTasks);
        return { tasks: archivedTasks };
      });
    },

    deleteArchivedTask: (taskId: string, reason: string) => {
      set((state) => {
        const trimmedReason = reason.trim();
        if (!trimmedReason) return state;

        const target = state.tasks.find((t) => t.id === taskId);
        if (!target) return state;

        const now = Date.now();
        const entry: DeletedTaskLogEntry = {
          id: target.id,
          content: target.content,
          priority: target.priority,
          category: target.category,
          status: target.status,
          createdAt: target.createdAt,
          updatedAt: target.updatedAt,
          completedAt: target.completedAt,
          archivedAt: target.archivedAt,
          deletedAt: now,
          reason: trimmedReason,
        };

        LocalStorageService.appendDeletionLog(entry);

        const remaining = state.tasks.filter((t) => t.id !== taskId);
        const { tasks: archivedTasks } = applyAutoArchive(remaining, now);
        LocalStorageService.saveTasks(archivedTasks);
        return { tasks: archivedTasks };
      });
    },

    reorderTasks: (activeId: string, overId: string) => {
      set((state) => {
        const now = Date.now();
        const oldIndex = state.tasks.findIndex((t) => t.id === activeId);
        const newIndex = state.tasks.findIndex((t) => t.id === overId);
        
        if (oldIndex < 0 || newIndex < 0) return state;

        const newTasks = [...state.tasks];
        const [movedTask] = newTasks.splice(oldIndex, 1);
        newTasks.splice(newIndex, 0, { ...movedTask, updatedAt: now });
        
        const { tasks: archivedTasks } = applyAutoArchive(newTasks, now);
        LocalStorageService.saveTasks(archivedTasks);
        return { tasks: archivedTasks };
      });
    },

    setTimeView: (view: TimeView) => {
      set({ currentView: view });
      LocalStorageService.saveViewPreference(view);
    },

    updateTask: (taskId: string, updates: Partial<Task>) => {
      set((state) => {
        const now = Date.now();
        const newTasks = state.tasks.map((t) =>
          t.id === taskId ? { ...t, ...updates, updatedAt: now } : t
        );
        const { tasks: archivedTasks } = applyAutoArchive(newTasks, now);
        LocalStorageService.saveTasks(archivedTasks);
        return { tasks: archivedTasks };
      });
    }
  };
});
