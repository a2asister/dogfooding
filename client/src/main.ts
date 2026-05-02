// ==================== Types ====================
interface Department {
  id: string;
  name: string;
}

interface Budget {
  id: string;
  departmentId: string;
  departmentName: string;
  year: number;
  month: number;
  totalAmount: number;
  usedAmount: number;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  merchantName?: string;
  receiptImage?: string;
}

interface ExpenseApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  departmentId: string;
  departmentName: string;
  title: string;
  description?: string;
  items: ExpenseItem[];
  totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  approverId?: string;
  approverName?: string;
  approvalComment?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
}

interface StatsData {
  budget: {
    total: number;
    used: number;
    remaining: number;
    usageRate: number;
  };
  applications: {
    pending: number;
    approved: number;
    rejected: number;
    totalThisMonth: number;
  };
}

interface ReceiptData {
  merchantName: string;
  date: string;
  amount: number;
  category: string;
  items: Array<{ name: string; amount: number }>;
  taxNumber?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ==================== API Client ====================
const API_BASE = '/api';

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const response = await fetch(API_BASE + endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  return response.json();
}

const api = {
  getHealth: () => apiCall('/health'),
  getStats: () => apiCall<StatsData>('/stats'),
  getDepartments: () => apiCall<Department[]>('/departments'),
  
  getBudgets: () => apiCall<Budget[]>('/budgets'),
  getBudget: (id: string) => apiCall<Budget>(`/budgets/${id}`),
  createBudget: (data: Partial<Budget>) => apiCall<Budget>('/budgets', { method: 'POST', body: JSON.stringify(data) }),
  updateBudget: (id: string, data: Partial<Budget>) => apiCall<Budget>(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getBudgetAnalysis: (year: number, month: number) => apiCall(`/budgets/analysis/${year}/${month}`),
  
  getApplications: (params?: { status?: string; page?: number; pageSize?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.pageSize) query.append('pageSize', params.pageSize.toString());
    return apiCall<PaginatedResponse<ExpenseApplication>>(`/applications?${query.toString()}`);
  },
  getApplication: (id: string) => apiCall<ExpenseApplication>(`/applications/${id}`),
  createApplication: (data: Partial<ExpenseApplication>) => apiCall<ExpenseApplication>('/applications', { method: 'POST', body: JSON.stringify(data) }),
  updateApplication: (id: string, data: Partial<ExpenseApplication>) => apiCall<ExpenseApplication>(`/applications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteApplication: (id: string) => apiCall(`/applications/${id}`, { method: 'DELETE' }),
  submitApplication: (id: string) => apiCall(`/applications/${id}/submit`, { method: 'POST' }),
  approveApplication: (id: string, comment?: string) => apiCall(`/applications/${id}/approve`, { method: 'POST', body: JSON.stringify({ comment }) }),
  rejectApplication: (id: string, comment?: string) => apiCall(`/applications/${id}/reject`, { method: 'POST', body: JSON.stringify({ comment }) }),
  
  getCategories: () => apiCall<string[]>('/receipts/categories'),
  recognizeReceipt: (text: string) => apiCall<ReceiptData>('/receipts/recognize', { method: 'POST', body: JSON.stringify({ text }) }),
  classifyExpense: (data: { description: string; merchantName?: string }) => apiCall<{ category: string; confidence: number }>('/receipts/classify', { method: 'POST', body: JSON.stringify(data) })
};

// ==================== Utils ====================
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount);
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('zh-CN');
}

function getStatusBadge(status: string): { text: string; class: string } {
  const map: Record<string, { text: string; class: string }> = {
    draft: { text: '草稿', class: 'badge-draft' },
    pending: { text: '待审批', class: 'badge-pending' },
    approved: { text: '已通过', class: 'badge-approved' },
    rejected: { text: '已拒绝', class: 'badge-rejected' },
    locked: { text: '已锁定', class: 'badge-locked' },
    unlocked: { text: '可用', class: 'badge-unlocked' }
  };
  return map[status] || { text: status, class: 'badge-draft' };
}

function getUsageColor(rate: number): string {
  if (rate >= 90) return 'bg-danger-500';
  if (rate >= 70) return 'bg-warning-500';
  return 'bg-success-500';
}

// ==================== Toast ====================
function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const container = document.getElementById('toast-container')!;
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-success-500' : type === 'error' ? 'bg-danger-500' : 'bg-primary-500';
  toast.className = `animate-slide-in ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==================== Modal ====================
function showModal(content: string): () => void {
  const container = document.getElementById('modal-container')!;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      ${content}
    </div>
  `;
  container.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  function closeModal() {
    modal.remove();
  }
  
  (window as any).closeModal = closeModal;
  return closeModal;
}

function closeModal() {
  const container = document.getElementById('modal-container')!;
  container.innerHTML = '';
}

// ==================== Navigation ====================
type Route = 'dashboard' | 'budgets' | 'applications' | 'approvals' | 'receipts' | 'analysis' | 'create-application' | 'edit-application' | 'view-application';

let currentRoute: Route = 'dashboard';
let routeParams: Record<string, string> = {};

const navItems = [
  { id: 'dashboard' as Route, title: '工作台', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>` },
  { id: 'budgets' as Route, title: '预算管理', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>` },
  { id: 'applications' as Route, title: '消费申请', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>` },
  { id: 'approvals' as Route, title: '审批中心', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>` },
  { id: 'receipts' as Route, title: '票据识别', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>` },
  { id: 'analysis' as Route, title: '预算分析', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>` }
];

function renderNavigation() {
  const nav = document.getElementById('sidebar-nav')!;
  nav.innerHTML = navItems.map(item => `
    <a href="#" class="sidebar-link ${currentRoute === item.id ? 'active' : ''}" data-route="${item.id}">
      ${item.icon}
      <span class="ml-3">${item.title}</span>
    </a>
  `).join('');
  
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const route = (link as HTMLElement).dataset.route as Route;
      navigate(route);
    });
  });
}

function navigate(route: Route, params: Record<string, string> = {}) {
  currentRoute = route;
  routeParams = params;
  
  const pageTitle = document.getElementById('page-title')!;
  const navItem = navItems.find(n => n.id === route);
  pageTitle.textContent = navItem?.title || '工作台';
  
  renderNavigation();
  renderPage();
  
  // Close sidebar on mobile
  const sidebar = document.getElementById('sidebar')!;
  const overlay = document.getElementById('sidebar-overlay')!;
  sidebar.classList.add('hidden', 'lg:block');
  overlay.classList.add('hidden');
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar')!;
  const overlay = document.getElementById('sidebar-overlay')!;
  sidebar.classList.toggle('hidden');
  sidebar.classList.toggle('lg:block');
  overlay.classList.toggle('hidden');
}

(window as any).toggleSidebar = toggleSidebar;

// ==================== Pages ====================

async function renderDashboard() {
  const content = document.getElementById('content')!;
  content.innerHTML = `
    <div class="flex items-center justify-center h-64">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>
  `;
  
  try {
    const [statsRes, appsRes, budgetsRes] = await Promise.all([
      api.getStats(),
      api.getApplications({ pageSize: 5 }),
      api.getBudgets()
    ]);
    
    const stats = statsRes.data;
    const recentApps = appsRes.data.items;
    const budgets = budgetsRes.data;
    
    content.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">总预算</p>
                <p class="text-2xl font-bold text-gray-800">${formatCurrency(stats.budget.total)}</p>
              </div>
              <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div class="mt-3 flex items-center text-sm">
              <span class="text-gray-500">预算使用率: </span>
              <span class="font-medium text-primary-600 ml-1">${stats.budget.usageRate}%</span>
            </div>
          </div>
          
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">已使用</p>
                <p class="text-2xl font-bold text-gray-800">${formatCurrency(stats.budget.used)}</p>
              </div>
              <div class="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
            </div>
            <div class="mt-3 flex items-center text-sm">
              <span class="text-gray-500">剩余: </span>
              <span class="font-medium text-success-600 ml-1">${formatCurrency(stats.budget.remaining)}</span>
            </div>
          </div>
          
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">待审批</p>
                <p class="text-2xl font-bold text-gray-800">${stats.applications.pending}</p>
              </div>
              <div class="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div class="mt-3 flex items-center text-sm">
              <span class="text-gray-500">本月申请: </span>
              <span class="font-medium text-gray-700 ml-1">${stats.applications.totalThisMonth}</span>
            </div>
          </div>
          
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">已通过</p>
                <p class="text-2xl font-bold text-gray-800">${stats.applications.approved}</p>
              </div>
              <div class="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div class="mt-3 flex items-center text-sm">
              <span class="text-gray-500">拒绝: </span>
              <span class="font-medium text-danger-600 ml-1">${stats.applications.rejected}</span>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100">
              <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-800">最近申请</h3>
                <button class="text-primary-600 text-sm font-medium hover:text-primary-700" data-nav="applications">
                  查看全部
                </button>
              </div>
              <div class="p-6">
                ${recentApps.length > 0 ? `
                  <div class="space-y-4">
                    ${recentApps.map(app => {
                      const badge = getStatusBadge(app.status);
                      return `
                        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors" data-view-app="${app.id}">
                          <div class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span class="text-primary-700 font-medium text-sm">${app.applicantName.charAt(0)}</span>
                            </div>
                            <div>
                              <p class="font-medium text-gray-800">${app.title}</p>
                              <p class="text-sm text-gray-500">${app.applicantName} · ${formatDate(app.createdAt)}</p>
                            </div>
                          </div>
                          <div class="flex items-center gap-4">
                            <span class="font-semibold text-gray-800">${formatCurrency(app.totalAmount)}</span>
                            <span class="status-badge ${badge.class}">${badge.text}</span>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                ` : `
                  <div class="text-center py-8 text-gray-500">
                    <p>暂无申请记录</p>
                  </div>
                `}
              </div>
            </div>
          </div>
          
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100">
              <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="text-lg font-semibold text-gray-800">部门预算概览</h3>
              </div>
              <div class="p-6">
                ${budgets.length > 0 ? `
                  <div class="space-y-4">
                    ${budgets.map(budget => {
                      const rate = budget.totalAmount > 0 ? Math.round((budget.usedAmount / budget.totalAmount) * 100) : 0;
                      const color = getUsageColor(rate);
                      const lockBadge = getStatusBadge(budget.locked ? 'locked' : 'unlocked');
                      return `
                        <div class="space-y-2">
                          <div class="flex items-center justify-between">
                            <span class="font-medium text-gray-700">${budget.departmentName}</span>
                            <span class="text-sm text-gray-500">
                              ${formatCurrency(budget.usedAmount)} / ${formatCurrency(budget.totalAmount)}
                            </span>
                          </div>
                          <div class="progress-bar">
                            <div class="progress-bar-fill ${color}" style="width: ${rate}%"></div>
                          </div>
                          <div class="flex items-center justify-between text-xs">
                            <span class="text-gray-500">使用率: ${rate}%</span>
                            <span class="status-badge ${lockBadge.class}">${lockBadge.text}</span>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                ` : `
                  <div class="text-center py-8 text-gray-500">
                    <p>暂无预算数据</p>
                  </div>
                `}
              </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
              <div class="p-6">
                <button class="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2" data-nav="create-application">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  新建费用申请
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    content.querySelector('[data-nav="applications"]')?.addEventListener('click', () => navigate('applications'));
    content.querySelector('[data-nav="create-application"]')?.addEventListener('click', () => navigate('create-application'));
    content.querySelectorAll('[data-view-app]').forEach(el => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset.viewApp!;
        navigate('view-application', { id });
      });
    });
    
  } catch (err) {
    content.innerHTML = `
      <div class="text-center py-12 text-gray-500">
        <p>加载数据失败，请稍后重试</p>
      </div>
    `;
    showToast('加载数据失败', 'error');
  }
}

async function renderBudgets() {
  const content = document.getElementById('content')!;
  content.innerHTML = `
    <div class="flex items-center justify-center h-64">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>
  `;
  
  try {
    const [budgetsRes, deptsRes] = await Promise.all([
      api.getBudgets(),
      api.getDepartments()
    ]);
    
    const budgets = budgetsRes.data;
    const departments = deptsRes.data;
    
    content.innerHTML = `
      <div class="animate-fade-in">
        <div class="flex items-center justify-between mb-6">
          <p class="text-gray-600">管理各部门的月度预算，支持锁定防止超支</p>
          <button class="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2" id="create-budget-btn">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            新建预算
          </button>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">部门</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">月份</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总预算</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">已使用</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">使用率</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${budgets.map(budget => {
                const rate = budget.totalAmount > 0 ? Math.round((budget.usedAmount / budget.totalAmount) * 100) : 0;
                const color = rate >= 90 ? 'bg-danger-100 text-danger-700' : rate >= 70 ? 'bg-warning-100 text-warning-700' : 'bg-success-100 text-success-700';
                const lockBadge = getStatusBadge(budget.locked ? 'locked' : 'unlocked');
                return `
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="font-medium text-gray-800">${budget.departmentName}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                      ${budget.year}年${budget.month}月
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-800 font-medium">
                      ${formatCurrency(budget.totalAmount)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                      ${formatCurrency(budget.usedAmount)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}">
                        ${rate}%
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="status-badge ${lockBadge.class}">${lockBadge.text}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <button class="text-primary-600 hover:text-primary-700 font-medium mr-3" data-edit-budget="${budget.id}">编辑</button>
                      <button class="font-medium ${budget.locked ? 'text-success-600 hover:text-success-700' : 'text-warning-600 hover:text-warning-700'}" data-toggle-lock="${budget.id}">
                        ${budget.locked ? '解锁' : '锁定'}
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    document.getElementById('create-budget-btn')?.addEventListener('click', () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      showModal(`
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">新建预算</h3>
          <form id="create-budget-form">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">部门</label>
                <select id="budget-dept" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  ${departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                </select>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">年份</label>
                  <input type="number" id="budget-year" value="${year}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">月份</label>
                  <input type="number" id="budget-month" value="${month}" min="1" max="12" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">预算金额</label>
                <input type="number" id="budget-amount" placeholder="输入预算金额" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button type="button" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" onclick="closeModal()">取消</button>
              <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">创建</button>
            </div>
          </form>
        </div>
      `);
      
      document.getElementById('create-budget-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const deptId = (document.getElementById('budget-dept') as HTMLSelectElement).value;
        const dept = departments.find(d => d.id === deptId)!;
        const year = parseInt((document.getElementById('budget-year') as HTMLInputElement).value);
        const month = parseInt((document.getElementById('budget-month') as HTMLInputElement).value);
        const amount = parseFloat((document.getElementById('budget-amount') as HTMLInputElement).value);
        
        if (!amount || amount <= 0) {
          showToast('请输入有效的预算金额', 'error');
          return;
        }
        
        try {
          await api.createBudget({
            departmentId: deptId,
            departmentName: dept.name,
            year,
            month,
            totalAmount: amount
          });
          showToast('预算创建成功', 'success');
          closeModal();
          renderBudgets();
        } catch (err) {
          showToast('创建预算失败', 'error');
        }
      });
    });
    
    content.querySelectorAll('[data-toggle-lock]').forEach(el => {
      el.addEventListener('click', async () => {
        const id = (el as HTMLElement).dataset.toggleLock!;
        const budget = budgets.find(b => b.id === id);
        if (!budget) return;
        
        try {
          await api.updateBudget(id, { locked: !budget.locked });
          showToast(budget.locked ? '预算已解锁' : '预算已锁定', 'success');
          renderBudgets();
        } catch (err) {
          showToast('操作失败', 'error');
        }
      });
    });
    
    content.querySelectorAll('[data-edit-budget]').forEach(el => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset.editBudget!;
        const budget = budgets.find(b => b.id === id);
        if (!budget) return;
        
        showModal(`
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">编辑预算</h3>
            <form id="edit-budget-form">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">部门</label>
                  <input type="text" value="${budget.departmentName}" disabled class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">预算金额</label>
                  <input type="number" id="edit-budget-amount" value="${budget.totalAmount}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                </div>
              </div>
              <div class="flex justify-end gap-3 mt-6">
                <button type="button" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" onclick="closeModal()">取消</button>
                <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">保存</button>
              </div>
            </form>
          </div>
        `);
        
        document.getElementById('edit-budget-form')?.addEventListener('submit', async (e) => {
          e.preventDefault();
          const amount = parseFloat((document.getElementById('edit-budget-amount') as HTMLInputElement).value);
          
          if (!amount || amount <= 0) {
            showToast('请输入有效的预算金额', 'error');
            return;
          }
          
          try {
            await api.updateBudget(id, { totalAmount: amount });
            showToast('预算更新成功', 'success');
            closeModal();
            renderBudgets();
          } catch (err) {
            showToast('更新预算失败', 'error');
          }
        });
      });
    });
    
  } catch (err) {
    showToast('加载数据失败', 'error');
  }
}

async function renderApplications() {
  const content = document.getElementById('content')!;
  content.innerHTML = `
    <div class="flex items-center justify-center h-64">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>
  `;
  
  try {
    const res = await api.getApplications();
    const apps = res.data.items;
    
    content.innerHTML = `
      <div class="animate-fade-in">
        <div class="flex items-center justify-between mb-6">
          <p class="text-gray-600">查看和管理所有费用申请</p>
          <button class="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2" data-nav="create-application">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            新建申请
          </button>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请标题</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请人</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">部门</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提交时间</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${apps.map(app => {
                const badge = getStatusBadge(app.status);
                return `
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="font-medium text-gray-800">${app.title}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                      ${app.applicantName}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                      ${app.departmentName}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-800 font-medium">
                      ${formatCurrency(app.totalAmount)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="status-badge ${badge.class}">${badge.text}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                      ${formatDate(app.createdAt)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <button class="text-primary-600 hover:text-primary-700 font-medium mr-3" data-view-app="${app.id}">查看</button>
                      ${app.status === 'draft' ? `
                        <button class="text-warning-600 hover:text-warning-700 font-medium mr-3" data-edit-app="${app.id}">编辑</button>
                        <button class="text-success-600 hover:text-success-700 font-medium mr-3" data-submit-app="${app.id}">提交</button>
                        <button class="text-danger-600 hover:text-danger-700 font-medium" data-delete-app="${app.id}">删除</button>
                      ` : ''}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    content.querySelector('[data-nav="create-application"]')?.addEventListener('click', () => navigate('create-application'));
    content.querySelectorAll('[data-view-app]').forEach(el => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset.viewApp!;
        navigate('view-application', { id });
      });
    });
    content.querySelectorAll('[data-edit-app]').forEach(el => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset.editApp!;
        navigate('edit-application', { id });
      });
    });
    content.querySelectorAll('[data-submit-app]').forEach(el => {
      el.addEventListener('click', async () => {
        const id = (el as HTMLElement).dataset.submitApp!;
        try {
          await api.submitApplication(id);
          showToast('申请已提交', 'success');
          renderApplications();
        } catch (err) {
          showToast('提交失败', 'error');
        }
      });
    });
    content.querySelectorAll('[data-delete-app]').forEach(el => {
      el.addEventListener('click', async () => {
        if (!confirm('确定要删除这个申请吗？')) return;
        const id = (el as HTMLElement).dataset.deleteApp!;
        try {
          await api.deleteApplication(id);
          showToast('申请已删除', 'success');
          renderApplications();
        } catch (err) {
          showToast('删除失败', 'error');
        }
      });
    });
    
  } catch (err) {
    showToast('加载数据失败', 'error');
  }
}

async function renderViewApplication() {
  const id = routeParams.id;
  const content = document.getElementById('content')!;
  
  if (!id) {
    navigate('applications');
    return;
  }
  
  content.innerHTML = `
    <div class="flex items-center justify-center h-64">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>
  `;
  
  try {
    const res = await api.getApplication(id);
    const app = res.data;
    const badge = getStatusBadge(app.status);
    
    content.innerHTML = `
      <div class="animate-fade-in">
        <div class="flex items-center justify-between mb-6">
          <button class="text-gray-600 hover:text-gray-800 flex items-center gap-2" data-nav="applications">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            返回列表
          </button>
          <div class="flex gap-3">
            ${app.status === 'draft' ? `
              <button class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" data-edit-app="${app.id}">编辑</button>
              <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700" data-submit-app="${app.id}">提交审批</button>
            ` : ''}
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100">
              <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-800">${app.title}</h3>
                <span class="status-badge ${badge.class}">${badge.text}</span>
              </div>
              <div class="p-6">
                ${app.description ? `<p class="text-gray-600 mb-6">${app.description}</p>` : ''}
                
                <h4 class="font-medium text-gray-800 mb-4">费用明细</h4>
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">类别</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">描述</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">日期</th>
                        <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">金额</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      ${app.items.map(item => `
                        <tr>
                          <td class="px-4 py-3 text-sm text-gray-600">${item.category}</td>
                          <td class="px-4 py-3 text-sm text-gray-800">${item.description}</td>
                          <td class="px-4 py-3 text-sm text-gray-500">${formatDate(item.date)}</td>
                          <td class="px-4 py-3 text-sm text-gray-800 font-medium text-right">${formatCurrency(item.amount)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                    <tfoot>
                      <tr class="bg-gray-50">
                        <td colspan="3" class="px-4 py-3 text-sm font-medium text-gray-800">合计</td>
                        <td class="px-4 py-3 text-sm font-bold text-gray-800 text-right">${formatCurrency(app.totalAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100">
              <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="text-lg font-semibold text-gray-800">申请信息</h3>
              </div>
              <div class="p-6 space-y-4">
                <div>
                  <p class="text-sm text-gray-500">申请人</p>
                  <p class="font-medium text-gray-800">${app.applicantName}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">部门</p>
                  <p class="font-medium text-gray-800">${app.departmentName}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">创建时间</p>
                  <p class="font-medium text-gray-800">${formatDate(app.createdAt)}</p>
                </div>
                ${app.submittedAt ? `
                  <div>
                    <p class="text-sm text-gray-500">提交时间</p>
                    <p class="font-medium text-gray-800">${formatDate(app.submittedAt)}</p>
                  </div>
                ` : ''}
                ${app.approverName ? `
                  <div>
                    <p class="text-sm text-gray-500">审批人</p>
                    <p class="font-medium text-gray-800">${app.approverName}</p>
                  </div>
                ` : ''}
                ${app.approvalComment ? `
                  <div>
                    <p class="text-sm text-gray-500">审批意见</p>
                    <p class="font-medium text-gray-800">${app.approvalComment}</p>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    content.querySelector('[data-nav="applications"]')?.addEventListener('click', () => navigate('applications'));
    content.querySelector('[data-edit-app]')?.addEventListener('click', () => navigate('edit-application', { id: app.id }));
    content.querySelector('[data-submit-app]')?.addEventListener('click', async () => {
      try {
        await api.submitApplication(app.id);
        showToast('申请已提交', 'success');
        renderViewApplication();
      } catch (err) {
        showToast('提交失败', 'error');
      }
    });
    
  } catch (err) {
    showToast('加载数据失败', 'error');
    navigate('applications');
  }
}

async function renderCreateApplication(editId?: string) {
  const content = document.getElementById('content')!;
  const isEdit = !!editId;
  
  let appData: Partial<ExpenseApplication> | null = null;
  
  if (isEdit) {
    try {
      const res = await api.getApplication(editId!);
      appData = res.data;
    } catch (err) {
      showToast('加载申请数据失败', 'error');
      navigate('applications');
      return;
    }
  }
  
  const [deptsRes, catsRes] = await Promise.all([
    api.getDepartments(),
    api.getCategories()
  ]);
  
  const departments = deptsRes.data;
  const categories = catsRes.data;
  
  const today = new Date().toISOString().split('T')[0];
  
  content.innerHTML = `
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-6">
        <button class="text-gray-600 hover:text-gray-800 flex items-center gap-2" data-nav="applications">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          返回列表
        </button>
      </div>
      
      <form id="application-form" class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-800">${isEdit ? '编辑申请' : '新建费用申请'}</h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">申请标题 <span class="text-danger-500">*</span></label>
                <input type="text" id="app-title" value="${appData?.title || ''}" placeholder="请输入申请标题" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">部门 <span class="text-danger-500">*</span></label>
                <select id="app-dept" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  ${departments.map(d => `<option value="${d.id}" ${appData?.departmentId === d.id ? 'selected' : ''}>${d.name}</option>`).join('')}
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">申请描述</label>
              <textarea id="app-desc" rows="3" placeholder="请输入申请描述（可选）" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">${appData?.description || ''}</textarea>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">费用明细</h3>
            <button type="button" class="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1" id="add-item-btn">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              添加项目
            </button>
          </div>
          <div class="p-6">
            <div id="items-container" class="space-y-4">
              ${(appData?.items || []).map((item, index) => `
                <div class="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg items-end" data-item="${index}">
                  <div class="flex-1 min-w-[150px]">
                    <label class="block text-sm font-medium text-gray-700 mb-1">类别</label>
                    <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 item-category">
                      ${categories.map(c => `<option value="${c}" ${item.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                  </div>
                  <div class="flex-1 min-w-[200px]">
                    <label class="block text-sm font-medium text-gray-700 mb-1">描述 <span class="text-danger-500">*</span></label>
                    <input type="text" value="${item.description}" placeholder="费用描述" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 item-desc">
                  </div>
                  <div class="w-32">
                    <label class="block text-sm font-medium text-gray-700 mb-1">日期 <span class="text-danger-500">*</span></label>
                    <input type="date" value="${item.date || today}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 item-date">
                  </div>
                  <div class="w-32">
                    <label class="block text-sm font-medium text-gray-700 mb-1">金额 <span class="text-danger-500">*</span></label>
                    <input type="number" value="${item.amount}" placeholder="0.00" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 item-amount">
                  </div>
                  <button type="button" class="text-danger-600 hover:text-danger-700 p-2" data-remove-item="${index}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              `).join('') || `
                <div class="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg items-end" data-item="0">
                  <div class="flex-1 min-w-[150px]">
                    <label class="block text-sm font-medium text-gray-700 mb-1">类别</label>
                    <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 item-category">
                      ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                  </div>
                  <div class="flex-1 min-w-[200px]">
                    <label class="block text-sm font-medium text-gray-700 mb-1">描述 <span class="text-danger-500">*</span></label>
                    <input type="text" placeholder="费用描述" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 item-desc">
                  </div>
                  <div class="w-32">
                    <label class="block text-sm font-medium text-gray-700 mb-1">日期 <span class="text-danger-500">*</span></label>
                    <input type="date" value="${today}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 item-date">
                  </div>
                  <div class="w-32">
                    <label class="block text-sm font-medium text-gray-700 mb-1">金额 <span class="text-danger-500">*</span></label>
                    <input type="number" placeholder="0.00" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 item-amount">
                  </div>
                  <button type="button" class="text-danger-600 hover:text-danger-700 p-2" data-remove-item="0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              `}
            </div>
            
            <div class="mt-6 pt-4 border-t border-gray-200 flex justify-end items-center gap-4">
              <span class="text-gray-600">总金额:</span>
              <span class="text-2xl font-bold text-gray-800" id="total-amount">${formatCurrency(appData?.totalAmount || 0)}</span>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-3">
          <button type="button" class="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" data-nav="applications">取消</button>
          <button type="submit" id="save-draft-btn" class="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">保存草稿</button>
          <button type="submit" id="submit-btn" class="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700">提交审批</button>
        </div>
      </form>
    </div>
  `;
  
  let submitMode: 'draft' | 'submit' = 'draft';
  
  function updateTotal() {
    let total = 0;
    content.querySelectorAll('.item-amount').forEach(input => {
      const val = parseFloat((input as HTMLInputElement).value) || 0;
      total += val;
    });
    document.getElementById('total-amount')!.textContent = formatCurrency(total);
  }
  
  content.querySelectorAll('.item-amount').forEach(input => {
    input.addEventListener('input', updateTotal);
  });
  
  document.getElementById('save-draft-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    submitMode = 'draft';
    submitForm();
  });
  
  document.getElementById('submit-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    submitMode = 'submit';
    submitForm();
  });
  
  document.getElementById('add-item-btn')?.addEventListener('click', () => {
    const container = document.getElementById('items-container')!;
    const index = container.children.length;
    const div = document.createElement('div');
    div.className = 'flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg items-end animate-fade-in';
    div.dataset.item = index.toString();
    div.innerHTML = `
      <div class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">类别</label>
        <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 item-category">
          ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>
      <div class="flex-1 min-w-[200px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">描述 <span class="text-danger-500">*</span></label>
        <input type="text" placeholder="费用描述" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 item-desc">
      </div>
      <div class="w-32">
        <label class="block text-sm font-medium text-gray-700 mb-1">日期 <span class="text-danger-500">*</span></label>
        <input type="date" value="${today}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 item-date">
      </div>
      <div class="w-32">
        <label class="block text-sm font-medium text-gray-700 mb-1">金额 <span class="text-danger-500">*</span></label>
        <input type="number" placeholder="0.00" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 item-amount">
      </div>
      <button type="button" class="text-danger-600 hover:text-danger-700 p-2" data-remove-item="${index}">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
    `;
    container.appendChild(div);
    
    const amountInput = div.querySelector('.item-amount') as HTMLInputElement;
    amountInput.addEventListener('input', updateTotal);
    
    const removeBtn = div.querySelector('[data-remove-item]');
    removeBtn?.addEventListener('click', () => {
      div.remove();
      updateTotal();
    });
  });
  
  content.querySelectorAll('[data-remove-item]').forEach(btn => {
    btn.addEventListener('click', () => {
      const container = document.getElementById('items-container')!;
      if (container.children.length > 1) {
        (btn as HTMLElement).closest('[data-item]')?.remove();
        updateTotal();
      }
    });
  });
  
  content.querySelector('[data-nav="applications"]')?.addEventListener('click', () => navigate('applications'));
  
  async function submitForm() {
    const title = (document.getElementById('app-title') as HTMLInputElement).value.trim();
    const deptId = (document.getElementById('app-dept') as HTMLSelectElement).value;
    const description = (document.getElementById('app-desc') as HTMLTextAreaElement).value.trim();
    
    if (!title) {
      showToast('请输入申请标题', 'error');
      return;
    }
    
    const dept = departments.find(d => d.id === deptId)!;
    
    const items: Array<{ category: string; description: string; amount: number; date: string }> = [];
    let hasError = false;
    
    content.querySelectorAll('[data-item]').forEach((item) => {
      const category = (item.querySelector('.item-category') as HTMLSelectElement).value;
      const desc = (item.querySelector('.item-desc') as HTMLInputElement).value.trim();
      const amount = parseFloat((item.querySelector('.item-amount') as HTMLInputElement).value);
      const date = (item.querySelector('.item-date') as HTMLInputElement).value;
      
      if (!desc) {
        hasError = true;
        showToast('请填写所有费用描述', 'error');
        return;
      }
      
      if (!amount || amount <= 0) {
        hasError = true;
        showToast('请输入有效的费用金额', 'error');
        return;
      }
      
      if (!date) {
        hasError = true;
        showToast('请选择费用日期', 'error');
        return;
      }
      
      items.push({ category, description: desc, amount, date });
    });
    
    if (hasError || items.length === 0) return;
    
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    
    const data = {
      title,
      departmentId: deptId,
      departmentName: dept.name,
      applicantId: 'user-1',
      applicantName: '张三',
      description: description || undefined,
      items: items.map(item => ({
        id: crypto.randomUUID(),
        ...item
      })),
      totalAmount,
      status: 'draft' as const
    };
    
    try {
      let result;
      if (isEdit && appData) {
        result = await api.updateApplication(appData.id!, data);
      } else {
        result = await api.createApplication(data);
      }
      
      if (submitMode === 'submit' && result.success) {
        await api.submitApplication(result.data.id);
        showToast('申请已提交审批', 'success');
      } else {
        showToast(isEdit ? '申请已更新' : '草稿已保存', 'success');
      }
      
      navigate('applications');
    } catch (err) {
      showToast('操作失败，请重试', 'error');
    }
  }
}

async function renderApprovals() {
  const content = document.getElementById('content')!;
  content.innerHTML = `
    <div class="flex items-center justify-center h-64">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>
  `;
  
  try {
    const res = await api.getApplications({ status: 'pending' });
    const apps = res.data.items;
    
    content.innerHTML = `
      <div class="animate-fade-in">
        <div class="flex items-center justify-between mb-6">
          <p class="text-gray-600">审批待处理的费用申请</p>
        </div>
        
        ${apps.length > 0 ? `
          <div class="space-y-4">
            ${apps.map(app => {
              const badge = getStatusBadge(app.status);
              return `
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span class="text-primary-700 font-medium text-sm">${app.applicantName.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 class="font-semibold text-gray-800">${app.title}</h4>
                          <p class="text-sm text-gray-500">${app.applicantName} · ${app.departmentName}</p>
                        </div>
                      </div>
                      ${app.description ? `<p class="text-gray-600 text-sm mt-2 ml-13">${app.description}</p>` : ''}
                      <div class="flex items-center gap-4 mt-3">
                        <span class="text-sm text-gray-500">${app.items.length} 项费用</span>
                        <span class="text-sm text-gray-500">创建于 ${formatDate(app.createdAt)}</span>
                      </div>
                    </div>
                    <div class="flex flex-col items-end gap-3">
                      <span class="text-2xl font-bold text-gray-800">${formatCurrency(app.totalAmount)}</span>
                      <div class="flex gap-2">
                        <button class="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 text-sm font-medium" data-approve="${app.id}">通过</button>
                        <button class="px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 text-sm font-medium" data-reject="${app.id}">拒绝</button>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-gray-500">暂无待审批的申请</p>
          </div>
        `}
      </div>
    `;
    
    content.querySelectorAll('[data-approve]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = (btn as HTMLElement).dataset.approve!;
        try {
          await api.approveApplication(id, '同意');
          showToast('申请已通过', 'success');
          renderApprovals();
        } catch (err) {
          showToast('操作失败', 'error');
        }
      });
    });
    
    content.querySelectorAll('[data-reject]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = (btn as HTMLElement).dataset.reject!;
        try {
          await api.rejectApplication(id, '不同意');
          showToast('申请已拒绝', 'success');
          renderApprovals();
        } catch (err) {
          showToast('操作失败', 'error');
        }
      });
    });
    
  } catch (err) {
    showToast('加载数据失败', 'error');
  }
}

async function renderReceipts() {
  const content = document.getElementById('content')!;
  
  const [catsRes] = await Promise.all([
    api.getCategories()
  ]);
  
  const categories = catsRes.data;
  
  content.innerHTML = `
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-6">
        <p class="text-gray-600">智能识别票据内容并自动归类费用</p>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-800">票据识别</h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer" id="upload-area">
              <input type="file" id="file-input" accept="image/jpeg,image/png,image/jpg" class="hidden">
              <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p class="text-gray-600 mb-1">点击上传票据图片</p>
              <p class="text-sm text-gray-400">支持 JPG、PNG 格式</p>
            </div>
            
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center">
                <span class="px-4 bg-white text-sm text-gray-500">或者</span>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">输入票据文本内容</label>
              <textarea id="receipt-text" rows="4" placeholder="例如：&#10;发票号码：12345&#10;商家：星巴克咖啡&#10;日期：2025-06-15&#10;金额：128.00元" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"></textarea>
            </div>
            
            <button class="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors" id="recognize-btn">
              开始识别
            </button>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-800">识别结果</h3>
          </div>
          <div class="p-6" id="result-container">
            <div class="text-center py-12 text-gray-400">
              <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              <p>识别结果将显示在这里</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800">智能归类</h3>
        </div>
        <div class="p-6">
          <p class="text-gray-600 mb-4">输入费用描述和商家，系统将自动归类</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">费用描述</label>
              <input type="text" id="classify-desc" placeholder="例如：团队聚餐" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">商家名称</label>
              <input type="text" id="classify-merchant" placeholder="例如：海底捞" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
            </div>
            <div class="flex items-end">
              <button class="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors" id="classify-btn">
                智能归类
              </button>
            </div>
          </div>
          <div id="classify-result" class="mt-4 hidden">
            <div class="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p class="text-sm text-gray-600 mb-1">推荐类别：</p>
              <p class="text-lg font-semibold text-primary-700" id="classify-category">-</p>
              <p class="text-sm text-gray-500 mt-1" id="classify-confidence">置信度：-</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  
  if (uploadArea && fileInput) {
    uploadArea.addEventListener('click', () => {
      fileInput.click();
    });
    
    fileInput.addEventListener('change', async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        showToast('请选择图片文件', 'error');
        return;
      }
      
      const resultContainer = document.getElementById('result-container')!;
      resultContainer.innerHTML = `
        <div class="flex items-center justify-center py-12">
          <div class="flex flex-col items-center gap-4">
            <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <p class="text-gray-500">正在识别票据...</p>
          </div>
        </div>
      `;
      
      const mockReceipts: Array<{ text: string; data: Partial<ReceiptData> }> = [
        {
          text: '星巴克咖啡',
          data: {
            merchantName: '星巴克咖啡',
            date: new Date().toISOString().split('T')[0],
            amount: 128.00,
            category: '业务招待费',
            items: [{ name: '拿铁咖啡 x2', amount: 76.00 }, { name: '提拉米苏', amount: 52.00 }]
          }
        },
        {
          text: '滴滴出行',
          data: {
            merchantName: '滴滴出行科技有限公司',
            date: new Date().toISOString().split('T')[0],
            amount: 89.50,
            category: '交通费',
            items: [{ name: '快车行程', amount: 89.50 }]
          }
        },
        {
          text: '办公用品',
          data: {
            merchantName: '京东商城',
            date: new Date().toISOString().split('T')[0],
            amount: 356.80,
            category: '办公费',
            items: [{ name: '打印纸 A4', amount: 120.00 }, { name: '签字笔', amount: 45.00 }, { name: '文件夹', amount: 191.80 }]
          }
        }
      ];
      
      const randomMock = mockReceipts[Math.floor(Math.random() * mockReceipts.length)];
      
      try {
        const res = await api.recognizeReceipt(randomMock.text);
        const data = { ...randomMock.data, ...res.data } as ReceiptData;
        
        resultContainer.innerHTML = `
          <div class="space-y-4 animate-fade-in">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-500 mb-1">商家</p>
                <p class="font-medium text-gray-800">${data.merchantName}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-500 mb-1">日期</p>
                <p class="font-medium text-gray-800">${formatDate(data.date)}</p>
              </div>
            </div>
            <div class="bg-primary-50 rounded-lg p-4">
              <p class="text-sm text-gray-500 mb-1">金额</p>
              <p class="text-2xl font-bold text-primary-700">${formatCurrency(data.amount)}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-500 mb-1">费用类别</p>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                ${data.category}
              </span>
            </div>
            ${data.items && data.items.length > 0 ? `
              <div>
                <p class="text-sm font-medium text-gray-700 mb-2">明细项目</p>
                <div class="space-y-2">
                  ${data.items.map(item => `
                    <div class="flex justify-between text-sm bg-gray-50 rounded p-2">
                      <span class="text-gray-600">${item.name}</span>
                      <span class="font-medium text-gray-800">${formatCurrency(item.amount)}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        `;
        
        showToast('票据识别成功', 'success');
      } catch (err) {
        resultContainer.innerHTML = `
          <div class="text-center py-12 text-gray-400">
            <p>识别失败，请重试</p>
          </div>
        `;
        showToast('识别失败', 'error');
      }
      
      fileInput.value = '';
    });
  }
  
  document.getElementById('recognize-btn')?.addEventListener('click', async () => {
    const text = (document.getElementById('receipt-text') as HTMLTextAreaElement).value.trim();
    
    if (!text) {
      showToast('请输入票据文本内容', 'error');
      return;
    }
    
    const resultContainer = document.getElementById('result-container')!;
    resultContainer.innerHTML = `
      <div class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    `;
    
    try {
      const res = await api.recognizeReceipt(text);
      const data = res.data;
      
      resultContainer.innerHTML = `
        <div class="space-y-4 animate-fade-in">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-500 mb-1">商家</p>
              <p class="font-medium text-gray-800">${data.merchantName}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-500 mb-1">日期</p>
              <p class="font-medium text-gray-800">${formatDate(data.date)}</p>
            </div>
          </div>
          <div class="bg-primary-50 rounded-lg p-4">
            <p class="text-sm text-gray-500 mb-1">金额</p>
            <p class="text-2xl font-bold text-primary-700">${formatCurrency(data.amount)}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-500 mb-1">费用类别</p>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
              ${data.category}
            </span>
          </div>
          ${data.items.length > 0 ? `
            <div>
              <p class="text-sm font-medium text-gray-700 mb-2">明细项目</p>
              <div class="space-y-2">
                ${data.items.map(item => `
                  <div class="flex justify-between text-sm bg-gray-50 rounded p-2">
                    <span class="text-gray-600">${item.name}</span>
                    <span class="font-medium text-gray-800">${formatCurrency(item.amount)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
      
      showToast('识别成功', 'success');
    } catch (err) {
      resultContainer.innerHTML = `
        <div class="text-center py-12 text-gray-400">
          <p>识别失败，请重试</p>
        </div>
      `;
      showToast('识别失败', 'error');
    }
  });
  
  document.getElementById('classify-btn')?.addEventListener('click', async () => {
    const desc = (document.getElementById('classify-desc') as HTMLInputElement).value.trim();
    const merchant = (document.getElementById('classify-merchant') as HTMLInputElement).value.trim();
    
    if (!desc && !merchant) {
      showToast('请输入费用描述或商家名称', 'error');
      return;
    }
    
    try {
      const res = await api.classifyExpense({ description: desc, merchantName: merchant || undefined });
      const result = document.getElementById('classify-result')!;
      result.classList.remove('hidden');
      document.getElementById('classify-category')!.textContent = res.data.category;
      document.getElementById('classify-confidence')!.textContent = `置信度：${Math.round(res.data.confidence * 100)}%`;
      showToast('归类成功', 'success');
    } catch (err) {
      showToast('归类失败', 'error');
    }
  });
}

async function renderAnalysis() {
  const content = document.getElementById('content')!;
  content.innerHTML = `
    <div class="flex items-center justify-center h-64">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>
  `;
  
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    const [budgetsRes, analysisRes] = await Promise.all([
      api.getBudgets(),
      api.getBudgetAnalysis(year, month)
    ]);
    
    const budgets = budgetsRes.data;
    
    content.innerHTML = `
      <div class="animate-fade-in">
        <div class="flex items-center justify-between mb-6">
          <p class="text-gray-600">月度预算结余分析</p>
          <div class="flex items-center gap-4">
            <select id="analysis-month" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option value="${year}-${month}">${year}年${month}月</option>
            </select>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="px-6 py-4 border-b border-gray-100">
              <h3 class="text-lg font-semibold text-gray-800">部门预算详情</h3>
            </div>
            <div class="p-6 space-y-6">
              ${budgets.map(budget => {
                const rate = budget.totalAmount > 0 ? Math.round((budget.usedAmount / budget.totalAmount) * 100) : 0;
                const color = getUsageColor(rate);
                const remaining = budget.totalAmount - budget.usedAmount;
                let health = '良好';
                let healthClass = 'text-success-600';
                if (rate >= 90) {
                  health = '危险';
                  healthClass = 'text-danger-600';
                } else if (rate >= 70) {
                  health = '预警';
                  healthClass = 'text-warning-600';
                }
                return `
                  <div class="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="font-semibold text-gray-800">${budget.departmentName}</h4>
                      <span class="status-badge ${budget.locked ? 'badge-locked' : 'badge-unlocked'}">
                        ${budget.locked ? '已锁定' : '可用'}
                      </span>
                    </div>
                    <div class="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p class="text-xs text-gray-500">总预算</p>
                        <p class="font-semibold text-gray-800">${formatCurrency(budget.totalAmount)}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500">已使用</p>
                        <p class="font-semibold text-gray-800">${formatCurrency(budget.usedAmount)}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500">剩余</p>
                        <p class="font-semibold ${remaining < 0 ? 'text-danger-600' : 'text-success-600'}">${formatCurrency(remaining)}</p>
                      </div>
                    </div>
                    <div class="mb-2">
                      <div class="flex justify-between text-sm mb-1">
                        <span class="text-gray-500">使用率</span>
                        <span class="font-medium text-gray-700">${rate}%</span>
                      </div>
                      <div class="progress-bar">
                        <div class="progress-bar-fill ${color}" style="width: ${Math.min(rate, 100)}%"></div>
                      </div>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-500">健康度评估：</span>
                      <span class="font-medium ${healthClass}">${health}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          
          <div class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100">
              <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="text-lg font-semibold text-gray-800">使用率排行</h3>
              </div>
              <div class="p-6">
                <div class="space-y-3">
                  ${[...budgets]
                    .sort((a, b) => {
                      const rateA = a.totalAmount > 0 ? a.usedAmount / a.totalAmount : 0;
                      const rateB = b.totalAmount > 0 ? b.usedAmount / b.totalAmount : 0;
                      return rateB - rateA;
                    })
                    .map((budget, index) => {
                      const rate = budget.totalAmount > 0 ? Math.round((budget.usedAmount / budget.totalAmount) * 100) : 0;
                      const rankColor = index === 0 ? 'bg-danger-500' : index === 1 ? 'bg-warning-500' : 'bg-gray-400';
                      return `
                        <div class="flex items-center gap-4">
                          <div class="w-8 h-8 ${rankColor} rounded-full flex items-center justify-center text-white font-bold text-sm">
                            ${index + 1}
                          </div>
                          <div class="flex-1">
                            <div class="flex justify-between text-sm mb-1">
                              <span class="font-medium text-gray-700">${budget.departmentName}</span>
                              <span class="text-gray-500">${rate}%</span>
                            </div>
                            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div class="h-full bg-primary-500 rounded-full" style="width: ${rate}%"></div>
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-100">
              <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="text-lg font-semibold text-gray-800">总体概览</h3>
              </div>
              <div class="p-6">
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-gray-50 rounded-lg p-4 text-center">
                    <p class="text-sm text-gray-500 mb-1">总预算</p>
                    <p class="text-xl font-bold text-gray-800">${formatCurrency(budgets.reduce((sum, b) => sum + b.totalAmount, 0))}</p>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-4 text-center">
                    <p class="text-sm text-gray-500 mb-1">总使用</p>
                    <p class="text-xl font-bold text-gray-800">${formatCurrency(budgets.reduce((sum, b) => sum + b.usedAmount, 0))}</p>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-4 text-center">
                    <p class="text-sm text-gray-500 mb-1">平均使用率</p>
                    <p class="text-xl font-bold text-primary-600">
                      ${budgets.length > 0 ? Math.round(budgets.reduce((sum, b) => {
                        const rate = b.totalAmount > 0 ? (b.usedAmount / b.totalAmount) * 100 : 0;
                        return sum + rate;
                      }, 0) / budgets.length) : 0}%
                    </p>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-4 text-center">
                    <p class="text-sm text-gray-500 mb-1">已锁定</p>
                    <p class="text-xl font-bold text-danger-600">
                      ${budgets.filter(b => b.locked).length}/${budgets.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
  } catch (err) {
    showToast('加载数据失败', 'error');
  }
}

function renderPage() {
  switch (currentRoute) {
    case 'dashboard':
      return renderDashboard();
    case 'budgets':
      return renderBudgets();
    case 'applications':
      return renderApplications();
    case 'create-application':
      return renderCreateApplication();
    case 'edit-application':
      return renderCreateApplication(routeParams.id);
    case 'view-application':
      return renderViewApplication();
    case 'approvals':
      return renderApprovals();
    case 'receipts':
      return renderReceipts();
    case 'analysis':
      return renderAnalysis();
    default:
      return renderDashboard();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavigation();
  renderPage();
});
