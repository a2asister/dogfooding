<template>
  <div class="page-container">
    <div class="card-container">
      <div class="page-header">
        <span class="page-title">{{ isEdit ? '编辑合同' : '新建合同' }}</span>
        <div>
          <el-button @click="$router.back()">返回</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="contract-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合同名称" prop="title">
              <el-input v-model="form.title" placeholder="请输入合同名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择合同类型" style="width: 100%">
                <el-option label="买卖合同" value="sales" />
                <el-option label="租赁合同" value="lease" />
                <el-option label="服务合同" value="service" />
                <el-option label="合作协议" value="cooperation" />
                <el-option label="借款合同" value="loan" />
                <el-option label="其他合同" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="甲方" prop="partyA">
              <el-input v-model="form.partyA" placeholder="请输入甲方名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="乙方" prop="partyB">
              <el-input v-model="form.partyB" placeholder="请输入乙方名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合同金额" prop="amount">
              <el-input-number
                v-model="form.amount"
                :min="0"
                :precision="2"
                placeholder="请输入合同金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker
                v-model="form.startDate"
                type="date"
                placeholder="请选择开始日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker
                v-model="form.endDate"
                type="date"
                placeholder="请选择结束日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="合同内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="15"
            placeholder="请输入合同内容"
          />
        </el-form-item>

        <el-form-item>
          <el-button @click="$router.back()">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button v-if="!isEdit" type="success" @click="handleSaveAndAnalyze">
            保存并进行AI初审
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-dialog
      v-model="analyzeResultVisible"
      title="AI法务初审结果"
      width="800px"
    >
      <div v-if="analyzeResult" class="analyze-result">
        <el-alert
          :title="`整体风险等级：${riskLevelMap[analyzeResult.riskLevel].label}`"
          :type="getRiskAlertType(analyzeResult.riskLevel)"
          show-icon
          style="margin-bottom: 20px"
        />
        <div class="risk-analysis">
          <h4 style="margin-bottom: 15px">详细分析：</h4>
          <el-input
            v-model="analyzeResult.analysis"
            type="textarea"
            :rows="10"
            readonly
          />
        </div>
        <div v-if="analyzeResult.risks.length > 0" class="risk-list" style="margin-top: 20px">
          <h4 style="margin-bottom: 15px">检测到的风险点：</h4>
          <el-table :data="analyzeResult.risks" border>
            <el-table-column prop="rule.category" label="类别" width="120" />
            <el-table-column prop="rule.keyword" label="关键词" width="120" />
            <el-table-column prop="rule.riskLevel" label="风险等级" width="100">
              <template #default="{ row }">
                <el-tag :color="riskLevelMap[row.rule.riskLevel].color + '20'" :style="{ color: riskLevelMap[row.rule.riskLevel].color }">
                  {{ riskLevelMap[row.rule.riskLevel].label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="foundCount" label="出现次数" width="100" />
            <el-table-column prop="rule.description" label="风险提示" />
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="analyzeResultVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { contractApi } from '@/api/contracts'
import { aiReviewApi } from '@/api/aiReview'
import { riskLevelMap } from '@/types'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const contractId = ref(route.params.id as string)
const isEdit = ref(!!contractId.value)

const analyzeResultVisible = ref(false)
const analyzeResult = ref<any>(null)

const form = reactive({
  title: '',
  type: 'other',
  partyA: '',
  partyB: '',
  amount: 0,
  startDate: dayjs().format('YYYY-MM-DD'),
  endDate: dayjs().add(1, 'year').format('YYYY-MM-DD'),
  content: ''
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入合同名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择合同类型', trigger: 'change' }],
  partyA: [{ required: true, message: '请输入甲方名称', trigger: 'blur' }],
  partyB: [{ required: true, message: '请输入乙方名称', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入合同金额', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  content: [{ required: true, message: '请输入合同内容', trigger: 'blur' }]
}

const getRiskAlertType = (level: string) => {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
    critical: 'danger'
  }
  return map[level] || 'info'
}

const fetchContract = async () => {
  if (!contractId.value) return
  try {
    const res = await contractApi.getById(contractId.value)
    const data = res.data
    form.title = data.title
    form.type = data.type
    form.partyA = data.partyA
    form.partyB = data.partyB
    form.amount = data.amount
    form.startDate = dayjs(data.startDate).format('YYYY-MM-DD')
    form.endDate = dayjs(data.endDate).format('YYYY-MM-DD')
    form.content = data.content
  } catch (error) {
    ElMessage.error('获取合同信息失败')
  }
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await contractApi.update(contractId.value, {
            title: form.title,
            type: form.type,
            partyA: form.partyA,
            partyB: form.partyB,
            amount: form.amount,
            startDate: form.startDate,
            endDate: form.endDate,
            content: form.content
          })
          ElMessage.success('更新成功')
        } else {
          const res = await contractApi.create({
            title: form.title,
            type: form.type,
            partyA: form.partyA,
            partyB: form.partyB,
            amount: form.amount,
            startDate: form.startDate,
            endDate: form.endDate,
            content: form.content
          })
          ElMessage.success('创建成功')
          router.push(`/contracts/detail/${res.data.id}`)
        }
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }
  })
}

const handleSaveAndAnalyze = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await contractApi.create({
          title: form.title,
          type: form.type,
          partyA: form.partyA,
          partyB: form.partyB,
          amount: form.amount,
          startDate: form.startDate,
          endDate: form.endDate,
          content: form.content
        })
        contractId.value = res.data.id
        isEdit.value = true

        const analyzeRes = await aiReviewApi.analyze({
          content: form.content,
          contractId: contractId.value
        })
        analyzeResult.value = analyzeRes.data
        analyzeResultVisible.value = true
        ElMessage.success('合同已创建并完成AI初审')
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }
  })
}

onMounted(() => {
  if (isEdit.value) {
    fetchContract()
  }
})
</script>

<style scoped>
.contract-form {
  max-width: 1000px;
}

.analyze-result {
  padding: 10px;
}

.risk-analysis {
  margin-bottom: 20px;
}
</style>
