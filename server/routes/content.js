import { Router } from 'express';
import { 
  addContent, 
  getContentsByStatus, 
  getContentById, 
  reviewContent,
  getStats,
  updateAllWeights
} from '../data/store.js';

const contentRoutes = Router();

contentRoutes.post('/publish', (req, res) => {
  try {
    const { title, category, content, author, tags } = req.body;
    
    if (!title || !category || !content || !author) {
      return res.status(400).json({
        success: false,
        error: '缺少必要字段: title, category, content, author'
      });
    }
    
    const newContent = addContent({
      title,
      category,
      content,
      author,
      tags: tags || []
    });
    
    res.json({
      success: true,
      data: newContent
    });
  } catch (error) {
    console.error('发布内容失败:', error);
    res.status(500).json({
      success: false,
      error: '发布内容失败'
    });
  }
});

contentRoutes.get('/list', (req, res) => {
  try {
    const status = req.query.status || 'all';
    const contents = getContentsByStatus(status);
    const stats = getStats();
    
    res.json({
      success: true,
      data: {
        contents: contents.slice().reverse(),
        stats
      }
    });
  } catch (error) {
    console.error('获取内容列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取内容列表失败'
    });
  }
});

contentRoutes.get('/:id', (req, res) => {
  try {
    const content = getContentById(req.params.id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        error: '内容不存在'
      });
    }
    
    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('获取内容详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取内容详情失败'
    });
  }
});

contentRoutes.post('/review', (req, res) => {
  try {
    const { id, status, reviewNote } = req.body;
    
    if (!id || !status) {
      return res.status(400).json({
        success: false,
        error: '缺少必要字段: id, status'
      });
    }
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: '无效的状态值，必须是 approved 或 rejected'
      });
    }
    
    const updatedContent = reviewContent(id, status, reviewNote);
    
    if (!updatedContent) {
      return res.status(404).json({
        success: false,
        error: '内容不存在'
      });
    }
    
    if (status === 'approved') {
      updateAllWeights();
    }
    
    res.json({
      success: true,
      data: updatedContent
    });
  } catch (error) {
    console.error('审核内容失败:', error);
    res.status(500).json({
      success: false,
      error: '审核内容失败'
    });
  }
});

contentRoutes.post('/engage', (req, res) => {
  try {
    const { id, type } = req.body;
    
    if (!id || !type) {
      return res.status(400).json({
        success: false,
        error: '缺少必要字段: id, type'
      });
    }
    
    const validTypes = ['views', 'likes', 'comments', 'shares'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `无效的互动类型，必须是: ${validTypes.join(', ')}`
      });
    }
    
    const content = getContentById(id);
    if (!content) {
      return res.status(404).json({
        success: false,
        error: '内容不存在'
      });
    }
    
    content[type] = (content[type] || 0) + 1;
    updateAllWeights();
    
    res.json({
      success: true,
      data: {
        [type]: content[type]
      }
    });
  } catch (error) {
    console.error('记录互动失败:', error);
    res.status(500).json({
      success: false,
      error: '记录互动失败'
    });
  }
});

export { contentRoutes };
