import { MEIOSIS_PHASES } from '../types';
import type { Chromosome, Cell, MeiosisPhaseId } from '../types';
import { interpolatePoint, easeInOutQuad, easeOutCubic } from './drawing';

export const createInitialChromosomes = (centerX: number, centerY: number): Chromosome[] => {
  const baseOffset = 30;
  
  return [
    {
      id: 'maternal-1',
      homologousPair: 1,
      isMaternal: true,
      centromerePosition: { x: centerX - baseOffset, y: centerY - 20 },
      arms: {
        short: {
          start: { x: centerX - baseOffset, y: centerY - 20 },
          end: { x: centerX - baseOffset, y: centerY - 60 }
        },
        long: {
          start: { x: centerX - baseOffset, y: centerY - 20 },
          end: { x: centerX - baseOffset, y: centerY + 40 }
        }
      },
      hasCrossedOver: false,
      crossingOverSegments: [],
      isVisible: true,
      opacity: 1
    },
    {
      id: 'paternal-1',
      homologousPair: 1,
      isMaternal: false,
      centromerePosition: { x: centerX + baseOffset, y: centerY - 20 },
      arms: {
        short: {
          start: { x: centerX + baseOffset, y: centerY - 20 },
          end: { x: centerX + baseOffset, y: centerY - 60 }
        },
        long: {
          start: { x: centerX + baseOffset, y: centerY - 20 },
          end: { x: centerX + baseOffset, y: centerY + 40 }
        }
      },
      hasCrossedOver: false,
      crossingOverSegments: [],
      isVisible: true,
      opacity: 1
    },
    {
      id: 'maternal-2',
      homologousPair: 2,
      isMaternal: true,
      centromerePosition: { x: centerX - baseOffset, y: centerY + 40 },
      arms: {
        short: {
          start: { x: centerX - baseOffset, y: centerY + 40 },
          end: { x: centerX - baseOffset, y: centerY }
        },
        long: {
          start: { x: centerX - baseOffset, y: centerY + 40 },
          end: { x: centerX - baseOffset, y: centerY + 100 }
        }
      },
      hasCrossedOver: false,
      crossingOverSegments: [],
      isVisible: true,
      opacity: 1
    },
    {
      id: 'paternal-2',
      homologousPair: 2,
      isMaternal: false,
      centromerePosition: { x: centerX + baseOffset, y: centerY + 40 },
      arms: {
        short: {
          start: { x: centerX + baseOffset, y: centerY + 40 },
          end: { x: centerX + baseOffset, y: centerY }
        },
        long: {
          start: { x: centerX + baseOffset, y: centerY + 40 },
          end: { x: centerX + baseOffset, y: centerY + 100 }
        }
      },
      hasCrossedOver: false,
      crossingOverSegments: [],
      isVisible: true,
      opacity: 1
    }
  ];
};

export const createInitialCell = (centerX: number, centerY: number, radius: number): Cell => ({
  id: 'parent-cell',
  position: { x: centerX, y: centerY },
  radius,
  isParent: true,
  isDaughter: false,
  isVisible: true
});

export const createDaughterCells = (
  parentCenterX: number,
  parentCenterY: number,
  radius: number
): Cell[] => [
  {
    id: 'daughter-1',
    position: { x: parentCenterX - radius * 1.2, y: parentCenterY },
    radius,
    isParent: false,
    isDaughter: true,
    isVisible: false
  },
  {
    id: 'daughter-2',
    position: { x: parentCenterX + radius * 1.2, y: parentCenterY },
    radius,
    isParent: false,
    isDaughter: true,
    isVisible: false
  }
];

