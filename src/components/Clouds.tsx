import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CloudsProps {
  density: number;
  opacity: number;
}

export default function Clouds({ density, opacity }: CloudsProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  const clouds = useMemo(() => {
    const cloudData: { position: [number, number, number]; scale: [number, number, number]; speed: number }[] = [];
    const count = Math.floor(density * 20);
    
    for (let i = 0; i < count; i++) {
      cloudData.push({
        position: [
          (Math.random() - 0.5) * 100,
          15 + Math.random() * 10,
          (Math.random() - 0.5) * 100,
        ],
        scale: [
          3 + Math.random() * 4,
          1 + Math.random() * 1.5,
          3 + Math.random() * 4,
        ],
        speed: 0.01 + Math.random() * 0.02,
      });
    }
    
    return cloudData;
  }, [density]);

  const cloudMeshes = useMemo(() => {
    return clouds.map((cloud) => {
      const geometry = new THREE.SphereGeometry(1, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: opacity * 0.6,
        roughness: 1,
        metalness: 0,
      });
      
      const group = new THREE.Group();
      
      for (let i = 0; i < 5; i++) {
        const mesh = new THREE.Mesh(geometry.clone(), material.clone());
        mesh.position.set(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 2
        );
        const scale = 0.5 + Math.random() * 0.5;
        mesh.scale.set(scale, scale, scale);
        group.add(mesh);
      }
      
      group.position.set(...cloud.position);
      group.scale.set(...cloud.scale);
      
      return { group, data: cloud };
    });
  }, [clouds, opacity]);

  useFrame(() => {
    cloudMeshes.forEach((cloud) => {
      cloud.group.position.x += cloud.data.speed;
      if (cloud.group.position.x > 60) {
        cloud.group.position.x = -60;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {cloudMeshes.map((cloud, index) => (
        <primitive key={index} object={cloud.group} />
      ))}
    </group>
  );
}
