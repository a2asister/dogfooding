export interface Particle {
  x: number
  y: number
  targetX: number
  targetY: number
  originalX: number
  originalY: number
  color: string
  size: number
  baseSize: number
  vx: number
  vy: number
  alpha: number
  brightness: number
  phase: 'idle' | 'explode' | 'float' | 'gather' | 'reconstruct'
  delay: number
}

export interface ParticleParams {
  particleSize: number
  explosionForce: number
  floatSpeed: number
  gatherSpeed: number
  colorFlicker: boolean
  dynamicSize: boolean
  mouseRadius: number
  mouseForce: number
}

export class ParticleEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private particles: Particle[] = []
  private imageData: ImageData | null = null
  private animationId: number | null = null
  private time = 0
  private mouseX = -1000
  private mouseY = -1000
  private isMouseDown = false
  private params: ParticleParams
  private animationPhase: 'idle' | 'explode' | 'float' | 'gather' | 'reconstruct' = 'idle'
  private phaseProgress = 0

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.params = {
      particleSize: 4,
      explosionForce: 15,
      floatSpeed: 0.5,
      gatherSpeed: 0.05,
      colorFlicker: true,
      dynamicSize: true,
      mouseRadius: 100,
      mouseForce: 5,
    }
    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      this.mouseX = e.clientX - rect.left
      this.mouseY = e.clientY - rect.top
    })

    this.canvas.addEventListener('mousedown', () => {
      this.isMouseDown = true
    })

    this.canvas.addEventListener('mouseup', () => {
      this.isMouseDown = false
    })

    this.canvas.addEventListener('mouseleave', () => {
      this.mouseX = -1000
      this.mouseY = -1000
      this.isMouseDown = false
    })
  }

  loadImage(image: HTMLImageElement) {
    const scale = Math.min(
      (this.canvas.width * 0.8) / image.width,
      (this.canvas.height * 0.8) / image.height,
      1
    )
    const width = Math.floor(image.width * scale)
    const height = Math.floor(image.height * scale)
    
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext('2d')!
    tempCtx.drawImage(image, 0, 0, width, height)
    this.imageData = tempCtx.getImageData(0, 0, width, height)
    
    this.createParticles(width, height)
  }

  private createParticles(width: number, height: number) {
    this.particles = []
    const step = this.params.particleSize
    const offsetX = (this.canvas.width - width) / 2
    const offsetY = (this.canvas.height - height) / 2

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4
        const r = this.imageData!.data[index]
        const g = this.imageData!.data[index + 1]
        const b = this.imageData!.data[index + 2]
        const a = this.imageData!.data[index + 3]

        if (a > 50) {
          const centerX = offsetX + x + step / 2
          const centerY = offsetY + y + step / 2
          
          this.particles.push({
            x: centerX,
            y: centerY,
            targetX: centerX,
            targetY: centerY,
            originalX: centerX,
            originalY: centerY,
            color: `rgb(${r},${g},${b})`,
            size: step,
            baseSize: step,
            vx: 0,
            vy: 0,
            alpha: 1,
            brightness: 1,
            phase: 'idle',
            delay: Math.random() * 0.5,
          })
        }
      }
    }
  }

  setParams(params: Partial<ParticleParams>) {
    Object.assign(this.params, params)
  }

  explode() {
    this.animationPhase = 'explode'
    this.phaseProgress = 0
    this.particles.forEach((p) => {
      const angle = Math.random() * Math.PI * 2
      const force = Math.random() * this.params.explosionForce
      p.vx = Math.cos(angle) * force
      p.vy = Math.sin(angle) * force
      p.phase = 'explode'
    })
  }

  float() {
    this.animationPhase = 'float'
    this.phaseProgress = 0
    this.particles.forEach((p) => {
      p.phase = 'float'
    })
  }

  gather() {
    this.animationPhase = 'gather'
    this.phaseProgress = 0
    this.particles.forEach((p) => {
      p.targetX = this.canvas.width / 2 + (Math.random() - 0.5) * 100
      p.targetY = this.canvas.height / 2 + (Math.random() - 0.5) * 100
      p.phase = 'gather'
    })
  }

  reconstruct() {
    this.animationPhase = 'reconstruct'
    this.phaseProgress = 0
    this.particles.forEach((p, i) => {
      p.targetX = p.originalX
      p.targetY = p.originalY
      p.phase = 'reconstruct'
      p.delay = (i / this.particles.length) * 0.8
    })
  }

  start() {
    this.animate()
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  private animate() {
    this.time += 0.016
    this.phaseProgress += 0.016
    
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.15)'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.particles.forEach((p) => {
      this.updateParticle(p)
      this.drawParticle(p)
    })

    this.animationId = requestAnimationFrame(() => this.animate())
  }

  private updateParticle(p: Particle) {
    const dx = p.x - this.mouseX
    const dy = p.y - this.mouseY
    const dist = Math.sqrt(dx * dx + dy * dy)
    
    if (dist < this.params.mouseRadius && this.isMouseDown) {
      const force = (1 - dist / this.params.mouseRadius) * this.params.mouseForce
      p.vx += (dx / dist) * force
      p.vy += (dy / dist) * force
    }

    switch (p.phase) {
      case 'explode':
        p.vx *= 0.98
        p.vy *= 0.98
        p.vy += 0.02
        p.x += p.vx
        p.y += p.vy
        
        if (this.phaseProgress > 2) {
          p.phase = 'float'
        }
        break

      case 'float':
        p.vx += (Math.random() - 0.5) * this.params.floatSpeed * 0.2
        p.vy += (Math.random() - 0.5) * this.params.floatSpeed * 0.2
        p.vx *= 0.99
        p.vy *= 0.99
        p.x += p.vx
        p.y += p.vy
        
        p.x = Math.max(20, Math.min(this.canvas.width - 20, p.x))
        p.y = Math.max(20, Math.min(this.canvas.height - 20, p.y))
        break

      case 'gather':
        if (this.phaseProgress > p.delay) {
          p.vx += (p.targetX - p.x) * this.params.gatherSpeed
          p.vy += (p.targetY - p.y) * this.params.gatherSpeed
          p.vx *= 0.9
          p.vy *= 0.9
          p.x += p.vx
          p.y += p.vy
        }
        break

      case 'reconstruct':
        if (this.phaseProgress > p.delay) {
          p.vx += (p.targetX - p.x) * 0.08
          p.vy += (p.targetY - p.y) * 0.08
          p.vx *= 0.92
          p.vy *= 0.92
          p.x += p.vx
          p.y += p.vy
        }
        break
    }

    if (this.params.colorFlicker) {
      p.brightness = 0.8 + Math.sin(this.time * 3 + p.x * 0.01 + p.y * 0.01) * 0.2
    }

    if (this.params.dynamicSize) {
      p.size = p.baseSize * (0.8 + Math.sin(this.time * 2 + p.x * 0.02) * 0.2)
    }
  }

  private drawParticle(p: Particle) {
    const brightness = p.brightness
    const match = p.color.match(/rgb\((\d+),(\d+),(\d+)\)/)
    if (match) {
      const r = Math.min(255, Math.floor(parseInt(match[1]) * brightness))
      const g = Math.min(255, Math.floor(parseInt(match[2]) * brightness))
      const b = Math.min(255, Math.floor(parseInt(match[3]) * brightness))
      this.ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha})`
    } else {
      this.ctx.fillStyle = p.color
    }

    this.ctx.beginPath()
    this.ctx.fillRect(
      Math.floor(p.x - p.size / 2),
      Math.floor(p.y - p.size / 2),
      p.size,
      p.size
    )
  }

  exportImage(): string {
    return this.canvas.toDataURL('image/png')
  }

  getParams(): ParticleParams {
    return { ...this.params }
  }
}
