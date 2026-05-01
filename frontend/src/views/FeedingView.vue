<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { babyService } from '@/services/babyService'
import { recordService } from '@/services/recordService'
import type { BabyProfile, FeedingRecord } from '@/types'

const route = useRoute()

const currentBaby = ref<BabyProfile | undefined>()
const babies = ref<BabyProfile[]>([])
const selectedBabyId = ref<string>('')
const records = ref<FeedingRecord[]>([])
const showAddForm = ref(false)
const editingRecord = ref<FeedingRecord | null>(null)

const formData = ref({
  type: 'formula' as const,
  startTime: '',
  duration: 0,
  amount: '',
  unit: 'ml' as const,
  side: '' as any,
  foodName: '',
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
    records.value = recordService.getFeedingRecords(selectedBabyId.value)
  }
}

const resetForm = () => {
  formData.value = {
    type: 'formula',
    startTime: '',
    duration: 0,
    amount: '',
    unit: 'ml',
    side: '',
    foodName: '',
    notes: ''
  }
  editingRecord.value = null
  showAddForm.value = false
}

const openAddForm = () => {
  resetForm()
  const now = new Date()
  formData.value.startTime = now.toISOString().slice(0, 16)
  showAddForm.value = true
}

const openEditForm = (record: FeedingRecord) => {
  editingRecord.value = record
  formData.value = {
    type: record.type,
    startTime: record.startTime.slice(0, 16),
    duration: record.duration || 0,
    amount: record.amount?.toString() || '',
    unit: record.unit || 'ml',
    side: record.side || '',
    foodName: record.foodName || '',
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
    alert('请填写喂养时间')
    return
  }

  const recordData = {
    babyId: selectedBabyId.value,
    type: formData.value.type,
    startTime: formData.value.startTime,
    duration: formData.value.duration || undefined,
    amount: formData.value.amount ? parseFloat(formData.value.amount) : undefined,
    unit: formData.value.unit,
    side: formData.value.side || undefined,
    foodName: formData.value.foodName || undefined,
    notes: formData.value.notes || undefined
  }

  if (editingRecord.value) {
    recordService.updateFeedingRecord(editingRecord.value.id, recordData as any)
  } else {
    recordService.createFeedingRecord(recordData as any)
  }

  loadData()
  resetForm()
}

const deleteRecord = (record: FeedingRecord) => {
  if (confirm('确定要删除这条喂养记录吗？')) {
    recordService.deleteFeedingRecord(record.id)
    loadData()
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'breastfeeding': return '🤱'
    case 'formula': return '🍼'
    case 'solid': return '🥣'
    case 'mixed': return '🍽️'
    default: return '🍼'
  }
}

const getTypeText = (type: string) => {
  switch (type) {
    case 'breastfeeding': return '母乳喂养'
    case 'formula': return '配方奶'
    case 'solid': return '辅食'
    case 'mixed': return '混合喂养'
    default: return type
  }
}

const getSideText = (side: string) => {
  switch (side) {
    case 'left': return '左侧'
    case 'right': return '右侧'
    case 'both': return '双侧'
    default: return ''
  }
}

