import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WaterParticlesProps {
  openHoles: number[];
  intensity: number;
  damLength: number;
}

const PARTICLES_PER_HOLE = 2000;
const TOTAL_PARTICLES = PARTICLES_PER_HOLE * 15;

export function WaterParticles({ openHoles, intensity, damLength }: WaterParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const simulationRef = useRef<{
    positions: Float32Array;
    velocities: Float32Array;
    lifetimes: Float32Array;
    startPositions: Float32Array;
    activeHoles: number[];
  }>({
    positions: new Float32Array(TOTAL_PARTICLES * 3),
    velocities: new Float32Array(TOTAL_PARTICLES * 3),
    lifetimes: new Float32Array(TOTAL_PARTICLES),
    startPositions: new Float32Array(TOTAL_PARTICLES * 3),
    activeHoles: [],
  });
  
  const holeSpacing = useMemo(() => {
    const totalHoles = 77;
    return (damLength - 2) / (totalHoles + 1);
  }, [damLength]);
  
  useEffect(() => {
    simulationRef.current.activeHoles = openHoles;
  }, [openHoles]);
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    
    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      resetParticle(i, simulationRef.current);
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(simulationRef.current.positions, 3));
    
    const colors = new Float32Array(TOTAL_PARTICLES * 3);
    const sizes = new Float32Array(TOTAL_PARTICLES);
    
    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      const colorVariation = 0.2 + Math.random() * 0.3;
      colors[i * 3] = 0.1 + colorVariation * 0.1;
      colors[i * 3 + 1] = 0.5 + colorVariation;
      colors[i * 3 + 2] = 0.9 + colorVariation * 0.1;
      
      sizes[i] = 0.02 + Math.random() * 0.04;
    }
    
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return geo;
  }, []);
  
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: intensity },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vColor = color;
          vAlpha = 1.0;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * 30.0 * (1.0 + position.y * 0.1) / -mvPosition.z;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uIntensity;
        
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha *= vAlpha * (0.5 + uIntensity * 0.5);
          
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);
  
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.elapsedTime;
    const sim = simulationRef.current;
    const deltaTime = 1 / 60;
    
    if (material.uniforms) {
      material.uniforms.uTime.value = time;
      material.uniforms.uIntensity.value = intensity;
    }
    
    const baseSpeed = 8 * intensity;
    
    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      const idx = i * 3;
      
      if (sim.lifetimes[i] <= 0) {
        if (sim.activeHoles.length > 0 && Math.random() < intensity * 0.3) {
          resetParticle(i, sim);
        } else {
          sim.positions[idx + 1] = -100;
          continue;
        }
      }
      
      sim.positions[idx] += sim.velocities[idx] * deltaTime;
      sim.positions[idx + 1] += sim.velocities[idx + 1] * deltaTime;
      sim.positions[idx + 2] += sim.velocities[idx + 2] * deltaTime;
      
      sim.velocities[idx + 1] -= 9.8 * deltaTime * 0.5;
      
      const jitterX = (Math.random() - 0.5) * 0.1;
      const jitterZ = (Math.random() - 0.5) * 0.1;
      sim.positions[idx] += jitterX;
      sim.positions[idx + 2] += jitterZ;
      
      sim.lifetimes[i] -= deltaTime;
      
      if (sim.positions[idx + 1] < -0.5) {
        sim.lifetimes[i] = 0;
      }
    }
    
    const positions = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    positions.needsUpdate = true;
  });
  
  function resetParticle(index: number, sim: typeof simulationRef.current) {
    if (sim.activeHoles.length === 0) {
      sim.positions[index * 3 + 1] = -100;
      sim.lifetimes[index] = 0;
      return;
    }
    
    const randomHole = sim.activeHoles[Math.floor(Math.random() * sim.activeHoles.length)];
    const holeX = -damLength / 2 + 1 + randomHole * holeSpacing;
    
    const offsetX = (Math.random() - 0.5) * 0.2;
    const offsetY = (Math.random() - 0.5) * 0.1;
    const offsetZ = (Math.random() - 0.5) * 0.2;
    
    sim.positions[index * 3] = holeX + offsetX;
    sim.positions[index * 3 + 1] = -0.2 + offsetY;
    sim.positions[index * 3 + 2] = -1.5 + offsetZ;
    
    sim.startPositions[index * 3] = sim.positions[index * 3];
    sim.startPositions[index * 3 + 1] = sim.positions[index * 3 + 1];
    sim.startPositions[index * 3 + 2] = sim.positions[index * 3 + 2];
    
    const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.3;
    const speed = (3 + Math.random() * 3) * intensity;
    
    sim.velocities[index * 3] = (Math.random() - 0.5) * 0.5;
    sim.velocities[index * 3 + 1] = Math.sin(angle) * speed;
    sim.velocities[index * 3 + 2] = -Math.cos(angle) * speed;
    
    sim.lifetimes[index] = 1.5 + Math.random() * 1.5;
  }
  
  if (openHoles.length === 0 || typeof intensity !== 'number' || isNaN(intensity) || intensity <= 0.01) {
    return null;
  }
  
  return (
    <group>
      <points ref={pointsRef} geometry={geometry} material={material} />
      
      {openHoles.map((holeId) => {
        const holeX = -damLength / 2 + 1 + holeId * holeSpacing;
        return (
          <WaterJet 
            key={holeId}
            position={[holeX, -0.2, -1.2]}
            intensity={intensity}
          />
        );
      })}
    </group>
  );
}

function WaterJet({ position, intensity }: { position: [number, number, number]; intensity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.1, 0);
    shape.lineTo(-0.15, -0.3);
    shape.lineTo(-0.2, -0.6);
    shape.lineTo(-0.3, -1.2);
    shape.lineTo(0.3, -1.2);
    shape.lineTo(0.2, -0.6);
    shape.lineTo(0.15, -0.3);
    shape.lineTo(0.1, 0);
    shape.lineTo(-0.1, 0);
    
    return new THREE.ExtrudeGeometry(shape, {
      steps: 1,
      depth: 0.2,
      bevelEnabled: false,
    });
  }, []);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      const scale = 1 + Math.sin(time * 5) * 0.05;
      meshRef.current.scale.set(scale, scale * intensity, scale);
      
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.2 + intensity * 0.3 + Math.sin(time * 3) * 0.05;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position} rotation={[0, 0, 0]}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial 
        color="#42a5f5"
        transparent
        opacity={0.6 * intensity}
        emissive="#1e88e5"
        emissiveIntensity={0.3}
        roughness={0.1}
        metalness={0.1}
      />
    </mesh>
  );
}
