import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { CROPS, ITEM_INFO, ITEM_PRICES } from '../config/gameConfig';
import type { ItemType, CropType } from '../types';
import './Shop.css';

type ShopCategory = 'seeds' | 'items';

const Shop: React.FC = () => {
  const { state, buyItem, buySeed } = useGameContext();
  const { player } = state;
  const [activeCategory, setActiveCategory] = useState<ShopCategory>('seeds');
  const [showBuySuccess, setShowBuySuccess] = useState<string | null>(null);

  const handleBuySeed = (cropType: CropType) => {
    const crop = CROPS[cropType];
    if (!crop) return;

    if (player.gold >= crop.purchasePrice) {
      buySeed(cropType, crop.purchasePrice);
      setShowBuySuccess(`成功购买 ${crop.name} 种子！`);
      setTimeout(() => setShowBuySuccess(null), 2000);
    }
  };

  const handleBuyItem = (itemType: ItemType) => {
    const price = ITEM_PRICES[itemType];
    if (!price) return;

    if (player.gold >= price) {
      buyItem(itemType, price);
      setShowBuySuccess(`成功购买 ${ITEM_INFO[itemType].name}！`);
      setTimeout(() => setShowBuySuccess(null), 2000);
    }
  };

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h2>🛒 道具商城</h2>
        <div className="gold-display">
          <span className="gold-icon">💰</span>
          <span className="gold-value">{player.gold}</span>
        </div>
      </div>

      <div className="category-tabs">
        <button
          className={`category-tab ${activeCategory === 'seeds' ? 'active' : ''}`}
          onClick={() => setActiveCategory('seeds')}
        >
          🌱 种子
        </button>
        <button
          className={`category-tab ${activeCategory === 'items' ? 'active' : ''}`}
          onClick={() => setActiveCategory('items')}
        >
          📦 道具
        </button>
      </div>

      {showBuySuccess && (
        <div className="buy-success">
          <span className="success-icon">✅</span>
          <span className="success-text">{showBuySuccess}</span>
        </div>
      )}

      <div className="shop-content">
        {activeCategory === 'seeds' && (
          <div className="seeds-list">
            {Object.entries(CROPS).map(([key, crop]) => {
              const canAfford = player.gold >= crop.purchasePrice;

              return (
                <div key={key} className="shop-item seed-item">
                  <div className="item-info">
                    <span className="item-emoji">{crop.emoji}</span>
                    <div className="item-details">
                      <span className="item-name">{crop.name}</span>
                      <div className="item-stats">
                        <span className="stat">⏱️ {Math.floor(crop.growthTime / 60)}分钟</span>
                        <span className="stat">💵 售价:{crop.sellPrice}</span>
                        <span className="stat">⭐ +{crop.experience}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    className={`buy-btn ${!canAfford ? 'disabled' : ''}`}
                    onClick={() => handleBuySeed(key as CropType)}
                    disabled={!canAfford}
                  >
                    <span className="buy-price">💰 {crop.purchasePrice}</span>
                    <span className="buy-text">购买</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {activeCategory === 'items' && (
          <div className="items-list">
            {Object.entries(ITEM_INFO).map(([key, item]) => {
              const itemType = key as ItemType;
              const price = ITEM_PRICES[itemType];
              if (!price) return null;

              const canAfford = player.gold >= price;
              const owned = player.items[itemType];

              return (
                <div key={key} className="shop-item item-item">
                  <div className="item-info">
                    <span className="item-emoji">{item.emoji}</span>
                    <div className="item-details">
                      <span className="item-name">{item.name}</span>
                      <span className="item-desc">{item.description}</span>
                      <span className="item-owned">已拥有: {owned}</span>
                    </div>
                  </div>
                  <button
                    className={`buy-btn ${!canAfford ? 'disabled' : ''}`}
                    onClick={() => handleBuyItem(itemType)}
                    disabled={!canAfford}
                  >
                    <span className="buy-price">💰 {price}</span>
                    <span className="buy-text">购买</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;