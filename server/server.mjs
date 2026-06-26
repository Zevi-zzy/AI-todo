// 本地后端 API：为网页提供读写，数据落到 数据/store.json。
import { createServer } from 'node:http';
import { loadState, saveState, mutate, PORT, STORE_PATH } from './store.mjs';
import { normalizeState } from './domain.mjs';
import * as domain from './domain.mjs';

function send(res, code, body) {
  const data = JSON.stringify(body);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 5_000_000) reject(new Error('请求体过大'));
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('请求体不是合法 JSON'));
      }
    });
    req.on('error', reject);
  });
}

// 变更后统一返回给前端的精简视图
function view(state, task) {
  return { ok: true, task: task ?? undefined, tasks: state.tasks, user: state.user };
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;
    const method = req.method;

    if (method === 'OPTIONS') return send(res, 204, {});

    // GET /api/state —— 前端启动/轮询拉取
    if (method === 'GET' && path === '/api/state') {
      const state = await loadState();
      return send(res, 200, {
        tasks: state.tasks,
        user: state.user,
        viewPreference: state.viewPreference,
      });
    }

    // GET /api/export —— 完整备份
    if (method === 'GET' && path === '/api/export') {
      const state = await loadState();
      return send(res, 200, { ...state, timestamp: Date.now() });
    }

    // POST /api/import —— 覆盖导入（备份恢复 / 从 LocalStorage 迁移）
    if (method === 'POST' && path === '/api/import') {
      const body = await readBody(req);
      const incoming = body && body.tasks ? body : body.state || body;
      const next = normalizeState(incoming);
      await saveState(next);
      return send(res, 200, view(next));
    }

    // POST /api/tasks —— 新建
    if (method === 'POST' && path === '/api/tasks') {
      const body = await readBody(req);
      const { state, task } = await mutate((s) => domain.addTask(s, body));
      return send(res, 201, view(state, task));
    }

    // POST /api/tasks/reorder —— 拖拽排序
    if (method === 'POST' && path === '/api/tasks/reorder') {
      const { activeId, overId } = await readBody(req);
      const { state, task } = await mutate((s) => domain.reorderTasks(s, activeId, overId));
      return send(res, 200, view(state, task));
    }

    // PUT /api/view —— 保存时间视图偏好
    if (method === 'PUT' && path === '/api/view') {
      const { view: v } = await readBody(req);
      const { state } = await mutate((s) => ({ state: { ...s, viewPreference: v } }));
      return send(res, 200, { ok: true, viewPreference: state.viewPreference });
    }

    // /api/tasks/:id[/action]
    const m = path.match(/^\/api\/tasks\/([^/]+)(?:\/(toggle|restore|archive-delete))?$/);
    if (m) {
      const id = decodeURIComponent(m[1]);
      const action = m[2];
      const body = ['POST', 'PATCH', 'PUT'].includes(method) ? await readBody(req) : {};

      if (method === 'PATCH' && !action) {
        const { state, task } = await mutate((s) => domain.updateTask(s, id, body));
        return send(res, 200, view(state, task));
      }
      if (method === 'DELETE' && !action) {
        const { state, task } = await mutate((s) => domain.deleteTask(s, id));
        return send(res, 200, view(state, task));
      }
      if (method === 'POST' && action === 'toggle') {
        const { state, task } = await mutate((s) => domain.toggleStatus(s, id, body.status));
        return send(res, 200, view(state, task));
      }
      if (method === 'POST' && action === 'restore') {
        const { state, task } = await mutate((s) => domain.restoreTask(s, id, body.reason));
        return send(res, 200, view(state, task));
      }
      if (method === 'POST' && action === 'archive-delete') {
        const { state, task } = await mutate((s) => domain.deleteArchivedTask(s, id, body.reason));
        return send(res, 200, view(state, task));
      }
    }

    return send(res, 404, { ok: false, error: 'Not Found: ' + method + ' ' + path });
  } catch (err) {
    send(res, 400, { ok: false, error: err.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[zevi-todo] 后端已启动 http://127.0.0.1:${PORT}  数据文件: ${STORE_PATH}`);
});
