<template>
  <div class="max-w-3xl mx-auto">
    <el-card>
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-2xl font-bold">{{ form?.name }}</h3>
        <el-button @click="goBack">返回</el-button>
      </div>
      <p class="text-gray-500 mb-6">{{ form?.description }}</p>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        v-loading="loading"
      >
        <template v-for="field in form?.fields || []" :key="field.id">
          <el-form-item
            v-if="!field.hidden"
            :label="field.label"
            :prop="field.name"
            :required="field.required"
          >
            <DynamicFormItem
              :field="field"
              v-model="formData[field.name]"
            />
          </el-form-item>
        </template>

        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            提交
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getForm } from '@/api/form'
import { createSubmission, submitSubmission as submitApi } from '@/api/submission'
import DynamicFormItem from '@/components/FormComponents/DynamicFormItem.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const form = ref(null)
const formRef = ref(null)
const formData = reactive({})
const submissionId = ref(null)

const formRules = computed(() => {
  const rules = {}
  if (form.value?.fields) {
    form.value.fields.forEach(field => {
      if (field.rules && field.rules.length > 0) {
        rules[field.name] = field.rules.map(rule => {
          const baseRule = { message: rule.message }
          switch (rule.type) {
            case 'required':
              return { ...baseRule, required: true, trigger: 'blur' }
            case 'pattern':
              return { ...baseRule, pattern: new RegExp(rule.value), trigger: 'blur' }
            case 'min':
              return { ...baseRule, min: Number(rule.value), trigger: 'blur' }
            case 'max':
              return { ...baseRule, max: Number(rule.value), trigger: 'blur' }
            default:
              return baseRule
          }
        })
      }
    })
  }
  return rules
})

const loadForm = async () => {
  loading.value = true
  try {
    const formData = await getForm(route.params.id)
    form.value = formData
    
    formData.fields?.forEach(field => {
      if (field.defaultValue !== undefined && field.defaultValue !== null) {
        formData[field.name] = field.defaultValue
      }
    })
  } catch (error) {
    console.error('加载表单失败:', error)
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
  } catch {
    ElMessage.error('请检查表单填写')
    return
  }

  submitting.value = true
  try {
    if (!submissionId.value) {
      const result = await createSubmission({
        formId: route.params.id,
        data: formData
      })
      submissionId.value = result._id
    }

    await submitApi(submissionId.value)
    ElMessage.success('提交成功')
    router.push('/submissions')
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  Object.keys(formData).forEach(key => {
    delete formData[key]
  })
  form.value?.fields?.forEach(field => {
    if (field.defaultValue !== undefined && field.defaultValue !== null) {
      formData[field.name] = field.defaultValue
    }
  })
}

const goBack = () => {
  router.push('/forms')
}

onMounted(() => {
  loadForm()
})
</script>
