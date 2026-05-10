import { Router } from 'express';
import { store, updateAllWeights } from '../data/store.js';

const analyticsRoutes = Router();

analyticsRoutes.get('/kpis', (req, res) => {
  try {
    updateAllWeights();
    
    const approvedContents = store.contents.filter(c => c.status === 'approved');
    
    const totalViews = approvedContents.reduce((sum, c) => sum + (c.views || 0), 0);
    const totalLikes = approvedContents.reduce((sum, c) => sum + (c.likes || 0), 0);
    const totalComments = approvedContents.reduce((sum, c) => sum + (c.comments || 0), 0);
    const totalRevenue = approvedContents.reduce((sum, c) => sum + (c.revenue || 0), 0);
    
    res.json({
      success: true,
      data: {
        totalViews,
        totalLikes,
        totalComments,
        totalRevenue,
        viewsChange: 12.5,
        likesChange: 8.3,
        commentsChange: 15.2,
        revenueChange: 22.7
      }
    });
  } catch (error) {
    console.error('获取KPI失败:', error);
    res.status(500).json({
      success: false,
      error: '获取KPI失败'
    });
  }
});

analyticsRoutes.get('/engagement-trend', (req, res) => {
  try {
    const days = 7;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      
      const baseViews = 5000 + Math.random() * 10000;
      const baseLikes = 500 + Math.random() * 1000;
      
      data.push({
        date: dateStr,
        views: Math.floor(baseViews),
        likes: Math.floor(baseLikes)
      });
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('获取互动趋势失败:', error);
    res.status(500).json({
      success: false,
      error: '获取互动趋势失败'
    });
  }
});

analyticsRoutes.get('/revenue', (req, res) => {
  try {
    const revenueData = [
      { name: '广告收入', value: 3567.89 },
      { name: '付费阅读', value: 2345.67 },
      { name: '打赏收入', value: 1234.56 },
      { name: '会员订阅', value: 890.12 },
      { name: '其他收入', value: 456.78 }
    ];
    
    res.json({
      success: true,
      data: revenueData
    });
  } catch (error) {
    console.error('获取收入数据失败:', error);
    res.status(500).json({
      success: false,
      error: '获取收入数据失败'
    });
  }
});

analyticsRoutes.get('/top-contents', (req, res) => {
  try {
    updateAllWeights();
    
    const approvedContents = store.contents
      .filter(c => c.status === 'approved')
      .map(c => ({
        id: c.id,
        title: c.title,
        author: c.author,
        views: c.views,
        engagementRate: c.views > 0 ? (c.likes + c.comments + c.shares) / c.views : 0,
        revenue: c.revenue || 0,
        qualityGrade: c.qualityGrade
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
    
    res.json({
      success: true,
      data: {
        contents: approvedContents
      }
    });
  } catch (error) {
    console.error('获取热门内容失败:', error);
    res.status(500).json({
      success: false,
      error: '获取热门内容失败'
    });
  }
});

analyticsRoutes.get('/rules-history', (req, res) => {
  try {
    const history = store.ruleHistory
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({
      success: true,
      data: {
        history
      }
    });
  } catch (error) {
    console.error('获取规则历史失败:', error);
    res.status(500).json({
      success: false,
      error: '获取规则历史失败'
    });
  }
});

analyticsRoutes.post('/simulate-engagement', (req, res) => {
  try {
    updateAllWeights();
    
    const approvedContents = store.contents.filter(c => c.status === 'approved');
    
    approvedContents.forEach(content => {
      const viewIncrement = Math.floor(Math.random() * 100);
      const likeIncrement = Math.floor(viewIncrement * (0.05 + Math.random() * 0.1));
      const commentIncrement = Math.floor(viewIncrement * (0.01 + Math.random() * 0.03));
      const shareIncrement = Math.floor(viewIncrement * (0.005 + Math.random() * 0.01));
      
      content.views += viewIncrement;
      content.likes += likeIncrement;
      content.comments += commentIncrement;
      content.shares += shareIncrement;
      
      content.revenue += (viewIncrement * 0.001 + likeIncrement * 0.005);
    });
    
    updateAllWeights();
    
    res.json({
      success: true,
      message: '互动数据模拟完成',
      data: {
        contentsAffected: approvedContents.length
      }
    });
  } catch (error) {
    console.error('模拟互动失败:', error);
    res.status(500).json({
      success: false,
      error: '模拟互动失败'
    });
  }
});

export { analyticsRoutes };
