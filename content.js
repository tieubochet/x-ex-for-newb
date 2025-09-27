// Hàm để thêm nút dịch vào một bài viết (cast)
function addTranslateButton(castElement) {
    // Kiểm tra xem nút đã tồn tại chưa để tránh thêm nhiều lần
    if (castElement.querySelector('.gemini-translate-btn')) {
        return;
    }

    // --- CẬP NHẬT ---
    // Tìm vị trí để chèn nút. Dựa trên HTML, đây là khu vực chứa các nút actions.
    // Class 'grid-cols-[repeat(auto-fit,_112px)]' có vẻ khá đặc trưng.
    const actionContainer = castElement.querySelector('div[class*="grid-cols-[repeat(auto-fit"]');

    // --- CẬP NHẬT ---
    // Tìm nội dung text của cast. Class 'line-clamp-feed' chứa nội dung chính.
    const textElement = castElement.querySelector('div[class*="line-clamp-feed"]');

    // Nếu không tìm thấy một trong hai, thoát để tránh lỗi
    if (!actionContainer || !textElement) {
        return;
    }

    const button = document.createElement('button');
    button.innerText = 'Dịch';
    button.className = 'gemini-translate-btn';

    button.addEventListener('click', (event) => {
        event.stopPropagation(); // Ngăn các sự kiện click khác
        
        const textToTranslate = textElement.innerText;
        if (!textToTranslate.trim()) {
            console.log("Không có nội dung để dịch.");
            return; // Bỏ qua nếu cast không có text (chỉ có hình ảnh)
        }

        button.disabled = true;
        button.innerText = 'Đang dịch...';

        // Gửi tin nhắn đến background script để dịch
        chrome.runtime.sendMessage({ action: "translate", text: textToTranslate }, (response) => {
            button.disabled = false;
            button.innerText = 'Dịch';

            // Xóa bản dịch cũ nếu có
            const oldTranslation = castElement.querySelector('.gemini-translation-container');
            if (oldTranslation) {
                oldTranslation.remove();
            }

            // Tạo container mới để hiển thị bản dịch
            const translationContainer = document.createElement('div');
            translationContainer.className = 'gemini-translation-container';

            if (response && response.translation) {
                translationContainer.innerText = response.translation;
            } else {
                translationContainer.innerText = `Lỗi: ${ (response && response.error) || 'Không nhận được phản hồi.' }`;
                translationContainer.style.color = 'red';
            }

            // Chèn bản dịch vào sau phần nội dung chính của cast
            // parentNode của textElement là div chứa nó.
            textElement.parentNode.appendChild(translationContainer);
        });
    });

    // Thêm nút vào khu vực actions
    actionContainer.appendChild(button);
}

// Hàm quét toàn bộ trang để tìm các cast chưa có nút
function processCasts() {
    // --- CẬP NHẬT ---
    // Selector mới và ổn định hơn, dựa vào ID của mỗi cast
    const casts = document.querySelectorAll('div[id^="cast:"]');
    casts.forEach(addTranslateButton);
}

// Sử dụng MutationObserver để theo dõi các thay đổi trên DOM (khi cuộn trang, tải thêm cast)
const observer = new MutationObserver((mutations) => {
    // Dùng requestAnimationFrame để tối ưu hóa, tránh chạy processCasts quá nhiều lần
    // khi có nhiều thay đổi DOM liên tục.
    window.requestAnimationFrame(processCasts);
});

// Bắt đầu theo dõi
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Chạy lần đầu khi trang tải xong
setTimeout(processCasts, 1500); // Tăng thời gian chờ lên một chút để đảm bảo trang tải xong