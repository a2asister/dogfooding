import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomersComponent } from './customers/customers.component';
import { FollowupsComponent } from './followups/followups.component';
import { OpportunitiesComponent } from './opportunities/opportunities.component';
import { RenewalAlertsComponent } from './renewal-alerts/renewal-alerts.component';
import { PlansComponent } from './plans/plans.component';
import { CustomerDetailComponent } from './customers/customer-detail/customer-detail.component';
import { OpportunityDetailComponent } from './opportunities/opportunity-detail/opportunity-detail.component';
import { PlanDetailComponent } from './plans/plan-detail/plan-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    CustomersComponent,
    FollowupsComponent,
    OpportunitiesComponent,
    RenewalAlertsComponent,
    PlansComponent,
    CustomerDetailComponent,
    OpportunityDetailComponent,
    PlanDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
