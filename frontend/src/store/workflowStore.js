import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

const MAX_HISTORY_SIZE = 50

const createNodeId = () => `node_${uuidv4()}`
const createEdgeId = () => `edge_${uuidv4()}`

const NODE_DEFAULTS = {
  start: { name: '开始', config: {} },
  end: { name: '结束', config: {} },
  action: { name: '执行动作', config: { actionType: 'log', message: '' } },
  condition: { name: '条件判断', config: { operator: 'and', condition: '' } },
  loop: { name: '循环执行', config: { loopType: 'count', count: 1 } },
  delay: { name: '延迟触发', config: { delayType: 'fixed', amount: 1, unit: 'seconds' } },
  retry: { name: '异常重试', config: { maxAttempts: 3, retryDelay: 1000 } },
  merge: { name: '分支合并', config: { strategy: 'all' } },
  subworkflow: { name: '子流程', config: { workflowId: '', versionId: '', passData: true } },
  plugin: { name: '插件节点', config: { pluginId: '', pluginConfig: {} } },
  fork: { name: '并行分支', config: {} },
  join: { name: '并行汇合', config: { strategy: 'all' } }
}

const DEFAULT_POSITION = { x: 100, y: 100 }

const ensureNodePosition = (node, fallbackIndex = 0) => {
  if (!node) return null
  if (!node.position) {
    return {
      ...node,
      position: {
        x: 100 + (fallbackIndex % 5) * 250,
        y: 150 + Math.floor(fallbackIndex / 5) * 150
      }
    }
  }
  if (typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
    return {
      ...node,
      position: {
        x: typeof node.position.x === 'number' ? node.position.x : 100 + (fallbackIndex % 5) * 250,
        y: typeof node.position.y === 'number' ? node.position.y : 150 + Math.floor(fallbackIndex / 5) * 150
      }
    }
  }
  return node
}

const ensureNodesPositions = (nodes) => {
  if (!Array.isArray(nodes)) return []
  return nodes.map((node, index) => ensureNodePosition(node, index))
}

const validateNode = (node) => {
  if (!node || typeof node !== 'object') return false
  if (!node.id || typeof node.id !== 'string') return false
  if (!node.type || typeof node.type !== 'string') return false
  if (!node.position || typeof node.position !== 'object') return false
  if (typeof node.position.x !== 'number' || typeof node.position.y !== 'number') return false
  return true
}

let skipNextHistory = false

