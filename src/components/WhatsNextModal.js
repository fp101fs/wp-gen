import React, { useState } from 'react';
import { X, Download, Chrome, DollarSign, FolderOpen, Settings, Pin, CheckCircle, ExternalLink, Star, Zap, Users } from 'lucide-react';

const WhatsNextModal = ({ isOpen, onClose, extensionName = "Your Extension", extension }) => {
  const [activeTab, setActiveTab] = useState('install');

  if (!isOpen) return null;

  const tabs = [
    {
      id: 'install',
      label: 'Install & Test',
      icon: <Download className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'monetize',
      label: 'Monetize',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'submit',
      label: 'Submit to Store',
      icon: <Chrome className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const InstallContent = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-3">🚀</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to Install Your Extension</h3>
        <p className="text-gray-600 text-lg">Get your extension up and running in Chrome</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <FolderOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h4 className="font-semibold text-blue-800 mb-1">1. Download</h4>
          <p className="text-blue-700 text-sm">Extract the ZIP file</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <Settings className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h4 className="font-semibold text-green-800 mb-1">2. Load</h4>
          <p className="text-green-700 text-sm">Enable in Chrome</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <Pin className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h4 className="font-semibold text-purple-800 mb-1">3. Pin</h4>
          <p className="text-purple-700 text-sm">Add to toolbar</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">Quick Start:</h4>
        <ol className="text-gray-700 space-y-1 text-sm">
          <li className="flex items-center gap-2 flex-wrap">
            • Download and extract the ZIP file
            <span className="text-gray-600 text-xs">
              (close this popup - then click
              <button className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded ml-1 mr-1 font-medium pointer-events-none">
                <Download className="w-3 h-3" />
                Download ZIP
              </button>
              button)
            </span>
          </li>
          <li>• Go to chrome://extensions/ and enable Developer mode</li>
          <li>• Click "Load unpacked" and select your extracted folder</li>
          <li>• Pin your extension to the toolbar for easy access</li>
        </ol>
      </div>

      <button
        onClick={() => window.open('https://www.kromio.ai/learn#install-chrome-extension', '_blank')}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <ExternalLink className="w-5 h-5" />
        Learn How to Install
      </button>
    </div>
  );

  const MonetizeContent = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-3">💰</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Turn Your Extension Into Income</h3>
        <p className="text-gray-600 text-lg">Discover proven ways to monetize your Chrome extension</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <Zap className="w-8 h-8 text-green-600 mb-3" />
          <h4 className="font-semibold text-green-800 mb-2">Premium Features</h4>
          <p className="text-green-700 text-sm">Add paid tiers with advanced functionality</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Users className="w-8 h-8 text-blue-600 mb-3" />
          <h4 className="font-semibold text-blue-800 mb-2">Subscription Model</h4>
          <p className="text-blue-700 text-sm">Recurring revenue with monthly/yearly plans</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <Star className="w-8 h-8 text-purple-600 mb-3" />
          <h4 className="font-semibold text-purple-800 mb-2">Affiliate Marketing</h4>
          <p className="text-purple-700 text-sm">Partner with relevant services and products</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <Chrome className="w-8 h-8 text-yellow-600 mb-3" />
          <h4 className="font-semibold text-yellow-800 mb-2">Pro Version</h4>
          <p className="text-yellow-700 text-sm">Offer enhanced features for business users</p>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <h4 className="font-semibold text-emerald-800 mb-2">💡 Success Stories:</h4>
        <p className="text-emerald-700 text-sm">
          Many developers earn $500-$5000+ monthly from their Chrome extensions through strategic monetization.
        </p>
      </div>

      <button
        onClick={() => window.open('https://www.kromio.ai/learn#monetize-chrome-extension', '_blank')}
        className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
      >
        <ExternalLink className="w-5 h-5" />
        Learn Monetization Strategies
      </button>
    </div>
  );

  const SubmitContent = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-3">🏪</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Publish to Chrome Web Store</h3>
        <p className="text-gray-600 text-lg">Reach millions of users worldwide</p>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">📋 Requirements Checklist:</h4>
          <div className="text-blue-700 text-sm space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Extension files ready ✓</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-blue-600 rounded-full"></div>
              <span>Icons and screenshots (128x128, 1280x800)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-blue-600 rounded-full"></div>
              <span>Detailed description and store listing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-blue-600 rounded-full"></div>
              <span>Privacy policy (if collecting data)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-blue-600 rounded-full"></div>
              <span>Developer account ($5 one-time fee)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🌍</div>
            <h4 className="font-semibold text-green-800 mb-1">Global Reach</h4>
            <p className="text-green-700 text-sm">Access to billions of Chrome users</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🚀</div>
            <h4 className="font-semibold text-purple-800 mb-1">Easy Updates</h4>
            <p className="text-purple-700 text-sm">Automatic updates to all users</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">⏱️ Review Process:</h4>
          <p className="text-yellow-700 text-sm">
            Typically takes 1-3 business days for review. First-time submissions may take longer.
          </p>
        </div>
      </div>

      <button
        onClick={() => window.open('https://www.kromio.ai/learn#submission-guide', '_blank')}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <ExternalLink className="w-5 h-5" />
        Complete Submission Guide
      </button>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'install':
        return <InstallContent />;
      case 'monetize':
        return <MonetizeContent />;
      case 'submit':
        return <SubmitContent />;
      default:
        return <InstallContent />;
    }
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center z-50 p-4 pt-16">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">

        {/* Header */}
        <div className={`bg-gradient-to-r ${activeTabData.color} p-6 text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-3xl font-bold mb-2">Congratulations!</h2>
            <p className="text-white/90 text-xl mb-1">Your extension "{extensionName}" is ready!</p>
            <p className="text-white/80">What would you like to do next?</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 text-center">
          <p className="text-gray-600 text-sm">
            Need help? Check out our <button
              onClick={() => window.open('https://www.kromio.ai/learn', '_blank')}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              comprehensive guides
            </button> or join our community for support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhatsNextModal;