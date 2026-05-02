import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ContentListComponent } from './components/content-list/content-list.component';
import { ContentDetailComponent } from './components/content-detail/content-detail.component';
import { RulesListComponent } from './components/rules-list/rules-list.component';
import { RuleFormComponent } from './components/rule-form/rule-form.component';
import { ReviewListComponent } from './components/review-list/review-list.component';
import { LogsListComponent } from './components/logs-list/logs-list.component';
import { ReportsComponent } from './components/reports/reports.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, title: '仪表盘' },
      { path: 'contents', component: ContentListComponent, title: '内容审核' },
      { path: 'contents/:id', component: ContentDetailComponent, title: '内容详情' },
      { path: 'rules', component: RulesListComponent, title: '违规规则' },
      { path: 'rules/new', component: RuleFormComponent, title: '新建规则' },
      { path: 'rules/:id/edit', component: RuleFormComponent, title: '编辑规则' },
      { path: 'review', component: ReviewListComponent, title: '人工复审' },
      { path: 'logs', component: LogsListComponent, title: '审核日志' },
      { path: 'reports', component: ReportsComponent, title: '合规报表' }
    ]
  }
];