export const createFourDaughterCells = (
  centerX: number,
  centerY: number,
  radius: number
): Cell[] => [
  {
    id: 'gamete-1',
    position: { x: centerX - radius * 1.5, y: centerY - radius * 1.2 },
    radius,
    isParent: false,
    isDaughter: true,
    isVisible: false
  },
  {
    id: 'gamete-2',
    position: { x: centerX + radius * 1.5, y: centerY - radius * 1.2 },
    radius,
    isParent: false,
    isDaughter: true,
    isVisible: false
  },
  {
    id: 'gamete-3',
    position: { x: centerX - radius * 1.5, y: centerY + radius * 1.2 },
    radius,
    isParent: false,
    isDaughter: true,
    isVisible: false
  },
  {
    id: 'gamete-4',
    position: { x: centerX + radius * 1.5, y: centerY + radius * 1.2 },
    radius,
    isParent: false,
    isDaughter: true,
    isVisible: false
  }
];

export const animateInterphase = (
  chromosomes: Chromosome[],
  progress: number,
  _centerX: number,
  _centerY: number
): { chromosomes: Chromosome[]; showReplication: boolean } => {
  const showReplication = progress > 0.5;
  
  if (showReplication) {
    const replicationProgress = (progress - 0.5) * 2;
    const easedReplication = easeOutCubic(replicationProgress);
    
    const replicatedChromosomes = chromosomes.flatMap((chr) => {
      const offsetX = Math.sin(easedReplication * Math.PI) * 5;
      const offsetY = Math.cos(easedReplication * Math.PI) * 3;
      
      const originalChr: Chromosome = {
        ...chr,
        centromerePosition: {
          x: chr.centromerePosition.x - offsetX,
          y: chr.centromerePosition.y - offsetY
        },
        arms: {
          short: {
            start: { x: chr.arms.short.start.x - offsetX, y: chr.arms.short.start.y - offsetY },
            end: { x: chr.arms.short.end.x - offsetX, y: chr.arms.short.end.y - offsetY }
          },
          long: {
            start: { x: chr.arms.long.start.x - offsetX, y: chr.arms.long.start.y - offsetY },
            end: { x: chr.arms.long.end.x - offsetX, y: chr.arms.long.end.y - offsetY }
          }
        },
        opacity: 1
      };
      
      const sisterChr: Chromosome = {
        ...chr,
        id: `${chr.id}-sister`,
        centromerePosition: {
          x: chr.centromerePosition.x + offsetX,
          y: chr.centromerePosition.y + offsetY
        },
        arms: {
          short: {
            start: { x: chr.arms.short.start.x + offsetX, y: chr.arms.short.start.y + offsetY },
            end: { x: chr.arms.short.end.x + offsetX, y: chr.arms.short.end.y + offsetY }
          },
          long: {
            start: { x: chr.arms.long.start.x + offsetX, y: chr.arms.long.start.y + offsetY },
            end: { x: chr.arms.long.end.x + offsetX, y: chr.arms.long.end.y + offsetY }
          }
        },
        opacity: easedReplication
      };
      
      return [originalChr, sisterChr];
    });
    
    return { chromosomes: replicatedChromosomes, showReplication: true };
  }
  
  return { chromosomes, showReplication: false };
};

