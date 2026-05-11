import { createSignal, For, onMount } from 'solid-js';
import CharacterCard from './components/CharacterCard';
import CollectionProgress from './components/CollectionProgress';
import {
  getAllCharacters,
  getCollectedIds,
  collectCharacter,
} from './api';
import type { Character, CollectionStats } from './types';
import './App.css';

export default function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [stats, setStats] = useState<CollectionStats>({ total: 0, collected: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'collected' | 'uncollected'>('all');
  const [rarityFilter, setRarityFilter] = useState<'all' | 'normal' | 'rare' | 'legendary'>('all');
  const [newlyCollectedId, setNewlyCollectedId] = useState<string | undefined>(undefined);

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    setLoading(true);
    try {
      const [chars, collected] = await Promise.all([
        getAllCharacters(),
        getCollectedIds(),
      ]);

      setCharacters(chars);
      setCollectedIds(collected);
      setStats({ total: chars.length, collected: collected.length });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCollect(characterId: string) {
    if (collectedIds().includes(characterId)) return;

    await collectCharacter(characterId);

    const newCollectedIds = [...collectedIds(), characterId];
    setCollectedIds(newCollectedIds);
    setStats({
      total: stats().total,
      collected: newCollectedIds.length,
    });
    setNewlyCollectedId(characterId);
    setTimeout(() => setNewlyCollectedId(undefined), 100);
  }

  function handlePuzzleLightUp(_characterId: string) {
    console.log('Puzzle piece lit up!');
  }

  const filteredCharacters = () => {
    let result = characters();

    if (filter() === 'collected') {
      result = result.filter(c => collectedIds().includes(c.id));
    } else if (filter() === 'uncollected') {
      result = result.filter(c => !collectedIds().includes(c.id));
    }

    if (rarityFilter() !== 'all') {
      result = result.filter(c => c.rarity === rarityFilter());
    }

    return result;
  };

  const characterGrid = () => {
    return characters().map(c => ({
      id: c.id,
      gridPosition: c.gridPosition,
      rarity: c.rarity,
    }));
  };

  return (
    <div class="app">
      <header class="app-header">
        <h1 class="app-title">游戏角色卡片收集系统</h1>
        <p class="app-subtitle">探索、收集、解锁华丽的角色卡片</p>
      </header>

      <main class="app-main">
        <CollectionProgress
          total={stats().total}
          collected={stats().collected}
          collectedIds={collectedIds()}
          characterGrid={characterGrid()}
          newlyCollectedId={newlyCollectedId()}
          onPuzzleLightUp={handlePuzzleLightUp}
        />

        <div class="filter-controls">
          <div class="filter-group">
            <span class="filter-label">状态:</span>
            <button
              class={`filter-btn ${filter() === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              全部
            </button>
            <button
              class={`filter-btn ${filter() === 'uncollected' ? 'active' : ''}`}
              onClick={() => setFilter('uncollected')}
            >
              未收集
            </button>
            <button
              class={`filter-btn ${filter() === 'collected' ? 'active' : ''}`}
              onClick={() => setFilter('collected')}
            >
              已收集
            </button>
          </div>

          <div class="filter-group">
            <span class="filter-label">稀有度:</span>
            <button
              class={`filter-btn rarity-all ${rarityFilter() === 'all' ? 'active' : ''}`}
              onClick={() => setRarityFilter('all')}
            >
              全部
            </button>
            <button
              class={`filter-btn rarity-normal ${rarityFilter() === 'normal' ? 'active' : ''}`}
              onClick={() => setRarityFilter('normal')}
            >
              普通
            </button>
            <button
              class={`filter-btn rarity-rare ${rarityFilter() === 'rare' ? 'active' : ''}`}
              onClick={() => setRarityFilter('rare')}
            >
              稀有
            </button>
            <button
              class={`filter-btn rarity-legendary ${rarityFilter() === 'legendary' ? 'active' : ''}`}
              onClick={() => setRarityFilter('legendary')}
            >
              传说
            </button>
          </div>
        </div>

        {loading() ? (
          <div class="loading-container">
            <div class="loading-spinner" />
            <span>加载中...</span>
          </div>
        ) : (
          <div class="cards-grid">
            <For each={filteredCharacters()}>
              {(character) => (
                <CharacterCard
                  character={character}
                  isCollected={collectedIds().includes(character.id)}
                  onCollect={handleCollect}
                />
              )}
            </For>

            {filteredCharacters().length === 0 && (
              <div class="empty-state">
                <span class="empty-icon">📦</span>
                <p class="empty-text">没有符合条件的卡片</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer class="app-footer">
        <p>SolidJS + NestJS 角色卡片收集系统</p>
        <p class="footer-hint">点击卡片解锁收集 · 悬停查看全息效果</p>
      </footer>
    </div>
  );
}

function useState<T>(initial: T): [() => T, (value: T) => void] {
  const [signal, setSignal] = createSignal(initial);
  return [signal, setSignal];
}
