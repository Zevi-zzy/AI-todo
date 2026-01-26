import React, { useState } from 'react';
import { Priority, Task } from '../types';
import { TaskCard } from './TaskCard';
import { PRIORITY_CONFIG } from '../lib/constants';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

interface QuadrantSectionProps {
  priority: Priority;
  tasks: Task[];
}

export const QuadrantSection: React.FC<QuadrantSectionProps> = ({ priority, tasks }) => {
  const { updateTask, reorderTasks } = useStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const config = PRIORITY_CONFIG[priority];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    
    if (taskId) {
      updateTask(taskId, { priority });
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col rounded-xl border transition-colors duration-200 overflow-hidden bg-white shadow-sm",
        config.border,
        isDragOver ? "ring-2 ring-blue-400 ring-offset-2" : ""
      )}
    >
      <div className={cn("px-4 py-3 border-b flex items-center justify-between", config.border, config.headerBg)}>
        <h3 className={cn("font-semibold", config.color)}>{config.label}</h3>
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full bg-white/60", config.color)}>
          {tasks.length}
        </span>
      </div>
      
      <div 
        className={cn("flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar", config.bg)}
        style={{ maxHeight: '300px', minHeight: '300px' }}
      >
        {tasks.map((task) => (
            <div
                key={task.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.stopPropagation();
                    const sourceId = e.dataTransfer.getData('taskId');
                    if (sourceId !== task.id) {
                         updateTask(sourceId, { priority });
                         reorderTasks(sourceId, task.id);
                    }
                }}
            >
                <TaskCard task={task} />
            </div>
        ))}
        {tasks.length === 0 && (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm italic min-h-[100px]">
                暂无任务
            </div>
        )}
      </div>
    </div>
  );
};
