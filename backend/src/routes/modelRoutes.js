import Router from 'koa-router';
import db from '../utils/db.js';
import { authenticate, sitePermission } from '../middlewares/authMiddleware.js';

const router = new Router();

router.get('/:siteId', authenticate, sitePermission('model:read'), async (ctx) => {
  try {
    const { siteId } = ctx.params;
    const models = await db.findAll('contentModels', siteId);
    
    ctx.body = {
      success: true,
      data: models
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '获取内容模型列表失败' };
  }
});

router.get('/:siteId/:modelId', authenticate, sitePermission('model:read'), async (ctx) => {
  try {
    const { siteId, modelId } = ctx.params;
    const model = await db.findById('contentModels', modelId, siteId);
    
    if (!model) {
      ctx.status = 404;
      ctx.body = { error: '内容模型不存在' };
      return;
    }
    
    ctx.body = {
      success: true,
      data: model
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '获取内容模型信息失败' };
  }
});

router.post('/:siteId', authenticate, sitePermission('model:create'), async (ctx) => {
  try {
    const { siteId } = ctx.params;
    const { name, slug, description, fields } = ctx.request.body;
    
    if (!name || !slug || !fields) {
      ctx.status = 400;
      ctx.body = { error: '模型名称、别名和字段不能为空' };
      return;
    }
    
    const existingModel = await db.findOne('contentModels', { slug }, siteId);
    if (existingModel) {
      ctx.status = 400;
      ctx.body = { error: '模型别名已存在' };
      return;
    }
    
    const model = await db.create('contentModels', {
      name,
      slug,
      description: description || '',
      fields,
      isSystem: false
    }, siteId);
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      data: model
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '创建内容模型失败' };
  }
});

router.put('/:siteId/:modelId', authenticate, sitePermission('model:update'), async (ctx) => {
  try {
    const { siteId, modelId } = ctx.params;
    const { name, slug, description, fields } = ctx.request.body;
    
    const model = await db.findById('contentModels', modelId, siteId);
    if (!model) {
      ctx.status = 404;
      ctx.body = { error: '内容模型不存在' };
      return;
    }
    
    if (model.isSystem) {
      ctx.status = 403;
      ctx.body = { error: '系统模型不能修改' };
      return;
    }
    
    if (slug && slug !== model.slug) {
      const existingModel = await db.findOne('contentModels', { slug }, siteId);
      if (existingModel && existingModel.id !== modelId) {
        ctx.status = 400;
        ctx.body = { error: '模型别名已存在' };
        return;
      }
    }
    
    const updatedModel = await db.update('contentModels', modelId, {
      ...(name && { name }),
      ...(slug && { slug }),
      ...(description !== undefined && { description }),
      ...(fields && { fields })
    }, siteId);
    
    ctx.body = {
      success: true,
      data: updatedModel
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '更新内容模型失败' };
  }
});

router.delete('/:siteId/:modelId', authenticate, sitePermission('model:delete'), async (ctx) => {
  try {
    const { siteId, modelId } = ctx.params;
    
    const model = await db.findById('contentModels', modelId, siteId);
    if (!model) {
      ctx.status = 404;
      ctx.body = { error: '内容模型不存在' };
      return;
    }
    
    if (model.isSystem) {
      ctx.status = 403;
      ctx.body = { error: '系统模型不能删除' };
      return;
    }
    
    const contents = await db.find('contents', { modelId }, siteId);
    if (contents.length > 0) {
      ctx.status = 400;
      ctx.body = { error: '该模型下还有内容，无法删除' };
      return;
    }
    
    await db.delete('contentModels', modelId, siteId);
    
    ctx.body = {
      success: true,
      message: '内容模型已删除'
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '删除内容模型失败' };
  }
});

export default router;
