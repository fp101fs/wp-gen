import React, { useState, useEffect } from 'react';
import Header from './Header';
import { useLocation, useNavigate } from 'react-router-dom';
import { Code, Upload, Shield, ArrowLeft, Download } from 'lucide-react';
import useDocumentTitle from './hooks/useDocumentTitle';

// Article Content Components
const GettingStartedArticle = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6 flex items-center">
      🚀 Getting Started
    </h1>
    <p className="text-lg text-gray-300 mb-8">This guide will walk you through the initial steps to get you up and running with the platform.</p>
    <div className="space-y-8 text-gray-400">
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">1</span>
          👤 Create an Account
        </h2>
        <p className="text-gray-300">The first step is to create an account. Click on the "Sign Up" button in the top right corner and fill out the required information. We use Google OAuth for secure and quick sign-up!</p>
      </div>
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">2</span>
          🏠 Explore the Dashboard
        </h2>
        <p className="text-gray-300">Once you are logged in, you will be redirected to your dashboard. The dashboard provides an overview of your activity and quick access to the main features of the platform.</p>
      </div>
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">3</span>
          ⚡ Get Your First Credits
        </h2>
        <p className="text-gray-300">Credits are required to use the platform's services. You can get your first credits by navigating to the "Pricing" page and selecting a plan that suits your needs. Free users get {parseInt(process.env.REACT_APP_FREE_PLAN_CREDITS) || 5} credits every month!</p>
      </div>
    </div>
  </div>
);

const UsingTokensArticle = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6 flex items-center">
      ⚡ How to Use Credits
    </h1>
    <p className="text-lg text-gray-300 mb-8">Credits are central to our platform. This guide explains how to acquire and use them effectively.</p>
    
    {/* Credit Overview */}
    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 mb-8 border border-yellow-300/30">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        💰 Credit System Overview
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">1</div>
          <div className="text-gray-300 text-sm">Credit per Extension</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">8-500</div>
          <div className="text-gray-300 text-sm">Monthly Allowance</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">90%+</div>
          <div className="text-gray-300 text-sm">Success Rate</div>
        </div>
      </div>
    </div>

    <div className="space-y-8 text-gray-400">
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">💳</span>
          Acquiring Credits
        </h2>
        <p className="text-gray-300 mb-4">You can acquire credits by purchasing them from the "Pricing" page. We offer various plans to suit your needs:</p>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span><strong>Free:</strong> 5 credits/month</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span><strong>Pro:</strong> 150 credits/month</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span><strong>Max:</strong> 500 credits/month</li>
        </ul>
      </div>
      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">⚡</span>
          Using Credits
        </h2>
        <p className="text-gray-300">Credits are automatically deducted from your balance when you use the platform's services. Different AI models may cost different amounts:</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-semibold text-white">Standard Models</div>
            <div className="text-blue-300">1 credit per generation</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-semibold text-white">Premium Models</div>
            <div className="text-purple-300">2-3 credits per generation</div>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">📊</span>
          Checking Your Balance
        </h2>
        <p className="text-gray-300">You can check your credit balance at any time in the top right corner of the page, next to your profile information. Your balance shows both current credits and monthly allowance.</p>
      </div>
    </div>
  </div>
);

