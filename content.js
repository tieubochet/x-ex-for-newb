// --- START OF FILE content.js (REVERTED TO INLINE DISPLAY) ---

// Hàm thêm icon dịch vào tweet
function addTranslateButtonToTweet(tweetElement) {
    // Kiểm tra để không thêm nút nhiều lần
    if (tweetElement.querySelector('.gemini-translate-btn-wrapper')) {
        return;
    }
    const actionContainer = tweetElement.querySelector('div[role="group"]');
    const textElement = tweetElement.querySelector('div[data-testid="tweetText"]');
    if (!actionContainer || !textElement) {
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'gemini-translate-btn-wrapper';

    const button = document.createElement('button');
    button.className = 'gemini-translate-btn';
    button.title = 'Dịch bằng Gemini';

    const translateIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"></path></svg>`;
    const loadingIcon = `<svg class="gemini-spinner" width="20" height="20" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg>`;
    
    button.innerHTML = translateIcon;

    button.addEventListener('click', (event) => {
        event.stopPropagation();
        const textToTranslate = textElement.innerText;
        if (!textToTranslate.trim()) {
            return;
        }

        button.disabled = true;
        button.innerHTML = loadingIcon;

        chrome.runtime.sendMessage({ action: "translate", text: textToTranslate }, (response) => {
            button.disabled = false;
            button.innerHTML = translateIcon;

            // --- LOGIC HIỂN THỊ INLINE ---

            // 1. Xóa bản dịch cũ nếu có
            const oldTranslation = tweetElement.querySelector('.gemini-translation-container');
            if (oldTranslation) {
                oldTranslation.remove();
            }

            // 2. Tạo container mới cho bản dịch
            const translationContainer = document.createElement('div');
            translationContainer.className = 'gemini-translation-container';

            // 3. Đổ nội dung vào container
            if (response && response.translation) {
                // Tạo một tiêu đề nhỏ "Bản dịch"
                const title = document.createElement('div');
                title.className = 'gemini-translation-title';
                title.innerText = 'Bản dịch';

                const content = document.createElement('div');
                content.innerText = response.translation;

                translationContainer.appendChild(title);
                translationContainer.appendChild(content);

            } else {
                const errorMessage = (response && response.error) || 'Không nhận được phản hồi.';
                translationContainer.innerText = `Lỗi: ${errorMessage}`;
                translationContainer.style.color = '#ff6b6b';
            }

            // 4. Chèn container dịch vào ngay sau khối text gốc
            // Dùng insertBefore để đảm bảo vị trí đúng
            textElement.parentNode.insertBefore(translationContainer, textElement.nextSibling);
        });
    });
    
    wrapper.appendChild(button);
    actionContainer.appendChild(wrapper);
}

// Các hàm bên dưới không đổi
function processTweets() {
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');
    tweets.forEach(addTranslateButtonToTweet);
}

const observer = new MutationObserver(() => {
    window.requestAnimationFrame(processTweets);
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

setTimeout(processTweets, 1500);