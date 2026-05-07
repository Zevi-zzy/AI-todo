export type Priority = 'urgent-important' | 'urgent-not-important' | 'not-urgent-important' | 'not-urgent-not-important';

export type TaskStatus = 'pending' | 'completed';

export type TimeView = 'today' | 'week' | 'month' | 'all';

// Task categories
export type TaskCategory = 'personal' | 'work' | 'other';

export interface Task {
  id: string;
  content: string;
  priority: Priority;
  category: TaskCategory;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  isArchived?: boolean;
  archivedAt?: number;
  order: number;
}

export interface DeletedTaskLogEntry {
  id: string;
  content: string;
  priority: Priority;
  category: TaskCategory;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  archivedAt?: number;
  deletedAt: number;
  reason: string;
}

export interface UserProfile {
  level: number;
  points: number;
}

export interface AppState {
  tasks: Task[];
  currentView: TimeView;
  currentCategory: TaskCategory;
  searchQuery: string;
  user: UserProfile;
  isLoading: boolean;
  addTask: (content: string, priority: Priority, category: TaskCategory) => void;
  toggleTaskStatus: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  restoreTask: (taskId: string) => void;
  deleteArchivedTask: (taskId: string, reason: string) => void;
  reorderTasks: (activeId: string, overId: string) => void;
  setTimeView: (view: TimeView) => void;
  setCategory: (category: TaskCategory) => void;
  setSearchQuery: (query: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
}
