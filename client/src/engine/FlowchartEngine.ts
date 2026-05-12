import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface NodeData {
  id: string
  name: string
  type: string
  position: { x: number; y: number; z: number }
  collapsed: boolean
  children: string[]
}

interface ConnectionData {
  id: string
  from: string
  to: string
}

export class FlowchartEngine {
  private container: HTMLElement
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private controls!: OrbitControls
  private nodes: Map<string, { mesh: THREE.Group; data: NodeData }> = new Map()
  private connections: Map<string, { mesh: THREE.Line; data: ConnectionData }> = new Map()
  private raycaster: THREE.Raycaster = new THREE.Raycaster()
  private mouse: THREE.Vector2 = new THREE.Vector2()
  private selectedNode: string | null = null
  private isDragging: boolean = false
  private dragPlane: THREE.Plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  private onNodeSelectCallback: ((node: NodeData) => void) | null = null
  private animationId: number = 0
  private particleSystems: THREE.Points[] = []

  constructor(container: HTMLElement) {
    this.container = container
    this.particleSystems = []
  }

  init(): void {
    this.setupScene()
    this.setupCamera()
    this.setupRenderer()
    this.setupControls()
    this.setupLighting()
    this.setupGrid()
    this.setupParticleSystem()
    this.setupEventListeners()
    this.animate()
  }

