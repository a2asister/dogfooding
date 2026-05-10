export class PluginManager {
  constructor() {
    this.plugins = new Map()
    this.nodeTypes = new Map()
    this.actions = new Map()
  }

  registerPlugin(plugin) {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} already registered`)
      return false
    }

    this.plugins.set(plugin.id, plugin)

    if (plugin.nodeTypes) {
      plugin.nodeTypes.forEach((nodeType) => {
        this.nodeTypes.set(`${plugin.id}:${nodeType.type}`, {
          ...nodeType,
          pluginId: plugin.id
        })
      })
    }

    if (plugin.actions) {
      plugin.actions.forEach((action) => {
        this.actions.set(`${plugin.id}:${action.id}`, {
          ...action,
          pluginId: plugin.id
        })
      })
    }

    if (plugin.onInit) {
      plugin.onInit()
    }

    return true
  }

  unregisterPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) return false

    if (plugin.nodeTypes) {
      plugin.nodeTypes.forEach((nodeType) => {
        this.nodeTypes.delete(`${pluginId}:${nodeType.type}`)
      })
    }

    if (plugin.actions) {
      plugin.actions.forEach((action) => {
        this.actions.delete(`${pluginId}:${action.id}`)
      })
    }

    if (plugin.onDestroy) {
      plugin.onDestroy()
    }

    this.plugins.delete(pluginId)
    return true
  }

  getPlugin(pluginId) {
    return this.plugins.get(pluginId)
  }

  getPlugins() {
    return Array.from(this.plugins.values())
  }

  getNodeTypes() {
    return Array.from(this.nodeTypes.values())
  }

  getNodeType(nodeTypeId) {
    return this.nodeTypes.get(nodeTypeId)
  }

  getActions() {
    return Array.from(this.actions.values())
  }

  getAction(actionId) {
    return this.actions.get(actionId)
  }

  async executeAction(actionId, context) {
    const action = this.getAction(actionId)
    if (!action) {
      throw new Error(`Action not found: ${actionId}`)
    }

    if (action.execute) {
      return await action.execute(context)
    }

    return null
  }
}

export const createPlugin = (config) => ({
  id: config.id,
  name: config.name,
  version: config.version || '1.0.0',
  description: config.description || '',
  author: config.author || '',
  nodeTypes: config.nodeTypes || [],
  actions: config.actions || [],
  onInit: config.onInit,
  onDestroy: config.onDestroy
})

export const createNodeType = (config) => ({
  type: config.type,
  name: config.name,
  icon: config.icon || '⚙',
  color: config.color || 'action',
  category: config.category || 'plugins',
  configSchema: config.configSchema || {},
  defaultConfig: config.defaultConfig || {},
  executor: config.executor
})

export const createAction = (config) => ({
  id: config.id,
  name: config.name,
  description: config.description || '',
  execute: config.execute
})

export const pluginManager = new PluginManager()

const httpPlugin = createPlugin({
  id: 'http',
  name: 'HTTP 插件',
  version: '1.0.0',
  description: '提供 HTTP 请求功能',
  nodeTypes: [
    createNodeType({
      type: 'request',
      name: 'HTTP 请求',
      icon: '🌐',
      color: 'action',
      defaultConfig: {
        method: 'GET',
        url: '',
        headers: {},
        body: '',
        timeout: 30000
      }
    })
  ],
  actions: [
    createAction({
      id: 'sendRequest',
      name: '发送 HTTP 请求',
      execute: async (context) => {
        return { success: true, data: context }
      }
    })
  ]
})

const databasePlugin = createPlugin({
  id: 'database',
  name: '数据库插件',
  version: '1.0.0',
  description: '提供数据库操作功能',
  nodeTypes: [
    createNodeType({
      type: 'query',
      name: '数据库查询',
      icon: '🗄️',
      color: 'action',
      defaultConfig: {
        connectionId: '',
        query: '',
        params: []
      }
    }),
    createNodeType({
      type: 'insert',
      name: '插入数据',
      icon: '➕',
      color: 'action',
      defaultConfig: {
        connectionId: '',
        table: '',
        data: {}
      }
    })
  ]
})

const filePlugin = createPlugin({
  id: 'file',
  name: '文件插件',
  version: '1.0.0',
  description: '提供文件操作功能',
  nodeTypes: [
    createNodeType({
      type: 'read',
      name: '读取文件',
      icon: '📄',
      color: 'action',
      defaultConfig: {
        path: '',
        encoding: 'utf-8'
      }
    }),
    createNodeType({
      type: 'write',
      name: '写入文件',
      icon: '✏️',
      color: 'action',
      defaultConfig: {
        path: '',
        content: '',
        encoding: 'utf-8'
      }
    })
  ]
})

const notificationPlugin = createPlugin({
  id: 'notification',
  name: '通知插件',
  version: '1.0.0',
  description: '提供各种通知方式',
  nodeTypes: [
    createNodeType({
      type: 'email',
      name: '发送邮件',
      icon: '📧',
      color: 'action',
      defaultConfig: {
        to: '',
        subject: '',
        body: '',
        attachments: []
      }
    }),
    createNodeType({
      type: 'slack',
      name: 'Slack 消息',
      icon: '💬',
      color: 'action',
      defaultConfig: {
        webhookUrl: '',
        channel: '',
        message: ''
      }
    }),
    createNodeType({
      type: 'webhook',
      name: 'Webhook',
      icon: '🔔',
      color: 'action',
      defaultConfig: {
        url: '',
        method: 'POST',
        payload: {}
      }
    })
  ]
})

pluginManager.registerPlugin(httpPlugin)
pluginManager.registerPlugin(databasePlugin)
pluginManager.registerPlugin(filePlugin)
pluginManager.registerPlugin(notificationPlugin)

export default pluginManager
