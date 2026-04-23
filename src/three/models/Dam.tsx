import { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SCALE_FACTOR = 0.01;

interface DamProps {
  scale: { x: number; y: number; z: number };
  openHoles: number[];
  dischargeIntensity: number;
  upstreamWaterLevel: number;
  downstreamWaterLevel: number;
}

export function ThreeGorgesDam({ 
  scale, 
  openHoles, 
  dischargeIntensity, 
  upstreamWaterLevel, 
  downstreamWaterLevel 
}: DamProps) {
  const damRef = useRef<THREE.Group>(null);
  
  const holePositions = useMemo(() => {
    const positions: Map<number, { x: number; y: number }> = new Map();
    const totalHoles = 77;
    const spacing = (scale.x - 2) / (totalHoles + 1);
    
    for (let i = 1; i <= totalHoles; i++) {
      positions.set(i, {
        x: -scale.x / 2 + 1 + i * spacing,
        y: -0.3 + Math.random() * 0.1,
      });
    }
    
    return positions;
  }, [scale.x]);
  
  const mainBodyGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    
    shape.moveTo(-scale.z / 2, 0);
    shape.lineTo(-scale.z / 2 + 0.8, scale.y);
    shape.lineTo(scale.z / 2 - 0.8, scale.y);
    shape.lineTo(scale.z / 2, 0);
    shape.lineTo(-scale.z / 2, 0);
    
    const extrudeSettings = {
      steps: 1,
      depth: scale.x,
      bevelEnabled: false,
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateX(Math.PI / 2);
    geometry.translate(0, 0, -scale.x / 2);
    
    return geometry;
  }, [scale]);
  
  return (
    <group ref={damRef}>
      <mesh geometry={mainBodyGeometry} castShadow receiveShadow>
        <meshStandardMaterial 
          color="#607d8b"
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>
      
      <CrestRoad scale={scale} />
      
      <Elevators scale={scale} />
      
      <mesh 
        position={[0, scale.y * 0.5, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[scale.y * 0.8, scale.x * 0.6]} />
        <meshStandardMaterial 
          color="#1a237e"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {Array.from(holePositions.entries()).map(([holeId, pos]) => {
        const isOpen = openHoles.includes(holeId);
        return (
          <DischargeHole 
            key={holeId}
            position={[pos.x, pos.y, -scale.z / 2 + 0.3]}
            isOpen={isOpen}
            intensity={isOpen ? dischargeIntensity : 0}
            holeId={holeId}
          />
        );
      })}
      
      <PowerStation scale={scale} />
      
      <NavigationLocks scale={scale} />
    </group>
  );
}

function CrestRoad({ scale }: { scale: { x: number; y: number; z: number } }) {
  return (
    <group position={[0, scale.y, 0]}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[scale.x, 0.3, 0.4]} />
        <meshStandardMaterial color="#455a64" roughness={0.9} />
      </mesh>
      
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[scale.x - 0.2, 0.02, 0.35]} />
        <meshStandardMaterial color="#37474f" roughness={0.5} />
      </mesh>
      
      {[-1, 1].map((side) => (
        <group key={side} position={[0, 0.3, side * 0.22]}>
          {Array.from({ length: Math.floor(scale.x / 0.8) }).map((_, i) => (
            <group key={i} position={[-scale.x / 2 + 0.4 + i * 0.8, 0, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.02, 0.025, 0.15, 6]} />
                <meshStandardMaterial color="#90a4ae" metalness={0.8} roughness={0.3} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

function Elevators({ scale }: { scale: { x: number; y: number; z: number } }) {
  const elevatorPositions = [-scale.x * 0.35, 0, scale.x * 0.35];
  
  return (
    <group>
      {elevatorPositions.map((x, index) => (
        <group key={index} position={[x, scale.y * 0.3, scale.z / 2 - 0.4]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.8, scale.y * 0.7, 0.6]} />
            <meshStandardMaterial color="#546e7a" roughness={0.8} />
          </mesh>
          
          <mesh position={[0, scale.y * 0.2, 0]} castShadow>
            <boxGeometry args={[1.0, scale.y * 0.4, 0.7]} />
            <meshStandardMaterial color="#78909c" roughness={0.85} />
          </mesh>
          
          <mesh position={[0, scale.y * 0.45, 0]}>
            <boxGeometry args={[0.9, scale.y * 0.25, 0.65]} />
            <meshStandardMaterial 
              color="#64b5f6"
              transparent
              opacity={0.6}
              emissive="#42a5f5"
              emissiveIntensity={0.1}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function DischargeHole({ 
  position, 
  isOpen, 
  intensity, 
  holeId 
}: { 
  position: [number, number, number];
  isOpen: boolean;
  intensity: number;
  holeId: number;
}) {
  const holeRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (isOpen && holeRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3 + holeId) * 0.05;
      holeRef.current.scale.setScalar(pulse);
    }
  });
  
  return (
    <group ref={holeRef} position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.5, 0.3]} />
        <meshStandardMaterial color="#263238" roughness={0.7} metalness={0.3} />
      </mesh>
      
      <mesh position={[0, 0, -0.15]}>
        <boxGeometry args={[0.35, 0.45, 0.02]} />
        <meshStandardMaterial 
          color={isOpen ? "#000000" : "#37474f"}
          roughness={0.8}
          emissive={isOpen ? "#42a5f5" : '#000000'}
          emissiveIntensity={isOpen ? intensity * 0.5 : 0}
        />
      </mesh>
      
      <group position={[0, 0.35, 0]}>
        <mesh>
          <boxGeometry args={[0.35, 0.12, 0.2]} />
          <meshStandardMaterial 
            color={isOpen ? "#4caf50" : "#f44336"}
            emissive={isOpen ? "#4caf50" : "#f44336"}
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial 
            color={isOpen ? "#81c784" : "#e57373"}
            emissive={isOpen ? "#4caf50" : "#f44336"}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
    </group>
  );
}

function PowerStation({ scale }: { scale: { x: number; y: number; z: number } }) {
  return (
    <group position={[0, 0, -scale.z / 2 - 1.5]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[scale.x * 0.8, 0.5, 0.8]} />
        <meshStandardMaterial color="#546e7a" roughness={0.8} />
      </mesh>
      
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[scale.x * 0.75, 0.6, 0.7]} />
        <meshStandardMaterial color="#607d8b" roughness={0.85} />
      </mesh>
      
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={i} position={[-scale.x * 0.3 + i * scale.x * 0.085, 0.5, 0.4]}>
          <mesh>
            <boxGeometry args={[0.15, 0.2, 0.1]} />
            <meshStandardMaterial 
              color="#42a5f5"
              emissive="#1e88e5"
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function NavigationLocks({ scale }: { scale: { x: number; y: number; z: number } }) {
  return (
    <group position={[scale.x * 0.55, 0, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 0.4, 10]} />
        <meshStandardMaterial color="#546e7a" roughness={0.8} />
      </mesh>
      
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[1.5, 0.02, 8]} />
        <meshStandardMaterial 
          color="#1e88e5"
          transparent
          opacity={0.7}
          emissive="#0d47a1"
          emissiveIntensity={0.05}
        />
      </mesh>
      
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.8, 0.15, 8.2]} />
        <meshStandardMaterial color="#455a64" roughness={0.9} />
      </mesh>
      
      {[-1, 1].map((zSide) => (
        <group key={zSide} position={[0, 0.4, zSide * 4.5]}>
          <mesh position={[-0.9, 0, 0]} castShadow>
            <boxGeometry args={[0.1, 1.2, 0.1]} />
            <meshStandardMaterial color="#607d8b" />
          </mesh>
          <mesh position={[0.9, 0, 0]} castShadow>
            <boxGeometry args={[0.1, 1.2, 0.1]} />
            <meshStandardMaterial color="#607d8b" />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[2, 0.05, 0.05]} />
            <meshStandardMaterial color="#ffc107" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
