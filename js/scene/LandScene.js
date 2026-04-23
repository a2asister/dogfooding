class LandScene extends BaseScene {
    constructor() {
        super();
        this.ground = null;
        this.sky = null;
        this.backgroundTurbines = [];
        this.grass = [];
    }
    
    createScene() {
        super.createScene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0xB0E0E6, 80, 300);
    }
    
    createEnvironment() {
        this.createGround();
        this.createSkyDome();
        this.createBackgroundTurbines();
        this.createTrees();
    }
    
    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(400, 400, 50, 50);
        
        const vertices = groundGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 1];
            vertices[i + 2] = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 0.5 + Math.random() * 0.2;
        }
        groundGeometry.computeVertexNormals();
        
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x7CB342,
            roughness: 0.8,
            metalness: 0.1,
            flatShading: false
        });
        
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
        
        const gridHelper = new THREE.GridHelper(200, 100, 0x558B2F, 0x689F38);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
        
        this.createGrass();
    }
    
    createGrass() {
        const grassGeometry = new THREE.ConeGeometry(0.1, 0.5, 4);
        const grassMaterial = new THREE.MeshStandardMaterial({
            color: 0x558B2F,
            roughness: 0.9
        });
        
        for (let i = 0; i < 500; i++) {
            const grass = new THREE.Mesh(grassGeometry, grassMaterial);
            const angle = Math.random() * Math.PI * 2;
            const radius = 10 + Math.random() * 80;
            
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
            
            this.grass.push(grass);
            this.scene.add(grass);
        }
    }
    
    createSkyDome() {
        const skyGeometry = new THREE.SphereGeometry(300, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
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
            opacity: 0.8
        });
        
        for (let i = 0; i < 8; i++) {
            const cloudGroup = new THREE.Group();
            
            for (let j = 0; j < 5; j++) {
                const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
                cloudPart.position.set(
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 3,
                    (Math.random() - 0.5) * 10
                );
                cloudPart.scale.set(
                    0.8 + Math.random() * 0.8,
                    0.6 + Math.random() * 0.4,
                    0.8 + Math.random() * 0.8
                );
                cloudGroup.add(cloudPart);
            }
            
            cloudGroup.position.set(
                (Math.random() - 0.5) * 400,
                80 + Math.random() * 40,
                (Math.random() - 0.5) * 400
            );
            cloudGroup.userData.speed = 0.02 + Math.random() * 0.03;
            
            this.clouds = this.clouds || [];
            this.clouds.push(cloudGroup);
            this.scene.add(cloudGroup);
        }
    }
    
    createBackgroundTurbines() {
        const positions = [
            { x: -60, z: -50, scale: 0.6 },
            { x: -40, z: -80, scale: 0.5 },
            { x: 50, z: -60, scale: 0.55 },
            { x: 80, z: -40, scale: 0.65 },
            { x: -80, z: 30, scale: 0.45 },
            { x: 70, z: 50, scale: 0.5 },
            { x: -50, z: 80, scale: 0.4 },
            { x: 40, z: 90, scale: 0.35 }
        ];
        
        positions.forEach(pos => {
            const turbine = this.createSimpleTurbine(pos.scale);
            turbine.position.set(pos.x, 0, pos.z);
            turbine.userData.rotationSpeed = 0.005 + Math.random() * 0.01;
            this.backgroundTurbines.push(turbine);
            this.scene.add(turbine);
        });
    }
    
    createSimpleTurbine(scale) {
        const group = new THREE.Group();
        
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
            color: 0xFFFFFF,
            roughness: 0.5,
            metalness: 0.2
        });
        const nacelle = new THREE.Mesh(nacelleGeometry, nacelleMaterial);
        nacelle.position.y = 25.5 * scale;
        nacelle.castShadow = true;
        group.add(nacelle);
        
        const rotorGroup = new THREE.Group();
        rotorGroup.position.y = 25.5 * scale;
        rotorGroup.position.z = 3.5 * scale;
        
        const hubGeometry = new THREE.SphereGeometry(0.8 * scale, 8, 8);
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
    
    createTrees() {
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
            this.scene.add(tree);
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
    
    update(deltaTime) {
        super.update(deltaTime);
        
        this.backgroundTurbines.forEach(turbine => {
            if (turbine.userData.rotor) {
                turbine.userData.rotor.rotation.z += turbine.userData.rotationSpeed;
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
}