export const animateProphase1 = (
  chromosomes: Chromosome[],
  progress: number,
  centerX: number,
  centerY: number
): { chromosomes: Chromosome[]; showSynapsis: boolean; showCrossingOver: boolean } => {
  
  let showSynapsis = false;
  let showCrossingOver = false;
  
  const synapsisStart = 0.2;
  const synapsisEnd = 0.5;
  const crossingOverStart = 0.5;
  const crossingOverEnd = 0.9;
  
  if (progress >= synapsisStart) {
    showSynapsis = true;
    const synapsisProgress = Math.min(1, (progress - synapsisStart) / (synapsisEnd - synapsisStart));
    const easedSynapsis = easeInOutQuad(synapsisProgress);
    
    const pairedChromosomes = chromosomes.reduce<Chromosome[]>((acc, chr, index) => {
      if (index % 2 === 0) {
        const homologousChr = chromosomes[index + 1];
        
        const pairCenterX = centerX + (chr.homologousPair - 1.5) * 60;
        const pairCenterY = centerY;
        
        const chr1Offset = -15 * (1 - easedSynapsis);
        const chr2Offset = 15 * (1 - easedSynapsis);
        
        const movedChr1: Chromosome = {
          ...chr,
          centromerePosition: {
            x: pairCenterX + chr1Offset,
            y: pairCenterY + (chr.id.includes('maternal') ? -20 : 20)
          },
          arms: {
            short: {
              start: { x: pairCenterX + chr1Offset, y: pairCenterY + (chr.id.includes('maternal') ? -20 : 20) },
              end: { x: pairCenterX + chr1Offset, y: pairCenterY + (chr.id.includes('maternal') ? -60 : -20) }
            },
            long: {
              start: { x: pairCenterX + chr1Offset, y: pairCenterY + (chr.id.includes('maternal') ? -20 : 20) },
              end: { x: pairCenterX + chr1Offset, y: pairCenterY + (chr.id.includes('maternal') ? 40 : 80) }
            }
          }
        };
        
        const movedChr2: Chromosome = {
          ...homologousChr,
          centromerePosition: {
            x: pairCenterX + chr2Offset,
            y: pairCenterY + (homologousChr.id.includes('maternal') ? -20 : 20)
          },
          arms: {
            short: {
              start: { x: pairCenterX + chr2Offset, y: pairCenterY + (homologousChr.id.includes('maternal') ? -20 : 20) },
              end: { x: pairCenterX + chr2Offset, y: pairCenterY + (homologousChr.id.includes('maternal') ? -60 : -20) }
            },
            long: {
              start: { x: pairCenterX + chr2Offset, y: pairCenterY + (homologousChr.id.includes('maternal') ? -20 : 20) },
              end: { x: pairCenterX + chr2Offset, y: pairCenterY + (homologousChr.id.includes('maternal') ? 40 : 80) }
            }
          }
        };
        
        acc.push(movedChr1, movedChr2);
      }
      return acc;
    }, []);
    
    if (progress >= crossingOverStart) {
      showCrossingOver = true;
      const crossingOverProgress = Math.min(1, (progress - crossingOverStart) / (crossingOverEnd - crossingOverStart));
      const easedCrossingOver = easeInOutQuad(crossingOverProgress);
      
      const crossingOverPair1 = easedCrossingOver > 0.5;
      const crossingOverPair2 = easedCrossingOver > 0.7;
      
      const chromosomesWithCrossingOver = pairedChromosomes.map((chr, index) => {
        const isPair1 = index < 4;
        const shouldCrossOver = isPair1 ? crossingOverPair1 : crossingOverPair2;
        
        if (shouldCrossOver && (index === 1 || index === 2)) {
          return {
            ...chr,
            hasCrossedOver: true,
            crossingOverSegments: [
              { start: 0.1, end: 0.3, isMaternal: !chr.isMaternal }
            ]
          };
        }
        return chr;
      });
      
      return { chromosomes: chromosomesWithCrossingOver, showSynapsis, showCrossingOver };
    }
    
    return { chromosomes: pairedChromosomes, showSynapsis, showCrossingOver };
  }
  
  return { chromosomes, showSynapsis: false, showCrossingOver: false };
};

export const animateMetaphase1 = (
  chromosomes: Chromosome[],
  progress: number,
  centerX: number,
  centerY: number
): { chromosomes: Chromosome[]; showEquatorialPlate: boolean; showSpindle: boolean } => {
  const easedProgress = easeInOutQuad(progress);
  
  const alignedChromosomes = chromosomes.map((chr, index) => {
    const pairIndex = Math.floor(index / 4);
    const pairOffset = (pairIndex - 0.5) * 80;
    
    const isMaternal = chr.isMaternal;
    const sideOffset = isMaternal ? -20 : 20;
    
    const targetX = centerX + sideOffset;
    const targetY = centerY + pairOffset;
    
    const currentX = interpolatePoint(
      chr.centromerePosition,
      { x: targetX, y: targetY },
      easedProgress
    );
    
    return {
      ...chr,
      centromerePosition: currentX,
      arms: {
        short: {
          start: currentX,
          end: { x: currentX.x, y: currentX.y - 40 }
        },
        long: {
          start: currentX,
          end: { x: currentX.x, y: currentX.y + 60 }
        }
      }
    };
  });
  
  return {
    chromosomes: alignedChromosomes,
    showEquatorialPlate: true,
    showSpindle: easedProgress > 0.3
  };
};

