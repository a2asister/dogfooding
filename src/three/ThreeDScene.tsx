import { useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Stars, Environment, SoftShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '@/stores/appStore';
import type { FloodData } from '@/types';
import { ThreeGorgesDam } from '@/three/models/Dam';
import { WaterParticles } from '@/three/effects/WaterParticles';
import { CameraView } from '@/three/controls/CameraView';

const SCALE_FACTOR = 0.01;
const DAM_SCALE = {
  x: 23.35,
  y: 1.81,
  z: 2.0,
};

interface SceneProps {
  data: FloodData | null;
}

function SceneContent({ data }: SceneProps) {
  const { cameraView } = useAppStore();
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  const openHoles = useMemo(() => {
    return data?.openHoles ?? [];
  }, [data]);
  
  const dischargeIntensity = useMemo(() => {
    if (!data || typeof data.dischargeFlow !== 'number' || isNaN(data.dischargeFlow) || data.dischargeFlow <= 0 || openHoles.length === 0) {
      return 0;
    }
    const designFlow = 71200;
    const minIntensity = 0.3;
    const intensity = Math.min(data.dischargeFlow / designFlow, 1);
    if (isNaN(intensity)) return 0;
    return minIntensity + intensity * (1 - minIntensity);
  }, [data, openHoles.length]);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.02;
    }
  });
  
  return (
    <>
      <CameraView viewType={cameraView} />
      
      <Sky sunPosition={[100, 20, 100]} turbidity={0.3} rayleigh={0.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
      
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 50, 25]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera attach="shadow-camera" args={[-30, 30, 30, -30]} />
      </directionalLight>
      
      <group ref={groupRef} position={[0, -0.5, 0]}>
        <Terrain />
        
        <ThreeGorgesDam 
          scale={DAM_SCALE}
          openHoles={openHoles}
          dischargeIntensity={dischargeIntensity}
          upstreamWaterLevel={data?.upstreamWaterLevel ?? 155}
          downstreamWaterLevel={data?.downstreamWaterLevel ?? 65}
        />
        
        <River 
          upstreamLevel={data?.upstreamWaterLevel ?? 155}
          downstreamLevel={data?.downstreamWaterLevel ?? 65}
        />
        
        {openHoles.length > 0 && (
          <WaterParticles
            openHoles={openHoles}
            intensity={dischargeIntensity}
            damLength={DAM_SCALE.x}
          />
        )}
        
        <Landmarks />
      </group>
      
      <OrbitControls 
        makeDefault
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={80}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0, 0]}
      />
      
      <SoftShadows size={10} samples={10} focus={0.5} />
    </>
  );
}

function Terrain() {
  const terrainRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(200, 100, 100, 50);
    const positions = geo.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      let z = 0;
      
      if (y < -15 || y > 15) {
        const distFromCenter = Math.abs(y);
        const heightFactor = (distFromCenter - 15) / 35;
        z += Math.sin(x * 0.1) * 0.5 + Math.cos(y * 0.05) * 0.8;
        z += heightFactor * 3;
      }
      
      positions.setZ(i, z);
    }
    
    geo.computeVertexNormals();
    return geo;
  }, []);
  
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={terrainRef} geometry={geometry} receiveShadow>
        <meshStandardMaterial 
          color="#3d5c3d"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

function River({ upstreamLevel, downstreamLevel }: { upstreamLevel: number; downstreamLevel: number }) {
  const upstreamRef = useRef<THREE.Mesh>(null);
  const downstreamRef = useRef<THREE.Mesh>(null);
  
  const waterBaseY = -0.3;
  const upstreamY = waterBaseY + (upstreamLevel - 66) * SCALE_FACTOR;
  const downstreamY = waterBaseY + (downstreamLevel - 66) * SCALE_FACTOR;
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (upstreamRef.current?.material) {
      const material = upstreamRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.1 + Math.sin(time * 0.5) * 0.05;
    }
    
    if (downstreamRef.current?.material) {
      const material = downstreamRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.1 + Math.sin(time * 0.5 + 1) * 0.05;
    }
  });
  
  return (
    <group>
      <mesh ref={upstreamRef} position={[0, upstreamY, 15]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 40]} />
        <meshStandardMaterial 
          color="#1e88e5"
          transparent
          opacity={0.85}
          roughness={0.1}
          metalness={0.3}
          emissive="#0d47a1"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      <mesh ref={downstreamRef} position={[0, downstreamY, -15]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#42a5f5"
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.3}
          emissive="#1976d2"
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  );
}

function Landmarks() {
  return (
    <group>
      <group position={[-12, 0.5, 12]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.1, 0.6]} />
          <meshStandardMaterial color="#8d6e63" />
        </mesh>
        <mesh position={[0, 0.4, 0]} castShadow>
          <coneGeometry args={[0.5, 0.8, 4]} />
          <meshStandardMaterial color="#6d4c41" />
        </mesh>
        <Html position={[0, 1.5, 0]} center>
          <div className="bg-black/50 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
            观景台
          </div>
        </Html>
      </group>
      
      <group position={[12, 0.5, 12]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.3, 0.35, 1.5, 8]} />
          <meshStandardMaterial color="#90a4ae" />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#78909c" />
        </mesh>
        <mesh position={[0, 2.5, 0]} castShadow>
          <boxGeometry args={[0.6, 0.4, 0.6]} />
          <meshStandardMaterial color="#f44336" emissive="#f44336" emissiveIntensity={0.3} />
        </mesh>
        <Html position={[0, 3.5, 0]} center>
          <div className="bg-black/50 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
            监测站
          </div>
        </Html>
      </group>
      
      <group position={[0, 3.5, 0]}>
        <Html center>
          <div className="bg-black/60 px-3 py-1 rounded-lg text-sm font-bold text-white whitespace-nowrap">
            三峡大坝
          </div>
        </Html>
      </group>
    </group>
  );
}

interface ThreeDSceneProps {
  data: FloodData | null;
}

export function ThreeDScene({ data }: ThreeDSceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [15, 10, 25], fov: 50, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <SceneContent data={data} />
        </Suspense>
      </Canvas>
    </div>
  );
}
