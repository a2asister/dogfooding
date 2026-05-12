import { motion } from 'framer-motion';
import { Color } from '../types';

interface ColorBlockProps {
  color: Color;
  index: number;
  onClick: () => void;
}

const ColorBlock = ({ color, index, onClick }: ColorBlockProps) => {
  return (
    <motion.div
      className="color-block"
      style={{ backgroundColor: color.hex }}
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        type: 'spring',
        stiffness: 100,
      }}
      whileHover={{
        scale: 1.1,
        y: -15,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <motion.div
        className="color-info"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.15 + 0.4 }}
      >
        <div className="color-hex">{color.hex}</div>
        <div>RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})</div>
      </motion.div>
    </motion.div>
  );
};

export default ColorBlock;
