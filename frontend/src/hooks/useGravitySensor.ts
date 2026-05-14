import { useSignal, useVisibleTask$ } from '@builder.io/qwik';

export function useGravitySensor(sensitivity: number = 1.0) {
  const gravityX = useSignal(0);
  const gravityY = useSignal(0);
  const isSupported = useSignal(false);

  useVisibleTask$(() => {
    if ('DeviceOrientationEvent' in window) {
      isSupported.value = true;

      const handleOrientation = (event: DeviceOrientationEvent) => {
        const gamma = event.gamma || 0;
        const beta = event.beta || 0;
        
        gravityX.value = (gamma / 45) * sensitivity;
        gravityY.value = ((beta - 45) / 45) * sensitivity;
      };

      window.addEventListener('deviceorientation', handleOrientation);
      
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
      };
    }
  });

  return { gravityX, gravityY, isSupported };
}