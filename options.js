const saveButton = document.getElementById('save');
const apiKeyInput = document.getElementById('apiKey');
const statusDiv = document.getElementById('status');

// Tải key đã lưu (nếu có) khi mở trang options
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['geminiApiKey'], (result) => {
        if (result.geminiApiKey) {
            apiKeyInput.value = result.geminiApiKey;
        }
    });
});

// Lưu key khi nhấn nút
saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
            statusDiv.textContent = 'Đã lưu API Key!';
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 2000);
        });
    } else {
        statusDiv.textContent = 'Vui lòng nhập API Key.';
        statusDiv.style.color = 'red';
    }
});