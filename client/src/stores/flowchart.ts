import { defineStore } from 'pinia'
import { ApolloClient, createHttpLink, InMemoryCache, gql } from '@apollo/client/core'

interface NodeData {
  id: string
  name: string
  type: string
  position: { x: number; y: number; z: number }
  collapsed: boolean
  children: string[]
}

interface ConnectionData {
  id: string
  from: string
  to: string
}

interface FlowchartData {
  id?: string
  name: string
  nodes: NodeData[]
  connections: ConnectionData[]
  createdAt?: Date
  updatedAt?: Date
}

const httpLink = createHttpLink({
  uri: '/graphql'
})

const cache = new InMemoryCache()

const apolloClient = new ApolloClient({
  link: httpLink,
  cache
})

const SAVE_FLOWCHART = gql`
  mutation SaveFlowchart($data: FlowchartInput!) {
    saveFlowchart(data: $data) {
      id
      name
      createdAt
    }
  }
`

export const useFlowchartStore = defineStore('flowchart', {
  state: () => ({
    nodes: [] as NodeData[],
    connections: [] as ConnectionData[],
    currentFlowchart: null as FlowchartData | null
  }),

  actions: {
    addNode(node: NodeData) {
      this.nodes.push(node)
    },

    removeNode(id: string) {
      this.nodes = this.nodes.filter(n => n.id !== id)
      this.connections = this.connections.filter(c => c.from !== id && c.to !== id)
    },

    addConnection(connection: ConnectionData) {
      this.connections.push(connection)
    },

    async saveFlowchart(data: { nodes: NodeData[]; connections: ConnectionData[] }) {
      const flowchartData: FlowchartData = {
        name: '未命名流程图',
        nodes: data.nodes,
        connections: data.connections
      }

      try {
        const result = await apolloClient.mutate({
          mutation: SAVE_FLOWCHART,
          variables: { data: flowchartData }
        })
        console.log('保存成功:', result)
        return result
      } catch (error) {
        console.error('保存失败:', error)
        throw error
      }
    },

    async loadFlowchart(id: string) {
      // 加载流程图
    },

    async exportImage() {
      // 导出图片
    }
  }
})