export const animateAnaphase1 = (
  chromosomes: Chromosome[],
  progress: number,
  _centerX: number,
  _centerY: number
): { chromosomes: Chromosome[]; showSeparating: boolean } => {
  const easedProgress = easeOutCubic(progress);
  
  const separatedChromosomes = chromosomes.map((chr) => {
    const isMaternal = chr.isMaternal;
    const direction = isMaternal ? -1 : 1;
    
    const moveDistance = easedProgress * 120;
    
    return {
      ...chr,
      centromerePosition: {
        x: chr.centromerePosition.x + direction * moveDistance,
        y: chr.centromerePosition.y
      },
      arms: {
        short: {
          start: { x: chr.centromerePosition.x + direction * moveDistance, y: chr.centromerePosition.y },
          end: { x: chr.centromerePosition.x + direction * moveDistance, y: chr.centromerePosition.y - 40 }
        },
        long: {
          start: { x: chr.centromerePosition.x + direction * moveDistance, y: chr.centromerePosition.y },
          end: { x: chr.centromerePosition.x + direction * moveDistance, y: chr.centromerePosition.y + 60 }
        }
      }
    };
  });
  
  return {
    chromosomes: separatedChromosomes,
    showSeparating: easedProgress > 0.1
  };
};

export const animateTelophase1 = (
  chromosomes: Chromosome[],
  progress: number,
  centerX: number,
  centerY: number
): { 
  chromosomes: Chromosome[]; 
  cells: { parent: Cell; daughter1: Cell; daughter2: Cell };
  showCytokinesis: boolean;
  chromosomeCount: number;
} => {
  const easedProgress = easeInOutQuad(progress);
  
  const parentCell: Cell = {
    id: 'parent-cell',
    position: { x: centerX, y: centerY },
    radius: 120 * (1 - easedProgress * 0.5),
    isParent: true,
    isDaughter: false,
    isVisible: easedProgress < 0.8
  };
  
  const daughterRadius = 80;
  const daughter1: Cell = {
    id: 'daughter-1',
    position: { 
      x: centerX - 120 * easedProgress, 
      y: centerY 
    },
    radius: daughterRadius * Math.min(1, easedProgress * 1.5),
    isParent: false,
    isDaughter: true,
    isVisible: easedProgress > 0.3
  };
  
  const daughter2: Cell = {
    id: 'daughter-2',
    position: { 
      x: centerX + 120 * easedProgress, 
      y: centerY 
    },
    radius: daughterRadius * Math.min(1, easedProgress * 1.5),
    isParent: false,
    isDaughter: true,
    isVisible: easedProgress > 0.3
  };
  
  const decondensedChromosomes = chromosomes.map((chr) => {
    const isMaternal = chr.isMaternal;
    const targetCellX = isMaternal ? centerX - 120 : centerX + 120;
    const moveProgress = Math.min(1, easedProgress * 1.2);
    
    const opacity = 1 - easedProgress * 0.7;
    
    return {
      ...chr,
      centromerePosition: {
        x: chr.centromerePosition.x + (targetCellX - chr.centromerePosition.x) * moveProgress,
        y: chr.centromerePosition.y
      },
      arms: {
        short: {
          start: { 
            x: chr.arms.short.start.x + (targetCellX - chr.arms.short.start.x) * moveProgress, 
            y: chr.arms.short.start.y 
          },
          end: { 
            x: chr.arms.short.end.x + (targetCellX - chr.arms.short.end.x) * moveProgress, 
            y: chr.arms.short.end.y 
          }
        },
        long: {
          start: { 
            x: chr.arms.long.start.x + (targetCellX - chr.arms.long.start.x) * moveProgress, 
            y: chr.arms.long.start.y 
          },
          end: { 
            x: chr.arms.long.end.x + (targetCellX - chr.arms.long.end.x) * moveProgress, 
            y: chr.arms.long.end.y 
          }
        }
      },
      opacity
    };
  });
  
  return {
    chromosomes: decondensedChromosomes,
    cells: { parent: parentCell, daughter1, daughter2 },
    showCytokinesis: easedProgress > 0.5,
    chromosomeCount: 2
  };
};

