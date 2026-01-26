import React from 'react';
import { useStore } from '../store/useStore';
import { TaskCategory } from '../types/index';
import { cn } from '../lib/utils';
import { Briefcase, User, MoreHorizontal } from 'lucide-react';

export const CategoryFilter: React.FC = () => {
  const { currentCategory, setCategory } = useStore();

  const categories: { value: TaskCategory; label: string; icon: React.FC<any> }[] = [
    { value: 'work', label: '工作', icon: Briefcase },
    { value: 'personal', label: '个人', icon: User },
    { value: 'other', label: '其他', icon: MoreHorizontal },
  ];

  return (
    <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg ml-4">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => setCategory(cat.value)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-1.5",
            currentCategory === cat.value
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          )}
        >
          <cat.icon className="w-3.5 h-3.5" />
          {cat.label}
        </button>
      ))}
    </div>
  );
};
