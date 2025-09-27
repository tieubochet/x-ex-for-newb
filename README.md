# X.com Gemini Translator Extension

This is a simple browser extension that adds a "Translate" button to tweets on X.com (formerly Twitter). It uses the Google Gemini API to translate tweet text into Vietnamese.

## Features

- **One-Click Translation:** Adds a "Translate" button directly to the action bar of each tweet.
- **Seamless UI Integration:** The button and the translated text are designed to fit into the X.com interface.

## How It Works

1.  The extension's content script (`content.ts`) scans the page for tweets and injects a "Translate" button into the action bar below each tweet.
2.  When you click the button, the script sends the tweet's text to the background service worker (`background.ts`).
3.  The background script securely calls the Google Gemini API with a prompt to translate the text.
4.  The translation is returned to the content script and displayed neatly below the original tweet text.

## Setup

This extension is configured to use an API key provided through an environment variable (`process.env.API_KEY`) at build time. No manual setup is required by the end-user on the options page. The options page simply confirms that the extension is active.

## File Structure

-   `manifest.json`: The core manifest file that defines the extension's permissions, scripts, and properties.
-   `background.ts`: The service worker that runs in the background, handling API calls to the Gemini service.
-   `content.ts`: The script injected into X.com pages to add the "Translate" button and display results.
-   `index.html` & `App.tsx`: The files for the extension's options page, built with React and Tailwind CSS.
-   `types.ts`: Contains shared TypeScript types for communication between the content script and background worker.
