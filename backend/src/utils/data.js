const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_PATH = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_PATH, 'db.json');

// 初始化数据目录和文件
function initData() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(DATA_PATH, { recursive: true });
  }
  
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = getInitialData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

// 获取初始数据
function getInitialData() {
  return {
    projects: [
      {
        id: uuidv4(),
        name: '电商平台重构项目',
        description: '重构现有电商平台，提升用户体验和系统性能',
        status: 'active',
        progress: 65,
        startDate: '2026-01-15',
        endDate: '2026-08-30',
        budget: 500000,
        actualSpent: 320000,
        teamSize: 12,
        manager: '张三',
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-04-25T14:30:00Z'
      },
      {
        id: uuidv4(),
        name: '企业办公系统升级',
        description: '升级企业内部办公系统，集成新的协作功能',
        status: 'active',
        progress: 30,
        startDate: '2026-03-01',
        endDate: '2026-09-30',
        budget: 300000,
        actualSpent: 80000,
        teamSize: 8,
        manager: '李四',
        createdAt: '2026-03-01T09:00:00Z',
        updatedAt: '2026-04-20T11:00:00Z'
      }
    ],
    risks: [],
    riskRules: getRiskRules(),
    reports: [],
    rectifications: []
  };
}

// 获取风险规则库
function getRiskRules() {
  return [
    {
      id: uuidv4(),
      name: '进度延误风险',
      category: 'schedule',
      description: '项目进度落后计划超过10%',
      condition: 'project.progress < (100 * ((currentDate - startDate) / (endDate - startDate))) - 10',
      severity: 'high',
      enabled: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    },
    {
      id: uuidv4(),
      name: '成本超支风险',
      category: 'cost',
      description: '实际支出超出预算超过10%',
      condition: 'project.actualSpent > project.budget * 1.1',
      severity: 'high',
      enabled: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    },
    {
      id: uuidv4(),
      name: '成本预警',
      category: 'cost',
      description: '实际支出接近预算的90%',
      condition: 'project.actualSpent > project.budget * 0.9 && project.actualSpent <= project.budget * 1.1',
      severity: 'medium',
      enabled: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    },
    {
      id: uuidv4(),
      name: '关键人员流动风险',
      category: 'staff',
      description: '项目关键人员离职或缺勤',
      condition: 'project.teamSize < 8 && project.progress > 30',
      severity: 'medium',
      enabled: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    },
    {
      id: uuidv4(),
      name: '外包进度风险',
      category: 'outsourcing',
      description: '外包工作包进度滞后超过15%',
      condition: 'project.progress < (100 * ((currentDate - startDate) / (endDate - startDate))) - 15',
      severity: 'high',
      enabled: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    },
    {
      id: uuidv4(),
      name: '合规审查风险',
      category: 'compliance',
      description: '项目存在未解决的合规问题',
      condition: 'project.status === "active" && !project.complianceApproved',
      severity: 'high',
      enabled: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    }
  ];
}

