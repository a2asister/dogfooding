class SeaScene extends BaseScene {
    constructor() {
        super();
        this.water = null;
        this.sky = null;
        this.backgroundTurbines = [];
        this.waves = [];
    }
    
    createScene() {
        super.createScene();
        this.scene.background = new THREE.Color(0x64B5F6);
        this.scene.fog = new THREE.Fog(0x90CAF9, 80, 300);
    }
    
    createEnvironment() {
        this.createWater();
        this.createSkyDome();
        this.createBackgroundTurbines();
        this.createShips();
    }
    
    createWater() {
        const waterGeometry = new THREE.PlaneGeometry(400, 400, 15, 15);
        
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x1E88E5,
            roughness: 0.1,
            metalness: 0.5,
            transparent: true,
            opacity: 0.85,
            flatShading: true
        });
        
        this.water = new THREE.Mesh(waterGeometry, waterMaterial);
        this.water.rotation.x = -Math.PI / 2;
        this.water.receiveShadow = true;
        
        const positions = waterGeometry.attributes.position.array;
        this.water.userData.baseHeights = [];
        this.water.userData.originalX = [];
        this.water.userData.originalY = [];
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const baseHeight = Math.sin(x * 0.02) * Math.cos(y * 0.02) * 0.3;
            
            this.water.userData.baseHeights.push(baseHeight);
            this.water.userData.originalX.push(x);
            this.water.userData.originalY.push(y);
            positions[i + 2] = baseHeight;
        }
        
        waterGeometry.attributes.position.needsUpdate = true;
        
        this.scene.add(this.water);
        
        const gridHelper = new THREE.GridHelper(200, 40, 0x1565C0, 0x1976D2);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
    }
    
    createSkyDome() {
        const skyGeometry = new THREE.SphereGeometry(300, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x64B5F6,
            side: THREE.BackSide
        });
        
        this.sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.sky);
        
        this.createClouds();
    }
    
    createClouds() {
        const cloudGeometry = new THREE.SphereGeometry(5, 8, 8);
        const cloudMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.7
        });
        
        for (let i = 0; i < 10; i++) {
            const cloudGroup = new THREE.Group();
            
            for (let j = 0; j < 6; j++) {
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
            
            this.clouds = this.clouds || [];
            this.clouds.push(cloudGroup);
            this.scene.add(cloudGroup);
        }
    }
    
    createBackgroundTurbines() {
        const positions = [
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
        
        positions.forEach(pos => {
            const turbine = this.createOffshoreTurbine(pos.scale);
            turbine.position.set(pos.x, 0, pos.z);
            turbine.userData.rotationSpeed = 0.005 + Math.random() * 0.01;
            this.backgroundTurbines.push(turbine);
            this.scene.add(turbine);
        });
    }
    
    createOffshoreTurbine(scale) {
        const group = new THREE.Group();
        
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
        
        const platformGeometry = new THREE.CylinderGeometry(4 * scale, 4.5 * scale, 1 * scale, 8);
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: 0x757575,
            roughness: 0.6,
            metalness: 0.3
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.y = 0.5 * scale;
        platform.castShadow = true;
        platform.receiveShadow = true;
        group.add(platform);
        
        const towerGeometry = new THREE.CylinderGeometry(0.8 * scale, 1.2 * scale, 28 * scale, 8);
        const towerMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B8B8B,
            roughness: 0.7,
            metalness: 0.3
        });
        const tower = new THREE.Mesh(towerGeometry, towerMaterial);
        tower.position.y = 14.5 * scale;
        tower.castShadow = true;
        group.add(tower);
        
        const nacelleGeometry = new THREE.BoxGeometry(4 * scale, 2 * scale, 6 * scale);
        const nacelleMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.5,
            metalness: 0.2
        });
        const nacelle = new THREE.Mesh(nacelleGeometry, nacelleMaterial);
        nacelle.position.y = 28.5 * scale;
        nacelle.castShadow = true;
        group.add(nacelle);
        
        const rotorGroup = new THREE.Group();
        rotorGroup.position.y = 28.5 * scale;
        rotorGroup.position.z = 3.5 * scale;
        
        const hubGeometry = new THREE.SphereGeometry(0.8 * scale, 8, 8);
        const hubMaterial = new THREE.MeshStandardMaterial({
            color: 0x555555
        });
        const hub = new THREE.Mesh(hubGeometry, hubMaterial);
        rotorGroup.add(hub);
        
        const bladeGeometry = new THREE.BoxGeometry(0.3 * scale, 13 * scale, 0.8 * scale);
        const bladeMaterial = new THREE.MeshStandardMaterial({
            color: 0xE8E8E8,
            roughness: 0.6,
            metalness: 0.1
        });
        
        for (let i = 0; i < 3; i++) {
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            blade.position.y = 6.5 * scale;
            blade.rotation.z = (i * Math.PI * 2) / 3;
            blade.castShadow = true;
            rotorGroup.add(blade);
        }
        
        group.add(rotorGroup);
        group.userData.rotor = rotorGroup;
        
        return group;
    }
    
    createShips() {
        const shipPositions = [
            { x: -120, z: -80, scale: 0.6 },
            { x: 100, z: -100, scale: 0.5 },
            { x: -80, z: 120, scale: 0.55 }
        ];
        
        shipPositions.forEach(pos => {
            const ship = this.createShip();
            ship.position.set(pos.x, 0, pos.z);
            ship.scale.set(pos.scale, pos.scale, pos.scale);
            ship.rotation.y = Math.random() * Math.PI * 2;
            ship.userData.speed = 0.01 + Math.random() * 0.02;
            ship.userData.originalX = ship.position.x;
            ship.userData.originalZ = ship.position.z;
            ship.userData.moveRange = 30 + Math.random() * 20;
            this.scene.add(ship);
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
    
    update(deltaTime) {
        super.update(deltaTime);
        
        this.updateWater(deltaTime);
        
        this.backgroundTurbines.forEach(turbine => {
            if (turbine.userData.rotor) {
                turbine.userData.rotor.rotation.z += turbine.userData.rotationSpeed * (deltaTime || 0.016) * 60;
            }
        });
        
        if (this.clouds) {
            this.clouds.forEach(cloud => {
                cloud.position.x += cloud.userData.speed;
                if (cloud.position.x > 250) {
                    cloud.position.x = -250;
                }
            });
        }
    }
    
    updateWater(deltaTime) {
        if (!this.water || !this.water.userData.baseHeights) return;
        
        const positions = this.water.geometry.attributes.position.array;
        const baseHeights = this.water.userData.baseHeights;
        const originalX = this.water.userData.originalX;
        const originalY = this.water.userData.originalY;
        const time = Date.now() * 0.001;
        
        for (let i = 0; i < baseHeights.length; i++) {
            const x = originalX[i];
            const y = originalY[i];
            
            const wave1 = Math.sin(x * 0.03 + time) * 0.12;
            const wave2 = Math.cos(y * 0.04 + time * 0.7) * 0.08;
            const wave3 = Math.sin((x + y) * 0.02 + time * 1.2) * 0.06;
            
            positions[i * 3 + 2] = baseHeights[i] + wave1 + wave2 + wave3;
        }
        
        this.water.geometry.attributes.position.needsUpdate = true;
    }
}
