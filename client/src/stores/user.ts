import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'

const mockUsers: User[] = [
  {
    id: 'user-1',
    name: '张经理',
    role: 'manager',
    email: 'zhang@company.com',
    department: '合同管理部'
  },
  {
    id: 'user-2',
    name: '李法务',
    role: 'legal',
    email: 'li@company.com',
    department: '法务部'
  },
  {
    id: 'user-3',
    name: '王员工',
    role: 'employee',
    email: 'wang@company.com',
    department: '业务部'
  },
  {
    id: 'user-4',
    name: '赵管理员',
    role: 'admin',
    email: 'zhao@company.com',
    department: '行政部'
  }
]

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User>(mockUsers[0])
  const users = ref<User[]>(mockUsers)

  const roleLabels: Record<User['role'], string> = {
    admin: '管理员',
    manager: '经理',
    employee: '员工',
    legal: '法务'
  }

  function setUser(user: User) {
    currentUser.value = user
  }

  function getApprovers() {
    return users.value.filter(u => u.role === 'manager' || u.role === 'legal' || u.role === 'admin')
  }

  return {
    currentUser,
    users,
    roleLabels,
    setUser,
    getApprovers
  }
})
