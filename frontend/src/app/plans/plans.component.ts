import { Component, OnInit } from '@angular/core';
import { PlanService } from '../services/plan.service';
import { CustomerService } from '../services/customer.service';
import { Plan } from '../models/plan.model';
import { Customer } from '../models/customer.model';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.css'
})
export class PlansComponent implements OnInit {
  plans: Plan[] = [];
  customers: Customer[] = [];
  loading = true;
  
  filterStatus = '';

  statuses = ['草稿', '待审核', '已通过', '已拒绝'];

  constructor(
    private planService: PlanService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.planService.getPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
        this.checkLoading();
      },
      error: () => {
        this.loading = false;
      }
    });

    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.checkLoading();
      },
      error: () => {
        this.checkLoading();
      }
    });
  }

  checkLoading(): void {
    this.loading = this.plans.length === 0 && this.customers.length === 0;
  }

  get filteredPlans(): Plan[] {
    if (!this.filterStatus) {
      return this.plans;
    }
    return this.plans.filter(p => p.status === this.filterStatus);
  }

  getCustomerName(customerId: string): string {
    const customer = this.customers.find(c => c.id === customerId);
    return customer ? customer.name : '未知客户';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case '草稿': return 'bg-gray-100 text-gray-800';
      case '待审核': return 'bg-yellow-100 text-yellow-800';
      case '已通过': return 'bg-green-100 text-green-800';
      case '已拒绝': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
}
