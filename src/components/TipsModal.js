import React from 'react';
import { X, Target, Edit3, RotateCcw, ExternalLink } from 'lucide-react';

const TipsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">WordPress Plugin Development Tips</h2>
              <p className="text-blue-100 text-sm">Master the art of AI-powered plugin development</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Golden Rule */}
          <div className="mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center">
                <span className="text-2xl mr-2">🎯</span>
                The Golden Rule: Start Simple, Refine with Revisions
              </h3>
              <p className="text-gray-300 font-medium mb-4">
                Most successful plugins are built iteratively, not all at once.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-900/30 border border-red-700/50 rounded p-4">
                  <h4 className="font-semibold text-red-300 mb-2">Don't Start Like This:</h4>
                  <div className="bg-red-900/50 p-3 rounded text-sm text-red-200 font-mono">
                    "Create a WordPress plugin with a custom post type for events, with a calendar view, email notifications, ticket purchasing, Stripe integration, and a settings page with multiple tabs."
                  </div>
                </div>

                <div className="bg-green-900/30 border border-green-700/50 rounded p-4">
                  <h4 className="font-semibold text-green-300 mb-2">Start Like This Instead:</h4>
                  <div className="space-y-2">
                    <div className="bg-green-900/50 p-2 rounded text-sm text-green-200 font-mono">
                      <strong>Step 1:</strong> "Create a plugin that adds a custom post type for events with date and location fields."
                    </div>
                    <div className="text-xs text-gray-400 text-center">Generate → Test → Then revise...</div>
                    <div className="bg-blue-900/50 p-2 rounded text-sm text-blue-200 font-mono">
                      <strong>Step 2:</strong> "Add a shortcode that displays upcoming events in a calendar grid."
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prompting Best Practices */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Edit3 className="w-5 h-5 mr-2" />
              Prompting Best Practices
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-5">
                <h4 className="text-lg font-semibold text-green-300 mb-3">DO</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• <strong>Be specific about the core function</strong></li>
                  <li>• <strong>Mention where the feature should appear</strong></li>
                  <li>• <strong>Use simple, clear language</strong></li>
                  <li>• <strong>Focus on ONE main feature initially</strong></li>
                  <li>• <strong>Specify admin vs frontend behavior</strong></li>
                </ul>
              </div>

              <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-5">
                <h4 className="text-lg font-semibold text-red-300 mb-3">DON'T</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• <strong>Cram multiple features in first prompt</strong></li>
                  <li>• <strong>Over-specify visual details initially</strong></li>
                  <li>• <strong>Use technical jargon unnecessarily</strong></li>
                  <li>• <strong>Request complex integrations upfront</strong></li>
                  <li>• <strong>Assume the AI knows your preferences</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Strategic Revisions */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <RotateCcw className="w-5 h-5 mr-2" />
              The Power of Strategic Revisions
            </h3>

            <p className="text-gray-400 mb-4">
              Think of revisions as <strong className="text-gray-200">guided conversations</strong> with your plugin. Each revision builds on what already works.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-blue-900/30 border border-blue-700/50 rounded p-4">
                  <h4 className="font-semibold text-blue-300 mb-2">UI Improvements</h4>
                  <div className="text-sm font-mono bg-blue-900/50 p-2 rounded text-blue-200">
                    "Make the settings page use tabs and add better spacing between form fields"
                  </div>
                </div>

                <div className="bg-purple-900/30 border border-purple-700/50 rounded p-4">
                  <h4 className="font-semibold text-purple-300 mb-2">Functionality Additions</h4>
                  <div className="text-sm font-mono bg-purple-900/50 p-2 rounded text-purple-200">
                    "Add email notifications when a new contact form submission is received"
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-orange-900/30 border border-orange-700/50 rounded p-4">
                  <h4 className="font-semibold text-orange-300 mb-2">Bug Fixes</h4>
                  <div className="text-sm font-mono bg-orange-900/50 p-2 rounded text-orange-200">
                    "Fix this error: [paste exact error from WordPress debug log]"
                  </div>
                </div>

                <div className="bg-green-900/30 border border-green-700/50 rounded p-4">
                  <h4 className="font-semibold text-green-300 mb-2">Feature Enhancements</h4>
                  <div className="text-sm font-mono bg-green-900/50 p-2 rounded text-green-200">
                    "Add a dashboard widget that shows the total count of testimonials"
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Proven Patterns */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Proven Plugin Patterns</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-800 border border-gray-700 rounded p-4">
                <h4 className="font-semibold text-white mb-2">1. Custom Post Types</h4>
                <p className="text-sm text-gray-400 mb-2">Plugins that add new content types to WordPress</p>
                <div className="text-xs font-mono bg-gray-800/50 p-2 rounded text-gray-300">
                  "Create a plugin that adds a testimonials post type with star rating and company fields"
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded p-4">
                <h4 className="font-semibold text-white mb-2">2. Admin Widgets</h4>
                <p className="text-sm text-gray-400 mb-2">Plugins that add dashboard widgets for quick info</p>
                <div className="text-xs font-mono bg-gray-800/50 p-2 rounded text-gray-300">
                  "Make a plugin that shows site statistics in a dashboard widget"
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded p-4">
                <h4 className="font-semibold text-white mb-2">3. Shortcodes</h4>
                <p className="text-sm text-gray-400 mb-2">Plugins that add embeddable content blocks</p>
                <div className="text-xs font-mono bg-gray-800/50 p-2 rounded text-gray-300">
                  "Create a shortcode that displays a pricing table with 3 tiers"
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded p-4">
                <h4 className="font-semibold text-white mb-2">4. Gutenberg Blocks</h4>
                <p className="text-sm text-gray-400 mb-2">Plugins that add custom blocks to the editor</p>
                <div className="text-xs font-mono bg-gray-800/50 p-2 rounded text-gray-300">
                  "Build a plugin that adds a call-to-action block with customizable colors"
                </div>
              </div>
            </div>
          </div>

          {/* Link to Full Article */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-300 mb-2">Want more detailed tips and examples?</p>
            <a
              href="/learn/tips"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium transition-colors"
              onClick={onClose}
            >
              Read the Complete Development Tips Guide
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipsModal;
