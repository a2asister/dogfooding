import { Component, OnInit } from '@angular/core';
import { FollowupService } from '../services/followup.service';
import { CustomerService } from '../services/customer.service';
import { Followup } from '../models/followup.model';
import { Customer } from '../models/customer.model';

@Component({
  selector: 'app-followups',
  templateUrl: './followups.component.html',
  styleUrl: './followups.component.css'
})
export class FollowupsComponent implements OnInit {
  followups: Followup[] = [];
  customers: Customer[] = [];
  loading = true;

  constructor(
    private followupService: FollowupService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.followupService.getFollowups().subscribe({
      next: (followups) => {
        this.followups = followups.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
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
    this.loading = this.followups.length === 0 && this.customers.length === 0;
  }

  getCustomerName(customerId: string): string {
    const customer = this.customers.find(c => c.id === customerId);
    return customer ? customer.name : '未知客户';
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
