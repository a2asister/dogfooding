import Koa from 'koa';
import Router from 'koa-router';
import Mock from 'mockjs';
import db from '../db';
import { Api } from '../types';

const mockApp = new Koa();
const mockRouter = new Router();

mockRouter.all('(.*)', async (ctx) => {
  const path = ctx.path;
  const method = ctx.method.toUpperCase();

  const api = db.prepare(`
    SELECT a.*, p.base_url 
    FROM apis a 
    JOIN projects p ON a.project_id = p.id 
    WHERE a.path = ? AND a.method = ? AND a.mock_enabled = 1 AND a.status = 'published'
  `).get(path, method) as (Api & { base_url: string }) | undefined;

  if (!api) {
    ctx.status = 404;
    ctx.body = { code: 404, message: 'Mock接口不存在' };
    return;
  }

  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', '*');
  ctx.set('Access-Control-Allow-Methods', '*');

  if (api.mockData) {
    try {
      const mockTemplate = JSON.parse(api.mockData);
      ctx.body = Mock.mock(mockTemplate);
    } catch {
      ctx.body = api.mockData;
    }
  } else if (api.responseBody) {
    try {
      const responseTemplate = JSON.parse(api.responseBody);
      ctx.body = Mock.mock(responseTemplate);
    } catch {
      ctx.body = api.responseBody;
    }
  } else {
    ctx.body = {
      code: 0,
      message: 'success',
      data: Mock.mock({
        'id|+1': 1,
        'name': '@name',
        'createdAt': '@datetime'
      })
    };
  }
});

mockApp.use(mockRouter.routes()).use(mockRouter.allowedMethods());

export default mockApp;
