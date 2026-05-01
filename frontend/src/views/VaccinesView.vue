<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { babyService } from '@/services/babyService'
import { recordService } from '@/services/recordService'
import type { BabyProfile, VaccineRecord } from '@/types'

const route = useRoute()

const currentBaby = ref<BabyProfile | undefined>()
const babies = ref<BabyProfile[]>([])
const selectedBabyId = ref<string>('')
const records = ref<VaccineRecord[]>([])
const showAddForm = ref(false)
const editingRecord = ref<VaccineRecord | null>(null)

const formData = ref({
  vaccineName: '',
  vaccineType: '',
  scheduledDate: '',
  actualDate: '',
  status: 'scheduled' as const,
  doseNumber: '',
  totalDoses: '',
  location: '',
  batchNumber: '',
  notes: '',
  reactions: ''
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
    records.value = recordService.getVaccineRecords(selectedBabyId.value)
  }
}

const resetForm = () => {
  formData.value = {
    vaccineName: '',
    vaccineType: '',
    scheduledDate: '',
    actualDate: '',
    status: 'scheduled',
    doseNumber: '',
    totalDoses: '',
    location: '',
    batchNumber: '',
    notes: '',
    reactions: ''
  }
  editingRecord.value = null
  showAddForm.value = false
}

const openAddForm = () => {
  resetForm()
  showAddForm.value = true
}

const openEditForm = (record: VaccineRecord) => {
  editingRecord.value = record
  formData.value = {
    vaccineName: record.vaccineName,
    vaccineType: record.vaccineType || '',
    scheduledDate: record.scheduledDate,
    actualDate: record.actualDate || '',
    status: record.status,
    doseNumber: record.doseNumber?.toString() || '',
    totalDoses: record.totalDoses?.toString() || '',
    location: record.location || '',
    batchNumber: record.batchNumber || '',
    notes: record.notes || '',
    reactions: record.reactions || ''
  }
  showAddForm.value = true
}

const saveRecord = () => {
  if (!selectedBabyId.value) {
    alert('请先选择宝宝')
    return
  }

  if (!formData.value.vaccineName.trim() || !formData.value.scheduledDate) {
    alert('请填写疫苗名称和预约日期')
    return
  }

  const recordData = {
    babyId: selectedBabyId.value,
    vaccineName: formData.value.vaccineName.trim(),
    vaccineType: formData.value.vaccineType.trim() || undefined,
    scheduledDate: formData.value.scheduledDate,
    actualDate: formData.value.actualDate || undefined,
    status: formData.value.status,
    doseNumber: formData.value.doseNumber ? parseInt(formData.value.doseNumber) : undefined,
    totalDoses: formData.value.totalDoses ? parseInt(formData.value.totalDoses) : undefined,
    location: formData.value.location.trim() || undefined,
    batchNumber: formData.value.batchNumber.trim() || undefined,
    notes: formData.value.notes.trim() || undefined,
    reactions: formData.value.reactions.trim() || undefined
  }

  if (editingRecord.value) {
    recordService.updateVaccineRecord(editingRecord.value.id, recordData as any)
  } else {
    recordService.createVaccineRecord(recordData as any)
  }

  loadData()
  resetForm()
}

const deleteRecord = (record: VaccineRecord) => {
  if (confirm('确定要删除这条疫苗记录吗？')) {
    recordService.deleteVaccineRecord(record.id)
    loadData()
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-700'
    case 'scheduled': return 'bg-blue-100 text-blue-700'
    case 'missed': return 'bg-red-100 text-red-700'
    case 'cancelled': return 'bg-gray-100 text-gray-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': return '已完成'
    case 'scheduled': return '已预约'
    case 'missed': return '已错过'
    case 'cancelled': return '已取消'
    default: return status
  }
}

