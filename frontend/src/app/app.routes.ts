import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) 
  },
  { 
    path: 'suppliers', 
    loadComponent: () => import('./suppliers/suppliers.component').then(m => m.SuppliersComponent) 
  },
  { 
    path: 'qualifications', 
    loadComponent: () => import('./qualifications/qualifications.component').then(m => m.QualificationsComponent) 
  },
  { 
    path: 'ratings', 
    loadComponent: () => import('./ratings/ratings.component').then(m => m.RatingsComponent) 
  },
  { 
    path: 'contracts', 
    loadComponent: () => import('./contracts/contracts.component').then(m => m.ContractsComponent) 
  },
  { 
    path: 'settlements', 
    loadComponent: () => import('./settlements/settlements.component').then(m => m.SettlementsComponent) 
  },
  { 
    path: 'tickets', 
    loadComponent: () => import('./tickets/tickets.component').then(m => m.TicketsComponent) 
  }
];
