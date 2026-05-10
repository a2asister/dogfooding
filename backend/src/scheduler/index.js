const schedule = require('node-schedule');
const logger = require('../utils/logger');

class Scheduler {
  constructor(engineManager) {
    this.engineManager = engineManager;
    this.jobs = new Map();
    this.eventListeners = new Map();
  }

  scheduleTask(workflowId, cronExpression, options = {}) {
    const jobId = `${workflowId}-${Date.now()}`;
    
    logger.info(`Scheduling workflow ${workflowId} with cron: ${cronExpression}`);
    
    const job = schedule.scheduleJob(jobId, cronExpression, async () => {
      try {
        logger.info(`Executing scheduled workflow: ${workflowId}`);
        await this.engineManager.runVersion(workflowId, 'scheduled', options.data || {});
      } catch (error) {
        logger.error(`Scheduled execution failed: ${error.message}`);
      }
    });

    this.jobs.set(jobId, {
      workflowId,
      cronExpression,
      job,
      options,
      createdAt: Date.now()
    });

    return jobId;
  }

  scheduleOneTime(workflowId, date, options = {}) {
    const jobId = `${workflowId}-${Date.now()}`;
    
    logger.info(`Scheduling one-time workflow ${workflowId} for: ${date}`);
    
    const job = schedule.scheduleJob(jobId, date, async () => {
      try {
        logger.info(`Executing one-time workflow: ${workflowId}`);
        await this.engineManager.runVersion(workflowId, 'scheduled', options.data || {});
        this.jobs.delete(jobId);
      } catch (error) {
        logger.error(`One-time execution failed: ${error.message}`);
      }
    });

    this.jobs.set(jobId, {
      workflowId,
      date,
      job,
      options,
      isOneTime: true,
      createdAt: Date.now()
    });

    return jobId;
  }

  cancelJob(jobId) {
    const scheduled = this.jobs.get(jobId);
    if (scheduled) {
      scheduled.job.cancel();
      this.jobs.delete(jobId);
      logger.info(`Cancelled scheduled job: ${jobId}`);
      return true;
    }
    return false;
  }

  cancelWorkflowJobs(workflowId) {
    const jobsToCancel = Array.from(this.jobs.entries())
      .filter(([_, data]) => data.workflowId === workflowId)
      .map(([jobId]) => jobId);

    jobsToCancel.forEach(jobId => this.cancelJob(jobId));
    return jobsToCancel.length;
  }

  registerEventListener(eventName, workflowId, options = {}) {
    const listenerId = `${workflowId}-${eventName}-${Date.now()}`;
    
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }

    this.eventListeners.get(eventName).push({
      id: listenerId,
      workflowId,
      options,
      createdAt: Date.now()
    });

    logger.info(`Registered event listener ${listenerId} for event: ${eventName}`);
    return listenerId;
  }

  async triggerEvent(eventName, data = {}) {
    logger.info(`Triggering event: ${eventName}`);
    
    const listeners = this.eventListeners.get(eventName) || [];
    
    for (const listener of listeners) {
      try {
        logger.info(`Executing event-driven workflow: ${listener.workflowId}`);
        await this.engineManager.runVersion(listener.workflowId, 'event', data);
      } catch (error) {
        logger.error(`Event-driven execution failed: ${error.message}`);
      }
    }

    return listeners.length;
  }

  removeEventListener(listenerId) {
    let removed = false;
    
    this.eventListeners.forEach((listeners, eventName) => {
      const index = listeners.findIndex(l => l.id === listenerId);
      if (index !== -1) {
        listeners.splice(index, 1);
        logger.info(`Removed event listener: ${listenerId}`);
        removed = true;
      }
    });

    return removed;
  }

  removeWorkflowEventListeners(workflowId) {
    let removed = 0;
    
    this.eventListeners.forEach((listeners, eventName) => {
      const beforeLength = listeners.length;
      this.eventListeners.set(eventName, listeners.filter(l => l.workflowId !== workflowId));
      removed += beforeLength - listeners.length;
    });

    return removed;
  }

  getScheduledCount() {
    return this.jobs.size;
  }

  getEventListeners(eventName = null) {
    if (eventName) {
      return this.eventListeners.get(eventName) || [];
    }
    return Array.from(this.eventListeners.entries()).map(([name, listeners]) => ({
      eventName: name,
      listeners
    }));
  }
}

module.exports = { Scheduler };