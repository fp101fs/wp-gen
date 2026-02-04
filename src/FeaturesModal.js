import React from 'react';
import { Code, Upload, Shield, X, GitBranch, Download, Eye, Zap, Globe, Users, Star, Clock, Sparkles, Share2 } from 'lucide-react';

function FeaturesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-6xl w-full relative border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Header */}
        <div className="text-center mb-8 pr-12">
          <h2 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Platform Features
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Everything you need to build, share, and maintain WordPress plugins with AI assistance
          </p>
        </div>

        {/* Core Features */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold text-white mb-6 text-center">🚀 Core Capabilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-lg rounded-xl p-6 border border-purple-300/30">
              <Code className="w-12 h-12 text-purple-400 mb-4 mx-auto" />
              <h4 className="text-xl font-semibold text-white mb-3 text-center">AI-Powered Generation</h4>
              <p className="text-gray-300 text-center">Advanced AI creates complete, functional WordPress plugins from natural language descriptions in seconds</p>
              <div className="mt-4 text-center">
                <span className="inline-block bg-purple-500/30 text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                  ✨ GPT-4o & Claude Sonnet
                </span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-xl p-6 border border-blue-300/30">
              <Upload className="w-12 h-12 text-blue-400 mb-4 mx-auto" />
              <h4 className="text-xl font-semibold text-white mb-3 text-center">Visual Design Upload</h4>
              <p className="text-gray-300 text-center">Upload mockups, wireframes, or designs and AI will create plugins that match your exact visual specifications</p>
              <div className="mt-4 text-center">
                <span className="inline-block bg-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                  🎨 Image-to-Code
                </span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-xl p-6 border border-green-300/30">
              <Shield className="w-12 h-12 text-green-400 mb-4 mx-auto" />
              <h4 className="text-xl font-semibold text-white mb-3 text-center">Production Ready</h4>
              <p className="text-gray-300 text-center">Generated plugins include proper headers, security practices, and WordPress.org compliance</p>
              <div className="mt-4 text-center">
                <span className="inline-block bg-green-500/30 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                  🛡️ Secure & Compliant
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Extension Management */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold text-white mb-6 text-center">🔧 Plugin Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20 text-center">
              <GitBranch className="w-8 h-8 text-orange-400 mb-3 mx-auto" />
              <h4 className="text-lg font-semibold text-white mb-2">Smart Revisions</h4>
              <p className="text-gray-300 text-sm">Iteratively improve extensions with revision prompts. Each change builds on previous versions.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20 text-center">
              <Download className="w-8 h-8 text-blue-400 mb-3 mx-auto" />
              <h4 className="text-lg font-semibold text-white mb-2">One-Click Download</h4>
              <p className="text-gray-300 text-sm">Download complete extension packages as ZIP files, ready for Chrome installation.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20 text-center">
              <Eye className="w-8 h-8 text-green-400 mb-3 mx-auto" />
              <h4 className="text-lg font-semibold text-white mb-2">Live Preview</h4>
              <p className="text-gray-300 text-sm">Preview extension interfaces before downloading. See exactly how your extension will look and behave.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20 text-center">
              <Zap className="w-8 h-8 text-yellow-400 mb-3 mx-auto" />
              <h4 className="text-lg font-semibold text-white mb-2">Instant Generation</h4>
              <p className="text-gray-300 text-sm">Most extensions generate in 10-30 seconds. From idea to working code in under a minute.</p>
            </div>
          </div>
        </div>

        {/* Community & Sharing */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold text-white mb-6 text-center">🌟 Community & Discovery</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 backdrop-blur-lg rounded-xl p-6 border border-pink-300/30">
              <div className="flex items-center mb-4">
                <Globe className="w-8 h-8 text-pink-400 mr-3" />
                <h4 className="text-xl font-semibold text-white">Public Gallery</h4>
              </div>
              <p className="text-gray-300 mb-4">Browse thousands of community-created extensions. Find inspiration and see what's possible.</p>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300 text-sm">Favorite and discover trending extensions</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl p-6 border border-indigo-300/30">
              <div className="flex items-center mb-4">
                <Users className="w-8 h-8 text-indigo-400 mr-3" />
                <h4 className="text-xl font-semibold text-white">Extension Sharing</h4>
              </div>
              <p className="text-gray-300 mb-4">Make your extensions public to share with the community or keep them private for personal use.</p>
              <div className="flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300 text-sm">Easy sharing with direct links</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Models & Performance */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 text-center">🤖 AI Models & Performance</h3>
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Sparkles className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-white mb-2">Multiple AI Models</h4>
                <p className="text-gray-300 text-sm mb-3">Choose from GPT-4o, Claude Sonnet 4, Gemini 2.5 Pro, and more</p>
                <span className="inline-block bg-yellow-500/30 text-yellow-300 px-2 py-1 rounded-full text-xs">
                  90%+ Success Rate
                </span>
              </div>
              
              <div className="text-center">
                <Clock className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-white mb-2">Credit Efficiency</h4>
                <p className="text-gray-300 text-sm mb-3">Most extensions built with just 1-2 credits. Minimal cost, maximum value</p>
                <span className="inline-block bg-blue-500/30 text-blue-300 px-2 py-1 rounded-full text-xs">
                  Average: 1.5 Credits
                </span>
              </div>
              
              <div className="text-center">
                <Zap className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-white mb-2">Lightning Fast</h4>
                <p className="text-gray-300 text-sm mb-3">Optimized infrastructure for rapid generation and deployment</p>
                <span className="inline-block bg-green-500/30 text-green-300 px-2 py-1 rounded-full text-xs">
                  10-30 Seconds
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-300/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">1000+</div>
              <div className="text-gray-400 text-sm">Extensions Created</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">90%+</div>
              <div className="text-gray-400 text-sm">Success Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">4</div>
              <div className="text-gray-400 text-sm">AI Models</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-gray-400 text-sm">Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeaturesModal;
