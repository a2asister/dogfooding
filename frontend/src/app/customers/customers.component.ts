import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from '../services/customer.service';
import { Customer } from '../models/customer.model';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  loading = true;
  showModal = false;
  isEditMode = false;
  selectedCustomerId: string | null = null;
  
  searchTerm = '';
  filterLevel = '';
  filterStatus = '';

  customerForm: FormGroup;

  industries = ['信息技术', '金融服务', '制造业', '贸易零售', '医疗健康', '教育培训', '其他'];
  sizes = ['大型企业', '中型企业', '小型企业', '初创企业'];
  levels = ['A', 'B', 'C', 'D'];
  statuses = ['活跃', '休眠', '流失'];

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder
  ) {
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      industry: ['', Validators.required],
      size: ['', Validators.required],
      contactPerson: ['', Validators.required],
      contactPhone: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      address: [''],
      level: ['B', Validators.required],
      status: ['活跃', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.filteredCustomers = [...customers];
        this.loading = false;
      },
      error: (error) => {
        console.error('加载客户列表失败:', error);
        this.loading = false;
      }
    });
  }

  filterCustomers(): void {
    this.filteredCustomers = this.customers.filter(customer => {
      const matchesSearch = !this.searchTerm || 
        customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customer.contactPerson.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customer.industry.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesLevel = !this.filterLevel || customer.level === this.filterLevel;
      const matchesStatus = !this.filterStatus || customer.status === this.filterStatus;
      
      return matchesSearch && matchesLevel && matchesStatus;
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedCustomerId = null;
    this.customerForm.reset({
      name: '',
      industry: '',
      size: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      address: '',
      level: 'B',
      status: '活跃',
      notes: ''
    });
    this.showModal = true;
  }

  openEditModal(customer: Customer): void {
    this.isEditMode = true;
    this.selectedCustomerId = customer.id;
    this.customerForm.patchValue({
      name: customer.name,
      industry: customer.industry,
      size: customer.size,
      contactPerson: customer.contactPerson,
      contactPhone: customer.contactPhone,
      contactEmail: customer.contactEmail,
      address: customer.address,
      level: customer.level,
      status: customer.status,
      notes: customer.notes || ''
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.customerForm.reset();
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      return;
    }

    if (this.isEditMode && this.selectedCustomerId) {
      this.customerService.updateCustomer(this.selectedCustomerId, this.customerForm.value).subscribe({
        next: () => {
          this.loadCustomers();
          this.closeModal();
        },
        error: (error) => {
          console.error('更新客户失败:', error);
        }
      });
    } else {
      this.customerService.createCustomer(this.customerForm.value).subscribe({
        next: () => {
          this.loadCustomers();
          this.closeModal();
        },
        error: (error) => {
          console.error('创建客户失败:', error);
        }
      });
    }
  }

  deleteCustomer(id: string): void {
    if (confirm('确定要删除这个客户吗？此操作不可恢复。')) {
      this.customerService.deleteCustomer(id).subscribe({
        next: () => {
          this.loadCustomers();
        },
        error: (error) => {
          console.error('删除客户失败:', error);
        }
      });
    }
  }

  getLevelBadgeClass(level: string): string {
    switch (level) {
      case 'A': return 'bg-red-100 text-red-800';
      case 'B': return 'bg-yellow-100 text-yellow-800';
      case 'C': return 'bg-blue-100 text-blue-800';
      case 'D': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case '活跃': return 'bg-green-100 text-green-800';
      case '休眠': return 'bg-yellow-100 text-yellow-800';
      case '流失': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
