import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  providers: [
    ContentService
  ],
  template: `
    <div class="min-h-screen flex bg-gray-50">
      <!-- Sidebar -->
      <aside 
        [ngClass]="{
          'translate-x-0': sidebarOpen,
          '-translate-x-full': !sidebarOpen
        }"
        class="fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0"
      >
        <div class="flex flex-col h-full">
          <!-- Logo -->
          <div class="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
            <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900">内容审核</h1>
              <p class="text-xs text-gray-500">合规管理平台</p>
            </div>
            <button 
              (click)="toggleSidebar()"
              class="lg:hidden ml-auto p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
            <p class="px-4 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">主菜单</p>
            
            <a 
              routerLink="/dashboard" 
              routerLinkActive="nav-item-active"
              class="nav-item"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <span>仪表盘</span>
            </a>
            
            <a 
              routerLink="/contents" 
              routerLinkActive="nav-item-active"
              class="nav-item"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>内容审核</span>
              <span 
                *ngIf="pendingCount > 0"
                class="ml-auto px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full"
              >
                {{ pendingCount }}
              </span>
            </a>
            
            <a 
              routerLink="/review" 
              routerLinkActive="nav-item-active"
              class="nav-item"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>人工复审</span>
              <span 
                *ngIf="reviewingCount > 0"
                class="ml-auto px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-medium rounded-full"
              >
                {{ reviewingCount }}
              </span>
            </a>

            <div class="pt-4">
              <p class="px-4 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">系统设置</p>
              
              <a 
                routerLink="/rules" 
                routerLinkActive="nav-item-active"
                class="nav-item"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>违规规则</span>
              </a>
              
              <a 
                routerLink="/logs" 
                routerLinkActive="nav-item-active"
                class="nav-item"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>审核日志</span>
              </a>
              
              <a 
                routerLink="/reports" 
                routerLinkActive="nav-item-active"
                class="nav-item"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>合规报表</span>
              </a>
            </div>
          </nav>

          <!-- User -->
          <div class="p-4 border-t border-gray-100">
            <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div class="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">管理员</p>
                <p class="text-xs text-gray-500 truncate">admin&#64;company.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Mobile overlay -->
      <div 
        *ngIf="sidebarOpen"
        (click)="toggleSidebar()"
        class="fixed inset-0 bg-black/50 z-30 lg:hidden"
      ></div>

      <!-- Main content -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Header -->
        <header class="bg-white border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <button 
                (click)="toggleSidebar()"
                class="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h2 class="text-xl font-semibold text-gray-900">{{ currentTitle }}</h2>
              </div>
            </div>
            
            <div class="flex items-center gap-4">
              <button class="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        <!-- Page content -->
        <main class="flex-1 p-6 overflow-y-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class LayoutComponent implements OnInit {
  sidebarOpen = true;
  pendingCount = 0;
  reviewingCount = 0;
  
  private titleMap: Record<string, string> = {
    'dashboard': '仪表盘',
    'contents': '内容审核',
    'rules': '违规规则',
    'review': '人工复审',
    'logs': '审核日志',
    'reports': '合规报表'
  };

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  get currentTitle(): string {
    const path = window.location.pathname.split('/')[1];
    return this.titleMap[path] || '仪表盘';
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  private loadStats(): void {
    this.contentService.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.pendingCount = response.data.pending;
          this.reviewingCount = response.data.reviewing;
        }
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
      }
    });
  }
}
