import { createSignal, createMemo, createEffect, For, onMount, onCleanup, Show } from 'solid-js';
import type { TreeNode } from './tree';
import { getEdges, getAllVisibleNodes } from './tree';

interface Props {
  nodes: TreeNode[];
  onNodeClick: (node: TreeNode) => void;
  onNodeRightClick: (node: TreeNode) => void;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  title: string;
  description: string;
}

interface EnteringNode {
  id: number;
  delay: number;
  animKey: number;
}

export function KnowledgeCanvas(props: Props) {
  const [tooltip, setTooltip] = createSignal<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    title: '',
    description: '',
  });

  const [scale, setScale] = createSignal(1);
  const [translateX, setTranslateX] = createSignal(0);
  const [translateY, setTranslateY] = createSignal(0);
  const [isDragging, setIsDragging] = createSignal(false);
  const [ripples, setRipples] = createSignal<{ id: number; x: number; y: number }[]>([]);
  const [enteringNodes, setEnteringNodes] = createSignal<Map<number, EnteringNode>>(new Map());
  const [animCounter, setAnimCounter] = createSignal(0);

  let wrapperRef: HTMLDivElement | undefined;
  let dragStart = { x: 0, y: 0, tx: 0, ty: 0 };
  let rippleIdCounter = 0;

  const visibleNodes = createMemo(() => getAllVisibleNodes(props.nodes));
  const edges = createMemo(() => getEdges(props.nodes));

  let prevVisibleIds = new Set<number>();

  createEffect(() => {
    const current = visibleNodes();
    const currentIds = new Set(current.map(n => n.id));
    const newNodes: EnteringNode[] = [];

    current.forEach(node => {
      if (!prevVisibleIds.has(node.id) && node.delay > 0) {
        newNodes.push({
          id: node.id,
          delay: node.delay,
          animKey: animCounter(),
        });
      }
    });

    if (newNodes.length > 0) {
      const nextCounter = animCounter() + 1;
      setAnimCounter(nextCounter);

      const newMap = new Map(enteringNodes());
      newNodes.forEach(n => newMap.set(n.id, { ...n, animKey: nextCounter }));
      setEnteringNodes(newMap);

      const maxDelay = Math.max(...newNodes.map(n => n.delay));
      setTimeout(() => {
        setEnteringNodes(prev => {
          const next = new Map(prev);
          newNodes.forEach(n => {
            const existing = next.get(n.id);
            if (existing && existing.animKey === nextCounter) {
              next.delete(n.id);
            }
          });
          return next;
        });
      }, (maxDelay + 0.6) * 1000);
    }

    prevVisibleIds = currentIds;
  });

  const isEntering = (nodeId: number) => {
    return enteringNodes().has(nodeId);
  };

  const getEnterDelay = (nodeId: number) => {
    const entry = enteringNodes().get(nodeId);
    return entry ? entry.delay : 0;
  };

  const onZoomIn = () => setScale((s) => Math.min(s * 1.2, 3));
  const onZoomOut = () => setScale((s) => Math.max(s / 1.2, 0.3));
  const onZoomReset = () => {
    setScale(1);
    if (wrapperRef) {
      const rect = wrapperRef.getBoundingClientRect();
      setTranslateX(rect.width / 2);
      setTranslateY(rect.height / 2);
    }
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.3, Math.min(scale() * delta, 3));

    const rect = wrapperRef!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setTranslateX((tx) => mouseX - (mouseX - tx) * (newScale / scale()));
    setTranslateY((ty) => mouseY - (mouseY - ty) * (newScale / scale()));
    setScale(newScale);
  };

  const handleMouseDown = (e: MouseEvent) => {
    const target = e.target as Element;
    if (target.closest('.node-group')) return;
    setIsDragging(true);
    dragStart = {
      x: e.clientX,
      y: e.clientY,
      tx: translateX(),
      ty: translateY(),
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging()) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setTranslateX(dragStart.tx + dx);
      setTranslateY(dragStart.ty + dy);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  onMount(() => {
    const wrapper = wrapperRef;
    if (wrapper) {
      const rect = wrapper.getBoundingClientRect();
      setTranslateX(rect.width / 2);
      setTranslateY(rect.height / 2);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  });

  onCleanup(() => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  });

  const handleNodeClick = (node: TreeNode) => {
    if (node.children.length > 0) {
      const id = ++rippleIdCounter;
      setRipples((prev) => [...prev, { id, x: node.x, y: node.y }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 1000);
    }
    props.onNodeClick(node);
  };

  const handleNodeMouseEnter = (node: TreeNode, e: MouseEvent) => {
    setTooltip({
      visible: true,
      x: e.clientX + 15,
      y: e.clientY + 15,
      title: node.name,
      description: node.description || '暂无简介',
    });
  };

  const handleNodeMouseMove = (e: MouseEvent) => {
    if (tooltip().visible) {
      setTooltip((t) => ({ ...t, x: e.clientX + 15, y: e.clientY + 15 }));
    }
  };

  const handleNodeMouseLeave = () => {
    setTooltip((t) => ({ ...t, visible: false }));
  };

  const getNodeColor = (node: TreeNode) => {
    if (node.isLearned) {
      return {
        fill: '#1e3a5f',
        stroke: '#22c55e',
        glow: '#22c55e',
      };
    }
    return {
      fill: '#334155',
      stroke: '#64748b',
      glow: '#64748b',
    };
  };

  const getEdgePath = (from: TreeNode, to: TreeNode) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const cx1 = from.x + dx * 0.3;
    const cy1 = from.y + dy * 0.3 - 30;
    const cx2 = from.x + dx * 0.7;
    const cy2 = from.y + dy * 0.7 - 30;
    return `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`;
  };

  return (
    <div
      ref={wrapperRef}
      class={`canvas-wrapper ${isDragging() ? 'dragging' : ''}`}
      on:wheel={handleWheel}
      on:mousedown={handleMouseDown}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <filter id="glow-learned" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-hover" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g
          transform={`translate(${translateX()}, ${translateY()}) scale(${scale()})`}
        >
          <For each={edges()}>
            {(edge) => (
              <path
                d={getEdgePath(edge.from, edge.to)}
                fill="none"
                stroke={edge.from.isLearned && edge.to.isLearned ? '#22c55e' : '#475569'}
                stroke-width="2"
                class="edge-path"
                style={isEntering(edge.to.id) ? { 'animation-delay': `${getEnterDelay(edge.to.id)}s` } : {}}
              />
            )}
          </For>

          <For each={visibleNodes()}>
            {(node) => {
              const colors = getNodeColor(node);
              const entering = isEntering(node.id);
              return (
                <g
                  class="node-group"
                  classList={{ 'node-enter': entering }}
                  style={entering ? { 'animation-delay': `${getEnterDelay(node.id)}s` } : {}}
                  on:click={() => handleNodeClick(node)}
                  on:contextmenu={(e) => {
                    e.preventDefault();
                    props.onNodeRightClick(node);
                  }}
                  on:mouseenter={(e) => handleNodeMouseEnter(node, e)}
                  on:mousemove={handleNodeMouseMove}
                  on:mouseleave={handleNodeMouseLeave}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="50"
                    fill="transparent"
                    pointer-events="all"
                  />

                  <g transform={`translate(${node.x}, ${node.y})`}>
                    <g class="node-content">
                      <Show when={node.isLearned}>
                        <circle
                          cx="0"
                          cy="0"
                          r="42"
                          fill="none"
                          stroke={colors.stroke}
                          stroke-width="2"
                          opacity="0.5"
                          filter="url(#glow-learned)"
                          pointer-events="none"
                        />
                      </Show>

                      <circle
                        cx="0"
                        cy="0"
                        r="35"
                        fill={colors.fill}
                        stroke={colors.stroke}
                        stroke-width="3"
                        filter="url(#glow-hover)"
                        pointer-events="none"
                      />

                      <Show when={node.children.length > 0}>
                        <circle
                          cx="25"
                          cy="-25"
                          r="10"
                          fill={node.expanded ? '#f59e0b' : '#3b82f6'}
                          stroke="#0f172a"
                          stroke-width="2"
                          pointer-events="none"
                        />
                      </Show>
                    </g>

                    <text
                      x="0"
                      y="0"
                      text-anchor="middle"
                      dominant-baseline="middle"
                      fill="#e2e8f0"
                      font-size="12"
                      font-weight="600"
                      pointer-events="none"
                      style={{ 'user-select': 'none' }}
                    >
                      {node.name.length > 6 ? node.name.substring(0, 6) + '...' : node.name}
                    </text>
                  </g>
                </g>
              );
            }}
          </For>

          <For each={ripples()}>
            {(ripple) => (
              <circle
                cx={ripple.x}
                cy={ripple.y}
                r="35"
                fill="none"
                stroke="#60a5fa"
                stroke-width="3"
                class="ripple"
                pointer-events="none"
              />
            )}
          </For>
        </g>
      </svg>

      <Show when={tooltip().visible}>
        <div
          class="tooltip"
          style={{
            left: `${tooltip().x}px`,
            top: `${tooltip().y}px`,
          }}
        >
          <div class="tooltip-title">{tooltip().title}</div>
          <div class="tooltip-desc">{tooltip().description}</div>
        </div>
      </Show>

      <div class="controls">
        <button class="control-btn" onClick={onZoomIn} title="放大">
          +
        </button>
        <div class="zoom-level">{Math.round(scale() * 100)}%</div>
        <button class="control-btn" onClick={onZoomOut} title="缩小">
          −
        </button>
        <button class="control-btn" onClick={onZoomReset} title="重置">
          ⟲
        </button>
      </div>
    </div>
  );
}
