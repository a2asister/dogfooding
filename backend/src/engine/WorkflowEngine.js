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
  MERGE: 'merge'
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