import React, { useState } from 'react';
import { X, Copy, Search, FileText, Layout, Code, Mail, Settings, ShoppingCart, LayoutGrid, Users } from 'lucide-react';

const TemplatesModal = ({ isOpen, onClose, onUseTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!isOpen) return null;

  const templates = [
    {
      id: 1,
      category: 'content',
      icon: <FileText className="w-5 h-5" />,
      title: 'Custom Post Types',
      description: 'Add new content types with custom fields',
      prompt: 'Create a plugin that adds a custom post type for ________ with fields for ________',
      examples: ['testimonials with star rating', 'portfolio with project URL', 'team members with role and social links', 'events with date and location']
    },
    {
      id: 2,
      category: 'admin',
      icon: <Layout className="w-5 h-5" />,
      title: 'Admin Dashboard Widgets',
      description: 'Add informative widgets to the WordPress dashboard',
      prompt: 'Build a plugin that adds a dashboard widget showing ________',
      examples: ['site statistics and recent activity', 'quick links to common tasks', 'pending reviews count', 'latest form submissions']
    },
    {
      id: 3,
      category: 'content',
      icon: <Code className="w-5 h-5" />,
      title: 'Shortcodes',
      description: 'Create embeddable content blocks for posts and pages',
      prompt: 'Make a plugin that adds a shortcode to display ________',
      examples: ['a pricing table with 3 tiers', 'an FAQ accordion', 'a team member grid', 'a contact information card']
    },
    {
      id: 4,
      category: 'forms',
      icon: <Mail className="w-5 h-5" />,
      title: 'Contact Forms',
      description: 'Build contact forms with email notifications',
      prompt: 'Create a contact form plugin that ________',
      examples: ['sends emails to admin on submission', 'saves entries to database', 'includes spam protection', 'has customizable fields']
    },
    {
      id: 5,
      category: 'admin',
      icon: <Settings className="w-5 h-5" />,
      title: 'Settings Pages',
      description: 'Add custom settings pages to WordPress admin',
      prompt: 'Build a plugin with a settings page that lets admins configure ________',
      examples: ['site-wide notification banner', 'custom login page styling', 'social media links', 'business hours display']
    },
    {
      id: 6,
      category: 'ecommerce',
      icon: <ShoppingCart className="w-5 h-5" />,
      title: 'WooCommerce Extensions',
      description: 'Extend WooCommerce functionality',
      prompt: 'Create a WooCommerce plugin that ________',
      examples: ['adds a custom product tab', 'shows related products differently', 'adds bulk discount rules', 'customizes the checkout process']
    },
    {
      id: 7,
      category: 'content',
      icon: <LayoutGrid className="w-5 h-5" />,
      title: 'Gutenberg Blocks',
      description: 'Add custom blocks to the block editor',
      prompt: 'Build a plugin that adds a Gutenberg block for ________',
      examples: ['a call-to-action section', 'a testimonial carousel', 'an image comparison slider', 'a pricing card']
    },
    {
      id: 8,
      category: 'admin',
      icon: <Users className="w-5 h-5" />,
      title: 'User Management',
      description: 'Extend user roles and capabilities',
      prompt: 'Create a plugin that ________',
      examples: ['adds a custom user role with specific capabilities', 'shows extra fields on user profiles', 'restricts content by user role', 'logs user activity']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', icon: <FileText className="w-4 h-4" /> },
    { id: 'content', name: 'Content', icon: <Code className="w-4 h-4" /> },
    { id: 'admin', name: 'Admin', icon: <Settings className="w-4 h-4" /> },
    { id: 'forms', name: 'Forms', icon: <Mail className="w-4 h-4" /> },
    { id: 'ecommerce', name: 'E-Commerce', icon: <ShoppingCart className="w-4 h-4" /> }
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
      <div className="bg-gray-900 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700">
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
              <h2 className="text-2xl font-bold">Plugin Templates</h2>
              <p className="text-blue-100 text-sm">Choose a template to get started quickly</p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
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
                className="border border-gray-700 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all bg-gray-800"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-blue-900/50 text-blue-400 p-2 rounded-lg">
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{template.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                  </div>
                </div>

                <div className="bg-gray-900 rounded p-3 mb-3">
                  <h4 className="text-xs font-semibold text-gray-500 mb-2">TEMPLATE PROMPT:</h4>
                  <div className="text-sm font-mono text-gray-300 bg-gray-800 p-2 rounded border border-gray-700">
                    {template.prompt}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 mb-2">EXAMPLE FILL-INS:</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.examples.map((example, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded"
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
              <div className="text-gray-600 mb-2">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-400">No templates found for this category.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 p-4 text-center border-t border-gray-700">
          <p className="text-sm text-gray-400">
            Templates are starting points! Feel free to modify the prompt to match your specific needs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplatesModal;
