export interface Vec2 {
  x: number;
  y: number;
}

export interface Particle {
  id: number;
  position: Vec2;
  velocity: Vec2;
  acceleration: Vec2;
  mass: number;
  radius: number;
  color: string;
  fixed: boolean;
  trail: Vec2[];
  max_trail_length: number;
}

export interface SimulationConfig {
  gravity: number;
  air_drag: number;
  time_step: number;
  sub_steps: number;
  enable_collisions: boolean;
  enable_gravity: boolean;
  enable_trails: boolean;
}

export interface SimulationRecord {
  id: number;
  name: string;
  type: string;
  config: string;
  created_at: string;
  updated_at: string;
}

export interface ExperimentRecord {
  id: number;
  simulation_id: number;
  name: string;
  parameters: string;
  result: string;
  created_at: string;
}

export type ExperimentType = 'free_fall' | 'projectile' | 'collision' | 'pendulum' | 'orbital';

export interface ExperimentTemplate {
  type: ExperimentType;
  name: string;
  description: string;
  defaultParams: Record<string, number | boolean | string>;
}

export interface PhysicsWasmModule {
  PhysicsEngine: new () => PhysicsEngine;
  calculate_projectile_motion: (
    x0: number,
    y0: number,
    v0: number,
    angle_deg: number,
    gravity: number,
    time_step: number,
    max_time: number
  ) => string;
  calculate_orbital_motion: (
    central_mass: number,
    satellite_mass: number,
    distance: number,
    eccentricity: number,
    steps: number,
    time_step: number
  ) => string;
  calculate_pendulum_motion: (
    length: number,
    gravity: number,
    initial_angle_deg: number,
    initial_angular_vel: number,
    damping: number,
    steps: number,
    time_step: number
  ) => string;
}

export interface PhysicsEngine {
  set_config: (config_json: string) => void;
  get_config: () => string;
  set_boundary: (width: number, height: number, restitution: number) => void;
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
  ) => void;
  remove_particle: (id: number) => void;
  clear_particles: () => void;
  get_particles_count: () => number;
  update: () => void;
  get_particles_json: () => string;
  apply_force_to_particle: (id: number, fx: number, fy: number) => void;
  get_particle_trajectory: (id: number, steps: number) => string;
}
