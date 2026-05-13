<template>
  <div class="pets-view">
    <div class="pets-header">
      <h1>我的宠物</h1>
      <button class="btn btn-primary" @click="showCreateModal = true">+ 添加宠物</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="pets && pets.length === 0" class="empty-state">
      <div class="empty-icon">🐾</div>
      <p>还没有宠物档案，快去创建一个吧！</p>
      <button class="btn btn-primary" @click="showCreateModal = true">创建第一个宠物</button>
    </div>

    <div v-else class="pets-grid">
      <router-link v-for="pet in pets" :key="pet.id" :to="`/pet/${pet.id}`" class="pet-card">
        <div class="pet-avatar">
          {{ getPetEmoji(pet.species) }}
        </div>
        <div class="pet-info">
          <h3>{{ pet.name }}</h3>
          <p>{{ pet.breed }}</p>
          <p class="pet-birthday">🎂 {{ pet.birthday }}</p>
        </div>
        <div class="pet-stats">
          <span v-if="pet.weight" class="stat">{{ pet.weight }}kg</span>
          <span class="stat">{{ (pet.photos?.length || 0) }} 照片</span>
        </div>
      </router-link>
    </div>

    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal">
        <h2>添加新宠物</h2>
        <form @submit.prevent="createPet">
          <div class="form-group">
            <label>宠物名称</label>
            <input v-model="newPet.name" required placeholder="给毛孩子起个名字" />
          </div>
          <div class="form-group">
            <label>物种</label>
            <select v-model="newPet.species" required>
              <option value="dog">🐕 狗狗</option>
              <option value="cat">🐱 猫咪</option>
              <option value="rabbit">🐰 兔子</option>
              <option value="hamster">🐹 仓鼠</option>
              <option value="other">🐾 其他</option>
            </select>
          </div>
          <div class="form-group">
            <label>品种</label>
            <input v-model="newPet.breed" required placeholder="例如：金毛、布偶" />
          </div>
          <div class="form-group">
            <label>生日</label>
            <input v-model="newPet.birthday" type="date" required />
          </div>
          <div class="form-group">
            <label>性别</label>
            <select v-model="newPet.gender">
              <option value="male">♂ 男生</option>
              <option value="female">♀ 女生</option>
            </select>
          </div>
          <div class="form-group">
            <label>体重 (kg)</label>
            <input v-model.number="newPet.weight" type="number" step="0.1" placeholder="0.0" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showCreateModal = false">取消</button>
            <button type="submit" class="btn btn-primary">创建</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { useRouter } from 'vue-router'
import { GET_PETS } from '../graphql/queries'
import { CREATE_PET } from '../graphql/mutations'
import type { Pet } from '../types'

const router = useRouter()
const showCreateModal = ref(false)
const newPet = ref({
  name: '',
  species: 'dog',
  breed: '',
  birthday: '',
  gender: 'male',
  weight: undefined as number | undefined,
})

const { result, loading, refetch } = useQuery(GET_PETS)
const pets = ref<Pet[]>([])

const { mutate: createPetMutate } = useMutation(CREATE_PET)

onMounted(() => {
  if (result.value) {
    pets.value = result.value.pets
  }
})

result.value && result.value.pets && (pets.value = result.value.pets)

async function createPet() {
  try {
    await createPetMutate({ createPetInput: newPet.value })
    showCreateModal.value = false
    newPet.value = {
      name: '',
      species: 'dog',
      breed: '',
      birthday: '',
      gender: 'male',
      weight: undefined,
    }
    await refetch()
    pets.value = result.value?.pets || []
  } catch (error) {
    console.error('创建宠物失败:', error)
  }
}

function getPetEmoji(species: string): string {
  const emojis: Record<string, string> = {
    dog: '🐕',
    cat: '🐱',
    rabbit: '🐰',
    hamster: '🐹',
    other: '🐾',
  }
  return emojis[species] || '🐾'
}
</script>

<style scoped>
.pets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.pets-header h1 {
  color: white;
  font-size: 32px;
}

.loading {
  text-align: center;
  color: white;
  font-size: 18px;
  padding: 40px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: white;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-state p {
  font-size: 18px;
  margin-bottom: 20px;
  opacity: 0.8;
}

.pets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.pet-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s, box-shadow 0.3s;
}

.pet-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.pet-avatar {
  font-size: 60px;
  text-align: center;
  margin-bottom: 15px;
}

.pet-info h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 5px;
  text-align: center;
}

.pet-info p {
  color: #666;
  text-align: center;
  margin-bottom: 5px;
}

.pet-birthday {
  font-size: 14px;
  color: #888;
}

.pet-stats {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.stat {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 30px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  margin-bottom: 20px;
  color: #333;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
