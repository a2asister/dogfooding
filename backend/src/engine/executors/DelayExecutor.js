const logger = require('../../utils/logger');
const store = require('../../data/store');

class DelayExecutor {
  static async execute(node, context, engine) {
    const config = node.config || {};
    
    store.addExecutionLog(engine.executionId, {
      level: 'info',
      message: `Delay node: type=${config.delayType || 'fixed'}`,
      nodeId: node.id
    });

    let delayMs = 0;

    switch (config.delayType) {
      case 'fixed':
        delayMs = this.calculateFixedDelay(config);
        break;
      case 'until':
        delayMs = this.calculateUntilDelay(config);
        break;
      case 'variable':
        delayMs = this.calculateVariableDelay(config, context);
        break;
      default:
        delayMs = this.calculateFixedDelay(config);
    }

    if (delayMs > 0) {
      store.addExecutionLog(engine.executionId, {
        level: 'info',
        message: `Delaying for ${delayMs}ms (${Math.round(delayMs / 1000)}s)`,
        nodeId: node.id
      });

      await this.sleep(delayMs, engine);
    }

    const next = engine.getNextNodes(node);
    for (const { node: nextNode } of next) {
      await engine.executeNode(nextNode, context);
    }

    return {
      data: context,
      delayMs
    };
  }

  static calculateFixedDelay(config) {
    const { amount = 1, unit = 'seconds' } = config;
    return this.convertToMs(amount, unit);
  }

  static calculateUntilDelay(config) {
    const { targetTime } = config;
    if (!targetTime) return 0;

    const now = Date.now();
    let target;

    if (targetTime instanceof Date) {
      target = targetTime.getTime();
    } else if (typeof targetTime === 'number') {
      target = targetTime;
    } else if (typeof targetTime === 'string') {
      const parsed = new Date(targetTime);
      target = parsed.getTime();
    } else {
      return 0;
    }

    const delayMs = target - now;
    return delayMs > 0 ? delayMs : 0;
  }

  static calculateVariableDelay(config, context) {
    const { field, defaultAmount = 0, unit = 'seconds' } = config;
    
    if (!field) {
      return this.convertToMs(defaultAmount, unit);
    }

    const value = this.getNestedValue(context, field);
    const amount = value !== undefined && value !== null ? Number(value) : defaultAmount;
    
    if (isNaN(amount) || amount < 0) {
      return this.convertToMs(defaultAmount, unit);
    }

    return this.convertToMs(amount, unit);
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
      case 'hours':
        return amountNum * 60 * 60 * 1000;
      case 'days':
        return amountNum * 24 * 60 * 60 * 1000;
      default:
        return amountNum * 1000;
    }
  }

  static async sleep(ms, engine) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, ms);
      
      const checkInterval = setInterval(() => {
        if (!engine.isRunning || engine.isCancelled) {
          clearTimeout(timer);
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  static getNestedValue(obj, path) {
    if (!path) return obj;
    return path.split('.').reduce((acc, key) => {
      if (acc === null || acc === undefined) return undefined;
      return acc[key];
    }, obj);
  }
}

module.exports = { DelayExecutor };