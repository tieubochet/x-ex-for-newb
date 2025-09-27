// This file is compiled to background.js
// Note: You need to install @google/genai for this to work in a real project setup.
// For this environment, we assume the library is available.
import { GoogleGenAI } from "https://aistudiocdn.com/@google/genai@^1.21.0";

const GEMINI_MODEL = "gemini-2.5-flash";

// Refactored to get API key from process.env.API_KEY instead of chrome.storage, per coding guidelines.
async function translateText(text) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not set in environment variables.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Translate the following English text to Vietnamese, keeping the original tone and context. If the text is already in Vietnamese, just return the original text.\n\nText:\n"${text}"\n\nVietnamese Translation:`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });
  
  return response.text;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translate") {
    if (!request.text) {
        sendResponse({ error: "No text provided to translate." });
        return;
    }
      
    (async () => {
      try {
        const translatedText = await translateText(request.text);
        sendResponse({ translation: translatedText });
      } catch (error) {
        console.error("Gemini API Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during translation.";
        sendResponse({ error: `Error: ${errorMessage}` });
      }
    })();

    return true; // Indicates that the response is sent asynchronously
  }
});

// Open options page on install
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        chrome.runtime.openOptionsPage();
    }
});
