import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, Wand2, Loader2, Briefcase, User, MoreHorizontal } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Priority, TaskCategory } from '../types';
import { PRIORITY_CONFIG } from '../lib/constants';
import { cn } from '../lib/utils';
import { optimizeTaskWithAI } from '../services/ai';

export const TaskInput: React.FC = () => {
  const { addTask, currentCategory } = useStore();
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Priority>('urgent-important');
  const [category, setCategory] = useState<TaskCategory>(currentCategory);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  // 当全局分类改变时，更新输入框的默认分类
  useEffect(() => {
    setCategory(currentCategory);
  }, [currentCategory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addTask(content, priority, category);
    setContent('');
  };

  const handleAIOptimize = async () => {
    if (!content.trim() || isOptimizing) return;
    
    setIsOptimizing(true);
    try {
      const optimized = await optimizeTaskWithAI(content);
      setContent(optimized);
    } catch (error) {
      console.error('Failed to optimize:', error);
      // 可以添加一个简单的 toast 提示用户
    } finally {
      setIsOptimizing(false);
    }
  };

  const currentConfig = PRIORITY_CONFIG[priority];

  const categories: { value: TaskCategory; label: string; icon: React.FC<any> }[] = [
    { value: 'work', label: '工作', icon: Briefcase },
    { value: 'personal', label: '个人', icon: User },
    { value: 'other', label: '其他', icon: MoreHorizontal },
  ];

  const currentCategoryConfig = categories.find(c => c.value === category) || categories[0];

  return (
    <div className="w-full max-w-3xl mx-auto my-6 px-4">
      <form onSubmit={handleSubmit} className="relative flex items-center shadow-md rounded-xl bg-white border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
        {/* 优先级选择器 */}
        <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 border-r border-gray-200 hover:bg-gray-50 rounded-l-xl transition-colors min-w-[140px]",
                currentConfig.color
              )}
            >
              <span className="text-sm font-medium truncate">{currentConfig.label}</span>
              <ChevronDown className="w-4 h-4 opacity-50 ml-auto" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPriority(p);
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors",
                      p === priority ? "bg-blue-50/50" : ""
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full bg-current", PRIORITY_CONFIG[p].color)} />
                    <span className={cn(PRIORITY_CONFIG[p].color)}>{PRIORITY_CONFIG[p].label}</span>
                  </button>
                ))}
              </div>
            )}
        </div>

        {/* 分类选择器 */}
        <div className="relative border-r border-gray-200" ref={categoryMenuRef}>
            <button
              type="button"
              onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              className="flex items-center gap-2 px-3 py-3 hover:bg-gray-50 transition-colors text-gray-600"
              title="选择任务分类"
            >
              <currentCategoryConfig.icon className="w-4 h-4" />
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
            
            {isCategoryMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                {categories.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      setCategory(c.value);
                      setIsCategoryMenuOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors",
                      c.value === category ? "bg-blue-50 text-blue-600" : "text-gray-700"
                    )}
                  >
                    <c.icon className="w-4 h-4" />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            )}
        </div>

        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`输入${currentCategoryConfig.label}任务，按 Enter 创建...`}
          className="flex-1 px-4 py-3 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
        />
        
        {content.trim() && (
          <button
            type="button"
            onClick={handleAIOptimize}
            disabled={isOptimizing}
            className="p-2 text-purple-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors mr-1"
            title="AI 优化任务描述"
          >
            {isOptimizing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Wand2 className="w-5 h-5" />
            )}
          </button>
        )}

        <button
          type="submit"
          disabled={!content.trim()}
          className="mr-2 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
