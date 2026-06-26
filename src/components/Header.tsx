import React, { useRef, useState } from 'react';
import { LayoutGrid, Download, Upload, Search, X, Archive, BookOpen } from 'lucide-react';
import { TimeFilter } from './TimeFilter';
import { CategoryFilter } from './CategoryFilter';
import { LevelProgress } from './LevelProgress';
import { Api } from '../services/api';
import { useStore } from '../store/useStore';
import { ArchiveDrawer } from './ArchiveDrawer';
import { UserManualDialog } from './UserManualDialog';

export const Header: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const { searchQuery, setSearchQuery, tasks } = useStore();
  const archivedCount = tasks.filter((t) => t.isArchived).length;

  const handleExport = async () => {
    const state = await Api.exportData();
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zevi-todo-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        if (window.confirm('导入将覆盖当前所有数据，确定要继续吗？')) {
          try {
            await Api.importData(content);
            alert('数据导入成功！页面即将刷新。');
            window.location.reload();
          } catch (err) {
            console.error(err);
            alert('数据导入失败，请检查文件格式。');
          }
        }
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center gap-3 flex-nowrap overflow-x-hidden">
            <div className="flex items-center space-x-3 flex-nowrap shrink-0">
              <div className="bg-blue-600 p-2 rounded-lg">
                <LayoutGrid className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden md:block">
                Zevi AI to-do
              </h1>
              <CategoryFilter />
            </div>

            <div className="ml-auto flex items-center gap-3 flex-nowrap shrink-0">
              <div className="hidden sm:block">
                <LevelProgress />
              </div>
              <TimeFilter />

              <div className="flex items-center gap-1 border-l pl-4 border-gray-200 flex-nowrap">
                <div className="relative shrink-0">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索任务..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-28 sm:w-36 md:w-44 lg:w-48 placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setArchiveOpen(true)}
                  className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                  title="逾期收纳箱"
                >
                  <Archive className="w-5 h-5" />
                  {archivedCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] leading-4 text-center">
                      {archivedCount > 99 ? '99+' : archivedCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setManualOpen(true)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                  title="使用手册"
                >
                  <BookOpen className="w-5 h-5" />
                </button>

                <button
                  onClick={handleExport}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                  title="导出数据备份"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={handleImportClick}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                  title="导入数据恢复"
                >
                  <Upload className="w-5 h-5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {searchQuery && (
            <div className="pb-3 flex items-center gap-2 text-sm text-gray-500">
              <Search className="w-4 h-4" />
              <span>搜索结果：</span>
              <span className="font-medium text-gray-700">"{searchQuery}"</span>
              <button
                onClick={() => setSearchQuery('')}
                className="ml-auto p-1 hover:bg-gray-100 rounded"
                title="清除搜索"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      <ArchiveDrawer open={archiveOpen} onClose={() => setArchiveOpen(false)} />
      <UserManualDialog open={manualOpen} onClose={() => setManualOpen(false)} />
    </>
  );
};
