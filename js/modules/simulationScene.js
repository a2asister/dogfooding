import { SimulationStages } from './simulationState.js';

export class SimulationScene {
    constructor(container, simulationState) {
        this.container = container;
        this.simulationState = simulationState;
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        this.cloudSystem = null;
        this.chargeSystem = null;
        this.lightningSystem = null;
        this.thunderSystem = null;
        this.ground = null;
        this.sky = null;
        
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.cameraAngle = { theta: Math.PI / 4, phi: Math.PI / 4 };
        this.cameraDistance = 80;
        this.cameraTarget = new THREE.Vector3(0, 20, 0);
        
        this.previousStage = SimulationStages.IDLE;
        
        this.init = this.init.bind(this);
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.onResize = this.onResize.bind(this);
        this.reset = this.reset.bind(this);
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLighting();
        this.createSky();
        this.createGround();
        this.createCloudSystem();
        this.createChargeSystem();
        this.createLightningSystem();
        this.createThunderSystem();
        this.setupControls();
        
        this.onResize();
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x1a1a2e, 0.003);
    }
    
    createCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.updateCameraPosition();
    }
    
    updateCameraPosition() {
        const { theta, phi } = this.cameraAngle;
        const x = this.cameraDistance * Math.sin(phi) * Math.cos(theta);
        const y = this.cameraDistance * Math.cos(phi) + this.cameraTarget.y;
        const z = this.cameraDistance * Math.sin(phi) * Math.sin(theta);
        
        this.camera.position.set(x, y, z);
        this.camera.lookAt(this.cameraTarget);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        this.container.appendChild(this.renderer.domElement);
    }
    
    createLighting() {
        const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
        this.scene.add(ambientLight);
        
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        this.directionalLight.position.set(50, 100, 50);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 500;
        this.directionalLight.shadow.camera.left = -100;
        this.directionalLight.shadow.camera.right = 100;
        this.directionalLight.shadow.camera.top = 100;
        this.directionalLight.shadow.camera.bottom = -100;
        this.scene.add(this.directionalLight);
        
        this.flashLight = new THREE.PointLight(0xffffff, 0, 150);
        this.flashLight.position.set(0, 40, 0);
        this.scene.add(this.flashLight);
    }
    
    createSky() {
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x1a1a2e) },
                bottomColor: { value: new THREE.Color(0x16213e) },
                offset: { value: 33 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        this.sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.sky);
    }
    
    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(400, 400);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d4a3e,
            roughness: 0.9,
            metalness: 0.1
        });
        
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.y = -5;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
    }
    
    createCloudSystem() {
        this.cloudSystem = new CloudSystem();
        this.scene.add(this.cloudSystem.mesh);
    }
    
    createChargeSystem() {
        this.chargeSystem = new ChargeSystem();
        this.scene.add(this.chargeSystem.positiveGroup);
        this.scene.add(this.chargeSystem.negativeGroup);
    }
    
    createLightningSystem() {
        this.lightningSystem = new LightningSystem();
        this.scene.add(this.lightningSystem.group);
    }
    
    createThunderSystem() {
        this.thunderSystem = new ThunderSystem();
        this.scene.add(this.thunderSystem.group);
    }
    
    setupControls() {
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('wheel', (e) => this.onWheel(e));
        
        canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));
    }
    
    onMouseDown(e) {
        this.isDragging = true;
        this.previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    }
    
    onMouseMove(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;
        
        this.cameraAngle.theta -= deltaX * 0.01;
        this.cameraAngle.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, this.cameraAngle.phi + deltaY * 0.01));
        
        this.updateCameraPosition();
        
        this.previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    }
    
    onMouseUp() {
        this.isDragging = false;
    }
    
    onWheel(e) {
        e.preventDefault();
        this.cameraDistance = Math.max(20, Math.min(200, this.cameraDistance + e.deltaY * 0.1));
        this.updateCameraPosition();
    }
    
    onTouchStart(e) {
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.previousMousePosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
    }
    
    onTouchMove(e) {
        if (!this.isDragging || e.touches.length !== 1) return;
        
        const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
        const deltaY = e.touches[0].clientY - this.previousMousePosition.y;
        
        this.cameraAngle.theta -= deltaX * 0.01;
        this.cameraAngle.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, this.cameraAngle.phi + deltaY * 0.01));
        
        this.updateCameraPosition();
        
        this.previousMousePosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    }
    
    onTouchEnd() {
        this.isDragging = false;
    }
    
    setView(viewType) {
        switch (viewType) {
            case 'overview':
                this.cameraAngle = { theta: Math.PI / 4, phi: Math.PI / 4 };
                this.cameraDistance = 80;
                this.cameraTarget = new THREE.Vector3(0, 20, 0);
                break;
            case 'close':
                this.cameraAngle = { theta: 0, phi: Math.PI / 6 };
                this.cameraDistance = 40;
                this.cameraTarget = new THREE.Vector3(0, 30, 0);
                break;
            case 'inside':
                this.cameraAngle = { theta: Math.PI / 2, phi: Math.PI / 3 };
                this.cameraDistance = 25;
                this.cameraTarget = new THREE.Vector3(0, 25, 0);
                break;
        }
        this.updateCameraPosition();
    }
    
    update(deltaTime) {
        const state = this.simulationState;
        const currentStage = state.currentStage;
        
        if (this.previousStage === SimulationStages.LIGHTNING && 
            currentStage === SimulationStages.THUNDER) {
            const lightningPos = this.lightningSystem.lastLightningPosition;
            this.thunderSystem.triggerFromLightning(
                lightningPos.groundX || lightningPos.x,
                lightningPos.y || 20,
                lightningPos.groundZ || lightningPos.z
            );
        }
        
        this.previousStage = currentStage;
        
        if (state.showParticles) {
            this.cloudSystem.update(deltaTime, state);
            this.chargeSystem.update(deltaTime, state);
        }
        
        if (state.isLightningActive) {
            this.lightningSystem.update(deltaTime, state);
            this.flashLight.intensity = 3 + Math.random() * 2;
        } else {
            this.flashLight.intensity = 0;
            this.lightningSystem.hide();
        }
        
        this.thunderSystem.update(deltaTime, state);
        
        this.updateSkyLighting(state);
    }
    
    updateSkyLighting(state) {
        const stage = state.currentStage;
        let intensity = 0.5;
        let color = new THREE.Color(0x404060);
        
        switch (stage) {
            case SimulationStages.MOISTURE_RISING:
                intensity = 0.6 - state.stageProgress * 0.1;
                break;
            case SimulationStages.CLOUD_FORMING:
                intensity = 0.5 - state.stageProgress * 0.15;
                color = new THREE.Color(0x303050);
                break;
            case SimulationStages.CHARGE_SEPARATION:
                intensity = 0.35 + Math.sin(Date.now() * 0.001) * 0.05;
                color = new THREE.Color(0x252545);
                break;
            case SimulationStages.LIGHTNING:
                intensity = 0.3 + Math.random() * 0.4;
                color = new THREE.Color(0x303060);
                break;
        }
        
        this.scene.children.forEach(child => {
            if (child instanceof THREE.AmbientLight) {
                child.intensity = intensity;
                child.color = color;
            }
        });
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
    
    takeScreenshot() {
        this.render();
        const dataURL = this.renderer.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `thunderstorm-screenshot-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
        return dataURL;
    }
    
    reset() {
        this.previousStage = SimulationStages.IDLE;
        this.cloudSystem.reset();
        this.chargeSystem.reset();
        this.lightningSystem.reset();
        this.thunderSystem.reset();
    }
}

class CloudSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 500;
        this.group = new THREE.Group();
        this.mesh = this.group;
        
        this.createParticles();
    }
    
    createParticles() {
        const geometry = new THREE.SphereGeometry(0.3, 8, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0x8888aa,
            transparent: true,
            opacity: 0.6,
            roughness: 0.9
        });
        
        for (let i = 0; i < this.maxParticles; i++) {
            const particle = new THREE.Mesh(geometry, material.clone());
            particle.position.set(
                (Math.random() - 0.5) * 60,
                -10 + Math.random() * 5,
                (Math.random() - 0.5) * 60
            );
            particle.userData = {
                baseY: particle.position.y,
                speed: 0.5 + Math.random() * 1.5,
                phase: Math.random() * Math.PI * 2,
                active: false,
                cloudLevel: 0
            };
            particle.visible = false;
            this.group.add(particle);
            this.particles.push(particle);
        }
    }
    
    update(deltaTime, state) {
        const stage = state.currentStage;
        const progress = state.stageProgress;
        const moistureFactor = state.moisture / 100;
        const updraftFactor = state.updraftStrength / 10;
        
        const activeCount = Math.floor(this.maxParticles * moistureFactor * Math.min(progress * 2, 1));
        
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            
            if (i < activeCount && stage !== SimulationStages.IDLE) {
                particle.visible = true;
                particle.userData.active = true;
                
                const userData = particle.userData;
                userData.phase += deltaTime * 2;
                
                let targetY = 10;
                let opacity = 0.3;
                let color = new THREE.Color(0xaaaaaa);
                
                switch (stage) {
                    case SimulationStages.MOISTURE_RISING:
                        targetY = 10 + progress * 20;
                        opacity = 0.2 + progress * 0.3;
                        color = new THREE.Color(0xccccdd);
                        break;
                        
                    case SimulationStages.CLOUD_FORMING:
                        targetY = 25 + Math.sin(i * 0.1) * 10;
                        opacity = 0.4 + progress * 0.3;
                        color = new THREE.Color(0x666688).lerp(new THREE.Color(0x444466), progress);
                        break;
                        
                    case SimulationStages.CHARGE_SEPARATION:
                    case SimulationStages.LIGHTNING:
                    case SimulationStages.THUNDER:
                        targetY = 30 + Math.sin(i * 0.1 + Date.now() * 0.001) * 5;
                        opacity = 0.7;
                        color = new THREE.Color(0x333355);
                        break;
                }
                
                particle.position.y += (targetY - particle.position.y) * deltaTime * userData.speed * updraftFactor;
                particle.position.x += Math.sin(userData.phase) * deltaTime * 2;
                particle.position.z += Math.cos(userData.phase) * deltaTime * 2;
                
                const distanceFromCenter = Math.sqrt(
                    particle.position.x * particle.position.x +
                    particle.position.z * particle.position.z
                );
                if (distanceFromCenter > 30) {
                    particle.position.x *= 0.95;
                    particle.position.z *= 0.95;
                }
                
                particle.material.opacity = opacity;
                particle.material.color.copy(color);
                
                const scale = 0.8 + Math.sin(userData.phase * 0.5) * 0.2;
                particle.scale.setScalar(scale);
                
            } else {
                particle.visible = false;
                particle.userData.active = false;
            }
        }
    }
    
    reset() {
        this.particles.forEach(particle => {
            particle.visible = false;
            particle.position.set(
                (Math.random() - 0.5) * 60,
                -10 + Math.random() * 5,
                (Math.random() - 0.5) * 60
            );
            particle.userData.active = false;
        });
    }
}

class ChargeSystem {
    constructor() {
        this.positiveParticles = [];
        this.negativeParticles = [];
        this.maxChargeParticles = 100;
        
        this.positiveGroup = new THREE.Group();
        this.negativeGroup = new THREE.Group();
        
        this.createParticles();
    }
    
    createParticles() {
        const positiveGeometry = new THREE.SphereGeometry(0.2, 6, 6);
        const positiveMaterial = new THREE.MeshBasicMaterial({
            color: 0x22c55e,
            transparent: true,
            opacity: 0.8
        });
        
        const negativeGeometry = new THREE.SphereGeometry(0.2, 6, 6);
        const negativeMaterial = new THREE.MeshBasicMaterial({
            color: 0xef4444,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < this.maxChargeParticles; i++) {
            const posParticle = new THREE.Mesh(positiveGeometry, positiveMaterial.clone());
            const negParticle = new THREE.Mesh(negativeGeometry, negativeMaterial.clone());
            
            posParticle.position.set(
                (Math.random() - 0.5) * 30,
                35 + Math.random() * 10,
                (Math.random() - 0.5) * 30
            );
            negParticle.position.set(
                (Math.random() - 0.5) * 30,
                15 + Math.random() * 10,
                (Math.random() - 0.5) * 30
            );
            
            posParticle.userData = { speed: 1 + Math.random(), phase: Math.random() * Math.PI * 2 };
            negParticle.userData = { speed: 1 + Math.random(), phase: Math.random() * Math.PI * 2 };
            
            posParticle.visible = false;
            negParticle.visible = false;
            
            this.positiveGroup.add(posParticle);
            this.negativeGroup.add(negParticle);
            
            this.positiveParticles.push(posParticle);
            this.negativeParticles.push(negParticle);
        }
    }
    
    update(deltaTime, state) {
        const stage = state.currentStage;
        const progress = state.stageProgress;
        
        if (stage === SimulationStages.CHARGE_SEPARATION ||
            stage === SimulationStages.LIGHTNING ||
            stage === SimulationStages.THUNDER) {
            
            const activeRatio = stage === SimulationStages.CHARGE_SEPARATION ? progress : 1;
            const activeCount = Math.floor(this.maxChargeParticles * activeRatio);
            
            for (let i = 0; i < this.maxChargeParticles; i++) {
                const posParticle = this.positiveParticles[i];
                const negParticle = this.negativeParticles[i];
                
                if (i < activeCount) {
                    posParticle.visible = true;
                    negParticle.visible = true;
                    
                    posParticle.userData.phase += deltaTime * posParticle.userData.speed * 2;
                    negParticle.userData.phase += deltaTime * negParticle.userData.speed * 2;
                    
                    posParticle.position.x += Math.sin(posParticle.userData.phase) * deltaTime * 3;
                    posParticle.position.z += Math.cos(posParticle.userData.phase) * deltaTime * 3;
                    
                    negParticle.position.x += Math.sin(negParticle.userData.phase) * deltaTime * 3;
                    negParticle.position.z += Math.cos(negParticle.userData.phase) * deltaTime * 3;
                    
                    const posIntensity = 0.5 + Math.sin(posParticle.userData.phase * 3) * 0.3;
                    const negIntensity = 0.5 + Math.sin(negParticle.userData.phase * 3) * 0.3;
                    
                    posParticle.material.opacity = 0.6 + posIntensity * 0.4;
                    negParticle.material.opacity = 0.6 + negIntensity * 0.4;
                    
                    const posScale = 0.8 + posIntensity * 0.4;
                    const negScale = 0.8 + negIntensity * 0.4;
                    posParticle.scale.setScalar(posScale);
                    negParticle.scale.setScalar(negScale);
                    
                } else {
                    posParticle.visible = false;
                    negParticle.visible = false;
                }
            }
        } else {
            this.positiveParticles.forEach(p => p.visible = false);
            this.negativeParticles.forEach(p => p.visible = false);
        }
    }
    
    reset() {
        this.positiveParticles.forEach(p => p.visible = false);
        this.negativeParticles.forEach(p => p.visible = false);
    }
}

class LightningSystem {
    constructor() {
        this.group = new THREE.Group();
        this.bolts = [];
        this.maxBolts = 3;
        this.lifetime = 0;
        this.lastLightningPosition = { x: 0, y: 20, z: 0 };
        
        this.createBolts();
    }
    
    createBolts() {
        for (let i = 0; i < this.maxBolts; i++) {
            const bolt = this.createLightningBolt();
            bolt.visible = false;
            this.group.add(bolt);
            this.bolts.push(bolt);
        }
    }
    
    createLightningBolt() {
        const group = new THREE.Group();
        
        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1
        });
        
        const glowMaterial = new THREE.LineBasicMaterial({
            color: 0xaaaaff,
            transparent: true,
            opacity: 0.5,
            linewidth: 3
        });
        
        const glow2Material = new THREE.LineBasicMaterial({
            color: 0x8844ff,
            transparent: true,
            opacity: 0.3,
            linewidth: 5
        });
        
        group.userData = {
            mainLine: null,
            glowLine: null,
            glow2Line: null,
            startY: 40,
            endY: -5,
            points: []
        };
        
        return group;
    }
    
    generateLightningPath(startX, startY, startZ, endX, endY, endZ) {
        const points = [];
        const segments = 8 + Math.floor(Math.random() * 6);
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = startX + (endX - startX) * t;
            const y = startY + (endY - startY) * t;
            const z = startZ + (endZ - startZ) * t;
            
            const offset = i > 0 && i < segments ? (Math.random() - 0.5) * 10 : 0;
            
            points.push(new THREE.Vector3(
                x + offset,
                y,
                z + offset
            ));
        }
        
        return points;
    }
    
    update(deltaTime, state) {
        this.lifetime += deltaTime;
        
        const flashInterval = 0.1 + Math.random() * 0.2;
        
        if (this.lifetime > flashInterval) {
            this.lifetime = 0;
            this.triggerLightning();
        }
        
        this.bolts.forEach(bolt => {
            if (bolt.visible && bolt.userData.mainLine) {
                const flicker = 0.7 + Math.random() * 0.3;
                bolt.userData.mainLine.material.opacity = flicker;
                bolt.userData.glowLine.material.opacity = flicker * 0.5;
                bolt.userData.glow2Line.material.opacity = flicker * 0.3;
            }
        });
    }
    
    triggerLightning() {
        const boltIndex = Math.floor(Math.random() * this.maxBolts);
        const bolt = this.bolts[boltIndex];
        
        if (bolt.userData.mainLine) {
            bolt.remove(bolt.userData.mainLine);
            bolt.remove(bolt.userData.glowLine);
            bolt.remove(bolt.userData.glow2Line);
        }
        
        const startX = (Math.random() - 0.5) * 20;
        const startY = 35 + Math.random() * 10;
        const startZ = (Math.random() - 0.5) * 20;
        
        const endX = (Math.random() - 0.5) * 15;
        const endY = -5;
        const endZ = (Math.random() - 0.5) * 15;
        
        const points = this.generateLightningPath(startX, startY, startZ, endX, endY, endZ);
        bolt.userData.points = points;
        
        this.lastLightningPosition = {
            x: (startX + endX) / 2,
            y: startY,
            z: (startZ + endZ) / 2,
            groundX: endX,
            groundZ: endZ
        };
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        const mainMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1
        });
        
        const glowMaterial = new THREE.LineBasicMaterial({
            color: 0xaaaaff,
            transparent: true,
            opacity: 0.5
        });
        
        const glow2Material = new THREE.LineBasicMaterial({
            color: 0x8844ff,
            transparent: true,
            opacity: 0.3
        });
        
        const mainLine = new THREE.Line(geometry, mainMaterial);
        const glowLine = new THREE.Line(geometry.clone(), glowMaterial);
        const glow2Line = new THREE.Line(geometry.clone(), glow2Material);
        
        bolt.userData.mainLine = mainLine;
        bolt.userData.glowLine = glowLine;
        bolt.userData.glow2Line = glow2Line;
        
        bolt.add(glow2Line);
        bolt.add(glowLine);
        bolt.add(mainLine);
        
        bolt.visible = true;
        
        setTimeout(() => {
            bolt.visible = false;
        }, 100 + Math.random() * 150);
    }
    
    hide() {
        this.bolts.forEach(bolt => bolt.visible = false);
    }
    
    reset() {
        this.hide();
        this.lifetime = 0;
    }
}

class ThunderSystem {
    constructor() {
        this.group = new THREE.Group();
        this.shockWaves = [];
        this.soundWaves = [];
        this.heatParticles = [];
        this.expansionSpheres = [];
        
        this.lightningPositions = [];
        this.isTriggered = false;
        
        this.createShockWaves();
        this.createSoundWaves();
        this.createHeatParticles();
        this.createExpansionSpheres();
    }
    
    createShockWaves() {
        for (let i = 0; i < 3; i++) {
            const geometry = new THREE.RingGeometry(0.5, 1, 64);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffaa66,
                transparent: true,
                opacity: 0.9,
                side: THREE.DoubleSide
            });
            
            const wave = new THREE.Mesh(geometry, material);
            wave.rotation.x = -Math.PI / 2;
            wave.position.y = -4.5;
            wave.visible = false;
            
            wave.userData = {
                maxRadius: 100,
                lifetime: 0,
                maxLifetime: 1.5,
                speed: 80,
                waveIndex: i,
                delay: i * 0.15
            };
            
            this.group.add(wave);
            this.shockWaves.push(wave);
        }
    }
    
    createSoundWaves() {
        const waveConfigs = [
            { color: 0x6688aa, speed: 60, opacity: 0.5 },
            { color: 0x5577aa, speed: 45, opacity: 0.4 },
            { color: 0x446699, speed: 35, opacity: 0.3 }
        ];
        
        for (let layer = 0; layer < 3; layer++) {
            for (let i = 0; i < 4; i++) {
                const config = waveConfigs[layer];
                const geometry = new THREE.RingGeometry(0.3, 0.6, 48);
                const material = new THREE.MeshBasicMaterial({
                    color: config.color,
                    transparent: true,
                    opacity: config.opacity,
                    side: THREE.DoubleSide
                });
                
                const wave = new THREE.Mesh(geometry, material);
                wave.rotation.x = -Math.PI / 2;
                wave.position.y = -4.5;
                wave.visible = false;
                
                wave.userData = {
                    maxRadius: 120,
                    lifetime: 0,
                    maxLifetime: 2.5 + layer * 0.5,
                    speed: config.speed,
                    layer: layer,
                    delay: layer * 0.2 + i * 0.08
                };
                
                this.group.add(wave);
                this.soundWaves.push(wave);
            }
        }
    }
    
    createHeatParticles() {
        for (let i = 0; i < 80; i++) {
            const geometry = new THREE.SphereGeometry(0.15 + Math.random() * 0.1, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.08 + Math.random() * 0.08, 1, 0.6),
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(geometry, material);
            particle.visible = false;
            
            particle.userData = {
                velocity: new THREE.Vector3(),
                lifetime: 0,
                maxLifetime: 0.8 + Math.random() * 0.6,
                baseScale: 0.5 + Math.random() * 0.5
            };
            
            this.group.add(particle);
            this.heatParticles.push(particle);
        }
    }
    
    createExpansionSpheres() {
        for (let i = 0; i < 3; i++) {
            const geometry = new THREE.SphereGeometry(0.5, 32, 32);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.3,
                side: THREE.BackSide
            });
            
            const sphere = new THREE.Mesh(geometry, material);
            sphere.visible = false;
            
            sphere.userData = {
                maxRadius: 30,
                lifetime: 0,
                maxLifetime: 0.5,
                delay: i * 0.08
            };
            
            this.group.add(sphere);
            this.expansionSpheres.push(sphere);
        }
    }
    
    setLightningPosition(x, y, z) {
        this.lightningPositions.push({ x, y, z });
    }
    
    triggerFromLightning(lightningX, lightningY, lightningZ) {
        const groundX = lightningX;
        const groundZ = lightningZ;
        
        this.shockWaves.forEach((wave, index) => {
            wave.position.x = groundX;
            wave.position.z = groundZ;
            wave.userData.lifetime = -wave.userData.delay;
            wave.visible = true;
            wave.material.color.setHex(0xffaa66);
        });
        
        this.soundWaves.forEach((wave, index) => {
            wave.position.x = groundX + (Math.random() - 0.5) * 5;
            wave.position.z = groundZ + (Math.random() - 0.5) * 5;
            wave.userData.lifetime = -wave.userData.delay;
            wave.visible = true;
        });
        
        this.expansionSpheres.forEach((sphere, index) => {
            sphere.position.set(groundX, lightningY * 0.5, groundZ);
            sphere.userData.lifetime = -sphere.userData.delay;
            sphere.visible = true;
        });
        
        this.emitHeatParticles(groundX, lightningY * 0.5, groundZ);
        
        this.isTriggered = true;
    }
    
    emitHeatParticles(x, y, z) {
        this.heatParticles.forEach((particle, i) => {
            particle.position.set(x, y, z);
            particle.visible = true;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = 15 + Math.random() * 25;
            const verticalSpeed = 20 + Math.random() * 30;
            
            particle.userData.velocity.set(
                Math.cos(angle) * speed,
                verticalSpeed,
                Math.sin(angle) * speed
            );
            particle.userData.lifetime = 0;
            particle.userData.maxLifetime = 0.6 + Math.random() * 0.4;
            particle.userData.baseScale = 0.5 + Math.random() * 0.5;
            
            const hue = 0.05 + Math.random() * 0.1;
            particle.material.color.setHSL(hue, 1, 0.6);
        });
    }
    
    update(deltaTime, state) {
        this.shockWaves.forEach(wave => {
            if (wave.visible) {
                wave.userData.lifetime += deltaTime;
                
                if (wave.userData.lifetime >= 0) {
                    const progress = wave.userData.lifetime / wave.userData.maxLifetime;
                    const currentRadius = progress * wave.userData.maxRadius;
                    
                    wave.scale.setScalar(currentRadius);
                    wave.material.opacity = (1 - progress) * 0.8;
                    
                    const hue = 0.08 - progress * 0.08;
                    wave.material.color.setHSL(hue, 0.8, 0.6);
                    
                    if (wave.userData.lifetime >= wave.userData.maxLifetime) {
                        wave.visible = false;
                    }
                }
            }
        });
        
        this.soundWaves.forEach(wave => {
            if (wave.visible) {
                wave.userData.lifetime += deltaTime;
                
                if (wave.userData.lifetime >= 0) {
                    const progress = wave.userData.lifetime / wave.userData.maxLifetime;
                    const currentRadius = progress * wave.userData.maxRadius;
                    
                    wave.scale.setScalar(currentRadius);
                    wave.material.opacity = (1 - progress) * (0.3 + wave.userData.layer * 0.1);
                    
                    if (wave.userData.lifetime >= wave.userData.maxLifetime) {
                        wave.visible = false;
                    }
                }
            }
        });
        
        this.expansionSpheres.forEach(sphere => {
            if (sphere.visible) {
                sphere.userData.lifetime += deltaTime;
                
                if (sphere.userData.lifetime >= 0) {
                    const progress = sphere.userData.lifetime / sphere.userData.maxLifetime;
                    const currentRadius = progress * sphere.userData.maxRadius;
                    
                    sphere.scale.setScalar(currentRadius);
                    sphere.material.opacity = (1 - progress) * 0.3;
                    
                    if (sphere.userData.lifetime >= sphere.userData.maxLifetime) {
                        sphere.visible = false;
                    }
                }
            }
        });
        
        this.heatParticles.forEach(particle => {
            if (particle.visible) {
                particle.userData.lifetime += deltaTime;
                const progress = particle.userData.lifetime / particle.userData.maxLifetime;
                
                particle.position.x += particle.userData.velocity.x * deltaTime;
                particle.position.y += particle.userData.velocity.y * deltaTime;
                particle.position.z += particle.userData.velocity.z * deltaTime;
                
                particle.userData.velocity.y -= 40 * deltaTime;
                particle.userData.velocity.multiplyScalar(0.98);
                
                const scale = particle.userData.baseScale * (1 + progress * 2);
                particle.scale.setScalar(scale);
                particle.material.opacity = (1 - progress) * 0.9;
                
                const hue = 0.08 - progress * 0.06;
                particle.material.color.setHSL(hue, 1, 0.5 + progress * 0.3);
                
                if (progress >= 1) {
                    particle.visible = false;
                }
            }
        });
    }
    
    hide() {
        this.shockWaves.forEach(wave => wave.visible = false);
        this.soundWaves.forEach(wave => wave.visible = false);
        this.heatParticles.forEach(particle => particle.visible = false);
        this.expansionSpheres.forEach(sphere => sphere.visible = false);
    }
    
    reset() {
        this.hide();
        this.isTriggered = false;
        this.lightningPositions = [];
    }
}
