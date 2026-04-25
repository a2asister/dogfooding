import { motion } from 'framer-motion';
import { ModuleNode, Connection, ModuleType } from '@/types';
import { formatFileSize } from '@/data/modules';

interface ModuleGraphProps {
  modules: ModuleNode[];
  connections: Connection[];
  highlightModuleIds?: string[];
  activeModuleIds?: string[];
  flowingConnections?: Connection[];
}

const moduleTypeColors: Record<ModuleType, string> = {
  app: 'var(--color-module-app)',
  component: 'var(--color-module-component)',
  utility: 'var(--color-module-utility)',
  style: 'var(--color-module-style)',
  asset: 'var(--color-module-asset)',
  node_module: 'var(--color-module-node)',
  entry: 'var(--color-module-entry)',
};

const moduleTypeIcons: Record<ModuleType, string> = {
  app: '📱',
  component: '🧩',
  utility: '🔧',
  style: '🎨',
  asset: '🖼️',
  node_module: '📦',
  entry: '🚪',
};

const MODULE_WIDTH = 120;
const MODULE_HEIGHT = 50;

type ConnectionSide = 'left' | 'right' | 'top' | 'bottom';

interface ConnectionPoint {
  x: number;
  y: number;
  side: ConnectionSide;
}

function getModuleConnectionPoints(module: ModuleNode): Record<ConnectionSide, ConnectionPoint> {
  const x = module.position.x;
  const y = module.position.y;
  
  return {
    left: { x: x, y: y + MODULE_HEIGHT / 2, side: 'left' },
    right: { x: x + MODULE_WIDTH, y: y + MODULE_HEIGHT / 2, side: 'right' },
    top: { x: x + MODULE_WIDTH / 2, y: y, side: 'top' },
    bottom: { x: x + MODULE_WIDTH / 2, y: y + MODULE_HEIGHT, side: 'bottom' },
  };
}

function getBestConnectionPoints(
  fromModule: ModuleNode, 
  toModule: ModuleNode
): { from: ConnectionPoint; to: ConnectionPoint } {
  const fromPoints = getModuleConnectionPoints(fromModule);
  const toPoints = getModuleConnectionPoints(toModule);
  
  const fromCenterX = fromModule.position.x + MODULE_WIDTH / 2;
  const fromCenterY = fromModule.position.y + MODULE_HEIGHT / 2;
  const toCenterX = toModule.position.x + MODULE_WIDTH / 2;
  const toCenterY = toModule.position.y + MODULE_HEIGHT / 2;
  
  const dx = toCenterX - fromCenterX;
  const dy = toCenterY - fromCenterY;
  
  let fromSide: ConnectionSide;
  let toSide: ConnectionSide;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) {
      fromSide = 'right';
      toSide = 'left';
    } else {
      fromSide = 'left';
      toSide = 'right';
    }
  } else {
    if (dy > 0) {
      fromSide = 'bottom';
      toSide = 'top';
    } else {
      fromSide = 'top';
      toSide = 'bottom';
    }
  }
  
  return {
    from: fromPoints[fromSide],
    to: toPoints[toSide],
  };
}

