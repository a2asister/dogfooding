export interface Particle {
  x: number
  y: number
  originX: number
  originY: number
  vx: number
  vy: number
  color: string
  size: number
  alpha: number
  targetX: number
  targetY: number
  phase: 'scatter' | 'gather' | 'stable'
}

export interface ParticleConfig {
  text: string
  fontSize: number
  particleSize: number
  scatterSpeed: number
  gatherSpeed: number
  colorStart: string
  colorEnd: string
  mouseInfluence: number
}

export class ParticleSystem {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private particles: Particle[] = []
  private animationId: number | null = null
  private mouseX: number = -1000
  private mouseY: number = -1000
  private config: ParticleConfig
  private colorOffset: number = 0
  private isScattered: boolean = false

  constructor(canvas: HTMLCanvasElement, config: ParticleConfig) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.config = config
    this.init()
  }

  private init(): void {
    this.createParticlesFromText()
    this.setupEventListeners()
    this.animate()
  }

  private createParticlesFromText(): void {
    const { text, fontSize, particleSize, colorStart, colorEnd } = this.config
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')!
    
    tempCanvas.width = this.canvas.width
    tempCanvas.height = this.canvas.height
    
    tempCtx.font = `bold ${fontSize}px Arial`
    tempCtx.fillStyle = '#ffffff'
    tempCtx.textAlign = 'center'
    tempCtx.textBaseline = 'middle'
    tempCtx.fillText(text, tempCanvas.width / 2, tempCanvas.height / 2)

    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
    const data = imageData.data

    this.particles = []

    for (let y = 0; y < tempCanvas.height; y += particleSize) {
      for (let x = 0; x < tempCanvas.width; x += particleSize) {
        const index = (y * tempCanvas.width + x) * 4
        if (data[index + 3] > 128) {
          const progress = (x + y) / (tempCanvas.width + tempCanvas.height)
          const color = this.interpolateColor(colorStart, colorEnd, progress)
          
          this.particles.push({
            x,
            y,
            originX: x,
            originY: y,
            vx: 0,
            vy: 0,
            color,
            size: particleSize,
            alpha: 1,
            targetX: x,
            targetY: y,
            phase: 'stable'
          })
        }
      }
    }
  }

  private interpolateColor(color1: string, color2: string, factor: number): string {
    const hex = (x: string) => parseInt(x, 16)
    const r1 = hex(color1.slice(1, 3))
    const g1 = hex(color1.slice(3, 5))
    const b1 = hex(color1.slice(5, 7))
    const r2 = hex(color2.slice(1, 3))
    const g2 = hex(color2.slice(3, 5))
    const b2 = hex(color2.slice(5, 7))

    const r = Math.round(r1 + (r2 - r1) * factor)
    const g = Math.round(g1 + (g2 - g1) * factor)
    const b = Math.round(b1 + (b2 - b1) * factor)

    return `rgb(${r}, ${g}, ${b})`
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      this.mouseX = e.clientX - rect.left
      this.mouseY = e.clientY - rect.top
    })

    this.canvas.addEventListener('mouseleave', () => {
      this.mouseX = -1000
      this.mouseY = -1000
    })
  }

  scatter(): void {
    this.isScattered = true
    this.particles.forEach(p => {
      p.phase = 'scatter'
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * this.config.scatterSpeed
      p.vx = Math.cos(angle) * speed
      p.vy = Math.sin(angle) * speed
    })
  }

  gather(): void {
    this.isScattered = false
    this.particles.forEach(p => {
      p.phase = 'gather'
      p.targetX = p.originX
      p.targetY = p.originY
    })
  }

  updateText(text: string): void {
    this.config.text = text
    this.gather()
    setTimeout(() => {
      this.createParticlesFromText()
    }, 500)
  }

  private animate(): void {
    this.ctx.fillStyle = 'rgba(10, 10, 10, 0.15)'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.colorOffset += 0.01

    this.particles.forEach(particle => {
      const dx = particle.x - this.mouseX
      const dy = particle.y - this.mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      if (dist < this.config.mouseInfluence) {
        const force = (this.config.mouseInfluence - dist) / this.config.mouseInfluence
        const angle = Math.atan2(dy, dx)
        particle.vx += Math.cos(angle) * force * 2
        particle.vy += Math.sin(angle) * force * 2
      }

      if (particle.phase === 'scatter') {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vx *= 0.98
        particle.vy *= 0.98
      } else if (particle.phase === 'gather') {
        const dx = particle.targetX - particle.x
        const dy = particle.targetY - particle.y
        particle.x += dx * this.config.gatherSpeed
        particle.y += dy * this.config.gatherSpeed
        
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
          particle.phase = 'stable'
        }
      } else {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vx *= 0.95
        particle.vy *= 0.95
      }

      const hue = (this.colorOffset * 360 + (particle.x + particle.y) * 0.1) % 360
      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      this.ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${particle.alpha})`
      this.ctx.fill()

      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
      this.ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.1)`
      this.ctx.fill()
    })

    this.animationId = requestAnimationFrame(() => this.animate())
  }

  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas
  }

  getConfig(): ParticleConfig {
    return this.config
  }
}