export const animateProphase2 = (
  chromosomes: Chromosome[],
  progress: number,
  centerX: number,
  centerY: number
): { chromosomes: Chromosome[]; showRecondensation: boolean } => {
  const easedProgress = easeInOutQuad(progress);
  
  const recondensedChromosomes = chromosomes.map((chr, index) => {
    const pairIndex = Math.floor(index / 4);
    const cellOffset = pairIndex === 0 ? -120 : 120;
    const isMaternal = chr.isMaternal;
    const sideOffset = isMaternal ? -15 : 15;
    
    const opacity = 0.3 + easedProgress * 0.7;
    
    return {
      ...chr,
      centromerePosition: {
        x: centerX + cellOffset + sideOffset,
        y: centerY + (index % 2 === 0 ? -20 : 20)
      },
      arms: {
        short: {
          start: { x: centerX + cellOffset + sideOffset, y: centerY + (index % 2 === 0 ? -20 : 20) },
          end: { x: centerX + cellOffset + sideOffset, y: centerY + (index % 2 === 0 ? -60 : -20) }
        },
        long: {
          start: { x: centerX + cellOffset + sideOffset, y: centerY + (index % 2 === 0 ? -20 : 20) },
          end: { x: centerX + cellOffset + sideOffset, y: centerY + (index % 2 === 0 ? 40 : 80) }
        }
      },
      opacity
    };
  });
  
  return {
    chromosomes: recondensedChromosomes,
    showRecondensation: easedProgress > 0.3
  };
};

export const animateMetaphase2 = (
  chromosomes: Chromosome[],
  _progress: number,
  centerX: number,
  centerY: number
): { chromosomes: Chromosome[]; showEquatorialPlate: boolean } => {
  const alignedChromosomes = chromosomes.map((chr, index) => {
    const pairIndex = Math.floor(index / 4);
    const cellOffset = pairIndex === 0 ? -120 : 120;
    const sideOffset = index % 2 === 0 ? -15 : 15;
    
    const targetX = centerX + cellOffset + sideOffset;
    const targetY = centerY;
    
    return {
      ...chr,
      centromerePosition: {
        x: targetX,
        y: targetY
      },
      arms: {
        short: {
          start: { x: targetX, y: targetY },
          end: { x: targetX, y: targetY - 40 }
        },
        long: {
          start: { x: targetX, y: targetY },
          end: { x: targetX, y: targetY + 60 }
        }
      }
    };
  });
  
  return {
    chromosomes: alignedChromosomes,
    showEquatorialPlate: true
  };
};

export const animateAnaphase2 = (
  chromosomes: Chromosome[],
  progress: number,
  _centerX: number,
  _centerY: number
): { chromosomes: Chromosome[]; showSeparating: boolean } => {
  const easedProgress = easeOutCubic(progress);
  
  const separatedChromosomes = chromosomes.map((chr, index) => {
    const isEven = index % 2 === 0;
    const direction = isEven ? -1 : 1;
    
    const moveDistance = easedProgress * 80;
    
    return {
      ...chr,
      centromerePosition: {
        x: chr.centromerePosition.x,
        y: chr.centromerePosition.y + direction * moveDistance
      },
      arms: {
        short: {
          start: { x: chr.centromerePosition.x, y: chr.centromerePosition.y + direction * moveDistance },
          end: { x: chr.centromerePosition.x, y: chr.centromerePosition.y + direction * moveDistance - 40 }
        },
        long: {
          start: { x: chr.centromerePosition.x, y: chr.centromerePosition.y + direction * moveDistance },
          end: { x: chr.centromerePosition.x, y: chr.centromerePosition.y + direction * moveDistance + 60 }
        }
      }
    };
  });
  
  return {
    chromosomes: separatedChromosomes,
    showSeparating: easedProgress > 0.1
  };
};

