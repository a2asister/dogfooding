import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Contract, Supplier } from '../services/api.service';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="relative">
            <input type="text" placeholder="搜索合同或供应商..." 
                   class="form-input-search w-64"
                   [(ngModel)]="searchTerm" (input)="filterContracts()">
            <svg class="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <select class="form-select w-40" [(ngModel)]="statusFilter" (change)="filterContracts()">
            <option value="">全部状态</option>
            <option value="active">有效</option>
            <option value="expired">已过期</option>
            <option value="terminated">已终止</option>
          </select>
        </div>
        <button class="btn-primary flex items-center" (click)="openModal()">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          新增合同
        </button>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>合同编号</th>
                <th>合同名称</th>
                <th>供应商</th>
                <th>合同类型</th>
                <th>金额</th>
                <th>有效期</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (contract of filteredContracts; track contract.id) {
                <tr>
                  <td>
                    <span class="font-mono text-sm text-primary-600 font-medium">{{ contract.contractNumber }}</span>
                  </td>
                  <td>
                    <p class="font-medium text-gray-800">{{ contract.contractName }}</p>
                  </td>
                  <td>
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-2">
                        <span class="text-primary-600 font-semibold text-xs">{{ contract.supplierName.charAt(0) }}</span>
                      </div>
                      <span class="text-gray-800">{{ contract.supplierName }}</span>
                    </div>
                  </td>
                  <td>{{ contract.contractType }}</td>
                  <td>
                    <span class="font-semibold text-gray-800">¥{{ contract.totalAmount.toLocaleString() }}</span>
                  </td>
                  <td>
                    <div>
                      <p class="text-sm">{{ contract.startDate }}</p>
                      <p class="text-xs text-gray-500">至 {{ contract.endDate }}</p>
                    </div>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="'badge-' + contract.status">
                      {{ contract.status === 'active' ? '有效' : contract.status === 'expired' ? '已过期' : '已终止' }}
                    </span>
                  </td>
                  <td>
                    <div class="flex items-center space-x-2">
                      <button class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" 
                              (click)="editContract(contract)" title="编辑">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" 
                              (click)="viewDetails(contract)" title="查看详情">
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
                  <td colspan="8" class="text-center py-12 text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p>暂无合同数据</p>
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
            <h3 class="text-lg font-semibold text-gray-800">
              {{ isEdit ? '编辑合同' : '新增合同' }}
            </h3>
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
                <label class="form-label">合同编号 *</label>
                <input type="text" class="form-input" [(ngModel)]="formData.contractNumber" name="contractNumber" required>
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
                <label class="form-label">合同名称 *</label>
                <input type="text" class="form-input" [(ngModel)]="formData.contractName" name="contractName" required>
              </div>
              <div>
                <label class="form-label">合同类型 *</label>
                <select class="form-select" [(ngModel)]="formData.contractType" name="contractType" required>
                  <option value="">请选择合同类型</option>
                  <option value="服务合同">服务合同</option>
                  <option value="采购合同">采购合同</option>
                  <option value="咨询合同">咨询合同</option>
                  <option value="技术合同">技术合同</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label class="form-label">合同金额 (元) *</label>
                <input type="number" class="form-input" [(ngModel)]="formData.totalAmount" name="totalAmount" required>
              </div>
              <div>
                <label class="form-label">开始日期 *</label>
                <input type="date" class="form-input" [(ngModel)]="formData.startDate" name="startDate" required>
              </div>
              <div>
                <label class="form-label">结束日期 *</label>
                <input type="date" class="form-input" [(ngModel)]="formData.endDate" name="endDate" required>
              </div>
              <div>
                <label class="form-label">签订人 *</label>
                <input type="text" class="form-input" [(ngModel)]="formData.signedBy" name="signedBy" required>
              </div>
              <div>
                <label class="form-label">签订日期 *</label>
                <input type="date" class="form-input" [(ngModel)]="formData.signDate" name="signDate" required>
              </div>
            </div>
            <div>
              <label class="form-label">付款条款</label>
              <textarea class="form-textarea" [(ngModel)]="formData.paymentTerms" name="paymentTerms"></textarea>
            </div>
            @if (isEdit) {
              <div>
                <label class="form-label">合同状态</label>
                <select class="form-select" [(ngModel)]="formData.status" name="status">
                  <option value="active">有效</option>
                  <option value="expired">已过期</option>
                  <option value="terminated">已终止</option>
                </select>
              </div>
            }
            <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
              <button type="button" class="btn-secondary" (click)="closeModal()">取消</button>
              <button type="submit" class="btn-primary">
                {{ isEdit ? '保存修改' : '创建合同' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (showDetailModal) {
      <div class="modal-overlay" (click)="closeDetailModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="card-header flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">合同详情</h3>
            <button class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    (click)="closeDetailModal()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          @if (selectedContract) {
            <div class="card-body space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">合同编号</p>
                  <p class="font-mono font-medium text-primary-600">{{ selectedContract.contractNumber }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">合同名称</p>
                  <p class="font-medium text-gray-800">{{ selectedContract.contractName }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">供应商</p>
                  <p class="font-medium text-gray-800">{{ selectedContract.supplierName }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">合同类型</p>
                  <p class="font-medium text-gray-800">{{ selectedContract.contractType }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">合同金额</p>
                  <p class="font-bold text-lg text-gray-800">¥{{ selectedContract.totalAmount.toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">有效期</p>
                  <p class="font-medium text-gray-800">{{ selectedContract.startDate }} 至 {{ selectedContract.endDate }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">签订人</p>
                  <p class="font-medium text-gray-800">{{ selectedContract.signedBy }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">签订日期</p>
                  <p class="font-medium text-gray-800">{{ selectedContract.signDate }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">合同状态</p>
                  <span class="badge mt-1" [ngClass]="'badge-' + selectedContract.status">
                    {{ selectedContract.status === 'active' ? '有效' : selectedContract.status === 'expired' ? '已过期' : '已终止' }}
                  </span>
                </div>
              </div>
              @if (selectedContract.paymentTerms) {
                <div>
                  <p class="text-sm text-gray-500 mb-2">付款条款</p>
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-gray-700">{{ selectedContract.paymentTerms }}</p>
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
export class ContractsComponent implements OnInit {
  contracts: Contract[] = [];
  filteredContracts: Contract[] = [];
  suppliers: Supplier[] = [];
  searchTerm: string = '';
  statusFilter: string = '';
  showModal: boolean = false;
  showDetailModal: boolean = false;
  isEdit: boolean = false;
  selectedContract: Contract | null = null;

  formData: Partial<Contract> = {
    contractNumber: '',
    supplierId: '',
    supplierName: '',
    contractName: '',
    contractType: '',
    startDate: '',
    endDate: '',
    totalAmount: 0,
    paymentTerms: '',
    signedBy: '',
    signDate: '',
    status: 'active'
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getContracts().subscribe(response => {
      if (response.success) {
        this.contracts = response.data;
        this.filteredContracts = [...this.contracts];
      }
    });

    this.apiService.getSuppliers().subscribe(response => {
      if (response.success) {
        this.suppliers = response.data;
      }
    });
  }

  filterContracts(): void {
    this.filteredContracts = this.contracts.filter(contract => {
      const matchesSearch = !this.searchTerm || 
        contract.contractName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        contract.contractNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        contract.supplierName.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.statusFilter || contract.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  openModal(): void {
    this.isEdit = false;
    this.formData = {
      contractNumber: 'HT' + new Date().getFullYear() + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      supplierId: '',
      supplierName: '',
      contractName: '',
      contractType: '',
      startDate: '',
      endDate: '',
      totalAmount: 0,
      paymentTerms: '',
      signedBy: '',
      signDate: '',
      status: 'active'
    };
    this.showModal = true;
  }

  editContract(contract: Contract): void {
    this.isEdit = true;
    this.formData = { ...contract };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    if (!this.formData.contractNumber || !this.formData.supplierId || !this.formData.contractName ||
        !this.formData.contractType || !this.formData.startDate || !this.formData.endDate ||
        !this.formData.totalAmount || !this.formData.signedBy || !this.formData.signDate) {
      alert('请填写必填字段');
      return;
    }

    const supplier = this.suppliers.find(s => s.id === this.formData.supplierId);
    if (!supplier) {
      alert('请选择有效的供应商');
      return;
    }

    if (this.isEdit && this.formData.id) {
      this.apiService.updateContract(this.formData.id, this.formData).subscribe(response => {
        if (response.success) {
          this.loadData();
          this.closeModal();
        }
      });
    } else {
      const newContract: Omit<Contract, 'id' | 'createdAt' | 'status'> = {
        contractNumber: this.formData.contractNumber,
        supplierId: this.formData.supplierId,
        supplierName: supplier.name,
        contractName: this.formData.contractName,
        contractType: this.formData.contractType,
        startDate: this.formData.startDate,
        endDate: this.formData.endDate,
        totalAmount: this.formData.totalAmount,
        paymentTerms: this.formData.paymentTerms || '',
        signedBy: this.formData.signedBy,
        signDate: this.formData.signDate
      };

      this.apiService.createContract(newContract).subscribe(response => {
        if (response.success) {
          this.loadData();
          this.closeModal();
        }
      });
    }
  }

  viewDetails(contract: Contract): void {
    this.selectedContract = contract;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedContract = null;
  }
}
