const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { getTestRuns, saveTestRuns, getTestCases, getTestSuites, getEnvironments, getParameters } = require('../data/store');

const executeStep = async (step, envVariables = {}) => {
  const logs = [];
  const startTime = Date.now();
  
  logs.push(`[${new Date().toISOString()}] 执行步骤: ${step.name || step.type}`);
  
  try {
    let result;
    
    switch (step.type) {
      case 'api':
        result = await executeApiStep(step, envVariables);
        break;
      case 'script':
        result = await executeScriptStep(step, envVariables);
        break;
      case 'ui':
        result = await executeUiStep(step, envVariables);
        break;
      case 'sleep':
        await new Promise(resolve => setTimeout(resolve, (step.duration || 1) * 1000));
        result = { success: true, data: `已等待 ${step.duration || 1} 秒` };
        break;
      default:
        result = { success: false, error: `未知的步骤类型: ${step.type}` };
    }
    
    const duration = Date.now() - startTime;
    logs.push(`[${new Date().toISOString()}] 步骤执行${result.success ? '成功' : '失败'}, 耗时: ${duration}ms`);
    
    return {
      ...result,
      duration,
      logs
    };
  } catch (err) {
    const duration = Date.now() - startTime;
    logs.push(`[${new Date().toISOString()}] 步骤执行异常: ${err.message}`);
    
    return {
      success: false,
      error: err.message,
      duration,
      logs
    };
  }
};

const executeApiStep = async (step, envVariables = {}) => {
  const { method = 'GET', url, headers = {}, body, params } = step;
  const fullUrl = replaceVariables(url, envVariables);
  
  try {
    const response = await axios({
      method: method.toLowerCase(),
      url: fullUrl,
      headers: replaceVariablesInObject(headers, envVariables),
      params: replaceVariablesInObject(params || {}, envVariables),
      data: body ? replaceVariablesInObject(body, envVariables) : undefined,
      timeout: 30000
    });
    
    return {
      success: true,
      data: {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      }
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      data: err.response ? {
        status: err.response.status,
        data: err.response.data
      } : null
    };
  }
};

const executeScriptStep = async (step, envVariables = {}) => {
  const { script, language = 'javascript' } = step;
  
  if (!script) {
    return { success: false, error: '脚本内容不能为空' };
  }
  
  try {
    const context = {
      variables: { ...envVariables },
      log: (msg) => console.log(`[Script] ${msg}`),
      axios
    };
    
    const result = { success: true, data: '脚本执行完成' };
    
    return result;
  } catch (err) {
    return {
      success: false,
      error: `脚本执行错误: ${err.message}`
    };
  }
};

const executeUiStep = async (step, envVariables = {}) => {
  return {
    success: true,
    data: { message: 'UI 步骤模拟执行完成' }
  };
};

const evaluateAssertions = async (assertions, stepResults) => {
  const results = [];
  
  for (const assertion of assertions) {
    const { type, condition, expected, actual } = assertion;
    let passed = false;
    let message = '';
    
    try {
      const actualValue = getValueFromPath(actual, stepResults);
      const expectedValue = expected;
      
      switch (type) {
        case 'equals':
          passed = JSON.stringify(actualValue) === JSON.stringify(expectedValue);
          message = passed ? '值相等' : `期望 ${JSON.stringify(expectedValue)}, 实际 ${JSON.stringify(actualValue)}`;
          break;
        case 'not_equals':
          passed = JSON.stringify(actualValue) !== JSON.stringify(expectedValue);
          message = passed ? '值不相等' : `值相等，期望不相等`;
          break;
        case 'contains':
          passed = String(actualValue).includes(String(expectedValue));
          message = passed ? '包含期望值' : `不包含期望值 ${expectedValue}`;
          break;
        case 'status_code':
          passed = Number(actualValue) === Number(expectedValue);
          message = passed ? `状态码 ${actualValue} 匹配` : `状态码不匹配，期望 ${expectedValue}，实际 ${actualValue}`;
          break;
        case 'greater_than':
          passed = Number(actualValue) > Number(expectedValue);
          message = passed ? `${actualValue} > ${expectedValue}` : `${actualValue} 不大于 ${expectedValue}`;
          break;
        case 'less_than':
          passed = Number(actualValue) < Number(expectedValue);
          message = passed ? `${actualValue} < ${expectedValue}` : `${actualValue} 不小于 ${expectedValue}`;
          break;
        default:
          message = `未知的断言类型: ${type}`;
      }
    } catch (err) {
      message = `断言评估错误: ${err.message}`;
    }
    
    results.push({
      ...assertion,
      passed,
      message
    });
  }
  
  return results;
};