export const animateTelophase2 = (
  chromosomes: Chromosome[],
  progress: number,
  centerX: number,
  centerY: number
): { 
  chromosomes: Chromosome[]; 
  cells: Cell[];
  showGametes: boolean;
  chromosomeCount: number;
} => {
  const easedProgress = easeInOutQuad(progress);
  
  const gametePositions = [
    { x: centerX - 150, y: centerY - 100 },
    { x: centerX + 150, y: centerY - 100 },
    { x: centerX - 150, y: centerY + 100 },
    { x: centerX + 150, y: centerY + 100 }
  ];
  
  const gametes: Cell[] = gametePositions.map((pos, index) => ({
    id: `gamete-${index + 1}`,
    position: pos,
    radius: 60 * Math.min(1, easedProgress * 1.5),
    isParent: false,
    isDaughter: true,
    isVisible: easedProgress > 0.3
  }));
  
  const decondensedChromosomes = chromosomes.map((chr, index) => {
    const gameteIndex = Math.floor(index / 2);
    const targetPos = gametePositions[gameteIndex] || gametePositions[0];
    const moveProgress = Math.min(1, easedProgress * 1.2);
    
    const opacity = 1 - easedProgress * 0.8;
    
    return {
      ...chr,
      centromerePosition: {
        x: chr.centromerePosition.x + (targetPos.x - chr.centromerePosition.x) * moveProgress,
        y: chr.centromerePosition.y + (targetPos.y - chr.centromerePosition.y) * moveProgress
      },
      arms: {
        short: {
          start: { 
            x: chr.arms.short.start.x + (targetPos.x - chr.arms.short.start.x) * moveProgress, 
            y: chr.arms.short.start.y + (targetPos.y - chr.arms.short.start.y) * moveProgress 
          },
          end: { 
            x: chr.arms.short.end.x + (targetPos.x - chr.arms.short.end.x) * moveProgress, 
            y: chr.arms.short.end.y + (targetPos.y - chr.arms.short.end.y) * moveProgress 
          }
        },
        long: {
          start: { 
            x: chr.arms.long.start.x + (targetPos.x - chr.arms.long.start.x) * moveProgress, 
            y: chr.arms.long.start.y + (targetPos.y - chr.arms.long.start.y) * moveProgress 
          },
          end: { 
            x: chr.arms.long.end.x + (targetPos.x - chr.arms.long.end.x) * moveProgress, 
            y: chr.arms.long.end.y + (targetPos.y - chr.arms.long.end.y) * moveProgress 
          }
        }
      },
      opacity
    };
  });
  
  return {
    chromosomes: decondensedChromosomes,
    cells: gametes,
    showGametes: easedProgress > 0.5,
    chromosomeCount: 1
  };
};

export const getPhaseDuration = (phaseId: MeiosisPhaseId): number => {
  const phase = MEIOSIS_PHASES.find(p => p.id === phaseId);
  return phase?.duration || 3000;
};

export const getNextPhase = (currentPhaseId: MeiosisPhaseId): MeiosisPhaseId | null => {
  const currentIndex = MEIOSIS_PHASES.findIndex(p => p.id === currentPhaseId);
  if (currentIndex === -1 || currentIndex === MEIOSIS_PHASES.length - 1) {
    return null;
  }
  return MEIOSIS_PHASES[currentIndex + 1].id as MeiosisPhaseId;
};

export const getPreviousPhase = (currentPhaseId: MeiosisPhaseId): MeiosisPhaseId | null => {
  const currentIndex = MEIOSIS_PHASES.findIndex(p => p.id === currentPhaseId);
  if (currentIndex <= 0) {
    return null;
  }
  return MEIOSIS_PHASES[currentIndex - 1].id as MeiosisPhaseId;
};

export const getPhaseByIndex = (index: number): MeiosisPhaseId | null => {
  if (index >= 0 && index < MEIOSIS_PHASES.length) {
    return MEIOSIS_PHASES[index].id as MeiosisPhaseId;
  }
  return null;
};
