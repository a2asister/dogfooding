import cron from 'node-cron';
import db from './db.js';
import staticRenderer from './staticRenderer.js';

class CronScheduler {
  constructor() {
    this.jobs = new Map();
  }

  start() {
    console.log('Cron scheduler started');
    this.loadScheduledTasks();
  }

  async loadScheduledTasks() {
    try {
      const sites = await db.findAll('sites');
      
      for (const site of sites) {
        if (site.settings?.publish?.autoPublish && site.settings?.publish?.publishSchedule) {
          this.schedulePublish(site);
        }
      }
    } catch (error) {
      console.error('Error loading scheduled tasks:', error);
    }
  }

  schedulePublish(site) {
    const cronExpression = site.settings.publish.publishSchedule;
    
    if (!cron.validate(cronExpression)) {
      console.error(`Invalid cron expression for site ${site.id}: ${cronExpression}`);
      return;
    }
    
    if (this.jobs.has(site.id)) {
      this.jobs.get(site.id).stop();
      this.jobs.delete(site.id);
    }
    
    const job = cron.schedule(cronExpression, async () => {
      console.log(`Executing scheduled publish for site: ${site.id}`);
      await this.executePublish(site);
    });
    
    this.jobs.set(site.id, job);
    console.log(`Scheduled publish for site ${site.id} with cron: ${cronExpression}`);
  }

  async executePublish(site) {
    try {
      const publishType = site.settings?.publish?.publishType || 'incremental';
      
      let contentsToPublish = [];
      
      if (publishType === 'full') {
        contentsToPublish = await db.find('contents', { status: 'published' }, site.id);
      } else {
        const lastPublishLog = await this.getLastPublishLog(site.id);
        const lastPublishTime = lastPublishLog ? new Date(lastPublishLog.completedAt) : new Date(0);
        
        const allPublishedContents = await db.find('contents', { status: 'published' }, site.id);
        contentsToPublish = allPublishedContents.filter(content => {
          const updatedAt = new Date(content.updatedAt);
          return updatedAt > lastPublishTime;
        });
      }
      
      if (contentsToPublish.length === 0) {
        console.log(`No contents to publish for site ${site.id}`);
        return;
      }
      
      const publishLog = await db.create('publishLogs', {
        type: 'scheduled',
        contentCount: contentsToPublish.length,
        status: 'processing',
        triggeredBy: 'system',
        triggeredAt: new Date().toISOString()
      }, site.id);
      
      try {
        const result = await staticRenderer.renderAndPublish(site, contentsToPublish, site.id);
        
        await db.update('publishLogs', publishLog.id, {
          status: 'completed',
          completedAt: new Date().toISOString(),
          details: result
        }, site.id);
        
        console.log(`Scheduled publish completed for site ${site.id}: ${contentsToPublish.length} contents published`);
      } catch (error) {
        await db.update('publishLogs', publishLog.id, {
          status: 'failed',
          completedAt: new Date().toISOString(),
          error: error.message
        }, site.id);
        
        console.error(`Scheduled publish failed for site ${site.id}:`, error);
      }
    } catch (error) {
      console.error('Error executing scheduled publish:', error);
    }
  }

  async getLastPublishLog(siteId) {
    const logs = await db.findAll('publishLogs', siteId);
    const completedLogs = logs.filter(log => log.status === 'completed');
    
    if (completedLogs.length === 0) {
      return null;
    }
    
    completedLogs.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    return completedLogs[0];
  }

  stop(siteId) {
    if (siteId && this.jobs.has(siteId)) {
      this.jobs.get(siteId).stop();
      this.jobs.delete(siteId);
      console.log(`Stopped scheduled job for site ${siteId}`);
    }
  }

  stopAll() {
    for (const [siteId, job] of this.jobs) {
      job.stop();
    }
    this.jobs.clear();
    console.log('All scheduled jobs stopped');
  }
}

export const cronScheduler = new CronScheduler();
export default cronScheduler;
