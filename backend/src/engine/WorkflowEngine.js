const store = require('../data/store');
const logger = require('../utils/logger');
const { ConditionExecutor, LoopExecutor, DelayExecutor, RetryExecutor, MergeExecutor } = require('./executors');
const { ActionExecutor } = require('./ActionExecutor');

const NODE_TYPES = {
  START: 'start',
  END: 'end',
  ACTION: 'action',
  CONDITION: 'condition',
  LOOP: 'loop',
  DELAY: 'delay',
  RETRY: 'retry',
  MERGE: 'merge',
  SUBWORKFLOW: 'subworkflow',
  PLUGIN: 'plugin',
  FORK: 'fork',
  JOIN: 'join'
};

class WorkflowEngine {
  constructor(workflowId, versionId, triggerType, initialData = {}, io = null) {
    this.workflowId = workflowId;
    this.versionId = versionId;
    this.triggerType = triggerType;
    this.initialData = { ...initialData };
    this.io = io;
    
    this.executionId = null;
    this.version = null;
    this.isRunning = false;
    this.isCancelled = false;
    this.pendingMergeNodes = new Map();
    this.timeoutTimer = null;
    this.failureCount = 0;
    this.maxFailures = 5;
  }

  async start() {
    const workflow = store.getWorkflow(this.workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${this.workflowId}`);
    }

    const versions = store.getVersions(this.workflowId);
    this.version = versions.find(v => v.id === this.versionId) || versions[0];
    
    if (!this.version) {
      throw new Error(`No version found for workflow: ${this.workflowId}`);
    }

    const execution = store.createExecution({
      workflowId: this.workflowId,
      versionId: this.version.id,
      triggerType: this.triggerType,
      data: this.initialData
    });
    
    this.executionId = execution.id;
    this.isRunning = true;

    store.updateExecution(this.executionId, {
      status: 'running',
      startedAt: Date.now()
    });

    this.emit('execution:start', {
      executionId: this.executionId,
      workflowId: this.workflowId,
      status: 'running'
    });

    if (this.version.config.timeoutMs) {
      this.timeoutTimer = setTimeout(() => {
        this.timeout();
      }, this.version.config.timeoutMs);
    }

    try {
      const startNode = this.findNodeByType(NODE_TYPES.START);
      if (!startNode) {
        throw new Error('No start node found in workflow');
      }

      store.addExecutionLog(this.executionId, {
        level: 'info',
        message: `Workflow started with trigger: ${this.triggerType}`
      });

      const startResult = await this.executeNode(startNode, this.initialData);
      await this.continueFromBranch(startNode, startResult);

      store.updateExecution(this.executionId, {
        status: 'completed',
        completedAt: Date.now()
      });

      this.emit('execution:complete', {
        executionId: this.executionId,
        status: 'completed'
      });

      logger.info(`Execution ${this.executionId} completed successfully`);
    } catch (error) {
      if (!this.isCancelled) {
        this.handleError(error);
      }
    } finally {
      this.cleanup();
    }

    return store.getExecution(this.executionId);
  }

  cancel() {
    this.isCancelled = true;
    this.isRunning = false;
    
    store.updateExecution(this.executionId, {
      status: 'cancelled',
      completedAt: Date.now()
    });

    this.emit('execution:cancelled', {
      executionId: this.executionId,
      status: 'cancelled'
    });

    this.cleanup();
    logger.info(`Execution ${this.executionId} cancelled`);
  }

  timeout() {
    this.isCancelled = true;
    this.isRunning = false;

    store.updateExecution(this.executionId, {
      status: 'timeout',
      completedAt: Date.now(),
      error: { message: 'Execution timeout exceeded' }
    });

    store.addExecutionLog(this.executionId, {
      level: 'error',
      message: `Execution timeout after ${this.version.config.timeoutMs}ms`
    });

    this.emit('execution:timeout', {
      executionId: this.executionId,
      status: 'timeout'
    });

    this.sendAlert('timeout', 'Workflow execution timed out');
    this.cleanup();
  }

  async executeNode(node, context) {
    if (this.isCancelled || !this.isRunning) {
      return null;
    }

    const execution = store.getExecution(this.executionId);
    if (execution.status === 'timeout' || execution.status === 'cancelled') {
      return null;
    }

    this.emit('node:start', {
      executionId: this.executionId,
      nodeId: node.id,
      status: 'running'
    });

    store.updateNodeState(this.executionId, node.id, {
      status: 'running',
      startedAt: Date.now()
    });

    store.addExecutionLog(this.executionId, {
      level: 'info',
      message: `Executing node: ${node.type} (${node.id})`,
      nodeId: node.id
    });

    try {
      let result;
      
      switch (node.type) {
        case NODE_TYPES.START:
          result = await this.executeStartNode(node, context);
          break;
        case NODE_TYPES.END:
          result = await this.executeEndNode(node, context);
          break;
        case NODE_TYPES.ACTION:
          result = await this.executeActionNode(node, context);
          break;
        case NODE_TYPES.CONDITION:
          result = await ConditionExecutor.execute(node, context, this);
          break;
        case NODE_TYPES.LOOP:
          result = await LoopExecutor.execute(node, context, this);
          break;
        case NODE_TYPES.DELAY:
          result = await DelayExecutor.execute(node, context, this);
          break;
        case NODE_TYPES.RETRY:
          result = await RetryExecutor.execute(node, context, this);
          break;
        case NODE_TYPES.MERGE:
          result = await MergeExecutor.execute(node, context, this);
          break;
        case NODE_TYPES.SUBWORKFLOW:
          result = await this.executeSubworkflowNode(node, context);
          break;
        case NODE_TYPES.PLUGIN:
          result = await this.executePluginNode(node, context);
          break;
        case NODE_TYPES.FORK:
          result = await this.executeForkNode(node, context);
          break;
        case NODE_TYPES.JOIN:
          result = await this.executeJoinNode(node, context);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      store.updateNodeState(this.executionId, node.id, {
        status: 'completed',
        completedAt: Date.now(),
        result
      });

      this.emit('node:complete', {
        executionId: this.executionId,
        nodeId: node.id,
        status: 'completed',
        result
      });

      return result;
    } catch (error) {
      this.failureCount++;
      
      store.updateNodeState(this.executionId, node.id, {
        status: 'failed',
        completedAt: Date.now(),
        error: { message: error.message }
      });

      store.addExecutionLog(this.executionId, {
        level: 'error',
        message: `Node execution failed: ${error.message}`,
        nodeId: node.id,
        error: error.stack
      });

      this.emit('node:failed', {
        executionId: this.executionId,
        nodeId: node.id,
        status: 'failed',
        error: error.message
      });

      if (this.failureCount >= this.maxFailures) {
        throw new Error(`Circuit breaker: Too many consecutive failures (${this.failureCount})`);
      }

      throw error;
    }
  }

  async executeStartNode(node, context) {
    return { data: context };
  }

  async executeEndNode(node, context) {
    store.addExecutionLog(this.executionId, {
      level: 'info',
      message: 'Reached end node'
    });
    return { data: context };
  }

  async executeActionNode(node, context) {
    return await ActionExecutor.execute(node, context, this);
  }

  async executeSubworkflowNode(node, context) {
    const config = node.config || {};
    const { workflowId, versionId, passData = true, waitForCompletion = true } = config;

    if (!workflowId) {
      throw new Error('Subworkflow node requires workflowId');
    }

    store.addExecutionLog(this.executionId, {
      level: 'info',
      message: `Starting subworkflow: ${workflowId}`,
      nodeId: node.id
    });

    const subWorkflow = store.getWorkflow(workflowId);
    if (!subWorkflow) {
      throw new Error(`Subworkflow not found: ${workflowId}`);
    }

    const subVersions = store.getVersions(workflowId);
    let targetVersion;

    if (versionId) {
      targetVersion = subVersions.find(v => v.id === versionId);
    } else {
      targetVersion = subVersions.find(v => v.isActive) || subVersions[subVersions.length - 1];
    }

    if (!targetVersion) {
      throw new Error(`No version found for subworkflow: ${workflowId}`);
    }

    const initialData = passData ? { ...context, parentExecutionId: this.executionId } : { parentExecutionId: this.executionId };

    if (!waitForCompletion) {
      const { EngineManager } = require('./EngineManager');
      const engineManager = new EngineManager(this.io);
      engineManager.startWorkflow(workflowId, targetVersion.id, 'subworkflow', initialData);

      store.addExecutionLog(this.executionId, {
        level: 'info',
        message: `Subworkflow started in background: ${workflowId}`,
        nodeId: node.id
      });

      return {
        data: {
          ...context,
          subworkflowStarted: true,
          subworkflowId: workflowId
        }
      };
    }

    const { WorkflowEngine } = require('./WorkflowEngine');
    const subEngine = new WorkflowEngine(
      workflowId,
      targetVersion.id,
      'subworkflow',
      initialData,
      this.io
    );

    const subResult = await subEngine.start();

    store.addExecutionLog(this.executionId, {
      level: 'info',
      message: `Subworkflow completed: ${workflowId} (status: ${subResult.status})`,
      nodeId: node.id
    });

    return {
      data: {
        ...context,
        subworkflowResult: subResult.data,
        subworkflowStatus: subResult.status
      }
    };
  }

  async executePluginNode(node, context) {
    const config = node.config || {};
    const { pluginId, pluginConfig = {} } = config;

    store.addExecutionLog(this.executionId, {
      level: 'info',
      message: `Executing plugin node: ${pluginId}`,
      nodeId: node.id
    });

    const builtInPlugins = {
      http: async (cfg, ctx) => {
        const { method = 'GET', url, headers = {}, body = '', timeout = 30000 } = cfg;
        const axios = require('axios');

        const processTemplate = (template, context) => {
          if (!template) return template;
          return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
            const value = path.split('.').reduce((acc, key) => acc?.[key], context);
            return value !== undefined ? String(value) : match;
          });
        };

        try {
          const processedUrl = processTemplate(url, ctx);
          const processedBody = processTemplate(body, ctx);
          const processedHeaders = {};
          for (const [key, value] of Object.entries(headers)) {
            processedHeaders[key] = processTemplate(value, ctx);
          }

          const axiosConfig = {
            method: method.toLowerCase(),
            url: processedUrl,
            headers: processedHeaders,
            timeout
          };

          if (method !== 'GET' && processedBody) {
            try {
              axiosConfig.data = JSON.parse(processedBody);
            } catch {
              axiosConfig.data = processedBody;
            }
          }

          const response = await axios(axiosConfig);

          return {
            data: {
              ...ctx,
              pluginResult: {
                status: response.status,
                data: response.data,
                headers: response.headers
              }
            }
          };
        } catch (error) {
          throw new Error(`Plugin HTTP request failed: ${error.message}`);
        }
      },

      database: async (cfg, ctx) => {
        const { connectionId, query, params = [] } = cfg;

        store.addExecutionLog(this.executionId, {
          level: 'debug',
          message: `Database plugin: query execution`,
          nodeId: node.id
        });

        return {
          data: {
            ...ctx,
            pluginResult: {
              connectionId,
              query,
              rows: [],
              affectedRows: 0
            }
          }
        };
      },

      file: async (cfg, ctx) => {
        return {
          data: {
            ...ctx,
            pluginResult: { operation: cfg.operation || 'read' }
          }
        };
      },

      notification: async (cfg, ctx) => {
        return {
          data: {
            ...ctx,
            pluginResult: { sent: true, notificationType: cfg.type || 'email' }
          }
        };
      }
    };

    if (pluginId && builtInPlugins[pluginId]) {
      const result = await builtInPlugins[pluginId](pluginConfig, context);
      return result;
    }

    store.addExecutionLog(this.executionId, {
      level: 'warn',
      message: `Plugin ${pluginId} not found, using default behavior`,
      nodeId: node.id
    });

    return { data: context };
  }

  async executeForkNode(node, context) {
    const config = node.config || {};
    const { branchCount = 2, isolateContext = false } = config;

    store.addExecutionLog(this.executionId, {
      level: 'info',
      message: `Starting parallel fork with ${branchCount} branches`,
      nodeId: node.id
    });

    const next = this.getNextNodes(node);
    const branches = [];

    for (let i = 0; i < Math.min(branchCount, next.length); i++) {
      const { node: nextNode } = next[i];
      const branchContext = isolateContext
        ? { branchIndex: i, parentData: { ...context } }
        : { ...context, branchIndex: i };

      branches.push({
        branchIndex: i,
        nextNode,
        context: branchContext
      });
    }

    return {
      data: context,
      branches,
      isFork: true
    };
  }

  async executeJoinNode(node, context) {
    const config = node.config || {};
    const { strategy = 'all', requiredCount = 1 } = config;

    const nodeKey = `${this.executionId}:${node.id}`;
    if (!this.pendingMergeNodes.has(nodeKey)) {
      this.pendingMergeNodes.set(nodeKey, {
        arrived: [],
        total: 0,
        context: context
      });
    }

    const state = this.pendingMergeNodes.get(nodeKey);
    state.arrived.push({ context });

    const incomingEdges = this.version.graph.edges.filter(e => e.target === node.id);
    state.total = incomingEdges.length;

    store.addExecutionLog(this.executionId, {
      level: 'info',
      message: `Join node: ${state.arrived.length}/${state.total} branches arrived (strategy: ${strategy})`,
      nodeId: node.id
    });

    let shouldProceed = false;

    switch (strategy) {
      case 'first':
        shouldProceed = state.arrived.length >= 1;
        break;
      case 'majority':
        shouldProceed = state.arrived.length >= Math.ceil(state.total / 2);
        break;
      case 'count':
        shouldProceed = state.arrived.length >= requiredCount;
        break;
      case 'all':
      default:
        shouldProceed = state.arrived.length >= state.total;
        break;
    }

    if (shouldProceed) {
      this.pendingMergeNodes.delete(nodeKey);

      const mergedData = {
        ...context,
        branchResults: state.arrived.map(a => a.context)
      };

      store.addExecutionLog(this.executionId, {
        level: 'info',
        message: `Join node: continuing with merged data`,
        nodeId: node.id
      });

      return { data: mergedData };
    }

    return {
      data: context,
      shouldWait: true
    };
  }

  getNextNodes(node, result = {}) {
    const graph = this.version.graph;
    if (!graph.edges) return [];

    const outgoingEdges = graph.edges.filter(edge => edge.source === node.id);
    const nextNodes = [];

    outgoingEdges.forEach(edge => {
      if (edge.label && result.conditionResult !== undefined) {
        if (edge.label === (result.conditionResult ? 'Yes' : 'No')) {
          const targetNode = graph.nodes.find(n => n.id === edge.target);
          if (targetNode) {
            nextNodes.push({ node: targetNode, edge });
          }
        }
      } else {
        const targetNode = graph.nodes.find(n => n.id === edge.target);
        if (targetNode) {
          nextNodes.push({ node: targetNode, edge });
        }
      }
    });

    return nextNodes;
  }

  findNodeByType(type) {
    return this.version.graph.nodes.find(n => n.type === type);
  }

  findNodeById(id) {
    return this.version.graph.nodes.find(n => n.id === id);
  }

  handleError(error) {
    logger.error(`Execution ${this.executionId} failed: ${error.message}`);

    store.updateExecution(this.executionId, {
      status: 'failed',
      completedAt: Date.now(),
      error: { message: error.message, stack: error.stack }
    });

    store.addExecutionLog(this.executionId, {
      level: 'error',
      message: `Execution failed: ${error.message}`,
      error: error.stack
    });

    this.emit('execution:failed', {
      executionId: this.executionId,
      status: 'failed',
      error: error.message
    });

    this.sendAlert('failure', `Workflow execution failed: ${error.message}`);
  }

  sendAlert(type, message) {
    if (this.version.config?.alerts?.enabled) {
      logger.warn(`ALERT [${type.toUpperCase()}]: ${message}`);
      
      this.emit('execution:alert', {
        executionId: this.executionId,
        alertType: type,
        message,
        timestamp: Date.now()
      });
    }
  }

  emit(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
    logger.debug(`Event: ${event}`, data);
  }

  cleanup() {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
    this.isRunning = false;
  }

  async continueFromBranch(node, context) {
    const next = this.getNextNodes(node, context);
    
    for (const { node: nextNode } of next) {
      await this.executeNode(nextNode, context.data || context);
    }
  }
}

module.exports = { WorkflowEngine, NODE_TYPES };