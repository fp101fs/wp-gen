import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import { Download, Zap, Code, Globe, Shield, Sparkles, Upload, X, Gift, User, Settings, Crown, HelpCircle, Moon, LogOut, GitBranch } from 'lucide-react';
// JSZip will be loaded dynamically when needed
import { GoogleGenerativeAI } from '@google/generative-ai';
import FeaturesModal from './FeaturesModal';
import MyExtensions from './MyExtensions';
import Gallery from './Gallery';
import LoginModal from './LoginModal';
import TipsModal from './components/TipsModal';
import TemplatesModal from './components/TemplatesModal';
import Header from './Header';
import FilesDisplay from './FilesDisplay';
import DownloadButton from './DownloadButton';
import InstallationInstructions from './InstallationInstructions';
import TokenProvider, { useTokenContext } from './contexts/TokenContext';
import { DebugProvider } from './contexts/DebugContext';
import TokenBalance from './components/TokenBalance';
import TokenGuard from './components/TokenGuard';
import TokenSystemValidation from './components/TokenSystemValidation';
import UpgradePrompt from './components/UpgradePrompt';
import PageContainer from './components/PageContainer';
import { supabase } from './supabaseClient';
import { debugLog, debugError, debugWarn } from './utils/debugUtils';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Lazy load non-critical components
const ExtensionDetail = lazy(() => import('./ExtensionDetail'));
const RevisionModal = lazy(() => import('./RevisionModal'));
const GalleryPage = lazy(() => import('./GalleryPage'));
const PricingPage = lazy(() => import('./PricingPage'));
const AdminPage = lazy(() => import('./AdminPage'));
const AccountPage = lazy(() => import('./AccountPage'));
const PaymentSuccess = lazy(() => import('./PaymentSuccess'));
const LearnPage = lazy(() => import('./LearnPage'));
const LearnArticle = lazy(() => import('./LearnArticle'));
const StoreSubmissionGuide = lazy(() => import('./StoreSubmissionGuide'));

// Wrapper component for revision modal with token integration

// Helper function to get display name for AI models
const getModelDisplayName = (modelId) => {
  const modelNames = {
    'gemini': 'Gemini 2.5 Pro',
    'chatgpt': 'ChatGPT 4o',
    'claude': 'Claude Sonnet 4',
    'claude-opus': 'Claude Opus 4.1',
    'claude-sonnet-4-5': 'Claude Sonnet 4.5'
  };
  return modelNames[modelId] || modelId;
};

// Helper function to get emoji for AI models
const getModelEmoji = (modelId) => {
  const modelEmojis = {
    'gemini': '🤖',
    'chatgpt': '💬',
    'claude': '🧠',
    'claude-opus': '🧠',
    'claude-sonnet-4-5': '🧠'
  };
  return modelEmojis[modelId] || '🤖';
};

// Helper function to get credit cost for AI models
const getModelCreditCost = (modelId) => {
  const modelCosts = {
    'gemini': 1,
    'chatgpt': 1,
    'claude': 1,
    'claude-opus': 20,
    'claude-sonnet-4-5': 5
  };
  return modelCosts[modelId] || 1;
};

// Helper function to get plan-based image upload size limits in bytes
const getImageUploadSizeLimit = (planName) => {
  const sizeLimits = {
    'free': 100 * 1024, // 100KB
    'pro': 200 * 1024, // 200KB
    'unlimited': 2 * 1024 * 1024 // 2MB
  };
  return sizeLimits[planName] || sizeLimits['free'];
};

// Helper function to repair malformed JSON strings
const repairJsonString = (jsonStr) => {
  debugLog('Starting JSON repair...');
  
  // First, try to handle the most common issue: unescaped content in string values
  let repaired = jsonStr;
  
  // Find all string values in the JSON (content between quotes after colons)
  const stringValueRegex = /(":"\s*")([^"]*)(\"(?:\s*[,}\]]))/g;
  
  repaired = repaired.replace(stringValueRegex, (match, start, content, end) => {
    // Escape problematic characters in the content
    let fixedContent = content
      .replace(/\\/g, '\\')    // Escape backslashes first
      .replace(/"/g, '\"')      // Escape quotes
      .replace(/\n/g, '\n')     // Escape newlines
      .replace(/\r/g, '\r')     // Escape carriage returns
      .replace(/\t/g, '\t')     // Escape tabs
      .replace(/\f/g, '\f')     // Escape form feeds
      .replace(/\b/g, '\b');    // Escape backspaces
    
    return start + fixedContent + end;
  });
  
  // Remove trailing commas
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
  
  // Ensure proper brace closure
  const openBraces = (repaired.match(/\{/g) || []).length;
  const closeBraces = (repaired.match(/\}/g) || []).length;
  
  if (openBraces > closeBraces) {
    repaired += '}}'.repeat(openBraces - closeBraces);
  }
  
  return repaired;
};

// Helper function to validate and resolve extension data
const validateAndResolve = (extensionData, parentExtension, resolve, reject) => {
  // Check if this is the expected format with name/description/files
  if (extensionData.name && extensionData.files && typeof extensionData.files === 'object') {
    debugLog('Successfully parsed extension data (full format):', extensionData.name);
    resolve(extensionData);
    return;
  }
  
  // Check if this is a revision response with just files (when parentExtension exists)
  if (typeof extensionData === 'object' && !extensionData.name && !extensionData.files) {
    // Check if it looks like a files object (has file extensions)
    const keys = Object.keys(extensionData);
    const hasFileExtensions = keys.some(key => 
      key.includes('.js') || key.includes('.html') || key.includes('.css') || key.includes('.json')
    );
    
    if (hasFileExtensions) {
      if (parentExtension) {
        debugLog('Found revision files-only format, will be handled by revision logic');
        // For revisions, return the files directly - the parent logic will handle wrapping
        resolve(extensionData);
      } else {
        debugLog('Found files-only format, wrapping in proper structure');
        const wrappedData = {
          name: "Extension", // Default name
          description: "Generated extension", 
          files: extensionData
        };
        resolve(wrappedData);
      }
      return;
    }
  }
  
  throw new Error('Invalid extension data structure - missing required fields');
};

// Helper function to convert File to base64 string
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Remove the data:image/...;base64, prefix to get just the base64 data
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper function to prepare image data for AI providers
const prepareImageForAPI = async (uploadedImage) => {
  if (!uploadedImage) return null;
  
  const base64Data = await fileToBase64(uploadedImage);
  const mimeType = uploadedImage.type;
  
  return {
    base64: base64Data,
    mimeType: mimeType,
    size: uploadedImage.size
  };
};

// Global helper function for robust JSON parsing from Gemini responses
const parseGeminiResponse = (text, parentExtension = null) => {
  return new Promise((resolve, reject) => {
    debugLog('Raw AI response (first 1000 chars):', text.substring(0, 1000));
    
    let jsonContent = text.trim();
    
    // First, try to parse directly as JSON (text may already be cleaned by main extraction)
    if (jsonContent.startsWith('{') || jsonContent.startsWith('[')) {
      debugLog('Text already looks like clean JSON, attempting direct parse...');
      debugLog('JSON content length:', jsonContent.length);
      debugLog('JSON content preview (last 100 chars):', jsonContent.slice(-100));
      try {
        const extensionData = JSON.parse(jsonContent);
        debugLog('✅ Direct JSON parse successful');
        
        // Proceed to validation logic
        return validateAndResolve(extensionData, parentExtension, resolve, reject);
      } catch (directParseError) {
        debugLog('❌ Direct JSON parse failed:', directParseError.message);
        debugLog('❌ Direct JSON parse error position:', directParseError.message.match(/position (\d+)/)?.[1]);
        console.log('❌ JSON around error position (if available):', 
          directParseError.message.includes('position') ? 
          jsonContent.substring(Math.max(0, parseInt(directParseError.message.match(/position (\d+)/)?.[1] || 0) - 50), 
          parseInt(directParseError.message.match(/position (\d+)/)?.[1] || 0) + 50) : 'N/A'
        );
        debugLog('❌ Trying extraction methods...');
      }
    }
    
    // If direct parsing failed, try extraction methods
    jsonContent = null;
    
    // Look for ```json blocks first - handle both complete and incomplete blocks
    let jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
      jsonContent = jsonBlockMatch[1].trim();
      debugLog('Found complete JSON block, length:', jsonContent.length);
    } else {
      // Try to find incomplete ```json block (missing closing backticks)
      const incompleteJsonMatch = text.match(/```json\s*([\s\S]*?)$/);
      if (incompleteJsonMatch) {
        jsonContent = incompleteJsonMatch[1].trim();
        debugLog('Found incomplete JSON block (missing closing ```), length:', jsonContent.length);
        
        // Try to detect if JSON is truncated by checking if it ends properly
        if (!jsonContent.endsWith('}') && !jsonContent.endsWith('"}')) {
          debugLog('⚠️  Response appears truncated - JSON doesn\'t end properly');
          // We'll still try to parse it, but note it's potentially incomplete
        }
      } else {
        // Look for any code block that might contain JSON
        const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          const blockContent = codeBlockMatch[1].trim();
          // Check if it looks like JSON (starts with { and contains "name" and "files")
          if (blockContent.startsWith('{') && blockContent.includes('"name"') && blockContent.includes('"files"')) {
            jsonContent = blockContent;
            debugLog('Found potential JSON in code block, length:', jsonContent.length);
          }
        }
      }
    }
    
    // If no code blocks found, try to extract JSON from the full text
    if (!jsonContent) {
      debugLog('🔍 Searching for JSON in full text...');
      debugLog('🔍 Text starts with:', text.substring(0, 50));
      debugLog('🔍 Looking for pattern: {\s*"name"');
      
      // Look for the first occurrence of { followed by "name"
      const jsonStart = text.search(/\{\s*"name"/);
      debugLog('🔍 JSON start position:', jsonStart);
      if (jsonStart !== -1) {
        // Find the matching closing brace by counting braces
        let braceCount = 0;
        let jsonEnd = jsonStart;
        let foundEnd = false;
        
        for (let i = jsonStart; i < text.length; i++) {
          if (text[i] === '{') braceCount++;
          if (text[i] === '}') braceCount--;
          if (braceCount === 0) {
            jsonEnd = i;
            foundEnd = true;
            break;
          }
        }
        
        if (foundEnd) {
          jsonContent = text.substring(jsonStart, jsonEnd + 1);
          debugLog('✅ Extracted JSON from text, length:', jsonContent.length);
        } else {
          // Braces don't match - response might be truncated
          debugLog('⚠️  JSON extraction failed - unmatched braces (likely truncated response)');
          // Try to extract what we have and hope it's parseable
          jsonContent = text.substring(jsonStart);
          debugLog('🔧 Attempting to use partial JSON, length:', jsonContent.length);
        }
      }
    }
    
    if (!jsonContent) {
      debugError('No JSON content found in response');
      reject(new Error('No valid JSON found in the response. Please try again.'));
      return;
    }
    
    debugLog('Attempting to parse JSON (first 500 chars):', jsonContent.substring(0, 500));
    
    try {
      const extensionData = JSON.parse(jsonContent);
      validateAndResolve(extensionData, parentExtension, resolve, reject);
      
    } catch (parseError) {
      debugError('JSON parse error:', parseError.message);
      
      // Try to repair the JSON
      debugLog('Attempting to repair JSON...');
      
      try {
        const repairedJson = repairJsonString(jsonContent);
        debugLog('Trying to parse repaired JSON...');
        
        const extensionData = JSON.parse(repairedJson);
        debugLog('✅ Repaired JSON parse successful');
        validateAndResolve(extensionData, parentExtension, resolve, reject);
      } catch (repairError) {
        debugError('Repaired JSON parse failed:', repairError.message);
      }
      
      // Fallback: try basic fixes
      try {
        let fixedJson = jsonContent;
        
        // Remove any trailing commas before } or ]
        fixedJson = fixedJson.replace(/,(\s*[}\]])/g, '$1');
        
        // Ensure the JSON is properly closed
        const openBraces = (fixedJson.match(/\{/g) || []).length;
        const closeBraces = (fixedJson.match(/\}/g) || []).length;
        
        if (openBraces > closeBraces) {
          fixedJson += '}}'.repeat(openBraces - closeBraces);
        }
        
        debugLog('Trying to parse fixed JSON...');
        const extensionData = JSON.parse(fixedJson);
        debugLog('✅ Fixed JSON parse successful');
        validateAndResolve(extensionData, parentExtension, resolve, reject);
      } catch (fixError) {
        debugError('Fixed JSON parse failed:', fixError.message);
      }
      
      reject(new Error(`Failed to parse JSON response: ${parseError.message}. Please try again with a simpler request.`));
    }
  });
};

