const cron = require('node-cron');
const { readData, writeData, generateId } = require('./dataStore');

const activeJobs = new Map();

const nodeTypes = {
  start: {
    name: '开始节点',
    category: 'flow',
    icon: '▶️',
    color: '#10b981'
  },
  end: {
    name: '结束节点',
    category: 'flow',
    icon: '⏹️',
    color: '#ef4444'
  },
  openBrowser: {
    name: '打开浏览器',
    category: 'web',
    icon: '🌐',
    color: '#3b82f6',
    config: {
      browser: {
        type: 'select',
        options: ['chrome', 'firefox', 'edge', 'safari'],
        default: 'chrome',
        label: '浏览器类型'
      },
      headless: {
        type: 'boolean',
        default: false,
        label: '无头模式'
      }
    }
  },
  navigate: {
    name: '导航',
    category: 'web',
    icon: '🔗',
    color: '#3b82f6',
    config: {
      url: {
        type: 'text',
        default: 'https://',
        label: '目标 URL',
        required: true
      }
    }
  },
  click: {
    name: '点击',
    category: 'web',
    icon: '👆',
    color: '#3b82f6',
    config: {
      selector: {
        type: 'text',
        default: '',
        label: 'CSS 选择器',
        required: true
      },
      waitFor: {
        type: 'number',
        default: 0,
        label: '等待时间 (ms)'
      }
    }
  },
  type: {
    name: '输入',
    category: 'web',
    icon: '⌨️',
    color: '#3b82f6',
    config: {
      selector: {
        type: 'text',
        default: '',
        label: 'CSS 选择器',
        required: true
      },
      value: {
        type: 'text',
        default: '',
        label: '输入值',
        required: true
      },
      clearBefore: {
        type: 'boolean',
        default: true,
        label: '输入前清空'
      }
    }
  },
  wait: {
    name: '等待',
    category: 'web',
    icon: '⏳',
    color: '#f59e0b',
    config: {
      selector: {
        type: 'text',
        default: '',
        label: 'CSS 选择器 (可选)'
      },
      timeout: {
        type: 'number',
        default: 10000,
        label: '超时时间 (ms)'
      }
    }
  },
  screenshot: {
    name: '截图',
    category: 'web',
    icon: '📸',
    color: '#8b5cf6',
    config: {
      selector: {
        type: 'text',
        default: '',
        label: 'CSS 选择器 (可选)'
      },
      fullPage: {
        type: 'boolean',
        default: false,
        label: '全页面截图'
      },
      savePath: {
        type: 'text',
        default: '',
        label: '保存路径 (可选)'
      }
    }
  },
  select: {
    name: '选择',
    category: 'web',
    icon: '☑️',
    color: '#3b82f6',
    config: {
      selector: {
        type: 'text',
        default: '',
        label: 'CSS 选择器',
        required: true
      },
      value: {
        type: 'text',
        default: '',
        label: '选择值',
        required: true
      },
      byIndex: {
        type: 'boolean',
        default: false,
        label: '按索引选择'
      }
    }
  },
  scroll: {
    name: '滚动',
    category: 'web',
    icon: '📜',
    color: '#3b82f6',
    config: {
      x: {
        type: 'number',
        default: 0,
        label: 'X 轴偏移'
      },
      y: {
        type: 'number',
        default: 500,
        label: 'Y 轴偏移'
      },
      behavior: {
        type: 'select',
        options: ['auto', 'smooth'],
        default: 'smooth',
        label: '滚动行为'
      }
    }
  },
  openApplication: {
    name: '打开应用',
    category: 'desktop',
    icon: '🖥️',
    color: '#06b6d4',
    config: {
      appPath: {
        type: 'text',
        default: '',
        label: '应用程序路径',
        required: true
      },
      arguments: {
        type: 'text',
        default: '',
        label: '启动参数 (可选)'
      }
    }
  },
  runScript: {
    name: '运行脚本',
    category: 'script',
    icon: '📜',
    color: '#ec4899',
    config: {
      scriptId: {
        type: 'text',
        default: '',
        label: '脚本 ID',
        required: true
      },
      arguments: {
        type: 'object',
        default: {},
        label: '参数'
      }
    }
  },
  condition: {
    name: '条件判断',
    category: 'flow',
    icon: '🔀',
    color: '#f59e0b',
    config: {
      expression: {
        type: 'text',
        default: '',
        label: '条件表达式',
        required: true
      }
    }
  },
  loop: {
    name: '循环',
    category: 'flow',
    icon: '🔁',
    color: '#f59e0b',
    config: {
      type: {
        type: 'select',
        options: ['count', 'while', 'foreach'],
        default: 'count',
        label: '循环类型'
      },
      count: {
        type: 'number',
        default: 10,
        label: '循环次数'
      },
      condition: {
        type: 'text',
        default: '',
        label: '循环条件'
      },
      dataSource: {
        type: 'text',
        default: '',
        label: '数据源 (变量名)'
      }
    }
  },
  delay: {
    name: '延迟',
    category: 'flow',
    icon: '⏱️',
    color: '#6b7280',
    config: {
      milliseconds: {
        type: 'number',
        default: 1000,
        label: '延迟时间 (ms)',
        required: true
      }
    }
  },
  setVariable: {
    name: '设置变量',
    category: 'flow',
    icon: '📝',
    color: '#8b5cf6',
    config: {
      name: {
        type: 'text',
        default: '',
        label: '变量名',
        required: true
      },
      value: {
        type: 'text',
        default: '',
        label: '变量值',
        required: true
      }
    }
  },
  httpRequest: {
    name: 'HTTP 请求',
    category: 'api',
    icon: '🌐',
    color: '#0ea5e9',
    config: {
      method: {
        type: 'select',
        options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        default: 'GET',
        label: '请求方法'
      },
      url: {
        type: 'text',
        default: '',
        label: '请求 URL',
        required: true
      },
      headers: {
        type: 'object',
        default: {},
        label: '请求头'
      },
      body: {
        type: 'object',
        default: {},
        label: '请求体'
      },
      saveToVariable: {
        type: 'text',
        default: '',
        label: '保存到变量'
      }
    }
  }
};

