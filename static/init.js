// Main initialization file
console.log('Init JS loaded successfully');

// Initialize all effects when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    // Initialize effects
    addButtonEffects();
    initSmoothScrolling();
    
    // Initialize form submission handling for login/register forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        console.log('Login form found');
        handleFormSubmission('loginForm', 'loginSubmitBtn');
    }
    
    if (registerForm) {
        console.log('Register form found');
        handleFormSubmission('registerForm', 'registerSubmitBtn');
    }
    
    const generateBtn = document.getElementById('generate-blog-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateBlog);
    }
    
    console.log('Initialization complete');
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
