extern crate wee_alloc;
extern crate serde;
extern crate serde_json;

use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use std::f64::consts::PI;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(Serialize, Deserialize, Clone, Copy)]
pub struct Vec2 {
    pub x: f64,
    pub y: f64,
}

impl Vec2 {
    pub fn new(x: f64, y: f64) -> Self {
        Self { x, y }
    }

    pub fn add(&self, other: &Vec2) -> Vec2 {
        Vec2 { x: self.x + other.x, y: self.y + other.y }
    }

    pub fn sub(&self, other: &Vec2) -> Vec2 {
        Vec2 { x: self.x - other.x, y: self.y - other.y }
    }

    pub fn mul(&self, scalar: f64) -> Vec2 {
        Vec2 { x: self.x * scalar, y: self.y * scalar }
    }

    pub fn dot(&self, other: &Vec2) -> f64 {
        self.x * other.x + self.y * other.y
    }

    pub fn length(&self) -> f64 {
        (self.x * self.x + self.y * self.y).sqrt()
    }

    pub fn normalize(&self) -> Vec2 {
        let len = self.length();
        if len > 0.0 {
            self.mul(1.0 / len)
        } else {
            Vec2::new(0.0, 0.0)
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Particle {
    pub id: u32,
    pub position: Vec2,
    pub velocity: Vec2,
    pub acceleration: Vec2,
    pub mass: f64,
    pub radius: f64,
    pub color: String,
    pub fixed: bool,
    pub trail: Vec<Vec2>,
    pub max_trail_length: usize,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Boundary {
    pub width: f64,
    pub height: f64,
    pub restitution: f64,
}

#[derive(Serialize, Deserialize)]
pub struct SimulationConfig {
    pub gravity: f64,
    pub air_drag: f64,
    pub time_step: f64,
    pub sub_steps: u32,
    pub enable_collisions: bool,
    pub enable_gravity: bool,
    pub enable_trails: bool,
}

#[wasm_bindgen]
pub struct PhysicsEngine {
    particles: Vec<Particle>,
    config: SimulationConfig,
    boundary: Boundary,
}

#[wasm_bindgen]
impl PhysicsEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            particles: Vec::new(),
            config: SimulationConfig {
                gravity: 9.8,
                air_drag: 0.999,
                time_step: 1.0 / 60.0,
                sub_steps: 4,
                enable_collisions: true,
                enable_gravity: true,
                enable_trails: true,
            },
            boundary: Boundary {
                width: 800.0,
                height: 600.0,
                restitution: 0.8,
            },
        }
    }

    #[wasm_bindgen]
    pub fn set_config(&mut self, config_json: &str) -> Result<(), JsValue> {
        match serde_json::from_str::<SimulationConfig>(config_json) {
            Ok(config) => {
                self.config = config;
                Ok(())
            }
            Err(e) => Err(JsValue::from_str(&e.to_string())),
        }
    }

    #[wasm_bindgen]
    pub fn get_config(&self) -> String {
        serde_json::to_string(&self.config).unwrap_or_default()
    }

    #[wasm_bindgen]
    pub fn set_boundary(&mut self, width: f64, height: f64, restitution: f64) {
        self.boundary = Boundary { width, height, restitution };
    }

    #[wasm_bindgen]
    pub fn add_particle(
        &mut self,
        id: u32,
        x: f64,
        y: f64,
        vx: f64,
        vy: f64,
        mass: f64,
        radius: f64,
        color: &str,
        fixed: bool,
    ) {
        let particle = Particle {
            id,
            position: Vec2::new(x, y),
            velocity: Vec2::new(vx, vy),
            acceleration: Vec2::new(0.0, 0.0),
            mass,
            radius,
            color: color.to_string(),
            fixed,
            trail: Vec::new(),
            max_trail_length: 100,
        };
        self.particles.push(particle);
    }

    #[wasm_bindgen]
    pub fn remove_particle(&mut self, id: u32) {
        self.particles.retain(|p| p.id != id);
    }

    #[wasm_bindgen]
    pub fn clear_particles(&mut self) {
        self.particles.clear();
    }

    #[wasm_bindgen]
    pub fn get_particles_count(&self) -> usize {
        self.particles.len()
    }

    #[wasm_bindgen]
    pub fn update(&mut self) {
        let sub_step = self.config.time_step / self.config.sub_steps as f64;

        for _ in 0..self.config.sub_steps {
            self.apply_forces();
            self.integrate(sub_step);
            if self.config.enable_collisions {
                self.handle_collisions();
            }
            self.handle_boundary();
            self.update_trails();
        }
    }

    #[wasm_bindgen]
    pub fn get_particles_json(&self) -> String {
        serde_json::to_string(&self.particles).unwrap_or_default()
    }

    #[wasm_bindgen]
    pub fn apply_force_to_particle(&mut self, id: u32, fx: f64, fy: f64) {
        if let Some(particle) = self.particles.iter_mut().find(|p| p.id == id) {
            particle.acceleration = particle.acceleration.add(&Vec2::new(fx / particle.mass, fy / particle.mass));
        }
    }

    #[wasm_bindgen]
    pub fn get_particle_trajectory(&self, id: u32, steps: u32) -> String {
        let mut sim = self.clone();
        let mut trajectory = Vec::new();

        if let Some(particle) = sim.particles.iter().find(|p| p.id == id) {
            trajectory.push(particle.position);
        }

        for _ in 0..steps {
            sim.update();
            if let Some(particle) = sim.particles.iter().find(|p| p.id == id) {
                trajectory.push(particle.position);
            }
        }

        serde_json::to_string(&trajectory).unwrap_or_default()
    }
}

impl PhysicsEngine {
    fn apply_forces(&mut self) {
        for particle in &mut self.particles {
            if particle.fixed {
                continue;
            }

            particle.acceleration = Vec2::new(0.0, 0.0);

            if self.config.enable_gravity {
                particle.acceleration.y += self.config.gravity;
            }

            let drag = self.config.air_drag;
            particle.velocity = particle.velocity.mul(drag);
        }
    }

