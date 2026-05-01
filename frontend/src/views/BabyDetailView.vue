<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { babyService } from '@/services/babyService'
import { recordService } from '@/services/recordService'
import type { BabyProfile, SleepRecord, FeedingRecord, VaccineRecord, GrowthRecord, Milestone } from '@/types'

const route = useRoute()
const router = useRouter()

const baby = ref<BabyProfile | null>(null)
const sleepRecords = ref<SleepRecord[]>([])
const feedingRecords = ref<FeedingRecord[]>([])
const vaccineRecords = ref<VaccineRecord[]>([])
const growthRecords = ref<GrowthRecord[]>([])
const milestones = ref<Milestone[]>([])
const activeTab = ref('overview')

const loadData = () => {
  const babyId = route.params.id as string
  if (!babyId) {
    router.push('/babies')
    return
  }

  baby.value = babyService.getBabyById(babyId) || null
  if (!baby.value) {
    router.push('/babies')
    return
  }

  sleepRecords.value = recordService.getSleepRecords(babyId)
  feedingRecords.value = recordService.getFeedingRecords(babyId)
  vaccineRecords.value = recordService.getVaccineRecords(babyId)
  growthRecords.value = recordService.getGrowthRecords(babyId)
  milestones.value = recordService.getMilestones(babyId)
}

const formatAge = (birthDate: string) => {
  return babyService.formatAge(birthDate)
}

const getGenderIcon = (gender: string) => {
  switch (gender) {
    case 'male': return '👦'
    case 'female': return '👧'
    default: return '👶'
  }
}

const getGenderText = (gender: string) => {
  switch (gender) {
    case 'male': return '男宝宝'
    case 'female': return '女宝宝'
    default: return '宝宝'
  }
}

const getVaccineStatusClass = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-600'
    case 'scheduled': return 'bg-blue-100 text-blue-600'
    case 'missed': return 'bg-red-100 text-red-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

const getVaccineStatusText = (status: string) => {
  switch (status) {
    case 'completed': return '已完成'
    case 'scheduled': return '已预约'
    case 'missed': return '已错过'
    case 'cancelled': return '已取消'
    default: return status
  }
}

const achievedMilestones = computed(() => milestones.value.filter(m => m.isAchieved))
const pendingMilestones = computed(() => milestones.value.filter(m => !m.isAchieved))

