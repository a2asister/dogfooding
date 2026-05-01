<script>
  import { createEventDispatcher } from 'svelte';
  import api from '../utils/api';

  export let rectifications;
  export let risks;
  export let projects;
  
  const dispatch = createEventDispatcher();
  
  let filterStatus = 'all';
  
  let showDetail = false;
  let selectedRectification = null;
  
  let showEditModal = false;
  let editData = {};

  $: filteredRectifications = rectifications.filter(r => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  function getRiskTitle(riskId) {
    const risk = risks.find(r => r.id === riskId);
    return risk ? risk.title : '未知风险';
  }

  function getProjectName(riskId) {
    const risk = risks.find(r => r.id === riskId);
    if (risk) {
      const project = projects.find(p => p.id === risk.projectId);
      return project ? project.name : '未知项目';
    }
    return '未知项目';
  }

  function getStatusLabel(status) {
    const labels = {
      in_progress: '进行中',
      completed: '已完成',
      pending: '待开始'
    };
    return labels[status] || status;
  }

  function getStatusClass(status) {
    const classes = {
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  function getProgressColor(progress) {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  function openDetail(rectification) {
    selectedRectification = rectification;
    showDetail = true;
  }

  function closeDetail() {
    showDetail = false;
    selectedRectification = null;
  }

  function openEditModal(rectification) {
    editData = { ...rectification };
    showEditModal = true;
  }

  function closeEditModal() {
    showEditModal = false;
  }

  async function handleUpdateProgress() {
    try {
      await api.put(`/rectifications/${editData.id}`, {
        progress: editData.progress,
        status: editData.status
      });
      closeEditModal();
      dispatch('update');
    } catch (error) {
      console.error('更新整改进度失败:', error);
      alert('更新失败: ' + error.message);
    }
  }

  async function handleDelete(rectification) {
    if (confirm('确定要删除这个整改记录吗？')) {
      try {
        await api.delete(`/rectifications/${rectification.id}`);
        dispatch('update');
      } catch (error) {
        console.error('删除整改失败:', error);
        alert('删除失败: ' + error.message);
      }
    }
  }
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-800">整改管理</h2>
      <p class="text-gray-600">管理风险整改措施，跟踪整改进度，形成闭环管理</p>
    </div>
  </div>

  <!-- 筛选器 -->
  <div class="card mb-6">
    <div class="flex flex-wrap gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">整改状态</label>
        <select class="input w-40" bind:value={filterStatus}>
          <option value="all">全部</option>
          <option value="in_progress">进行中</option>
          <option value="completed">已完成</option>
          <option value="pending">待开始</option>
        </select>
      </div>
    </div>
  </div>

  <div class="card">
    {#if filteredRectifications.length === 0}
      <p class="text-gray-500 text-center py-8">暂无整改记录</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 font-medium text-gray-600">整改标题</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">关联风险</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">所属项目</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">负责人</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">进度</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">状态</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">截止日期</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredRectifications as rectification}
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-3 px-4 font-medium text-gray-800">{rectification.title}</td>
                <td class="py-3 px-4 text-sm text-gray-600">{getRiskTitle(rectification.riskId)}</td>
                <td class="py-3 px-4 text-sm text-gray-600">{getProjectName(rectification.riskId)}</td>
                <td class="py-3 px-4 text-gray-700">{rectification.responsible || '-'}</td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <div class="w-24 bg-gray-200 rounded-full h-2">
                      <div class="{getProgressColor(rectification.progress)} h-2 rounded-full" style="width: {rectification.progress}%"></div>
                    </div>
                    <span class="text-sm text-gray-600">{rectification.progress}%</span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span class="px-2 py-1 text-xs rounded-full {getStatusClass(rectification.status)}">
                    {getStatusLabel(rectification.status)}
                  </span>
                </td>
                <td class="py-3 px-4 text-sm text-gray-500">
                  {rectification.deadline ? new Date(rectification.deadline).toLocaleDateString() : '-'}
                </td>
                <td class="py-3 px-4">
                  <div class="flex gap-2">
                    <button class="text-blue-600 hover:text-blue-800" on:click={() => openDetail(rectification)}>
                      <i class="ri-eye-line"></i>
                    </button>
                    <button class="text-purple-600 hover:text-purple-800" on:click={() => openEditModal(rectification)}>
                      <i class="ri-edit-line"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800" on:click={() => handleDelete(rectification)}>
                      <i class="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>

  <!-- 整改详情模态框 -->
  {#if showDetail && selectedRectification}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-800">整改详情</h3>
          <button class="text-gray-500 hover:text-gray-700" on:click={closeDetail}>
            <i class="ri-close-line text-2xl"></i>
          </button>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">整改标题</label>
                <p class="font-medium text-gray-800">{selectedRectification.title}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">关联风险</label>
                <p class="font-medium text-gray-800">{getRiskTitle(selectedRectification.riskId)}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">所属项目</label>
                <p class="font-medium text-gray-800">{getProjectName(selectedRectification.riskId)}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">负责人</label>
                <p class="font-medium text-gray-800">{selectedRectification.responsible || '-'}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">截止日期</label>
                <p class="font-medium text-gray-800">
                  {selectedRectification.deadline ? new Date(selectedRectification.deadline).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">状态</label>
                <span class="px-2 py-1 text-sm rounded-full {getStatusClass(selectedRectification.status)}">
                  {getStatusLabel(selectedRectification.status)}
                </span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">整改进度</label>
              <div class="flex items-center gap-3">
                <div class="flex-1 bg-gray-200 rounded-full h-3">
                  <div class="{getProgressColor(selectedRectification.progress)} h-3 rounded-full transition-all" style="width: {selectedRectification.progress}%"></div>
                </div>
                <span class="font-bold text-lg">{selectedRectification.progress}%</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">整改描述</label>
              <p class="text-gray-800 bg-gray-50 p-4 rounded">{selectedRectification.description || '暂无描述'}</p>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="bg-gray-50 p-3 rounded">
                <span class="text-gray-500">创建时间:</span>
                <span class="ml-2">{new Date(selectedRectification.createdAt).toLocaleString()}</span>
              </div>
              <div class="bg-gray-50 p-3 rounded">
                <span class="text-gray-500">更新时间:</span>
                <span class="ml-2">{new Date(selectedRectification.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end p-6 border-t border-gray-200">
          <button class="btn-secondary" on:click={closeDetail}>关闭</button>
        </div>
      </div>
    </div>
  {/if}

  <!-- 编辑整改模态框 -->
  {#if showEditModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-800">更新整改进度</h3>
          <button class="text-gray-500 hover:text-gray-700" on:click={closeEditModal}>
            <i class="ri-close-line text-2xl"></i>
          </button>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">整改进度 (%)</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                bind:value={editData.progress} 
                class="w-full"
              >
              <div class="text-center font-bold text-lg mt-2">{editData.progress}%</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">整改状态</label>
              <select class="input" bind:value={editData.status}>
                <option value="pending">待开始</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
              </select>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button class="btn-secondary" on:click={closeEditModal}>取消</button>
          <button class="btn-primary" on:click={handleUpdateProgress}>保存</button>
        </div>
      </div>
    </div>
  {/if}
</div>