const upcomingRecords = computed(() => {
  return records.value
    .filter(r => r.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
})

const completedRecords = computed(() => {
  return records.value
    .filter(r => r.status === 'completed')
    .sort((a, b) => new Date(b.actualDate || b.scheduledDate).getTime() - new Date(a.actualDate || a.scheduledDate).getTime())
})

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-primary">疫苗记录</h1>
        <p class="text-secondary mt-1">记录宝宝的疫苗接种情况</p>
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
            <span class="text-xl">💉</span>
            <span class="text-sm text-secondary">总记录</span>
          </div>
          <p class="text-2xl font-bold text-primary">{{ records.length }}</p>
          <p class="text-sm text-secondary mt-1">条疫苗记录</p>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">✅</span>
            <span class="text-sm text-secondary">已完成</span>
          </div>
          <p class="text-2xl font-bold text-green-600">{{ completedRecords.length }}</p>
          <p class="text-sm text-secondary mt-1">剂次</p>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">📅</span>
            <span class="text-sm text-secondary">待接种</span>
          </div>
          <p class="text-2xl font-bold text-blue-600">{{ upcomingRecords.length }}</p>
          <p class="text-sm text-secondary mt-1">剂次</p>
        </div>
        <div class="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">📋</span>
            <span class="text-sm text-green-700">下一针</span>
          </div>
          <p v-if="upcomingRecords.length > 0" class="text-lg font-bold text-green-800">
            {{ upcomingRecords[0].vaccineName }}
          </p>
          <p v-else class="text-lg font-bold text-green-800">暂无安排</p>
          <p v-if="upcomingRecords.length > 0" class="text-sm text-green-700 mt-1">
            {{ upcomingRecords[0].scheduledDate }}
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
                  {{ editingRecord ? '编辑疫苗记录' : '添加疫苗记录' }}
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
                    疫苗名称 <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="formData.vaccineName"
                    type="text"
                    placeholder="如：乙肝疫苗、百白破等"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    疫苗类型
                  </label>
                  <input
                    v-model="formData.vaccineType"
                    type="text"
                    placeholder="如：免费、自费、进口等"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                  />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      预约日期 <span class="text-red-400">*</span>
                    </label>
                    <input
                      v-model="formData.scheduledDate"
                      type="date"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      实际接种日期
                    </label>
                    <input
                      v-model="formData.actualDate"
                      type="date"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    接种状态
                  </label>
                  <div class="flex gap-2 flex-wrap">
                    <button
                      v-for="status in [
                        { value: 'scheduled', label: '已预约', color: 'blue' },
                        { value: 'completed', label: '已完成', color: 'green' },
                        { value: 'missed', label: '已错过', color: 'red' },
                        { value: 'cancelled', label: '已取消', color: 'gray' }
                      ]"
                      :key="status.value"
                      @click="formData.status = status.value as any"
                      class="flex-1 min-w-[80px] py-2 px-3 rounded-xl border-2 transition-all text-center"
                      :class="{
                        'border-blue-400 bg-blue-50': formData.status === status.value && status.color === 'blue',
                        'border-green-400 bg-green-50': formData.status === status.value && status.color === 'green',
                        'border-red-400 bg-red-50': formData.status === status.value && status.color === 'red',
                        'border-gray-400 bg-gray-50': formData.status === status.value && status.color === 'gray',
                        'border-border-light hover:border-gray-200': formData.status !== status.value
                      }"
                    >
                      <span class="text-sm font-medium">{{ status.label }}</span>
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      剂次
                    </label>
                    <input
                      v-model="formData.doseNumber"
                      type="number"
                      placeholder="如：1"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-secondary mb-2">
                      总剂次
                    </label>
                    <input
                      v-model="formData.totalDoses"
                      type="number"
                      placeholder="如：3"
                      class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    接种地点
                  </label>
                  <input
                    v-model="formData.location"
                    type="text"
                    placeholder="如：社区卫生服务中心"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    批号
                  </label>
                  <input
                    v-model="formData.batchNumber"
                    type="text"
                    placeholder="疫苗批号"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    接种后反应
                  </label>
                  <textarea
                    v-model="formData.reactions"
                    placeholder="记录接种后的反应情况..."
                    rows="2"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors resize-none"
                  ></textarea>
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

      <div v-if="upcomingRecords.length > 0" class="bg-white rounded-3xl shadow-soft overflow-hidden">
        <div class="p-6 border-b border-border-light flex items-center gap-2">
          <span class="text-2xl">📅</span>
          <h3 class="text-lg font-bold text-primary">待接种疫苗</h3>
        </div>
        <div class="divide-y divide-border-light">
          <div
            v-for="record in upcomingRecords"
            :key="record.id"
            class="p-6 hover:bg-bg-hover transition-colors"
          >
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">
                  💉
                </div>
                <div>
                  <p class="font-medium text-primary">{{ record.vaccineName }}</p>
                  <p class="text-sm text-secondary">
                    预约日期: {{ record.scheduledDate }}
                    <span v-if="record.location"> · {{ record.location }}</span>
                  </p>
                  <p v-if="record.doseNumber || record.totalDoses" class="text-sm text-secondary mt-1">
                    第 {{ record.doseNumber || '?' }} / {{ record.totalDoses || '?' }} 剂
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <span
                  :class="`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(record.status)}`"
                >
                  {{ getStatusText(record.status) }}
                </span>
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
          </div>
        </div>
      </div>

      <div v-if="completedRecords.length > 0" class="bg-white rounded-3xl shadow-soft overflow-hidden">
        <div class="p-6 border-b border-border-light flex items-center gap-2">
          <span class="text-2xl">✅</span>
          <h3 class="text-lg font-bold text-primary">已完成接种</h3>
        </div>
        <div class="divide-y divide-border-light">
          <div
            v-for="record in completedRecords"
            :key="record.id"
            class="p-6 hover:bg-bg-hover transition-colors"
          >
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-2xl">
                  ✅
                </div>
                <div>
                  <p class="font-medium text-primary">{{ record.vaccineName }}</p>
                  <p class="text-sm text-secondary">
                    接种日期: {{ record.actualDate || record.scheduledDate }}
                    <span v-if="record.location"> · {{ record.location }}</span>
                  </p>
                  <p v-if="record.doseNumber || record.totalDoses" class="text-sm text-secondary mt-1">
                    第 {{ record.doseNumber || '?' }} / {{ record.totalDoses || '?' }} 剂
                    <span v-if="record.batchNumber"> · 批号: {{ record.batchNumber }}</span>
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div class="text-right">
                  <span
                    :class="`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(record.status)}`"
                  >
                    {{ getStatusText(record.status) }}
                  </span>
                  <p v-if="record.reactions" class="text-xs text-secondary mt-1">
                    反应: {{ record.reactions }}
                  </p>
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
        </div>
      </div>

      <div
        v-if="records.length === 0"
        class="text-center py-16 bg-white rounded-3xl shadow-soft"
      >
        <div class="text-6xl mb-4">💉</div>
        <h3 class="text-lg font-medium text-primary mb-2">暂无疫苗记录</h3>
        <p class="text-secondary mb-6">点击上方按钮添加第一条疫苗记录</p>
        <button
          @click="openAddForm"
          class="inline-flex items-center gap-2 px-6 py-3 bg-accent-soft text-white rounded-2xl hover:opacity-90 transition-all shadow-soft"
        >
          <span class="text-xl">➕</span>
          <span class="font-medium">添加第一条记录</span>
        </button>
      </div>
    </div>
  </div>
</template>
