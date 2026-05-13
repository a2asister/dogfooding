<script setup lang="ts">
import { useTripStore } from '../stores/trip';

const store = useTripStore();

const handleChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement;
  const tripId = parseInt(target.value, 10);
  const trip = store.trips.find((t) => t.id === tripId);
  if (trip) {
    store.setCurrentTrip(trip);
  }
};
</script>

<template>
  <div class="trip-selector">
    <label for="trip-select" class="selector-label">选择行程</label>
    <select id="trip-select" class="selector-dropdown" :value="store.currentTrip?.id" @change="handleChange">
      <option v-for="trip in store.trips" :key="trip.id" :value="trip.id">
        {{ trip.title }} ({{ trip.category }})
      </option>
    </select>
  </div>
</template>

<style scoped>
.trip-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

.selector-label {
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.selector-dropdown {
  padding: 12px 20px;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  font-size: 1rem;
  cursor: pointer;
  min-width: 250px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.selector-dropdown:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.selector-dropdown:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
}
</style>