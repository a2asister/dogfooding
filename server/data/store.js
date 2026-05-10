import { v4 as uuidv4 } from 'uuid';

const store = {
  contents: [],
  engagement: {},
  revenue: {},
  ruleHistory: [],
  trafficRules: {
    baseTraffic: 100,
    qualityMultiplier: { S: 3.0, A: 2.0, B: 1.0, C: 0.3 },
    trendingMultiplier: 1.5,
    longTailBoost: 1.2,
    lowQualityRestriction: 0.5,
    engagementThreshold: 0.05,
    hotContentThreshold: 10000,
  }
};

function addContent(contentData) {
  const content = {
    id: uuidv4(),
    ...contentData,
    status: 'pending',
    createdAt: new Date().toISOString(),
    reviewedAt: null,
    reviewNote: null,
    qualityGrade: 'B',
    weight: 1.0,
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    revenue: 0,
  };
  store.contents.push(content);
  return content;
}

function getContentById(id) {
  return store.contents.find(c => c.id === id);
}

function getContentsByStatus(status) {
  if (status === 'all') return store.contents;
  return store.contents.filter(c => c.status === status);
}

function updateContent(id, updates) {
  const index = store.contents.findIndex(c => c.id === id);
  if (index !== -1) {
    store.contents[index] = { ...store.contents[index], ...updates };
    return store.contents[index];
  }
  return null;
}

function reviewContent(id, status, reviewNote) {
  return updateContent(id, {
    status,
    reviewNote,
    reviewedAt: new Date().toISOString()
  });
}

function getStats() {
  return {
    pending: store.contents.filter(c => c.status === 'pending').length,
    approved: store.contents.filter(c => c.status === 'approved').length,
    rejected: store.contents.filter(c => c.status === 'rejected').length,
  };
}

function calculateQualityScore(content) {
  let score = 50;
  
  if (content.content && content.content.length > 500) score += 20;
  if (content.tags && content.tags.length >= 3) score += 10;
  if (content.category === 'tech' || content.category === 'education') score += 10;
  
  if (content.views > 0) {
    const engagementRate = (content.likes + content.comments + content.shares) / content.views;
    if (engagementRate > 0.1) score += 30;
    else if (engagementRate > 0.05) score += 15;
    else if (engagementRate > 0.02) score += 5;
  }
  
  return Math.min(100, Math.max(0, score));
}

function calculateQualityGrade(score) {
  if (score >= 85) return 'S';
  if (score >= 70) return 'A';
  if (score >= 50) return 'B';
  return 'C';
}

function calculateWeight(content) {
  const qualityScore = calculateQualityScore(content);
  const qualityGrade = calculateQualityGrade(qualityScore);
  
  const qualityMultiplier = store.trafficRules.qualityMultiplier[qualityGrade] || 1.0;
  
  let trendingScore = 50;
  if (content.views > store.trafficRules.hotContentThreshold) trendingScore = 90;
  else if (content.views > 5000) trendingScore = 70;
  else if (content.views > 1000) trendingScore = 50;
  
  const authorScore = 60;
  
  const now = new Date();
  const created = new Date(content.createdAt);
  const hoursDiff = (now - created) / (1000 * 60 * 60);
  let recencyScore = 100 - Math.min(hoursDiff * 0.5, 80);
  
  const weight = (
    (qualityScore * 0.4) +
    (trendingScore * 0.3) +
    (authorScore * 0.2) +
    (recencyScore * 0.1)
  ) / 25;
  
  let finalWeight = weight * qualityMultiplier;
  
  if (qualityGrade === 'S') finalWeight *= store.trafficRules.trendingMultiplier;
  if (qualityGrade === 'C') finalWeight *= store.trafficRules.lowQualityRestriction;
  
  return {
    qualityScore,
    qualityGrade,
    trendingScore,
    authorScore,
    recencyScore,
    weight: Math.max(0.1, finalWeight)
  };
}

function updateAllWeights() {
  store.contents.forEach(content => {
    if (content.status === 'approved') {
      const result = calculateWeight(content);
      content.qualityScore = result.qualityScore;
      content.qualityGrade = result.qualityGrade;
      content.weight = result.weight;
    }
  });
}

function addEngagement(contentId, type, value = 1) {
  const content = getContentById(contentId);
  if (content) {
    if (type === 'views') content.views += value;
    else if (type === 'likes') content.likes += value;
    else if (type === 'comments') content.comments += value;
    else if (type === 'shares') content.shares += value;
    
    updateAllWeights();
    return content;
  }
  return null;
}

function addRevenue(contentId, amount) {
  const content = getContentById(contentId);
  if (content) {
    content.revenue += amount;
    return content;
  }
  return null;
}

function addRuleHistory(rule) {
  store.ruleHistory.push({
    id: uuidv4(),
    ...rule,
    date: new Date().toISOString()
  });
  return store.ruleHistory[store.ruleHistory.length - 1];
}

export {
  store,
  addContent,
  getContentById,
  getContentsByStatus,
  updateContent,
  reviewContent,
  getStats,
  calculateQualityScore,
  calculateQualityGrade,
  calculateWeight,
  updateAllWeights,
  addEngagement,
  addRevenue,
  addRuleHistory
};
