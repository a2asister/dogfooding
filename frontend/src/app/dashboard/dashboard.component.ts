import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../services/customer.service';
import { OpportunityService } from '../services/opportunity.service';
import { RenewalAlertService } from '../services/renewal-alert.service';
import { Customer } from '../models/customer.model';
import { Opportunity } from '../models/opportunity.model';
import { RenewalAlert } from '../models/renewal-alert.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  customers: Customer[] = [];
  opportunities: Opportunity[] = [];
  alerts: RenewalAlert[] = [];
  loading = true;

  stats = {
    totalCustomers: 0,
    activeOpportunities: 0,
    pipelineValue: 0,
    urgentAlerts: 0
  };

  pipelineStages: { stage: string; count: number; value: number; percentage: number }[] = [];
  topCustomers: Customer[] = [];
  recentAlerts: RenewalAlert[] = [];

  constructor(
    private customerService: CustomerService,
    private opportunityService: OpportunityService,
    private alertService: RenewalAlertService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.customerService.getCustomers().subscribe(customers => {
      this.customers = customers;
      this.stats.totalCustomers = customers.length;
      this.topCustomers = customers.slice(0, 5);
      this.checkLoading();
    });

    this.opportunityService.getOpportunities().subscribe(opportunities => {
      this.opportunities = opportunities;
      this.stats.activeOpportunities = opportunities.filter(o => o.stage !== '已成交' && o.stage !== '已流失').length;
      this.stats.pipelineValue = opportunities.reduce((sum, o) => sum + (o.amount * o.probability / 100), 0);
      this.calculatePipelineStages(opportunities);
      this.checkLoading();
    });

    this.alertService.getAlerts().subscribe(alerts => {
      this.alerts = alerts;
      this.stats.urgentAlerts = alerts.filter(a => a.alertLevel === '高' && a.status !== '已完成' && a.status !== '已流失').length;
      this.recentAlerts = alerts.slice(0, 5);
      this.checkLoading();
    });
  }

  calculatePipelineStages(opportunities: Opportunity[]): void {
    const stageMap = new Map<string, { count: number; value: number }>();
    const stageOrder = ['初步接触', '需求确认', '方案报价', '商务谈判', '已成交', '已流失'];

    let totalValue = 0;
    opportunities.forEach(o => {
      totalValue += o.amount;
      const existing = stageMap.get(o.stage) || { count: 0, value: 0 };
      stageMap.set(o.stage, {
        count: existing.count + 1,
        value: existing.value + o.amount
      });
    });

    this.pipelineStages = stageOrder
      .filter(stage => stageMap.has(stage))
      .map(stage => {
        const data = stageMap.get(stage)!;
        return {
          stage,
          count: data.count,
          value: data.value,
          percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0
        };
      });
  }

  checkLoading(): void {
    this.loading = this.customers.length === 0 || this.opportunities.length === 0 || this.alerts.length === 0;
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

  getAlertLevelClass(level: string): string {
    switch (level) {
      case '高': return 'bg-red-100 text-red-800';
      case '中': return 'bg-yellow-100 text-yellow-800';
      case '低': return 'bg-green-100 text-green-800';
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
}
