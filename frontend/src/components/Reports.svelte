<script>
  import { createEventDispatcher } from 'svelte';
  import api from '../utils/api';

  export let reports;
  export let projects;
  
  const dispatch = createEventDispatcher();
  
  let showDetail = false;
  let selectedReport = null;
  
  let showGenerateModal = false;
  let generateData = {
    projectId: '',
    type: 'weekly'
  };

  function getTypeLabel(type) {
    const labels = {
      weekly: '每周报告',
      monthly: '每月报告',
      quarterly: '季度报告'
    };
    return labels[type] || type;
  }

  function openDetail(report) {
    selectedReport = report;
    showDetail = true;
  }

  function closeDetail() {
    showDetail = false;
    selectedReport = null;
  }

  function openGenerateModal() {
    generateData = {
      projectId: projects.length > 0 ? projects[0].id : '',
      type: 'weekly'
    };
    showGenerateModal = true;
  }

  function closeGenerateModal() {
    showGenerateModal = false;
  }

  async function handleGenerate() {
    try {
      await api.post(`/reports/generate/${generateData.projectId}`, { type: generateData.type });
      closeGenerateModal();
      dispatch('update');
    } catch (error) {
      console.error('生成报告失败:', error);
      alert('生成失败: ' + error.message);
    }
  }

  async function handleDelete(report) {
    if (confirm('确定要删除这个报告吗？')) {
      try {
        await api.delete(`/reports/${report.id}`);
        dispatch('update');
      } catch (error) {
        console.error('删除报告失败:', error);
        alert('删除失败: ' + error.message);
      }
    }
  }
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-800">风险报告</h2>
      <p class="text-gray-600">查看和管理项目风险报告，自动生成风险分析报告</p>
    </div>
    <button class="btn-primary" on:click={openGenerateModal}>
      <i class="ri-file-add-line mr-2"></i>生成报告
    </button>
  </div>

  <div class="card">
    {#if reports.length === 0}
      <p class="text-gray-500 text-center py-8">暂无报告数据，请点击"生成报告"创建新报告</p>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each reports as report}
          <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-3">
              <div>
                <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {getTypeLabel(report.type)}
                </span>
              </div>
              <div class="flex gap-1">
                <button class="text-blue-600 hover:text-blue-800 p-1" on:click={() => openDetail(report)}>
                  <i class="ri-eye-line"></i>
                </button>
                <button class="text-red-600 hover:text-red-800 p-1" on:click={() => handleDelete(report)}>
                  <i class="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>
            <h4 class="font-medium text-gray-800 mb-2">{report.title}</h4>
            <div class="text-sm text-gray-500 space-y-1">
              <p>项目: {report.projectName}</p>
              <p>创建时间: {new Date(report.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- 报告详情模态框 -->
  {#if showDetail && selectedReport}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-800">{selectedReport.title}</h3>
          <button class="text-gray-500 hover:text-gray-700" on:click={closeDetail}>
            <i class="ri-close-line text-2xl"></i>
          </button>
        </div>
        <div class="p-6">
          {#if selectedReport.content}
            <div class="space-y-6">
              <!-- 项目信息 -->
              <div>
                <h4 class="font-bold text-gray-800 mb-3 text-lg">项目信息</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div class="bg-gray-50 p-3 rounded">
                    <span class="text-gray-500">项目名称:</span>
                    <span class="ml-2 font-medium">{selectedReport.content.project?.name}</span>
                  </div>
                  <div class="bg-gray-50 p-3 rounded">
                    <span class="text-gray-500">项目经理:</span>
                    <span class="ml-2 font-medium">{selectedReport.content.project?.manager}</span>
                  </div>
                  <div class="bg-gray-50 p-3 rounded">
                    <span class="text-gray-500">项目进度:</span>
                    <span class="ml-2 font-medium">{selectedReport.content.project?.progress}%</span>
                  </div>
                  <div class="bg-gray-50 p-3 rounded">
                    <span class="text-gray-500">团队规模:</span>
                    <span class="ml-2 font-medium">{selectedReport.content.project?.teamSize}人</span>
                  </div>
                </div>
              </div>

              <!-- 风险概览 -->
              <div>
                <h4 class="font-bold text-gray-800 mb-3 text-lg">风险概览</h4>
                <div class="grid grid-cols-4 gap-4">
                  <div class="bg-blue-50 p-4 rounded-lg text-center">
                    <p class="text-2xl font-bold text-blue-600">{selectedReport.content.riskOverview?.total || 0}</p>
                    <p class="text-sm text-gray-600">总风险数</p>
                  </div>
                  <div class="bg-red-50 p-4 rounded-lg text-center">
                    <p class="text-2xl font-bold text-red-600">{selectedReport.content.riskOverview?.pending || 0}</p>
                    <p class="text-sm text-gray-600">待处理</p>
                  </div>
                  <div class="bg-yellow-50 p-4 rounded-lg text-center">
                    <p class="text-2xl font-bold text-yellow-600">{selectedReport.content.riskOverview?.inProgress || 0}</p>
                    <p class="text-sm text-gray-600">处理中</p>
                  </div>
                  <div class="bg-green-50 p-4 rounded-lg text-center">
                    <p class="text-2xl font-bold text-green-600">{selectedReport.content.riskOverview?.resolved || 0}</p>
                    <p class="text-sm text-gray-600">已解决</p>
                  </div>
                </div>
              </div>

              <!-- 风险分析 -->
              <div>
                <h4 class="font-bold text-gray-800 mb-3 text-lg">风险分析</h4>
                <div class="grid grid-cols-3 gap-4">
                  <div class="border border-gray-200 rounded p-4 {selectedReport.content.analysis?.scheduleRisk ? 'bg-red-50 border-red-300' : 'bg-gray-50'}">
                    <div class="flex items-center gap-2 mb-2">
                      <i class="ri-calendar-line text-xl"></i>
                      <span class="font-medium">进度风险</span>
                    </div>
                    <span class="text-sm {selectedReport.content.analysis?.scheduleRisk ? 'text-red-600' : 'text-green-600'}">
                      {selectedReport.content.analysis?.scheduleRisk ? '存在风险' : '正常'}
                    </span>
                  </div>
                  <div class="border border-gray-200 rounded p-4 {selectedReport.content.analysis?.costRisk ? 'bg-red-50 border-red-300' : 'bg-gray-50'}">
                    <div class="flex items-center gap-2 mb-2">
                      <i class="ri-money-dollar-circle-line text-xl"></i>
                      <span class="font-medium">成本风险</span>
                    </div>
                    <span class="text-sm {selectedReport.content.analysis?.costRisk ? 'text-red-600' : 'text-green-600'}">
                      {selectedReport.content.analysis?.costRisk ? '存在风险' : '正常'}
                    </span>
                  </div>
                  <div class="border border-gray-200 rounded p-4 {selectedReport.content.analysis?.staffRisk ? 'bg-red-50 border-red-300' : 'bg-gray-50'}">
                    <div class="flex items-center gap-2 mb-2">
                      <i class="ri-team-line text-xl"></i>
                      <span class="font-medium">人员风险</span>
                    </div>
                    <span class="text-sm {selectedReport.content.analysis?.staffRisk ? 'text-red-600' : 'text-green-600'}">
                      {selectedReport.content.analysis?.staffRisk ? '存在风险' : '正常'}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 建议 -->
              {#if selectedReport.content.recommendations && selectedReport.content.recommendations.length > 0}
                <div>
                  <h4 class="font-bold text-gray-800 mb-3 text-lg">风险建议</h4>
                  <div class="space-y-3">
                    {#each selectedReport.content.recommendations as rec, index}
                      <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <div class="flex items-center gap-2 mb-2">
                          <span class="px-2 py-1 text-xs rounded-full {rec.priority === 'high' ? 'bg-red-100 text-red-800' : rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
                            {rec.priority === 'high' ? '高优先级' : rec.priority === 'medium' ? '中优先级' : '低优先级'}
                          </span>
                          <span class="text-sm font-medium text-gray-700">{rec.category}</span>
                        </div>
                        <p class="text-gray-700">{rec.content}</p>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {:else}
            <p class="text-gray-500">报告内容为空</p>
          {/if}
        </div>
        <div class="flex justify-end p-6 border-t border-gray-200">
          <button class="btn-secondary" on:click={closeDetail}>关闭</button>
        </div>
      </div>
    </div>
  {/if}

  <!-- 生成报告模态框 -->
  {#if showGenerateModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-800">生成风险报告</h3>
          <button class="text-gray-500 hover:text-gray-700" on:click={closeGenerateModal}>
            <i class="ri-close-line text-2xl"></i>
          </button>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">选择项目</label>
              <select class="input" bind:value={generateData.projectId}>
                {#each projects as project}
                  <option value={project.id}>{project.name}</option>
                {/each}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">报告类型</label>
              <select class="input" bind:value={generateData.type}>
                <option value="weekly">每周报告</option>
                <option value="monthly">每月报告</option>
                <option value="quarterly">季度报告</option>
              </select>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button class="btn-secondary" on:click={closeGenerateModal}>取消</button>
          <button class="btn-primary" on:click={handleGenerate}>生成报告</button>
        </div>
      </div>
    </div>
  {/if}
</div>
