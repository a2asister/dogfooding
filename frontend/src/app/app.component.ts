import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <app-three-viewer
      (houseSelected)="onHouseSelected($event)"
      (buildingSelected)="onBuildingSelected($event)"
    ></app-three-viewer>
    <app-control-panel></app-control-panel>
    <app-house-info
      *ngIf="selectedHouse"
      [house]="selectedHouse"
    ></app-house-info>
  `,
  styles: [],
})
export class AppComponent {
  selectedHouse: unknown = null;
  selectedBuilding: unknown = null;

  onHouseSelected(house: any) {
    this.selectedHouse = house;
  }

  onBuildingSelected(building: any) {
    this.selectedBuilding = building;
  }
}
