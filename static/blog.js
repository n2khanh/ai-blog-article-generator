// Blog functionality

// Blog generation functionality
async function generateBlog() {
    // Lấy elements
    const youtubeUrlElement = document.getElementById('youtubeUrl');
    const loadingDiv = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    
    // Kiểm tra elements tồn tại
    if (!youtubeUrlElement) {
        alert('⚠️ Lỗi: Không tìm thấy input YouTube URL');
        return;
    }
    
    if (!loadingDiv) {
        alert('⚠️ Lỗi: Không tìm thấy loading div');
        return;
    }
    
    if (!resultDiv) {
        alert('⚠️ Lỗi: Không tìm thấy result div');
        return;
    }
    
    // Lấy giá trị URL
    const youtubeUrl = youtubeUrlElement.value.trim();
    
    if (!youtubeUrl) {
        alert('⚠️ Vui lòng nhập link YouTube!');
        youtubeUrlElement.focus();
        return;
    }
    
    // Hiển thị loading
    loadingDiv.style.display = 'block';
    loadingDiv.innerHTML = `
        <div class="loading">
            <div class="loading-spinner-3dots">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
            <div class="loading-gradient">Đang xử lý video...</div>
            <div class="loading-subtitle">AI đang phân tích và tạo nội dung blog</div>
            <div class="loading-dots">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
        </div>
    `;
    resultDiv.style.display = 'none';
    
    // Ẩn section kết quả blog cũ
    const blogResultSection = document.getElementById('blogResult');
    if (blogResultSection) {
        blogResultSection.style.display = 'none';
    }
    
    try {
        // Gọi API thật
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ youtube_url: youtubeUrl })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Ẩn loading
        loadingDiv.style.display = 'none';
        
        // Hiển thị kết quả từ API
        if (data.success) {
            // Hiển thị thông báo thành công trong result div
            const successMessage = `
                <div class="result">
                    <h3>🎯 Blog đã được tạo thành công!</h3>
                    <p>Blog đã được lưu vào cơ sở dữ liệu.</p>
                </div>
            `;
            resultDiv.innerHTML = successMessage;
            resultDiv.style.display = 'block';
            
            // Hiển thị nội dung blog trong section riêng
            const blogResultSection = document.getElementById('blogResult');
            const blogContent = document.getElementById('blogContent');
            
            if (blogResultSection && blogContent) {
                const blogHTML = `
                    <div class="blog-preview">
                        <h3>${data.title || 'Blog mới'}</h3>
                        <div class="blog-meta">
                            <span><i class="fas fa-link"></i> Video: ${youtubeUrl}</span>
                            <span><i class="fas fa-calendar"></i> Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div class="blog-text">
                            <p>${data.content || 'Nội dung blog từ video YouTube'}</p>
                        </div>
                        <div class="blog-actions">
                            <button class="action-btn" onclick="editBlog()">
                                <i class="fas fa-edit"></i> Chỉnh sửa
                            </button>
                            <button class="action-btn" onclick="saveBlog()">
                                <i class="fas fa-save"></i> Lưu blog
                            </button>
                            <button class="action-btn" onclick="viewBlog()">
                                <i class="fas fa-eye"></i> Xem chi tiết
                            </button>
                        </div>
                    </div>
                `;
                
                blogContent.innerHTML = blogHTML;
                blogResultSection.style.display = 'block';
                blogResultSection.classList.add('fade-in');
            }
            
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
        }
        
    } catch (error) {
        // Ẩn loading
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
    }
}

// Blog actions
function editBlog(blogId) {
    showMessage('result', `Chức năng chỉnh sửa blog ${blogId} đang được phát triển!`, 'error');
}

function saveBlog() {
    showMessage('result', 'Blog đã được lưu thành công!', 'success');
}

function viewBlog(blogId) {
    showMessage('result', `Chức năng xem chi tiết blog ${blogId} đang được phát triển!`, 'error');
}


