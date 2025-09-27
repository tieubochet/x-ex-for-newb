// --- START OF FILE content.js (UPGRADED WITH POPUP) ---

// Biến toàn cục để quản lý popup
let geminiPopup = null;

// --- CÁC HÀM ĐỂ TẠO VÀ QUẢN LÝ POPUP ---

// Hàm đóng popup
function closeTranslationPopup() {
    if (geminiPopup) {
        geminiPopup.remove();
        geminiPopup = null;
    }
}

// Hàm hiển thị popup với nội dung dịch
function showTranslationPopup(content, isError = false) {
    // Đảm bảo popup cũ đã được đóng
    closeTranslationPopup();

    // --- Tạo cấu trúc HTML cho popup ---

    // 1. Lớp phủ nền (overlay)
    const overlay = document.createElement('div');
    overlay.className = 'gemini-translate-overlay';
    overlay.addEventListener('click', closeTranslationPopup);

    // 2. Khung chính của popup (modal)
    const modal = document.createElement('div');
    modal.className = 'gemini-translate-modal';
    // Ngăn việc click vào modal làm đóng popup
    modal.addEventListener('click', (e) => e.stopPropagation());

    // 3. Phần Header (Tiêu đề và nút đóng)
    const header = document.createElement('div');
    header.className = 'gemini-modal-header';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'gemini-modal-title';
    titleDiv.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"></path><path d="M11.25 5h1.5v6h-1.5zM12 12.75c.41 0 .75-.34.75-.75s-.34-.75-.75-.75s-.75.34-.75.75s.34.75.75.75z"></path></svg>
        <span>Bản dịch</span>
    `;

    const closeButton = document.createElement('button');
    closeButton.className = 'gemini-modal-close';
    closeButton.innerHTML = '&times;'; // Dấu 'X'
    closeButton.addEventListener('click', closeTranslationPopup);

    header.appendChild(titleDiv);
    header.appendChild(closeButton);

    // 4. Phần nội dung chính
    const contentDiv = document.createElement('div');
    contentDiv.className = 'gemini-modal-content';
    contentDiv.innerText = content;
    if (isError) {
        contentDiv.style.color = '#ff6b6b'; // Màu đỏ cho lỗi
    }

    // 5. Phần Gợi ý (Mô phỏng theo hình ảnh)
    const suggestionDiv = document.createElement('div');
    suggestionDiv.className = 'gemini-modal-suggestion';
    suggestionDiv.innerHTML = `
        <div class="gemini-suggestion-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10c.14 0 .28 0 .42-.02.16-.02.32-.05.48-.09.2-.05.4-.12.59-.2.27-.11.53-.25.79-.41.32-.2.62-.43.9-.68.28-.26.55-.53.8-.82.25-.28.48-.58.7-.89.22-.3.42-.62.6-.95.18-.33.34-.67.48-1.02.13-.35.24-.7.34-1.06.09-.37.16-.74.21-1.12.05-.38.08-.76.08-1.15 0-1.8-.6-3.47-1.61-4.83.18.33.29.69.29 1.08 0 1.38-1.12 2.5-2.5 2.5s-2.5-1.12-2.5-2.5c0-1.28.96-2.33 2.2-2.48C13.2 5.09 14 4.13 14 3c0-.55-.45-1-1-1-.34 0-.65.17-.83.43-.53-.28-1.12-.43-1.74-.43C8.69 3 7 4.69 7 6.5c0 .31.05.62.13.92.17.6.45 1.16.82 1.66.36.48.8 1.03 1.05 1.42.25.39.4 1.11.4 1.5 0 .83-.67 1.5-1.5 1.5S6.5 12.83 6.5 12c0-.39.15-1.11.4-1.5.25-.39.69-.94 1.05-1.42C8.32 8.58 8.59 8.02 8.76 7.42c.03-.1.05-.2.08-.3C8.91 6.84 9 6.56 9 6.25c0-.41.34-.75.75-.75s.75.34.75.75c0 .19-.07.37-.18.52-.25.33-.54.63-.87.9-.32.27-.68.51-1.08.7-.05.02-.1.05-.16.07-.3.12-.6.25-.89.39-.14.07-.28.14-.42.22-.3.17-.58.36-.85.56-.27.2-.53.41-.77.63-.24.22-.47.45-.68.69-.21.24-.4.49-.58.75-.18.26-.34.52-.48.8-.14.28-.27.56-.37.85-.1.29-.19.58-.26.88-.07.3-.12.6-.16.91-.04.3-.06.6-.06.91 0 4.41 3.59 8 8 8s8-3.59 8-8c0-.62-.08-1.23-.22-1.8.08.14.15.28.22.42V12c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4c1.1 0 2.1.45 2.83 1.17C14.2 9.07 15 8.1 15 7c0-.55-.45-1-1-1-.34 0-.65.17-.83.43-.53-.28-1.12-.43-1.74-.43-1.51 0-2.82.86-3.47 2.17C7.6 8.6 7 10.2 7 12c0 2.76 2.24 5 5 5s5-2.24 5-5z"></path></svg>
            Gợi ý (chỉ hiển thị)
        </div>
        <div class="gemini-suggestion-box">Đây là khu vực hiển thị gợi ý (nếu có).</div>
    `;

    // Ghép các phần lại với nhau
    modal.appendChild(header);
    modal.appendChild(contentDiv);
    modal.appendChild(suggestionDiv);

    // Gán vào biến toàn cục và hiển thị
    geminiPopup = document.createElement('div');
    geminiPopup.appendChild(overlay);
    geminiPopup.appendChild(modal);
    document.body.appendChild(geminiPopup);
}


// --- CÁC HÀM TÌM KIẾM VÀ THÊM NÚT ---

function addTranslateButtonToTweet(tweetElement) {
    if (tweetElement.querySelector('.gemini-translate-btn-wrapper')) {
        return;
    }
    const actionContainer = tweetElement.querySelector('div[role="group"]');
    const textElement = tweetElement.querySelector('div[data-testid="tweetText"]');
    if (!actionContainer || !textElement) {
        return;
    }

    // Tạo một div bọc để định vị icon và tooltip
    const wrapper = document.createElement('div');
    wrapper.className = 'gemini-translate-btn-wrapper';

    // Tạo icon button
    const button = document.createElement('button');
    button.className = 'gemini-translate-btn';
    button.title = 'Dịch bằng Gemini'; // Tooltip
    // Icon dịch thuật SVG
    const translateIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"></path></svg>`;
    // Icon loading (spinner) SVG
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

            if (response && response.translation) {
                showTranslationPopup(response.translation);
            } else {
                const errorMessage = (response && response.error) || 'Không nhận được phản hồi.';
                showTranslationPopup(`Lỗi: ${errorMessage}`, true);
            }
        });
    });
    
    wrapper.appendChild(button);
    actionContainer.appendChild(wrapper);
}

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