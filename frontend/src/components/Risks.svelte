<script>
  import { createEventDispatcher } from 'svelte';
  import api from '../utils/api';

  export let risks;
  export let projects;
  
  const dispatch = createEventDispatcher();
  
  let filterType = 'all';
  let filterLevel = 'all';
  let filterStatus = 'all';
  
  let showModal = false;
  let showRectificationModal = false;
  let currentRisk = null;
  
  let formData = {
    projectId: '',
    type: 'schedule',
    level: 'medium',
    title: '',
    description: '',
    status: 'pending'
  };
  
  let rectificationData = {
    riskId: '',
    title: '',
    description: '',
    responsible: '',
    deadline: ''
  };

  $: filteredRisks = risks.filter(risk => {
    let match = true;
    if (filterType !== 'all') match = match && risk.type === filterType;
    if (filterLevel !== 'all') match = match && risk.level === filterLevel;
    if (filterStatus !== 'all') match = match && risk.status === filterStatus;
    return match;
  });

  function getTypeLabel(type) {
    const labels = {
      schedule: '进度风险',
      cost: '成本风险',
      staff: '人员风险',
      outsourcing: '外包风险',
      compliance: '合规风险'
    };
    return labels[type] || type;
  }

  function getLevelLabel(level) {
    const labels = {
      high: '高',
      medium: '中',
      low: '低'
    };
    return labels[level] || level;
  }

  function getStatusLabel(status) {
    const labels = {
      pending: '待处理',
      in_progress: '处理中',
      resolved: '已解决'
    };
    return labels[status] || status;
  }

  function getLevelClass(level) {
    const classes = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return classes[level] || 'bg-gray-100 text-gray-800';
  }

  function getStatusClass(status) {
    const classes = {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  function openCreateModal() {
    currentRisk = null;
    formData = {
      projectId: projects.length > 0 ? projects[0].id : '',
      type: 'schedule',
      level: 'medium',
      title: '',
      description: '',
      status: 'pending'
    };
    showModal = true;
  }

  function openRectificationModal(risk) {
    currentRisk = risk;
    rectificationData = {
      riskId: risk.id,
      title: `整改: ${risk.title}`,
      description: '',
      responsible: '',
      deadline: ''
    };
    showRectificationModal = true;
  }

  function closeModal() {
    showModal = false;
    showRectificationModal = false;
  }

  async function handleSubmit() {
    try {
      const project = projects.find(p => p.id === formData.projectId);
      const data = {
        ...formData,
        projectName: project ? project.name : ''
      };
      await api.post('/risks', data);
      closeModal();
      dispatch('update');
    } catch (error) {
      console.error('保存风险失败:', error);
      alert('保存失败: ' + error.message);
    }
  }

  async function handleRectificationSubmit() {
    try {
      await api.post('/rectifications', rectificationData);
      closeModal();
      dispatch('update');
    } catch (error) {
      console.error('创建整改失败:', error);
      alert('创建失败: ' + error.message);
    }
  }

  async function handleDelete(risk) {
    if (confirm('确定要删除这个风险记录吗？')) {
      try {
        await api.delete(`/risks/${risk.id}`);
        dispatch('update');
      } catch (error) {
        console.error('删除风险失败:', error);
        alert('删除失败: ' + error.message);
      }
    }
  }
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-800">风险预警</h2>
      <p class="text-gray-600">管理和监控项目风险，及时处理风险预警</p>
    </div>
    <button class="btn-primary" on:click={openCreateModal}>
      <i class="ri-add-line mr-2"></i>新增风险
    </button>
  </div>

  <!-- 筛选器 -->
  <div class="card mb-6">
    <div class="flex flex-wrap gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">风险类型</label>
        <select class="input w-40" bind:value={filterType}>
          <option value="all">全部</option>
          <option value="schedule">进度风险</option>
          <option value="cost">成本风险</option>
          <option value="staff">人员风险</option>
          <option value="outsourcing">外包风险</option>
          <option value="compliance">合规风险</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">风险等级</label>
        <select class="input w-40" bind:value={filterLevel}>
          <option value="all">全部</option>
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">处理状态</label>
        <select class="input w-40" bind:value={filterStatus}>
          <option value="all">全部</option>
          <option value="pending">待处理</option>
          <option value="in_progress">处理中</option>
          <option value="resolved">已解决</option>
        </select>
      </div>
    </div>
  </div>

  <div class="card">
    {#if filteredRisks.length === 0}
      <p class="text-gray-500 text-center py-8">暂无风险数据</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 font-medium text-gray-600">风险标题</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">所属项目</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">类型</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">等级</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">状态</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">创建时间</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredRisks as risk}
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-3 px-4">
                  <div class="font-medium text-gray-800">{risk.title}</div>
                  <div class="text-sm text-gray-500 truncate max-w-xs">{risk.description}</div>
                </td>
                <td class="py-3 px-4 text-gray-700">{risk.projectName}</td>
                <td class="py-3 px-4">{getTypeLabel(risk.type)}</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-1 text-xs rounded-full {getLevelClass(risk.level)}">
                    {getLevelLabel(risk.level)}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <span class="px-2 py-1 text-xs rounded-full {getStatusClass(risk.status)}">
                    {getStatusLabel(risk.status)}
                  </span>
                </td>
                <td class="py-3 px-4 text-sm text-gray-500">
                  {new Date(risk.createdAt).toLocaleDateString()}
                </td>
                <td class="py-3 px-4">
                  <div class="flex gap-2">
                    {#if risk.status !== 'resolved'}
                      <button class="text-purple-600 hover:text-purple-800" on:click={() => openRectificationModal(risk)} title="创建整改">
                        <i class="ri-refresh-line"></i>
                      </button>
                    {/if}
                    <button class="text-red-600 hover:text-red-800" on:click={() => handleDelete(risk)}>
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

  <!-- 新增风险模态框 -->
  {#if showModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-800">新增风险</h3>
          <button class="text-gray-500 hover:text-gray-700" on:click={closeModal}>
            <i class="ri-close-line text-2xl"></i>
          </button>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">所属项目 *</label>
              <select class="input" bind:value={formData.projectId}>
                {#each projects as project}
                  <option value={project.id}>{project.name}</option>
                {/each}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">风险标题 *</label>
              <input type="text" class="input" bind:value={formData.title} placeholder="请输入风险标题">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">风险类型</label>
                <select class="input" bind:value={formData.type}>
                  <option value="schedule">进度风险</option>
                  <option value="cost">成本风险</option>
                  <option value="staff">人员风险</option>
                  <option value="outsourcing">外包风险</option>
                  <option value="compliance">合规风险</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">风险等级</label>
                <select class="input" bind:value={formData.level}>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">风险描述</label>
              <textarea class="input h-24" bind:value={formData.description} placeholder="请输入风险描述"></textarea>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button class="btn-secondary" on:click={closeModal}>取消</button>
          <button class="btn-primary" on:click={handleSubmit}>创建</button>
        </div>
      </div>
    </div>
  {/if}

  <!-- 创建整改模态框 -->
  {#if showRectificationModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-800">创建整改</h3>
          <button class="text-gray-500 hover:text-gray-700" on:click={closeModal}>
            <i class="ri-close-line text-2xl"></i>
          </button>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">整改标题</label>
              <input type="text" class="input" bind:value={rectificationData.title} placeholder="请输入整改标题">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">整改描述</label>
              <textarea class="input h-24" bind:value={rectificationData.description} placeholder="请输入整改描述"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">负责人</label>
                <input type="text" class="input" bind:value={rectificationData.responsible} placeholder="请输入负责人">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
                <input type="date" class="input" bind:value={rectificationData.deadline}>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button class="btn-secondary" on:click={closeModal}>取消</button>
          <button class="btn-primary" on:click={handleRectificationSubmit}>创建整改</button>
        </div>
      </div>
    </div>
  {/if}
</div>
