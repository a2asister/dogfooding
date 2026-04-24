import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MoonProps {
  position: { x: number; y: number; z: number };
  color: string;
}

export default function Moon({ position, color }: MoonProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowMeshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const moonMaterial = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0, '#e8e8e8');
      gradient.addColorStop(0.5, '#d0d0d0');
      gradient.addColorStop(1, '#a0a0a0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);
      
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const radius = Math.random() * 10 + 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.15})`;
        ctx.fill();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.1,
    });
  }, []);

  const glowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2,
    });
  }, [color]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
    if (glowMeshRef.current) {
      const scale = 1.1 + Math.sin(state.clock.elapsedTime * 0.3) * 0.03;
      glowMeshRef.current.scale.set(scale, scale, scale);
    }
  });

  const isVisible = position.y > -5;

  return (
    <group position={[position.x, position.y, position.z]} visible={isVisible}>
      <pointLight
        ref={lightRef}
        color={color}
        intensity={isVisible ? 0.5 : 0}
        distance={50}
      />
      
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <primitive object={moonMaterial} />
      </mesh>
      
      <mesh ref={glowMeshRef}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <primitive object={glowMaterial} />
      </mesh>
      
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 2.5, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
