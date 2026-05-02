<script setup>
import { ref, computed, watch } from 'vue'
import JsonTreeItem from './JsonTreeItem.vue'

const viewMode = ref('tree')
const rawJsonInput = ref('')
const parsedJson = ref(null)
const error = ref('')
const collapsedPaths = ref(new Set())
const selectedPaths = ref(new Set())
const searchQuery = ref('')
const batchEditValue = ref('')
const batchEditType = ref('string')
const expandedPaths = ref(new Set())
const isUpdatingFromProgram = ref(false)

const sampleJson = `{
  "users": [
    {
      "id": 1,
      "name": "张三",
      "email": "zhangsan@example.com",
      "active": true,
      "roles": ["admin", "user"]
    },
    {
      "id": 2,
      "name": "李四",
      "email": "lisi@example.com",
      "active": false,
      "roles": ["user"]
    }
  ],
  "metadata": {
    "version": "1.0.0",
    "createdAt": "2024-01-01T00:00:00Z",
    "config": {
      "theme": "light",
      "language": "zh-CN"
    }
  }
}`

const init = () => {
  rawJsonInput.value = sampleJson
  parseJson()
}

const parseJson = (preserveSelection = false) => {
  error.value = ''
  try {
    if (rawJsonInput.value.trim() === '') {
      parsedJson.value = null
      return
    }
    parsedJson.value = JSON.parse(rawJsonInput.value)
    collapsedPaths.value = new Set()
    expandedPaths.value = new Set()
    if (!preserveSelection) {
      selectAllPaths()
    }
  } catch (e) {
    error.value = `JSON 解析错误: ${e.message}`
  }
}

const formatJson = () => {
  try {
    if (parsedJson.value) {
      rawJsonInput.value = JSON.stringify(parsedJson.value, null, 2)
    }
  } catch (e) {
    error.value = `格式化错误: ${e.message}`
  }
}

const getValueType = (value) => {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

const formatValue = (value) => {
  const type = getValueType(value)
  if (type === 'string') {
    return `"${value}"`
  }
  if (type === 'array') {
    return `Array[${value.length}]`
  }
  if (type === 'object') {
    return `Object{${Object.keys(value).length}}`
  }
  return String(value)
}

const buildPath = (parentPath, key) => {
  if (parentPath === '') {
    return key
  }
  if (typeof key === 'number') {
    return `${parentPath}[${key}]`
  }
  return `${parentPath}.${key}`
}

const toggleCollapse = (path) => {
  const newSet = new Set(collapsedPaths.value)
  if (newSet.has(path)) {
    newSet.delete(path)
  } else {
    newSet.add(path)
  }
  collapsedPaths.value = newSet
}

const expandAll = () => {
  collapsedPaths.value = new Set()
}

const collapseAll = () => {
  const allPaths = getAllPaths(parsedJson.value, '')
  const newSet = new Set()
  allPaths.forEach(path => {
    const value = getValueByPath(path)
    if (value !== null && (typeof value === 'object' || Array.isArray(value))) {
      newSet.add(path)
    }
  })
  collapsedPaths.value = newSet
}

const getAllPaths = (obj, parentPath, paths = []) => {
  if (obj === null) return paths
  
  if (Array.isArray(obj)) {
    obj.forEach((_, index) => {
      const path = buildPath(parentPath, index)
      paths.push(path)
      getAllPaths(obj[index], path, paths)
    })
  } else if (typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      const path = buildPath(parentPath, key)
      paths.push(path)
      getAllPaths(obj[key], path, paths)
    })
  }
  return paths
}

const getValueByPath = (path, obj = parsedJson.value) => {
  if (path === '') return obj
  
  const parts = path.split(/[.\[\]]+/).filter(Boolean)
  let current = obj
  
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    if (Array.isArray(current)) {
      const index = parseInt(part)
      current = current[index]
    } else if (typeof current === 'object') {
      current = current[part]
    } else {
      return undefined
    }
  }
  return current
}

