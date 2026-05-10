<template>
  <el-date-picker
    v-model="dateValue"
    type="date"
    :placeholder="field.placeholder"
    :disabled="disabled || field.readonly"
    :format="field.props?.format || 'YYYY-MM-DD'"
    :value-format="field.props?.format || 'YYYY-MM-DD'"
    @change="handleChange"
    @blur="handleBlur"
  />
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  field: {
    type: Object,
    required: true
  },
  modelValue: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur'])

const dateValue = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  dateValue.value = val
})

watch(dateValue, (val) => {
  emit('update:modelValue', val)
})

const handleChange = (val) => {
  emit('change', val)
}

const handleBlur = () => {
  emit('blur', dateValue.value)
}
</script>
