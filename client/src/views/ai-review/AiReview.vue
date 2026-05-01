<template>
  <div class="page-container">
    <div class="card-container">
      <div class="page-header">
        <span class="page-title">AI法务初审</span>
      </div>

      <el-row :gutter="20">
        <el-col :span="10">
          <el-card>
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span>合同内容</span>
                <el-select
                  v-model="selectedContractId"
                  placeholder="选择已有合同"
                  style="width: 250px"
                  clearable
                  @change="handleSelectContract"
                >
                  <el-option
                    v-for="contract in contracts"
                    :key="contract.id"
                    :label="contract.title"
                    :value="contract.id"
                  />
                </el-select>
              </div>
            </template>
            <el-input
              v-model="contractContent"
              type="textarea"
              :rows="20"
              placeholder="请输入或粘贴合同内容进行AI风险评估..."
            />
            <div style="margin-top: 15px; text-align: right">
              <el-button @click="clearContent">清空</el-button>
              <el-button type="primary" @click="handleAnalyze" :loading="analyzing">
                <el-icon><Cpu /></el-icon>
                开始AI初审
              </el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :span="14">
          <el-card>
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span>分析结果</span>
                <div v-if="analysisResult">
                  <el-tag
                    :type="getRiskAlertType(analysisResult.riskLevel)"
                    effect="dark"
                    size="large"
                  >
                    整体风险：{{ riskLevelMap[analysisResult.riskLevel].label }}
                  </el-tag>
                </div>
              </div>
            </template>

            <div v-if="analyzing" style="text-align: center; padding: 50px">
              <el-icon size="48" class="is-loading"><Loading /></el-icon>
              <p style="margin-top: 20px; color: #909399">AI正在分析合同风险，请稍候...</p>
            </div>

            <div v-else-if="analysisResult" class="analysis-result">
              <el-alert
                :title="`检测到 ${analysisResult.risks.length} 个风险点`"
                :type="getRiskAlertType(analysisResult.riskLevel)"
                show-icon
                style="margin-bottom: 20px"
              >
                <template #default>
                  <div v-if="analysisResult.risks.length > 0">
                    <span v-for="risk in analysisResult.risks.slice(0, 3)" :key="risk.rule.keyword">
                      <el-tag
                        :style="{
                          backgroundColor: riskLevelMap[risk.rule.riskLevel].color + '20',
                          color: riskLevelMap[risk.rule.riskLevel].color,
                          borderColor: riskLevelMap[risk.rule.riskLevel].color,
                          marginRight: '8px'
                        }"
                      >
                        {{ risk.rule.keyword }} ({{ risk.foundCount }}次)
                      </el-tag>
                    </span>
                    <span v-if="analysisResult.risks.length > 3">
                      等{{ analysisResult.risks.length - 3 }}个...
                    </span>
                  </div>
                </template>
              </el-alert>

              <el-divider content-position="left">详细风险分析</el-divider>

              <div v-if="analysisResult.risks.length > 0">
                <el-table :data="analysisResult.risks" style="width: 100%" stripe>
                  <el-table-column label="类别" prop="rule.category" width="120">
                    <template #default="{ row }">
                      <el-tag size="small">{{ row.rule.category }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="关键词" prop="rule.keyword" width="120">
                    <template #default="{ row }">
                      <strong style="color: #f56c6c">{{ row.rule.keyword }}</strong>
                    </template>
                  </el-table-column>
                  <el-table-column label="出现次数" prop="foundCount" width="100">
                    <template #default="{ row }">
                      <el-badge :value="row.foundCount" :max="99" class="item" />
                    </template>
                  </el-table-column>
                  <el-table-column label="风险等级" width="100">
                    <template #default="{ row }">
                      <el-tag
                        :style="{
                          backgroundColor: riskLevelMap[row.rule.riskLevel].color + '20',
                          color: riskLevelMap[row.rule.riskLevel].color
                        }"
                      >
                        {{ riskLevelMap[row.rule.riskLevel].label }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="风险提示" prop="rule.description" />
                </el-table>
              </div>

              <el-divider content-position="left">AI分析建议</el-divider>

              <div class="analysis-text">
                <pre>{{ analysisResult.analysis }}</pre>
              </div>

              <el-divider content-position="left">风险等级说明</el-divider>

              <el-row :gutter="20">
                <el-col :span="6" v-for="level in riskLevelList" :key="level.level">
                  <el-card shadow="hover">
                    <div style="text-align: center">
                      <el-tag
                        :style="{
                          backgroundColor: riskLevelMap[level.level].color + '20',
                          color: riskLevelMap[level.level].color,
                          borderColor: riskLevelMap[level.level].color
                        }"
                        size="large"
                      >
                        {{ riskLevelMap[level.level].label }}
                      </el-tag>
                      <p style="margin-top: 10px; font-size: 12px; color: #909399">
                        {{ level.description }}
                      </p>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>

            <div v-else class="empty-state">
              <el-empty description="请输入合同内容并点击开始AI初审">
                <template #image>
                  <el-icon size="80" style="color: #c0c4cc"><Cpu /></el-icon>
                </template>
              </el-empty>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { aiReviewApi } from '@/api/aiReview'
import { contractApi } from '@/api/contracts'
import type { Contract, RiskLevel } from '@/types'
import { riskLevelMap } from '@/types'

const contracts = ref<Contract[]>([])
const selectedContractId = ref('')
const contractContent = ref('')
const analyzing = ref(false)
const analysisResult = ref<any>(null)

const riskLevelList = [
  { level: 'low' as RiskLevel, name: '低风险', description: '合同内容较为规范，建议最终确认' },
  { level: 'medium' as RiskLevel, name: '中等风险', description: '存在需要关注的条款，建议重点审核' },
  { level: 'high' as RiskLevel, name: '高风险', description: '存在重大风险条款，强烈建议详细审核' },
  { level: 'critical' as RiskLevel, name: '极高风险', description: '存在严重风险条款，建议咨询法律顾问' }
]

const getRiskAlertType = (level: RiskLevel) => {
  const map: Record<RiskLevel, 'success' | 'warning' | 'error' | 'info'> = {
    low: 'success',
    medium: 'warning',
    high: 'error',
    critical: 'error'
  }
  return map[level] || 'info'
}

const fetchContracts = async () => {
  try {
    const res = await contractApi.getAll()
    contracts.value = res.data
  } catch (error) {
    console.error('Failed to fetch contracts:', error)
  }
}

const handleSelectContract = (id: string) => {
  const contract = contracts.value.find(c => c.id === id)
  if (contract) {
    contractContent.value = contract.content || ''
  }
}

const clearContent = () => {
  contractContent.value = ''
  selectedContractId.value = ''
  analysisResult.value = null
}

const handleAnalyze = async () => {
  if (!contractContent.value.trim()) {
    ElMessage.warning('请输入合同内容')
    return
  }

  analyzing.value = true
  try {
    const data: { content: string; contractId?: string } = {
      content: contractContent.value
    }
    if (selectedContractId.value) {
      data.contractId = selectedContractId.value
    }

    const res = await aiReviewApi.analyze(data)
    analysisResult.value = res.data
    ElMessage.success('AI分析完成')
  } catch (error) {
    ElMessage.error('AI分析失败')
  } finally {
    analyzing.value = false
  }
}

onMounted(() => {
  fetchContracts()
})
</script>

<style scoped>
.analysis-result {
  padding: 10px;
}

.analysis-text {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.analysis-text pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.8;
}

.empty-state {
  padding: 40px;
}

.item {
  margin-top: 10px;
}
</style>