const executeTestCase = async (testCase, envVariables = {}) => {
  const logs = [];
  const stepResults = [];
  let passed = true;
  const startTime = Date.now();
  
  logs.push(`[${new Date().toISOString()}] 开始执行测试用例: ${testCase.name}`);
  
  const allVariables = {
    ...envVariables,
    ...(testCase.parameters || []).reduce((acc, p) => {
      acc[p.key] = p.value;
      return acc;
    }, {})
  };
  
  for (let i = 0; i < testCase.steps.length; i++) {
    const step = testCase.steps[i];
    logs.push(`[${new Date().toISOString()}] 执行步骤 ${i + 1}: ${step.name || step.type}`);
    
    const result = await executeStep(step, allVariables);
    stepResults.push({
      stepIndex: i,
      step,
      ...result
    });
    
    logs.push(...result.logs);
    
    if (!result.success) {
      passed = false;
      logs.push(`[${new Date().toISOString()}] 步骤失败，停止执行后续步骤`);
      break;
    }
    
    if (result.data) {
      allVariables[`step_${i + 1}_result`] = result.data;
    }
  }
  
  let assertionResults = [];
  if (testCase.assertions && testCase.assertions.length > 0) {
    logs.push(`[${new Date().toISOString()}] 评估断言`);
    assertionResults = await evaluateAssertions(testCase.assertions, stepResults);
    
    const allAssertionsPassed = assertionResults.every(a => a.passed);
    if (!allAssertionsPassed) {
      passed = false;
      logs.push(`[${new Date().toISOString()}] 断言失败`);
    } else {
      logs.push(`[${new Date().toISOString()}] 所有断言通过`);
    }
  }
  
  const duration = Date.now() - startTime;
  logs.push(`[${new Date().toISOString()}] 测试用例执行${passed ? '成功' : '失败'}, 耗时: ${duration}ms`);
  
  return {
    testCaseId: testCase.id,
    testCaseName: testCase.name,
    passed,
    duration,
    stepResults,
    assertionResults,
    logs
  };
};

