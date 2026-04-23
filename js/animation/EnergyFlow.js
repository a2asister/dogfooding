class EnergyFlow {
    constructor(scene) {
        this.scene = scene;
        this.flowLines = [];
        this.isActive = false;
        this.energyLevel = 0;
        
        this.init();
    }
    
    init() {
        const lineCount = 8;
        
        for (let i = 0; i < lineCount; i++) {
            const flowLine = this.createFlowLine(i, lineCount);
            this.flowLines.push(flowLine);
            this.scene.add(flowLine.mesh);
        }
    }
    
    createFlowLine(index, total) {
        const points = [];
        const segments = 30;
        const height = 40;
        const startX = -20 + index * 5;
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = startX + Math.sin(t * Math.PI * 2 + index) * 2;
            const y = t * height;
            const z = -15 + Math.cos(t * Math.PI * 2 + index * 0.5) * 3;
            points.push(new THREE.Vector3(x, y, z));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        const colors = new Float32Array(segments * 3);
        for (let i = 0; i < segments; i++) {
            const color = new THREE.Color();
            color.setHSL(0.5 + i / segments * 0.2, 1, 0.5);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.7
        });
        
        const line = new THREE.Line(geometry, material);
        line.visible = false;
        
        return {
            mesh: line,
            speed: 0.5 + Math.random() * 0.5,
            offset: 0,
            index: index
        };
    }
    
    setActive(active) {
        this.isActive = active;
        this.flowLines.forEach(fl => {
            fl.mesh.visible = active;
        });
    }
    
    setEnergyLevel(level) {
        this.energyLevel = level;
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        this.flowLines.forEach(fl => {
            fl.offset += fl.speed * this.energyLevel * (deltaTime || 0.016);
            
            const positions = fl.mesh.geometry.attributes.position.array;
            const colors = fl.mesh.geometry.attributes.color.array;
            
            for (let i = 0; i < positions.length / 3; i++) {
                const y = (i / (positions.length / 3 - 1)) * 40;
                const wave = Math.sin(fl.offset + y * 0.2) * 2;
                
                const originalX = -20 + fl.index * 5;
                positions[i * 3] = originalX + wave;
                
                const opacity = Math.sin(fl.offset + y * 0.1) * 0.3 + 0.7;
                const hue = 0.45 + (y / 40) * 0.25;
                const color = new THREE.Color();
                color.setHSL(hue, 1, 0.4 + opacity * 0.3);
                
                colors[i * 3] = color.r;
                colors[i * 3 + 1] = color.g;
                colors[i * 3 + 2] = color.b;
            }
            
            fl.mesh.geometry.attributes.position.needsUpdate = true;
            fl.mesh.geometry.attributes.color.needsUpdate = true;
        });
    }
    
    createPowerIndicator() {
        const indicatorGroup = new THREE.Group();
        
        const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
        const indicatorMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.8
        });
        
        const indicatorCount = 10;
        for (let i = 0; i < indicatorCount; i++) {
            const indicator = new THREE.Mesh(cylinderGeometry, indicatorMaterial.clone());
            indicator.position.set(
                (i - indicatorCount / 2) * 1.2,
                0.1,
                -25
            );
            indicator.visible = false;
            indicator.userData.index = i;
            indicatorGroup.add(indicator);
        }
        
        this.powerIndicators = indicatorGroup;
        this.scene.add(indicatorGroup);
    }
    
    updatePowerIndicators(powerLevel) {
        if (!this.powerIndicators) return;
        
        const maxIndicators = this.powerIndicators.children.length;
        const activeCount = Math.floor(powerLevel * maxIndicators);
        
        this.powerIndicators.children.forEach((indicator, i) => {
            indicator.visible = i < activeCount;
            
            if (indicator.visible) {
                const hue = 0.3 - (i / maxIndicators) * 0.3;
                indicator.material.color.setHSL(hue, 1, 0.5);
                indicator.material.opacity = 0.6 + (i / maxIndicators) * 0.4;
            }
        });
    }
    
    reset() {
        this.flowLines.forEach(fl => {
            fl.offset = 0;
        });
        this.energyLevel = 0;
    }
    
    dispose() {
        this.flowLines.forEach(fl => {
            this.scene.remove(fl.mesh);
            fl.mesh.geometry.dispose();
            fl.mesh.material.dispose();
        });
        this.flowLines = [];
    }
}