const setValueByPath = (path, value, obj = parsedJson.value) => {
  if (path === '') {
    parsedJson.value = value
    return
  }
  
  const parts = path.split(/[.\[\]]+/).filter(Boolean)
  let current = obj
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (Array.isArray(current)) {
      const index = parseInt(part)
      current = current[index]
    } else if (typeof current === 'object') {
      current = current[part]
    } else {
      return
    }
  }
  
  const lastPart = parts[parts.length - 1]
  if (Array.isArray(current)) {
    const index = parseInt(lastPart)
    current[index] = value
  } else if (typeof current === 'object') {
    current[lastPart] = value
  }
}

const toggleSelectPath = (path) => {
  const newSet = new Set(selectedPaths.value)
  if (newSet.has(path)) {
    newSet.delete(path)
  } else {
    newSet.add(path)
  }
  selectedPaths.value = newSet
}

const selectAllPaths = () => {
  const allLeafPaths = []
  collectLeafPaths(parsedJson.value, '', allLeafPaths)
  selectedPaths.value = new Set(allLeafPaths)
}

const collectLeafPaths = (obj, parentPath, paths) => {
  if (obj === null) return
  
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const path = buildPath(parentPath, index)
      const type = getValueType(item)
      if (type === 'object' || type === 'array') {
        collectLeafPaths(item, path, paths)
      } else {
        paths.push(path)
      }
    })
  } else if (typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      const path = buildPath(parentPath, key)
      const value = obj[key]
      const type = getValueType(value)
      if (type === 'object' || type === 'array') {
        collectLeafPaths(value, path, paths)
      } else {
        paths.push(path)
      }
    })
  }
}

const deselectAllPaths = () => {
  selectedPaths.value = new Set()
}

