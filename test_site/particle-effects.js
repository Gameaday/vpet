/**
 * Particle Effects Manager
 * Creates visual particle effects for various pet interactions
 */
/* global requestAnimationFrame */

class ParticleEffects {
    constructor(config = {}) {
        this.config = config;
        this.enabled = true;
        this.container = null;
        this.FRAME_DELTA = 0.016; // Time delta for 60 FPS (1/60 second)
        this.init();
    }

    init() {
        // Create particle container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'particle-container';
            this.container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9999;
            `;
            document.body.appendChild(this.container);
        }
    }

    /**
     * Create particles at a specific position
     * @param {Object} options - Particle configuration
     */
    createParticles(options = {}) {
        if (!this.enabled) return;

        const {
            x = window.innerWidth / 2,
            y = window.innerHeight / 2,
            count = 5,
            emoji = '✨',
            color = '#FFD700',
            size = 20,
            spread = 100,
            duration = 1000,
            gravity = 0.5,
            bounce = false
        } = options;

        for (let i = 0; i < count; i++) {
            this.createParticle({
                x, y, emoji, color, size, spread, duration, gravity, bounce
            });
        }
    }

    /**
     * Create a single particle
     */
    createParticle(options) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Randomize direction and velocity
        const angle = Math.random() * Math.PI * 2;
        const velocity = options.spread * (0.5 + Math.random() * 0.5);
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity - 50; // Initial upward velocity
        
        // Set particle content and style
        if (options.emoji) {
            particle.textContent = options.emoji;
            particle.style.fontSize = `${options.size}px`;
        } else {
            particle.style.width = `${options.size}px`;
            particle.style.height = `${options.size}px`;
            particle.style.backgroundColor = options.color;
            particle.style.borderRadius = '50%';
        }
        
        particle.style.cssText += `
            position: absolute;
            left: ${options.x}px;
            top: ${options.y}px;
            pointer-events: none;
            opacity: 1;
            transform: translate(-50%, -50%);
        `;
        
        this.container.appendChild(particle);
        
        // Animate particle
        this.animateParticle(particle, vx, vy, options);
    }

    /**
     * Animate a particle with physics
     */
    animateParticle(particle, vx, vy, options) {
        const startTime = Date.now();
        let currentVy = vy;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / options.duration;
            
            if (progress >= 1) {
                particle.remove();
                return;
            }
            
            // Apply gravity
            currentVy += options.gravity;
            
            // Update position using frame delta for consistent 60 FPS animation
            const currentX = parseFloat(particle.style.left) + vx * this.FRAME_DELTA;
            const currentY = parseFloat(particle.style.top) + currentVy * this.FRAME_DELTA;
            
            particle.style.left = `${currentX}px`;
            particle.style.top = `${currentY}px`;
            
            // Fade out
            particle.style.opacity = 1 - progress;
            
            // Scale effect
            const scale = 1 - progress * 0.5;
            particle.style.transform = `translate(-50%, -50%) scale(${scale})`;
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * Show hearts effect (for feeding/happiness)
     */
    showHearts(x, y) {
        this.createParticles({
            x, y,
            count: 3,
            emoji: '❤️',
            size: 20,
            spread: 50,
            duration: 1500,
            gravity: -0.2
        });
    }

    /**
     * Show sparkles effect (for evolution/achievements)
     */
    showSparkles(x, y) {
        this.createParticles({
            x, y,
            count: 8,
            emoji: '✨',
            size: 16,
            spread: 120,
            duration: 2000,
            gravity: 0.3
        });
    }

    /**
     * Show food particles (for feeding)
     */
    showFood(x, y) {
        this.createParticles({
            x, y,
            count: 5,
            emoji: '🍖',
            size: 18,
            spread: 80,
            duration: 1200,
            gravity: 0.5
        });
    }

    /**
     * Show play effect (for playing)
     */
    showPlay(x, y) {
        this.createParticles({
            x, y,
            count: 6,
            emoji: '🎮',
            size: 18,
            spread: 100,
            duration: 1500,
            gravity: 0.4
        });
    }

    /**
     * Show training effect (for training)
     */
    showTraining(x, y) {
        this.createParticles({
            x, y,
            count: 5,
            emoji: '💪',
            size: 20,
            spread: 90,
            duration: 1500,
            gravity: 0.3
        });
    }

    /**
     * Show sleep effect (for sleeping)
     */
    showSleep(x, y) {
        this.createParticles({
            x, y,
            count: 4,
            emoji: '💤',
            size: 18,
            spread: 60,
            duration: 2000,
            gravity: -0.1
        });
    }

    /**
     * Show star burst effect (for level up)
     */
    showStarBurst(x, y) {
        this.createParticles({
            x, y,
            count: 12,
            emoji: '⭐',
            size: 16,
            spread: 150,
            duration: 2000,
            gravity: 0.5
        });
    }

    /**
     * Show evolution effect
     */
    showEvolution(x, y) {
        // Multiple waves of sparkles for dramatic effect
        this.showSparkles(x, y);
        setTimeout(() => this.showSparkles(x, y), 200);
        setTimeout(() => this.showSparkles(x, y), 400);
        setTimeout(() => this.showStarBurst(x, y), 600);
    }

    /**
     * Enable/disable particle effects
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Clean up
     */
    destroy() {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticleEffects;
}
