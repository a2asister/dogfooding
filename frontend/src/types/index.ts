export interface BabyProfile {
  id: string
  name: string
  nickname?: string
  gender: 'male' | 'female' | 'unknown'
  birthDate: string
  birthTime?: string
  birthWeight?: number
  birthHeight?: number
  avatar?: string
  bloodType?: 'A' | 'B' | 'AB' | 'O' | 'unknown'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface SleepRecord {
  id: string
  babyId: string
  startTime: string
  endTime?: string
  duration?: number
  quality?: 'excellent' | 'good' | 'fair' | 'poor'
  environment?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface FeedingRecord {
  id: string
  babyId: string
  type: 'breastfeeding' | 'formula' | 'solid' | 'mixed'
  startTime: string
  duration?: number
  amount?: number
  unit?: 'ml' | 'g'
  side?: 'left' | 'right' | 'both'
  foodName?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface VaccineRecord {
  id: string
  babyId: string
  vaccineName: string
  vaccineType?: string
  scheduledDate: string
  actualDate?: string
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled'
  doseNumber?: number
  totalDoses?: number
  location?: string
  batchNumber?: string
  notes?: string
  reactions?: string
  createdAt: string
  updatedAt: string
}

export interface CheckupRecord {
  id: string
  babyId: string
  checkupDate: string
  checkupType: string
  weight?: number
  height?: number
  headCircumference?: number
  weightPercentile?: number
  heightPercentile?: number
  headCircumferencePercentile?: number
  bmi?: number
  doctorName?: string
  hospitalName?: string
  findings?: string
  recommendations?: string
  nextCheckupDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface GrowthRecord {
  id: string
  babyId: string
  recordDate: string
  weight?: number
  height?: number
  headCircumference?: number
  weightPercentile?: number
  heightPercentile?: number
  headCircumferencePercentile?: number
  bmi?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface DiaryEntry {
  id: string
  babyId: string
  entryDate: string
  title: string
  content: string
  mood?: 'happy' | 'calm' | 'excited' | 'sad' | 'irritable' | 'sleepy'
  weather?: string
  tags?: string[]
  photos?: string[]
  videos?: string[]
  isFavorite?: boolean
  createdAt: string
  updatedAt: string
}

export interface PhotoAlbum {
  id: string
  babyId: string
  name: string
  description?: string
  coverPhoto?: string
  photos: string[]
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface Reminder {
  id: string
  babyId: string
  title: string
  description?: string
  type: 'vaccine' | 'checkup' | 'feeding' | 'medication' | 'custom'
  scheduledTime: string
  repeatInterval?: 'once' | 'daily' | 'weekly' | 'monthly'
  isEnabled: boolean
  isCompleted: boolean
  completedAt?: string
  linkedRecordId?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface HealthAlert {
  id: string
  babyId: string
  alertType: 'weight' | 'height' | 'sleep' | 'feeding' | 'vaccine' | 'custom'
  severity: 'low' | 'medium' | 'high'
  title: string
  description: string
  relatedRecordId?: string
  isAcknowledged: boolean
  acknowledgedAt?: string
  createdAt: string
}

export interface Milestone {
  id: string
  babyId: string
  category: 'motor' | 'social' | 'language' | 'cognitive' | 'custom'
  title: string
  description?: string
  expectedAgeMonths: number
  actualDate?: string
  isAchieved: boolean
  notes?: string
  evidence?: string[]
  createdAt: string
  updatedAt: string
}

export interface AppData {
  babies: BabyProfile[]
  sleepRecords: SleepRecord[]
  feedingRecords: FeedingRecord[]
  vaccineRecords: VaccineRecord[]
  checkupRecords: CheckupRecord[]
  growthRecords: GrowthRecord[]
  diaryEntries: DiaryEntry[]
  photoAlbums: PhotoAlbum[]
  reminders: Reminder[]
  healthAlerts: HealthAlert[]
  milestones: Milestone[]
  settings: AppSettings
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto'
  language: 'zh-CN' | 'en-US'
  defaultBabyId?: string
  notifications: {
    enabled: boolean
    vaccineReminders: boolean
    checkupReminders: boolean
    dailySummary: boolean
  }
  measurementUnits: {
    weight: 'kg' | 'lb'
    height: 'cm' | 'in'
    temperature: 'celsius' | 'fahrenheit'
  }
  autoExport: {
    enabled: boolean
    interval: 'daily' | 'weekly' | 'monthly'
  }
}

export type MonthStage = 
  | 'newborn'      
  | 'one_month'     
  | 'two_months'    
  | 'three_months'  
  | 'four_months'   
  | 'five_months'   
  | 'six_months'    
  | 'seven_months'  
  | 'eight_months'  
  | 'nine_months'   
  | 'ten_months'     
  | 'eleven_months'  
  | 'one_year'       
  | 'toddler'         

export interface AnimationElement {
  type: 
    | 'cloud' 
    | 'star' 
    | 'moon' 
    | 'sun' 
    | 'flower' 
    | 'butterfly' 
    | 'teddy' 
    | 'balloon'
    | 'rainbow'
    | 'bunny'
    | 'elephant'
    | 'giraffe'
    | 'leaf'
    | 'sprout'
    | 'tree'
    | 'heart'
    | 'starfish'
    | 'bird'
    | 'fish'
    | 'duck'
    | 'cow'
    | 'pig'
    | 'sheep'
    | 'cat'
    | 'dog'
    | 'apple'
    | 'banana'
    | 'cherry'
    | 'mushroom'
  position: { x: number; y: number }
  color: string
  size: number
  animation: 'float' | 'bounce' | 'pulse' | 'wiggle' | 'spin' | 'swing'
  delay: number
  duration: number
}

export interface StageConfig {
  stage: MonthStage
  ageRange: { min: number; max: number }
  label: string
  description: string
  animationElements: AnimationElement[]
  recommendedMilestones: string[]
  colorScheme: {
    primary: string
    secondary: string
    accent: string
  }
}
