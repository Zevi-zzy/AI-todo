import React, { useMemo, useState } from 'react';
import { Archive, Search, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Task } from '../types';
import { cn } from '../lib/utils';
import { ArchivedTaskCard } from './ArchivedTaskCard';
import { DeleteReasonDialog } from './DeleteReasonDialog';

interface ArchiveDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const ArchiveDrawer: React.FC<ArchiveDrawerProps> = ({ open, onClose }) => {
  const { tasks, restoreTask, deleteArchivedTask } = useStore();
  const [query, setQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const archivedTasks = useMemo(() => {
    const filtered = tasks.filter((t) => t.isArchived);
    const q = query.trim().toLowerCase();
    const searched = q ? filtered.filter((t) => t.content.toLowerCase().includes(q)) : filtered;
    return searched.sort((a, b) => {
      const aKey = (typeof a.archivedAt === 'number' ? a.archivedAt : a.updatedAt) ?? 0;
      const bKey = (typeof b.archivedAt === 'number' ? b.archivedAt : b.updatedAt) ?? 0;
      return bKey - aKey;
    });
  }, [tasks, query]);

  const totalArchivedCount = useMemo(() => tasks.filter((t) => t.isArchived).length, [tasks]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
        aria-label="关闭收纳箱"
      />
      <div className="absolute right-0 top-0 h-full w-[92vw] max-w-md bg-white shadow-2xl border-l border-gray-100 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Archive className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-gray-900">逾期收纳箱</h2>
            <p className="text-xs text-gray-400">共 {totalArchivedCount} 条</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索收纳箱..."
              className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                aria-label="清空搜索"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            会自动收纳最后编辑时间超过 14 天且未完成的任务。
          </p>
        </div>

        <div className={cn("flex-1 overflow-y-auto px-5 py-4", archivedTasks.length ? "space-y-3" : "")}>
          {archivedTasks.length ? (
            archivedTasks.map((t) => (
              <ArchivedTaskCard
                key={t.id}
                task={t}
                onRestore={() => restoreTask(t.id)}
                onDelete={() => setDeleteTarget(t)}
              />
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              暂无收纳任务
            </div>
          )}
        </div>
      </div>

      <DeleteReasonDialog
        open={Boolean(deleteTarget)}
        title="彻底删除任务"
        confirmText="删除并记录原因"
        onClose={() => setDeleteTarget(null)}
        onConfirm={(reason) => {
          if (!deleteTarget) return;
          deleteArchivedTask(deleteTarget.id, reason);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};

