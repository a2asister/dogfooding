<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './components/AppLayout.vue'
import StageAnimation from './components/StageAnimation.vue'
import { babyService } from './services/babyService'
import type { BabyProfile } from './types'

const route = useRoute()
const currentBaby = ref<BabyProfile | undefined>()
const showAnimation = ref(true)

const updateCurrentBaby = () => {
  currentBaby.value = babyService.getDefaultBaby()
}

const toggleAnimation = () => {
  showAnimation.value = !showAnimation.value
}

onMounted(() => {
  updateCurrentBaby()
})

watch(
  () => route.path,
  () => {
    updateCurrentBaby()
  }
)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Transition name="fade" mode="out-in">
      <StageAnimation
        v-if="showAnimation && currentBaby"
        :baby="currentBaby"
        class="fixed inset-0 pointer-events-none z-0"
      />
    </Transition>
    <AppLayout>
      <router-view v-slot="{ Component }">
        <Transition name="slide-up" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </AppLayout>
  </div>
</template>
