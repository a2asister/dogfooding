import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { FollowupService } from '../../services/followup.service';
import { OpportunityService } from '../../services/opportunity.service';
import { Customer } from '../../models/customer.model';
import { Followup } from '../../models/followup.model';
import { Opportunity } from '../../models/opportunity.model';

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.css'
})
export class CustomerDetailComponent implements OnInit {
  customerId: string = '';
  customer: Customer | null = null;
  followups: Followup[] = [];
  opportunities: Opportunity[] = [];
  loading = true;
  
  showFollowupModal = false;
  followupForm: FormGroup;

  contactTypes = ['电话', '邮件', '会议', '微信', '上门拜访', '其他'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private followupService: FollowupService,
    private opportunityService: OpportunityService,
    private fb: FormBuilder
  ) {
    this.followupForm = this.fb.group({
      contactPerson: ['', Validators.required],
      contactType: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      content: ['', Validators.required],
      nextAction: [''],
      nextActionDate: [''],
      salesPerson: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.customerId = params['id'];
      if (this.customerId) {
        this.loadCustomerData();
      }
    });
  }

  loadCustomerData(): void {
    this.loading = true;
    
    this.customerService.getCustomer(this.customerId).subscribe({
      next: (customer) => {
        this.customer = customer;
        this.checkLoading();
      },
      error: (error) => {
        console.error('加载客户信息失败:', error);
        this.loading = false;
      }
    });

    this.followupService.getFollowupsByCustomer(this.customerId).subscribe({
      next: (followups) => {
        this.followups = followups.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.checkLoading();
      },
      error: (error) => {
        console.error('加载跟进记录失败:', error);
        this.checkLoading();
      }
    });

    this.opportunityService.getOpportunities().subscribe({
      next: (opportunities) => {
        this.opportunities = opportunities.filter(o => o.customerId === this.customerId);
        this.checkLoading();
      },
      error: (error) => {
        console.error('加载商机失败:', error);
        this.checkLoading();
      }
    });
  }

  checkLoading(): void {
    this.loading = !this.customer;
  }

  openFollowupModal(): void {
    if (this.customer) {
      this.followupForm.patchValue({
        contactPerson: this.customer.contactPerson
      });
    }
    this.showFollowupModal = true;
  }

  closeFollowupModal(): void {
    this.showFollowupModal = false;
    this.followupForm.reset({
      contactPerson: '',
      contactType: '',
      date: new Date().toISOString().split('T')[0],
      content: '',
      nextAction: '',
      nextActionDate: '',
      salesPerson: ''
    });
  }

  onSubmitFollowup(): void {
    if (this.followupForm.invalid) {
      return;
    }

    const followupData = {
      customerId: this.customerId,
      ...this.followupForm.value,
      date: new Date(this.followupForm.value.date).toISOString(),
      nextActionDate: this.followupForm.value.nextActionDate 
        ? new Date(this.followupForm.value.nextActionDate).toISOString()
        : null
    };

    this.followupService.createFollowup(followupData).subscribe({
      next: () => {
        this.loadCustomerData();
        this.closeFollowupModal();
      },
      error: (error) => {
        console.error('创建跟进记录失败:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/customers']);
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}
