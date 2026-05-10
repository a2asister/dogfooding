import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant
} from 'reactflow'
import 'reactflow/dist/style.css'
import { workflowApi, versionApi, executionApi } from '../services/api'
import { useWorkflowStore, createNodeId, createEdgeId, NODE_DEFAULTS } from '../store/workflowStore'
import { nodeTypes } from '../components/CustomNode'
import NodeSidebar from '../components/NodeSidebar'
import PropertyPanel from '../components/PropertyPanel'
import Toolbar from '../components/Toolbar'

const WorkflowEditor = () => {
  const { id: workflowId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const reactFlowWrapper = useRef(null)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)

  const [workflow, setWorkflow] = useState(null)
  const [currentVersion, setCurrentVersion] = useState(null)
  const [versions, setVersions] = useState([])
  const [executionLogs, setExecutionLogs] = useState([])
  const [showLogs, setShowLogs] = useState(false)

  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    setSelection,
    selectedNodes,
    selectedEdges,
    undo,
    redo,
    copy,
    paste,
    deleteSelected,
    duplicate,
    getGraph,
    loadGraph,
    debugMode,
    clipboard,
    setHistorySkip
  } = useWorkflowStore()

  const getVersionFromUrl = () => {
    const params = new URLSearchParams(location.search)
    return params.get('version')
  }

  useEffect(() => {
    loadWorkflow()
  }, [workflowId, location.search])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.target.getAttribute('contenteditable') === 'true') return

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
          case 'y':
            e.preventDefault()
            redo()
            break
          case 'c':
            e.preventDefault()
            copy()
            break
          case 'v':
            e.preventDefault()
            paste()
            break
          case 'd':
            e.preventDefault()
            duplicate()
            break
          case 'a':
            e.preventDefault()
            selectAll()
            break
        }
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && (selectedNodes.length > 0 || selectedEdges.length > 0)) {
        e.preventDefault()
        deleteSelected()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNodes, selectedEdges, undo, redo, copy, paste, deleteSelected, duplicate])

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
          setHistorySkip(true)
          loadGraph(targetVersion.graph || { nodes: [], edges: [] })
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
      id: createNodeId(),
      type: 'custom',
      position: { x: 100, y: 200 },
      data: {
        ...NODE_DEFAULTS.start,
        nodeType: 'start'
      }
    }
    const endNode = {
      id: createNodeId(),
      type: 'custom',
      position: { x: 600, y: 200 },
      data: {
        ...NODE_DEFAULTS.end,
        nodeType: 'end'
      }
    }

    setHistorySkip(true)
    setNodes([startNode, endNode])
    setEdges([])
  }

  const selectAll = () => {
    setSelection({
      nodes: nodes.map(n => n.id),
      edges: edges.map(e => e.id)
    })
  }

  const onNodesChange = useCallback(
    (changes) => {
      const updatedNodes = applyNodeChanges(changes, nodes)
      setNodes(updatedNodes)
    },
    [nodes, setNodes]
  )

  const onEdgesChange = useCallback(
    (changes) => {
      const updatedEdges = applyEdgeChanges(changes, edges)
      setEdges(updatedEdges)
    },
    [edges, setEdges]
  )

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        id: createEdgeId(),
        ...params,
        animated: false,
        label: '',
        data: { label: '' }
      }
      setEdges(addEdge(newEdge, edges))
    },
    [edges, setEdges]
  )

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()

      const nodeTypeData = event.dataTransfer.getData('application/reactflow/newnode')
      if (!nodeTypeData) return

      const nodeType = JSON.parse(nodeTypeData)

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      })

      const defaults = NODE_DEFAULTS[nodeType.type] || NODE_DEFAULTS.action

      const newNode = {
        id: createNodeId(),
        type: 'custom',
        position,
        data: {
          ...defaults,
          nodeType: nodeType.type
        }
      }

      setNodes([...nodes, newNode])
    },
    [reactFlowInstance, nodes, setNodes]
  )

  const onSelectionChange = useCallback(({ nodes: selectedN, edges: selectedE }) => {
    setSelection({
      nodes: selectedN.map(n => n.id),
      edges: selectedE.map(e => e.id)
    })
  }, [setSelection])

  const saveVersion = async () => {
    try {
      const allVersions = await versionApi.list(workflowId)
      const versionNum = allVersions.length + 1

      await versionApi.create(workflowId, {
        name: `Version ${versionNum}`,
        graph: getGraph(),
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
      const allVersions = await versionApi.list(workflowId)
      const latestVersion = allVersions[allVersions.length - 1]

      await versionApi.activate(workflowId, latestVersion.id)
      const execution = await workflowApi.run(workflowId, latestVersion.id)

      alert(`执行已启动! 执行ID: ${execution.id}`)
      navigate(`/workflows/${workflowId}`)
    } catch (error) {
      console.error('Failed to run workflow:', error)
      alert('执行失败: ' + error.message)
    }
  }

  const handleDebug = async () => {
    try {
      const allVersions = await versionApi.list(workflowId)
      const latestVersion = allVersions[allVersions.length - 1]

      await versionApi.activate(workflowId, latestVersion.id)
      const execution = await workflowApi.run(workflowId, latestVersion.id, {
        debug: true
      })

      pollExecutionLogs(execution.id)
    } catch (error) {
      console.error('Debug failed:', error)
      alert('调试失败: ' + error.message)
    }
  }

  const pollExecutionLogs = async (executionId) => {
    try {
      const logs = await executionApi.getLogs(executionId)
      setExecutionLogs(logs)
      setShowLogs(true)

      const interval = setInterval(async () => {
        const newLogs = await executionApi.getLogs(executionId)
        setExecutionLogs(newLogs)

        const execution = await executionApi.get(executionId)
        if (['completed', 'failed', 'cancelled', 'timeout'].includes(execution.status)) {
          clearInterval(interval)
        }
      }, 1000)

      setTimeout(() => clearInterval(interval), 60000)
    } catch (error) {
      console.error('Failed to get logs:', error)
    }
  }

  const handleVersionChange = (versionId) => {
    navigate(`/workflows/${workflowId}/edit?version=${versionId}`)
  }

  const nodeColor = (node) => {
    const type = node.data?.nodeType || node.type
    const colors = {
      start: '#10b981',
      end: '#ef4444',
      action: '#4361ee',
      condition: '#f59e0b',
      loop: '#8b5cf6',
      delay: '#06b6d4',
      retry: '#ec4899',
      merge: '#64748b',
      subworkflow: '#0ea5e9',
      plugin: '#f97316',
      fork: '#a855f7',
      join: '#6366f1'
    }
    return colors[type] || '#4361ee'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
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
          {debugMode && (
            <span className="badge badge-warning" style={{ marginLeft: '12px' }}>
              🔍 调试模式
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowLogs(!showLogs)}
          >
            📋 日志
          </button>
          <button className="btn btn-secondary" onClick={saveVersion}>
            💾 保存版本
          </button>
          <button className="btn btn-success" onClick={runWorkflow}>
            ▶ 运行
          </button>
        </div>
      </header>

      <Toolbar onDebug={handleDebug} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <NodeSidebar />

        <div style={{ flex: 1, position: 'relative' }} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            defaultEdgeOptions={{
              animated: false,
              style: { stroke: '#94a3b8', strokeWidth: 2 }
            }}
          >
            <Controls />
            <MiniMap
              nodeColor={nodeColor}
              nodeStrokeWidth={3}
              zoomable
              pannable
            />
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#e5e7eb"
            />
          </ReactFlow>
        </div>

        <PropertyPanel />
      </div>

      {showLogs && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: '260px',
            right: '320px',
            height: '200px',
            background: '#1e1e1e',
            color: '#d4d4d4',
            borderTop: '1px solid #333',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div
            style={{
              padding: '8px 16px',
              background: '#2d2d2d',
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontWeight: '500' }}>执行日志</span>
            <button
              onClick={() => setShowLogs(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#d4d4d4',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              ×
            </button>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '13px'
            }}
          >
            {executionLogs.length === 0 ? (
              <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                暂无日志
              </div>
            ) : (
              executionLogs.map((log, index) => (
                <div key={index} className="log-entry" style={{ marginBottom: '4px' }}>
                  <span style={{ color: '#666' }}>
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <span className={`log-${log.level}`} style={{ marginLeft: '8px' }}>
                    [{log.level.toUpperCase()}]
                  </span>
                  <span style={{ marginLeft: '8px' }}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const WorkflowEditorWithProvider = () => (
  <ReactFlowProvider>
    <WorkflowEditor />
  </ReactFlowProvider>
)

export default WorkflowEditorWithProvider
