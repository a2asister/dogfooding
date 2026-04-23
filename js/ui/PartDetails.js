class PartDetails {
    constructor(app) {
        this.app = app;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.currentHighlightedPart = null;
        this.clickableMeshes = [];
        
        this.init();
    }
    
    init() {
        this.tooltip = document.getElementById('tooltip');
        this.modal = document.getElementById('part-detail-modal');
        this.modalTitle = document.getElementById('part-title');
        this.modalDescription = document.getElementById('part-description');
        this.closeBtn = this.modal.querySelector('.close-btn');
        
        this.container = document.getElementById('canvas-container');
        
        this.bindEvents();
    }
    
    setClickableMeshes(meshes) {
        this.clickableMeshes = meshes;
    }
    
    addClickableMesh(mesh, partKey) {
        mesh.userData.partKey = partKey;
        this.clickableMeshes.push(mesh);
    }
    
    clearClickableMeshes() {
        this.clickableMeshes = [];
    }
    
    bindEvents() {
        this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.container.addEventListener('click', (e) => this.onClick(e));
        this.container.addEventListener('mouseleave', () => this.onMouseLeave());
        
        this.closeBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }
    
    onMouseMove(e) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.checkIntersection(e.clientX, e.clientY);
    }
    
    onClick(e) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        const intersects = this.getIntersects();
        
        if (intersects.length > 0) {
            const mesh = intersects[0].object;
            const partKey = this.getPartKey(mesh);
            
            if (partKey && PART_DETAILS[partKey]) {
                this.showPartDetail(partKey);
            }
        }
    }
    
    onMouseLeave() {
        this.hideTooltip();
        this.clearHighlight();
    }
    
    getIntersects() {
        if (!this.app.currentSceneObject || !this.clickableMeshes.length) {
            return [];
        }
        
        this.raycaster.setFromCamera(this.mouse, this.app.camera);
        return this.raycaster.intersectObjects(this.clickableMeshes, true);
    }
    
    getPartKey(mesh) {
        let current = mesh;
        while (current) {
            if (current.userData && current.userData.partKey) {
                return current.userData.partKey;
            }
            current = current.parent;
        }
        return null;
    }
    
    checkIntersection(clientX, clientY) {
        const intersects = this.getIntersects();
        
        if (intersects.length > 0) {
            const mesh = intersects[0].object;
            const partKey = this.getPartKey(mesh);
            
            if (partKey && PART_DETAILS[partKey]) {
                this.highlightPart(partKey);
                this.showTooltip(clientX, clientY, PART_DETAILS[partKey].name);
                this.container.style.cursor = 'pointer';
            } else {
                this.clearHighlight();
                this.hideTooltip();
                this.container.style.cursor = 'grab';
            }
        } else {
            this.clearHighlight();
            this.hideTooltip();
            this.container.style.cursor = 'grab';
        }
    }
    
    highlightPart(partKey) {
        if (this.currentHighlightedPart === partKey) return;
        
        this.clearHighlight();
        this.currentHighlightedPart = partKey;
        
        if (this.app.currentTurbine) {
            this.app.currentTurbine.highlightPart(partKey);
        }
        
        EventEmitter.emit('partHover', partKey);
    }
    
    clearHighlight() {
        if (this.currentHighlightedPart && this.app.currentTurbine) {
            this.app.currentTurbine.unhighlightPart(this.currentHighlightedPart);
        }
        this.currentHighlightedPart = null;
    }
    
    showTooltip(x, y, text) {
        this.tooltip.textContent = text;
        this.tooltip.style.left = (x + 15) + 'px';
        this.tooltip.style.top = (y + 15) + 'px';
        this.tooltip.classList.remove('hidden');
    }
    
    hideTooltip() {
        this.tooltip.classList.add('hidden');
    }
    
    showPartDetail(partKey) {
        const partData = PART_DETAILS[partKey];
        if (!partData) return;
        
        this.modalTitle.textContent = partData.name;
        this.modalDescription.innerHTML = partData.description;
        this.modal.classList.remove('hidden');
        
        EventEmitter.emit('partClick', partKey);
    }
    
    closeModal() {
        this.modal.classList.add('hidden');
    }
    
    reset() {
        this.clearHighlight();
        this.hideTooltip();
        this.closeModal();
    }
}
