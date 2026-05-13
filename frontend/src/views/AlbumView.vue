<template>
  <div class="album-view">
    <h1 class="album-title">📖 宠物相册</h1>
    <div class="album-content">
      <PhotoBook :pets="pets" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { GET_PETS } from '../graphql/queries'
import type { Pet } from '../types'
import PhotoBook from '../components/PhotoBook.vue'

const { result } = useQuery(GET_PETS)
const pets = ref<Pet[]>([])

onMounted(() => {
  if (result.value) {
    pets.value = result.value.pets
  }
})

result.value && result.value.pets && (pets.value = result.value.pets)
</script>

<style scoped>
.album-view {
  min-height: 100vh;
}

.album-title {
  text-align: center;
  color: white;
  font-size: 36px;
  margin-bottom: 40px;
}

.album-content {
  max-width: 1000px;
  margin: 0 auto;
}
</style>
