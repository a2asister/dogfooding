export interface TeamMember {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  bio: string
  isOnline: boolean
  lastSeen: Date
}

export interface AuthUser {
  id: string
  name: string
  email: string
  token: string
}
