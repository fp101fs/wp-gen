import React, { useState } from 'react';
import { X, MessageSquare, HelpCircle, Send, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const SupportFeedbackModal = ({ 
  isOpen, 
  onClose, 
  type = 'support', // 'support' or 'feedback'
  extensionId = null,
  extensionTitle = null 
}) => {
  const [formData, setFormData] = useState({
    subject: extensionTitle ? `Re: ${extensionTitle}` : '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      setError('Message is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please log in to submit a message');
        return;
      }

      const { error: submitError } = await supabase
        .from('user_messages')
        .insert([{
          user_id: user.id,
          extension_id: extensionId,
          type: type,
          subject: formData.subject.trim() || null,
          message: formData.message.trim()
        }]);

      if (submitError) {
        console.error('Error submitting message:', submitError);
        setError('Failed to submit message. Please try again.');
        return;
      }

      setSuccess(true);
      
      // Reset form and close after showing success
      setTimeout(() => {
        setFormData({ subject: '', message: '' });
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting message:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const config = {
    support: {
      title: 'Get Support',
      icon: <HelpCircle className="w-6 h-6" />,
      description: 'Having trouble? We\'re here to help!',
      submitText: 'Send Support Request',
      successText: 'Support request sent! We\'ll get back to you soon.',
      placeholder: 'Please describe the issue you\'re experiencing...'
    },
    feedback: {
      title: 'Send Feedback',
      icon: <MessageSquare className="w-6 h-6" />,
      description: 'Share your thoughts and suggestions',
      submitText: 'Send Feedback',
      successText: 'Thank you for your feedback!',
      placeholder: 'Share your feedback, suggestions, or feature requests...'
    }
  };

  const current = config[type];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${type === 'support' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
              {current.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{current.title}</h2>
              <p className="text-gray-600">{current.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {success && (
          <div className="p-6 bg-green-50 border-b border-green-200">
            <div className="flex items-center gap-3 text-green-800">
              <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
              <p className="font-medium">{current.successText}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Extension Context */}
          {extensionTitle && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Extension:</p>
              <p className="font-medium text-gray-800">{extensionTitle}</p>
            </div>
          )}

          {/* Subject Field */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject {type === 'support' && <span className="text-gray-400">(optional)</span>}
            </label>
            <input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder={`Brief summary of your ${type === 'support' ? 'issue' : 'feedback'}...`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={200}
            />
            <div className="text-right text-sm text-gray-400 mt-1">
              {formData.subject.length}/200 characters
            </div>
          </div>

          {/* Message Field */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder={current.placeholder}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={2000}
              required
            />
            <div className="text-right text-sm text-gray-400 mt-1">
              {formData.message.length}/2,000 characters
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.message.trim()}
              className={`px-6 py-2 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2 ${
                type === 'support' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {current.submitText}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupportFeedbackModal;