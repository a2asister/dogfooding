import React from 'react'
import { Handle, Position } from 'reactflow'

const NODE_STYLES = {
  start: { background: '#10b981', icon: '▶', label: '开始' },
  end: { background: '#ef4444', icon: '■', label: '结束' },
  action: { background: '#4361ee', icon: '⚙', label: '动作' },
  condition: { background: '#f59e0b', icon: '◆', label: '条件' },
  loop: { background: '#8b5cf6', icon: '🔄', label: '循环' },
  delay: { background: '#06b6d4', icon: '⏱', label: '延迟' },
  retry: { background: '#ec4899', icon: '↻', label: '重试' },
  merge: { background: '#64748b', icon: '⋈', label: '合并' },
  subworkflow: { background: '#0ea5e9', icon: '📦', label: '子流程' },
  plugin: { background: '#f97316', icon: '🔌', label: '插件' },
  fork: { background: '#a855f7', icon: '🔀', label: '并行' },
  join: { background: '#6366f1', icon: '🔁', label: '汇合' }
}

const CustomNode = ({ data, selected, executing, completed, failed }) => {
  const nodeType = data.nodeType || data.type || 'action'
  const style = NODE_STYLES[nodeType] || NODE_STYLES.action

  let borderColor = '#e5e7eb'
  if (selected) borderColor = '#4361ee'
  if (executing) borderColor = '#f59e0b'
  if (completed) borderColor = '#10b981'
  if (failed) borderColor = '#ef4444'

  const isStart = nodeType === 'start'
  const isEnd = nodeType === 'end'
  const isCondition = nodeType === 'condition'

  return (
    <div
      style={{
        background: 'white',
        border: `2px solid ${borderColor}`,
        borderRadius: '12px',
        padding: '12px 16px',
        minWidth: '160px',
        boxShadow: selected ? '0 0 0 3px rgba(67, 97, 238, 0.2)' : '0 2px 8px rgba(0,0,0,0.08)',
        animation: executing ? 'pulse 1.5s infinite' : 'none'
      }}
    >
      {!isStart && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: '#4361ee',
            width: '12px',
            height: '12px',
            border: '2px solid white'
          }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: style.background,
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {style.icon}
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
            {data.name || style.label}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {style.label}
          </div>
        </div>
      </div>

      {!isEnd && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            style={{
              background: '#4361ee',
              width: '12px',
              height: '12px',
              border: '2px solid white'
            }}
          />
          {isCondition && (
            <>
              <Handle
                type="source"
                position={Position.Top}
                id="yes"
                style={{
                  background: '#10b981',
                  width: '12px',
                  height: '12px',
                  border: '2px solid white'
                }}
              />
              <Handle
                type="source"
                position={Position.Bottom}
                id="no"
                style={{
                  background: '#ef4444',
                  width: '12px',
                  height: '12px',
                  border: '2px solid white'
                }}
              />
            </>
          )}
        </>
      )}
    </div>
  )
}

export const nodeTypes = {
  custom: CustomNode
}

export default CustomNode
