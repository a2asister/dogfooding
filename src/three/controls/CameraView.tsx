import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { CameraView } from '@/types';

const CAMERA_VIEWS: Record<CameraView['type'], { 
  position: [number, number, number]; 
  target: [number, number, number];
  fov: number;
}> = {
  front: {
    position: [0, 8, 25],
    target: [0, 0, 0],
    fov: 50,
  },
  side: {
    position: [20, 6, 5],
    target: [0, 0, 0],
    fov: 50,
  },
  top: {
    position: [0, 30, 0.1],
    target: [0, 0, 0],
    fov: 60,
  },
};

interface CameraViewProps {
  viewType: CameraView['type'];
}

export function CameraView({ viewType }: CameraViewProps) {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    const viewConfig = CAMERA_VIEWS[viewType];
    
    if (!viewConfig) return;
    
    const startPos = camera.position.clone();
    const targetPos = new THREE.Vector3(...viewConfig.position);
    
    let animationProgress = 0;
    const animationDuration = 1000;
    const startTime = performance.now();
    
    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      animationProgress = Math.min(elapsed / animationDuration, 1);
      
      const easeProgress = easeInOutCubic(animationProgress);
      
      camera.position.lerpVectors(startPos, targetPos, easeProgress);
      
      if (controls && 'target' in controls) {
        const orbitControls = controls as { target: THREE.Vector3 };
        orbitControls.target.lerp(new THREE.Vector3(...viewConfig.target), easeProgress);
      }
      
      if (animationProgress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    requestAnimationFrame(animate);
  }, [viewType, camera, controls]);
  
  return null;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export { CAMERA_VIEWS };
