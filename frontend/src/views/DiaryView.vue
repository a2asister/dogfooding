<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { babyService } from '@/services/babyService'
import { recordService } from '@/services/recordService'
import type { BabyProfile, DiaryEntry } from '@/types'

const currentBaby = ref<BabyProfile | undefined>()
const babies = ref<BabyProfile[]>([])
const selectedBabyId = ref<string>('')
const records = ref<DiaryEntry[]>([])
const showAddForm = ref(false)
const editingRecord = ref<DiaryEntry | null>(null)
const selectedEntry = ref<DiaryEntry | null>(null)

const formData = ref({
  entryDate: '',
  title: '',
  content: '',
  mood: 'calm' as const,
  weather: '',
  tags: '',
  notes: ''
})

const moodOptions = [
  { value: 'happy', label: '开心', icon: '😊' },
  { value: 'calm', label: '平静', icon: '🙂' },
  { value: 'excited', label: '兴奋', icon: '🤩' },
  { value: 'sad', label: '伤心', icon: '😢' },
  { value: 'irritable', label: '烦躁', icon: '😠' },
  { value: 'sleepy', label: '困倦', icon: '😴' }
]

const weatherOptions = [
  '晴天', '多云', '阴天', '雨天', '雪天', '大风'
]

const loadData = () => {
  babies.value = babyService.getAllBabies()
  currentBaby.value = babyService.getDefaultBaby()
  
  if (currentBaby.value) {
    selectedBabyId.value = currentBaby.value.id
  }

  if (selectedBabyId.value) {
    records.value = recordService.getDiaryEntries(selectedBabyId.value)
  }
}

const resetForm = () => {
  formData.value = {
    entryDate: '',
    title: '',
    content: '',
    mood: 'calm',
    weather: '',
    tags: '',
    notes: ''
  }
  editingRecord.value = null
  showAddForm.value = false
  selectedEntry.value = null
}

const openAddForm = () => {
  resetForm()
  const today = new Date().toISOString().split('T')[0]
  formData.value.entryDate = today
  showAddForm.value = true
}

const openEditForm = (record: DiaryEntry) => {
  editingRecord.value = record
  formData.value = {
    entryDate: record.entryDate,
    title: record.title,
    content: record.content,
    mood: record.mood || 'calm',
    weather: record.weather || '',
    tags: record.tags?.join(', ') || '',
    notes: record.notes || ''
  }
  showAddForm.value = true
}

const openDetail = (record: DiaryEntry) => {
  selectedEntry.value = record
}

const saveRecord = () => {
  if (!selectedBabyId.value) {
    alert('请先选择宝宝')
    return
  }

  if (!formData.value.title.trim() || !formData.value.content.trim()) {
    alert('请填写日志标题和内容')
    return
  }

  const recordData = {
    babyId: selectedBabyId.value,
    entryDate: formData.value.entryDate,
    title: formData.value.title.trim(),
    content: formData.value.content.trim(),
    mood: formData.value.mood,
    weather: formData.value.weather.trim() || undefined,
    tags: formData.value.tags.trim() ? formData.value.tags.split(',').map(t => t.trim()).filter(t => t) : undefined,
    photos: undefined,
    videos: undefined,
    isFavorite: editingRecord.value?.isFavorite || false,
    notes: formData.value.notes.trim() || undefined
  }

  if (editingRecord.value) {
    recordService.updateDiaryEntry(editingRecord.value.id, recordData as any)
  } else {
    recordService.createDiaryEntry(recordData as any)
  }

  loadData()
  resetForm()
}

const deleteRecord = (record: DiaryEntry) => {
  if (confirm('确定要删除这篇日志吗？')) {
    recordService.deleteDiaryEntry(record.id)
    loadData()
  }
}

const toggleFavorite = (record: DiaryEntry) => {
  recordService.updateDiaryEntry(record.id, {
    isFavorite: !record.isFavorite
  })
  loadData()
}

const getMoodInfo = (mood: string) => {
  return moodOptions.find(m => m.value === mood) || moodOptions[1]
}

const favoriteEntries = computed(() => {
  return records.value.filter(r => r.isFavorite)
})

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-primary">成长日志</h1>
        <p class="text-secondary mt-1">记录宝宝的成长点滴和美好时光</p>
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
          <span class="text-xl">✍️</span>
          <span class="font-medium">写日志</span>
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
            <span class="text-xl">📝</span>
            <span class="text-sm text-secondary">总日志</span>
          </div>
          <p class="text-2xl font-bold text-primary">{{ records.length }}</p>
          <p class="text-sm text-secondary mt-1">篇日志</p>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">⭐</span>
            <span class="text-sm text-secondary">收藏</span>
          </div>
          <p class="text-2xl font-bold text-yellow-500">{{ favoriteEntries.length }}</p>
          <p class="text-sm text-secondary mt-1">篇收藏</p>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">📅</span>
            <span class="text-sm text-secondary">本月</span>
          </div>
          <p class="text-2xl font-bold text-blue-600">
            {{ records.filter(r => {
              const now = new Date()
              const entryDate = new Date(r.entryDate)
              return now.getMonth() === entryDate.getMonth() && now.getFullYear() === entryDate.getFullYear()
            }).length }}
          </p>
          <p class="text-sm text-secondary mt-1">篇日志</p>
        </div>
        <div class="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">📖</span>
            <span class="text-sm text-pink-700">最新日志</span>
          </div>
          <p v-if="records.length > 0" class="text-lg font-bold text-pink-800 truncate">
            {{ records[0].title }}
          </p>
          <p v-else class="text-lg font-bold text-pink-800">暂无</p>
          <p v-if="records.length > 0" class="text-sm text-pink-700 mt-1">
            {{ records[0].entryDate }}
          </p>
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
          <div class="relative w-full max-w-2xl bg-white rounded-3xl shadow-floating overflow-hidden max-h-[90vh] flex flex-col">
            <div class="p-6 border-b border-border-light flex-shrink-0">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-primary">
                  {{ editingRecord ? '编辑日志' : '写日志' }}
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
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      日志日期
                    </label>
                    <input
                      v-model="formData.entryDate"
                      type="date"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      天气
                    </label>
                    <select
                      v-model="formData.weather"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    >
                      <option value="">选择天气</option>
                      <option v-for="w in weatherOptions" :key="w" :value="w">
                        {{ w }}
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    标题 <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="formData.title"
                    type="text"
                    placeholder="给这篇日志起个标题..."
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    心情
                  </label>
                  <div class="flex gap-2 flex-wrap">
                    <button
                      v-for="mood in moodOptions"
                      :key="mood.value"
                      @click="formData.mood = mood.value as any"
                      class="flex items-center gap-1 py-2 px-3 rounded-xl border-2 transition-all"
                      :class="{
                        'border-accent-soft bg-accent-soft/10': formData.mood === mood.value,
                        'border-border-light hover:border-accent-soft/30': formData.mood !== mood.value
                      }"
                    >
                      <span class="text-xl">{{ mood.icon }}</span>
                      <span class="text-sm">{{ mood.label }}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    内容 <span class="text-red-400">*</span>
                  </label>
                  <textarea
                    v-model="formData.content"
                    placeholder="记录宝宝的成长点滴..."
                    rows="8"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors resize-none"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    标签
                  </label>
                  <input
                    v-model="formData.tags"
                    type="text"
                    placeholder="用逗号分隔，如：第一次走路,生日,外出游玩"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                  />
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
                {{ editingRecord ? '保存修改' : '发布日志' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <Transition name="scale">
        <div
          v-if="selectedEntry"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            class="absolute inset-0 bg-black/30"
            @click="selectedEntry = null"
          ></div>
          <div class="relative w-full max-w-2xl bg-white rounded-3xl shadow-floating overflow-hidden max-h-[90vh] flex flex-col">
            <div class="p-6 border-b border-border-light flex-shrink-0">
              <div class="flex items-start justify-between">
                <div>
                  <h2 class="text-xl font-bold text-primary">{{ selectedEntry.title }}</h2>
                  <div class="flex items-center gap-3 mt-2">
                    <span class="text-sm text-secondary">{{ selectedEntry.entryDate }}</span>
                    <span v-if="selectedEntry.weather" class="text-sm text-secondary">
                      · {{ selectedEntry.weather }}
                    </span>
                    <span v-if="selectedEntry.mood" class="text-lg">
                      {{ getMoodInfo(selectedEntry.mood).icon }}
                    </span>
                  </div>
                </div>
                <button
                  @click="selectedEntry = null"
                  class="p-2 hover:bg-bg-hover rounded-xl transition-colors"
                >
                  <span class="text-xl">✕</span>
                </button>
              </div>
            </div>

            <div class="p-6 overflow-y-auto flex-1">
              <div class="whitespace-pre-wrap text-primary leading-relaxed">
                {{ selectedEntry.content }}
              </div>

              <div v-if="selectedEntry.tags && selectedEntry.tags.length > 0" class="mt-6 pt-6 border-t border-border-light">
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in selectedEntry.tags"
                    :key="tag"
                    class="px-3 py-1 rounded-full bg-accent-soft/10 text-accent-soft text-sm"
                  >
                    #{{ tag }}
                  </span>
                </div>
              </div>
            </div>

            <div class="p-6 border-t border-border-light flex gap-3 flex-shrink-0">
              <button
                @click="openEditForm(selectedEntry!); selectedEntry = null"
                class="flex-1 py-3 px-4 rounded-2xl border border-border-light text-secondary hover:bg-bg-hover transition-colors"
              >
                编辑
              </button>
              <button
                @click="toggleFavorite(selectedEntry!); selectedEntry = null"
                :class="[
                  'flex-1 py-3 px-4 rounded-2xl transition-colors',
                  selectedEntry.isFavorite 
                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                    : 'border border-border-light text-secondary hover:bg-bg-hover'
                ]"
              >
                {{ selectedEntry.isFavorite ? '⭐ 已收藏' : '☆ 收藏' }}
              </button>
              <button
                @click="deleteRecord(selectedEntry!); selectedEntry = null"
                class="py-3 px-4 rounded-2xl text-red-500 hover:bg-red-50 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <div
        v-if="records.length === 0"
        class="text-center py-16 bg-white rounded-3xl shadow-soft"
      >
        <div class="text-6xl mb-4">📝</div>
        <h3 class="text-lg font-medium text-primary mb-2">暂无成长日志</h3>
        <p class="text-secondary mb-6">记录宝宝的成长点滴，留下美好回忆</p>
        <button
          @click="openAddForm"
          class="inline-flex items-center gap-2 px-6 py-3 bg-accent-soft text-white rounded-2xl hover:opacity-90 transition-all shadow-soft"
        >
          <span class="text-xl">✍️</span>
          <span class="font-medium">写第一篇日志</span>
        </button>
      </div>

      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <TransitionGroup name="slide-up">
          <div
            v-for="entry in records"
            :key="entry.id"
            class="bg-white rounded-3xl shadow-soft overflow-hidden hover:shadow-medium transition-all cursor-pointer"
            @click="openDetail(entry)"
          >
            <div class="p-6">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ getMoodInfo(entry.mood || 'calm').icon }}</span>
                  <span class="text-sm text-secondary">{{ entry.entryDate }}</span>
                </div>
                <button
                  @click.stop="toggleFavorite(entry)"
                  :class="entry.isFavorite ? 'text-yellow-500' : 'text-gray-300'"
                  class="text-xl hover:scale-110 transition-transform"
                >
                  {{ entry.isFavorite ? '⭐' : '☆' }}
                </button>
              </div>

              <h3 class="font-bold text-primary mb-2 line-clamp-2">
                {{ entry.title }}
              </h3>

              <p class="text-sm text-secondary line-clamp-3 mb-4">
                {{ entry.content }}
              </p>

              <div class="flex items-center justify-between">
                <div v-if="entry.tags && entry.tags.length > 0" class="flex flex-wrap gap-1">
                  <span
                    v-for="tag in entry.tags.slice(0, 2)"
                    :key="tag"
                    class="px-2 py-0.5 rounded-full bg-accent-soft/10 text-accent-soft text-xs"
                  >
                    #{{ tag }}
                  </span>
                  <span
                    v-if="entry.tags.length > 2"
                    class="text-xs text-secondary"
                  >
                    +{{ entry.tags.length - 2 }}
                  </span>
                </div>
                <span v-if="entry.weather" class="text-xs text-secondary">
                  {{ entry.weather }}
                </span>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>
