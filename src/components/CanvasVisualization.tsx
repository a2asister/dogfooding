import { useEffect, useRef, useCallback } from 'react';
import type { TechNode, NodeConnection } from '../types';
import { techNodes, nodeConnections, getTechNodeById } from '../data/techNodes';
import { MAX_YEAR } from '../utils/constants';
import { useAppContext } from '../context/AppContext';
import './CanvasVisualization.css';

interface NodePosition {
  node: TechNode;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  opacity: number;
  targetOpacity: number;
}

interface CanvasVisualizationProps {
  width: number;
  height: number;
}

interface StableLayout {
  [nodeId: string]: { x: number; y: number };
}

export function CanvasVisualization({ width, height }: CanvasVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const nodePositionsRef = useRef<Map<string, NodePosition>>(new Map());
  const hoveredNodeIdRef = useRef<string | null>(null);
  const stableLayoutRef = useRef<StableLayout>({});
  const layoutIterationsRef = useRef<number>(0);
  const prevVisibleNodesRef = useRef<string[]>([]);

  const { state, currentYear, selectNode } = useAppContext();
  const { view, selectedNodeId } = state;

  const getVisibleTechNodes = useCallback(() => {
    return techNodes.filter(node => {
      const startYear = parseInt(node.timelineStart);
      const endYear = node.timelineEnd ? parseInt(node.timelineEnd) : MAX_YEAR + 1;
      return currentYear >= startYear && currentYear <= endYear;
    });
  }, [currentYear]);

  const getVisibleConnections = useCallback((visibleNodes: TechNode[]) => {
    const visibleIds = new Set(visibleNodes.map(n => n.id));
    return nodeConnections.filter(
      conn => visibleIds.has(conn.sourceId) && visibleIds.has(conn.targetId)
    );
  }, []);

  const calculateStableLayout = useCallback(
    (nodes: TechNode[]) => {
      if (nodes.length === 0) return;

      const existingLayout = stableLayoutRef.current;
      const newLayout: StableLayout = {};
      const centerX = width / 2;
      const centerY = height / 2;

      if (nodes.length === 1) {
        newLayout[nodes[0].id] = { x: centerX, y: centerY };
      } else if (nodes.length === 2) {
        newLayout[nodes[0].id] = { x: centerX - 100, y: centerY };
        newLayout[nodes[1].id] = { x: centerX + 100, y: centerY };
      } else if (nodes.length <= 4) {
        const radius = Math.min(width, height) * 0.2;
        nodes.forEach((node, i) => {
          const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
          newLayout[node.id] = {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
          };
        });
      } else {
        const rows = Math.ceil(Math.sqrt(nodes.length));
        const cols = Math.ceil(nodes.length / rows);
        const cellWidth = Math.min(width * 0.8, 600) / cols;
        const cellHeight = Math.min(height * 0.6, 400) / rows;
        const startX = centerX - (cols * cellWidth) / 2;
        const startY = centerY - (rows * cellHeight) / 2;

        nodes.forEach((node, i) => {
          const row = Math.floor(i / cols);
          const col = i % cols;
          newLayout[node.id] = {
            x: startX + col * cellWidth + cellWidth / 2,
            y: startY + row * cellHeight + cellHeight / 2,
          };
        });
      }

      Object.keys(existingLayout).forEach(key => {
        if (newLayout[key] && existingLayout[key]) {
          const dx = newLayout[key].x - existingLayout[key].x;
          const dy = newLayout[key].y - existingLayout[key].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 5 && layoutIterationsRef.current < 60) {
            newLayout[key] = {
              x: existingLayout[key].x + dx * 0.1,
              y: existingLayout[key].y + dy * 0.1,
            };
          }
        }
      });

      stableLayoutRef.current = newLayout;
    },
    [width, height]
  );

  const initializeNodePositions = useCallback(
    (nodes: TechNode[]) => {
      const positions = nodePositionsRef.current;
      const prevIds = prevVisibleNodesRef.current;
      const currentIds = nodes.map(n => n.id);

      const addedIds = currentIds.filter(id => !prevIds.includes(id));
      const removedIds = prevIds.filter(id => !currentIds.includes(id));

      calculateStableLayout(nodes);

      nodes.forEach((node) => {
        const stablePos = stableLayoutRef.current[node.id];

        if (!positions.has(node.id)) {
          const startX = stablePos ? stablePos.x : width / 2 + (Math.random() - 0.5) * 200;
          const startY = stablePos ? stablePos.y : height / 2 + (Math.random() - 0.5) * 200;

          positions.set(node.id, {
            node,
            x: addedIds.includes(node.id) ? width / 2 : startX,
            y: addedIds.includes(node.id) ? height / 2 : startY,
            targetX: stablePos ? stablePos.x : startX,
            targetY: stablePos ? stablePos.y : startY,
            radius: 40 + Math.min(node.relatedTechIds.length * 3, 15),
            velocityX: 0,
            velocityY: 0,
            opacity: addedIds.includes(node.id) ? 0 : 1,
            targetOpacity: 1,
          });
        } else {
          const pos = positions.get(node.id)!;
          if (stablePos) {
            pos.targetX = stablePos.x;
            pos.targetY = stablePos.y;
          }
          pos.targetOpacity = 1;
        }
      });

      removedIds.forEach(id => {
        const pos = positions.get(id);
        if (pos) {
          pos.targetOpacity = 0;
        }
      });

      if (removedIds.length > 0) {
        setTimeout(() => {
          removedIds.forEach(id => positions.delete(id));
        }, 500);
      }

      prevVisibleNodesRef.current = currentIds;
    },
    [width, height, calculateStableLayout]
  );

  const applyLayoutTransition = useCallback(
    (nodes: TechNode[]) => {
      const positions = nodePositionsRef.current;
      const lerpFactor = 0.08;
      const opacityLerpFactor = 0.15;

      let allStable = true;

      nodes.forEach((node) => {
        const pos = positions.get(node.id);
        if (!pos) return;

        if (Math.abs(pos.x - pos.targetX) > 0.5 || Math.abs(pos.y - pos.targetY) > 0.5) {
          allStable = false;
          pos.x += (pos.targetX - pos.x) * lerpFactor;
          pos.y += (pos.targetY - pos.y) * lerpFactor;
        } else {
          pos.x = pos.targetX;
          pos.y = pos.targetY;
        }

        if (Math.abs(pos.opacity - pos.targetOpacity) > 0.01) {
          allStable = false;
          pos.opacity += (pos.targetOpacity - pos.opacity) * opacityLerpFactor;
        } else {
          pos.opacity = pos.targetOpacity;
        }
      });

      if (allStable) {
        layoutIterationsRef.current++;
      } else {
        layoutIterationsRef.current = 0;
      }
    },
    []
  );

  const drawNode = useCallback(
    (ctx: CanvasRenderingContext2D, pos: NodePosition, isSelected: boolean, isHovered: boolean) => {
      const { node } = pos;
      const { zoom, panX, panY } = view;
      const screenX = (pos.x + panX) * zoom + width * (1 - zoom) / 2;
      const screenY = (pos.y + panY) * zoom + height * (1 - zoom) / 2;
      const screenRadius = pos.radius * zoom;

      ctx.save();
      ctx.globalAlpha = pos.opacity;

      if (isSelected || isHovered) {
        const gradient = ctx.createRadialGradient(
          screenX, screenY, screenRadius * 0.5,
          screenX, screenY, screenRadius * 2.5
        );
        gradient.addColorStop(0, node.color + '60');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, screenRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(screenX, screenY, screenRadius, 0, Math.PI * 2);

      const gradient = ctx.createRadialGradient(
        screenX - screenRadius * 0.3,
        screenY - screenRadius * 0.3,
        0,
        screenX, screenY, screenRadius
      );
      gradient.addColorStop(0, node.color);
      gradient.addColorStop(1, node.color + '80');
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.strokeStyle = isSelected ? '#ffffff' : isHovered ? node.color : node.color + '80';
      ctx.lineWidth = isSelected ? 4 : isHovered ? 3 : 2;
      ctx.stroke();

      ctx.fillStyle = '#1a1a25';
      ctx.font = `${Math.max(18, 26 * zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.iconEmoji, screenX, screenY);

      if (state.settings.showLabels && zoom > 0.5) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(11, 13 * zoom)}px sans-serif`;
        ctx.fillText(node.displayName, screenX, screenY + screenRadius + 18 * zoom);
      }

      if (isHovered && state.settings.showLabels) {
        const nodeStartYear = parseInt(node.timelineStart);
        const nodeEndYear = node.timelineEnd ? parseInt(node.timelineEnd) : MAX_YEAR;
        const nodeLifeSpan = nodeEndYear - nodeStartYear;
        const elapsed = currentYear - nodeStartYear;
        const progress = Math.max(0, Math.min(1, elapsed / nodeLifeSpan));

        const barWidth = screenRadius * 2.5;
        const barHeight = 6;
        const barX = screenX - barWidth / 2;
        const barY = screenY - screenRadius - 14;

        ctx.fillStyle = '#2a2a3a';
        ctx.beginPath();
        ctx.roundRect(barX, barY, barWidth, barHeight, 3);
        ctx.fill();

        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barWidth * progress, barHeight, 3);
        ctx.fill();

        ctx.fillStyle = '#888';
        ctx.font = `${10 * zoom}px sans-serif`;
        ctx.fillText(`${nodeStartYear} - ${nodeEndYear}`, screenX, screenY + screenRadius + 32 * zoom);
      }

      ctx.restore();
    },
    [view, width, height, currentYear, state.settings.showLabels]
  );

  const drawConnection = useCallback(
    (ctx: CanvasRenderingContext2D, conn: NodeConnection, positions: Map<string, NodePosition>) => {
      const sourcePos = positions.get(conn.sourceId);
      const targetPos = positions.get(conn.targetId);
      if (!sourcePos || !targetPos) return;

      const { zoom, panX, panY } = view;
      const sourceX = (sourcePos.x + panX) * zoom + width * (1 - zoom) / 2;
      const sourceY = (sourcePos.y + panY) * zoom + height * (1 - zoom) / 2;
      const targetX = (targetPos.x + panX) * zoom + width * (1 - zoom) / 2;
      const targetY = (targetPos.y + panY) * zoom + height * (1 - zoom) / 2;

      const sourceColor = sourcePos.node.color;
      const targetColor = targetPos.node.color;

      ctx.save();
      ctx.globalAlpha = Math.min(sourcePos.opacity, targetPos.opacity) * 0.8;

      const gradient = ctx.createLinearGradient(sourceX, sourceY, targetX, targetY);

      switch (conn.type) {
        case 'influence':
          gradient.addColorStop(0, sourceColor + '60');
          gradient.addColorStop(1, targetColor + '60');
          ctx.setLineDash([8, 4]);
          break;
        case 'evolution':
          gradient.addColorStop(0, sourceColor + '80');
          gradient.addColorStop(1, targetColor + '80');
          ctx.setLineDash([12, 6]);
          break;
        case 'competition':
          gradient.addColorStop(0, sourceColor + '40');
          gradient.addColorStop(0.5, '#ff666440');
          gradient.addColorStop(1, targetColor + '40');
          ctx.setLineDash([3, 6]);
          break;
        default:
          gradient.addColorStop(0, sourceColor + '30');
          gradient.addColorStop(1, targetColor + '30');
      }

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2 * zoom * conn.strength;
      ctx.lineCap = 'round';

      const midX = (sourceX + targetX) / 2;
      const midY = (sourceY + targetY) / 2 - (conn.type === 'influence' ? 30 : 20);

      ctx.beginPath();
      ctx.moveTo(sourceX, sourceY);
      ctx.quadraticCurveTo(midX, midY, targetX, targetY);
      ctx.stroke();

      ctx.restore();
    },
    [view, width, height]
  );

  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) * 0.7
      );
      gradient.addColorStop(0, '#15151f');
      gradient.addColorStop(1, '#0a0a0f');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const gridColor = '#1a1a28';
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;

      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    },
    [width, height]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const { zoom, panX, panY } = view;
      const worldX = (mouseX - width * (1 - zoom) / 2) / zoom - panX;
      const worldY = (mouseY - height * (1 - zoom) / 2) / zoom - panY;

      const positions = nodePositionsRef.current;
      let clickedNode: string | null = null;

      positions.forEach((pos, id) => {
        if (pos.opacity < 0.3) return;
        const dx = pos.x - worldX;
        const dy = pos.y - worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= pos.radius + 5) {
          clickedNode = id;
        }
      });

      if (clickedNode) {
        const node = getTechNodeById(clickedNode);
        if (node) {
          const startYear = parseInt(node.timelineStart);
          const endYear = node.timelineEnd ? parseInt(node.timelineEnd) : MAX_YEAR;
          if (currentYear >= startYear && currentYear <= endYear) {
            selectNode(clickedNode === selectedNodeId ? null : clickedNode);
          }
        }
      } else {
        selectNode(null);
      }
    },
    [view, width, height, selectedNodeId, selectNode, currentYear]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const { zoom, panX, panY } = view;
      const worldX = (mouseX - width * (1 - zoom) / 2) / zoom - panX;
      const worldY = (mouseY - height * (1 - zoom) / 2) / zoom - panY;

      const positions = nodePositionsRef.current;
      let hoveredId: string | null = null;

      positions.forEach((pos, id) => {
        if (pos.opacity < 0.3) return;
        const dx = pos.x - worldX;
        const dy = pos.y - worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= pos.radius + 5) {
          hoveredId = id;
        }
      });

      hoveredNodeIdRef.current = hoveredId;
      document.body.style.cursor = hoveredId ? 'pointer' : 'default';
    },
    [view, width, height]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
    },
    []
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const visibleNodes = getVisibleTechNodes();
    const visibleConnections = getVisibleConnections(visibleNodes);

    initializeNodePositions(visibleNodes);
    applyLayoutTransition(visibleNodes);

    drawBackground(ctx);

    const positions = nodePositionsRef.current;
    visibleConnections.forEach((conn) => {
      drawConnection(ctx, conn, positions);
    });

    visibleNodes.forEach((node) => {
      const pos = positions.get(node.id);
      if (!pos) return;

      const isSelected = node.id === selectedNodeId;
      const isHovered = node.id === hoveredNodeIdRef.current;

      drawNode(ctx, pos, isSelected, isHovered);
    });

    animationFrameRef.current = requestAnimationFrame(render);
  }, [
    getVisibleTechNodes,
    getVisibleConnections,
    initializeNodePositions,
    applyLayoutTransition,
    drawBackground,
    drawConnection,
    drawNode,
    selectedNodeId,
  ]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
      className="canvas-visualization"
    />
  );
}
