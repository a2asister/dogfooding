<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { babyService } from '@/services/babyService'
import { recordService } from '@/services/recordService'
import type { BabyProfile, Reminder } from '@/types'

const currentBaby = ref<BabyProfile | undefined>()
const babies = ref<BabyProfile[]>([])
const selectedBabyId = ref<string>('')
const records = ref<Reminder[]>([])
const showAddForm = ref(false)
const showDetailModal = ref(false)
const editingRecord = ref<Reminder | null>(null)
const selectedRecord = ref<Reminder | null>(null)
const activeTab = ref<'list' | 'calendar'>('list')
const filterType = ref<string>('all')
const filterStatus = ref<string>('all')
const selectedCalendarDate = ref<string>(new Date().toISOString().split('T')[0])

const formData = ref({
  title: '',
  description: '',
  type: 'custom' as const,
  scheduledTime: '',
  repeatInterval: 'once' as const,
  isEnabled: true,
  notes: ''
})

const quickTemplates = ref([
  { id: '1', title: '接种乙肝疫苗第三针', type: 'vaccine' as const, daysOffset: 0, description: '带齐疫苗本和体检手册，接种后留观30分钟' },
  { id: '2', title: '体检 - 6月龄', type: 'checkup' as const, daysOffset: 0, description: '测量身高体重、头围，检查发育情况' },
  { id: '3', title: '每天补充维生素D', type: 'medication' as const, daysOffset: 0, description: '每天早上一粒，饭后服用' },
  { id: '4', title: '准备辅食添加', type: 'feeding' as const, daysOffset: 0, description: '准备高铁米粉、细腻果泥、菜泥' },
  { id: '5', title: '购买纸尿裤', type: 'custom' as const, daysOffset: 2, description: '当前尺码快用完了，及时补货' },
  { id: '6', title: '预约儿科医生', type: 'checkup' as const, daysOffset: 7, description: '常规健康检查，准备好问题清单' },
])

const loadData = () => {
  babies.value = babyService.getAllBabies()
  currentBaby.value = babyService.getDefaultBaby()
  
  if (currentBaby.value) {
    selectedBabyId.value = currentBaby.value.id
  }

  if (selectedBabyId.value) {
    records.value = recordService.getReminders(selectedBabyId.value)
  }
}

const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    type: 'custom',
    scheduledTime: '',
    repeatInterval: 'once',
    isEnabled: true,
    notes: ''
  }
  editingRecord.value = null
  showAddForm.value = false
}

const openAddForm = (template?: typeof quickTemplates.value[0]) => {
  resetForm()
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getMinutes() % 15 + 15)
  
  if (template) {
    formData.value.type = template.type
    formData.value.title = template.title
    formData.value.description = template.description
    const reminderTime = new Date()
    reminderTime.setDate(reminderTime.getDate() + template.daysOffset)
    reminderTime.setHours(10, 0, 0, 0)
    formData.value.scheduledTime = reminderTime.toISOString().slice(0, 16)
  } else {
    formData.value.scheduledTime = now.toISOString().slice(0, 16)
  }
  showAddForm.value = true
}

const openEditForm = (record: Reminder) => {
  editingRecord.value = record
  formData.value = {
    title: record.title,
    description: record.description || '',
    type: record.type,
    scheduledTime: record.scheduledTime.slice(0, 16),
    repeatInterval: record.repeatInterval || 'once',
    isEnabled: record.isEnabled,
    notes: record.notes || ''
  }
  showAddForm.value = true
}

const openDetailModal = (record: Reminder) => {
  selectedRecord.value = record
  showDetailModal.value = true
}

