import Router from 'koa-router';
import { ContractStore } from '../store/ContractStore';
import { RiskLevel } from '../types';

const router = new Router();

interface RiskRule {
  keyword: string;
  riskLevel: RiskLevel;
  description: string;
  category: string;
}

const riskRules: RiskRule[] = [
  {
    keyword: '违约金',
    riskLevel: 'medium',
    description: '合同中包含违约金条款，需注意违约责任的合理性',
    category: '违约责任'
  },
  {
    keyword: '赔偿',
    riskLevel: 'medium',
    description: '合同中包含赔偿条款，需评估赔偿金额的合理性',
    category: '赔偿条款'
  },
  {
    keyword: '解除合同',
    riskLevel: 'high',
    description: '合同中包含解除条款，需审查解除条件是否公平',
    category: '合同解除'
  },
  {
    keyword: '终止',
    riskLevel: 'medium',
    description: '合同中包含终止条款，需确认终止条件和程序',
    category: '合同终止'
  },
  {
    keyword: '保密',
    riskLevel: 'low',
    description: '合同中包含保密条款，建议明确保密期限和范围',
    category: '保密义务'
  },
  {
    keyword: '不可抗力',
    riskLevel: 'low',
    description: '合同中包含不可抗力条款，建议明确范围和责任',
    category: '免责条款'
  },
  {
    keyword: '争议解决',
    riskLevel: 'low',
    description: '合同中包含争议解决条款，建议确认管辖法院和仲裁机构',
    category: '争议解决'
  },
  {
    keyword: '诉讼',
    riskLevel: 'medium',
    description: '合同中指定诉讼管辖，需确认管辖法院是否有利',
    category: '争议解决'
  },
  {
    keyword: '仲裁',
    riskLevel: 'low',
    description: '合同中选择仲裁方式，仲裁裁决一裁终局，需注意风险',
    category: '争议解决'
  },
  {
    keyword: '无限责任',
    riskLevel: 'critical',
    description: '合同中包含无限责任条款，风险极高，建议重新评估',
    category: '责任范围'
  },
  {
    keyword: '连带责任',
    riskLevel: 'high',
    description: '合同中包含连带责任条款，需评估承担连带责任的风险',
    category: '责任范围'
  },
  {
    keyword: '保证',
    riskLevel: 'medium',
    description: '合同中包含保证条款，需审查保证方式和期限',
    category: '担保条款'
  },
  {
    keyword: '抵押',
    riskLevel: 'medium',
    description: '合同中包含抵押条款，需审查抵押物和登记要求',
    category: '担保条款'
  },
  {
    keyword: '质押',
    riskLevel: 'medium',
    description: '合同中包含质押条款，需审查质物和交付要求',
    category: '担保条款'
  },
  {
    keyword: '知识产权',
    riskLevel: 'low',
    description: '合同涉及知识产权，建议明确权属和许可范围',
    category: '知识产权'
  },
  {
    keyword: '转让',
    riskLevel: 'medium',
    description: '合同中包含转让条款，需审查转让条件和限制',
    category: '合同转让'
  },
  {
    keyword: '独家',
    riskLevel: 'medium',
    description: '合同中包含独家条款，可能涉及垄断风险，需评估',
    category: '竞争限制'
  },
  {
    keyword: '竞业',
    riskLevel: 'medium',
    description: '合同中包含竞业限制条款，需确认期限和补偿是否合理',
    category: '竞争限制'
  },
  {
    keyword: '重大不利',
    riskLevel: 'high',
    description: '合同中包含重大不利变化条款，需审查触发条件',
    category: '特殊条款'
  },
  {
    keyword: '罚款',
    riskLevel: 'high',
    description: '合同中包含罚款条款，需评估罚款金额的合理性',
    category: '违约责任'
  }
];

const analyzeRisk = (content: string): {
  riskLevel: RiskLevel;
  risks: Array<{
    rule: RiskRule;
    foundCount: number;
  }>;
  analysis: string;
} => {
  const foundRisks: Array<{
    rule: RiskRule;
    foundCount: number;
  }> = [];
  
  riskRules.forEach(rule => {
    const regex = new RegExp(rule.keyword, 'g');
    const matches = content.match(regex);
    if (matches && matches.length > 0) {
      foundRisks.push({
        rule,
        foundCount: matches.length
      });
    }
  });
  
  let overallRiskLevel: RiskLevel = 'low';
  if (foundRisks.some(r => r.rule.riskLevel === 'critical')) {
    overallRiskLevel = 'critical';
  } else if (foundRisks.some(r => r.rule.riskLevel === 'high')) {
    overallRiskLevel = 'high';
  } else if (foundRisks.some(r => r.rule.riskLevel === 'medium')) {
    overallRiskLevel = 'medium';
  }
  
  const analysis = generateAnalysis(foundRisks, overallRiskLevel);
  
  return {
    riskLevel: overallRiskLevel,
    risks: foundRisks,
    analysis
  };
};

