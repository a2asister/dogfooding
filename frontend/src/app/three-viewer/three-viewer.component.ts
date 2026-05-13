import { Component, OnInit, OnDestroy, Output, EventEmitter, NgZone } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-three-viewer',
  standalone: false,
  template: '<div id="canvas-container"></div>',
})
export class ThreeViewerComponent implements OnInit, OnDestroy {
  @Output() houseSelected = new EventEmitter<any>();
  @Output() buildingSelected = new EventEmitter<any>();

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationId!: number;
  private buildings: THREE.Group[] = [];
  private flowPath!: THREE.Group;
  private clock = new THREE.Clock();
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  private mockBuildings = [
    {
      id: 1,
      name: '1号楼',
      address: '中心区A座',
      floors: 20,
      position: { x: -30, z: -20 },
    },
    {
      id: 2,
      name: '2号楼',
      address: '中心区B座',
      floors: 18,
      position: { x: 0, z: -20 },
    },
    {
      id: 3,
      name: '3号楼',
      address: '中心区C座',
      floors: 22,
      position: { x: 30, z: -20 },
    },
    {
      id: 4,
      name: '5号楼',
      address: '东区A座',
      floors: 15,
      position: { x: -30, z: 20 },
    },
    {
      id: 5,
      name: '6号楼',
      address: '东区B座',
      floors: 16,
      position: { x: 0, z: 20 },
    },
  ];

