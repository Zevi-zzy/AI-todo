import React, { useState, useRef, useEffect } from 'react';
import { Trash2, CheckCircle2, Circle, AlertCircle, Briefcase, User, MoreHorizontal } from 'lucide-react';
import { Task, TaskCategory } from '../types';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { format, isToday, isYesterday, isThisYear, isBefore, startOfToday } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
}

const CategoryIcon = ({ category }: { category: TaskCategory }) => {
  switch (category) {
    case 'work': return <Briefcase className="w-3 h-3" />;
    case 'personal': return <User className="w-3 h-3" />;
    case 'other': return <MoreHorizontal className="w-3 h-3" />;
    default: return null;
  }
};

const formatTaskDate = (timestamp: number) => {
  const date = new Date(timestamp);
  if (isToday(date)) {
    return `今天 ${format(date, 'HH:mm')}`;
  }
  if (isYesterday(date)) {
    return `昨天 ${format(date, 'HH:mm')}`;
  }
  if (isThisYear(date)) {
    return format(date, 'MM-dd HH:mm');
  }
  return format(date, 'yyyy-MM-dd');
};

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { toggleTaskStatus, deleteTask, updateTask } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.content);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim() && editValue.trim() !== task.content) {
      updateTask(task.id, { content: editValue.trim() });
    } else {
      setEditValue(task.content);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(task.content);
      setIsEditing(false);
    }
  };

  const isOverdue = task.status === 'pending' && isBefore(task.createdAt, startOfToday());

  const handleDragStart = (e: React.DragEvent) => {
    if (isEditing) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
    // Add a class to styling the drag source if needed, usually done via state or css classes
  };

  return (
    <div
      draggable={!isEditing}
      onDragStart={handleDragStart}
      className={cn(
        "group bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-start gap-3 select-none",
        isEditing ? "cursor-text ring-2 ring-blue-500 ring-opacity-50" : "cursor-move active:cursor-grabbing",
        task.status === 'completed' && !isEditing && "opacity-60 bg-gray-50"
      )}
    >
      <button
        onClick={() => toggleTaskStatus(task.id)}
        className="mt-0.5 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
      >
        {task.status === 'completed' ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>
      
      <div className="flex-1 min-w-0" onClick={() => !isEditing && setIsEditing(true)}>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full text-sm text-gray-700 bg-transparent border-none outline-none p-0 placeholder-gray-400"
          />
        ) : (
          <p className={cn(
            "text-sm text-gray-700 break-words leading-relaxed cursor-text",
            task.status === 'completed' && "line-through text-gray-400"
          )}>
            {task.content}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2">
            <span className={cn(
              "text-xs",
              isOverdue ? "text-red-500 font-medium flex items-center gap-1" : "text-gray-400"
            )}>
                {isOverdue && <AlertCircle className="w-3 h-3" />}
                {formatTaskDate(task.createdAt)}
                {isOverdue && " (已逾期)"}
            </span>
            <span className="text-xs text-gray-300 flex items-center gap-1 ml-auto">
                <CategoryIcon category={task.category} />
            </span>
        </div>
      </div>

      <button
        onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('确定要删除这个任务吗？')) {
                deleteTask(task.id);
            }
        }}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1 flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
