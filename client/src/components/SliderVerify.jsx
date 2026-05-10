import { createSignal, onMount, onCleanup } from 'solid-js';

export default function SliderVerify(props) {
  const [isDragging, setIsDragging] = createSignal(false);
  const [sliderPosition, setSliderPosition] = createSignal(0);
  const [isVerified, setIsVerified] = createSignal(false);
  const [startX, setStartX] = createSignal(0);
  
  let sliderContainer = null;
  let sliderWidth = 0;
  let buttonWidth = 50;
  
  onMount(() => {
    if (sliderContainer) {
      sliderWidth = sliderContainer.offsetWidth;
    }
    
    const handleMouseUp = () => {
      if (isDragging() && !isVerified()) {
        setIsDragging(false);
        if (sliderPosition() < sliderWidth - buttonWidth - 10) {
          resetSlider();
        }
      }
    };
    
    const handleTouchEnd = () => {
      if (isDragging() && !isVerified()) {
        setIsDragging(false);
        if (sliderPosition() < sliderWidth - buttonWidth - 10) {
          resetSlider();
        }
      }
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);
    
    onCleanup(() => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    });
  });
  
  function resetSlider() {
    setSliderPosition(0);
    setIsVerified(false);
  }
  
  function handleMouseDown(e) {
    if (isVerified()) return;
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
  }
  
  function handleTouchStart(e) {
    if (isVerified()) return;
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  }
  
  function handleMouseMove(e) {
    if (!isDragging() || isVerified()) return;
    
    const deltaX = e.clientX - startX();
    let newPosition = Math.max(0, Math.min(sliderPosition() + deltaX, sliderWidth - buttonWidth));
    setSliderPosition(newPosition);
    setStartX(e.clientX);
    
    if (newPosition >= sliderWidth - buttonWidth - 10) {
      setIsVerified(true);
      setIsDragging(false);
      props.onVerified?.('slider_token_' + Date.now());
    }
  }
  
  function handleTouchMove(e) {
    if (!isDragging() || isVerified()) return;
    e.preventDefault();
    
    const deltaX = e.touches[0].clientX - startX();
    let newPosition = Math.max(0, Math.min(sliderPosition() + deltaX, sliderWidth - buttonWidth));
    setSliderPosition(newPosition);
    setStartX(e.touches[0].clientX);
    
    if (newPosition >= sliderWidth - buttonWidth - 10) {
      setIsVerified(true);
      setIsDragging(false);
      props.onVerified?.('slider_token_' + Date.now());
    }
  }
  
  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        height: '50px',
        background: isVerified() ? 'rgba(0, 255, 100, 0.2)' : 'rgba(0, 247, 255, 0.1)',
        borderRadius: '25px',
        border: `2px solid ${isVerified() ? 'rgba(0, 255, 100, 0.5)' : 'rgba(0, 247, 255, 0.3)'}`,
        overflow: 'hidden',
        cursor: isVerified() ? 'default' : 'grab',
        transition: 'all 0.3s ease',
        boxShadow: isVerified() 
          ? '0 0 20px rgba(0, 255, 100, 0.3)' 
          : 'inset 0 0 20px rgba(0, 247, 255, 0.1)'
      }}
      ref={(el) => { sliderContainer = el; }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${sliderPosition()}px`,
          height: '100%',
          background: isVerified() 
            ? 'linear-gradient(90deg, #00ff64, #00cc50)'
            : 'linear-gradient(90deg, #00f7ff, #0066ff)',
          borderRadius: '25px',
          opacity: 0.6,
          transition: 'opacity 0.3s ease'
        }}
      />
      
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: isVerified() ? '#00ff64' : 'rgba(255,255,255,0.6)',
          fontSize: '14px',
          fontWeight: '500',
          whiteSpace: 'nowrap',
          opacity: sliderPosition() > 50 ? 0 : 1,
          transition: 'opacity 0.2s ease'
        }}
      >
        {isVerified() ? '✓ 验证成功' : '→ 向右滑动验证 →'}
      </div>
      
      <div
        style={{
          position: 'absolute',
          top: '3px',
          left: `${3 + sliderPosition()}px`,
          width: `${buttonWidth}px`,
          height: '44px',
          background: isVerified()
            ? 'linear-gradient(135deg, #00ff64, #00cc50)'
            : 'linear-gradient(135deg, #00f7ff, #0066ff)',
          borderRadius: '22px',
          cursor: isVerified() ? 'default' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isVerified()
            ? '0 0 20px rgba(0, 255, 100, 0.5)'
            : '0 0 15px rgba(0, 247, 255, 0.5)',
          transition: 'all 0.3s ease'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <span style={{
          color: '#fff',
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          {isVerified() ? '✓' : '→'}
        </span>
      </div>
    </div>
  );
}
