import { ref } from 'vue';
import type { PhysicsEngine, Particle } from '@/types';

const engine = ref<PhysicsEngine | null>(null);
const particles = ref<Particle[]>([]);
const isWasmLoaded = ref(false);

export function usePhysics() {
  const initWasm = async (): Promise<void> => {
    if (isWasmLoaded.value) return;

    try {
      const module = await import(
        /* @vite-ignore */
        '/wasm/physics_wasm.js'
      );
      const loadedModule = await module.default();
      engine.value = new loadedModule.PhysicsEngine();
      isWasmLoaded.value = true;
    } catch (error: unknown) {
      console.warn('WASM module not available, using JS fallback:', error);
      const fallbackEngine = createFallbackEngine();
      engine.value = fallbackEngine;
      isWasmLoaded.value = true;
    }
  };

  const updatePhysics = (): void => {
    if (!engine.value) return;
    engine.value.update();
    const particlesJson = engine.value.get_particles_json();
    try {
      particles.value = JSON.parse(particlesJson) as Particle[];
    } catch (error: unknown) {
      console.error('Failed to parse particles:', error);
      particles.value = [];
    }
  };

  const setConfig = (config: Record<string, unknown>): void => {
    if (!engine.value) return;
    engine.value.set_config(JSON.stringify(config));
  };

  const getConfig = (): Record<string, unknown> => {
    if (!engine.value) return {};
    try {
      return JSON.parse(engine.value.get_config()) as Record<string, unknown>;
    } catch (error: unknown) {
      console.error('Failed to parse config:', error);
      return {};
    }
  };

  return {
    engine,
    particles,
    isWasmLoaded,
    initWasm,
    updatePhysics,
    setConfig,
    getConfig,
  };
}

function createFallbackEngine(): PhysicsEngine {
  const particles: Particle[] = [];
  let config = {
    gravity: 9.8,
    air_drag: 0.999,
    time_step: 1 / 60,
    sub_steps: 4,
    enable_collisions: true,
    enable_gravity: true,
    enable_trails: true,
  };
  let boundary = { width: 800, height: 600, restitution: 0.8 };

  return {
    set_config: (configJson: string): void => {
      try {
        config = JSON.parse(configJson) as typeof config;
      } catch (error: unknown) {
        console.error('Invalid config:', error);
      }
    },
    get_config: (): string => JSON.stringify(config),
    set_boundary: (width: number, height: number, restitution: number): void => {
      boundary = { width, height, restitution };
    },
    add_particle: (
      id: number,
      x: number,
      y: number,
      vx: number,
      vy: number,
      mass: number,
      radius: number,
      color: string,
      fixed: boolean
    ): void => {
      particles.push({
        id,
        position: { x, y },
        velocity: { x: vx, y: vy },
        acceleration: { x: 0, y: 0 },
        mass,
        radius,
        color,
        fixed,
        trail: [],
        max_trail_length: 100,
      });
    },
    remove_particle: (id: number): void => {
      const index = particles.findIndex((p) => p.id === id);
      if (index !== -1) particles.splice(index, 1);
    },
    clear_particles: (): void => {
      particles.length = 0;
    },
    get_particles_count: (): number => particles.length,
    update: (): void => {
      const subStep = config.time_step / config.sub_steps;
      for (let s = 0; s < config.sub_steps; s++) {
        for (const p of particles) {
          if (p.fixed) continue;
          p.acceleration = { x: 0, y: 0 };
          if (config.enable_gravity) p.acceleration.y = config.gravity;
          p.velocity.x *= config.air_drag;
          p.velocity.y *= config.air_drag;
          p.velocity.x += p.acceleration.x * subStep;
          p.velocity.y += p.acceleration.y * subStep;
          p.position.x += p.velocity.x * subStep;
          p.position.y += p.velocity.y * subStep;

          const r = p.radius;
          if (p.position.x - r < 0) {
            p.position.x = r;
            p.velocity.x = -p.velocity.x * boundary.restitution;
          } else if (p.position.x + r > boundary.width) {
            p.position.x = boundary.width - r;
            p.velocity.x = -p.velocity.x * boundary.restitution;
          }
          if (p.position.y - r < 0) {
            p.position.y = r;
            p.velocity.y = -p.velocity.y * boundary.restitution;
          } else if (p.position.y + r > boundary.height) {
            p.position.y = boundary.height - r;
            p.velocity.y = -p.velocity.y * boundary.restitution;
          }

          if (config.enable_trails) {
            p.trail.push({ x: p.position.x, y: p.position.y });
            if (p.trail.length > p.max_trail_length) p.trail.shift();
          }
        }

        if (config.enable_collisions) {
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              const p1 = particles[i];
              const p2 = particles[j];
              if (!p1 || !p2) continue;
              const dx = p2.position.x - p1.position.x;
              const dy = p2.position.y - p1.position.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const minDist = p1.radius + p2.radius;
              if (dist < minDist && dist > 0) {
                const nx = dx / dist;
                const ny = dy / dist;
                const rvx = p2.velocity.x - p1.velocity.x;
                const rvy = p2.velocity.y - p1.velocity.y;
                const velAlongNormal = rvx * nx + rvy * ny;
                if (velAlongNormal > 0) continue;
                const restitution = 0.8;
                const impulse = -(1 + restitution) * velAlongNormal / (1 / p1.mass + 1 / p2.mass);
                const ix = impulse * nx;
                const iy = impulse * ny;
                if (!p1.fixed) {
                  p1.velocity.x -= ix / p1.mass;
                  p1.velocity.y -= iy / p1.mass;
                }
                if (!p2.fixed) {
                  p2.velocity.x += ix / p2.mass;
                  p2.velocity.y += iy / p2.mass;
                }
                const overlap = minDist - dist;
                const sepX = nx * overlap / 2;
                const sepY = ny * overlap / 2;
                if (!p1.fixed) {
                  p1.position.x -= sepX;
                  p1.position.y -= sepY;
                }
                if (!p2.fixed) {
                  p2.position.x += sepX;
                  p2.position.y += sepY;
                }
              }
            }
          }
        }
      }
    },
    get_particles_json: (): string => JSON.stringify(particles),
    apply_force_to_particle: (id: number, fx: number, fy: number): void => {
      const p = particles.find((p) => p.id === id);
      if (p) {
        p.acceleration.x += fx / p.mass;
        p.acceleration.y += fy / p.mass;
      }
    },
    get_particle_trajectory: (id: number, _steps: number): string => {
      const particle = particles.find((p) => p.id === id);
      if (!particle) return '[]';
      const trajectory = [{ x: particle.position.x, y: particle.position.y }];
      return JSON.stringify(trajectory);
    },
  };
}
