import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MemberService, Member } from '../../services/member.service';
import { GiftBoxService, GiftBox } from '../../services/gift-box.service';
import { TastingEventService, TastingEvent } from '../../services/tasting-event.service';
import { InventoryService, InventoryItem } from '../../services/inventory.service';
import { StoreService, Store } from '../../services/store.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  members: Member[] = [];
  giftBoxes: GiftBox[] = [];
  events: TastingEvent[] = [];
  inventory: InventoryItem[] = [];
  stores: Store[] = [];
  loading = true;

  stats = [
    { label: '会员总数', value: 0, icon: 'pi pi-users', class: 'stat-card' },
    { label: '礼盒数量', value: 0, icon: 'pi pi-box', class: 'stat-card green' },
    { label: '活动数量', value: 0, icon: 'pi pi-calendar', class: 'stat-card orange' },
    { label: '库存告警', value: 0, icon: 'pi pi-exclamation-triangle', class: 'stat-card red' }
  ];

  constructor(
    private memberService: MemberService,
    private giftBoxService: GiftBoxService,
    private eventService: TastingEventService,
    private inventoryService: InventoryService,
    private storeService: StoreService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    
    this.memberService.getMembers().subscribe({
      next: (res) => {
        if (res.success) {
          this.members = res.data;
          this.stats[0].value = this.members.length;
        }
      },
      error: () => this.handleError('加载会员数据')
    });

    this.giftBoxService.getGiftBoxes().subscribe({
      next: (res) => {
        if (res.success) {
          this.giftBoxes = res.data;
          this.stats[1].value = this.giftBoxes.length;
        }
      },
      error: () => this.handleError('加载礼盒数据')
    });

    this.eventService.getEvents().subscribe({
      next: (res) => {
        if (res.success) {
          this.events = res.data;
          this.stats[2].value = this.events.length;
        }
      },
      error: () => this.handleError('加载活动数据')
    });

    this.inventoryService.getInventory().subscribe({
      next: (res) => {
        if (res.success) {
          this.inventory = res.data;
          const lowStock = this.inventory.filter(item => item.quantity <= item.minStock);
          this.stats[3].value = lowStock.length;
        }
        this.loading = false;
      },
      error: () => {
        this.handleError('加载库存数据');
        this.loading = false;
      }
    });

    this.storeService.getStores().subscribe({
      next: (res) => {
        if (res.success) {
          this.stores = res.data;
        }
      },
      error: () => this.handleError('加载门店数据')
    });
  }

  private handleError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: '错误',
      detail: `${message}失败，请检查后端服务是否启动`
    });
  }

  getStockStatus(item: InventoryItem): 'success' | 'warning' | 'danger' {
    if (item.quantity === 0) return 'danger';
    if (item.quantity <= item.minStock) return 'warning';
    return 'success';
  }

  getEventStatus(event: TastingEvent): 'success' | 'warning' | 'danger' {
    const now = new Date();
    const eventDate = new Date(event.date);
    if (eventDate < now) return 'danger';
    if (event.participants && event.participants.length >= event.maxParticipants) return 'warning';
    return 'success';
  }

  getMemberLevelColor(level: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    switch (level) {
      case '钻石会员': return 'info';
      case '铂金会员': return 'info';
      case '黄金会员': return 'warning';
      default: return 'secondary';
    }
  }
}
