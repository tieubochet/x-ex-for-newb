// --- START OF FILE background.js (UPDATED FOR BETTER ERROR HANDLING) ---

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "translate") {
        chrome.storage.sync.get(['geminiApiKey'], async (result) => {
            const apiKey = result.geminiApiKey;
            if (!apiKey) {
                sendResponse({ error: "Chưa có API Key. Vui lòng thiết lập trong trang options." });
                return;
            }

            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
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

                // --- START OF IMPORTANT UPDATE ---
                if (!response.ok) {
                    // Cố gắng đọc nội dung lỗi chi tiết từ API
                    let errorDetails = `API Error ${response.status}: ${response.statusText}`;
                    try {
                        const errorData = await response.json();
                        // Lấy message lỗi từ cấu trúc JSON của Google API
                        if (errorData && errorData.error && errorData.error.message) {
                            errorDetails = errorData.error.message;
                        }
                    } catch (e) {
                        // Bỏ qua nếu không thể parse JSON
                    }
                    throw new Error(errorDetails);
                }
                // --- END OF IMPORTANT UPDATE ---

                const data = await response.json();

                // Kiểm tra xem có candidates hay không và có lỗi gì không
                if (!data.candidates || data.candidates.length === 0) {
                     const finishReason = data.promptFeedback?.blockReason || 'Không có nội dung trả về';
                     let reasonMessage = `Dịch thất bại. Lý do: ${finishReason}.`;
                     if (finishReason === 'SAFETY') {
                         reasonMessage += ' Nội dung có thể đã vi phạm chính sách an toàn.';
                     }
                     throw new Error(reasonMessage);
                }

                const translatedText = data.candidates[0].content.parts[0].text;
                sendResponse({ translation: translatedText });

            } catch (error) {
                // Bây giờ error.message sẽ chứa thông tin chi tiết hơn
                console.error("Lỗi khi dịch:", error.message);
                sendResponse({ error: `Đã xảy ra lỗi khi dịch. Chi tiết: ${error.message}` });
            }
        });
        
        return true;
    }
});