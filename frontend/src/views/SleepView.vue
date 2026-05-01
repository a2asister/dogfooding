<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { babyService } from '@/services/babyService'
import { recordService } from '@/services/recordService'
import type { BabyProfile, SleepRecord } from '@/types'

const route = useRoute()

const currentBaby = ref<BabyProfile | undefined>()
const babies = ref<BabyProfile[]>([])
const selectedBabyId = ref<string>('')
const records = ref<SleepRecord[]>([])
const showAddForm = ref(false)
const editingRecord = ref<SleepRecord | null>(null)
const isSleeping = ref(false)
const sleepStartTime = ref<Date | null>(null)

const formData = ref({
  startTime: '',
  endTime: '',
  duration: 0,
  quality: 'good' as const,
  environment: '',
  notes: ''
})

const loadData = () => {
  babies.value = babyService.getAllBabies()
  currentBaby.value = babyService.getDefaultBaby()
  
  if (route.query.babyId) {
    selectedBabyId.value = route.query.babyId as string
    currentBaby.value = babyService.getBabyById(selectedBabyId.value)
  } else if (currentBaby.value) {
    selectedBabyId.value = currentBaby.value.id
  }

  if (selectedBabyId.value) {
    records.value = recordService.getSleepRecords(selectedBabyId.value)
  }
}

const resetForm = () => {
  formData.value = {
    startTime: '',
    endTime: '',
    duration: 0,
    quality: 'good',
    environment: '',
    notes: ''
  }
  editingRecord.value = null
  showAddForm.value = false
  isSleeping.value = false
  sleepStartTime.value = null
}

const startSleep = () => {
  isSleeping.value = true
  sleepStartTime.value = new Date()
  formData.value.startTime = sleepStartTime.value.toISOString().slice(0, 16)
}

const endSleep = () => {
  if (!sleepStartTime.value) return
  
  const endTime = new Date()
  const duration = Math.floor((endTime.getTime() - sleepStartTime.value.getTime()) / 60000)
  
  formData.value.endTime = endTime.toISOString().slice(0, 16)
  formData.value.duration = duration
  isSleeping.value = false
  sleepStartTime.value = null
}

const openAddForm = () => {
  resetForm()
  const now = new Date()
  formData.value.startTime = now.toISOString().slice(0, 16)
  showAddForm.value = true
}

const openEditForm = (record: SleepRecord) => {
  editingRecord.value = record
  formData.value = {
    startTime: record.startTime.slice(0, 16),
    endTime: record.endTime ? record.endTime.slice(0, 16) : '',
    duration: record.duration || 0,
    quality: record.quality || 'good',
    environment: record.environment || '',
    notes: record.notes || ''
  }
  showAddForm.value = true
}

const saveRecord = () => {
  if (!selectedBabyId.value) {
    alert('请先选择宝宝')
    return
  }

  if (!formData.value.startTime) {
    alert('请填写入睡时间')
    return
  }

  let duration = formData.value.duration
  if (!duration && formData.value.startTime && formData.value.endTime) {
    const start = new Date(formData.value.startTime)
    const end = new Date(formData.value.endTime)
    duration = Math.floor((end.getTime() - start.getTime()) / 60000)
  }

  const recordData = {
    babyId: selectedBabyId.value,
    startTime: formData.value.startTime,
    endTime: formData.value.endTime || undefined,
    duration: duration || undefined,
    quality: formData.value.quality,
    environment: formData.value.environment || undefined,
    notes: formData.value.notes || undefined
  }

  if (editingRecord.value) {
    recordService.updateSleepRecord(editingRecord.value.id, recordData as any)
  } else {
    recordService.createSleepRecord(recordData as any)
  }

  loadData()
  resetForm()
}