    fn integrate(&mut self, dt: f64) {
        for particle in &mut self.particles {
            if particle.fixed {
                continue;
            }

            particle.velocity = particle.velocity.add(&particle.acceleration.mul(dt));
            particle.position = particle.position.add(&particle.velocity.mul(dt));
        }
    }

    fn handle_collisions(&mut self) {
        let len = self.particles.len();
        for i in 0..len {
            for j in (i + 1)..len {
                let (p1, p2) = {
                    let slice = &mut self.particles[..];
                    let (first, second) = slice.split_at_mut(j);
                    (&mut first[i], &mut second[0])
                };

                let delta = p2.position.sub(&p1.position);
                let distance = delta.length();
                let min_dist = p1.radius + p2.radius;

                if distance < min_dist && distance > 0.0 {
                    let normal = delta.normalize();
                    let relative_velocity = p2.velocity.sub(&p1.velocity);
                    let vel_along_normal = relative_velocity.dot(&normal);

                    if vel_along_normal > 0.0 {
                        continue;
                    }

                    let restitution = 0.8;
                    let impulse = -(1.0 + restitution) * vel_along_normal / 
                        (1.0 / p1.mass + 1.0 / p2.mass);

                    let impulse_vec = normal.mul(impulse);

                    if !p1.fixed {
                        p1.velocity = p1.velocity.sub(&impulse_vec.mul(1.0 / p1.mass));
                    }
                    if !p2.fixed {
                        p2.velocity = p2.velocity.add(&impulse_vec.mul(1.0 / p2.mass));
                    }

                    let overlap = min_dist - distance;
                    let separation = normal.mul(overlap / 2.0);

                    if !p1.fixed {
                        p1.position = p1.position.sub(&separation);
                    }
                    if !p2.fixed {
                        p2.position = p2.position.add(&separation);
                    }
                }
            }
        }
    }