// Helper function to execute AI generation - extracted from HomePage
const executeAIGeneration = async (currentPrompt, revisionPrompt, parentExtension, uploadedImage, selectedProvider = 'gemini') => {
  // Determine primary provider and available providers
  const primaryProvider = selectedProvider;
  
  // Check if we have API keys for all providers
  const hasGeminiKey = !!process.env.REACT_APP_GEMINI_API_KEY;
  const hasChatGPTKey = !!process.env.REACT_APP_OPENAI_API_KEY;
  const hasClaudeKey = !!process.env.REACT_APP_ANTHROPIC_API_KEY;
  
  // Check if primary provider has API key
  if (primaryProvider === 'gemini' && !hasGeminiKey) {
    throw new Error('Gemini API key not found. Please add REACT_APP_GEMINI_API_KEY to your .env.local file');
  }
  if (primaryProvider === 'chatgpt' && !hasChatGPTKey) {
    throw new Error('OpenAI API key not found. Please add REACT_APP_OPENAI_API_KEY to your .env.local file');
  }
  if ((primaryProvider === 'claude' || primaryProvider === 'claude-opus' || primaryProvider === 'claude-sonnet-4-5') && !hasClaudeKey) {
    throw new Error('Claude API key not found. Please add REACT_APP_ANTHROPIC_API_KEY to your .env.local file');
  }

  // Smart fallback order based on primary provider selection
  let providersToTry = [primaryProvider];
  
  // Define quality-based fallback sequences
  if (primaryProvider === 'gemini') {
    // Gemini → Claude Sonnet 4 → ChatGPT 4o
    if (hasClaudeKey) providersToTry.push('claude');
    if (hasChatGPTKey) providersToTry.push('chatgpt');
  } else if (primaryProvider === 'claude') {
    // Claude Sonnet 4 → Gemini → ChatGPT 4o
    if (hasGeminiKey) providersToTry.push('gemini');
    if (hasChatGPTKey) providersToTry.push('chatgpt');
  } else if (primaryProvider === 'claude-opus') {
    // Claude Opus 4.1 → Gemini → Claude Sonnet 4 → ChatGPT 4o
    if (hasGeminiKey) providersToTry.push('gemini');
    if (hasClaudeKey) providersToTry.push('claude');
    if (hasChatGPTKey) providersToTry.push('chatgpt');
  } else if (primaryProvider === 'claude-sonnet-4-5') {
    // Claude Sonnet 4.5 → Gemini → ChatGPT 4o (no Claude Opus 4.1)
    if (hasGeminiKey) providersToTry.push('gemini');
    if (hasChatGPTKey) providersToTry.push('chatgpt');
  } else if (primaryProvider === 'chatgpt') {
    // ChatGPT 4o → Claude Sonnet 4 → Gemini
    if (hasClaudeKey) providersToTry.push('claude');
    if (hasGeminiKey) providersToTry.push('gemini');
  }
  
  // Remove duplicates (shouldn't happen, but just in case)
  providersToTry = [...new Set(providersToTry)];

  let lastError = null;

  // Try each provider
  for (const currentProvider of providersToTry) {
    const isSecondaryAttempt = currentProvider !== primaryProvider;
    
    if (isSecondaryAttempt) {
      debugLog(`🔄 Primary provider (${primaryProvider}) failed, trying fallback provider (${currentProvider})...`);
    }

    try {
      // Retry logic for empty responses per provider
      const MAX_RETRIES = currentProvider === 'claude-opus' ? 1 : 3;
      const RETRY_DELAYS = [1000, 2000, 4000]; // 1s, 2s, 4s
      let extensionData; // Declare outside the loop
      
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        let result;
        debugLog(`🚀 Sending request to ${currentProvider.toUpperCase()}... (attempt ${attempt} of ${MAX_RETRIES})`);
        
        // Prepare image data if available
        let imageData = null;
        if (uploadedImage) {
          try {
            imageData = await prepareImageForAPI(uploadedImage);
            debugLog(`Image data prepared: ${imageData.mimeType}, size: ${imageData.size} bytes`);
            
            // Check image size limits (5MB for Claude, 20MB for others)
            const maxSize = currentProvider === 'claude' ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
            if (imageData.size > maxSize) {
              console.warn(`⚠️  Image size (${Math.round(imageData.size / 1024 / 1024)}MB) exceeds ${currentProvider} limit. Proceeding without image.`);
              imageData = null;
            }
          } catch (imageError) {
            debugError('Failed to process image:', imageError);
            debugLog('Proceeding without image data');
            imageData = null;
          }
        }
        
        // Build AI prompt (shared between providers)
        let aiPrompt;
        if (parentExtension) {
          // This is a revision
          aiPrompt = `You are an expert WordPress Developer. Your task is to revise an existing plugin based on a user's request.

IMPORTANT: You must modify the existing code to incorporate the user's changes. Do NOT generate a new plugin from scratch. Return the COMPLETE, modified code for all files, not just the changed parts.

SECURITY RULES (MUST FOLLOW):
- Start every PHP file with: <?php defined('ABSPATH') || exit;
- Sanitize all inputs using sanitize_text_field(), sanitize_email(), etc.
- Escape all outputs using esc_html(), esc_attr(), esc_url()
- Use WP Nonces for all form actions
- Use $wpdb->prepare() for all database queries

User Request: "${revisionPrompt.replace(/"/g, '"')}"

Existing Plugin Files:
\`\`\`json
${JSON.stringify(parentExtension.files, null, 2)}
\`\`\`

Respond with ONLY a valid JSON object containing the FULL, updated code for all files. The JSON structure should be:

{
  "name": "${parentExtension.name}",
  "description": "${parentExtension.description}",
  "files": {
    "${parentExtension.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.php": "... complete updated main plugin file ...",
    "includes/class-main.php": "... complete updated class file if needed ..."
  },
  "instructions": "... updated instructions if necessary ..."
}`;
        } else {
            // This is a new plugin
            let basePrompt = `Create a WordPress plugin: "${currentPrompt.replace(/"/g, '"')}"`;
            if (imageData) {
              basePrompt += `\n\nIMPORTANT: Analyze the provided image carefully and incorporate its visual design into the plugin:
- Extract and use the exact colors, fonts, and styling from the image
- Replicate the layout, spacing, and visual hierarchy shown
- Match the overall aesthetic and design patterns
- If it's a dashboard/interface, recreate the same components and structure
- Use CSS that closely matches the visual style you see`;
            }
            aiPrompt = `You are an expert WordPress Developer. Generate high-quality, secure WordPress plugins.

SECURITY RULES (MUST FOLLOW):
- Start every PHP file with: <?php defined('ABSPATH') || exit;
- Sanitize all inputs using sanitize_text_field(), sanitize_email(), absint(), etc.
- Escape all outputs using esc_html(), esc_attr(), esc_url()
- Use WP Nonces for all form actions (wp_nonce_field, wp_verify_nonce)
- Use $wpdb->prepare() for all database queries
- Use current_user_can() for permission checks

PLUGIN STRUCTURE:
- Main plugin file must include the WordPress Plugin Header
- Use proper WordPress hooks (add_action, add_filter)
- Follow WordPress Coding Standards
- Prefix all functions and classes with unique prefix

${basePrompt}

Respond with ONLY a valid JSON object:

{
  "name": "Plugin Name",
  "slug": "plugin-slug",
  "description": "Brief description",
  "files": {
    "plugin-slug.php": "<?php\\n/**\\n * Plugin Name: Plugin Name\\n * Description: Brief description\\n * Version: 1.0.0\\n * Author: plugin.new\\n */\\n\\ndefined('ABSPATH') || exit;\\n\\n// Plugin code here",
    "includes/class-main.php": "complete file contents as string"
  },
  "instructions": "Installation: Upload via WordPress Admin (Plugins > Add New > Upload Plugin) or extract to wp-content/plugins/"
}

Requirements:
- Include proper WordPress Plugin Header in main file
- All PHP files must start with defined('ABSPATH') || exit;
- Keep code concise but functional
- Use WordPress hooks appropriately
- Make admin UI clean and WordPress-native
${imageData ? '- CRITICAL: Carefully study the provided image and recreate its visual design as closely as possible' : ''}

IMPORTANT: Response must be valid JSON only. The "files" object should contain all necessary files to make the plugin work. Keep file contents concise to avoid truncation.`;
        }

        debugLog('Prompt length:', aiPrompt.length, 'characters');
        debugLog('Full prompt being sent:', aiPrompt);
        
        if (currentProvider === 'gemini') {
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
          
          debugLog('Making API call to Gemini...');
          
          // Prepare content array - include image if available
          const contentArray = [];
          
          if (imageData) {
            debugLog('Adding image to Gemini request');
            contentArray.push({
              inlineData: {
                mimeType: imageData.mimeType,
                data: imageData.base64
              }
            });
          }
          
          contentArray.push({ text: aiPrompt });
          
          result = await model.generateContent(contentArray);
          debugLog('Received result object from Gemini:', result);
          
        } else if (currentProvider === 'chatgpt') {
          const { default: OpenAI } = await import('openai');
          const openai = new OpenAI({
            apiKey: process.env.REACT_APP_OPENAI_API_KEY,
            dangerouslyAllowBrowser: true
          });
          
          debugLog('Making API call to ChatGPT...');
          
          // Prepare messages - include image if available
          const messages = [
            {
              role: "system",
              content: "You are an expert WordPress Developer. Generate high-quality, secure WordPress plugins. You respond only with valid JSON objects as specified."
            }
          ];
          
          // Prepare user message content
          const userMessageContent = [];
          
          if (imageData) {
            debugLog('Adding image to ChatGPT request');
            userMessageContent.push({
              type: "image_url",
              image_url: {
                url: `data:${imageData.mimeType};base64,${imageData.base64}`
              }
            });
          }
          
          userMessageContent.push({
            type: "text",
            text: aiPrompt
          });
          
          messages.push({
            role: "user",
            content: userMessageContent
          });
          
          result = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: messages,
            temperature: 0.7,
            max_tokens: 8192  // Increased from 4096 to reduce truncation
          });
          debugLog('Received result object from ChatGPT:', result);
          
        } else if (currentProvider === 'claude' || currentProvider === 'claude-opus' || currentProvider === 'claude-sonnet-4-5') {
          const { default: Anthropic } = await import('@anthropic-ai/sdk');
          const anthropic = new Anthropic({
            apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
            dangerouslyAllowBrowser: true
          });
          
          // Determine which Claude model to use
          const claudeModel = currentProvider === 'claude-opus'
            ? "claude-opus-4-1-20250805"
            : currentProvider === 'claude-sonnet-4-5'
            ? "claude-sonnet-4-5"
            : "claude-sonnet-4-20250514";
          
          debugLog(`Making API call to ${currentProvider === 'claude-opus' ? 'Claude Opus 4.1' : currentProvider === 'claude-sonnet-4-5' ? 'Claude Sonnet 4.5' : 'Claude Sonnet 4'}...`);
          
          // Prepare message content - include image if available
          const messageContent = [];
          
          if (imageData) {
            debugLog('Adding image to Claude request');
            messageContent.push({
              type: "image",
              source: {
                type: "base64",
                media_type: imageData.mimeType,
                data: imageData.base64
              }
            });
          }
          
          messageContent.push({
            type: "text",
            text: aiPrompt
          });
          
          result = await anthropic.messages.create({
            model: claudeModel,
            max_tokens: 8192,
            temperature: 0.7,
            system: "You are an expert WordPress Developer. Generate high-quality, secure WordPress plugins. You respond only with valid JSON objects as specified.",
            messages: [
              {
                role: "user",
                content: messageContent
              }
            ]
          });
          debugLog(`Received result object from ${currentProvider === 'claude-opus' ? 'Claude Opus' : currentProvider === 'claude-sonnet-4-5' ? 'Claude Sonnet 4.5' : 'Claude Sonnet'}:`, result);
        }
        
        // Extract text from response based on provider  
        let text;
        if (currentProvider === 'chatgpt') {
          // ChatGPT response processing
          if (result.choices && result.choices.length > 0) {
            text = result.choices[0].message.content;
            debugLog('ChatGPT text extracted successfully');
            
            // Check if response was truncated
            if (result.choices[0].finish_reason === 'length') {
              debugLog('⚠️  ChatGPT response was truncated due to max_tokens limit');
            }
          } else {
            throw new Error('EMPTY_RESPONSE_RETRY');
          }
          
          if (!text || text.trim().length === 0) {
            throw new Error('EMPTY_RESPONSE_RETRY');
          }
        } else if (currentProvider === 'claude' || currentProvider === 'claude-opus' || currentProvider === 'claude-sonnet-4-5') {
          // Claude response processing (all Claude models)
          if (result.content && result.content.length > 0 && result.content[0].text) {
            text = result.content[0].text;
            debugLog(`${currentProvider === 'claude-opus' ? 'Claude Opus' : currentProvider === 'claude-sonnet-4-5' ? 'Claude Sonnet 4.5' : 'Claude Sonnet'} text extracted successfully`);
            
            // Check if response was truncated
            if (result.stop_reason === 'max_tokens') {
              debugLog(`⚠️  ${currentProvider === 'claude-opus' ? 'Claude Opus' : currentProvider === 'claude-sonnet-4-5' ? 'Claude Sonnet 4.5' : 'Claude Sonnet'} response was truncated due to max_tokens limit`);
            }
          } else {
            throw new Error('EMPTY_RESPONSE_RETRY');
          }
          
          if (!text || text.trim().length === 0) {
            throw new Error('EMPTY_RESPONSE_RETRY');
          }
        } else {
          // Gemini response processing (simplified for now)
          const response = result.response;
          
          // Simple Gemini text extraction
          try {
            text = response.text();
          } catch (error) {
            if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
              text = response.candidates[0].content.parts[0].text;
            } else {
              throw new Error('EMPTY_RESPONSE_RETRY');
            }
          }
          
          if (!text || text.trim().length === 0) {
            throw new Error('EMPTY_RESPONSE_RETRY');
          }
        }
        
        // Common processing for both providers
        extensionData = await parseGeminiResponse(text, parentExtension);
        
        // If we get here, the request was successful
        debugLog('Successfully generated extension on attempt ' + attempt);
        break;
        
      } catch (parseError) {
        debugError(`Parse error on attempt ${attempt} with ${currentProvider.toUpperCase()}:`, parseError.message);
        
        // If this is not the last attempt, retry with delay
        if (attempt < MAX_RETRIES) {
          debugLog(`Retrying ${currentProvider.toUpperCase()} in ${RETRY_DELAYS[attempt - 1]}ms... (attempt ${attempt + 1} of ${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt - 1]));
          continue;
        }
        
        // Final attempt failed, store the error and try next provider
        lastError = parseError;
        debugLog(`❌ ${currentProvider.toUpperCase()} failed after ${MAX_RETRIES} attempts`);
        break; // Exit retry loop and try next provider
      }
    }

    // If we successfully got extension data, continue with processing
    if (extensionData) {
      // Handle different response structures for revisions vs new extensions
    let processedData;
    if (parentExtension && !extensionData.name && !extensionData.files) {
      // This is a revision response with files directly at the root level
      processedData = {
        name: parentExtension.name,
        description: parentExtension.description,
        files: extensionData,
        instructions: parentExtension.instructions || 'Upload via WordPress Admin (Plugins > Add New > Upload Plugin)'
      };
    } else if (extensionData.name && extensionData.files) {
      // This is a standard response structure
      processedData = extensionData;
    } else {
      throw new Error('Invalid extension data structure from AI. Please try again.');
    }
    
    if (!processedData.name || !processedData.files) {
      throw new Error('Invalid extension data structure from AI. Please try again.');
    }

    debugLog('Successfully generated revision:', processedData.name);
    
    // Calculate version for this revision
    let extensionVersion = '1.0';
    if (parentExtension && parentExtension.version) {
      const parentVersion = parentExtension.version;
      const versionParts = parentVersion.split('.').map(Number);
      if (versionParts.length === 2 && versionParts[1] === 0) {
        extensionVersion = `${versionParts[0]}.1`;
      } else if (versionParts.length >= 2) {
        extensionVersion = `${versionParts[0]}.${versionParts[1] + 1}`;
      } else {
        extensionVersion = '1.1';
      }
    }
    
    // Update manifest.json with correct version
    if (processedData.files && processedData.files['manifest.json']) {
      try {
        const manifest = JSON.parse(processedData.files['manifest.json']);
        manifest.version = extensionVersion;
        processedData.files['manifest.json'] = JSON.stringify(manifest, null, 2);
      } catch (manifestError) {
        console.warn('Could not parse manifest.json to update version:', manifestError);
      }
    }
    
    // Add version to extension data
    processedData.version = extensionVersion;

      return {
        success: true,
        extensionData: processedData,
        needsSaving: true,
        actualProvider: currentProvider
      };
    }

    } catch (providerError) {
      debugError(`Provider ${currentProvider} failed:`, providerError.message);
      lastError = providerError;
      // Continue to next provider
    }
  }

  // If we get here, all providers failed
  const errorMessage = lastError?.message || 'All AI providers failed to generate extension';
  debugError('❌ All providers failed:', errorMessage);
  throw new Error(errorMessage);
};



function HomePage({ session, sessionLoading, onShowLoginModal, isRevisionModalOpen, setIsRevisionModalOpen, extensionToRevise, setExtensionToRevise }) {
  const [prompt, setPrompt] = useState(() => {
    // Initialize prompt from localStorage if available
    try {
      const savedPrompt = localStorage.getItem('cx-gen-prompt');
      return savedPrompt || '';
    } catch (error) {
      console.warn('Failed to load saved prompt:', error);
      return '';
    }
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Function to update prompt and save to localStorage
  const updatePrompt = useCallback((newPrompt) => {
    setPrompt(newPrompt);
    try {
      if (newPrompt.trim()) {
        localStorage.setItem('cx-gen-prompt', newPrompt);
      } else {
        localStorage.removeItem('cx-gen-prompt');
      }
    } catch (error) {
      console.warn('Failed to save prompt to localStorage:', error);
    }
  }, []);

  // Function to clear saved prompt
  const clearSavedPrompt = useCallback(() => {
    try {
      localStorage.removeItem('cx-gen-prompt');
    } catch (error) {
      console.warn('Failed to clear saved prompt:', error);
    }
  }, []);
  const [generatedExtension, setGeneratedExtension] = useState(null);
  const [error, setError] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showMyExtensions, setShowMyExtensions] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [userExtensions, setUserExtensions] = useState([]);
  const [loadingMessage, setLoadingMessage] = useState('Activating AI...');
  const [messageIndex, setMessageIndex] = useState(0);
  const [selectedLLM, setSelectedLLM] = useState('claude-sonnet-4-5');
  
  // Token context integration
  const { generateWithTokens, isGenerating, isLoading, currentTokens, isUnlimited, showUpgradePromptAction, planName } = useTokenContext();

  // Animated placeholder examples
  const placeholderExamples = [
    "Make an extension that displays a dashboard which looks exactly like the attached image",
    "Add dark mode CSS to any site with one click",
    "Display a random motivational quote on each new tab",
    "Show how long you've spent on the current tab.",
    "Make a Focus Mode extension to block distracting sites (like Reddit, YouTube) temporarily",
    "Create a password generator that creates secure passwords",
    "Build a quick note-taking popup that saves to local storage",
    "Make a website screenshot tool that captures full pages",
    "Create a text-to-speech reader for any webpage",
    "Build a currency converter that shows real-time exchange rates"
  ];

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const loadingMessages = [
    'Generating your extension...'
  ];

  useEffect(() => {
    let interval;
    if (isGenerating) {
      interval = setInterval(() => {
        setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
      }, 5000); // Change message every 5 seconds
    } else {
      setMessageIndex(0); // Reset to first message when not generating
    }

    return () => {
      clearInterval(interval);
    };
  }, [isGenerating]);

  useEffect(() => {
    if (session) {
      fetchUserExtensions();
    }
  }, [session]);

  // Typing animation for placeholder text
  useEffect(() => {
    if (prompt.trim()) {
      // If user is typing, don't show placeholder animation
      return;
    }

    const currentText = placeholderExamples[currentPlaceholder];
    let timeoutId;

    if (isTyping) {
      // Typing effect
      if (displayText.length < currentText.length) {
        timeoutId = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        }, 50 + Math.random() * 50); // Vary typing speed slightly
      } else {
        // Finished typing, pause then start deleting
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      // Deleting effect
      if (displayText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 30);
      } else {
        // Finished deleting, move to next example
        setCurrentPlaceholder((prev) => (prev + 1) % placeholderExamples.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayText, isTyping, currentPlaceholder, placeholderExamples, prompt]);

  // Restore form data from localStorage after auth (only on homepage)
  useEffect(() => {
    const restorePendingGeneration = () => {
      try {
        const savedData = localStorage.getItem('cx-gen-pending-generation');
        if (savedData && session) {
          const formData = JSON.parse(savedData);
          // Only restore if data is recent (within 1 hour) AND came from homepage
          const oneHour = 60 * 60 * 1000;
          if (Date.now() - formData.timestamp < oneHour && formData.fromHomepage && formData.prompt?.trim()) {
            setPrompt(formData.prompt || '');
            setImagePreview(formData.imagePreview || null);
            setIsPublic(formData.isPublic !== undefined ? formData.isPublic : true);
            
            // Just clear the data, don't auto-generate
            localStorage.removeItem('cx-gen-pending-generation');
          } else {
            // Clear old or invalid data
            localStorage.removeItem('cx-gen-pending-generation');
          }
        }
      } catch (error) {
        debugError('Error restoring form data:', error);
        localStorage.removeItem('cx-gen-pending-generation');
      }
    };

    // Only run this on the homepage component, not globally
    if (session) {
      restorePendingGeneration();
    }
  }, [session]);

  const fetchUserExtensions = async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from('extensions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      debugError('Error fetching extensions:', error);
    } else {
      setUserExtensions(data);
    }
  };


  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      // Check plan-based size limits
      const sizeLimit = getImageUploadSizeLimit(planName);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const sizeLimitMB = (sizeLimit / (1024 * 1024)).toFixed(1);

      if (file.size > sizeLimit) {
        // Show graceful error with upgrade CTA
        const planUpgradeMessage = planName === 'free'
          ? 'Upgrade to Pro for 200KB limit or Max for 2MB limit'
          : planName === 'pro'
          ? 'Upgrade to Max for 2MB limit'
          : 'File exceeds 2MB limit';

        showUpgradePromptAction(
          `Image too large (${fileSizeMB}MB). Current limit: ${sizeLimitMB}MB. ${planUpgradeMessage}`
        );
        // Clear the file input
        event.target.value = '';
        return;
      }

      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setImagePreview(base64);
        debugLog('Image preview set:', base64.substring(0, 50) + '...');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
  };


  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Tokenized revision handler
  const handleTokenizedRevision = async (revisionPrompt, parentExtension, selectedLLM = 'gemini') => {
    if (!revisionPrompt.trim()) {
      setError('Please enter a revision description');
      return;
    }

    // Check if user is logged in
    if (!session) {
      onShowLoginModal();
      return;
    }

    try {
      setError('');
      setGeneratedExtension(null);
      setIsRevisionModalOpen(false); // Close the revision modal

      // Use the token-integrated generation for revisions with custom token cost for Claude Opus
      const tokenCost = (selectedLLM === 'claude-opus') ? 20 : (selectedLLM === 'claude-sonnet-4-5') ? 5 : 1;
      const result = await generateWithTokens(
        async () => {
          // Ensure we have the extension files for revision
          let extensionWithFiles = parentExtension;
          if (!parentExtension.files) {
            debugLog('📁 Fetching extension files for revision...', parentExtension.id);
            const { data, error } = await supabase
              .from('extensions')
              .select('files')
              .eq('id', parentExtension.id)
              .single();
            
            if (error) {
              debugError('Error fetching extension files:', error);
              throw new Error('Failed to load extension files for revision');
            }
            
            if (!data.files) {
              throw new Error('Extension files not found');
            }
            
            extensionWithFiles = { ...parentExtension, files: data.files };
            debugLog('✅ Extension files loaded for revision');
          }
          
          const aiResult = await executeAIGeneration(revisionPrompt, revisionPrompt, extensionWithFiles, null, selectedLLM);
          if (!aiResult.success) {
            throw new Error(aiResult.error);
          }

          // Save revision to database
          if (session && aiResult.needsSaving) {
            const newRevision = {
              user_id: session.user.id,
              name: aiResult.extensionData.name,
              description: aiResult.extensionData.description,
              prompt: parentExtension.prompt, // Keep original prompt
              files: aiResult.extensionData.files,
              is_public: parentExtension.is_public, // Inherit privacy setting
              parent_id: parentExtension.id, // Link to parent
              version: aiResult.extensionData.version,
              revision_prompt: revisionPrompt, // Store the revision request
              has_uploaded_image: parentExtension.has_uploaded_image || false,
              ai_model: aiResult.actualProvider || selectedLLM,
            };

            const { data, error: insertError } = await supabase
              .from('extensions')
              .insert([newRevision])
              .select()
              .single();

            if (insertError) {
              debugError('Error saving revision:', insertError);
              throw new Error('Failed to save revision to database');
            }

            debugLog('Revision saved:', data);
            fetchUserExtensions();

            return {
              success: true,
              extensionId: data.id,
              extensionData: aiResult.extensionData
            };
          }

          return {
            success: true,
            extensionData: aiResult.extensionData
          };
        },
        `Extension revision: ${revisionPrompt} (${selectedLLM})`,
        tokenCost
      );

      // Check if upgrade is required (user has insufficient tokens)
      if (result.requiresUpgrade) {
        // The upgrade modal should already be shown by TokenContext
        // Don't set error, just return
        return;
      }

      // Handle successful revision
      if (session && result.extensionId) {
        // Clear the saved prompt on successful revision
        clearSavedPrompt();
        setPrompt('');
        // Navigate to the newly created revision detail page
        navigate(`/extension/${result.extensionId}?completed=revision`);
      } else if (result.extensionData) {
        // Clear the saved prompt on successful revision
        clearSavedPrompt();
        setPrompt('');
        setGeneratedExtension(result.extensionData);
      }
      
    } catch (error) {
      debugError('Tokenized revision failed:', error);
      
      // Check if this is an upgrade-required case (shouldn't happen with new logic, but safety check)
      if (error.message?.includes('Insufficient tokens')) {
        // The upgrade modal should have already been shown by the TokenContext
        return;
      }
      
      setError(`Failed to generate revision: ${error.message}`);
    }
  };

  // New tokenized generation handler
  const handleTokenizedGeneration = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description of your WordPress plugin');
      return;
    }

    // Check if user is logged in, show login modal if not
    if (!session) {
      // Store current form state in localStorage before showing login modal
      const formData = {
        prompt,
        imagePreview,
        isPublic,
        timestamp: Date.now(),
        fromHomepage: true
      };
      localStorage.setItem('cx-gen-pending-generation', JSON.stringify(formData));
      onShowLoginModal();
      return;
    }

    // Check for sufficient tokens before attempting generation
    if (!isUnlimited && currentTokens === 0) {
      showUpgradePromptAction('Need more credits to generate extension');
      return;
    }

    try {
      setError('');
      setGeneratedExtension(null);
      if (isRevisionModalOpen) setIsRevisionModalOpen(false);
      if (showGallery) setShowGallery(false);
      if (showMyExtensions) setShowMyExtensions(false);

      // Use the token-integrated generation with custom token cost for Claude Opus
      const tokenCost = (selectedLLM === 'claude-opus') ? 20 : (selectedLLM === 'claude-sonnet-4-5') ? 5 : 1;
      const result = await generateWithTokens(
        async () => {
          const aiResult = await executeAIGeneration(prompt, null, null, uploadedImage, selectedLLM);
          if (!aiResult.success) {
            throw new Error(aiResult.error);
          }

          // Save to database if user is logged in
          if (session && aiResult.needsSaving) {
            const newExtension = {
              user_id: session.user.id,
              name: aiResult.extensionData.name,
              description: aiResult.extensionData.description,
              prompt: prompt,
              files: aiResult.extensionData.files,
              is_public: isPublic,
              parent_id: null,
              version: aiResult.extensionData.version,
              revision_prompt: null,
              has_uploaded_image: !!uploadedImage,
              ai_model: aiResult.actualProvider || selectedLLM,
            };

            const { data, error: insertError } = await supabase
              .from('extensions')
              .insert([newExtension])
              .select()
              .single();

            if (insertError) {
              debugError('Error saving extension:', insertError);
              throw new Error('Failed to save extension to database');
            }

            debugLog('Extension saved:', data);
            fetchUserExtensions();
            
            return {
              success: true,
              extensionId: data.id,
              extensionData: aiResult.extensionData
            };
          }

          return {
            success: true,
            extensionData: aiResult.extensionData
          };
        },
        `Extension generation (${selectedLLM})`,
        tokenCost
      );

      // Check if upgrade is required (user has insufficient tokens)
      if (result.requiresUpgrade) {
        // The upgrade modal should already be shown by TokenContext
        // Don't set error, just return
        return;
      }

      // Handle successful generation
      if (session && result.extensionId) {
        // Clear the saved prompt on successful generation
        clearSavedPrompt();
        setPrompt('');
        // Navigate to the newly created extension detail page
        navigate(`/extension/${result.extensionId}?completed=generation`);
      } else if (result.extensionData) {
        // Clear the saved prompt on successful generation
        clearSavedPrompt();
        setPrompt('');
        setGeneratedExtension(result.extensionData);
      }
      
      // Clear form data on success
      localStorage.removeItem('cx-gen-pending-generation');
    } catch (error) {
      debugError('Tokenized generation failed:', error);
      
      // Check if this is an upgrade-required case (shouldn't happen with new logic, but safety check)
      if (error.message?.includes('Insufficient tokens')) {
        // The upgrade modal should have already been shown by the TokenContext
        return;
      }
      
      setError(`Failed to generate extension: ${error.message}`);
    }
  };

  // Legacy generateExtension for revisions (keeping existing behavior)
  const generateExtension = async (revisionPrompt, parentExtension) => {
    const currentPrompt = revisionPrompt || prompt;
    if (!currentPrompt.trim()) {
      setError('Please enter a description of your WordPress plugin');
      return;
    }

    // For revisions, use the old approach (not token-integrated yet)
    try {
      // Ensure we have the extension files for revision
      let extensionWithFiles = parentExtension;
      if (parentExtension && !parentExtension.files) {
        debugLog('📁 Fetching extension files for legacy revision...', parentExtension.id);
        const { data, error } = await supabase
          .from('extensions')
          .select('files')
          .eq('id', parentExtension.id)
          .single();
        
        if (error) {
          debugError('Error fetching extension files:', error);
          setError('Failed to load extension files for revision');
          return;
        }
        
        if (!data.files) {
          setError('Extension files not found');
          return;
        }
        
        extensionWithFiles = { ...parentExtension, files: data.files };
        debugLog('✅ Extension files loaded for legacy revision');
      }
      
      const result = await executeAIGeneration(currentPrompt, revisionPrompt, extensionWithFiles, null, 'gemini');
      
      if (!result.success) {
        setError(result.error);
        return;
      }

      const extensionData = result.extensionData;
      
      if (session && result.needsSaving) {
        // User is logged in, save to database and navigate to detail page
        const newExtension = {
          user_id: session.user.id,
          name: extensionData.name,
          description: extensionData.description,
          prompt: parentExtension ? parentExtension.prompt : currentPrompt,
          files: extensionData.files,
          is_public: isPublic,
          parent_id: parentExtension ? parentExtension.id : null,
          version: extensionData.version,
          revision_prompt: revisionPrompt || null,
          has_uploaded_image: (!parentExtension && !!uploadedImage) || (parentExtension?.has_uploaded_image || false),
          ai_model: result.actualProvider || selectedLLM,
        };

        const { data, error: insertError } = await supabase
          .from('extensions')
          .insert([newExtension])
          .select()
          .single();

        if (insertError) {
          debugError('Error saving extension:', insertError);
          setGeneratedExtension(extensionData);
        } else {
          debugLog('Extension saved:', data);
          fetchUserExtensions();
          localStorage.removeItem('cx-gen-pending-generation');
          navigate(`/extension/${data.id}`);
        }
      } else {
        setGeneratedExtension(extensionData);
        localStorage.removeItem('cx-gen-pending-generation');
      }
    } catch (err) {
      debugError('Generation error:', err);
      setError(`Failed to generate extension: ${err.message}. Please try again with a clearer description.`);
    }
  };

  const createPreviewHtml = () => {
    if (!generatedExtension || !generatedExtension.files) return '';
    const htmlFile = Object.keys(generatedExtension.files).find(name => name.endsWith('.html'));
    if (!htmlFile) {
      return '<div style="padding: 20px; font-family: Arial; color: #333;">Preview unavailable: No HTML file found in the generated extension.</div>';
    }
    let html = generatedExtension.files[htmlFile];
    const cssFile = Object.keys(generatedExtension.files).find(name => name.endsWith('.css'));
    const css = cssFile ? generatedExtension.files[cssFile] : '';
    if (!html || typeof html !== 'string') {
      return '<div style="padding: 20px; font-family: Arial; color: #333;">Preview unavailable - HTML content is incomplete</div>';
    }
    html = html.replace(/<link.*rel=\"stylesheet\".*>/g, '');
    const fallbackCss = `body { margin: 0; padding: 10px; font-family: Arial, sans-serif; background-color: #ffffff; color: #333333; min-height: 100%; box-sizing: border-box; } * { box-sizing: border-box; }`;
    const combinedCss = fallbackCss + '\n' + (css || '');
    if (html.includes('</head>')) {
      html = html.replace('</head>', `<style>${combinedCss}</style></head>`);
    } else {
      html = `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <title>Preview</title>\n  <style>${combinedCss}</style>\n</head>\n<body>\n  ${html}\n</body>\n</html>`;
    }
    return html;
  };


  const handleSelectExtension = (extension) => {
    setShowMyExtensions(false);
    setShowGallery(false);
    navigate(`/extension/${extension.id}`);
  };

  const handleUseTemplate = (templatePrompt) => {
    setPrompt(templatePrompt);
    // Focus on the input field after a brief delay to ensure the modal closes first
    setTimeout(() => {
      const inputElement = document.querySelector('textarea[placeholder*="extension"]');
      if (inputElement) {
        inputElement.focus();
        inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };


  return (
    <PageContainer>
      <Header 
        onShowFeaturesModal={() => setShowFeaturesModal(true)}
        onShowLoginModal={onShowLoginModal}
      />
        
        {/* Token Balance Display - Commented out for cleaner homepage */}
        {/* <div className="flex justify-center mb-8">
          <TokenBalance size="large" showDetails />
        </div> */}
        
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 px-2 lcp-heading">
            No Code WordPress Plugin Builder
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 px-2">
            Turn any idea into a WordPress plugin with AI - no coding required
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-2">
          <div className="bg-gray-800 rounded-2xl sm:rounded-[28px] p-4 sm:p-6 shadow-2xl mb-8">
            <div className="mb-4">
              <textarea
                className="w-full h-20 sm:h-24 bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none text-lg sm:text-xl"
                placeholder={prompt.trim() ? "Ask AI to create a WordPress plugin for my.." : (displayText + (isTyping && displayText.length < placeholderExamples[currentPlaceholder].length ? "|" : "")) || "Ask AI to create a WordPress plugin for my.."}
                value={prompt}
                onChange={(e) => {
                  updatePrompt(e.target.value);
                }}
                disabled={isGenerating}
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-0">
                <div className="flex items-center space-x-2 flex-wrap gap-y-2 gap-x-2">
                  {!imagePreview ? (
                    <label className="cursor-pointer flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-full text-white text-sm sm:text-base font-medium hover:bg-gray-600 transition-colors">
                      <span className="text-lg sm:text-xl">+</span>
                      <span>Image</span>
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isGenerating}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Uploaded preview"
                          className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-md"
                        />
                      )}
                      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-full text-white text-sm sm:text-base font-medium">
                        <span>Image Attached</span>
                        <button onClick={removeImage} className="text-red-400 hover:text-red-300">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="relative inline-block text-left">
                    <select
                      value={isPublic ? 'public' : 'private'}
                      onChange={(e) => setIsPublic(e.target.value === 'public')}
                      className="px-4 py-2 bg-gray-700 rounded-full text-white text-sm sm:text-base font-medium hover:bg-gray-600 transition-colors appearance-none focus:outline-none"
                      aria-label="Extension visibility"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <div className="relative inline-block text-left">
                    <select
                      value={selectedLLM}
                      onChange={(e) => {
                        setSelectedLLM(e.target.value);
                        debugLog('🔄 LLM changed to:', e.target.value);
                      }}
                      className="px-2 sm:px-4 py-2 bg-gray-700 rounded-full text-white text-sm sm:text-base font-medium hover:bg-gray-600 transition-colors appearance-none focus:outline-none cursor-pointer text-transparent sm:text-white w-10 sm:w-auto"
                      disabled={isGenerating}
                      aria-label="Select AI model"
                    >
                      <option value="claude-sonnet-4-5">🧠 Claude Sonnet 4.5 ⚡ 5</option>
                      <option value="claude-opus">🧠 Claude Opus 4.1 ⚡ 20</option>
                      <option value="gemini">🤖 Gemini 2.5 Pro ⚡ 1</option>
                      <option value="claude">🧠 Claude Sonnet 4 ⚡ 1</option>
                      <option value="chatgpt">💬 ChatGPT 4o ⚡ 1</option>
                    </select>
                    {/* Mobile emoji overlay */}
                    <div className="sm:hidden absolute inset-0 pointer-events-none flex items-center justify-center text-lg">
                      {getModelEmoji(selectedLLM)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => handleTokenizedGeneration()}
                    disabled={isGenerating || isLoading || !prompt.trim()}
                    className={`h-12 sm:h-14 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:bg-gray-200 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isGenerating ? 'w-auto px-4' : 'w-12 sm:w-14'}`}
                  >
                    {isGenerating ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 border-b-2 border-black"></div>
                        <span className="text-base sm:text-lg hidden sm:inline">{loadingMessages[messageIndex]}</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                        <span className="text-lg sm:text-xl font-bold">{getModelCreditCost(selectedLLM)}</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Token count row - positioned below button and right-aligned */}
              {sessionLoading ? (
                <div className="flex items-center justify-center sm:justify-end space-x-1 pt-2">
                  <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
                  <div className="w-16 h-4 bg-gray-600 rounded animate-pulse"></div>
                  <div className="w-8 h-4 bg-gray-600 rounded animate-pulse"></div>
                  <div className="w-12 h-4 bg-gray-600 rounded animate-pulse"></div>
                </div>
              ) : session && (
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-1 gap-y-1 text-sm sm:text-base font-medium pt-2">
                  {isLoading ? (
                    <>
                      <span className="text-gray-300">Loading credits</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 text-yellow-400" />
                      <span className={`${
                        isUnlimited ? 'text-green-400' :
                        currentTokens > 2 ? 'text-green-400' :
                        currentTokens > 0 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {isUnlimited ? 'unlimited' : currentTokens}
                      </span>
                      <span className="text-gray-300">
                        {isUnlimited ? 'credits' : `credit${currentTokens !== 1 ? 's' : ''} remaining`}
                      </span>
                      {!isUnlimited && (
                        <button
                          onClick={() => showUpgradePromptAction('Get more credits from prompt area')}
                          className="text-blue-400 hover:text-blue-300 text-sm underline underline-offset-2 hover:no-underline transition-all ml-1"
                        >
                          Get more
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {generatedExtension && (
            <div className="mt-6 sm:mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-8 border border-white/20 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    {generatedExtension.name}
                    {generatedExtension.version && (
                      <span className="text-yellow-400 ml-2">v{generatedExtension.version}</span>
                    )}
                  </h2>
                  <p className="text-gray-300 text-sm sm:text-base">{generatedExtension.description}</p>
                </div>
                <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2">
                  <DownloadButton extension={generatedExtension} />
                  <button
                    onClick={() => {
                      setExtensionToRevise(generatedExtension);
                      setIsRevisionModalOpen(true);
                    }}
                    className="bg-lime-400 hover:bg-lime-500 text-black font-semibold font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors duration-300 flex items-center space-x-2 text-sm sm:text-base"
                  >
                    <GitBranch className="w-4 h-4" />
                    <span className="hidden sm:inline">Revise this Extension</span>
                    <span className="sm:hidden">Revise</span>
                  </button>
                </div>
              </div>

              {Object.keys(generatedExtension.files).some(name => name.endsWith('.html')) && (
                <div className="mb-6 bg-gray-800 p-3 sm:p-6 rounded-lg">
                  <h3 className="text-white text-base sm:text-lg font-semibold mb-4">Extension Preview</h3>
                  <div className="flex justify-center overflow-x-auto">
                    <div className="bg-gray-100 p-2 sm:p-3 rounded-lg shadow-xl min-w-0">
                      <div className="bg-gray-300 px-2 sm:px-3 py-1 rounded-t-lg border-b">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-700 ml-2">WordPress Plugin</span>
                        </div>
                      </div>
                      <div className="bg-white" style={{width: 'min(450px, calc(100vw - 120px))', height: 'min(500px, 60vh)'}}>
                        <iframe
                          srcDoc={createPreviewHtml()}
                          width="100%"
                          height="100%"
                          style={{border: 'none', borderRadius: '0 0 8px 8px', minWidth: '300px', minHeight: '400px'}}
                          title="Extension Preview"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm text-center mt-3">
                    This is how your plugin admin interface will look
                  </p>
                </div>
              )}

              <FilesDisplay files={generatedExtension.files} />

              <InstallationInstructions instructions={generatedExtension.instructions} />
            </div>
          )}
        </div>

      <div className="flex justify-center items-center gap-6 mt-12">
        <button
          onClick={() => setShowTipsModal(true)}
          className="bg-lime-400 hover:bg-lime-500 text-black px-6 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <HelpCircle className="w-5 h-5" />
          Tips
        </button>
        <button
          onClick={() => setShowTemplatesModal(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <Code className="w-5 h-5" />
          Templates
        </button>
      </div>

      {/* Below-the-fold SEO Content */}
      <div className="max-w-6xl mx-auto px-4 mt-20 space-y-16">

        {/* How It Works Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">How to Build WordPress Plugins with AI</h2>
          <p className="text-gray-300 text-lg mb-12">Create powerful WordPress plugins in minutes without any coding knowledge</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-semibold text-white mb-3">1. Describe Your Idea</h3>
              <p className="text-gray-300">Simply type what you want your WordPress plugin to do. Our AI understands natural language and WordPress functionality needs.</p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-white mb-3">2. AI Generates Code</h3>
              <p className="text-gray-300">Advanced AI models create complete plugin files with proper WordPress headers, hooks, and all necessary code following WordPress coding standards.</p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-3">3. Download & Install</h3>
              <p className="text-gray-300">Get your plugin as a ZIP file, upload via WordPress Admin, and activate immediately. Perfect for rapid prototyping.</p>
            </div>
          </div>
        </section>

        {/* Popular Plugin Types */}
        <section>
          <h2 className="text-3xl font-bold text-white text-center mb-4">Popular WordPress Plugin Ideas</h2>
          <p className="text-gray-300 text-lg text-center mb-12">Build these plugin types and more with our no-code WordPress plugin builder</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-5 border border-blue-300/30">
              <h4 className="text-white font-semibold mb-2">Admin Dashboards</h4>
              <p className="text-gray-300 text-sm">Custom admin panels, settings pages, analytics widgets, and site management tools.</p>
            </div>

            <div className="bg-gradient-to-br from-lime-500/20 to-neutral-500/20 rounded-xl p-5 border border-lime-300/30">
              <h4 className="text-white font-semibold mb-2">Custom Post Types</h4>
              <p className="text-gray-300 text-sm">Portfolio items, testimonials, team members, products, and custom content types.</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-5 border border-green-300/30">
              <h4 className="text-white font-semibold mb-2">Shortcodes & Blocks</h4>
              <p className="text-gray-300 text-sm">Custom shortcodes, Gutenberg blocks, widgets, and content enhancement tools.</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-5 border border-orange-300/30">
              <h4 className="text-white font-semibold mb-2">API Integrations</h4>
              <p className="text-gray-300 text-sm">Social media tools, CRM connectors, payment gateways, and third-party service integrations.</p>
            </div>
          </div>
        </section>

        {/* Why No-Code Section */}
        <section className="bg-gradient-to-r from-lime-900/20 to-neutral-900/30 rounded-2xl p-8 border border-lime-500/30">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose No-Code WordPress Plugin Development?</h2>
            <p className="text-gray-300 text-lg">Build professional WordPress plugins without learning PHP, WordPress hooks, or complex APIs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">⚡</span>
                Speed & Efficiency
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Create plugins in minutes, not weeks</li>
                <li>• No need to learn complex WordPress Plugin APIs</li>
                <li>• Skip the tedious setup and configuration process</li>
                <li>• Focus on your idea, not implementation details</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🎯</span>
                Accessibility & Quality
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Perfect for entrepreneurs and non-developers</li>
                <li>• AI-generated code follows WordPress coding standards</li>
                <li>• Built-in best practices for security and performance</li>
                <li>• Ready for immediate testing and deployment</li>
              </ul>
            </div>
          </div>
        </section>

        {/* AI Technology Section */}
        <section>
          <h2 className="text-3xl font-bold text-white text-center mb-4">Powered by Advanced AI Models</h2>
          <p className="text-gray-300 text-lg text-center mb-12">Our WordPress plugin generator uses cutting-edge AI to create production-ready code</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-500 rounded-full p-2 mt-1">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Smart Code Generation</h4>
                  <p className="text-gray-300">AI understands WordPress plugin architecture and generates clean, commented code that follows WordPress coding standards.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-lime-400 rounded-full p-2 mt-1">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Security & Compliance</h4>
                  <p className="text-gray-300">All generated plugins follow WordPress.org guidelines and implement proper security practices automatically.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-500 rounded-full p-2 mt-1">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">WordPress-Ready Output</h4>
                  <p className="text-gray-300">Plugins come with proper headers, hooks, and documentation needed for WordPress.org submission.</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h4 className="text-white font-semibold mb-4">Extension Quality Features:</h4>
              <ul className="text-gray-300 space-y-2">
                <li>• ✅ Manifest V3 compliance</li>
                <li>• ✅ Cross-browser compatibility</li>
                <li>• ✅ Error handling and validation</li>
                <li>• ✅ Performance optimization</li>
                <li>• ✅ Clean, maintainable code structure</li>
                <li>• ✅ Comprehensive documentation</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <FeaturesModal isOpen={showFeaturesModal} onClose={() => setShowFeaturesModal(false)} />
      <TipsModal isOpen={showTipsModal} onClose={() => setShowTipsModal(false)} />
      <TemplatesModal isOpen={showTemplatesModal} onClose={() => setShowTemplatesModal(false)} onUseTemplate={handleUseTemplate} />
      <MyExtensions isOpen={showMyExtensions} onClose={() => setShowMyExtensions(false)} extensions={userExtensions} onSelectExtension={handleSelectExtension} />
      <Gallery isOpen={showGallery} onClose={() => setShowGallery(false)} onSelectExtension={handleSelectExtension} />
    </PageContainer>
  );
}

// Loading overlay component for generation progress
function GenerationLoadingOverlay() {
  const { isGenerating } = useTokenContext();
  const [messageIndex, setMessageIndex] = useState(0);
  
  const loadingMessages = [
    {
      text: '🚀 Try it out - Install your extension in Chrome',
      buttonText: 'Learn How',
      action: () => window.open('https://www.kromio.ai/learn#install-chrome-extension', '_blank')
    },
    {
      text: '💰 Monetize your extension and earn income',
      buttonText: 'Learn More',
      action: () => window.open('https://www.kromio.ai/learn#monetize-chrome-extension', '_blank')
    },
    {
      text: '🏪 Submit to Chrome Web Store for over 3 billion users',
      buttonText: 'Learn More',
      action: () => window.open('https://www.kromio.ai/learn#submission-guide', '_blank')
    }
  ];

  useEffect(() => {
    let interval;
    if (isGenerating) {
      interval = setInterval(() => {
        setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
      }, 8000); // Change message every 8 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating, loadingMessages.length]);

  if (!isGenerating) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 text-center border border-gray-700 shadow-2xl">
        <div className="mb-6">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-lime-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-lime-400 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Generating Extension</h3>
          <p className="text-gray-300 text-sm mb-4">{loadingMessages[messageIndex].text}</p>
          <button
            onClick={loadingMessages[messageIndex].action}
            className="bg-lime-400 hover:bg-lime-500 text-black font-semibold px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {loadingMessages[messageIndex].buttonText}
          </button>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></div>
            <span>This may take 30-60 seconds</span>
            <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inner App component that has access to TokenContext
function AppContent() {
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [extensionToRevise, setExtensionToRevise] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Global session management for all pages
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  
  // Add access to token context for global upgrade modal
  const { showUpgradePrompt, hideUpgradePrompt, generateWithTokens } = useTokenContext();
  const navigate = useNavigate();
  
  // Session-level deduplication for welcome emails (prevents OAuth race conditions)
  // Using useRef for synchronous access (no async setState delays)
  const processingWelcomeEmails = useRef(new Set());

  // Handle OAuth callback for Google login
  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if this is an OAuth callback (has access_token or code in URL)
      const urlParams = new URLSearchParams(window.location.search);
      const urlHash = window.location.hash;
      const hasAuthParams = urlHash.includes('access_token=') || 
                           urlHash.includes('error=') ||
                           urlParams.has('code');
      
      debugLog('🔍 Auth Callback Debug:', {
        hasAuthParams,
        urlHash: urlHash.substring(0, 100) + '...',
        urlParams: urlParams.toString(),
        pathname: window.location.pathname
      });
      
      if (hasAuthParams) {
        try {
          debugLog('🔄 Processing OAuth callback...');
          
          // Check for errors in the URL
          if (urlHash.includes('error=')) {
            const errorMatch = urlHash.match(/error=([^&]+)/);
            const errorDescMatch = urlHash.match(/error_description=([^&]+)/);
            debugError('❌ OAuth Error:', {
              error: errorMatch ? decodeURIComponent(errorMatch[1]) : 'unknown',
              description: errorDescMatch ? decodeURIComponent(errorDescMatch[1]) : 'no description'
            });
            return;
          }
          
          // Supabase will automatically handle the callback
          const { data, error } = await supabase.auth.getSession();
          debugLog('🎯 Session after callback:', { 
            hasSession: !!data.session, 
            user: data.session?.user?.email,
            error: error?.message 
          });
          
          if (error) {
            debugError('❌ Auth callback error:', error);
          } else if (data.session) {
            debugLog('✅ OAuth callback successful for:', data.session.user.email);
          }
          
          // Clean up the URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          debugError('❌ Error processing auth callback:', error);
        }
      }
    };

    handleAuthCallback();
  }, []);

  // Simple welcome email function with bulletproof deduplication
  const sendWelcomeEmailOnce = async (user) => {
    const callId = Math.random().toString(36).substr(2, 9);
    try {
      debugLog(`📧 [CALL-${callId}] Checking welcome email status for:`, user.email);
      
      // FIRST: Session-level deduplication (fastest protection against OAuth race conditions)
      // Using synchronous ref access to prevent async setState race conditions
      if (processingWelcomeEmails.current.has(user.id)) {
        debugLog(`⚡ [CALL-${callId}] Already processing welcome email for user in this session:`, user.email);
        return; // Already processing, skip immediately
      }
      
      // Mark as processing immediately (synchronous, no async delays)
      processingWelcomeEmails.current.add(user.id);
      debugLog(`🔒 [CALL-${callId}] Marked user as processing welcome email (synchronous):`, user.email);
      debugLog(`📊 [CALL-${callId}] Current processing set size:`, processingWelcomeEmails.current.size, 'Users:', Array.from(processingWelcomeEmails.current));
      
      // SECOND: Database deduplication (persistent protection)
      // Use maybeSingle() to handle case where user_profiles record doesn't exist yet
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('welcome_email_sent')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError) {
        debugLog('⚠️ Could not check welcome email status (non-critical):', profileError.message);
        return; // Skip if we can't check status
      }
      
      // If profile exists and email was already sent, skip
      if (profile?.welcome_email_sent) {
        debugLog('⏭️ Welcome email already sent for:', user.email);
        return; // Already sent, skip
      }
      
      // If no profile exists yet, that's okay - treat as "not sent yet"
      if (!profile) {
        debugLog('📝 User profile not found yet (normal for new users):', user.email);
      }
      
      // Send the welcome email (API will handle all database flag updates)
      debugLog(`📤 [CALL-${callId}] Sending welcome email for new user:`, user.email);
      const response = await fetch('/api/send-welcome-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: user.email, 
          name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          user_id: user.id
        }),
      });
      
      if (!response.ok) {
        debugLog('❌ Welcome email API error:', await response.text());
        return;
      }
      
      const result = await response.json();
      if (result.already_sent) {
        debugLog('⏭️ Welcome email already sent (API level):', user.email);
      } else {
        debugLog(`✅ [CALL-${callId}] Welcome email sent successfully:`, user.email);
      }
      
    } catch (error) {
      debugLog('❌ Welcome email error (non-critical):', error.message);
      // Never throw - email failures shouldn't break anything
    }
  };


  // Initialize global session management
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoading(false);
      debugLog('🌐 Global session initialized:', session?.user?.email || 'Not logged in');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      debugLog('🌐 Global auth state change:', event, session?.user?.email || 'Not logged in');
      
      // Handle welcome emails for new signups
      // CRITICAL: Only process SIGNED_IN events, never INITIAL_SESSION (prevents duplicate emails)
      if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user;
        const createdAt = new Date(user.created_at);
        const now = new Date();
        const isRecentlyCreated = (now - createdAt) < 60 * 60 * 1000; // Within 1 hour
        
        // Only send welcome emails for recent signups (not existing user logins)
        if (isRecentlyCreated) {
          debugLog('🎉 New user signup detected via SIGNED_IN:', user.email);
          sendWelcomeEmailOnce(user);
        } else {
          debugLog('👋 Existing user login via SIGNED_IN:', user.email);
        }
      } else if (event === 'INITIAL_SESSION' && session?.user) {
        debugLog('📋 Initial session detected (no welcome email needed):', session.user.email);
      }
      
      setSession(session);
      setSessionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReviseFromDetail = useCallback((extension) => {
    setExtensionToRevise(extension);
    setIsRevisionModalOpen(true);
  }, []);

  const handleShowLoginModal = useCallback(() => {
    setShowLoginModal(true);
  }, []);

  const handleCloseLoginModal = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  const handleAuthSuccess = () => {
    setShowLoginModal(false);
    // No need to auto-generate here since this is shared across pages
  };

  // Global revision handler that works from any page
  const handleGlobalTokenizedRevision = async (revisionPrompt, parentExtension, selectedLLM = 'gemini') => {

    if (!revisionPrompt.trim()) {
      return;
    }

    // Check if user is logged in
    if (!session) {
      handleShowLoginModal();
      return;
    }

    try {
      setIsRevisionModalOpen(false); // Close the revision modal

      // Use the token-integrated generation for revisions with custom token cost for Claude Opus
      const tokenCost = (selectedLLM === 'claude-opus') ? 20 : (selectedLLM === 'claude-sonnet-4-5') ? 5 : 1;
      const result = await generateWithTokens(
        async () => {
          // Ensure we have the extension files for revision
          let extensionWithFiles = parentExtension;
          if (!parentExtension.files) {
            debugLog('📁 Fetching extension files for revision...', parentExtension.id);
            const { data, error } = await supabase
              .from('extensions')
              .select('files')
              .eq('id', parentExtension.id)
              .single();
            
            if (error) {
              debugError('Error fetching extension files:', error);
              throw new Error('Failed to load extension files for revision');
            }
            
            if (!data.files) {
              throw new Error('Extension files not found');
            }
            
            extensionWithFiles = { ...parentExtension, files: data.files };
            debugLog('✅ Extension files loaded for revision');
          }
          
          const aiResult = await executeAIGeneration(revisionPrompt, revisionPrompt, extensionWithFiles, null, selectedLLM);
          if (!aiResult.success) {
            throw new Error(aiResult.error);
          }

          // Save revision to database
          if (session && aiResult.needsSaving) {
            
            // Find next available version number
            let nextVersion = '1.1';
            if (parentExtension && parentExtension.version) {
              const parentVersion = parentExtension.version;
              const versionParts = parentVersion.split('.').map(Number);
              let major = versionParts[0] || 1;
              let minor = (versionParts[1] || 0) + 1;
              
              // Query existing versions for this parent to find next available
              const { data: existingVersions } = await supabase
                .from('extensions')
                .select('version')
                .eq('parent_id', parentExtension.id);
              
              const existingVersionSet = new Set((existingVersions || []).map(v => v.version));
              
              // Find next available version
              while (existingVersionSet.has(`${major}.${minor}`)) {
                minor++;
              }
              nextVersion = `${major}.${minor}`;
            }
            
            const newRevision = {
              user_id: session.user.id,
              name: aiResult.extensionData.name,
              description: aiResult.extensionData.description,
              prompt: parentExtension.prompt,
              files: aiResult.extensionData.files,
              is_public: parentExtension.is_public,
              parent_id: parentExtension.id,
              version: nextVersion,
              revision_prompt: revisionPrompt,
              has_uploaded_image: parentExtension.has_uploaded_image || false,
              ai_model: aiResult.actualProvider || selectedLLM,
            };

            const { data, error: insertError } = await supabase
              .from('extensions')
              .insert([newRevision])
              .select()
              .single();

            if (insertError) {
              debugError('Error saving revision:', insertError);
              throw new Error('Failed to save revision to database');
            }
            
            return {
              success: true,
              extensionId: data.id,
              extensionData: aiResult.extensionData
            };
          }

          return {
            success: true,
            extensionData: aiResult.extensionData
          };
        },
        `Extension revision: ${revisionPrompt} (${selectedLLM})`,
        tokenCost
      );

      // Check if upgrade is required (user has insufficient tokens)
      if (result.requiresUpgrade) {
        // The upgrade modal should already be shown by TokenContext
        return;
      }

      // Navigate to the newly created revision detail page
      if (session && result.extensionId) {
        navigate(`/extension/${result.extensionId}?completed=revision`);
      }
      
    } catch (error) {
      debugError('Revision failed:', error);
      // Could show a toast or alert here if needed
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Global animated background - persists during navigation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-lime-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-lime-400/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-neutral-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Global loading screen until session is confirmed */}
      {sessionLoading ? (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-lime-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-lime-400 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="text-white text-lg font-medium">Loading...</p>
          </div>
        </div>
      ) : (
        <>
          <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
              <div className="text-white text-xl">Loading...</div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<HomePage session={session} sessionLoading={false} onShowLoginModal={handleShowLoginModal} isRevisionModalOpen={isRevisionModalOpen} setIsRevisionModalOpen={setIsRevisionModalOpen} extensionToRevise={extensionToRevise} setExtensionToRevise={setExtensionToRevise} />} />
              <Route path="/gallery" element={<GalleryPage key="gallery" session={session} sessionLoading={false} onShowLoginModal={handleShowLoginModal} onRevise={handleReviseFromDetail} />} />
              <Route path="/my-extensions" element={<GalleryPage key="my-extensions" session={session} sessionLoading={false} defaultViewMode="my" onShowLoginModal={handleShowLoginModal} onRevise={handleReviseFromDetail} />} />
              <Route path="/pricing" element={<PricingPage session={session} sessionLoading={false} onShowLoginModal={handleShowLoginModal} />} />
              <Route path="/extension/:id" element={<ExtensionDetail session={session} sessionLoading={false} onRevise={handleReviseFromDetail} onShowLoginModal={handleShowLoginModal} />} />
              <Route path="/admin" element={<AdminPage session={session} sessionLoading={false} onShowLoginModal={handleShowLoginModal} />} />
              <Route path="/account" element={<AccountPage session={session} sessionLoading={false} onShowLoginModal={handleShowLoginModal} />} />
              <Route path="/test-tokens" element={<TokenSystemValidation />} />
              <Route path="/payment-success" element={<PaymentSuccess session={session} sessionLoading={false} onShowLoginModal={handleShowLoginModal} />} />
              <Route path="/learn" element={<LearnPage onShowLoginModal={handleShowLoginModal} />} />
              <Route path="/learn/:article" element={<LearnArticle onShowLoginModal={handleShowLoginModal} />} />
              <Route path="/submit-guide" element={<StoreSubmissionGuide onShowLoginModal={handleShowLoginModal} />} />
            </Routes>
          </Suspense>
        </>
      )}
      
      {/* Global Generation Loading Overlay */}
      <GenerationLoadingOverlay />
      
      {/* Shared LoginModal for all pages */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={handleCloseLoginModal} 
        onAuthSuccess={handleAuthSuccess} 
      />
      
      {/* Global UpgradePrompt for all pages */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={hideUpgradePrompt}
        trigger="token_limit"
      />
      
      {/* Global RevisionModal for all pages */}
      {isRevisionModalOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center text-white">Loading...</div>}>
          <RevisionModal 
            extension={extensionToRevise} 
            onClose={() => setIsRevisionModalOpen(false)} 
            onGenerateRevision={handleGlobalTokenizedRevision} 
          />
        </Suspense>
      )}
    </div>
  );
}

// Main App component that provides TokenContext
function App() {
  return (
    <DebugProvider>
      <TokenProvider>
        <AppContent />
        <Analytics />
        <SpeedInsights />
      </TokenProvider>
    </DebugProvider>
  );
}

export default App;