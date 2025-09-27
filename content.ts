// This file is compiled to content.js

// Fix: Add chrome declaration to resolve "Cannot find name 'chrome'" errors.
declare const chrome: any;

// We cannot use Tailwind directly, so we define CSS that mimics its style.
const styles = `
.gemini-translate-btn {
    color: rgb(113, 118, 123);
    background-color: transparent;
    border: none;
    padding: 4px 0;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s, background-color 0.2s;
    margin-left: 12px;
}
.gemini-translate-btn:hover {
    color: #8a63d2; /* A purple accent */
    text-decoration: underline;
}
.gemini-translate-btn:disabled {
    color: #536471;
    cursor: not-allowed;
}
.gemini-translation-container {
    border-left: 3px solid #8a63d2;
    padding: 10px 12px;
    margin-top: 12px;
    border-radius: 4px;
    white-space: pre-wrap;
    font-style: italic;
    color: rgb(231, 233, 234);
    background-color: rgba(255, 255, 255, 0.05);
}
`;

// Inject styles into the page
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const addTranslateButton = (tweetElement) => {
    if (tweetElement.querySelector('.gemini-translate-btn')) {
        return; // Button already exists
    }

    const textElement = tweetElement.querySelector('div[data-testid="tweetText"]');
    const actionBar = tweetElement.querySelector('div[role="group"]');

    if (!textElement || !actionBar || !textElement.innerText.trim()) {
        return;
    }

    const button = document.createElement('button');
    button.innerText = 'Translate';
    button.className = 'gemini-translate-btn';

    button.addEventListener('click', (event) => {
        event.stopPropagation();
        event.preventDefault();

        const originalText = textElement.innerText;
        button.disabled = true;
        button.innerText = 'Translating...';

        const message = { action: "translate", text: originalText };

        chrome.runtime.sendMessage(message, (response) => {
            button.disabled = false;
            button.innerText = 'Translate';

            // Remove previous translation if it exists
            const oldTranslation = tweetElement.querySelector('.gemini-translation-container');
            if (oldTranslation) {
                oldTranslation.remove();
            }

            const translationContainer = document.createElement('div');
            translationContainer.className = 'gemini-translation-container';

            if (response.translation) {
                translationContainer.innerText = response.translation;
            } else {
                translationContainer.innerText = response.error || 'Failed to get translation.';
                translationContainer.style.color = 'rgb(249, 24, 128)'; // X's error/like color
                translationContainer.style.borderColor = 'rgb(249, 24, 128)';
            }
            
            // Insert after the text container
            if (textElement.parentNode) {
                textElement.parentNode.insertBefore(translationContainer, textElement.nextSibling);
            }
        });
    });

    actionBar.appendChild(button);
};

const processTweets = () => {
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');
    tweets.forEach(tweet => addTranslateButton(tweet));
};

const observer = new MutationObserver((mutations) => {
    // We can be smarter here, but for simplicity, we just re-process on any change.
    // A requestAnimationFrame can debounce this to prevent performance issues.
    window.requestAnimationFrame(processTweets);
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});

// Initial run
setTimeout(processTweets, 1000);