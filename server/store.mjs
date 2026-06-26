// 文件存储：唯一真相源 数据/store.json，原子写入。
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeState, defaultState } from './domain.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = join(__dirname, '..');
export const STORE_PATH = process.env.ZEVI_TODO_STORE || join(PROJECT_ROOT, '数据', 'store.json');
export const PORT = Number(process.env.ZEVI_TODO_PORT) || 3456;

export async function loadState() {
  try {
    const raw = await readFile(STORE_PATH, 'utf8');
    return normalizeState(JSON.parse(raw));
  } catch (err) {
    if (err.code === 'ENOENT') return defaultState();
    // 文件损坏时不静默丢数据，直接报错，由调用方决定如何处理
    throw new Error(`读取 ${STORE_PATH} 失败：${err.message}`);
  }
}

export async function saveState(state) {
  await mkdir(dirname(STORE_PATH), { recursive: true });
  const tmp = `${STORE_PATH}.tmp`;
  await writeFile(tmp, JSON.stringify(state, null, 2), 'utf8');
  await rename(tmp, STORE_PATH); // 原子替换
}

// 读取-变更-写回。fn(state) 须返回 { state, ... }，并把其余字段透传给调用方。
export async function mutate(fn) {
  const state = await loadState();
  const result = fn(state);
  await saveState(result.state);
  return result;
}
