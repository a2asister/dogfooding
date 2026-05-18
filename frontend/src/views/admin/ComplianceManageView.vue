<template>
  <div class="compliance-manage">
    <el-tabs v-model="activeDoc">
      <el-tab-pane v-for="doc in docTypes" :key="doc.type" :label="doc.label" :name="doc.type">
        <div class="doc-card card">
          <div class="card-header">
            <h3>{{ doc.label }}编辑</h3>
          </div>
          <el-form :model="form" label-width="100px">
            <el-form-item label="文档标题">
              <el-input v-model="form.title" placeholder="请输入文档标题" />
            </el-form-item>
            <el-form-item label="文档内容">
              <RichEditor v-model="form.content" placeholder="请输入文档内容" height="500px" />
            </el-form-item>
          </el-form>
          <div class="card-footer">
            <el-button type="primary" @click="saveDoc" :loading="submitting">保存文档</el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { complianceApi } from '../../api'
import RichEditor from '../../components/RichEditor.vue'

const docTypes = [
  { type: 'user_agreement', label: '用户协议' },
  { type: 'privacy_policy', label: '隐私政策' },
  { type: 'minor_protection', label: '未成年人保护' },
  { type: 'copyright', label: '版权声明' }
]

const activeDoc = ref('user_agreement')
const submitting = ref(false)
const form = reactive({
  title: '',
  content: ''
})

const loadDoc = async (docType: string): Promise<void> => {
  try {
    const result = await complianceApi.getByType(docType)
    form.title = result.title
    form.content = result.content
  } catch {
    form.title = ''
    form.content = ''
  }
}

const saveDoc = async (): Promise<void> => {
  if (!form.title || !form.content) {
    ElMessage.error('请填写标题和内容')
    return
  }

  submitting.value = true
  try {
    await complianceApi.update(activeDoc.value, {
      title: form.title,
      content: form.content
    })
    ElMessage.success('保存成功')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

watch(activeDoc, (newType) => {
  loadDoc(newType)
})

onMounted(() => {
  loadDoc(activeDoc.value)
})
</script>

<style scoped lang="scss">
.compliance-manage {
  .doc-card {
    padding: 24px;

    .card-header {
      margin-bottom: 20px;

      h3 {
        font-size: 18px;
        color: var(--text-primary);
        margin: 0;
      }
    }

    .card-footer {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
    }
  }
}

:deep(.el-tabs) {
  --el-tabs-header-bg-color: var(--bg-card);
  --el-tabs-active-color: var(--secondary-color);
  --el-tabs-hover-color: var(--secondary-color);
  --el-tabs-item-color: var(--text-secondary);
  --el-tabs-border-color: var(--border-color);
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: var(--border-color);
}

:deep(.el-tab-pane) {
  margin-top: 20px;
}

:deep(.el-input__wrapper), :deep(.el-textarea__inner) {
  background: var(--bg-dark);
  box-shadow: 0 0 0 1px var(--border-color) inset;
  color: var(--text-primary);

  &:hover, &.is-focus {
    box-shadow: 0 0 0 1px var(--secondary-color) inset;
  }
}
</style>
