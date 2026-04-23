class VerticalTurbine extends BaseTurbine {
    constructor() {
        super();
        this.rotorGroup = null;
        this.blades = [];
    }
    
    create(sceneType = 'land') {
        this.createFoundation(sceneType);
        this.createTower();
        this.createRotor();
        this.createGenerator();
        
        return this.group;
    }
    
    createFoundation(sceneType) {
        if (sceneType === 'sea') {
            const foundationGeometry = new THREE.CylinderGeometry(2, 3, 8, 12);
            const foundationMaterial = new THREE.MeshStandardMaterial({
                color: 0x5D4037,
                roughness: 0.8
            });
            const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
            foundation.position.y = -4;
            foundation.castShadow = true;
            foundation.receiveShadow = true;
            this.group.add(foundation);
            this.addPart('foundation', foundation);
            
            const platformGeometry = new THREE.CylinderGeometry(4, 4.5, 1, 12);
            const platformMaterial = new THREE.MeshStandardMaterial({
                color: 0x757575,
                roughness: 0.6,
                metalness: 0.4
            });
            const platform = new THREE.Mesh(platformGeometry, platformMaterial);
            platform.position.y = 0.5;
            platform.castShadow = true;
            platform.receiveShadow = true;
            this.group.add(platform);
        } else {
            const foundationGeometry = new THREE.CylinderGeometry(3.5, 4.5, 2.5, 12);
            const foundationMaterial = new THREE.MeshStandardMaterial({
                color: 0x795548,
                roughness: 0.9
            });
            const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
            foundation.position.y = 1.25;
            foundation.receiveShadow = true;
            this.group.add(foundation);
            this.addPart('foundation', foundation);
        }
    }
    
    createTower() {
        const towerGroup = new THREE.Group();
        
        const centerPoleGeometry = new THREE.CylinderGeometry(0.4, 0.5, 25, 16);
        const poleMaterial = new THREE.MeshStandardMaterial({
            color: 0x757575,
            roughness: 0.5,
            metalness: 0.5
        });
        const centerPole = new THREE.Mesh(centerPoleGeometry, poleMaterial);
        centerPole.position.y = 14;
        centerPole.castShadow = true;
        towerGroup.add(centerPole);
        this.addPart('tower', centerPole);
        
        const armMaterial = new THREE.MeshStandardMaterial({
            color: 0x616161,
            roughness: 0.5,
            metalness: 0.4
        });
        
        const armLevels = 3;
        const armsPerLevel = 3;
        
        for (let level = 0; level < armLevels; level++) {
            const yPos = 6 + level * 8;
            
            for (let arm = 0; arm < armsPerLevel; arm++) {
                const angle = (arm * Math.PI * 2) / armsPerLevel;
                
                const armGeometry = new THREE.BoxGeometry(0.2, 0.2, 8);
                const armMesh = new THREE.Mesh(armGeometry, armMaterial);
                
                armMesh.position.y = yPos;
                armMesh.position.z = 4;
                armMesh.rotation.y = angle;
                
                armMesh.castShadow = true;
                towerGroup.add(armMesh);
            }
        }
        
        const strutMaterial = new THREE.MeshStandardMaterial({
            color: 0x9E9E9E,
            roughness: 0.6,
            metalness: 0.3
        });
        
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            
            const strutGeometry = new THREE.CylinderGeometry(0.08, 0.08, 24, 8);
            const strut = new THREE.Mesh(strutGeometry, strutMaterial);
            
            strut.position.set(
                Math.cos(angle) * 4,
                14,
                Math.sin(angle) * 4
            );
            
            strut.rotation.x = Math.atan2(4, 14);
            strut.rotation.z = angle + Math.PI / 2;
            
            strut.castShadow = true;
            towerGroup.add(strut);
        }
        
        this.group.add(towerGroup);
        this.addPart('tower', towerGroup);
    }
    
    createRotor() {
        this.rotorGroup = new THREE.Group();
        
        const bladeCount = 3;
        const bladeHeight = 18;
        const bladeRadius = 6;
        
        for (let i = 0; i < bladeCount; i++) {
            const bladeGroup = this.createDarrieusBlade(bladeHeight, bladeRadius);
            bladeGroup.rotation.y = (i * Math.PI * 2) / bladeCount;
            this.rotorGroup.add(bladeGroup);
            this.blades.push(bladeGroup);
        }
        
        this.rotorGroup.position.y = 3;
        this.group.add(this.rotorGroup);
    }
    
    createDarrieusBlade(height, radius) {
        const bladeGroup = new THREE.Group();
        
        const curve = new THREE.CubicBezierCurve3(
            new THREE.Vector3(radius * 0.3, 0, 0),
            new THREE.Vector3(radius, height * 0.3, 0),
            new THREE.Vector3(radius, height * 0.7, 0),
            new THREE.Vector3(radius * 0.3, height, 0)
        );
        
        const points = curve.getPoints(50);
        const bladeShape = new THREE.Shape();
        
        const profileWidth = 0.4;
        bladeShape.moveTo(-profileWidth / 2, 0);
        bladeShape.quadraticCurveTo(0, -0.15, profileWidth / 2, 0);
        bladeShape.quadraticCurveTo(0, 0.15, -profileWidth / 2, 0);
        
        const extrudeSettings = {
            steps: 50,
            bevelEnabled: false,
            extrudePath: curve
        };
        
        const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
        const bladeMaterial = new THREE.MeshStandardMaterial({
            color: 0xE0E0E0,
            roughness: 0.5,
            metalness: 0.3
        });
        
        const bladeMesh = new THREE.Mesh(bladeGeometry, bladeMaterial);
        bladeMesh.castShadow = true;
        bladeMesh.receiveShadow = true;
        bladeGroup.add(bladeMesh);
        
        if (!this.parts['blade']) {
            this.addPart('blade', bladeMesh, true);
        } else {
            bladeMesh.userData.partKey = 'blade';
            const setPartKeyRecursive = (obj) => {
                if (!obj.userData.partKey) {
                    obj.userData.partKey = 'blade';
                }
                if (obj.children) {
                    obj.children.forEach(setPartKeyRecursive);
                }
            };
            setPartKeyRecursive(bladeGroup);
        }
        
        const connectorMaterial = new THREE.MeshStandardMaterial({
            color: 0x616161,
            roughness: 0.5,
            metalness: 0.5
        });
        
        const topConnectorGeometry = new THREE.CylinderGeometry(0.15, 0.15, radius * 0.7, 8);
        const topConnector = new THREE.Mesh(topConnectorGeometry, connectorMaterial);
        topConnector.position.set(radius * 0.35, height, 0);
        topConnector.rotation.z = -Math.PI / 2;
        topConnector.castShadow = true;
        bladeGroup.add(topConnector);
        
        const bottomConnector = new THREE.Mesh(topConnectorGeometry, connectorMaterial);
        bottomConnector.position.set(radius * 0.35, 0, 0);
        bottomConnector.rotation.z = -Math.PI / 2;
        bottomConnector.castShadow = true;
        bladeGroup.add(bottomConnector);
        
        return bladeGroup;
    }
    
    createGenerator() {
        const generatorGroup = new THREE.Group();
        generatorGroup.position.y = 2.5;
        
        const housingGeometry = new THREE.CylinderGeometry(1.2, 1.3, 2, 16);
        const housingMaterial = new THREE.MeshStandardMaterial({
            color: 0x424242,
            roughness: 0.5,
            metalness: 0.6
        });
        const housing = new THREE.Mesh(housingGeometry, housingMaterial);
        housing.castShadow = true;
        generatorGroup.add(housing);
        this.addPart('generator', housing);
        
        const gearboxGeometry = new THREE.BoxGeometry(2, 1.5, 2);
        const gearboxMaterial = new THREE.MeshStandardMaterial({
            color: 0x616161,
            roughness: 0.5,
            metalness: 0.5
        });
        const gearbox = new THREE.Mesh(gearboxGeometry, gearboxMaterial);
        gearbox.position.y = -1.8;
        gearbox.castShadow = true;
        generatorGroup.add(gearbox);
        this.addPart('gearbox', gearbox);
        
        this.group.add(generatorGroup);
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        if (this.rotorGroup) {
            this.rotorGroup.rotation.y += this.rotationSpeed * (deltaTime || 0.016);
        }
    }
    
    reset() {
        super.reset();
        if (this.rotorGroup) {
            this.rotorGroup.rotation.y = 0;
        }
    }
}
