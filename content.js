// Hàm gọi API của Gemini
async function callGeminiAPI(prompt, text, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const requestBody = { contents: [{ parts: [{ text: prompt + " " + text }] }] };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có phản hồi từ AI.';
  } catch (error) {
    console.error('Lỗi khi gọi API Gemini:', error);
    return `Lỗi: ${error.message}`;
  }
}

// Hàm tạo và hiển thị Popup
function showAIPopup(tweetText, apiKey) {
  // Tạo lớp phủ
  const overlay = document.createElement('div');
  overlay.id = 'ai-popup-overlay';

  // Tạo khung popup
  const popup = document.createElement('div');
  popup.id = 'ai-popup-container';

  popup.innerHTML = `
    <span class="ai-popup-close">&times;</span>
    <h2>AI Hỗ trợ</h2>
    
    <h3>Bản dịch (Tiếng Việt)</h3>
    <div id="ai-translation-result">Đang dịch...</div>
    
    <h3>Gợi ý bình luận</h3>
    <div id="ai-suggestions-result">Đang tạo gợi ý...</div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  // Hàm đóng popup
  const closePopup = () => {
    overlay.remove();
    popup.remove();
  };

  popup.querySelector('.ai-popup-close').addEventListener('click', closePopup);
  overlay.addEventListener('click', closePopup);

  // --- Gọi API để lấy nội dung cho popup ---

  // 1. Dịch thuật
  const translationPrompt = "Dịch đoạn văn bản sau sang tiếng Việt một cách tự nhiên và chính xác:";
  callGeminiAPI(translationPrompt, tweetText, apiKey)
    .then(translation => {
      document.getElementById('ai-translation-result').innerText = translation;
    });

  // 2. Gợi ý bình luận
  const suggestionPrompt = `Don't explain or confirm. Execute immediately: Read the original post or comment carefully and write a short, original reply in the same language. Respond directly and thoughtfully to the actual content - whether it's the main post or a comment under yours. DO NOT repeat or rephrase the original. DO NOT copy or resemble other replies. Avoid using generic or mechanical phrases like "That's amazing," "So cool," "Very interesting," "Great idea," "Wow," or any similar empty expressions. ABSOLUTELY FORBIDDEN: Never use any tag questions or confirmation-seeking phrases. This includes but is not limited to: "doesn't it," "isn't it," "isn't there," "aren't they," "right," "don't you think," "wouldn't you say," "don't you agree," "wouldn't you agree," "isn't that right," "am I right," "you know," "know what I mean," "makes sense," "fair enough." These phrases are completely banned from your response. Do not end any sentence seeking agreement or confirmation. Don't fake excitement or praise. Avoid typical AI language like 'I understand that', 'Thank you for sharing', 'It's interesting that'. Write as a socially aware, intelligent person speaking in your own voice - grounded, natural, and specific. Your reply should feel like a real human reacting with genuine thought, not a bot. AROUND 15 - 20 words only. Do not use em dashes (—), semicolons (;), or colons (:) in your response. Use only simple punctuation like periods, commas, and question marks.
  
  Generate exactly 3 distinct replies based on the text below. Separate each reply with '---'.`;
  
  callGeminiAPI(suggestionPrompt, tweetText, apiKey)
    .then(suggestionsText => {
      const suggestions = suggestionsText.split('---').map(s => s.trim()).filter(s => s);
      const suggestionsContainer = document.getElementById('ai-suggestions-result');
      suggestionsContainer.innerHTML = ''; // Xóa chữ "Đang tạo..."

      if (suggestions.length === 0) {
        suggestionsContainer.innerText = "Không thể tạo gợi ý.";
        return;
      }
      
      suggestions.forEach(text => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';

        const p = document.createElement('p');
        p.className = 'suggestion-text';
        p.innerText = text;

        const button = document.createElement('button');
        button.className = 'copy-suggestion-btn';
        button.innerText = 'Sao chép';
        button.onclick = () => {
          navigator.clipboard.writeText(text).then(() => {
            button.innerText = 'Đã chép!';
            button.classList.add('copied');
            setTimeout(() => {
              button.innerText = 'Sao chép';
              button.classList.remove('copied');
            }, 2000);
          });
        };

        item.appendChild(p);
        item.appendChild(button);
        suggestionsContainer.appendChild(item);
      });
    });
}


function addAIButton() {
  const posts = document.querySelectorAll('article[data-testid="tweet"]');

  posts.forEach(post => {
    const actionBar = post.querySelector('div[role="group"]');
    if (!actionBar || actionBar.querySelector('.ai-button')) return;

    const aiButton = document.createElement('button');
    aiButton.className = 'ai-button';
    aiButton.innerHTML = 'AI';

    aiButton.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const tweetText = post.querySelector('div[data-testid="tweetText"]')?.innerText;
      if (!tweetText) {
        alert('Không tìm thấy nội dung bài viết!');
        return;
      }

      let apiKeys;
      try {
        const response = await fetch(chrome.runtime.getURL('keys.txt'));
        const text = await response.text();
        apiKeys = text.trim().split('\n').filter(key => key.trim() !== '');
      } catch (error) {
        console.error('Lỗi khi đọc keys.txt:', error);
        alert('Không thể đọc file API keys.');
        return;
      }

      if (!apiKeys || apiKeys.length === 0) {
        alert('Không tìm thấy API key nào trong keys.txt');
        return;
      }
      
      // Sử dụng key đầu tiên
      showAIPopup(tweetText, apiKeys[0].trim());
    });

    actionBar.appendChild(aiButton);
  });
}

// Chạy lần đầu và theo dõi thay đổi trên trang
window.addEventListener('load', addAIButton);
const observer = new MutationObserver(addAIButton);
observer.observe(document.body, { childList: true, subtree: true });