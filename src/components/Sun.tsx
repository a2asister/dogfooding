import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SunProps {
  position: { x: number; y: number; z: number };
  color: string;
}

export default function Sun({ position, color }: SunProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowMeshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const sunMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: color,
    });
  }, [color]);

  const glowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
    });
  }, [color]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
    if (glowMeshRef.current) {
      glowMeshRef.current.rotation.y -= 0.001;
      const scale = 1.2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      glowMeshRef.current.scale.set(scale, scale, scale);
    }
  });

  const isVisible = position.y > -5;

  return (
    <group position={[position.x, position.y, position.z]} visible={isVisible}>
      <pointLight
        ref={lightRef}
        color={color}
        intensity={isVisible ? 2 : 0}
        distance={100}
        castShadow
      />
      
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 32, 32]} />
        <primitive object={sunMaterial} />
      </mesh>
      
      <mesh ref={glowMeshRef}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <primitive object={glowMaterial} />
      </mesh>
      
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 4, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
