<script>
  import { createEventDispatcher } from 'svelte';
  import api from '../utils/api';

  export let rules;
  
  const dispatch = createEventDispatcher();
  
  let filterCategory = 'all';
  let filterEnabled = 'all';
  
  let showModal = false;
  let isEdit = false;
  let currentRule = null;
  
  let formData = {
    name: '',
    category: 'schedule',
    description: '',
    condition: '',
    severity: 'medium',
    enabled: true
  };

  $: filteredRules = rules.filter(rule => {
    let match = true;
    if (filterCategory !== 'all') match = match && rule.category === filterCategory;
    if (filterEnabled !== 'all') match = match && rule.enabled === (filterEnabled === 'true');
    return match;
  });

  function getCategoryLabel(category) {
    const labels = {
      schedule: '进度风险',
      cost: '成本风险',
      staff: '人员风险',
      outsourcing: '外包风险',
      compliance: '合规风险'
    };
    return labels[category] || category;
  }

  function getSeverityLabel(severity) {
    const labels = {
      high: '高',
      medium: '中',
      low: '低'
    };
    return labels[severity] || severity;
  }

  function getSeverityClass(severity) {
    const classes = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return classes[severity] || 'bg-gray-100 text-gray-800';
  }

  function openCreateModal() {
    isEdit = false;
    currentRule = null;
    formData = {
      name: '',
      category: 'schedule',
      description: '',
      condition: '',
      severity: 'medium',
      enabled: true
    };
    showModal = true;
  }

  function openEditModal(rule) {
    isEdit = true;
    currentRule = rule;
    formData = { ...rule };
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }

  async function handleSubmit() {
    try {
      if (isEdit && currentRule) {
        await api.put(`/rules/${currentRule.id}`, formData);
      } else {
        await api.post('/rules', formData);
      }
      closeModal();
      dispatch('update');
    } catch (error) {
      console.error('保存规则失败:', error);
      alert('保存失败: ' + error.message);
    }
  }

  async function handleToggle(rule) {
    try {
      await api.put(`/rules/${rule.id}`, { enabled: !rule.enabled });
      dispatch('update');
    } catch (error) {
      console.error('更新规则状态失败:', error);
      alert('更新失败: ' + error.message);
    }
  }

  async function handleDelete(rule) {
    if (confirm('确定要删除这个规则吗？')) {
      try {
        await api.delete(`/rules/${rule.id}`);
        dispatch('update');
      } catch (error) {
        console.error('删除规则失败:', error);
        alert('删除失败: ' + error.message);
      }
    }
  }
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-800">规则库</h2>
      <p class="text-gray-600">管理风险规则，自定义风险识别和预警逻辑</p>
    </div>
    <button class="btn-primary" on:click={openCreateModal}>
      <i class="ri-add-line mr-2"></i>新增规则
    </button>
  </div>

  <!-- 筛选器 -->
  <div class="card mb-6">
    <div class="flex flex-wrap gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">规则分类</label>
        <select class="input w-40" bind:value={filterCategory}>
          <option value="all">全部</option>
          <option value="schedule">进度风险</option>
          <option value="cost">成本风险</option>
          <option value="staff">人员风险</option>
          <option value="outsourcing">外包风险</option>
          <option value="compliance">合规风险</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">启用状态</label>
        <select class="input w-40" bind:value={filterEnabled}>
          <option value="all">全部</option>
          <option value="true">已启用</option>
          <option value="false">已禁用</option>
        </select>
      </div>
    </div>
  </div>

  <div class="card">
    {#if filteredRules.length === 0}
      <p class="text-gray-500 text-center py-8">暂无规则数据</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 font-medium text-gray-600">规则名称</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">分类</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">严重程度</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">状态</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">描述</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredRules as rule}
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-3 px-4 font-medium text-gray-800">{rule.name}</td>
                <td class="py-3 px-4">{getCategoryLabel(rule.category)}</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-1 text-xs rounded-full {getSeverityClass(rule.severity)}">
                    {getSeverityLabel(rule.severity)}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <button 
                    class="relative inline-flex h-6 w-11 items-center rounded-full {rule.enabled ? 'bg-blue-600' : 'bg-gray-200'}"
                    on:click={() => handleToggle(rule)}
                  >
                    <span 
                      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {rule.enabled ? 'translate-x-6' : 'translate-x-1'}"
                    ></span>
                  </button>
                </td>
                <td class="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">{rule.description}</td>
                <td class="py-3 px-4">
                  <div class="flex gap-2">
                    <button class="text-blue-600 hover:text-blue-800" on:click={() => openEditModal(rule)}>
                      <i class="ri-edit-line"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800" on:click={() => handleDelete(rule)}>
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
          <h3 class="text-xl font-bold text-gray-800">{isEdit ? '编辑规则' : '新增规则'}</h3>
          <button class="text-gray-500 hover:text-gray-700" on:click={closeModal}>
            <i class="ri-close-line text-2xl"></i>
          </button>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">规则名称 *</label>
              <input type="text" class="input" bind:value={formData.name} placeholder="请输入规则名称">
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select class="input" bind:value={formData.category}>
                  <option value="schedule">进度风险</option>
                  <option value="cost">成本风险</option>
                  <option value="staff">人员风险</option>
                  <option value="outsourcing">外包风险</option>
                  <option value="compliance">合规风险</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">严重程度</label>
                <select class="input" bind:value={formData.severity}>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">启用状态</label>
                <select class="input" bind:value={formData.enabled}>
                  <option value={true}>启用</option>
                  <option value={false}>禁用</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">规则描述</label>
              <textarea class="input h-20" bind:value={formData.description} placeholder="请输入规则描述"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">触发条件 (JavaScript表达式)</label>
              <textarea class="input h-20 font-mono text-sm" bind:value={formData.condition} placeholder="例如: project.progress < 50"></textarea>
              <p class="text-xs text-gray-500 mt-1">可用变量: project (项目对象), currentDate (当前日期)</p>
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