function createBezierPath(
  from: ConnectionPoint, 
  to: ConnectionPoint
): string {
  const controlOffset = 50;
  
  let cp1x = from.x;
  let cp1y = from.y;
  let cp2x = to.x;
  let cp2y = to.y;
  
  if (from.side === 'right' && to.side === 'left') {
    cp1x = from.x + controlOffset;
    cp2x = to.x - controlOffset;
  } else if (from.side === 'left' && to.side === 'right') {
    cp1x = from.x - controlOffset;
    cp2x = to.x + controlOffset;
  } else if (from.side === 'bottom' && to.side === 'top') {
    cp1y = from.y + controlOffset;
    cp2y = to.y - controlOffset;
  } else if (from.side === 'top' && to.side === 'bottom') {
    cp1y = from.y - controlOffset;
    cp2y = to.y + controlOffset;
  } else if (from.side === 'right') {
    cp1x = from.x + controlOffset;
    if (to.side === 'top') {
      cp2x = to.x;
      cp2y = to.y - controlOffset;
    } else if (to.side === 'bottom') {
      cp2x = to.x;
      cp2y = to.y + controlOffset;
    }
  } else if (from.side === 'bottom') {
    cp1y = from.y + controlOffset;
    if (to.side === 'left') {
      cp2x = to.x - controlOffset;
      cp2y = to.y;
    } else if (to.side === 'right') {
      cp2x = to.x + controlOffset;
      cp2y = to.y;
    }
  } else if (from.side === 'left') {
    cp1x = from.x - controlOffset;
    if (to.side === 'top') {
      cp2x = to.x;
      cp2y = to.y - controlOffset;
    } else if (to.side === 'bottom') {
      cp2x = to.x;
      cp2y = to.y + controlOffset;
    }
  } else if (from.side === 'top') {
    cp1y = from.y - controlOffset;
    if (to.side === 'left') {
      cp2x = to.x - controlOffset;
      cp2y = to.y;
    } else if (to.side === 'right') {
      cp2x = to.x + controlOffset;
      cp2y = to.y;
    }
  }
  
  return `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
}

function getControlPointsForOffset(
  from: ConnectionPoint, 
  to: ConnectionPoint
): { cp1x: number; cp1y: number; cp2x: number; cp2y: number } {
  const controlOffset = 50;
  
  let cp1x = from.x;
  let cp1y = from.y;
  let cp2x = to.x;
  let cp2y = to.y;
  
  if (from.side === 'right' && to.side === 'left') {
    cp1x = from.x + controlOffset;
    cp2x = to.x - controlOffset;
  } else if (from.side === 'left' && to.side === 'right') {
    cp1x = from.x - controlOffset;
    cp2x = to.x + controlOffset;
  } else if (from.side === 'bottom' && to.side === 'top') {
    cp1y = from.y + controlOffset;
    cp2y = to.y - controlOffset;
  } else if (from.side === 'top' && to.side === 'bottom') {
    cp1y = from.y - controlOffset;
    cp2y = to.y + controlOffset;
  } else if (from.side === 'right') {
    cp1x = from.x + controlOffset;
    if (to.side === 'top') {
      cp2x = to.x;
      cp2y = to.y - controlOffset;
    } else if (to.side === 'bottom') {
      cp2x = to.x;
      cp2y = to.y + controlOffset;
    }
  } else if (from.side === 'bottom') {
    cp1y = from.y + controlOffset;
    if (to.side === 'left') {
      cp2x = to.x - controlOffset;
      cp2y = to.y;
    } else if (to.side === 'right') {
      cp2x = to.x + controlOffset;
      cp2y = to.y;
    }
  } else if (from.side === 'left') {
    cp1x = from.x - controlOffset;
    if (to.side === 'top') {
      cp2x = to.x;
      cp2y = to.y - controlOffset;
    } else if (to.side === 'bottom') {
      cp2x = to.x;
      cp2y = to.y + controlOffset;
    }
  } else if (from.side === 'top') {
    cp1y = from.y - controlOffset;
    if (to.side === 'left') {
      cp2x = to.x - controlOffset;
      cp2y = to.y;
    } else if (to.side === 'right') {
      cp2x = to.x + controlOffset;
      cp2y = to.y;
    }
  }
  
  return { cp1x, cp1y, cp2x, cp2y };
}

function ModuleGraph({
  modules,
  connections,
  highlightModuleIds = [],
  activeModuleIds = [],
  flowingConnections = [],
}: ModuleGraphProps) {
  const getModuleColor = (module: ModuleNode) => {
    if (module.isOptimized) return 'var(--color-secondary)';
    return moduleTypeColors[module.type];
  };

  const getModuleById = (id: string) => modules.find(m => m.id === id);

  return (
    <svg className="w-full h-full" viewBox="0 0 800 450">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-text-muted)" />
        </marker>
        <marker
          id="arrowhead-active"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-primary)" />
        </marker>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g className="connections">
        {connections.map((conn, index) => {
          const fromModule = getModuleById(conn.from);
          const toModule = getModuleById(conn.to);
          if (!fromModule || !toModule) return null;

          const isFlowing = flowingConnections.some(
            fc => fc.from === conn.from && fc.to === conn.to
          );

          const { from, to } = getBestConnectionPoints(fromModule, toModule);
          const path = createBezierPath(from, to);
          const { cp1x, cp1y, cp2x, cp2y } = getControlPointsForOffset(from, to);
          const pathForAnimation = `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;

          return (
            <motion.g key={`conn-${index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <path
                d={path}
                stroke={isFlowing ? 'var(--color-primary)' : 'var(--color-border)'}
                strokeWidth={isFlowing ? 2.5 : 1.5}
                fill="none"
                markerEnd={isFlowing ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                className={isFlowing ? 'animate-flow' : ''}
                strokeDasharray={isFlowing ? '8,4' : undefined}
              />
              {isFlowing && (
                <motion.circle
                  r={4}
                  fill="var(--color-primary)"
                  filter="url(#glow)"
                  initial={{ offsetDistance: '0%' }}
                  animate={{ offsetDistance: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  style={{
                    offsetPath: `path('${pathForAnimation}')`,
                  }}
                />
              )}
            </motion.g>
          );
        })}
      </g>

      <g className="modules">
        {modules.map((module) => {
          const isHighlighted = highlightModuleIds.includes(module.id);
          const isActive = activeModuleIds.includes(module.id);

          return (
            <motion.g
              key={module.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: isActive ? 1.1 : 1, 
                opacity: isHighlighted || isActive ? 1 : 0.8 
              }}
              transition={{ 
                type: 'spring', 
                stiffness: 200, 
                damping: 15,
                delay: modules.indexOf(module) * 0.05
              }}
              style={{
                transform: `translate(${module.position.x}px, ${module.position.y}px)`,
              }}
            >
              <rect
                x={0}
                y={0}
                width={MODULE_WIDTH}
                height={MODULE_HEIGHT}
                rx={8}
                ry={8}
                fill={isActive ? 'var(--color-surface-elevated)' : 'var(--color-surface-card)'}
                stroke={getModuleColor(module)}
                strokeWidth={isActive || isHighlighted ? 3 : 2}
                filter={isActive ? 'url(#glow)' : undefined}
              />
              
              <g style={{ transform: 'translate(8px, 12px)' }}>
                <text fontSize={18} y={8}>
                  {moduleTypeIcons[module.type]}
                </text>
                
                <text
                  x={28}
                  y={8}
                  fontSize={11}
                  fontWeight="600"
                  fill="var(--color-text-primary)"
                >
                  {module.name.length > 16 ? module.name.slice(0, 14) + '...' : module.name}
                </text>
                
                {module.size && (
                  <text
                    x={28}
                    y={22}
                    fontSize={9}
                    fill="var(--color-text-muted)"
                  >
                    {formatFileSize(module.size)}
                    {module.isOptimized && ' (优化后)'}
                  </text>
                )}
              </g>

              {module.isNodeModule && !module.isOptimized && (
                <circle
                  cx={MODULE_WIDTH - 8}
                  cy={10}
                  r={6}
                  fill="var(--color-module-node)"
                />
              )}
              {module.isOptimized && (
                <circle
                  cx={MODULE_WIDTH - 8}
                  cy={10}
                  r={6}
                  fill="var(--color-secondary)"
                />
              )}
            </motion.g>
          );
        })}
      </g>
    </svg>
  );
}

export default ModuleGraph;
