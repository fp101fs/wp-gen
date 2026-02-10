import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle, Circle, AlertTriangle, HelpCircle, Upload, Save, ArrowRight, ArrowLeft, ExternalLink, Star, Eye, Globe, Lock, Shield, Target, Copy, Check } from 'lucide-react';
import Header from './Header';

const StoreSubmissionGuide = ({ onShowLoginModal }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [debugTest, setDebugTest] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    category: '',
    language: 'en',
    singlePurpose: '',
    permissions: {},
    dataCollection: {
      personalInfo: false,
      healthInfo: false,
      financialInfo: false,
      authInfo: false,
      communications: false,
      location: false,
      webHistory: false,
      userActivity: false,
      websiteContent: false
    },
    privacyPolicyUrl: '',
    pricing: 'free',
    visibility: 'public',
    testInstructions: ''
  });
  const [lastSaved, setLastSaved] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  const sections = [
    { id: 'listing', name: 'Store Listing', icon: '🏪', description: 'Set up your store window' },
    { id: 'privacy', name: 'Privacy & Trust', icon: '🔒', description: 'Build user confidence' },
    { id: 'distribution', name: 'Who Can See It', icon: '👀', description: 'Choose your audience' },
    { id: 'final', name: 'Final Steps', icon: '🏁', description: 'Ready to submit!' },
    { id: 'submit', name: 'Submit Process', icon: '🚀', description: 'Upload to Chrome Store' }
  ];

  // Manual save functionality only
  const saveFormData = useCallback(() => {
    localStorage.setItem('store-submission-draft', JSON.stringify(formData));
    setLastSaved(new Date());
  }, [formData]);

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('store-submission-draft');
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    }
  }, []);

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedFormData = (field, subfield, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subfield]: value
      }
    }));
  };

  const calculateProgress = () => {
    const requiredFields = [
      formData.title,
      formData.summary,
      formData.description,
      formData.singlePurpose,
      formData.privacyPolicyUrl
    ];
    const filledFields = requiredFields.filter(field => field && field.trim()).length;
    const sectionProgress = (currentSection / (sections.length - 1)) * 100;
    const formProgress = (filledFields / requiredFields.length) * 100;
    return Math.round((sectionProgress + formProgress) / 2);
  };

  const isReadyToSubmit = () => {
    const requiredFields = [
      formData.title,
      formData.summary,
      formData.description,
      formData.singlePurpose,
      formData.privacyPolicyUrl
    ];
    return requiredFields.every(field => field && field.trim());
  };

  const copyToClipboard = useCallback(async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, []);

  const CopyButton = ({ text, fieldName, className = "" }) => (
    <button
      onClick={() => copyToClipboard(text, fieldName)}
      className={`ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors ${className}`}
      title="Copy to clipboard"
    >
      {copiedField === fieldName ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );

  const FieldHelper = ({ label, required = false, helpful = false, tooltip, children, value, fieldName }) => {
    const borderColor = required ? 'border-red-300' : helpful ? 'border-yellow-300' : 'border-green-300';
    const bgColor = required ? 'bg-red-50' : helpful ? 'bg-yellow-50' : 'bg-green-50';
    
    return (
      <div className={`border-2 ${borderColor} ${bgColor} rounded-xl p-4 mb-6`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-gray-800">{label}</span>
          {required && <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded-full">REQUIRED</span>}
          {helpful && <span className="text-yellow-600 text-xs bg-yellow-100 px-2 py-1 rounded-full">HELPFUL</span>}
          {value && <CopyButton text={value} fieldName={fieldName} />}
          {tooltip && (
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {tooltip}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          )}
        </div>
        {children}
      </div>
    );
  };

  const ProgressTracker = () => (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Your Progress</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300">
            {lastSaved && `Last saved: ${lastSaved.toLocaleTimeString()}`}
          </span>
          <button
            onClick={saveFormData}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1"
          >
            <Save className="w-3 h-3" />
            Save
          </button>
        </div>
      </div>
      
      <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
        <div 
          className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${calculateProgress()}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{calculateProgress()}% Complete</span>
        <span className={`font-semibold ${isReadyToSubmit() ? 'text-green-400' : 'text-gray-300'}`}>
          {isReadyToSubmit() ? '✅ Ready to Submit!' : 'Keep going...'}
        </span>
      </div>
    </div>
  );

  const SectionNavigation = () => (
    <div className="flex flex-wrap gap-2 mb-8">
      {sections.map((section, index) => (
        <button
          key={section.id}
          onClick={() => setCurrentSection(index)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-200 ${
            currentSection === index
              ? 'bg-purple-600/30 border-purple-400 text-purple-200 backdrop-blur-sm'
              : 'bg-white/10 border-white/20 text-gray-200 hover:bg-white/20 backdrop-blur-sm'
          }`}
        >
          <span className="text-lg">{section.icon}</span>
          <div className="text-left">
            <div className="font-medium text-sm">{section.name}</div>
            <div className="text-xs opacity-75">{section.description}</div>
          </div>
        </button>
      ))}
    </div>
  );

  const StoreListing = () => (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🏪 Setting Up Your Store Window</h2>
        <p className="text-lg text-gray-600">Think of this like decorating your store front - first impressions matter!</p>
      </div>

      {/* Debug test input */}
      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800 mb-2">🧪 Debug Test Input (type here to test):</p>
        <input
          type="text"
          value={debugTest}
          onChange={(e) => setDebugTest(e.target.value)}
          placeholder="Test typing here..."
          className="w-full p-2 border border-gray-300 rounded"
        />
        <p className="text-xs text-yellow-700 mt-1">Debug Value: "{debugTest}" | Title Value: "{formData.title}"</p>
      </div>

      <FieldHelper 
        label="What's your extension called?" 
        required
        tooltip="This is the main title that appears in the Chrome Web Store"
        value={formData.title}
        fieldName="title"
      >
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          placeholder="e.g., Comic Sansify 😂"
          className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          maxLength={45}
        />
        <div className="text-right text-sm mt-1">
          <span className={formData.title.length > 40 ? 'text-red-500' : 'text-gray-500'}>
            {formData.title.length}/45 characters
          </span>
        </div>
      </FieldHelper>

      <FieldHelper 
        label="Describe what it does in one sentence" 
        required
        tooltip="This short description appears under your title"
        value={formData.summary}
        fieldName="summary"
      >
        <input
          type="text"
          value={formData.summary}
          onChange={(e) => updateFormData('summary', e.target.value)}
          placeholder="e.g., Replaces all website fonts with Comic Sans"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          maxLength={132}
        />
        <div className="text-right text-sm mt-1">
          <span className={formData.summary.length > 120 ? 'text-red-500' : 'text-gray-500'}>
            {formData.summary.length}/132 characters
          </span>
        </div>
      </FieldHelper>

      <FieldHelper 
        label="Tell people WHY they should install it" 
        required
        tooltip="This longer description explains the benefits and features"
        value={formData.description}
        fieldName="description"
      >
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="Tired of boring fonts? Comic Sansify makes every website fun and playful by replacing all text with the beloved Comic Sans font. Perfect for making serious websites less intimidating, or just for a good laugh!

Features:
• Works on any website
• One-click activation
• No ads or tracking
• Completely free

Install Comic Sansify and turn the internet into a more fun place!"
          className="w-full p-3 border border-gray-300 rounded-lg h-40 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          maxLength={16000}
        />
        <div className="text-right text-sm mt-1">
          <span className={formData.description.length > 15000 ? 'text-red-500' : 'text-gray-500'}>
            {formData.description.length.toLocaleString()}/16,000 characters
          </span>
        </div>
      </FieldHelper>

      <FieldHelper 
        label="What type of tool is this?" 
        helpful
        tooltip="Choose the category that best describes your extension"
        value={formData.category}
        fieldName="category"
      >
        <select
          value={formData.category}
          onChange={(e) => updateFormData('category', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">Select a category...</option>
          <option value="accessibility">🦾 Accessibility - Helps people with disabilities</option>
          <option value="blogging">📝 Blogging - Writing and content creation</option>
          <option value="by_google">🔷 By Google - Made by Google</option>
          <option value="communication">💬 Communication - Chat, email, messaging</option>
          <option value="developer">⚡ Developer Tools - For programmers</option>
          <option value="education">🎓 Education - Learning and teaching</option>
          <option value="entertainment">🎮 Entertainment - Fun and games</option>
          <option value="household">🏠 Household - Home and family</option>
          <option value="lifestyle">🌟 Lifestyle - Personal improvement</option>
          <option value="make_chrome_yours">🎨 Make Chrome Yours - Customize Chrome</option>
          <option value="news">📰 News & Weather - Stay informed</option>
          <option value="photos">📷 Photos - Image editing and viewing</option>
          <option value="productivity">✅ Productivity - Get things done</option>
          <option value="search">🔍 Search Tools - Find information</option>
          <option value="shopping">🛒 Shopping - Online shopping helpers</option>
          <option value="social">👥 Social & Communication - Social media</option>
          <option value="sports">⚽ Sports - Sports and fitness</option>
          <option value="travel">✈️ Travel - Trip planning and booking</option>
          <option value="well_being">💚 Well-being - Health and wellness</option>
        </select>
      </FieldHelper>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Pictures for Your Extension
        </h3>
        <div className="space-y-4 text-blue-700">
          <div>
            <strong>📱 Store Icon (Required):</strong>
            <p>This is like your extension's profile picture. Make it 128x128 pixels (about the size of a small square).</p>
          </div>
          <div>
            <strong>📸 Screenshots (Required - at least 1):</strong>
            <p>Show people what your extension looks like! Take "before and after" photos. Maximum of 5 photos.</p>
            <p className="text-sm">Size: 1280x800 pixels (landscape) or 640x400 pixels (smaller landscape)</p>
          </div>
          <div>
            <strong>🎬 Video (Optional):</strong>
            <p>Have a YouTube video showing your extension? Add the link!</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> You'll upload these files directly in the Chrome Web Store dashboard. 
            Just drag and drop them into the upload areas!
          </p>
        </div>
      </div>
    </div>
  );

  const PrivacySection = () => (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🔒 Building Trust with Users</h2>
        <p className="text-lg text-gray-600">Like telling customers what information you need and why</p>
      </div>

      <FieldHelper 
        label="What does your extension do? (Single Purpose)" 
        required
        tooltip="Google wants to know your extension has one clear purpose"
        value={formData.singlePurpose}
        fieldName="singlePurpose"
      >
        <div className="mb-3">
          <p className="text-sm text-gray-600 mb-2">Fill in the blanks:</p>
          <div className="bg-gray-50 p-3 rounded-lg text-gray-700 italic mb-3">
            "My extension helps people <strong>[do what?]</strong> by <strong>[how does it help?]</strong>"
          </div>
        </div>
        <textarea
          value={formData.singlePurpose}
          onChange={(e) => updateFormData('singlePurpose', e.target.value)}
          placeholder="My extension helps people make websites more fun by changing all fonts to Comic Sans, which makes serious content less intimidating and more enjoyable to read."
          className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          maxLength={1000}
        />
        <div className="text-right text-sm mt-1">
          <span className={formData.singlePurpose.length > 900 ? 'text-red-500' : 'text-gray-500'}>
            {formData.singlePurpose.length}/1,000 characters
          </span>
        </div>
      </FieldHelper>

      <FieldHelper 
        label="Do you collect any personal information?" 
        required
        tooltip="Be honest about what data you collect - users appreciate transparency"
      >
        <div className="space-y-4">
          {[
            { key: 'personalInfo', label: 'Personal info (name, email, address)', icon: '👤' },
            { key: 'healthInfo', label: 'Health information', icon: '🏥' },
            { key: 'financialInfo', label: 'Financial info (credit cards, transactions)', icon: '💳' },
            { key: 'authInfo', label: 'Login info (passwords, credentials)', icon: '🔐' },
            { key: 'communications', label: 'Messages (emails, chats)', icon: '💬' },
            { key: 'location', label: 'Location data', icon: '📍' },
            { key: 'webHistory', label: 'Browsing history', icon: '🌐' },
            { key: 'userActivity', label: 'What users click and type', icon: '🖱️' },
            { key: 'websiteContent', label: 'Content from websites', icon: '📄' }
          ].map(item => (
            <label key={item.key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.dataCollection[item.key]}
                onChange={(e) => updateNestedFormData('dataCollection', item.key, e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded"
              />
              <span className="text-lg">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                formData.dataCollection[item.key] ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
              }`}>
                {formData.dataCollection[item.key] ? 'YES' : 'NO'}
              </span>
            </label>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            💚 <strong>Most simple extensions don't collect any data!</strong> If your extension just changes how websites look or adds simple features, you probably don't collect anything.
          </p>
        </div>
      </FieldHelper>

      <FieldHelper 
        label="Privacy Policy Link" 
        required
        tooltip="Link to a page that explains your privacy practices"
        value={formData.privacyPolicyUrl}
        fieldName="privacyPolicyUrl"
      >
        <input
          type="url"
          value={formData.privacyPolicyUrl}
          onChange={(e) => updateFormData('privacyPolicyUrl', e.target.value)}
          placeholder="https://yourwebsite.com/privacy"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800">
            💡 <strong>Don't have a privacy policy?</strong> You can use your Kromio AI privacy policy page: 
            <code className="bg-purple-100 px-2 py-1 rounded ml-1">https://plugin.new/learn#privacy</code>
          </p>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">📝 How to create your own privacy policy on GitHub Gist:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Go to <a href="https://gist.github.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://gist.github.com/</a></li>
            <li>Sign in with your GitHub account (free to create)</li>
            <li>Create a new gist called "privacy-policy.md"</li>
            <li>Write your privacy policy (keep it simple and honest)</li>
            <li>Click "Create public gist"</li>
            <li>Copy the gist URL and paste it above</li>
          </ol>
          <p className="text-xs text-gray-600 mt-2">
            🔗 The URL will look like: https://gist.github.com/yourusername/abc123...
          </p>
        </div>
      </FieldHelper>
    </div>
  );

  const DistributionSection = () => (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">👀 Who Can See Your Extension</h2>
        <p className="text-lg text-gray-600">Decide who can visit your store</p>
      </div>

      <FieldHelper 
        label="Is your extension free?" 
        required
        tooltip="Most extensions are free"
      >
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-green-50 cursor-pointer">
            <input
              type="radio"
              name="pricing"
              value="free"
              checked={formData.pricing === 'free'}
              onChange={(e) => updateFormData('pricing', e.target.value)}
              className="w-5 h-5 text-green-600"
            />
            <div className="flex-1">
              <div className="font-medium text-green-800">💚 Free (Recommended)</div>
              <div className="text-sm text-green-600">No cost to users, no payment processing needed</div>
            </div>
          </label>
          
          <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-yellow-50 cursor-pointer">
            <input
              type="radio"
              name="pricing"
              value="paid"
              checked={formData.pricing === 'paid'}
              onChange={(e) => updateFormData('pricing', e.target.value)}
              className="w-5 h-5 text-yellow-600"
            />
            <div className="flex-1">
              <div className="font-medium text-yellow-800">💰 Contains In-App Purchases</div>
              <div className="text-sm text-yellow-600">Users can buy additional features</div>
            </div>
          </label>
        </div>
      </FieldHelper>

      <FieldHelper 
        label="Who can find your extension?" 
        helpful
        tooltip="Choose how discoverable your extension should be"
      >
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={formData.visibility === 'public'}
              onChange={(e) => updateFormData('visibility', e.target.value)}
              className="w-5 h-5 text-blue-600"
            />
            <div className="flex-1">
              <div className="font-medium text-blue-800 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Public (Recommended)
              </div>
              <div className="text-sm text-blue-600">Everyone can find it in search results</div>
            </div>
          </label>
          
          <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-yellow-50 cursor-pointer">
            <input
              type="radio"
              name="visibility"
              value="unlisted"
              checked={formData.visibility === 'unlisted'}
              onChange={(e) => updateFormData('visibility', e.target.value)}
              className="w-5 h-5 text-yellow-600"
            />
            <div className="flex-1">
              <div className="font-medium text-yellow-800 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Unlisted
              </div>
              <div className="text-sm text-yellow-600">Only people with the direct link can find it</div>
            </div>
          </label>
          
          <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={formData.visibility === 'private'}
              onChange={(e) => updateFormData('visibility', e.target.value)}
              className="w-5 h-5 text-gray-600"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-800 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Private
              </div>
              <div className="text-sm text-gray-600">Only people you specifically invite can see it</div>
            </div>
          </label>
        </div>
      </FieldHelper>
    </div>
  );

  const FinalSteps = () => (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🏁 You're Almost There!</h2>
        <p className="text-lg text-gray-600">Just a few more details and you'll be ready to submit</p>
      </div>

      <FieldHelper 
        label="How should Google test your extension?" 
        helpful
        tooltip="Help the review team understand how to test your extension"
        value={formData.testInstructions}
        fieldName="testInstructions"
      >
        <textarea
          value={formData.testInstructions}
          onChange={(e) => updateFormData('testInstructions', e.target.value)}
          placeholder="Just install the extension and visit any website. The extension works automatically - all text will change to Comic Sans font. No login or setup required!"
          className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          maxLength={5000}
        />
        <div className="text-right text-sm mt-1 text-gray-500">
          {formData.testInstructions.length}/5,000 characters
        </div>
        <div className="mt-3 space-y-2 text-sm text-gray-600">
          <p><strong>Examples:</strong></p>
          <div className="bg-gray-50 p-3 rounded-lg space-y-1">
            <p>• "Just install and visit any website - it works automatically!"</p>
            <p>• "Click the extension icon in the toolbar, then click 'Start' button"</p>
            <p>• "Right-click on any webpage and select 'My Extension' from the menu"</p>
          </div>
        </div>
      </FieldHelper>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-6">
        <h3 className="font-bold text-green-800 mb-4 text-xl">📋 Final Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { field: formData.title, label: 'Extension title' },
            { field: formData.summary, label: 'Short description' },
            { field: formData.description, label: 'Full description' },
            { field: formData.singlePurpose, label: 'Single purpose explained' },
            { field: formData.privacyPolicyUrl, label: 'Privacy policy link' }
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              {item.field && item.field.trim() ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400" />
              )}
              <span className={item.field && item.field.trim() ? 'text-green-800' : 'text-gray-500'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SubmitProcess = () => (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🚀 Submit to Chrome Web Store</h2>
        <p className="text-lg text-gray-600">Copy your information and paste it into the Chrome Web Store</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-blue-800 mb-3">📋 Before You Start</h3>
        <p className="text-blue-700 mb-3">
          First, open the Chrome Web Store Developer Dashboard in a new tab:
        </p>
        <a
          href="https://chrome.google.com/webstore/developer/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open Chrome Web Store Dashboard
        </a>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">1</span>
            Store Listing - Product Details
          </h3>
          
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Title</h4>
                <CopyButton text={formData.title} fieldName="submit-title" />
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <code className="text-sm">{formData.title || 'Please fill out the title field'}</code>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Summary</h4>
                <CopyButton text={formData.summary} fieldName="submit-summary" />
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <code className="text-sm">{formData.summary || 'Please fill out the summary field'}</code>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Description</h4>
                <CopyButton text={formData.description} fieldName="submit-description" />
              </div>
              <div className="bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                <code className="text-sm whitespace-pre-wrap">{formData.description || 'Please fill out the description field'}</code>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm">2</span>
            Privacy Section
          </h3>
          
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Single Purpose Description</h4>
                <CopyButton text={formData.singlePurpose} fieldName="submit-purpose" />
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <code className="text-sm whitespace-pre-wrap">{formData.singlePurpose || 'Please fill out the single purpose field'}</code>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Privacy Policy URL</h4>
                <CopyButton text={formData.privacyPolicyUrl} fieldName="submit-privacy" />
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <code className="text-sm">{formData.privacyPolicyUrl || 'Please fill out the privacy policy URL'}</code>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">3</span>
            Test Instructions
          </h3>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-800">Test Instructions</h4>
              <CopyButton text={formData.testInstructions} fieldName="submit-test" />
            </div>
            <div className="bg-gray-50 p-3 rounded border">
              <code className="text-sm whitespace-pre-wrap">{formData.testInstructions || 'Please fill out the test instructions field'}</code>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-8">
        <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
          <Save className="w-5 h-5" />
          Step-by-Step Submission
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-yellow-800">
          <li>Upload your extension ZIP file to the Chrome Web Store</li>
          <li>In the Store Listing page, copy and paste each field above</li>
          <li>Upload your icon (128x128) and screenshots</li>
          <li>Go to Privacy tab and fill out the required information</li>
          <li>Set your Distribution settings (Free/Public recommended)</li>
          <li>Add Test Instructions</li>
          <li>Click "Save Draft" frequently</li>
          <li>When complete, click "Submit for Review"</li>
        </ol>
      </div>

      {isReadyToSubmit() && (
        <div className="bg-green-100 border-2 border-green-300 rounded-xl p-6 mt-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-xl font-bold text-green-800 mb-2">Ready to Submit!</h3>
          <p className="text-green-700 mb-4">
            All your information is ready. Use the copy buttons above to transfer your content to the Chrome Web Store.
          </p>
        </div>
      )}
    </div>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0: return <StoreListing />;
      case 1: return <PrivacySection />;
      case 2: return <DistributionSection />;
      case 3: return <FinalSteps />;
      case 4: return <SubmitProcess />;
      default: return <StoreListing />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header onShowLoginModal={onShowLoginModal} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            🧙‍♂️ Chrome Store Success Wizard
          </h1>
          <p className="text-xl text-gray-200 mb-2">
            Your magical guide to Chrome Web Store publishing success
          </p>
          <p className="text-lg text-gray-300">
            No tech experience needed • Takes about 20-30 minutes
          </p>
        </div>

        <ProgressTracker />
        <SectionNavigation />

        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          {renderCurrentSection()}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              currentSection === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
            disabled={currentSection === sections.length - 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              currentSection === sections.length - 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            Next
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreSubmissionGuide;