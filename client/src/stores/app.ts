import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Repository } from '@/api/repository';

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false);
  const currentRepository = ref<Repository | null>(null);
  const repositoryOwner = ref('facebook');
  const repositoryName = ref('react');

  const fullRepositoryName = computed(() => {
    return `${repositoryOwner.value}/${repositoryName.value}`;
  });

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function setRepository(owner: string, name: string) {
    repositoryOwner.value = owner;
    repositoryName.value = name;
  }

  function setCurrentRepository(repo: Repository | null) {
    currentRepository.value = repo;
    if (repo) {
      repositoryOwner.value = repo.owner.login;
      repositoryName.value = repo.name;
    }
  }

  return {
    sidebarCollapsed,
    currentRepository,
    repositoryOwner,
    repositoryName,
    fullRepositoryName,
    toggleSidebar,
    setRepository,
    setCurrentRepository,
  };
});
