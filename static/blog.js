// Blog generation functionality
async function generateBlog() {
    // Lấy elements
    const youtubeUrlElement = document.getElementById('youtubeUrl');
    const loadingDiv = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    const blogResultSection = document.getElementById('blog-result'); // Thêm element này

    // Kiểm tra elements tồn tại
    if (!youtubeUrlElement || !loadingDiv || !resultDiv || !blogResultSection) {
        alert('⚠️ Lỗi: Thiếu một số thành phần UI cần thiết.');
        return;
    }

    // Lấy giá trị URL
    const youtubeUrl = youtubeUrlElement.value.trim();

    if (!youtubeUrl) {
        alert('⚠️ Vui lòng nhập link YouTube!');
        youtubeUrlElement.focus();
        return;
    }

    // --- Bắt đầu hiệu ứng Loading ---
    // Ẩn kết quả trước đó và hiển thị loading
    resultDiv.style.display = 'none';
    blogResultSection.style.display = 'none';
    loadingDiv.style.display = 'block';
    loadingDiv.innerHTML = `
        <div class="loading">
            <div class="loading-spinner-3dots">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
            <div class="loading-gradient">Đang xử lý video...</div>
            <div class="loading-subtitle">AI đang phân tích và tạo nội dung blog...</div>
        </div>
    `;

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ youtube_url: youtubeUrl })
        });
        
        // Kiểm tra lỗi HTTP trước khi đọc JSON
        if (!response.ok) {
            // Đọc body của response để lấy thông tin lỗi
            const errorData = await response.json().catch(() => ({ error: 'Phản hồi không phải JSON hoặc server trả về lỗi không xác định.' }));
            loadingDiv.style.display = 'none';
            resultDiv.innerHTML = `
                <div class="error">
                    <h3>❌ Lỗi server</h3>
                    <p>${errorData.error || `Lỗi không xác định: ${response.status}`}</p>
                </div>
            `;
            resultDiv.style.display = 'block';
            return;
        }

        const data = await response.json();

        // --- Kết thúc hiệu ứng Loading ---
        loadingDiv.style.display = 'none';

        if (data.success) {
            // Hiển thị blog đã tạo
            const blogHTML = `
                <div class="card blog-card">
                    <div class="card-header">
                        <div class="icon-container">
                            <i class="fas fa-pencil-alt"></i>
                        </div>
                        <h3>${data.title}</h3>
                    </div>
                    <div class="card-body">
                        ${data.content}
                    </div>
                </div>
            `;
            resultDiv.innerHTML = blogHTML;
            resultDiv.style.display = 'block';
            resultDiv.classList.add('fade-in'); // Sử dụng fade-in cho resultDiv
            blogResultSection.innerHTML = resultDiv.innerHTML;
            blogResultSection.style.display = 'block';
            blogResultSection.classList.add('fade-in');

            // Xóa input để chuẩn bị tạo blog mới
            youtubeUrlElement.value = '';

        } else {
            // Xử lý lỗi từ API
            resultDiv.innerHTML = `
                <div class="error">
                    <h3>❌ Lỗi khi tạo blog</h3>
                    <p>${data.error || 'Có lỗi xảy ra, vui lòng thử lại'}</p>
                </div>
            `;
            resultDiv.style.display = 'block';
            blogResultSection.style.display = 'none'; // Đảm bảo blog cũ bị ẩn
        }

    } catch (error) {
        // --- Kết thúc hiệu ứng Loading khi có lỗi ---
        loadingDiv.style.display = 'none';

        // Hiển thị lỗi
        resultDiv.innerHTML = `
            <div class="error">
                <h3>❌ Lỗi kết nối</h3>
                <p>Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.</p>
                <p><small>Chi tiết lỗi: ${error.message}</small></p>
            </div>
        `;
        resultDiv.style.display = 'block';
        blogResultSection.style.display = 'none'; // Đảm bảo blog cũ bị ẩn
    }
}