const saveRecord = () => {
  if (!selectedBabyId.value) {
    alert('请先选择宝宝')
    return
  }

  if (!formData.value.title.trim() || !formData.value.scheduledTime) {
    alert('请填写提醒标题和时间')
    return
  }

  const recordData = {
    babyId: selectedBabyId.value,
    title: formData.value.title.trim(),
    description: formData.value.description.trim() || undefined,
    type: formData.value.type,
    scheduledTime: formData.value.scheduledTime,
    repeatInterval: formData.value.repeatInterval,
    isEnabled: formData.value.isEnabled,
    isCompleted: editingRecord.value?.isCompleted || false,
    notes: formData.value.notes.trim() || undefined
  }

  if (editingRecord.value) {
    recordService.updateReminder(editingRecord.value.id, recordData as any)
  } else {
    recordService.createReminder(recordData as any)
  }

  loadData()
  resetForm()
}

const deleteRecord = (record: Reminder) => {
  if (confirm('确定要删除这条提醒吗？')) {
    recordService.deleteReminder(record.id)
    if (selectedRecord.value?.id === record.id) {
      showDetailModal.value = false
      selectedRecord.value = null
    }
    loadData()
  }
}

const toggleComplete = (record: Reminder) => {
  recordService.updateReminder(record.id, {
    isCompleted: !record.isCompleted,
    completedAt: !record.isCompleted ? new Date().toISOString() : undefined
  })
  loadData()
}

const toggleEnabled = (record: Reminder) => {
  recordService.updateReminder(record.id, {
    isEnabled: !record.isEnabled
  })
  loadData()
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'vaccine': return '💉'
    case 'checkup': return '🏥'
    case 'feeding': return '🍼'
    case 'medication': return '💊'
    default: return '📋'
  }
}

const getTypeText = (type: string) => {
  switch (type) {
    case 'vaccine': return '疫苗'
    case 'checkup': return '体检'
    case 'feeding': return '喂养'
    case 'medication': return '用药'
    default: return '其他'
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'vaccine': return 'bg-purple-100 text-purple-700'
    case 'checkup': return 'bg-blue-100 text-blue-700'
    case 'feeding': return 'bg-orange-100 text-orange-700'
    case 'medication': return 'bg-green-100 text-green-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const getRepeatText = (interval: string) => {
  switch (interval) {
    case 'daily': return '每天'
    case 'weekly': return '每周'
    case 'monthly': return '每月'
    default: return '仅一次'
  }
}

const filteredRecords = computed(() => {
  return records.value.filter(r => {
    const typeMatch = filterType.value === 'all' || r.type === filterType.value
    const statusMatch = 
      filterStatus.value === 'all' ||
      (filterStatus.value === 'pending' && !r.isCompleted && r.isEnabled) ||
      (filterStatus.value === 'completed' && r.isCompleted) ||
      (filterStatus.value === 'disabled' && !r.isEnabled)
    return typeMatch && statusMatch
  })
})

const pendingRecords = computed(() => {
  return filteredRecords.value
    .filter(r => r.isEnabled && !r.isCompleted)
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
})

const completedRecords = computed(() => {
  return filteredRecords.value
    .filter(r => r.isCompleted)
    .sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime())
})

const todayRecords = computed(() => {
  const today = new Date().toDateString()
  return pendingRecords.value.filter((r: Reminder) => {
    const reminderDate = new Date(r.scheduledTime).toDateString()
    return today === reminderDate
  })
})

const upcomingRecords = computed(() => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)
  
  return pendingRecords.value.filter((r: Reminder) => {
    const reminderDate = new Date(r.scheduledTime)
    return reminderDate >= tomorrow && reminderDate <= nextWeek
  })
})

const calendarDays = computed(() => {
  const date = new Date(selectedCalendarDate.value)
  const year = date.getFullYear()
  const month = date.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()
  
  const days: Array<{
    date: string
    day: number
    isToday: boolean
    isCurrentMonth: boolean
    records: Reminder[]
  }> = []
  
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const dayDate = new Date(year, month - 1, day)
    const dateStr = dayDate.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      day,
      isToday: false,
      isCurrentMonth: false,
      records: getRecordsForDate(dateStr)
    })
  }
  
  const today = new Date().toDateString()
  for (let i = 1; i <= daysInMonth; i++) {
    const dayDate = new Date(year, month, i)
    const dateStr = dayDate.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      day: i,
      isToday: dayDate.toDateString() === today,
      isCurrentMonth: true,
      records: getRecordsForDate(dateStr)
    })
  }
  
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const dayDate = new Date(year, month + 1, i)
    const dateStr = dayDate.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      day: i,
      isToday: false,
      isCurrentMonth: false,
      records: getRecordsForDate(dateStr)
    })
  }
  
  return days
})

