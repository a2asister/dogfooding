import { createSignal, For, onCleanup, onMount } from 'solid-js';
import type { Character, Rarity } from '../types';
import './CharacterCard.css';

interface Props {
  character: Character;
  isCollected: boolean;
  onCollect: (id: string) => void;
}

export default function CharacterCard(props: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  const rarityClass = () => `card-${props.character.rarity}`;

  function handleClick() {
    if (!isFlipped()) {
      triggerBurstEffect();
    }
    setIsFlipped(!isFlipped());

    if (!props.isCollected) {
      props.onCollect(props.character.id);
    }
  }

  function triggerBurstEffect() {
    const colors = getRarityColors(props.character.rarity);
    const newParticles: Array<{ id: number; x: number; y: number; color: string }> = [];
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const distance = 80 + Math.random() * 60;
      newParticles.push({
        id: Date.now() + i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        color: colors[i % colors.length],
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 800);
  }

  let edgeParticleInterval: number | undefined;

  onMount(() => {
    if (props.character.rarity !== 'normal') {
      edgeParticleInterval = window.setInterval(() => {
        if (!isHovered()) return;
      }, 100);
    }
  });

  onCleanup(() => {
    if (edgeParticleInterval) clearInterval(edgeParticleInterval);
  });

  return (
    <div
      class={`card-container ${rarityClass()} ${isFlipped() ? 'flipped' : ''} ${props.isCollected ? 'collected' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{ perspective: '1000px' }}
    >
      <div class="card-inner">
        <div class="card-front">
          <div class="holographic-layer" />
          <div class="holographic-shine" />
          <div class="card-content">
            <div class="card-image-wrapper">
              <img src={props.character.imageUrl} alt={props.character.name} class="card-image" />
              <div class="image-overlay" />
            </div>
            <div class="card-info">
              <span class="card-element">{props.character.element}</span>
              <h3 class="card-name">{props.character.name}</h3>
              <span class={`card-rarity badge-${props.character.rarity}`}>
                {getRarityLabel(props.character.rarity)}
              </span>
            </div>
          </div>

          {props.character.rarity === 'legendary' && (
            <For each={Array.from({ length: 8 })}>
              {(_, i) => <div class={`flame-particle flame-${(i() % 4) + 1}`} />}
            </For>
          )}

          <For each={particles()}>
            {(p) => (
              <div
                class="burst-particle"
                style={{
                  '--tx': `${p.x}px`,
                  '--ty': `${p.y}px`,
                  '--color': p.color,
                } as Record<string, string>}
              />
            )}
          </For>

          <div class="edge-particles">
            <For each={Array.from({ length: 6 })}>
              {(_, i) => (
                <div
                  class={`edge-particle edge-${(i() % 6) + 1}`}
                  style={{ '--delay': `${i() * 0.3}s` } as Record<string, string>}
                />
              )}
            </For>
          </div>
        </div>

        <div class="card-back">
          <div class="holographic-layer" />
          <div class="card-back-content">
            <h3 class="card-back-title">{props.character.name}</h3>
            <div class="card-back-details">
              <p class="detail-row">
                <span>元素:</span>
                <span>{props.character.element}</span>
              </p>
              <p class="detail-row">
                <span>稀有度:</span>
                <span class={`detail-rarity text-${props.character.rarity}`}>
                  {getRarityLabel(props.character.rarity)}
                </span>
              </p>
            </div>
            <p class="card-description">{props.character.description}</p>
            {props.isCollected ? (
              <span class="collection-status collected-text">✓ 已收集</span>
            ) : (
              <span class="collection-status new-text">新获得!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function useState<T>(initial: T): [() => T, (value: T) => void] {
  const [signal, setSignal] = createSignal(initial);
  return [signal, setSignal];
}

function getRarityColors(rarity: Rarity): string[] {
  switch (rarity) {
    case 'normal':
      return ['#888', '#aaa', '#ccc', '#bbb'];
    case 'rare':
      return ['#4a9eff', '#00bfff', '#1e90ff', '#87ceeb'];
    case 'legendary':
      return ['#ff4500', '#ff6b35', '#ffd700', '#ffa500', '#ff8c00'];
    default:
      return ['#888'];
  }
}

function getRarityLabel(rarity: Rarity): string {
  switch (rarity) {
    case 'normal':
      return '普通';
    case 'rare':
      return '稀有';
    case 'legendary':
      return '传说';
    default:
      return '普通';
  }
}
