<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { babyService } from '@/services/babyService'
import { recordService } from '@/services/recordService'
import type { BabyProfile, GrowthRecord } from '@/types'

const route = useRoute()

const currentBaby = ref<BabyProfile | undefined>()
const babies = ref<BabyProfile[]>([])
const selectedBabyId = ref<string>('')
const records = ref<GrowthRecord[]>([])
const showAddForm = ref(false)
const editingRecord = ref<GrowthRecord | null>(null)

const formData = ref({
  recordDate: '',
  weight: '',
  height: '',
  headCircumference: '',
  weightPercentile: '',
  heightPercentile: '',
  headCircumferencePercentile: '',
  bmi: '',
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
    records.value = recordService.getGrowthRecords(selectedBabyId.value)
  }
}

const resetForm = () => {
  formData.value = {
    recordDate: '',
    weight: '',
    height: '',
    headCircumference: '',
    weightPercentile: '',
    heightPercentile: '',
    headCircumferencePercentile: '',
    bmi: '',
    notes: ''
  }
  editingRecord.value = null
  showAddForm.value = false
}

const openAddForm = () => {
  resetForm()
  const today = new Date().toISOString().split('T')[0]
  formData.value.recordDate = today
  showAddForm.value = true
}

const openEditForm = (record: GrowthRecord) => {
  editingRecord.value = record
  formData.value = {
    recordDate: record.recordDate,
    weight: record.weight?.toString() || '',
    height: record.height?.toString() || '',
    headCircumference: record.headCircumference?.toString() || '',
    weightPercentile: record.weightPercentile?.toString() || '',
    heightPercentile: record.heightPercentile?.toString() || '',
    headCircumferencePercentile: record.headCircumferencePercentile?.toString() || '',
    bmi: record.bmi?.toString() || '',
    notes: record.notes || ''
  }
  showAddForm.value = true
}

const calculateBMI = () => {
  const weight = parseFloat(formData.value.weight)
  const height = parseFloat(formData.value.height)
  if (weight && height && height > 0) {
    const heightM = height / 100
    formData.value.bmi = (weight / (heightM * heightM)).toFixed(1)
  }
}

const saveRecord = () => {
  if (!selectedBabyId.value) {
    alert('请先选择宝宝')
    return
  }

  if (!formData.value.recordDate) {
    alert('请填写记录日期')
    return
  }

  const recordData = {
    babyId: selectedBabyId.value,
    recordDate: formData.value.recordDate,
    weight: formData.value.weight ? parseFloat(formData.value.weight) : undefined,
    height: formData.value.height ? parseFloat(formData.value.height) : undefined,
    headCircumference: formData.value.headCircumference ? parseFloat(formData.value.headCircumference) : undefined,
    weightPercentile: formData.value.weightPercentile ? parseFloat(formData.value.weightPercentile) : undefined,
    heightPercentile: formData.value.heightPercentile ? parseFloat(formData.value.heightPercentile) : undefined,
    headCircumferencePercentile: formData.value.headCircumferencePercentile ? parseFloat(formData.value.headCircumferencePercentile) : undefined,
    bmi: formData.value.bmi ? parseFloat(formData.value.bmi) : undefined,
    notes: formData.value.notes.trim() || undefined
  }

  if (editingRecord.value) {
    recordService.updateGrowthRecord(editingRecord.value.id, recordData as any)
  } else {
    recordService.createGrowthRecord(recordData as any)
  }

  loadData()
  resetForm()
}

const deleteRecord = (record: GrowthRecord) => {
  if (confirm('确定要删除这条成长记录吗？')) {
    recordService.deleteGrowthRecord(record.id)
    loadData()
  }
}

const latestRecord = computed(() => {
  return records.value[0]
})

