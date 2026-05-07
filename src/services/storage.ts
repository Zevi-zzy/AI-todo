import { DeletedTaskLogEntry, Task, TimeView } from '../types';

const STORAGE_KEYS = {
  TASKS: 'quadrant-todo-tasks',
  SETTINGS: 'quadrant-todo-settings',
  VIEW_PREFERENCES: 'quadrant-todo-view',
  USER_PROFILE: 'quadrant-todo-user',
  DELETION_LOG: 'quadrant-todo-deletion-log'
};

export class LocalStorageService {
  static saveUserProfile(profile: { level: number; points: number }): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save user profile', error);
    }
  }

  static loadUserProfile(): { level: number; points: number } {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return stored ? JSON.parse(stored) : { level: 1, points: 0 };
    } catch (error) {
      console.error('Failed to load user profile', error);
      return { level: 1, points: 0 };
    }
  }

  static saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks to local storage', error);
    }
  }

  static loadTasks(): Task[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load tasks from local storage', error);
      return [];
    }
  }

  static saveViewPreference(view: TimeView): void {
     try {
      localStorage.setItem(STORAGE_KEYS.VIEW_PREFERENCES, view);
    } catch (error) {
      console.error('Failed to save view preference', error);
    }
  }

  static loadViewPreference(): TimeView | null {
    return localStorage.getItem(STORAGE_KEYS.VIEW_PREFERENCES) as TimeView;
  }

  static saveDeletionLog(entries: DeletedTaskLogEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DELETION_LOG, JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save deletion log', error);
    }
  }

  static loadDeletionLog(): DeletedTaskLogEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DELETION_LOG);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load deletion log', error);
      return [];
    }
  }

  static appendDeletionLog(entry: DeletedTaskLogEntry): void {
    const existing = this.loadDeletionLog();
    this.saveDeletionLog([entry, ...existing]);
  }

  static exportData(): string {
    const data = {
      tasks: this.loadTasks(),
      userProfile: this.loadUserProfile(),
      viewPreference: this.loadViewPreference(),
      deletionLog: this.loadDeletionLog(),
      timestamp: Date.now(),
      version: '1.0'
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      
      // Basic validation
      if (!Array.isArray(data.tasks)) {
        throw new Error('Invalid data format: tasks missing');
      }

      // Save all data
      this.saveTasks(data.tasks);
      if (data.userProfile) {
        this.saveUserProfile(data.userProfile);
      }
      if (data.viewPreference) {
        this.saveViewPreference(data.viewPreference);
      }
      if (Array.isArray(data.deletionLog)) {
        this.saveDeletionLog(data.deletionLog);
      }
      
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }
}
