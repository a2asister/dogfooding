import Router from 'koa-router';
import { AppDataSource } from '../config/database';
import { AlertChannel } from '../entity/AlertChannel';
import { AlertConvergence } from '../entity/AlertConvergence';
import { AlertRecord } from '../entity/AlertRecord';
import { success, error, paginate } from '../utils/response';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import dayjs from 'dayjs';

const router = new Router({ prefix: '/api/alerts' });

router.use(authMiddleware);

router.get('/channels', async (ctx) => {
  const { page = 1, pageSize = 20, type = '', enabled = '' } = ctx.query as any;
  const channelRepository = AppDataSource.getRepository(AlertChannel);
  const where: any = {};
  if (type) where.type = type;
  if (enabled !== '') where.enabled = enabled === 'true';

  const [list, total] = await channelRepository.findAndCount({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    order: { id: 'DESC' },
  });

  ctx.body = success(paginate(list, total, page, pageSize));
});

router.get('/channels/all', async (ctx) => {
  const channelRepository = AppDataSource.getRepository(AlertChannel);
  const list = await channelRepository.find({ where: { enabled: true }, order: { id: 'ASC' } });
  ctx.body = success(list);
});

router.get('/channels/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const channelRepository = AppDataSource.getRepository(AlertChannel);
  const channel = await channelRepository.findOne({ where: { id } });
  if (!channel) {
    ctx.body = error(404, '告警渠道不存在');
    return;
  }
  ctx.body = success(channel);
});

router.use(adminMiddleware);

router.post('/channels', async (ctx) => {
  const data = ctx.request.body as any;
  if (!data.name || !data.type || !data.config) {
    ctx.body = error(400, '渠道名称、类型和配置不能为空');
    return;
  }
  const channelRepository = AppDataSource.getRepository(AlertChannel);
  const channel = channelRepository.create(data);
  await channelRepository.save(channel);
  ctx.body = success(channel);
});

router.put('/channels/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const data = ctx.request.body as any;
  const channelRepository = AppDataSource.getRepository(AlertChannel);
  const channel = await channelRepository.findOne({ where: { id } });
  if (!channel) {
    ctx.body = error(404, '告警渠道不存在');
    return;
  }
  Object.assign(channel, data);
  await channelRepository.save(channel);
  ctx.body = success(channel);
});

router.delete('/channels/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const channelRepository = AppDataSource.getRepository(AlertChannel);
  await channelRepository.delete(id);
  ctx.body = success(null, '删除成功');
});

router.post('/channels/:id/test', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const channelRepository = AppDataSource.getRepository(AlertChannel);
  const channel = await channelRepository.findOne({ where: { id } });
  if (!channel) {
    ctx.body = error(404, '告警渠道不存在');
    return;
  }

  const testMessage = `【测试消息】这是一条来自监控平台的测试告警消息，发送时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')}`;

  try {
    if (channel.type === 'email' && channel.config?.emails) {
      console.log(`[模拟邮件发送] 发送到: ${channel.config.emails.join(', ')}, 内容: ${testMessage}`);
    } else if (channel.type === 'webhook' && channel.config?.url) {
      console.log(`[模拟WebHook发送] URL: ${channel.config.url}, 内容: ${testMessage}`);
    } else if (channel.type === 'dingtalk' && channel.config?.webhook) {
      console.log(`[模拟钉钉发送] WebHook: ${channel.config.webhook}, 内容: ${testMessage}`);
    } else if (channel.type === 'wechat' && channel.config?.webhook) {
      console.log(`[模拟企业微信发送] WebHook: ${channel.config.webhook}, 内容: ${testMessage}`);
    } else if (channel.type === 'sms' && channel.config?.phones) {
      console.log(`[模拟短信发送] 手机号: ${channel.config.phones.join(', ')}, 内容: ${testMessage}`);
    } else {
      ctx.body = error(400, '不支持的渠道类型或配置不完整');
      return;
    }

    ctx.body = success({ success: true, message: '测试消息发送成功' });
  } catch (err: any) {
    ctx.body = error(500, `发送失败: ${err.message}`);
  }
});

router.get('/convergence', async (ctx) => {
  const { page = 1, pageSize = 20, ruleId = '', groupField = '', isConverged = '' } = ctx.query as any;
  const convergenceRepository = AppDataSource.getRepository(AlertConvergence);

  let query = convergenceRepository.createQueryBuilder('conv');

  if (ruleId) query = query.andWhere('conv.ruleId = :ruleId', { ruleId: parseInt(ruleId as string) });
  if (groupField) query = query.andWhere('conv.groupField = :groupField', { groupField });
  if (isConverged === 'true') query = query.andWhere('conv.isConverged = :isConverged', { isConverged: true });
  if (isConverged === 'false') query = query.andWhere('conv.isConverged = :isConverged', { isConverged: false });

  const [list, total] = await query
    .orderBy('conv.updatedAt', 'DESC')
    .skip((page - 1) * pageSize)
    .take(pageSize)
    .getManyAndCount();

  ctx.body = success(paginate(list, total, page, pageSize));
});

router.get('/convergence/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const convergenceRepository = AppDataSource.getRepository(AlertConvergence);
  const convergence = await convergenceRepository.findOne({ where: { id } });
  if (!convergence) {
    ctx.body = error(404, '收敛规则不存在');
    return;
  }

  let alertRecords: AlertRecord[] = [];
  if (convergence.convergedAlertIds) {
    const alertIds = convergence.convergedAlertIds.split(',').map(Number).filter(Boolean);
    if (alertIds.length > 0) {
      const recordRepository = AppDataSource.getRepository(AlertRecord);
      alertRecords = await recordRepository.findByIds(alertIds);
    }
  }

  ctx.body = success({ ...convergence, alertRecords });
});

router.post('/convergence/:id/acknowledge', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const convergenceRepository = AppDataSource.getRepository(AlertConvergence);
  const convergence = await convergenceRepository.findOne({ where: { id } });
  if (!convergence) {
    ctx.body = error(404, '收敛规则不存在');
    return;
  }

  convergence.isConverged = false;
  convergence.alertCount = 0;
  convergence.convergedAlertIds = undefined;
  convergence.summary = undefined;
  await convergenceRepository.save(convergence);

  ctx.body = success(convergence);
});

router.get('/convergence/stats', async (ctx) => {
  const { startTime, endTime } = ctx.query as any;
  const convergenceRepository = AppDataSource.getRepository(AlertConvergence);

  const end = endTime ? new Date(endTime) : new Date();
  const start = startTime ? new Date(startTime) : dayjs().subtract(24, 'hour').toDate();

  const totalConvergences = await convergenceRepository
    .createQueryBuilder('conv')
    .where('conv.updatedAt BETWEEN :start AND :end', { start, end })
    .getCount();

  const activeConvergences = await convergenceRepository
    .createQueryBuilder('conv')
    .where('conv.isConverged = :isConverged', { isConverged: true })
    .andWhere('conv.updatedAt BETWEEN :start AND :end', { start, end })
    .getCount();

  const totalAlertsConverged = await convergenceRepository
    .createQueryBuilder('conv')
    .select('SUM(conv.alertCount)', 'total')
    .where('conv.updatedAt BETWEEN :start AND :end', { start, end })
    .getRawOne();

  ctx.body = success({
    totalConvergences,
    activeConvergences,
    totalAlertsConverged: totalAlertsConverged?.total || 0,
    reductionRate: totalConvergences > 0 ? ((1 - activeConvergences / totalConvergences) * 100).toFixed(2) : 0,
  });
});

export const alertExtendedRoutes = router;
