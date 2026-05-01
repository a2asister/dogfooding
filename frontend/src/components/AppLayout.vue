<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { babyService } from '@/services/babyService'
import { recordService } from '@/services/recordService'
import type { BabyProfile } from '@/types'

const route = useRoute()
const router = useRouter()

const currentBaby = ref<BabyProfile | undefined>()
const babies = ref<BabyProfile[]>([])
const showBabySelector = ref(false)
const showMobileMenu = ref(false)
const unreadAlerts = ref(0)

const navItems = [
  { path: '/', name: '首页', icon: '🏠' },
  { path: '/babies', name: '宝宝档案', icon: '👶' },
  { path: '/sleep', name: '睡眠记录', icon: '😴' },
  { path: '/feeding', name: '喂养记录', icon: '🍼' },
  { path: '/vaccines', name: '疫苗记录', icon: '💉' },
  { path: '/checkups', name: '体检记录', icon: '🏥' },
  { path: '/growth', name: '成长数据', icon: '📈' },
  { path: '/reminders', name: '育儿提醒', icon: '🔔' },
  { path: '/diary', name: '成长日志', icon: '📝' },
  { path: '/albums', name: '相册存档', icon: '📷' },
  { path: '/settings', name: '设置', icon: '⚙️' }
]

const formatAge = (birthDate: string) => {
  return babyService.formatAge(birthDate)
}

const selectBaby = (baby: BabyProfile) => {
  babyService.setDefaultBaby(baby.id)
  currentBaby.value = baby
  showBabySelector.value = false
}

const addNewBaby = () => {
  showBabySelector.value = false
  router.push('/babies?action=add')
}

const loadBabies = () => {
  babies.value = babyService.getAllBabies()
  currentBaby.value = babyService.getDefaultBaby()
}

const loadUnreadAlerts = () => {
  if (currentBaby.value) {
    const alerts = recordService.getHealthAlerts(currentBaby.value.id)
    unreadAlerts.value = alerts.filter(a => !a.isAcknowledged).length
  }
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

onMounted(() => {
  loadBabies()
  loadUnreadAlerts()
})
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <header class="glass-effect sticky top-0 z-50 border-b border-white/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <button
              @click="toggleMobileMenu"
              class="lg:hidden p-2 rounded-xl hover:bg-white/50 transition-colors"
            >
              <span class="text-xl">☰</span>
            </button>
            <router-link
              to="/"
              class="flex items-center gap-2 text-xl font-bold text-primary"
            >
              <span class="text-2xl">👶</span>
              <span class="hidden sm:inline">婴幼儿管理系统</span>
            </router-link>
          </div>

          <div class="flex items-center gap-4">
            <div class="relative">
              <button
                @click="showBabySelector = !showBabySelector"
                class="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 hover:bg-white/90 transition-all shadow-soft"
              >
                <span class="text-2xl">{{ currentBaby ? '👶' : '➕' }}</span>
                <div class="text-left hidden sm:block">
                  <div class="text-sm font-medium text-primary">
                    {{ currentBaby?.name || '选择宝宝' }}
                  </div>
                  <div v-if="currentBaby" class="text-xs text-secondary">
                    {{ formatAge(currentBaby.birthDate) }}
                  </div>
                </div>
                <span class="text-xs text-secondary">▼</span>
              </button>

              <Transition name="scale">
                <div
                  v-if="showBabySelector"
                  class="absolute right-0 top-full mt-2 w-64 bg-white rounded-3xl shadow-floating border border-border-light overflow-hidden z-50"
                >
                  <div class="p-3">
                    <div class="text-xs font-medium text-secondary px-3 py-2">
                      我的宝宝
                    </div>
                    <div
                      v-for="baby in babies"
                      :key="baby.id"
                      @click="selectBaby(baby)"
                      class="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-bg-hover cursor-pointer transition-colors"
                      :class="{ 'bg-bg-hover': currentBaby?.id === baby.id }"
                    >
                      <span class="text-2xl">👶</span>
                      <div class="flex-1">
                        <div class="text-sm font-medium text-primary">{{ baby.name }}</div>
                        <div class="text-xs text-secondary">{{ formatAge(baby.birthDate) }}</div>
                      </div>
                      <span
                        v-if="currentBaby?.id === baby.id"
                        class="text-accent-soft"
                        >✓</span
                      >
                    </div>
                    <button
                      @click="addNewBaby"
                      class="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-bg-hover cursor-pointer transition-colors text-accent-soft"
                    >
                      <span class="text-2xl">➕</span>
                      <span class="text-sm font-medium">添加新宝宝</span>
                    </button>
                  </div>
                </div>
              </Transition>
            </div>

            <router-link
              to="/reminders"
              class="relative p-2 rounded-xl hover:bg-white/50 transition-colors"
            >
              <span class="text-xl">🔔</span>
              <span
                v-if="unreadAlerts > 0"
                class="absolute -top-1 -right-1 w-5 h-5 bg-red-400 text-white text-xs rounded-full flex items-center justify-center"
              >
                {{ unreadAlerts }}
              </span>
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <div class="flex flex-1">
      <aside
        class="hidden lg:block w-64 glass-effect border-r border-white/30"
      >
        <nav class="p-4 space-y-1">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
            :class="{
              'bg-white/70 shadow-soft text-primary': route.path === item.path,
              'text-secondary hover:bg-white/30 hover:text-primary': route.path !== item.path
            }"
          >
            <span class="text-xl">{{ item.icon }}</span>
            <span class="text-sm font-medium">{{ item.name }}</span>
          </router-link>
        </nav>
      </aside>

      <Transition name="slide-left">
        <div
          v-if="showMobileMenu"
          class="fixed inset-0 z-40 lg:hidden"
          @click="showMobileMenu = false"
        >
          <div class="absolute inset-0 bg-black/20"></div>
          <aside
            class="absolute left-0 top-0 bottom-0 w-72 glass-effect border-r border-white/30"
            @click.stop
          >
            <div class="p-4 border-b border-white/30">
              <div class="flex items-center gap-2 text-xl font-bold text-primary">
                <span class="text-2xl">👶</span>
                <span>婴幼儿管理系统</span>
              </div>
            </div>
            <nav class="p-4 space-y-1">
              <router-link
                v-for="item in navItems"
                :key="item.path"
                :to="item.path"
                @click="showMobileMenu = false"
                class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
                :class="{
                  'bg-white/70 shadow-soft text-primary': route.path === item.path,
                  'text-secondary hover:bg-white/30 hover:text-primary': route.path !== item.path
                }"
              >
                <span class="text-xl">{{ item.icon }}</span>
                <span class="text-sm font-medium">{{ item.name }}</span>
              </router-link>
            </nav>
          </aside>
        </div>
      </Transition>

      <main class="flex-1 overflow-x-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <slot></slot>
        </div>
      </main>
    </div>
  </div>
</template>
