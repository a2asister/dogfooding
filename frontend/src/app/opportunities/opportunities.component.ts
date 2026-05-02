import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OpportunityService } from '../services/opportunity.service';
import { CustomerService } from '../services/customer.service';
import { Opportunity } from '../models/opportunity.model';
import { Customer } from '../models/customer.model';

@Component({
  selector: 'app-opportunities',
  templateUrl: './opportunities.component.html',
  styleUrl: './opportunities.component.css'
})
export class OpportunitiesComponent implements OnInit {
  opportunities: Opportunity[] = [];
  customers: Customer[] = [];
  loading = true;
  showModal = false;
  isEditMode = false;
  selectedOpportunityId: string | null = null;
  
  filterStage = '';

  opportunityForm: FormGroup;

  stages = ['初步接触', '需求确认', '方案报价', '商务谈判', '已成交', '已流失'];
  sources = ['老客户推荐', '客户主动咨询', '展会获取', '网络推广', '电话营销', '其他'];

  constructor(
    private opportunityService: OpportunityService,
    private customerService: CustomerService,
    private fb: FormBuilder
  ) {
    this.opportunityForm = this.fb.group({
      customerId: ['', Validators.required],
      name: ['', Validators.required],
      stage: ['初步接触', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      probability: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
      expectedCloseDate: ['', Validators.required],
      source: ['', Validators.required],
      description: [''],
      salesPerson: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.opportunityService.getOpportunities().subscribe({
      next: (opportunities) => {
        this.opportunities = opportunities;
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
    this.loading = this.opportunities.length === 0 && this.customers.length === 0;
  }

  get filteredOpportunities(): Opportunity[] {
    if (!this.filterStage) {
      return this.opportunities;
    }
    return this.opportunities.filter(o => o.stage === this.filterStage);
  }

  getCustomerName(customerId: string): string {
    const customer = this.customers.find(c => c.id === customerId);
    return customer ? customer.name : '未知客户';
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

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedOpportunityId = null;
    this.opportunityForm.reset({
      customerId: '',
      name: '',
      stage: '初步接触',
      amount: 0,
      probability: 50,
      expectedCloseDate: '',
      source: '',
      description: '',
      salesPerson: ''
    });
    this.showModal = true;
  }

  openEditModal(opportunity: Opportunity): void {
    this.isEditMode = true;
    this.selectedOpportunityId = opportunity.id;
    this.opportunityForm.patchValue({
      customerId: opportunity.customerId,
      name: opportunity.name,
      stage: opportunity.stage,
      amount: opportunity.amount,
      probability: opportunity.probability,
      expectedCloseDate: opportunity.expectedCloseDate,
      source: opportunity.source,
      description: opportunity.description,
      salesPerson: opportunity.salesPerson
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.opportunityForm.reset();
  }

  onSubmit(): void {
    if (this.opportunityForm.invalid) {
      return;
    }

    if (this.isEditMode && this.selectedOpportunityId) {
      this.opportunityService.updateOpportunity(this.selectedOpportunityId, this.opportunityForm.value).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
        },
        error: () => {}
      });
    } else {
      this.opportunityService.createOpportunity(this.opportunityForm.value).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
        },
        error: () => {}
      });
    }
  }

  deleteOpportunity(id: string): void {
    if (confirm('确定要删除这个商机吗？此操作不可恢复。')) {
      this.opportunityService.deleteOpportunity(id).subscribe({
        next: () => {
          this.loadData();
        },
        error: () => {}
      });
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
