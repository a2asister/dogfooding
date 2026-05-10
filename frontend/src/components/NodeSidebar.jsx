import React from 'react'
import pluginManager from '../plugins/pluginManager'

const NODE_GROUPS = [
  {
    name: '基础节点',
    nodes: [
      { type: 'start', label: '开始节点', icon: '▶', color: 'start' },
      { type: 'end', label: '结束节点', icon: '■', color: 'end' }
    ]
  },
  {
    name: '控制流',
    nodes: [
      { type: 'condition', label: '条件判断', icon: '◆', color: 'condition' },
      { type: 'loop', label: '循环执行', icon: '🔄', color: 'loop' },
      { type: 'merge', label: '分支合并', icon: '⋈', color: 'merge' }
    ]
  },
  {
    name: '动作',
    nodes: [
      { type: 'action', label: '执行动作', icon: '⚙', color: 'action' },
      { type: 'delay', label: '延迟触发', icon: '⏱', color: 'delay' },
      { type: 'retry', label: '异常重试', icon: '↻', color: 'retry' }
    ]
  },
  {
    name: '高级',
    nodes: [
      { type: 'subworkflow', label: '子流程', icon: '📦', color: 'subworkflow' },
      { type: 'plugin', label: '插件节点', icon: '🔌', color: 'plugin' },
      { type: 'fork', label: '并行分支', icon: '🔀', color: 'fork' },
      { type: 'join', label: '并行汇合', icon: '🔁', color: 'join' }
    ]
  }
]

const NodeColorMap = {
  start: 'linear-gradient(135deg, #10b981, #059669)',
  end: 'linear-gradient(135deg, #ef4444, #dc2626)',
  action: 'linear-gradient(135deg, #4361ee, #3a56d4)',
  condition: 'linear-gradient(135deg, #f59e0b, #d97706)',
  loop: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  delay: 'linear-gradient(135deg, #06b6d4, #0891b2)',
  retry: 'linear-gradient(135deg, #ec4899, #db2777)',
  merge: 'linear-gradient(135deg, #64748b, #475569)',
  subworkflow: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
  plugin: 'linear-gradient(135deg, #f97316, #ea580c)',
  fork: 'linear-gradient(135deg, #a855f7, #9333ea)',
  join: 'linear-gradient(135deg, #6366f1, #4f46e5)'
}

const NodeSidebar = ({ onNodeTypeDragStart }) => {
  const plugins = pluginManager.getNodeTypes()

  return (
    <div className="editor-sidebar">
      <h3>节点类型</h3>

      {NODE_GROUPS.map((group) => (
        <div key={group.name} style={{ marginBottom: '20px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {group.name}
          </div>
          <div className="node-types">
            {group.nodes.map((nodeType) => (
              <NodeTypeItem
                key={nodeType.type}
                nodeType={nodeType}
                onDragStart={onNodeTypeDragStart}
              />
            ))}
          </div>
        </div>
      ))}

      {plugins.length > 0 && (
        <div>
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            插件节点
          </div>
          <div className="node-types">
            {plugins.map((pluginNode) => (
              <NodeTypeItem
                key={pluginNode.type}
                nodeType={{
                  type: pluginNode.type,
                  label: pluginNode.name,
                  icon: pluginNode.icon,
                  color: 'plugin',
                  isPlugin: true,
                  pluginId: pluginNode.pluginId
                }}
                onDragStart={onNodeTypeDragStart}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const NodeTypeItem = ({ nodeType, onDragStart }) => {
  const background = NodeColorMap[nodeType.color] || NodeColorMap.action

  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/reactflow/newnode', JSON.stringify(nodeType))
    if (onDragStart) {
      onDragStart(e, nodeType)
    }
  }

  return (
    <div
      className="node-type-item"
      draggable
      onDragStart={handleDragStart}
      title={`拖拽到画布添加 ${nodeType.label}`}
    >
      <span
        className="node-icon"
        style={{
          background,
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: 'bold',
          color: 'white'
        }}
      >
        {nodeType.icon}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
          {nodeType.label}
        </div>
        {nodeType.isPlugin && (
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>
            插件: {nodeType.pluginId}
          </div>
        )}
      </div>
    </div>
  )
}

export default NodeSidebar
