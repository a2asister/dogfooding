import { useState, useCallback, useRef } from 'react';
import { useMutation, useLazyQuery, useQuery } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ColorPalette, PaletteMode, Palette } from './types';
import {
  EXTRACT_COLORS_FROM_IMAGE,
  GENERATE_EMOTIONAL_PALETTE,
  GENERATE_COMPLEMENTARY_PALETTE,
  GENERATE_ANALOGOUS_PALETTE,
  GENERATE_TRIADIC_PALETTE,
  SAVE_PALETTE,
  GET_SAVED_PALETTES,
  DELETE_PALETTE,
} from './graphql/queries';
import ColorBlock from './components/ColorBlock';
import ConnectionLines from './components/ConnectionLines';
import PixelDissolveAnimation from './components/PixelDissolveAnimation';
import TypewriterExport from './components/TypewriterExport';

const emotions = [
  { id: 'happy', name: '快乐', emoji: '😊' },
  { id: 'calm', name: '平静', emoji: '😌' },
  { id: 'energetic', name: '活力', emoji: '⚡' },
  { id: 'professional', name: '专业', emoji: '💼' },
  { id: 'romantic', name: '浪漫', emoji: '💕' },
  { id: 'nature', name: '自然', emoji: '🌿' },
];

const modes: { id: PaletteMode; name: string; icon: string }[] = [
  { id: 'image', name: '图片提取', icon: '🖼️' },
  { id: 'emotion', name: '情感配色', icon: '💭' },
  { id: 'complementary', name: '互补色', icon: '🔄' },
  { id: 'analogous', name: '邻近色', icon: '📊' },
  { id: 'triadic', name: '三角色', icon: '🔺' },
];

