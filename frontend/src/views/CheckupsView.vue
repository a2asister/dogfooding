<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { babyService } from '@/services/babyService'
import { recordService } from '@/services/recordService'
import type { BabyProfile, CheckupRecord } from '@/types'

const route = useRoute()

const currentBaby = ref<BabyProfile | undefined>()
const babies = ref<BabyProfile[]>([])
const selectedBabyId = ref<string>('')
const records = ref<CheckupRecord[]>([])
const showAddForm = ref(false)
const editingRecord = ref<CheckupRecord | null>(null)

const formData = ref({
  checkupDate: '',
  checkupType: '',
  weight: '',
  height: '',
  headCircumference: '',
  weightPercentile: '',
  heightPercentile: '',
  headCircumferencePercentile: '',
  bmi: '',
  doctorName: '',
  hospitalName: '',
  findings: '',
  recommendations: '',
  nextCheckupDate: '',
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
    records.value = recordService.getCheckupRecords(selectedBabyId.value)
  }
}

const resetForm = () => {
  formData.value = {
    checkupDate: '',
    checkupType: '',
    weight: '',
    height: '',
    headCircumference: '',
    weightPercentile: '',
    heightPercentile: '',
    headCircumferencePercentile: '',
    bmi: '',
    doctorName: '',
    hospitalName: '',
    findings: '',
    recommendations: '',
    nextCheckupDate: '',
    notes: ''
  }
  editingRecord.value = null
  showAddForm.value = false
}

const openAddForm = () => {
  resetForm()
  const today = new Date().toISOString().split('T')[0]
  formData.value.checkupDate = today
  showAddForm.value = true
}

const openEditForm = (record: CheckupRecord) => {
  editingRecord.value = record
  formData.value = {
    checkupDate: record.checkupDate,
    checkupType: record.checkupType,
    weight: record.weight?.toString() || '',
    height: record.height?.toString() || '',
    headCircumference: record.headCircumference?.toString() || '',
    weightPercentile: record.weightPercentile?.toString() || '',
    heightPercentile: record.heightPercentile?.toString() || '',
    headCircumferencePercentile: record.headCircumferencePercentile?.toString() || '',
    bmi: record.bmi?.toString() || '',
    doctorName: record.doctorName || '',
    hospitalName: record.hospitalName || '',
    findings: record.findings || '',
    recommendations: record.recommendations || '',
    nextCheckupDate: record.nextCheckupDate || '',
    notes: record.notes || ''
  }
  showAddForm.value = true
}

const saveRecord = () => {
  if (!selectedBabyId.value) {
    alert('请先选择宝宝')
    return
  }

  if (!formData.value.checkupDate || !formData.value.checkupType.trim()) {
    alert('请填写体检日期和体检类型')
    return
  }

  const recordData = {
    babyId: selectedBabyId.value,
    checkupDate: formData.value.checkupDate,
    checkupType: formData.value.checkupType.trim(),
    weight: formData.value.weight ? parseFloat(formData.value.weight) : undefined,
    height: formData.value.height ? parseFloat(formData.value.height) : undefined,
    headCircumference: formData.value.headCircumference ? parseFloat(formData.value.headCircumference) : undefined,
    weightPercentile: formData.value.weightPercentile ? parseFloat(formData.value.weightPercentile) : undefined,
    heightPercentile: formData.value.heightPercentile ? parseFloat(formData.value.heightPercentile) : undefined,
    headCircumferencePercentile: formData.value.headCircumferencePercentile ? parseFloat(formData.value.headCircumferencePercentile) : undefined,
    bmi: formData.value.bmi ? parseFloat(formData.value.bmi) : undefined,
    doctorName: formData.value.doctorName.trim() || undefined,
    hospitalName: formData.value.hospitalName.trim() || undefined,
    findings: formData.value.findings.trim() || undefined,
    recommendations: formData.value.recommendations.trim() || undefined,
    nextCheckupDate: formData.value.nextCheckupDate || undefined,
    notes: formData.value.notes.trim() || undefined
  }

  if (editingRecord.value) {
    recordService.updateCheckupRecord(editingRecord.value.id, recordData as any)
  } else {
    recordService.createCheckupRecord(recordData as any)
  }

  loadData()
  resetForm()
}

const deleteRecord = (record: CheckupRecord) => {
  if (confirm('确定要删除这条体检记录吗？')) {
    recordService.deleteCheckupRecord(record.id)
    loadData()
  }
}

