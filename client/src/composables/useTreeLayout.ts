import { ref, computed, watch, type Ref } from 'vue';
import type { KnowledgeNode, PositionedNode, Connection } from '../types';

const NODE_RADIUS = 45;
const NODE_DIAMETER = NODE_RADIUS * 2;
const BASE_SPACING = 200;
const LAYER_SPACING_MULTIPLIER = 0.95;
const MIN_ANGLE_SPACING = Math.PI / 5;
const ROOT_ANGLE_SPREAD = Math.PI * 0.9;

export function useTreeLayout(treeNodes: Ref<KnowledgeNode[]>) {
  const expandedSet = ref<Set<string>>(new Set());

  const rootId = computed(() => treeNodes.value[0]?.id ?? null);

  watch(
    treeNodes,
    (nodes) => {
      if (nodes && nodes.length > 0 && rootId.value) {
        expandedSet.value.add(rootId.value);
      }
    },
    { immediate: true }
  );

  function calculateChildAngles(
    parentAngle: number,
    childCount: number,
    isRoot: boolean
  ): number[] {
    const angles: number[] = [];
    if (childCount === 0) return angles;
    if (childCount === 1) {
      angles.push(parentAngle);
      return angles;
    }

    const minSpread = MIN_ANGLE_SPACING * (childCount - 1);
    const maxSpread = isRoot ? Math.min(Math.PI * 0.95, Math.PI * 1.2) : Math.min(Math.PI * 0.8, Math.PI * 1.0);
    const totalSpread = Math.max(minSpread, isRoot ? ROOT_ANGLE_SPREAD : Math.PI * 0.65);
    const finalSpread = Math.min(totalSpread, maxSpread);

    const startAngle = parentAngle - finalSpread / 2;
    const angleStep = childCount === 1 ? 0 : finalSpread / (childCount - 1);

    for (let i = 0; i < childCount; i++) {
      angles.push(startAngle + i * angleStep);
    }

    return angles;
  }

  function calculateLayout(): { nodes: PositionedNode[]; connections: Connection[] } {
    const nodes: PositionedNode[] = [];
    const connections: Connection[] = [];

    if (!treeNodes.value || treeNodes.value.length === 0) {
      return { nodes, connections };
    }

    const root = treeNodes.value[0];
    const rootNode: PositionedNode = {
      ...root,
      x: 0,
      y: 0,
      expanded: true,
      animationDelay: 0,
      visible: true
    };
    nodes.push(rootNode);

    function countSubtreeNodes(node: KnowledgeNode): number {
      if (!node.children || node.children.length === 0) return 1;
      let count = 1;
      for (const child of node.children) {
        if (expandedSet.value.has(child.id)) {
          count += countSubtreeNodes(child);
        } else {
          count += 1;
        }
      }
      return count;
    }

    function traverse(
      parent: KnowledgeNode,
      parentX: number,
      parentY: number,
      parentAngle: number,
      layer: number,
      baseDelay: number
    ) {
      if (!parent.children || parent.children.length === 0) return;

      const isRootExpanded = parent.id === rootId.value;
      const isExpanded = isRootExpanded || expandedSet.value.has(parent.id);

      if (!isExpanded) return;

      const children = parent.children;
      const count = children.length;
      const isRoot = parent.id === rootId.value;

      const childWeights = children.map((child) =>
        expandedSet.value.has(child.id) ? countSubtreeNodes(child) : 1
      );
      const maxWeight = Math.max(...childWeights, 1);
      const totalWeight = childWeights.reduce((a, b) => a + b, 0);

      const avgWeight = totalWeight / count;
      const spacingMultiplier = Math.max(1, Math.min(2.5, 1 + avgWeight * 0.15));
      const countMultiplier = Math.max(1, count > 3 ? 1 + (count - 3) * 0.1 : 1);
      const spacing = BASE_SPACING * Math.pow(LAYER_SPACING_MULTIPLIER, layer) * spacingMultiplier * countMultiplier;

      const angles = calculateChildAngles(parentAngle, count, isRoot);

      for (let i = 0; i < count; i++) {
        const child = children[i];
        const angle = angles[i];

        const childWeight = childWeights[i];
        const individualSpacing = spacing * (1 + (childWeight - 1) * 0.1);

        const x = parentX + individualSpacing * Math.cos(angle);
        const y = parentY + individualSpacing * Math.sin(angle);
        const nodeDelay = baseDelay + i * 160;
        const childExpanded = expandedSet.value.has(child.id);

        const positionedNode: PositionedNode = {
          ...child,
          x,
          y,
          expanded: childExpanded,
          animationDelay: nodeDelay,
          visible: true
        };

        nodes.push(positionedNode);

        connections.push({
          id: `${parent.id}-${child.id}`,
          fromX: parentX,
          fromY: parentY,
          toX: x,
          toY: y,
          fromId: parent.id,
          toId: child.id,
          animationDelay: nodeDelay + 100
        });

        if (childExpanded && child.children && child.children.length > 0) {
          traverse(child, x, y, angle, layer + 1, nodeDelay + 380);
        }
      }
    }

    traverse(root, 0, 0, -Math.PI / 2, 0, 150);

    return { nodes, connections };
  }

  const layout = computed(() => {
    return calculateLayout();
  });

  function toggleExpand(nodeId: string) {
    if (expandedSet.value.has(nodeId)) {
      expandedSet.value.delete(nodeId);
    } else {
      expandedSet.value.add(nodeId);
    }
  }

  function isExpanded(nodeId: string): boolean {
    return nodeId === rootId.value || expandedSet.value.has(nodeId);
  }

  return {
    layout,
    toggleExpand,
    isExpanded,
    expandedSet,
    NODE_RADIUS
  };
}