const stats = computed(() => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const todayRecords = records.value.filter(r => {
    const recordDate = new Date(r.startTime)
    return recordDate >= today
  })

  const todayAmount = todayRecords.reduce((sum, r) => sum + (r.amount || 0), 0)

  return {
    todayCount: todayRecords.length,
    todayAmount
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
        <h1 class="text-2xl font-bold text-primary">喂养记录</h1>
        <p class="text-secondary mt-1">记录宝宝的喂养情况</p>
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
            <span class="text-sm text-secondary">今日喂养</span>
          </div>
          <p class="text-2xl font-bold text-primary">{{ stats.todayCount }} 次</p>
          <p v-if="stats.todayAmount > 0" class="text-sm text-secondary mt-1">
            共 {{ stats.todayAmount }}{{ records[0]?.unit || 'ml' }}
          </p>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">🤱</span>
            <span class="text-sm text-secondary">母乳喂养</span>
          </div>
          <p class="text-2xl font-bold text-primary">
            {{ records.filter(r => r.type === 'breastfeeding').length }}
          </p>
          <p class="text-sm text-secondary mt-1">次记录</p>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">🍼</span>
            <span class="text-sm text-secondary">配方奶</span>
          </div>
          <p class="text-2xl font-bold text-primary">
            {{ records.filter(r => r.type === 'formula').length }}
          </p>
          <p class="text-sm text-secondary mt-1">次记录</p>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">🥣</span>
            <span class="text-sm text-secondary">辅食</span>
          </div>
          <p class="text-2xl font-bold text-primary">
            {{ records.filter(r => r.type === 'solid').length }}
          </p>
          <p class="text-sm text-secondary mt-1">次记录</p>
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
                  {{ editingRecord ? '编辑喂养记录' : '添加喂养记录' }}
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
                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    喂养类型
                  </label>
                  <div class="grid grid-cols-2 gap-3">
                    <button
                      v-for="type in [
                        { value: 'breastfeeding', label: '母乳喂养', icon: '🤱' },
                        { value: 'formula', label: '配方奶', icon: '🍼' },
                        { value: 'solid', label: '辅食', icon: '🥣' },
                        { value: 'mixed', label: '混合喂养', icon: '🍽️' }
                      ]"
                      :key="type.value"
                      @click="formData.type = type.value as any"
                      class="flex items-center gap-2 py-3 px-4 rounded-2xl border-2 transition-all"
                      :class="{
                        'border-pink-400 bg-pink-50': formData.type === type.value,
                        'border-border-light hover:border-pink-200': formData.type !== type.value
                      }"
                    >
                      <span class="text-xl">{{ type.icon }}</span>
                      <span class="text-sm font-medium">{{ type.label }}</span>
                    </button>
                  </div>
                </div>

                <div v-if="formData.type === 'breastfeeding'" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      喂养时间
                    </label>
                    <div class="flex gap-3">
                      <button
                        v-for="side in [
                          { value: 'left', label: '左侧', icon: '👈' },
                          { value: 'right', label: '右侧', icon: '👉' },
                          { value: 'both', label: '双侧', icon: '↔️' }
                        ]"
                        :key="side.value"
                        @click="formData.side = side.value as any"
                        class="flex-1 py-2 px-3 rounded-xl border-2 transition-all text-center"
                        :class="{
                          'border-pink-400 bg-pink-50': formData.side === side.value,
                          'border-border-light hover:border-pink-200': formData.side !== side.value
                        }"
                      >
                        <div class="text-lg">{{ side.icon }}</div>
                        <div class="text-xs">{{ side.label }}</div>
                      </button>
                    </div>
                  </div>
                </div>

                <div v-if="formData.type === 'solid'">
                  <label class="block text-sm font-medium text-secondary mb-2">
                    食物名称
                  </label>
                  <input
                    v-model="formData.foodName"
                    type="text"
                    placeholder="如：米糊、蛋黄泥、蔬菜泥等"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    开始时间
                  </label>
                  <input
                    v-model="formData.startTime"
                    type="datetime-local"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                  />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      持续时间（分钟）
                    </label>
                    <input
                      v-model.number="formData.duration"
                      type="number"
                      placeholder="可选"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      喂养量
                    </label>
                    <div class="flex gap-2">
                      <input
                        v-model="formData.amount"
                        type="number"
                        step="0.1"
                        placeholder="量"
                        class="flex-1 px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                      />
                      <select
                        v-model="formData.unit"
                        class="px-3 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                      >
                        <option value="ml">ml</option>
                        <option value="g">g</option>
                      </select>
                    </div>
                  </div>
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
        <div class="text-6xl mb-4">🍼</div>
        <h3 class="text-lg font-medium text-primary mb-2">暂无喂养记录</h3>
        <p class="text-secondary mb-6">点击上方按钮添加第一条喂养记录</p>
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
          <h3 class="text-lg font-bold text-primary">喂养记录列表</h3>
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
                  <div
                    :class="[
                      'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl',
                      record.type === 'breastfeeding' ? 'bg-pink-100' :
                      record.type === 'formula' ? 'bg-blue-100' :
                      record.type === 'solid' ? 'bg-green-100' : 'bg-yellow-100'
                    ]"
                  >
                    {{ getTypeIcon(record.type) }}
                  </div>
                  <div>
                    <p class="font-medium text-primary">{{ getTypeText(record.type) }}</p>
                    <p class="text-sm text-secondary">
                      {{ new Date(record.startTime).toLocaleString('zh-CN') }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <p v-if="record.amount" class="font-bold text-primary">
                      {{ record.amount }}{{ record.unit }}
                    </p>
                    <div class="flex gap-2 justify-end">
                      <span
                        v-if="record.side"
                        class="px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 text-xs"
                      >
                        {{ getSideText(record.side) }}
                      </span>
                      <span
                        v-if="record.duration"
                        class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-xs"
                      >
                        {{ record.duration }} 分钟
                      </span>
                    </div>
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

              <div v-if="record.foodName || record.notes" class="mt-4 pl-16 space-y-2">
                <p v-if="record.foodName" class="text-sm text-secondary">
                  <span class="font-medium">食物:</span> {{ record.foodName }}
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
