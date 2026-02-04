import React, { useState } from 'react';
import { X, Copy, Search, Palette, Zap, FileText, Link, Eye, Settings } from 'lucide-react';

const TemplatesModal = ({ isOpen, onClose, onUseTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!isOpen) return null;

  const templates = [
    {
      id: 1,
      category: 'content',
      icon: <Search className="w-5 h-5" />,
      title: 'Content Analyzer',
      description: 'Analyze and extract information from web pages',
      prompt: 'Make an extension that analyzes the current page for HTML tag ________ and shows a summary in a popup',
      examples: ['headings (h1, h2, h3)', 'images with alt text', 'form inputs', 'external links']
    },
    {
      id: 2,
      category: 'content',
      icon: <FileText className="w-5 h-5" />,
      title: 'Data Scraper',
      description: 'Extract specific data from websites',
      prompt: 'Create an extension that finds all ________ on this page and displays them in a list',
      examples: ['email addresses', 'phone numbers', 'social media links', 'product prices']
    },
    {
      id: 3,
      category: 'productivity',
      icon: <Settings className="w-5 h-5" />,
      title: 'Form Helper',
      description: 'Automate form filling and data entry',
      prompt: 'Build an extension that auto-fills forms with ________ when I click a button',
      examples: ['my contact information', 'saved addresses', 'common passwords', 'frequently used text']
    },
    {
      id: 4,
      category: 'visual',
      icon: <Palette className="w-5 h-5" />,
      title: 'Visual Enhancer',
      description: 'Modify website appearance and styling',
      prompt: 'Make an extension that applies ________ to any website with a toggle button',
      examples: ['dark mode', 'larger font sizes', 'high contrast colors', 'custom CSS themes']
    },
    {
      id: 5,
      category: 'productivity',
      icon: <Copy className="w-5 h-5" />,
      title: 'Text Processor',
      description: 'Process and manipulate selected text',
      prompt: 'Build an extension that ________ selected text when I right-click on it',
      examples: ['translates to Spanish', 'counts words and characters', 'converts to uppercase', 'summarizes with AI']
    },
    {
      id: 6,
      category: 'content',
      icon: <Link className="w-5 h-5" />,
      title: 'Link Manager',
      description: 'Find and organize links on web pages',
      prompt: 'Make an extension that extracts all links containing ________ and saves them to a list',
      examples: ['PDF files', 'specific domains', 'download URLs', 'social media profiles']
    },
    {
      id: 7,
      category: 'productivity',
      icon: <Eye className="w-5 h-5" />,
      title: 'Page Monitor',
      description: 'Track changes and updates on websites',
      prompt: 'Create an extension that alerts me when ________ changes on this page',
      examples: ['page content', 'specific text', 'image sources', 'element visibility']
    },
    {
      id: 8,
      category: 'productivity',
      icon: <Zap className="w-5 h-5" />,
      title: 'Quick Action',
      description: 'Perform common tasks with shortcuts',
      prompt: 'Build an extension that adds a button to ________ on every page I visit',
      examples: ['save page to bookmarks', 'share current URL', 'take a screenshot', 'print the page']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', icon: <FileText className="w-4 h-4" /> },
    { id: 'content', name: 'Content & Data', icon: <Search className="w-4 h-4" /> },
    { id: 'productivity', name: 'Productivity', icon: <Zap className="w-4 h-4" /> },
    { id: 'visual', name: 'Visual & UI', icon: <Palette className="w-4 h-4" /> }
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(template => template.category === selectedCategory);

  const handleUseTemplate = (template) => {
    if (onUseTemplate) {
      onUseTemplate(template.prompt);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Extension Templates</h2>
              <p className="text-blue-100 text-sm">Choose a template to get started quickly</p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{template.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-3 mb-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">TEMPLATE PROMPT:</h4>
                  <div className="text-sm font-mono text-gray-800 bg-white p-2 rounded border">
                    {template.prompt}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">EXAMPLE FILL-INS:</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.examples.map((example, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleUseTemplate(template)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Use This Template
                </button>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600">No templates found for this category.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center border-t border-gray-200">
          <p className="text-sm text-gray-600">
            💡 <strong>Tip:</strong> Templates are starting points! Feel free to modify the prompt to match your specific needs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplatesModal;