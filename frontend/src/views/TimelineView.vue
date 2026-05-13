<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { useTripStore } from '../stores/trip';
import type { Trip } from '../types';
import Timeline from '../components/Timeline.vue';
import TripSelector from '../components/TripSelector.vue';

const store = useTripStore();

const mockTrip: Trip = {
  id: 1,
  title: '云南五日游',
  description: '一次精彩的云南之旅',
  category: '旅行',
  isArchived: false,
  createdAt: new Date(),
  nodes: [
    {
      id: 1,
      name: '昆明长水机场',
      address: '云南省昆明市官渡区长水村',
      arrivalTime: new Date('2024-06-01T08:00:00'),
      note: '抵达昆明，接机后前往酒店',
      order: 0,
      tripId: 1,
    },
    {
      id: 2,
      name: '石林风景区',
      address: '云南省昆明市石林彝族自治县',
      arrivalTime: new Date('2024-06-01T10:30:00'),
      note: '游览世界自然遗产',
      order: 1,
      tripId: 1,
    },
    {
      id: 3,
      name: '大理古城',
      address: '云南省大理白族自治州大理市',
      arrivalTime: new Date('2024-06-02T09:00:00'),
      note: '漫步古城，品尝特色美食',
      order: 2,
      tripId: 1,
    },
    {
      id: 4,
      name: '洱海',
      address: '云南省大理白族自治州',
      arrivalTime: new Date('2024-06-02T14:00:00'),
      note: '环湖游览，风光无限',
      order: 3,
      tripId: 1,
    },
    {
      id: 5,
      name: '丽江古城',
      address: '云南省丽江市古城区',
      arrivalTime: new Date('2024-06-03T10:00:00'),
      note: '感受纳西族文化',
      order: 4,
      tripId: 1,
    },
  ],
};

const { result, loading, error } = useQuery(gql`
  query GetTrips {
    trips {
      id
      title
      description
      category
      isArchived
      createdAt
      nodes {
        id
        name
        address
        arrivalTime
        note
        order
        tripId
      }
    }
  }
`);

watch(
  () => result.value,
  (data) => {
    if (data && data.trips.length > 0) {
      store.setTrips(data.trips);
      store.setCurrentTrip(data.trips[0]);
    }
  }
);

onMounted(() => {
  if (error.value) {
    console.warn('GraphQL Error (using mock data):', error.value.message);
    store.setTrips([mockTrip]);
    store.setCurrentTrip(mockTrip);
  }
  
  setTimeout(() => {
    if (!result.value || !result.value.trips.length) {
      store.setTrips([mockTrip]);
      store.setCurrentTrip(mockTrip);
    }
  }, 2000);
});
</script>

<template>
  <div class="timeline-view">
    <div class="view-header">
      <h1 class="view-title">行程时间轴</h1>
      <p class="view-subtitle">探索您的旅程，每一站都是美好回忆</p>
    </div>

    <TripSelector v-if="!loading && store.trips.length > 0" />

    <div v-if="loading" class="loading-state">
      <div class="loader"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="!store.currentTrip" class="empty-state">
      <div class="empty-icon">🗺️</div>
      <h3>还没有行程</h3>
      <p>去行程管理页面创建您的第一个行程吧！</p>
      <router-link to="/trips" class="btn-primary">前往管理</router-link>
    </div>

    <Timeline v-else />
  </div>
</template>

<style scoped>
.timeline-view {
  max-width: 1000px;
  margin: 0 auto;
}

.view-header {
  text-align: center;
  margin-bottom: 40px;
}

.view-title {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.view-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.loader {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-state p {
  color: white;
  font-size: 1.1rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 25px;
}

.btn-primary {
  padding: 12px 30px;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>