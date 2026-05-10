import dagre from 'dagre'

const NODE_WIDTH = 180
const NODE_HEIGHT = 80
const RANK_SEPARATOR = 120
const NODE_SEPARATOR = 80

export const layoutGraph = (nodes, edges, direction = 'LR') => {
  const g = new dagre.graphlib.Graph()
  g.setGraph({
    rankdir: direction,
    ranksep: RANK_SEPARATOR,
    nodesep: NODE_SEPARATOR,
    marginx: 50,
    marginy: 50
  })
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach((node) => {
    g.setNode(node.id, {
      width: NODE_WIDTH,
      height: NODE_HEIGHT
    })
  })

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  return {
    nodes: nodes.map((node) => {
      const layoutedNode = g.node(node.id) || { x: 0, y: 0 }
      return {
        ...node,
        position: {
          x: (layoutedNode.x || 0) - NODE_WIDTH / 2,
          y: (layoutedNode.y || 0) - NODE_HEIGHT / 2
        }
      }
    }),
    edges
  }
}

export const autoLayoutDirection = {
  LEFT_TO_RIGHT: 'LR',
  RIGHT_TO_LEFT: 'RL',
  TOP_TO_BOTTOM: 'TB',
  BOTTOM_TO_TOP: 'BT'
}

export const hierarchicalLayout = (nodes, edges, direction = 'LR') => {
  const g = new dagre.graphlib.Graph()
  g.setGraph({
    rankdir: direction,
    ranksep: 100,
    nodesep: 60,
    align: 'UL'
  })
  g.setDefaultEdgeLabel(() => ({}))

  const startNodes = nodes.filter((n) => n.data?.nodeType === 'start')
  const endNodes = nodes.filter((n) => n.data?.nodeType === 'end')

  startNodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT, rank: 0 })
  })

  endNodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT, rank: 100 })
  })

  nodes
    .filter((n) => n.data?.nodeType !== 'start' && n.data?.nodeType !== 'end')
    .forEach((node) => {
      g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
    })

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  return {
    nodes: nodes.map((node) => {
      const layoutedNode = g.node(node.id) || { x: 0, y: 0 }
      return {
        ...node,
        position: {
          x: (layoutedNode.x || 0) - NODE_WIDTH / 2,
          y: (layoutedNode.y || 0) - NODE_HEIGHT / 2
        }
      }
    }),
    edges
  }
}

export const flowLayout = (nodes, edges, direction = 'LR') => {
  return layoutGraph(nodes, edges, direction)
}
