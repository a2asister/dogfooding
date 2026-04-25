import { useState, useEffect, useCallback } from 'react';
import { BlockPalette } from './components/BlockPalette';
import { CodeWorkspace } from './components/CodeWorkspace';
import { GameGrid } from './components/GameGrid';
import { LevelSelect } from './components/LevelSelect';
import { runProgram } from './utils/gameEngine';
import { getNextLevel } from './data/levels';
import type { Block, CharacterState, Level, Progress } from '@/types';

const STORAGE_KEY = 'kids-programming-progress';

const defaultProgress: Progress = {
  unlockedLevels: [1],
  completedLevels: [],
  totalStars: 0,
  levelStars: {},
  playTime: 0,
};

interface GamePageProps {
  level: Level;
  progress: Progress;
  onUpdateProgress: (progress: Progress) => void;
  onBack: () => void;
  onSelectLevel: (level: Level) => void;
}

function GamePage({
  level,
  progress,
  onUpdateProgress,
  onBack,
  onSelectLevel,
}: GamePageProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [characterState, setCharacterState] = useState<CharacterState>({
    position: { ...level.startPosition },
    direction: level.startDirection,
    isJumping: false,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);

  const resetGame = useCallback(() => {
    setCharacterState({
      position: { ...level.startPosition },
      direction: level.startDirection,
      isJumping: false,
    });
    setIsRunning(false);
    setIsCompleted(false);
    setShowSuccess(false);
    setShowFailure(false);
  }, [level.startPosition, level.startDirection]);

  useEffect(() => {
    resetGame();
    setBlocks([]);
    setShowHint(true);
  }, [level, resetGame]);

  const handleAddBlock = (block: Block) => {
    setBlocks((prev) => [...prev, block]);
  };

  const handleRemoveBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleBlocksChange = (newBlocks: Block[]) => {
    setBlocks(newBlocks);
  };

  const handleLoopCountChange = (id: string, count: number) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, count } : b))
    );
  };

  const handleClear = () => {
    setBlocks([]);
    resetGame();
  };

  const handleHint = () => {
    setShowHint(!showHint);
  };

  const handleRun = async () => {
    if (blocks.length === 0 || isRunning) return;

    setIsRunning(true);
    resetGame();

    await runProgram(
      blocks,
      level,
      (state, _stepIndex) => {
        setCharacterState(state);
      },
      (success) => {
        setIsRunning(false);
        if (success) {
          setIsCompleted(true);
          setShowSuccess(true);
          
          const nextLevel = getNextLevel(level.id);
          let newProgress = { ...progress };
          let progressUpdated = false;
          
          if (nextLevel && !progress.unlockedLevels.includes(nextLevel.id)) {
            newProgress.unlockedLevels = [...progress.unlockedLevels, nextLevel.id];
            progressUpdated = true;
          }
          
          if (!progress.completedLevels.includes(level.id)) {
            newProgress.completedLevels = [...progress.completedLevels, level.id];
            newProgress.totalStars = progress.totalStars + 3;
            newProgress.levelStars = {
              ...progress.levelStars,
              [level.id]: 3,
            };
            progressUpdated = true;
          }
          
          if (progressUpdated) {
            onUpdateProgress(newProgress);
          }
        } else {
          setShowFailure(true);
          setTimeout(() => setShowFailure(false), 2000);
        }
      },
      600
    );
  };

  const handleNextLevel = () => {
    const next = getNextLevel(level.id);
    if (next) {
      setShowSuccess(false);
      onSelectLevel(next);
    }
  };

  return (
    <div className="h-screen w-screen bg-background p-4 flex gap-4">
      <div className="w-72 flex-shrink-0">
        <BlockPalette
          availableBlocks={level.availableBlocks}
          onBlockClick={handleAddBlock}
        />
      </div>

      <div className="flex-1 flex flex-col gap-4 relative">
        <CodeWorkspace
          blocks={blocks}
          onBlocksChange={handleBlocksChange}
          onBlockRemove={handleRemoveBlock}
          onLoopCountChange={handleLoopCountChange}
          onClear={handleClear}
          onHint={handleHint}
          isRunning={isRunning}
          hint={level.hint}
          showHint={showHint}
        />
        
        {showFailure && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="bg-red-500 text-white px-8 py-4 rounded-2xl text-xl font-bold shadow-lg">
              ❌ 小兔子迷路了！再试一次吧~
            </div>
          </div>
        )}
      </div>

      <div className="w-[420px] flex-shrink-0">
        <GameGrid
          level={level}
          characterState={characterState}
          isRunning={isRunning}
          isCompleted={isCompleted}
          onRun={handleRun}
          onReset={resetGame}
          onBack={onBack}
          onNextLevel={handleNextLevel}
          hasNextLevel={!!getNextLevel(level.id)}
          showSuccess={showSuccess}
        />
      </div>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState<'select' | 'game'>('select');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [progress, setProgress] = useState<Progress>(defaultProgress);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProgress(parsed);
      } catch {
        setProgress(defaultProgress);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const handleSelectLevel = (level: Level) => {
    setSelectedLevel(level);
    setCurrentPage('game');
  };

  const handleBackToSelect = () => {
    setCurrentPage('select');
    setSelectedLevel(null);
  };

  const handleUpdateProgress = (newProgress: Progress) => {
    setProgress(newProgress);
  };

  if (currentPage === 'select') {
    return (
      <LevelSelect
        onSelectLevel={handleSelectLevel}
        unlockedLevels={progress.unlockedLevels}
        completedLevels={progress.completedLevels}
      />
    );
  }

  if (!selectedLevel) {
    return null;
  }

  return (
    <GamePage
      level={selectedLevel}
      progress={progress}
      onUpdateProgress={handleUpdateProgress}
      onBack={handleBackToSelect}
      onSelectLevel={handleSelectLevel}
    />
  );
}

export default App;