const FeaturesArticle = () => {
  const stats = [
    { value: "1000+", label: "Extensions Created" },
    { value: "90%+", label: "Success Rate" },
    { value: "1-3", label: "Average Tokens" },
    { value: "30s", label: "Generation Time" }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Platform Features</h1>
      <p className="text-lg text-gray-300 mb-8">
        Discover the comprehensive suite of features that make Kromio AI the most powerful AI-driven Chrome extension development platform.
      </p>

      {/* Platform Stats */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-6 mb-10 border border-purple-300/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-300 text-sm md:text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Core AI Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-8 text-center">🚀 Core AI Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl p-8 text-center border border-purple-300/30">
            <Code className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-white mb-4">Multi-Model AI Generation</h3>
            <p className="text-gray-300 mb-4">Choose from GPT-4o, Claude Sonnet 4, Gemini 2.5 Pro, and more. Each model brings unique strengths to extension development.</p>
            <div className="space-y-2">
              <div className="bg-purple-500/30 text-purple-300 px-3 py-1 rounded-full text-sm font-medium inline-block">
                ✨ Natural Language Processing
              </div>
              <div className="bg-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-sm font-medium inline-block ml-2">
                🧠 Advanced Code Generation
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-8 text-center border border-blue-300/30">
            <Upload className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-white mb-4">Visual Design Intelligence</h3>
            <p className="text-gray-300 mb-4">Upload mockups, wireframes, or UI designs and our AI will generate pixel-perfect extensions that match your vision.</p>
            <div className="space-y-2">
              <div className="bg-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-sm font-medium inline-block">
                🎨 Image-to-Code
              </div>
              <div className="bg-cyan-500/30 text-cyan-300 px-3 py-1 rounded-full text-sm font-medium inline-block ml-2">
                📐 Layout Recognition
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-8 text-center border border-green-300/30">
            <Shield className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-white mb-4">Production-Ready Output</h3>
            <p className="text-gray-300 mb-4">Every generated extension includes proper manifest.json, security practices, and Chrome Web Store compliance.</p>
            <div className="space-y-2">
              <div className="bg-green-500/30 text-green-300 px-3 py-1 rounded-full text-sm font-medium inline-block">
                🛡️ Security Best Practices
              </div>
              <div className="bg-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full text-sm font-medium inline-block ml-2">
                ✅ Store Compliant
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Development Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-8 text-center">⚡ Development & Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800/50 rounded-xl p-6 text-center border border-gray-600/50">
            <ArrowLeft className="w-10 h-10 text-orange-400 mb-4 mx-auto rotate-180" />
            <h4 className="text-lg font-semibold text-white mb-3">Smart Revisions</h4>
            <p className="text-gray-300 text-sm">Iteratively improve extensions with intelligent revision prompts that build on previous versions.</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 text-center border border-gray-600/50">
            <Code className="w-10 h-10 text-blue-400 mb-4 mx-auto" />
            <h4 className="text-lg font-semibold text-white mb-3">Live Preview</h4>
            <p className="text-gray-300 text-sm">Preview extension interfaces in real-time before downloading. See exactly how your extension will look.</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 text-center border border-gray-600/50">
            <Upload className="w-10 h-10 text-green-400 mb-4 mx-auto rotate-180" />
            <h4 className="text-lg font-semibold text-white mb-3">One-Click Download</h4>
            <p className="text-gray-300 text-sm">Download complete extension packages as ZIP files, ready for immediate Chrome installation.</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 text-center border border-gray-600/50">
            <Shield className="w-10 h-10 text-purple-400 mb-4 mx-auto" />
            <h4 className="text-lg font-semibold text-white mb-3">Version Control</h4>
            <p className="text-gray-300 text-sm">Automatic versioning and revision history tracking for all your extensions and improvements.</p>
          </div>
        </div>
      </div>

      {/* Community Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-8 text-center">🌟 Community & Collaboration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-xl p-6 border border-pink-300/30">
            <div className="flex items-center mb-4">
              <Code className="w-8 h-8 text-pink-400 mr-3" />
              <h3 className="text-xl font-semibold text-white">Public Gallery</h3>
            </div>
            <p className="text-gray-300 mb-4">Browse thousands of community-created extensions. Discover innovative ideas, find inspiration, and see what's possible with AI-generated code.</p>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                <span className="text-gray-300 text-sm">Search and filter by category, functionality, or AI model</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-rose-400 rounded-full mr-3"></div>
                <span className="text-gray-300 text-sm">Star your favorites and track trending extensions</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                <span className="text-gray-300 text-sm">View source prompts and learn from successful generations</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl p-6 border border-indigo-300/30">
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-indigo-400 mr-3" />
              <h3 className="text-xl font-semibold text-white">Extension Sharing</h3>
            </div>
            <p className="text-gray-300 mb-4">Control your extension visibility and share your creations with the community. Build your reputation as a chrome extension developer.</p>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                <span className="text-gray-300 text-sm">Make extensions public or keep them private</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                <span className="text-gray-300 text-sm">Share direct links to your extensions</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                <span className="text-gray-300 text-sm">Build a portfolio of your AI-generated extensions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-8 text-center">🔧 Technical Capabilities</h2>
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-600">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Code className="w-5 h-5 mr-2 text-blue-400" />
                Supported Extensions Types
              </h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Popup Extensions</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Content Scripts</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Background Scripts</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Options Pages</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>New Tab Overrides</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>DevTools Panels</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-400" />
                Chrome APIs Supported
              </h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Storage API</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Tabs API</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Notifications</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Context Menus</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Bookmarks</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Web Navigation</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-purple-400" />
                File Types Generated
              </h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>manifest.json</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>HTML Templates</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>CSS Stylesheets</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>JavaScript Logic</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>Icon Assets</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>Installation Guides</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-8 mb-8 border border-green-300/30">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">⚡ Performance & Efficiency</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">🚀 Generation Speed</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex justify-between">
                <span>Simple Extensions:</span>
                <span className="text-green-300 font-semibold">10-15 seconds</span>
              </div>
              <div className="flex justify-between">
                <span>Complex Extensions:</span>
                <span className="text-yellow-300 font-semibold">20-30 seconds</span>
              </div>
              <div className="flex justify-between">
                <span>With Image Upload:</span>
                <span className="text-blue-300 font-semibold">25-40 seconds</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">💰 Token Efficiency</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex justify-between">
                <span>Average per Extension:</span>
                <span className="text-green-300 font-semibold">1.5 credits</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className="text-blue-300 font-semibold">90%+</span>
              </div>
              <div className="flex justify-between">
                <span>Revision Rate:</span>
                <span className="text-purple-300 font-semibold">~0.3 per extension</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-purple-500/20 rounded-xl p-8 border border-purple-300/30">
        <h2 className="text-2xl font-semibold text-white mb-4">Ready to Build Your Extension? 🚀</h2>
        <p className="text-gray-300 text-lg mb-6">
          Join thousands of developers who have already created amazing Chrome extensions with our AI-powered platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="bg-gray-800 px-4 py-2 rounded-lg">
            <span className="text-gray-300 text-sm">Start with our </span>
            <span className="text-green-300 font-semibold">Free Tier</span>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg">
            <span className="text-gray-300 text-sm">Most extensions use just </span>
            <span className="text-blue-300 font-semibold">1 Token</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQArticle = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
    <p className="text-lg text-gray-300 mb-8">Get quick answers to the most common questions about building Chrome extensions with AI.</p>
    
    <div className="space-y-8">
      {/* Basic Questions */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="mr-2">🚀</span>
          Getting Started
        </h2>
        
        <div className="space-y-4 text-gray-300">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">What is Kromio?</h3>
            <p>Kromio is an AI-powered Chrome extension builder that lets you create working extensions without writing code. Just describe your idea in plain English, and our AI generates all the files you need.</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Do I need coding skills?</h3>
            <p><strong>No!</strong> Kromio is designed for non-technical users. As one of our users said: <em>"My curse is a never-ending stream of amazing ideas but no tech skills"</em> - we built Kromio specifically for people like this.</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">How does it work?</h3>
            <p>Simple 3-step process: 1) Describe your extension idea, 2) AI generates the complete code, 3) Download and install to Chrome. Most extensions are created with just 1 credit!</p>
          </div>
        </div>
      </div>

      {/* Technical Questions */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="mr-2">🔧</span>
          Technical Questions
        </h2>
        
        <div className="space-y-4 text-gray-300">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Can I create extensions that make API calls?</h3>
            <p>Yes! You can create extensions that call external APIs. Here's an example prompt:</p>
            <div className="bg-gray-900 p-3 rounded mt-2 font-mono text-sm">
              "Create a Chrome extension that summarizes selected text. It should send the text to the OpenAI API and display the summary in a popup. Include proper API key handling."
            </div>
            <p className="mt-2">Pro tip: For local APIs, specify: "make POST requests to a local API at http://localhost:3000/api/chat"</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">What files do I get?</h3>
            <p>You get a complete Chrome extension with all necessary files: manifest.json, HTML, CSS, JavaScript, and any icons. You can see all individual files and their content before downloading.</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Can I modify the generated code?</h3>
            <p>Absolutely! All code is exportable and editable. Download the ZIP file and modify it however you want. This builds serious trust with developers who might extend the functionality later.</p>
          </div>
        </div>
      </div>

      {/* Usage & Workflow */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="mr-2">⚡</span>
          Usage & Workflow
        </h2>
        
        <div className="space-y-4 text-gray-300">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">When should I use "Revise" vs generating a new extension?</h3>
            <p><strong>Use Revise when:</strong> Your extension mostly works but needs tweaks, bug fixes, or additional features.</p>
            <p><strong>Generate new when:</strong> You want a completely different extension or starting fresh.</p>
            <p className="mt-2 text-yellow-300">💡 Pro tip: Revising is much more effective than generating a new extension with error text added to the prompt.</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Why is my extension taking forever to generate?</h3>
            <p>If generation seems stuck, try switching AI models. Claude Sonnet 4 typically works faster than Opus for most extension types. Complex extensions with multiple API calls may take longer.</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">How do I write effective prompts?</h3>
            <p>Be specific about:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>What the extension does</li>
              <li>Where the UI appears (popup, sidebar, content script)</li>
              <li>Any APIs you want to use</li>
              <li>Specific requirements (data storage, permissions, etc.)</li>
            </ul>
            <p className="mt-2">Example: "Create a price tracker that monitors Amazon product pages and sends notifications when prices drop below $50."</p>
          </div>
        </div>
      </div>

      {/* Pricing & Credits */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="mr-2">💳</span>
          Pricing & Credits
        </h2>
        
        <div className="space-y-4 text-gray-300">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">How much does it cost?</h3>
            <p>Free tier: 5 credits to try the platform. Pro: $12/month with 150 credits. Most extensions use just 1 credit, so you can build a lot!</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">What happens if I run out of credits?</h3>
            <p>You can upgrade to Pro for more credits, or wait for your monthly reset. All plans reset to their monthly credit allocation each billing period.</p>
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="mr-2">🎉</span>
          Success Stories
        </h2>
        
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-4">
          <p className="text-gray-200 italic">"Been manually updating my team's dashboard daily—this image-to-extension feature just automated it."</p>
          <p className="text-gray-400 text-sm mt-2">- ProductHunt user</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-900/50 to-teal-900/50 rounded-lg p-4">
          <p className="text-gray-200 italic">"This is absolutely amazing! As someone who doesn't know how to code, I'm really excited about the idea of creating my own Chrome extension."</p>
          <p className="text-gray-400 text-sm mt-2">- ProductHunt user</p>
        </div>
      </div>
    </div>
  </div>
);

const DevelopmentTipsArticle = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">Tips for Chrome Extension Development</h1>
    <p className="text-lg text-gray-300 mb-8">Master the art of AI-powered extension development with these proven strategies and pro tips.</p>
    
    <div className="space-y-8">
      {/* Core Philosophy */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="mr-2">🎯</span>
          The Golden Rule: Start Simple, Refine with Revisions
        </h2>
        
        <div className="text-gray-300 space-y-4">
          <p className="text-lg font-medium text-yellow-300">Most successful extensions are built iteratively, not all at once.</p>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">❌ Don't Start Like This:</h3>
            <div className="bg-gray-900 p-3 rounded font-mono text-sm text-red-200">
              "Create a Chrome extension with a blue button in the top right corner. The button should open a popup that shows Wikipedia analysis data including word count, reading time, and key topics. Also add settings for customizing colors and a notification system."
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">✅ Start Like This Instead:</h3>
            <div className="bg-green-900/30 p-3 rounded font-mono text-sm text-green-200 mb-3">
              <strong>Step 1 - Core Function:</strong><br/>
              "Make an extension that analyzes a Wikipedia page the user is currently viewing and shows the word count and reading time."
            </div>
            <div className="text-gray-400 text-sm mb-3">Generate → Test → Then click Revise...</div>
            <div className="bg-blue-900/30 p-3 rounded font-mono text-sm text-blue-200">
              <strong>Step 2 - Add UI:</strong><br/>
              "Add a blue button in the top right corner that displays this information in a clean popup."
            </div>
          </div>
        </div>
      </div>

      {/* Prompting Best Practices */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="mr-2">✍️</span>
          Prompting Best Practices
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-green-400 mb-3">DO ✅</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• <strong>Be specific about the core function</strong></li>
              <li>• <strong>Mention the target website/domain</strong></li>
              <li>• <strong>Use simple, clear language</strong></li>
              <li>• <strong>Focus on ONE main feature initially</strong></li>
              <li>• <strong>Specify WHERE the UI should appear</strong></li>
            </ul>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-red-400 mb-3">DON'T ❌</h3>
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

      {/* Revision Strategy */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="mr-2">🔄</span>
          The Power of Strategic Revisions
        </h2>
        
        <div className="space-y-4 text-gray-300">
          <p className="text-lg">Think of revisions as <strong>guided conversations</strong> with your extension. Each revision builds on what already works.</p>
          
          <div className="grid gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">🎨 UI Improvements</h3>
              <div className="text-sm font-mono bg-gray-900 p-2 rounded">
                "Make the popup wider and add better spacing between elements"
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">⚙️ Functionality Additions</h3>
              <div className="text-sm font-mono bg-gray-900 p-2 rounded">
                "Add a settings panel where users can choose which metrics to display"
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">🐛 Bug Fixes</h3>
              <div className="text-sm font-mono bg-gray-900 p-2 rounded">
                "Fix this error: [paste exact error from Chrome Extension Manager]"
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">🚀 Feature Enhancements</h3>
              <div className="text-sm font-mono bg-gray-900 p-2 rounded">
                "Add keyboard shortcut (Ctrl+K) to toggle the analysis display"
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Common Patterns That Work */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="mr-2">🏗️</span>
          Proven Extension Patterns
        </h2>
        
        <div className="grid gap-6">
          <div className="bg-gray-800 rounded-lg p-5">
            <h3 className="text-xl font-semibold text-white mb-3">1. Content Analyzers</h3>
            <p className="text-gray-300 mb-3">Extensions that read and analyze webpage content</p>
            <div className="bg-gray-900 p-3 rounded text-sm font-mono text-gray-300">
              <div className="text-green-400">Initial prompt:</div>
              "Create an extension that counts words on any webpage"
              <div className="text-blue-400 mt-2">Revision ideas:</div>
              • Add reading time estimation<br/>
              • Show text complexity score<br/>
              • Add export to PDF feature
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-5">
            <h3 className="text-xl font-semibold text-white mb-3">2. Data Scrapers</h3>
            <p className="text-gray-300 mb-3">Extensions that extract specific information</p>
            <div className="bg-gray-900 p-3 rounded text-sm font-mono text-gray-300">
              <div className="text-green-400">Initial prompt:</div>
              "Make an extension that finds all email addresses on a page"
              <div className="text-blue-400 mt-2">Revision ideas:</div>
              • Add copy-to-clipboard functionality<br/>
              • Filter out common domains<br/>
              • Export to CSV format
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-5">
            <h3 className="text-xl font-semibold text-white mb-3">3. Productivity Helpers</h3>
            <p className="text-gray-300 mb-3">Extensions that automate repetitive tasks</p>
            <div className="bg-gray-900 p-3 rounded text-sm font-mono text-gray-300">
              <div className="text-green-400">Initial prompt:</div>
              "Create an extension that auto-fills forms with saved data"
              <div className="text-blue-400 mt-2">Revision ideas:</div>
              • Add multiple profile support<br/>
              • Include field detection logic<br/>
              • Add data encryption
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-5">
            <h3 className="text-xl font-semibold text-white mb-3">4. Visual Enhancers</h3>
            <p className="text-gray-300 mb-3">Extensions that modify page appearance</p>
            <div className="bg-gray-900 p-3 rounded text-sm font-mono text-gray-300">
              <div className="text-green-400">Initial prompt:</div>
              "Make an extension that applies dark mode to any website"
              <div className="text-blue-400 mt-2">Revision ideas:</div>
              • Add custom color themes<br/>
              • Include website-specific rules<br/>
              • Add toggle button in toolbar
            </div>
          </div>
        </div>
      </div>

      {/* API Integration Tips */}
      <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="mr-2">🔗</span>
          API Integration Made Simple
        </h2>
        
        <div className="space-y-4 text-gray-300">
          <p>Want to connect to external services? Start with the core functionality, then add API features.</p>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">Step-by-Step API Integration:</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">1</span>
                <div>
                  <strong>Start basic:</strong> "Create an extension that shows selected text in a popup"
                </div>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">2</span>
                <div>
                  <strong>Add API call:</strong> "Connect to OpenAI API to summarize the selected text"
                </div>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">3</span>
                <div>
                  <strong>Enhance UI:</strong> "Add loading spinner and error handling"
                </div>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">4</span>
                <div>
                  <strong>Add features:</strong> "Include API key management in settings"
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testing Tips */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="mr-2">🧪</span>
          Testing & Iteration Tips
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-white mb-3">Quick Testing Checklist</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Test on target websites immediately</li>
              <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Check Chrome Extension Manager for errors</li>
              <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Try the extension on different page types</li>
              <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Test with different screen sizes</li>
              <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Verify all buttons and features work</li>
            </ul>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-white mb-3">When to Revise vs. Regenerate</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-blue-400 font-semibold">Revise when:</span>
                <ul className="text-gray-300 ml-2 mt-1">
                  <li>• Extension works but needs tweaks</li>
                  <li>• You have specific errors to fix</li>
                  <li>• Adding new features to existing extension</li>
                </ul>
              </div>
              <div>
                <span className="text-orange-400 font-semibold">Regenerate when:</span>
                <ul className="text-gray-300 ml-2 mt-1">
                  <li>• Completely different functionality needed</li>
                  <li>• Starting over with new approach</li>
                  <li>• Multiple revisions haven't worked</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Metrics */}
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-white">🎯 Success Metrics</h2>
        <div className="grid md:grid-cols-3 gap-4 text-gray-300">
          <div>
            <div className="text-3xl font-bold text-green-400">90%</div>
            <div className="text-sm">Extensions work on first try when following these tips</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400">2-3</div>
            <div className="text-sm">Average revisions needed to perfect an extension</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-400">1</div>
            <div className="text-sm">Credit used for most successful extensions</div>
          </div>
        </div>
        
        <div className="mt-6 text-gray-300">
          <p className="text-lg"><strong>Remember:</strong> The best extensions are built iteratively. Start simple, test early, revise strategically! 🚀</p>
        </div>
      </div>
    </div>
  </div>
);

const TroubleshootingArticle = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">Troubleshooting</h1>
    <p className="text-lg text-gray-300 mb-8">Extension not working as expected? Don't worry - most issues can be fixed quickly with these step-by-step solutions.</p>
    
    <div className="space-y-8">
      {/* Main Issue: Extension Not Working */}
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="mr-2">🚨</span>
          Extension Not Working or Doing Nothing?
        </h2>
        
        <p className="text-gray-300 mb-4">The most common issue is browser errors that prevent the extension from functioning. Here's how to find and fix them:</p>
        
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-white mb-3">Step 1: Open Chrome Extension Manager</h3>
          <div className="space-y-2 text-gray-300">
            <div className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">1</span>
              <div>
                <p>Open Google Chrome</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">2</span>
              <div>
                <p>Type <code className="bg-gray-700 px-2 py-1 rounded">chrome://extensions/</code> in your address bar and press Enter</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">3</span>
              <div>
                <p>Find your extension in the list (it should be at the top if you just installed it)</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-white mb-3">Step 2: Check for Errors</h3>
          <div className="space-y-2 text-gray-300">
            <div className="flex items-start">
              <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">1</span>
              <div>
                <p>Look for your extension's card in the extensions list</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">2</span>
              <div>
                <p>Click the <strong>"Errors"</strong> button (if you see one) - this shows exactly what's wrong</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">3</span>
              <div>
                <p>Copy the error text that appears - you'll need this for fixing the issue</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Step 3: Fix with Revise Feature ⚡</h3>
          <div className="space-y-3 text-gray-300">
            <p className="font-semibold text-yellow-300">💡 This is much more effective than generating a new extension!</p>
            <div className="flex items-start">
              <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">1</span>
              <div>
                <p>Go back to plugin.new and find your extension in "My Plugins"</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">2</span>
              <div>
                <p>Click on your extension to view the detail page</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">3</span>
              <div>
                <p>Click the <strong>"Revise"</strong> button</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">4</span>
              <div>
                <p>In the revision prompt, type something like:</p>
                <div className="bg-gray-900 p-3 rounded mt-2 font-mono text-sm">
                  "Fix this error: [paste the error text from Chrome Extension Manager here]"
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">5</span>
              <div>
                <p>Generate the revision, download the updated ZIP, and reinstall</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Other Common Issues */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="mr-2">🔧</span>
          Other Common Issues
        </h2>
        
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Extension Icon Not Visible</h3>
            <p className="text-gray-300 mb-2">If you can't see your extension icon in Chrome's toolbar:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Click the puzzle piece icon (🧩) in Chrome's toolbar</li>
              <li>Find your extension and click the pin icon (📌) next to it</li>
              <li>Your extension will now appear directly in the toolbar</li>
            </ul>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Extension Won't Install</h3>
            <p className="text-gray-300 mb-2">If you get "Manifest file is missing or unreadable":</p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Make sure you extracted the ZIP file completely</li>
              <li>Select the FOLDER (not the ZIP file) when loading unpacked</li>
              <li>Ensure Developer Mode is turned ON in Chrome extensions</li>
              <li>Try downloading and extracting the ZIP again</li>
            </ul>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Extension Generation Taking Forever</h3>
            <p className="text-gray-300 mb-2">If your extension seems stuck generating:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Switch to Claude Sonnet 4 (usually faster than Opus)</li>
              <li>Simplify your prompt - try breaking complex extensions into smaller parts</li>
              <li>Refresh the page and try again</li>
              <li>Avoid extremely complex prompts with multiple APIs</li>
            </ul>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Credit/Token Balance Not Updating</h3>
            <p className="text-gray-300 mb-2">If your credits aren't updating after purchase:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Refresh the page and wait a few seconds</li>
              <li>Log out and log back into your account</li>
              <li>Check your email for purchase confirmation</li>
              <li>Clear your browser cache and cookies for Kromio.ai</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Success Tips */}
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="mr-2">✅</span>
          Pro Tips for Success
        </h2>
        
        <div className="space-y-3 text-gray-300">
          <div className="flex items-start">
            <span className="text-green-400 mr-2">•</span>
            <p><strong>Always use Revise for bug fixes</strong> - Much more effective than generating new with error text</p>
          </div>
          <div className="flex items-start">
            <span className="text-green-400 mr-2">•</span>
            <p><strong>Test immediately after install</strong> - Catch issues early when they're easier to fix</p>
          </div>
          <div className="flex items-start">
            <span className="text-green-400 mr-2">•</span>
            <p><strong>Be specific in revision prompts</strong> - Include exact error messages for best results</p>
          </div>
          <div className="flex items-start">
            <span className="text-green-400 mr-2">•</span>
            <p><strong>Keep extension ideas simple initially</strong> - You can always add features with revisions</p>
          </div>
        </div>
      </div>
      
      {/* Still Need Help */}
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold mb-2 text-white">Still Need Help?</h2>
        <p className="text-gray-300 mb-4">Can't solve your issue? We're here to help! Most problems can be resolved quickly.</p>
        <p className="text-gray-400">Contact support with your error details and we'll get you back on track.</p>
      </div>
    </div>
  </div>
);

const QuickStartArticle = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">Quick Start</h1>
    <p className="text-lg text-gray-300 mb-8">Get up and running with Kromio AI in just 3 simple steps. From idea to Chrome extension in seconds.</p>
    
    <div className="max-w-4xl mx-auto mb-8">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8 mb-8">
        <div className="relative group cursor-default">
          <h3 className="text-white font-semibold text-lg flex items-center">
            <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
              1
            </span>
            Describe Your Idea
          </h3>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            Tell our AI what you want your extension to do
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
        
        <div className="text-gray-400 hidden sm:block">→</div>
        
        <div className="relative group cursor-default">
          <h3 className="text-white font-semibold text-lg flex items-center">
            <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
              2
            </span>
            Generate Instantly
          </h3>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            Watch as your extension is built in seconds
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
        
        <div className="text-gray-400 hidden sm:block">→</div>
        
        <div className="relative group cursor-default">
          <h3 className="text-white font-semibold text-lg flex items-center">
            <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
              3
            </span>
            Download & Revise
          </h3>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            Get your extension and make changes anytime
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      </div>
    </div>

    <div className="space-y-6 text-gray-400">
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white">Step 1: Describe Your Idea</h2>
        <p className="mb-4">Start by describing what you want your Chrome extension to do. Be as specific or as general as you like - our AI understands both simple and complex requests.</p>
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <p className="text-gray-300 italic">Example: "Create a focus timer that blocks distracting websites for 25-minute work sessions"</p>
        </div>
        <p><strong>Pro tip:</strong> You can also upload an image or mockup to show exactly how you want your extension to look!</p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white">Step 2: Generate Instantly</h2>
        <p className="mb-4">Click the generate button and watch as our AI creates your complete Chrome extension. The process typically takes 10-30 seconds depending on complexity.</p>
        <p>During generation, you'll see a live preview of your extension being built, including all the necessary files like manifest.json, popup.html, and JavaScript files.</p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white">Step 3: Download & Revise</h2>
        <p className="mb-4">Once generation is complete, you can immediately download your extension as a ZIP file and install it in Chrome. But that's not all - you can also make revisions!</p>
        <p>Not happy with something? Simply describe what you'd like to change and generate a new version. All your extensions are saved to your account for easy access later.</p>
      </div>
    </div>
  </div>
);

const PrivacyArticle = () => (
    <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="bg-blue-500/20 border border-blue-300/30 rounded-lg p-4 mb-8">
            <p className="text-blue-200 text-sm">
                <strong>Last Updated:</strong> December 2024 | <strong>Effective Date:</strong> December 2024
            </p>
        </div>
        <p className="text-lg text-gray-300 mb-8">
            At Kromio AI, we are committed to protecting your privacy and ensuring transparency about how we collect, use, and safeguard your personal information. This Privacy Policy explains our practices regarding your data when you use our Chrome extension generation platform.
        </p>

        <div className="space-y-8 text-gray-400">
            <div>
                <h2 className="text-2xl font-semibold mb-4 text-white">1. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold mb-3 text-gray-200">Account Information</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Email address (for account creation and communication)</li>
                    <li>Username and profile information</li>
                    <li>Authentication data via Google OAuth</li>
                    <li>Subscription and payment information (processed securely via Stripe)</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-gray-200">Content You Create</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Extension prompts and descriptions you provide</li>
                    <li>Images and design files you upload</li>
                    <li>Generated extension code and files</li>
                    <li>Revision requests and feedback</li>
                    <li>Public extensions you choose to share with the community</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-gray-200">Usage Data</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Platform usage patterns and feature interactions</li>
                    <li>Token consumption and generation history</li>
                    <li>Error logs and performance metrics</li>
                    <li>Device information and browser data</li>
                    <li>IP address and location data (for security and analytics)</li>
                </ul>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4 text-white">2. How We Use Your Information</h2>
                
                <h3 className="text-xl font-semibold mb-3 text-gray-200">Core Platform Services</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Generate Chrome extensions based on your prompts and images</li>
                    <li>Provide personalized AI model recommendations</li>
                    <li>Store and manage your extension library</li>
                    <li>Process payments and manage subscriptions</li>
                    <li>Enable community features and extension sharing</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-gray-200">Platform Improvement</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Analyze usage patterns to improve AI generation quality</li>
                    <li>Optimize platform performance and reliability</li>
                    <li>Develop new features and capabilities</li>
                    <li>Conduct research to advance AI-powered development tools</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-gray-200">Communication</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Send important account and service updates</li>
                    <li>Provide customer support and technical assistance</li>
                    <li>Share new features and platform improvements (opt-out available)</li>
                    <li>Respond to your inquiries and feedback</li>
                </ul>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4 text-white">3. Information Sharing and Disclosure</h2>
                
                <div className="bg-red-500/20 border border-red-300/30 rounded-lg p-4 mb-4">
                    <p className="text-red-200 font-semibold">
                        🛡️ We do not sell your personal data. We only share information in the limited circumstances outlined below.
                    </p>
                </div>

                <h3 className="text-xl font-semibold mb-3 text-gray-200">With Your Consent</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Extensions you mark as "public" are visible in our community gallery</li>
                    <li>Profile information you choose to make public</li>
                    <li>When you explicitly authorize data sharing</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-gray-200">Service Providers</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li><strong>Supabase:</strong> Database and authentication services</li>
                    <li><strong>Stripe:</strong> Payment processing and subscription management</li>
                    <li><strong>AI Providers:</strong> OpenAI, Anthropic, Google (for extension generation)</li>
                    <li><strong>Vercel:</strong> Hosting and content delivery</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-gray-200">Legal Requirements</h3>
                <p className="mb-4">We may disclose information if required by law, court order, or to:</p>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Comply with legal processes and government requests</li>
                    <li>Protect our rights, property, or safety</li>
                    <li>Prevent fraud or security threats</li>
                    <li>Enforce our Terms of Service</li>
                </ul>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4 text-white">4. Data Security and Protection</h2>
                
                <h3 className="text-xl font-semibold mb-3 text-gray-200">Security Measures</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Industry-standard encryption for data in transit and at rest</li>
                    <li>Secure authentication via Google OAuth 2.0</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Access controls and employee training on data protection</li>
                    <li>Automated backup systems and disaster recovery procedures</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-gray-200">Data Retention</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Account data: Retained while your account is active</li>
                    <li>Extension data: Stored indefinitely unless you delete them</li>
                    <li>Usage analytics: Aggregated data retained for 24 months</li>
                    <li>Support communications: Retained for 3 years</li>
                </ul>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4 text-white">5. Your Privacy Rights</h2>
                
                <h3 className="text-xl font-semibold mb-3 text-gray-200">Access and Control</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li><strong>Access:</strong> View and download your personal data</li>
                    <li><strong>Update:</strong> Modify your account information and preferences</li>
                    <li><strong>Delete:</strong> Remove specific extensions or your entire account</li>
                    <li><strong>Export:</strong> Download your extension code and data</li>
                    <li><strong>Privacy Settings:</strong> Control extension visibility and data sharing</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-gray-200">For EU/UK Residents (GDPR)</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Right to be informed about data processing</li>
                    <li>Right to access your personal data</li>
                    <li>Right to rectification and erasure</li>
                    <li>Right to restrict processing</li>
                    <li>Right to data portability</li>
                    <li>Right to object to processing</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-gray-200">For California Residents (CCPA)</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Right to know what personal information is collected</li>
                    <li>Right to delete personal information</li>
                    <li>Right to opt-out of sale (we don't sell data)</li>
                    <li>Right to non-discrimination for exercising privacy rights</li>
                </ul>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4 text-white">6. Cookies and Tracking</h2>
                
                <h3 className="text-xl font-semibold mb-3 text-gray-200">Essential Cookies</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Authentication and session management</li>
                    <li>Security and fraud prevention</li>
                    <li>Core platform functionality</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-gray-200">Analytics and Performance</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Usage analytics to improve our service</li>
                    <li>Error tracking and performance monitoring</li>
                    <li>Feature usage and user experience optimization</li>
                </ul>

                <p className="text-sm bg-gray-800 p-3 rounded">
                    You can control cookies through your browser settings. Note that disabling essential cookies may affect platform functionality.
                </p>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4 text-white">7. Children's Privacy</h2>
                <p className="mb-4">
                    Our service is not intended for children under 13 (or 16 in the EU). We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child without proper consent, we will delete it promptly.
                </p>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4 text-white">8. International Data Transfers</h2>
                <p className="mb-4">
                    Our services are operated from the United States. If you're located outside the US, your information may be transferred to and processed in the US. We implement appropriate safeguards to protect your data during international transfers, including:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Standard Contractual Clauses with our service providers</li>
                    <li>Privacy Shield framework compliance where applicable</li>
                    <li>Adequacy decisions for certain jurisdictions</li>
                </ul>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4 text-white">9. Changes to This Policy</h2>
                <p className="mb-4">
                    We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Notify you of material changes via email or platform notice</li>
                    <li>Update the "Last Updated" date at the top of this policy</li>
                    <li>Provide a summary of key changes when significant updates occur</li>
                    <li>Give you opportunity to review changes before they take effect</li>
                </ul>
            </div>

            <div className="bg-blue-500/20 border border-blue-300/30 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-white">10. Contact Us</h2>
                <p className="mb-4 text-blue-200">
                    Questions about this Privacy Policy or how we handle your data? We're here to help:
                </p>
                <div className="space-y-2 text-blue-200">
                    <p><strong>Email:</strong> kromioai@proton.me</p>
                    <p><strong>Support:</strong> Available through our platform help system</p>
                    <p><strong>Data Protection Officer:</strong> kromioai@proton.me</p>
                    <p><strong>Mailing Address:</strong> Kromio AI, Privacy Department</p>
                </div>
                <p className="text-sm text-blue-300 mt-4">
                    We typically respond to privacy inquiries within 72 hours and will work to resolve any concerns promptly.
                </p>
            </div>
        </div>
    </div>
);

const TermsArticle = () => (
    <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <div className="bg-purple-500/20 border border-purple-300/30 rounded-lg p-4 mb-8">
            <p className="text-purple-200 text-sm">
                <strong>Last Updated:</strong> December 2024 | <strong>Effective Date:</strong> December 2024
            </p>
        </div>
        <p className="text-lg text-gray-300 mb-8">
            Welcome to Kromio AI. By using our Chrome extension generation platform, you agree to these Terms of Service. Please read them carefully.
        </p>
        <div className="space-y-8 text-gray-400">
            <div>
                <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
                <p className="mb-4">
                    By accessing, registering for, or using Kromio AI, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our service.
                </p>
                <p className="mb-4">
                    These terms constitute a legally binding agreement between you and Kromio AI. We may modify these terms at any time, and such modifications will be effective immediately upon posting.
                </p>
            </div>
            
            <div>
                <h2 className="text-2xl font-semibold mb-4 text-white">2. Description of Service</h2>
                <p className="mb-4">
                    Kromio AI is an AI-powered platform that generates Chrome browser extensions based on user prompts. Our service includes:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>AI-generated Chrome extension code</li>
                    <li>Extension testing and preview capabilities</li>
                    <li>Code download and distribution features</li>
                    <li>Extension revision and improvement tools</li>
                    <li>Community gallery and sharing features</li>
                </ul>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4 text-white">3. AI-Generated Content Disclaimer</h2>
                <div className="bg-yellow-500/20 border border-yellow-300/30 rounded-lg p-4 mb-4">
                    <p className="text-yellow-200 font-semibold mb-2">⚠️ Important: AI-Generated Code Risks</p>
                    <ul className="list-disc list-inside space-y-1 text-yellow-200 text-sm">
                        <li><strong>No Warranty:</strong> AI-generated extensions are provided "as is" without warranties of any kind</li>
                        <li><strong>Security Risks:</strong> Generated code may contain vulnerabilities or malicious patterns</li>
                        <li><strong>Functionality:</strong> Extensions may not work as expected or may break over time</li>
                        <li><strong>Compatibility:</strong> No guarantee of compatibility with future browser versions</li>
                    </ul>
                </div>
                <p className="mb-4">
                    <strong>User Responsibility:</strong> You are solely responsible for reviewing, testing, and validating any AI-generated code before use. You assume all risks associated with generated extensions.
                </p>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4 text-white">4. User Accounts and Conduct</h2>
                <h3 className="text-xl font-semibold mb-3 text-gray-200">Account Requirements</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>You must provide accurate and complete information</li>
                    <li>You are responsible for maintaining account security</li>
                    <li>One account per person or entity</li>
                    <li>Must be 13+ years old (16+ in EU)</li>
                </ul>
                
                <h3 className="text-xl font-semibold mb-3 text-gray-200">Prohibited Uses</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Generating malicious, harmful, or illegal extensions</li>
                    <li>Creating extensions that violate Chrome Web Store policies</li>
                    <li>Attempting to circumvent our security measures</li>
                    <li>Sharing accounts or transferring access</li>
                    <li>Using the service for competitive intelligence</li>
                </ul>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4 text-white">5. Intellectual Property Rights</h2>
                <h3 className="text-xl font-semibold mb-3 text-gray-200">Your Content</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>You retain ownership of prompts and descriptions you provide</li>
                    <li>You grant us license to use your prompts to generate extensions</li>
                    <li>Generated extensions are yours to use, modify, and distribute</li>
                </ul>
                
                <h3 className="text-xl font-semibold mb-3 text-gray-200">Our Platform</h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Kromio AI platform, technology, and AI models remain our property</li>
                    <li>You may not reverse engineer or copy our service</li>
                    <li>Our trademarks and branding are protected</li>
                </ul>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4 text-white">6. Credit System and Billing</h2>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li><strong>Credit Usage:</strong> Extension generation consumes credits based on complexity</li>
                    <li><strong>Billing:</strong> All sales are final unless required by law</li>
                    <li><strong>Refunds:</strong> Available within 30 days for unused credits only</li>
                    <li><strong>Fair Use:</strong> Excessive usage may result in account limitations</li>
                </ul>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4 text-white">7. Limitation of Liability</h2>
                <div className="bg-red-500/20 border border-red-300/30 rounded-lg p-4 mb-4">
                    <p className="text-red-200 font-semibold mb-2">🚨 Important Liability Limitations</p>
                    <p className="text-red-200 text-sm">
                        Kromio AI shall not be liable for any damages arising from your use of generated extensions, including but not limited to security breaches, data loss, system damage, or financial harm.
                    </p>
                </div>
                <p className="mb-4">
                    Our liability is limited to the amount you paid for the service in the 12 months preceding the claim. This limitation applies regardless of the legal theory of liability.
                </p>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4 text-white">8. Termination</h2>
                <p className="mb-4">
                    We may suspend or terminate your account at any time for violations of these terms. Upon termination:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-1">
                    <li>Your access to the service will be immediately revoked</li>
                    <li>Previously generated extensions remain yours to use</li>
                    <li>Unused credits may be refunded at our discretion</li>
                    <li>You must stop using our service and delete any downloaded materials</li>
                </ul>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4 text-white">9. Governing Law</h2>
                <p className="mb-4">
                    These terms are governed by the laws of the United States and the state where Kromio AI is incorporated, without regard to conflict of law principles.
                </p>
                <p className="mb-4">
                    Any disputes will be resolved through binding arbitration in accordance with the American Arbitration Association rules.
                </p>
            </div>

            <div className="bg-purple-500/20 border border-purple-300/30 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-white">10. Contact Information</h2>
                <p className="mb-4 text-purple-200">
                    Questions about these Terms of Service? Contact us:
                </p>
                <div className="space-y-2 text-purple-200">
                    <p><strong>Email:</strong> kromioai@proton.me</p>
                    <p><strong>Support:</strong> Available through our platform help system</p>
                    <p><strong>Legal Department:</strong> Kromio AI, Legal Department</p>
                </div>
                <p className="text-sm text-purple-300 mt-4">
                    We typically respond to legal inquiries within 5 business days.
                </p>
            </div>
        </div>
    </div>
);

const ExamplesArticle = () => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cx-gen.vercel.app';

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Real Extension Examples</h1>
      <p className="text-lg text-gray-300 mb-8">
        See what our users have built! These are real Chrome extensions created by the community using our platform. 
        Most were built with just 1 token, proving how powerful and efficient our AI system is! 🚀
      </p>

    {/* Stats Section */}
    <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-6 mb-8 border border-purple-300/30">
      <div className="flex flex-col sm:flex-row justify-around items-center text-center space-y-4 sm:space-y-0">
        <div>
          <div className="text-3xl font-bold text-white">29+</div>
          <div className="text-gray-300">Working Extensions</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-white">90%+</div>
          <div className="text-gray-300">Success Rate</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-white">1-3</div>
          <div className="text-gray-300">Tokens Average</div>
        </div>
      </div>
    </div>

    {/* Featured Extensions */}
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-6 text-white">✨ Featured Success Stories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600/50">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">📊</span>
            <h3 className="text-xl font-semibold text-white">Dashboard from Image</h3>
          </div>
          <p className="text-gray-300 mb-4">User uploaded a mockup image and our AI created a fully functional dashboard extension!</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="bg-green-600/30 text-green-300 px-3 py-1 rounded-full text-sm">✓ Working</span>
            </div>
            <div className="flex items-center justify-between">
              <a
                href={`${baseUrl}/extension/5a1ff154-726d-4e0b-9228-19063f368808`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                View Extension
              </a>
              <span className="text-purple-300 font-semibold">1 Token</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600/50">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">📸</span>
            <h3 className="text-xl font-semibold text-white">Screenshot Area Tool</h3>
          </div>
          <p className="text-gray-300 mb-4">Complete screenshot tool with area selection functionality. Refined through revisions to perfection.</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="bg-green-600/30 text-green-300 px-3 py-1 rounded-full text-sm">✓ Working</span>
            </div>
            <div className="flex items-center justify-between">
              <a
                href={`${baseUrl}/extension/913479a1-5e62-455b-b5c9-02ba834eed2b`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                View Extension
              </a>
              <span className="text-purple-300 font-semibold">3 Tokens</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600/50">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">🌙</span>
            <h3 className="text-xl font-semibold text-white">Universal Dark Mode</h3>
          </div>
          <p className="text-gray-300 mb-4">Toggle dark mode on any website with a single click. Works across all sites seamlessly!</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="bg-green-600/30 text-green-300 px-3 py-1 rounded-full text-sm">✓ Working</span>
            </div>
            <div className="flex items-center justify-between">
              <a
                href={`${baseUrl}/extension/744c6f48-e8be-48c8-8671-3c2bc4af5044`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                View Extension
              </a>
              <span className="text-purple-300 font-semibold">1 Token</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600/50">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">🍅</span>
            <h3 className="text-xl font-semibold text-white">Focus Timer</h3>
          </div>
          <p className="text-gray-300 mb-4">Pomodoro technique timer that helps maintain focus during work sessions. Perfect for productivity!</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="bg-green-600/30 text-green-300 px-3 py-1 rounded-full text-sm">✓ Working</span>
            </div>
            <div className="flex items-center justify-between">
              <a
                href={`${baseUrl}/extension/32df18b3-ac9e-4210-877c-93060cf25502`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                View Extension
              </a>
              <span className="text-purple-300 font-semibold">1 Token</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Extension Categories */}
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white">🎯 Productivity Tools</h2>
        <div className="space-y-3">
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="text-xl mr-3">⏱️</span>
                <span className="text-white">Tab Time Tracker</span>
              </div>
              <span className="bg-green-600/30 text-green-300 px-2 py-1 rounded-full text-xs">✓ Working</span>
            </div>
            <div className="flex items-center justify-between">
              <a
                href={`${baseUrl}/extension/43cc9a5d-006b-4b97-b932-21efff0579fa`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              >
                View Extension
              </a>
              <span className="text-purple-300 text-sm">1 Token</span>
            </div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="text-xl mr-3">🔇</span>
                <span className="text-white">Auto Mute Other Tabs</span>
              </div>
              <span className="bg-green-600/30 text-green-300 px-2 py-1 rounded-full text-xs">✓ Working</span>
            </div>
            <div className="flex items-center justify-between">
              <a
                href={`${baseUrl}/extension/ce04cf2b-f7e5-4d3e-a079-23790a2603b1`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              >
                View Extension
              </a>
              <span className="text-purple-300 text-sm">1 Token</span>
            </div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="text-xl mr-3">💡</span>
                <span className="text-white">New Tab Inspirational Quotes</span>
              </div>
              <span className="bg-green-600/30 text-green-300 px-2 py-1 rounded-full text-xs">✓ Working</span>
            </div>
            <div className="flex items-center justify-between">
              <a
                href={`${baseUrl}/extension/32df18b3-ac9e-4210-877c-93060cf25502`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              >
                View Extension
              </a>
              <span className="text-purple-300 text-sm">1 Token</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white">🎨 UI/UX Enhancements</h2>
        <div className="space-y-3">
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="text-xl mr-3">⬆️</span>
                <span className="text-white">Scroll to Top Button</span>
              </div>
              <span className="bg-green-600/30 text-green-300 px-2 py-1 rounded-full text-xs">✓ Working</span>
            </div>
            <div className="flex items-center justify-between">
              <a
                href={`${baseUrl}/extension/bb244152-44e0-4b40-b293-76dc71950b6b`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              >
                View Extension
              </a>
              <span className="text-purple-300 text-sm">1 Token</span>
            </div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="text-xl mr-3">🎬</span>
                <span className="text-white">YouTube Customizer</span>
              </div>
              <span className="bg-green-600/30 text-green-300 px-2 py-1 rounded-full text-xs">✓ Working</span>
            </div>
            <div className="flex items-center justify-between">
              <a
                href={`${baseUrl}/extension/d54eb87e-1489-4524-be5c-6c509609171c`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              >
                View Extension
              </a>
              <span className="text-purple-300 text-sm">1 Token</span>
            </div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="text-xl mr-3">🎨</span>
                <span className="text-white">Animated Dashboard</span>
              </div>
              <span className="bg-green-600/30 text-green-300 px-2 py-1 rounded-full text-xs">✓ Working</span>
            </div>
            <div className="flex items-center justify-between">
              <a
                href={`${baseUrl}/extension/c52e7b0d-c4cc-4bcc-82df-c9c75083511d`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              >
                View Extension
              </a>
              <span className="text-purple-300 text-sm">2 Tokens</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white">🛠️ Utility Extensions</h2>
        <div className="space-y-3">
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="text-xl mr-3">📚</span>
                <span className="text-white">Dictionary Tool</span>
              </div>
              <span className="bg-green-600/30 text-green-300 px-2 py-1 rounded-full text-xs">✓ Working</span>
            </div>
            <div className="flex items-center justify-between">
              <a
                href={`${baseUrl}/extension/29ad2a16-c7d1-411f-ac41-fcea0a019dee`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              >
                View Extension
              </a>
              <span className="text-purple-300 text-sm">1 Token</span>
            </div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="text-xl mr-3">🔊</span>
                <span className="text-white">Text-to-Speech Reader</span>
              </div>
              <span className="bg-green-600/30 text-green-300 px-2 py-1 rounded-full text-xs">✓ Working</span>
            </div>
            <div className="flex items-center justify-between">
              <a
                href={`${baseUrl}/extension/ac241a4d-33d0-480e-97e7-8af6c82a214e`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              >
                View Extension
              </a>
              <span className="text-purple-300 text-sm">1 Token</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Token Efficiency Section */}
    <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 mt-8 border border-green-300/30">
      <h2 className="text-2xl font-semibold mb-4 text-white">💰 Credit Efficiency</h2>
      <div className="space-y-4 text-gray-300">
        <p>
          <strong className="text-white">Most extensions built with just 1 credit!</strong> Our AI is incredibly efficient at understanding your requirements and generating complete, working extensions.
        </p>
        <p>
          <strong className="text-white">Revisions when needed:</strong> Complex extensions like the screenshot tool used 3 credits total (1 original + 2 revisions) to achieve perfection.
        </p>
        <p>
          <strong className="text-white">High success rate:</strong> Over 90% of generated extensions work immediately upon installation in Chrome.
        </p>
      </div>
    </div>

    {/* Call to Action */}
    <div className="text-center mt-8 p-6 bg-purple-500/20 rounded-xl border border-purple-300/30">
      <h2 className="text-2xl font-semibold mb-4 text-white">Ready to Build Your Extension? 🚀</h2>
      <p className="text-gray-300 mb-4">
        Join thousands of developers who have already created amazing Chrome extensions with our platform!
      </p>
      <p className="text-sm text-gray-400">
        Start with our free tier and see how quickly you can turn your ideas into working extensions.
      </p>
    </div>
  </div>
);
};

const SubmissionWalkthroughArticle = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">📤 Chrome Web Store Submission Walkthrough</h1>
    <p className="text-lg text-gray-300 mb-8">
      Follow this detailed, step-by-step guide to submit your AI-generated extension to the Chrome Web Store. 
      This walkthrough shows you exactly what to expect and what to do at each step.
    </p>

    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
      <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
        📋 Before You Start
      </h3>
      <div className="space-y-2 text-blue-700">
        <p>✅ You have your extension ZIP file downloaded from Kromio AI</p>
        <p>✅ You have a Google account (same one you use for Gmail/YouTube)</p>
        <p>✅ You've read our <a href="/submit-guide" className="text-blue-600 underline hover:text-blue-800">Submit Guide</a> to prepare your information</p>
        <p>✅ You have a privacy policy URL ready (you can use: <code className="bg-blue-100 px-2 py-1 rounded">https://plugin.new/learn#privacy</code>)</p>
      </div>
    </div>

    <div className="space-y-8">
      
      {/* Step 1: Getting to the Developer Dashboard */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-6 border border-purple-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">1</span>
          🌐 Getting to the Chrome Web Store Developer Dashboard
        </h2>
        
        <div className="space-y-4 text-gray-300">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Open the Developer Dashboard</h3>
            <p className="mb-3">Go to: <code className="bg-gray-800 px-2 py-1 rounded text-green-300">https://chrome.google.com/webstore/developer/dashboard</code></p>
            <p>🔐 <strong>Sign in</strong> with your Google account when prompted.</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">First-time Setup (if needed)</h3>
            <p>If this is your first time:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
              <li>You'll see a welcome screen</li>
              <li>Accept the Chrome Web Store Developer Agreement</li>
              <li>Pay the one-time $5 developer registration fee</li>
              <li>This fee helps reduce spam and low-quality extensions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Step 2: Creating New Item */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">2</span>
          ➕ Creating Your New Extension Listing
        </h2>
        
        <div className="space-y-4 text-gray-300">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Click "New Item"</h3>
            <p>Look for the blue <strong>"New Item"</strong> button in the top-right corner of the dashboard and click it.</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Upload Your Extension</h3>
            <p className="mb-2">When the "Add New Item" popup appears:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>📁 <strong>Drag and drop</strong> your extension ZIP file onto the upload area</li>
              <li>OR click <strong>"Choose file"</strong> and select your ZIP file</li>
              <li>⏱️ Wait for the file to upload and process (usually takes 10-30 seconds)</li>
            </ul>
          </div>
          
          <div className="bg-yellow-500/20 border border-yellow-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-300 mb-2">⚠️ If Upload Fails</h3>
            <p className="text-yellow-200">Common issues and solutions:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-yellow-200 text-sm mt-2">
              <li><strong>File too large:</strong> Make sure your ZIP is under 128MB</li>
              <li><strong>Invalid manifest:</strong> Re-download from Kromio AI</li>
              <li><strong>Missing files:</strong> Ensure all required files are in the ZIP</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Step 3: Store Listing Screen */}
      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">3</span>
          🏪 The Store Listing Screen
        </h2>
        
        <div className="space-y-4 text-gray-300">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Navigation Overview</h3>
            <p className="mb-3">After upload, you'll see the main listing interface with:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-300">📋 Left Sidebar Menu:</h4>
                <ul className="text-sm space-y-1 mt-1">
                  <li>• Store listing (you start here)</li>
                  <li>• Privacy</li>
                  <li>• Distribution</li>
                  <li>• Test instructions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-300">📝 Main Content Area:</h4>
                <ul className="text-sm space-y-1 mt-1">
                  <li>• Product details form</li>
                  <li>• Image upload areas</li>
                  <li>• Preview of your listing</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">🎯 Store Listing - Product Details</h3>
            <p className="mb-3">Fill out these required fields:</p>
            <div className="space-y-3">
              <div className="border-l-4 border-red-400 pl-4">
                <h4 className="font-medium text-red-300">📛 Title (Required)</h4>
                <p className="text-sm">Your extension name (max 45 characters)</p>
                <p className="text-xs text-gray-400 italic">Example: "Comic Sansify 😂"</p>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <h4 className="font-medium text-red-300">📝 Summary (Required)</h4>
                <p className="text-sm">One-sentence description (max 132 characters)</p>
                <p className="text-xs text-gray-400 italic">Example: "Replaces all website fonts with Comic Sans"</p>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <h4 className="font-medium text-red-300">📖 Description (Required)</h4>
                <p className="text-sm">Detailed explanation of what your extension does and why people should install it</p>
              </div>
              <div className="border-l-4 border-yellow-400 pl-4">
                <h4 className="font-medium text-yellow-300">🏷️ Category (Helpful)</h4>
                <p className="text-sm">Choose the best category that describes your extension</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 4: Images and Assets */}
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">4</span>
          🖼️ Uploading Images and Visual Assets
        </h2>
        
        <div className="space-y-4 text-gray-300">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">📱 Store Icon (Required)</h3>
            <ul className="space-y-1 text-sm">
              <li>• Size: <strong>128x128 pixels</strong></li>
              <li>• Format: PNG or JPEG</li>
              <li>• This becomes your extension's profile picture</li>
              <li>• Drag and drop onto the "Store icon" upload area</li>
            </ul>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">📸 Screenshots (Required - At least 1)</h3>
            <ul className="space-y-1 text-sm">
              <li>• Size: <strong>1280x800</strong> or <strong>640x400</strong> pixels</li>
              <li>• Format: JPEG or 24-bit PNG (no transparency)</li>
              <li>• Maximum: 5 screenshots</li>
              <li>• Show your extension in action - before/after photos work great!</li>
              <li>• Drag and drop into the "Screenshots" section</li>
            </ul>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">🎬 Promotional Video (Optional)</h3>
            <p className="text-sm">If you have a YouTube video showing your extension, paste the URL in the "Global promo video" field.</p>
          </div>

          <div className="bg-green-500/20 border border-green-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-green-300 mb-2">💡 Pro Tips for Great Images</h3>
            <ul className="list-disc list-inside space-y-1 text-green-200 text-sm">
              <li>Use clear, high-contrast images that show your extension's functionality</li>
              <li>Include before/after comparisons if applicable</li>
              <li>Add text overlays to explain what's happening in the screenshot</li>
              <li>Keep screenshots simple and uncluttered</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Step 5: Privacy Section */}
      <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl p-6 border border-red-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">5</span>
          🔒 Privacy Section - Building Trust
        </h2>
        
        <div className="space-y-4 text-gray-300">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">🎯 Single Purpose (Required)</h3>
            <p className="mb-2">Explain what your extension does in clear, simple terms:</p>
            <div className="bg-gray-800 p-3 rounded text-sm">
              <p className="text-green-300">Template: "My extension helps people [do what?] by [how does it help?]"</p>
              <p className="text-gray-400 mt-2 italic">Example: "My extension helps people make websites more fun by changing all fonts to Comic Sans, making serious content less intimidating."</p>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">📋 Permission Justification</h3>
            <p className="text-sm mb-2">You'll see a list of permissions your extension requests. For each one, explain WHY you need it:</p>
            <ul className="space-y-1 text-sm">
              <li>• <strong>activeTab:</strong> "To modify the current webpage the user is viewing"</li>
              <li>• <strong>scripting:</strong> "To inject CSS/JavaScript that changes fonts on websites"</li>
              <li>• Keep explanations simple and honest</li>
            </ul>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">🔐 Data Usage (Required)</h3>
            <p className="text-sm mb-2">Check all types of data your extension collects. For most simple extensions:</p>
            <div className="bg-green-800/30 p-3 rounded">
              <p className="text-green-200 text-sm">✅ <strong>Good news:</strong> Most font-changing, UI-modifying, or simple utility extensions don't collect ANY personal data! You can leave all boxes unchecked.</p>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">📄 Privacy Policy (Required)</h3>
            <p className="text-sm">Enter your privacy policy URL. You can use:</p>
            <code className="block bg-gray-800 p-2 rounded text-green-300 text-sm mt-2">https://plugin.new/learn#privacy</code>
          </div>
        </div>
      </div>

      {/* Step 6: Distribution */}
      <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl p-6 border border-indigo-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">6</span>
          🌍 Distribution Settings
        </h2>
        
        <div className="space-y-4 text-gray-300">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">💰 Payments</h3>
            <p className="text-sm mb-2">Choose your pricing model:</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✅</span>
                <span className="text-sm"><strong>Free of charge</strong> (Recommended for most extensions)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400">⚡</span>
                <span className="text-sm"><strong>Contains in-app purchases</strong> (If your extension offers paid features)</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">👁️ Visibility</h3>
            <p className="text-sm mb-2">Choose who can find your extension:</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">🌍</span>
                <span className="text-sm"><strong>Public</strong> - Everyone can find it (Recommended)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400">🔗</span>
                <span className="text-sm"><strong>Unlisted</strong> - Only people with the link</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">🔒</span>
                <span className="text-sm"><strong>Private</strong> - Only invited testers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 7: Test Instructions */}
      <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-xl p-6 border border-teal-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">7</span>
          🧪 Test Instructions
        </h2>
        
        <div className="space-y-4 text-gray-300">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">📝 Help Reviewers Test Your Extension</h3>
            <p className="text-sm mb-3">Write clear instructions for the Chrome Web Store review team:</p>
            <div className="bg-gray-800 p-3 rounded text-sm space-y-2">
              <p className="text-green-300">Example for a font-changing extension:</p>
              <p className="text-gray-300 italic">"Just install the extension and visit any website. The extension works automatically - all text will change to Comic Sans font. No login or setup required!"</p>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">🔑 Credentials (If Needed)</h3>
            <p className="text-sm">If your extension requires login or special setup, provide test credentials here. Most simple extensions won't need this.</p>
          </div>
        </div>
      </div>

      {/* Step 8: Final Submission */}
      <div className="bg-gradient-to-r from-green-500/20 to-lime-500/20 rounded-xl p-6 border border-green-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">8</span>
          🚀 Submit for Review
        </h2>
        
        <div className="space-y-4 text-gray-300">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">💾 Save Your Draft First</h3>
            <p className="text-sm">Before submitting, click the <strong>"Save Draft"</strong> button to save all your changes.</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">📋 Final Check</h3>
            <p className="text-sm mb-2">Make sure you have:</p>
            <ul className="space-y-1 text-sm">
              <li>✅ Title, summary, and description filled out</li>
              <li>✅ Store icon uploaded (128x128)</li>
              <li>✅ At least 1 screenshot uploaded</li>
              <li>✅ Single purpose explanation written</li>
              <li>✅ Privacy policy URL entered</li>
              <li>✅ Visibility and pricing settings chosen</li>
            </ul>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">🎯 Submit for Review</h3>
            <p className="text-sm mb-2">When everything is complete:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click the blue <strong>"Submit for Review"</strong> button</li>
              <li>If the button is grayed out, you're missing required information</li>
              <li>Review the submission summary and confirm</li>
              <li>Your extension enters the review queue!</li>
            </ol>
          </div>
          
          <div className="bg-green-500/20 border border-green-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-green-300 mb-2">⏰ What Happens Next?</h3>
            <ul className="space-y-1 text-green-200 text-sm">
              <li>📧 You'll receive email confirmation of submission</li>
              <li>⏳ Review typically takes 1-3 business days for new extensions</li>
              <li>🔍 Reviewers test your extension for functionality and policy compliance</li>
              <li>✅ If approved, your extension goes live in the Chrome Web Store!</li>
              <li>❌ If rejected, you'll get specific feedback on what to fix</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          🔧 Common Issues & Solutions
        </h2>
        
        <div className="space-y-4 text-gray-300">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">❌ "Submit for Review" Button is Grayed Out</h3>
            <p className="text-sm mb-2"><strong>Solution:</strong> You're missing required information. Check:</p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>Title and description are filled out</li>
              <li>Store icon is uploaded</li>
              <li>At least 1 screenshot is uploaded</li>
              <li>Single purpose is explained</li>
              <li>Privacy policy URL is entered</li>
            </ul>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">🚫 Extension Rejected</h3>
            <p className="text-sm mb-2">Don't worry! Common rejection reasons and fixes:</p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li><strong>Unclear purpose:</strong> Rewrite your single purpose explanation more clearly</li>
              <li><strong>Poor quality images:</strong> Upload higher resolution screenshots</li>
              <li><strong>Missing functionality:</strong> Test your extension thoroughly before resubmitting</li>
              <li><strong>Policy violations:</strong> Review Google's developer policies</li>
            </ul>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">📞 Need Help?</h3>
            <p className="text-sm">If you're stuck, check out our <a href="/submit-guide" className="text-blue-400 underline hover:text-blue-300">interactive Submit Guide</a> for detailed assistance with each field.</p>
          </div>
        </div>
      </div>

    </div>

    <div className="bg-green-100 border-2 border-green-300 rounded-xl p-6 mt-8 text-center">
      <div className="text-4xl mb-2">🎉</div>
      <h3 className="text-xl font-bold text-green-800 mb-2">Congratulations!</h3>
      <p className="text-green-700 mb-4">
        You now know exactly how to submit your AI-generated extension to the Chrome Web Store. 
        The process might seem complex at first, but following these steps will get you published successfully!
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a
          href="/submit-guide"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          📋 Use Our Interactive Guide
        </a>
        <a
          href="https://chrome.google.com/webstore/developer/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          🚀 Open Chrome Web Store Dashboard
        </a>
      </div>
    </div>
  </div>
);

// New SEO Article Components - Declarations
const PlasmoAlternativesArticle = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6 flex items-center">
      🔄 Best Plasmo Alternatives for Chrome Extension Development
    </h1>
    <p className="text-lg text-gray-300 mb-8">Looking for Plasmo alternatives? Discover the top browser extension development frameworks and tools, with Kromio leading as the #1 AI-powered no-code solution.</p>

    <div className="space-y-8 text-gray-400">
      {/* What is Plasmo */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          🧩 What is Plasmo?
        </h2>
        <p className="text-gray-300 mb-4">Plasmo is a popular framework for building browser extensions with modern web technologies. While powerful, many developers seek Plasmo alternatives due to:</p>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>Complex setup and configuration requirements</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>Steep learning curve for beginners</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>Need for extensive coding knowledge</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>Limited visual development tools</li>
        </ul>
      </div>

      {/* #1 Alternative: Kromio */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">1</span>
          🏆 Kromio AI - The #1 Plasmo Alternative
        </h2>
        <p className="text-gray-300 mb-4">Kromio revolutionizes Chrome extension development with AI-powered, no-code creation. Perfect for developers and non-developers alike.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">✨ Key Features</h3>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>• AI-powered extension generation</li>
              <li>• No coding required</li>
              <li>• Visual interface design</li>
              <li>• Instant deployment ready</li>
            </ul>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">🚀 Advantages over Plasmo</h3>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>• Zero setup time</li>
              <li>• Beginner-friendly</li>
              <li>• AI assistance throughout</li>
              <li>• Pre-built templates</li>
            </ul>
          </div>
        </div>
        <p className="text-green-300 font-medium">Best for: Rapid prototyping, no-code developers, AI-assisted development</p>
      </div>

      {/* Other Alternatives */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">2</span>
          🛠️ Other Chrome Extension Development Alternatives
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Extension CLI</h3>
            <p className="text-gray-300 text-sm mb-2">Command-line tool for extension scaffolding</p>
            <div className="flex gap-4">
              <span className="text-green-400 text-xs">✓ Fast setup</span>
              <span className="text-red-400 text-xs">✗ Requires coding</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Webpack Extension</h3>
            <p className="text-gray-300 text-sm mb-2">Custom Webpack configurations for extensions</p>
            <div className="flex gap-4">
              <span className="text-green-400 text-xs">✓ Highly customizable</span>
              <span className="text-red-400 text-xs">✗ Complex configuration</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Vanilla JavaScript</h3>
            <p className="text-gray-300 text-sm mb-2">Building extensions from scratch with pure JS</p>
            <div className="flex gap-4">
              <span className="text-green-400 text-xs">✓ Full control</span>
              <span className="text-red-400 text-xs">✗ Time-consuming</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-xl p-6 border border-indigo-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">📊 Plasmo vs Alternatives Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-2 text-white">Feature</th>
                <th className="text-center p-2 text-green-300">Kromio</th>
                <th className="text-center p-2 text-gray-300">Plasmo</th>
                <th className="text-center p-2 text-gray-300">Others</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-white/10">
                <td className="p-2">No Code Required</td>
                <td className="text-center p-2 text-green-400">✓</td>
                <td className="text-center p-2 text-red-400">✗</td>
                <td className="text-center p-2 text-red-400">✗</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-2">AI Assistance</td>
                <td className="text-center p-2 text-green-400">✓</td>
                <td className="text-center p-2 text-red-400">✗</td>
                <td className="text-center p-2 text-red-400">✗</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-2">Setup Time</td>
                <td className="text-center p-2 text-green-300">&lt; 5 min</td>
                <td className="text-center p-2 text-yellow-300">30+ min</td>
                <td className="text-center p-2 text-red-300">1+ hours</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-2">Beginner Friendly</td>
                <td className="text-center p-2 text-green-400">✓</td>
                <td className="text-center p-2 text-yellow-400">~</td>
                <td className="text-center p-2 text-red-400">✗</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Why Choose Alternative */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">🎯 When to Choose a Plasmo Alternative</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-white mb-3">Choose Kromio if you want:</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Rapid development with AI</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>No-code solution</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Quick prototyping</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Visual development</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Consider other alternatives for:</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Complex custom functionality</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Legacy code integration</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Specific framework requirements</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Enterprise-level customization</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const NoCodeChromeExtensionArticle = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6 flex items-center">
      🎨 No Code Chrome Extension Builder Guide
    </h1>
    <p className="text-lg text-gray-300 mb-8">Build powerful Chrome extensions without writing a single line of code. Discover how no-code tools like Kromio revolutionize browser extension development.</p>

    <div className="space-y-8 text-gray-400">
      {/* What is No-Code Development */}
      <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl p-6 border border-purple-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          🚀 What is No-Code Chrome Extension Development?
        </h2>
        <p className="text-gray-300 mb-4">No-code development allows you to create fully functional Chrome extensions using visual interfaces, drag-and-drop tools, and AI assistance instead of traditional programming.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">0</div>
            <div className="text-gray-300 text-sm">Lines of Code Required</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">5-10x</div>
            <div className="text-gray-300 text-sm">Faster Development</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">90%</div>
            <div className="text-gray-300 text-sm">Less Technical Complexity</div>
          </div>
        </div>
      </div>

      {/* Benefits of No-Code */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          ✨ Benefits of No-Code Extension Building
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-white mb-3">🎯 For Non-Developers</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>No programming knowledge needed</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Visual, intuitive interface</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Instant results and feedback</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Focus on functionality, not syntax</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">⚡ For Developers</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Rapid prototyping capabilities</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Skip boilerplate code setup</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Faster iteration cycles</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>More time for creative solutions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* How Kromio Works */}
      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          🛠️ How Kromio's No-Code Builder Works
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">1</span>
              <h3 className="font-semibold text-white">Describe Your Extension</h3>
            </div>
            <p className="text-gray-300 ml-11">Simply tell our AI what you want your extension to do in plain English. No technical jargon required.</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">2</span>
              <h3 className="font-semibold text-white">AI Generates Your Extension</h3>
            </div>
            <p className="text-gray-300 ml-11">Our AI creates the complete extension code, manifest, and assets based on your description.</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">3</span>
              <h3 className="font-semibold text-white">Customize and Deploy</h3>
            </div>
            <p className="text-gray-300 ml-11">Make visual adjustments, test your extension, and download the ready-to-publish package.</p>
          </div>
        </div>
      </div>

      {/* Extension Types */}
      <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-xl p-6 border border-pink-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">🎯 Types of Extensions You Can Build (No-Code)</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="bg-white/10 rounded-lg p-3">
              <h3 className="font-semibold text-white mb-1">🎨 UI Enhancers</h3>
              <p className="text-gray-300 text-sm">Dark mode toggles, custom themes, layout modifications</p>
            </div>

            <div className="bg-white/10 rounded-lg p-3">
              <h3 className="font-semibold text-white mb-1">📊 Productivity Tools</h3>
              <p className="text-gray-300 text-sm">Task managers, note-taking, time trackers</p>
            </div>

            <div className="bg-white/10 rounded-lg p-3">
              <h3 className="font-semibold text-white mb-1">🔧 Utility Extensions</h3>
              <p className="text-gray-300 text-sm">Password generators, QR code creators, calculators</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white/10 rounded-lg p-3">
              <h3 className="font-semibold text-white mb-1">📈 Analytics Tools</h3>
              <p className="text-gray-300 text-sm">Website analyzers, SEO checkers, performance monitors</p>
            </div>

            <div className="bg-white/10 rounded-lg p-3">
              <h3 className="font-semibold text-white mb-1">🔒 Privacy & Security</h3>
              <p className="text-gray-300 text-sm">Ad blockers, privacy tools, security scanners</p>
            </div>

            <div className="bg-white/10 rounded-lg p-3">
              <h3 className="font-semibold text-white mb-1">🎮 Entertainment</h3>
              <p className="text-gray-300 text-sm">Mini games, media players, content filters</p>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Guide */}
      <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl p-6 border border-indigo-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">📋 Step-by-Step No-Code Extension Creation</h2>

        <div className="space-y-6">
          <div className="border-l-4 border-blue-400 pl-4">
            <h3 className="font-semibold text-white mb-2">Phase 1: Planning</h3>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>• Define your extension's main purpose</li>
              <li>• Identify target users and use cases</li>
              <li>• Research similar extensions for inspiration</li>
              <li>• Write a clear, detailed description</li>
            </ul>
          </div>

          <div className="border-l-4 border-purple-400 pl-4">
            <h3 className="font-semibold text-white mb-2">Phase 2: Creation with Kromio</h3>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>• Sign up for Kromio account</li>
              <li>• Use AI to generate your extension</li>
              <li>• Review and customize the output</li>
              <li>• Test functionality in browser</li>
            </ul>
          </div>

          <div className="border-l-4 border-green-400 pl-4">
            <h3 className="font-semibold text-white mb-2">Phase 3: Launch</h3>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>• Download your extension package</li>
              <li>• Create Chrome Web Store listing</li>
              <li>• Submit for review and approval</li>
              <li>• Promote to your target audience</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">⚖️ No-Code vs Traditional Development</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-3 text-white">Aspect</th>
                <th className="text-center p-3 text-green-300">No-Code (Kromio)</th>
                <th className="text-center p-3 text-gray-300">Traditional Coding</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-white/10">
                <td className="p-3">Time to Build</td>
                <td className="text-center p-3 text-green-300">5-30 minutes</td>
                <td className="text-center p-3 text-yellow-300">Days to weeks</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-3">Learning Curve</td>
                <td className="text-center p-3 text-green-300">Minimal</td>
                <td className="text-center p-3 text-red-300">Steep</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-3">Technical Skills</td>
                <td className="text-center p-3 text-green-300">None required</td>
                <td className="text-center p-3 text-red-300">Extensive</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-3">Customization</td>
                <td className="text-center p-3 text-yellow-300">High (AI-assisted)</td>
                <td className="text-center p-3 text-green-300">Unlimited</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-3">Maintenance</td>
                <td className="text-center p-3 text-green-300">Automated</td>
                <td className="text-center p-3 text-yellow-300">Manual</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

const MonetizeChromeExtensionArticle = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6 flex items-center">
      💰 7 Proven Ways to Monetize a Chrome Extension
    </h1>
    <p className="text-lg text-gray-300 mb-8">Building a Chrome extension can be rewarding — but turning it into a source of income takes strategy. Here are the most effective (and policy-compliant) ways to monetize your Chrome extension in 2025.</p>

    <div className="space-y-8 text-gray-400">
      {/* 1. Freemium Model */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">1</span>
          💸 Freemium Model (Most Popular)
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">How it works:</h3>
            <p className="text-gray-300">Offer the core functionality of your extension for free, and charge for premium or "pro" features.</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">Monetization:</h3>
            <p className="text-gray-300 mb-3">You can use either a <strong>one-time payment</strong> or a <strong>recurring subscription</strong> to unlock advanced features such as:</p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Unlimited usage or advanced analytics</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Customization options (themes, integrations)</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Priority support or automation tools</li>
            </ul>
          </div>

          <div className="bg-green-500/20 border border-green-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-green-300 mb-2">Why it works:</h3>
            <p className="text-green-200 text-sm">This model attracts a large user base while giving power users an incentive to upgrade.<br/><em>Example:</em> Grammarly and LastPass both use this model successfully.</p>
          </div>
        </div>
      </div>

      {/* 2. Subscription Model */}
      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">2</span>
          🔁 Subscription or One-Time Payment
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">How it works:</h3>
            <p className="text-gray-300">Charge users either monthly, annually, or a single fee to access premium features.</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">Monetization:</h3>
            <p className="text-gray-300">This is ideal for extensions offering continuous value (subscriptions) or solving a one-time pain point (single payment).<br/><em>Example:</em> Productivity and SEO tools often charge subscriptions for ongoing access to data or automation.</p>
          </div>
        </div>
      </div>

      {/* 3. In-Extension Purchases */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">3</span>
          🧩 In-Extension Purchases
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">How it works:</h3>
            <p className="text-gray-300">Sell optional add-ons, extra content, or convenience upgrades directly inside your extension — such as templates, tools, or ad-free experiences.</p>
          </div>

          <div className="bg-purple-500/20 border border-purple-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-purple-300 mb-2">💡 Tip:</h3>
            <p className="text-purple-200 text-sm">Make sure these purchases are clearly optional and provide real value without degrading the free version.</p>
          </div>
        </div>
      </div>

      {/* 4. Advertising & Sponsorships */}
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">4</span>
          📢 Advertising & Sponsorships
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">How it works:</h3>
            <p className="text-gray-300">Integrate <strong>non-intrusive ads</strong> (e.g., static banners or sponsor messages) or partner with brands to display relevant promotions.</p>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-300 mb-3">Important Notes:</h3>
            <ul className="space-y-2 text-yellow-200 text-sm">
              <li className="flex items-center"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span><strong>Ad networks like Google AdSense are often prohibited</strong> inside Chrome extensions due to security and privacy policies.</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>Instead, use <strong>direct sponsorships or static, privacy-friendly ads</strong> that comply with Chrome Web Store guidelines.</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>Always prioritize <strong>user experience</strong> — intrusive or tracking-based ads can quickly lead to uninstalls or policy violations.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 5. Affiliate Marketing */}
      <div className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-xl p-6 border border-indigo-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">5</span>
          🔗 Affiliate Marketing / Referral Programs
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">How it works:</h3>
            <p className="text-gray-300">Include affiliate or referral links relevant to your extension's audience — for example, promoting products, tools, or services users already interact with.</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">Monetization:</h3>
            <p className="text-gray-300 mb-3">Earn commissions per click or sale through embedded links. This is especially effective for <strong>shopping</strong>, <strong>finance</strong>, or <strong>travel</strong>-related extensions.</p>
          </div>

          <div className="bg-indigo-500/20 border border-indigo-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-indigo-300 mb-2">💡 Tip:</h3>
            <p className="text-indigo-200 text-sm">Be transparent about affiliate links to maintain user trust and stay compliant with Chrome Web Store and FTC guidelines.</p>
          </div>
        </div>
      </div>

      {/* 6. Donations & Crowdfunding */}
      <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-xl p-6 border border-pink-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">6</span>
          🙌 Donations & Crowdfunding
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">How it works:</h3>
            <p className="text-gray-300 mb-3">Ask your community to support your work voluntarily. Add a simple donation button or link to platforms like:</p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center"><span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>Buy Me a Coffee</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>Patreon</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>PayPal.me</li>
            </ul>
          </div>

          <div className="bg-pink-500/20 border border-pink-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-pink-300 mb-2">Why it works:</h3>
            <p className="text-pink-200 text-sm">This method is <strong>non-intrusive</strong>, quick to set up, and works great for <strong>open-source</strong> or <strong>niche</strong> tools with loyal users.</p>
          </div>
        </div>
      </div>

      {/* 7. Merchandise & Services */}
      <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-xl p-6 border border-teal-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">7</span>
          🛍️ Merchandise, Services, or Premium Support
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">How it works:</h3>
            <p className="text-gray-300 mb-3">If your extension has a loyal following or a business focus, you can sell:</p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center"><span className="w-2 h-2 bg-teal-400 rounded-full mr-3"></span>Branded merchandise</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-teal-400 rounded-full mr-3"></span>Consulting or setup services</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-teal-400 rounded-full mr-3"></span>Premium technical support for teams</li>
            </ul>
            <p className="text-gray-300 mt-3">This approach is ideal for B2B tools or extensions that require expert configuration.</p>
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-xl p-6 border border-gray-400/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">🧠 Pro Tips for Monetization Success</h2>

        <ul className="space-y-3 text-gray-300">
          <li className="flex items-center"><span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span><strong>Keep UX clean:</strong> Avoid aggressive pop-ups or upsells that disrupt usage.</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span><strong>Test pricing:</strong> Experiment with different models to see what users actually value.</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span><strong>Track analytics:</strong> Use tools to monitor engagement, conversions, and retention.</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span><strong>Stay compliant:</strong> Always follow Chrome Web Store policies for ads, payments, and data usage.</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span><strong>Transparency builds trust:</strong> Let users know what data (if any) is used for monetization.</li>
        </ul>
      </div>

      {/* Quick Recap Table */}
      <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-xl p-6 border border-violet-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">⚙️ Quick Recap</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-violet-300/30">
                <th className="text-white font-semibold p-3">Method</th>
                <th className="text-white font-semibold p-3">Best For</th>
                <th className="text-white font-semibold p-3">Revenue Type</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-600/30">
                <td className="p-3">Freemium</td>
                <td className="p-3">General productivity tools</td>
                <td className="p-3">Free + Paid tiers</td>
              </tr>
              <tr className="border-b border-gray-600/30">
                <td className="p-3">Subscription / One-Time</td>
                <td className="p-3">Long-term or one-off tools</td>
                <td className="p-3">Recurring / upfront</td>
              </tr>
              <tr className="border-b border-gray-600/30">
                <td className="p-3">In-Extension Purchases</td>
                <td className="p-3">Add-ons / convenience tools</td>
                <td className="p-3">Per feature</td>
              </tr>
              <tr className="border-b border-gray-600/30">
                <td className="p-3">Sponsorships</td>
                <td className="p-3">High-engagement audiences</td>
                <td className="p-3">Partner fees</td>
              </tr>
              <tr className="border-b border-gray-600/30">
                <td className="p-3">Affiliate Marketing</td>
                <td className="p-3">Shopping / content tools</td>
                <td className="p-3">Commissions</td>
              </tr>
              <tr className="border-b border-gray-600/30">
                <td className="p-3">Donations</td>
                <td className="p-3">Open-source / niche projects</td>
                <td className="p-3">Voluntary</td>
              </tr>
              <tr>
                <td className="p-3">Merchandise / Services</td>
                <td className="p-3">Brand-driven tools</td>
                <td className="p-3">Product / consulting sales</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-violet-500/20 border border-violet-300/30 rounded-lg p-4">
          <h3 className="font-semibold text-violet-300 mb-2">Bottom line:</h3>
          <p className="text-violet-200 text-sm">Pick one or two monetization strategies that fit your extension's audience and purpose — and scale up once you've validated demand. Keep things simple, transparent, and user-friendly for the best results.</p>
        </div>
      </div>
    </div>
  </div>
);

const PaymentGatewaysArticle = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6 flex items-center">
      💳 Monetizing Chrome Extensions with Payment Gateways
    </h1>
    <p className="text-lg text-gray-300 mb-8">When it comes to monetizing your Chrome extension, integrating a payment gateway gives you far more flexibility than relying on ads. You can charge users directly for premium features, subscriptions, or one-time upgrades. Here are the simplest and most effective ways to do it.</p>

    <div className="space-y-8 text-gray-400">
      {/* 1. Stripe */}
      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">1</span>
          🟦 Stripe – Best for In-App Payments or Subscriptions
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-gray-300">Stripe is one of the most developer-friendly and widely used payment processors. It's ideal for handling <strong>one-time payments</strong> or <strong>recurring subscriptions</strong> within your web app or Chrome extension.</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">✅ Why Stripe?</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Works globally and supports most currencies</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Handles subscriptions, one-time charges, and free trials</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Integrates easily with web backends or hosted payment pages</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Secure and PCI-compliant</li>
            </ul>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">🧠 How to Set It Up (Simple Steps)</h3>
            <ol className="space-y-2 text-gray-300">
              <li className="flex items-start"><span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">1</span>Go to stripe.com and create an account.</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">2</span>From your dashboard, click <strong>Developers → API keys</strong> to get your test and live keys.</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">3</span>Create a <strong>Payment Link</strong> if you don't want to code anything — just share the link or open it in your extension's settings page.</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">4</span>(Optional) For deeper integration, use the Stripe Checkout or Billing API with your extension's backend.</li>
            </ol>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-300 mb-2">⚠️ Note:</h3>
            <p className="text-yellow-200 text-sm">Chrome extensions can't directly handle payments within the popup using Stripe.js due to security restrictions. Always route users to a <strong>secure hosted page</strong> or your <strong>external web app</strong>.</p>
          </div>

          <div className="bg-blue-500/20 border border-blue-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-blue-300 mb-2">💬 AI Prompt for Stripe Setup</h3>
            <p className="text-blue-200 text-sm italic">"Help me set up Stripe payments for my Chrome extension using a hosted checkout link (no custom server). Include steps and sample HTML code."</p>
          </div>
        </div>
      </div>

      {/* 2. Patreon */}
      <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl p-6 border border-red-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">2</span>
          🟥 Patreon – Best for Supporters, Fans, or Donations
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-gray-300">If your extension provides ongoing value (like productivity tools, privacy features, or creative utilities), <strong>Patreon</strong> can be a simple and friendly way to monetize. Instead of charging per feature, users support your project monthly.</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">✅ Why Patreon?</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>No code required</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>Perfect for recurring supporter-based revenue</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>Integrates easily with a link or button</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>Lets users feel like they're part of a community</li>
            </ul>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">🧠 How to Set It Up (Simple Steps)</h3>
            <ol className="space-y-2 text-gray-300">
              <li className="flex items-start"><span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">1</span>Go to patreon.com and create a creator account.</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">2</span>Set up your tiers (e.g. $3/month for Supporter, $10/month for Premium).</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">3</span>Copy your <strong>Patreon page link</strong>.</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">4</span>Add a "Support this extension" button or link inside your extension or on your site.</li>
            </ol>
          </div>

          <div className="bg-red-500/20 border border-red-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-red-300 mb-2">💡 Tip:</h3>
            <p className="text-red-200 text-sm">You can use the Chrome extension's Options page or popup to include a "❤️ Support on Patreon" button that opens your Patreon page in a new tab.</p>
          </div>

          <div className="bg-red-500/20 border border-red-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-red-300 mb-2">💬 AI Prompt for Patreon Setup</h3>
            <p className="text-red-200 text-sm italic">"Help me integrate a Patreon support button inside my Chrome extension popup that opens my Patreon page in a new tab."</p>
          </div>
        </div>
      </div>

      {/* 3. Gumroad */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">3</span>
          🟩 Gumroad – Best for One-Time Purchases or Licenses
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-gray-300"><strong>Gumroad</strong> is a no-code platform for selling digital goods — perfect for extensions that offer a <strong>paid upgrade</strong> or <strong>license key</strong>.</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">✅ Why Gumroad?</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>No backend required</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Offers license key management and delivery</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Simple payment links and embed codes</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Supports PayPal and credit cards</li>
            </ul>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">🧠 How to Set It Up (Simple Steps)</h3>
            <ol className="space-y-2 text-gray-300">
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">1</span>Create a Gumroad account at gumroad.com.</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">2</span>Add a new "Product" and set the price.</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">3</span>Enable <strong>License Keys</strong> if you want to distribute unique unlock codes.</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">4</span>Copy your Gumroad product link and include it inside your extension or website.</li>
            </ol>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-300 mb-2">⚠️ Note:</h3>
            <p className="text-yellow-200 text-sm">Google policy requires that <strong>all payments occur outside the Chrome Web Store</strong> if you're not using Google Payments.</p>
          </div>

          <div className="bg-green-500/20 border border-green-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-green-300 mb-2">💬 AI Prompt for Gumroad Setup</h3>
            <p className="text-green-200 text-sm italic">"Help me connect Gumroad with my Chrome extension so users can buy a license key and unlock premium features."</p>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-xl p-6 border border-purple-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">⚙️ Best Practices for Monetizing Chrome Extensions</h2>

        <ul className="space-y-3 text-gray-300">
          <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>✅ Always process payments <strong>externally</strong> (never directly inside the extension popup).</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>✅ Clearly explain what users get before they pay.</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>✅ Use a backend or hosted page if offering premium unlocks.</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>✅ Keep your free version valuable — use monetization as an enhancement, not a barrier.</li>
        </ul>
      </div>

      {/* Summary Table */}
      <div className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-xl p-6 border border-indigo-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">💡 Summary</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-indigo-300/30">
                <th className="text-white font-semibold p-3">Gateway</th>
                <th className="text-white font-semibold p-3">Type</th>
                <th className="text-white font-semibold p-3">Best For</th>
                <th className="text-white font-semibold p-3">Complexity</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-600/30">
                <td className="p-3"><strong>Stripe</strong></td>
                <td className="p-3">Subscription / One-time</td>
                <td className="p-3">Premium feature unlocks</td>
                <td className="p-3">⭐⭐</td>
              </tr>
              <tr className="border-b border-gray-600/30">
                <td className="p-3"><strong>Patreon</strong></td>
                <td className="p-3">Donations / Support</td>
                <td className="p-3">Community-driven tools</td>
                <td className="p-3">⭐</td>
              </tr>
              <tr>
                <td className="p-3"><strong>Gumroad</strong></td>
                <td className="p-3">One-time purchase</td>
                <td className="p-3">Paid upgrades & licenses</td>
                <td className="p-3">⭐</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-indigo-500/20 border border-indigo-300/30 rounded-lg p-4">
          <p className="text-indigo-200 text-sm">Choose the one that best matches your extension's audience and goals — then start turning your users into supporters and paying customers!</p>
        </div>
      </div>
    </div>
  </div>
);

const SubmitWebStoreArticle = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6 flex items-center">
      🏪 How to Submit Your Extension to Chrome Web Store
    </h1>
    <p className="text-lg text-gray-300 mb-8">Complete step-by-step guide to publishing your Chrome extension on the Chrome Web Store. Learn the submission process, requirements, and approval tips.</p>

    <div className="space-y-8 text-gray-400">
      {/* Prerequisites */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          📋 Before You Submit
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">✅ Required Items</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Extension ZIP package</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Google Developer account ($5 fee)</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Extension icons (16x16, 48x48, 128x128)</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Privacy policy URL</li>
            </ul>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">📝 Store Listing Materials</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Extension name & description</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Screenshots (1280x800)</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Promotional images (440x280)</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Category selection</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Developer Account Setup */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">1</span>
          👤 Set Up Developer Account
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">🌐 Access Developer Dashboard</h3>
            <p className="text-gray-300 mb-2">Go to: <code className="bg-gray-800 px-2 py-1 rounded text-green-300">chrome.google.com/webstore/developer/dashboard</code></p>
            <p className="text-gray-300">Sign in with your Google account</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">💳 Pay Registration Fee</h3>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>• One-time $5 developer registration fee</li>
              <li>• Helps reduce spam and low-quality submissions</li>
              <li>• Payment via credit card or Google Pay</li>
              <li>• Account activated immediately after payment</li>
            </ul>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">📄 Accept Developer Agreement</h3>
            <p className="text-gray-300">Read and accept the Chrome Web Store Developer Program Policies</p>
          </div>
        </div>
      </div>

      {/* Upload Extension */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">2</span>
          📁 Upload Your Extension
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">➕ Create New Item</h3>
            <p className="text-gray-300">Click "New Item" button in the developer dashboard</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">📤 Upload ZIP File</h3>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>• Drag and drop your extension ZIP file</li>
              <li>• Maximum file size: 128MB</li>
              <li>• ZIP must contain manifest.json in root</li>
              <li>• All referenced files must be included</li>
            </ul>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-300 mb-2">⚠️ Common Upload Issues</h3>
            <ul className="space-y-1 text-yellow-200 text-sm">
              <li>• Invalid manifest.json format</li>
              <li>• Missing required permissions</li>
              <li>• Incorrect file structure</li>
              <li>• File size exceeds limit</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Store Listing */}
      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">3</span>
          🛍️ Create Store Listing
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">📝 Basic Information</h3>
              <ul className="space-y-1 text-gray-300 text-sm">
                <li>• Extension name (45 characters max)</li>
                <li>• Summary (132 characters max)</li>
                <li>• Detailed description (16,000 chars)</li>
                <li>• Category selection</li>
              </ul>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">🖼️ Visual Assets</h3>
              <ul className="space-y-1 text-gray-300 text-sm">
                <li>• Small icon: 16x16 pixels</li>
                <li>• Medium icon: 48x48 pixels</li>
                <li>• Large icon: 128x128 pixels</li>
                <li>• Screenshots: 1280x800 or 640x400</li>
              </ul>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">📱 Screenshots & Promotional Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div className="text-center">
                <div className="bg-gray-700 rounded p-2 mb-1">📸</div>
                <div className="text-xs text-gray-300">Screenshots (required)</div>
                <div className="text-xs text-gray-400">1-5 images</div>
              </div>
              <div className="text-center">
                <div className="bg-gray-700 rounded p-2 mb-1">🎨</div>
                <div className="text-xs text-gray-300">Promotional tile</div>
                <div className="text-xs text-gray-400">440x280 (optional)</div>
              </div>
              <div className="text-center">
                <div className="bg-gray-700 rounded p-2 mb-1">🏪</div>
                <div className="text-xs text-gray-300">Marquee promo</div>
                <div className="text-xs text-gray-400">1400x560 (optional)</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm">High-quality images improve conversion rates and user trust</p>
          </div>
        </div>
      </div>

      {/* Privacy & Permissions */}
      <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl p-6 border border-indigo-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">4</span>
          🔒 Privacy & Permissions
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">📋 Privacy Policy Requirements</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>Required if extension handles user data</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>Must be publicly accessible URL</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>Should explain data collection and usage</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Can use generator tools for basic policies</li>
            </ul>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">⚙️ Permission Justification</h3>
            <p className="text-gray-300 mb-2">Explain why your extension needs each permission:</p>
            <div className="text-sm text-gray-400">
              <p>• <strong>activeTab:</strong> "To interact with the current tab's content"</p>
              <p>• <strong>storage:</strong> "To save user preferences and settings"</p>
              <p>• <strong>tabs:</strong> "To open new tabs and manage tab switching"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submission & Review */}
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">5</span>
          🚀 Submit for Review
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">⏱️ Review Timeline</h3>
              <ul className="space-y-1 text-gray-300 text-sm">
                <li>• Initial review: 1-3 business days</li>
                <li>• Updates to existing: 1-2 business days</li>
                <li>• Complex extensions: Up to 7 days</li>
                <li>• Holiday periods may be longer</li>
              </ul>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">✅ Review Checklist</h3>
              <ul className="space-y-1 text-gray-300 text-sm">
                <li>• Functionality works as described</li>
                <li>• No policy violations</li>
                <li>• Permissions are appropriate</li>
                <li>• Quality and user experience</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-500/20 border border-green-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-green-300 mb-2">💡 Approval Tips</h3>
            <ul className="space-y-1 text-green-200 text-sm">
              <li>• Test thoroughly before submitting</li>
              <li>• Write clear, detailed descriptions</li>
              <li>• Use minimal necessary permissions</li>
              <li>• Follow Google's design guidelines</li>
              <li>• Respond quickly to reviewer feedback</li>
            </ul>
          </div>
        </div>
      </div>

      {/* After Approval */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">🎉 After Approval</h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">📈 Publishing & Promotion</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Extension goes live immediately after approval</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Share on social media and relevant communities</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Encourage users to leave reviews</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Monitor analytics and user feedback</li>
            </ul>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">🔄 Updates & Maintenance</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Regular updates maintain user engagement</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Bug fixes and new features improve ratings</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Respond to user reviews and feedback</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Monitor Chrome Web Store policies for changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const PatreonSetupArticle = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6 flex items-center">
      🚀 Patreon Serverless Setup Guide for Chrome Extensions
    </h1>
    <p className="text-lg text-gray-300 mb-8">This guide shows you how to deploy and configure a secure serverless function to check a user's Patreon status for your Chrome extension, using only a web browser.</p>

    <div className="space-y-8 text-gray-400">
      {/* Prerequisites */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">Prerequisites</h2>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>A <strong>Patreon Creator Account</strong> and an <strong>Application</strong> registered in the Patreon Developer Portal</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>A <strong>GitHub, GitLab, or Bitbucket</strong> account (to host your code)</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>A <strong>Vercel</strong> account (free tier is sufficient)</li>
        </ul>
      </div>

      {/* OAuth Flow Diagram */}
      <div className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-xl p-6 border border-indigo-300/30">
        <h3 className="text-xl font-semibold text-white mb-4">📋 Understanding the OAuth Flow:</h3>
        <div className="bg-white/10 rounded-lg p-4 font-mono text-sm text-gray-300 space-y-2">
          <div className="flex"><span className="text-blue-400 mr-3">1.</span>User clicks "Login with Patreon" in your extension</div>
          <div className="flex"><span className="text-blue-400 mr-3">2.</span>Extension launches Patreon OAuth authorization page</div>
          <div className="flex"><span className="text-blue-400 mr-3">3.</span>User authorizes your app on Patreon</div>
          <div className="flex"><span className="text-blue-400 mr-3">4.</span>Patreon redirects to your Vercel URL with authorization code</div>
          <div className="flex"><span className="text-blue-400 mr-3">5.</span><strong>Chrome intercepts</strong> this redirect BEFORE it reaches your server</div>
          <div className="flex"><span className="text-blue-400 mr-3">6.</span>Extension extracts the code from the intercepted URL</div>
          <div className="flex"><span className="text-blue-400 mr-3">7.</span>Extension POSTs code to your Vercel serverless function</div>
          <div className="flex"><span className="text-blue-400 mr-3">8.</span>Serverless function exchanges code for access token (CLIENT_SECRET stays secure)</div>
          <div className="flex"><span className="text-blue-400 mr-3">9.</span>Serverless function checks user's membership status with Patreon API</div>
          <div className="flex"><span className="text-blue-400 mr-3">10.</span>Serverless function returns result to extension</div>
          <div className="flex"><span className="text-blue-400 mr-3">11.</span>Extension displays access status to user</div>
        </div>
      </div>

      {/* Step 1 */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">1</span>
          Create the Project and Code Files on GitHub
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <ol className="space-y-2 text-gray-300">
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">1</span><strong>Create a New Repository</strong> on your Git provider (e.g., GitHub). Name it something descriptive, like <code className="bg-gray-800 px-2 py-1 rounded text-green-300">patreon-checker</code>.</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">2</span><strong>Create the Code File:</strong> In your new repository, click <strong>"Add file"</strong> → <strong>"Create new file"</strong> and type <code className="bg-gray-800 px-2 py-1 rounded text-green-300">api/patreon-check.js</code> in the filename field</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">3</span><strong>Paste the Serverless Code</strong> into the <code className="bg-gray-800 px-2 py-1 rounded text-green-300">api/patreon-check.js</code> file:</li>
            </ol>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-300"><code>{`// api/patreon-check.js

import fetch from 'node-fetch';

// Environment variables - these will be set securely in Vercel (Step 3)
const CLIENT_ID = process.env.PATREON_CLIENT_ID;
const CLIENT_SECRET = process.env.PATREON_CLIENT_SECRET;
const REDIRECT_URI = process.env.PATREON_REDIRECT_URI;

export default async (req, res) => {
  // Verify environment variables are configured
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    return res.status(500).json({
      status: 'error',
      message: 'Server configuration error: Missing environment variables.'
    });
  }

  // Only accept POST requests from the extension
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: 'Method Not Allowed'
    });
  }

  // Extract the authorization code and required tier ID from request
  const { code, requiredTierId } = req.body;

  if (!code || !requiredTierId) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required data: code or requiredTierId'
    });
  }

  try {
    // --- STEP A: Exchange Authorization Code for Access Token ---
    // This MUST happen on the server to keep CLIENT_SECRET secure
    const tokenResponse = await fetch('https://www.patreon.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Patreon Token Error:', error);
      return res.status(401).json({
        status: 'error',
        message: 'Failed to get access token from Patreon.',
        details: error
      });
    }

    const tokenData = await tokenResponse.json();
    const ACCESS_TOKEN = tokenData.access_token;

    // --- STEP B: Use Access Token to Fetch User's Membership Data ---
    const userMembershipUrl = new URL('https://www.patreon.com/api/oauth2/v2/identity');
    userMembershipUrl.searchParams.append('fields[user]', 'full_name');
    userMembershipUrl.searchParams.append('include', 'memberships');
    userMembershipUrl.searchParams.append('fields[member]', 'currently_entitled_tiers');

    const identityResponse = await fetch(userMembershipUrl.toString(), {
      headers: {
        'Authorization': \`Bearer \${ACCESS_TOKEN}\`,
      },
    });

    if (!identityResponse.ok) {
      const error = await identityResponse.json();
      console.error('Patreon Identity Error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch user data from Patreon.'
      });
    }

    const identityData = await identityResponse.json();

    // --- STEP C: Check if User is a Patron of the Required Tier ---
    let isPatron = false;
    const memberships = identityData.included || [];

    for (const item of memberships) {
      if (item.type === 'member') {
        const tiers = item.relationships?.currently_entitled_tiers?.data || [];
        if (tiers.some(tier => tier.id === requiredTierId)) {
          isPatron = true;
          break;
        }
      }
    }

    // --- STEP D: Return Result to Extension ---
    if (isPatron) {
      return res.status(200).json({
        status: 'success',
        message: 'Patron status confirmed.',
        isPatron: true,
        userName: identityData.data.attributes.full_name,
      });
    } else {
      return res.status(200).json({
        status: 'access_denied',
        message: 'User is not a patron of the required tier.',
        isPatron: false,
      });
    }

  } catch (error) {
    console.error('Server error during Patreon check:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred.',
      details: error.message
    });
  }
};`}</code></pre>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-gray-300"><strong>Commit the file</strong> (click the "Commit new file" button on GitHub).</p>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">2</span>
          Deploy to Vercel
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <ol className="space-y-2 text-gray-300">
              <li className="flex items-start"><span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">1</span><strong>Log in to Vercel</strong> at <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 underline">vercel.com</a></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">2</span>On the Vercel Dashboard, click <strong>"Add New"</strong> → <strong>"Project"</strong></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">3</span><strong>Import Git Repository:</strong> Connect Vercel to your Git provider (if needed), and select the <strong><code className="bg-gray-800 px-2 py-1 rounded text-purple-300">patreon-checker</code></strong> repository</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">4</span><strong>Deploy:</strong> Click the <strong>"Deploy"</strong> button. Vercel automatically recognizes the serverless function in the <code className="bg-gray-800 px-2 py-1 rounded text-purple-300">api</code> folder and deploys it</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">5</span><strong>Save the URL:</strong> After deployment, copy your Vercel URL (e.g., <code className="bg-gray-800 px-2 py-1 rounded text-purple-300">https://patreon-checker.vercel.app</code>) - you'll need it in the next steps</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-6 border border-red-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">3</span>
          Configure Secure Environment Variables
        </h2>

        <div className="bg-red-500/20 border border-red-300/30 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-red-300 mb-2">🔒 Security Critical:</h3>
          <p className="text-red-200 text-sm">Never put your CLIENT_SECRET in your code! These environment variables keep your secrets secure on the server.</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <ol className="space-y-2 text-gray-300">
              <li className="flex items-start"><span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">1</span>In the Vercel Dashboard, go to your deployed project</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">2</span>Click the <strong>"Settings"</strong> tab, then select <strong>"Environment Variables"</strong> from the left sidebar</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">3</span>Add the following three variables:</li>
            </ol>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-white/10 rounded-lg">
              <thead>
                <tr className="border-b border-red-300/30">
                  <th className="text-white font-semibold p-3">Variable Name</th>
                  <th className="text-white font-semibold p-3">Value</th>
                  <th className="text-white font-semibold p-3">Environments</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-600/30">
                  <td className="p-3"><code className="bg-gray-800 px-2 py-1 rounded text-red-300">PATREON_CLIENT_ID</code></td>
                  <td className="p-3">Your Patreon Client ID from the Developer Portal</td>
                  <td className="p-3">Production, Preview</td>
                </tr>
                <tr className="border-b border-gray-600/30">
                  <td className="p-3"><code className="bg-gray-800 px-2 py-1 rounded text-red-300">PATREON_CLIENT_SECRET</code></td>
                  <td className="p-3">Your Patreon Client Secret from the Developer Portal</td>
                  <td className="p-3">Production, Preview</td>
                </tr>
                <tr>
                  <td className="p-3"><code className="bg-gray-800 px-2 py-1 rounded text-red-300">PATREON_REDIRECT_URI</code></td>
                  <td className="p-3"><code className="bg-gray-800 px-2 py-1 rounded text-red-300">https://YOUR-VERCEL-URL.vercel.app/api/patreon-check</code></td>
                  <td className="p-3">Production, Preview</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-300 mb-2">💡 Example PATREON_REDIRECT_URI:</h3>
            <p className="text-yellow-200 text-sm">If your Vercel URL is <code className="bg-gray-800 px-2 py-1 rounded text-yellow-300">https://patreon-checker.vercel.app</code>, then set:<br />
            <code className="bg-gray-800 px-2 py-1 rounded text-yellow-300">https://patreon-checker.vercel.app/api/patreon-check</code></p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <ol className="space-y-2 text-gray-300" start="4">
              <li className="flex items-start"><span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">4</span>Click <strong>"Save"</strong> for each variable</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">5</span><strong>Redeploy:</strong> Go to <strong>"Deployments"</strong> tab, click the three dots on the latest deployment, and select <strong>"Redeploy"</strong></li>
            </ol>
          </div>
        </div>
      </div>

      {/* Step 4 */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">4</span>
          Configure Patreon Developer Portal
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <ol className="space-y-2 text-gray-300">
              <li className="flex items-start"><span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">1</span>Go to the <strong>Patreon Developer Portal</strong> at <a href="https://www.patreon.com/portal/registration/register-clients" target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:text-yellow-200 underline">patreon.com/portal</a></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">2</span>Open your application settings</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">3</span>In the <strong>"Redirect URIs"</strong> section, add the exact URI you set in Vercel: <code className="bg-gray-800 px-2 py-1 rounded text-yellow-300">https://YOUR-VERCEL-URL.vercel.app/api/patreon-check</code></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">4</span>Save the changes</li>
            </ol>
          </div>

          <div className="bg-red-500/20 border border-red-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-red-300 mb-2">⚠️ Important:</h3>
            <p className="text-red-200 text-sm">The redirect URI in Patreon must <em>exactly</em> match the <code className="bg-gray-800 px-2 py-1 rounded text-red-300">PATREON_REDIRECT_URI</code> environment variable in Vercel, including the protocol (https://) and path (/api/patreon-check).</p>
          </div>
        </div>
      </div>

      {/* Step 5: Chrome Extension Implementation */}
      <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-xl p-6 border border-teal-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">5</span>
          Implement in Your Chrome Extension
        </h2>

        <div className="space-y-6">
          {/* Manifest File */}
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">📄 Update the Manifest (<code className="bg-gray-800 px-2 py-1 rounded text-teal-300">manifest.json</code>)</h3>

            <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto mb-4">
              <pre className="text-sm text-gray-300"><code>{`{
  "manifest_version": 3,
  "name": "Patreon Checker Extension",
  "version": "1.0",
  "description": "Check Patreon membership status",
  "permissions": [
    "identity"
  ],
  "host_permissions": [
    "https://YOUR-VERCEL-URL.vercel.app/*"
  ],
  "action": {
    "default_popup": "popup.html"
  }
}`}</code></pre>
            </div>

            <div className="bg-blue-500/20 border border-blue-300/30 rounded-lg p-4">
              <h4 className="font-semibold text-blue-300 mb-2">💡 Replace:</h4>
              <p className="text-blue-200 text-sm"><code className="bg-gray-800 px-2 py-1 rounded text-blue-300">https://YOUR-VERCEL-URL.vercel.app</code> with your actual Vercel domain.</p>
            </div>
          </div>

          {/* Popup HTML */}
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">🎨 Create the HTML Popup (<code className="bg-gray-800 px-2 py-1 rounded text-teal-300">popup.html</code>)</h3>

            <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300"><code>{`<!DOCTYPE html>
<html>
<head>
    <title>Patreon Status</title>
    <style>
        body {
            width: 300px;
            padding: 15px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        h3 {
            margin-top: 0;
            color: #333;
        }
        #status {
            margin: 15px 0;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 4px;
        }
        button {
            width: 100%;
            padding: 10px;
            background: #ff424d;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
        }
        button:hover {
            background: #e63946;
        }
    </style>
</head>
<body>
    <h3>Patreon Access Check</h3>
    <div id="status">Checking status...</div>
    <button id="loginButton" style="display: none;">Log in with Patreon</button>
    <script src="popup.js"></script>
</body>
</html>`}</code></pre>
            </div>
          </div>

          {/* Popup JavaScript */}
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">⚙️ Implement the Logic (<code className="bg-gray-800 px-2 py-1 rounded text-teal-300">popup.js</code>)</h3>

            <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300"><code>{`// popup.js

// --- CONFIGURATION (Replace with your actual values) ---
const PATREON_CLIENT_ID = "YOUR_PATREON_CLIENT_ID";
const REQUIRED_TIER_ID = "YOUR_PATREON_TIER_ID"; // Get this from your Patreon creator dashboard
const SERVERLESS_ENDPOINT = "https://YOUR-VERCEL-URL.vercel.app/api/patreon-check";

// The redirect URI must match what's configured in Patreon and Vercel
const REDIRECT_URI = SERVERLESS_ENDPOINT;

// Required OAuth scopes for checking membership
const PATREON_SCOPES = [
  'identity',
  'identity[email]',
  'identity.memberships'
];

document.addEventListener('DOMContentLoaded', () => {
    const statusDiv = document.getElementById('status');
    const loginButton = document.getElementById('loginButton');

    loginButton.addEventListener('click', checkPatronStatus);

    // Check status when popup opens
    checkPatronStatus();

    async function checkPatronStatus() {
        statusDiv.textContent = "Connecting to Patreon...";
        loginButton.style.display = 'none';

        // Step 1: Build Patreon OAuth authorization URL
        const authUrl = new URL("https://www.patreon.com/oauth2/authorize");
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('client_id', PATREON_CLIENT_ID);
        authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
        authUrl.searchParams.append('scope', PATREON_SCOPES.join(' '));

        try {
            // Step 2: Launch OAuth flow
            // Chrome will open a window for user to authorize, then intercept the redirect
            chrome.identity.launchWebAuthFlow({
                'url': authUrl.toString(),
                'interactive': true
            }, async (redirectUrl) => {
                // Handle user cancellation or errors
                if (chrome.runtime.lastError || !redirectUrl) {
                    statusDiv.textContent = "Login required or denied.";
                    loginButton.style.display = 'block';
                    console.error('Auth flow error:', chrome.runtime.lastError);
                    return;
                }

                // Step 3: Extract authorization code from the intercepted redirect URL
                const url = new URL(redirectUrl);
                const code = url.searchParams.get('code');

                if (!code) {
                    statusDiv.textContent = "Error: No authorization code received.";
                    loginButton.style.display = 'block';
                    return;
                }

                statusDiv.textContent = "Validating with server...";

                // Step 4: Send code to serverless function for validation
                try {
                    const response = await fetch(SERVERLESS_ENDPOINT, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            code: code,
                            requiredTierId: REQUIRED_TIER_ID
                        })
                    });

                    const result = await response.json();

                    // Step 5: Display result to user
                    if (response.ok && result.isPatron) {
                        statusDiv.innerHTML = \`✅ <strong>Access Granted!</strong><br>Welcome, \${result.userName}!\`;
                        loginButton.style.display = 'none';
                    } else {
                        statusDiv.textContent = \`❌ \${result.message || 'Not a patron of the required tier.'}\`;
                        loginButton.style.display = 'block';
                    }
                } catch (fetchError) {
                    statusDiv.textContent = "Error communicating with server.";
                    loginButton.style.display = 'block';
                    console.error('Fetch error:', fetchError);
                }
            });
        } catch (error) {
            statusDiv.textContent = "Authentication error occurred.";
            loginButton.style.display = 'block';
            console.error('Auth error:', error);
        }
    }
});`}</code></pre>
            </div>
          </div>

          {/* Finding Tier ID */}
          <div className="bg-yellow-500/20 border border-yellow-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-300 mb-2">🔍 Finding Your Tier ID:</h3>
            <ol className="space-y-1 text-yellow-200 text-sm">
              <li>1. Go to your Patreon creator dashboard</li>
              <li>2. Navigate to "Membership Tiers"</li>
              <li>3. Click on the tier you want to check</li>
              <li>4. The tier ID is in the URL: <code className="bg-gray-800 px-2 py-1 rounded text-yellow-300">patreon.com/creator/tiers/YOUR_TIER_ID</code></li>
            </ol>
          </div>
        </div>
      </div>

      {/* Step 6: Test Your Extension */}
      <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl p-6 border border-emerald-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">6</span>
          Test Your Extension
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <ol className="space-y-2 text-gray-300">
              <li className="flex items-start"><span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">1</span>Load your extension in Chrome:
                <ul className="ml-9 mt-2 space-y-1 text-sm">
                  <li>• Go to <code className="bg-gray-800 px-2 py-1 rounded text-emerald-300">chrome://extensions/</code></li>
                  <li>• Enable "Developer mode"</li>
                  <li>• Click "Load unpacked"</li>
                  <li>• Select your extension folder</li>
                </ul>
              </li>
              <li className="flex items-start"><span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">2</span>Click the extension icon</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">3</span>Click "Log in with Patreon" when prompted</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">4</span>Authorize the application on Patreon</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">5</span>You should see either "Access Granted" or "Access Denied" based on your membership status</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Security Notes */}
      <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl p-6 border border-indigo-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">🔒 Security Notes</h2>

        <div className="space-y-3">
          <div className="flex items-center text-gray-300">
            <span className="text-green-400 mr-3">✅</span>
            <strong>CLIENT_SECRET is secure:</strong> It never leaves your Vercel server
          </div>
          <div className="flex items-center text-gray-300">
            <span className="text-green-400 mr-3">✅</span>
            <strong>CLIENT_ID is public:</strong> It's safe to include in your extension code
          </div>
          <div className="flex items-center text-gray-300">
            <span className="text-green-400 mr-3">✅</span>
            <strong>Authorization code is single-use:</strong> It can only be exchanged once for an access token
          </div>
          <div className="flex items-center text-gray-300">
            <span className="text-yellow-400 mr-3">⚠️</span>
            <strong>Consider adding state parameter:</strong> For production, implement CSRF protection with a random state value
          </div>
          <div className="flex items-center text-gray-300">
            <span className="text-yellow-400 mr-3">⚠️</span>
            <strong>Access tokens are sensitive:</strong> They're only handled on your server, never exposed to the extension
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl p-6 border border-red-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">🔧 Troubleshooting</h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Error: "redirect_uri_mismatch"</h3>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>• Ensure the redirect URI in Patreon exactly matches your <code className="bg-gray-800 px-2 py-1 rounded text-red-300">PATREON_REDIRECT_URI</code> in Vercel</li>
              <li>• Check for trailing slashes or typos</li>
            </ul>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Error: "Missing environment variables"</h3>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>• Verify all three environment variables are set in Vercel</li>
              <li>• Redeploy after adding environment variables</li>
            </ul>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Login window doesn't appear</h3>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>• Check the browser console for errors</li>
              <li>• Ensure <code className="bg-gray-800 px-2 py-1 rounded text-red-300">identity</code> permission is in manifest.json</li>
              <li>• Verify <code className="bg-gray-800 px-2 py-1 rounded text-red-300">host_permissions</code> includes your Vercel URL</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-6 border border-cyan-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">📚 Additional Resources</h2>

        <div className="space-y-2 text-gray-300">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
            <a href="https://docs.patreon.com/#oauth" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:text-cyan-200 underline">Patreon OAuth Documentation</a>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
            <a href="https://developer.chrome.com/docs/extensions/reference/identity/" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:text-cyan-200 underline">Chrome Identity API Documentation</a>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
            <a href="https://vercel.com/docs/functions/serverless-functions" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:text-cyan-200 underline">Vercel Serverless Functions</a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const GoogleSetupArticle = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6 flex items-center">
      🚀 Google OAuth Serverless Setup Guide for Chrome Extensions
    </h1>
    <p className="text-lg text-gray-300 mb-8">This guide shows you how to implement secure Google OAuth authentication in your Chrome extension using a serverless backend to keep your client secret safe.</p>

    <div className="space-y-8 text-gray-400">
      {/* What You'll Build */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">What You'll Build</h2>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>A serverless function on Vercel that securely exchanges OAuth codes for access tokens</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>A Chrome extension that authenticates users with Google</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Access to user profile information (name, email, profile picture)</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>A secure architecture that keeps secrets on the server</li>
        </ul>
      </div>

      {/* Prerequisites */}
      <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl p-6 border border-indigo-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">Prerequisites</h2>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-center"><span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>A <strong>Google Account</strong></li>
          <li className="flex items-center"><span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>A <strong>GitHub, GitLab, or Bitbucket</strong> account</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>A <strong>Vercel</strong> account (free tier works perfectly)</li>
        </ul>
      </div>

      {/* OAuth Flow */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-6 border border-cyan-300/30">
        <h3 className="text-xl font-semibold text-white mb-4">📋 Understanding the OAuth Flow:</h3>
        <div className="bg-white/10 rounded-lg p-4 font-mono text-sm text-gray-300 space-y-2">
          <div className="flex"><span className="text-cyan-400 mr-3">1.</span>User clicks "Sign in with Google" in your extension</div>
          <div className="flex"><span className="text-cyan-400 mr-3">2.</span>Extension launches Google OAuth authorization page</div>
          <div className="flex"><span className="text-cyan-400 mr-3">3.</span>User signs in and authorizes your app</div>
          <div className="flex"><span className="text-cyan-400 mr-3">4.</span>Google redirects to your Vercel URL with authorization code</div>
          <div className="flex"><span className="text-cyan-400 mr-3">5.</span><strong>Chrome intercepts</strong> this redirect BEFORE it reaches your server</div>
          <div className="flex"><span className="text-cyan-400 mr-3">6.</span>Extension extracts the code from the intercepted URL</div>
          <div className="flex"><span className="text-cyan-400 mr-3">7.</span>Extension POSTs code to your Vercel serverless function</div>
          <div className="flex"><span className="text-cyan-400 mr-3">8.</span>Serverless function exchanges code for access token (CLIENT_SECRET stays secure)</div>
          <div className="flex"><span className="text-cyan-400 mr-3">9.</span>Serverless function fetches user info from Google APIs</div>
          <div className="flex"><span className="text-cyan-400 mr-3">10.</span>Serverless function returns user data to extension</div>
          <div className="flex"><span className="text-cyan-400 mr-3">11.</span>Extension stores and displays user information</div>
        </div>
      </div>

      {/* Step 1: Google Cloud Setup */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">1</span>
          Set Up Google Cloud Project
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">🌐 Create Project</h3>
            <ol className="space-y-2 text-gray-300">
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">1</span>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-green-300 hover:text-green-200 underline">Google Cloud Console</a></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">2</span>Click <strong>"Select a project"</strong> at the top, then <strong>"New Project"</strong></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">3</span>Name your project (e.g., "My Extension OAuth")</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">4</span>Click <strong>"Create"</strong></li>
            </ol>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">⚙️ Enable Required APIs</h3>
            <ol className="space-y-2 text-gray-300" start="5">
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">5</span>In the left sidebar, go to <strong>"APIs & Services"</strong> → <strong>"Library"</strong></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">6</span>Search for <strong>"Google+ API"</strong> (or "People API") and click it</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">7</span>Click <strong>"Enable"</strong></li>
            </ol>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">🔑 Create OAuth Credentials</h3>
            <ol className="space-y-2 text-gray-300" start="8">
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">8</span>In the left sidebar, go to <strong>"APIs & Services"</strong> → <strong>"Credentials"</strong></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">9</span>Click <strong>"Create Credentials"</strong> → <strong>"OAuth client ID"</strong></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">10</span>If prompted, configure the OAuth consent screen: Choose <strong>"External"</strong> user type, fill in app name, user support email, and developer email</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">11</span>For application type, select <strong>"Web application"</strong></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">12</span>Name it (e.g., "Extension OAuth Client")</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">13</span><strong>Leave "Authorized redirect URIs" empty for now</strong> - we'll add it after deploying to Vercel</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">14</span>Click <strong>"Create"</strong></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">15</span><strong>Copy and save</strong> both the <strong>Client ID</strong> and <strong>Client Secret</strong></li>
            </ol>
          </div>
        </div>
      </div>

      {/* Step 2: Serverless Function */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">2</span>
          Create the Serverless Function
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <ol className="space-y-2 text-gray-300">
              <li className="flex items-start"><span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">1</span><strong>Create a new repository</strong> on GitHub (e.g., <code className="bg-gray-800 px-2 py-1 rounded text-purple-300">google-oauth-checker</code>)</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">2</span>Click <strong>"Add file"</strong> → <strong>"Create new file"</strong></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">3</span>Type <code className="bg-gray-800 px-2 py-1 rounded text-purple-300">api/google-auth.js</code> as the filename</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">4</span><strong>Paste the following code:</strong></li>
            </ol>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-300"><code>{`// api/google-auth.js

import fetch from 'node-fetch';

// Environment variables - will be set securely in Vercel
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

export default async (req, res) => {
  // Verify environment variables are configured
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    return res.status(500).json({
      status: 'error',
      message: 'Server configuration error: Missing environment variables.'
    });
  }

  // Only accept POST requests from the extension
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: 'Method Not Allowed'
    });
  }

  // Extract the authorization code from request
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing authorization code'
    });
  }

  try {
    // --- STEP A: Exchange Authorization Code for Access Token ---
    // This MUST happen on the server to keep CLIENT_SECRET secure
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Google Token Error:', error);
      return res.status(401).json({
        status: 'error',
        message: 'Failed to get access token from Google.',
        details: error
      });
    }

    const tokenData = await tokenResponse.json();
    const ACCESS_TOKEN = tokenData.access_token;

    // --- STEP B: Use Access Token to Fetch User Information ---
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': \`Bearer \${ACCESS_TOKEN}\`,
      },
    });

    if (!userInfoResponse.ok) {
      const error = await userInfoResponse.json();
      console.error('Google UserInfo Error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch user data from Google.'
      });
    }

    const userData = await userInfoResponse.json();

    // --- STEP C: Return User Data to Extension ---
    return res.status(200).json({
      status: 'success',
      message: 'Authentication successful.',
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        verified_email: userData.verified_email
      },
      // Optionally return the access token if your extension needs it
      // access_token: ACCESS_TOKEN
    });

  } catch (error) {
    console.error('Server error during Google authentication:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred.',
      details: error.message
    });
  }
};`}</code></pre>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-gray-300"><strong>Commit the file</strong></p>
          </div>
        </div>
      </div>

      {/* Step 3: Deploy to Vercel */}
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">3</span>
          Deploy to Vercel
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <ol className="space-y-2 text-gray-300">
              <li className="flex items-start"><span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">1</span>Log in to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-orange-300 hover:text-orange-200 underline">Vercel</a></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">2</span>Click <strong>"Add New"</strong> → <strong>"Project"</strong></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">3</span>Import your <code className="bg-gray-800 px-2 py-1 rounded text-orange-300">google-oauth-checker</code> repository</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">4</span>Click <strong>"Deploy"</strong></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">5</span><strong>Save your deployment URL</strong> (e.g., <code className="bg-gray-800 px-2 py-1 rounded text-orange-300">https://google-oauth-checker.vercel.app</code>)</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Step 4: Environment Variables */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">4</span>
          Configure Environment Variables
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <ol className="space-y-2 text-gray-300">
              <li className="flex items-start"><span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">1</span>In Vercel Dashboard, go to your project</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">2</span>Click <strong>"Settings"</strong> → <strong>"Environment Variables"</strong></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">3</span>Add these three variables:</li>
            </ol>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-white/10 rounded-lg">
              <thead>
                <tr className="border-b border-yellow-300/30">
                  <th className="text-white font-semibold p-3">Variable Name</th>
                  <th className="text-white font-semibold p-3">Value</th>
                  <th className="text-white font-semibold p-3">Environments</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-600/30">
                  <td className="p-3"><code className="bg-gray-800 px-2 py-1 rounded text-yellow-300">GOOGLE_CLIENT_ID</code></td>
                  <td className="p-3">Your Google OAuth Client ID</td>
                  <td className="p-3">Production, Preview</td>
                </tr>
                <tr className="border-b border-gray-600/30">
                  <td className="p-3"><code className="bg-gray-800 px-2 py-1 rounded text-yellow-300">GOOGLE_CLIENT_SECRET</code></td>
                  <td className="p-3">Your Google OAuth Client Secret</td>
                  <td className="p-3">Production, Preview</td>
                </tr>
                <tr>
                  <td className="p-3"><code className="bg-gray-800 px-2 py-1 rounded text-yellow-300">GOOGLE_REDIRECT_URI</code></td>
                  <td className="p-3"><code className="bg-gray-800 px-2 py-1 rounded text-yellow-300">https://YOUR-VERCEL-URL.vercel.app/api/google-auth</code></td>
                  <td className="p-3">Production, Preview</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-500/20 border border-blue-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-blue-300 mb-2">💡 Example:</h3>
            <p className="text-blue-200 text-sm">If your Vercel URL is <code className="bg-gray-800 px-2 py-1 rounded text-blue-300">https://google-oauth-checker.vercel.app</code>, set:<br />
            <code className="bg-gray-800 px-2 py-1 rounded text-blue-300">GOOGLE_REDIRECT_URI</code> = <code className="bg-gray-800 px-2 py-1 rounded text-blue-300">https://google-oauth-checker.vercel.app/api/google-auth</code></p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <ol className="space-y-2 text-gray-300" start="4">
              <li className="flex items-start"><span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">4</span>Click <strong>"Save"</strong> for each variable</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">5</span>Go to <strong>"Deployments"</strong>, click the three dots on the latest deployment, and <strong>"Redeploy"</strong></li>
            </ol>
          </div>
        </div>
      </div>

      {/* Step 5: Update Google Cloud */}
      <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl p-6 border border-red-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">5</span>
          Update Google Cloud Credentials
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <ol className="space-y-2 text-gray-300">
              <li className="flex items-start"><span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">1</span>Go back to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-red-300 hover:text-red-200 underline">Google Cloud Console</a></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">2</span>Navigate to <strong>"APIs & Services"</strong> → <strong>"Credentials"</strong></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">3</span>Click on your OAuth 2.0 Client ID</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">4</span>Under <strong>"Authorized redirect URIs"</strong>, click <strong>"Add URI"</strong></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">5</span>Paste your complete Vercel endpoint:<br />
              <code className="bg-gray-800 px-2 py-1 rounded text-red-300">https://YOUR-VERCEL-URL.vercel.app/api/google-auth</code></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">6</span>Click <strong>"Save"</strong></li>
            </ol>
          </div>

          <div className="bg-red-500/20 border border-red-300/30 rounded-lg p-4">
            <h3 className="font-semibold text-red-300 mb-2">⚠️ Critical:</h3>
            <p className="text-red-200 text-sm">The redirect URI in Google Cloud Console must <em>exactly</em> match your <code className="bg-gray-800 px-2 py-1 rounded text-red-300">GOOGLE_REDIRECT_URI</code> in Vercel.</p>
          </div>
        </div>
      </div>

      {/* Testing */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">🧪 Test Your Extension</h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <ol className="space-y-2 text-gray-300">
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">1</span>Open Chrome and go to <code className="bg-gray-800 px-2 py-1 rounded text-green-300">chrome://extensions/</code></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">2</span>Enable <strong>"Developer mode"</strong> (toggle in top right)</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">3</span>Click <strong>"Load unpacked"</strong></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">4</span>Select your extension folder</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">5</span>Click the extension icon in your toolbar</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">6</span>Click <strong>"Sign in with Google"</strong></li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">7</span>Choose your Google account and authorize</li>
              <li className="flex items-start"><span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 mt-0.5">8</span>You should see your profile information!</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Security Best Practices */}
      <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl p-6 border border-indigo-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">🔒 Security Best Practices</h2>

        <div className="space-y-3">
          <div className="flex items-center text-gray-300">
            <span className="text-green-400 mr-3">✅</span>
            <strong>CLIENT_SECRET is secure:</strong> It never leaves your Vercel server
          </div>
          <div className="flex items-center text-gray-300">
            <span className="text-green-400 mr-3">✅</span>
            <strong>CLIENT_ID is public:</strong> Safe to include in extension code
          </div>
          <div className="flex items-center text-gray-300">
            <span className="text-green-400 mr-3">✅</span>
            <strong>User data stored locally:</strong> Uses chrome.storage.local for persistence
          </div>
          <div className="flex items-center text-gray-300">
            <span className="text-yellow-400 mr-3">⚠️</span>
            <strong>Token handling:</strong> Access tokens are processed server-side only
          </div>
          <div className="flex items-center text-gray-300">
            <span className="text-yellow-400 mr-3">⚠️</span>
            <strong>Scopes:</strong> Only request the minimum scopes you need
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl p-6 border border-red-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">🔧 Common Issues & Solutions</h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Error: "redirect_uri_mismatch"</h3>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>• Check that redirect URI in Google Cloud Console exactly matches <code className="bg-gray-800 px-2 py-1 rounded text-red-300">GOOGLE_REDIRECT_URI</code> in Vercel</li>
              <li>• Ensure there are no trailing slashes</li>
              <li>• Verify you're using <code className="bg-gray-800 px-2 py-1 rounded text-red-300">https://</code> not <code className="bg-gray-800 px-2 py-1 rounded text-red-300">http://</code></li>
            </ul>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Error: "invalid_client"</h3>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>• Double-check your Client ID and Client Secret</li>
              <li>• Ensure environment variables are set correctly in Vercel</li>
              <li>• Redeploy after setting environment variables</li>
            </ul>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Sign in window doesn't open</h3>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>• Check browser console for errors</li>
              <li>• Verify <code className="bg-gray-800 px-2 py-1 rounded text-red-300">identity</code> permission is in manifest.json</li>
              <li>• Ensure <code className="bg-gray-800 px-2 py-1 rounded text-red-300">host_permissions</code> includes your Vercel URL</li>
            </ul>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">User info not displaying</h3>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>• Check that Google+ API or People API is enabled</li>
              <li>• Verify the scopes include userinfo.email and userinfo.profile</li>
              <li>• Check browser console and Vercel logs for errors</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-6 border border-cyan-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">📚 Additional Resources</h2>

        <div className="space-y-2 text-gray-300">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
            <a href="https://developers.google.com/identity/protocols/oauth2" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:text-cyan-200 underline">Google OAuth 2.0 Documentation</a>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
            <a href="https://developer.chrome.com/docs/extensions/reference/identity/" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:text-cyan-200 underline">Chrome Identity API</a>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
            <a href="https://developers.google.com/identity/protocols/oauth2/scopes" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:text-cyan-200 underline">Google OAuth Scopes</a>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
            <a href="https://vercel.com/docs/functions/serverless-functions" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:text-cyan-200 underline">Vercel Serverless Functions</a>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-xl p-6 border border-violet-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">🚀 What's Next?</h2>

        <p className="text-gray-300 mb-4">Now that you have Google authentication working, you can:</p>

        <div className="space-y-2 text-gray-300">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-violet-400 rounded-full mr-3"></span>
            Add more Google API integrations (Gmail, Calendar, Drive)
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-violet-400 rounded-full mr-3"></span>
            Implement token refresh for long-lived sessions
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-violet-400 rounded-full mr-3"></span>
            Add user-specific features based on their Google account
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-violet-400 rounded-full mr-3"></span>
            Store user preferences in Chrome storage
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-violet-400 rounded-full mr-3"></span>
            Build features that sync across devices using Google account
          </div>
        </div>
      </div>
    </div>
  </div>
);

const InstallChromeExtensionArticle = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6 flex items-center">
      🚀 How to Install Your Chrome Extension
    </h1>
    <p className="text-lg text-gray-300 mb-8">Follow these simple steps to install your Chrome extension from a ZIP file using Chrome's Developer Mode.</p>

    <div className="space-y-8 text-gray-400">
      {/* Preparation Section */}
      <div className="bg-gradient-to-r from-gray-500/20 to-slate-500/20 rounded-xl p-6 border border-gray-300/30">
        <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
          📋 Before You Begin
        </h2>
        <div className="space-y-4">
          <p className="text-gray-300 flex items-center gap-2 flex-wrap">
            To download an extension from Kromio.ai, simply click the
            <button className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded mx-1 font-medium pointer-events-none">
              <Download className="w-3 h-3" />
              Download ZIP
            </button>
            button on the extension's page.
          </p>
          <p className="text-gray-400 text-sm">Once you have the ZIP file downloaded, follow the steps below to install it in Chrome.</p>
        </div>
      </div>

      {/* Step 1: Extract ZIP */}
      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">1</span>
          📁 Extract the ZIP File
        </h2>
        <div className="space-y-4">
          <p className="text-gray-300">First, you need to extract the downloaded ZIP file to access your extension folder.</p>
          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-400/30">
            <h4 className="font-semibold text-blue-300 mb-2">Instructions:</h4>
            <ul className="space-y-2 text-gray-300">
              <li>• Find your downloaded ZIP file (usually in your Downloads folder)</li>
              <li>• <strong>Windows:</strong> Right-click → "Extract All" and choose a location</li>
              <li>• <strong>Mac:</strong> Double-click the ZIP file to extract automatically</li>
              <li>• Remember the location where you extracted the folder</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Step 2: Open Chrome Extensions */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">2</span>
          🌐 Open Chrome Extensions Page
        </h2>
        <div className="space-y-4">
          <p className="text-gray-300">Navigate to Chrome's extensions management page.</p>
          <div className="bg-green-500/10 rounded-lg p-4 border border-green-400/30">
            <h4 className="font-semibold text-green-300 mb-2">Quick Access:</h4>
            <div className="space-y-3">
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Copy and paste this URL into your address bar:</p>
                <code className="text-green-300 font-mono text-lg">chrome://extensions/</code>
              </div>
              <p className="text-gray-300 text-sm"><strong>Alternative:</strong> Go to Chrome menu (⋮) → More Tools → Extensions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Enable Developer Mode */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">3</span>
          🔧 Enable Developer Mode
        </h2>
        <div className="space-y-4">
          <p className="text-gray-300">You need to enable Developer Mode to install extensions from local files.</p>
          <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-400/30">
            <h4 className="font-semibold text-purple-300 mb-2">Steps:</h4>
            <ul className="space-y-2 text-gray-300">
              <li>• Look for the <strong>"Developer mode"</strong> toggle in the top-right corner</li>
              <li>• Click the toggle to turn it <strong>ON</strong> (it should turn blue/active)</li>
              <li>• New buttons will appear: "Load unpacked", "Pack extension", "Update"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Step 4: Load Extension */}
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">4</span>
          📤 Load Your Extension
        </h2>
        <div className="space-y-4">
          <p className="text-gray-300">Now you'll load your extension from the extracted folder.</p>
          <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-400/30">
            <h4 className="font-semibold text-orange-300 mb-2">Instructions:</h4>
            <ul className="space-y-2 text-gray-300">
              <li>• Click the <strong>"Load unpacked"</strong> button</li>
              <li>• Browse to the folder you extracted in Step 1</li>
              <li>• Select the <strong>extension folder</strong> (not the ZIP file)</li>
              <li>• Click "Select Folder" or "Open"</li>
            </ul>
          </div>

          {/* Important Note */}
          <div className="bg-yellow-600/20 rounded-lg p-4 border border-yellow-500/50">
            <h4 className="font-semibold text-yellow-300 mb-2 flex items-center">
              ⚠️ Common Error: "Manifest File Missing"
            </h4>
            <p className="text-yellow-100 mb-2">If you get an error about "manifest.json" not found, you're probably selecting the wrong folder!</p>
            <ul className="space-y-1 text-yellow-200 text-sm">
              <li>• ❌ <strong>Don't select:</strong> Downloads folder or the ZIP file</li>
              <li>• ✅ <strong>Do select:</strong> The extracted extension folder containing manifest.json</li>
              <li>• The correct folder should contain files like manifest.json, popup.html, etc.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Step 5: Pin Extension */}
      <div className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-xl p-6 border border-indigo-300/30">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">5</span>
          📌 Pin Your Extension (Optional)
        </h2>
        <div className="space-y-4">
          <p className="text-gray-300">Make your extension easily accessible by pinning it to the toolbar.</p>
          <div className="bg-indigo-500/10 rounded-lg p-4 border border-indigo-400/30">
            <h4 className="font-semibold text-indigo-300 mb-2">To Pin Your Extension:</h4>
            <ul className="space-y-2 text-gray-300">
              <li>• Click the puzzle piece icon (🧩) in Chrome's toolbar</li>
              <li>• Find your extension in the dropdown list</li>
              <li>• Click the pin icon (📌) next to your extension name</li>
              <li>• Your extension icon will now appear directly in the toolbar</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Success */}
      <div className="bg-gradient-to-r from-green-600/30 to-emerald-600/30 rounded-xl p-6 border border-green-400/50">
        <div className="text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-2xl font-bold text-white mb-3">Congratulations!</h3>
          <p className="text-green-200 text-lg mb-4">Your Chrome extension is now installed and ready to use.</p>
          <p className="text-gray-300">You can access it by clicking its icon in the toolbar or through the extensions menu.</p>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600/50">
        <h3 className="text-xl font-semibold text-white mb-4">🔧 Troubleshooting</h3>
        <div className="space-y-3 text-gray-300">
          <div>
            <h4 className="font-semibold text-gray-200">Extension not working?</h4>
            <p className="text-sm">Try refreshing the page or restarting Chrome after installation.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-200">Can't find the extension?</h4>
            <p className="text-sm">Check if it's in the puzzle piece (🧩) menu, or go back to chrome://extensions/ to verify it's enabled.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-200">Need to update the extension?</h4>
            <p className="text-sm">Go to chrome://extensions/, find your extension, and click the "Update" button.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const articles = {
  'quick-start': {
    title: 'Quick Start',
    description: 'Get up and running with Kromio AI in just 3 simple steps. From idea to Chrome extension in seconds.',
    component: <QuickStartArticle />
  },
  'examples': {
    title: 'Extension Examples',
    description: 'See real Chrome extensions built by our community. Most created with just 1 token!',
    component: <ExamplesArticle />
  },
  'install-chrome-extension': {
    title: 'How to Install Your Chrome Extension',
    description: 'Step-by-step guide to install your Chrome extension from a ZIP file using Developer Mode.',
    component: <InstallChromeExtensionArticle />
  },
  'getting-started': {
    title: 'Getting Started',
    description: 'Welcome to the platform! This guide will walk you through the initial steps to get you up and running.',
    component: <GettingStartedArticle />
  },
  'credits': {
    title: 'How to Use Credits',
    description: 'Credits are central to our platform. Learn how to acquire and use them effectively.',
    component: <UsingTokensArticle />
  },
  'features': {
    title: 'Platform Features',
    description: 'Discover all the features our platform offers to enhance your experience.',
    component: <FeaturesArticle />
  },
  'faq': {
    title: 'FAQ',
    description: 'Frequently asked questions about building Chrome extensions with AI. Get quick answers to common questions.',
    component: <FAQArticle />
  },
  'troubleshooting': {
    title: 'Troubleshooting',
    description: 'Encountering issues? Our troubleshooting guide is here to help you resolve them quickly.',
    component: <TroubleshootingArticle />
  },
  'tips': {
    title: 'Tips for Chrome Extension Development',
    description: 'Pro tips and best practices for creating amazing Chrome extensions with AI. Learn the secrets to getting better results.',
    component: <DevelopmentTipsArticle />
  },
  'privacy': {
    title: 'Privacy Policy',
    description: 'Learn about how we collect, use, and protect your data.',
    component: <PrivacyArticle />
  },
  'terms': {
    title: 'Terms of Service',
    description: 'Read our terms of service and understand your rights and responsibilities.',
    component: <TermsArticle />
  },
  'submission-guide': {
    title: 'Chrome Store Submission Guide',
    description: 'Complete step-by-step walkthrough for submitting your extension to the Chrome Web Store.',
    component: <SubmissionWalkthroughArticle />
  },
  'plasmo-alternatives': {
    title: 'Plasmo Alternatives',
    description: 'Discover the best Plasmo alternatives with Kromio as the #1 AI-powered no-code solution.',
    component: <PlasmoAlternativesArticle />
  },
  'no-code-chrome-extension-builder': {
    title: 'No Code Chrome Extension Builder',
    description: 'Build powerful Chrome extensions without coding using AI-powered tools.',
    component: <NoCodeChromeExtensionArticle />
  },
  'monetize-chrome-extension': {
    title: 'How to Monetize Chrome Extension',
    description: 'Turn your Chrome extension into a profitable business with proven strategies.',
    component: <MonetizeChromeExtensionArticle />
  },
  'payment-gateways': {
    title: 'Payment Gateways for Chrome Extensions',
    description: 'Learn how to integrate Stripe, Patreon, and other payment systems to monetize your extensions.',
    component: <PaymentGatewaysArticle />
  },
  'submit-chrome-web-store': {
    title: 'Submit to Chrome Web Store',
    description: 'Complete guide to publishing your Chrome extension to the Chrome Web Store.',
    component: <SubmitWebStoreArticle />
  },
  'patreon-setup': {
    title: 'Patreon Serverless Setup Guide',
    description: 'Deploy and configure a secure serverless function to check Patreon status for your Chrome extension.',
    component: <PatreonSetupArticle />
  },
  'google-setup': {
    title: 'Google OAuth Serverless Setup Guide',
    description: 'Implement secure Google OAuth authentication in your Chrome extension using serverless backend.',
    component: <GoogleSetupArticle />
  }
};

const LearnPage = ({ onShowLoginModal }) => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Set dynamic page title based on selected article
  const currentArticle = selectedArticle && articles[selectedArticle];
  const pageTitle = currentArticle ? `${currentArticle.title} - Learn` : 'Learn Hub - Kromio.ai';
  useDocumentTitle(pageTitle);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && articles[hash]) {
      // Redirect hash fragments to individual article pages for SEO
      // This preserves existing bookmarks and search engine rankings
      const articleMapping = {
        'privacy': 'privacy',
        'terms': 'terms', 
        'getting-started': 'getting-started',
        'features': 'features',
        'faq': 'faq',
        'troubleshooting': 'troubleshooting',
        'quick-start': 'quick-start'
      };
      
      if (articleMapping[hash]) {
        navigate(`/learn/${articleMapping[hash]}`, { replace: true });
        return;
      }
      
      // Fallback to existing hash behavior if no mapping exists
      setSelectedArticle(hash);
    } else {
      setSelectedArticle(null);
    }
  }, [location, navigate]);

  const handleArticleSelect = (key) => {
    if (key === null) {
      navigate('/learn');
    } else {
      navigate(`/learn#${key}`);
    }
  };

  const renderContent = () => {
    if (selectedArticle && articles[selectedArticle]) {
      return articles[selectedArticle].component;
    }

    // Helper function to get article icons and colors
    const getArticleStyle = (key) => {
      const styles = {
        'quick-start': { icon: '🚀', gradient: 'from-green-500/20 to-emerald-500/20', border: 'border-green-300/30' },
        'examples': { icon: '📚', gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-300/30' },
        'getting-started': { icon: '👋', gradient: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-300/30' },
        'using-tokens': { icon: '⚡', gradient: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-300/30' },
        'features': { icon: '✨', gradient: 'from-indigo-500/20 to-purple-500/20', border: 'border-indigo-300/30' },
        'faq': { icon: '❓', gradient: 'from-teal-500/20 to-cyan-500/20', border: 'border-teal-300/30' },
        'troubleshooting': { icon: '🔧', gradient: 'from-red-500/20 to-pink-500/20', border: 'border-red-300/30' },
        'development-tips': { icon: '💡', gradient: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-300/30' },
        'privacy': { icon: '🔒', gradient: 'from-gray-500/20 to-slate-500/20', border: 'border-gray-300/30' },
        'terms': { icon: '📋', gradient: 'from-purple-500/20 to-violet-500/20', border: 'border-purple-300/30' }
      };
      return styles[key] || { icon: '📖', gradient: 'from-gray-500/20 to-slate-500/20', border: 'border-gray-300/30' };
    };

    return (
      <div>
        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-lime-400 to-white bg-clip-text text-transparent">
          🎯 Help Topics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.keys(articles).map((key) => {
            const style = getArticleStyle(key);
            return (
              <button 
                key={key} 
                onClick={() => handleArticleSelect(key)} 
                className={`group bg-gradient-to-br ${style.gradient} backdrop-blur-lg rounded-xl p-6 border ${style.border} text-left hover:scale-105 hover:shadow-xl transition-all duration-300 transform`}
              >
                <div className="flex items-start space-x-4 mb-3">
                  <div className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {style.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300 break-words leading-tight">
                      {articles[key].title}
                    </h3>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  {articles[key].description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-8">
            <Header onShowLoginModal={onShowLoginModal} />
            <div className="text-center mb-16">
                <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-lime-400 to-white bg-clip-text text-transparent">
                    Help Center
                </h1>
                <div className="mt-6">
                    <input type="text" className="w-1/2 mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-full py-3 px-6 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400" placeholder="Search Help..." />
                </div>
            </div>

            {selectedArticle && (
              <div className="mb-6">
                <button onClick={() => handleArticleSelect(null)} className="flex items-center text-gray-300 hover:text-white transition-colors duration-200">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Help Topics
                </button>
              </div>
            )}

            <div className={`grid gap-12 ${selectedArticle ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-4'}`}>
                {!selectedArticle && (
                    <div className="md:col-span-1">
                        <h2 className="text-2xl font-bold mb-6">Help Topics</h2>
                        <ul className="space-y-3">
                            {Object.keys(articles).map(key => (
                                <li key={key}>
                                    <button onClick={() => handleArticleSelect(key)} className={`text-left w-full ${selectedArticle === key ? 'text-white font-bold' : 'text-gray-300'} hover:text-white`}>
                                        {articles[key].title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className={`bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 ${selectedArticle ? '' : 'md:col-span-3'}`}>
                    {renderContent()}
                </div>
            </div>
        </div>
    </div>
  );
};

// Export individual article components for use in other files
export {
  GettingStartedArticle,
  UsingTokensArticle,
  FeaturesArticle,
  FAQArticle,
  DevelopmentTipsArticle,
  TroubleshootingArticle,
  QuickStartArticle,
  PrivacyArticle,
  TermsArticle,
  ExamplesArticle,
  SubmissionWalkthroughArticle,
  PlasmoAlternativesArticle,
  NoCodeChromeExtensionArticle,
  MonetizeChromeExtensionArticle,
  PaymentGatewaysArticle,
  SubmitWebStoreArticle,
  PatreonSetupArticle,
  GoogleSetupArticle
};

export default LearnPage;