  private setupScene(): void {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0c0c1e)
    this.scene.fog = new THREE.Fog(0x0c0c1e, 50, 200)
  }

  private setupCamera(): void {
    const { clientWidth, clientHeight } = this.container
    this.camera = new THREE.PerspectiveCamera(60, clientWidth / clientHeight, 0.1, 1000)
    this.camera.position.set(0, 0, 30)
  }

  private setupRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.container.appendChild(this.renderer.domElement)
  }

  private setupControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.enablePan = true
    this.controls.enableZoom = true
    this.controls.autoRotate = false
    this.controls.minDistance = 5
    this.controls.maxDistance = 100
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0x404080, 0.5)
    this.scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xffffff, 1)
    mainLight.position.set(10, 20, 10)
    mainLight.castShadow = true
    mainLight.shadow.mapSize.width = 2048
    mainLight.shadow.mapSize.height = 2048
    this.scene.add(mainLight)

    const blueLight = new THREE.PointLight(0x6496ff, 1, 50)
    blueLight.position.set(-10, 10, 10)
    this.scene.add(blueLight)

    const cyanLight = new THREE.PointLight(0x64ffda, 0.8, 50)
    cyanLight.position.set(10, -10, 10)
    this.scene.add(cyanLight)
  }

  private setupGrid(): void {
    const gridHelper = new THREE.GridHelper(200, 100, 0x333366, 0x222244)
    gridHelper.position.y = -10
    this.scene.add(gridHelper)
  }

  private setupParticleSystem(): void {
    const particleCount = 1000
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200

      const color = new THREE.Color()
      color.setHSL(Math.random() * 0.2 + 0.5, 1, 0.6)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })

    const particles = new THREE.Points(geometry, material)
    this.particleSystems.push(particles)
    this.scene.add(particles)
  }

  private setupEventListeners(): void {
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this))
    this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this))
    window.addEventListener('resize', this.onResize.bind(this))
  }

  private onMouseMove(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    if (this.isDragging && this.selectedNode) {
      this.raycaster.setFromCamera(this.mouse, this.camera)
      const intersection = new THREE.Vector3()
      this.raycaster.ray.intersectPlane(this.dragPlane, intersection)

      if (intersection) {
        const node = this.nodes.get(this.selectedNode)
        if (node) {
          node.mesh.position.copy(intersection)
          node.data.position = {
            x: intersection.x,
            y: intersection.y,
            z: intersection.z
          }
          this.updateConnections()
        }
      }
    }
  }

  private onMouseDown(event: MouseEvent): void {
    this.raycaster.setFromCamera(this.mouse, this.camera)

    const meshes = Array.from(this.nodes.values()).map(n => n.mesh)
    const intersects = this.raycaster.intersectObjects(meshes, true)

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object
      let nodeMesh = clickedMesh
      while (nodeMesh.parent && nodeMesh.parent !== this.scene) {
        nodeMesh = nodeMesh.parent as THREE.Group
      }
      
      for (const [id, node] of this.nodes) {
        if (node.mesh === nodeMesh) {
          this.selectedNode = id
          this.isDragging = true
          this.highlightNode(id)
          
          if (event.detail === 2) {
            this.toggleCollapse(id)
          }
          
          if (this.onNodeSelectCallback) {
            this.onNodeSelectCallback(node.data)
          }
          break
        }
      }
    } else {
      this.selectedNode = null
      this.clearHighlights()
    }
  }

  private onMouseUp(): void {
    this.isDragging = false
  }

  private onResize(): void {
    const { clientWidth, clientHeight } = this.container
    this.camera.aspect = clientWidth / clientHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(clientWidth, clientHeight)
  }

  addNode(): NodeData {
    const id = `node_${Date.now()}`
    
    let position = {
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
      z: 0
    }

    let parentNodeId: string | null = null

    if (this.selectedNode) {
      const parentNode = this.nodes.get(this.selectedNode)
      if (parentNode) {
        position = {
          x: parentNode.data.position.x + 5 + Math.random() * 5,
          y: parentNode.data.position.y + (Math.random() - 0.5) * 5,
          z: parentNode.data.position.z
        }
        parentNodeId = this.selectedNode
      }
    }

    const nodeData: NodeData = {
      id,
      name: `节点 ${this.nodes.size + 1}`,
      type: 'process',
      position,
      collapsed: false,
      children: []
    }

    const nodeGroup = this.createNodeMesh(nodeData)
    nodeGroup.position.set(nodeData.position.x, nodeData.position.y, nodeData.position.z)
    this.scene.add(nodeGroup)
    this.nodes.set(id, { mesh: nodeGroup, data: nodeData })

    if (parentNodeId) {
      const parentNode = this.nodes.get(parentNodeId)
      if (parentNode) {
        parentNode.data.children.push(id)
        this.addConnection(parentNodeId, id)
      }
    } else if (this.nodes.size > 1) {
      const firstNodeId = this.nodes.keys().next().value
      if (firstNodeId && firstNodeId !== id) {
        this.addConnection(firstNodeId, id)
      }
    }

    return nodeData
  }

  private createNodeMesh(data: NodeData): THREE.Group {
    const group = new THREE.Group()

    let geometry: THREE.BufferGeometry
    let color: number

    switch (data.type) {
      case 'start':
        geometry = new THREE.SphereGeometry(1.5, 32, 32)
        color = 0x64ffda
        break
      case 'end':
        geometry = new THREE.SphereGeometry(1.5, 32, 32)
        color = 0xff6b6b
        break
      case 'decision':
        geometry = new THREE.OctahedronGeometry(2)
        color = 0xffd93d
        break
      default:
        geometry = new THREE.BoxGeometry(3, 2, 1.5)
        color = 0x6496ff
    }

    const material = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.3,
      roughness: 0.5,
      emissive: color,
      emissiveIntensity: 0.2
    })

    const nodeMesh = new THREE.Mesh(geometry, material)
    nodeMesh.castShadow = true
    nodeMesh.receiveShadow = true
    group.add(nodeMesh)

    const glowGeometry = geometry.clone()
    const glowMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    })
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
    glowMesh.scale.setScalar(1.2)
    group.add(glowMesh)

    return group
  }

  private highlightNode(id: string): void {
    this.clearHighlights()
    const node = this.nodes.get(id)
    if (node) {
      const material = (node.mesh.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.8
    }
  }

  private clearHighlights(): void {
    this.nodes.forEach((node) => {
      const material = (node.mesh.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.2
    })
  }

  toggleCollapse(id: string): void {
    const node = this.nodes.get(id)
    if (node) {
      node.data.collapsed = !node.data.collapsed
      const scale = node.data.collapsed ? 0.5 : 1
      node.mesh.scale.setScalar(scale)
    }
  }

  addConnection(fromId: string, toId: string): ConnectionData {
    const id = `conn_${Date.now()}`
    const connectionData: ConnectionData = { id, from: fromId, to: toId }

    const fromNode = this.nodes.get(fromId)
    const toNode = this.nodes.get(toId)

    if (fromNode && toNode) {
      const lineMesh = this.createConnectionMesh(
        fromNode.mesh.position,
        toNode.mesh.position
      )
      this.scene.add(lineMesh)
      this.connections.set(id, { mesh: lineMesh, data: connectionData })
    }

    return connectionData
  }

  private createConnectionMesh(from: THREE.Vector3, to: THREE.Vector3): THREE.Line {
    const points: THREE.Vector3[] = []
    const midPoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5)
    midPoint.y += 2

    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      const point = new THREE.Vector3()
      point.lerpVectors(from, midPoint, t * 2)
      if (t > 0.5) {
        point.lerpVectors(midPoint, to, (t - 0.5) * 2)
      }
      points.push(point)
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: 0x64ffda,
      transparent: true,
      opacity: 0.8
    })

    return new THREE.Line(geometry, material)
  }

  private updateConnections(): void {
    this.connections.forEach((conn) => {
      const fromNode = this.nodes.get(conn.data.from)
      const toNode = this.nodes.get(conn.data.to)

      if (fromNode && toNode) {
        const positions = conn.mesh.geometry.attributes.position.array as Float32Array
        const from = fromNode.mesh.position
        const to = toNode.mesh.position
        const midPoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5)
        midPoint.y += 2

        for (let i = 0; i <= 20; i++) {
          const t = i / 20
          const point = new THREE.Vector3()
          point.lerpVectors(from, midPoint, t * 2)
          if (t > 0.5) {
            point.lerpVectors(midPoint, to, (t - 0.5) * 2)
          }
          positions[i * 3] = point.x
          positions[i * 3 + 1] = point.y
          positions[i * 3 + 2] = point.z
        }

        conn.mesh.geometry.attributes.position.needsUpdate = true
      }
    })
  }

  updateNode(data: NodeData): void {
    const node = this.nodes.get(data.id)
    if (node) {
      Object.assign(node.data, data)
      this.scene.remove(node.mesh)
      const newMesh = this.createNodeMesh(data)
      newMesh.position.set(data.position.x, data.position.y, data.position.z)
      node.mesh = newMesh
      this.scene.add(newMesh)
      this.updateConnections()
    }
  }

  removeNode(id: string): void {
    const node = this.nodes.get(id)
    if (node) {
      this.scene.remove(node.mesh)
      this.nodes.delete(id)

      this.nodes.forEach((parentNode) => {
        const childIndex = parentNode.data.children.indexOf(id)
        if (childIndex !== -1) {
          parentNode.data.children.splice(childIndex, 1)
        }
      })

      this.connections.forEach((conn, connId) => {
        if (conn.data.from === id || conn.data.to === id) {
          this.scene.remove(conn.mesh)
          this.connections.delete(connId)
        }
      })
    }
  }

  onNodeSelect(callback: (node: NodeData) => void): void {
    this.onNodeSelectCallback = callback
  }

  exportData(): { nodes: NodeData[]; connections: ConnectionData[] } {
    return {
      nodes: Array.from(this.nodes.values()).map(n => n.data),
      connections: Array.from(this.connections.values()).map(c => c.data)
    }
  }

  exportImage(): void {
    this.renderer.render(this.scene, this.camera)
    const link = document.createElement('a')
    link.download = 'flowchart.png'
    link.href = this.renderer.domElement.toDataURL('image/png')
    link.click()
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(this.animate.bind(this))

    this.particleSystems.forEach((particles) => {
      particles.rotation.y += 0.0005
      particles.rotation.x += 0.0002
    })

    this.nodes.forEach((node) => {
      const time = Date.now() * 0.001
      node.mesh.rotation.y = Math.sin(time + node.mesh.position.x * 0.1) * 0.1
    })

    this.connections.forEach((conn) => {
      const material = conn.mesh.material as THREE.LineBasicMaterial
      const time = Date.now() * 0.002
      material.opacity = 0.6 + Math.sin(time) * 0.2
    })

    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  dispose(): void {
    cancelAnimationFrame(this.animationId)
    this.renderer.dispose()
    this.container.removeChild(this.renderer.domElement)
    window.removeEventListener('resize', this.onResize.bind(this))
  }
}
