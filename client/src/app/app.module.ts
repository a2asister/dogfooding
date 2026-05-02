import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BudgetListComponent } from './components/budgets/budget-list/budget-list.component';
import { ApplicationListComponent } from './components/applications/application-list/application-list.component';
import { ApplicationDetailComponent } from './components/applications/application-detail/application-detail.component';
import { ApplicationCreateComponent } from './components/applications/application-create/application-create.component';
import { ApprovalListComponent } from './components/approvals/approval-list/approval-list.component';
import { ReceiptRecognitionComponent } from './components/receipts/receipt-recognition/receipt-recognition.component';
import { BudgetAnalysisComponent } from './components/analysis/budget-analysis/budget-analysis.component';

import { StatusBadgePipe } from './pipes/status-badge.pipe';
import { CurrencyPipe, DatePipe } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    BudgetListComponent,
    ApplicationListComponent,
    ApplicationDetailComponent,
    ApplicationCreateComponent,
    ApprovalListComponent,
    ReceiptRecognitionComponent,
    BudgetAnalysisComponent,
    StatusBadgePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [CurrencyPipe, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
