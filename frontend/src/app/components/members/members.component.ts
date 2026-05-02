import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MemberService, Member } from '../../services/member.service';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent implements OnInit {
  members: Member[] = [];
  filteredMembers: Member[] = [];
  loading = false;
  dialogVisible = false;
  isEdit = false;
  selectedMember: Member | null = null;
  searchText = '';
  memberForm: FormGroup;

  levels = [
    { label: '普通会员', value: '普通会员' },
    { label: '黄金会员', value: '黄金会员' },
    { label: '铂金会员', value: '铂金会员' },
    { label: '钻石会员', value: '钻石会员' }
  ];

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.memberForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^1[3-9]\d{9}$/)]],
      email: ['', Validators.email],
      level: ['普通会员', Validators.required]
    });
  }

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.loading = true;
    this.memberService.getMembers().subscribe({
      next: (res) => {
        if (res.success) {
          this.members = res.data;
          this.filteredMembers = [...this.members];
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: '错误', detail: '加载会员数据失败' });
        this.loading = false;
      }
    });
  }

  search() {
    if (!this.searchText) {
      this.filteredMembers = [...this.members];
      return;
    }
    const text = this.searchText.toLowerCase();
    this.filteredMembers = this.members.filter(m => 
      m.name.toLowerCase().includes(text) || 
      m.phone.includes(text) ||
      (m.email && m.email.toLowerCase().includes(text))
    );
  }

  openAddDialog() {
    this.isEdit = false;
    this.selectedMember = null;
    this.memberForm.reset({ level: '普通会员' });
    this.dialogVisible = true;
  }

  openEditDialog(member: Member) {
    this.isEdit = true;
    this.selectedMember = member;
    this.memberForm.patchValue({
      name: member.name,
      phone: member.phone,
      email: member.email || '',
      level: member.level
    });
    this.dialogVisible = true;
  }

  saveMember() {
    if (this.memberForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: '提示', detail: '请填写完整信息' });
      return;
    }

    const memberData: Member = this.memberForm.value;

    if (this.isEdit && this.selectedMember) {
      this.memberService.updateMember(this.selectedMember.id!, memberData).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: '成功', detail: '会员信息更新成功' });
            this.dialogVisible = false;
            this.loadMembers();
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: '错误', detail: '更新失败' });
        }
      });
    } else {
      this.memberService.createMember(memberData).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: '成功', detail: '会员添加成功' });
            this.dialogVisible = false;
            this.loadMembers();
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: '错误', detail: '添加失败' });
        }
      });
    }
  }

  deleteMember(member: Member) {
    this.confirmationService.confirm({
      message: `确定要删除会员 "${member.name}" 吗？`,
      header: '确认删除',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.memberService.deleteMember(member.id!).subscribe({
          next: (res) => {
            if (res.success) {
              this.messageService.add({ severity: 'success', summary: '成功', detail: '会员删除成功' });
              this.loadMembers();
            }
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: '错误', detail: '删除失败' });
          }
        });
      }
    });
  }

  getLevelSeverity(level: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    switch (level) {
      case '钻石会员': return 'info';
      case '铂金会员': return 'info';
      case '黄金会员': return 'warning';
      default: return 'secondary';
    }
  }
}
