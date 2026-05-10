import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { workflowApi, versionApi } from '../services/api'

const NODE_TYPES = [
  { type: 'start', label: '开始节点', icon: '▶', color: 'start' },
  { type: 'end', label: '结束节点', icon: '■', color: 'end' },
  { type: 'action', label: '执行动作', icon: '⚙', color: 'action' },
  { type: 'condition', label: '条件判断', icon: '◆', color: 'condition' },
  { type: 'loop', label: '循环执行', icon: '🔄', color: 'loop' },
  { type: 'delay', label: '延迟触发', icon: '⏱', color: 'delay' },
  { type: 'retry', label: '异常重试', icon: '↻', color: 'retry' },
  { type: 'merge', label: '分支合并', icon: '⋈', color: 'merge' }
]

const WorkflowEditor = () => {
  const { id: workflowId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const canvasRef = useRef(null)
  
  const [workflow, setWorkflow] = useState(null)
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedEdge, setSelectedEdge] = useState(null)
  const [draggingNode, setDraggingNode] = useState(null)
  const [connecting, setConnecting] = useState(null)
  const [connectingPoint, setConnectingPoint] = useState(null)
  const [currentVersion, setCurrentVersion] = useState(null)
  const [versions, setVersions] = useState([])

  const getVersionFromUrl = () => {
    const params = new URLSearchParams(location.search)
    return params.get('version')
  }

  useEffect(() => {
    loadWorkflow()
  }, [workflowId, location.search])

  const loadWorkflow = async () => {
    try {
      const data = await workflowApi.get(workflowId)
      setWorkflow(data)
      
      const allVersions = await versionApi.list(workflowId)
      setVersions(allVersions)
      
      const versionIdFromUrl = getVersionFromUrl()
      
      if (allVersions.length > 0) {
        let targetVersion
        if (versionIdFromUrl) {
          targetVersion = allVersions.find(v => v.id === versionIdFromUrl)
        }
        
        if (!targetVersion) {
          const activeVersion = allVersions.find(v => v.isActive)
          targetVersion = activeVersion || allVersions[allVersions.length - 1]
        }
        
        if (targetVersion) {
          setCurrentVersion(targetVersion)
          setNodes(targetVersion.graph?.nodes || [])
          setEdges(targetVersion.graph?.edges || [])
        }
      } else {
        initDefaultNodes()
      }
    } catch (error) {
      console.error('Failed to load workflow:', error)
      initDefaultNodes()
    }
  }

  const initDefaultNodes = () => {
    const startNode = {
      id: uuidv4(),
      type: 'start',
      name: '开始',
      position: { x: 100, y: 200 },
      config: {}
    }
    const endNode = {
      id: uuidv4(),
      type: 'end',
      name: '结束',
      position: { x: 600, y: 200 },
      config: {}
    }
    setNodes([startNode, endNode])
    setEdges([])
  }

  const handleNodeTypeDragStart = (e, nodeType) => {
    e.dataTransfer.setData('nodeType', JSON.stringify(nodeType))
  }

  const handleCanvasDrop = (e) => {
    e.preventDefault()
    const nodeTypeData = e.dataTransfer.getData('nodeType')
    if (!nodeTypeData) return

    const nodeType = JSON.parse(nodeTypeData)
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left + canvasRef.current.scrollLeft - 90
    const y = e.clientY - rect.top + canvasRef.current.scrollTop - 40

    const newNode = {
      id: uuidv4(),
      type: nodeType.type,
      name: nodeType.label,
      position: { x, y },
      config: getDefaultConfig(nodeType.type)
    }

    setNodes([...nodes, newNode])
  }

  const getDefaultConfig = (type) => {
    switch (type) {
      case 'condition':
        return { conditions: [], operator: 'and' }
      case 'loop':
        return { loopType: 'count', count: 1 }
      case 'delay':
        return { delayType: 'fixed', amount: 1, unit: 'seconds' }
      case 'retry':
        return { maxAttempts: 3, retryDelay: 1000, exponentialBackoff: true }
      case 'merge':
        return { strategy: 'all', mergeMode: 'concat' }
      case 'action':
        return { actionType: 'log', message: '' }
      default:
        return {}
    }
  }

  const handleNodeMouseDown = (e, node) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top
    
    setDraggingNode({ node, offsetX, offsetY })
    setSelectedNode(node)
    setSelectedEdge(null)
  }

  const handleMouseMove = (e) => {
    if (draggingNode) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left + canvasRef.current.scrollLeft - draggingNode.offsetX
      const y = e.clientY - rect.top + canvasRef.current.scrollTop - draggingNode.offsetY
      
      setNodes(nodes.map(n => 
        n.id === draggingNode.node.id 
          ? { ...n, position: { x: Math.max(0, x), y: Math.max(0, y) } }
          : n
      ))
    }

    if (connecting) {
      const rect = canvasRef.current.getBoundingClientRect()
      setConnectingPoint({
        x: e.clientX - rect.left + canvasRef.current.scrollLeft,
        y: e.clientY - rect.top + canvasRef.current.scrollTop
      })
    }
  }

  const handleMouseUp = () => {
    setDraggingNode(null)
    setConnecting(null)
    setConnectingPoint(null)
  }

  const startConnection = (e, node, direction) => {
    e.stopPropagation()
    setConnecting({ node, direction })
  }

  const endConnection = (e, targetNode) => {
    if (!connecting || connecting.node.id === targetNode.id) return
    
    const existingEdge = edges.find(edge => 
      edge.source === connecting.node.id && edge.target === targetNode.id
    )
    
    if (existingEdge) return

    const newEdge = {
      id: uuidv4(),
      source: connecting.node.id,
      target: targetNode.id,
      label: connecting.node.type === 'condition' ? 'Yes' : ''
    }

    setEdges([...edges, newEdge])
    setConnecting(null)
    setConnectingPoint(null)
  }

  const deleteSelected = () => {
    if (selectedNode) {
      setNodes(nodes.filter(n => n.id !== selectedNode.id))
      setEdges(edges.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id))
      setSelectedNode(null)
    } else if (selectedEdge) {
      setEdges(edges.filter(e => e.id !== selectedEdge.id))
      setSelectedEdge(null)
    }
  }

  const handleKeyDown = (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && (selectedNode || selectedEdge)) {
      deleteSelected()
    }
  }

  const saveVersion = async () => {
    try {
      const versions = await versionApi.list(workflowId)
      const versionNum = versions.length + 1
      
      await versionApi.create(workflowId, {
        name: `Version ${versionNum}`,
        graph: { nodes, edges },
        config: {
          timeoutMs: 300000,
          alerts: { enabled: true }
        }
      })
      
      alert('保存成功！')
    } catch (error) {
      console.error('Failed to save version:', error)
      alert('保存失败: ' + error.message)
    }
  }

  const runWorkflow = async () => {
    try {
      await saveVersion()
      const versions = await versionApi.list(workflowId)
      const latestVersion = versions[versions.length - 1]
      
      await versionApi.activate(workflowId, latestVersion.id)
      const execution = await workflowApi.run(workflowId, latestVersion.id)
      
      alert(`执行已启动! 执行ID: ${execution.id}`)
      navigate(`/workflows/${workflowId}`)
    } catch (error) {
      console.error('Failed to run workflow:', error)
      alert('执行失败: ' + error.message)
    }
  }

  const getNodeCenter = (node) => ({
    x: node.position.x + 90,
    y: node.position.y + 40
  })

  const updateNodeConfig = (nodeId, key, value) => {
    setNodes(nodes.map(n => 
      n.id === nodeId 
        ? { ...n, config: { ...n.config, [key]: value } }
        : n
    ))
    setSelectedNode(prev => 
      prev?.id === nodeId 
        ? { ...prev, config: { ...prev.config, [key]: value } }
        : prev
    )
  }

  const renderNodeConfig = () => {
    if (!selectedNode) return null

    return (
      <div className="property-panel">
        <h3>节点配置</h3>
        
        <div className="form-group">
          <label>节点名称</label>
          <input
            type="text"
            value={selectedNode.name}
            onChange={(e) => {
              setNodes(nodes.map(n => 
                n.id === selectedNode.id ? { ...n, name: e.target.value } : n
              ))
              setSelectedNode({ ...selectedNode, name: e.target.value })
            }}
          />
        </div>

        {selectedNode.type === 'condition' && (
          <div>
            <div className="form-group">
              <label>条件逻辑</label>
              <select
                value={selectedNode.config?.operator || 'and'}
                onChange={(e) => updateNodeConfig(selectedNode.id, 'operator', e.target.value)}
              >
                <option value="and">所有条件满足 (AND)</option>
                <option value="or">任一条件满足 (OR)</option>
              </select>
            </div>
            <div className="form-group">
              <label>条件表达式</label>
              <textarea
                value={selectedNode.config?.condition || ''}
                onChange={(e) => updateNodeConfig(selectedNode.id, 'condition', e.target.value)}
                placeholder="例如: value > 10 && status === 'active'"
                rows={3}
              />
            </div>
          </div>
        )}

        {selectedNode.type === 'loop' && (
          <div>
            <div className="form-group">
              <label>循环类型</label>
              <select
                value={selectedNode.config?.loopType || 'count'}
                onChange={(e) => updateNodeConfig(selectedNode.id, 'loopType', e.target.value)}
              >
                <option value="count">固定次数</option>
                <option value="condition">条件循环</option>
                <option value="iterator">遍历数组</option>
              </select>
            </div>
            {selectedNode.config?.loopType === 'count' && (
              <div className="form-group">
                <label>循环次数</label>
                <input
                  type="number"
                  min="1"
                  value={selectedNode.config?.count || 1}
                  onChange={(e) => updateNodeConfig(selectedNode.id, 'count', parseInt(e.target.value))}
                />
              </div>
            )}
            {selectedNode.config?.loopType === 'condition' && (
              <div className="form-group">
                <label>循环条件</label>
                <textarea
                  value={selectedNode.config?.condition || ''}
                  onChange={(e) => updateNodeConfig(selectedNode.id, 'condition', e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>
        )}

        {selectedNode.type === 'delay' && (
          <div>
            <div className="form-group">
              <label>延迟类型</label>
              <select
                value={selectedNode.config?.delayType || 'fixed'}
                onChange={(e) => updateNodeConfig(selectedNode.id, 'delayType', e.target.value)}
              >
                <option value="fixed">固定时间</option>
                <option value="variable">动态变量</option>
              </select>
            </div>
            <div className="form-group">
              <label>延迟时间</label>
              <input
                type="number"
                min="0"
                value={selectedNode.config?.amount || 1}
                onChange={(e) => updateNodeConfig(selectedNode.id, 'amount', parseFloat(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>时间单位</label>
              <select
                value={selectedNode.config?.unit || 'seconds'}
                onChange={(e) => updateNodeConfig(selectedNode.id, 'unit', e.target.value)}
              >
                <option value="milliseconds">毫秒</option>
                <option value="seconds">秒</option>
                <option value="minutes">分钟</option>
                <option value="hours">小时</option>
              </select>
            </div>
          </div>
        )}

        {selectedNode.type === 'retry' && (
          <div>
            <div className="form-group">
              <label>最大重试次数</label>
              <input
                type="number"
                min="1"
                value={selectedNode.config?.maxAttempts || 3}
                onChange={(e) => updateNodeConfig(selectedNode.id, 'maxAttempts', parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>重试间隔 (毫秒)</label>
              <input
                type="number"
                min="0"
                value={selectedNode.config?.retryDelay || 1000}
                onChange={(e) => updateNodeConfig(selectedNode.id, 'retryDelay', parseInt(e.target.value))}
              />
            </div>
          </div>
        )}

        {selectedNode.type === 'action' && (
          <div>
            <div className="form-group">
              <label>动作类型</label>
              <select
                value={selectedNode.config?.actionType || 'log'}
                onChange={(e) => updateNodeConfig(selectedNode.id, 'actionType', e.target.value)}
              >
                <option value="log">日志记录</option>
                <option value="http">HTTP 请求</option>
                <option value="script">脚本执行</option>
                <option value="transform">数据转换</option>
              </select>
            </div>
            {selectedNode.config?.actionType === 'log' && (
              <div className="form-group">
                <label>日志消息</label>
                <textarea
                  value={selectedNode.config?.message || ''}
                  onChange={(e) => updateNodeConfig(selectedNode.id, 'message', e.target.value)}
                  rows={3}
                />
              </div>
            )}
            {selectedNode.config?.actionType === 'http' && (
              <>
                <div className="form-group">
                  <label>请求方法</label>
                  <select
                    value={selectedNode.config?.method || 'GET'}
                    onChange={(e) => updateNodeConfig(selectedNode.id, 'method', e.target.value)}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>URL</label>
                  <input
                    type="text"
                    value={selectedNode.config?.url || ''}
                    onChange={(e) => updateNodeConfig(selectedNode.id, 'url', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {selectedNode.type === 'merge' && (
          <div>
            <div className="form-group">
              <label>合并策略</label>
              <select
                value={selectedNode.config?.strategy || 'all'}
                onChange={(e) => updateNodeConfig(selectedNode.id, 'strategy', e.target.value)}
              >
                <option value="all">等待所有分支</option>
                <option value="first">等待第一个分支</option>
                <option value="majority">等待多数分支</option>
              </select>
            </div>
          </div>
        )}

        {(selectedNode.type !== 'start' && selectedNode.type !== 'end') && (
          <button 
            className="btn btn-danger" 
            style={{ width: '100%', marginTop: '20px' }}
            onClick={deleteSelected}
          >
            删除节点
          </button>
        )}
      </div>
    )
  }

  const handleVersionChange = (versionId) => {
    navigate(`/workflows/${workflowId}/edit?version=${versionId}`)
  }

  return (
    <div>
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate(`/workflows/${workflowId}`)}
          >
            ← 返回
          </button>
          <div className="header-title">{workflow?.name || '工作流编辑器'}</div>
          {versions.length > 0 && (
            <select
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                marginLeft: '16px'
              }}
              value={currentVersion?.id || ''}
              onChange={(e) => handleVersionChange(e.target.value)}
            >
              {[...versions].reverse().map(version => (
                <option key={version.id} value={version.id}>
                  {version.name} {version.isActive ? '(当前)' : ''}
                </option>
              ))}
            </select>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={saveVersion}>
            💾 保存版本
          </button>
          <button className="btn btn-success" onClick={runWorkflow}>
            ▶ 运行
          </button>
        </div>
      </header>

      <div className="editor-container">
        <div className="editor-sidebar">
          <h3>节点类型</h3>
          <div className="node-types">
            {NODE_TYPES.map(nodeType => (
              <div
                key={nodeType.type}
                className="node-type-item"
                draggable
                onDragStart={(e) => handleNodeTypeDragStart(e, nodeType)}
              >
                <span className={`node-icon node-icon-${nodeType.color}`}>
                  {nodeType.icon}
                </span>
                <span>{nodeType.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div 
          className="canvas-area"
          ref={canvasRef}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleCanvasDrop}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          onClick={(e) => { 
            if (e.target.classList.contains('canvas-area') || e.target.classList.contains('canvas-content')) {
              setSelectedNode(null); 
              setSelectedEdge(null) 
            }
          }}
        >
          <div className="canvas-content">
            <svg
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            >
              {edges.map(edge => {
                const sourceNode = nodes.find(n => n.id === edge.source)
                const targetNode = nodes.find(n => n.id === edge.target)
                if (!sourceNode || !targetNode) return null

                const sourceCenter = getNodeCenter(sourceNode)
                const targetCenter = getNodeCenter(targetNode)
                const dx = targetCenter.x - sourceCenter.x
                const midX = sourceCenter.x + dx / 2

                const path = `M ${sourceCenter.x} ${sourceCenter.y} C ${midX} ${sourceCenter.y}, ${midX} ${targetCenter.y}, ${targetCenter.x} ${targetCenter.y}`
                
                return (
                  <g 
                    key={edge.id}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setSelectedEdge(edge); 
                      setSelectedNode(null) 
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <path
                      d={path}
                      className={`connection-line ${selectedEdge?.id === edge.id ? 'selected' : ''}`}
                      style={{ pointerEvents: 'stroke' }}
                    />
                    {edge.label && (
                      <text
                        x={midX}
                        y={sourceCenter.y + (targetCenter.y - sourceCenter.y) / 2}
                        className="connection-label"
                        textAnchor="middle"
                        dy="-4"
                        style={{ pointerEvents: 'none' }}
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                )
              })}

              {connecting && connectingPoint && (
                <line
                  x1={getNodeCenter(connecting.node).x}
                  y1={getNodeCenter(connecting.node).y}
                  x2={connectingPoint.x}
                  y2={connectingPoint.y}
                  stroke="#4361ee"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              )}
            </svg>

            {nodes.map(node => {
              const nodeTypeInfo = NODE_TYPES.find(t => t.type === node.type)
              return (
                <div
                  key={node.id}
                  className={`workflow-node ${selectedNode?.id === node.id ? 'selected' : ''}`}
                  style={{ left: node.position.x, top: node.position.y, zIndex: selectedNode?.id === node.id ? 100 : 10 }}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  onMouseUp={(e) => {
                    if (connecting) {
                      endConnection(e, node)
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!draggingNode) {
                      setSelectedNode(node)
                      setSelectedEdge(null)
                    }
                  }}
                >
                  <div className="node-header">
                    <span className={`node-icon node-icon-${nodeTypeInfo?.color || 'action'}`}>
                      {nodeTypeInfo?.icon || '⚙'}
                    </span>
                    <div>
                      <div className="node-name">{node.name}</div>
                      <div className="node-type">{nodeTypeInfo?.label}</div>
                    </div>
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      right: '-6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '12px',
                      height: '12px',
                      background: '#4361ee',
                      borderRadius: '50%',
                      cursor: 'crosshair',
                      zIndex: 20
                    }}
                    onMouseDown={(e) => startConnection(e, node, 'out')}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {renderNodeConfig()}
      </div>
    </div>
  )
}

export default WorkflowEditor