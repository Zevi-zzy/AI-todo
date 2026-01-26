import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Priority, Task, TimeView, TaskCategory } from '../types';
import { LocalStorageService } from '../services/storage';
import { calculateLevel } from '../lib/level';

export const useStore = create<AppState>((set) => {
  const tasks = LocalStorageService.loadTasks().map(t => ({
    ...t,
    category: t.category || 'work' // 兼容旧数据
  }));

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
  const realPoints = completedTasksCount;
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
    user: userProfile,
    isLoading: false,

    addTask: (content: string, priority: Priority, category: TaskCategory) => {
    const newTask: Task = {
      id: uuidv4(),
      content,
      priority,
      category,
      status: 'pending',
      createdAt: Date.now(),
      order: Date.now(),
    };
    
    set((state) => {
      const newTasks = [newTask, ...state.tasks];
      LocalStorageService.saveTasks(newTasks);
      return { tasks: newTasks };
    });
  },

  setCategory: (category: TaskCategory) => {
    set({ currentCategory: category });
  },

  toggleTaskStatus: (taskId: string) => {
    set((state) => {
      let pointsDelta = 0;

      const newTasks = state.tasks.map((t) => {
        if (t.id === taskId) {
            const newStatus = t.status === 'pending' ? 'completed' : 'pending';
            // Calculate points delta
            if (newStatus === 'completed') {
              pointsDelta = 1;
            } else {
              pointsDelta = -1;
            }

            return {
              ...t,
              status: newStatus,
              completedAt: newStatus === 'completed' ? Date.now() : undefined,
            };
        }
        return t;
      });

      // Update user profile
      const currentPoints = state.user.points;
      // Prevent points from going below 0
      const newPoints = Math.max(0, currentPoints + pointsDelta);
      const newLevel = calculateLevel(newPoints);
      
      const newUserProfile = {
        level: newLevel,
        points: newPoints
      };

      LocalStorageService.saveTasks(newTasks);
      LocalStorageService.saveUserProfile(newUserProfile);
      
      return { 
        tasks: newTasks,
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

  reorderTasks: (activeId: string, overId: string) => {
    set((state) => {
      const oldIndex = state.tasks.findIndex((t) => t.id === activeId);
      const newIndex = state.tasks.findIndex((t) => t.id === overId);
      
      if (oldIndex < 0 || newIndex < 0) return state;

      const newTasks = [...state.tasks];
      const [movedTask] = newTasks.splice(oldIndex, 1);
      newTasks.splice(newIndex, 0, movedTask);
      
      LocalStorageService.saveTasks(newTasks);
      return { tasks: newTasks };
    });
  },

  setTimeView: (view: TimeView) => {
    set({ currentView: view });
    LocalStorageService.saveViewPreference(view);
  },

  updateTask: (taskId: string, updates: Partial<Task>) => {
    set((state) => {
       const newTasks = state.tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      );
      LocalStorageService.saveTasks(newTasks);
      return { tasks: newTasks };
    });
  }
  };
});
