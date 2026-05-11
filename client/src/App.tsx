import { createSignal, createEffect, onMount, batch } from 'solid-js';
import { fetchKnowledgeTree, updateLearnStatus } from './api';
import { buildTree, calculatePositions, toggleExpand, findNode } from './tree';
import type { TreeNode } from './tree';
import { KnowledgeCanvas } from './KnowledgeCanvas';

export default function App() {
  const [treeNodes, setTreeNodes] = createSignal<TreeNode[]>([]);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      const nodes = await fetchKnowledgeTree();
      const tree = buildTree(nodes);
      calculatePositions(tree, 0, 0);
      setTreeNodes(tree);
    } catch (err) {
      console.error('Failed to load knowledge tree:', err);
    } finally {
      setLoading(false);
    }
  });

  const handleNodeClick = (node: TreeNode) => {
    batch(() => {
      const currentNodes = treeNodes();
      toggleExpand(currentNodes, node);
      setTreeNodes([...currentNodes]);
    });
  };

  const handleNodeRightClick = async (node: TreeNode) => {
    try {
      await updateLearnStatus(node.id, !node.isLearned);
      const found = findNode(treeNodes(), node.id);
      if (found) {
        found.isLearned = !found.isLearned;
        setTreeNodes([...treeNodes()]);
      }
    } catch (err) {
      console.error('Failed to update learn status:', err);
    }
  };

  return (
    <div class="app-container">
      <div class="header">
        <h1>知识体系可视化</h1>
        <p>点击节点展开/收起，右键标记学习状态</p>
      </div>

      <div class="legend">
        <div class="legend-title">图例</div>
        <div class="legend-item">
          <span class="legend-dot learned" />
          已学习
        </div>
        <div class="legend-item">
          <span class="legend-dot unlearned" />
          未学习
        </div>
      </div>

      <div class="hint">滚轮缩放 · 拖拽平移 · 点击展开 · 右键标记</div>

      {loading() ? (
        <div class="loading">加载中...</div>
      ) : (
        <KnowledgeCanvas
          nodes={treeNodes()}
          onNodeClick={handleNodeClick}
          onNodeRightClick={handleNodeRightClick}
        />
      )}
    </div>
  );
}
