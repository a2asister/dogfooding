const logger = require('../../utils/logger');
const store = require('../../data/store');

class ConditionExecutor {
  static async execute(node, context, engine) {
    const { conditions, operator = 'and' } = node.config || {};
    
    store.addExecutionLog(engine.executionId, {
      level: 'info',
      message: `Evaluating ${conditions?.length || 0} conditions with operator: ${operator}`,
      nodeId: node.id
    });

    if (!conditions || conditions.length === 0) {
      return {
        data: context,
        conditionResult: true
      };
    }

    const results = conditions.map(cond => this.evaluateCondition(cond, context));
    
    let conditionResult;
    if (operator === 'and') {
      conditionResult = results.every(r => r);
    } else if (operator === 'or') {
      conditionResult = results.some(r => r);
    } else {
      conditionResult = results[0];
    }

    store.addExecutionLog(engine.executionId, {
      level: 'info',
      message: `Condition result: ${conditionResult ? 'Yes' : 'No'}`,
      nodeId: node.id
    });

    const next = engine.getNextNodes(node, { conditionResult });
    
    for (const { node: nextNode } of next) {
      await engine.executeNode(nextNode, context);
    }

    return {
      data: context,
      conditionResult
    };
  }

  static evaluateCondition(condition, context) {
    const { field, operator, value, type = 'expression' } = condition;

    if (type === 'expression') {
      return this.evaluateExpression(condition.expression, context);
    }

    const fieldValue = this.getNestedValue(context, field);
    const compareValue = this.parseValue(value, context);

    switch (operator) {
      case 'equals':
      case '==':
        return fieldValue == compareValue;
      case 'notEquals':
      case '!=':
        return fieldValue != compareValue;
      case 'strictEquals':
      case '===':
        return fieldValue === compareValue;
      case 'strictNotEquals':
      case '!==':
        return fieldValue !== compareValue;
      case 'greaterThan':
      case '>':
        return fieldValue > compareValue;
      case 'lessThan':
      case '<':
        return fieldValue < compareValue;
      case 'greaterThanOrEqual':
      case '>=':
        return fieldValue >= compareValue;
      case 'lessThanOrEqual':
      case '<=':
        return fieldValue <= compareValue;
      case 'contains':
        return String(fieldValue).includes(String(compareValue));
      case 'startsWith':
        return String(fieldValue).startsWith(String(compareValue));
      case 'endsWith':
        return String(fieldValue).endsWith(String(compareValue));
      case 'isEmpty':
        return fieldValue === undefined || fieldValue === null || fieldValue === '';
      case 'isNotEmpty':
        return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
      case 'isTrue':
        return fieldValue === true || fieldValue === 'true';
      case 'isFalse':
        return fieldValue === false || fieldValue === 'false';
      default:
        logger.warn(`Unknown condition operator: ${operator}`);
        return false;
    }
  }

  static evaluateExpression(expression, context) {
    if (!expression) return true;
    
    try {
      const variables = { ...context };
      const fn = new Function(...Object.keys(variables), `return ${expression}`);
      return fn(...Object.values(variables));
    } catch (error) {
      logger.error(`Failed to evaluate expression: ${expression}`, error);
      return false;
    }
  }

  static getNestedValue(obj, path) {
    if (!path) return obj;
    return path.split('.').reduce((acc, key) => {
      if (acc === null || acc === undefined) return undefined;
      return acc[key];
    }, obj);
  }

  static parseValue(value, context) {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const path = value.slice(2, -2).trim();
      return this.getNestedValue(context, path);
    }
    return value;
  }
}

module.exports = { ConditionExecutor };