const deleteRecord = (record: SleepRecord) => {
  if (confirm('确定要删除这条睡眠记录吗？')) {
    recordService.deleteSleepRecord(record.id)
    loadData()
  }
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

const getQualityText = (quality: string) => {
  switch (quality) {
    case 'excellent': return '很好'
    case 'good': return '良好'
    case 'fair': return '一般'
    case 'poor': return '较差'
    default: return '未记录'
  }
}

const getQualityClass = (quality: string) => {
  switch (quality) {
    case 'excellent': return 'bg-green-100 text-green-600'
    case 'good': return 'bg-blue-100 text-blue-600'
    case 'fair': return 'bg-yellow-100 text-yellow-600'
    case 'poor': return 'bg-red-100 text-red-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

const stats = computed(() => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  const todayRecords = records.value.filter(r => {
    const recordDate = new Date(r.startTime)
    return recordDate >= today
  })

  const weekRecords = records.value.filter(r => {
    const recordDate = new Date(r.startTime)
    return recordDate >= weekAgo
  })

  const todayTotal = todayRecords.reduce((sum, r) => sum + (r.duration || 0), 0)
  const weekAverage = weekRecords.length > 0 
    ? Math.floor(weekRecords.reduce((sum, r) => sum + (r.duration || 0), 0) / weekRecords.length)
    : 0

  return {
    todayTotal,
    todayCount: todayRecords.length,
    weekAverage,
    weekCount: weekRecords.length
  }
})

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-primary">睡眠记录</h1>
        <p class="text-secondary mt-1">记录宝宝的睡眠情况</p>
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
          @click="openAddForm"
          class="flex items-center gap-2 px-6 py-3 bg-accent-soft text-white rounded-2xl hover:opacity-90 transition-all shadow-soft"
        >
          <span class="text-xl">➕</span>
          <span class="font-medium">添加记录</span>
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
            <span class="text-xl">🌅</span>
            <span class="text-sm text-secondary">今日总计</span>
          </div>
          <p class="text-2xl font-bold text-primary">{{ formatDuration(stats.todayTotal) }}</p>
          <p class="text-sm text-secondary mt-1">{{ stats.todayCount }} 次睡眠</p>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">📊</span>
            <span class="text-sm text-secondary">本周平均</span>
          </div>
          <p class="text-2xl font-bold text-primary">{{ formatDuration(stats.weekAverage) }}</p>
          <p class="text-sm text-secondary mt-1">{{ stats.weekCount }} 次记录</p>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">📝</span>
            <span class="text-sm text-secondary">总记录</span>
          </div>
          <p class="text-2xl font-bold text-primary">{{ records.length }}</p>
          <p class="text-sm text-secondary mt-1">条睡眠记录</p>
        </div>
        <div class="bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">😴</span>
            <span class="text-sm text-secondary">快速记录</span>
          </div>
          <button
            v-if="!isSleeping"
            @click="startSleep"
            class="w-full mt-2 py-2 rounded-xl bg-white text-indigo-600 font-medium hover:bg-indigo-50 transition-colors"
          >
            开始睡眠
          </button>
          <button
            v-else
            @click="endSleep"
            class="w-full mt-2 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:opacity-90 transition-all animate-pulse-gentle"
          >
            结束睡眠
          </button>
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
          <div class="relative w-full max-w-lg bg-white rounded-3xl shadow-floating overflow-hidden">
            <div class="p-6 border-b border-border-light">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-primary">
                  {{ editingRecord ? '编辑睡眠记录' : '添加睡眠记录' }}
                </h2>
                <button
                  @click="resetForm"
                  class="p-2 hover:bg-bg-hover rounded-xl transition-colors"
                >
                  <span class="text-xl">✕</span>
                </button>
              </div>
            </div>

            <div class="p-6 max-h-[60vh] overflow-y-auto">
              <div class="space-y-5">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      入睡时间 <span class="text-red-400">*</span>
                    </label>
                    <input
                      v-model="formData.startTime"
                      type="datetime-local"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      醒来时间
                    </label>
                    <input
                      v-model="formData.endTime"
                      type="datetime-local"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    睡眠时长（分钟）
                  </label>
                  <input
                    v-model.number="formData.duration"
                    type="number"
                    placeholder="自动计算或手动输入"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    睡眠质量
                  </label>
                  <div class="flex gap-2 flex-wrap">
                    <button
                      v-for="quality in [
                        { value: 'excellent', label: '很好', icon: '😊' },
                        { value: 'good', label: '良好', icon: '🙂' },
                        { value: 'fair', label: '一般', icon: '😐' },
                        { value: 'poor', label: '较差', icon: '😟' }
                      ]"
                      :key="quality.value"
                      @click="formData.quality = quality.value as any"
                      class="flex-1 min-w-[80px] py-2 px-3 rounded-xl border-2 transition-all text-center"
                      :class="{
                        'border-indigo-400 bg-indigo-50': formData.quality === quality.value,
                        'border-border-light hover:border-indigo-200': formData.quality !== quality.value
                      }"
                    >
                      <div class="text-lg">{{ quality.icon }}</div>
                      <div class="text-xs">{{ quality.label }}</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    睡眠环境
                  </label>
                  <input
                    v-model="formData.environment"
                    type="text"
                    placeholder="如：安静、有光线、有噪音等"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    备注
                  </label>
                  <textarea
                    v-model="formData.notes"
                    placeholder="添加一些备注信息..."
                    rows="3"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="p-6 border-t border-border-light flex gap-3">
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
                {{ editingRecord ? '保存修改' : '添加记录' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <div
        v-if="records.length === 0"
        class="text-center py-16 bg-white rounded-3xl shadow-soft"
      >
        <div class="text-6xl mb-4">😴</div>
        <h3 class="text-lg font-medium text-primary mb-2">暂无睡眠记录</h3>
        <p class="text-secondary mb-6">点击上方按钮添加第一条睡眠记录</p>
        <button
          @click="openAddForm"
          class="inline-flex items-center gap-2 px-6 py-3 bg-accent-soft text-white rounded-2xl hover:opacity-90 transition-all shadow-soft"
        >
          <span class="text-xl">➕</span>
          <span class="font-medium">添加第一条记录</span>
        </button>
      </div>

      <div v-else class="bg-white rounded-3xl shadow-soft overflow-hidden">
        <div class="p-6 border-b border-border-light">
          <h3 class="text-lg font-bold text-primary">睡眠记录列表</h3>
        </div>
        <div class="divide-y divide-border-light">
          <TransitionGroup name="slide-up">
            <div
              v-for="record in records"
              :key="record.id"
              class="p-6 hover:bg-bg-hover transition-colors"
            >
              <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl">
                    😴
                  </div>
                  <div>
                    <p class="font-medium text-primary">
                      {{ new Date(record.startTime).toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' }) }}
                    </p>
                    <p class="text-sm text-secondary">
                      {{ new Date(record.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}
                      <span v-if="record.endTime">
                        - {{ new Date(record.endTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}
                      </span>
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <p v-if="record.duration" class="font-bold text-primary">
                      {{ formatDuration(record.duration) }}
                    </p>
                    <span
                      v-if="record.quality"
                      :class="`px-3 py-1 rounded-full text-xs font-medium ${getQualityClass(record.quality)}`"
                    >
                      {{ getQualityText(record.quality) }}
                    </span>
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="openEditForm(record)"
                      class="p-2 rounded-xl hover:bg-bg-hover text-secondary hover:text-primary transition-colors"
                    >
                      <span class="text-lg">✏️</span>
                    </button>
                    <button
                      @click="deleteRecord(record)"
                      class="p-2 rounded-xl hover:bg-red-50 text-secondary hover:text-red-500 transition-colors"
                    >
                      <span class="text-lg">🗑️</span>
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="record.environment || record.notes" class="mt-4 pl-16 space-y-2">
                <p v-if="record.environment" class="text-sm text-secondary">
                  <span class="font-medium">环境:</span> {{ record.environment }}
                </p>
                <p v-if="record.notes" class="text-sm text-secondary">
                  <span class="font-medium">备注:</span> {{ record.notes }}
                </p>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </div>
</template>
