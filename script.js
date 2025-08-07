// Enhanced Particle System with Premium Effects
class PremiumParticleSystem {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")
    this.particles = []
    this.connections = []
    this.mouse = { x: 0, y: 0 }
    this.animationId = null

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
    const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 12000)

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        hue: Math.random() * 60 + 200, // Blue to purple range
        life: Math.random() * 100 + 100,
      })
    }
  }

  animate() {
    this.ctx.fillStyle = "rgba(10, 10, 10, 0.05)"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.particles.forEach((particle, index) => {
      // Update position
      particle.x += particle.vx
      particle.y += particle.vy

      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvas.width
      if (particle.x > this.canvas.width) particle.x = 0
      if (particle.y < 0) particle.y = this.canvas.height
      if (particle.y > this.canvas.height) particle.y = 0

      // Mouse interaction with enhanced effect
      const dx = this.mouse.x - particle.x
      const dy = this.mouse.y - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 150) {
        const force = (150 - distance) / 150
        const angle = Math.atan2(dy, dx)
        particle.vx += Math.cos(angle) * force * 0.02
        particle.vy += Math.sin(angle) * force * 0.02
        particle.opacity = Math.min(1, particle.opacity + force * 0.1)
      }

      // Apply friction and restore velocity
      particle.vx *= 0.98
      particle.vy *= 0.98

      // Restore original opacity
      particle.opacity = Math.max(0.2, particle.opacity - 0.005)

      // Draw particle with glow effect
      const gradient = this.ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.size * 3,
      )
      gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`)
      gradient.addColorStop(1, `hsla(${particle.hue}, 70%, 60%, 0)`)

      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
      this.ctx.fillStyle = gradient
      this.ctx.fill()

      // Draw core particle
      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      this.ctx.fillStyle = `hsla(${particle.hue}, 70%, 70%, ${particle.opacity})`
      this.ctx.fill()

      // Draw connections
      this.particles.slice(index + 1).forEach((otherParticle) => {
        const dx = particle.x - otherParticle.x
        const dy = particle.y - otherParticle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 120) {
          const opacity = (1 - distance / 120) * 0.1
          this.ctx.beginPath()
          this.ctx.moveTo(particle.x, particle.y)
          this.ctx.lineTo(otherParticle.x, otherParticle.y)
          this.ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`
          this.ctx.lineWidth = 1
          this.ctx.stroke()
        }
      })
    })

    this.animationId = requestAnimationFrame(() => this.animate())
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  }
}

// Initialize particle system
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("particleCanvas")
  const particleSystem = new PremiumParticleSystem(canvas)

  // Clean up on page unload
  window.addEventListener("beforeunload", () => {
    particleSystem.destroy()
  })
})

// Enhanced Navigation
class Navigation {
  constructor() {
    this.navbar = document.querySelector(".navbar")
    this.hamburger = document.querySelector(".hamburger")
    this.navMenu = document.querySelector(".nav-menu")
    this.navLinks = document.querySelectorAll(".nav-link")

    this.init()
  }

  init() {
    // Mobile menu toggle
    this.hamburger.addEventListener("click", () => {
      this.toggleMobileMenu()
    })

    // Close mobile menu when clicking on links
    this.navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        this.closeMobileMenu()
      })
    })

    // Navbar background on scroll
    window.addEventListener("scroll", () => {
      this.handleScroll()
    })

    // Smooth scrolling
    this.navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const targetId = link.getAttribute("href")
        const targetSection = document.querySelector(targetId)

        if (targetSection) {
          targetSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      })
    })
  }

  toggleMobileMenu() {
    this.hamburger.classList.toggle("active")
    this.navMenu.classList.toggle("active")
  }

  closeMobileMenu() {
    this.hamburger.classList.remove("active")
    this.navMenu.classList.remove("active")
  }

  handleScroll() {
    const scrollY = window.scrollY

    if (scrollY > 100) {
      this.navbar.style.background = "rgba(10, 10, 10, 0.95)"
      this.navbar.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)"
    } else {
      this.navbar.style.background = "rgba(10, 10, 10, 0.8)"
      this.navbar.style.boxShadow = "none"
    }
  }
}

