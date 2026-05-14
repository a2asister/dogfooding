import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Clothing, Outfit } from './types';
import { clothingApi, outfitApi } from './services/api';
import ClothingUpload from './components/ClothingUpload';
import OutfitCreator from './components/OutfitCreator';
import OutfitCard from './components/OutfitCard';

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled(motion.header)`
  text-align: center;
  padding: 40px 20px;
`;

const Title = styled.h1`
  color: white;
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 10px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const Tab = styled(motion.button)<{ active: boolean }>`
  background: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.2)'};
  color: ${props => props.active ? '#333' : 'white'};
  padding: 12px 28px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
`;

const ContentArea = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const OutfitsContainer = styled.div`
  grid-column: 1 / -1;
  position: relative;
`;

const EmptyState = styled(motion.div)`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 60px 40px;
  margin: 20px;
  text-align: center;
  color: #666;
`;

const CarouselWrapper = styled.div`
  position: relative;
  overflow: hidden;
  padding: 20px 0;
`;

const NavButton = styled(motion.button)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  font-size: 24px;
  color: #667eea;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  &:hover {
    background: white;
    transform: translateY(-50%) scale(1.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const PrevButton = styled(NavButton)`
  left: 10px;
`;

const NextButton = styled(NavButton)`
  right: 10px;
`;

const PaginationDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
`;

const Dot = styled(motion.button)<{ active: boolean }>`
  width: ${props => props.active ? '30px' : '12px'};
  height: 12px;
  border-radius: 6px;
  background: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.4)'};
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const SwipeHint = styled(motion.div)`
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const App: React.FC = () => {
  const [clothingItems, setClothingItems] = useState<Clothing[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'create'>('upload');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showHint, setShowHint] = useState(true);

  const fetchData = async () => {
    const [clothingRes, outfitsRes] = await Promise.all([
      clothingApi.getAll(),
      outfitApi.getAll(),
    ]);
    setClothingItems(clothingRes.data);
    setOutfits(outfitsRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const toggleFavorite = async (id: string) => {
    const outfit = outfits.find(o => o.id === id);
    if (outfit) {
      await outfitApi.update(id, { isFavorite: !outfit.isFavorite });
      fetchData();
    }
  };

  const deleteOutfit = async (id: string) => {
    await outfitApi.delete(id);
    fetchData();
  };

  const goToNext = useCallback(() => {
    if (currentIndex < outfits.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, outfits.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  const handleCardDragEnd = (_event: any, info: { offset: { x: number } }) => {
    if (info.offset.x > 100 && currentIndex < outfits.length - 1) {
      goToNext();
    } else if (info.offset.x < -100 && currentIndex > 0) {
      goToPrev();
    }
  };

  return (
    <AppContainer>
      <Header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>🎨 穿搭配色智能预览</Title>
        <Subtitle>上传衣物，创建你的专属穿搭</Subtitle>
      </Header>

      <TabContainer>
        <Tab
          active={activeTab === 'upload'}
          onClick={() => setActiveTab('upload')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          上传衣物
        </Tab>
        <Tab
          active={activeTab === 'create'}
          onClick={() => setActiveTab('create')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          创建穿搭
        </Tab>
      </TabContainer>

      <ContentArea>
        <AnimatePresence mode="wait">
          {activeTab === 'upload' && (
            <ClothingUpload key="upload" onSuccess={fetchData} />
          )}
          {activeTab === 'create' && (
            <OutfitCreator
              key="create"
              clothingItems={clothingItems}
              onSuccess={fetchData}
            />
          )}
        </AnimatePresence>
      </ContentArea>

      <OutfitsContainer>
        {outfits.length === 0 ? (
          <EmptyState
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3>还没有穿搭</h3>
            <p>上传一些衣物，然后创建你的第一个穿搭吧！</p>
          </EmptyState>
        ) : (
          <CarouselWrapper>
            <AnimatePresence initial={false}>
              <SwipeHint
                key="hint"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: showHint ? 1 : 0, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span>👈</span> 左右滑动卡片切换穿搭 <span>👉</span>
              </SwipeHint>
            </AnimatePresence>
            
            {outfits.length > 1 && (
              <>
                <PrevButton
                  onClick={goToPrev}
                  disabled={currentIndex === 0}
                  whileHover={{ scale: currentIndex === 0 ? 1 : 1.1 }}
                  whileTap={{ scale: currentIndex === 0 ? 1 : 0.95 }}
                >
                  ‹
                </PrevButton>
                <NextButton
                  onClick={goToNext}
                  disabled={currentIndex === outfits.length - 1}
                  whileHover={{ scale: currentIndex === outfits.length - 1 ? 1 : 1.1 }}
                  whileTap={{ scale: currentIndex === outfits.length - 1 ? 1 : 0.95 }}
                >
                  ›
                </NextButton>
              </>
            )}

            <AnimatePresence mode="wait">
              <OutfitCard
                key={outfits[currentIndex]?.id}
                outfit={outfits[currentIndex]}
                onToggleFavorite={toggleFavorite}
                onDelete={deleteOutfit}
                onDragEnd={handleCardDragEnd}
                direction={direction}
              />
            </AnimatePresence>

            <PaginationDots>
              {outfits.map((_, index) => (
                <Dot
                  key={index}
                  active={index === currentIndex}
                  onClick={() => goToSlide(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    width: index === currentIndex ? 30 : 12,
                    backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.4)',
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </PaginationDots>

            <div style={{ textAlign: 'center', color: 'white', marginTop: '15px', fontSize: '14px' }}>
              {currentIndex + 1} / {outfits.length}
            </div>
          </CarouselWrapper>
        )}
      </OutfitsContainer>
    </AppContainer>
  );
};

export default App;
