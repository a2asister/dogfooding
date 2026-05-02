import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OpportunityService } from '../../services/opportunity.service';
import { CustomerService } from '../../services/customer.service';
import { Opportunity } from '../../models/opportunity.model';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-opportunity-detail',
  templateUrl: './opportunity-detail.component.html',
  styleUrl: './opportunity-detail.component.css'
})
export class OpportunityDetailComponent implements OnInit {
  opportunityId: string = '';
  opportunity: Opportunity | null = null;
  customer: Customer | null = null;
  loading = true;

  stages = ['初步接触', '需求确认', '方案报价', '商务谈判', '已成交', '已流失'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private opportunityService: OpportunityService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.opportunityId = params['id'];
      if (this.opportunityId) {
        this.loadData();
      }
    });
  }

  loadData(): void {
    this.opportunityService.getOpportunity(this.opportunityId).subscribe({
      next: (opportunity) => {
        this.opportunity = opportunity;
        this.loadCustomer(opportunity.customerId);
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
    this.router.navigate(['/opportunities']);
  }

  getStageColor(stage: string): string {
    switch (stage) {
      case '初步接触': return 'bg-blue-500';
      case '需求确认': return 'bg-cyan-500';
      case '方案报价': return 'bg-yellow-500';
      case '商务谈判': return 'bg-orange-500';
      case '已成交': return 'bg-green-500';
      case '已流失': return 'bg-red-500';
      default: return 'bg-gray-500';
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
