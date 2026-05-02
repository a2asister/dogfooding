import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TastingEventService, TastingEvent } from '../../services/tasting-event.service';
import { StoreService, Store } from '../../services/store.service';

@Component({
  selector: 'app-tasting-events',
  templateUrl: './tasting-events.component.html',
  styleUrls: ['./tasting-events.component.css']
})
export class TastingEventsComponent implements OnInit {
  events: TastingEvent[] = [];
  stores: Store[] = [];
  filteredEvents: TastingEvent[] = [];
  loading = false;
  dialogVisible = false;
  isEdit = false;
  selectedEvent: TastingEvent | null = null;
  searchText = '';
  eventForm: FormGroup;

  statusOptions = [
    { label: '即将开始', value: '即将开始' },
    { label: '进行中', value: '进行中' },
    { label: '已结束', value: '已结束' }
  ];

  constructor(
    private fb: FormBuilder,
    private eventService: TastingEventService,
    private storeService: StoreService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: [null, Validators.required],
      location: ['', Validators.required],
      maxParticipants: [20, [Validators.required, Validators.min(1)]],
      status: ['即将开始'],
      image: ['']
    });
  }

  ngOnInit() {
    this.loadEvents();
    this.loadStores();
  }

  loadStores() {
    this.storeService.getStores().subscribe({
      next: (res) => {
        if (res.success) {
          this.stores = res.data;
        }
      }
    });
  }

  loadEvents() {
    this.loading = true;
    this.eventService.getEvents().subscribe({
      next: (res) => {
        if (res.success) {
          this.events = res.data;
          this.filteredEvents = [...this.events];
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: '错误', detail: '加载活动数据失败' });
        this.loading = false;
      }
    });
  }

  search() {
    if (!this.searchText) {
      this.filteredEvents = [...this.events];
      return;
    }
    const text = this.searchText.toLowerCase();
    this.filteredEvents = this.events.filter(e => 
      e.title.toLowerCase().includes(text) || 
      e.description.toLowerCase().includes(text) ||
      e.location.toLowerCase().includes(text)
    );
  }

  openAddDialog() {
    this.isEdit = false;
    this.selectedEvent = null;
    this.eventForm.reset({
      maxParticipants: 20,
      status: '即将开始'
    });
    this.dialogVisible = true;
  }

  openEditDialog(event: TastingEvent) {
    this.isEdit = true;
    this.selectedEvent = event;
    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      date: new Date(event.date),
      location: event.location,
      maxParticipants: event.maxParticipants,
      status: event.status || '即将开始',
      image: event.image || ''
    });
    this.dialogVisible = true;
  }

  saveEvent() {
    if (this.eventForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: '提示', detail: '请填写完整信息' });
      return;
    }

    const formData = this.eventForm.value;
    const eventData: TastingEvent = {
      ...formData,
      date: formData.date.toISOString()
    };

    if (this.isEdit && this.selectedEvent) {
      this.eventService.updateEvent(this.selectedEvent.id!, eventData).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: '成功', detail: '活动信息更新成功' });
            this.dialogVisible = false;
            this.loadEvents();
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: '错误', detail: '更新失败' });
        }
      });
    } else {
      this.eventService.createEvent(eventData).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: '成功', detail: '活动创建成功' });
            this.dialogVisible = false;
            this.loadEvents();
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: '错误', detail: '创建失败' });
        }
      });
    }
  }

  deleteEvent(event: TastingEvent) {
    this.confirmationService.confirm({
      message: `确定要删除活动 "${event.title}" 吗？`,
      header: '确认删除',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.eventService.deleteEvent(event.id!).subscribe({
          next: (res) => {
            if (res.success) {
              this.messageService.add({ severity: 'success', summary: '成功', detail: '活动删除成功' });
              this.loadEvents();
            }
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: '错误', detail: '删除失败' });
          }
        });
      }
    });
  }

  getEventStatusSeverity(event: TastingEvent): 'success' | 'warning' | 'danger' {
    const now = new Date();
    const eventDate = new Date(event.date);
    if (eventDate < now) return 'danger';
    if (event.participants && event.participants.length >= event.maxParticipants) return 'warning';
    return 'success';
  }
}
