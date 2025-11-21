// Particle System (Novana-style)
class FlowingPointCloud {
    constructor() {
        this.canvas = document.getElementById('particle-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        
        // Full page canvas
        this.resizeCanvas();
        
        // Generate flowing point cloud
        this.pointCloud = this.generateFlowingPoints();
        
        // Animation parameters
        this.time = 0;
        this.waveSpeed = 0.004; // Slower animation speed
        
        // Performance monitoring
        this.frameCount = 0;
        this.lastTime = performance.now();
        
        this.setupCanvas();
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const devicePixelRatio = window.devicePixelRatio || 1;
        const desktop = document.querySelector('.desktop');
        
        if (!desktop) return;
        
        const containerWidth = desktop.offsetWidth;
        const containerHeight = desktop.offsetHeight;
        
        // Set logical size to match desktop container
        this.canvas.style.width = containerWidth + 'px';
        this.canvas.style.height = containerHeight + 'px';
        
        // Set actual canvas size accounting for device pixel ratio
        this.canvas.width = containerWidth * devicePixelRatio;
        this.canvas.height = containerHeight * devicePixelRatio;
        
        // Scale the context to match device pixel ratio
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
        
        // Regenerate points when window size changes significantly
        const newArea = containerWidth * containerHeight;
        const oldArea = this.lastArea || newArea;
        const areaChange = Math.abs(newArea - oldArea) / oldArea;
        
        if (areaChange > 0.2) {
            this.pointCloud = this.generateFlowingPoints();
            this.lastArea = newArea;
        }
    }
    
    setupCanvas() {
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }
    
    // Generate flowing, organic point cloud
    generateFlowingPoints() {
        const points = [];
        
        const desktop = document.querySelector('.desktop');
        if (!desktop) return [];
        
        const screenWidth = desktop.offsetWidth;
        const screenHeight = desktop.offsetHeight;
        
        // Calculate spacing based on screen size to maintain visual density
        const screenDiagonal = Math.sqrt(screenWidth*screenWidth + screenHeight*screenHeight);
        const referenceDiagonal = Math.sqrt(1920*1920 + 1080*1080);
        const scaleFactor = screenDiagonal / referenceDiagonal;
        
        // Detect mobile device for performance optimization
        const isMobile = window.innerWidth <= 768;
        const mobileReduction = isMobile ? 0.5 : 1.0;
        
        // Grid size and spacing - matching Novana's density
        const baseGridSize = 55 * mobileReduction;
        const gridSize = Math.floor(baseGridSize * scaleFactor);
        const baseSpacing = 0.70 / mobileReduction;
        const mainSpacing = baseSpacing * scaleFactor;
        const secondarySpacing = mainSpacing * 1.8;
        
        // Create wave surfaces
        const waveAmplitude = 2.0;
        
        // Main wave surface
        for (let x = -gridSize; x <= gridSize; x += mainSpacing) {
            for (let y = -gridSize; y <= gridSize; y += mainSpacing) {
                const distance = Math.sqrt(x*x + y*y);
                const baseZ = Math.sin(distance * 0.15) * waveAmplitude * Math.exp(-distance * 0.015);
                
                // Multiple wave components for richer pattern
                const wave1 = Math.sin(x * 0.1) * 0.6;
                const wave2 = Math.cos(y * 0.08) * 0.5;
                const wave3 = Math.sin((x + y) * 0.05) * 0.4;
                const wave4 = Math.cos((x - y) * 0.06) * 0.3;
                const wave5 = Math.sin(x * 0.12 + y * 0.07) * 0.35;
                const wave6 = Math.cos(distance * 0.08) * 0.25;
                
                const z = baseZ + wave1 + wave2 + wave3 + wave4 + wave5 + wave6;
                
                points.push({
                    baseX: x * 0.12,
                    baseY: y * 0.12,
                    baseZ: z,
                    gridX: x,
                    gridY: y,
                    amplitude: 0.8
                });
            }
        }
        
        // Add secondary wave surface
        for (let x = -gridSize; x <= gridSize; x += secondarySpacing) {
            for (let y = -gridSize; y <= gridSize; y += secondarySpacing) {
                const distance = Math.sqrt(x*x + y*y);
                const baseZ = Math.cos(distance * 0.12 + Math.PI/4) * waveAmplitude * 0.8 * Math.exp(-distance * 0.012);
                
                const wave1 = Math.cos(x * 0.09) * 0.5;
                const wave2 = Math.sin(y * 0.06) * 0.4;
                const wave3 = Math.sin((x * 2 + y) * 0.04) * 0.3;
                const wave4 = Math.cos((x + y * 2) * 0.05) * 0.25;
                
                const z = baseZ + wave1 + wave2 + wave3 + wave4 + 1.2;
                
                points.push({
                    baseX: x * 0.12,
                    baseY: y * 0.12,
                    baseZ: z,
                    gridX: x,
                    gridY: y,
                    amplitude: 0.6,
                    isSecondary: true
                });
            }
        }
        
        // Add wave disturbances
        const disturbanceCount = Math.floor(6 * Math.min(scaleFactor, 1.0) * mobileReduction);
        const disturbanceSpacing = secondarySpacing * 1.5;
        
        for (let i = 0; i < disturbanceCount; i++) {
            const centerX = (Math.random() - 0.5) * gridSize * 1.5;
            const centerY = (Math.random() - 0.5) * gridSize * 1.5;
            const radius = (20 + Math.random() * 15) * scaleFactor;
            
            for (let x = centerX - radius; x <= centerX + radius; x += disturbanceSpacing) {
                for (let y = centerY - radius; y <= centerY + radius; y += disturbanceSpacing) {
                    const dist = Math.sqrt((x - centerX)**2 + (y - centerY)**2);
                    if (dist <= radius) {
                        const ripple = Math.cos(dist * 0.3) * (1 - dist/radius) * 1.0;
                        
                        points.push({
                            baseX: x * 0.12,
                            baseY: y * 0.12,
                            baseZ: ripple,
                            gridX: x,
                            gridY: y,
                            amplitude: 0.5,
                            disturbance: i
                        });
                    }
                }
            }
        }
        
        return points;
    }
    
    // Project 3D to 2D screen coordinates
    project3DTo2D(x, y, z) {
        const desktop = document.querySelector('.desktop');
        if (!desktop) return [0, 0, z];
        
        const containerWidth = desktop.offsetWidth;
        const containerHeight = desktop.offsetHeight;
        
        const scale = Math.min(containerWidth, containerHeight) * 0.15;
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        
        const distance = 8;
        const projectedScale = scale / (1 + z / distance);
        
        return [
            centerX + x * projectedScale,
            centerY - y * projectedScale,
            z
        ];
    }
    
    // Draw point with wave surface appearance
    drawPoint(x, y, z, intensity = 1, pointType = 'normal') {
        const desktop = document.querySelector('.desktop');
        if (!desktop) return;
        
        const containerWidth = desktop.offsetWidth;
        const containerHeight = desktop.offsetHeight;
        
        // Culling for performance
        if (x < -10 || x >= containerWidth + 10 || y < -10 || y >= containerHeight + 10) return;
        
        let baseSize = 0.7;
        if (pointType === 'secondary') baseSize = 0.5;
        if (pointType === 'disturbance') baseSize = 0.6;
        
        const depthSize = Math.max(0.2, baseSize + (5 - z) * 0.08);
        
        // Enhanced shadow calculation
        const baseIntensity = intensity * 0.85;
        const depthFactor = Math.max(0.15, Math.min(1.0, 0.9 - z / 8));
        const foldShadow = Math.max(0.6, 1.0 - Math.abs(z) * 0.3);
        const finalIntensity = baseIntensity * depthFactor * foldShadow;
        
        // Make particles brighter in top areas (blue background)
        // Top of page (y is smaller) should be brighter
        const normalizedY = y / containerHeight; // 0 = top, 1 = bottom
        const topBrightnessBoost = (1 - normalizedY) * 0.4; // Boost brightness at top
        
        // White particles - brighter overall, especially at top
        const baseBrightness = Math.floor(finalIntensity * 180) + 75; // Range: 75 to 255 (brighter)
        const brightness = Math.min(255, baseBrightness + Math.floor(topBrightnessBoost * 180));
        this.ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
        
        // Higher opacity for better visibility, especially at top
        const baseAlpha = 0.7;
        const topAlphaBoost = (1 - normalizedY) * 0.2; // More opaque at top
        this.ctx.globalAlpha = Math.min(1.0, baseAlpha + topAlphaBoost);
        
        // Draw point
        this.ctx.beginPath();
        this.ctx.arc(x, y, depthSize, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    update() {
        const desktop = document.querySelector('.desktop');
        if (!desktop) return;
        
        const containerWidth = desktop.offsetWidth;
        const containerHeight = desktop.offsetHeight;
        
        // Clear canvas - transparent so gradient shows through
        this.ctx.clearRect(0, 0, containerWidth, containerHeight);
        
        // Apply wave motion to all points
        const wavePoints = this.pointCloud.map(point => {
            const wavePhase = this.time * 3;
            
            // Multiple wave components for richer motion
            const wave1 = Math.sin(point.gridX * 0.3 + wavePhase) * 0.3;
            const wave2 = Math.cos(point.gridY * 0.25 + wavePhase * 0.8) * 0.25;
            const wave3 = Math.sin((point.gridX + point.gridY) * 0.2 + wavePhase * 1.2) * 0.2;
            const wave4 = Math.cos((point.gridX - point.gridY) * 0.15 + wavePhase * 0.6) * 0.15;
            const wave5 = Math.sin(point.gridX * 0.35 + point.gridY * 0.18 + wavePhase * 1.5) * 0.18;
            const wave6 = Math.cos(point.gridY * 0.28 - point.gridX * 0.12 + wavePhase * 0.9) * 0.12;
            const wave7 = Math.sin((point.gridX * 2 + point.gridY) * 0.08 + wavePhase * 2.0) * 0.1;
            
            const flowX = point.baseX;
            const flowY = point.baseY;
            const flowZ = point.baseZ + wave1 + wave2 + wave3 + wave4 + wave5 + wave6 + wave7;
            
            let pointType = 'normal';
            if (point.isSecondary) pointType = 'secondary';
            if (point.disturbance !== undefined) pointType = 'disturbance';
            
            return {
                x: flowX,
                y: flowY,
                z: flowZ,
                pointType: pointType
            };
        });
        
        // Project to 2D with culling
        const projectedPoints = wavePoints.map(point => {
            const [x, y, z] = this.project3DTo2D(point.x, point.y, point.z);
            return {
                x, y, z,
                pointType: point.pointType
            };
        }).filter(point => {
            return point.x > -30 && point.x < containerWidth + 30 && 
                   point.y > -30 && point.y < containerHeight + 30;
        }).sort((a, b) => a.z - b.z);
        
        // Draw all points
        for (const point of projectedPoints) {
            const pulse = 0.7 + Math.sin(this.time * 2 + point.x * 0.005 + point.y * 0.005) * 0.3;
            this.drawPoint(point.x, point.y, point.z, pulse, point.pointType);
        }
        
        // Reset alpha
        this.ctx.globalAlpha = 1;
        
        // Update time
        this.time += this.waveSpeed;
    }
    
    animate() {
        this.update();
        requestAnimationFrame(() => this.animate());
    }
}

// Smooth scroll behavior for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Initialize particle system - wait a bit for layout to settle
    setTimeout(() => {
        const particleSystem = new FlowingPointCloud();
        
        // Debug: Check if canvas was found
        if (!document.getElementById('particle-canvas')) {
            console.error('Particle canvas not found!');
        } else {
            console.log('Particle canvas found, initializing...');
        }
    }, 100);
    const navItems = document.querySelectorAll('.nav-item');
    
    // Add click handlers for navigation items
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const text = this.textContent.trim();
            
            // Add smooth scroll effect
            this.style.transition = 'transform 0.2s ease';
            this.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
            
            // Handle navigation based on text
            if (text.includes('Bios')) {
                // Scroll to bios section or open external link
                const biosSection = document.querySelector('.bottom-content');
                if (biosSection) {
                    biosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else if (text.includes('Portfolio')) {
                // Scroll to portfolio section
                const portfolioSection = document.querySelector('.content-boxes');
                if (portfolioSection) {
                    portfolioSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else if (text.includes('Team')) {
                // Scroll to team section
                const teamSection = document.querySelector('.subheading');
                if (teamSection) {
                    teamSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else if (text.includes('Our Approach')) {
                // Scroll to approach section
                const approachSection = document.querySelector('.hero-content');
                if (approachSection) {
                    approachSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
    
    // Add hover effects to content boxes
    const contentBoxes = document.querySelectorAll('.content-box');
    contentBoxes.forEach(box => {
        box.addEventListener('mouseenter', function() {
            this.style.transition = 'background-color 0.3s ease, transform 0.3s ease';
            this.style.backgroundColor = 'rgba(0, 56, 240, 0.5)';
            this.style.transform = 'translateY(-5px)';
            this.style.cursor = 'pointer';
        });
        
        box.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'rgba(0, 56, 240, 0.35)';
            this.style.transform = 'translateY(0)';
        });
        
        box.addEventListener('click', function() {
            // Add click animation
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'translateY(-5px)';
            }, 150);
        });
    });
    
    // Add scroll reveal animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll('.content-box, .bottom-content, .subheading');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Smooth scroll for the entire page
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Removed parallax effect for smoother scrolling
});

// Handle window resize
window.addEventListener('resize', function() {
    // Adjust line width on resize
    const lineContainer = document.querySelector('.line-container');
    const line = document.querySelector('.line');
    
    if (lineContainer && line) {
        const containerWidth = lineContainer.offsetWidth;
        if (containerWidth < 1185) {
            line.style.width = `${containerWidth}px`;
        } else {
            line.style.width = '1185.002px';
        }
    }
});




