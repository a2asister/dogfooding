import type { DustParticle, EffectConfig } from '../types/dust'

export function useDustEffect(canvas: HTMLCanvasElement, config: EffectConfig) {
  const ctx = canvas.getContext('2d')!
  let particles: DustParticle[] = []
  let animationId: number
  let mouseX = 0
  let mouseY = 0
  let mouseInfluenceRadius = 150

  const initParticles = () => {
    particles = []
    const count = Math.floor(config.density * 5)
    for (let i = 0; i < count; i++) {
      particles.push(createParticle())
    }
  }

  const createParticle = (x?: number, y?: number): DustParticle => {
    return {
      x: x ?? Math.random() * canvas.width,
      y: y ?? Math.random() * canvas.height,
      size: config.particleSize * (0.5 + Math.random() * 1.5),
      speedX: (Math.random() - 0.5) * config.speed * 0.5,
      speedY: (Math.random() - 0.5) * config.speed * 0.5,
      opacity: 0.3 + Math.random() * 0.4,
      brightness: Math.random(),
      phase: Math.random() * Math.PI * 2
    }
  }

  const updateParticle = (particle: DustParticle) => {
    particle.phase += 0.02
    particle.brightness = 0.5 + Math.sin(particle.phase) * 0.5

    const dx = particle.x - mouseX
    const dy = particle.y - mouseY
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < mouseInfluenceRadius) {
      const force = (mouseInfluenceRadius - dist) / mouseInfluenceRadius * config.mouseInfluence
      particle.speedX += (dx / dist) * force * 0.1
      particle.speedY += (dy / dist) * force * 0.1
    }

    particle.x += particle.speedX
    particle.y += particle.speedY

    particle.speedX *= 0.99
    particle.speedY *= 0.99

    if (particle.x < 0) particle.x = canvas.width
    if (particle.x > canvas.width) particle.x = 0
    if (particle.y < 0) particle.y = canvas.height
    if (particle.y > canvas.height) particle.y = 0
  }

  const render = () => {
    ctx.fillStyle = `rgba(10, 10, 10, ${0.1 + config.hazeIntensity * 0.05})`
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const gradient = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.3,
      0,
      canvas.width * 0.5,
      canvas.height * 0.3,
      canvas.width * 0.6
    )
    gradient.addColorStop(0, `rgba(255, 250, 240, ${0.1 * config.lightIntensity})`)
    gradient.addColorStop(0.5, `rgba(255, 245, 230, ${0.05 * config.lightIntensity})`)
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    particles.forEach(particle => {
      updateParticle(particle)

      const brightness = particle.brightness
      const rgb = Math.floor(200 + brightness * 55)
      const alpha = particle.opacity * (0.5 + brightness * 0.5)

      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${rgb}, ${rgb - 5}, ${rgb - 15}, ${alpha})`
      ctx.fill()

      const glow = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 3
      )
      glow.addColorStop(0, `rgba(255, 250, 240, ${0.1 * brightness})`)
      glow.addColorStop(1, 'rgba(255, 250, 240, 0)')
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()
    })

    animationId = requestAnimationFrame(render)
  }

  const handleMouseMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect()
    mouseX = e.clientX - rect.left
    mouseY = e.clientY - rect.top
  }

  const start = () => {
    initParticles()
    render()
    canvas.addEventListener('mousemove', handleMouseMove)
  }

  const stop = () => {
    cancelAnimationFrame(animationId)
    canvas.removeEventListener('mousemove', handleMouseMove)
  }

  const updateConfig = (newConfig: EffectConfig) => {
    const needReinit = 
      Math.abs(newConfig.density - config.density) > 0.1 || 
      Math.abs(newConfig.particleSize - config.particleSize) > 0.1
    
    Object.assign(config, newConfig)
    
    if (needReinit) {
      initParticles()
    }
  }

  const captureFrame = () => {
    return canvas.toDataURL('image/png')
  }

  return { start, stop, updateConfig, captureFrame }
}
