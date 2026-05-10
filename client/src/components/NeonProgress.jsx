export default function NeonProgress(props) {
  const progress = () => Math.max(0, Math.min(100, props.progress || 0));
  
  return (
    <div class="neon-progress" style={{ height: props.height || '12px' }}>
      <div 
        class="neon-progress-bar"
        style={{
          width: `${progress()}%`,
          'background': progress() > 80
            ? `linear-gradient(
                90deg,
                #ff4444 0%,
                #ff6666 25%,
                #ff3333 50%,
                #ff6666 75%,
                #ff4444 100%
              )`
            : `linear-gradient(
                90deg,
                #00f7ff 0%,
                #00ccff 25%,
                #0099ff 50%,
                #00ccff 75%,
                #00f7ff 100%
              )`,
          'box-shadow': progress() > 80
            ? `
                0 0 10px #ff4444,
                0 0 20px #ff4444,
                0 0 30px #ff0000,
                inset 0 0 10px rgba(255, 255, 255, 0.5)
              `
            : `
                0 0 10px #00f7ff,
                0 0 20px #00f7ff,
                0 0 30px #0066ff,
                inset 0 0 10px rgba(255, 255, 255, 0.5)
              `
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)',
            'border-radius': '6px 6px 0 0'
          }}
        />
      </div>
    </div>
  );
}
