// --- START OF FILE content.js ---

// Hàm để thêm nút dịch vào một tweet
function addTranslateButtonToTweet(tweetElement) {
    // Kiểm tra xem nút đã tồn tại chưa để tránh thêm nhiều lần
    if (tweetElement.querySelector('.gemini-translate-btn')) {
        return;
    }

    // --- CẬP NHẬT CHO X.COM ---
    // Tìm vị trí để chèn nút. Đây là khu vực chứa các nút actions (reply, retweet, like).
    // Nó thường là một div có role="group".
    const actionContainer = tweetElement.querySelector('div[role="group"]');

    // --- CẬP NHẬT CHO X.COM ---
    // Tìm nội dung text của tweet. X.com dùng data-testid="tweetText".
    const textElement = tweetElement.querySelector('div[data-testid="tweetText"]');

    // Nếu không tìm thấy một trong hai, thoát để tránh lỗi (ví dụ: tweet chỉ có video)
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
            return;
        }

        button.disabled = true;
        button.innerText = 'Đang dịch...';

        // Gửi tin nhắn đến background script để dịch
        chrome.runtime.sendMessage({ action: "translate", text: textToTranslate }, (response) => {
            button.disabled = false;
            button.innerText = 'Dịch';

            // Xóa bản dịch cũ nếu có
            const oldTranslation = tweetElement.querySelector('.gemini-translation-container');
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

            // Chèn bản dịch vào sau phần nội dung chính của tweet
            textElement.parentNode.appendChild(translationContainer);
        });
    });

    // Thêm nút vào khu vực actions
    actionContainer.appendChild(button);
}

// Hàm quét toàn bộ trang để tìm các tweet chưa có nút
function processTweets() {
    // --- CẬP NHẬT CHO X.COM ---
    // Selector mới và ổn định hơn, dựa vào thuộc tính data-testid của mỗi tweet.
    // Mỗi tweet được bao bọc trong một thẻ <article>.
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');
    tweets.forEach(addTranslateButtonToTweet);
}

// Sử dụng MutationObserver để theo dõi các thay đổi trên DOM (khi cuộn trang, tải thêm tweet)
const observer = new MutationObserver((mutations) => {
    // Dùng requestAnimationFrame để tối ưu hóa, tránh chạy processTweets quá nhiều lần.
    window.requestAnimationFrame(processTweets);
});

// Bắt đầu theo dõi
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Chạy lần đầu khi trang tải xong
setTimeout(processTweets, 1500); // Giữ nguyên để đảm bảo trang tải xong