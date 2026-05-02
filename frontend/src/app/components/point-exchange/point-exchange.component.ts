import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PointExchangeService, PointExchange } from '../../services/point-exchange.service';
import { MemberService, Member } from '../../services/member.service';
import { GiftBoxService, GiftBox } from '../../services/gift-box.service';

@Component({
  selector: 'app-point-exchange',
  templateUrl: './point-exchange.component.html',
  styleUrls: ['./point-exchange.component.css']
})
export class PointExchangeComponent implements OnInit {
  exchanges: PointExchange[] = [];
  members: Member[] = [];
  giftBoxes: GiftBox[] = [];
  loading = false;
  dialogVisible = false;
  exchangeForm: FormGroup;
  selectedMember: Member | null = null;
  selectedGiftBox: GiftBox | null = null;

  constructor(
    private fb: FormBuilder,
    private exchangeService: PointExchangeService,
    private memberService: MemberService,
    private giftBoxService: GiftBoxService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.exchangeForm = this.fb.group({
      memberId: ['', Validators.required],
      giftBoxId: ['', Validators.required],
      pointsUsed: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    
    this.memberService.getMembers().subscribe({
      next: (res) => {
        if (res.success) {
          this.members = res.data;
        }
      }
    });

    this.giftBoxService.getGiftBoxes().subscribe({
      next: (res) => {
        if (res.success) {
          this.giftBoxes = res.data;
        }
      }
    });

    this.exchangeService.getExchanges().subscribe({
      next: (res) => {
        if (res.success) {
          this.exchanges = res.data;
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: '错误', detail: '加载兑换记录失败' });
        this.loading = false;
      }
    });
  }

  onMemberChange(memberId: string) {
    this.selectedMember = this.members.find(m => m.id === memberId) || null;
    this.checkPoints();
  }

  onGiftBoxChange(giftBoxId: string) {
    this.selectedGiftBox = this.giftBoxes.find(g => g.id === giftBoxId) || null;
    if (this.selectedGiftBox) {
      this.exchangeForm.patchValue({
        pointsUsed: this.selectedGiftBox.pointsRequired
      });
    }
    this.checkPoints();
  }

  checkPoints() {
    if (this.selectedMember && this.selectedGiftBox) {
      const pointsUsed = this.exchangeForm.get('pointsUsed')?.value || 0;
      if (this.selectedMember.currentPoints! < pointsUsed) {
        this.messageService.add({ 
          severity: 'warn', 
          summary: '提示', 
          detail: `会员积分不足，当前积分：${this.selectedMember.currentPoints}` 
        });
      }
    }
  }

  openExchangeDialog() {
    this.exchangeForm.reset({
      pointsUsed: 0
    });
    this.selectedMember = null;
    this.selectedGiftBox = null;
    this.dialogVisible = true;
  }

  createExchange() {
    if (this.exchangeForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: '提示', detail: '请选择会员和礼盒' });
      return;
    }

    const pointsUsed = this.exchangeForm.get('pointsUsed')?.value;
    if (this.selectedMember && this.selectedMember.currentPoints! < pointsUsed) {
      this.messageService.add({ 
        severity: 'error', 
        summary: '错误', 
        detail: '会员积分不足，无法兑换' 
      });
      return;
    }

    const exchangeData: PointExchange = this.exchangeForm.value;

    this.confirmationService.confirm({
      message: `确认兑换此礼盒需要消耗 ${pointsUsed} 积分，确定要继续吗？`,
      header: '确认兑换',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.exchangeService.createExchange(exchangeData).subscribe({
          next: (res) => {
            if (res.success) {
              this.messageService.add({ severity: 'success', summary: '成功', detail: '积分兑换成功' });
              this.dialogVisible = false;
              this.loadData();
            }
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: '错误', detail: err.error?.message || '兑换失败' });
          }
        });
      }
    });
  }

  getMemberName(memberId: string): string {
    const member = this.members.find(m => m.id === memberId);
    return member ? member.name : '-';
  }

  getGiftBoxName(giftBoxId: string): string {
    const giftBox = this.giftBoxes.find(g => g.id === giftBoxId);
    return giftBox ? giftBox.name : '-';
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    switch (status) {
      case '已完成': return 'success';
      case '待处理': return 'warning';
      case '已取消': return 'danger';
      default: return 'secondary';
    }
  }

  get currentMemberPoints(): number {
    return this.selectedMember?.currentPoints || 0;
  }

  get selectedMemberName(): string {
    return this.selectedMember?.name || '';
  }

  get selectedGiftBoxName(): string {
    return this.selectedGiftBox?.name || '';
  }

  get remainingPoints(): number {
    const pointsUsed = this.exchangeForm.get('pointsUsed')?.value || 0;
    return (this.selectedMember?.currentPoints || 0) - pointsUsed;
  }
}
