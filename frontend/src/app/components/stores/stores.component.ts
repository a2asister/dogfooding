import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { StoreService, Store } from '../../services/store.service';

@Component({
  selector: 'app-stores',
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.css']
})
export class StoresComponent implements OnInit {
  stores: Store[] = [];
  filteredStores: Store[] = [];
  loading = false;
  dialogVisible = false;
  isEdit = false;
  selectedStore: Store | null = null;
  searchText = '';
  storeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.storeForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^0\d{2,3}-?\d{7,8}$/)]],
      manager: ['']
    });
  }

  ngOnInit() {
    this.loadStores();
  }

  loadStores() {
    this.loading = true;
    this.storeService.getStores().subscribe({
      next: (res) => {
        if (res.success) {
          this.stores = res.data;
          this.filteredStores = [...this.stores];
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: '错误', detail: '加载门店数据失败' });
        this.loading = false;
      }
    });
  }

  search() {
    if (!this.searchText) {
      this.filteredStores = [...this.stores];
      return;
    }
    const text = this.searchText.toLowerCase();
    this.filteredStores = this.stores.filter(s => 
      s.name.toLowerCase().includes(text) || 
      s.address.toLowerCase().includes(text) ||
      s.phone.includes(text)
    );
  }

  openAddDialog() {
    this.isEdit = false;
    this.selectedStore = null;
    this.storeForm.reset();
    this.dialogVisible = true;
  }

  openEditDialog(store: Store) {
    this.isEdit = true;
    this.selectedStore = store;
    this.storeForm.patchValue({
      name: store.name,
      address: store.address,
      phone: store.phone,
      manager: store.manager || ''
    });
    this.dialogVisible = true;
  }

  saveStore() {
    if (this.storeForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: '提示', detail: '请填写完整信息' });
      return;
    }

    const storeData: Store = this.storeForm.value;

    if (this.isEdit && this.selectedStore) {
      this.storeService.updateStore(this.selectedStore.id!, storeData).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: '成功', detail: '门店信息更新成功' });
            this.dialogVisible = false;
            this.loadStores();
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: '错误', detail: '更新失败' });
        }
      });
    } else {
      this.storeService.createStore(storeData).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: '成功', detail: '门店添加成功' });
            this.dialogVisible = false;
            this.loadStores();
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: '错误', detail: '添加失败' });
        }
      });
    }
  }

  deleteStore(store: Store) {
    this.confirmationService.confirm({
      message: `确定要删除门店 "${store.name}" 吗？`,
      header: '确认删除',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.storeService.deleteStore(store.id!).subscribe({
          next: (res) => {
            if (res.success) {
              this.messageService.add({ severity: 'success', summary: '成功', detail: '门店删除成功' });
              this.loadStores();
            }
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: '错误', detail: '删除失败' });
          }
        });
      }
    });
  }
}
