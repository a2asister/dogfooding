import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Ticket, Supplier } from '../services/api.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="relative">
            <input type="text" placeholder="搜索工单标题..." 
                   class="form-input-search w-64"
                   [(ngModel)]="searchTerm" (input)="filterTickets()">
            <svg class="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <select class="form-select w-32" [(ngModel)]="statusFilter" (change)="filterTickets()">
            <option value="">全部状态</option>
            <option value="open">待处理</option>
            <option value="in-progress">处理中</option>
            <option value="resolved">已解决</option>
            <option value="closed">已关闭</option>
          </select>
          <select class="form-select w-32" [(ngModel)]="priorityFilter" (change)="filterTickets()">
            <option value="">全部优先级</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
        <button class="btn-primary flex items-center" (click)="openModal()">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          新建工单
        </button>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>工单号</th>
                <th>标题</th>
                <th>供应商</th>
                <th>优先级</th>
                <th>分类</th>
                <th>状态</th>
                <th>创建人</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (ticket of filteredTickets; track ticket.id) {
                <tr>
                  <td>
                    <span class="font-mono text-sm text-primary-600 font-medium">{{ ticket.ticketNumber }}</span>
                  </td>
                  <td>
                    <div class="max-w-xs">
                      <p class="font-medium text-gray-800 truncate">{{ ticket.title }}</p>
                      <p class="text-xs text-gray-500 truncate">{{ ticket.description }}</p>
                    </div>
                  </td>
                  <td>
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-2">
                        <span class="text-primary-600 font-semibold text-xs">{{ ticket.supplierName.charAt(0) }}</span>
                      </div>
                      <span class="text-gray-800">{{ ticket.supplierName }}</span>
                    </div>
                  </td>
                  <td>
                    <span [ngClass]="{
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800': ticket.priority === 'high',
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800': ticket.priority === 'medium',
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800': ticket.priority === 'low'
                    }">
                      {{ ticket.priority === 'high' ? '高' : ticket.priority === 'medium' ? '中' : '低' }}
                    </span>
                  </td>
                  <td>{{ ticket.category }}</td>
                  <td>
                    <span class="badge" [ngClass]="'badge-' + ticket.status">
                      {{ getStatusText(ticket.status) }}
                    </span>
                  </td>
                  <td>{{ ticket.createdBy }}</td>
                  <td>
                    <div class="flex items-center space-x-2">
                      <button class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" 
                              (click)="viewDetails(ticket)" title="查看详情">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      </button>
                      @if (ticket.status !== 'closed') {
                        <button class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                                (click)="editStatus(ticket)" title="更新状态">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                          </svg>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
              @empty {
                <tr>
                  <td colspan="8" class="text-center py-12 text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                    </svg>
                    <p>暂无工单数据</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    @if (showModal) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="card-header flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">新建工单</h3>
            <button class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    (click)="closeModal()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <form class="card-body space-y-4" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">工单号 *</label>
                <input type="text" class="form-input" [(ngModel)]="formData.ticketNumber" name="ticketNumber" required>
              </div>
              <div>
                <label class="form-label">供应商 *</label>
                <select class="form-select" [(ngModel)]="formData.supplierId" name="supplierId" required>
                  <option value="">请选择供应商</option>
                  @for (supplier of suppliers; track supplier.id) {
                    <option [value]="supplier.id">{{ supplier.name }}</option>
                  }
                </select>
              </div>
              <div class="col-span-2">
                <label class="form-label">工单标题 *</label>
                <input type="text" class="form-input" [(ngModel)]="formData.title" name="title" required>
              </div>
              <div>
                <label class="form-label">优先级 *</label>
                <select class="form-select" [(ngModel)]="formData.priority" name="priority" required>
                  <option value="high">高</option>
                  <option value="medium" selected>中</option>
                  <option value="low">低</option>
                </select>
              </div>
              <div>
                <label class="form-label">分类 *</label>
                <select class="form-select" [(ngModel)]="formData.category" name="category" required>
                  <option value="">请选择分类</option>
                  <option value="技术支持">技术支持</option>
                  <option value="服务投诉">服务投诉</option>
                  <option value="咨询建议">咨询建议</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label class="form-label">创建人 *</label>
                <input type="text" class="form-input" [(ngModel)]="formData.createdBy" name="createdBy" required>
              </div>
              <div>
                <label class="form-label">响应截止日期</label>
                <input type="date" class="form-input" [(ngModel)]="formData.responseDeadline" name="responseDeadline">
              </div>
            </div>
            <div>
              <label class="form-label">问题描述 *</label>
              <textarea class="form-textarea" [(ngModel)]="formData.description" name="description" required></textarea>
            </div>
            <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
              <button type="button" class="btn-secondary" (click)="closeModal()">取消</button>
              <button type="submit" class="btn-primary">提交工单</button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (showDetailModal) {
      <div class="modal-overlay" (click)="closeDetailModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="card-header flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">工单详情</h3>
            <button class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    (click)="closeDetailModal()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          @if (selectedTicket) {
            <div class="card-body space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">工单号</p>
                  <p class="font-mono font-medium text-primary-600">{{ selectedTicket.ticketNumber }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">供应商</p>
                  <p class="font-medium text-gray-800">{{ selectedTicket.supplierName }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">优先级</p>
                  <span [ngClass]="{
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800': selectedTicket.priority === 'high',
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800': selectedTicket.priority === 'medium',
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800': selectedTicket.priority === 'low'
                  }">
                    {{ selectedTicket.priority === 'high' ? '高' : selectedTicket.priority === 'medium' ? '中' : '低' }}
                  </span>
                </div>
                <div>
                  <p class="text-sm text-gray-500">分类</p>
                  <p class="font-medium text-gray-800">{{ selectedTicket.category }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">状态</p>
                  <span class="badge mt-1" [ngClass]="'badge-' + selectedTicket.status">
                    {{ getStatusText(selectedTicket.status) }}
                  </span>
                </div>
                <div>
                  <p class="text-sm text-gray-500">创建人</p>
                  <p class="font-medium text-gray-800">{{ selectedTicket.createdBy }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">受理人</p>
                  <p class="font-medium text-gray-800">{{ selectedTicket.assignee || '未分配' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">响应截止日期</p>
                  <p class="font-medium text-gray-800">{{ selectedTicket.responseDeadline || '-' }}</p>
                </div>
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-2">问题描述</p>
                <div class="p-3 bg-gray-50 rounded-lg">
                  <p class="text-gray-700">{{ selectedTicket.description }}</p>
                </div>
              </div>
              @if (selectedTicket.resolution) {
                <div>
                  <p class="text-sm text-gray-500 mb-2">处理记录</p>
                  <div class="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p class="text-gray-700">{{ selectedTicket.resolution }}</p>
                  </div>
                </div>
              }
              <div class="flex items-center justify-end pt-4 border-t border-gray-100">
                <button type="button" class="btn-secondary" (click)="closeDetailModal()">关闭</button>
              </div>
            </div>
          }
        </div>
      </div>
    }

    @if (showStatusModal && selectedTicket) {
      <div class="modal-overlay" (click)="closeStatusModal()">
        <div class="modal-content max-w-md" (click)="$event.stopPropagation()">
          <div class="card-header flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">更新工单状态</h3>
            <button class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    (click)="closeStatusModal()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <form class="card-body space-y-4" (ngSubmit)="updateStatus()">
            <div>
              <label class="form-label">新状态</label>
              <select class="form-select" [(ngModel)]="newStatus" name="newStatus">
                <option value="open">待处理</option>
                <option value="in-progress">处理中</option>
                <option value="resolved">已解决</option>
                <option value="closed">已关闭</option>
              </select>
            </div>
            <div>
              <label class="form-label">受理人</label>
              <input type="text" class="form-input" [(ngModel)]="newAssignee" name="newAssignee" placeholder="请输入受理人姓名">
            </div>
            <div>
              <label class="form-label">处理记录</label>
              <textarea class="form-textarea" [(ngModel)]="newResolution" name="newResolution" placeholder="请输入处理记录..."></textarea>
            </div>
            <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
              <button type="button" class="btn-secondary" (click)="closeStatusModal()">取消</button>
              <button type="submit" class="btn-primary">确认更新</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: []
})
export class TicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  suppliers: Supplier[] = [];
  searchTerm: string = '';
  statusFilter: string = '';
  priorityFilter: string = '';
  showModal: boolean = false;
  showDetailModal: boolean = false;
  showStatusModal: boolean = false;
  selectedTicket: Ticket | null = null;
  newStatus: string = '';
  newAssignee: string = '';
  newResolution: string = '';

  formData: Partial<Ticket> = {
    supplierId: '',
    supplierName: '',
    ticketNumber: '',
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    createdBy: '',
    responseDeadline: ''
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getTickets().subscribe(response => {
      if (response.success) {
        this.tickets = response.data;
        this.filteredTickets = [...this.tickets];
      }
    });

    this.apiService.getSuppliers().subscribe(response => {
      if (response.success) {
        this.suppliers = response.data;
      }
    });
  }

  filterTickets(): void {
    this.filteredTickets = this.tickets.filter(ticket => {
      const matchesSearch = !this.searchTerm || 
        ticket.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.statusFilter || ticket.status === this.statusFilter;
      const matchesPriority = !this.priorityFilter || ticket.priority === this.priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'open': '待处理',
      'in-progress': '处理中',
      'resolved': '已解决',
      'closed': '已关闭'
    };
    return texts[status] || '待处理';
  }

  openModal(): void {
    this.formData = {
      supplierId: '',
      supplierName: '',
      ticketNumber: 'GD' + new Date().getFullYear() + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      createdBy: '',
      responseDeadline: ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    if (!this.formData.ticketNumber || !this.formData.supplierId || !this.formData.title ||
        !this.formData.description || !this.formData.priority || !this.formData.category ||
        !this.formData.createdBy) {
      alert('请填写必填字段');
      return;
    }

    const supplier = this.suppliers.find(s => s.id === this.formData.supplierId);
    if (!supplier) {
      alert('请选择有效的供应商');
      return;
    }

    const newTicket: Omit<Ticket, 'id' | 'createdAt' | 'status' | 'updatedAt'> = {
      supplierId: this.formData.supplierId,
      supplierName: supplier.name,
      ticketNumber: this.formData.ticketNumber,
      title: this.formData.title,
      description: this.formData.description,
      priority: this.formData.priority,
      category: this.formData.category,
      createdBy: this.formData.createdBy,
      responseDeadline: this.formData.responseDeadline || ''
    };

    this.apiService.createTicket(newTicket).subscribe(response => {
      if (response.success) {
        this.loadData();
        this.closeModal();
      }
    });
  }

  viewDetails(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedTicket = null;
  }

  editStatus(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.newStatus = ticket.status;
    this.newAssignee = ticket.assignee || '';
    this.newResolution = ticket.resolution || '';
    this.showStatusModal = true;
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
    this.selectedTicket = null;
  }

  updateStatus(): void {
    if (this.selectedTicket) {
      const updates: Partial<Ticket> = {
        status: this.newStatus,
        updatedAt: new Date().toISOString()
      };
      if (this.newAssignee) {
        updates.assignee = this.newAssignee;
      }
      if (this.newResolution) {
        updates.resolution = this.newResolution;
      }

      this.apiService.updateTicket(this.selectedTicket.id, updates).subscribe(response => {
        if (response.success) {
          this.loadData();
          this.closeStatusModal();
        }
      });
    }
  }
}
