import React, { useEffect } from 'react';
import { BookOpen, X } from 'lucide-react';

interface UserManualDialogProps {
  open: boolean;
  onClose: () => void;
}

export const UserManualDialog: React.FC<UserManualDialogProps> = ({ open, onClose }) => {
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
        aria-label="关闭使用手册"
      />
      <div className="relative w-[94vw] max-w-3xl max-h-[88vh] rounded-xl bg-white shadow-xl border border-gray-100 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-semibold text-gray-900">使用手册</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 text-sm text-gray-700">
          <div className="space-y-6">
            <section>
              <h3 className="text-base font-semibold text-gray-900">核心理念：四象限</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-600">
                <li>重要且紧急：立即处理</li>
                <li>重要不紧急：规划推进</li>
                <li>紧急不重要：尽量委托/减少</li>
                <li>不重要不紧急：减少或删除</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold text-gray-900">创建任务</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-600">
                <li>顶部输入框：选择象限（优先级）与分类，输入内容后按 Enter 创建</li>
                <li>AI 魔法棒：输入内容后点击右侧魔法棒，可一键优化任务描述（需配置 Key）</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold text-gray-900">编辑与完成</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-600">
                <li>编辑：点击任务文字进入编辑；Enter 保存；Esc 取消；点击空白处自动保存</li>
                <li>完成：点击任务左侧圆圈切换完成/未完成</li>
                <li>删除：悬停任务右侧出现删除按钮，点击后确认删除</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold text-gray-900">拖拽与排序</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-600">
                <li>象限内排序：拖拽任务到目标位置</li>
                <li>跨象限流转：把任务拖到其他象限，优先级会自动更新</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold text-gray-900">筛选与搜索</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-600">
                <li>分类筛选：顶部“工作 / 个人 / 其他”切换</li>
                <li>时间视图：今日 / 本周 / 本月 / 全部</li>
                <li>搜索：右上角搜索框输入关键词</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold text-gray-900">数据备份与恢复</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-600">
                <li>导出：点击右上角下载图标，保存 .json 备份</li>
                <li>导入：点击右上角上传图标，选择 .json 恢复（会覆盖当前数据）</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold text-gray-900">逾期收纳箱（新）</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-600">
                <li>自动收纳：未完成任务如果“最后编辑时间”超过 14 天，会自动进入收纳箱，主界面不再显示</li>
                <li>恢复：在收纳箱点击恢复按钮，任务回到主列表</li>
                <li>彻底删除：在收纳箱删除必须填写原因；原因会写入本地删除记录，并随备份导出</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold text-gray-900">小技巧</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-600">
                <li>把真正关键的事放进“重要不紧急”，主动安排时间推进</li>
                <li>定期导出备份，便于迁移与防止浏览器数据丢失</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

