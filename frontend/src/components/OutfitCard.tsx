import React, { useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Outfit } from '../types';

const getContrastColor = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

interface CardContainerProps {
  colors: string[];
}

const CardContainer = styled(motion.div)<CardContainerProps>`
  background: rgba(255, 255, 255, 0.98);
  border-radius: 28px;
  padding: 28px;
  margin: 20px 60px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: visible;
  backdrop-filter: blur(20px);

  &::before {
    content: '';
    position: absolute;
    top: -30px;
    left: -30px;
    right: -30px;
    bottom: -30px;
    background: radial-gradient(
      ellipse at 20% 20%,
      ${props => props.colors[0] || '#667eea'}60,
      transparent 60%
    ),
    radial-gradient(
      ellipse at 80% 80%,
      ${props => props.colors[1] || props.colors[0] || '#764ba2'}60,
      transparent 60%
    ),
    radial-gradient(
      ellipse at 50% 50%,
      ${props => props.colors[2] || props.colors[0] || '#f093fb'}30,
      transparent 70%
    );
    filter: blur(40px);
    opacity: 0.7;
    z-index: -1;
    animation: breathe 4s ease-in-out infinite;
  }

  @keyframes breathe {
    0%, 100% {
      transform: scale(1);
      opacity: 0.7;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.9;
    }
  }

  @media (max-width: 768px) {
    margin: 20px;
    padding: 20px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
`;

const OutfitName = styled(motion.h3)`
  color: #1a1a2e;
  font-size: 26px;
  font-weight: 800;
  background: linear-gradient(135deg, #1a1a2e, #4a4a6a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

interface FavoriteButtonProps {
  isFavorite: boolean;
}

const FavoriteButton = styled(motion.button)<FavoriteButtonProps>`
  background: ${props => props.isFavorite 
    ? 'linear-gradient(135deg, #ff6b6b, #ee5a5a)' 
    : 'linear-gradient(135deg, #f0f0f0, #e0e0e0)'};
  color: ${props => props.isFavorite ? 'white' : '#999'};
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  border: none;
  cursor: pointer;
  box-shadow: ${props => props.isFavorite 
    ? '0 4px 15px rgba(255, 107, 107, 0.4)' 
    : '0 2px 8px rgba(0, 0, 0, 0.1)'};
`;

const ClothingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
    gap: 12px;
  }
`;

interface ClothingItemProps {
  color: string;
}

const ClothingItem = styled(motion.div)<ClothingItemProps>`
  border-radius: 18px;
  overflow: hidden;
  position: relative;
  aspect-ratio: 1;
  box-shadow: 0 8px 25px ${props => props.color}50;
  background: linear-gradient(135deg, ${props => props.color}30, ${props => props.color}10);

  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 20px;
    background: linear-gradient(135deg, ${props => props.color}80, transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }

  &:hover::after {
    opacity: 1;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.08);
  }
`;

interface ColorDotProps {
  color: string;
  index: number;
}

const ColorDot = styled(motion.div)<ColorDotProps>`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.color};
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 2;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  position: relative;
  z-index: 1;
  min-height: 40px;
`;

interface TagProps {
  color?: string;
}

const Tag = styled(motion.span)<TagProps>`
  background: ${props => props.color 
    ? `linear-gradient(135deg, ${props.color}dd, ${props.color}aa)`
    : 'linear-gradient(135deg, #667eea, #764ba2)'};
  color: ${props => props.color ? getContrastColor(props.color) : 'white'};
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: ${props => props.color 
    ? `0 4px 12px ${props.color}40`
    : '0 4px 12px rgba(102, 126, 234, 0.3)'};
  letter-spacing: 0.3px;
`;

const DeleteButton = styled(motion.button)`
  background: linear-gradient(135deg, #ff4757, #c0392b);
  color: white;
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  box-shadow: 0 4px 15px rgba(255, 71, 87, 0.3);
  width: 100%;
`;

const ColorsPalette = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: rgba(240, 240, 240, 0.5);
  border-radius: 16px;
  align-items: center;
`;

const PaletteLabel = styled.span`
  font-size: 13px;
  color: #666;
  font-weight: 600;
  margin-right: 8px;
`;

const PaletteColor = styled(motion.div)<{ color: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${props => props.color};
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

interface OutfitCardProps {
  outfit: Outfit;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onDragEnd?: (event: any, info: { offset: { x: number } }) => void;
  direction?: number;
}

const OutfitCard: React.FC<OutfitCardProps> = ({ 
  outfit, 
  onToggleFavorite, 
  onDelete, 
  onDragEnd,
  direction = 0 
}) => {
  const allColors = useMemo(() => {
    const colors = outfit.clothingItems.flatMap(item => item.colors);
    return [...new Set(colors)].slice(0, 5);
  }, [outfit.clothingItems]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  const tagVariants = {
    hidden: { opacity: 0, scale: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    }),
  };

  return (
    <CardContainer
      colors={allColors}
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={onDragEnd}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <Header>
        <OutfitName
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {outfit.name}
        </OutfitName>
        <FavoriteButton
          isFavorite={outfit.isFavorite}
          onClick={() => onToggleFavorite(outfit.id)}
          whileHover={{ scale: 1.15, rotate: 10 }}
          whileTap={{ scale: 0.85 }}
          animate={{
            scale: outfit.isFavorite ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.4 }}
        >
          {outfit.isFavorite ? '❤️' : '🤍'}
        </FavoriteButton>
      </Header>

      {allColors.length > 0 && (
        <ColorsPalette>
          <PaletteLabel>🎨 配色方案:</PaletteLabel>
          {allColors.map((color, index) => (
            <PaletteColor
              key={color}
              color={color}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.1, type: 'spring' }}
              whileHover={{ scale: 1.3, y: -3 }}
            />
          ))}
        </ColorsPalette>
      )}

      <ClothingGrid>
        {outfit.clothingItems.map((item, index) => (
          <ClothingItem
            key={item.id}
            color={item.colors[0] || '#667eea'}
            initial={{ opacity: 0, scale: 0.6, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              delay: index * 0.12, 
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            whileHover={{ y: -8, scale: 1.05 }}
          >
            {item.colors[0] && (
              <ColorDot
                color={item.colors[0]}
                index={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.12 + 0.3 }}
              />
            )}
            <img src={item.imagePath} alt={item.name} loading="lazy" />
          </ClothingItem>
        ))}
      </ClothingGrid>

      <TagsContainer>
        {outfit.tags.map((tag, index) => (
          <Tag
            key={tag}
            color={allColors[index % allColors.length]}
            custom={index}
            variants={tagVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.15, y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            #{tag}
          </Tag>
        ))}
      </TagsContainer>

      <DeleteButton
        onClick={() => onDelete(outfit.id)}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        🗑️ 删除穿搭
      </DeleteButton>
    </CardContainer>
  );
};

export default OutfitCard;
