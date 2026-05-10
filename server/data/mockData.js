import { v4 as uuidv4 } from 'uuid';
import { store, addRuleHistory, updateAllWeights } from './store.js';

const mockContents = [
  {
    id: uuidv4(),
    title: '人工智能时代的技术革命与未来展望',
    category: 'tech',
    content: '人工智能正在以前所未有的速度改变我们的生活。从自动驾驶汽车到智能家居，从医疗诊断到金融分析，AI的应用场景正在不断扩展。本文将深入探讨AI技术的发展历程、当前的技术瓶颈以及未来的发展方向。我们将分析大语言模型、计算机视觉、强化学习等关键技术的最新进展，并探讨这些技术如何影响各个行业的发展。',
    author: '科技创新者',
    tags: ['人工智能', '科技', '未来'],
    status: 'approved',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    reviewNote: '内容专业，数据详实',
    views: 15234,
    likes: 1234,
    comments: 256,
    shares: 189,
    revenue: 2345.67,
  },
  {
    id: uuidv4(),
    title: '如何养成高效学习的好习惯',
    category: 'education',
    content: '学习是一个终身的过程，而高效的学习方法可以让我们事半功倍。本文将介绍几种被科学证明有效的学习方法，包括间隔重复、主动回忆、费曼学习法等。我们还将探讨如何制定合理的学习计划，如何保持学习动力，以及如何克服学习中的各种困难。',
    author: '教育专家',
    tags: ['学习方法', '效率', '自我提升'],
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000).toISOString(),
    reviewNote: '实用性强，推荐发布',
    views: 8756,
    likes: 892,
    comments: 145,
    shares: 98,
    revenue: 1234.56,
  },
  {
    id: uuidv4(),
    title: '现代都市生活的艺术与平衡',
    category: 'lifestyle',
    content: '在快节奏的都市生活中，如何找到工作与生活的平衡是一个永恒的话题。本文将从时间管理、健康饮食、运动锻炼、人际关系等多个角度，探讨如何在繁忙的生活中保持身心健康，享受生活的美好。',
    author: '生活达人',
    tags: ['生活方式', '平衡', '健康'],
    status: 'approved',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
    reviewNote: '内容积极向上',
    views: 3456,
    likes: 456,
    comments: 67,
    shares: 45,
    revenue: 567.89,
  },
  {
    id: uuidv4(),
    title: '2024年最值得期待的电影大片',
    category: 'entertainment',
    content: '2024年将会有众多精彩电影上映，从超级英雄大片到文艺佳作，从动画电影到纪录片，应有尽有。本文将为您盘点今年最值得期待的电影作品，包括导演阵容、演员配置、剧情梗概等详细信息。',
    author: '影评人',
    tags: ['电影', '娱乐', '2024'],
    status: 'approved',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
    reviewNote: '信息丰富，时效性强',
    views: 6789,
    likes: 567,
    comments: 89,
    shares: 123,
    revenue: 890.12,
  },
  {
    id: uuidv4(),
    title: '创业者必备的商业思维模式',
    category: 'business',
    content: '创业是一条充满挑战的道路，拥有正确的商业思维模式至关重要。本文将介绍几种核心的商业思维，包括用户思维、产品思维、数据思维、增长思维等，帮助创业者在竞争激烈的市场中脱颖而出。',
    author: '创业导师',
    tags: ['创业', '商业', '思维'],
    status: 'approved',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 6.5 * 24 * 60 * 60 * 1000).toISOString(),
    reviewNote: '专业性强，有深度',
    views: 4567,
    likes: 345,
    comments: 56,
    shares: 78,
    revenue: 678.90,
  },
  {
    id: uuidv4(),
    title: '待审核内容示例',
    category: 'tech',
    content: '这是一篇待审核的内容，需要审核人员进行审核后才能发布。内容质量将影响后续的流量分配权重。',
    author: '新作者',
    tags: ['待审核', '示例'],
    status: 'pending',
    createdAt: new Date().toISOString(),
    reviewedAt: null,
    reviewNote: null,
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    revenue: 0,
  },
  {
    id: uuidv4(),
    title: '低质量内容示例 - 内容过于简短',
    category: 'entertainment',
    content: '好。',
    author: '测试用户',
    tags: [],
    status: 'rejected',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 9.5 * 24 * 60 * 60 * 1000).toISOString(),
    reviewNote: '内容质量过低，无法通过审核',
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    revenue: 0,
  }
];

const mockRuleHistory = [
  {
    title: '提高S级内容权重系数',
    description: '将S级内容的流量权重从2.5提升至3.0，增强爆款内容的传播力',
    impact: 'positive',
    effect: '爆款内容曝光量提升23%',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: '优化低质内容限流策略',
    description: '降低C级内容的基础流量，从40%降至30%，净化内容生态',
    impact: 'positive',
    effect: '低质内容占比下降15%',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: '新增长尾内容扶持机制',
    description: '为发布超过7天但互动率仍高于阈值的内容提供额外流量扶持',
    impact: 'positive',
    effect: '长尾内容活跃度提升18%',
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: '调整流量分发时间窗口',
    description: '将内容的初始流量测试时间从2小时延长至4小时',
    impact: 'neutral',
    effect: '内容评估准确性提升8%',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

function initializeMockData() {
  if (store.contents.length === 0) {
    mockContents.forEach(content => {
      store.contents.push(content);
    });
    
    updateAllWeights();
  }
  
  if (store.ruleHistory.length === 0) {
    mockRuleHistory.forEach(rule => {
      addRuleHistory(rule);
    });
  }
  
  console.log('✅ 模拟数据初始化完成');
}

export { initializeMockData };
