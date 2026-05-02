import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface MenuItem {
  label: string;
  icon: string;
  routerLink: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  currentRoute: string = '/dashboard';
  
  items: MenuItem[] = [
    {
      label: '工作台',
      icon: 'pi pi-home',
      routerLink: '/dashboard'
    },
    {
      label: '会员管理',
      icon: 'pi pi-users',
      routerLink: '/members'
    },
    {
      label: '积分兑换',
      icon: 'pi pi-gift',
      routerLink: '/point-exchange'
    },
    {
      label: '定制礼盒',
      icon: 'pi pi-box',
      routerLink: '/gift-boxes'
    },
    {
      label: '品鉴活动',
      icon: 'pi pi-calendar',
      routerLink: '/tasting-events'
    },
    {
      label: '门店管理',
      icon: 'pi pi-building',
      routerLink: '/stores'
    },
    {
      label: '库存管控',
      icon: 'pi pi-database',
      routerLink: '/inventory'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.currentRoute = this.router.url;
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });
  }

  isActive(routerLink: string): boolean {
    return this.currentRoute === routerLink;
  }
}