// Initialize navigation
new Navigation()

// Enhanced Scroll Animations
class ScrollAnimations {
  constructor() {
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    this.observer = new IntersectionObserver((entries) => {
      this.handleIntersection(entries)
    }, this.observerOptions)

    this.init()
  }

  init() {
    // Observe sections
    document.querySelectorAll("section").forEach((section) => {
      this.observer.observe(section)
    })

    // Observe individual elements
    document.querySelectorAll(".expertise-item, .skill-category, .project-card").forEach((element) => {
      this.observer.observe(element)
    })
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in")

        // Animate skill bars
        if (entry.target.classList.contains("skills")) {
          this.animateSkillBars(entry.target)
        }

        // Animate counters
        if (entry.target.classList.contains("about")) {
          this.animateCounters()
        }
      }
    })
  }

  animateSkillBars(skillsSection) {
    const skillBars = skillsSection.querySelectorAll(".skill-progress")
    skillBars.forEach((bar, index) => {
      setTimeout(() => {
        const width = bar.getAttribute("data-width")
        bar.style.width = width
      }, index * 200)
    })
  }

  animateCounters() {
    const counters = document.querySelectorAll(".stat-number[data-target]")

    counters.forEach((counter) => {
      const target = Number.parseInt(counter.getAttribute("data-target"))
      const increment = target / 60
      let current = 0

      const updateCounter = () => {
        if (current < target) {
          current += increment
          counter.textContent = Math.ceil(current)
          requestAnimationFrame(updateCounter)
        } else {
          counter.textContent = target
        }
      }

      updateCounter()
    })
  }
}

// Initialize scroll animations
new ScrollAnimations()

// Enhanced Contact Form
class ContactForm {
  constructor() {
    this.form = document.querySelector(".contact-form")
    this.submitBtn = this.form.querySelector('button[type="submit"]')
    this.originalBtnText = this.submitBtn.innerHTML

    this.init()
  }

  init() {
    this.form.addEventListener("submit", (e) => {
      this.handleSubmit(e)
    })

    // Add input validation
    const inputs = this.form.querySelectorAll("input, textarea")
    inputs.forEach((input) => {
      input.addEventListener("blur", () => {
        this.validateField(input)
      })
    })
  }

  validateField(field) {
    const value = field.value.trim()
    const fieldGroup = field.closest(".form-group")

    // Remove existing error
    const existingError = fieldGroup.querySelector(".error-message")
    if (existingError) {
      existingError.remove()
    }

    fieldGroup.classList.remove("error")

    // Validate based on field type
    let isValid = true
    let errorMessage = ""

    if (field.hasAttribute("required") && !value) {
      isValid = false
      errorMessage = "This field is required"
    } else if (field.type === "email" && value && !this.isValidEmail(value)) {
      isValid = false
      errorMessage = "Please enter a valid email address"
    }

    if (!isValid) {
      fieldGroup.classList.add("error")
      const errorElement = document.createElement("span")
      errorElement.className = "error-message"
      errorElement.textContent = errorMessage
      fieldGroup.appendChild(errorElement)
    }

    return isValid
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  async handleSubmit(e) {
    e.preventDefault()

    // Validate all fields
    const inputs = this.form.querySelectorAll("input, textarea")
    let isFormValid = true

    inputs.forEach((input) => {
      if (!this.validateField(input)) {
        isFormValid = false
      }
    })

    if (!isFormValid) {
      return
    }

    // Get form data
    const formData = new FormData(this.form)
    const data = Object.fromEntries(formData)

    // Show loading state
    this.setLoadingState(true)

    try {
      // Simulate API call
      await this.simulateSubmission(data)
      this.showSuccess()
    } catch (error) {
      this.showError()
    } finally {
      this.setLoadingState(false)
    }
  }

  setLoadingState(loading) {
    if (loading) {
      this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>'
      this.submitBtn.disabled = true
    } else {
      this.submitBtn.innerHTML = this.originalBtnText
      this.submitBtn.disabled = false
    }
  }

  async simulateSubmission(data) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate success (you would replace this with actual API call)
    console.log("Form submitted:", data)
  }

