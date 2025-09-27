import React from 'react';

// Fix: The entire component has been refactored to remove the API key management UI,
// which is forbidden by the coding guidelines. This change also resolves the
// 'Cannot find name 'chrome'' errors by removing all usage of the chrome API.
const App: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-200">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-white">X Gemini Translator</h1>
            <p className="mt-2 text-gray-400">Settings</p>
        </div>
        
        <div className="text-center pt-4">
          <p className="text-gray-300">
            This extension is active and ready to translate.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            The API key is managed by the application's configuration and does not need to be set here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
