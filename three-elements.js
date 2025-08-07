// Import Three.js library
const THREE = require("three")

// 3D Scene Manager
class ThreeJSManager {
  constructor() {
    this.scenes = {}
    this.renderers = {}
    this.cameras = {}
    this.controls = {}
    this.mouse = { x: 0, y: 0 }
    this.raycaster = new THREE.Raycaster()
    this.mouseVector = new THREE.Vector2()

    this.init()
    this.setupEventListeners()
  }

  init() {
    this.createHero3D()
    this.createBackground3D()
    this.createSkills3D()
    this.animate()
  }

  setupEventListeners() {
    window.addEventListener("mousemove", (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      this.mouseVector.x = this.mouse.x
      this.mouseVector.y = this.mouse.y
    })

    window.addEventListener("resize", () => {
      this.handleResize()
    })
  }

  createHero3D() {
    const canvas = document.getElementById("hero3D")
    if (!canvas) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    })

    renderer.setSize(400, 400)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // Create floating geometric shapes
    const geometry1 = new THREE.IcosahedronGeometry(1, 0)
    const geometry2 = new THREE.OctahedronGeometry(0.8)
    const geometry3 = new THREE.TetrahedronGeometry(0.6)

    // Create materials with gradients
    const material1 = new THREE.MeshPhongMaterial({
      color: 0x667eea,
      transparent: true,
      opacity: 0.8,
      shininess: 100,
    })

    const material2 = new THREE.MeshPhongMaterial({
      color: 0x764ba2,
      transparent: true,
      opacity: 0.7,
      shininess: 100,
    })

    const material3 = new THREE.MeshPhongMaterial({
      color: 0x4facfe,
      transparent: true,
      opacity: 0.6,
      shininess: 100,
    })

    const mesh1 = new THREE.Mesh(geometry1, material1)
    const mesh2 = new THREE.Mesh(geometry2, material2)
    const mesh3 = new THREE.Mesh(geometry3, material3)

    mesh1.position.set(0, 0, 0)
    mesh2.position.set(-2, 1, -1)
    mesh3.position.set(2, -1, 1)

    mesh1.castShadow = true
    mesh2.castShadow = true
    mesh3.castShadow = true

    scene.add(mesh1)
    scene.add(mesh2)
    scene.add(mesh3)

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0x667eea, 1)
    directionalLight.position.set(5, 5, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0x764ba2, 0.8, 10)
    pointLight.position.set(-3, 3, 3)
    scene.add(pointLight)

    camera.position.z = 5

    // Store references
    this.scenes.hero = scene
    this.cameras.hero = camera
    this.renderers.hero = renderer
    this.heroMeshes = [mesh1, mesh2, mesh3]
  }

  createBackground3D() {
    const canvas = document.getElementById("background3D")
    if (!canvas) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Create floating particles
    const particleCount = 100
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20

      const color = new THREE.Color()
      color.setHSL(0.6 + Math.random() * 0.2, 0.7, 0.6)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      sizes[i] = Math.random() * 3 + 1
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Add floating animation
          mvPosition.y += sin(time + position.x * 0.1) * 0.5;
          mvPosition.x += cos(time + position.z * 0.1) * 0.3;
          
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float distance = length(gl_PointCoord - vec2(0.5));
          if (distance > 0.5) discard;
          
          float alpha = 1.0 - distance * 2.0;
          gl_FragColor = vec4(vColor, alpha * 0.6);
        }
      `,
      transparent: true,
      vertexColors: true,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    camera.position.z = 5

    this.scenes.background = scene
    this.cameras.background = camera
    this.renderers.background = renderer
    this.backgroundParticles = particles
    this.backgroundMaterial = material
  }

  createSkills3D() {
    const canvas = document.getElementById("skills3D")
    if (!canvas) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    })

    renderer.setSize(300, 300)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Create skill visualization
    const skillLevels = [0.95, 0.9, 0.92, 0.88, 0.85, 0.8]
    const skillMeshes = []

    skillLevels.forEach((level, index) => {
      const geometry = new THREE.RingGeometry(0.5 + index * 0.2, 0.6 + index * 0.2, 8, 1, 0, Math.PI * 2 * level)
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.6 + index * 0.05, 0.7, 0.6),
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.rotation.z = index * 0.1
      scene.add(mesh)
      skillMeshes.push(mesh)
    })

    // Add center sphere
    const centerGeometry = new THREE.SphereGeometry(0.3, 16, 16)
    const centerMaterial = new THREE.MeshPhongMaterial({
      color: 0x667eea,
      transparent: true,
      opacity: 0.9,
      shininess: 100,
    })
    const centerMesh = new THREE.Mesh(centerGeometry, centerMaterial)
    scene.add(centerMesh)

    // Add light
    const light = new THREE.PointLight(0x667eea, 1, 10)
    light.position.set(0, 0, 3)
    scene.add(light)

    camera.position.z = 4

    this.scenes.skills = scene
    this.cameras.skills = camera
    this.renderers.skills = renderer
    this.skillMeshes = skillMeshes
    this.centerMesh = centerMesh
  }

  animate() {
    const time = Date.now() * 0.001

    // Animate hero scene
    if (this.scenes.hero && this.heroMeshes) {
      this.heroMeshes.forEach((mesh, index) => {
        mesh.rotation.x = time * 0.5 + index
        mesh.rotation.y = time * 0.3 + index
        mesh.rotation.z = time * 0.2 + index

        // Mouse interaction
        mesh.position.x += (this.mouse.x * 0.5 - mesh.position.x) * 0.05
        mesh.position.y += (-this.mouse.y * 0.5 - mesh.position.y) * 0.05
      })

      this.renderers.hero.render(this.scenes.hero, this.cameras.hero)
    }

    // Animate background scene
    if (this.scenes.background && this.backgroundParticles) {
      this.backgroundMaterial.uniforms.time.value = time
      this.backgroundParticles.rotation.y = time * 0.1

      this.renderers.background.render(this.scenes.background, this.cameras.background)
    }

    // Animate skills scene
    if (this.scenes.skills && this.skillMeshes) {
      this.skillMeshes.forEach((mesh, index) => {
        mesh.rotation.z = time * 0.2 + index * 0.1
      })

      if (this.centerMesh) {
        this.centerMesh.rotation.x = time * 0.5
        this.centerMesh.rotation.y = time * 0.3
      }

      this.renderers.skills.render(this.scenes.skills, this.cameras.skills)
    }

    requestAnimationFrame(() => this.animate())
  }

  handleResize() {
    // Resize background renderer
    if (this.renderers.background && this.cameras.background) {
      this.cameras.background.aspect = window.innerWidth / window.innerHeight
      this.cameras.background.updateProjectionMatrix()
      this.renderers.background.setSize(window.innerWidth, window.innerHeight)
    }

    // Resize other renderers based on their containers
    const heroCanvas = document.getElementById("hero3D")
    if (heroCanvas && this.renderers.hero) {
      const rect = heroCanvas.getBoundingClientRect()
      this.renderers.hero.setSize(rect.width, rect.height)
    }

    const skillsCanvas = document.getElementById("skills3D")
    if (skillsCanvas && this.renderers.skills) {
      const rect = skillsCanvas.getBoundingClientRect()
      this.renderers.skills.setSize(rect.width, rect.height)
    }
  }

  // Method to add interactive hover effects
  addHoverEffects() {
    const heroCanvas = document.getElementById("hero3D")
    if (heroCanvas && this.heroMeshes) {
      heroCanvas.addEventListener("mousemove", (event) => {
        const rect = heroCanvas.getBoundingClientRect()
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        this.raycaster.setFromCamera({ x, y }, this.cameras.hero)
        const intersects = this.raycaster.intersectObjects(this.heroMeshes)

        // Reset all meshes
        this.heroMeshes.forEach((mesh) => {
          mesh.scale.setScalar(1)
          mesh.material.opacity = 0.8
        })

        // Highlight intersected mesh
        if (intersects.length > 0) {
          const mesh = intersects[0].object
          mesh.scale.setScalar(1.2)
          mesh.material.opacity = 1
        }
      })

      heroCanvas.addEventListener("mouseleave", () => {
        this.heroMeshes.forEach((mesh) => {
          mesh.scale.setScalar(1)
          mesh.material.opacity = 0.8
        })
      })
    }
  }

  // Method to create project 3D previews
  createProject3DPreviews() {
    const projectCards = document.querySelectorAll(".project-card")

    projectCards.forEach((card, index) => {
      const canvas = document.createElement("canvas")
      canvas.className = "project-3d-preview"
      canvas.width = 200
      canvas.height = 150

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, 200 / 150, 0.1, 1000)
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })

      renderer.setSize(200, 150)

      // Create different shapes for different projects
      const geometries = [
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.ConeGeometry(0.5, 1, 8),
        new THREE.CylinderGeometry(0.5, 0.5, 1, 8),
        new THREE.SphereGeometry(0.6, 16, 16),
      ]

      const geometry = geometries[index % geometries.length]
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(0.6 + index * 0.1, 0.7, 0.6),
        transparent: true,
        opacity: 0.8,
      })

      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      const light = new THREE.PointLight(0x667eea, 1, 10)
      light.position.set(2, 2, 2)
      scene.add(light)

      camera.position.z = 3

      // Animation loop for this project
      const animateProject = () => {
        mesh.rotation.x += 0.01
        mesh.rotation.y += 0.01
        renderer.render(scene, camera)
        requestAnimationFrame(animateProject)
      }
      animateProject()

      // Add canvas to project card
      const projectImage = card.querySelector(".project-image")
      if (projectImage) {
        canvas.style.position = "absolute"
        canvas.style.top = "10px"
        canvas.style.right = "10px"
        canvas.style.borderRadius = "8px"
        canvas.style.opacity = "0"
        canvas.style.transition = "opacity 0.3s ease"
        projectImage.appendChild(canvas)

        // Show on hover
        card.addEventListener("mouseenter", () => {
          canvas.style.opacity = "1"
        })

        card.addEventListener("mouseleave", () => {
          canvas.style.opacity = "0"
        })
      }
    })
  }
}

// Enhanced Particle System with 3D integration
class Enhanced3DParticleSystem {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")
    this.particles = []
    this.mouse = { x: 0, y: 0 }
    this.time = 0

    this.resize()
    this.init()
    this.animate()

    window.addEventListener("resize", () => this.resize())
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX
      this.mouse.y = e.clientY
    })
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  init() {
    const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000)

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        z: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        hue: Math.random() * 60 + 200,
        phase: Math.random() * Math.PI * 2,
      })
    }
  }

  animate() {
    this.time += 0.01

    // Create depth effect with gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height)
    gradient.addColorStop(0, "rgba(10, 10, 10, 0.1)")
    gradient.addColorStop(1, "rgba(10, 10, 10, 0.05)")

    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.particles.forEach((particle, index) => {
      // Update 3D position
      particle.x += particle.vx
      particle.y += particle.vy
      particle.z += particle.vz

      // Add wave motion
      particle.x += Math.sin(this.time + particle.phase) * 0.5
      particle.y += Math.cos(this.time + particle.phase) * 0.3

      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvas.width
      if (particle.x > this.canvas.width) particle.x = 0
      if (particle.y < 0) particle.y = this.canvas.height
      if (particle.y > this.canvas.height) particle.y = 0
      if (particle.z < 0) particle.z = 1000
      if (particle.z > 1000) particle.z = 0

      // Calculate depth-based properties
      const depth = particle.z / 1000
      const scale = 1 - depth * 0.8
      const alpha = particle.opacity * scale

      // Mouse interaction with 3D effect
      const dx = this.mouse.x - particle.x
      const dy = this.mouse.y - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 150) {
        const force = (150 - distance) / 150
        particle.vx += (dx / distance) * force * 0.02
        particle.vy += (dy / distance) * force * 0.02
        particle.vz += force * 5
      }

      // Apply friction
      particle.vx *= 0.99
      particle.vy *= 0.99
      particle.vz *= 0.98

      // Draw particle with 3D effect
      const size = particle.size * scale
      const x = particle.x
      const y = particle.y

      // Create glow effect
      const glowGradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 4)
      glowGradient.addColorStop(0, `hsla(${particle.hue}, 70%, 60%, ${alpha})`)
      glowGradient.addColorStop(0.5, `hsla(${particle.hue}, 70%, 60%, ${alpha * 0.5})`)
      glowGradient.addColorStop(1, `hsla(${particle.hue}, 70%, 60%, 0)`)

      this.ctx.beginPath()
      this.ctx.arc(x, y, size * 4, 0, Math.PI * 2)
      this.ctx.fillStyle = glowGradient
      this.ctx.fill()

      // Draw core particle
      this.ctx.beginPath()
      this.ctx.arc(x, y, size, 0, Math.PI * 2)
      this.ctx.fillStyle = `hsla(${particle.hue}, 70%, 70%, ${alpha})`
      this.ctx.fill()

      // Draw connections with depth consideration
      this.particles.slice(index + 1).forEach((otherParticle) => {
        const dx = particle.x - otherParticle.x
        const dy = particle.y - otherParticle.y
        const dz = particle.z - otherParticle.z
        const distance3D = Math.sqrt(dx * dx + dy * dy + dz * dz * 0.1)

        if (distance3D < 100) {
          const opacity = (1 - distance3D / 100) * 0.1 * scale
          this.ctx.beginPath()
          this.ctx.moveTo(particle.x, particle.y)
          this.ctx.lineTo(otherParticle.x, otherParticle.y)
          this.ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`
          this.ctx.lineWidth = 1
          this.ctx.stroke()
        }
      })
    })

    requestAnimationFrame(() => this.animate())
  }
}

// Initialize all 3D elements
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Three.js manager
  const threeManager = new ThreeJSManager()

  // Add hover effects after initialization
  setTimeout(() => {
    threeManager.addHoverEffects()
    threeManager.createProject3DPreviews()
  }, 1000)

  // Replace the existing particle system with enhanced 3D version
  const canvas = document.getElementById("particleCanvas")
  if (canvas) {
    new Enhanced3DParticleSystem(canvas)
  }
})

// Export for potential external use
window.ThreeJSManager = ThreeJSManager
