import React from 'react';
import { useStore } from '../store/useStore';
import { QuadrantSection } from './QuadrantSection';
import { Priority } from '../types';
import { isToday, isThisWeek, isThisMonth, isBefore, startOfToday } from 'date-fns';
import { Search } from 'lucide-react';

export const QuadrantMatrix: React.FC = () => {
  const { tasks, currentView, currentCategory, searchQuery } = useStore();

  const filteredTasks = tasks.filter((task) => {
    if (task.isArchived) return false;
    // 0. 搜索筛选
    if (searchQuery) {
      return task.content.toLowerCase().includes(searchQuery.toLowerCase());
    }

    // 1. 分类筛选
    if (task.category !== currentCategory) return false;

    // 2. 全部视图：显示所有任务
    if (currentView === 'all') return true;

    // 3. 待办任务：总是显示（自动滚存到今日/本周/本月）
    if (task.status === 'pending') return true;

    // 4. 已完成任务：根据完成时间筛选
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
    const priorityTasks = filteredTasks.filter((t) => t.priority === priority);

    return priorityTasks.sort((a, b) => {
      const aCompleted = a.status === 'completed';
      const bCompleted = b.status === 'completed';

      if (aCompleted !== bCompleted) {
        return aCompleted ? 1 : -1;
      }

      if (!aCompleted && !bCompleted) {
        const aOverdue = isBefore(a.updatedAt, startOfToday());
        const bOverdue = isBefore(b.updatedAt, startOfToday());

        if (aOverdue !== bOverdue) {
          return aOverdue ? 1 : -1;
        }
      }

      return b.order - a.order;
    });
  };

  if (searchQuery && filteredTasks.length === 0) {
    return (
      <div className="flex-1 p-4 max-w-7xl mx-auto w-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg">未找到匹配的任务</p>
          <p className="text-sm text-gray-400 mt-1">尝试其他关键词</p>
        </div>
      </div>
    );
  }

  if (searchQuery) {
    return (
      <div className="flex-1 p-4 max-w-7xl mx-auto w-full">
        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
          找到 {filteredTasks.length} 个匹配的任务
        </div>
        <div className="space-y-6">
          <QuadrantSection priority="urgent-important" tasks={getTasksByPriority('urgent-important')} showTitle />
          <QuadrantSection priority="not-urgent-important" tasks={getTasksByPriority('not-urgent-important')} showTitle />
          <QuadrantSection priority="urgent-not-important" tasks={getTasksByPriority('urgent-not-important')} showTitle />
          <QuadrantSection priority="not-urgent-not-important" tasks={getTasksByPriority('not-urgent-not-important')} showTitle />
        </div>
      </div>
    );
  }

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
