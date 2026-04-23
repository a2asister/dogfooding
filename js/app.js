class WindPowerApp {
    constructor() {
        this.container = null;
        this.renderer = null;
        this.camera = null;
        this.controls = null;
        this.lights = {};
        
        this.currentScene = null;
        this.currentSceneObject = null;
        this.currentTurbine = null;
        this.windParticles = null;
        this.energyFlow = null;
        
        this.isPlaying = true;
        this.windLevel = CONFIG.windSpeed.defaultLevel;
        this.turbineType = 'horizontal';
        this.sceneType = 'land';
        
        this.controlsUI = null;
        this.dataDisplay = null;
        this.partDetails = null;
        
        this.lastFrameTime = 0;
        this.animationId = null;
        
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.cameraSpherical = {
            radius: 60,
            theta: Math.PI / 4,
            phi: Math.PI / 3
        };
        
        this.init();
    }
    
    init() {
        this.container = document.getElementById('canvas-container');
        
        this.createRenderer();
        this.createCamera();
        this.createLights();
        this.setupCameraControls();
        this.setupEventListeners();
        
        this.initScene();
        this.initTurbine();
        this.initEffects();
        this.initUI();
        
        this.startAnimation();
        
        console.log('风力发电展示系统已启动');
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.container.appendChild(this.renderer.domElement);
    }
    
    createCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.updateCameraPosition();
    }
    
    updateCameraPosition() {
        this.camera.position.x = this.cameraSpherical.radius * Math.sin(this.cameraSpherical.phi) * Math.cos(this.cameraSpherical.theta);
        this.camera.position.y = this.cameraSpherical.radius * Math.cos(this.cameraSpherical.phi);
        this.camera.position.z = this.cameraSpherical.radius * Math.sin(this.cameraSpherical.phi) * Math.sin(this.cameraSpherical.theta);
        this.camera.lookAt(0, 15, 0);
    }
    
    createLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.lights.ambient = ambientLight;
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.lights.directional = directionalLight;
        
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x7CB342, 0.3);
        this.lights.hemisphere = hemisphereLight;
    }
    
    setupCameraControls() {
        this.container.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        this.container.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            
            const deltaX = e.clientX - this.previousMousePosition.x;
            const deltaY = e.clientY - this.previousMousePosition.y;
            
            this.cameraSpherical.theta -= deltaX * 0.01;
            this.cameraSpherical.phi = Utils.clamp(
                this.cameraSpherical.phi - deltaY * 0.01, 
                0.1, 
                Math.PI / 2 - 0.1
            );
            
            this.updateCameraPosition();
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        this.container.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        this.container.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });
        
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.cameraSpherical.radius = Utils.clamp(
                this.cameraSpherical.radius + e.deltaY * 0.05, 
                20, 
                150
            );
            this.updateCameraPosition();
        }, { passive: false });
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.onResize();
        });
    }
    
    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
    
    initScene() {
        this.switchScene('land');
    }
    
    initTurbine() {
        this.switchTurbineType('horizontal');
    }
    
    initEffects() {
        if (this.currentSceneObject) {
            this.windParticles = new WindParticles(
                this.currentSceneObject,
                this.camera
            );
            
            this.energyFlow = new EnergyFlow(this.currentSceneObject);
        }
    }
    
    initUI() {
        this.controlsUI = new Controls(this);
        this.dataDisplay = new DataDisplay(this);
        this.partDetails = new PartDetails(this);
        
        const windData = Utils.getWindSpeedData(this.windLevel);
        document.getElementById('wind-speed-value').textContent = 
            `${this.windLevel}级 (${windData.name})`;
    }
    
    switchScene(sceneType) {
        this.sceneType = sceneType;
        
        if (this.windParticles) {
            this.windParticles.dispose();
            this.windParticles = null;
        }
        if (this.energyFlow) {
            this.energyFlow.dispose();
            this.energyFlow = null;
        }
        
        if (this.currentSceneObject) {
            while (this.currentSceneObject.children.length > 0) {
                this.currentSceneObject.remove(this.currentSceneObject.children[0]);
            }
        }
        
        const newScene = new THREE.Scene();
        
        if (sceneType === 'land') {
            newScene.background = new THREE.Color(0x87CEEB);
            newScene.fog = new THREE.Fog(0xB0E0E6, 80, 300);
            this.setupLandEnvironment(newScene);
        } else {
            newScene.background = new THREE.Color(0x64B5F6);
            newScene.fog = new THREE.Fog(0x90CAF9, 80, 300);
            this.setupSeaEnvironment(newScene);
        }
        
        newScene.add(this.lights.ambient);
        newScene.add(this.lights.directional);
        newScene.add(this.lights.hemisphere);
        
        this.currentSceneObject = newScene;
        
        if (this.currentTurbine) {
            this.currentSceneObject.add(this.currentTurbine.getGroup());
        }
        
        this.initEffects();
        this.updatePartClickableMeshes();
        
        console.log(`已切换到${sceneType === 'land' ? '陆地' : '海上'}风场`);
    }
    
    setupLandEnvironment(scene) {
        const groundGeometry = new THREE.PlaneGeometry(400, 400, 30, 30);
        const vertices = groundGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 1];
            vertices[i + 2] = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 0.5;
        }
        groundGeometry.computeVertexNormals();
        
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x7CB342,
            roughness: 0.8,
            metalness: 0.1
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);
        
        const gridHelper = new THREE.GridHelper(200, 60, 0x558B2F, 0x689F38);
        gridHelper.position.y = 0.01;
        scene.add(gridHelper);
        
        const skyGeometry = new THREE.SphereGeometry(300, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        scene.add(sky);
        
        this.createClouds(scene, 8);
        
        this.createBackgroundTurbines(scene, 'land');
        
        this.createTrees(scene);
        
        this.createGrass(scene);
    }
    
    setupSeaEnvironment(scene) {
        const waterGeometry = new THREE.PlaneGeometry(400, 400, 15, 15);
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x1E88E5,
            roughness: 0.1,
            metalness: 0.5,
            transparent: true,
            opacity: 0.85,
            flatShading: true
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.receiveShadow = true;
        
        const positions = waterGeometry.attributes.position.array;
        water.userData.baseHeights = [];
        water.userData.originalX = [];
        water.userData.originalY = [];
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const baseHeight = Math.sin(x * 0.02) * Math.cos(y * 0.02) * 0.3;
            
            water.userData.baseHeights.push(baseHeight);
            water.userData.originalX.push(x);
            water.userData.originalY.push(y);
            positions[i + 2] = baseHeight;
        }
        waterGeometry.attributes.position.needsUpdate = true;
        
        scene.add(water);
        this.waterMesh = water;
        
        const gridHelper = new THREE.GridHelper(200, 40, 0x1565C0, 0x1976D2);
        gridHelper.position.y = 0.01;
        scene.add(gridHelper);
        
        const skyGeometry = new THREE.SphereGeometry(300, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x64B5F6,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        scene.add(sky);
        
        this.createClouds(scene, 10);
        
        this.createBackgroundTurbines(scene, 'sea');
        
        this.createShips(scene);
    }
    
    createClouds(scene, count) {
        const cloudGeometry = new THREE.SphereGeometry(5, 8, 8);
        const cloudMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.7
        });
        
        this.cloudObjects = [];
        
        for (let i = 0; i < count; i++) {
            const cloudGroup = new THREE.Group();
            
            const cloudCount = scene.type === 'sea' ? 6 : 5;
            for (let j = 0; j < cloudCount; j++) {
                const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
                cloudPart.position.set(
                    (Math.random() - 0.5) * 18,
                    (Math.random() - 0.5) * 4,
                    (Math.random() - 0.5) * 12
                );
                cloudPart.scale.set(
                    0.7 + Math.random() * 0.9,
                    0.5 + Math.random() * 0.5,
                    0.7 + Math.random() * 0.9
                );
                cloudGroup.add(cloudPart);
            }
            
            cloudGroup.position.set(
                (Math.random() - 0.5) * 400,
                70 + Math.random() * 50,
                (Math.random() - 0.5) * 400
            );
            cloudGroup.userData.speed = 0.015 + Math.random() * 0.02;
            
            this.cloudObjects.push(cloudGroup);
            scene.add(cloudGroup);
        }
    }
    
    createBackgroundTurbines(scene, type) {
        const positions = type === 'land' ? [
            { x: -60, z: -50, scale: 0.6 },
            { x: -40, z: -80, scale: 0.5 },
            { x: 50, z: -60, scale: 0.55 },
            { x: 80, z: -40, scale: 0.65 },
            { x: -80, z: 30, scale: 0.45 },
            { x: 70, z: 50, scale: 0.5 },
            { x: -50, z: 80, scale: 0.4 },
            { x: 40, z: 90, scale: 0.35 }
        ] : [
            { x: -70, z: -60, scale: 0.55 },
            { x: -50, z: -90, scale: 0.45 },
            { x: 60, z: -70, scale: 0.5 },
            { x: 90, z: -50, scale: 0.6 },
            { x: -90, z: 40, scale: 0.4 },
            { x: 80, z: 60, scale: 0.45 },
            { x: -60, z: 90, scale: 0.35 },
            { x: 50, z: 100, scale: 0.3 },
            { x: -100, z: -20, scale: 0.4 },
            { x: 100, z: -30, scale: 0.45 }
        ];
        
        this.backgroundTurbines = [];
        
        positions.forEach(pos => {
            const turbine = this.createSimpleTurbine(pos.scale, type);
            turbine.position.set(pos.x, 0, pos.z);
            turbine.userData.rotationSpeed = 0.005 + Math.random() * 0.01;
            this.backgroundTurbines.push(turbine);
            scene.add(turbine);
        });
    }
    
    createSimpleTurbine(scale, type) {
        const group = new THREE.Group();
        
        if (type === 'sea') {
            const foundationGeometry = new THREE.CylinderGeometry(2 * scale, 3 * scale, 8 * scale, 8);
            const foundationMaterial = new THREE.MeshStandardMaterial({
                color: 0x5D4037,
                roughness: 0.8
            });
            const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
            foundation.position.y = -4 * scale;
            foundation.castShadow = true;
            foundation.receiveShadow = true;
            group.add(foundation);
        }
        
        const towerGeometry = new THREE.CylinderGeometry(0.8 * scale, 1.2 * scale, 25 * scale, 8);
        const towerMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B8B8B,
            roughness: 0.7,
            metalness: 0.3
        });
        const tower = new THREE.Mesh(towerGeometry, towerMaterial);
        tower.position.y = 12.5 * scale;
        tower.castShadow = true;
        group.add(tower);
        
        const nacelleGeometry = new THREE.BoxGeometry(4 * scale, 2 * scale, 6 * scale);
        const nacelleMaterial = new THREE.MeshStandardMaterial({
            color: 0xFAFAFA,
            roughness: 0.4,
            metalness: 0.3
        });
        const nacelle = new THREE.Mesh(nacelleGeometry, nacelleMaterial);
        nacelle.position.y = 28 * scale;
        nacelle.castShadow = true;
        group.add(nacelle);
        
        const rotorGroup = new THREE.Group();
        rotorGroup.position.y = 28 * scale;
        rotorGroup.position.z = 3.5 * scale;
        
        const hubGeometry = new THREE.SphereGeometry(1 * scale, 16, 16);
        const hubMaterial = new THREE.MeshStandardMaterial({
            color: 0x555555
        });
        const hub = new THREE.Mesh(hubGeometry, hubMaterial);
        rotorGroup.add(hub);
        
        const bladeGeometry = new THREE.BoxGeometry(0.3 * scale, 12 * scale, 0.8 * scale);
        const bladeMaterial = new THREE.MeshStandardMaterial({
            color: 0xE8E8E8,
            roughness: 0.6,
            metalness: 0.1
        });
        
        for (let i = 0; i < 3; i++) {
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            blade.position.y = 6 * scale;
            blade.rotation.z = (i * Math.PI * 2) / 3;
            blade.castShadow = true;
            rotorGroup.add(blade);
        }
        
        group.add(rotorGroup);
        group.userData.rotor = rotorGroup;
        
        return group;
    }
    
    createTrees(scene) {
        const treePositions = [
            { x: -30, z: 30 },
            { x: -25, z: 45 },
            { x: 35, z: -35 },
            { x: 45, z: -20 },
            { x: -40, z: -30 },
            { x: -50, z: -25 },
            { x: 55, z: 40 },
            { x: 60, z: 25 }
        ];
        
        treePositions.forEach(pos => {
            const tree = this.createTree();
            tree.position.set(pos.x, 0, pos.z);
            tree.scale.set(0.8 + Math.random() * 0.5, 0.8 + Math.random() * 0.5, 0.8 + Math.random() * 0.5);
            scene.add(tree);
        });
    }
    
    createTree() {
        const group = new THREE.Group();
        
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2;
        trunk.castShadow = true;
        group.add(trunk);
        
        const foliageGeometry = new THREE.ConeGeometry(3, 6, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: 0x2E7D32,
            roughness: 0.8
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 7;
        foliage.castShadow = true;
        group.add(foliage);
        
        const foliage2 = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage2.position.y = 10;
        foliage2.scale.set(0.7, 0.7, 0.7);
        foliage2.castShadow = true;
        group.add(foliage2);
        
        return group;
    }
    
    createGrass(scene) {
        const grassGeometry = new THREE.ConeGeometry(0.1, 0.5, 4);
        const grassMaterial = new THREE.MeshStandardMaterial({
            color: 0x558B2F,
            roughness: 0.9
        });
        
        for (let i = 0; i < 200; i++) {
            const grass = new THREE.Mesh(grassGeometry, grassMaterial);
            const angle = Math.random() * Math.PI * 2;
            const radius = 15 + Math.random() * 70;
            
            grass.position.set(
                Math.cos(angle) * radius,
                0.25,
                Math.sin(angle) * radius
            );
            grass.rotation.x = (Math.random() - 0.5) * 0.2;
            grass.rotation.z = (Math.random() - 0.5) * 0.2;
            grass.scale.set(
                0.5 + Math.random() * 1,
                0.5 + Math.random() * 1,
                0.5 + Math.random() * 1
            );
            grass.castShadow = true;
            
            scene.add(grass);
        }
    }
    
    createShips(scene) {
        const shipPositions = [
            { x: -120, z: -80, scale: 0.6 },
            { x: 100, z: -100, scale: 0.5 },
            { x: -80, z: 120, scale: 0.55 }
        ];
        
        this.ships = [];
        
        shipPositions.forEach(pos => {
            const ship = this.createShip();
            ship.position.set(pos.x, 0, pos.z);
            ship.scale.set(pos.scale, pos.scale, pos.scale);
            ship.rotation.y = Math.random() * Math.PI * 2;
            ship.userData.speed = 0.01 + Math.random() * 0.02;
            this.ships.push(ship);
            scene.add(ship);
        });
    }
    
    createShip() {
        const group = new THREE.Group();
        
        const hullGeometry = new THREE.BoxGeometry(8, 2, 3);
        const hullMaterial = new THREE.MeshStandardMaterial({
            color: 0xB71C1C,
            roughness: 0.7
        });
        const hull = new THREE.Mesh(hullGeometry, hullMaterial);
        hull.position.y = 1;
        hull.castShadow = true;
        group.add(hull);
        
        const bowGeometry = new THREE.ConeGeometry(1.5, 3, 4);
        const bowMaterial = new THREE.MeshStandardMaterial({
            color: 0xB71C1C,
            roughness: 0.7
        });
        const bow = new THREE.Mesh(bowGeometry, bowMaterial);
        bow.position.set(4, 1, 0);
        bow.rotation.z = Math.PI / 2;
        bow.castShadow = true;
        group.add(bow);
        
        const superstructureGeometry = new THREE.BoxGeometry(3, 2, 2.5);
        const superstructureMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.5
        });
        const superstructure = new THREE.Mesh(superstructureGeometry, superstructureMaterial);
        superstructure.position.set(-1, 3, 0);
        superstructure.castShadow = true;
        group.add(superstructure);
        
        const mastGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6, 8);
        const mastMaterial = new THREE.MeshStandardMaterial({
            color: 0x424242
        });
        const mast = new THREE.Mesh(mastGeometry, mastMaterial);
        mast.position.set(-1, 7, 0);
        mast.castShadow = true;
        group.add(mast);
        
        const chimneyGeometry = new THREE.CylinderGeometry(0.3, 0.35, 1.5, 8);
        const chimneyMaterial = new THREE.MeshStandardMaterial({
            color: 0x212121
        });
        const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
        chimney.position.set(0, 2.75, 0);
        chimney.castShadow = true;
        group.add(chimney);
        
        return group;
    }
    
    switchTurbineType(type) {
        this.turbineType = type;
        this.recreateTurbine();
    }
    
    recreateTurbine() {
        if (this.currentTurbine && this.currentSceneObject) {
            this.currentSceneObject.remove(this.currentTurbine.getGroup());
        }
        
        if (this.turbineType === 'horizontal') {
            this.currentTurbine = new HorizontalTurbine();
        } else {
            this.currentTurbine = new VerticalTurbine();
        }
        
        const turbineGroup = this.currentTurbine.create(this.sceneType);
        
        if (this.currentSceneObject) {
            this.currentSceneObject.add(turbineGroup);
        }
        
        this.updatePartClickableMeshes();
        
        if (this.isPlaying) {
            const windData = Utils.getWindSpeedData(this.windLevel);
            this.currentTurbine.setRPM(windData.rpm);
        }
    }
    
    updatePartClickableMeshes() {
        if (!this.partDetails || !this.currentTurbine) return;
        
        this.partDetails.clearClickableMeshes();
        
        const parts = this.currentTurbine.getParts();
        
        const addMeshRecursive = (mesh, partKey) => {
            this.partDetails.addClickableMesh(mesh, partKey);
            
            if (mesh.children && mesh.children.length > 0) {
                mesh.children.forEach(child => {
                    addMeshRecursive(child, partKey);
                });
            }
        };
        
        Object.keys(parts).forEach(key => {
            const part = parts[key];
            if (part.clickable && part.mesh) {
                addMeshRecursive(part.mesh, key);
            }
        });
    }
    
    setPlaying(playing) {
        this.isPlaying = playing;
        
        if (this.currentTurbine) {
            if (playing) {
                const windData = Utils.getWindSpeedData(this.windLevel);
                this.currentTurbine.setRPM(windData.rpm);
            }
            this.currentTurbine.setRunning(playing);
        }
        
        if (this.windParticles) {
            this.windParticles.setActive(playing);
        }
        
        if (this.energyFlow) {
            this.energyFlow.setActive(playing);
        }
    }
    
    setWindLevel(level) {
        this.windLevel = level;
        
        const windData = Utils.getWindSpeedData(level);
        
        if (this.currentTurbine && this.isPlaying) {
            this.currentTurbine.setRPM(windData.rpm);
        }
        
        if (this.windParticles) {
            const speedFactor = level / 12;
            this.windParticles.setWindSpeed(speedFactor * 2 + 0.5);
        }
    }
    
    startAnimation() {
        this.lastFrameTime = performance.now();
        this.animate();
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;
        
        this.update(deltaTime);
        this.render();
    }
    
    update(deltaTime) {
        const clampedDelta = Math.min(deltaTime, 0.1);
        
        this.updateEnvironment(clampedDelta);
        
        if (this.currentTurbine) {
            this.currentTurbine.update(clampedDelta);
        }
        
        if (this.windParticles) {
            this.windParticles.update(clampedDelta);
        }
        
        if (this.energyFlow && this.currentTurbine) {
            const turbineRPM = this.currentTurbine.getCurrentRPM();
            const energyLevel = turbineRPM / 50;
            this.energyFlow.setEnergyLevel(energyLevel);
            this.energyFlow.update(clampedDelta);
        }
        
        this.updateDataDisplay();
    }
    
    updateEnvironment(deltaTime) {
        if (this.sceneType === 'sea' && this.waterMesh) {
            this.updateWaterAnimation(deltaTime);
        }
        
        if (this.backgroundTurbines) {
            this.backgroundTurbines.forEach(turbine => {
                if (turbine.userData.rotor) {
                    turbine.userData.rotor.rotation.z += turbine.userData.rotationSpeed * deltaTime * 60;
                }
            });
        }
        
        if (this.cloudObjects) {
            this.cloudObjects.forEach(cloud => {
                cloud.position.x += cloud.userData.speed;
                if (cloud.position.x > 250) {
                    cloud.position.x = -250;
                }
            });
        }
    }
    
    updateWaterAnimation(deltaTime) {
        const water = this.waterMesh;
        if (!water || !water.userData.baseHeights) return;
        
        const positions = water.geometry.attributes.position.array;
        const baseHeights = water.userData.baseHeights;
        const originalX = water.userData.originalX;
        const originalY = water.userData.originalY;
        const time = Date.now() * 0.001;
        
        for (let i = 0; i < baseHeights.length; i++) {
            const x = originalX[i];
            const y = originalY[i];
            
            const wave1 = Math.sin(x * 0.03 + time) * 0.12;
            const wave2 = Math.cos(y * 0.04 + time * 0.7) * 0.08;
            const wave3 = Math.sin((x + y) * 0.02 + time * 1.2) * 0.06;
            
            positions[i * 3 + 2] = baseHeights[i] + wave1 + wave2 + wave3;
        }
        
        water.geometry.attributes.position.needsUpdate = true;
    }
    
    updateDataDisplay() {
        if (!this.dataDisplay) return;
        
        const turbineRPM = this.currentTurbine ? this.currentTurbine.getCurrentRPM() : 0;
        
        this.dataDisplay.update({
            windLevel: this.windLevel,
            turbineRPM: turbineRPM,
            isPlaying: this.isPlaying
        });
    }
    
    render() {
        if (this.currentSceneObject && this.renderer && this.camera) {
            this.renderer.render(this.currentSceneObject, this.camera);
        }
    }
    
    reset() {
        this.isPlaying = true;
        this.windLevel = CONFIG.windSpeed.defaultLevel;
        
        if (this.turbineType !== 'horizontal') {
            this.turbineType = 'horizontal';
            this.switchTurbineType('horizontal');
        }
        
        if (this.sceneType !== 'land') {
            this.sceneType = 'land';
            this.switchScene('land');
        }
        
        if (this.currentTurbine) {
            this.currentTurbine.reset();
            const windData = Utils.getWindSpeedData(this.windLevel);
            this.currentTurbine.setRPM(windData.rpm);
            this.currentTurbine.setRunning(true);
        }
        
        if (this.windParticles) {
            this.windParticles.reset();
            this.windParticles.setActive(true);
        }
        
        if (this.energyFlow) {
            this.energyFlow.reset();
            this.energyFlow.setActive(true);
        }
        
        if (this.dataDisplay) {
            this.dataDisplay.reset();
        }
        
        if (this.partDetails) {
            this.partDetails.reset();
        }
        
        this.cameraSpherical = {
            radius: 60,
            theta: Math.PI / 4,
            phi: Math.PI / 3
        };
        this.updateCameraPosition();
        
        console.log('系统已重置');
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.windParticles) {
            this.windParticles.dispose();
        }
        
        if (this.energyFlow) {
            this.energyFlow.dispose();
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.windPowerApp = new WindPowerApp();
});

window.addEventListener('beforeunload', () => {
    if (window.windPowerApp) {
        window.windPowerApp.destroy();
    }
});
