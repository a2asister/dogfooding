import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomersComponent } from './customers/customers.component';
import { FollowupsComponent } from './followups/followups.component';
import { OpportunitiesComponent } from './opportunities/opportunities.component';
import { RenewalAlertsComponent } from './renewal-alerts/renewal-alerts.component';
import { PlansComponent } from './plans/plans.component';
import { CustomerDetailComponent } from './customers/customer-detail/customer-detail.component';
import { OpportunityDetailComponent } from './opportunities/opportunity-detail/opportunity-detail.component';
import { PlanDetailComponent } from './plans/plan-detail/plan-detail.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'customers', component: CustomersComponent },
  { path: 'customers/:id', component: CustomerDetailComponent },
  { path: 'followups', component: FollowupsComponent },
  { path: 'opportunities', component: OpportunitiesComponent },
  { path: 'opportunities/:id', component: OpportunityDetailComponent },
  { path: 'renewal-alerts', component: RenewalAlertsComponent },
  { path: 'plans', component: PlansComponent },
  { path: 'plans/:id', component: PlanDetailComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