const filteredLeafPaths = computed(() => {
  const paths = []
  collectLeafPaths(parsedJson.value, '', paths)
  if (!searchQuery.value) {
    return paths
  }
  return paths.filter(path => 
    path.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const parseBatchValue = () => {
  try {
    switch (batchEditType.value) {
      case 'string':
        return batchEditValue.value
      case 'number':
        return parseFloat(batchEditValue.value)
      case 'boolean':
        return batchEditValue.value === 'true'
      case 'null':
        return null
      case 'json':
        return JSON.parse(batchEditValue.value)
      default:
        return batchEditValue.value
    }
  } catch (e) {
    error.value = `批量编辑错误: ${e.message}`
    return null
  }
}

const batchEditSelected = () => {
  const value = parseBatchValue()
  if (value === null && batchEditType.value !== 'null') {
    return
  }
  
  selectedPaths.value.forEach(path => {
    setValueByPath(path, value)
  })
  isUpdatingFromProgram.value = true
  rawJsonInput.value = JSON.stringify(parsedJson.value, null, 2)
  error.value = ''
}

const tableData = computed(() => {
  const rows = []
  filteredLeafPaths.value.forEach(path => {
    const value = getValueByPath(path)
    rows.push({
      path,
      value,
      type: getValueType(value),
      formatValue: formatValue(value)
    })
  })
  return rows
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

watch(rawJsonInput, () => {
  if (isUpdatingFromProgram.value) {
    isUpdatingFromProgram.value = false
    parseJson(true)
  } else {
    parseJson(false)
  }
})

init()
</script>

<template>
  <div class="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
    <!-- 顶部工具栏 -->
    <div class="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
      <div class="flex flex-wrap items-center gap-4">
        <!-- 视图切换 -->
        <div class="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
          <button
            @click="viewMode = 'tree'"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
              viewMode === 'tree' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            ]"
          >
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              树形视图
            </span>
          </button>
          <button
            @click="viewMode = 'table'"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
              viewMode === 'table' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            ]"
          >
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              表格视图
            </span>
          </button>
        </div>
        
        <!-- 路径筛选 -->
        <div class="flex-1 min-w-64">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="输入路径进行筛选..."
              class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm"
            />
          </div>
        </div>
        
        <!-- 折叠/展开按钮 -->
        <div class="flex items-center gap-2" v-show="viewMode === 'tree'">
          <button
            @click="expandAll"
            class="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            全部展开
          </button>
          <button
            @click="collapseAll"
            class="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            全部折叠
          </button>
        </div>
      </div>
    </div>
    
    <!-- 主内容区 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
      <!-- 左侧：JSON 输入 -->
      <div class="border-r border-slate-200">
        <div class="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span class="font-medium text-slate-700 text-sm">JSON 输入</span>
          <div class="flex items-center gap-2">
            <button
              @click="formatJson"
              class="px-3 py-1 text-xs text-primary hover:bg-primary/5 rounded-md transition-colors"
            >
              格式化
            </button>
          </div>
        </div>
        <div class="p-4">
          <textarea
            v-model="rawJsonInput"
            class="w-full h-96 font-mono text-sm p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none bg-slate-50/50 transition-all"
            placeholder="在此输入或粘贴 JSON..."
            spellcheck="false"
          ></textarea>
          <div v-if="error" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
            <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ error }}</span>
          </div>
        </div>
      </div>
      
      <!-- 右侧：可视化视图 -->
      <div>
        <div class="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span class="font-medium text-slate-700 text-sm">
            {{ viewMode === 'tree' ? '树形结构' : '表格视图' }}
            <span class="text-slate-400 font-normal ml-1">({{ filteredLeafPaths.length }} 项)</span>
          </span>
          <div class="flex items-center gap-2">
            <button
              @click="selectAllPaths"
              class="px-3 py-1 text-xs text-primary hover:bg-primary/5 rounded-md transition-colors"
            >
              全选
            </button>
            <button
              @click="deselectAllPaths"
              class="px-3 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
            >
              取消全选
            </button>
          </div>
        </div>
        
        <!-- 树形视图 -->
        <div v-if="viewMode === 'tree' && parsedJson" class="h-96 overflow-auto p-4 bg-slate-50/30">
          <div class="bg-white rounded-xl border border-slate-200 p-3">
            <JsonTreeItem
              :value="parsedJson"
              key-name="root"
              path=""
              :level="0"
              :collapsed-paths="collapsedPaths"
              :selected-paths="selectedPaths"
              :search-query="searchQuery"
              @toggle-collapse="toggleCollapse"
              @toggle-select="toggleSelectPath"
            />
          </div>
        </div>
        
        <!-- 表格视图 -->
        <div v-else-if="viewMode === 'table' && parsedJson" class="h-96 overflow-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-slate-600 border-b border-slate-200 w-8">
                  <input
                    type="checkbox"
                    :checked="filteredLeafPaths.length > 0 && selectedPaths.size >= filteredLeafPaths.length"
                    @change="$event.target.checked ? selectAllPaths() : deselectAllPaths()"
                    class="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                  />
                </th>
                <th class="px-4 py-3 text-left font-medium text-slate-600 border-b border-slate-200">路径</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600 border-b border-slate-200 w-24">类型</th>
                <th class="px-4 py-3 text-left font-medium text-slate-600 border-b border-slate-200">值</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in tableData"
                :key="row.path"
                class="hover:bg-slate-50 transition-colors"
              >
                <td class="px-4 py-3 border-b border-slate-100">
                  <input
                    type="checkbox"
                    :checked="selectedPaths.has(row.path)"
                    @change="toggleSelectPath(row.path)"
                    class="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                  />
                </td>
                <td class="px-4 py-3 border-b border-slate-100 font-mono text-slate-700">
                  {{ row.path }}
                </td>
                <td class="px-4 py-3 border-b border-slate-100">
                  <span :class="[getTypeColor(row.type), 'px-2 py-0.5 rounded text-xs font-medium']">
                    {{ row.type }}
                  </span>
                </td>
                <td class="px-4 py-3 border-b border-slate-100 font-mono text-slate-600">
                  {{ row.formatValue }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else class="h-96 flex items-center justify-center text-slate-400">
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>请在左侧输入有效的 JSON</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部批量编辑区 -->
    <div class="border-t border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-slate-700">批量编辑</span>
          <span class="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
            已选 {{ selectedPaths.size }} 项
          </span>
        </div>
        
        <div class="flex items-center gap-3 flex-1">
          <select
            v-model="batchEditType"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-white"
          >
            <option value="string">字符串</option>
            <option value="number">数字</option>
            <option value="boolean">布尔值</option>
            <option value="null">null</option>
            <option value="json">JSON</option>
          </select>
          
          <input
            v-if="batchEditType !== 'null'"
            v-model="batchEditValue"
            type="text"
            placeholder="输入新值..."
            class="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
          
          <button
            @click="batchEditSelected"
            :disabled="selectedPaths.size === 0"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
              selectedPaths.size > 0
                ? 'bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            应用修改
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
