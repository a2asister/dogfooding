import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-house-info',
  standalone: false,
  template: `
    <div class="info-panel">
      <h2>房源详情</h2>
      <div class="info-item">
        <div class="info-label">房号</div>
        <div class="info-value">{{ house.houseNumber }}</div>
      </div>
      <div class="info-item">
        <div class="info-label">楼层</div>
        <div class="info-value">{{ house.floor }}层</div>
      </div>
      <div class="info-item">
        <div class="info-label">面积</div>
        <div class="info-value">{{ house.area }}㎡</div>
      </div>
      <div class="info-item">
        <div class="info-label">户型</div>
        <div class="info-value">{{ house.bedrooms }}室{{ house.livingRooms }}厅</div>
      </div>
      <div class="info-item">
        <div class="info-label">价格</div>
        <div class="info-value">¥{{ (house.price / 10000).toFixed(0) }}万</div>
      </div>
      <div class="info-item">
        <div class="info-label">状态</div>
        <div class="info-value" [ngClass]="'status-' + house.status">
          {{ getStatusText(house.status) }}
        </div>
      </div>
    </div>
  `,
})
export class HouseInfoComponent {
  @Input() house: {
    id?: number;
    houseNumber?: string;
    floor?: number;
    status?: string;
    price?: number;
    area?: number;
    bedrooms?: number;
    livingRooms?: number;
  } | null = null;

  getStatusText(status: string): string {
    const map: { [key: string]: string } = {
      available: '可售',
      sold: '已售',
      reserved: '已预订',
    };
    return map[status] || status;
  }
}