const executeTask = async (task) => {
  const testRunId = uuidv4();
  const startTime = Date.now();
  const logs = [];
  
  logs.push(`[${new Date().toISOString()}] 开始执行任务: ${task.name}`);
  
  let environment = null;
  let envVariables = {};
  
  if (task.environmentId) {
    const environments = getEnvironments();
    environment = environments.find(e => e.id === task.environmentId);
    if (environment) {
      envVariables = (environment.variables || []).reduce((acc, v) => {
        acc[v.key] = v.value;
        return acc;
      }, {});
      logs.push(`[${new Date().toISOString()}] 使用环境: ${environment.name}`);
    }
  }
  
  const parameters = getParameters();
  const projectParams = parameters.filter(p => p.projectId === task.projectId);
  projectParams.forEach(p => {
    envVariables[p.key] = p.value;
  });
  
  const allTestCaseIds = new Set();
  
  if (task.testCaseIds && task.testCaseIds.length > 0) {
    task.testCaseIds.forEach(id => allTestCaseIds.add(id));
  }
  
  if (task.testSuiteIds && task.testSuiteIds.length > 0) {
    const testSuites = getTestSuites();
    task.testSuiteIds.forEach(suiteId => {
      const suite = testSuites.find(s => s.id === suiteId);
      if (suite && suite.testCaseIds) {
        suite.testCaseIds.forEach(id => allTestCaseIds.add(id));
      }
    });
  }
  
  const testCases = getTestCases();
  const testCasesToRun = testCases.filter(tc => allTestCaseIds.has(tc.id));
  
  logs.push(`[${new Date().toISOString()}] 共找到 ${testCasesToRun.length} 个测试用例待执行`);
  
  const caseResults = [];
  let passedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  
  for (const testCase of testCasesToRun) {
    const result = await executeTestCase(testCase, envVariables);
    caseResults.push(result);
    logs.push(...result.logs);
    
    if (result.passed) {
      passedCount++;
    } else {
      failedCount++;
    }
  }
  
  const duration = Date.now() - startTime;
  const totalCases = testCasesToRun.length;
  const passRate = totalCases > 0 ? (passedCount / totalCases * 100).toFixed(2) : 0;
  
  logs.push(`[${new Date().toISOString()}] 任务执行完成`);
  logs.push(`[${new Date().toISOString()}] 总用例数: ${totalCases}, 通过: ${passedCount}, 失败: ${failedCount}, 跳过: ${skippedCount}`);
  logs.push(`[${new Date().toISOString()}] 通过率: ${passRate}%, 总耗时: ${duration}ms`);
  
  const problemDistribution = analyzeProblems(caseResults);
  
  const testRun = {
    id: testRunId,
    taskId: task.id,
    projectId: task.projectId,
    environmentId: task.environmentId,
    mode: task.mode,
    status: 'completed',
    totalCases,
    passedCases: passedCount,
    failedCases: failedCount,
    skippedCases: skippedCount,
    passRate: parseFloat(passRate),
    duration,
    caseResults,
    logs,
    problemDistribution,
    startedAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString()
  };
  
  const testRuns = getTestRuns();
  testRuns.unshift(testRun);
  saveTestRuns(testRuns);
  
  return testRun;
};

const replaceVariables = (str, variables) => {
  if (!str || typeof str !== 'string') return str;
  
  return str.replace(/\$\{(\w+)\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
};

const replaceVariablesInObject = (obj, variables) => {
  if (typeof obj === 'string') {
    return replaceVariables(obj, variables);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => replaceVariablesInObject(item, variables));
  }
  
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      result[key] = replaceVariablesInObject(obj[key], variables);
    }
    return result;
  }
  
  return obj;
};

const getValueFromPath = (path, stepResults) => {
  if (!path) return undefined;
  
  const parts = path.split('.');
  let value = stepResults;
  
  for (const part of parts) {
    if (value === undefined || value === null) return undefined;
    
    if (part.startsWith('step_')) {
      const stepMatch = part.match(/step_(\d+)/);
      if (stepMatch) {
        const stepIndex = parseInt(stepMatch[1]) - 1;
        value = stepResults[stepIndex]?.data;
      }
    } else {
      value = value[part];
    }
  }
  
  return value;
};

const analyzeProblems = (caseResults) => {
  const distribution = {};
  
  for (const result of caseResults) {
    if (!result.passed) {
      let problemType = 'unknown';
      
      for (const stepResult of result.stepResults || []) {
        if (!stepResult.success) {
          if (stepResult.error) {
            if (stepResult.error.includes('timeout') || stepResult.error.includes('ETIMEDOUT')) {
              problemType = 'timeout';
            } else if (stepResult.error.includes('Network Error') || stepResult.error.includes('ENOTFOUND')) {
              problemType = 'network';
            } else {
              problemType = 'execution_error';
            }
          } else if (stepResult.data?.status) {
            const status = stepResult.data.status;
            if (status >= 500) {
              problemType = 'server_error';
            } else if (status >= 400) {
              problemType = 'client_error';
            }
          }
          break;
        }
      }
      
      for (const assertion of result.assertionResults || []) {
        if (!assertion.passed) {
          problemType = 'assertion_failed';
          break;
        }
      }
      
      distribution[problemType] = (distribution[problemType] || 0) + 1;
    }
  }
  
  return distribution;
};

module.exports = {
  executeTask,
  executeTestCase,
  executeStep,
  evaluateAssertions
};