const getRecordsForDate = (dateStr: string) => {
  return records.value.filter(r => {
    const reminderDate = new Date(r.scheduledTime).toISOString().split('T')[0]
    return reminderDate === dateStr
  })
}

const changeMonth = (direction: number) => {
  const current = new Date(selectedCalendarDate.value)
  current.setMonth(current.getMonth() + direction)
  selectedCalendarDate.value = current.toISOString().split('T')[0]
}

watch(
  () => selectedBabyId.value,
  () => {
    loadData()
  }
)

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-primary">育儿提醒</h1>
        <p class="text-secondary mt-1">管理宝宝的疫苗、体检、喂养等提醒</p>
      </div>
      <div class="flex items-center gap-3">
        <select
          v-if="babies.length > 1"
          v-model="selectedBabyId"
          @change="loadData"
          class="px-4 py-2 rounded-xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
        >
          <option v-for="baby in babies" :key="baby.id" :value="baby.id">
            {{ baby.name }}
          </option>
        </select>
        <button
          @click="openAddForm()"
          class="flex items-center gap-2 px-6 py-3 bg-accent-soft text-white rounded-2xl hover:opacity-90 transition-all shadow-soft"
        >
          <span class="text-xl">➕</span>
          <span class="font-medium">添加提醒</span>
        </button>
      </div>
    </div>

    <div
      v-if="babies.length === 0"
      class="text-center py-16"
    >
      <div class="text-6xl mb-4">👶</div>
      <h3 class="text-lg font-medium text-primary mb-2">还没有添加宝宝</h3>
      <p class="text-secondary mb-6">请先添加宝宝信息</p>
      <button
        @click="$router.push('/babies?action=add')"
        class="inline-flex items-center gap-2 px-6 py-3 bg-accent-soft text-white rounded-2xl hover:opacity-90 transition-all shadow-soft"
      >
        <span class="text-xl">➕</span>
        <span class="font-medium">添加宝宝</span>
      </button>
    </div>

    <div v-else class="space-y-6">
      <div class="grid gap-4 md:grid-cols-4">
        <div class="bg-white rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">📋</span>
            <span class="text-sm text-secondary">总提醒</span>
          </div>
          <p class="text-2xl font-bold text-primary">{{ records.length }}</p>
          <p class="text-sm text-secondary mt-1">条提醒</p>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">⏳</span>
            <span class="text-sm text-secondary">待完成</span>
          </div>
          <p class="text-2xl font-bold text-blue-600">{{ pendingRecords.length }}</p>
          <p class="text-sm text-secondary mt-1">条提醒</p>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">✅</span>
            <span class="text-sm text-secondary">已完成</span>
          </div>
          <p class="text-2xl font-bold text-green-600">{{ completedRecords.length }}</p>
          <p class="text-sm text-secondary mt-1">条提醒</p>
        </div>
        <div class="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">🔔</span>
            <span class="text-sm text-yellow-700">今日提醒</span>
          </div>
          <p class="text-2xl font-bold text-yellow-800">{{ todayRecords.length }}</p>
          <p class="text-sm text-yellow-700 mt-1">条待处理</p>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-soft p-6">
        <h3 class="text-lg font-bold text-primary mb-4 flex items-center gap-2">
          <span>⚡</span>
          <span>快速添加</span>
        </h3>
        <div class="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          <button
            v-for="template in quickTemplates"
            :key="template.id"
            @click="openAddForm(template)"
            class="p-4 rounded-2xl border-2 border-border-light hover:border-accent-soft/50 hover:bg-accent-soft/5 transition-all text-left group"
          >
            <div class="text-2xl mb-2">{{ getTypeIcon(template.type) }}</div>
            <p class="text-sm font-medium text-primary line-clamp-2">{{ template.title }}</p>
            <p class="text-xs text-secondary mt-1">{{ getTypeText(template.type) }}</p>
          </button>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-soft overflow-hidden">
        <div class="flex border-b border-border-light">
          <button
            @click="activeTab = 'list'"
            :class="[
              'px-6 py-4 text-sm font-medium transition-colors',
              activeTab === 'list' 
                ? 'text-accent-soft border-b-2 border-accent-soft' 
                : 'text-secondary hover:text-primary'
            ]"
          >
            <span class="flex items-center gap-2">
              <span>📋</span>
              <span>列表视图</span>
            </span>
          </button>
          <button
            @click="activeTab = 'calendar'"
            :class="[
              'px-6 py-4 text-sm font-medium transition-colors',
              activeTab === 'calendar' 
                ? 'text-accent-soft border-b-2 border-accent-soft' 
                : 'text-secondary hover:text-primary'
            ]"
          >
            <span class="flex items-center gap-2">
              <span>📅</span>
              <span>日历视图</span>
            </span>
          </button>
        </div>

        <div class="p-6">
          <div class="flex flex-wrap gap-3 mb-6">
            <div class="flex items-center gap-2">
              <span class="text-sm text-secondary">类型：</span>
              <select
                v-model="filterType"
                class="px-3 py-2 rounded-xl border border-border-light text-sm focus:border-accent-soft focus:outline-none"
              >
                <option value="all">全部类型</option>
                <option value="vaccine">💉 疫苗</option>
                <option value="checkup">🏥 体检</option>
                <option value="feeding">🍼 喂养</option>
                <option value="medication">💊 用药</option>
                <option value="custom">📋 其他</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-secondary">状态：</span>
              <select
                v-model="filterStatus"
                class="px-3 py-2 rounded-xl border border-border-light text-sm focus:border-accent-soft focus:outline-none"
              >
                <option value="all">全部状态</option>
                <option value="pending">⏳ 待完成</option>
                <option value="completed">✅ 已完成</option>
                <option value="disabled">🔕 已禁用</option>
              </select>
            </div>
          </div>

          <div v-if="activeTab === 'list'" class="space-y-6">
            <div v-if="todayRecords.length > 0" class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-5 border border-yellow-200">
              <h4 class="font-medium text-yellow-800 mb-3 flex items-center gap-2">
                <span>🔔</span>
                <span>今日提醒</span>
                <span class="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full">{{ todayRecords.length }}</span>
              </h4>
              <div class="space-y-3">
                <div
                  v-for="record in todayRecords"
                  :key="record.id"
                  @click="openDetailModal(record)"
                  class="flex items-center gap-4 p-3 bg-white rounded-xl hover:shadow-md transition-all cursor-pointer"
                >
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" :class="getTypeColor(record.type)">
                    {{ getTypeIcon(record.type) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-primary">{{ record.title }}</p>
                    <p class="text-sm text-secondary">
                      {{ new Date(record.scheduledTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      @click.stop="toggleComplete(record)"
                      class="w-8 h-8 rounded-full border-2 border-accent-soft flex items-center justify-center hover:bg-accent-soft/10 transition-colors"
                    >
                      <span class="text-accent-soft opacity-0 hover:opacity-100 transition-opacity">✓</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="upcomingRecords.length > 0" class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200">
              <h4 class="font-medium text-blue-800 mb-3 flex items-center gap-2">
                <span>📅</span>
                <span>近期提醒</span>
                <span class="px-2 py-0.5 bg-blue-200 text-blue-800 text-xs rounded-full">{{ upcomingRecords.length }}</span>
              </h4>
              <div class="space-y-3">
                <div
                  v-for="record in upcomingRecords"
                  :key="record.id"
                  @click="openDetailModal(record)"
                  class="flex items-center gap-4 p-3 bg-white rounded-xl hover:shadow-md transition-all cursor-pointer"
                >
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" :class="getTypeColor(record.type)">
                    {{ getTypeIcon(record.type) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-primary">{{ record.title }}</p>
                    <p class="text-sm text-secondary">
                      {{ new Date(record.scheduledTime).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' }) }}
                      {{ new Date(record.scheduledTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      @click.stop="toggleComplete(record)"
                      class="w-8 h-8 rounded-full border-2 border-accent-soft flex items-center justify-center hover:bg-accent-soft/10 transition-colors"
                    >
                      <span class="text-accent-soft opacity-0 hover:opacity-100 transition-opacity">✓</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="pendingRecords.length > 0" class="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div class="p-5 border-b border-border-light flex items-center gap-2">
                <span class="text-2xl">⏳</span>
                <h3 class="text-lg font-bold text-primary">待完成提醒</h3>
                <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{{ pendingRecords.length }}</span>
              </div>
              <div class="divide-y divide-border-light">
                <div
                  v-for="record in pendingRecords"
                  :key="record.id"
                  @click="openDetailModal(record)"
                  class="p-5 hover:bg-bg-hover transition-colors cursor-pointer"
                >
                  <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                      <button
                        @click.stop="toggleComplete(record)"
                        class="w-8 h-8 rounded-full border-2 border-accent-soft flex items-center justify-center hover:bg-accent-soft/10 transition-colors flex-shrink-0"
                      >
                        <span class="text-accent-soft opacity-0 hover:opacity-100 transition-opacity">✓</span>
                      </button>
                      <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" :class="getTypeColor(record.type)">
                        {{ getTypeIcon(record.type) }}
                      </div>
                      <div class="min-w-0">
                        <p class="font-medium text-primary">{{ record.title }}</p>
                        <p class="text-sm text-secondary flex items-center gap-2 flex-wrap">
                          <span class="inline-flex items-center gap-1">
                            {{ getTypeIcon(record.type) }}
                            {{ getTypeText(record.type) }}
                          </span>
                          <span>·</span>
                          <span>
                            {{ new Date(record.scheduledTime).toLocaleDateString('zh-CN') }}
                            {{ new Date(record.scheduledTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}
                          </span>
                          <span v-if="record.repeatInterval !== 'once'">
                            · {{ getRepeatText(record.repeatInterval) }}
                          </span>
                        </p>
                        <p v-if="record.description" class="text-sm text-secondary mt-1 line-clamp-1">
                          {{ record.description }}
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center gap-3 flex-shrink-0">
                      <button
                        @click.stop="toggleEnabled(record)"
                        :class="[
                          'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                          record.isEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                        ]"
                      >
                        {{ record.isEnabled ? '已启用' : '已禁用' }}
                      </button>
                      <div class="flex gap-1">
                        <button
                          @click.stop="openEditForm(record)"
                          class="p-2 rounded-xl hover:bg-bg-hover text-secondary hover:text-primary transition-colors"
                        >
                          <span class="text-lg">✏️</span>
                        </button>
                        <button
                          @click.stop="deleteRecord(record)"
                          class="p-2 rounded-xl hover:bg-red-50 text-secondary hover:text-red-500 transition-colors"
                        >
                          <span class="text-lg">🗑️</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="completedRecords.length > 0" class="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div class="p-5 border-b border-border-light flex items-center gap-2">
                <span class="text-2xl">✅</span>
                <h3 class="text-lg font-bold text-primary">已完成提醒</h3>
                <span class="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">{{ completedRecords.length }}</span>
              </div>
              <div class="divide-y divide-border-light">
                <div
                  v-for="record in completedRecords"
                  :key="record.id"
                  class="p-5 hover:bg-bg-hover transition-colors opacity-70"
                >
                  <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                      <button
                        @click.stop="toggleComplete(record)"
                        class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
                      >
                        <span class="text-white">✓</span>
                      </button>
                      <div class="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-2xl flex-shrink-0">
                        {{ getTypeIcon(record.type) }}
                      </div>
                      <div class="min-w-0">
                        <p class="font-medium text-primary line-through">{{ record.title }}</p>
                        <p class="text-sm text-secondary">
                          {{ getTypeText(record.type) }} · 
                          {{ new Date(record.scheduledTime).toLocaleString('zh-CN') }}
                        </p>
                        <p v-if="record.completedAt" class="text-xs text-green-600 mt-1">
                          完成于：{{ new Date(record.completedAt).toLocaleString('zh-CN') }}
                        </p>
                      </div>
                    </div>

                    <div class="flex gap-1 flex-shrink-0">
                      <button
                        @click.stop="deleteRecord(record)"
                        class="p-2 rounded-xl hover:bg-red-50 text-secondary hover:text-red-500 transition-colors"
                      >
                        <span class="text-lg">🗑️</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="filteredRecords.length === 0"
              class="text-center py-16 bg-white rounded-2xl shadow-soft"
            >
              <div class="text-6xl mb-4">🔔</div>
              <h3 class="text-lg font-medium text-primary mb-2">暂无提醒</h3>
              <p class="text-secondary mb-6">点击上方按钮添加第一条提醒</p>
              <button
                @click="openAddForm()"
                class="inline-flex items-center gap-2 px-6 py-3 bg-accent-soft text-white rounded-2xl hover:opacity-90 transition-all shadow-soft"
              >
                <span class="text-xl">➕</span>
                <span class="font-medium">添加第一条提醒</span>
              </button>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="flex items-center justify-between">
              <button
                @click="changeMonth(-1)"
                class="p-2 rounded-xl hover:bg-bg-hover transition-colors"
              >
                <span class="text-xl">◀</span>
              </button>
              <h3 class="text-lg font-bold text-primary">
                {{ new Date(selectedCalendarDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }) }}
              </h3>
              <button
                @click="changeMonth(1)"
                class="p-2 rounded-xl hover:bg-bg-hover transition-colors"
              >
                <span class="text-xl">▶</span>
              </button>
            </div>

            <div class="grid grid-cols-7 gap-1 mb-2">
              <div v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day" 
                class="text-center text-sm font-medium text-secondary py-2">
                {{ day }}
              </div>
            </div>

            <div class="grid grid-cols-7 gap-1">
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                @click="selectedCalendarDate = day.date"
                :class="[
                  'min-h-20 p-2 rounded-xl transition-all cursor-pointer border-2',
                  day.isCurrentMonth ? 'bg-white' : 'bg-bg-hover',
                  day.isToday ? 'border-accent-soft bg-accent-soft/5' : 'border-transparent',
                  selectedCalendarDate === day.date ? 'border-accent-soft ring-2 ring-accent-soft/30' : '',
                  'hover:border-accent-soft/30'
                ]"
              >
                <div class="flex items-center justify-between mb-1">
                  <span :class="[
                    'text-sm font-medium',
                    day.isCurrentMonth ? 'text-primary' : 'text-secondary/50',
                    day.isToday ? 'text-accent-soft' : ''
                  ]">
                    {{ day.day }}
                  </span>
                </div>
                <div class="space-y-1" v-if="day.records.length > 0">
                  <div
                    v-for="record in day.records.slice(0, 2)"
                    :key="record.id"
                    @click.stop="openDetailModal(record)"
                    :class="[
                      'text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80',
                      getTypeColor(record.type)
                    ]"
                  >
                    <span class="mr-1">{{ getTypeIcon(record.type) }}</span>
                    {{ record.title }}
                  </div>
                  <div v-if="day.records.length > 2" class="text-xs text-secondary text-center">
                    +{{ day.records.length - 2 }} 更多
                  </div>
                </div>
              </div>
            </div>

            <div v-if="getRecordsForDate(selectedCalendarDate).length > 0" class="bg-bg-hover rounded-2xl p-5">
              <h4 class="font-medium text-primary mb-3">
                {{ new Date(selectedCalendarDate).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }) }} 的提醒
              </h4>
              <div class="space-y-2">
                <div
                  v-for="record in getRecordsForDate(selectedCalendarDate)"
                  :key="record.id"
                  @click="openDetailModal(record)"
                  class="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-all cursor-pointer"
                >
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" :class="getTypeColor(record.type)">
                    {{ getTypeIcon(record.type) }}
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-primary" :class="{ 'line-through': record.isCompleted }">{{ record.title }}</p>
                    <p class="text-sm text-secondary">
                      {{ new Date(record.scheduledTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}
                      · {{ getTypeText(record.type) }}
                      <span v-if="record.isCompleted" class="ml-2 text-green-600">已完成</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Transition name="scale">
      <div
        v-if="showAddForm"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/30"
          @click="resetForm"
        ></div>
        <div class="relative w-full max-w-lg bg-white rounded-3xl shadow-floating overflow-hidden max-h-[90vh] flex flex-col">
          <div class="p-6 border-b border-border-light flex-shrink-0">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-primary">
                {{ editingRecord ? '编辑提醒' : '添加提醒' }}
              </h2>
              <button
                @click="resetForm"
                class="p-2 hover:bg-bg-hover rounded-xl transition-colors"
              >
                <span class="text-xl">✕</span>
              </button>
            </div>
          </div>

          <div class="p-6 overflow-y-auto flex-1">
            <div class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-secondary mb-2">
                  提醒类型
                </label>
                <div class="flex gap-2 flex-wrap">
                  <button
                    v-for="type in [
                      { value: 'vaccine', label: '疫苗', icon: '💉' },
                      { value: 'checkup', label: '体检', icon: '🏥' },
                      { value: 'feeding', label: '喂养', icon: '🍼' },
                      { value: 'medication', label: '用药', icon: '💊' },
                      { value: 'custom', label: '其他', icon: '📋' }
                    ]"
                    :key="type.value"
                    @click="formData.type = type.value as any"
                    class="flex items-center gap-1 py-2 px-3 rounded-xl border-2 transition-all"
                    :class="{
                      'border-accent-soft bg-accent-soft/10': formData.type === type.value,
                      'border-border-light hover:border-accent-soft/30': formData.type !== type.value
                    }"
                  >
                    <span class="text-lg">{{ type.icon }}</span>
                    <span class="text-sm">{{ type.label }}</span>
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary mb-2">
                  提醒标题 <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="formData.title"
                  type="text"
                  placeholder="如：接种乙肝疫苗第三针"
                  class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary mb-2">
                  描述
                </label>
                <textarea
                  v-model="formData.description"
                  placeholder="添加详细描述..."
                  rows="2"
                  class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors resize-none"
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    提醒时间 <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="formData.scheduledTime"
                    type="datetime-local"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    重复频率
                  </label>
                  <select
                    v-model="formData.repeatInterval"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                  >
                    <option value="once">仅一次</option>
                    <option value="daily">每天</option>
                    <option value="weekly">每周</option>
                    <option value="monthly">每月</option>
                  </select>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <input
                  v-model="formData.isEnabled"
                  type="checkbox"
                  id="reminderEnabled"
                  class="w-5 h-5 rounded text-accent-soft"
                />
                <label for="reminderEnabled" class="text-sm text-secondary">
                  启用提醒
                </label>
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary mb-2">
                  备注
                </label>
                <textarea
                  v-model="formData.notes"
                  placeholder="添加一些备注信息..."
                  rows="2"
                  class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="p-6 border-t border-border-light flex gap-3 flex-shrink-0">
            <button
              @click="resetForm"
              class="flex-1 py-3 px-4 rounded-2xl border border-border-light text-secondary hover:bg-bg-hover transition-colors"
            >
              取消
            </button>
            <button
              @click="saveRecord"
              class="flex-1 py-3 px-4 rounded-2xl bg-accent-soft text-white hover:opacity-90 transition-all shadow-soft"
            >
              {{ editingRecord ? '保存修改' : '添加提醒' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="scale">
      <div
        v-if="showDetailModal && selectedRecord"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/30"
          @click="showDetailModal = false"
        ></div>
        <div class="relative w-full max-w-md bg-white rounded-3xl shadow-floating overflow-hidden">
          <div class="p-6 border-b border-border-light">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <div 
                  class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  :class="getTypeColor(selectedRecord.type)"
                >
                  {{ getTypeIcon(selectedRecord.type) }}
                </div>
                <div>
                  <h2 class="text-xl font-bold text-primary">{{ selectedRecord.title }}</h2>
                  <p class="text-secondary text-sm flex items-center gap-1">
                    <span>{{ getTypeIcon(selectedRecord.type) }}</span>
                    <span>{{ getTypeText(selectedRecord.type) }}</span>
                  </p>
                </div>
              </div>
              <button
                @click="showDetailModal = false"
                class="p-2 hover:bg-bg-hover rounded-xl transition-colors"
              >
                <span class="text-xl">✕</span>
              </button>
            </div>
          </div>

          <div class="p-6 space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-secondary">状态</span>
              <span 
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  selectedRecord.isCompleted 
                    ? 'bg-green-100 text-green-700' 
                    : selectedRecord.isEnabled 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-500'
                ]"
              >
                {{ selectedRecord.isCompleted ? '已完成' : selectedRecord.isEnabled ? '待完成' : '已禁用' }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-secondary">提醒时间</span>
              <span class="font-medium text-primary">
                {{ new Date(selectedRecord.scheduledTime).toLocaleDateString('zh-CN') }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-secondary">具体时间</span>
              <span class="font-medium text-primary">
                {{ new Date(selectedRecord.scheduledTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-secondary">重复频率</span>
              <span class="font-medium text-primary">
                {{ getRepeatText(selectedRecord.repeatInterval || 'once') }}
              </span>
            </div>

            <div v-if="selectedRecord.description" class="pt-4 border-t border-border-light">
              <p class="text-secondary text-sm mb-2">描述</p>
              <p class="text-primary">{{ selectedRecord.description }}</p>
            </div>

            <div v-if="selectedRecord.notes" class="pt-4 border-t border-border-light">
              <p class="text-secondary text-sm mb-2">备注</p>
              <p class="text-primary">{{ selectedRecord.notes }}</p>
            </div>

            <div v-if="selectedRecord.completedAt" class="pt-4 border-t border-border-light">
              <p class="text-green-600 text-sm flex items-center gap-1">
                <span>✅</span>
                <span>完成于：{{ new Date(selectedRecord.completedAt).toLocaleString('zh-CN') }}</span>
              </p>
            </div>
          </div>

          <div class="p-6 border-t border-border-light flex gap-3">
            <button
              @click="openEditForm(selectedRecord); showDetailModal = false"
              class="flex-1 py-3 px-4 rounded-2xl border border-border-light text-secondary hover:bg-bg-hover transition-colors flex items-center justify-center gap-2"
            >
              <span>✏️</span>
              <span>编辑</span>
            </button>
            <button
              v-if="!selectedRecord.isCompleted"
              @click="toggleComplete(selectedRecord); showDetailModal = false"
              class="flex-1 py-3 px-4 rounded-2xl bg-green-500 text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <span>✓</span>
              <span>标记完成</span>
            </button>
            <button
              v-if="selectedRecord.isCompleted"
              @click="toggleComplete(selectedRecord); showDetailModal = false"
              class="flex-1 py-3 px-4 rounded-2xl bg-blue-500 text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <span>↩️</span>
              <span>恢复待办</span>
            </button>
            <button
              @click="deleteRecord(selectedRecord); showDetailModal = false"
              class="py-3 px-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
            >
              <span class="text-xl">🗑️</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
