import React from 'react';

function InstallationInstructions({ instructions, title = "Installation Instructions" }) {
  if (!instructions) {
    return null;
  }

  // Default instructions if none provided
  const defaultInstructions = `1. Download the extension ZIP file
2. Open Chrome and navigate to chrome://extensions/
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extracted folder
5. The extension should now appear in your Chrome toolbar`;

  const displayInstructions = instructions.trim() || defaultInstructions;

  return (
    <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-3">{title}:</h3>
      <div className="text-blue-200 whitespace-pre-line">{displayInstructions}</div>
    </div>
  );
}

export default InstallationInstructions;