const getNodeTypes = () => {
  return nodeTypes;
};

const getNodeType = (type) => {
  return nodeTypes[type];
};

const retryWithBackoff = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 2
  } = options;
  
  let attempt = 0;
  let lastError = null;
  
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt++;
      
      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(backoffMultiplier, attempt - 1);
        console.log(`重试 ${attempt}/${maxRetries}，等待 ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

const evaluateCondition = (expression, context = {}) => {
  try {
    const fn = new Function('context', `
      with(context) {
        return ${expression};
      }
    `);
    return fn(context);
  } catch (error) {
    console.error('条件表达式执行错误:', error);
    return false;
  }
};

const replaceVariablesInString = (str, variables) => {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/\$\{(\w+)\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
};

const processVariables = (obj, variables) => {
  if (typeof obj === 'string') {
    return replaceVariablesInString(obj, variables);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => processVariables(item, variables));
  }
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      result[key] = processVariables(obj[key], variables);
    }
    return result;
  }
  return obj;
};

const executeWorkflow = async (workflow, executionId, robotId) => {
  const executions = readData('executions.json');
  const executionIndex = executions.findIndex(e => e.id === executionId);
  
  if (executionIndex === -1) {
    throw new Error('执行记录不存在');
  }
  
  const execution = executions[executionIndex];
  const context = {
    variables: { ...workflow.variables },
    currentNode: null,
    logs: [],
    results: {}
  };
  
  const addLog = (level, message, nodeId = null) => {
    const log = {
      timestamp: new Date().toISOString(),
      level,
      message,
      nodeId
    };
    execution.logs.push(log);
    executions[executionIndex] = execution;
    writeData('executions.json', executions);
  };
  
  const updateStep = (nodeId, status, error = null) => {
    const stepIndex = execution.steps.findIndex(s => s.nodeId === nodeId);
    if (stepIndex >= 0) {
      execution.steps[stepIndex].status = status;
      if (status === 'success' || status === 'failed') {
        execution.steps[stepIndex].endTime = new Date().toISOString();
      }
      if (error) {
        execution.steps[stepIndex].error = error;
      }
    }
    executions[executionIndex] = execution;
    writeData('executions.json', executions);
  };
  
  try {
    addLog('info', `开始执行流程: ${workflow.name}`);
    
    const { nodes, edges } = workflow;
    const startNode = nodes.find(n => n.type === 'start');
    
    if (!startNode) {
      throw new Error('流程中未找到开始节点');
    }
    
    let currentNodeId = startNode.id;
    const visitedNodes = new Set();
    
    while (currentNodeId) {
      if (visitedNodes.has(currentNodeId)) {
        addLog('warn', `检测到循环引用，节点: ${currentNodeId}`);
        break;
      }
      visitedNodes.add(currentNodeId);
      
      const node = nodes.find(n => n.id === currentNodeId);
      if (!node) {
        addLog('error', `找不到节点: ${currentNodeId}`);
        break;
      }
      
      context.currentNode = node;
      
      execution.steps.push({
        nodeId: node.id,
        name: node.label,
        status: 'running',
        startTime: new Date().toISOString(),
        endTime: null
      });
      executions[executionIndex] = execution;
      writeData('executions.json', executions);
      
      addLog('info', `执行节点: ${node.label} (${node.type})`, node.id);
      
      try {
        await executeNode(node, context, addLog);
        updateStep(node.id, 'success');
        addLog('info', `节点执行成功: ${node.label}`, node.id);
      } catch (error) {
        if (workflow.retryConfig?.enabled) {
          addLog('warn', `节点执行失败，尝试重试...`, node.id);
          
          try {
            await retryWithBackoff(
              () => executeNode(node, context, addLog),
              workflow.retryConfig
            );
            updateStep(node.id, 'success');
            addLog('info', `节点重试成功: ${node.label}`, node.id);
          } catch (retryError) {
            updateStep(node.id, 'failed', retryError.message);
            addLog('error', `节点执行失败，重试次数已用尽: ${retryError.message}`, node.id);
            throw retryError;
          }
        } else {
          updateStep(node.id, 'failed', error.message);
          addLog('error', `节点执行失败: ${error.message}`, node.id);
          throw error;
        }
      }
      
      const outgoingEdges = edges.filter(e => e.source === currentNodeId);
      
      if (outgoingEdges.length === 0) {
        addLog('info', '流程执行完成');
        break;
      }
      
      if (node.type === 'condition') {
        const conditionResult = evaluateCondition(
          node.config?.expression,
          context.variables
        );
        
        const trueEdge = outgoingEdges.find(e => e.label === 'true' || e.label === '是');
        const falseEdge = outgoingEdges.find(e => e.label === 'false' || e.label === '否');
        
        if (conditionResult && trueEdge) {
          currentNodeId = trueEdge.target;
        } else if (!conditionResult && falseEdge) {
          currentNodeId = falseEdge.target;
        } else {
          currentNodeId = outgoingEdges[0].target;
        }
      } else {
        currentNodeId = outgoingEdges[0]?.target;
      }
    }
    
    execution.status = 'success';
    execution.endTime = new Date().toISOString();
    execution.duration = new Date(execution.endTime) - new Date(execution.startTime);
    executions[executionIndex] = execution;
    writeData('executions.json', executions);
    
    addLog('info', '流程执行成功完成');
    
  } catch (error) {
    execution.status = 'failed';
    execution.endTime = new Date().toISOString();
    execution.duration = new Date(execution.endTime) - new Date(execution.startTime);
    execution.error = error.message;
    executions[executionIndex] = execution;
    writeData('executions.json', executions);
    
    addLog('error', `流程执行失败: ${error.message}`);
    throw error;
  }
};

const executeNode = async (node, context, addLog) => {
  const nodeType = node.type;
  const config = processVariables(node.config || {}, context.variables);
  
  switch (nodeType) {
    case 'start':
    case 'end':
      return;
      
    case 'delay':
      addLog('info', `延迟 ${config.milliseconds}ms`);
      await new Promise(resolve => setTimeout(resolve, config.milliseconds));
      break;
      
    case 'setVariable':
      context.variables[config.name] = config.value;
      addLog('info', `设置变量 ${config.name} = ${config.value}`);
      break;
      
    case 'condition':
      const result = evaluateCondition(config.expression, context.variables);
      addLog('info', `条件判断结果: ${result}`);
      break;
      
    case 'loop':
      addLog('info', `开始循环`);
      break;
      
    case 'openBrowser':
      addLog('info', `打开 ${config.browser} 浏览器`);
      break;
      
    case 'navigate':
      addLog('info', `导航到: ${config.url}`);
      break;
      
    case 'click':
      addLog('info', `点击元素: ${config.selector}`);
      break;
      
    case 'type':
      addLog('info', `向 ${config.selector} 输入值`);
      break;
      
    case 'wait':
      addLog('info', `等待元素: ${config.selector || '页面加载'}`);
      break;
      
    case 'screenshot':
      addLog('info', `截图: ${config.fullPage ? '全页面' : config.selector || '当前视图'}`);
      break;
      
    case 'select':
      addLog('info', `选择 ${config.selector} 的值: ${config.value}`);
      break;
      
    case 'scroll':
      addLog('info', `滚动到 (${config.x}, ${config.y})`);
      break;
      
    case 'openApplication':
      addLog('info', `打开应用: ${config.appPath}`);
      break;
      
    case 'runScript':
      addLog('info', `运行脚本: ${config.scriptId}`);
      break;
      
    case 'httpRequest':
      addLog('info', `${config.method} ${config.url}`);
      break;
      
    default:
      addLog('info', `执行节点操作: ${nodeType}`);
  }
  
  context.results[node.id] = {
    success: true,
    timestamp: new Date().toISOString()
  };
};

const initializeSchedules = () => {
  const schedules = readData('schedules.json');
  
  for (const schedule of schedules) {
    if (schedule.enabled && schedule.type === 'cron' && schedule.cronExpression) {
      try {
        const job = cron.schedule(schedule.cronExpression, () => {
          executeScheduledTask(schedule);
        }, {
          scheduled: true,
          timezone: 'Asia/Shanghai'
        });
        
        activeJobs.set(schedule.id, job);
        console.log(`定时任务已启动: ${schedule.name} (${schedule.cronExpression})`);
      } catch (error) {
        console.error(`启动定时任务失败: ${schedule.name}`, error);
      }
    }
  }
};

const executeScheduledTask = async (schedule) => {
  console.log(`执行定时任务: ${schedule.name}`);
  
  const workflows = readData('workflows.json');
  const workflow = workflows.find(w => w.id === schedule.workflowId);
  
  if (!workflow) {
    console.error(`找不到流程: ${schedule.workflowId}`);
    return;
  }
  
  const executions = readData('executions.json');
  const executionId = `exec-${generateId().substring(0, 8)}`;
  
  const newExecution = {
    id: executionId,
    workflowId: workflow.id,
    robotId: schedule.robotId,
    name: workflow.name,
    status: 'running',
    type: 'scheduled',
    scheduleId: schedule.id,
    startTime: new Date().toISOString(),
    endTime: null,
    duration: null,
    logs: [{
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `流程执行开始（定时任务触发: ${schedule.name}）`
    }],
    steps: [],
    error: null,
    createdAt: new Date().toISOString()
  };
  
  executions.unshift(newExecution);
  writeData('executions.json', executions);
  
  const schedulesData = readData('schedules.json');
  const scheduleIndex = schedulesData.findIndex(s => s.id === schedule.id);
  if (scheduleIndex >= 0) {
    schedulesData[scheduleIndex].lastRun = new Date().toISOString();
    writeData('schedules.json', schedulesData);
  }
  
  try {
    await executeWorkflow(workflow, executionId, schedule.robotId);
  } catch (error) {
    console.error(`定时任务执行失败: ${error.message}`);
  }
};

const startSchedule = (scheduleId) => {
  const schedules = readData('schedules.json');
  const schedule = schedules.find(s => s.id === scheduleId);
  
  if (!schedule) {
    throw new Error('定时任务不存在');
  }
  
  if (activeJobs.has(scheduleId)) {
    throw new Error('定时任务已经在运行');
  }
  
  if (schedule.type === 'cron' && schedule.cronExpression) {
    const job = cron.schedule(schedule.cronExpression, () => {
      executeScheduledTask(schedule);
    }, {
      scheduled: true,
      timezone: 'Asia/Shanghai'
    });
    
    activeJobs.set(scheduleId, job);
    console.log(`定时任务已启动: ${schedule.name}`);
  }
};

const stopSchedule = (scheduleId) => {
  const job = activeJobs.get(scheduleId);
  if (job) {
    job.stop();
    activeJobs.delete(scheduleId);
    console.log(`定时任务已停止: ${scheduleId}`);
  }
};

const initialize = () => {
  console.log('🔧 初始化规则引擎...');
  initializeSchedules();
  console.log('✅ 规则引擎初始化完成');
};

module.exports = {
  getNodeTypes,
  getNodeType,
  executeWorkflow,
  retryWithBackoff,
  evaluateCondition,
  replaceVariablesInString,
  processVariables,
  initialize,
  startSchedule,
  stopSchedule
};
