// Lắng nghe tin nhắn từ content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "translate") {
        // Lấy API key từ storage
        chrome.storage.sync.get(['geminiApiKey'], async (result) => {
            const apiKey = result.geminiApiKey;
            if (!apiKey) {
                sendResponse({ error: "Chưa có API Key. Vui lòng thiết lập trong trang options." });
                return;
            }

            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
            const prompt = `Translate the following text to Vietnamese:\n\n"${request.text}"`;

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ "text": prompt }]
                        }]
                    })
                });

                if (!response.ok) {
                    throw new Error(`API Error: ${response.statusText}`);
                }

                const data = await response.json();
                const translatedText = data.candidates[0].content.parts[0].text;
                sendResponse({ translation: translatedText });

            } catch (error) {
                console.error("Lỗi khi dịch:", error);
                sendResponse({ error: "Đã xảy ra lỗi khi dịch. Xem console để biết chi tiết." });
            }
        });

        // Quan trọng: Trả về true để cho biết rằng sendResponse sẽ được gọi một cách bất đồng bộ
        return true;
    }
});