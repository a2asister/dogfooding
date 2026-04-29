export interface User {
  id: string
  username: string
  email: string
  displayName: string
  avatar?: string
  password?: string
  roleId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface CurrentUser extends User {
  permissions: string[]
}
