<template>
  <div class="form-designer-container">
    <el-card class="mb-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <el-input
            v-model="formStore.currentForm.name"
            placeholder="表单名称"
            style="width: 300px"
            size="large"
          />
          <el-select
            v-model="formStore.currentForm.category"
            placeholder="选择分类"
            size="large"
          >
            <el-option label="通用" value="通用" />
            <el-option label="人事管理" value="人事管理" />
            <el-option label="财务管理" value="财务管理" />
            <el-option label="项目管理" value="项目管理" />
            <el-option label="客户管理" value="客户管理" />
          </el-select>
        </div>
        <div class="flex gap-2">
          <el-button :disabled="!formStore.canUndo" @click="formStore.undo()">
            <el-icon><Undo /></el-icon>撤销
          </el-button>
          <el-button :disabled="!formStore.canRedo" @click="formStore.redo()">
            <el-icon><Redo /></el-icon>重做
          </el-button>
          <el-button @click="togglePreview">
            <el-icon><View /></el-icon>
            {{ isPreview ? '编辑' : '预览' }}
          </el-button>
          <el-button type="primary" @click="saveForm" :loading="saving">
            <el-icon><Check /></el-icon>保存
          </el-button>
          <el-button type="success" @click="saveAndPublish" :loading="publishing" v-if="!isEdit">
            <el-icon><Upload /></el-icon>保存并发布
          </el-button>
        </div>
      </div>
    </el-card>

    <div v-if="isPreview" class="preview-container">
      <el-card>
        <h3 class="text-xl font-bold mb-4">{{ formStore.currentForm.name }}</h3>
        <p class="text-gray-500 mb-6">{{ formStore.currentForm.description }}</p>
        
        <el-form
          ref="previewFormRef"
          :model="previewFormData"
          :rules="previewRules"
          label-width="120px"
        >
          <template v-for="field in formStore.currentForm.fields" :key="field.id">
            <el-form-item
              v-if="!field.hidden"
              :label="field.label"
              :prop="field.name"
              :required="field.required"
            >
              <DynamicFormItem
                :field="field"
                v-model="previewFormData[field.name]"
                @change="handlePreviewChange(field, $event)"
              />
            </el-form-item>
          </template>
          
          <el-form-item>
            <el-button type="primary" @click="validatePreview">验证表单</el-button>
            <el-button @click="resetPreview">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div v-else class="form-designer">
      <div class="form-designer-left p-4">
        <h3 class="font-bold mb-4">组件库</h3>
        <div v-for="group in componentTypes" :key="group.group">
          <el-collapse v-model="expandedGroups" accordion>
            <el-collapse-item :title="group.group" :name="group.group">
              <div class="space-y-2">
                <div
                  v-for="item in group.items"
                  :key="item.type"
                  class="component-card"
                  draggable="true"
                  @dragstart="handleDragStart($event, item)"
                >
                  <el-icon class="mr-2"><component :is="item.icon" /></el-icon>
                  {{ item.label }}
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>

      <div class="form-designer-center">
        <div
          class="form-designer-canvas"
          @dragover.prevent="handleDragOver"
          @drop="handleDrop"
          @click="handleCanvasClick"
        >
          <div v-if="formStore.currentForm.fields.length === 0" class="empty-canvas">
            <el-icon class="text-4xl mb-4"><Document /></el-icon>
            <p>从左侧拖拽组件到此处添加表单字段</p>
          </div>
          <div v-else>
            <div
              v-for="(field, index) in formStore.currentForm.fields"
              :key="field.id"
              class="form-item-wrapper"
              :class="{ selected: formStore.selectedField?.id === field.id }"
              draggable="true"
              @click.stop="selectField(field)"
              @dragover.prevent
              @drop.stop="handleFieldDrop($event, index)"
              @dragstart="handleFieldDragStart($event, index)"
            >
              <div class="form-item-actions">
                <el-button size="small" text @click.stop="moveFieldUp(index)" :disabled="index === 0">
                  <el-icon><ArrowUp /></el-icon>
                </el-button>
                <el-button size="small" text @click.stop="moveFieldDown(index)" :disabled="index === formStore.currentForm.fields.length - 1">
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
                <el-button size="small" text type="danger" @click.stop="removeField(field.id)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <div class="flex items-center mb-1">
                <el-icon class="mr-2 text-gray-400 cursor-grab"><Rank /></el-icon>
                <span class="font-medium">{{ field.label }}</span>
                <span v-if="field.required" class="ml-1 text-red-500">*</span>
              </div>
              <div class="text-sm text-gray-400">
                {{ field.type }} | {{ field.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-designer-right p-4">
        <h3 class="font-bold mb-4">属性配置</h3>
        
        <template v-if="formStore.selectedField">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本属性" name="basic">
              <el-form label-position="top">
                <el-form-item label="字段名称">
                  <el-input v-model="formStore.selectedField.label" @change="updateSelectedField" />
                </el-form-item>
                <el-form-item label="字段标识">
                  <el-input v-model="formStore.selectedField.name" @change="updateSelectedField" />
                </el-form-item>
                <el-form-item label="占位符">
                  <el-input v-model="formStore.selectedField.placeholder" @change="updateSelectedField" />
                </el-form-item>
                <el-form-item label="默认值">
                  <el-input v-model="formStore.selectedField.defaultValue" @change="updateSelectedField" />
                </el-form-item>
                <el-form-item>
                  <el-checkbox v-model="formStore.selectedField.required" @change="updateSelectedField">必填</el-checkbox>
                </el-form-item>
                <el-form-item>
                  <el-checkbox v-model="formStore.selectedField.hidden" @change="updateSelectedField">隐藏</el-checkbox>
                </el-form-item>
                <el-form-item>
                  <el-checkbox v-model="formStore.selectedField.readonly" @change="updateSelectedField">只读</el-checkbox>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="校验规则" name="validation" v-if="canHaveValidation">
              <div class="mb-4">
                <el-button type="primary" size="small" @click="addRule">
                  <el-icon><Plus /></el-icon>添加规则
                </el-button>
              </div>
              <div
                v-for="(rule, index) in formStore.selectedField.rules"
                :key="index"
                class="linkage-rule-item"
              >
                <div class="flex justify-between items-center mb-2">
                  <span class="font-medium">规则 {{ index + 1 }}</span>
                  <el-button type="danger" size="small" text @click="removeRule(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                <el-form label-position="top">
                  <el-form-item label="规则类型">
                    <el-select v-model="rule.type" style="width: 100%" @change="updateSelectedField">
                      <el-option label="非空" value="required" />
                      <el-option label="正则表达式" value="pattern" />
                      <el-option label="最小值" value="min" />
                      <el-option label="最大值" value="max" />
                      <el-option label="唯一性" value="unique" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="规则值" v-if="rule.type !== 'required' && rule.type !== 'unique'">
                    <el-input v-model="rule.value" @change="updateSelectedField" />
                  </el-form-item>
                  <el-form-item label="错误提示">
                    <el-input v-model="rule.message" @change="updateSelectedField" />
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="选项配置" name="options" v-if="canHaveOptions">
              <div class="mb-4">
                <el-button type="primary" size="small" @click="addOption">
                  <el-icon><Plus /></el-icon>添加选项
                </el-button>
              </div>
              <div
                v-for="(option, index) in formStore.selectedField.options"
                :key="index"
                class="flex gap-2 mb-2"
              >
                <el-input v-model="option.label" placeholder="显示文本" size="small" @change="updateSelectedField" />
                <el-input v-model="option.value" placeholder="实际值" size="small" @change="updateSelectedField" />
                <el-button type="danger" size="small" text @click="removeOption(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </el-tab-pane>

            <el-tab-pane label="联动配置" name="linkage">
              <div class="mb-4">
                <el-button type="primary" size="small" @click="addLinkage">
                  <el-icon><Plus /></el-icon>添加联动规则
                </el-button>
              </div>
              <div
                v-for="(linkage, index) in formStore.selectedField.linkage || []"
                :key="index"
                class="linkage-rule-item"
              >
                <div class="flex justify-between items-center mb-2">
                  <span class="font-medium">联动规则 {{ index + 1 }}</span>
                  <el-button type="danger" size="small" text @click="removeLinkage(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                <el-form label-position="top">
                  <el-form-item label="触发字段">
                    <el-select v-model="linkage.triggerField" style="width: 100%" @change="updateSelectedField">
                      <el-option
                        v-for="f in otherFields"
                        :key="f.id"
                        :label="f.label"
                        :value="f.name"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="条件">
                    <el-select v-model="linkage.condition" style="width: 100%" @change="updateSelectedField">
                      <el-option label="等于" value="==" />
                      <el-option label="不等于" value="!=" />
                      <el-option label="大于" value=">" />
                      <el-option label="小于" value="<" />
                      <el-option label="包含" value="includes" />
                    </el-select>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="权限控制" name="permissions">
              <el-form label-position="top">
                <el-form-item label="可见角色">
                  <el-select
                    v-model="formStore.selectedField.permissions?.visibleRoles"
                    multiple
                    collapse-tags
                    style="width: 100%"
                    @change="updateSelectedField"
                  >
                    <el-option label="管理员" value="admin" />
                    <el-option label="部门经理" value="manager" />
                    <el-option label="普通用户" value="user" />
                    <el-option label="HR" value="hr" />
                  </el-select>
                </el-form-item>
                <el-form-item label="可编辑角色">
                  <el-select
                    v-model="formStore.selectedField.permissions?.editableRoles"
                    multiple
                    collapse-tags
                    style="width: 100%"
                    @change="updateSelectedField"
                  >
                    <el-option label="管理员" value="admin" />
                    <el-option label="部门经理" value="manager" />
                    <el-option label="普通用户" value="user" />
                    <el-option label="HR" value="hr" />
                  </el-select>
                </el-form-item>
                <el-form-item label="隐藏角色">
                  <el-select
                    v-model="formStore.selectedField.permissions?.hiddenRoles"
                    multiple
                    collapse-tags
                    style="width: 100%"
                    @change="updateSelectedField"
                  >
                    <el-option label="管理员" value="admin" />
                    <el-option label="部门经理" value="manager" />
                    <el-option label="普通用户" value="user" />
                    <el-option label="HR" value="hr" />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </template>
        <template v-else>
          <div class="text-center text-gray-400 py-8">
            请选择一个字段进行配置
          </div>
        </template>

        <div class="mt-6 border-t pt-4">
          <h4 class="font-bold mb-2">工作流设置</h4>
          <div class="mb-2">
            <el-button type="primary" size="small" @click="addWorkflowStep">
              <el-icon><Plus /></el-icon>添加审批步骤
            </el-button>
          </div>
          <div
            v-for="(step, index) in formStore.currentForm.workflows"
            :key="index"
            class="workflow-step"
          >
            <div class="flex justify-between items-center mb-2">
              <span class="font-medium">步骤 {{ index + 1 }}</span>
              <el-button type="danger" size="small" text @click="removeWorkflowStep(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-form label-position="top">
              <el-form-item label="步骤名称">
                <el-input v-model="step.name" size="small" />
              </el-form-item>
              <el-form-item label="审批人">
                <el-select v-model="step.assignee" size="small" style="width: 100%">
                  <el-option label="部门经理" value="manager" />
                  <el-option label="HR" value="hr" />
                  <el-option label="管理员" value="admin" />
                </el-select>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Undo, Redo, View, Check, Upload, Plus, Delete, ArrowUp, ArrowDown, Rank, Document
} from '@element-plus/icons-vue'
import { useFormStore } from '@/stores/form'
import { componentTypes } from '@/data/componentTypes'
import { getForm, createForm, updateForm, publishForm as publishFormApi } from '@/api/form'
import DynamicFormItem from '@/components/FormComponents/DynamicFormItem.vue'

const route = useRoute()
const router = useRouter()
const formStore = useFormStore()

const isPreview = ref(false)
const saving = ref(false)
const publishing = ref(false)
const activeTab = ref('basic')
const expandedGroups = ref(['基础组件'])

const previewFormRef = ref(null)
const previewFormData = reactive({})
const previewRules = reactive({})

const isEdit = computed(() => !!route.params.id)

const canHaveValidation = computed(() => {
  const type = formStore.selectedField?.type
  return type && type !== 'divider'
})

const canHaveOptions = computed(() => {
  const type = formStore.selectedField?.type
  return ['select', 'radio', 'checkbox', 'cascade'].includes(type)
})

const otherFields = computed(() => {
  const currentId = formStore.selectedField?.id
  return formStore.currentForm.fields.filter(f => f.id !== currentId)
})

const handleDragStart = (event, item) => {
  event.dataTransfer.setData('componentType', item.type)
  event.dataTransfer.setData('componentData', JSON.stringify(item.defaultConfig))
}

const handleDragOver = (event) => {
  event.dataTransfer.dropEffect = 'copy'
}

const handleDrop = (event) => {
  const type = event.dataTransfer.getData('componentType')
  const data = event.dataTransfer.getData('componentData')
  if (type && data) {
    const config = JSON.parse(data)
    formStore.addField(config)
  }
}

const handleFieldDragStart = (event, index) => {
  event.dataTransfer.setData('fieldIndex', String(index))
}

const handleFieldDrop = (event, targetIndex) => {
  const sourceIndex = parseInt(event.dataTransfer.getData('fieldIndex'))
  if (!isNaN(sourceIndex) && sourceIndex !== targetIndex) {
    formStore.moveField(sourceIndex, targetIndex)
  }
}

const handleCanvasClick = () => {
  formStore.clearSelectedField()
}

const selectField = (field) => {
  formStore.selectField(field)
}

const moveFieldUp = (index) => {
  if (index > 0) {
    formStore.moveField(index, index - 1)
  }
}

const moveFieldDown = (index) => {
  if (index < formStore.currentForm.fields.length - 1) {
    formStore.moveField(index, index + 1)
  }
}

const removeField = (fieldId) => {
  formStore.removeField(fieldId)
}

const updateSelectedField = () => {
  if (formStore.selectedField) {
    formStore.updateField(formStore.selectedField.id, { ...formStore.selectedField })
  }
}

const addRule = () => {
  if (formStore.selectedField) {
    if (!formStore.selectedField.rules) {
      formStore.selectedField.rules = []
    }
    formStore.selectedField.rules.push({
      type: 'required',
      value: '',
      message: ''
    })
    updateSelectedField()
  }
}

const removeRule = (index) => {
  if (formStore.selectedField?.rules) {
    formStore.selectedField.rules.splice(index, 1)
    updateSelectedField()
  }
}

const addOption = () => {
  if (formStore.selectedField) {
    if (!formStore.selectedField.options) {
      formStore.selectedField.options = []
    }
    const count = formStore.selectedField.options.length + 1
    formStore.selectedField.options.push({
      label: `选项${count}`,
      value: `option${count}`
    })
    updateSelectedField()
  }
}

const removeOption = (index) => {
  if (formStore.selectedField?.options) {
    formStore.selectedField.options.splice(index, 1)
    updateSelectedField()
  }
}

const addLinkage = () => {
  if (formStore.selectedField) {
    if (!formStore.selectedField.linkage) {
      formStore.selectedField.linkage = []
    }
    formStore.selectedField.linkage.push({
      triggerField: '',
      condition: '==',
      actions: []
    })
    updateSelectedField()
  }
}

const removeLinkage = (index) => {
  if (formStore.selectedField?.linkage) {
    formStore.selectedField.linkage.splice(index, 1)
    updateSelectedField()
  }
}

const addWorkflowStep = () => {
  formStore.currentForm.workflows.push({
    name: '审批步骤',
    type: 'approve',
    fromStatus: '',
    toStatus: '',
    assignee: 'manager'
  })
}

const removeWorkflowStep = (index) => {
  formStore.currentForm.workflows.splice(index, 1)
}

const togglePreview = () => {
  isPreview.value = !isPreview.value
  if (isPreview.value) {
    initPreview()
  }
}

const initPreview = () => {
  Object.keys(previewFormData).forEach(key => {
    delete previewFormData[key]
  })
  Object.keys(previewRules).forEach(key => {
    delete previewRules[key]
  })

  formStore.currentForm.fields.forEach(field => {
    if (field.defaultValue !== undefined && field.defaultValue !== null) {
      previewFormData[field.name] = field.defaultValue
    }

    if (field.rules && field.rules.length > 0) {
      previewRules[field.name] = field.rules.map(rule => {
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

const handlePreviewChange = (field, value) => {
  console.log('Field changed:', field.name, value)
}

const validatePreview = async () => {
  if (previewFormRef.value) {
    try {
      await previewFormRef.value.validate()
      ElMessage.success('表单验证通过')
    } catch (error) {
      ElMessage.error('请检查表单填写')
    }
  }
}

const resetPreview = () => {
  initPreview()
}

const saveForm = async () => {
  if (!formStore.currentForm.name) {
    ElMessage.warning('请输入表单名称')
    return
  }

  saving.value = true
  try {
    const data = {
      ...formStore.currentForm
    }

    if (isEdit.value) {
      await updateForm(route.params.id, data)
      ElMessage.success('保存成功')
    } else {
      const result = await createForm(data)
      ElMessage.success('保存成功')
      router.push(`/forms/${result._id}/edit`)
    }
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

const saveAndPublish = async () => {
  await saveForm()
  if (isEdit.value) {
    publishing.value = true
    try {
      await publishFormApi(route.params.id)
      ElMessage.success('发布成功')
    } catch (error) {
      console.error('发布失败:', error)
    } finally {
      publishing.value = false
    }
  }
}

const loadForm = async () => {
  if (route.params.id) {
    try {
      const form = await getForm(route.params.id)
      formStore.loadForm(form)
    } catch (error) {
      console.error('加载表单失败:', error)
    }
  } else {
    formStore.resetForm()
  }
}

onMounted(() => {
  loadForm()
})
</script>

<style scoped>
.form-designer-container {
  height: calc(100vh - 160px);
}

.preview-container {
  max-width: 800px;
  margin: 0 auto;
}

.space-y-2 > div + div {
  margin-top: 8px;
}

.border-t {
  border-top: 1px solid #e5e7eb;
}
</style>
