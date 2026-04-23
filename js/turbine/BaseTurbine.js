class BaseTurbine {
    constructor() {
        this.group = new THREE.Group();
        this.parts = {};
        this.isRunning = true;
        this.currentRPM = 0;
        this.targetRPM = 0;
        this.rotationSpeed = 0;
    }
    
    create() {
        throw new Error('create() must be implemented by subclass');
    }
    
    getGroup() {
        return this.group;
    }
    
    getParts() {
        return this.parts;
    }
    
    setRPM(rpm) {
        this.targetRPM = rpm;
    }
    
    setRunning(running) {
        this.isRunning = running;
        if (!running) {
            this.targetRPM = 0;
        }
    }
    
    update(deltaTime) {
        if (this.isRunning) {
            this.currentRPM = Utils.lerp(this.currentRPM, this.targetRPM, 0.05);
        } else {
            this.currentRPM = Utils.lerp(this.currentRPM, 0, 0.03);
        }
        
        this.rotationSpeed = (this.currentRPM * Math.PI * 2) / 60;
    }
    
    getCurrentRPM() {
        return this.currentRPM;
    }
    
    getTargetRPM() {
        return this.targetRPM;
    }
    
    addPart(name, mesh, clickable = true) {
        this.parts[name] = {
            mesh: mesh,
            clickable: clickable,
            originalColor: mesh.material ? mesh.material.color.clone() : null
        };
        
        if (clickable) {
            mesh.userData.partKey = name;
            
            if (mesh.children && mesh.children.length > 0) {
                const setPartKeyRecursive = (obj) => {
                    if (!obj.userData.partKey) {
                        obj.userData.partKey = name;
                    }
                    if (obj.children) {
                        obj.children.forEach(setPartKeyRecursive);
                    }
                };
                mesh.children.forEach(setPartKeyRecursive);
            }
        }
    }
    
    highlightPart(name) {
        const highlightByPartKey = (obj) => {
            if (obj.userData && obj.userData.partKey === name) {
                if (obj.material) {
                    obj.material.emissive = new THREE.Color(0x00a896);
                    obj.material.emissiveIntensity = 0.5;
                }
            }
            if (obj.children) {
                obj.children.forEach(highlightByPartKey);
            }
        };
        
        highlightByPartKey(this.group);
    }
    
    unhighlightPart(name) {
        const unhighlightByPartKey = (obj) => {
            if (obj.userData && obj.userData.partKey === name) {
                if (obj.material) {
                    obj.material.emissive = new THREE.Color(0x000000);
                    obj.material.emissiveIntensity = 0;
                }
            }
            if (obj.children) {
                obj.children.forEach(unhighlightByPartKey);
            }
        };
        
        unhighlightByPartKey(this.group);
    }
    
    reset() {
        this.currentRPM = 0;
        this.targetRPM = 0;
        this.rotationSpeed = 0;
        this.isRunning = true;
    }
}