const useWorkflowStore = create((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodes: [],
  selectedEdges: [],
  clipboard: null,
  history: {
    past: [],
    future: []
  },
  plugins: [],
  executionState: null,
  debugMode: false,
  activeDebugNode: null,

  setNodes: (nodes) => {
    const state = get()
    const validatedNodes = ensureNodesPositions(nodes)
    const validNodes = validatedNodes.filter(validateNode)

    if (!skipNextHistory) {
      const newPast = [...state.history.past, { nodes: state.nodes, edges: state.edges }].slice(-MAX_HISTORY_SIZE)
      set({
        nodes: validNodes,
        history: { past: newPast, future: [] }
      })
    } else {
      set({ nodes: validNodes })
      skipNextHistory = false
    }
  },

  setEdges: (edges) => {
    const state = get()
    if (!skipNextHistory) {
      const newPast = [...state.history.past, { nodes: state.nodes, edges: state.edges }].slice(-MAX_HISTORY_SIZE)
      set({
        edges,
        history: { past: newPast, future: [] }
      })
    } else {
      set({ edges })
      skipNextHistory = false
    }
  },

  setNodesAndEdges: (nodes, edges) => {
    const state = get()
    const validatedNodes = ensureNodesPositions(nodes)
    const validNodes = validatedNodes.filter(validateNode)

    if (!skipNextHistory) {
      const newPast = [...state.history.past, { nodes: state.nodes, edges: state.edges }].slice(-MAX_HISTORY_SIZE)
      set({
        nodes: validNodes,
        edges,
        history: { past: newPast, future: [] }
      })
    } else {
      set({ nodes: validNodes, edges })
      skipNextHistory = false
    }
  },

  addNode: (nodeType, position = DEFAULT_POSITION) => {
    const defaults = NODE_DEFAULTS[nodeType] || NODE_DEFAULTS.action
    const newNode = {
      id: createNodeId(),
      type: 'custom',
      position: ensureNodePosition({ position }).position,
      data: {
        ...defaults,
        nodeType
      }
    }
    const state = get()
    const newPast = [...state.history.past, { nodes: state.nodes, edges: state.edges }].slice(-MAX_HISTORY_SIZE)
    set({
      nodes: [...state.nodes, newNode],
      history: { past: newPast, future: [] }
    })
    return newNode
  },

  addEdge: (source, target, label = '') => {
    const state = get()
    const existingEdge = state.edges.find((e) => e.source === source && e.target === target)
    if (existingEdge) return existingEdge

    const newEdge = {
      id: createEdgeId(),
      source,
      target,
      animated: false,
      label,
      data: { label }
    }
    const newPast = [...state.history.past, { nodes: state.nodes, edges: state.edges }].slice(-MAX_HISTORY_SIZE)
    set({
      edges: [...state.edges, newEdge],
      history: { past: newPast, future: [] }
    })
    return newEdge
  },

  updateNode: (nodeId, updates) => {
    const state = get()
    const newPast = [...state.history.past, { nodes: state.nodes, edges: state.edges }].slice(-MAX_HISTORY_SIZE)
    set({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? ensureNodePosition({ ...n, data: { ...n.data, ...updates.data } }) : n
      ),
      history: { past: newPast, future: [] }
    })
  },

  updateNodeConfig: (nodeId, configUpdates) => {
    const state = get()
    const newPast = [...state.history.past, { nodes: state.nodes, edges: state.edges }].slice(-MAX_HISTORY_SIZE)
    set({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? ensureNodePosition({
              ...n,
              data: { ...n.data, config: { ...n.data.config, ...configUpdates } }
            })
          : n
      ),
      history: { past: newPast, future: [] }
    })
  },

  deleteNode: (nodeId) => {
    const state = get()
    const newPast = [...state.history.past, { nodes: state.nodes, edges: state.edges }].slice(-MAX_HISTORY_SIZE)
    set({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      history: { past: newPast, future: [] }
    })
  },

  deleteSelected: () => {
    const state = get()
    if (state.selectedNodes.length === 0 && state.selectedEdges.length === 0) return

    const newPast = [...state.history.past, { nodes: state.nodes, edges: state.edges }].slice(-MAX_HISTORY_SIZE)
    set({
      nodes: state.nodes.filter((n) => !state.selectedNodes.includes(n.id)),
      edges: state.edges.filter(
        (e) =>
          !state.selectedEdges.includes(e.id) &&
          !state.selectedNodes.includes(e.source) &&
          !state.selectedNodes.includes(e.target)
      ),
      selectedNodes: [],
      selectedEdges: [],
      history: { past: newPast, future: [] }
    })
  },

  setSelection: ({ nodes = [], edges = [] }) => {
    set({
      selectedNodes: nodes,
      selectedEdges: edges
    })
  },

  undo: () => {
    const state = get()
    if (state.history.past.length === 0) return

    const newPast = [...state.history.past]
    const previousState = newPast.pop()

    skipNextHistory = true
    const validatedNodes = ensureNodesPositions(previousState.nodes)
    const validNodes = validatedNodes.filter(validateNode)

    set({
      nodes: validNodes,
      edges: previousState.edges,
      history: {
        past: newPast,
        future: [{ nodes: state.nodes, edges: state.edges }, ...state.history.future]
      }
    })
  },

  redo: () => {
    const state = get()
    if (state.history.future.length === 0) return

    const newFuture = [...state.history.future]
    const nextState = newFuture.shift()

    skipNextHistory = true
    const validatedNodes = ensureNodesPositions(nextState.nodes)
    const validNodes = validatedNodes.filter(validateNode)

    set({
      nodes: validNodes,
      edges: nextState.edges,
      history: {
        past: [...state.history.past, { nodes: state.nodes, edges: state.edges }],
        future: newFuture
      }
    })
  },

  canUndo: () => get().history.past.length > 0,
  canRedo: () => get().history.future.length > 0,

  copy: () => {
    const state = get()
    if (state.selectedNodes.length === 0) return

    const copiedNodes = state.nodes.filter((n) => state.selectedNodes.includes(n.id))
    const copiedEdges = state.edges.filter(
      (e) => state.selectedNodes.includes(e.source) && state.selectedNodes.includes(e.target)
    )

    set({
      clipboard: {
        nodes: ensureNodesPositions(copiedNodes),
        edges: copiedEdges,
        sourceNodeIds: state.selectedNodes
      }
    })
  },

  paste: () => {
    const state = get()
    if (!state.clipboard) return

    const idMapping = {}
    const pastedNodes = state.clipboard.nodes.map((node, index) => {
      const newId = createNodeId()
      idMapping[node.id] = newId
      const pos = node.position || DEFAULT_POSITION
      return {
        ...node,
        id: newId,
        position: {
          x: (pos.x || 0) + 50 + (index % 3) * 30,
          y: (pos.y || 0) + 50 + Math.floor(index / 3) * 30
        }
      }
    })

    const pastedEdges = state.clipboard.edges.map((edge) => ({
      ...edge,
      id: createEdgeId(),
      source: idMapping[edge.source] || edge.source,
      target: idMapping[edge.target] || edge.target
    }))

    const validatedNodes = ensureNodesPositions(pastedNodes)
    const validNodes = validatedNodes.filter(validateNode)

    const newPast = [...state.history.past, { nodes: state.nodes, edges: state.edges }].slice(-MAX_HISTORY_SIZE)
    set({
      nodes: [...state.nodes, ...validNodes],
      edges: [...state.edges, ...pastedEdges],
      selectedNodes: validNodes.map((n) => n.id),
      selectedEdges: pastedEdges.map((e) => e.id),
      history: { past: newPast, future: [] }
    })
  },

  duplicate: () => {
    get().copy()
    get().paste()
  },

  clearClipboard: () => set({ clipboard: null }),

  registerPlugin: (plugin) => {
    const state = get()
    set({ plugins: [...state.plugins, plugin] })
  },

  unregisterPlugin: (pluginId) => {
    const state = get()
    set({ plugins: state.plugins.filter((p) => p.id !== pluginId) })
  },

  getPlugins: () => get().plugins,

  setExecutionState: (state) => set({ executionState: state }),

  setDebugMode: (enabled) => set({ debugMode: enabled }),

  setActiveDebugNode: (nodeId) => set({ activeDebugNode: nodeId }),

  getGraph: () => {
    const state = get()
    return {
      nodes: state.nodes.map((n) => ({
        id: n.id,
        type: n.data?.nodeType || n.type,
        name: n.data?.name || '未命名',
        position: n.position,
        config: n.data?.config || {}
      })),
      edges: state.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.data?.label || e.label || ''
      }))
    }
  },

  loadGraph: (graph = { nodes: [], edges: [] }) => {
    const rfNodes = (graph.nodes || []).map((n, index) => {
      const node = {
        id: n.id || createNodeId(),
        type: 'custom',
        position: n.position || {
          x: 100 + (index % 5) * 250,
          y: 150 + Math.floor(index / 5) * 150
        },
        data: {
          name: n.name || '未命名',
          nodeType: n.type || 'action',
          config: n.config || {}
        }
      }
      return ensureNodePosition(node, index)
    })

    const validNodes = rfNodes.filter(validateNode)

    const rfEdges = (graph.edges || []).map((e) => ({
      id: e.id || createEdgeId(),
      source: e.source,
      target: e.target,
      animated: false,
      label: e.label || '',
      data: { label: e.label || '' }
    }))

    skipNextHistory = true
    set({
      nodes: validNodes,
      edges: rfEdges,
      history: { past: [], future: [] }
    })
  },

  setHistorySkip: (skip) => {
    skipNextHistory = skip
  },

  getValidatedNodes: () => {
    const state = get()
    return ensureNodesPositions(state.nodes).filter(validateNode)
  },

  clear: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodes: [],
      selectedEdges: [],
      history: { past: [], future: [] }
    })
  }
}))

export { useWorkflowStore, createNodeId, createEdgeId, NODE_DEFAULTS, ensureNodePosition, ensureNodesPositions, validateNode }
