class HorizontalTurbine extends BaseTurbine {
    constructor() {
        super();
        this.rotorGroup = null;
        this.internalGroup = null;
        this.gearGroup = null;
        this.generatorRotor = null;
    }
    
    create(sceneType = 'land') {
        this.createFoundation(sceneType);
        this.createTower();
        this.createNacelle();
        this.createInternalComponents();
        this.createRotor();
        
        return this.group;
    }
    
    createFoundation(sceneType) {
        if (sceneType === 'sea') {
            const foundationGeometry = new THREE.CylinderGeometry(2.5, 3.5, 10, 12);
            const foundationMaterial = new THREE.MeshStandardMaterial({
                color: 0x5D4037,
                roughness: 0.8,
                metalness: 0.1
            });
            const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
            foundation.position.y = -5;
            foundation.castShadow = true;
            foundation.receiveShadow = true;
            this.group.add(foundation);
            this.addPart('foundation', foundation);
            
            const platformGeometry = new THREE.CylinderGeometry(5, 5.5, 1.2, 12);
            const platformMaterial = new THREE.MeshStandardMaterial({
                color: 0x757575,
                roughness: 0.6,
                metalness: 0.4
            });
            const platform = new THREE.Mesh(platformGeometry, platformMaterial);
            platform.position.y = 0.6;
            platform.castShadow = true;
            platform.receiveShadow = true;
            this.group.add(platform);
        } else {
            const foundationGeometry = new THREE.CylinderGeometry(4, 5, 3, 12);
            const foundationMaterial = new THREE.MeshStandardMaterial({
                color: 0x795548,
                roughness: 0.9,
                metalness: 0.0
            });
            const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
            foundation.position.y = 1.5;
            foundation.receiveShadow = true;
            this.group.add(foundation);
            this.addPart('foundation', foundation);
        }
    }
    
