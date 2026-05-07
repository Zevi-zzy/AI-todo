import React from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { format, isToday, isYesterday, isThisYear } from 'date-fns';
import { Task } from '../types';
import { cn } from '../lib/utils';

interface ArchivedTaskCardProps {
  task: Task;
  onRestore: () => void;
  onDelete: () => void;
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  if (isToday(date)) return `今天 ${format(date, 'HH:mm')}`;
  if (isYesterday(date)) return `昨天 ${format(date, 'HH:mm')}`;
  if (isThisYear(date)) return format(date, 'MM-dd HH:mm');
  return format(date, 'yyyy-MM-dd');
};

export const ArchivedTaskCard: React.FC<ArchivedTaskCardProps> = ({ task, onRestore, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3 flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 break-words leading-relaxed">{task.content}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
          <span>最后编辑：{formatDate(task.updatedAt)}</span>
          {typeof task.archivedAt === 'number' && (
            <span className="text-gray-300">· 收纳：{formatDate(task.archivedAt)}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={onRestore}
          className={cn(
            "p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors"
          )}
          title="恢复到主列表"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-colors"
          title="彻底删除（需填写原因）"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