const tabs = [
  { id: 'overview', name: '总览', icon: '📊' },
  { id: 'sleep', name: '睡眠', icon: '😴' },
  { id: 'feeding', name: '喂养', icon: '🍼' },
  { id: 'vaccines', name: '疫苗', icon: '💉' },
  { id: 'growth', name: '成长', icon: '📈' },
  { id: 'milestones', name: '里程碑', icon: '🏆' }
]

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <button
        @click="$router.back()"
        class="p-2 rounded-xl hover:bg-white/50 transition-colors"
      >
        <span class="text-xl">←</span>
      </button>
      <div>
        <h1 class="text-2xl font-bold text-primary">
          {{ baby ? `${baby.name} 的档案` : '宝宝详情' }}
        </h1>
        <p v-if="baby" class="text-secondary mt-1">
          {{ getGenderText(baby.gender) }} · {{ formatAge(baby.birthDate) }}
        </p>
      </div>
    </div>

    <div v-if="!baby" class="text-center py-16">
      <div class="text-6xl mb-4">🔍</div>
      <h3 class="text-lg font-medium text-primary mb-2">未找到宝宝信息</h3>
      <p class="text-secondary">请返回宝宝列表重新选择</p>
    </div>

    <div v-else class="space-y-6">
      <div class="bg-white rounded-3xl shadow-soft p-6">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <div class="w-24 h-24 rounded-full bg-gradient-to-br from-accent-soft/30 to-accent-cool/30 flex items-center justify-center text-5xl">
            {{ getGenderIcon(baby.gender) }}
          </div>
          <div class="flex-1 text-center md:text-left">
            <div class="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h2 class="text-2xl font-bold text-primary">{{ baby.name }}</h2>
              <span
                v-if="baby.nickname"
                class="px-3 py-1 rounded-full bg-accent-soft/20 text-accent-soft text-sm"
              >
                {{ baby.nickname }}
              </span>
            </div>
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-secondary">
              <span>🎂 出生日期: {{ baby.birthDate.split('T')[0] }}</span>
              <span v-if="baby.birthTime">⏰ 出生时间: {{ baby.birthTime }}</span>
              <span>👶 年龄: {{ formatAge(baby.birthDate) }}</span>
            </div>
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-secondary mt-2">
              <span v-if="baby.birthWeight">⚖️ 出生体重: {{ baby.birthWeight }}kg</span>
              <span v-if="baby.birthHeight">📏 出生身高: {{ baby.birthHeight }}cm</span>
              <span v-if="baby.bloodType && baby.bloodType !== 'unknown'">🩸 血型: {{ baby.bloodType }} 型</span>
            </div>
          </div>
        </div>
        <div v-if="baby.notes" class="mt-6 pt-6 border-t border-border-light">
          <p class="text-sm text-secondary">
            <span class="font-medium text-primary">备注:</span> {{ baby.notes }}
          </p>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-4">
        <div class="bg-white rounded-2xl shadow-soft p-5 cursor-pointer hover:shadow-medium transition-all" @click="activeTab = 'sleep'">
          <div class="flex items-center justify-between mb-3">
            <span class="text-2xl">😴</span>
            <span class="text-2xl font-bold text-primary">{{ sleepRecords.length }}</span>
          </div>
          <p class="text-sm text-secondary">睡眠记录</p>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5 cursor-pointer hover:shadow-medium transition-all" @click="activeTab = 'feeding'">
          <div class="flex items-center justify-between mb-3">
            <span class="text-2xl">🍼</span>
            <span class="text-2xl font-bold text-primary">{{ feedingRecords.length }}</span>
          </div>
          <p class="text-sm text-secondary">喂养记录</p>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5 cursor-pointer hover:shadow-medium transition-all" @click="activeTab = 'vaccines'">
          <div class="flex items-center justify-between mb-3">
            <span class="text-2xl">💉</span>
            <span class="text-2xl font-bold text-primary">{{ vaccineRecords.length }}</span>
          </div>
          <p class="text-sm text-secondary">疫苗记录</p>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5 cursor-pointer hover:shadow-medium transition-all" @click="activeTab = 'growth'">
          <div class="flex items-center justify-between mb-3">
            <span class="text-2xl">📈</span>
            <span class="text-2xl font-bold text-primary">{{ growthRecords.length }}</span>
          </div>
          <p class="text-sm text-secondary">成长记录</p>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-soft overflow-hidden">
        <div class="flex overflow-x-auto border-b border-border-light">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2"
            :class="{
              'border-accent-soft text-accent-soft': activeTab === tab.id,
              'border-transparent text-secondary hover:text-primary': activeTab !== tab.id
            }"
          >
            <span>{{ tab.icon }}</span>
            <span>{{ tab.name }}</span>
          </button>
        </div>

        <div class="p-6">
          <div v-if="activeTab === 'overview'" class="space-y-6">
            <div>
              <h3 class="text-lg font-bold text-primary mb-4">最近活动</h3>
              <div v-if="sleepRecords.length === 0 && feedingRecords.length === 0" class="text-center py-8 text-secondary">
                暂无活动记录
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="record in sleepRecords.slice(0, 3)"
                  :key="record.id"
                  class="flex items-center gap-4 p-4 rounded-2xl bg-bg-hover"
                >
                  <span class="text-2xl">😴</span>
                  <div class="flex-1">
                    <p class="font-medium text-primary">睡眠记录</p>
                    <p class="text-sm text-secondary">
                      {{ new Date(record.startTime).toLocaleString('zh-CN') }}
                      <span v-if="record.duration"> · 持续 {{ record.duration }} 分钟</span>
                    </p>
                  </div>
                </div>
                <div
                  v-for="record in feedingRecords.slice(0, 3)"
                  :key="record.id"
                  class="flex items-center gap-4 p-4 rounded-2xl bg-bg-hover"
                >
                  <span class="text-2xl">🍼</span>
                  <div class="flex-1">
                    <p class="font-medium text-primary">
                      {{ record.type === 'breastfeeding' ? '母乳喂养' :
                         record.type === 'formula' ? '配方奶' :
                         record.type === 'solid' ? '辅食' : '混合喂养' }}
                    </p>
                    <p class="text-sm text-secondary">
                      {{ new Date(record.startTime).toLocaleString('zh-CN') }}
                      <span v-if="record.amount"> · {{ record.amount }}{{ record.unit }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'sleep'" class="space-y-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-primary">睡眠记录</h3>
              <button
                @click="$router.push(`/sleep?babyId=${baby.id}`)"
                class="px-4 py-2 rounded-xl bg-accent-soft text-white text-sm hover:opacity-90 transition-all"
              >
                添加记录
              </button>
            </div>
            <div v-if="sleepRecords.length === 0" class="text-center py-12">
              <div class="text-5xl mb-3">😴</div>
              <p class="text-secondary">暂无睡眠记录</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="record in sleepRecords"
                :key="record.id"
                class="flex items-center justify-between p-4 rounded-2xl bg-bg-hover"
              >
                <div class="flex items-center gap-4">
                  <span class="text-2xl">😴</span>
                  <div>
                    <p class="font-medium text-primary">
                      {{ new Date(record.startTime).toLocaleDateString('zh-CN') }}
                    </p>
                    <p class="text-sm text-secondary">
                      {{ new Date(record.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}
                      <span v-if="record.endTime"> - {{ new Date(record.endTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}</span>
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <span v-if="record.duration" class="text-sm font-medium text-primary">
                    {{ Math.floor(record.duration / 60) }}h {{ record.duration % 60 }}m
                  </span>
                  <span
                    v-if="record.quality"
                    class="block text-xs text-secondary mt-1"
                  >
                    {{ record.quality === 'excellent' ? '很好' :
                       record.quality === 'good' ? '良好' :
                       record.quality === 'fair' ? '一般' : '较差' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'feeding'" class="space-y-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-primary">喂养记录</h3>
              <button
                @click="$router.push(`/feeding?babyId=${baby.id}`)"
                class="px-4 py-2 rounded-xl bg-accent-soft text-white text-sm hover:opacity-90 transition-all"
              >
                添加记录
              </button>
            </div>
            <div v-if="feedingRecords.length === 0" class="text-center py-12">
              <div class="text-5xl mb-3">🍼</div>
              <p class="text-secondary">暂无喂养记录</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="record in feedingRecords"
                :key="record.id"
                class="flex items-center justify-between p-4 rounded-2xl bg-bg-hover"
              >
                <div class="flex items-center gap-4">
                  <span class="text-2xl">
                    {{ record.type === 'breastfeeding' ? '🤱' :
                       record.type === 'formula' ? '🍼' :
                       record.type === 'solid' ? '🥣' : '🍼' }}
                  </span>
                  <div>
                    <p class="font-medium text-primary">
                      {{ record.type === 'breastfeeding' ? '母乳喂养' :
                         record.type === 'formula' ? '配方奶' :
                         record.type === 'solid' ? '辅食' : '混合喂养' }}
                    </p>
                    <p class="text-sm text-secondary">
                      {{ new Date(record.startTime).toLocaleString('zh-CN') }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <span v-if="record.amount" class="text-sm font-medium text-primary">
                    {{ record.amount }}{{ record.unit }}
                  </span>
                  <span
                    v-if="record.side"
                    class="block text-xs text-secondary mt-1"
                  >
                    {{ record.side === 'left' ? '左侧' : record.side === 'right' ? '右侧' : '双侧' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'vaccines'" class="space-y-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-primary">疫苗记录</h3>
              <button
                @click="$router.push(`/vaccines?babyId=${baby.id}`)"
                class="px-4 py-2 rounded-xl bg-accent-soft text-white text-sm hover:opacity-90 transition-all"
              >
                添加记录
              </button>
            </div>
            <div v-if="vaccineRecords.length === 0" class="text-center py-12">
              <div class="text-5xl mb-3">💉</div>
              <p class="text-secondary">暂无疫苗记录</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="record in vaccineRecords"
                :key="record.id"
                class="flex items-center justify-between p-4 rounded-2xl bg-bg-hover"
              >
                <div class="flex items-center gap-4">
                  <span class="text-2xl">💉</span>
                  <div>
                    <p class="font-medium text-primary">{{ record.vaccineName }}</p>
                    <p class="text-sm text-secondary">
                      预约: {{ record.scheduledDate }}
                      <span v-if="record.actualDate"> · 实际: {{ record.actualDate }}</span>
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <span
                    :class="`px-3 py-1 rounded-full text-xs font-medium ${getVaccineStatusClass(record.status)}`"
                  >
                    {{ getVaccineStatusText(record.status) }}
                  </span>
                  <span
                    v-if="record.doseNumber"
                    class="block text-xs text-secondary mt-1"
                  >
                    第 {{ record.doseNumber }} / {{ record.totalDoses || record.doseNumber }} 剂
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'growth'" class="space-y-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-primary">成长记录</h3>
              <button
                @click="$router.push(`/growth?babyId=${baby.id}`)"
                class="px-4 py-2 rounded-xl bg-accent-soft text-white text-sm hover:opacity-90 transition-all"
              >
                添加记录
              </button>
            </div>
            <div v-if="growthRecords.length === 0" class="text-center py-12">
              <div class="text-5xl mb-3">📈</div>
              <p class="text-secondary">暂无成长记录</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="record in growthRecords"
                :key="record.id"
                class="flex items-center justify-between p-4 rounded-2xl bg-bg-hover"
              >
                <div class="flex items-center gap-4">
                  <span class="text-2xl">📏</span>
                  <div>
                    <p class="font-medium text-primary">{{ record.recordDate }}</p>
                    <p class="text-sm text-secondary">
                      <span v-if="record.weight">体重: {{ record.weight }}kg</span>
                      <span v-if="record.weight && record.height"> · </span>
                      <span v-if="record.height">身高: {{ record.height }}cm</span>
                    </p>
                  </div>
                </div>
                <div class="text-right text-sm">
                  <span v-if="record.bmi" class="font-medium text-primary">
                    BMI: {{ record.bmi.toFixed(1) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'milestones'" class="space-y-6">
            <div class="grid gap-6 md:grid-cols-2">
              <div>
                <h3 class="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <span>✅</span> 已达成 ({{ achievedMilestones.length }})
                </h3>
                <div
                  v-if="achievedMilestones.length === 0"
                  class="text-center py-8 text-secondary"
                >
                  暂未达成里程碑
                </div>
                <div v-else class="space-y-3">
                  <div
                    v-for="milestone in achievedMilestones"
                    :key="milestone.id"
                    class="p-4 rounded-2xl bg-green-50 border border-green-100"
                  >
                    <p class="font-medium text-green-700">{{ milestone.title }}</p>
                    <p class="text-sm text-green-600 mt-1">
                      预期月龄: {{ milestone.expectedAgeMonths }} 个月
                      <span v-if="milestone.actualDate"> · 达成日期: {{ milestone.actualDate }}</span>
                    </p>
                    <p v-if="milestone.description" class="text-sm text-green-600 mt-2">
                      {{ milestone.description }}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <span>⏳</span> 待达成 ({{ pendingMilestones.length }})
                </h3>
                <div
                  v-if="pendingMilestones.length === 0"
                  class="text-center py-8 text-secondary"
                >
                  太棒了！所有里程碑都已达成
                </div>
                <div v-else class="space-y-3">
                  <div
                    v-for="milestone in pendingMilestones"
                    :key="milestone.id"
                    class="p-4 rounded-2xl bg-bg-hover"
                  >
                    <p class="font-medium text-primary">{{ milestone.title }}</p>
                    <p class="text-sm text-secondary mt-1">
                      预期月龄: {{ milestone.expectedAgeMonths }} 个月
                    </p>
                    <p v-if="milestone.description" class="text-sm text-secondary mt-2">
                      {{ milestone.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