// 读取数据
function readData() {
  return new Promise((resolve, reject) => {
    initData();
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}

// 写入数据
function writeData(data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8', (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

// 分析风险
function analyzeRisks(project, data) {
  const risks = [];
  const enabledRules = data.riskRules.filter(rule => rule.enabled);
  
  // 计算预期进度
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  const currentDate = new Date();
  const totalDuration = endDate - startDate;
  const elapsedDuration = currentDate - startDate;
  const expectedProgress = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
  
  // 分析进度风险
  if (project.progress < expectedProgress - 10) {
    risks.push({
      id: uuidv4(),
      projectId: project.id,
      projectName: project.name,
      type: 'schedule',
      level: 'high',
      title: '进度严重延误',
      description: `项目进度为${project.progress}%，但根据时间预期应达到${expectedProgress.toFixed(1)}%，滞后超过10%`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } else if (project.progress < expectedProgress - 5) {
    risks.push({
      id: uuidv4(),
      projectId: project.id,
      projectName: project.name,
      type: 'schedule',
      level: 'medium',
      title: '进度轻微滞后',
      description: `项目进度为${project.progress}%，但根据时间预期应达到${expectedProgress.toFixed(1)}%，滞后5%-10%`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  // 分析成本风险
  const costRatio = project.actualSpent / project.budget;
  if (costRatio > 1.1) {
    risks.push({
      id: uuidv4(),
      projectId: project.id,
      projectName: project.name,
      type: 'cost',
      level: 'high',
      title: '成本严重超支',
      description: `项目实际支出${project.actualSpent}，预算为${project.budget}，超支率达到${((costRatio - 1) * 100).toFixed(1)}%`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } else if (costRatio > 0.9) {
    risks.push({
      id: uuidv4(),
      projectId: project.id,
      projectName: project.name,
      type: 'cost',
      level: 'medium',
      title: '成本预警',
      description: `项目实际支出已达到预算的${(costRatio * 100).toFixed(1)}%，请注意成本控制`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  // 分析人员风险
  if (project.teamSize < 8 && project.progress > 30) {
    risks.push({
      id: uuidv4(),
      projectId: project.id,
      projectName: project.name,
      type: 'staff',
      level: 'medium',
      title: '团队规模风险',
      description: `项目团队规模为${project.teamSize}人，相对较小，请注意关键人员流动风险`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  return risks;
}

// 生成风险报告
function generateRiskReport(project, data, type) {
  const projectRisks = data.risks.filter(r => r.projectId === project.id);
  const pendingRisks = projectRisks.filter(r => r.status === 'pending');
  const inProgressRisks = projectRisks.filter(r => r.status === 'in_progress');
  const resolvedRisks = projectRisks.filter(r => r.status === 'resolved');
  
  const highRisks = projectRisks.filter(r => r.level === 'high');
  const mediumRisks = projectRisks.filter(r => r.level === 'medium');
  const lowRisks = projectRisks.filter(r => r.level === 'low');
  
  const rectifications = data.rectifications.filter(r => {
    const risk = data.risks.find(ris => ris.id === r.riskId);
    return risk && risk.projectId === project.id;
  });
  
  const content = {
    project: {
      name: project.name,
      description: project.description,
      status: project.status,
      progress: project.progress,
      budget: project.budget,
      actualSpent: project.actualSpent,
      teamSize: project.teamSize,
      manager: project.manager,
      startDate: project.startDate,
      endDate: project.endDate
    },
    riskOverview: {
      total: projectRisks.length,
      pending: pendingRisks.length,
      inProgress: inProgressRisks.length,
      resolved: resolvedRisks.length,
      high: highRisks.length,
      medium: mediumRisks.length,
      low: lowRisks.length
    },
    risks: projectRisks,
    rectifications: rectifications,
    analysis: {
      scheduleRisk: projectRisks.filter(r => r.type === 'schedule').length > 0,
      costRisk: projectRisks.filter(r => r.type === 'cost').length > 0,
      staffRisk: projectRisks.filter(r => r.type === 'staff').length > 0,
      outsourcingRisk: projectRisks.filter(r => r.type === 'outsourcing').length > 0,
      complianceRisk: projectRisks.filter(r => r.type === 'compliance').length > 0
    },
    recommendations: generateRecommendations(project, projectRisks)
  };
  
  return content;
}

// 生成建议
function generateRecommendations(project, risks) {
  const recommendations = [];
  
  const scheduleRisks = risks.filter(r => r.type === 'schedule');
  const costRisks = risks.filter(r => r.type === 'cost');
  const staffRisks = risks.filter(r => r.type === 'staff');
  
  if (scheduleRisks.length > 0) {
    recommendations.push({
      category: '进度',
      priority: scheduleRisks.some(r => r.level === 'high') ? 'high' : 'medium',
      content: '建议评估项目进度滞后原因，考虑增加资源投入或调整项目计划，确保项目能够按时交付。'
    });
  }
  
  if (costRisks.length > 0) {
    recommendations.push({
      category: '成本',
      priority: costRisks.some(r => r.level === 'high') ? 'high' : 'medium',
      content: '建议审查项目支出情况，分析成本超支原因，制定成本控制措施，避免进一步超支。'
    });
  }
  
  if (staffRisks.length > 0) {
    recommendations.push({
      category: '人员',
      priority: 'medium',
      content: '建议关注团队稳定性，评估关键人员依赖度，制定人员备份计划，确保项目不因人员流动而受影响。'
    });
  }
  
  // 通用建议
  if (risks.length === 0) {
    recommendations.push({
      category: '通用',
      priority: 'low',
      content: '项目当前风险状况良好，建议继续保持定期风险评估，确保项目顺利进行。'
    });
  } else {
    recommendations.push({
      category: '通用',
      priority: 'medium',
      content: '建议建立风险监控机制，定期更新风险状态，确保整改措施有效执行，降低项目整体风险。'
    });
  }
  
  return recommendations;
}

module.exports = {
  readData,
  writeData,
  analyzeRisks,
  generateRiskReport
};
