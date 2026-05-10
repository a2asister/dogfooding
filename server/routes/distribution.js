import { Router } from 'express';
import { store, calculateWeight, updateAllWeights } from '../data/store.js';

const distributionRoutes = Router();

distributionRoutes.get('/overview', (req, res) => {
  try {
    updateAllWeights();
    
    const approvedContents = store.contents.filter(c => c.status === 'approved');
    
    const totalTraffic = approvedContents.reduce((sum, c) => sum + (c.views || 0), 0);
    const hotCount = approvedContents.filter(c => c.qualityGrade === 'S').length;
    const longTailCount = approvedContents.filter(c => c.qualityGrade === 'B').length;
    const restrictedCount = approvedContents.filter(c => c.qualityGrade === 'C').length;
    
    res.json({
      success: true,
      data: {
        totalTraffic,
        hotCount,
        longTailCount,
        restrictedCount
      }
    });
  } catch (error) {
    console.error('获取分发概览失败:', error);
    res.status(500).json({
      success: false,
      error: '获取分发概览失败'
    });
  }
});

distributionRoutes.get('/quality', (req, res) => {
  try {
    updateAllWeights();
    
    const approvedContents = store.contents
      .filter(c => c.status === 'approved')
      .map(c => ({
        id: c.id,
        title: c.title,
        author: c.author,
        category: c.category,
        qualityGrade: c.qualityGrade,
        views: c.views,
        likes: c.likes,
        comments: c.comments,
        shares: c.shares,
        engagementRate: c.views > 0 ? (c.likes + c.comments + c.shares) / c.views : 0,
        createdAt: c.createdAt
      }))
      .sort((a, b) => {
        const gradeOrder = { S: 0, A: 1, B: 2, C: 3 };
        return gradeOrder[a.qualityGrade] - gradeOrder[b.qualityGrade];
      });
    
    res.json({
      success: true,
      data: {
        contents: approvedContents
      }
    });
  } catch (error) {
    console.error('获取质量分级失败:', error);
    res.status(500).json({
      success: false,
      error: '获取质量分级失败'
    });
  }
});

distributionRoutes.get('/weights', (req, res) => {
  try {
    updateAllWeights();
    
    const weights = store.contents
      .filter(c => c.status === 'approved')
      .map(c => {
        const weightResult = calculateWeight(c);
        return {
          id: c.id,
          title: c.title,
          weight: weightResult.weight,
          qualityScore: weightResult.qualityScore,
          trendingScore: weightResult.trendingScore,
          authorScore: weightResult.authorScore,
          recencyScore: weightResult.recencyScore,
          qualityGrade: weightResult.qualityGrade
        };
      })
      .sort((a, b) => b.weight - a.weight);
    
    res.json({
      success: true,
      data: {
        weights
      }
    });
  } catch (error) {
    console.error('获取权重列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取权重列表失败'
    });
  }
});

distributionRoutes.get('/rules', (req, res) => {
  try {
    const rules = [
      {
        name: '基础流量',
        value: `${store.trafficRules.baseTraffic}`,
        description: '新发布内容的初始基础流量'
      },
      {
        name: 'S级权重系数',
        value: `x${store.trafficRules.qualityMultiplier.S}`,
        description: '爆款内容的流量倍增系数'
      },
      {
        name: 'A级权重系数',
        value: `x${store.trafficRules.qualityMultiplier.A}`,
        description: '优质内容的流量倍增系数'
      },
      {
        name: 'B级权重系数',
        value: `x${store.trafficRules.qualityMultiplier.B}`,
        description: '普通内容的基础流量系数'
      },
      {
        name: 'C级限流系数',
        value: `x${store.trafficRules.qualityMultiplier.C}`,
        description: '低质内容的流量限制系数'
      },
      {
        name: '爆款加温系数',
        value: `x${store.trafficRules.trendingMultiplier}`,
        description: '爆款内容额外加温系数'
      },
      {
        name: '长尾扶持系数',
        value: `x${store.trafficRules.longTailBoost}`,
        description: '长尾内容额外扶持系数'
      },
      {
        name: '互动率阈值',
        value: `${(store.trafficRules.engagementThreshold * 100).toFixed(0)}%`,
        description: '判断优质内容的互动率阈值'
      }
    ];
    
    const tips = [
      {
        title: '增加科技类内容权重',
        description: '科技类内容互动率比平均值高23%，建议增加该分类的基础流量系数',
        impact: 'high'
      },
      {
        title: '优化推荐时间窗口',
        description: '观察到晚间8-10点发布的内容表现更好，建议调整内容推荐时机',
        impact: 'medium'
      },
      {
        title: '增加视频内容扶持',
        description: '含有视频的内容分享率更高，建议增加视频内容的权重加分',
        impact: 'medium'
      },
      {
        title: '调整S级内容阈值',
        description: '当前S级内容占比偏低，可适当降低互动率阈值以增加优质内容曝光',
        impact: 'low'
      }
    ];
    
    res.json({
      success: true,
      data: {
        rules,
        tips
      }
    });
  } catch (error) {
    console.error('获取规则失败:', error);
    res.status(500).json({
      success: false,
      error: '获取规则失败'
    });
  }
});

distributionRoutes.post('/push', (req, res) => {
  try {
    const { contentId, pushType } = req.body;
    
    if (!contentId || !pushType) {
      return res.status(400).json({
        success: false,
        error: '缺少必要字段: contentId, pushType'
      });
    }
    
    const content = store.contents.find(c => c.id === contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        error: '内容不存在'
      });
    }
    
    const pushConfig = {
      hot: { views: 5000, message: '爆款加温推送已启动' },
      longTail: { views: 1000, message: '长尾盘活推送已启动' },
      normal: { views: 500, message: '标准流量推送已启动' }
    };
    
    const config = pushConfig[pushType] || pushConfig.normal;
    content.views = (content.views || 0) + config.views;
    
    updateAllWeights();
    
    res.json({
      success: true,
      data: {
        contentId,
        pushType,
        viewsAdded: config.views,
        totalViews: content.views,
        message: config.message
      }
    });
  } catch (error) {
    console.error('流量推送失败:', error);
    res.status(500).json({
      success: false,
      error: '流量推送失败'
    });
  }
});

export { distributionRoutes };
