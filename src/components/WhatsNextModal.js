import React, { useState } from 'react';
import { X, Download, DollarSign, FolderOpen, Settings, Upload, CheckCircle, ExternalLink, Star, Zap, Users, Globe } from 'lucide-react';

const WhatsNextModal = ({ isOpen, onClose, extensionName = "Your Plugin", extension }) => {
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
      label: 'Submit to Directory',
      icon: <Globe className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const FigmaInstallContent = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-3">🎨</div>
        <h3 className="text-2xl font-bold text-white mb-2">Ready to Test Your Plugin</h3>
        <p className="text-gray-400 text-lg">Get your plugin running in Figma Desktop</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 text-center">
          <FolderOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <h4 className="font-semibold text-blue-300 mb-1">1. Extract</h4>
          <p className="text-blue-200/70 text-sm">Unzip the files</p>
        </div>
        <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 text-center">
          <Upload className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <h4 className="font-semibold text-green-300 mb-1">2. Import</h4>
          <p className="text-green-200/70 text-sm">Load manifest.json</p>
        </div>
        <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4 text-center">
          <Settings className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <h4 className="font-semibold text-purple-300 mb-1">3. Run</h4>
          <p className="text-purple-200/70 text-sm">Launch the plugin</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="font-semibold text-white mb-2">How to Test Your Plugin:</h4>
        <ol className="text-gray-300 space-y-2 text-sm">
          <li className="flex items-start gap-2 flex-wrap">
            <span className="font-semibold text-purple-400">1.</span>
            <span><strong>Open a Design File:</strong> Open any file (even a draft) in the Figma Desktop App</span>
          </li>
          <li className="flex items-start gap-2 flex-wrap">
            <span className="font-semibold text-purple-400">2.</span>
            <span><strong>Import Your Manifest:</strong> Go to Main Menu (Figma icon) → Plugins → Development → Import plugin from manifest...</span>
          </li>
          <li className="flex items-start gap-2 flex-wrap">
            <span className="font-semibold text-purple-400">3.</span>
            <span>Select the <code className="bg-gray-700 px-1 rounded">manifest.json</code> file in your extracted folder</span>
          </li>
          <li className="flex items-start gap-2 flex-wrap">
            <span className="font-semibold text-purple-400">4.</span>
            <span><strong>Run the Plugin:</strong> Your plugin will appear under Plugins → Development. Click its name to launch it</span>
          </li>
        </ol>
      </div>

      <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4">
        <h4 className="font-semibold text-purple-300 mb-2">Hot Reloading Tip:</h4>
        <p className="text-purple-200/70 text-sm">
          Re-run your plugin instantly after making code changes using <kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-xs">Cmd + Option + P</kbd> (Mac) or <kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-xs">Ctrl + Alt + P</kbd> (Windows)
        </p>
      </div>

      <button
        onClick={() => window.open('https://www.figma.com/plugin-docs/plugin-quickstart-guide/', '_blank')}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <ExternalLink className="w-5 h-5" />
        Figma Plugin Documentation
      </button>
    </div>
  );

  const InstallContent = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-3">🚀</div>
        <h3 className="text-2xl font-bold text-white mb-2">Ready to Install Your Plugin</h3>
        <p className="text-gray-400 text-lg">Get your plugin running on WordPress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 text-center">
          <FolderOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <h4 className="font-semibold text-blue-300 mb-1">1. Download</h4>
          <p className="text-blue-200/70 text-sm">Get the ZIP file</p>
        </div>
        <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 text-center">
          <Upload className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <h4 className="font-semibold text-green-300 mb-1">2. Upload</h4>
          <p className="text-green-200/70 text-sm">Via WordPress Admin</p>
        </div>
        <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4 text-center">
          <Settings className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <h4 className="font-semibold text-purple-300 mb-1">3. Activate</h4>
          <p className="text-purple-200/70 text-sm">Enable the plugin</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="font-semibold text-white mb-2">Quick Start:</h4>
        <ol className="text-gray-300 space-y-1 text-sm">
          <li className="flex items-center gap-2 flex-wrap">
            • Download the ZIP file
            <span className="text-gray-500 text-xs">
              (close this popup - then click
              <button className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded ml-1 mr-1 font-medium pointer-events-none">
                <Download className="w-3 h-3" />
                Download ZIP
              </button>
              button)
            </span>
          </li>
          <li>• Go to WordPress Admin → Plugins → Add New → Upload Plugin</li>
          <li>• Choose the ZIP file and click "Install Now"</li>
          <li>• Click "Activate Plugin" to enable it</li>
        </ol>
      </div>

      <button
        onClick={() => window.open('https://www.plugin.new/learn#install-wordpress-plugin', '_blank')}
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
        <h3 className="text-2xl font-bold text-white mb-2">Turn Your Plugin Into Income</h3>
        <p className="text-gray-400 text-lg">Discover proven ways to monetize your WordPress plugin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4">
          <Zap className="w-8 h-8 text-green-400 mb-3" />
          <h4 className="font-semibold text-green-300 mb-2">Premium Version</h4>
          <p className="text-green-200/70 text-sm">Offer a Pro version with advanced features</p>
        </div>
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
          <Users className="w-8 h-8 text-blue-400 mb-3" />
          <h4 className="font-semibold text-blue-300 mb-2">License Keys</h4>
          <p className="text-blue-200/70 text-sm">Sell annual licenses for support & updates</p>
        </div>
        <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4">
          <Star className="w-8 h-8 text-purple-400 mb-3" />
          <h4 className="font-semibold text-purple-300 mb-2">Freemium Model</h4>
          <p className="text-purple-200/70 text-sm">Free core features, paid add-ons</p>
        </div>
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4">
          <Globe className="w-8 h-8 text-yellow-400 mb-3" />
          <h4 className="font-semibold text-yellow-300 mb-2">Marketplace Sales</h4>
          <p className="text-yellow-200/70 text-sm">Sell on CodeCanyon, Freemius, or Gumroad</p>
        </div>
      </div>

      <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-4">
        <h4 className="font-semibold text-emerald-300 mb-2">Success Stories:</h4>
        <p className="text-emerald-200/70 text-sm">
          Many WordPress plugin developers earn $1,000-$10,000+ monthly through strategic monetization and building a user base.
        </p>
      </div>

      <button
        onClick={() => window.open('https://www.plugin.new/learn#monetize-wordpress-plugin', '_blank')}
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
        <h3 className="text-2xl font-bold text-white mb-2">Publish to WordPress.org</h3>
        <p className="text-gray-400 text-lg">Reach millions of WordPress users worldwide</p>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-300 mb-2">Requirements Checklist:</h4>
          <div className="text-blue-200/70 text-sm space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Plugin files ready</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-blue-400 rounded-full"></div>
              <span>Readme.txt with description and changelog</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-blue-400 rounded-full"></div>
              <span>Screenshots and banner images</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-blue-400 rounded-full"></div>
              <span>GPL-compatible license</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-blue-400 rounded-full"></div>
              <span>WordPress.org account (free)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🌍</div>
            <h4 className="font-semibold text-green-300 mb-1">Global Reach</h4>
            <p className="text-green-200/70 text-sm">Access to 40%+ of all websites</p>
          </div>
          <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🚀</div>
            <h4 className="font-semibold text-purple-300 mb-1">Auto Updates</h4>
            <p className="text-purple-200/70 text-sm">Users get updates automatically</p>
          </div>
        </div>

        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-300 mb-2">Review Process:</h4>
          <p className="text-yellow-200/70 text-sm">
            WordPress.org reviews typically take 1-5 business days. First submissions may take longer for manual code review.
          </p>
        </div>
      </div>

      <button
        onClick={() => window.open('https://www.plugin.new/learn#wordpress-submission-guide', '_blank')}
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
        return extension?.platform === 'figma' ? <FigmaInstallContent /> : <InstallContent />;
      case 'monetize':
        return <MonetizeContent />;
      case 'submit':
        return <SubmitContent />;
      default:
        return extension?.platform === 'figma' ? <FigmaInstallContent /> : <InstallContent />;
    }
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center z-50 p-4 pt-16">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700">

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
            <p className="text-white/90 text-xl mb-1">Your plugin "{extensionName}" is ready!</p>
            <p className="text-white/80">What would you like to do next?</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 bg-gray-800">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-900'
                    : 'text-gray-400 hover:text-blue-400 hover:bg-gray-900/50'
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
        <div className="border-t border-gray-700 p-4 bg-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            Need help? Check out our <button
              onClick={() => window.open('https://www.plugin.new/learn', '_blank')}
              className="text-blue-400 hover:text-blue-300 underline"
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
