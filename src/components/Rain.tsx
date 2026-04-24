import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RainProps {
  intensity: number;
}

export default function Rain({ intensity }: RainProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { geometry, velocities } = useMemo(() => {
    const count = Math.floor(intensity * 1000);
    const positions = new Float32Array(count * 3);
    const vels = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = Math.random() * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
      vels[i] = 0.3 + Math.random() * 0.3;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    return { geometry: geo, velocities: vels };
  }, [intensity]);

  const velocitiesRef = useRef(velocities);
  velocitiesRef.current = velocities;

  useFrame(() => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const vels = velocitiesRef.current;
    
    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3 + 1] -= vels[i];
      
      if (positions[i * 3 + 1] < -5) {
        positions[i * 3 + 1] = 40;
        positions[i * 3] = (Math.random() - 0.5) * 80;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#aaccff"
        size={0.1}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}
