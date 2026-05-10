<template>
  <el-input
    v-model="inputValue"
    :placeholder="field.placeholder"
    :disabled="disabled || field.readonly"
    :clearable="true"
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
    type: [String, Number],
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur'])

const inputValue = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  inputValue.value = val
})

watch(inputValue, (val) => {
  emit('update:modelValue', val)
})

const handleChange = (val) => {
  emit('change', val)
}

const handleBlur = () => {
  emit('blur', inputValue.value)
}
</script>
