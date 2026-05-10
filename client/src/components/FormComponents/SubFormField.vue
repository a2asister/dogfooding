<template>
  <div class="sub-form-container">
    <div class="flex justify-between items-center mb-4">
      <span class="font-medium">{{ field.label }}</span>
      <el-button
        type="primary"
        size="small"
        :icon="Plus"
        @click="addRow"
        :disabled="disabled || isMaxRows"
      >
        添加
      </el-button>
    </div>

    <div v-for="(row, rowIndex) in rows" :key="rowIndex" class="sub-form-row">
      <div class="flex-1">
        <el-form-item
          v-for="subField in field.subForm?.fields || []"
          :key="subField.id"
          :label="subField.label"
          :required="subField.required"
          :prop="`${rowIndex}.${subField.name}`"
        >
          <DynamicFormItem
            :field="subField"
            v-model="rows[rowIndex][subField.name]"
            :disabled="disabled"
          />
        </el-form-item>
      </div>
      <div class="sub-form-row-actions">
        <el-button
          v-if="canDeleteRow(rowIndex)"
          type="danger"
          size="small"
          :icon="Delete"
          @click="removeRow(rowIndex)"
          :disabled="disabled"
          circle
        />
      </div>
    </div>

    <div v-if="rows.length === 0" class="text-center py-8 text-gray-400">
      暂无数据，点击上方"添加"按钮添加记录
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import DynamicFormItem from './DynamicFormItem.vue'

const props = defineProps({
  field: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const rows = ref([])

const isMaxRows = computed(() => {
  const maxRows = props.field.subForm?.maxRows || 10
  return rows.value.length >= maxRows
})

const minRows = computed(() => props.field.subForm?.minRows || 0)

watch(() => props.modelValue, (val) => {
  rows.value = val ? JSON.parse(JSON.stringify(val)) : []
}, { immediate: true })

watch(rows, (val) => {
  emit('update:modelValue', val)
  emit('change', val)
}, { deep: true })

const addRow = () => {
  const newRow = {}
  if (props.field.subForm?.fields) {
    props.field.subForm.fields.forEach(f => {
      newRow[f.name] = f.defaultValue
    })
  }
  rows.value.push(newRow)
}

const removeRow = (index) => {
  rows.value.splice(index, 1)
}

const canDeleteRow = (index) => {
  return rows.value.length > minRows.value
}
</script>
