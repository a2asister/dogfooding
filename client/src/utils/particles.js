const HEART_EMOJIS = ['❤️', '💕', '💖', '💗', '💓', '💘', '💝', '💞', '🩷', '🩵'];

export function createHeartParticles(container, x, y) {
  const particleCount = 20 + Math.floor(Math.random() * 15);
  
  for (let i = 0; i < particleCount; i++) {
    createParticle(container, x, y);
  }
}

function createParticle(container, x, y) {
  const particle = document.createElement('div');
  particle.className = 'heart-particle';
  
  const emoji = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
  particle.textContent = emoji;
  
  const size = 16 + Math.random() * 20;
  const angle = Math.random() * Math.PI * 2;
  const velocity = 80 + Math.random() * 120;
  const vx = Math.cos(angle) * velocity;
  const vy = Math.sin(angle) * velocity - 50;
  const rotation = Math.random() * 360;
  const rotationSpeed = (Math.random() - 0.5) * 720;
  const lifetime = 800 + Math.random() * 600;
  const scale = 0.5 + Math.random() * 0.8;
  
  particle.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    font-size: ${size}px;
    pointer-events: none;
    user-select: none;
    z-index: 9999;
    transform: translate(-50%, -50%) rotate(${rotation}deg) scale(${scale});
    opacity: 1;
  `;
  
  container.appendChild(particle);
  
  const startTime = performance.now();
  let posX = 0;
  let posY = 0;
  let currentVx = vx;
  let currentVy = vy;
  
  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = elapsed / lifetime;
    
    if (progress >= 1) {
      particle.remove();
      return;
    }
    
    const deltaTime = 16 / 1000;
    currentVy += 200 * deltaTime;
    currentVx *= 0.98;
    
    posX += currentVx * deltaTime;
    posY += currentVy * deltaTime;
    
    const currentRotation = rotation + rotationSpeed * progress;
    const opacity = 1 - progress;
    const currentScale = scale * (1 - progress * 0.3);
    
    particle.style.transform = `
      translate(calc(-50% + ${posX}px), calc(-50% + ${posY}px))
      rotate(${currentRotation}deg)
      scale(${currentScale})
    `;
    particle.style.opacity = opacity;
    
    requestAnimationFrame(animate);
  }
  
  requestAnimationFrame(animate);
}
