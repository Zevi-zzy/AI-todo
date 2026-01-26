import React from 'react';
import { Header } from './components/Header';
import { TaskInput } from './components/TaskInput';
import { QuadrantMatrix } from './components/QuadrantMatrix';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <TaskInput />
        <QuadrantMatrix />
      </main>
      <footer className="py-6 text-center text-gray-400 text-sm">
        <p>Zevi AI to-do &copy; {new Date().getFullYear()}</p>
        <p className="mt-1 text-xs text-gray-300">本地存储 • 数据安全 • 极简高效</p>
      </footer>
    </div>
  );
}

export default App;
