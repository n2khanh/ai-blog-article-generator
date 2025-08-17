// Form handling functions
console.log('Forms JS loaded successfully');

// Form submission handling
function handleFormSubmission(formId, submitBtnId) {
    const form = document.getElementById(formId);
    const submitBtn = document.getElementById(submitBtnId);
    
    if (form && submitBtn) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // chặn submit mặc định
            // Change button state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
            submitBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            submitBtn.disabled = true;
            
            // Re-enable button after form submission (case of errors)
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Đăng nhập';
                submitBtn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                submitBtn.disabled = false;
            }, 3000);
        });
    }
}
