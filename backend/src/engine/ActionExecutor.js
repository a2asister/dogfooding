const logger = require('../utils/logger');
const store = require('../data/store');
const axios = require('axios');

class ActionExecutor {
  static async execute(node, context, engine) {
    const config = node.config || {};
    
    store.addExecutionLog(engine.executionId, {
      level: 'info',
      message: `Action: ${config.actionType || 'custom'}`,
      nodeId: node.id
    });

    let result;
    
    switch (config.actionType) {
      case 'http':
        result = await this.executeHttpAction(config, context, engine);
        break;
      case 'script':
        result = await this.executeScriptAction(config, context, engine);
        break;
      case 'transform':
        result = await this.executeTransformAction(config, context, engine);
        break;
      case 'log':
        result = await this.executeLogAction(config, context, engine);
        break;
      case 'emitEvent':
        result = await this.executeEmitEventAction(config, context, engine);
        break;
      case 'variable':
        result = await this.executeVariableAction(config, context, engine);
        break;
      case 'delay':
        result = await this.executeDelayAction(config, context, engine);
        break;
      case 'custom':
      default:
        result = await this.executeCustomAction(config, context, engine);
    }

    const next = engine.getNextNodes(node);
    for (const { node: nextNode } of next) {
      await engine.executeNode(nextNode, result?.data || context);
    }

    return result;
  }

  static async executeHttpAction(config, context, engine) {
    const { method = 'GET', url, headers = {}, body = '', timeout = 30000 } = config;
    
    store.addExecutionLog(engine.executionId, {
      level: 'info',
      message: `HTTP ${method}: ${url}`,
      nodeId: engine.version.graph.nodes?.findIndex?.(n => n.id === engine.executionId) || -1
    });

    try {
      const processedUrl = this.processTemplate(url, context);
      const processedBody = this.processTemplate(body, context);
      const processedHeaders = this.processHeaders(headers, context);

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
          ...context,
          httpResponse: {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            headers: response.headers
          }
        }
      };
    } catch (error) {
      logger.error(`HTTP action failed: ${error.message}`);
      throw new Error(`HTTP request failed: ${error.message}`);
    }
  }

  static async executeScriptAction(config, context, engine) {
    const { script } = config;
    
    if (!script) {
      return { data: context };
    }

    try {
      const processedScript = this.processTemplate(script, context);
      const result = eval(processedScript);
      
      if (result instanceof Promise) {
        const asyncResult = await result;
        return {
          data: {
            ...context,
            scriptResult: asyncResult
          }
        };
      }

      return {
        data: {
          ...context,
          scriptResult: result
        }
      };
    } catch (error) {
      logger.error(`Script execution failed: ${error.message}`);
      throw new Error(`Script execution failed: ${error.message}`);
    }
  }

  static async executeTransformAction(config, context, engine) {
    const { rules = [] } = config;
    const result = { ...context };

    for (const rule of rules) {
      if (rule.field && rule.expression) {
        try {
          const value = this.evaluateExpression(rule.expression, context);
          result[rule.field] = value;
        } catch (error) {
          logger.warn(`Transform rule failed for ${rule.field}: ${error.message}`);
        }
      }
    }

    return { data: result };
  }

  static async executeLogAction(config, context, engine) {
    const { message = '', level = 'info' } = config;
    const processedMessage = this.processTemplate(message, context);

    logger[level](`Log action: ${processedMessage}`);

    store.addExecutionLog(engine.executionId, {
      level,
      message: processedMessage
    });

    return { data: context };
  }

  static async executeCustomAction(config, context, engine) {
    return { data: context };
  }

  static processTemplate(template, context) {
    if (!template) return template;
    
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getNestedValue(context, path.trim());
      return value !== undefined ? String(value) : match;
    });
  }

  static processHeaders(headers, context) {
    const processed = {};
    for (const [key, value] of Object.entries(headers)) {
      processed[key] = this.processTemplate(value, context);
    }
    return processed;
  }

  static evaluateExpression(expression, context) {
    try {
      const variables = { ...context };
      const fn = new Function(...Object.keys(variables), `return ${expression}`);
      return fn(...Object.values(variables));
    } catch (error) {
      logger.error(`Expression evaluation failed: ${expression}`);
      return undefined;
    }
  }

  static getNestedValue(obj, path) {
    if (!path) return obj;
    return path.split('.').reduce((acc, key) => {
      if (acc === null || acc === undefined) return undefined;
      return acc[key];
    }, obj);
  }

  static async executeEmitEventAction(config, context, engine) {
    const { eventName, eventData = {} } = config;

    if (!eventName) {
      throw new Error('emitEvent action requires eventName');
    }

    const processedData = { ...eventData };
    for (const [key, value] of Object.entries(processedData)) {
      if (typeof value === 'string') {
        processedData[key] = this.processTemplate(value, context);
      }
    }

    store.addExecutionLog(engine.executionId, {
      level: 'info',
      message: `Emitting event: ${eventName}`,
      nodeId: engine.executionId
    });

    engine.emit('workflow:event', {
      eventName,
      eventData: processedData,
      context
    });

    return {
      data: {
        ...context,
        eventEmitted: eventName,
        eventData: processedData
      }
    };
  }

  static async executeVariableAction(config, context, engine) {
    const { operation = 'set', variableName, value, expression } = config;

    if (!variableName) {
      throw new Error('variable action requires variableName');
    }

    let newValue;

    if (expression) {
      newValue = this.evaluateExpression(expression, context);
    } else {
      newValue = typeof value === 'string'
        ? this.processTemplate(value, context)
        : value;
    }

    const result = { ...context };

    switch (operation) {
      case 'set':
        result[variableName] = newValue;
        break;
      case 'increment':
        result[variableName] = (result[variableName] || 0) + (newValue || 1);
        break;
      case 'decrement':
        result[variableName] = (result[variableName] || 0) - (newValue || 1);
        break;
      case 'delete':
        delete result[variableName];
        break;
      default:
        result[variableName] = newValue;
    }

    store.addExecutionLog(engine.executionId, {
      level: 'debug',
      message: `Variable ${variableName}: ${operation} = ${JSON.stringify(newValue)}`
    });

    return { data: result };
  }

  static async executeDelayAction(config, context, engine) {
    const { amount = 1, unit = 'seconds' } = config;

    const unitMultipliers = {
      milliseconds: 1,
      seconds: 1000,
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000
    };

    const delayMs = amount * (unitMultipliers[unit] || 1000);

    store.addExecutionLog(engine.executionId, {
      level: 'info',
      message: `Delaying for ${amount} ${unit}`,
      nodeId: engine.executionId
    });

    await new Promise(resolve => setTimeout(resolve, delayMs));

    return {
      data: {
        ...context,
        delayCompleted: true,
        delayMs
      }
    };
  }
}

module.exports = { ActionExecutor };