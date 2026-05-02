import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { SidebarModule } from 'primeng/sidebar';
import { MenuModule } from 'primeng/menu';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { ImageModule } from 'primeng/image';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MembersComponent } from './components/members/members.component';
import { GiftBoxesComponent } from './components/gift-boxes/gift-boxes.component';
import { TastingEventsComponent } from './components/tasting-events/tasting-events.component';
import { StoresComponent } from './components/stores/stores.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { PointExchangeComponent } from './components/point-exchange/point-exchange.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

import { MemberService } from './services/member.service';
import { GiftBoxService } from './services/gift-box.service';
import { TastingEventService } from './services/tasting-event.service';
import { StoreService } from './services/store.service';
import { InventoryService } from './services/inventory.service';
import { PointExchangeService } from './services/point-exchange.service';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'members', component: MembersComponent },
  { path: 'gift-boxes', component: GiftBoxesComponent },
  { path: 'tasting-events', component: TastingEventsComponent },
  { path: 'stores', component: StoresComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'point-exchange', component: PointExchangeComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    MembersComponent,
    GiftBoxesComponent,
    TastingEventsComponent,
    StoresComponent,
    InventoryComponent,
    PointExchangeComponent,
    NavbarComponent,
    SidebarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    ButtonModule,
    InputTextModule,
    TableModule,
    DialogModule,
    DropdownModule,
    CalendarModule,
    SidebarModule,
    MenuModule,
    CardModule,
    InputNumberModule,
    InputTextareaModule,
    BadgeModule,
    TagModule,
    TabViewModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
    FileUploadModule,
    ProgressBarModule,
    ImageModule,
    PanelModule,
    DividerModule,
    ChipModule,
    TooltipModule
  ],
  providers: [
    MessageService,
    ConfirmationService,
    MemberService,
    GiftBoxService,
    TastingEventService,
    StoreService,
    InventoryService,
    PointExchangeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
