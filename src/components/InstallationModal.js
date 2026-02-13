import React, { useState } from 'react';
import { X, Download, FolderOpen, Settings, Upload, CheckCircle, ArrowRight, Code, FileText } from 'lucide-react';

const InstallationModal = ({ isOpen, onClose, extensionName = "Your Plugin", platform = "wordpress" }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  // WordPress installation steps
  const wordpressSteps = [
    {
      id: 1,
      title: "Download the Plugin ZIP",
      icon: <Download className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500",
      description: "Your plugin has been downloaded as a ZIP file",
      details: [
        "Locate the downloaded ZIP file (usually in your Downloads folder)",
        "Keep the ZIP file intact - do NOT extract it",
        "WordPress will extract it automatically during installation"
      ],
      tip: "WordPress plugins are installed as ZIP files - don't extract the archive!"
    },
    {
      id: 2,
      title: "Upload to WordPress",
      icon: <Upload className="w-8 h-8" />,
      color: "from-green-500 to-emerald-500",
      description: "Upload the plugin through WordPress Admin",
      details: [
        "Log in to your WordPress admin dashboard",
        "Go to Plugins → Add New in the left sidebar",
        "Click the 'Upload Plugin' button at the top",
        "Click 'Choose File' and select your downloaded ZIP",
        "Click 'Install Now' and wait for installation to complete"
      ],
      tip: "The 'Upload Plugin' button is at the top of the Add Plugins page"
    },
    {
      id: 3,
      title: "Activate Your Plugin",
      icon: <Settings className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      description: "Activate the plugin to start using it",
      details: [
        "After installation, click 'Activate Plugin'",
        "Or go to Plugins → Installed Plugins",
        "Find your plugin in the list",
        "Click 'Activate' under the plugin name",
        "Your plugin is now active and ready to use!"
      ],
      tip: "Check the plugin's settings page for configuration options"
    }
  ];

  // Google Sheets installation steps (basic Apps Script)
  const googleSheetsSteps = [
    {
      id: 1,
      title: "Open Apps Script Editor",
      icon: <Code className="w-8 h-8" />,
      color: "from-green-500 to-teal-500",
      description: "Access the Apps Script editor from Google Sheets",
      details: [
        "Open your Google Sheets document",
        "Click 'Extensions' in the menu bar",
        "Select 'Apps Script' from the dropdown",
        "A new tab will open with the Apps Script editor"
      ],
      tip: "The Apps Script editor is where you'll paste your add-on code"
    },
    {
      id: 2,
      title: "Copy the Code Files",
      icon: <FileText className="w-8 h-8" />,
      color: "from-blue-500 to-indigo-500",
      description: "Add your downloaded code to the Apps Script project",
      details: [
        "Extract the downloaded ZIP file",
        "In the Apps Script editor, delete any existing code in Code.gs",
        "Copy the contents of Code.gs from your download and paste it",
        "Click the '+' next to Files to add any additional .gs files",
        "Create appsscript.json by clicking Project Settings (gear icon) and enabling 'Show appsscript.json'"
      ],
      tip: "Make sure to copy the appsscript.json manifest for proper configuration"
    },
    {
      id: 3,
      title: "Save and Refresh",
      icon: <Settings className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      description: "Save your project and reload the spreadsheet",
      details: [
        "Click the Save icon (or Ctrl/Cmd + S) to save the project",
        "Give your project a name when prompted",
        "Close the Apps Script tab",
        "Refresh your Google Sheets page",
        "Your add-on menu will appear in the menu bar!"
      ],
      tip: "Look for your custom menu in the Google Sheets menu bar after refreshing"
    }
  ];

  // Google Sheets Workspace Add-on installation steps (Marketplace-ready)
  const googleSheetsAddonSteps = [
    {
      id: 1,
      title: "Open Apps Script Editor",
      icon: <Code className="w-8 h-8" />,
      color: "from-green-500 to-teal-500",
      description: "Access the Apps Script editor from Google Sheets",
      details: [
        "Open your Google Sheets document",
        "Click 'Extensions' in the menu bar",
        "Select 'Apps Script' from the dropdown",
        "A new tab will open with the Apps Script editor"
      ],
      tip: "The Apps Script editor is where you'll set up your Workspace Add-on"
    },
    {
      id: 2,
      title: "Copy the Code Files",
      icon: <FileText className="w-8 h-8" />,
      color: "from-blue-500 to-indigo-500",
      description: "Add your add-on code to the Apps Script project",
      details: [
        "Extract the downloaded ZIP file",
        "In the Apps Script editor, delete any existing code in Code.gs",
        "Copy the contents of Code.gs from your download and paste it",
        "Click Project Settings (gear icon) and enable 'Show appsscript.json manifest file'",
        "Replace the appsscript.json content with the manifest from your download"
      ],
      tip: "The appsscript.json contains the 'addOns' configuration required for Workspace Add-ons"
    },
    {
      id: 3,
      title: "Test Your Add-on",
      icon: <Settings className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      description: "Deploy and test the add-on before publishing",
      details: [
        "Click the Save icon (or Ctrl/Cmd + S) to save the project",
        "Go to Deploy > Test deployments",
        "Click 'Install' to test in your current spreadsheet",
        "Refresh your Google Sheets page",
        "Your add-on sidebar will appear automatically, plus a custom menu!"
      ],
      tip: "Use 'Test deployments' to try your add-on before submitting to the Marketplace"
    }
  ];

  // Blender add-on installation steps
  const blenderSteps = [
    {
      id: 1,
      title: "Download the Add-on ZIP",
      icon: <Download className="w-8 h-8" />,
      color: "from-orange-500 to-amber-500",
      description: "Your add-on has been downloaded as a ZIP file",
      details: [
        "Locate the downloaded ZIP file (usually in your Downloads folder)",
        "Keep the ZIP file intact - do NOT extract it",
        "Blender will extract it automatically during installation"
      ],
      tip: "Blender add-ons are installed directly from ZIP files - don't extract the archive!"
    },
    {
      id: 2,
      title: "Install in Blender",
      icon: <Upload className="w-8 h-8" />,
      color: "from-orange-600 to-red-500",
      description: "Install the add-on through Blender Preferences",
      details: [
        "Open Blender",
        "Go to Edit > Preferences",
        "Click on the 'Add-ons' tab in the left sidebar",
        "Click the 'Install...' button in the top-right",
        "Navigate to and select your downloaded ZIP file",
        "Click 'Install Add-on'"
      ],
      tip: "You can also drag and drop the ZIP file directly into the Blender window"
    },
    {
      id: 3,
      title: "Enable and Use",
      icon: <Settings className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      description: "Enable the add-on and find its panel",
      details: [
        "After installation, find your add-on in the list",
        "Check the checkbox next to the add-on name to enable it",
        "Click the hamburger menu (☰) and select 'Save Preferences' to keep it enabled",
        "Open the 3D Viewport and press N to show the sidebar",
        "Find your add-on's tab in the sidebar panel"
      ],
      tip: "Press N in the 3D Viewport to toggle the sidebar where most add-on panels appear"
    }
  ];

  // Figma plugin installation steps
  const figmaSteps = [
    {
      id: 1,
      title: "Download and Extract ZIP",
      icon: <Download className="w-8 h-8" />,
      color: "from-purple-500 to-violet-500",
      description: "Your plugin has been downloaded as a ZIP file",
      details: [
        "Locate the downloaded ZIP file (usually in your Downloads folder)",
        "Extract the ZIP file to a folder on your computer",
        "Remember where you extracted it - you'll need this location"
      ],
      tip: "Unlike other platforms, Figma plugins need to be extracted before importing!"
    },
    {
      id: 2,
      title: "Import in Figma",
      icon: <Upload className="w-8 h-8" />,
      color: "from-violet-500 to-fuchsia-500",
      description: "Import the plugin through Figma's development menu",
      details: [
        "Open Figma Desktop App (required for development plugins)",
        "Go to Plugins > Development > Import plugin from manifest",
        "Navigate to the extracted folder",
        "Select the manifest.json file",
        "Click 'Open' to import the plugin"
      ],
      tip: "You need the Figma Desktop App to run development plugins"
    },
    {
      id: 3,
      title: "Run Your Plugin",
      icon: <Settings className="w-8 h-8" />,
      color: "from-fuchsia-500 to-pink-500",
      description: "Run the plugin from the Plugins menu",
      details: [
        "Open a Figma design file",
        "Go to Plugins > Development > Your Plugin Name",
        "Or right-click on the canvas > Plugins > Development > Your Plugin Name",
        "The plugin will run and show its UI if it has one",
        "Your plugin is now ready to use!"
      ],
      tip: "Development plugins appear under 'Development' until you publish them"
    }
  ];

  // Shopify Theme App Extension installation steps
  const shopifySteps = [
    {
      id: 1,
      title: "Set Up a Development Store",
      icon: <FolderOpen className="w-8 h-8" />,
      color: "from-green-500 to-emerald-500",
      description: "Create a free development store to test your extension",
      details: [
        "Go to the Shopify Partner Dashboard (dev.shopify.com/dashboard)",
        "Click on 'Stores' (or 'Dev Stores') in the sidebar",
        "Click 'Add store' > 'Create store for app development'",
        "Enter a Store Name, choose Shopify plan, click 'Create store'"
      ],
      tip: "Development stores are free and let you test without affecting real customers"
    },
    {
      id: 2,
      title: "Set Up Shopify CLI",
      icon: <Download className="w-8 h-8" />,
      color: "from-emerald-500 to-teal-500",
      description: "Install the CLI tools and prepare your extension",
      details: [
        "Extract the downloaded ZIP file and note the folder path",
        "Open Terminal and install Shopify CLI: npm install -g @shopify/cli @shopify/app",
        "Navigate to the extracted folder: cd /path/to/your/extracted-folder"
      ],
      tip: "You need Node.js installed. Download from nodejs.org if needed"
    },
    {
      id: 3,
      title: "Link and Test Your Extension",
      icon: <Settings className="w-8 h-8" />,
      color: "from-teal-500 to-cyan-500",
      description: "Connect to Shopify and preview your extension",
      details: [
        "Run 'shopify app config link' in your terminal",
        "When prompted, select 'Yes, create it as a new app'",
        "Run 'shopify app dev' to start the development server",
        "Press 'p' to open the preview in your browser",
        "In Theme Editor: Add Section > Apps tab > Select your extension"
      ],
      tip: "If asked for a Store Password, find it in Online Store > Preferences"
    }
  ];

  const getSteps = () => {
    if (platform === 'shopify') return shopifySteps;
    if (platform === 'figma') return figmaSteps;
    if (platform === 'blender') return blenderSteps;
    if (platform === 'google-sheets-addon') return googleSheetsAddonSteps;
    if (platform === 'google-sheets') return googleSheetsSteps;
    return wordpressSteps;
  };

  const steps = getSteps();

  const currentStepData = steps[currentStep];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center z-50 p-4 pt-16">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700">

        {/* Header */}
        <div className={`bg-gradient-to-r ${currentStepData.color} p-6 text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              {currentStepData.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold">How to Install {extensionName}</h2>
              <p className="text-white/90">Follow these simple steps to get your {platform === 'shopify' ? 'extension' : platform === 'google-sheets' || platform === 'google-sheets-addon' || platform === 'blender' ? 'add-on' : 'plugin'} working</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    index <= currentStep
                      ? 'bg-white text-gray-800'
                      : 'bg-white/30 text-white/70'
                  }`}
                >
                  {index < currentStep ? <CheckCircle className="w-5 h-5 text-green-600" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-1 mx-2 rounded-full transition-all duration-300 ${
                    index < currentStep ? 'bg-white' : 'bg-white/30'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              Step {currentStepData.id}: {currentStepData.title}
            </h3>
            <p className="text-gray-400 text-lg">
              {currentStepData.description}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            {currentStepData.details.map((detail, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                <div className="w-6 h-6 bg-blue-900/50 text-blue-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-gray-300 leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>

          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 mb-6">
            <p className="text-yellow-300 font-medium">{currentStepData.tip}</p>
          </div>

          {/* Special content for step 2 */}
          {currentStep === 1 && platform === 'wordpress' && (
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-300 mb-2">Quick WordPress Admin Link:</h4>
              <div className="bg-blue-900/50 p-3 rounded font-mono text-blue-200 text-center">
                yoursite.com/wp-admin/plugin-install.php
              </div>
              <p className="text-blue-200/70 text-sm mt-2">
                Replace "yoursite.com" with your actual WordPress site URL
              </p>
            </div>
          )}
          {currentStep === 1 && platform === 'google-sheets' && (
            <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-300 mb-2">Apps Script Editor Tip:</h4>
              <p className="text-green-200/70 text-sm">
                Each .gs file should be created as a separate script file. Click the "+" button next to "Files" in the left sidebar to add new script files.
              </p>
            </div>
          )}
          {currentStep === 1 && platform === 'google-sheets-addon' && (
            <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-300 mb-2">Workspace Add-on Manifest:</h4>
              <p className="text-green-200/70 text-sm">
                The appsscript.json file contains the "addOns" configuration required for Marketplace deployment. Make sure to enable "Show appsscript.json" in Project Settings.
              </p>
            </div>
          )}
          {currentStep === 1 && platform === 'shopify' && (
            <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-300 mb-2">Install Command:</h4>
              <div className="bg-green-900/50 p-3 rounded font-mono text-green-200 text-sm">
                npm install -g @shopify/cli @shopify/app
              </div>
            </div>
          )}
          {currentStep === 2 && platform === 'shopify' && (
            <div className="bg-teal-900/30 border border-teal-700/50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-teal-300 mb-2">Key Terminal Commands:</h4>
              <div className="space-y-2">
                <div className="bg-teal-900/50 p-2 rounded font-mono text-teal-200 text-sm">
                  shopify app config link
                </div>
                <div className="bg-teal-900/50 p-2 rounded font-mono text-teal-200 text-sm">
                  shopify app dev
                </div>
              </div>
              <p className="text-teal-200/70 text-sm mt-2">
                Press 'p' during dev to open the preview
              </p>
            </div>
          )}

          {/* Success message for final step */}
          {isLastStep && (
            <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h4 className="text-xl font-bold text-green-300 mb-2">Congratulations!</h4>
              <p className="text-green-200/70">
                {platform === 'shopify'
                  ? 'Your extension is linked and running! In the Theme Editor, click "Add Section" and look under the "Apps" tab to add your block. Press Ctrl+C in terminal to stop the dev server when done.'
                  : platform === 'figma'
                  ? 'Your Figma plugin is now imported! Find it under Plugins > Development in Figma. Right-click on the canvas for quick access. To publish, go to Plugins > Manage plugins in the Figma Desktop App.'
                  : platform === 'blender'
                  ? 'Your Blender add-on is now installed and enabled! Find your add-on\'s panel in the 3D Viewport sidebar (press N to toggle). Remember to save your preferences to keep it enabled.'
                  : platform === 'google-sheets-addon'
                  ? 'Your Workspace Add-on is installed! The sidebar will open automatically, and you\'ll find a custom menu in the menu bar. Use Deploy > Test deployments to share with testers before Marketplace submission.'
                  : platform === 'google-sheets'
                  ? 'Your add-on is now installed! Look for your custom menu in the Google Sheets menu bar to start using it.'
                  : 'Your plugin is now installed and active. Check your WordPress admin for any new menu items or settings pages added by the plugin.'}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="border-t border-gray-700 p-6 bg-gray-800">
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={isFirstStep}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                isFirstStep
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ← Previous
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Step {currentStep + 1} of {steps.length}</p>
              <div className="flex gap-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {isLastStep ? (
              <button
                onClick={onClose}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                Done!
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Next Step
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallationModal;
