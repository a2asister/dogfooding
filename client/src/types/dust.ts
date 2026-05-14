export interface DustParticle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  brightness: number
  phase: number
}

export interface EffectConfig {
  density: number
  speed: number
  lightIntensity: number
  hazeIntensity: number
  particleSize: number
  mouseInfluence: number
}

export interface SavedConfig {
  id?: number
  name: string
  category: string
  config: EffectConfig
  createdAt?: string
}
