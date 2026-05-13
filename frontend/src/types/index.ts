export interface Pet {
  id: number
  name: string
  species: string
  breed: string
  birthday: string
  avatar?: string
  gender?: string
  weight?: number
  photos?: PetPhoto[]
  growthRecords?: GrowthRecord[]
  createdAt: string
}

export interface PetPhoto {
  id: number
  url: string
  description?: string
  date?: string
  createdAt: string
}

export interface GrowthRecord {
  id: number
  date: string
  weight?: number
  height?: number
  note?: string
  milestone?: string
  createdAt: string
}
