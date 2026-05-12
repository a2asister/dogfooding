<template>
  <div class="gallery-container">
    <div class="gallery-header">
      <h2>🎨 我的创作</h2>
      <div class="category-filter">
        <button 
          v-for="cat in categories" 
          :key="cat"
          @click="currentCategory = cat"
          :class="{ active: currentCategory === cat }"
          class="category-btn"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <div class="gallery-grid">
      <div v-for="artwork in filteredArtworks" :key="artwork.id" class="artwork-card">
        <div class="artwork-image">
          <img :src="artwork.imageData" :alt="artwork.text">
          <div class="artwork-overlay">
            <button @click="toggleLike(artwork)" class="overlay-btn">
              {{ artwork.isLiked ? '❤️' : '🤍' }} {{ artwork.likes }}
            </button>
            <button @click="toggleFavorite(artwork)" class="overlay-btn">
              {{ artwork.isFavorited ? '⭐' : '☆' }}
            </button>
          </div>
        </div>
        <div class="artwork-info">
          <h3 class="artwork-text">{{ artwork.text }}</h3>
          <div class="artwork-meta">
            <span class="category-tag">{{ artwork.category }}</span>
            <span class="date">{{ formatDate(artwork.createdAt) }}</span>
          </div>
          <div class="artwork-params">
            <span>字体: {{ artwork.fontSize }}px</span>
            <span>粒子: {{ artwork.particleSize }}px</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredArtworks.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <p>还没有作品哦，快去创作吧！</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

interface Artwork {
  id: string
  text: string
  imageData: string
  fontSize: number
  particleSize: number
  colorStart: string
  colorEnd: string
  category: string
  likes: number
  isLiked: boolean
  isFavorited: boolean
  createdAt: string
}

const GET_ARTWORKS = gql`
  query GetArtworks {
    artworks {
      id
      text
      imageData
      fontSize
      particleSize
      colorStart
      colorEnd
      category
      likes
      isLiked
      isFavorited
      createdAt
    }
  }
`

const TOGGLE_LIKE = gql`
  mutation ToggleLike($id: ID!) {
    toggleLike(id: $id) {
      id
      likes
      isLiked
    }
  }
`

const TOGGLE_FAVORITE = gql`
  mutation ToggleFavorite($id: ID!) {
    toggleFavorite(id: $id) {
      id
      isFavorited
    }
  }
`

const { result } = useQuery(GET_ARTWORKS)
const { mutate: toggleLikeMutate } = useMutation(TOGGLE_LIKE)
const { mutate: toggleFavoriteMutate } = useMutation(TOGGLE_FAVORITE)

const categories = ['全部', '默认', '收藏']
const currentCategory = ref('全部')

const artworks = ref<Artwork[]>([])

result.value?.artworks?.forEach((a: Artwork) => {
  const existing = artworks.value.find(x => x.id === a.id)
  if (!existing) artworks.value.push(a)
})

const filteredArtworks = computed(() => {
  let result = artworks.value
  
  if (currentCategory.value === '收藏') {
    result = result.filter(a => a.isFavorited)
  } else if (currentCategory.value !== '全部') {
    result = result.filter(a => a.category === currentCategory.value)
  }
  
  return result
})

const toggleLike = async (artwork: Artwork) => {
  await toggleLikeMutate({ id: artwork.id })
  artwork.isLiked = !artwork.isLiked
  artwork.likes += artwork.isLiked ? 1 : -1
}

const toggleFavorite = async (artwork: Artwork) => {
  await toggleFavoriteMutate({ id: artwork.id })
  artwork.isFavorited = !artwork.isFavorited
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.gallery-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 20px;
}

.gallery-header h2 {
  font-size: 2rem;
  background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.category-filter {
  display: flex;
  gap: 10px;
}

.category-btn {
  padding: 8px 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-btn:hover {
  border-color: rgba(255, 255, 255, 0.4);
  color: #fff;
}

.category-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: #fff;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.artwork-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.artwork-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.artwork-image {
  position: relative;
  aspect-ratio: 16/10;
  overflow: hidden;
}

.artwork-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artwork-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.artwork-card:hover .artwork-overlay {
  opacity: 1;
}

.overlay-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.overlay-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.artwork-info {
  padding: 20px;
}

.artwork-text {
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
}

.artwork-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.category-tag {
  padding: 4px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  font-size: 0.8rem;
  color: #fff;
}

.date {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

.artwork-params {
  display: flex;
  gap: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.artwork-params span {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state p {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.6);
}
</style>