    fn handle_boundary(&mut self) {
        for particle in &mut self.particles {
            if particle.fixed {
                continue;
            }

            let r = particle.radius;
            let rest = self.boundary.restitution;

            if particle.position.x - r < 0.0 {
                particle.position.x = r;
                particle.velocity.x = -particle.velocity.x * rest;
            } else if particle.position.x + r > self.boundary.width {
                particle.position.x = self.boundary.width - r;
                particle.velocity.x = -particle.velocity.x * rest;
            }

            if particle.position.y - r < 0.0 {
                particle.position.y = r;
                particle.velocity.y = -particle.velocity.y * rest;
            } else if particle.position.y + r > self.boundary.height {
                particle.position.y = self.boundary.height - r;
                particle.velocity.y = -particle.velocity.y * rest;
            }
        }
    }

    fn update_trails(&mut self) {
        if !self.config.enable_trails {
            return;
        }

        for particle in &mut self.particles {
            particle.trail.push(particle.position);
            if particle.trail.len() > particle.max_trail_length {
                particle.trail.remove(0);
            }
        }
    }
}

impl Clone for PhysicsEngine {
    fn clone(&self) -> Self {
        Self {
            particles: self.particles.clone(),
            config: SimulationConfig {
                gravity: self.config.gravity,
                air_drag: self.config.air_drag,
                time_step: self.config.time_step,
                sub_steps: self.config.sub_steps,
                enable_collisions: self.config.enable_collisions,
                enable_gravity: self.config.enable_gravity,
                enable_trails: self.config.enable_trails,
            },
            boundary: Boundary {
                width: self.boundary.width,
                height: self.boundary.height,
                restitution: self.boundary.restitution,
            },
        }
    }
}

#[wasm_bindgen]
pub fn calculate_projectile_motion(
    x0: f64,
    y0: f64,
    v0: f64,
    angle_deg: f64,
    gravity: f64,
    time_step: f64,
    max_time: f64,
) -> String {
    let angle = angle_deg * PI / 180.0;
    let vx = v0 * angle.cos();
    let vy = v0 * angle.sin();

    let mut points = Vec::new();
    let mut t = 0.0;

    while t <= max_time {
        let x = x0 + vx * t;
        let y = y0 + vy * t - 0.5 * gravity * t * t;
        if y < 0.0 {
            break;
        }
        points.push(Vec2::new(x, y));
        t += time_step;
    }

    serde_json::to_string(&points).unwrap_or_default()
}

#[wasm_bindgen]
pub fn calculate_orbital_motion(
    central_mass: f64,
    satellite_mass: f64,
    distance: f64,
    eccentricity: f64,
    steps: u32,
    time_step: f64,
) -> String {
    let g = 6.674e-11;
    let mu = g * (central_mass + satellite_mass);

    let a = distance / (1.0 + eccentricity);
    let periapsis_velocity = (mu * (1.0 + eccentricity) / (a * (1.0 - eccentricity))).sqrt();

    let mut points = Vec::new();
    let mut r = distance;
    let mut theta = 0.0;
    let mut vr = 0.0;
    let mut vt = periapsis_velocity;

    for _ in 0..steps {
        let r_sq = r * r;
        let acc_gravity = -mu / r_sq;
        let acc_r = acc_gravity + r * vt * vt;
        let acc_t = -2.0 * vr * vt / r;

        vr += acc_r * time_step;
        vt += acc_t * time_step;

        r += vr * time_step;
        theta += (vt / r) * time_step;

        let x = r * theta.cos();
        let y = r * theta.sin();
        points.push(Vec2::new(x, y));
    }

    serde_json::to_string(&points).unwrap_or_default()
}

#[wasm_bindgen]
pub fn calculate_pendulum_motion(
    length: f64,
    gravity: f64,
    initial_angle_deg: f64,
    initial_angular_vel: f64,
    damping: f64,
    steps: u32,
    time_step: f64,
) -> String {
    let mut theta = initial_angle_deg * PI / 180.0;
    let mut omega = initial_angular_vel;

    let mut points = Vec::new();

    for _ in 0..steps {
        let alpha = -(gravity / length) * theta.sin() - damping * omega;
        omega += alpha * time_step;
        theta += omega * time_step;

        let x = length * theta.sin();
        let y = length * theta.cos();
        points.push(Vec2::new(x, y));
    }

    serde_json::to_string(&points).unwrap_or_default()
}