const stats = computed(() => {
  const validRecords = records.value.filter(r => r.weight && r.height)
  if (validRecords.length < 2) return null

  const sortedByDate = [...validRecords].sort((a, b) => 
    new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime()
  )

  const first = sortedByDate[0]
  const last = sortedByDate[sortedByDate.length - 1]

  return {
    weightGain: (last.weight! - first.weight!).toFixed(2),
    heightGain: (last.height! - first.height!).toFixed(1),
    totalRecords: sortedByDate.length
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
        <h1 class="text-2xl font-bold text-primary">成长数据</h1>
        <p class="text-secondary mt-1">记录宝宝的身高体重发育情况</p>
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
            <span class="text-xl">📏</span>
            <span class="text-sm text-secondary">当前身高</span>
          </div>
          <p class="text-2xl font-bold text-primary">
            {{ latestRecord?.height ? `${latestRecord.height}cm` : '-' }}
          </p>
          <p v-if="latestRecord?.heightPercentile" class="text-sm text-secondary mt-1">
            百分位: {{ latestRecord.heightPercentile }}%
          </p>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">⚖️</span>
            <span class="text-sm text-secondary">当前体重</span>
          </div>
          <p class="text-2xl font-bold text-primary">
            {{ latestRecord?.weight ? `${latestRecord.weight}kg` : '-' }}
          </p>
          <p v-if="latestRecord?.weightPercentile" class="text-sm text-secondary mt-1">
            百分位: {{ latestRecord.weightPercentile }}%
          </p>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">📊</span>
            <span class="text-sm text-secondary">BMI</span>
          </div>
          <p class="text-2xl font-bold text-primary">
            {{ latestRecord?.bmi ? latestRecord.bmi.toFixed(1) : '-' }}
          </p>
          <p class="text-sm text-secondary mt-1">
            {{ latestRecord?.headCircumference ? `头围: ${latestRecord.headCircumference}cm` : '' }}
          </p>
        </div>
        <div class="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">📈</span>
            <span class="text-sm text-green-700">累计增长</span>
          </div>
          <p v-if="stats" class="text-lg font-bold text-green-800">
            +{{ stats.weightGain }}kg / +{{ stats.heightGain }}cm
          </p>
          <p v-else class="text-lg font-bold text-green-800">-</p>
          <p v-if="stats" class="text-sm text-green-700 mt-1">
            共 {{ stats.totalRecords }} 次记录
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
          <div class="relative w-full max-w-lg bg-white rounded-3xl shadow-floating overflow-hidden max-h-[90vh] flex flex-col">
            <div class="p-6 border-b border-border-light flex-shrink-0">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-primary">
                  {{ editingRecord ? '编辑成长记录' : '添加成长记录' }}
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
                    记录日期 <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="formData.recordDate"
                    type="date"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                  />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      体重 (kg)
                    </label>
                    <input
                      v-model="formData.weight"
                      type="number"
                      step="0.01"
                      placeholder="如 5.5"
                      @blur="calculateBMI"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      身高 (cm)
                    </label>
                    <input
                      v-model="formData.height"
                      type="number"
                      step="0.1"
                      placeholder="如 65"
                      @blur="calculateBMI"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      体重百分位 (%)
                    </label>
                    <input
                      v-model="formData.weightPercentile"
                      type="number"
                      step="0.1"
                      placeholder="可选"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      身高百分位 (%)
                    </label>
                    <input
                      v-model="formData.heightPercentile"
                      type="number"
                      step="0.1"
                      placeholder="可选"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      头围 (cm)
                    </label>
                    <input
                      v-model="formData.headCircumference"
                      type="number"
                      step="0.1"
                      placeholder="可选"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      BMI
                    </label>
                    <input
                      v-model="formData.bmi"
                      type="number"
                      step="0.01"
                      placeholder="自动计算"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors bg-bg-hover"
                      readonly
                    />
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
        <div class="text-6xl mb-4">📈</div>
        <h3 class="text-lg font-medium text-primary mb-2">暂无成长记录</h3>
        <p class="text-secondary mb-6">点击上方按钮添加第一条成长记录</p>
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
          <h3 class="text-lg font-bold text-primary">成长记录列表</h3>
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
                  <div class="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-2xl">
                    📊
                  </div>
                  <div>
                    <p class="font-medium text-primary">{{ record.recordDate }}</p>
                    <p class="text-sm text-secondary">
                      {{ record.weight ? `体重: ${record.weight}kg` : '' }}
                      {{ record.weight && record.height ? ' / ' : '' }}
                      {{ record.height ? `身高: ${record.height}cm` : '' }}
                      {{ record.headCircumference ? ` / 头围: ${record.headCircumference}cm` : '' }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <div class="flex gap-3">
                      <div v-if="record.bmi" class="text-center">
                        <p class="text-xs text-secondary">BMI</p>
                        <p class="font-bold text-primary">{{ record.bmi.toFixed(1) }}</p>
                      </div>
                      <div v-if="record.weightPercentile" class="text-center">
                        <p class="text-xs text-secondary">体重百分位</p>
                        <p class="font-bold text-primary">{{ record.weightPercentile }}%</p>
                      </div>
                      <div v-if="record.heightPercentile" class="text-center">
                        <p class="text-xs text-secondary">身高百分位</p>
                        <p class="font-bold text-primary">{{ record.heightPercentile }}%</p>
                      </div>
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

              <div v-if="record.notes" class="mt-4 pl-16">
                <p class="text-sm text-secondary">
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
