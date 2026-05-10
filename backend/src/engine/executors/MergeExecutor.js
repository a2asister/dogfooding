const logger = require('../../utils/logger');
const store = require('../../data/store');

class MergeExecutor {
  static async execute(node, context, engine) {
    const config = node.config || {};
    const mergeStrategy = config.strategy || 'all';
    
    store.addExecutionLog(engine.executionId, {
      level: 'info',
      message: `Merge node: strategy=${mergeStrategy}`,
      nodeId: node.id
    });

    const incomingNodes = this.getIncomingNodes(node, engine);
    const completedIncoming = this.getCompletedIncoming(engine.executionId, incomingNodes);

    if (!engine.pendingMergeNodes.has(node.id)) {
      engine.pendingMergeNodes.set(node.id, {
        required: incomingNodes.length,
        received: 0,
        contexts: []
      });
    }

    const pending = engine.pendingMergeNodes.get(node.id);
    pending.received++;
    pending.contexts.push(context);

    store.addExecutionLog(engine.executionId, {
      level: 'debug',
      message: `Merge received ${pending.received}/${pending.required} branches`,
      nodeId: node.id
    });

    let shouldProceed = false;

    switch (mergeStrategy) {
      case 'all':
        shouldProceed = pending.received >= pending.required;
        break;
      case 'first':
        shouldProceed = pending.received >= 1;
        break;
      case 'majority':
        shouldProceed = pending.received > Math.floor(pending.required / 2);
        break;
      case 'custom':
        shouldProceed = this.evaluateCustomCondition(config.condition, pending);
        break;
      default:
        shouldProceed = pending.received >= pending.required;
    }

    if (!shouldProceed) {
      store.addExecutionLog(engine.executionId, {
        level: 'info',
        message: `Merge waiting for more branches`,
        nodeId: node.id
      });
      return {
        data: context,
        mergePending: true
      };
    }

    store.addExecutionLog(engine.executionId, {
      level: 'info',
      message: `Merge completed, combining ${pending.contexts.length} contexts`,
      nodeId: node.id
    });

    const mergedContext = this.mergeContexts(pending.contexts, config);
    engine.pendingMergeNodes.delete(node.id);

    const next = engine.getNextNodes(node);
    for (const { node: nextNode } of next) {
      await engine.executeNode(nextNode, mergedContext);
    }

    return {
      data: mergedContext,
      mergedCount: pending.contexts.length
    };
  }

  static getIncomingNodes(node, engine) {
    const graph = engine.version.graph;
    if (!graph.edges) return [];

    const incomingEdges = graph.edges.filter(e => e.target === node.id);
    return incomingEdges.map(edge => edge.source);
  }

  static getCompletedIncoming(executionId, incomingNodeIds) {
    const execution = store.getExecution(executionId);
    if (!execution) return [];

    return incomingNodeIds.filter(nodeId => {
      const state = execution.nodeStates?.[nodeId];
      return state?.status === 'completed';
    });
  }

  static mergeContexts(contexts, config) {
    if (contexts.length === 0) return {};
    if (contexts.length === 1) return contexts[0];

    const mergeMode = config.mergeMode || 'concat';
    
    switch (mergeMode) {
      case 'concat':
        return this.concatMerge(contexts);
      case 'latest':
        return this.latestMerge(contexts);
      case 'first':
        return this.firstMerge(contexts);
      case 'deep':
        return this.deepMerge(contexts);
      default:
        return this.concatMerge(contexts);
    }
  }

  static concatMerge(contexts) {
    const result = {};
    const arrayFields = new Set();
    
    contexts.forEach(ctx => {
      if (ctx && typeof ctx === 'object') {
        Object.keys(ctx).forEach(key => {
          if (Array.isArray(ctx[key])) {
            arrayFields.add(key);
          }
        });
      }
    });

    contexts.forEach(ctx => {
      if (ctx && typeof ctx === 'object') {
        Object.keys(ctx).forEach(key => {
          if (arrayFields.has(key)) {
            if (!result[key]) result[key] = [];
            if (Array.isArray(ctx[key])) {
              result[key] = [...result[key], ...ctx[key]];
            } else {
              result[key].push(ctx[key]);
            }
          } else {
            result[key] = ctx[key];
          }
        });
      }
    });

    return result;
  }

  static latestMerge(contexts) {
    const result = {};
    const last = contexts[contexts.length - 1];
    
    if (last && typeof last === 'object') {
      Object.assign(result, last);
    }
    
    return result;
  }

  static firstMerge(contexts) {
    const result = {};
    const first = contexts[0];
    
    if (first && typeof first === 'object') {
      Object.assign(result, first);
    }
    
    return result;
  }

  static deepMerge(contexts) {
    const result = {};
    
    contexts.forEach(ctx => {
      if (ctx && typeof ctx === 'object') {
        this.deepMergeObject(result, ctx);
      }
    });
    
    return result;
  }

  static deepMergeObject(target, source) {
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        this.deepMergeObject(target[key], source[key]);
      } else if (Array.isArray(source[key])) {
        target[key] = target[key] ? [...target[key], ...source[key]] : [...source[key]];
      } else {
        target[key] = source[key];
      }
    });
  }

  static evaluateCustomCondition(condition, pending) {
    if (!condition) return false;
    
    try {
      const fn = new Function('pending', `return ${condition}`);
      return Boolean(fn(pending));
    } catch (error) {
      logger.error(`Failed to evaluate merge condition`, error);
      return false;
    }
  }
}

module.exports = { MergeExecutor };