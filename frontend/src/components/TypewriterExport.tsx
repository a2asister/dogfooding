import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Color } from '../types';

interface TypewriterExportProps {
  colors: Color[];
}

const TypewriterExport = ({ colors }: TypewriterExportProps) => {
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);

  useEffect(() => {
    setVisibleIndices([]);
    colors.forEach((_, index) => {
      setTimeout(() => {
        setVisibleIndices(prev => [...prev, index]);
      }, index * 200);
    });
  }, [colors]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <motion.div
      className="export-codes"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4 }}
    >
      {colors.map((color, index) => (
        <motion.div
          key={color.hex}
          className="code-line"
          initial={{ opacity: 0, x: -20 }}
          animate={visibleIndices.includes(index) ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          onClick={() => copyToClipboard(color.hex)}
          style={{ cursor: 'pointer' }}
        >
          <span
            className="code-color"
            style={{
              backgroundColor: color.hex,
              boxShadow: `0 0 15px ${color.hex}`,
            }}
          />
          <span className="code-text">
            <motion.span
              initial={{ width: 0 }}
              animate={visibleIndices.includes(index) ? { width: 'auto' } : {}}
              transition={{ duration: 0.5 }}
              style={{ display: 'inline-block', overflow: 'hidden' }}
            >
              {color.hex}
            </motion.span>
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', opacity: 0.6 }}>
            点击复制
          </span>
        </motion.div>
      ))}

      <motion.div
        style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: colors.length * 0.2 }}
      >
        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>CSS 变量:</div>
        <motion.div
          className="code-line"
          style={{ fontFamily: 'monospace', fontSize: '14px' }}
        >
          <code style={{ color: '#4ecdc4' }}>
            :root {'{'}
            <br />
            {colors.map((c, i) => (
              <span key={c.hex}>
                {'  '}--color-{i + 1}: {c.hex.toLowerCase()};
                <br />
              </span>
            ))}
            {'}'}
          </code>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default TypewriterExport;
