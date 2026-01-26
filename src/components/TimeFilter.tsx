import React from 'react';
import { useStore } from '../store/useStore';
import { TimeView } from '../types';
import { cn } from '../lib/utils';

export const TimeFilter: React.FC = () => {
  const { currentView, setTimeView } = useStore();

  const views: { value: TimeView; label: string }[] = [
    { value: 'today', label: '今日' },
    { value: 'week', label: '本周' },
    { value: 'month', label: '本月' },
    { value: 'all', label: '全部' },
  ];

  return (
    <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
      {views.map((view) => (
        <button
          key={view.value}
          onClick={() => setTimeView(view.value)}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
            currentView === view.value
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          )}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
};