    createTower() {
        const towerGroup = new THREE.Group();
        
        const segments = 5;
        const bottomRadius = 1.5;
        const topRadius = 0.9;
        const segmentHeight = 6;
        
        for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const nextT = (i + 1) / segments;
            const radiusBottom = bottomRadius - t * (bottomRadius - topRadius);
            const radiusTop = bottomRadius - nextT * (bottomRadius - topRadius);
            
            const segmentGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, segmentHeight, 16);
            const segmentMaterial = new THREE.MeshStandardMaterial({
                color: 0x8B8B8B,
                roughness: 0.6,
                metalness: 0.4
            });
            const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
            segment.position.y = i * segmentHeight + segmentHeight / 2 + 3;
            segment.castShadow = true;
            segment.receiveShadow = true;
            towerGroup.add(segment);
        }
        
        const ringGeometry = new THREE.TorusGeometry(1.3, 0.08, 8, 32);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: 0x616161,
            roughness: 0.5,
            metalness: 0.6
        });
        
        for (let i = 0; i < segments - 1; i++) {
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.y = (i + 1) * segmentHeight + 3;
            ring.rotation.x = Math.PI / 2;
            towerGroup.add(ring);
        }
        
        this.group.add(towerGroup);
        this.addPart('tower', towerGroup);
    }
    
    createNacelle() {
        const nacelleGroup = new THREE.Group();
        nacelleGroup.position.y = 33;
        
        const bodyGeometry = new THREE.BoxGeometry(5, 3, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xFAFAFA,
            roughness: 0.4,
            metalness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        nacelleGroup.add(body);
        
        const frontGeometry = new THREE.ConeGeometry(2.5, 3, 8);
        const frontMaterial = new THREE.MeshStandardMaterial({
            color: 0xF5F5F5,
            roughness: 0.4,
            metalness: 0.3
        });
        const front = new THREE.Mesh(frontGeometry, frontMaterial);
        front.position.z = 5.5;
        front.rotation.x = Math.PI / 2;
        front.castShadow = true;
        nacelleGroup.add(front);
        
        const rearGeometry = new THREE.BoxGeometry(3, 2, 2);
        const rearMaterial = new THREE.MeshStandardMaterial({
            color: 0xE0E0E0,
            roughness: 0.5,
            metalness: 0.3
        });
        const rear = new THREE.Mesh(rearGeometry, rearMaterial);
        rear.position.z = -5;
        rear.castShadow = true;
        nacelleGroup.add(rear);
        
        const coolerGeometry = new THREE.BoxGeometry(0.1, 2.5, 0.8);
        const coolerMaterial = new THREE.MeshStandardMaterial({
            color: 0xBDBDBD,
            roughness: 0.6,
            metalness: 0.4
        });
        
        for (let i = 0; i < 8; i++) {
            const cooler = new THREE.Mesh(coolerGeometry, coolerMaterial);
            cooler.position.set(-2.4 + i * 0.6, 0.2, -4.5);
            nacelleGroup.add(cooler);
        }
        
        this.group.add(nacelleGroup);
        this.addPart('nacelle', nacelleGroup);
    }
    
    createInternalComponents() {
        this.internalGroup = new THREE.Group();
        this.internalGroup.position.y = 33;
        this.internalGroup.visible = false;
        
        const mainShaftGeometry = new THREE.CylinderGeometry(0.3, 0.3, 6, 16);
        const shaftMaterial = new THREE.MeshStandardMaterial({
            color: 0x424242,
            roughness: 0.3,
            metalness: 0.8
        });
        const mainShaft = new THREE.Mesh(mainShaftGeometry, shaftMaterial);
        mainShaft.rotation.x = Math.PI / 2;
        mainShaft.position.z = 2;
        this.internalGroup.add(mainShaft);
        
        this.gearGroup = new THREE.Group();
        this.gearGroup.position.z = -1;
        
        const gearboxHousingGeometry = new THREE.BoxGeometry(3, 2.5, 3);
        const housingMaterial = new THREE.MeshStandardMaterial({
            color: 0x616161,
            roughness: 0.5,
            metalness: 0.5
        });
        const gearboxHousing = new THREE.Mesh(gearboxHousingGeometry, housingMaterial);
        this.gearGroup.add(gearboxHousing);
        
        const largeGearGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.5, 32);
        const gearMaterial = new THREE.MeshStandardMaterial({
            color: 0x757575,
            roughness: 0.4,
            metalness: 0.7
        });
        const largeGear = new THREE.Mesh(largeGearGeometry, gearMaterial);
        largeGear.rotation.x = Math.PI / 2;
        largeGear.position.z = 0.5;
        this.gearGroup.add(largeGear);
        
        const smallGearGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.4, 32);
        const smallGear = new THREE.Mesh(smallGearGeometry, gearMaterial);
        smallGear.rotation.x = Math.PI / 2;
        smallGear.position.set(0.8, 0, -0.5);
        this.gearGroup.add(smallGear);
        
        this.internalGroup.add(this.gearGroup);
        this.addPart('gearbox', gearboxHousing);
        
        const generatorGroup = new THREE.Group();
        generatorGroup.position.z = -4;
        
        const generatorBodyGeometry = new THREE.CylinderGeometry(1, 1, 4, 16);
        const generatorMaterial = new THREE.MeshStandardMaterial({
            color: 0x424242,
            roughness: 0.5,
            metalness: 0.6
        });
        const generatorBody = new THREE.Mesh(generatorBodyGeometry, generatorMaterial);
        generatorBody.rotation.x = Math.PI / 2;
        generatorGroup.add(generatorBody);
        
        this.generatorRotor = new THREE.Group();
        const rotorGeometry = new THREE.CylinderGeometry(0.6, 0.6, 3.5, 16);
        const rotorMaterial = new THREE.MeshStandardMaterial({
            color: 0x1565C0,
            roughness: 0.4,
            metalness: 0.3
        });
        const rotor = new THREE.Mesh(rotorGeometry, rotorMaterial);
        rotor.rotation.x = Math.PI / 2;
        this.generatorRotor.add(rotor);
        
        for (let i = 0; i < 4; i++) {
            const magnetGeometry = new THREE.BoxGeometry(0.15, 0.3, 3);
            const magnetMaterial = new THREE.MeshStandardMaterial({
                color: i % 2 === 0 ? 0xD32F2F : 0x1976D2,
                roughness: 0.3,
                metalness: 0.8
            });
            const magnet = new THREE.Mesh(magnetGeometry, magnetMaterial);
            magnet.position.set(
                Math.cos(i * Math.PI / 2) * 0.45,
                Math.sin(i * Math.PI / 2) * 0.45,
                0
            );
            this.generatorRotor.add(magnet);
        }
        
        generatorGroup.add(this.generatorRotor);
        this.internalGroup.add(generatorGroup);
        this.addPart('generator', generatorBody);
        
        this.group.add(this.internalGroup);
    }
    
    createRotor() {
        this.rotorGroup = new THREE.Group();
        this.rotorGroup.position.y = 33;
        this.rotorGroup.position.z = 8;
        
        const hubGeometry = new THREE.SphereGeometry(1, 24, 24);
        const hubMaterial = new THREE.MeshStandardMaterial({
            color: 0x555555,
            roughness: 0.5,
            metalness: 0.4
        });
        const hub = new THREE.Mesh(hubGeometry, hubMaterial);
        hub.castShadow = true;
        this.rotorGroup.add(hub);
        this.addPart('hub', hub);
        
        const bladeCount = 3;
        for (let i = 0; i < bladeCount; i++) {
            const blade = this.createBlade();
            blade.rotation.z = (i * Math.PI * 2) / bladeCount;
            this.rotorGroup.add(blade);
        }
        
        this.group.add(this.rotorGroup);
    }
    
    createBlade() {
        const bladeGroup = new THREE.Group();
        
        const bladeShape = new THREE.Shape();
        
        const segments = 10;
        const length = 12;
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = -0.4 * Math.cos(t * Math.PI / 2);
            const y = t * length;
            
            if (i === 0) {
                bladeShape.moveTo(x, y);
            } else {
                bladeShape.lineTo(x, y);
            }
        }
        
        for (let i = segments; i >= 0; i--) {
            const t = i / segments;
            const x = 0.4 * Math.cos(t * Math.PI / 2);
            const y = t * length;
            bladeShape.lineTo(x, y);
        }
        
        bladeShape.closePath();
        
        const extrudeSettings = {
            steps: 1,
            depth: 0.2,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelSegments: 2
        };
        
        const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
        bladeGeometry.rotateX(Math.PI / 2);
        bladeGeometry.rotateZ(-Math.PI / 12);
        
        const bladeMaterial = new THREE.MeshStandardMaterial({
            color: 0xE8E8E8,
            roughness: 0.6,
            metalness: 0.1,
            side: THREE.DoubleSide
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
        
        return bladeGroup;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        if (this.rotorGroup) {
            this.rotorGroup.rotation.z -= this.rotationSpeed * (deltaTime || 0.016);
        }
        
        if (this.gearGroup) {
            this.gearGroup.rotation.z -= this.rotationSpeed * (deltaTime || 0.016);
        }
        
        if (this.generatorRotor) {
            this.generatorRotor.rotation.z -= this.rotationSpeed * CONFIG.turbine.gearRatio * (deltaTime || 0.016);
        }
    }
    
    showInternal(show) {
        if (this.internalGroup) {
            this.internalGroup.visible = show;
        }
    }
    
    reset() {
        super.reset();
        if (this.rotorGroup) {
            this.rotorGroup.rotation.z = 0;
        }
    }
}
