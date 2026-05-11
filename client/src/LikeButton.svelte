<script>
  import { onMount, onDestroy } from 'svelte';

  export let postId = 1;
  let liked = false;
  let likeCount = 0;
  let userId = '';
  let isAnimating = false;
  let comboCount = 0;
  let lastClickTime = 0;
  let ripples = [];
  let particles = [];
  let numbers = [];
  let burstHearts = [];
  let rippleId = 0;
  let particleId = 0;
  let numberId = 0;
  let burstId = 0;
  let heartbeatInterval = null;
  let comboTimeout = null;

  const COMBO_TIMEOUT = 1500;
  const MIN_COMBO_CLICKS = 2;

  onMount(() => {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    fetchLikeStatus();
  });

  onDestroy(() => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (comboTimeout) clearTimeout(comboTimeout);
  });

  async function fetchLikeStatus() {
    try {
      const res = await fetch(`/api/posts/${postId}/like-status?userId=${userId}`);
      const data = await res.json();
      liked = data.liked;
      likeCount = data.like_count;
    } catch (e) {
      console.error('Failed to fetch like status:', e);
    }
  }

  async function toggleLike(event) {
    const now = Date.now();
    const isCombo = (now - lastClickTime) < COMBO_TIMEOUT;
    lastClickTime = now;

    if (liked && !isCombo) {
      await unlike();
      comboCount = 0;
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      if (comboTimeout) {
        clearTimeout(comboTimeout);
        comboTimeout = null;
      }
    } else {
      if (isCombo) {
        comboCount++;
      } else {
        comboCount = 1;
      }

      if (comboTimeout) clearTimeout(comboTimeout);
      comboTimeout = setTimeout(() => {
        comboCount = 0;
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
          heartbeatInterval = null;
        }
      }, COMBO_TIMEOUT);

      if (liked && isCombo) {
        await comboLike();
      } else {
        await like();
      }
      
      triggerAnimations(event, comboCount);

      if (comboCount >= MIN_COMBO_CLICKS && !heartbeatInterval) {
        heartbeatInterval = setInterval(() => {
          isAnimating = true;
          setTimeout(() => {
            isAnimating = false;
          }, 200);
        }, 400);
      }
    }
  }

  async function like() {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        const data = await res.json();
        liked = true;
        likeCount = data.like_count;
      }
    } catch (e) {
      console.error('Failed to like:', e);
    }
  }

  async function comboLike() {
    try {
      const res = await fetch(`/api/posts/${postId}/combo-like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        const data = await res.json();
        likeCount = data.like_count;
      }
    } catch (e) {
      console.error('Failed to combo like:', e);
    }
  }

  async function unlike() {
    try {
      const res = await fetch(`/api/posts/${postId}/like?userId=${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const data = await res.json();
        liked = false;
        likeCount = data.like_count;
      }
    } catch (e) {
      console.error('Failed to unlike:', e);
    }
  }

  function triggerAnimations(event, count) {
    isAnimating = true;
    setTimeout(() => isAnimating = false, 350);

    createBurstHeart();
    createRipple(event);
    createParticles(event);
    createNumber(event, count);
  }

  function createBurstHeart() {
    const id = burstId++;
    burstHearts = [...burstHearts, { id }];
    setTimeout(() => {
      burstHearts = burstHearts.filter(h => h.id !== id);
    }, 500);
  }

  function createRipple(event) {
    const id = rippleId++;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    ripples = [...ripples, { id, x, y }];
    setTimeout(() => {
      ripples = ripples.filter(r => r.id !== id);
    }, 1200);
  }

  function createParticles(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const numParticles = 12 + Math.floor(Math.random() * 8);

    for (let i = 0; i < numParticles; i++) {
      const baseAngle = (i / numParticles) * Math.PI * 2;
      const randomAngle = Math.random() * 0.5 - 0.25;
      const angle = baseAngle + randomAngle;
      const distance = 100 + Math.random() * 120;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance - 80;
      const rotation = Math.random() * 1440 - 720;
      const delay = Math.random() * 300;
      const size = 0.25 + Math.random() * 0.75;
      const id = particleId++;
      const hueOffset = Math.random() * 40 - 20;
      const curveY = -30 - Math.random() * 40;

      particles = [...particles, {
        id,
        x: centerX,
        y: centerY,
        endX,
        endY,
        rotation,
        delay,
        size,
        hueOffset,
        curveY
      }];

      setTimeout(() => {
        particles = particles.filter(p => p.id !== id);
      }, 2500 + delay);
    }
  }

  function createNumber(event, count) {
    const id = numberId++;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.width / 2;
    const y = rect.height / 2;
    const arcHeight = 50 + Math.random() * 60;
    const horizontalOffset = (Math.random() - 0.5) * 100;

    numbers = [...numbers, { id, count, x, y, arcHeight, horizontalOffset }];
    setTimeout(() => {
      numbers = numbers.filter(n => n.id !== id);
    }, 2000);
  }
</script>

<div class="like-container">
  <button class="like-button" on:click={toggleLike} on:touchstart={toggleLike}>
    <svg 
      class="heart-icon {liked ? 'liked' : ''} {isAnimating ? 'animate-bounce' : ''}" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>

    {#each burstHearts as burst (burst.id)}
      <svg class="burst-heart" viewBox="0 0 24 24">
        <defs>
          <radialGradient id="burstGrad">
            <stop offset="0%" stop-color="#ff4757" stop-opacity="1"/>
            <stop offset="100%" stop-color="#ff6b81" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <path fill="url(#burstGrad)" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    {/each}
    
    <span class="ripple-layer">
      {#each ripples as ripple (ripple.id)}
        <span 
          class="ripple" 
          style="left: {ripple.x}px; top: {ripple.y}px;"
        />
      {/each}
    </span>

    <span class="particle-layer">
      {#each particles as particle (particle.id)}
        <svg 
          class="particle" 
          viewBox="0 0 24 24" 
          style="
            --start-x: {particle.x}px;
            --start-y: {particle.y}px;
            --end-x: {particle.endX}px;
            --end-y: {particle.endY}px;
            --rotation: {particle.rotation}deg;
            --delay: {particle.delay}ms;
            --size: {particle.size};
            --hue-offset: {particle.hueOffset};
            --curve-y: {particle.curveY}px;
          "
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      {/each}
    </span>

    <span class="number-layer">
      {#each numbers as num (num.id)}
        <span 
          class="pop-number"
          style="
            --start-x: {num.x}px;
            --start-y: {num.y}px;
            --arc-height: {num.arcHeight}px;
            --horizontal-offset: {num.horizontalOffset}px;
          "
        >
          +{num.count}
        </span>
      {/each}
    </span>
  </button>
  
  <span class="like-count">{likeCount}</span>
  
  {#if comboCount >= MIN_COMBO_CLICKS}
    <span class="combo-badge">连击 x{comboCount}</span>
  {/if}
</div>

<style>
  .like-container {
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
  }

  .like-button {
    position: relative;
    width: 120px;
    height: 120px;
    border: none;
    background: transparent;
    cursor: pointer;
    overflow: visible;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .like-button:focus {
    outline: none;
  }

  .heart-icon {
    width: 64px;
    height: 64px;
    color: #a0a0a0;
    transition: color 0.15s ease;
    position: relative;
    z-index: 5;
    filter: drop-shadow(0 3px 6px rgba(0,0,0,0.15));
  }

  .heart-icon.liked {
    color: #ff4757;
    fill: #ff4757;
  }

  .heart-icon.animate-bounce {
    animation: heart-bounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  @keyframes heart-bounce {
    0% {
      transform: scale(1);
    }
    30% {
      transform: scale(1.5);
    }
    50% {
      transform: scale(0.9);
    }
    70% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  .burst-heart {
    position: absolute;
    width: 64px;
    height: 64px;
    z-index: 3;
    animation: burst-expand 0.5s ease-out forwards;
  }

  @keyframes burst-expand {
    0% {
      opacity: 0.9;
      transform: scale(1);
    }
    30% {
      opacity: 0.6;
      transform: scale(1.4);
    }
    100% {
      opacity: 0;
      transform: scale(2.2);
    }
  }

  .ripple-layer,
  .particle-layer,
  .number-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible;
  }

  .ripple {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,71,87,0.95) 0%, rgba(255,71,87,0.6) 25%, rgba(255,107,129,0.3) 50%, transparent 75%);
    transform: translate(-50%, -50%);
    animation: ripple-expand 1.2s ease-out forwards;
  }

  @keyframes ripple-expand {
    0% {
      width: 10px;
      height: 10px;
      opacity: 1;
    }
    100% {
      width: 300px;
      height: 300px;
      opacity: 0;
    }
  }

  .particle {
    position: absolute;
    width: 28px;
    height: 28px;
    left: var(--start-x);
    top: var(--start-y);
    fill: hsl(calc(355 + var(--hue-offset)), 100%, 63%);
    filter: drop-shadow(0 3px 6px rgba(255,71,87,0.5));
    animation: particle-float 2.5s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
    animation-delay: var(--delay);
    opacity: 0;
    z-index: 10;
  }

  @keyframes particle-float {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(0) rotate(0deg);
      left: var(--start-x);
      top: var(--start-y);
    }
    10% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(calc(var(--size) * 1.3)) rotate(0deg);
      left: var(--start-x);
      top: var(--start-y);
    }
    25% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(calc(var(--size) * 1.1)) rotate(calc(var(--rotation) * 0.2));
      left: calc(var(--start-x) + var(--end-x) * 0.3);
      top: calc(var(--start-y) + var(--curve-y) * 0.5);
    }
    60% {
      opacity: 0.9;
      transform: translate(-50%, -50%) scale(var(--size)) rotate(calc(var(--rotation) * 0.6));
      left: calc(var(--start-x) + var(--end-x) * 0.7);
      top: calc(var(--start-y) + var(--end-y) * 0.4);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(calc(var(--size) * 0.6)) rotate(var(--rotation));
      left: calc(var(--start-x) + var(--end-x));
      top: calc(var(--start-y) + var(--end-y));
    }
  }

  .pop-number {
    position: absolute;
    left: var(--start-x);
    top: var(--start-y);
    transform: translate(-50%, -50%);
    font-size: 32px;
    font-weight: 900;
    color: #ff4757;
    text-shadow: 0 3px 12px rgba(255,71,87,0.7), 0 0 25px rgba(255,71,87,0.4);
    animation: number-pop 2s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
    white-space: nowrap;
    pointer-events: none;
    z-index: 20;
  }

  @keyframes number-pop {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.3) translateY(0);
      left: var(--start-x);
      top: var(--start-y);
    }
    20% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.6) translateY(-25px);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.2) translateY(-60px);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8) translateY(calc(var(--arc-height) * -1 - 100px));
      left: calc(var(--start-x) + var(--horizontal-offset));
    }
  }

  .like-count {
    font-size: 26px;
    font-weight: 800;
    color: #2d2d2d;
    min-width: 60px;
    transition: transform 0.15s ease;
  }

  .combo-badge {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #ff4757, #ff6b81);
    color: white;
    padding: 6px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 900;
    animation: combo-pulse 0.4s ease-out;
    box-shadow: 0 6px 18px rgba(255,71,87,0.5);
  }

  @keyframes combo-pulse {
    0% {
      transform: translateX(-50%) scale(0.7);
      opacity: 0;
    }
    50% {
      transform: translateX(-50%) scale(1.2);
    }
    100% {
      transform: translateX(-50%) scale(1);
      opacity: 1;
    }
  }
</style>