function App() {
  const [mode, setMode] = useState<PaletteMode>('image');
  const [palette, setPalette] = useState<ColorPalette | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [baseColor, setBaseColor] = useState('#667eea');
  const [isDragging, setIsDragging] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [extractColors] = useMutation(EXTRACT_COLORS_FROM_IMAGE);
  const [generateEmotional] = useLazyQuery(GENERATE_EMOTIONAL_PALETTE);
  const [generateComplementary] = useLazyQuery(GENERATE_COMPLEMENTARY_PALETTE);
  const [generateAnalogous] = useLazyQuery(GENERATE_ANALOGOUS_PALETTE);
  const [generateTriadic] = useLazyQuery(GENERATE_TRIADIC_PALETTE);
  const [savePaletteMutation] = useMutation(SAVE_PALETTE);
  const { data: savedPalettesData, refetch: refetchPalettes } = useQuery(GET_SAVED_PALETTES);
  const [deletePaletteMutation] = useMutation(DELETE_PALETTE);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Image = e.target?.result as string;
      setUploadedImage(base64Image);

      try {
        setIsAnimating(true);
        const result = await extractColors({
          variables: { base64Image, colorCount: 5 },
        });

        if (result.data?.extractColorsFromImage) {
          setTimeout(() => {
            setPalette({
              colors: result.data.extractColorsFromImage.colors,
              name: '图片提取配色',
              type: 'image',
              relationships: [],
            });
            setIsAnimating(false);
          }, 1500);
        }
      } catch (error) {
        console.error('Error extracting colors:', error);
        setIsAnimating(false);
      }
    };
    reader.readAsDataURL(file);
  }, [extractColors]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleEmotionSelect = useCallback(async (emotion: string) => {
    try {
      setIsAnimating(true);
      const result = await generateEmotional({ variables: { emotion } });
      if (result.data?.generateEmotionalPalette) {
        setTimeout(() => {
          setPalette(result.data.generateEmotionalPalette);
          setIsAnimating(false);
        }, 800);
      }
    } catch (error) {
      console.error('Error generating palette:', error);
      setIsAnimating(false);
    }
  }, [generateEmotional]);

  const handleBaseColorChange = useCallback(async (color: string) => {
    setBaseColor(color);
    let queryFn;
    switch (mode) {
      case 'complementary':
        queryFn = generateComplementary;
        break;
      case 'analogous':
        queryFn = generateAnalogous;
        break;
      case 'triadic':
        queryFn = generateTriadic;
        break;
      default:
        return;
    }

    try {
      const result = await queryFn({ variables: { baseColor: color } });
      if (result.data) {
        const key = `generate${mode.charAt(0).toUpperCase() + mode.slice(1)}Palette`;
        if (result.data[key]) {
          setPalette(result.data[key]);
        }
      }
    } catch (error) {
      console.error('Error generating palette:', error);
    }
  }, [mode, generateComplementary, generateAnalogous, generateTriadic]);

  const handleModeChange = useCallback((newMode: PaletteMode) => {
    setMode(newMode);
    setPalette(null);
    setShowExport(false);
    setUploadedImage(null);
  }, [mode, palette]);

  const handleSavePalette = useCallback(async () => {
    if (!palette || !saveName) return;
    try {
      await savePaletteMutation({
        variables: {
          input: {
            name: saveName,
            colors: palette.colors.map(c => c.hex),
            type: palette.type,
          },
        },
      });
      setSaveName('');
      refetchPalettes();
    } catch (error) {
      console.error('Error saving palette:', error);
    }
  }, [palette, saveName, savePaletteMutation, refetchPalettes]);

  const handleDeletePalette = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deletePaletteMutation({ variables: { id } });
      refetchPalettes();
    } catch (error) {
      console.error('Error deleting palette:', error);
    }
  }, [deletePaletteMutation, refetchPalettes]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>🎨 AI 智能配色方案生成器</h1>
        <p style={{ marginTop: '10px', opacity: 0.7 }}>
          从图片提取色彩或基于情感生成专业配色方案
        </p>
      </header>

      <div className="mode-selector">
        {modes.map((m) => (
          <button
            key={m.id}
            className={`mode-btn ${mode === m.id ? 'active' : ''}`}
            onClick={() => handleModeChange(m.id)}
          >
            {m.icon} {m.name}
          </button>
        ))}
      </div>

      {mode === 'image' && (
        <>
          {!uploadedImage ? (
            <div
              className={`upload-area ${isDragging ? 'dragging' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">📷</div>
              <p>拖拽图片到这里或点击上传</p>
              <p style={{ fontSize: '14px', opacity: 0.6, marginTop: '10px' }}>
                支持 JPG、PNG、WEBP 格式
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
            </div>
          ) : (
            <motion.div
              className="image-preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img src={uploadedImage} alt="Uploaded" />
            </motion.div>
          )}
        </>
      )}

      {mode === 'emotion' && (
        <div className="emotion-selector">
          {emotions.map((emotion) => (
            <button
              key={emotion.id}
              className={`emotion-btn emotion-${emotion.id}`}
              onClick={() => handleEmotionSelect(emotion.id)}
            >
              {emotion.emoji} {emotion.name}
            </button>
          ))}
        </div>
      )}

      {(mode === 'complementary' || mode === 'analogous' || mode === 'triadic') && (
        <div className="color-picker-section">
          <div className="color-input-wrapper">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => handleBaseColorChange(e.target.value)}
            />
          </div>
          <div className="color-value">{baseColor.toUpperCase()}</div>
        </div>
      )}

      {isAnimating && (
        <div className="loading">
          <div className="spinner"></div>
          <p>正在提取色彩...</p>
        </div>
      )}

      {palette && !isAnimating && (
        <motion.div
          className="palette-container"
          ref={containerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="palette-title">{palette.name}</h2>

          {mode === 'image' && uploadedImage && (
            <PixelDissolveAnimation
              colors={palette.colors}
              imageUrl={uploadedImage}
            />
          )}

          <div className="color-blocks">
            <ConnectionLines
              colors={palette.colors}
              relationships={palette.relationships || []}
            />
            
            {palette.colors.map((color, index) => (
              <ColorBlock
                key={color.hex}
                color={color}
                index={index}
                onClick={() => copyToClipboard(color.hex)}
              />
            ))}
          </div>

          <div className="save-section">
            <input
              type="text"
              className="save-input"
              placeholder="输入配色方案名称..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
            />
            <button className="save-btn" onClick={handleSavePalette}>
              💾 保存配色
            </button>
          </div>

          <div className="export-section">
            <button className="export-btn" onClick={() => setShowExport(!showExport)}>
              📋 {showExport ? '隐藏' : '导出'}色值代码
            </button>

            <AnimatePresence>
              {showExport && (
                <TypewriterExport colors={palette.colors} />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {savedPalettesData?.getSavedPalettes?.length > 0 && (
        <div className="saved-palettes">
          <h3>📁 已保存的配色方案</h3>
          <div className="palette-grid">
            {savedPalettesData.getSavedPalettes.map((palette: Palette) => (
              <motion.div
                key={palette.id}
                className="palette-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
              >
                <button
                  className="delete-palette-btn"
                  onClick={(e) => handleDeletePalette(palette.id, e)}
                >
                  ×
                </button>
                <div className="palette-card-colors">
                  {palette.colors.map((color, i) => (
                    <div
                      key={i}
                      className="palette-card-color"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="palette-card-name">{palette.name}</div>
                <div className="palette-card-date">
                  {new Date(palette.createdAt).toLocaleDateString('zh-CN')}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
