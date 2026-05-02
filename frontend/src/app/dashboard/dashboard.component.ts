import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Supplier, Qualification, Contract, Ticket } from '../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">供应商总数</p>
              <p class="text-3xl font-bold text-gray-800 mt-2">{{ suppliers.length }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <span class="text-green-600 font-medium">新增 {{ thisMonthSuppliers }} 家</span>
            <span class="text-gray-400 ml-2">本月</span>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">待审核资质</p>
              <p class="text-3xl font-bold text-gray-800 mt-2">{{ pendingQualifications }}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <span class="text-yellow-600 font-medium">需要处理</span>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">有效合同</p>
              <p class="text-3xl font-bold text-gray-800 mt-2">{{ activeContracts }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <span class="text-gray-500">总金额 ¥{{ totalContractAmount.toLocaleString() }}</span>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">待处理工单</p>
              <p class="text-3xl font-bold text-gray-800 mt-2">{{ openTickets }}</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <span class="text-red-600 font-medium">高优先级 {{ highPriorityTickets }}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <div class="card-header flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">最近供应商</h3>
            <button class="text-primary-600 text-sm hover:text-primary-700 font-medium">查看全部</button>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              @for (supplier of recentSuppliers; track supplier.id) {
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                      <span class="text-primary-600 font-semibold text-sm">{{ supplier.name.charAt(0) }}</span>
                    </div>
                    <div>
                      <p class="font-medium text-gray-800">{{ supplier.name }}</p>
                      <p class="text-sm text-gray-500">{{ supplier.serviceType }}</p>
                    </div>
                  </div>
                  <span class="badge" [ngClass]="'badge-' + supplier.status">
                    {{ supplier.status === 'approved' ? '已通过' : supplier.status === 'pending' ? '待审核' : '已拒绝' }}
                  </span>
                </div>
              }
              @empty {
                <p class="text-gray-500 text-center py-8">暂无供应商数据</p>
              }
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">最近工单</h3>
            <button class="text-primary-600 text-sm hover:text-primary-700 font-medium">查看全部</button>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              @for (ticket of recentTickets; track ticket.id) {
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div class="flex-1">
                    <div class="flex items-center">
                      <p class="font-medium text-gray-800">{{ ticket.title }}</p>
                      <span class="ml-2" [ngClass]="{
                        'text-red-600': ticket.priority === 'high',
                        'text-yellow-600': ticket.priority === 'medium',
                        'text-green-600': ticket.priority === 'low'
                      }">
                        {{ ticket.priority === 'high' ? '高' : ticket.priority === 'medium' ? '中' : '低' }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-500">{{ ticket.supplierName }}</p>
                  </div>
                  <span class="badge" [ngClass]="'badge-' + ticket.status.replace('-', '-')">
                    {{ ticket.status === 'open' ? '待处理' : ticket.status === 'in-progress' ? '处理中' : ticket.status === 'resolved' ? '已解决' : '已关闭' }}
                  </span>
                </div>
              }
              @empty {
                <p class="text-gray-500 text-center py-8">暂无工单数据</p>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  suppliers: Supplier[] = [];
  qualifications: Qualification[] = [];
  contracts: Contract[] = [];
  tickets: Ticket[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getSuppliers().subscribe(response => {
      if (response.success) {
        this.suppliers = response.data;
      }
    });

    this.apiService.getQualifications().subscribe(response => {
      if (response.success) {
        this.qualifications = response.data;
      }
    });

    this.apiService.getContracts().subscribe(response => {
      if (response.success) {
        this.contracts = response.data;
      }
    });

    this.apiService.getTickets().subscribe(response => {
      if (response.success) {
        this.tickets = response.data;
      }
    });
  }

  get pendingQualifications(): number {
    return this.qualifications.filter(q => q.status === 'pending').length;
  }

  get activeContracts(): number {
    return this.contracts.filter(c => c.status === 'active').length;
  }

  get totalContractAmount(): number {
    return this.contracts.reduce((sum, c) => sum + c.totalAmount, 0);
  }

  get openTickets(): number {
    return this.tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length;
  }

  get highPriorityTickets(): number {
    return this.tickets.filter(t => t.priority === 'high' && (t.status === 'open' || t.status === 'in-progress')).length;
  }

  get thisMonthSuppliers(): number {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    return this.suppliers.filter(s => {
      const createdAt = new Date(s.createdAt);
      return createdAt.getMonth() === thisMonth && createdAt.getFullYear() === thisYear;
    }).length;
  }

  get recentSuppliers(): Supplier[] {
    return [...this.suppliers]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }

  get recentTickets(): Ticket[] {
    return [...this.tickets]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }
}
