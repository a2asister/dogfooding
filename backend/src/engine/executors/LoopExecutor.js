const logger = require('../../utils/logger');
const store = require('../../data/store');

class LoopExecutor {
  static async execute(node, context, engine) {
    const config = node.config || {};
    
    store.addExecutionLog(engine.executionId, {
      level: 'info',
      message: `Starting loop: ${config.loopType || 'count'}`,
      nodeId: node.id
    });

    let loopContext = { ...context };
    const results = [];

    switch (config.loopType) {
      case 'count':
        results.push(...await this.executeCountLoop(node, loopContext, engine));
        break;
      case 'condition':
        results.push(...await this.executeConditionLoop(node, loopContext, engine));
        break;
      case 'iterator':
        results.push(...await this.executeIteratorLoop(node, loopContext, engine));
        break;
      default:
        logger.warn(`Unknown loop type: ${config.loopType}`);
        results.push(...await this.executeCountLoop(node, loopContext, engine));
    }

    store.addExecutionLog(engine.executionId, {
      level: 'info',
      message: `Loop completed with ${results.length} iterations`,
      nodeId: node.id
    });

    const next = engine.getNextNodes(node);
    for (const { node: nextNode } of next) {
      await engine.executeNode(nextNode, { ...loopContext, loopResults: results });
    }

    return {
      data: { ...loopContext, loopResults: results },
      iterations: results.length
    };
  }

  static async executeCountLoop(node, context, engine) {
    const config = node.config || {};
    const count = config.count || 1;
    const results = [];

    store.addExecutionLog(engine.executionId, {
      level: 'info',
      message: `Count loop: executing ${count} iterations`,
      nodeId: node.id
    });

    const subNodes = this.getLoopSubNodes(node, engine);

    for (let i = 0; i < count; i++) {
      if (!engine.isRunning) break;

      const loopContext = {
        ...context,
        loopIndex: i,
        loopCount: count
      };

      store.addExecutionLog(engine.executionId, {
        level: 'debug',
        message: `Loop iteration ${i + 1}/${count}`,
        nodeId: node.id
      });

      const result = await this.executeLoopBody(subNodes, loopContext, engine);
      results.push(result);
    }

    return results;
  }

  static async executeConditionLoop(node, context, engine) {
    const config = node.config || {};
    const { condition, maxIterations = 100 } = config;
    const results = [];
    let i = 0;

    store.addExecutionLog(engine.executionId, {
      level: 'info',
      message: `Condition loop: max ${maxIterations} iterations`,
      nodeId: node.id
    });

    const subNodes = this.getLoopSubNodes(node, engine);
    let loopContext = { ...context };

    while (this.evaluateCondition(condition, loopContext) && i < maxIterations) {
      if (!engine.isRunning) break;

      loopContext.loopIndex = i;

      store.addExecutionLog(engine.executionId, {
        level: 'debug',
        message: `Condition loop iteration ${i + 1}`,
        nodeId: node.id
      });

      const result = await this.executeLoopBody(subNodes, loopContext, engine);
      results.push(result);
      i++;
    }

    return results;
  }

  static async executeIteratorLoop(node, context, engine) {
    const config = node.config || {};
    const items = this.parseItems(config.items, context) || [];
    const results = [];

    store.addExecutionLog(engine.executionId, {
      level: 'info',
      message: `Iterator loop: ${items.length} items`,
      nodeId: node.id
    });

    const subNodes = this.getLoopSubNodes(node, engine);

    for (let i = 0; i < items.length; i++) {
      if (!engine.isRunning) break;

      const loopContext = {
        ...context,
        loopIndex: i,
        loopItem: items[i],
        loopItems: items
      };

      store.addExecutionLog(engine.executionId, {
        level: 'debug',
        message: `Iterator loop item ${i + 1}`,
        nodeId: node.id
      });

      const result = await this.executeLoopBody(subNodes, loopContext, engine);
      results.push(result);
    }

    return results;
  }

  static getLoopSubNodes(node, engine) {
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

  static async executeLoopBody(nodes, context, engine) {
    let currentContext = { ...context };
    const results = [];

    for (const node of nodes) {
      if (!engine.isRunning) break;
      const result = await engine.executeNode(node, currentContext);
      if (result?.data) {
        currentContext = { ...currentContext, ...result.data };
      }
      results.push(result);
    }

    return { context: currentContext, results };
  }

  static evaluateCondition(condition, context) {
    if (!condition) return false;
    
    try {
      const variables = { ...context };
      const fn = new Function(...Object.keys(variables), `return ${condition}`);
      const result = fn(...Object.values(variables));
      return Boolean(result);
    } catch (error) {
      logger.error(`Failed to evaluate loop condition: ${condition}`, error);
      return false;
    }
  }

  static parseItems(items, context) {
    if (Array.isArray(items)) return items;
    
    if (typeof items === 'string' && items.startsWith('{{') && items.endsWith('}}')) {
      const path = items.slice(2, -2).trim();
      return this.getNestedValue(context, path);
    }
    
    return [];
  }

  static getNestedValue(obj, path) {
    if (!path) return obj;
    return path.split('.').reduce((acc, key) => {
      if (acc === null || acc === undefined) return undefined;
      return acc[key];
    }, obj);
  }
}

module.exports = { LoopExecutor };