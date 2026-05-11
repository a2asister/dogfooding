import type { KnowledgeNodeData } from './api';

export interface TreeNode extends KnowledgeNodeData {
  children: TreeNode[];
  x: number;
  y: number;
  expanded: boolean;
  visible: boolean;
  delay: number;
  level: number;
  angle: number;
}

const LEVEL_SPACING = 150;
const INITIAL_CHILDREN_ANGLE_DEG = 120;

export function buildTree(nodes: KnowledgeNodeData[]): TreeNode[] {
  const nodeMap = new Map<number, TreeNode>();

  nodes.forEach((node) => {
    nodeMap.set(node.id, {
      ...node,
      children: [],
      x: 0,
      y: 0,
      expanded: !node.parentId,
      visible: !node.parentId,
      delay: 0,
      level: 0,
      angle: 90,
    });
  });

  const roots: TreeNode[] = [];

  nodes.forEach((node) => {
    const treeNode = nodeMap.get(node.id)!;
    if (node.parentId && nodeMap.has(node.parentId)) {
      const parent = nodeMap.get(node.parentId)!;
      parent.children.push(treeNode);
    } else {
      roots.push(treeNode);
    }
  });

  nodeMap.forEach((n) => {
    n.children.sort((a, b) => a.orderIndex - b.orderIndex);
  });

  return roots;
}

function getNodeById(roots: TreeNode[], id: number): TreeNode | null {
  function search(node: TreeNode): TreeNode | null {
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = search(child);
      if (found) return found;
    }
    return null;
  }

  for (const root of roots) {
    const found = search(root);
    if (found) return found;
  }
  return null;
}

function getParent(roots: TreeNode[], node: TreeNode): TreeNode | null {
  if (!node.parentId) return null;
  return getNodeById(roots, node.parentId);
}

function getNodeLevel(roots: TreeNode[], node: TreeNode): number {
  let level = 0;
  let current = node;
  while (current.parentId) {
    level++;
    const parent = getParent(roots, current);
    if (!parent) break;
    current = parent;
  }
  return level;
}

function getNodeAngle(roots: TreeNode[], node: TreeNode): number {
  const parent = getParent(roots, node);
  if (!parent) return 90;

  const dx = node.x - parent.x;
  const dy = node.y - parent.y;
  if (dx === 0 && dy === 0) return parent.angle;

  const angleRad = Math.atan2(dy, dx);
  return (angleRad * 180) / Math.PI;
}

function calculateNodePositions(
  node: TreeNode,
  parentX: number,
  parentY: number,
  baseAngle: number,
  spreadAngle: number,
  delay: number,
) {
  node.visible = true;
  node.delay = delay;
  node.angle = baseAngle;

  const childrenCount = node.children.length;

  if (childrenCount === 0) return;

  const startAngle = baseAngle - spreadAngle / 2;
  const angleStep = childrenCount === 1 ? 0 : spreadAngle / (childrenCount - 1);

  node.children.forEach((child, index) => {
    let angle = startAngle + angleStep * index;
    if (childrenCount === 1) {
      angle = baseAngle;
    }

    const distance = LEVEL_SPACING;
    const rad = (angle * Math.PI) / 180;

    child.x = parentX + Math.cos(rad) * distance;
    child.y = parentY + Math.sin(rad) * distance;

    const nextSpread = Math.max(spreadAngle * 0.7, 60);

    calculateNodePositions(
      child,
      child.x,
      child.y,
      angle,
      nextSpread,
      delay + 0.12 * (index + 1),
    );
  });
}

function hideDescendants(node: TreeNode) {
  node.visible = false;
  node.children.forEach(hideDescendants);
}

export function calculatePositions(roots: TreeNode[], centerX: number, centerY: number): void {
  roots.forEach((root) => {
    root.x = centerX;
    root.y = centerY;
    root.visible = true;
    root.delay = 0;
    root.level = 0;
    root.angle = 90;

    if (root.expanded) {
      calculateNodePositions(root, centerX, centerY, 90, INITIAL_CHILDREN_ANGLE_DEG, 0.12);
    } else {
      root.children.forEach((child) => {
        child.visible = false;
        hideDescendants(child);
      });
    }
  });
}

export function toggleExpand(roots: TreeNode[], node: TreeNode): void {
  if (node.children.length === 0) return;

  node.expanded = !node.expanded;

  if (node.expanded) {
    const level = getNodeLevel(roots, node);
    const spread = Math.max(INITIAL_CHILDREN_ANGLE_DEG * Math.pow(0.7, level), 60);
    const angle = getNodeAngle(roots, node);
    calculateNodePositions(node, node.x, node.y, angle, spread, 0.12);
  } else {
    node.children.forEach((child) => {
      child.visible = false;
      hideDescendants(child);
    });
  }
}

export function getEdges(nodes: TreeNode[]): { from: TreeNode; to: TreeNode }[] {
  const edges: { from: TreeNode; to: TreeNode }[] = [];

  function traverse(node: TreeNode) {
    if (!node.expanded) return;
    node.children.forEach((child) => {
      if (child.visible) {
        edges.push({ from: node, to: child });
      }
      traverse(child);
    });
  }

  nodes.forEach(traverse);
  return edges;
}

export function getAllVisibleNodes(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];

  function collect(node: TreeNode) {
    if (node.visible) {
      result.push(node);
    }
    if (node.expanded) {
      node.children.forEach(collect);
    }
  }

  nodes.forEach(collect);
  return result;
}

export function findNode(nodes: TreeNode[], id: number): TreeNode | undefined {
  function search(node: TreeNode): TreeNode | undefined {
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = search(child);
      if (found) return found;
    }
    return undefined;
  }

  for (const root of nodes) {
    const found = search(root);
    if (found) return found;
  }
  return undefined;
}
