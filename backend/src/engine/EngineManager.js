const { WorkflowEngine } = require('./WorkflowEngine');
const store = require('../data/store');
const logger = require('../utils/logger');

class EngineManager {
  constructor(io = null) {
    this.io = io;
    this.engines = new Map();
    this.completedEngines = new Map();
  }

  async startWorkflow(workflowId, versionId, triggerType = 'manual', initialData = {}) {
    const workflow = store.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const versions = store.getVersions(workflowId);
    if (versions.length === 0) {
      throw new Error(`No versions found for workflow: ${workflowId}`);
    }

    const engine = new WorkflowEngine(workflowId, versionId, triggerType, initialData, this.io);
    
    const execution = await engine.start();
    this.engines.set(execution.id, engine);

    logger.info(`Started workflow execution: ${execution.id}`);

    return execution;
  }

  async runVersion(workflowId, triggerType = 'manual', initialData = {}) {
    const activeVersion = store.getActiveVersion(workflowId);
    
    if (!activeVersion) {
      const versions = store.getVersions(workflowId);
      if (versions.length === 0) {
        throw new Error(`No versions found for workflow: ${workflowId}`);
      }
      return await this.startWorkflow(workflowId, versions[0].id, triggerType, initialData);
    }

    return await this.startWorkflow(workflowId, activeVersion.id, triggerType, initialData);
  }

  cancelExecution(executionId) {
    const engine = this.engines.get(executionId);
    if (engine) {
      engine.cancel();
      logger.info(`Cancelled execution: ${executionId}`);
      return true;
    }
    return false;
  }

  getExecution(executionId) {
    return store.getExecution(executionId);
  }

  getActiveCount() {
    return Array.from(this.engines.values()).filter(e => e.isRunning).length;
  }

  getEngine(executionId) {
    return this.engines.get(executionId);
  }

  listEngines() {
    return Array.from(this.engines.keys());
  }
}

module.exports = { EngineManager };