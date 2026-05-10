const logger = require('../../utils/logger');
const store = require('../../data/store');

class RetryExecutor {
  static async execute(node, context, engine) {
    const config = node.config || {};
    const maxAttempts = config.maxAttempts || 3;
    const delayMs = this.calculateDelay(config);
    const exponentialBackoff = config.exponentialBackoff !== false;
    
    store.addExecutionLog(engine.executionId, {
      level: 'info',
      message: `Retry node: maxAttempts=${maxAttempts}, delay=${delayMs}ms`,
      nodeId: node.id
    });

    const subNodes = this.getRetrySubNodes(node, engine);
    let lastError = null;
    let result = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (!engine.isRunning || engine.isCancelled) break;

      try {
        store.addExecutionLog(engine.executionId, {
          level: 'info',
          message: `Retry attempt ${attempt}/${maxAttempts}`,
          nodeId: node.id
        });

        result = await this.executeRetryBody(subNodes, context, engine);
        store.addExecutionLog(engine.executionId, {
          level: 'info',
          message: `Retry attempt ${attempt} succeeded`,
          nodeId: node.id
        });
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        logger.warn(`Retry attempt ${attempt} failed: ${error.message}`);
        
        store.addExecutionLog(engine.executionId, {
          level: 'warn',
          message: `Retry attempt ${attempt} failed: ${error.message}`,
          nodeId: node.id
        });

        if (attempt < maxAttempts && engine.isRunning) {
          const currentDelay = exponentialBackoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;
          store.addExecutionLog(engine.executionId, {
            level: 'info',
            message: `Waiting ${currentDelay}ms before next attempt`,
            nodeId: node.id
          });
          await this.sleep(currentDelay);
        }
      }
    }

    if (lastError) {
      store.addExecutionLog(engine.executionId, {
        level: 'error',
        message: `All ${maxAttempts} retry attempts failed: ${lastError.message}`,
        nodeId: node.id
      });

      if (config.abortOnMaxRetries !== false) {
        throw lastError;
      }
    }

    const next = engine.getNextNodes(node);
    for (const { node: nextNode } of next) {
      await engine.executeNode(nextNode, context);
    }

    return {
      data: result?.data || context,
      success: !lastError,
      attempts: lastError ? maxAttempts : Math.max(1, maxAttempts)
    };
  }

  static getRetrySubNodes(node, engine) {
    const graph = engine.version.graph;
    if (!graph.edges) return [];

    const outgoingEdges = graph.edges.filter(e => e.source === node.id);
    const subNodes = [];

    for (const edge of outgoingEdges) {
      const targetNode = graph.nodes.find(n => n.id === edge.target);
      if (targetNode && targetNode.type !== 'merge') {
        subNodes.push(targetNode);
      }
    }

    return subNodes;
  }

  static async executeRetryBody(nodes, context, engine) {
    let currentContext = { ...context };

    for (const node of nodes) {
      if (!engine.isRunning) break;
      const result = await engine.executeNode(node, currentContext);
      if (result?.data) {
        currentContext = { ...currentContext, ...result.data };
      }
    }

    return { data: currentContext };
  }

  static calculateDelay(config) {
    const { retryDelay = 1000, retryDelayUnit = 'milliseconds' } = config;
    return this.convertToMs(retryDelay, retryDelayUnit);
  }

  static convertToMs(amount, unit) {
    const amountNum = Number(amount) || 0;
    
    switch (unit) {
      case 'milliseconds':
      case 'ms':
        return amountNum;
      case 'seconds':
        return amountNum * 1000;
      case 'minutes':
        return amountNum * 60 * 1000;
      default:
        return amountNum;
    }
  }

  static async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { RetryExecutor };