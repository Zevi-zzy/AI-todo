import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { DELETE_REASONS } from '../lib/constants';

interface DeleteReasonDialogProps {
  open: boolean;
  title?: string;
  confirmText?: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const DeleteReasonDialog: React.FC<DeleteReasonDialogProps> = ({
  open,
  title = '填写删除原因',
  confirmText = '确认删除',
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) setReason('');
  }, [open]);

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
          <h3 className="font-semibold text-gray-900">{title}</h3>
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
          <p className="mb-3 text-sm text-gray-500">请选择删除原因：</p>
          <div className="grid gap-2">
            {DELETE_REASONS.map((item) => {
              const selected = reason === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setReason(item)}
                  className={cn(
                    'flex items-center gap-2 w-full text-left px-3 py-2.5 text-sm rounded-lg border transition-colors',
                    selected
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50/50'
                  )}
                >
                  <span
                    className={cn(
                      'flex items-center justify-center w-4 h-4 rounded-full border flex-shrink-0',
                      selected ? 'border-red-500 bg-red-500 text-white' : 'border-gray-300'
                    )}
                  >
                    {selected && <Check className="w-3 h-3" />}
                  </span>
                  {item}
                </button>
              );
            })}
          </div>
          <p className={cn('mt-3 text-xs', reason ? 'text-gray-400' : 'text-red-500')}>
            {reason ? '删除原因会写入本地删除记录（随备份导出）。' : '请先选择一个删除原因。'}
          </p>
        </div>
        <div className="px-5 pb-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!reason}
            onClick={() => onConfirm(reason)}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
