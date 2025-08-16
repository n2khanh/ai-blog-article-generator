// Effects and animations
console.log('Effects JS loaded successfully');

// Particle system
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    function createParticles() {
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.width = Math.random() * 4 + 2 + 'px';
                particle.style.height = particle.style.width;
                particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
                particle.style.animationDelay = Math.random() * 2 + 's';
                
                particlesContainer.appendChild(particle);
                
                // Remove particle after animation completes
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 8000);
            }, i * 200);
        }
    }

    // Create particles every 8 seconds
    createParticles();
    setInterval(createParticles, 8000);
}

// Floating shapes animation
function initFloatingShapes() {
    const shapes = document.querySelectorAll('.floating-shape');
    shapes.forEach((shape, index) => {
        shape.style.animationDelay = (index * 0.5) + 's';
    });
}

// Form interaction effects
function initFormEffects() {
    const formGroups = document.querySelectorAll('.form-group');
    
    formGroups.forEach(group => {
        const input = group.querySelector('input, textarea');
        if (!input) return;
        
        // Focus effects
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
        
        // Input validation effects
        input.addEventListener('input', function() {
            if (this.value.length > 0) {
                this.style.borderColor = '#4CAF50';
            } else {
                this.style.borderColor = '#e1e5e9';
            }
        });
    });
}

// Typing effect for placeholders
function initTypingEffects() {
    const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
    
    inputs.forEach(input => {
        const originalPlaceholder = input.placeholder;
        let currentIndex = 0;
        let typingInterval;
        
        function typePlaceholder() {
            if (currentIndex <= originalPlaceholder.length) {
                input.placeholder = originalPlaceholder.substring(0, currentIndex);
                currentIndex++;
                typingInterval = setTimeout(typePlaceholder, 100);
            }
        }
        
        function resetPlaceholder() {
            clearTimeout(typingInterval);
            input.placeholder = originalPlaceholder;
            currentIndex = 0;
        }
        
        input.addEventListener('focus', typePlaceholder);
        input.addEventListener('blur', resetPlaceholder);
    });
}

// Button click effects
function addButtonEffects() {
    const buttons = document.querySelectorAll('.submit-btn, .action-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}
