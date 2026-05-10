const { v4: uuidv4 } = require('uuid');

class MemoryStore {
  constructor() {
    this.workflows = new Map();
    this.executions = new Map();
    this.nodes = new Map();
    this.versions = new Map();
  }

  createWorkflow(workflow) {
    const id = uuidv4();
    const now = Date.now();
    const workflowData = {
      id,
      ...workflow,
      createdAt: now,
      updatedAt: now,
      status: 'draft',
      versions: []
    };
    this.workflows.set(id, workflowData);
    return workflowData;
  }

  getWorkflow(id) {
    return this.workflows.get(id);
  }

  listWorkflows(filters = {}) {
    let workflows = Array.from(this.workflows.values());
    
    if (filters.status) {
      workflows = workflows.filter(w => w.status === filters.status);
    }
    
    return workflows.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  updateWorkflow(id, updates) {
    const workflow = this.workflows.get(id);
    if (!workflow) return null;
    
    const updated = {
      ...workflow,
      ...updates,
      updatedAt: Date.now()
    };
    this.workflows.set(id, updated);
    return updated;
  }

  deleteWorkflow(id) {
    return this.workflows.delete(id);
  }

  createVersion(workflowId, versionData) {
    const versionId = uuidv4();
    const now = Date.now();
    const version = {
      id: versionId,
      workflowId,
      version: versionData.version || 1,
      name: versionData.name || `Version 1`,
      description: versionData.description || '',
      graph: versionData.graph,
      config: versionData.config || {},
      createdAt: now,
      status: 'draft',
      isActive: false,
      canaryRatio: 0
    };
    
    if (!this.versions.has(workflowId)) {
      this.versions.set(workflowId, []);
    }
    
    this.versions.get(workflowId).push(version);
    return version;
  }

  getVersions(workflowId) {
    return this.versions.get(workflowId) || [];
  }

  getActiveVersion(workflowId) {
    const versions = this.versions.get(workflowId) || [];
    return versions.find(v => v.isActive);
  }

  activateVersion(workflowId, versionId, canaryRatio = 100) {
    const versions = this.versions.get(workflowId) || [];
    versions.forEach(v => {
      v.isActive = false;
      v.canaryRatio = 0;
    });
    
    const version = versions.find(v => v.id === versionId);
    if (version) {
      version.isActive = true;
      version.canaryRatio = canaryRatio;
      version.status = 'active';
    }
    
    return version;
  }

  createExecution(execution) {
    const id = uuidv4();
    const now = Date.now();
    const execData = {
      id,
      workflowId: execution.workflowId,
      versionId: execution.versionId,
      triggerType: execution.triggerType,
      status: 'pending',
      data: execution.data || {},
      nodeStates: {},
      logs: [],
      createdAt: now,
      startedAt: null,
      completedAt: null,
      error: null
    };
    this.executions.set(id, execData);
    return execData;
  }

  getExecution(id) {
    return this.executions.get(id);
  }

  listExecutions(workflowId) {
    return Array.from(this.executions.values())
      .filter(e => e.workflowId === workflowId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  updateExecution(id, updates) {
    const execution = this.executions.get(id);
    if (!execution) return null;
    
    const updated = {
      ...execution,
      ...updates
    };
    this.executions.set(id, updated);
    return updated;
  }

  addExecutionLog(executionId, log) {
    const execution = this.executions.get(executionId);
    if (!execution) return null;
    
    execution.logs.push({
      ...log,
      timestamp: Date.now()
    });
    return execution;
  }

  updateNodeState(executionId, nodeId, state) {
    const execution = this.executions.get(executionId);
    if (!execution) return null;
    
    execution.nodeStates[nodeId] = {
      ...(execution.nodeStates[nodeId] || {}),
      ...state
    };
    return execution;
  }

  getNodeState(executionId, nodeId) {
    const execution = this.executions.get(executionId);
    return execution?.nodeStates?.[nodeId];
  }
}

module.exports = new MemoryStore();