import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Clothing } from '../types';
import { outfitApi } from '../services/api';

const CreatorContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  margin: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  margin: 8px 0;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  transition: border-color 0.3s;

  &:focus {
    border-color: #667eea;
  }
`;

const ClothingList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  margin: 16px 0;
  max-height: 250px;
  overflow-y: auto;
`;

const ClothingThumbnail = styled(motion.div)<{ selected: boolean; color: string }>`
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 1;
  border: 3px solid ${props => props.selected ? '#667eea' : 'transparent'};
  box-shadow: ${props => props.selected ? `0 4px 15px ${props.color}60` : 'none'};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Button = styled(motion.button)<{ disabled?: boolean }>`
  background: ${props => props.disabled ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  padding: 14px 32px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 16px;
  width: 100%;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
`;

const ErrorMessage = styled.div`
  color: #ff4757;
  font-size: 14px;
  margin: 8px 0;
  text-align: center;
`;

const TagsInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
  align-items: center;
`;

const TagItem = styled(motion.span)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;

  button {
    background: none;
    color: white;
    font-size: 16px;
    padding: 0;
  }
`;

const MiniInput = styled.input`
  flex: 1;
  min-width: 80px;
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  font-size: 14px;
`;

interface OutfitCreatorProps {
  clothingItems: Clothing[];
  onSuccess: () => void;
}

const OutfitCreator: React.FC<OutfitCreatorProps> = ({ clothingItems, onSuccess }) => {
  const [name, setName] = useState('');
  const [selectedClothing, setSelectedClothing] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleClothing = (id: string) => {
    setSelectedClothing(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('请输入穿搭名称');
      return;
    }

    if (selectedClothing.length === 0) {
      setError('请至少选择一件衣物');
      return;
    }

    try {
      setLoading(true);
      await outfitApi.create({
        name: name.trim(),
        clothingIds: selectedClothing,
        tags,
      });

      onSuccess();
      setName('');
      setSelectedClothing([]);
      setTags([]);
    } catch (err) {
      console.error('创建穿搭失败:', err);
      setError('创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CreatorContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Title>创建穿搭</Title>
      <form onSubmit={handleSubmit}>
        <Input
          placeholder="穿搭名称"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <div style={{ margin: '12px 0', color: '#666' }}>
          选择衣物（点击选择）：
        </div>
        <ClothingList>
          <AnimatePresence>
            {clothingItems.map(item => (
              <ClothingThumbnail
                key={item.id}
                selected={selectedClothing.includes(item.id)}
                color={item.colors[0] || '#667eea'}
                onClick={() => toggleClothing(item.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <img src={item.imagePath} alt={item.name} />
              </ClothingThumbnail>
            ))}
          </AnimatePresence>
        </ClothingList>
        <div style={{ margin: '12px 0', color: '#666' }}>
          添加标签（按回车确认）：
        </div>
        <TagsInput>
          {tags.map(tag => (
            <TagItem
              key={tag}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              {tag}
              <button type="button" onClick={() => removeTag(tag)}>
                ×
              </button>
            </TagItem>
          ))}
          <MiniInput
            placeholder="添加标签..."
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={addTag}
          />
        </TagsInput>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button
          type="submit"
          disabled={loading || !name.trim() || selectedClothing.length === 0}
          whileHover={!loading && !(!name.trim() || selectedClothing.length === 0) ? { scale: 1.02 } : {}}
          whileTap={!loading && !(!name.trim() || selectedClothing.length === 0) ? { scale: 0.98 } : {}}
        >
          {loading ? '创建中...' : '创建穿搭'}
        </Button>
      </form>
    </CreatorContainer>
  );
};

export default OutfitCreator;
