import React, { useState, useCallback, useRef } from 'react';

interface FlyingImageState {
  id: number;
  src: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  controlX: number;
  controlY: number;
}

interface AfterimageState {
  id: number;
  src: string;
  x: number;
  y: number;
  opacity: number;
  scale: number;
}

interface FlyingAnimationProps {
  onAnimationComplete?: () => void;
}

interface AnimationContextType {
  triggerFlyingAnimation: (imageSrc: string, buttonRect: DOMRect) => void;
}

const AnimationContext = React.createContext<AnimationContextType | null>(null);

export default function FlyingAnimation({ children, onAnimationComplete }: React.PropsWithChildren<FlyingAnimationProps>) {
  const [flyingImages, setFlyingImages] = useState<FlyingImageState[]>([]);
  const [afterimages, setAfterimages] = useState<AfterimageState[]>([]);
  const isAnimatingRef = useRef(false);
  const animationIdCounterRef = useRef(0);

  const resetAnimationState = useCallback(() => {
    isAnimatingRef.current = false;
    setFlyingImages([]);
    setAfterimages([]);
  }, []);

  const triggerFlyingAnimation = useCallback((imageSrc: string, buttonRect: DOMRect) => {
    if (isAnimatingRef.current) {
      return;
    }
    isAnimatingRef.current = true;

    const cartIcon = document.querySelector('.cart-icon-wrapper');
    if (!cartIcon) {
      resetAnimationState();
      return;
    }

    if (!imageSrc) {
      resetAnimationState();
      return;
    }

    const cartRect = cartIcon.getBoundingClientRect();
    const image = new Image();
    let animationStarted = false;
    let timeoutId: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const handleImageError = () => {
      cleanup();
      resetAnimationState();
    };

    timeoutId = setTimeout(() => {
      if (!animationStarted) {
        handleImageError();
      }
    }, 3000);

    image.onerror = handleImageError;

    image.onload = () => {
      animationStarted = true;
      cleanup();

      const startX = buttonRect.left + buttonRect.width / 2;
      const startY = buttonRect.top + buttonRect.height / 2;
      const endX = cartRect.left + cartRect.width / 2;
      const endY = cartRect.top + cartRect.height / 2;

      const controlX = (startX + endX) / 2 - 100;
      const controlY = Math.min(startY, endY) - 150;

      const newId = animationIdCounterRef.current;
      animationIdCounterRef.current += 1;

      const flyingImage: FlyingImageState = {
        id: newId,
        src: imageSrc,
        startX,
        startY,
        endX,
        endY,
        controlX,
        controlY
      };

      setFlyingImages([flyingImage]);
      animateFlyingImage(flyingImage, cartIcon, animationIdCounterRef.current);
      animationIdCounterRef.current += 6;
    };

    image.src = imageSrc;
  }, [resetAnimationState]);

  const animateFlyingImage = useCallback((flyingImage: FlyingImageState, cartIcon: Element, afterimageCounter: number) => {
    const duration = 800;
    const startTime = performance.now();
    const afterimageIds: number[] = [];

    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const getPointOnCurve = (t: number) => {
      const { startX, startY, endX, endY, controlX, controlY } = flyingImage;
      const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
      const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;
      return { x, y };
    };

    for (let i = 0; i < 5; i++) {
      const aid = afterimageCounter + i + 1;
      afterimageIds.push(aid);
      const initialPoint = getPointOnCurve(0);
      setAfterimages(prev => [...prev, {
        id: aid,
        src: flyingImage.src,
        x: initialPoint.x,
        y: initialPoint.y,
        opacity: 0.5 - i * 0.1,
        scale: 1 - i * 0.1
      }]);
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeInOutCubic(progress);

      const { x, y } = getPointOnCurve(easeProgress);
      const scale = 1 - easeProgress * 0.6;
      const rotate = easeProgress * 360;

      setFlyingImages(prev => prev.map(img => 
        img.id === flyingImage.id 
          ? { ...img, currentX: x, currentY: y, currentScale: scale, currentRotate: rotate, opacity: 1 - easeProgress * 0.3 } as any
          : img
      ));

      afterimageIds.forEach((aid, i) => {
        const delay = (i + 1) * 0.08;
        const afterProgress = Math.max(0, easeProgress - delay);
        const afterPoint = getPointOnCurve(afterProgress);
        const afterScale = (1 - afterProgress * 0.6) * (1 - i * 0.1);
        const afterOpacity = (0.5 - i * 0.1) * (1 - afterProgress);

        setAfterimages(prev => prev.map(a => 
          a.id === aid 
            ? { ...a, x: afterPoint.x, y: afterPoint.y, scale: afterScale, opacity: afterOpacity }
            : a
        ));
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setFlyingImages([]);
        setAfterimages([]);

        if (cartIcon && !cartIcon.classList.contains('bounce-animation')) {
          cartIcon.classList.add('bounce-animation');
          setTimeout(() => {
            cartIcon.classList.remove('bounce-animation');
          }, 600);
        }

        const badge = cartIcon.querySelector('.cart-badge');
        if (badge) {
          badge.classList.add('pop-animation');
          setTimeout(() => {
            badge.classList.remove('pop-animation');
          }, 500);
        }

        isAnimatingRef.current = false;
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }
    };

    requestAnimationFrame(animate);
  }, [onAnimationComplete]);

  return (
    <AnimationContext.Provider value={{ triggerFlyingAnimation }}>
      {children}
      
      {flyingImages.map(img => (
        <div
          key={img.id}
          style={{
            position: 'fixed',
            left: `${(img as any).currentX ?? img.startX - 40}px`,
            top: `${(img as any).currentY ?? img.startY - 40}px`,
            width: '80px',
            height: '80px',
            pointerEvents: 'none',
            zIndex: 9999,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transform: `scale(${(img as any).currentScale ?? 1}) rotate(${(img as any).currentRotate ?? 0}deg)`,
            opacity: (img as any).opacity ?? 1,
            transition: 'none'
          }}
        >
          <img 
            src={img.src} 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        </div>
      ))}

      {afterimages.map(afterimage => (
        <div
          key={afterimage.id}
          style={{
            position: 'fixed',
            left: `${afterimage.x - 40}px`,
            top: `${afterimage.y - 40}px`,
            width: '80px',
            height: '80px',
            pointerEvents: 'none',
            zIndex: 9998,
            borderRadius: '8px',
            transform: `scale(${afterimage.scale})`,
            opacity: afterimage.opacity,
            filter: 'blur(1px)'
          }}
        >
          <img 
            src={afterimage.src} 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        </div>
      ))}

      <style>
        {`
          .cart-icon-wrapper {
            position: relative;
            transition: transform 0.3s ease;
          }
          
          .cart-icon-wrapper.bounce-animation {
            animation: bounce 0.6s ease;
          }
          
          .cart-badge {
            position: absolute;
            top: -8px;
            right: -8px;
            background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
            color: white;
            font-size: 12px;
            font-weight: bold;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: scale(1);
            transition: transform 0.2s ease;
          }
          
          .cart-badge.pop-animation {
            animation: pop 0.5s ease;
          }
          
          @keyframes bounce {
            0% { transform: scale(1); }
            30% { transform: scale(1.3); }
            50% { transform: scale(0.9); }
            70% { transform: scale(1.15); }
            100% { transform: scale(1); }
          }
          
          @keyframes pop {
            0% { transform: scale(1); }
            50% { transform: scale(1.4); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </AnimationContext.Provider>
  );
}

export const useFlyingAnimation = () => {
  const context = React.useContext(AnimationContext);
  return context;
};
