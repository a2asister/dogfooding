const crypto = require('crypto');

function normalizeError(error) {
  if (!error) return '';
  
  let message = '';
  let stack = '';
  
  if (typeof error === 'string') {
    message = error;
  } else if (typeof error === 'object') {
    message = error.message || error.msg || JSON.stringify(error);
    stack = error.stack || '';
  }
  
  return { message, stack };
}

function extractErrorSignature(message, stack) {
  let signature = '';
  
  const errorTypeMatch = message.match(/^([A-Z][a-zA-Z]*Error):/);
  if (errorTypeMatch) {
    signature += errorTypeMatch[1] + ':';
  }
  
  const functionPattern = /at\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  const functions = [];
  let match;
  while ((match = functionPattern.exec(stack)) !== null) {
    functions.push(match[1]);
  }
  
  if (functions.length > 0) {
    signature += functions.slice(0, 3).join(',');
  }
  
  const filePathPattern = /\(([^:]+):\d+:\d+\)/g;
  const filePaths = [];
  while ((match = filePathPattern.exec(stack)) !== null) {
    const filePath = match[1];
    const fileName = filePath.split(/[/\\]/).pop();
    filePaths.push(fileName);
  }
  
  if (filePaths.length > 0) {
    signature += '@' + filePaths.slice(0, 2).join(',');
  }
  
  return signature || message.substring(0, 100);
}

function generateErrorHash(message, stack) {
  const signature = extractErrorSignature(message, stack);
  return crypto.createHash('md5').update(signature).digest('hex');
}

function aggregateErrors(errors, options = {}) {
  const { groupBy = 'hash', timeWindow = 300000 } = options;
  
  const groups = {};
  
  errors.forEach(error => {
    const { message, stack } = normalizeError(error.message || error);
    const hash = generateErrorHash(message, stack);
    
    const key = groupBy === 'hash' ? hash : message.substring(0, 50);
    
    if (!groups[key]) {
      groups[key] = {
        hash,
        message,
        stack: stack.substring(0, 500),
        count: 0,
        firstSeen: error.timestamp || Date.now(),
        lastSeen: error.timestamp || Date.now(),
        errors: [],
        affectedServices: new Set(),
        severity: error.level || 'ERROR'
      };
    }
    
    groups[key].count++;
    groups[key].lastSeen = Math.max(groups[key].lastSeen, error.timestamp || Date.now());
    groups[key].errors.push(error);
    
    if (error.service) {
      groups[key].affectedServices.add(error.service);
    }
  });
  
  return Object.values(groups).map(group => ({
    ...group,
    affectedServices: Array.from(group.affectedServices),
    frequency: group.count / (timeWindow / 60000)
  })).sort((a, b) => b.count - a.count);
}

function calculateSimilarity(err1, err2) {
  const str1 = (err1.message || '') + (err1.stack || '');
  const str2 = (err2.message || '') + (err2.stack || '');
  
  const set1 = new Set(str1.split(/\s+/));
  const set2 = new Set(str2.split(/\s+/));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

module.exports = {
  normalizeError,
  generateErrorHash,
  aggregateErrors,
  calculateSimilarity,
  extractErrorSignature
};
