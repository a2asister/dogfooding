import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { clothingApi } from '../services/api';

const UploadContainer = styled(motion.div)`
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

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  margin: 8px 0;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  background: white;
`;

const Button = styled(motion.button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 14px 32px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 16px;
  width: 100%;
`;

const FileInput = styled.div`
  border: 2px dashed #667eea;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  margin: 10px 0;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(102, 126, 234, 0.05);
  }

  input {
    display: none;
  }
`;

const ColorPickerContainer = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 10px 0;
`;

const ColorDot = styled(motion.div)<{ color: string; selected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.color};
  cursor: pointer;
  border: 3px solid ${props => props.selected ? '#667eea' : 'transparent'};
`;

const colorOptions = [
  '#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#808080',
  '#FFC0CB', '#A52A2A', '#800000', '#008000', '#000080',
];

const ClothingUpload: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('上衣');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('colors', JSON.stringify(selectedColors));
    formData.append('image', image);

    await clothingApi.create(formData);
    onSuccess();
    setName('');
    setCategory('上衣');
    setSelectedColors([]);
    setImage(null);
  };

  return (
    <UploadContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Title>上传衣物</Title>
      <form onSubmit={handleSubmit}>
        <Input
          placeholder="衣物名称"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <Select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="上衣">上衣</option>
          <option value="裤子">裤子</option>
          <option value="裙子">裙子</option>
          <option value="外套">外套</option>
          <option value="鞋子">鞋子</option>
          <option value="配饰">配饰</option>
        </Select>
        <FileInput>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files?.[0] || null)}
            id="file-upload"
          />
          <label htmlFor="file-upload">
            {image ? image.name : '点击上传图片'}
          </label>
        </FileInput>
        <div style={{ margin: '10px 0', color: '#666' }}>选择颜色：</div>
        <ColorPickerContainer>
          {colorOptions.map(color => (
            <ColorDot
              key={color}
              color={color}
              selected={selectedColors.includes(color)}
              onClick={() => toggleColor(color)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            />
          ))}
        </ColorPickerContainer>
        <Button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          上传
        </Button>
      </form>
    </UploadContainer>
  );
};

export default ClothingUpload;
