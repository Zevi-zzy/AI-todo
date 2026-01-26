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
  completedAt?: number;
  order: number;
}

export interface UserProfile {
  level: number;
  points: number;
}

export interface AppState {
  tasks: Task[];
  currentView: TimeView;
  currentCategory: TaskCategory;
  user: UserProfile;
  isLoading: boolean;
  addTask: (content: string, priority: Priority, category: TaskCategory) => void;
  toggleTaskStatus: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  reorderTasks: (activeId: string, overId: string) => void;
  setTimeView: (view: TimeView) => void;
  setCategory: (category: TaskCategory) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
}
