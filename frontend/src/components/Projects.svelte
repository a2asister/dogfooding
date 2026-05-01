<script>
  import { createEventDispatcher } from 'svelte';
  import api from '../utils/api';

  export let projects;
  
  const dispatch = createEventDispatcher();
  
  let showModal = false;
  let isEdit = false;
  let currentProject = null;
  
  let formData = {
    name: '',
    description: '',
    status: 'active',
    progress: 0,
    startDate: '',
    endDate: '',
    budget: 0,
    actualSpent: 0,
    teamSize: 0,
    manager: ''
  };

  function openCreateModal() {
    isEdit = false;
    currentProject = null;
    formData = {
      name: '',
      description: '',
      status: 'active',
      progress: 0,
      startDate: '',
      endDate: '',
      budget: 0,
      actualSpent: 0,
      teamSize: 0,
      manager: ''
    };
    showModal = true;
  }

  function openEditModal(project) {
    isEdit = true;
    currentProject = project;
    formData = { ...project };
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }

  async function handleSubmit() {
    try {
      if (isEdit && currentProject) {
        await api.put(`/projects/${currentProject.id}`, formData);
      } else {
        await api.post('/projects', formData);
      }
      closeModal();
      dispatch('update');
    } catch (error) {
      console.error('保存项目失败:', error);
      alert('保存失败: ' + error.message);
    }
  }

  async function handleDelete(project) {
    if (confirm('确定要删除这个项目吗？')) {
      try {
        await api.delete(`/projects/${project.id}`);
        dispatch('update');
      } catch (error) {
        console.error('删除项目失败:', error);
        alert('删除失败: ' + error.message);
      }
    }
  }

  async function handleAnalyze(project) {
    try {
      await api.post(`/risks/analyze/${project.id}`);
      alert('风险分析完成！');
      dispatch('update');
    } catch (error) {
      console.error('分析风险失败:', error);
      alert('分析失败: ' + error.message);
    }
  }

  async function handleGenerateReport(project) {
    try {
      await api.post(`/reports/generate/${project.id}`, { type: 'weekly' });
      alert('风险报告生成完成！');
      dispatch('update');
    } catch (error) {
      console.error('生成报告失败:', error);
      alert('生成报告失败: ' + error.message);
    }
  }
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-800">项目管理</h2>
      <p class="text-gray-600">管理所有项目，进行风险分析和报告生成</p>
    </div>
    <button class="btn-primary" on:click={openCreateModal}>
      <i class="ri-add-line mr-2"></i>新增项目
    </button>
  </div>

  <div class="card">
    {#if projects.length === 0}
      <p class="text-gray-500 text-center py-8">暂无项目数据，请新增项目</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 font-medium text-gray-600">项目名称</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">进度</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">预算</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">实际支出</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">负责人</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">状态</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {#each projects as project}
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-3 px-4">
                  <div class="font-medium text-gray-800">{project.name}</div>
                  <div class="text-sm text-gray-500">{project.description}</div>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <div class="w-24 bg-gray-200 rounded-full h-2">
                      <div class="bg-blue-500 h-2 rounded-full" style="width: {project.progress}%"></div>
                    </div>
                    <span class="text-sm text-gray-600">{project.progress}%</span>
                  </div>
                </td>
                <td class="py-3 px-4 text-gray-700">¥{project.budget.toLocaleString()}</td>
                <td class="py-3 px-4">
                  <span class={project.actualSpent > project.budget ? 'text-red-600' : 'text-green-600'}>
                    ¥{project.actualSpent.toLocaleString()}
                  </span>
                </td>
                <td class="py-3 px-4 text-gray-700">{project.manager}</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-1 text-xs rounded-full {project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                    {project.status === 'active' ? '进行中' : '已完成'}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <div class="flex gap-2">
                    <button class="text-blue-600 hover:text-blue-800" on:click={() => openEditModal(project)}>
                      <i class="ri-edit-line"></i>
                    </button>
                    <button class="text-green-600 hover:text-green-800" on:click={() => handleAnalyze(project)} title="分析风险">
                      <i class="ri-search-line"></i>
                    </button>
                    <button class="text-purple-600 hover:text-purple-800" on:click={() => handleGenerateReport(project)} title="生成报告">
                      <i class="ri-file-add-line"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800" on:click={() => handleDelete(project)}>
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

  <!-- 模态框 -->
  {#if showModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-800">{isEdit ? '编辑项目' : '新增项目'}</h3>
          <button class="text-gray-500 hover:text-gray-700" on:click={closeModal}>
            <i class="ri-close-line text-2xl"></i>
          </button>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">项目名称 *</label>
              <input type="text" class="input" bind:value={formData.name} placeholder="请输入项目名称">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">负责人 *</label>
              <input type="text" class="input" bind:value={formData.manager} placeholder="请输入负责人姓名">
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">项目描述</label>
              <textarea class="input h-24" bind:value={formData.description} placeholder="请输入项目描述"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
              <input type="date" class="input" bind:value={formData.startDate}>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
              <input type="date" class="input" bind:value={formData.endDate}>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">预算 (元)</label>
              <input type="number" class="input" bind:value={formData.budget} placeholder="请输入预算金额">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">实际支出 (元)</label>
              <input type="number" class="input" bind:value={formData.actualSpent} placeholder="请输入实际支出">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">进度 (%)</label>
              <input type="number" class="input" bind:value={formData.progress} min="0" max="100" placeholder="请输入进度">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">团队规模</label>
              <input type="number" class="input" bind:value={formData.teamSize} placeholder="请输入团队人数">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select class="input" bind:value={formData.status}>
                <option value="active">进行中</option>
                <option value="completed">已完成</option>
              </select>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button class="btn-secondary" on:click={closeModal}>取消</button>
          <button class="btn-primary" on:click={handleSubmit}>{isEdit ? '保存' : '创建'}</button>
        </div>
      </div>
    </div>
  {/if}
</div>
