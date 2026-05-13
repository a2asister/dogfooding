<template>
  <div class="pet-detail" v-if="pet">
    <div class="pet-header card">
      <div class="pet-main-info">
        <div class="pet-avatar-large">{{ getPetEmoji(pet.species) }}</div>
        <div>
          <h1>{{ pet.name }}</h1>
          <p class="pet-breed">{{ pet.breed }}</p>
          <div class="pet-meta">
            <span>🎂 {{ pet.birthday }}</span>
            <span v-if="pet.gender"> {{ pet.gender === 'male' ? '♂' : '♀' }}</span>
            <span v-if="pet.weight"> ⚖️ {{ pet.weight }}kg</span>
          </div>
        </div>
      </div>
    </div>

    <div class="tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'photos' }"
        @click="activeTab = 'photos'"
      >
        📸 照片
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'growth' }"
        @click="activeTab = 'growth'"
      >
        📈 成长
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'records' }"
        @click="activeTab = 'records'"
      >
        📝 记录
      </button>
    </div>

    <div v-show="activeTab === 'photos'" class="tab-content">
      <div class="section-header">
        <h2>照片墙</h2>
        <button class="btn btn-primary" @click="showAddPhoto = true">+ 添加照片</button>
      </div>
      <PhotoCarousel3D :photos="pet.photos || []" />
    </div>

    <div v-show="activeTab === 'growth'" class="tab-content">
      <div class="section-header">
        <h2>成长曲线</h2>
        <button class="btn btn-primary" @click="showAddRecord = true">+ 添加记录</button>
      </div>
      <GrowthCurve :records="pet.growthRecords || []" />
    </div>

    <div v-show="activeTab === 'records'" class="tab-content">
      <div class="section-header">
        <h2>成长日记</h2>
      </div>
      <div class="records-list">
        <div v-for="record in pet.growthRecords" :key="record.id" class="record-card">
          <div class="record-date">📅 {{ record.date }}</div>
          <div class="record-stats">
            <span v-if="record.weight">⚖️ {{ record.weight }}kg</span>
            <span v-if="record.height">📏 {{ record.height }}cm</span>
          </div>
          <p v-if="record.note" class="record-note">{{ record.note }}</p>
          <div v-if="record.milestone" class="record-milestone">🌟 {{ record.milestone }}</div>
        </div>
        <div v-if="!pet.growthRecords?.length" class="empty-records">
          还没有成长记录，快去添加一个吧！
        </div>
      </div>
    </div>

    <div v-if="showAddPhoto" class="modal-overlay" @click.self="showAddPhoto = false">
      <div class="modal">
        <h2>添加照片</h2>
        <form @submit.prevent="addPhoto">
          <div class="form-group">
            <label>照片URL</label>
            <input v-model="newPhoto.url" required placeholder="输入图片链接" />
          </div>
          <div class="form-group">
            <label>描述</label>
            <input v-model="newPhoto.description" placeholder="记录这张照片的故事" />
          </div>
          <div class="form-group">
            <label>日期</label>
            <input v-model="newPhoto.date" type="date" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showAddPhoto = false">取消</button>
            <button type="submit" class="btn btn-primary">添加</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showAddRecord" class="modal-overlay" @click.self="showAddRecord = false">
      <div class="modal">
        <h2>添加成长记录</h2>
        <form @submit.prevent="addGrowthRecord">
          <div class="form-group">
            <label>日期</label>
            <input v-model="newRecord.date" type="date" required />
          </div>
          <div class="form-group">
            <label>体重 (kg)</label>
            <input v-model.number="newRecord.weight" type="number" step="0.1" />
          </div>
          <div class="form-group">
            <label>身高 (cm)</label>
            <input v-model.number="newRecord.height" type="number" step="0.1" />
          </div>
          <div class="form-group">
            <label>备注</label>
            <textarea v-model="newRecord.note" rows="3" placeholder="记录今天的小趣事"></textarea>
          </div>
          <div class="form-group">
            <label>里程碑</label>
            <input v-model="newRecord.milestone" placeholder="例如：第一次出门、学会握手..." />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showAddRecord = false">取消</button>
            <button type="submit" class="btn btn-primary">添加</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { GET_PET } from '../graphql/queries'
import { ADD_PHOTO, ADD_GROWTH_RECORD } from '../graphql/mutations'
import type { Pet } from '../types'
import PhotoCarousel3D from '../components/PhotoCarousel3D.vue'
import GrowthCurve from '../components/GrowthCurve.vue'

const route = useRoute()
const petId = Number(route.params.id)
const activeTab = ref('photos')
const showAddPhoto = ref(false)
const showAddRecord = ref(false)

const newPhoto = ref({
  url: '',
  description: '',
  date: '',
})

const newRecord = ref({
  date: '',
  weight: undefined as number | undefined,
  height: undefined as number | undefined,
  note: '',
  milestone: '',
})

const { result, refetch } = useQuery(GET_PET, { id: petId })
const pet = ref<Pet | null>(null)

const { mutate: addPhotoMutate } = useMutation(ADD_PHOTO)
const { mutate: addRecordMutate } = useMutation(ADD_GROWTH_RECORD)

onMounted(() => {
  if (result.value) {
    pet.value = result.value.pet
  }
})

result.value && result.value.pet && (pet.value = result.value.pet)

async function addPhoto() {
  try {
    await addPhotoMutate({
      createPhotoInput: {
        petId,
        ...newPhoto.value,
      },
    })
    showAddPhoto.value = false
    newPhoto.value = { url: '', description: '', date: '' }
    await refetch()
    pet.value = result.value?.pet || null
  } catch (error) {
    console.error('添加照片失败:', error)
  }
}

async function addGrowthRecord() {
  try {
    await addRecordMutate({
      createGrowthRecordInput: {
        petId,
        ...newRecord.value,
      },
    })
    showAddRecord.value = false
    newRecord.value = {
      date: '',
      weight: undefined,
      height: undefined,
      note: '',
      milestone: '',
    }
    await refetch()
    pet.value = result.value?.pet || null
  } catch (error) {
    console.error('添加成长记录失败:', error)
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
.pet-header {
  margin-bottom: 20px;
}

.pet-main-info {
  display: flex;
  align-items: center;
  gap: 30px;
}

.pet-avatar-large {
  font-size: 100px;
  animation: breathe 3s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.pet-main-info h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 5px;
}

.pet-breed {
  font-size: 18px;
  color: #666;
  margin-bottom: 10px;
}

.pet-meta {
  display: flex;
  gap: 20px;
  color: #888;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: white;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.tab-btn:hover:not(.active) {
  background: #f0f0f0;
}

.tab-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  color: #333;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.record-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.3s;
}

.record-card:hover {
  transform: translateX(10px);
}

.record-date {
  font-weight: 600;
  color: #667eea;
  margin-bottom: 10px;
}

.record-stats {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.record-stats span {
  background: white;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.record-note {
  color: #555;
  margin-bottom: 8px;
}

.record-milestone {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #d46a2f;
  padding: 8px 15px;
  border-radius: 8px;
  font-weight: 600;
  display: inline-block;
}

.empty-records {
  text-align: center;
  padding: 40px;
  color: #888;
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
