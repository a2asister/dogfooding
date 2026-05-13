import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Trip, TripNode } from '../types';

export const useTripStore = defineStore('trip', () => {
  const trips = ref<Trip[]>([]);
  const currentTrip = ref<Trip | null>(null);
  const selectedNodeIndex = ref(0);
  const isPlaying = ref(false);
  const isDayTime = ref(true);

  const sortedNodes = computed(() => {
    if (!currentTrip.value) return [];
    return [...currentTrip.value.nodes].sort((a, b) => a.order - b.order);
  });

  const currentNode = computed(() => {
    return sortedNodes.value[selectedNodeIndex.value] || null;
  });

  const setTrips = (newTrips: Trip[]): void => {
    trips.value = newTrips;
  };

  const setCurrentTrip = (trip: Trip): void => {
    currentTrip.value = trip;
    selectedNodeIndex.value = 0;
  };

  const selectNode = (index: number): void => {
    if (index >= 0 && index < sortedNodes.value.length) {
      selectedNodeIndex.value = index;
    }
  };

  const nextNode = (): void => {
    if (selectedNodeIndex.value < sortedNodes.value.length - 1) {
      selectedNodeIndex.value++;
    }
  };

  const prevNode = (): void => {
    if (selectedNodeIndex.value > 0) {
      selectedNodeIndex.value--;
    }
  };

  const togglePlay = (): void => {
    isPlaying.value = !isPlaying.value;
  };

  const toggleDayNight = (): void => {
    isDayTime.value = !isDayTime.value;
  };

  return {
    trips,
    currentTrip,
    selectedNodeIndex,
    isPlaying,
    isDayTime,
    sortedNodes,
    currentNode,
    setTrips,
    setCurrentTrip,
    selectNode,
    nextNode,
    prevNode,
    togglePlay,
    toggleDayNight,
  };
});