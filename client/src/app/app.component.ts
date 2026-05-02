import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50 flex">
      <aside class="w-64 bg-white border-r border-gray-200 flex-shrink-0" [class.hidden]="isMobile && !sidebarOpen">
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h1 class="font-bold text-gray-800">费用报销</h1>
              <p class="text-xs text-gray-500">预算管控平台</p>
            </div>
          </div>
        </div>
        
        <nav class="p-4 space-y-1">
          <a 
            routerLink="/dashboard" 
            routerLinkActive="active"
            class="sidebar-link"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
            </svg>
            工作台
          </a>
          
          <a 
            routerLink="/budgets" 
            routerLinkActive="active"
            class="sidebar-link"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            预算管理
          </a>
          
          <a 
            routerLink="/applications" 
            routerLinkActive="active"
            class="sidebar-link"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            费用申请
          </a>
          
          <a 
            routerLink="/approvals" 
            routerLinkActive="active"
            class="sidebar-link"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
            审批中心
          </a>
          
          <a 
            routerLink="/receipts" 
            routerLinkActive="active"
            class="sidebar-link"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
            票据识别
          </a>
          
          <a 
            routerLink="/analysis" 
            routerLinkActive="active"
            class="sidebar-link"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
            </svg>
            预算分析
          </a>
        </nav>
        
        <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span class="text-primary-700 font-medium">张</span>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-700">张三</p>
              <p class="text-xs text-gray-500">技术部 · 经理</p>
            </div>
          </div>
        </div>
      </aside>
      
      <main class="flex-1 flex flex-col min-w-0">
        <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button 
              class="md:hidden p-2 rounded-lg hover:bg-gray-100"
              (click)="toggleSidebar()"
            >
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <h2 class="text-xl font-semibold text-gray-800">{{ currentPageTitle }}</h2>
          </div>
          
          <div class="flex items-center gap-4">
            <button class="relative p-2 rounded-lg hover:bg-gray-100">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              <span class="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
            </button>
          </div>
        </header>
        
        <div class="flex-1 overflow-auto p-6">
          <router-outlet></router-outlet>
        </div>
      </main>
      
      <div 
        *ngIf="isMobile && sidebarOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
        (click)="toggleSidebar()"
      ></div>
    </div>
  `
})
export class AppComponent {
  isMobile = window.innerWidth < 768;
  sidebarOpen = false;
  currentPageTitle = '工作台';

  private pageTitles: Record<string, string> = {
    'dashboard': '工作台',
    'budgets': '预算管理',
    'applications': '费用申请',
    'approvals': '审批中心',
    'receipts': '票据识别',
    'analysis': '预算分析'
  };

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const path = event.urlAfterRedirects.split('/')[1] || 'dashboard';
        this.currentPageTitle = this.pageTitles[path] || '工作台';
        if (this.isMobile) {
          this.sidebarOpen = false;
        }
      });

    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
      if (!this.isMobile) {
        this.sidebarOpen = false;
      }
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
