import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InventoryService, InventoryItem } from '../../services/inventory.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  inventory: InventoryItem[] = [];
  filteredInventory: InventoryItem[] = [];
  loading = false;
  dialogVisible = false;
  isEdit = false;
  selectedItem: InventoryItem | null = null;
  searchText = '';
  inventoryForm: FormGroup;

  categories = [
    { label: '茶叶', value: '茶叶' },
    { label: '酒水', value: '酒水' },
    { label: '礼盒', value: '礼盒' },
    { label: '其他', value: '其他' }
  ];

  units = [
    { label: '盒', value: '盒' },
    { label: '瓶', value: '瓶' },
    { label: '件', value: '件' },
    { label: '套', value: '套' },
    { label: '箱', value: '箱' }
  ];

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.inventoryForm = this.fb.group({
      productName: ['', Validators.required],
      sku: ['', Validators.required],
      category: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      unit: ['盒', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      minStock: [10, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.loading = true;
    this.inventoryService.getInventory().subscribe({
      next: (res) => {
        if (res.success) {
          this.inventory = res.data;
          this.filteredInventory = [...this.inventory];
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: '错误', detail: '加载库存数据失败' });
        this.loading = false;
      }
    });
  }

  search() {
    if (!this.searchText) {
      this.filteredInventory = [...this.inventory];
      return;
    }
    const text = this.searchText.toLowerCase();
    this.filteredInventory = this.inventory.filter(i => 
      i.productName.toLowerCase().includes(text) || 
      i.sku.toLowerCase().includes(text) ||
      i.category.toLowerCase().includes(text)
    );
  }

  openAddDialog() {
    this.isEdit = false;
    this.selectedItem = null;
    this.inventoryForm.reset({
      quantity: 0,
      unit: '盒',
      price: 0,
      minStock: 10
    });
    this.dialogVisible = true;
  }

  openEditDialog(item: InventoryItem) {
    this.isEdit = true;
    this.selectedItem = item;
    this.inventoryForm.patchValue({
      productName: item.productName,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      minStock: item.minStock
    });
    this.dialogVisible = true;
  }

  saveItem() {
    if (this.inventoryForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: '提示', detail: '请填写完整信息' });
      return;
    }

    const itemData: InventoryItem = this.inventoryForm.value;

    if (this.isEdit && this.selectedItem) {
      this.inventoryService.updateItem(this.selectedItem.id!, itemData).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: '成功', detail: '库存信息更新成功' });
            this.dialogVisible = false;
            this.loadInventory();
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: '错误', detail: '更新失败' });
        }
      });
    } else {
      this.inventoryService.createItem(itemData).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: '成功', detail: '库存添加成功' });
            this.dialogVisible = false;
            this.loadInventory();
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: '错误', detail: '添加失败' });
        }
      });
    }
  }

  deleteItem(item: InventoryItem) {
    this.confirmationService.confirm({
      message: `确定要删除库存项 "${item.productName}" 吗？`,
      header: '确认删除',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.inventoryService.deleteItem(item.id!).subscribe({
          next: (res) => {
            if (res.success) {
              this.messageService.add({ severity: 'success', summary: '成功', detail: '库存删除成功' });
              this.loadInventory();
            }
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: '错误', detail: '删除失败' });
          }
        });
      }
    });
  }

  getStockStatus(item: InventoryItem): { label: string; severity: 'success' | 'warning' | 'danger' } {
    if (item.quantity === 0) {
      return { label: '缺货', severity: 'danger' };
    }
    if (item.quantity <= item.minStock) {
      return { label: '库存低', severity: 'warning' };
    }
    return { label: '正常', severity: 'success' };
  }

  getRowClass(item: InventoryItem): string {
    if (item.quantity === 0) return 'stock-out';
    if (item.quantity <= item.minStock) return 'stock-low';
    return '';
  }
}
