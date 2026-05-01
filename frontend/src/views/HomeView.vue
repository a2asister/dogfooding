<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { babyService } from '@/services/babyService'
import { recordService } from '@/services/recordService'
import type { BabyProfile, SleepRecord, FeedingRecord, VaccineRecord, Reminder, HealthAlert, Milestone } from '@/types'

const router = useRouter()

const currentBaby = ref<BabyProfile | undefined>()
const babies = ref<BabyProfile[]>([])
const todaySleepRecords = ref<SleepRecord[]>([])
const todayFeedingRecords = ref<FeedingRecord[]>([])
const upcomingVaccines = ref<VaccineRecord[]>([])
const upcomingReminders = ref<Reminder[]>([])
const unreadAlerts = ref<HealthAlert[]>([])
const milestones = ref<Milestone[]>([])

const loadData = () => {
  babies.value = babyService.getAllBabies()
  currentBaby.value = babyService.getDefaultBaby()

  if (currentBaby.value) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const sleepRecords = recordService.getSleepRecords(currentBaby.value.id)
    todaySleepRecords.value = sleepRecords.filter(r => {
      const recordDate = new Date(r.startTime)
      return recordDate >= today && recordDate < tomorrow
    })

    const feedingRecords = recordService.getFeedingRecords(currentBaby.value.id)
    todayFeedingRecords.value = feedingRecords.filter(r => {
      const recordDate = new Date(r.startTime)
      return recordDate >= today && recordDate < tomorrow
    })

    const vaccineRecords = recordService.getVaccineRecords(currentBaby.value.id)
    upcomingVaccines.value = vaccineRecords
      .filter(v => v.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .slice(0, 3)

    const reminders = recordService.getReminders(currentBaby.value.id)
    upcomingReminders.value = reminders
      .filter(r => r.isEnabled && !r.isCompleted)
      .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
      .slice(0, 3)

    const alerts = recordService.getHealthAlerts(currentBaby.value.id)
    unreadAlerts.value = alerts.filter(a => !a.isAcknowledged)

    milestones.value = recordService.getMilestones(currentBaby.value.id)
  }
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

const totalSleepDuration = computed(() => {
  return todaySleepRecords.value.reduce((sum, r) => sum + (r.duration || 0), 0)
})

const totalFeedingAmount = computed(() => {
  return todayFeedingRecords.value.reduce((sum, r) => sum + (r.amount || 0), 0)
})

const achievedMilestones = computed(() => milestones.value.filter(m => m.isAchieved).length)
const totalMilestones = computed(() => milestones.value.length)

const quickActions = [
  { name: '睡眠记录', icon: '😴', path: '/sleep', color: 'from-indigo-200 to-blue-200' },
  { name: '喂养记录', icon: '🍼', path: '/feeding', color: 'from-pink-200 to-red-200' },
  { name: '疫苗记录', icon: '💉', path: '/vaccines', color: 'from-green-200 to-emerald-200' },
  { name: '成长数据', icon: '📈', path: '/growth', color: 'from-yellow-200 to-orange-200' }
]

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-primary">
          👋 早上好，育儿达人！
        </h1>
        <p class="text-secondary mt-1">
          {{ new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
        </p>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="unreadAlerts.length > 0" class="space-y-3">
        <div
          v-for="alert in unreadAlerts"
          :key="alert.id"
          class="flex items-center gap-4 p-4 rounded-2xl bg-red-50 border border-red-200"
        >
          <span class="text-2xl">
            {{ alert.severity === 'high' ? '🚨' : alert.severity === 'medium' ? '⚠️' : 'ℹ️' }}
          </span>
          <div class="flex-1">
            <p class="font-medium text-red-800">{{ alert.title }}</p>
            <p class="text-sm text-red-600">{{ alert.description }}</p>
          </div>
          <button
            class="px-3 py-1 rounded-xl bg-white text-red-600 text-sm hover:bg-red-100 transition-colors"
          >
            查看
          </button>
        </div>
      </div>
    </Transition>

    <div
      v-if="!currentBaby"
      class="bg-gradient-to-br from-accent-soft/20 to-accent-cool/20 rounded-3xl p-8 text-center"
    >
      <div class="text-6xl mb-4">👶</div>
      <h2 class="text-xl font-bold text-primary mb-2">还没有添加宝宝</h2>
      <p class="text-secondary mb-6">开始记录您宝宝的成长旅程吧！</p>
      <button
        @click="$router.push('/babies?action=add')"
        class="inline-flex items-center gap-2 px-6 py-3 bg-accent-soft text-white rounded-2xl hover:opacity-90 transition-all shadow-soft"
      >
        <span class="text-xl">➕</span>
        <span class="font-medium">添加第一个宝宝</span>
      </button>
    </div>

    <TransitionGroup name="slide-up">
      <div v-if="currentBaby" class="space-y-6">
        <div class="bg-white rounded-3xl shadow-soft p-6">
          <div class="flex flex-col md:flex-row items-center gap-6">
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-accent-soft/30 to-accent-cool/30 flex items-center justify-center text-4xl">
              {{ getGenderIcon(currentBaby.gender) }}
            </div>
            <div class="flex-1 text-center md:text-left">
              <div class="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h2 class="text-2xl font-bold text-primary">{{ currentBaby.name }}</h2>
                <span class="px-3 py-1 rounded-full bg-accent-soft/20 text-accent-soft text-sm">
                  {{ formatAge(currentBaby.birthDate) }}
                </span>
              </div>
              <div class="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-secondary">
                <span>🎂 {{ currentBaby.birthDate.split('T')[0] }}</span>
                <span v-if="currentBaby.birthWeight">⚖️ {{ currentBaby.birthWeight }}kg</span>
                <span v-if="currentBaby.birthHeight">📏 {{ currentBaby.birthHeight }}cm</span>
              </div>
            </div>
            <button
              @click="$router.push(`/babies/${currentBaby.id}`)"
              class="px-4 py-2 rounded-xl bg-bg-hover text-primary text-sm hover:bg-bg-hover/80 transition-colors"
            >
              查看详情 →
            </button>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            v-for="action in quickActions"
            :key="action.path"
            @click="$router.push(action.path)"
            class="bg-white rounded-2xl shadow-soft p-5 hover:shadow-medium transition-all text-left"
          >
            <div
              :class="`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl mb-3`"
            >
              {{ action.icon }}
            </div>
            <p class="font-medium text-primary">{{ action.name }}</p>
          </button>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <div class="bg-white rounded-3xl shadow-soft p-6">
            <h3 class="text-lg font-bold text-primary mb-4">今日概览</h3>
            <div class="grid gap-4 grid-cols-2">
              <div class="p-4 rounded-2xl bg-indigo-50">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xl">😴</span>
                  <span class="text-sm text-secondary">今日睡眠</span>
                </div>
                <p class="text-2xl font-bold text-primary">
                  {{ Math.floor(totalSleepDuration / 60) }}h {{ totalSleepDuration % 60 }}m
                </p>
                <p class="text-sm text-secondary mt-1">{{ todaySleepRecords.length }} 次</p>
              </div>
              <div class="p-4 rounded-2xl bg-pink-50">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xl">🍼</span>
                  <span class="text-sm text-secondary">今日喂养</span>
                </div>
                <p class="text-2xl font-bold text-primary">
                  {{ totalFeedingAmount || '-' }}
                  <span class="text-sm font-normal">{{ todayFeedingRecords[0]?.unit || 'ml' }}</span>
                </p>
                <p class="text-sm text-secondary mt-1">{{ todayFeedingRecords.length }} 次</p>
              </div>
              <div class="p-4 rounded-2xl bg-green-50">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xl">💉</span>
                  <span class="text-sm text-secondary">待接种疫苗</span>
                </div>
                <p class="text-2xl font-bold text-primary">{{ upcomingVaccines.length }}</p>
                <p class="text-sm text-secondary mt-1">
                  {{ upcomingVaccines[0]?.vaccineName || '暂无计划' }}
                </p>
              </div>
              <div class="p-4 rounded-2xl bg-yellow-50">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xl">🏆</span>
                  <span class="text-sm text-secondary">里程碑</span>
                </div>
                <p class="text-2xl font-bold text-primary">{{ achievedMilestones }}/{{ totalMilestones }}</p>
                <p class="text-sm text-secondary mt-1">已达成</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-3xl shadow-soft p-6">
            <h3 class="text-lg font-bold text-primary mb-4">即将到来</h3>
            <div v-if="upcomingVaccines.length === 0 && upcomingReminders.length === 0" class="text-center py-8">
              <div class="text-5xl mb-3">✨</div>
              <p class="text-secondary">近期没有安排</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="vaccine in upcomingVaccines"
                :key="vaccine.id"
                class="flex items-center gap-4 p-4 rounded-2xl bg-bg-hover"
              >
                <span class="text-2xl">💉</span>
                <div class="flex-1">
                  <p class="font-medium text-primary">{{ vaccine.vaccineName }}</p>
                  <p class="text-sm text-secondary">预约日期: {{ vaccine.scheduledDate }}</p>
                </div>
                <span class="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs">
                  待接种
                </span>
              </div>
              <div
                v-for="reminder in upcomingReminders"
                :key="reminder.id"
                class="flex items-center gap-4 p-4 rounded-2xl bg-bg-hover"
              >
                <span class="text-2xl">
                  {{ reminder.type === 'vaccine' ? '💉' :
                     reminder.type === 'checkup' ? '🏥' :
                     reminder.type === 'feeding' ? '🍼' :
                     reminder.type === 'medication' ? '💊' : '📋' }}
                </span>
                <div class="flex-1">
                  <p class="font-medium text-primary">{{ reminder.title }}</p>
                  <p class="text-sm text-secondary">
                    {{ new Date(reminder.scheduledTime).toLocaleString('zh-CN') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="babies.length > 1"
          class="bg-white rounded-3xl shadow-soft p-6"
        >
          <h3 class="text-lg font-bold text-primary mb-4">我的宝宝</h3>
          <div class="flex gap-4 overflow-x-auto pb-2">
            <button
              v-for="baby in babies"
              :key="baby.id"
              @click="$router.push(`/babies/${baby.id}`)"
              class="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-bg-hover transition-colors min-w-[100px]"
              :class="{ 'bg-bg-hover': currentBaby?.id === baby.id }"
            >
              <div class="w-14 h-14 rounded-full bg-gradient-to-br from-accent-soft/30 to-accent-cool/30 flex items-center justify-center text-2xl">
                {{ getGenderIcon(baby.gender) }}
              </div>
              <span class="font-medium text-primary text-sm">{{ baby.name }}</span>
              <span class="text-xs text-secondary">{{ formatAge(baby.birthDate) }}</span>
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>
