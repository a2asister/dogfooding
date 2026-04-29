const cron = require('node-cron');
const { getTasks, saveTasks } = require('../data/store');

const scheduledJobs = new Map();

const scheduleTask = (task) => {
  if (!task.cronExpression) return;
  
  try {
    const job = cron.schedule(task.cronExpression, async () => {
      console.log(`[Scheduler] 执行定时任务: ${task.name} (${task.id})`);
      const { executeTask } = require('./executor');
      await executeTask(task);
    });
    
    scheduledJobs.set(task.id, job);
    console.log(`[Scheduler] 已注册定时任务: ${task.name} (${task.id}), cron: ${task.cronExpression}`);
  } catch (err) {
    console.error(`[Scheduler] 注册定时任务失败: ${err.message}`);
  }
};

const cancelScheduledTask = (taskId) => {
  const job = scheduledJobs.get(taskId);
  if (job) {
    job.stop();
    scheduledJobs.delete(taskId);
    console.log(`[Scheduler] 已取消定时任务: ${taskId}`);
  }
};

const initScheduler = () => {
  const tasks = getTasks();
  const scheduledTasks = tasks.filter(t => t.mode === 'scheduled' && t.status === 'active');
  
  console.log(`[Scheduler] 初始化调度器，发现 ${scheduledTasks.length} 个活跃定时任务`);
  
  scheduledTasks.forEach(task => {
    scheduleTask(task);
  });
};

const getNextRunTime = (cronExpression) => {
  try {
    const nextDates = cron.getNextDates(cronExpression, 1);
    return nextDates[0]?.toISOString() || null;
  } catch {
    return null;
  }
};

module.exports = {
  scheduleTask,
  cancelScheduledTask,
  initScheduler,
  getNextRunTime,
  scheduledJobs
};
