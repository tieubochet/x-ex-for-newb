// This file is compiled to content.js

(() => {
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
        if (!textElement || !textElement.innerText.trim()) {
            return;
        }

        // --- NEW ROBUST SELECTOR LOGIC ---
        // Find the action bar by looking for the 'Share' button's SVG icon path. This is much more stable than data-testid attributes.
        const shareSvgPath = "M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.12 21 3 19.88 3 18.51V15h2v3.51c0 .28.22.49.5.49h12.98c.28 0 .5-.21.5-.49V15h2z";
        const shareIcon = tweetElement.querySelector(`path[d="${shareSvgPath}"]`);

        if (!shareIcon) {
            return; // Can't find the insertion point
        }

        const actionBar = shareIcon.closest('div[role="group"]');
        if (!actionBar) {
            return;
        }

        // Find the specific wrapper of the share button that is a direct child of the action bar.
        let shareButtonWrapper = shareIcon;
        while (shareButtonWrapper.parentElement && shareButtonWrapper.parentElement !== actionBar) {
            shareButtonWrapper = shareButtonWrapper.parentElement;
        }

        if (!shareButtonWrapper || shareButtonWrapper.parentElement !== actionBar) {
            return; // Couldn't find the direct child wrapper.
        }
        // --- END OF NEW LOGIC ---

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

        // The other items in the action bar are divs, so we wrap our button for correct flexbox spacing.
        const buttonWrapper = document.createElement('div');
        buttonWrapper.appendChild(button);

        // Insert our button before the Share button's wrapper.
        actionBar.insertBefore(buttonWrapper, shareButtonWrapper);
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
})();