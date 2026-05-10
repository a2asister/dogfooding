import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFormStore = defineStore('form', () => {
  const currentForm = ref({
    name: '新建表单',
    description: '',
    category: '通用',
    fields: [],
    layout: {
      type: 'flex',
      columns: 1,
      gutter: 16
    },
    rules: {},
    linkage: {},
    workflows: [],
    permissions: {
      createRoles: [],
      viewRoles: [],
      editRoles: [],
      deleteRoles: [],
      approveRoles: []
    },
    status: 'draft',
    version: 1,
    isTemplate: false
  })

  const selectedField = ref(null)
  const isEditMode = ref(true)
  const history = ref([])
  const historyIndex = ref(-1)

  const addField = (field, index = -1) => {
    saveHistory()
    const newField = {
      ...field,
      id: `field_${Date.now()}`,
      name: generateFieldName(field.type, field.label),
      rules: [],
      hidden: false,
      readonly: false,
      span: 24
    }

    if (index === -1) {
      currentForm.value.fields.push(newField)
    } else {
      currentForm.value.fields.splice(index, 0, newField)
    }
    selectedField.value = newField
  }

  const updateField = (fieldId, updates) => {
    saveHistory()
    const index = currentForm.value.fields.findIndex(f => f.id === fieldId)
    if (index !== -1) {
      currentForm.value.fields[index] = {
        ...currentForm.value.fields[index],
        ...updates
      }
    }
  }

  const removeField = (fieldId) => {
    saveHistory()
    const index = currentForm.value.fields.findIndex(f => f.id === fieldId)
    if (index !== -1) {
      currentForm.value.fields.splice(index, 1)
      if (selectedField.value?.id === fieldId) {
        selectedField.value = null
      }
    }
  }

  const moveField = (fromIndex, toIndex) => {
    saveHistory()
    const fields = currentForm.value.fields
    const [removed] = fields.splice(fromIndex, 1)
    fields.splice(toIndex, 0, removed)
  }

  const selectField = (field) => {
    selectedField.value = field
  }

  const clearSelectedField = () => {
    selectedField.value = null
  }

  const resetForm = () => {
    currentForm.value = {
      name: '新建表单',
      description: '',
      category: '通用',
      fields: [],
      layout: {
        type: 'flex',
        columns: 1,
        gutter: 16
      },
      rules: {},
      linkage: {},
      workflows: [],
      permissions: {
        createRoles: [],
        viewRoles: [],
        editRoles: [],
        deleteRoles: [],
        approveRoles: []
      },
      status: 'draft',
      version: 1,
      isTemplate: false
    }
    selectedField.value = null
    history.value = []
    historyIndex.value = -1
  }

  const loadForm = (formData) => {
    currentForm.value = {
      ...currentForm.value,
      ...formData
    }
    selectedField.value = null
    history.value = []
    historyIndex.value = -1
  }

  const saveHistory = () => {
    const snapshot = JSON.parse(JSON.stringify(currentForm.value))
    history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push(snapshot)
    historyIndex.value = history.value.length - 1
    if (history.value.length > 50) {
      history.value.shift()
      historyIndex.value--
    }
  }

  const undo = () => {
    if (historyIndex.value > 0) {
      historyIndex.value--
      currentForm.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    }
  }

  const redo = () => {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      currentForm.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    }
  }

  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  const updateWorkflow = (workflows) => {
    saveHistory()
    currentForm.value.workflows = workflows
  }

  const updatePermissions = (permissions) => {
    saveHistory()
    currentForm.value.permissions = {
      ...currentForm.value.permissions,
      ...permissions
    }
  }

  const addFieldRule = (fieldId, rule) => {
    saveHistory()
    const field = currentForm.value.fields.find(f => f.id === fieldId)
    if (field) {
      if (!field.rules) field.rules = []
      field.rules.push(rule)
    }
  }

  const updateFieldRule = (fieldId, ruleIndex, rule) => {
    saveHistory()
    const field = currentForm.value.fields.find(f => f.id === fieldId)
    if (field && field.rules && field.rules[ruleIndex]) {
      field.rules[ruleIndex] = rule
    }
  }

  const removeFieldRule = (fieldId, ruleIndex) => {
    saveHistory()
    const field = currentForm.value.fields.find(f => f.id === fieldId)
    if (field && field.rules) {
      field.rules.splice(ruleIndex, 1)
    }
  }

  return {
    currentForm,
    selectedField,
    isEditMode,
    history,
    historyIndex,
    canUndo,
    canRedo,
    addField,
    updateField,
    removeField,
    moveField,
    selectField,
    clearSelectedField,
    resetForm,
    loadForm,
    undo,
    redo,
    updateWorkflow,
    updatePermissions,
    addFieldRule,
    updateFieldRule,
    removeFieldRule
  }
})

function generateFieldName(type, label) {
  const base = label?.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '_') || type
  return `${base}_${Date.now().toString(36)}`
}
