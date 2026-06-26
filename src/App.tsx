import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { TaskInput } from './components/TaskInput';
import { QuadrantMatrix } from './components/QuadrantMatrix';
import { useStore } from './store/useStore';

function App() {
  const init = useStore((s) => s.init);
  const refresh = useStore((s) => s.refresh);

  useEffect(() => {
    init();
    // 定时轮询 + 窗口重新聚焦时刷新，让 Agent 在命令行做的改动也同步到页面。
    const timer = window.setInterval(refresh, 5000);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [init, refresh]);

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