const latestRecord = computed(() => {
  return records.value[0]
})

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-primary">体检记录</h1>
        <p class="text-secondary mt-1">记录宝宝的体检情况</p>
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
      <div v-if="latestRecord" class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-soft p-6">
        <h3 class="text-lg font-bold text-primary mb-4 flex items-center gap-2">
          <span class="text-2xl">📋</span>
          最近一次体检
        </h3>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="bg-white/70 rounded-2xl p-4">
            <p class="text-sm text-secondary mb-1">体检日期</p>
            <p class="font-bold text-primary">{{ latestRecord.checkupDate }}</p>
            <p class="text-sm text-secondary mt-1">{{ latestRecord.checkupType }}</p>
          </div>
          <div class="bg-white/70 rounded-2xl p-4">
            <p class="text-sm text-secondary mb-1">身高/体重</p>
            <p class="font-bold text-primary">
              {{ latestRecord.height ? `${latestRecord.height}cm` : '-' }} / 
              {{ latestRecord.weight ? `${latestRecord.weight}kg` : '-' }}
            </p>
            <p v-if="latestRecord.bmi" class="text-sm text-secondary mt-1">
              BMI: {{ latestRecord.bmi.toFixed(1) }}
            </p>
          </div>
          <div class="bg-white/70 rounded-2xl p-4">
            <p class="text-sm text-secondary mb-1">头围</p>
            <p class="font-bold text-primary">
              {{ latestRecord.headCircumference ? `${latestRecord.headCircumference}cm` : '-' }}
            </p>
            <p v-if="latestRecord.headCircumferencePercentile" class="text-sm text-secondary mt-1">
              百分位: {{ latestRecord.headCircumferencePercentile }}%
            </p>
          </div>
          <div class="bg-white/70 rounded-2xl p-4">
            <p class="text-sm text-secondary mb-1">下次体检</p>
            <p class="font-bold text-primary">
              {{ latestRecord.nextCheckupDate || '-' }}
            </p>
            <p v-if="latestRecord.hospitalName" class="text-sm text-secondary mt-1">
              {{ latestRecord.hospitalName }}
            </p>
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
                  {{ editingRecord ? '编辑体检记录' : '添加体检记录' }}
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
                      体检日期 <span class="text-red-400">*</span>
                    </label>
                    <input
                      v-model="formData.checkupDate"
                      type="date"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      体检类型 <span class="text-red-400">*</span>
                    </label>
                    <input
                      v-model="formData.checkupType"
                      type="text"
                      placeholder="如：42天体检、3月龄体检"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      体重 (kg)
                    </label>
                    <input
                      v-model="formData.weight"
                      type="number"
                      step="0.01"
                      placeholder="体重"
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
                      placeholder="身高"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      头围 (cm)
                    </label>
                    <input
                      v-model="formData.headCircumference"
                      type="number"
                      step="0.1"
                      placeholder="头围"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      体重百分位 (%)
                    </label>
                    <input
                      v-model="formData.weightPercentile"
                      type="number"
                      step="0.1"
                      placeholder="百分位"
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
                      placeholder="百分位"
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
                      placeholder="BMI"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      医院名称
                    </label>
                    <input
                      v-model="formData.hospitalName"
                      type="text"
                      placeholder="医院名称"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      医生姓名
                    </label>
                    <input
                      v-model="formData.doctorName"
                      type="text"
                      placeholder="医生姓名"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    检查结果
                  </label>
                  <textarea
                    v-model="formData.findings"
                    placeholder="记录检查结果..."
                    rows="2"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors resize-none"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    医生建议
                  </label>
                  <textarea
                    v-model="formData.recommendations"
                    placeholder="记录医生建议..."
                    rows="2"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors resize-none"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    下次体检日期
                  </label>
                  <input
                    v-model="formData.nextCheckupDate"
                    type="date"
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
        <div class="text-6xl mb-4">🏥</div>
        <h3 class="text-lg font-medium text-primary mb-2">暂无体检记录</h3>
        <p class="text-secondary mb-6">点击上方按钮添加第一条体检记录</p>
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
          <h3 class="text-lg font-bold text-primary">体检记录列表</h3>
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
                    🏥
                  </div>
                  <div>
                    <p class="font-medium text-primary">{{ record.checkupType }}</p>
                    <p class="text-sm text-secondary">
                      体检日期: {{ record.checkupDate }}
                      <span v-if="record.hospitalName"> · {{ record.hospitalName }}</span>
                      <span v-if="record.doctorName"> · 医生: {{ record.doctorName }}</span>
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <div class="flex gap-4">
                      <div v-if="record.weight" class="text-center">
                        <p class="text-xs text-secondary">体重</p>
                        <p class="font-bold text-primary">{{ record.weight }}kg</p>
                      </div>
                      <div v-if="record.height" class="text-center">
                        <p class="text-xs text-secondary">身高</p>
                        <p class="font-bold text-primary">{{ record.height }}cm</p>
                      </div>
                      <div v-if="record.headCircumference" class="text-center">
                        <p class="text-xs text-secondary">头围</p>
                        <p class="font-bold text-primary">{{ record.headCircumference }}cm</p>
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

              <div v-if="record.findings || record.recommendations || record.notes" class="mt-4 pl-16 space-y-2">
                <p v-if="record.findings" class="text-sm text-secondary">
                  <span class="font-medium">检查结果:</span> {{ record.findings }}
                </p>
                <p v-if="record.recommendations" class="text-sm text-secondary">
                  <span class="font-medium">医生建议:</span> {{ record.recommendations }}
                </p>
                <p v-if="record.nextCheckupDate" class="text-sm text-secondary">
                  <span class="font-medium">下次体检:</span> {{ record.nextCheckupDate }}
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
