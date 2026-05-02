import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BudgetListComponent } from './components/budgets/budget-list/budget-list.component';
import { ApplicationListComponent } from './components/applications/application-list/application-list.component';
import { ApplicationDetailComponent } from './components/applications/application-detail/application-detail.component';
import { ApplicationCreateComponent } from './components/applications/application-create/application-create.component';
import { ApprovalListComponent } from './components/approvals/approval-list/approval-list.component';
import { ReceiptRecognitionComponent } from './components/receipts/receipt-recognition/receipt-recognition.component';
import { BudgetAnalysisComponent } from './components/analysis/budget-analysis/budget-analysis.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'budgets', component: BudgetListComponent },
  { 
    path: 'applications', 
    children: [
      { path: '', component: ApplicationListComponent },
      { path: 'create', component: ApplicationCreateComponent },
      { path: ':id', component: ApplicationDetailComponent },
      { path: ':id/edit', component: ApplicationCreateComponent }
    ]
  },
  { path: 'approvals', component: ApprovalListComponent },
  { path: 'receipts', component: ReceiptRecognitionComponent },
  { path: 'analysis', component: BudgetAnalysisComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
