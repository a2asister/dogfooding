<script>
  import { onMount } from 'svelte';
  import Sidebar from './components/Sidebar.svelte';
  import Dashboard from './components/Dashboard.svelte';
  import Projects from './components/Projects.svelte';
  import Risks from './components/Risks.svelte';
  import Reports from './components/Reports.svelte';
  import Rules from './components/Rules.svelte';
  import Rectifications from './components/Rectifications.svelte';
  import api from './utils/api';

  let currentPage = 'dashboard';
  let projects = [];
  let risks = [];
  let reports = [];
  let rules = [];
  let rectifications = [];

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    try {
      const results = await Promise.allSettled([
        api.get('/projects'),
        api.get('/risks'),
        api.get('/reports'),
        api.get('/rules'),
        api.get('/rectifications')
      ]);

      if (results[0].status === 'fulfilled') projects = results[0].value.data;
      if (results[1].status === 'fulfilled') risks = results[1].value.data;
      if (results[2].status === 'fulfilled') reports = results[2].value.data;
      if (results[3].status === 'fulfilled') rules = results[3].value.data;
      if (results[4].status === 'fulfilled') rectifications = results[4].value.data;
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  }

  function handlePageChange(event) {
    currentPage = event.detail;
    loadData();
  }

  async function handleDataUpdate() {
    await loadData();
  }
</script>

<div class="flex h-screen bg-gray-100">
  <Sidebar {currentPage} on:pageChange={handlePageChange} />
  
  <main class="flex-1 overflow-auto">
    <!-- 调试信息 -->
    <div class="bg-yellow-100 border-l-4 border-yellow-500 p-3 m-4 rounded text-sm">
      <strong>调试信息:</strong> 当前页面 = {currentPage}
    </div>
    
    {#if currentPage === 'dashboard'}
      <Dashboard 
        {projects} 
        {risks} 
        {reports} 
        {rules} 
        {rectifications}
      />
    {:else if currentPage === 'projects'}
      <div class="p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">项目管理 (测试页面)</h2>
        <p class="text-gray-600 mb-4">如果您能看到这段文字，说明页面切换功能正常工作。</p>
        <p class="text-gray-600 mb-4">项目数量: {projects.length}</p>
        <Projects {projects} on:update={handleDataUpdate} />
      </div>
    {:else if currentPage === 'risks'}
      <div class="p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">风险预警 (测试页面)</h2>
        <p class="text-gray-600 mb-4">如果您能看到这段文字，说明页面切换功能正常工作。</p>
        <Risks {risks} {projects} on:update={handleDataUpdate} />
      </div>
    {:else if currentPage === 'reports'}
      <div class="p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">风险报告 (测试页面)</h2>
        <p class="text-gray-600 mb-4">如果您能看到这段文字，说明页面切换功能正常工作。</p>
        <Reports {reports} {projects} on:update={handleDataUpdate} />
      </div>
    {:else if currentPage === 'rules'}
      <div class="p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">规则库 (测试页面)</h2>
        <p class="text-gray-600 mb-4">如果您能看到这段文字，说明页面切换功能正常工作。</p>
        <Rules {rules} on:update={handleDataUpdate} />
      </div>
    {:else if currentPage === 'rectifications'}
      <div class="p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">整改管理 (测试页面)</h2>
        <p class="text-gray-600 mb-4">如果您能看到这段文字，说明页面切换功能正常工作。</p>
        <Rectifications {rectifications} {risks} {projects} on:update={handleDataUpdate} />
      </div>
    {:else}
      <div class="p-6">
        <h2 class="text-2xl font-bold text-red-600 mb-4">未知页面</h2>
        <p class="text-gray-600">页面ID: {currentPage}</p>
      </div>
    {/if}
  </main>
</div>