  showSuccess() {
    this.submitBtn.innerHTML = '<i class="fas fa-check"></i> <span>Message Sent!</span>'
    this.submitBtn.style.background = "linear-gradient(135deg, #10b981, #059669)"

    setTimeout(() => {
      this.submitBtn.innerHTML = this.originalBtnText
      this.submitBtn.style.background = ""
      this.form.reset()
    }, 3000)
  }

  showError() {
    this.submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Error occurred</span>'
    this.submitBtn.style.background = "linear-gradient(135deg, #ef4444, #dc2626)"

    setTimeout(() => {
      this.submitBtn.innerHTML = this.originalBtnText
      this.submitBtn.style.background = ""
    }, 3000)
  }
}

// Initialize contact form
new ContactForm()

// Parallax Effects
class ParallaxEffects {
  constructor() {
    this.elements = document.querySelectorAll(".floating-card, .hero-image")
    this.init()
  }

  init() {
    window.addEventListener("scroll", () => {
      this.handleScroll()
    })
  }

  handleScroll() {
    const scrolled = window.pageYOffset

    this.elements.forEach((element, index) => {
      if (element.classList.contains("floating-card")) {
        const speed = 0.3 + index * 0.1
        const yPos = scrolled * speed
        const rotation = scrolled * 0.05
        element.style.transform = `translateY(${yPos}px) rotate(${rotation}deg)`
      }
    })
  }
}

// Initialize parallax effects
new ParallaxEffects()

// Typing Effect for Hero Title
class TypingEffect {
  constructor() {
    this.init()
  }

  init() {
    window.addEventListener("load", () => {
      const titleLines = document.querySelectorAll(".hero-title .title-line")
      titleLines.forEach((line, index) => {
        const text = line.textContent
        line.textContent = ""

        setTimeout(() => {
          this.typeText(line, text, 100)
        }, index * 1000)
      })
    })
  }

  typeText(element, text, speed) {
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i)
        i++
      } else {
        clearInterval(timer)
      }
    }, speed)
  }
}

// Initialize typing effect
new TypingEffect()

// Enhanced Cursor Trail
class CursorTrail {
  constructor() {
    this.trail = []
    this.maxTrailLength = 15
    this.init()
  }

  init() {
    document.addEventListener("mousemove", (e) => {
      this.addTrailPoint(e.clientX, e.clientY)
    })

    this.animate()
  }

  addTrailPoint(x, y) {
    this.trail.push({ x, y, life: 1 })

    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift()
    }
  }

  animate() {
    // Remove existing trail elements
    document.querySelectorAll(".cursor-trail").forEach((el) => el.remove())

    // Create new trail elements
    this.trail.forEach((point, index) => {
      const trail = document.createElement("div")
      trail.className = "cursor-trail"

      const size = (index / this.trail.length) * 20
      const opacity = (index / this.trail.length) * 0.5

      trail.style.cssText = `
                position: fixed;
                left: ${point.x}px;
                top: ${point.y}px;
                width: ${size}px;
                height: ${size}px;
                background: radial-gradient(circle, rgba(102, 126, 234, ${opacity}), transparent);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transform: translate(-50%, -50%);
                transition: all 0.1s ease;
            `

      document.body.appendChild(trail)

      // Remove after animation
      setTimeout(() => {
        if (trail.parentNode) {
          trail.remove()
        }
      }, 100)
    })

    requestAnimationFrame(() => this.animate())
  }
}

// Initialize cursor trail
new CursorTrail()

// Performance optimizations
document.addEventListener("DOMContentLoaded", () => {
  // Lazy load images
  const images = document.querySelectorAll("img[data-src]")
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.removeAttribute("data-src")
        imageObserver.unobserve(img)
      }
    })
  })

  images.forEach((img) => imageObserver.observe(img))

  // Add loading class to body
  document.body.classList.add("loaded")
})

// Add custom CSS for form validation
const validationStyles = document.createElement("style")
validationStyles.textContent = `
    .form-group.error input,
    .form-group.error textarea {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    .error-message {
        display: block;
        color: #ef4444;
        font-size: 0.85rem;
        margin-top: 0.5rem;
    }
    
    .hamburger.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }
    
    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
`

document.head.appendChild(validationStyles)