const generateAnalysis = (
  risks: Array<{ rule: RiskRule; foundCount: number }>,
  level: RiskLevel
): string => {
  if (risks.length === 0) {
    return '未检测到明显的法律风险点。合同内容相对规范，建议法务人员进行最终审核确认。';
  }
  
  const levelDesc: Record<RiskLevel, string> = {
    low: '低风险',
    medium: '中等风险',
    high: '高风险',
    critical: '极高风险'
  };
  
  let analysis = `AI法务初审结果：整体风险等级为【${levelDesc[level]}】。\n\n`;
  analysis += `共检测到 ${risks.length} 个风险点：\n\n`;
  
  const groupedByCategory: Record<string, Array<{ rule: RiskRule; foundCount: number }>> = {};
  
  risks.forEach(r => {
    if (!groupedByCategory[r.rule.category]) {
      groupedByCategory[r.rule.category] = [];
    }
    groupedByCategory[r.rule.category].push(r);
  });
  
  Object.entries(groupedByCategory).forEach(([category, categoryRisks]) => {
    analysis += `【${category}】\n`;
    categoryRisks.forEach(({ rule, foundCount }) => {
      const riskEmoji = {
        low: '🟢',
        medium: '🟡',
        high: '🔴',
        critical: '⚫'
      }[rule.riskLevel];
      
      analysis += `${riskEmoji} 发现关键词"${rule.keyword}" (出现${foundCount}次)\n`;
      analysis += `   风险提示：${rule.description}\n\n`;
    });
  });
  
  if (level === 'critical' || level === 'high') {
    analysis += '⚠️ 重要提示：检测到高风险或极高风险点，强烈建议法务部门进行详细审核，必要时咨询外部法律顾问。';
  } else if (level === 'medium') {
    analysis += '💡 提示：检测到中等风险点，建议法务人员重点关注相关条款，评估是否需要修改。';
  } else {
    analysis += '✅ 提示：仅检测到低风险点，合同整体较为规范，建议法务人员做最终确认。';
  }
  
  return analysis;
};

router.post('/analyze', async (ctx) => {
  const { content, contractId } = ctx.request.body as {
    content: string;
    contractId?: string;
  };
  
  if (!content || content.trim().length === 0) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '请提供合同内容进行分析'
    };
    return;
  }
  
  const result = analyzeRisk(content);
  
  if (contractId) {
    const contract = ContractStore.getContractById(contractId);
    if (contract) {
      ContractStore.updateContract(contractId, {
        riskLevel: result.riskLevel,
        riskAnalysis: result.analysis
      });
    }
  }
  
  ctx.body = {
    success: true,
    data: result,
    message: 'AI法务初审完成'
  };
});

router.post('/analyze-contract/:id', async (ctx) => {
  const { id } = ctx.params;
  const contract = ContractStore.getContractById(id);
  
  if (!contract) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '合同不存在'
    };
    return;
  }
  
  const result = analyzeRisk(contract.content);
  
  ContractStore.updateContract(id, {
    riskLevel: result.riskLevel,
    riskAnalysis: result.analysis
  });
  
  ctx.body = {
    success: true,
    data: {
      contract: {
        ...contract,
        riskLevel: result.riskLevel,
        riskAnalysis: result.analysis
      },
      analysis: result
    },
    message: 'AI法务初审完成'
  };
});

router.get('/risk-levels', async (ctx) => {
  ctx.body = {
    success: true,
    data: [
      { level: 'low', name: '低风险', description: '合同内容较为规范，建议最终确认' },
      { level: 'medium', name: '中等风险', description: '存在需要关注的条款，建议重点审核' },
      { level: 'high', name: '高风险', description: '存在重大风险条款，强烈建议详细审核' },
      { level: 'critical', name: '极高风险', description: '存在严重风险条款，建议咨询法律顾问' }
    ]
  };
});

export default router;
