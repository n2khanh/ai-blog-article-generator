function handleFormSubmission(formId, submitBtnId) {
    const form = document.getElementById(formId);
    const submitBtn = document.getElementById(submitBtnId);
    if (form && submitBtn) {
        form.addEventListener('submit', function(event) {
            // Ngăn chặn việc gửi form mặc định để xử lý bằng JavaScript
            // event.preventDefault(); 

            // Vô hiệu hóa nút submit để ngăn người dùng nhấp đúp
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

            // Gửi form đi
            // event.target.submit();
        });
    }
}