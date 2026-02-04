import React, { useState } from 'react';
import { Palette, Package, Crown, Sparkles } from 'lucide-react';
import { useTokenContext } from '../contexts/TokenContext';
import CustomizeExtensionModal from './CustomizeExtensionModal';

function CustomizeExtensionSection({
  extension,
  extensionFiles,
  session,
  onShowLoginModal
}) {
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  const {
    canGenerateExtension,
    planName,
    showUpgradePromptAction
  } = useTokenContext();

  // Get tier message
  const getTierMessage = () => {
    if (planName === 'free') {
      return 'Default icon only - Upgrade for more';
    } else if (planName === 'pro') {
      return 'Choose from 1,400+ icons';
    } else if (planName === 'unlimited') {
      return 'Choose from 1,400+ icons or upload custom';
    }
    return 'Customize your extension';
  };

  // Handle open modal
  const handleOpenModal = async () => {
    // Check if user is logged in
    if (!session) {
      onShowLoginModal();
      return;
    }

    // Check if user has credits
    const permission = await canGenerateExtension(1);
    if (!permission.canGenerate) {
      if (permission.requiresUpgrade) {
        showUpgradePromptAction(permission.reason || 'Upgrade to customize extensions');
      } else {
        showUpgradePromptAction(permission.reason || 'Insufficient credits');
      }
      return;
    }

    // Open modal
    setShowCustomizeModal(true);
  };

  return (
    <>
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-white mb-4 text-center">
          Customize Extension
        </h3>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Icon Preview & Description */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-10 h-10 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">Custom Icon & Metadata</p>
                <p className="text-gray-400 text-sm">
                  {getTierMessage()}
                </p>
                {planName === 'free' && (
                  <div className="flex items-center gap-1 mt-1">
                    <Crown className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-400 text-xs">Upgrade to unlock icons</span>
                  </div>
                )}
              </div>
            </div>

            {/* Customize Button */}
            <button
              onClick={handleOpenModal}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center space-x-2 transition-colors shadow-lg hover:shadow-purple-500/50 w-full sm:w-auto justify-center"
            >
              <Palette className="w-5 h-5" />
              <span>Customize Extension</span>
              <span className="bg-purple-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                1 credit
              </span>
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Custom Icons</p>
                  <p className="text-gray-400 text-xs">
                    {planName === 'unlimited' ? 'Upload your own' : planName === 'pro' ? '1,400+ to choose' : 'Default icon'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Palette className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Edit Metadata</p>
                  <p className="text-gray-400 text-xs">Name, description, version</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Ready to Install</p>
                  <p className="text-gray-400 text-xs">Download customized ZIP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CustomizeExtensionModal
        isOpen={showCustomizeModal}
        onClose={() => setShowCustomizeModal(false)}
        extension={extension}
        extensionFiles={extensionFiles}
        session={session}
      />
    </>
  );
}

export default CustomizeExtensionSection;
