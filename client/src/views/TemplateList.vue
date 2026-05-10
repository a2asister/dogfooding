<template>
  <div>
    <el-card class="mb-4">
      <div class="flex justify-between items-center">
        <div class="flex gap-4">
          <el-select
            v-model="filter.category"
            placeholder="选择分类"
            clearable
            style="width: 200px"
            @change="loadTemplates"
          >
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </div>
        <el-button type="primary" @click="seedTemplates" v-if="templates.length === 0">
          初始化模板
        </el-button>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="6" v-for="template in templates" :key="template._id">
        <el-card class="cursor-pointer hover:shadow-lg transition-all" @click="applyTemplate(template)">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-medium">{{ template.name }}</span>
              <el-tag size="small">{{ template.category }}</el-tag>
            </div>
          </template>
          <p class="text-sm text-gray-500 mb-4">{{ template.description }}</p>
          <div class="flex justify-between items-center">
            <el-text size="small" type="info">{{ template.fields?.length || 0 }} 个字段</el-text>
            <el-button type="primary" size="small">使用模板</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="templates.length === 0" description="暂无模板，点击上方按钮初始化">
      <el-button type="primary" @click="seedTemplates">初始化模板</el-button>
    </el-empty>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTemplateList, getTemplateCategories, applyTemplate as applyTemplateApi, seedTemplates as seed } from '@/api/template'

const router = useRouter()

const templates = ref([])
const categories = ref([])
const filter = ref({
  category: ''
})

const loadTemplates = async () => {
  try {
    const params = {}
    if (filter.value.category) params.category = filter.value.category
    
    const data = await getTemplateList(params)
    templates.value = data || []
  } catch (error) {
    console.error('加载模板失败:', error)
  }
}

const loadCategories = async () => {
  try {
    const data = await getTemplateCategories()
    categories.value = data || []
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const seedTemplates = async () => {
  try {
    await seed()
    ElMessage.success('模板初始化成功')
    loadTemplates()
    loadCategories()
  } catch (error) {
    console.error('初始化模板失败:', error)
  }
}

const applyTemplate = (template) => {
  ElMessageBox.confirm(
    `确定要使用模板 "${template.name}" 创建新表单吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(async () => {
    try {
      const form = await applyTemplateApi(template._id, {
        name: `${template.name} - 新建`
      })
      ElMessage.success('创建成功')
      router.push(`/forms/${form._id}/edit`)
    } catch (error) {
      console.error('使用模板失败:', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  loadTemplates()
  loadCategories()
})
</script>

<style scoped>
.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
</style>
