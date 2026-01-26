import { Priority } from '../types';

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
