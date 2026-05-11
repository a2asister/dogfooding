<template>
  <div class="app-container">
    <h1 class="title">图片画廊轮播</h1>

    <div class="controls">
      <div class="control-group">
        <label>轮播模式：</label>
        <select v-model="currentMode" class="mode-select">
          <option value="fade">淡入淡出</option>
          <option value="flip">3D翻转</option>
          <option value="cube">立方体旋转</option>
          <option value="stack">卡片堆叠</option>
        </select>
      </div>

      <div class="control-group">
        <label>分类筛选：</label>
        <select v-model="selectedCategory" class="category-select" @change="loadImagesByCategory">
          <option value="">全部</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
    </div>

    <div v-if="images.length > 0" class="carousel-wrapper">
      <Carousel
        :images="images"
        :mode="currentMode"
        :currentIndex="currentIndex"
        @update:currentIndex="currentIndex = $event"
      />
    </div>

    <div v-else class="loading">加载中...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { gql, ApolloClient, InMemoryCache } from '@apollo/client/core';
import Carousel from './components/Carousel.vue';

const client = new ApolloClient({
  uri: 'http://localhost:4873/graphql',
  cache: new InMemoryCache(),
});

const images = ref([]);
const categories = ref([]);
const currentMode = ref('fade');
const currentIndex = ref(0);
const selectedCategory = ref('');

const IMAGES_QUERY = gql`
  query {
    images {
      id
      url
      title
      description
      category
    }
  }
`;

const CATEGORIES_QUERY = gql`
  query {
    categories
  }
`;

const IMAGES_BY_CATEGORY_QUERY = gql`
  query ($category: String!) {
    imagesByCategory(category: $category) {
      id
      url
      title
      description
      category
    }
  }
`;

async function loadImages() {
  const result = await client.query({ query: IMAGES_QUERY });
  images.value = result.data.images;
  currentIndex.value = 0;
}

async function loadCategories() {
  const result = await client.query({ query: CATEGORIES_QUERY });
  categories.value = result.data.categories;
}

async function loadImagesByCategory() {
  if (!selectedCategory.value) {
    await loadImages();
    return;
  }
  const result = await client.query({
    query: IMAGES_BY_CATEGORY_QUERY,
    variables: { category: selectedCategory.value },
  });
  images.value = result.data.imagesByCategory;
  currentIndex.value = 0;
}

onMounted(async () => {
  await loadImages();
  await loadCategories();
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  min-height: 100vh;
  color: #fff;
}

.app-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  background: linear-gradient(90deg, #e94560, #f39c12, #e94560);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient 3s linear infinite;
  position: relative;
  z-index: 100;
}

@keyframes gradient {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}

.controls {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 100;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 500;
}

.mode-select,
.category-select {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 2px solid #e94560;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.mode-select:hover,
.category-select:hover {
  background: rgba(233, 69, 96, 0.2);
}

.mode-select option,
.category-select option {
  background: #1a1a2e;
  color: #fff;
}

.carousel-wrapper {
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.loading {
  text-align: center;
  font-size: 1.2rem;
  padding: 4rem;
  color: #aaa;
}
</style>
