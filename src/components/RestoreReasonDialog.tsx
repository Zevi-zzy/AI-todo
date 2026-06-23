import React, { useEffect } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { RESTORE_REASONS } from '../lib/constants';

interface RestoreReasonDialogProps {
  open: boolean;
  taskContent?: string;
  onClose: () => void;
  onSelect: (reason: string) => void;
}

export const RestoreReasonDialog: React.FC<RestoreReasonDialogProps> = ({
  open,
  taskContent,
  onClose,
  onSelect,
}) => {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-label="关闭"
      />
      <div className="relative w-[92vw] max-w-lg rounded-xl bg-white shadow-xl border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">选择恢复理由</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4">
          {taskContent && (
            <p className="mb-3 text-sm text-gray-500 break-words line-clamp-2">
              「{taskContent}」
            </p>
          )}
          <div className="grid gap-2">
            {RESTORE_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => onSelect(reason)}
                className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-sm rounded-lg border border-gray-200 text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4 flex-shrink-0 text-gray-400" />
                {reason}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-400">
            选择后任务立即回到主列表，恢复理由会写入本地恢复记录（随备份导出）。
          </p>
        </div>
      </div>
    </div>
  );
};
