import { onMount, onCleanup, createSignal } from 'solid-js';

export default function ParticleBackground(props) {
  let canvasRef;
  let animationId = null;
  const [canvas, setCanvas] = createSignal(null);
  
  class Particle {
    constructor(canvasWidth, canvasHeight, isEnding = false) {
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.reset(isEnding);
    }
    
    reset(isEnding = false) {
      this.x = Math.random() * this.canvasWidth;
      this.y = Math.random() * this.canvasHeight;
      this.baseSize = Math.random() * 3 + 1;
      this.size = this.baseSize;
      
      if (isEnding) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 15 + 10;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
        this.color = { r: 255, g: Math.random() * 100, b: 0 };
      } else {
        const angle = Math.random() * Math.PI * 2;
        const baseSpeed = 0.5 + (props.timeProgress?.() || 0) * 3;
        const speed = Math.random() * 1.5 + baseSpeed;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1;
        this.decay = 0;
        
        const progress = props.timeProgress?.() || 0;
        const isNearEnd = progress > 0.8;
        
        if (isNearEnd) {
          const redAmount = (progress - 0.8) * 5;
          this.color = {
            r: Math.min(255, 100 + redAmount * 155),
            g: Math.max(0, 150 - redAmount * 150),
            b: Math.max(0, 255 - redAmount * 200)
          };
        } else {
          this.color = {
            r: Math.floor(Math.random() * 100 + 100),
            g: Math.floor(Math.random() * 150 + 200),
            b: 255
          };
        }
      }
    }
    
    update(deltaTime, isEnding = false) {
      const progress = props.timeProgress?.() || 0;
      const speedMultiplier = 1 + progress * 3;
      
      this.x += this.vx * speedMultiplier * (deltaTime / 16);
      this.y += this.vy * speedMultiplier * (deltaTime / 16);
      
      if (isEnding) {
        this.life -= this.decay;
        this.size = this.baseSize * this.life;
        
        if (this.life <= 0) {
          this.reset(true);
          this.life = 1;
        }
      } else {
        if (this.x < 0) this.x = this.canvasWidth;
        if (this.x > this.canvasWidth) this.x = 0;
        if (this.y < 0) this.y = this.canvasHeight;
        if (this.y > this.canvasHeight) this.y = 0;
      }
    }
    
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      
      const { r, g, b } = this.color;
      const alpha = this.life * 0.8;
      
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.size * 2
      );
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }
  
  onMount(() => {
    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');
    setCanvas(canvas);
    
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const particleCount = 150;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas.width, canvas.height));
    }
    
    let lastTime = performance.now();
    
    function animate(currentTime) {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      const progress = props.timeProgress?.() || 0;
      const isEnding = progress > 0.95;
      
      ctx.fillStyle = 'rgba(10, 10, 26, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for (const particle of particles) {
        particle.update(deltaTime, isEnding);
        particle.draw(ctx);
      }
      
      if (isEnding) {
        for (let i = 0; i < 3; i++) {
          const p = new Particle(canvas.width, canvas.height, true);
          p.x = canvas.width / 2 + (Math.random() - 0.5) * 200;
          p.y = canvas.height / 2 + (Math.random() - 0.5) * 200;
          particles.push(p);
          
          if (particles.length > 300) {
            particles.shift();
          }
        }
      }
      
      animationId = requestAnimationFrame(animate);
    }
    
    animationId = requestAnimationFrame(animate);
    
    onCleanup(() => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener('resize', resizeCanvas);
    });
  });
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
}
