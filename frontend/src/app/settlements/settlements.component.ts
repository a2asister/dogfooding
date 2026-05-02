import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Settlement, Supplier, Contract } from '../services/api.service';

@Component({
  selector: 'app-settlements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <select class="form-select w-40" [(ngModel)]="statusFilter" (change)="filterSettlements()">
            <option value="">全部状态</option>
            <option value="pending">待审批</option>
            <option value="approved">已审批</option>
            <option value="paid">已支付</option>
            <option value="rejected">已拒绝</option>
          </select>
        </div>
        <button class="btn-primary flex items-center" (click)="openModal()">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          新增结算
        </button>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>结算单号</th>
                <th>供应商</th>
                <th>关联合同</th>
                <th>结算周期</th>
                <th>金额</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (settlement of filteredSettlements; track settlement.id) {
                <tr>
                  <td>
                    <span class="font-mono text-sm text-primary-600 font-medium">{{ settlement.settlementNumber }}</span>
                  </td>
                  <td>
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-2">
                        <span class="text-primary-600 font-semibold text-xs">{{ settlement.supplierName.charAt(0) }}</span>
                      </div>
                      <span class="text-gray-800">{{ settlement.supplierName }}</span>
                    </div>
                  </td>
                  <td>
                    <p class="text-sm text-gray-800">{{ settlement.contractName }}</p>
                  </td>
                  <td>{{ settlement.settlementPeriod }}</td>
                  <td>
                    <span class="font-semibold text-gray-800">¥{{ settlement.amount.toLocaleString() }}</span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getStatusClass(settlement.status)">
                      {{ getStatusText(settlement.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="flex items-center space-x-2">
                      @if (settlement.status === 'pending') {
                        <button class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                                (click)="approveSettlement(settlement)" title="审批通过">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </button>
                        <button class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                (click)="rejectSettlement(settlement)" title="拒绝">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      }
                      <button class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" 
                              (click)="viewDetails(settlement)" title="查看详情">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
              @empty {
                <tr>
                  <td colspan="7" class="text-center py-12 text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p>暂无结算对账数据</p>
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
            <h3 class="text-lg font-semibold text-gray-800">新增结算</h3>
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
                <label class="form-label">结算单号 *</label>
                <input type="text" class="form-input" [(ngModel)]="formData.settlementNumber" name="settlementNumber" required>
              </div>
              <div>
                <label class="form-label">供应商 *</label>
                <select class="form-select" [(ngModel)]="selectedSupplierId" name="supplierId" required (change)="onSupplierChange()">
                  <option value="">请选择供应商</option>
                  @for (supplier of suppliers; track supplier.id) {
                    <option [value]="supplier.id">{{ supplier.name }}</option>
                  }
                </select>
              </div>
              <div class="col-span-2">
                <label class="form-label">关联合同 *</label>
                <select class="form-select" [(ngModel)]="formData.contractId" name="contractId" required>
                  <option value="">请选择合同</option>
                  @for (contract of filteredContracts; track contract.id) {
                    <option [value]="contract.id">{{ contract.contractName }} (¥{{ contract.totalAmount.toLocaleString() }})</option>
                  }
                </select>
              </div>
              <div>
                <label class="form-label">结算周期 *</label>
                <input type="text" class="form-input" [(ngModel)]="formData.settlementPeriod" name="settlementPeriod" placeholder="如：2024年1月" required>
              </div>
              <div>
                <label class="form-label">结算金额 (元) *</label>
                <input type="number" class="form-input" [(ngModel)]="formData.amount" name="amount" required>
              </div>
            </div>
            <div>
              <label class="form-label">结算说明</label>
              <textarea class="form-textarea" [(ngModel)]="formData.description" name="description"></textarea>
            </div>
            <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
              <button type="button" class="btn-secondary" (click)="closeModal()">取消</button>
              <button type="submit" class="btn-primary">提交结算</button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (showDetailModal) {
      <div class="modal-overlay" (click)="closeDetailModal()">
        <div class="modal-content max-w-md" (click)="$event.stopPropagation()">
          <div class="card-header flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">结算详情</h3>
            <button class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    (click)="closeDetailModal()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          @if (selectedSettlement) {
            <div class="card-body space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">结算单号</p>
                  <p class="font-mono font-medium text-primary-600">{{ selectedSettlement.settlementNumber }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">供应商</p>
                  <p class="font-medium text-gray-800">{{ selectedSettlement.supplierName }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">关联合同</p>
                  <p class="font-medium text-gray-800">{{ selectedSettlement.contractName }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">结算周期</p>
                  <p class="font-medium text-gray-800">{{ selectedSettlement.settlementPeriod }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">结算金额</p>
                  <p class="font-bold text-lg text-green-600">¥{{ selectedSettlement.amount.toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">状态</p>
                  <span class="badge mt-1" [ngClass]="getStatusClass(selectedSettlement.status)">
                    {{ getStatusText(selectedSettlement.status) }}
                  </span>
                </div>
              </div>
              @if (selectedSettlement.approvedBy) {
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">审批人</p>
                    <p class="font-medium text-gray-800">{{ selectedSettlement.approvedBy }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">审批日期</p>
                    <p class="font-medium text-gray-800">{{ selectedSettlement.approvalDate | date:'yyyy-MM-dd' }}</p>
                  </div>
                </div>
              }
              @if (selectedSettlement.description) {
                <div>
                  <p class="text-sm text-gray-500 mb-2">结算说明</p>
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-gray-700">{{ selectedSettlement.description }}</p>
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
  `,
  styles: []
})
export class SettlementsComponent implements OnInit {
  settlements: Settlement[] = [];
  filteredSettlements: Settlement[] = [];
  suppliers: Supplier[] = [];
  contracts: Contract[] = [];
  filteredContracts: Contract[] = [];
  statusFilter: string = '';
  showModal: boolean = false;
  showDetailModal: boolean = false;
  selectedSupplierId: string = '';
  selectedSettlement: Settlement | null = null;

  formData: Partial<Settlement> = {
    supplierId: '',
    supplierName: '',
    contractId: '',
    contractName: '',
    settlementNumber: '',
    settlementPeriod: '',
    amount: 0,
    description: ''
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getSettlements().subscribe(response => {
      if (response.success) {
        this.settlements = response.data;
        this.filteredSettlements = [...this.settlements];
      }
    });

    this.apiService.getSuppliers().subscribe(response => {
      if (response.success) {
        this.suppliers = response.data;
      }
    });

    this.apiService.getContracts().subscribe(response => {
      if (response.success) {
        this.contracts = response.data;
        this.filteredContracts = [...this.contracts];
      }
    });
  }

  filterSettlements(): void {
    if (!this.statusFilter) {
      this.filteredSettlements = [...this.settlements];
    } else {
      this.filteredSettlements = this.settlements.filter(s => s.status === this.statusFilter);
    }
  }

  onSupplierChange(): void {
    if (this.selectedSupplierId) {
      const supplier = this.suppliers.find(s => s.id === this.selectedSupplierId);
      if (supplier) {
        this.formData.supplierId = supplier.id;
        this.formData.supplierName = supplier.name;
      }
      this.filteredContracts = this.contracts.filter(c => c.supplierId === this.selectedSupplierId);
    } else {
      this.filteredContracts = [...this.contracts];
    }
    this.formData.contractId = '';
    this.formData.contractName = '';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'badge-pending',
      'approved': 'badge-approved',
      'paid': 'badge-active',
      'rejected': 'badge-rejected'
    };
    return classes[status] || 'badge-pending';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'pending': '待审批',
      'approved': '已审批',
      'paid': '已支付',
      'rejected': '已拒绝'
    };
    return texts[status] || '待审批';
  }

  openModal(): void {
    this.selectedSupplierId = '';
    this.filteredContracts = [...this.contracts];
    this.formData = {
      supplierId: '',
      supplierName: '',
      contractId: '',
      contractName: '',
      settlementNumber: 'JS' + new Date().getFullYear() + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      settlementPeriod: '',
      amount: 0,
      description: ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    if (!this.formData.settlementNumber || !this.formData.supplierId || !this.formData.contractId ||
        !this.formData.settlementPeriod || !this.formData.amount) {
      alert('请填写必填字段');
      return;
    }

    const contract = this.contracts.find(c => c.id === this.formData.contractId);
    if (!contract) {
      alert('请选择有效的合同');
      return;
    }

    const supplier = this.suppliers.find(s => s.id === this.formData.supplierId);
    if (!supplier) {
      alert('请选择有效的供应商');
      return;
    }

    const newSettlement: Omit<Settlement, 'id' | 'createdAt' | 'status'> = {
      supplierId: this.formData.supplierId,
      supplierName: supplier.name,
      contractId: this.formData.contractId,
      contractName: contract.contractName,
      settlementNumber: this.formData.settlementNumber,
      settlementPeriod: this.formData.settlementPeriod,
      amount: this.formData.amount,
      description: this.formData.description || ''
    };

    this.apiService.createSettlement(newSettlement).subscribe(response => {
      if (response.success) {
        this.loadData();
        this.closeModal();
      }
    });
  }

  approveSettlement(settlement: Settlement): void {
    this.apiService.updateSettlement(settlement.id, {
      status: 'approved',
      approvedBy: '财务审批员',
      approvalDate: new Date().toISOString()
    }).subscribe(response => {
      if (response.success) {
        this.loadData();
      }
    });
  }

  rejectSettlement(settlement: Settlement): void {
    const reason = prompt('请输入拒绝原因：');
    if (reason !== null) {
      this.apiService.updateSettlement(settlement.id, {
        status: 'rejected',
        approvedBy: '财务审批员',
        approvalDate: new Date().toISOString()
      }).subscribe(response => {
        if (response.success) {
          this.loadData();
        }
      });
    }
  }

  viewDetails(settlement: Settlement): void {
    this.selectedSettlement = settlement;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedSettlement = null;
  }
}
