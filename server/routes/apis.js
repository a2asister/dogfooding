const express = require('express');
const router = express.Router();
const axios = require('axios');
const { readData, writeData, generateId } = require('../utils/dataStore');

const DATA_FILE = 'apis.json';

router.get('/', (req, res) => {
  const apis = readData(DATA_FILE);
  res.json(apis);
});

router.get('/:id', (req, res) => {
  const apis = readData(DATA_FILE);
  const api = apis.find(a => a.id === req.params.id);
  if (!api) {
    return res.status(404).json({ error: 'API 测试不存在' });
  }
  res.json(api);
});

router.post('/', (req, res) => {
  const apis = readData(DATA_FILE);
  const newApi = {
    id: `api-${generateId().substring(0, 8)}`,
    name: req.body.name,
    description: req.body.description || '',
    method: req.body.method || 'GET',
    url: req.body.url || '',
    headers: req.body.headers || {},
    body: req.body.body,
    queryParams: req.body.queryParams,
    variables: req.body.variables || {},
    assertions: req.body.assertions || [],
    retryConfig: req.body.retryConfig || {
      enabled: true,
      maxRetries: 3,
      retryDelay: 1000
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastTested: null,
    lastStatus: null
  };
  apis.unshift(newApi);
  writeData(DATA_FILE, apis);
  res.status(201).json(newApi);
});

router.put('/:id', (req, res) => {
  const apis = readData(DATA_FILE);
  const index = apis.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'API 测试不存在' });
  }
  apis[index] = {
    ...apis[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  writeData(DATA_FILE, apis);
  res.json(apis[index]);
});

router.delete('/:id', (req, res) => {
  const apis = readData(DATA_FILE);
  const index = apis.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'API 测试不存在' });
  }
  apis.splice(index, 1);
  writeData(DATA_FILE, apis);
  res.json({ success: true, message: 'API 测试已删除' });
});

const replaceVariables = (str, variables) => {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/\$\{(\w+)\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
};

const processVariables = (obj, variables) => {
  if (typeof obj === 'string') {
    return replaceVariables(obj, variables);
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

const assertResult = (response, assertions) => {
  const results = [];
  let allPassed = true;
  
  for (const assertion of assertions) {
    let passed = false;
    let actualValue = null;
    
    switch (assertion.type) {
      case 'status':
        actualValue = response.status;
        passed = actualValue === assertion.value;
        break;
      case 'header':
        actualValue = response.headers[assertion.key.toLowerCase()];
        passed = actualValue === assertion.value;
        break;
      case 'json_path':
        try {
          const getValue = (obj, path) => {
            if (path === '$') return obj;
            const keys = path.replace('$.', '').split('.');
            let result = obj;
            for (const key of keys) {
              if (result && result[key] !== undefined) {
                result = result[key];
              } else {
                return undefined;
              }
            }
            return result;
          };
          actualValue = getValue(response.data, assertion.path);
          
          switch (assertion.operator) {
            case 'not_empty':
              passed = actualValue !== undefined && actualValue !== null && actualValue !== '';
              break;
            case 'is_array':
              passed = Array.isArray(actualValue);
              break;
            default:
              passed = JSON.stringify(actualValue) === JSON.stringify(assertion.value);
          }
        } catch (e) {
          passed = false;
        }
        break;
      case 'contains':
        actualValue = JSON.stringify(response.data);
        passed = actualValue.includes(assertion.value);
        break;
      default:
        passed = true;
    }
    
    if (!passed) allPassed = false;
    results.push({
      ...assertion,
      passed,
      actualValue
    });
  }
  
  return { allPassed, results };
};

router.post('/:id/test', async (req, res) => {
  const apis = readData(DATA_FILE);
  const api = apis.find(a => a.id === req.params.id);
  if (!api) {
    return res.status(404).json({ error: 'API 测试不存在' });
  }
  
  const variables = { ...api.variables, ...req.body.variables };
  const processedUrl = processVariables(api.url, variables);
  const processedHeaders = processVariables(api.headers, variables);
  const processedBody = processVariables(api.body, variables);
  const processedQueryParams = processVariables(api.queryParams, variables);
  
  const testResult = {
    id: `test-${generateId().substring(0, 8)}`,
    apiId: api.id,
    name: api.name,
    startTime: new Date().toISOString(),
    status: 'success',
    request: {
      method: api.method,
      url: processedUrl,
      headers: processedHeaders,
      body: processedBody,
      queryParams: processedQueryParams
    },
    response: null,
    assertions: [],
    error: null,
    duration: 0
  };
  
  try {
    const startTime = Date.now();
    
    const axiosConfig = {
      method: api.method.toLowerCase(),
      url: processedUrl,
      headers: processedHeaders,
      params: processedQueryParams,
      data: processedBody,
      timeout: 30000,
      validateStatus: () => true
    };
    
    const response = await axios(axiosConfig);
    const endTime = Date.now();
    testResult.duration = endTime - startTime;
    
    testResult.response = {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    };
    
    if (api.assertions && api.assertions.length > 0) {
      const assertionResult = assertResult(response, api.assertions);
      testResult.assertions = assertionResult.results;
      testResult.status = assertionResult.allPassed ? 'success' : 'failed';
    } else {
      testResult.status = response.status >= 200 && response.status < 300 ? 'success' : 'failed';
    }
    
  } catch (error) {
    testResult.status = 'error';
    testResult.error = error.message;
    testResult.duration = Date.now() - new Date(testResult.startTime).getTime();
  }
  
  testResult.endTime = new Date().toISOString();
  
  const index = apis.findIndex(a => a.id === req.params.id);
  apis[index].lastTested = new Date().toISOString();
  apis[index].lastStatus = testResult.status;
  apis[index].updatedAt = new Date().toISOString();
  writeData(DATA_FILE, apis);
  
  res.json(testResult);
});

module.exports = router;
