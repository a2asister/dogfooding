import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanService } from '../../services/plan.service';
import { CustomerService } from '../../services/customer.service';
import { Plan } from '../../models/plan.model';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-plan-detail',
  templateUrl: './plan-detail.component.html',
  styleUrl: './plan-detail.component.css'
})
export class PlanDetailComponent implements OnInit {
  planId: string = '';
  plan: Plan | null = null;
  customer: Customer | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planService: PlanService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.planId = params['id'];
      if (this.planId) {
        this.loadData();
      }
    });
  }

  loadData(): void {
    this.planService.getPlan(this.planId).subscribe({
      next: (plan) => {
        this.plan = plan;
        this.loadCustomer(plan.customerId);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadCustomer(customerId: string): void {
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customer = customers.find(c => c.id === customerId) || null;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/plans']);
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
