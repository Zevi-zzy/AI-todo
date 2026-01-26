import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { TimeFilter } from './TimeFilter';
import { CategoryFilter } from './CategoryFilter';
import { LevelProgress } from './LevelProgress';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <LayoutGrid className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden md:block">
            Zevi AI to-do
          </h1>
          <CategoryFilter />
        </div>
        
        <div className="flex items-center">
          <LevelProgress />
          <TimeFilter />
        </div>
      </div>
    </header>
  );
};
