import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { GiftBoxService, GiftBox } from '../../services/gift-box.service';

@Component({
  selector: 'app-gift-boxes',
  templateUrl: './gift-boxes.component.html',
  styleUrls: ['./gift-boxes.component.css']
})
export class GiftBoxesComponent implements OnInit {
  giftBoxes: GiftBox[] = [];
  filteredGiftBoxes: GiftBox[] = [];
  loading = false;
  dialogVisible = false;
  isEdit = false;
  selectedGiftBox: GiftBox | null = null;
  searchText = '';
  giftBoxForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private giftBoxService: GiftBoxService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.giftBoxForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      pointsRequired: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      image: ['']
    });
  }

  ngOnInit() {
    this.loadGiftBoxes();
  }

  loadGiftBoxes() {
    this.loading = true;
    this.giftBoxService.getGiftBoxes().subscribe({
      next: (res) => {
        if (res.success) {
          this.giftBoxes = res.data;
          this.filteredGiftBoxes = [...this.giftBoxes];
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: '错误', detail: '加载礼盒数据失败' });
        this.loading = false;
      }
    });
  }

  search() {
    if (!this.searchText) {
      this.filteredGiftBoxes = [...this.giftBoxes];
      return;
    }
    const text = this.searchText.toLowerCase();
    this.filteredGiftBoxes = this.giftBoxes.filter(g => 
      g.name.toLowerCase().includes(text) || 
      g.description.toLowerCase().includes(text)
    );
  }

  openAddDialog() {
    this.isEdit = false;
    this.selectedGiftBox = null;
    this.giftBoxForm.reset({
      pointsRequired: 0,
      price: 0,
      image: ''
    });
    this.dialogVisible = true;
  }

  openEditDialog(giftBox: GiftBox) {
    this.isEdit = true;
    this.selectedGiftBox = giftBox;
    this.giftBoxForm.patchValue({
      name: giftBox.name,
      description: giftBox.description,
      pointsRequired: giftBox.pointsRequired,
      price: giftBox.price,
      image: giftBox.image || ''
    });
    this.dialogVisible = true;
  }

  saveGiftBox() {
    if (this.giftBoxForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: '提示', detail: '请填写完整信息' });
      return;
    }

    const giftBoxData: GiftBox = this.giftBoxForm.value;

    if (this.isEdit && this.selectedGiftBox) {
      this.giftBoxService.updateGiftBox(this.selectedGiftBox.id!, giftBoxData).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: '成功', detail: '礼盒信息更新成功' });
            this.dialogVisible = false;
            this.loadGiftBoxes();
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: '错误', detail: '更新失败' });
        }
      });
    } else {
      this.giftBoxService.createGiftBox(giftBoxData).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: '成功', detail: '礼盒添加成功' });
            this.dialogVisible = false;
            this.loadGiftBoxes();
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: '错误', detail: '添加失败' });
        }
      });
    }
  }

  deleteGiftBox(giftBox: GiftBox) {
    this.confirmationService.confirm({
      message: `确定要删除礼盒 "${giftBox.name}" 吗？`,
      header: '确认删除',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.giftBoxService.deleteGiftBox(giftBox.id!).subscribe({
          next: (res) => {
            if (res.success) {
              this.messageService.add({ severity: 'success', summary: '成功', detail: '礼盒删除成功' });
              this.loadGiftBoxes();
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
