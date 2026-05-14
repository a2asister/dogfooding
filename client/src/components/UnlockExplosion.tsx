import { motion } from 'framer-motion';

export function UnlockExplosion({ trigger }: { trigger: boolean }) {
  if (!trigger) return null;

  const rings = [
    { size: 50, color: '#ffd700', delay: 0 },
    { size: 80, color: '#ffaa00', delay: 0.1 },
    { size: 110, color: '#ff8800', delay: 0.2 },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      {rings.map((ring, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.8, delay: ring.delay, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: ring.size,
            height: ring.size,
            borderRadius: '50%',
            border: `4px solid ${ring.color}`,
            boxShadow: `0 0 20px ${ring.color}`,
          }}
        />
      ))}
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1.5, rotate: 360 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          fontSize: '4rem',
        }}
      >
        🎉
      </motion.div>
    </div>
  );
}
