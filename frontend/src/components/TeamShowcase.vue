<template>
  <div class="team-showcase">
    <h1 class="title">团队成员</h1>
    
    <div 
      class="avatar-stack" 
      @mouseenter="isExpanded = true" 
      @mouseleave="isExpanded = false"
    >
      <div
        v-for="(member, index) in members"
        :key="member.id"
        class="avatar-wrapper"
        :style="getAvatarStyle(index)"
        @click.stop="showMemberCard(member)"
      >
        <div class="avatar" :class="{ offline: !member.isOnline }">
          <img :src="member.avatar" :alt="member.name" />
          <div class="status-indicator" :class="{ online: member.isOnline }"></div>
        </div>
        <div class="avatar-name" :class="{ visible: isExpanded }">{{ member.name }}</div>
      </div>
    </div>

    <div 
      v-if="selectedMember" 
      class="modal-overlay"
      @click="selectedMember = null"
    >
      <div class="member-card" @click.stop>
        <button class="close-btn" @click="selectedMember = null">&times;</button>
        <div class="card-header">
          <img :src="selectedMember.avatar" :alt="selectedMember.name" class="card-avatar" />
          <div class="status-badge" :class="{ online: selectedMember.isOnline }">
            {{ selectedMember.isOnline ? '在线' : '离线' }}
          </div>
        </div>
        <div class="card-body">
          <h2>{{ selectedMember.name }}</h2>
          <p class="role">{{ selectedMember.role }}</p>
          <p class="email">{{ selectedMember.email }}</p>
          <p class="bio">{{ selectedMember.bio }}</p>
        </div>
        <div class="card-footer" v-if="currentUserId === selectedMember.id">
          <button class="edit-btn" @click="showEditForm = true">编辑资料</button>
        </div>

        <div v-if="showEditForm" class="edit-form">
          <h3>编辑资料</h3>
          <div class="form-group">
            <label>姓名</label>
            <input v-model="editForm.name" type="text" />
          </div>
          <div class="form-group">
            <label>职位</label>
            <input v-model="editForm.role" type="text" />
          </div>
          <div class="form-group">
            <label>简介</label>
            <textarea v-model="editForm.bio"></textarea>
          </div>
          <div class="form-actions">
            <button class="cancel-btn" @click="showEditForm = false">取消</button>
            <button class="save-btn" @click="saveMemberInfo">保存</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { TeamMember } from '@/types'
import gql from 'graphql-tag'

@Component
export default class TeamShowcase extends Vue {
  @Prop({ type: Array, default: () => [] }) members!: TeamMember[]
  @Prop({ type: String, default: '' }) currentUserId!: string

  isExpanded = false
  selectedMember: TeamMember | null = null
  showEditForm = false
  editForm = {
    name: '',
    role: '',
    bio: ''
  }

  getAvatarStyle(index: number) {
    const total = this.members.length
    const angleSpread = Math.min(total * 25, 180)
    const startAngle = -angleSpread / 2
    const angleStep = total > 1 ? angleSpread / (total - 1) : 0
    
    const targetAngle = this.isExpanded ? startAngle + index * angleStep : 0
    const targetRadius = this.isExpanded ? 80 + index * 8 : 0
    const zRotation = this.isExpanded ? targetAngle * 0.3 : 0
    const delay = index * 0.05

    return {
      transform: `translateX(${targetRadius * Math.sin(targetAngle * Math.PI / 180)}px) 
                  translateY(${targetRadius * Math.cos(targetAngle * Math.PI / 180)}px) 
                  translateZ(${this.isExpanded ? index * 10 : 0}px)
                  rotateZ(${zRotation}deg)`,
      transitionDelay: `${delay}s`,
      zIndex: this.isExpanded ? total - index : index
    }
  }

  showMemberCard(member: TeamMember) {
    this.selectedMember = member
    this.editForm = {
      name: member.name,
      role: member.role,
      bio: member.bio
    }
    this.showEditForm = false
  }

  async saveMemberInfo() {
    if (!this.selectedMember) return

    try {
      await (this as any).$apollo.mutate({
        mutation: gql`
          mutation UpdateMember($id: String!, $name: String, $role: String, $bio: String) {
            updateMember(id: $id, name: $name, role: $role, bio: $bio) {
              id
              name
              role
              bio
            }
          }
        `,
        variables: {
          id: this.selectedMember.id,
          name: this.editForm.name,
          role: this.editForm.role,
          bio: this.editForm.bio
        }
      })

      this.selectedMember.name = this.editForm.name
      this.selectedMember.role = this.editForm.role
      this.selectedMember.bio = this.editForm.bio
      this.showEditForm = false
    } catch (error) {
      console.error('更新失败:', error)
    }
  }
}
</script>

<style lang="scss" scoped>
.team-showcase {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
}

.title {
  color: white;
  font-size: 2.5rem;
  margin-bottom: 60px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.avatar-stack {
  position: relative;
  width: 400px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1000px;
}

.avatar-wrapper {
  position: absolute;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 3px solid white;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &.offline {
    filter: grayscale(50%);
    opacity: 0.8;
  }
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  background: #9ca3af;

  &.online {
    background: #10b981;
    animation: pulse 2s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
  }
}

.avatar-name {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);

  &.visible {
    opacity: 1;
  }
}

.avatar-wrapper:hover .avatar {
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.member-card {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  padding: 30px;
  position: relative;
  animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #9ca3af;
  transition: color 0.2s;

  &:hover {
    color: #374151;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e5e7eb;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  background: #f3f4f6;
  color: #6b7280;

  &.online {
    background: #d1fae5;
    color: #059669;
  }
}

.card-body {
  text-align: center;

  h2 {
    color: #1f2937;
    font-size: 24px;
    margin-bottom: 8px;
  }

  .role {
    color: #667eea;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .email {
    color: #6b7280;
    font-size: 14px;
    margin-bottom: 16px;
  }

  .bio {
    color: #4b5563;
    line-height: 1.6;
  }
}

.card-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
}

.edit-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
}

.edit-form {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;

  h3 {
    color: #1f2937;
    margin-bottom: 16px;
    font-size: 18px;
  }
}

.form-group {
  margin-bottom: 16px;

  label {
    display: block;
    color: #4b5563;
    font-size: 14px;
    margin-bottom: 6px;
    font-weight: 500;
  }

  input,
  textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.cancel-btn {
  padding: 10px 20px;
  background: #f3f4f6;
  color: #4b5563;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #e5e7eb;
  }
}

.save-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
}
</style>
