import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import type { KnowledgeNode, RawNode } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'knowledge.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id TEXT,
    learned INTEGER DEFAULT 0,
    description TEXT,
    FOREIGN KEY (parent_id) REFERENCES nodes(id) ON DELETE CASCADE
  )
`);

const count = db.prepare('SELECT COUNT(*) as count FROM nodes').get() as { count: number };

if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO nodes (id, name, parent_id, learned, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  const seedData: Array<[string, string, string | null, number, string]> = [
    ['root', '知识体系总览', null, 1, '涵盖计算机科学、数学、物理等核心学科领域的知识节点'],
    ['cs', '计算机科学', 'root', 1, '计算机科学的核心概念与基础理论'],
    ['math', '数学', 'root', 0, '数学的基础理论与应用'],
    ['physics', '物理学', 'root', 0, '物理学的基本原理与现象'],
    ['algo', '算法与数据结构', 'cs', 1, '算法设计与分析、数据结构原理'],
    ['network', '计算机网络', 'cs', 0, '网络协议、通信原理'],
    ['os', '操作系统', 'cs', 0, '操作系统原理、进程管理'],
    ['db', '数据库', 'cs', 1, '数据库原理、SQL、NoSQL'],
    ['sort', '排序算法', 'algo', 1, '冒泡、快速、归并等经典排序算法'],
    ['search', '搜索算法', 'algo', 0, '二分查找、深度优先、广度优先'],
    ['tree', '树结构', 'algo', 1, '二叉树、平衡树、红黑树'],
    ['tcpip', 'TCP/IP 协议', 'network', 0, 'TCP/IP 四层模型'],
    ['http', 'HTTP 协议', 'network', 1, 'HTTP 请求响应、状态码'],
    ['process', '进程管理', 'os', 0, '进程调度、同步互斥'],
    ['memory', '内存管理', 'os', 0, '虚拟内存、页面置换'],
    ['sql', 'SQL 基础', 'db', 1, 'SQL 查询语句设计'],
    ['nosql', 'NoSQL', 'db', 0, 'MongoDB、Redis 等非关系型数据库'],
    ['linear', '线性代数', 'math', 0, '矩阵运算、向量空间'],
    ['calculus', '微积分', 'math', 1, '导数、积分、微分方程'],
    ['prob', '概率论', 'math', 0, '概率分布、随机变量'],
    ['mechanics', '力学', 'physics', 0, '牛顿力学、能量守恒'],
    ['em', '电磁学', 'physics', 0, '麦克斯韦方程、电磁波'],
    ['quantum', '量子物理', 'physics', 0, '量子力学基础']
  ];

  const transaction = db.transaction((data: typeof seedData) => {
    for (const row of data) {
      insert.run(row);
    }
  });

  transaction(seedData);
}

export function getAllNodes(): KnowledgeNode[] {
  const raw = db.prepare('SELECT * FROM nodes').all() as RawNode[];
  return raw.map(mapRawNode);
}

export function getNodeById(id: string): KnowledgeNode | undefined {
  const raw = db.prepare('SELECT * FROM nodes WHERE id = ?').get(id) as RawNode | undefined;
  if (!raw) return undefined;
  return mapRawNode(raw);
}

export function getChildrenByParentId(parentId: string | null): KnowledgeNode[] {
  const raw = parentId
    ? (db.prepare('SELECT * FROM nodes WHERE parent_id = ?').all(parentId) as RawNode[])
    : (db.prepare('SELECT * FROM nodes WHERE parent_id IS NULL').all() as RawNode[]);
  return raw.map(mapRawNode);
}

export function getTree(): KnowledgeNode[] {
  const all = getAllNodes();
  return buildTree(all);
}

export function getSubTree(id: string): KnowledgeNode | undefined {
  const node = getNodeById(id);
  if (!node) return undefined;
  const all = getAllNodes();
  return buildSubTree(node, all);
}

export function updateLearnedStatus(id: string, learned: boolean): boolean {
  const result = db.prepare('UPDATE nodes SET learned = ? WHERE id = ?').run(learned ? 1 : 0, id);
  return result.changes > 0;
}

function mapRawNode(raw: RawNode): KnowledgeNode {
  return {
    id: raw.id,
    name: raw.name,
    parentId: raw.parent_id,
    learned: raw.learned === 1,
    description: raw.description
  };
}

function buildTree(nodes: KnowledgeNode[]): KnowledgeNode[] {
  const map = new Map<string, KnowledgeNode>();
  const roots: KnowledgeNode[] = [];

  for (const node of nodes) {
    map.set(node.id, { ...node, children: [] });
  }

  for (const node of nodes) {
    const current = map.get(node.id)!;
    if (node.parentId && map.has(node.parentId)) {
      const parent = map.get(node.parentId)!;
      if (!parent.children) parent.children = [];
      parent.children.push(current);
    } else {
      roots.push(current);
    }
  }

  return roots;
}

function buildSubTree(root: KnowledgeNode, all: KnowledgeNode[]): KnowledgeNode {
  const build = (parentId: string): KnowledgeNode[] => {
    return all
      .filter(n => n.parentId === parentId)
      .map(n => ({ ...n, children: build(n.id) }));
  };
  return { ...root, children: build(root.id) };
}

export default db;
