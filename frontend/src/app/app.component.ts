import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'B端客户分层运营系统';
  isSidebarOpen = true;
  
  get currentDate(): string {
    return new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }

  navItems = [
    { path: '/dashboard', label: '仪表盘', icon: '📊' },
    { path: '/customers', label: '客户档案', icon: '👥' },
    { path: '/followups', label: '跟进记录', icon: '📝' },
    { path: '/opportunities', label: '商机漏斗', icon: '🎯' },
    { path: '/renewal-alerts', label: '续费预警', icon: '⚠️' },
    { path: '/plans', label: '定制化方案', icon: '📋' }
  ];

  constructor(private router: Router) {}

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  isActive(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(path + '/');
  }
}
