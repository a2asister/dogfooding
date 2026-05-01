<script>
  export let projects;
  export let risks;
  export let reports;
  export let rules;
  export let rectifications;

  $: activeProjects = projects.filter(p => p.status === 'active').length;
  $: pendingRisks = risks.filter(r => r.status === 'pending').length;
  $: highRisks = risks.filter(r => r.level === 'high').length;
  $: inProgressRectifications = rectifications.filter(r => r.status === 'in_progress').length;

  $: riskByType = {
    schedule: risks.filter(r => r.type === 'schedule').length,
    cost: risks.filter(r => r.type === 'cost').length,
    staff: risks.filter(r => r.type === 'staff').length,
    outsourcing: risks.filter(r => r.type === 'outsourcing').length,
    compliance: risks.filter(r => r.type === 'compliance').length
  };

  $: riskByLevel = {
    high: risks.filter(r => r.level === 'high').length,
    medium: risks.filter(r => r.level === 'medium').length,
    low: risks.filter(r => r.level === 'low').length
  };

  $: riskByStatus = {
    pending: risks.filter(r => r.status === 'pending').length,
    in_progress: risks.filter(r => r.status === 'in_progress').length,
    resolved: risks.filter(r => r.status === 'resolved').length
  };
</script>

<div class="p-6">
  <div class="mb-6">
    <h2 class="text-2xl font-bold text-gray-800">仪表盘</h2>
    <p class="text-gray-600">项目风险全链路管控系统概览</p>
  </div>

  <!-- 统计卡片 -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div class="card">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-500 text-sm">活跃项目</p>
          <p class="text-3xl font-bold text-gray-800 mt-1">{activeProjects}</p>
        </div>
        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <i class="ri-folder-line text-blue-600 text-2xl"></i>
        </div>
      </div>
      <div class="mt-4 text-sm text-blue-600">
        <i class="ri-information-line"></i> 共 {projects.length} 个项目
      </div>
    </div>

    <div class="card">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-500 text-sm">待处理风险</p>
          <p class="text-3xl font-bold text-gray-800 mt-1">{pendingRisks}</p>
        </div>
        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <i class="ri-alarm-warning-line text-red-600 text-2xl"></i>
        </div>
      </div>
      <div class="mt-4 text-sm text-red-600">
        <i class="ri-error-warning-line"></i> {highRisks} 个高风险
      </div>
    </div>

    <div class="card">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-500 text-sm">风险报告</p>
          <p class="text-3xl font-bold text-gray-800 mt-1">{reports.length}</p>
        </div>
        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <i class="ri-file-text-line text-green-600 text-2xl"></i>
        </div>
      </div>
      <div class="mt-4 text-sm text-green-600">
        <i class="ri-check-line"></i> 规则库: {rules.length} 条规则
      </div>
    </div>

    <div class="card">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-500 text-sm">整改进行中</p>
          <p class="text-3xl font-bold text-gray-800 mt-1">{inProgressRectifications}</p>
        </div>
        <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
          <i class="ri-refresh-line text-yellow-600 text-2xl"></i>
        </div>
      </div>
      <div class="mt-4 text-sm text-yellow-600">
        <i class="ri-time-line"></i> 闭环管理中
      </div>
    </div>
  </div>

  <!-- 风险统计 -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
    <div class="card">
      <h3 class="font-bold text-gray-800 mb-4">风险类型分布</h3>
      <div class="space-y-3">
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-600">进度风险</span>
            <span class="font-medium">{riskByType.schedule}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-500 h-2 rounded-full" style="width: {risks.length > 0 ? (riskByType.schedule / risks.length) * 100 : 0}%"></div>
          </div>
        </div>
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-600">成本风险</span>
            <span class="font-medium">{riskByType.cost}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-red-500 h-2 rounded-full" style="width: {risks.length > 0 ? (riskByType.cost / risks.length) * 100 : 0}%"></div>
          </div>
        </div>
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-600">人员风险</span>
            <span class="font-medium">{riskByType.staff}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-yellow-500 h-2 rounded-full" style="width: {risks.length > 0 ? (riskByType.staff / risks.length) * 100 : 0}%"></div>
          </div>
        </div>
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-600">外包风险</span>
            <span class="font-medium">{riskByType.outsourcing}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-purple-500 h-2 rounded-full" style="width: {risks.length > 0 ? (riskByType.outsourcing / risks.length) * 100 : 0}%"></div>
          </div>
        </div>
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-600">合规风险</span>
            <span class="font-medium">{riskByType.compliance}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-green-500 h-2 rounded-full" style="width: {risks.length > 0 ? (riskByType.compliance / risks.length) * 100 : 0}%"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="font-bold text-gray-800 mb-4">风险等级分布</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded-full bg-red-500"></div>
            <span class="text-gray-700">高风险</span>
          </div>
          <span class="font-bold text-red-600">{riskByLevel.high}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span class="text-gray-700">中风险</span>
          </div>
          <span class="font-bold text-yellow-600">{riskByLevel.medium}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded-full bg-green-500"></div>
            <span class="text-gray-700">低风险</span>
          </div>
          <span class="font-bold text-green-600">{riskByLevel.low}</span>
        </div>
      </div>
      <div class="mt-6 pt-4 border-t border-gray-200">
        <div class="text-center">
          <p class="text-2xl font-bold text-gray-800">{risks.length}</p>
          <p class="text-sm text-gray-500">总风险数</p>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="font-bold text-gray-800 mb-4">风险状态分布</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded-full bg-gray-500"></div>
            <span class="text-gray-700">待处理</span>
          </div>
          <span class="font-bold text-gray-600">{riskByStatus.pending}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded-full bg-blue-500"></div>
            <span class="text-gray-700">处理中</span>
          </div>
          <span class="font-bold text-blue-600">{riskByStatus.in_progress}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded-full bg-green-500"></div>
            <span class="text-gray-700">已解决</span>
          </div>
          <span class="font-bold text-green-600">{riskByStatus.resolved}</span>
        </div>
      </div>
      <div class="mt-6 pt-4 border-t border-gray-200">
        <div class="text-center">
          <p class="text-2xl font-bold text-gray-800">{rectifications.length}</p>
          <p class="text-sm text-gray-500">整改记录数</p>
        </div>
      </div>
    </div>
  </div>

  <!-- 最近项目 -->
  <div class="card">
    <h3 class="font-bold text-gray-800 mb-4">项目列表</h3>
    {#if projects.length === 0}
      <p class="text-gray-500 text-center py-8">暂无项目数据</p>
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
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
