class BaseScene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.container = null;
        this.lights = {};
        this.objects = [];
    }
    
    init(container) {
        this.container = container;
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createControls();
        this.setupEventListeners();
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0xB0E0E6, 50, 300);
    }
    
    createCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(30, 25, 40);
        this.camera.lookAt(0, 15, 0);
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
    
    createLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
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
        this.scene.add(directionalLight);
        this.lights.directional = directionalLight;
        
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x7CB342, 0.3);
        this.scene.add(hemisphereLight);
        this.lights.hemisphere = hemisphereLight;
    }
    
    createControls() {
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let spherical = {
            radius: 60,
            theta: Math.PI / 4,
            phi: Math.PI / 3
        };
        
        const updateCameraPosition = () => {
            this.camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
            this.camera.position.y = spherical.radius * Math.cos(spherical.phi);
            this.camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
            this.camera.lookAt(0, 15, 0);
        };
        
        this.container.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        this.container.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            spherical.theta -= deltaX * 0.01;
            spherical.phi = Utils.clamp(spherical.phi - deltaY * 0.01, 0.1, Math.PI / 2 - 0.1);
            
            updateCameraPosition();
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        this.container.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        this.container.addEventListener('mouseleave', () => {
            isDragging = false;
        });
        
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            spherical.radius = Utils.clamp(spherical.radius + e.deltaY * 0.05, 20, 150);
            updateCameraPosition();
        }, { passive: false });
        
        this.controls = {
            reset: () => {
                spherical = {
                    radius: 60,
                    theta: Math.PI / 4,
                    phi: Math.PI / 3
                };
                updateCameraPosition();
            }
        };
        
        updateCameraPosition();
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
    
    addObject(obj) {
        this.scene.add(obj);
        this.objects.push(obj);
    }
    
    removeObject(obj) {
        this.scene.remove(obj);
        const index = this.objects.indexOf(obj);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }
    
    clear() {
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }
        this.objects = [];
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    update(deltaTime) {
    }
}
