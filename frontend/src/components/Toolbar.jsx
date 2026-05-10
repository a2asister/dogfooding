import React, { useState } from 'react'
import { useWorkflowStore } from '../store/workflowStore'
import { layoutGraph, autoLayoutDirection } from '../utils/layout'
import pluginManager from '../plugins/pluginManager'

const Toolbar = ({ onDebug, onAutoLayout }) => {
  const {
    undo,
    redo,
    copy,
    paste,
    duplicate,
    deleteSelected,
    clipboard,
    selectedNodes,
    history,
    setNodes,
    setEdges,
    nodes,
    edges,
    debugMode,
    setDebugMode
  } = useWorkflowStore()

  const [layoutDirection, setLayoutDirection] = useState(autoLayoutDirection.LEFT_TO_RIGHT)

  const hasSelection = selectedNodes.length > 0
  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0
  const hasClipboard = clipboard !== null

  const handleAutoLayout = () => {
    const layouted = layoutGraph(nodes, edges, layoutDirection)
    setNodes(layouted.nodes)
    setEdges(layouted.edges)
  }

  const toolButtons = [
    {
      id: 'undo',
      icon: '↶',
      label: '撤销',
      tooltip: 'Ctrl+Z',
      disabled: !canUndo,
      onClick: undo
    },
    {
      id: 'redo',
      icon: '↷',
      label: '重做',
      tooltip: 'Ctrl+Y',
      disabled: !canRedo,
      onClick: redo
    },
    {
      id: 'copy',
      icon: '📋',
      label: '复制',
      tooltip: 'Ctrl+C',
      disabled: !hasSelection,
      onClick: copy
    },
    {
      id: 'paste',
      icon: '📄',
      label: '粘贴',
      tooltip: 'Ctrl+V',
      disabled: !hasClipboard,
      onClick: paste
    },
    {
      id: 'duplicate',
      icon: '📋',
      label: '重复',
      tooltip: 'Ctrl+D',
      disabled: !hasSelection,
      onClick: duplicate
    },
    {
      id: 'delete',
      icon: '🗑️',
      label: '删除',
      tooltip: 'Delete',
      disabled: !hasSelection,
      onClick: deleteSelected
    }
  ]

  const layoutOptions = [
    { value: autoLayoutDirection.LEFT_TO_RIGHT, label: '从左到右' },
    { value: autoLayoutDirection.RIGHT_TO_LEFT, label: '从右到左' },
    { value: autoLayoutDirection.TOP_TO_BOTTOM, label: '从上到下' },
    { value: autoLayoutDirection.BOTTOM_TO_TOP, label: '从下到上' }
  ]

  return (
    <div className="toolbar" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px', paddingRight: '12px', borderRight: '1px solid #e5e7eb' }}>
          {toolButtons.map((btn) => (
            <button
              key={btn.id}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '14px' }}
              disabled={btn.disabled}
              onClick={btn.onClick}
              title={btn.tooltip}
            >
              {btn.icon}
              <span style={{ marginLeft: '4px' }}>{btn.label}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingLeft: '12px' }}>
          <select
            value={layoutDirection}
            onChange={(e) => setLayoutDirection(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            {layoutOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            className="btn btn-secondary"
            onClick={handleAutoLayout}
            disabled={nodes.length === 0}
          >
            🔀 自动布局
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          className={debugMode ? 'btn btn-success' : 'btn btn-secondary'}
          onClick={() => setDebugMode(!debugMode)}
        >
          {debugMode ? '🔴 调试中' : '🔍 调试模式'}
        </button>
        {onDebug && (
          <button className="btn btn-secondary" onClick={onDebug}>
            🐛 单步调试
          </button>
        )}
      </div>
    </div>
  )
}

export default Toolbar
