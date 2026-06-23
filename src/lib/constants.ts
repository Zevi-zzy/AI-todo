import { Priority } from '../types';

export const OVERDUE_ARCHIVE_DAYS = 14;
export const OVERDUE_ARCHIVE_MS = OVERDUE_ARCHIVE_DAYS * 24 * 60 * 60 * 1000;

// 从逾期收纳箱恢复任务时可直接选择的预设理由
export const RESTORE_REASONS = [
  '重新开始处理',
  '仍然需要 · 误归档',
  '暂缓保留，稍后再做',
  '重新评估优先级',
  '其他',
] as const;

// 从逾期收纳箱彻底删除任务时可选择的预设理由
export const DELETE_REASONS = [
  '已不再需要',
  '计划调整 / 取消',
  '重复任务',
  '已通过其他方式完成',
] as const;

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; border: string; headerBg: string }> = {
  'urgent-important': {
    label: '重要且紧急',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    headerBg: 'bg-red-100'
  },
  'not-urgent-important': {
    label: '重要不紧急',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    headerBg: 'bg-blue-100'
  },
  'urgent-not-important': {
    label: '紧急不重要',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    headerBg: 'bg-yellow-100'
  },
  'not-urgent-not-important': {
    label: '不重要不紧急',
    color: 'text-gray-700',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    headerBg: 'bg-gray-100'
  }
};
