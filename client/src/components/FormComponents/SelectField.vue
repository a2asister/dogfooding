<template>
  <el-select
    v-model="selectValue"
    :placeholder="field.placeholder"
    :disabled="disabled || field.readonly"
    :clearable="true"
    @change="handleChange"
    @blur="handleBlur"
  >
    <el-option
      v-for="option in field.options"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    />
  </el-select>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  field: {
    type: Object,
    required: true
  },
  modelValue: {
    type: [String, Number, Array],
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur'])

const selectValue = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  selectValue.value = val
})

watch(selectValue, (val) => {
  emit('update:modelValue', val)
})

const handleChange = (val) => {
  emit('change', val)
}

const handleBlur = () => {
  emit('blur', selectValue.value)
}
</script>
