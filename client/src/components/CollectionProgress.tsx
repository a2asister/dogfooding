import { For, createSignal, createEffect, on } from 'solid-js';
import './CollectionProgress.css';

type Rarity = 'normal' | 'rare' | 'legendary';

interface Props {
  total: number;
  collected: number;
  collectedIds: string[];
  characterGrid: Array<{ id: string; gridPosition: number; rarity: Rarity }>;
  newlyCollectedId?: string;
  onPuzzleLightUp: (characterId: string) => void;
}

export default function CollectionProgress(props: Props) {
  const [recentlyLit, setRecentlyLit] = useState<string[]>([]);
  const [waves, setWaves] = useState<Array<{ id: string; position: number }>>([]);

  createEffect(
    on(
      () => props.newlyCollectedId,
      (newId) => {
        if (!newId) return;
        const char = props.characterGrid.find(c => c.id === newId);
        if (char) {
          triggerLightUp(newId, char.gridPosition);
        }
      },
    ),
  );

  function triggerLightUp(characterId: string, position: number) {
    const now = Date.now();
    setRecentlyLit([...recentlyLit(), characterId]);
    setWaves([...waves(), { id: `wave-${now}`, position }]);

    setTimeout(() => {
      setRecentlyLit(recentlyLit().filter((id: string) => id !== characterId));
    }, 1000);

    setTimeout(() => {
      setWaves(waves().filter((w: { id: string; position: number }) => w.id !== `wave-${now}`));
    }, 800);

    props.onPuzzleLightUp(characterId);
  }

  const gridSize = () => {
    const total = Math.max(props.total, 1);
    const cols = Math.ceil(Math.sqrt(total));
    return cols;
  };

  const progressPercent = () => {
    if (props.total === 0) return 0;
    return Math.round((props.collected / props.total) * 100);
  };

  return (
    <div class="progress-container">
      <div class="progress-header">
        <h2 class="progress-title">收集进度</h2>
        <div class="progress-stats">
          <span class="stat-count">{props.collected} / {props.total}</span>
          <span class="stat-percent">{progressPercent()}%</span>
        </div>
      </div>

      <div class="progress-bar-wrapper">
        <div class="progress-bar">
          <div
            class="progress-bar-fill"
            style={{ width: `${progressPercent()}%` }}
          />
          <div class="progress-bar-glow" />
        </div>
      </div>

      <div
        class="puzzle-grid"
        style={{
          'grid-template-columns': `repeat(${gridSize()}, 1fr)`,
        } as Record<string, string>}
      >
        <For each={[...props.characterGrid].sort((a, b) => a.gridPosition - b.gridPosition)}>
          {(char, index) => {
            const isCollected = () => props.collectedIds.includes(char.id);
            const isLit = () => recentlyLit().includes(char.id);
            const hasWave = () => waves().some(w => w.position === char.gridPosition);

            return (
              <div
                class={`puzzle-piece 
                  ${isCollected() ? 'collected' : 'locked'} 
                  ${isLit() ? 'lighting-up' : ''}
                  ${char.rarity ? `piece-${char.rarity}` : ''}`}
                data-position={index()}
              >
                {isCollected() ? (
                  <span class="puzzle-checked">✓</span>
                ) : (
                  <span class="puzzle-question">?</span>
                )}

                {hasWave() && (
                  <>
                    <div class="wave-ring wave-1" />
                    <div class="wave-ring wave-2" />
                    <div class="wave-ring wave-3" />
                  </>
                )}
              </div>
            );
          }}
        </For>
      </div>

      {progressPercent() === 100 && (
        <div class="completion-message">
          <span class="completion-star">★</span>
          <span>恭喜! 已收集全部角色!</span>
          <span class="completion-star">★</span>
        </div>
      )}
    </div>
  );
}

function useState<T>(initial: T): [() => T, (value: T) => void] {
  const [signal, setSignal] = createSignal(initial);
  return [signal, setSignal];
}