  private mockHouses = [
    { id: 1, houseNumber: '101', floor: 1, status: 'available', price: 2500000, area: 120, bedrooms: 3, livingRooms: 2 },
    { id: 2, houseNumber: '102', floor: 1, status: 'sold', price: 2600000, area: 125, bedrooms: 3, livingRooms: 2 },
    { id: 3, houseNumber: '201', floor: 2, status: 'reserved', price: 2550000, area: 118, bedrooms: 3, livingRooms: 1 },
    { id: 4, houseNumber: '202', floor: 2, status: 'available', price: 2480000, area: 115, bedrooms: 2, livingRooms: 1 },
    { id: 5, houseNumber: '301', floor: 3, status: 'available', price: 2700000, area: 130, bedrooms: 4, livingRooms: 2 },
  ];

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    this.initScene();
    this.animate();
    this.addEventListeners();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    window.removeEventListener('click', this.onMouseClick.bind(this));
  }

  private initScene() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e27);
    this.scene.fog = new THREE.Fog(0x0a0e27, 50, 200);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(80, 60, 80);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.1;
    this.controls.minDistance = 30;
    this.controls.maxDistance = 150;

    this.addLights();
    this.addGround();
    this.addBuildings();
    this.addFlowPath();
    this.addFloatingMarkers();
  }

  private addLights() {
    const ambientLight = new THREE.AmbientLight(0x404080, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
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

    const pointLight1 = new THREE.PointLight(0x00aaff, 1, 100);
    pointLight1.position.set(0, 30, 0);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6600, 0.8, 80);
    pointLight2.position.set(-40, 20, 0);
    this.scene.add(pointLight2);
  }

  private addGround() {
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a2a4a,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const gridHelper = new THREE.GridHelper(200, 50, 0x3366aa, 0x224477);
    this.scene.add(gridHelper);

    const roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a3a5a,
      roughness: 0.9,
    });
    const road1 = new THREE.Mesh(new THREE.PlaneGeometry(200, 8), roadMaterial);
    road1.rotation.x = -Math.PI / 2;
    road1.position.y = 0.01;
    this.scene.add(road1);

    const road2 = new THREE.Mesh(new THREE.PlaneGeometry(8, 200), roadMaterial);
    road2.rotation.x = -Math.PI / 2;
    road2.position.y = 0.01;
    this.scene.add(road2);
  }

  private addBuildings() {
    this.mockBuildings.forEach((buildingData) => {
      const buildingGroup = new THREE.Group();
      buildingGroup.userData = { type: 'building', data: buildingData };

      const floorHeight = 3;
      const buildingHeight = buildingData.floors * floorHeight;
      const buildingWidth = 15;
      const buildingDepth = 12;

      const buildingGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
      const buildingMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a5a8a,
        roughness: 0.5,
        metalness: 0.3,
        transparent: true,
        opacity: 0.9,
      });
      const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
      buildingMesh.position.y = buildingHeight / 2;
      buildingMesh.castShadow = true;
      buildingMesh.receiveShadow = true;
      buildingGroup.add(buildingMesh);

      for (let floor = 0; floor < buildingData.floors; floor++) {
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 4; col++) {
            const isLit = Math.random() > 0.3;
            const windowGeometry = new THREE.PlaneGeometry(1.5, 1.8);
            const windowMaterial = new THREE.MeshBasicMaterial({
              color: isLit ? 0xffdd88 : 0x223355,
              transparent: true,
              opacity: isLit ? 0.9 : 0.5,
            });
            const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
            windowMesh.position.set(
              -buildingWidth / 2 + 1.5 + col * 3.5,
              floor * floorHeight + 2,
              buildingDepth / 2 + 0.01
            );
            buildingGroup.add(windowMesh);
          }
        }
      }

      const edgeGeometry = new THREE.EdgesGeometry(buildingGeometry);
      const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x66aaff, linewidth: 2 });
      const edgeLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
      edgeLines.position.y = buildingHeight / 2;
      buildingGroup.add(edgeLines);

      buildingGroup.position.set(buildingData.position.x, 0, buildingData.position.z);
      this.buildings.push(buildingGroup);
      this.scene.add(buildingGroup);
    });
  }

  private addFlowPath() {
    this.flowPath = new THREE.Group();
    const points = [
      new THREE.Vector3(-50, 0.5, 0),
      new THREE.Vector3(-20, 0.5, 0),
      new THREE.Vector3(-20, 0.5, 20),
      new THREE.Vector3(20, 0.5, 20),
      new THREE.Vector3(20, 0.5, 0),
      new THREE.Vector3(50, 0.5, 0),
    ];

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.3, 8, false);
    const tubeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.6,
    });
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    this.flowPath.add(tube);

    for (let i = 0; i < 20; i++) {
      const sphereGeometry = new THREE.SphereGeometry(0.4, 16, 16);
      const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.userData = { progress: i / 20 };
      this.flowPath.add(sphere);
    }

    this.scene.add(this.flowPath);
  }

  private addFloatingMarkers() {
    this.mockBuildings.forEach((buildingData) => {
      const markerGroup = new THREE.Group();
      markerGroup.userData = { type: 'marker', buildingId: buildingData.id };

      const coneGeometry = new THREE.ConeGeometry(1, 3, 8);
      const coneMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.8 });
      const cone = new THREE.Mesh(coneGeometry, coneMaterial);
      cone.rotation.x = Math.PI;
      markerGroup.add(cone);

      const ringGeometry = new THREE.RingGeometry(1.5, 2, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -1.5;
      markerGroup.add(ring);

      const buildingHeight = buildingData.floors * 3;
      markerGroup.position.set(
        buildingData.position.x,
        buildingHeight + 5,
        buildingData.position.z
      );
      markerGroup.userData.baseY = buildingHeight + 5;
      markerGroup.userData.phase = Math.random() * Math.PI * 2;
      this.scene.add(markerGroup);
    });
  }

  private animate() {
    this.ngZone.runOutsideAngular(() => {
      this.animationId = requestAnimationFrame(() => this.animate());
    });

    const time = this.clock.getElapsedTime();

    this.flowPath.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh && child.userData.progress !== undefined) {
        const progress = (child.userData.progress + time * 0.1) % 1;
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-50, 0.5, 0),
          new THREE.Vector3(-20, 0.5, 0),
          new THREE.Vector3(-20, 0.5, 20),
          new THREE.Vector3(20, 0.5, 20),
          new THREE.Vector3(20, 0.5, 0),
          new THREE.Vector3(50, 0.5, 0),
        ]);
        const point = curve.getPoint(progress);
        child.position.copy(point);
      }
    });

    this.scene.children.forEach((child) => {
      if (child.userData && child.userData.type === 'marker') {
        child.position.y = child.userData.baseY + Math.sin(time * 2 + child.userData.phase) * 1;
        child.rotation.y += 0.02;
      }
    });

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private addEventListeners() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('click', this.onMouseClick.bind(this));
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private onMouseClick(event: MouseEvent) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const buildingMeshes: THREE.Mesh[] = [];
    this.buildings.forEach((group) => {
      group.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          buildingMeshes.push(child);
        }
      });
    });

    const intersects = this.raycaster.intersectObjects(buildingMeshes);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      let parentGroup: THREE.Group | null = clickedObject.parent as THREE.Group;
      while (parentGroup && !parentGroup.userData?.type) {
        parentGroup = parentGroup.parent as THREE.Group | null;
      }
      if (parentGroup && parentGroup.userData?.type === 'building') {
        this.highlightBuilding(parentGroup);
        this.buildingSelected.emit(parentGroup.userData.data);
      }
    }
  }

  private highlightBuilding(buildingGroup: THREE.Group) {
    buildingGroup.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.emissive = new THREE.Color(0x0066ff);
        child.material.emissiveIntensity = 0.3;
        setTimeout(() => {
          child.material.emissive = new THREE.Color(0x000000);
          child.material.emissiveIntensity = 0;
        }, 1000);
      }
    });
  }

  expandFloors(buildingId: number) {
    const building = this.buildings.find(
      (b) => b.userData.data.id === buildingId
    );
    if (!building) return;

    const targetY = 10;
    const animate = () => {
      let expanded = false;
      building.children.forEach((child, index) => {
        if (index > 0) {
          const targetPosition = new THREE.Vector3(
            child.position.x,
            targetY + index * 5,
            child.position.z
          );
          child.position.lerp(targetPosition, 0.05);
          if (child.position.y < targetY + index * 5 - 0.1) {
            expanded = true;
          }
        }
      });
      if (expanded) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  collapseFloors(buildingId: number) {
    const building = this.buildings.find(
      (b) => b.userData.data.id === buildingId
    );
    if (!building) return;

    const animate = () => {
      let collapsed = false;
      building.children.forEach((child, index) => {
        if (index > 0) {
          const originalY = (index - 1) * 3 + 2;
          const targetPosition = new THREE.Vector3(
            child.position.x,
            originalY,
            child.position.z
          );
          child.position.lerp(targetPosition, 0.05);
          if (child.position.y > originalY + 0.1) {
            collapsed = true;
          }
        }
      });
      if (collapsed) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  highlightHouse(houseId: number) {
    const house = this.mockHouses.find((h) => h.id === houseId);
    if (house) {
      this.houseSelected.emit(house);
    }
  }
}
