import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface ColorBlob {
  position: THREE.Vector2;
  velocity: THREE.Vector2;
  color: THREE.Color;
  radius: number;
}

interface GradientArtCanvasProps {
  selectedColors: string[];
  onExportSuccess?: () => void;
}

export default function GradientArtCanvas({ selectedColors, onExportSuccess }: GradientArtCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const blobsRef = useRef<ColorBlob[]>([]);
  const animationIdRef = useRef<number>(0);
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const isAutoAnimateRef = useRef(true);
  const [isAutoAnimate, setIsAutoAnimate] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const exportImage = useCallback(async () => {
    if (!rendererRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = rendererRef.current.domElement;
      const dataUrl = canvas.toDataURL('image/png');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `gradient-art-${timestamp}.png`;
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      
      await fetch('http://localhost:7890/api/exports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          colors: selectedColors
        })
      });
      
      if (onExportSuccess) {
        onExportSuccess();
      }
      
      alert('图片导出成功！');
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  }, [selectedColors, onExportSuccess]);

  useEffect(() => {
    isAutoAnimateRef.current = isAutoAnimate;
  }, [isAutoAnimate]);

  useEffect(() => {
    blobsRef.current.forEach((blob, index) => {
      const colorIndex = index % selectedColors.length;
      blob.color = new THREE.Color(selectedColors[colorIndex]);
    });
  }, [selectedColors]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const initialColors = selectedColors.map(c => new THREE.Color(c));

    blobsRef.current = [];
    for (let i = 0; i < 8; i++) {
      const blob: ColorBlob = {
        position: new THREE.Vector2(
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 1.5
        ),
        velocity: new THREE.Vector2(
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.008
        ),
        color: initialColors[i % initialColors.length],
        radius: 0.3 + Math.random() * 0.3
      };
      blobsRef.current.push(blob);
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const updateCanvas = () => {
      const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 300);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#0f0f1a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);

      blobsRef.current.forEach((blob) => {
        const x = 256 + blob.position.x * 200;
        const y = 256 + blob.position.y * 200;
        const r = blob.radius * 150;

        const radialGradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        const colorStr = `rgba(${Math.floor(blob.color.r * 255)}, ${Math.floor(blob.color.g * 255)}, ${Math.floor(blob.color.b * 255)}, 0.7)`;
        radialGradient.addColorStop(0, colorStr);
        radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = radialGradient;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });

      texture.needsUpdate = true;
    };

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (isAutoAnimateRef.current) {
        blobsRef.current.forEach((blob) => {
          blob.position.add(blob.velocity);

          if (Math.abs(blob.position.x) > 1.2) {
            blob.velocity.x *= -1;
          }
          if (Math.abs(blob.position.y) > 1.2) {
            blob.velocity.y *= -1;
          }

          blobsRef.current.forEach((otherBlob) => {
            if (blob !== otherBlob) {
              const dist = blob.position.distanceTo(otherBlob.position);
              if (dist < 0.5 && dist > 0) {
                const force = (0.5 - dist) * 0.002;
                const dir = otherBlob.position.clone().sub(blob.position).normalize();
                blob.velocity.add(dir.multiplyScalar(-force));
                otherBlob.velocity.add(dir.multiplyScalar(force));
              }
            }
          });
        });
      }

      updateCanvas();
      renderer.render(scene, camera);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;

      blobsRef.current.forEach((blob) => {
        const dist = new THREE.Vector2(mouseRef.current.x, mouseRef.current.y).distanceTo(blob.position);
        if (dist < 0.8) {
          const force = (0.8 - dist) * 0.003;
          const dir = blob.position.clone().sub(mouseRef.current).normalize();
          blob.velocity.add(dir.multiplyScalar(force));
        }
      });
    };

    const handleResize = () => {
      if (!containerRef.current || !renderer) return;
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    containerRef.current.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      containerRef.current?.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '500px',
          borderRadius: '12px',
          overflow: 'hidden',
          cursor: 'crosshair'
        }} 
      />
      <div style={{ 
        marginTop: '15px', 
        display: 'flex', 
        gap: '10px',
        justifyContent: 'center'
      }}>
        <button 
          onClick={() => setIsAutoAnimate(!isAutoAnimate)}
          style={{
            padding: '10px 20px',
            background: isAutoAnimate ? '#ff6b6b' : '#4ecdc4',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          {isAutoAnimate ? '⏸️ 暂停动画' : '▶️ 播放动画'}
        </button>
        <button 
          onClick={exportImage}
          disabled={isExporting}
          style={{
            padding: '10px 20px',
            background: isExporting ? '#666' : '#45b7d1',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          {isExporting ? '导出中...' : '💾 导出图片'}
        </button>
      </div>
    </div>
  );
}
