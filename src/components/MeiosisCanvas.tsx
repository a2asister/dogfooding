import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MEIOSIS_PHASES } from '../types';
import type { 
  Chromosome, 
  Cell, 
  MeiosisPhase, 
  MeiosisPhaseId 
} from '../types';
import { 
  drawChromosome, 
  drawCell, 
  drawSpindleFiber, 
  drawAnnotation, 
  drawEquatorialPlate 
} from '../utils/drawing';
import { 
  createInitialChromosomes, 
  createInitialCell, 
  animateInterphase, 
  animateProphase1, 
  animateMetaphase1, 
  animateAnaphase1, 
  animateTelophase1, 
  animateProphase2, 
  animateMetaphase2, 
  animateAnaphase2, 
  animateTelophase2, 
  getPhaseDuration, 
  getNextPhase 
} from '../utils/animation';

interface MeiosisCanvasProps {
  currentPhaseId: MeiosisPhaseId;
  phaseProgress: number;
  isPlaying: boolean;
  playbackSpeed: number;
  showAnnotations: boolean;
  onPhaseChange: (phaseId: MeiosisPhaseId) => void;
  onProgressChange: (progress: number) => void;
  onPlaybackComplete?: () => void;
}

const MeiosisCanvas: React.FC<MeiosisCanvasProps> = ({
  currentPhaseId,
  phaseProgress,
  isPlaying,
  playbackSpeed,
  showAnnotations,
  onPhaseChange,
  onProgressChange,
  onPlaybackComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const internalProgressRef = useRef<number>(phaseProgress);
  const internalSpeedRef = useRef<number>(playbackSpeed);
  const internalPhaseIdRef = useRef<MeiosisPhaseId>(currentPhaseId);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 450 });
  
  const centerX = canvasSize.width / 2;
  const centerY = canvasSize.height / 2;
  
  const baseChromosomes = useRef<Chromosome[]>(createInitialChromosomes(centerX, centerY));
  const baseCell = useRef<Cell>(createInitialCell(centerX, centerY, 120));
  
  useEffect(() => {
    const handleResize = () => {
      const maxWidth = Math.min(window.innerWidth - 64, 1000);
      const aspectRatio = 16 / 10;
      const maxHeight = Math.min(maxWidth / aspectRatio, 450);
      setCanvasSize({ width: Math.min(maxWidth, maxHeight * aspectRatio), height: maxHeight });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    baseChromosomes.current = createInitialChromosomes(centerX, centerY);
    baseCell.current = createInitialCell(centerX, centerY, 120);
    internalProgressRef.current = 0;
    internalPhaseIdRef.current = currentPhaseId;
  }, [currentPhaseId, centerX, centerY]);
  
  useEffect(() => {
    internalSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);
  
  const getCurrentPhase = useCallback((): MeiosisPhase => {
    return MEIOSIS_PHASES.find(p => p.id === currentPhaseId) || MEIOSIS_PHASES[0];
  }, [currentPhaseId]);
  
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const currentCenterX = canvas.width / 2;
    const currentCenterY = canvas.height / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    const phase = getCurrentPhase();
    let chromosomes: Chromosome[] = baseChromosomes.current;
    let cells: { parent: Cell; daughter1: Cell; daughter2: Cell } | null = null;
    let gameteCells: Cell[] = [];
    let showEquatorial = false;
    let showSpindle = false;
    let chromosomeCount = 4;
    
    const progress = internalProgressRef.current;
    
    switch (currentPhaseId) {
      case 'interphase': {
        const result = animateInterphase(chromosomes, progress, currentCenterX, currentCenterY);
        chromosomes = result.chromosomes;
        drawCell(ctx, baseCell.current, true, true);
        break;
      }
      
      case 'prophase1': {
        const result = animateProphase1(chromosomes, progress, currentCenterX, currentCenterY);
        chromosomes = result.chromosomes;
        drawCell(ctx, baseCell.current, false, true);
        break;
      }
      
      case 'metaphase1': {
        const result = animateMetaphase1(chromosomes, progress, currentCenterX, currentCenterY);
        chromosomes = result.chromosomes;
        showEquatorial = result.showEquatorialPlate;
        showSpindle = result.showSpindle;
        drawCell(ctx, baseCell.current, false, true);
        break;
      }
      
      case 'anaphase1': {
        const result = animateAnaphase1(chromosomes, progress, currentCenterX, currentCenterY);
        chromosomes = result.chromosomes;
        showSpindle = true;
        drawCell(ctx, baseCell.current, false, true);
        chromosomeCount = 2;
        break;
      }
      
      case 'telophase1': {
        const result = animateTelophase1(chromosomes, progress, currentCenterX, currentCenterY);
        chromosomes = result.chromosomes;
        cells = result.cells;
        chromosomeCount = result.chromosomeCount;
        
        if (cells?.parent.isVisible) {
          drawCell(ctx, cells.parent, false, true);
        }
        if (cells?.daughter1.isVisible) {
          drawCell(ctx, cells.daughter1, false, true);
        }
        if (cells?.daughter2.isVisible) {
          drawCell(ctx, cells.daughter2, false, true);
        }
        break;
      }
      
      case 'prophase2': {
        const result = animateProphase2(chromosomes, progress, currentCenterX, currentCenterY);
        chromosomes = result.chromosomes;
        
        const daughter1: Cell = {
          id: 'daughter-1',
          position: { x: currentCenterX - 120, y: currentCenterY },
          radius: 80,
          isParent: false,
          isDaughter: true,
          isVisible: true
        };
        const daughter2: Cell = {
          id: 'daughter-2',
          position: { x: currentCenterX + 120, y: currentCenterY },
          radius: 80,
          isParent: false,
          isDaughter: true,
          isVisible: true
        };
        
        drawCell(ctx, daughter1, false, true);
        drawCell(ctx, daughter2, false, true);
        break;
      }
      
      case 'metaphase2': {
        const result = animateMetaphase2(chromosomes, progress, currentCenterX, currentCenterY);
        chromosomes = result.chromosomes;
        showEquatorial = result.showEquatorialPlate;
        
        const daughter1: Cell = {
          id: 'daughter-1',
          position: { x: currentCenterX - 120, y: currentCenterY },
          radius: 80,
          isParent: false,
          isDaughter: true,
          isVisible: true
        };
        const daughter2: Cell = {
          id: 'daughter-2',
          position: { x: currentCenterX + 120, y: currentCenterY },
          radius: 80,
          isParent: false,
          isDaughter: true,
          isVisible: true
        };
        
        drawCell(ctx, daughter1, false, true);
        drawCell(ctx, daughter2, false, true);
        break;
      }
      
      case 'anaphase2': {
        const result = animateAnaphase2(chromosomes, progress, currentCenterX, currentCenterY);
        chromosomes = result.chromosomes;
        showSpindle = true;
        
        const daughter1: Cell = {
          id: 'daughter-1',
          position: { x: currentCenterX - 120, y: currentCenterY },
          radius: 80,
          isParent: false,
          isDaughter: true,
          isVisible: true
        };
        const daughter2: Cell = {
          id: 'daughter-2',
          position: { x: currentCenterX + 120, y: currentCenterY },
          radius: 80,
          isParent: false,
          isDaughter: true,
          isVisible: true
        };
        
        drawCell(ctx, daughter1, false, true);
        drawCell(ctx, daughter2, false, true);
        chromosomeCount = 1;
        break;
      }
      
      case 'telophase2': {
        const result = animateTelophase2(chromosomes, progress, currentCenterX, currentCenterY);
        chromosomes = result.chromosomes;
        gameteCells = result.cells;
        chromosomeCount = result.chromosomeCount;
        
        gameteCells.forEach(cell => {
          if (cell.isVisible) {
            drawCell(ctx, cell, false, true);
          }
        });
        break;
      }
    }
    
    chromosomes.forEach(chromosome => {
      drawChromosome(ctx, chromosome, 1);
    });
    
    if (showEquatorial) {
      if (currentPhaseId === 'metaphase1' || currentPhaseId === 'anaphase1') {
        drawEquatorialPlate(ctx, { x: currentCenterX, y: currentCenterY }, 300, 0.4);
      } else if (currentPhaseId === 'metaphase2' || currentPhaseId === 'anaphase2') {
        drawEquatorialPlate(ctx, { x: currentCenterX - 120, y: currentCenterY }, 150, 0.4);
        drawEquatorialPlate(ctx, { x: currentCenterX + 120, y: currentCenterY }, 150, 0.4);
      }
    }
    
    if (showSpindle) {
      if (currentPhaseId === 'metaphase1' || currentPhaseId === 'anaphase1') {
        const spindleOpacity = currentPhaseId === 'anaphase1' ? 0.6 : 0.4;
        
        chromosomes.forEach(chromosome => {
          drawSpindleFiber(
            ctx,
            { x: currentCenterX - 200, y: currentCenterY },
            chromosome.centromerePosition,
            spindleOpacity
          );
          drawSpindleFiber(
            ctx,
            { x: currentCenterX + 200, y: currentCenterY },
            chromosome.centromerePosition,
            spindleOpacity
          );
        });
      } else if (currentPhaseId === 'anaphase2') {
        chromosomes.forEach((chromosome, index) => {
          const cellOffset = Math.floor(index / 4) === 0 ? -120 : 120;
          drawSpindleFiber(
            ctx,
            { x: currentCenterX + cellOffset - 100, y: currentCenterY },
            chromosome.centromerePosition,
            0.4
          );
          drawSpindleFiber(
            ctx,
            { x: currentCenterX + cellOffset + 100, y: currentCenterY },
            chromosome.centromerePosition,
            0.4
          );
        });
      }
    }
    
    if (showAnnotations && phase.annotations.length > 0) {
      phase.annotations.forEach((annotation, index) => {
        const annotationY = 60 + index * 30;
        drawAnnotation(
          ctx,
          annotation,
          { x: currentCenterX, y: annotationY },
          14,
          '#424242'
        );
      });
    }
    
    const phaseInfo = `当前阶段: ${phase.name}`;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#424242';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(phaseInfo, 20, 20);
    
    const chromosomeInfo = `染色体数目: ${chromosomeCount}n`;
    ctx.fillText(chromosomeInfo, 20, 45);
    
  }, [currentPhaseId, showAnnotations, getCurrentPhase]);
  
  useEffect(() => {
    renderFrame();
  }, [renderFrame]);
  
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }
    
    lastTimeRef.current = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      
      const phaseDuration = getPhaseDuration(internalPhaseIdRef.current);
      const progressIncrement = (deltaTime * internalSpeedRef.current) / phaseDuration;
      
      let newProgress = internalProgressRef.current + progressIncrement;
      
      if (newProgress >= 1) {
        newProgress = 0;
        const nextPhase = getNextPhase(internalPhaseIdRef.current);
        
        if (nextPhase) {
          internalProgressRef.current = 0;
          internalPhaseIdRef.current = nextPhase;
          baseChromosomes.current = createInitialChromosomes(centerX, centerY);
          onPhaseChange(nextPhase);
        } else {
          onPlaybackComplete?.();
          return;
        }
      } else {
        internalProgressRef.current = newProgress;
        onProgressChange(newProgress);
      }
      
      renderFrame();
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, centerX, centerY, onPhaseChange, onProgressChange, onPlaybackComplete, renderFrame]);
  
  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      style={{
        border: '2px solid #E0E0E0',
        borderRadius: '8px',
        background: '#FAFAFA'
      }}
    />
  );
};

export default MeiosisCanvas;
