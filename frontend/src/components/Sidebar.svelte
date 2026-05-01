<script>
  import { createEventDispatcher } from 'svelte';
  
  export let currentPage;
  const dispatch = createEventDispatcher();
  
  const menuItems = [
    { id: 'dashboard', name: '仪表盘', icon: 'ri-dashboard-line' },
    { id: 'projects', name: '项目管理', icon: 'ri-folder-line' },
    { id: 'risks', name: '风险预警', icon: 'ri-alarm-warning-line' },
    { id: 'reports', name: '风险报告', icon: 'ri-file-text-line' },
    { id: 'rules', name: '规则库', icon: 'ri-booklet-line' },
    { id: 'rectifications', name: '整改管理', icon: 'ri-check-double-line' }
  ];

  function handleClick(item) {
    dispatch('pageChange', item.id);
  }
</script>

<aside class="w-64 bg-gray-800 text-white flex flex-col">
  <div class="p-4 border-b border-gray-700">
    <h1 class="text-xl font-bold flex items-center gap-2">
      <i class="ri-shield-cross-line text-2xl text-blue-400"></i>
      风险管控系统
    </h1>
  </div>
  
  <nav class="flex-1 p-4">
    <ul class="space-y-2">
      {#each menuItems as item}
        <li>
          <button
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors {currentPage === item.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}"
            on:click={() => handleClick(item)}
          >
            <i class="{item.icon} text-xl"></i>
            <span>{item.name}</span>
          </button>
        </li>
      {/each}
    </ul>
  </nav>
  
  <div class="p-4 border-t border-gray-700">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
        <i class="ri-user-line"></i>
      </div>
      <div>
        <p class="font-medium">管理员</p>
        <p class="text-sm text-gray-400">admin@example.com</p>
      </div>
    </div>
  </div>
</aside>
