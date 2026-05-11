import { onMount, createSignal } from 'solid-js';

const ScratchCard = ({ isWinner, coupon, onReveal }) => {
  let canvasRef;
  const [scratchProgress, setScratchProgress] = createSignal(0);
  const [isRevealed, setIsRevealed] = createSignal(false);
  const [particles, setParticles] = createSignal([]);
  const [coins, setCoins] = createSignal([]);
  const [shards, setShards] = createSignal([]);
  const [showAnimation, setShowAnimation] = createSignal(false);
  
  let isDrawing = false;
  let ctx = null;
  let lastPos = null;
  let animationFrame = null;

  const createMetalGradient = (ctx, width, height) => {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#d4af37');
    gradient.addColorStop(0.1, '#f4e4ba');
    gradient.addColorStop(0.2, '#d4af37');
    gradient.addColorStop(0.3, '#f4e4ba');
    gradient.addColorStop(0.4, '#d4af37');
    gradient.addColorStop(0.5, '#f4e4ba');
    gradient.addColorStop(0.6, '#d4af37');
    gradient.addColorStop(0.7, '#f4e4ba');
    gradient.addColorStop(0.8, '#d4af37');
    gradient.addColorStop(0.9, '#f4e4ba');
    gradient.addColorStop(1, '#d4af37');
    return gradient;
  };

  const initCanvas = () => {
    const canvas = canvasRef;
    if (!canvas) return;

    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx = canvas.getContext('2d');
    
    const gradient = createMetalGradient(ctx, canvas.width, canvas.height);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 30 + 10;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('刮开赢大奖', canvas.width / 2, canvas.height / 2);
    ctx.font = '16px Arial';
    ctx.fillText('用手指或鼠标刮开涂层', canvas.width / 2, canvas.height / 2 + 30);
  };

  const getPos = (e) => {
    const canvas = canvasRef;
    const rect = canvas.getBoundingClientRect();
    
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const createScratchParticles = (x, y) => {
    const newParticles = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 3,
        size: Math.random() * 6 + 2,
        color: `hsl(${45 + Math.random() * 15}, ${70 + Math.random() * 20}%, ${50 + Math.random() * 20}%)`,
        life: 1
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const updateParticles = () => {
    setParticles(prev => {
      return prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.3,
          life: p.life - 0.02
        }))
        .filter(p => p.life > 0);
    });
  };

  const scratch = (pos) => {
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    
    ctx.beginPath();
    if (lastPos) {
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.lineWidth = 30;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
    ctx.fill();

    createScratchParticles(pos.x, pos.y);
    lastPos = pos;

    const canvas = canvasRef;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparent++;
      }
    }

    const progress = (transparent / (pixels.length / 4)) * 100;
    setScratchProgress(progress);

    if (progress > 50 && !isRevealed()) {
      setIsRevealed(true);
      triggerRevealAnimation();
    }
  };

  const triggerRevealAnimation = () => {
    setShowAnimation(true);
    
    if (isWinner) {
      const newCoins = [];
      for (let i = 0; i < 30; i++) {
        newCoins.push({
          id: Date.now() + i,
          left: Math.random() * 100 + '%',
          animationDelay: Math.random() * 0.5 + 's',
          animationDuration: (1.5 + Math.random()) + 's'
        });
      }
      setCoins(newCoins);
    } else {
      const newShards = [];
      for (let i = 0; i < 20; i++) {
        newShards.push({
          id: Date.now() + i,
          left: (30 + Math.random() * 40) + '%',
          top: (20 + Math.random() * 30) + '%',
          width: (20 + Math.random() * 40) + 'px',
          height: (10 + Math.random() * 20) + 'px',
          animationDelay: Math.random() * 0.3 + 's',
          transform: `rotate(${Math.random() * 360}deg)`
        });
      }
      setShards(newShards);
    }

    if (onReveal) {
      onReveal();
    }
  };

  const handleStart = (e) => {
    if (isRevealed()) return;
    e.preventDefault();
    isDrawing = true;
    lastPos = getPos(e);
  };

  const handleMove = (e) => {
    if (!isDrawing || isRevealed()) return;
    e.preventDefault();
    const pos = getPos(e);
    scratch(pos);
  };

  const handleEnd = () => {
    isDrawing = false;
    lastPos = null;
  };

  const animate = () => {
    updateParticles();
    animationFrame = requestAnimationFrame(animate);
  };

  onMount(() => {
    initCanvas();
    animate();
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  });

  return (
    <>
      <div class="scratch-wrapper">
        <div class={`prize-layer ${isWinner ? 'winner' : 'loser'} ${showAnimation() ? 'reveal-animation' : ''}`}>
          {isWinner ? (
            <>
              <h2>🎉 恭喜中奖！</h2>
              <div class="amount">¥{coupon?.amount || 0}</div>
              <div class="message">{coupon?.batch_name || '优惠券'}</div>
            </>
          ) : (
            <>
              <h2>😢 很遗憾</h2>
              <div class="message">本次未中奖</div>
              <div class="message" style={{ fontSize: '0.9rem', marginTop: '1rem' }}>下次再试试手气吧！</div>
            </>
          )}
        </div>
        
        <canvas
          ref={(el) => { canvasRef = el; }}
          class="scratch-canvas"
          style={{ opacity: isRevealed() ? 0 : 1, transition: 'opacity 0.5s' }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
        
        <div class="particles-container">
          {particles().map(p => (
            <div
              class="particle"
              style={{
                left: p.x + 'px',
                top: p.y + 'px',
                width: p.size + 'px',
                height: p.size + 'px',
                background: p.color,
                opacity: p.life
              }}
            />
          ))}
        </div>
      </div>

      <div class="coins-container">
        {coins().map(coin => (
          <div
            class="coin"
            style={{
              left: coin.left,
              top: '-50px',
              animationDelay: coin.animationDelay,
              animationDuration: coin.animationDuration
            }}
          />
        ))}
      </div>

      <div class="shards-container">
        {shards().map(shard => (
          <div
            class="shard"
            style={{
              left: shard.left,
              top: shard.top,
              width: shard.width,
              height: shard.height,
              animationDelay: shard.animationDelay,
              transform: shard.transform
            }}
          />
        ))}
      </div>
    </>
  );
};

export default ScratchCard;
