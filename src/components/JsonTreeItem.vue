<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    required: true
  },
  keyName: {
    type: String,
    default: ''
  },
  path: {
    type: String,
    default: ''
  },
  level: {
    type: Number,
    default: 0
  },
  collapsedPaths: {
    type: Set,
    default: () => new Set()
  },
  selectedPaths: {
    type: Set,
    default: () => new Set()
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['toggle-collapse', 'toggle-select'])

const valueType = computed(() => {
  if (props.value === null) return 'null'
  if (Array.isArray(props.value)) return 'array'
  return typeof props.value
})

const isContainer = computed(() => {
  return valueType.value === 'object' || valueType.value === 'array'
})

const isCollapsed = computed(() => {
  return props.collapsedPaths.has(props.path)
})

const isSelected = computed(() => {
  return props.selectedPaths.has(props.path)
})

const isFiltered = computed(() => {
  if (!props.searchQuery) return false
  return !props.path.toLowerCase().includes(props.searchQuery.toLowerCase())
})

const shouldShow = computed(() => {
  if (isContainer.value) return true
  return !isFiltered.value
})

const formatedValue = computed(() => {
  const type = valueType.value
  if (type === 'string') {
    return `"${props.value}"`
  }
  if (type === 'array') {
    return `Array[${props.value.length}]`
  }
  if (type === 'object') {
    return `Object{${Object.keys(props.value).length}}`
  }
  return String(props.value)
})

const entries = computed(() => {
  if (valueType.value === 'array') {
    return props.value.map((item, index) => ({
      key: `[${index}]`,
      value: item,
      path: `${props.path}[${index}]`
    }))
  }
  if (valueType.value === 'object' && props.value !== null) {
    return Object.keys(props.value).map(key => ({
      key,
      value: props.value[key],
      path: props.path ? `${props.path}.${key}` : key
    }))
  }
  return []
})

const getTypeColor = (type) => {
  const colors = {
    string: 'text-green-600 bg-green-50',
    number: 'text-blue-600 bg-blue-50',
    boolean: 'text-orange-600 bg-orange-50',
    null: 'text-gray-600 bg-gray-50',
    object: 'text-purple-600 bg-purple-50',
    array: 'text-cyan-600 bg-cyan-50'
  }
  return colors[type] || 'text-gray-600 bg-gray-50'
}

const handleToggleCollapse = (e) => {
  e.stopPropagation()
  emit('toggle-collapse', props.path)
}

const handleToggleSelect = (e) => {
  if (e) e.stopPropagation()
  emit('toggle-select', props.path)
}
</script>

<template>
  <div v-if="shouldShow" :style="{ paddingLeft: `${level * 24}px` }">
    <div 
      class="flex items-center gap-2 py-1 px-2 hover:bg-slate-50 rounded group transition-colors duration-150"
      @click="!isContainer && handleToggleSelect()"
    >
      <button
        v-if="isContainer"
        @click="handleToggleCollapse"
        class="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-all"
      >
        <svg 
          :class="['w-3 h-3 transition-transform duration-200', isCollapsed ? '' : 'rotate-90']" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <span v-else class="w-5"></span>
      
      <input
        v-if="!isContainer"
        type="checkbox"
        :checked="isSelected"
        @change="handleToggleSelect"
        @click.stop
        class="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
      />
      <span v-else class="w-4"></span>
      
      <span class="font-medium text-slate-700">{{ keyName }}</span>
      <span class="text-slate-400">:</span>
      <span :class="['font-mono', getTypeColor(valueType), 'px-2 py-0.5 rounded text-sm']">
        {{ formatedValue }}
      </span>
      <span class="text-xs text-slate-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {{ path }}
      </span>
    </div>
    
    <div v-if="isContainer && !isCollapsed" class="border-l border-slate-200 ml-4">
      <JsonTreeItem
        v-for="entry in entries"
        :key="entry.path"
        :value="entry.value"
        :key-name="entry.key"
        :path="entry.path"
        :level="level + 1"
        :collapsed-paths="collapsedPaths"
        :selected-paths="selectedPaths"
        :search-query="searchQuery"
        @toggle-collapse="(p) => emit('toggle-collapse', p)"
        @toggle-select="(p) => emit('toggle-select', p)"
      />
    </div>
  </div>
</template>
