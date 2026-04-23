class WindParticles {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.particles = null;
        this.positions = [];
        this.velocities = [];
        this.lifetimes = [];
        this.windSpeed = 1;
        this.isActive = true;
        
        this.init();
    }
    
    init() {
        const particleCount = CONFIG.animation.windParticles.count;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const color = new THREE.Color(0xFFFFFF);
        
        for (let i = 0; i < particleCount; i++) {
            const area = CONFIG.animation.windParticles.area;
            
            positions[i * 3] = (Math.random() - 0.5) * area.x;
            positions[i * 3 + 1] = Math.random() * area.y;
            positions[i * 3 + 2] = (Math.random() - 0.5) * area.z;
            
            this.positions.push({
                x: positions[i * 3],
                y: positions[i * 3 + 1],
                z: positions[i * 3 + 2]
            });
            
            this.velocities.push({
                x: 0,
                y: 0,
                z: 0
            });
            
            this.lifetimes.push(Math.random());
            
            const brightness = 0.5 + Math.random() * 0.5;
            colors[i * 3] = color.r * brightness;
            colors[i * 3 + 1] = color.g * brightness;
            colors[i * 3 + 2] = color.b * brightness;
            
            sizes[i] = 0.2 + Math.random() * 0.3;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            sizeAttenuation: true
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.particles.userData.isWindParticle = true;
        this.scene.add(this.particles);
    }
    
    setWindSpeed(speed) {
        this.windSpeed = speed;
    }
    
    setActive(active) {
        this.isActive = active;
        if (this.particles) {
            this.particles.visible = active;
        }
    }
    
    update(deltaTime) {
        if (!this.isActive || !this.particles) return;
        
        const positions = this.particles.geometry.attributes.position.array;
        const area = CONFIG.animation.windParticles.area;
        const baseSpeed = CONFIG.animation.windParticles.speed;
        
        for (let i = 0; i < this.positions.length; i++) {
            const pos = this.positions[i];
            const vel = this.velocities[i];
            
            vel.z = baseSpeed * this.windSpeed * (0.8 + Math.random() * 0.4);
            vel.x = (Math.random() - 0.5) * 0.02;
            vel.y = (Math.random() - 0.5) * 0.01;
            
            pos.x += vel.x;
            pos.y += vel.y;
            pos.z += vel.z;
            
            if (pos.z > area.z / 2) {
                pos.z = -area.z / 2;
                pos.x = (Math.random() - 0.5) * area.x;
                pos.y = Math.random() * area.y;
            }
            
            positions[i * 3] = pos.x;
            positions[i * 3 + 1] = pos.y;
            positions[i * 3 + 2] = pos.z;
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
    }
    
    reset() {
        if (!this.particles) return;
        
        const positions = this.particles.geometry.attributes.position.array;
        const area = CONFIG.animation.windParticles.area;
        
        for (let i = 0; i < this.positions.length; i++) {
            this.positions[i].x = (Math.random() - 0.5) * area.x;
            this.positions[i].y = Math.random() * area.y;
            this.positions[i].z = (Math.random() - 0.5) * area.z;
            
            positions[i * 3] = this.positions[i].x;
            positions[i * 3 + 1] = this.positions[i].y;
            positions[i * 3 + 2] = this.positions[i].z;
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
    }
    
    dispose() {
        if (this.particles) {
            this.scene.remove(this.particles);
            this.particles.geometry.dispose();
            this.particles.material.dispose();
            this.particles = null;
        }
    }
}
