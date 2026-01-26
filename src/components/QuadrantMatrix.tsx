import React from 'react';
import { useStore } from '../store/useStore';
import { QuadrantSection } from './QuadrantSection';
import { Priority } from '../types';
import { isToday, isThisWeek, isThisMonth } from 'date-fns';

export const QuadrantMatrix: React.FC = () => {
  const { tasks, currentView, currentCategory } = useStore();

  const filteredTasks = tasks.filter((task) => {
    // 0. 分类筛选
    if (task.category !== currentCategory) return false;

    // 1. 全部视图：显示所有任务
    if (currentView === 'all') return true;

    // 2. 待办任务：总是显示（自动滚存到今日/本周/本月）
    if (task.status === 'pending') return true;

    // 3. 已完成任务：根据完成时间筛选
    // 如果没有 completedAt (旧数据)，则回退到 createdAt
    const dateToCheck = task.completedAt ?? task.createdAt;
    const date = new Date(dateToCheck);

    switch (currentView) {
      case 'today':
        return isToday(date);
      case 'week':
        return isThisWeek(date, { weekStartsOn: 1 });
      case 'month':
        return isThisMonth(date);
      default:
        return true;
    }
  });

  const getTasksByPriority = (priority: Priority) => {
    return filteredTasks.filter((t) => t.priority === priority);
  };

  return (
    <div className="flex-1 p-4 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuadrantSection priority="urgent-important" tasks={getTasksByPriority('urgent-important')} />
        <QuadrantSection priority="not-urgent-important" tasks={getTasksByPriority('not-urgent-important')} />
        <QuadrantSection priority="urgent-not-important" tasks={getTasksByPriority('urgent-not-important')} />
        <QuadrantSection priority="not-urgent-not-important" tasks={getTasksByPriority('not-urgent-not-important')} />
      </div>
    </div>
  );
};
