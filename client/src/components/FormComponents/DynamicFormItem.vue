<template>
  <component
    :is="componentName"
    :field="field"
    v-model="modelValue"
    :disabled="disabled"
    @change="handleChange"
    @blur="handleBlur"
  />
</template>

<script setup>
import { computed } from 'vue'
import InputField from './InputField.vue'
import TextareaField from './TextareaField.vue'
import SelectField from './SelectField.vue'
import DateField from './DateField.vue'
import SubFormField from './SubFormField.vue'

const props = defineProps({
  field: {
    type: Object,
    required: true
  },
  modelValue: {
    type: [String, Number, Boolean, Array, Object],
    default: undefined
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur'])

const componentMap = {
  input: InputField,
  textarea: TextareaField,
  select: SelectField,
  date: DateField,
  subForm: SubFormField
}

const componentName = computed(() => {
  return componentMap[props.field.type] || InputField
})

const handleChange = (val) => {
  emit('change', val)
}

const handleBlur = (val) => {
  emit('blur', val)
}
</script>
