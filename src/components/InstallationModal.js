import React, { useState } from 'react';
import { X, Download, FolderOpen, Settings, Upload, CheckCircle, ArrowRight } from 'lucide-react';

const InstallationModal = ({ isOpen, onClose, extensionName = "Your Plugin" }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
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
              <p className="text-white/90">Follow these simple steps to get your plugin working</p>
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
          {currentStep === 1 && (
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

          {/* Success message for final step */}
          {isLastStep && (
            <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h4 className="text-xl font-bold text-green-300 mb-2">Congratulations!</h4>
              <p className="text-green-200/70">
                Your plugin is now installed and active. Check your WordPress admin for any new menu items or settings pages added by the plugin.
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
