import { Component, ViewChild } from '@angular/core';
import { ThreeViewerComponent } from '../three-viewer/three-viewer.component';

@Component({
  selector: 'app-control-panel',
  standalone: false,
  template: `
    <div class="control-panel">
      <h3>控制面板</h3>
      <button class="control-btn" (click)="expandBuilding(1)">
        展开1号楼楼层
      </button>
      <button class="control-btn" (click)="collapseBuilding(1)">
        收起1号楼楼层
      </button>
      <button class="control-btn" (click)="showHouse(1)">
        查看房源101
      </button>
      <button class="control-btn" (click)="showHouse(2)">
        查看房源102
      </button>
    </div>
  `,
})
export class ControlPanelComponent {
  @ViewChild(ThreeViewerComponent) viewer!: ThreeViewerComponent;

  expandBuilding(id: number) {
    if (this.viewer) {
      this.viewer.expandFloors(id);
    }
  }

  collapseBuilding(id: number) {
    if (this.viewer) {
      this.viewer.collapseFloors(id);
    }
  }

  showHouse(id: number) {
    if (this.viewer) {
      this.viewer.highlightHouse(id);
    }
  }
}
