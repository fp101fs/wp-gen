import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clipboard, GitBranch, Share2, Star, Check, Sparkles, HelpCircle, MessageSquare, DollarSign, Eye, EyeOff } from 'lucide-react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Header from './Header';
import FeaturesModal from './FeaturesModal';
import MyExtensions from './MyExtensions';
import Gallery from './Gallery';
import FilesDisplay from './FilesDisplay';
import RevisionTree from './RevisionTree';
import SupportFeedbackModal from './components/SupportFeedbackModal';
import DownloadButton from './DownloadButton';
import ExtensionTree from './ExtensionTree';
import InstallationInstructions from './InstallationInstructions';
import PageContainer from './components/PageContainer';
import ExtensionDetailSkeleton from './components/ExtensionDetailSkeleton';
import WhatsNextModal from './components/WhatsNextModal';
import CustomizeExtensionSection from './components/CustomizeExtensionSection';
import useDocumentTitle from './hooks/useDocumentTitle';
import { debugLog, debugError } from './utils/debugUtils';

// Helper function to get display name for AI models
const getModelDisplayName = (modelId) => {
  const modelNames = {
    'gemini': 'Gemini 2.5 Pro',
    'chatgpt': 'ChatGPT 4o',
    'claude': 'Claude Sonnet 4',
    'claude-opus': 'Claude Opus 4.1'
  };
  return modelNames[modelId] || (modelId ? modelId.charAt(0).toUpperCase() + modelId.slice(1) : 'Unknown');
};

const LetterSquare = ({ title }) => {
  const firstLetter = title.charAt(0).toUpperCase();
  const lastLetter = title.charAt(title.length - 1).toUpperCase();
  
  const getColorFromLetter = (letter) => {
    const code = letter.charCodeAt(0);
    const hue = (code * 137.508) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };
  
  const color1 = getColorFromLetter(firstLetter);
  const color2 = getColorFromLetter(lastLetter);
  
  return (
    <div 
      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
      style={{
        background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`
      }}
    >
      {firstLetter}
    </div>
  );
};

// Chrome Icon Component
const ChromeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#4285F4"/>
    <circle cx="12" cy="12" r="6" fill="white"/>
    <circle cx="12" cy="12" r="3" fill="#4285F4"/>
    <path d="M12 2a10 10 0 0 1 8.66 5H12a5 5 0 0 0-4.33 2.5L12 2z" fill="#EA4335"/>
    <path d="M2.34 7A10 10 0 0 1 7.5 16.5L12 12a5 5 0 0 0 0-5H2.34z" fill="#FBBC04"/>
    <path d="M16.5 16.5A10 10 0 0 1 2.34 17H12a5 5 0 0 0 4.33-2.5l.17-14z" fill="#34A853"/>
  </svg>
);

function ExtensionDetail({ session, sessionLoading, onRevise, onShowLoginModal }) {
  const [extension, setExtension] = useState(null);
  const [extensionFiles, setExtensionFiles] = useState(null);
  const [parentExtension, setParentExtension] = useState(null);
  const [allRevisions, setAllRevisions] = useState([]);
  const [loading, setLoading] = useState({
    extension: true,
    revisions: true,
    parent: false
  });

  // Set dynamic page title based on extension name
  const pageTitle = extension ? `${extension.name} - Extension Detail` : 'Extension Detail';
  useDocumentTitle(pageTitle);
  const [error, setError] = useState(null);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [showMyExtensions, setShowMyExtensions] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [userExtensions, setUserExtensions] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [shareStatus, setShareStatus] = useState(null); // 'success', 'error', or null
  const [showCompletionNotice, setShowCompletionNotice] = useState(false);
  const [completionType, setCompletionType] = useState(null); // 'generation' or 'revision'
  const [showWhatsNextModal, setShowWhatsNextModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Function to count descendants of current extension
  const countDescendants = (currentExtensionId, allRevisions) => {
    if (!allRevisions || !currentExtensionId) return 0;
    
    const descendants = [];
    const processedIds = new Set();
    
    // Helper function to find direct children
    const findDirectChildren = (parentId) => {
      return allRevisions.filter(ext => ext.parent_id === parentId);
    };
    
    // Recursively find all descendants starting from current extension
    const addDescendantsRecursively = (parentId) => {
      const children = findDirectChildren(parentId);
      for (const child of children) {
        if (!processedIds.has(child.id)) {
          descendants.push(child);
          processedIds.add(child.id);
          // Recursively add this child's descendants
          addDescendantsRecursively(child.id);
        }
      }
    };
    
    // Add all descendants starting from current extension
    addDescendantsRecursively(currentExtensionId);
    
    return descendants.length;
  };

  useEffect(() => {
    if (id) {
      fetchExtension();
    }
  }, [id]);

  // Check for completion parameter and show appropriate modal/notice
  useEffect(() => {
    const completedParam = searchParams.get('completed');
    if (completedParam && (completedParam === 'generation' || completedParam === 'revision')) {
      setCompletionType(completedParam);

      // Show WhatsNext modal for generation, regular notice for revision
      if (completedParam === 'generation') {
        setShowWhatsNextModal(true);
      } else {
        setShowCompletionNotice(true);
      }

      // Don't modify URL - just let the parameter stay to avoid navigation issues
    }
  }, [searchParams]);

  // Check if extension is favorited when session or extension changes
  useEffect(() => {
    if (session && extension) {
      checkIfFavorited();
    }
  }, [session, extension]);

  // Lazy load files for preview
  const fetchExtensionFiles = async (extensionId) => {
    try {
      const { data, error } = await supabase
        .from('extensions')
        .select('files')
        .eq('id', extensionId)
        .single();
      
      if (error) {
        debugError('Error fetching extension files:', error);
      } else {
        setExtensionFiles(data.files);
      }
    } catch (err) {
      debugError('Error loading files:', err);
    }
  };

  const fetchExtension = async () => {
    try {
      setLoading({
        extension: true,
        revisions: true,
        parent: false
      });

      // Check if user is authenticated
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      // Build query based on authentication status
      let query = supabase
        .from('extensions')
        .select('id, name, description, version, created_at, user_id, parent_id, favorite_count, ai_model, is_public, prompt, revision_prompt, has_uploaded_image')
        .eq('id', id);

      // For unauthenticated users, only fetch public extensions
      if (!currentSession) {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query.single();

      if (error) {
        // Handle different types of errors
        if (!currentSession && error.code === 'PGRST116') {
          // Extension exists but is private - unauthenticated user can't access
          setError('private_extension');
        } else {
          setError('Extension not found');
        }
        debugError('Error fetching extension:', error);
      } else {
        setExtension(data);
        
        // Debug: Log the actual data received from database
        debugLog('ExtensionDetail data received:', data);
        debugLog('favorite_count value:', data.favorite_count);
        debugLog('typeof favorite_count:', typeof data.favorite_count);
        
        // Use favorite_count column directly from extensions table (fastest performance)
        setFavoriteCount(data.favorite_count || 0);
        
        // Find the root extension (the original, not a revision)
        const rootExtensionId = data.parent_id || data.id;
        
        // Update loading state - extension data loaded
        setLoading(prev => ({ ...prev, extension: false }));
        
        // Start loading files in background (don't wait for it)
        fetchExtensionFiles(data.id);
        
        // Fetch parent and revisions in parallel for better performance
        const promises = [];
        
        if (data.parent_id) {
          setLoading(prev => ({ ...prev, parent: true }));
          promises.push(fetchParentExtension(data.parent_id));
        }
        
        promises.push(fetchAllRevisions(rootExtensionId, data.user_id));
        
        // Wait for all queries to complete
        await Promise.all(promises);
        
        setLoading(prev => ({ 
          ...prev, 
          revisions: false, 
          parent: false 
        }));
      }
    } catch (err) {
      setError('Failed to load extension');
      debugError('Error:', err);
    } finally {
      setLoading({
        extension: false,
        revisions: false,
        parent: false
      });
    }
  };

  const fetchParentExtension = async (parentId) => {
    const { data, error } = await supabase
      .from('extensions')
      .select('id, name, version')
      .eq('id', parentId)
      .single();

    if (error) {
      debugError('Error fetching parent extension:', error);
    } else {
      setParentExtension(data);
    }
  };

  const fetchAllRevisions = async (rootExtensionId, extensionOwnerId) => {
    // Optimized: Get extension owner info and all their extensions in one query
    // Use the passed extensionOwnerId parameter
    
    // Get all extensions from the extension owner in one query
    const { data: allUserExtensions, error: allError } = await supabase
      .from('extensions')
      .select('id, name, description, version, created_at, parent_id, user_id, ai_model, prompt, revision_prompt')
      .eq('user_id', extensionOwnerId)
      .order('created_at', { ascending: true });

    if (allError) {
      debugError('Error fetching all user extensions:', allError);
      return;
    }
    
    // Find the actual root extension from the fetched data
    let actualRootId = rootExtensionId;
    const rootExt = allUserExtensions.find(ext => ext.id === rootExtensionId);
    if (rootExt && rootExt.parent_id) {
      actualRootId = rootExt.parent_id;
    }

    if (allError) {
      debugError('Error fetching all user extensions:', allError);
      return;
    }

    // Build a complete family tree - find all extensions that belong to this family
    const familyExtensions = [];
    const processedIds = new Set();
    
    // Helper function to find all descendants of an extension
    const findDescendants = (parentId) => {
      return allUserExtensions.filter(ext => ext.parent_id === parentId);
    };
    
    // Start with the root extension
    const rootExtToAdd = allUserExtensions.find(ext => ext.id === actualRootId);
    if (rootExtToAdd) {
      familyExtensions.push(rootExtToAdd);
      processedIds.add(rootExtToAdd.id);
    }
    
    // Recursively find all descendants
    const addDescendantsRecursively = (parentId) => {
      const children = findDescendants(parentId);
      for (const child of children) {
        if (!processedIds.has(child.id)) {
          familyExtensions.push(child);
          processedIds.add(child.id);
          // Recursively add this child's descendants
          addDescendantsRecursively(child.id);
        }
      }
    };
    
    // Add all descendants starting from the root
    addDescendantsRecursively(actualRootId);

    setAllRevisions(familyExtensions);
  };

  const createPreviewHtml = () => {
    // Use lazily loaded files for preview
    if (!extensionFiles) {
      return '<div style="padding: 20px; font-family: Arial; color: #666; text-align: center;">Loading preview...</div>';
    }
    const htmlFile = Object.keys(extensionFiles).find(name => name.endsWith('.html'));
    if (!htmlFile) {
      return '<div style="padding: 20px; font-family: Arial; color: #333;">Preview unavailable: No HTML file found.</div>';
    }
    let html = extensionFiles[htmlFile];
    const cssFile = Object.keys(extensionFiles).find(name => name.endsWith('.css'));
    const css = cssFile ? extensionFiles[cssFile] : '';
    html = html.replace(/<link.*rel=\"stylesheet\".*>/g, '');
    const fallbackCss = `body { margin: 0; padding: 10px; font-family: Arial, sans-serif; background-color: #ffffff; color: #333333; }`;
    const combinedCss = fallbackCss + '\n' + (css || '');
    if (html.includes('</head>')) {
      return html.replace('</head>', `<style>${combinedCss}</style></head>`);
    } else {
      return `<!DOCTYPE html><html><head><style>${combinedCss}</style></head><body>${html}</body></html>`;
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(extension.prompt);
  };

  const handleCopyRevisionPrompt = () => {
    navigator.clipboard.writeText(extension.revision_prompt);
  };

  // Function to detect if user is on a mobile device
  const isMobileDevice = () => {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints > 0 && window.innerWidth < 768);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${extension.name} - Chrome Extension`;
    const text = `Check out this Chrome extension: ${extension.description}`;

    // Use native share only on actual mobile devices
    if (isMobileDevice() && navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        });
        // No need to show feedback for native share - the OS handles it
      } catch (err) {
        // User cancelled or error occurred, fallback to clipboard
        if (err.name !== 'AbortError') {
          handleCopyToClipboard(url);
        }
      }
    } else {
      // Desktop or no native share - copy to clipboard with visual feedback
      handleCopyToClipboard(url);
    }
  };

  const handleCopyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus('success');
      // Clear the status after 2 seconds
      setTimeout(() => setShareStatus(null), 2000);
    } catch (err) {
      debugError('Failed to copy to clipboard:', err);
      setShareStatus('error');
      setTimeout(() => setShareStatus(null), 2000);
    }
  };

  const handleBack = () => {
    navigate('/gallery');
  };

  const handleDismissCompletionNotice = () => {
    setShowCompletionNotice(false);
  };

  const handleSelectExtension = (extension) => {
    setShowMyExtensions(false);
    setShowGallery(false);
    navigate(`/extension/${extension.id}`);
  };

  const checkIfFavorited = async () => {
    if (!session || !extension) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('extension_id', extension.id);
      
      if (error) {
        debugError('Error checking favorite status:', error);
        setIsFavorited(false);
      } else {
        setIsFavorited(data && data.length > 0);
      }
    } catch (err) {
      debugError('Error checking favorite status:', err);
      setIsFavorited(false);
    }
  };

  const toggleFavorite = async () => {
    if (!session) {
      onShowLoginModal();
      return;
    }
    if (!extension || favoriteLoading) return;
    
    // Optimistic UI updates for better perceived performance
    const wasAlreadyFavorited = isFavorited;
    const previousCount = favoriteCount;
    
    // Update UI immediately
    setIsFavorited(!wasAlreadyFavorited);
    setFavoriteCount(prev => wasAlreadyFavorited ? Math.max(0, prev - 1) : prev + 1);
    setFavoriteLoading(true);
    
    try {
      if (wasAlreadyFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('extension_id', extension.id);
        
        if (error) {
          debugError('Error removing from favorites:', error);
          // Revert optimistic update on error
          setIsFavorited(true);
          setFavoriteCount(previousCount);
        }
        // Note: Database trigger will update favorite_count column automatically
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{
            user_id: session.user.id,
            extension_id: extension.id
          }]);
        
        if (error) {
          debugError('Error adding to favorites:', error);
          // Revert optimistic update on error
          setIsFavorited(false);
          setFavoriteCount(previousCount);
        }
        // Note: Database trigger will update favorite_count column automatically
      }
    } catch (err) {
      debugError('Error toggling favorite:', err);
      // Revert optimistic update on error
      setIsFavorited(wasAlreadyFavorited);
      setFavoriteCount(previousCount);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const toggleVisibility = async () => {
    if (!session || !extension || isUpdatingVisibility) return;

    // Check if user owns the extension
    if (session.user.id !== extension.user_id) return;

    const newVisibility = !extension.is_public;
    const previousVisibility = extension.is_public;

    // Optimistic UI update
    setExtension(prev => ({ ...prev, is_public: newVisibility }));
    setIsUpdatingVisibility(true);

    try {
      const { error } = await supabase
        .from('extensions')
        .update({ is_public: newVisibility })
        .eq('id', extension.id)
        .eq('user_id', session.user.id); // Extra security check

      if (error) {
        debugError('Error updating extension visibility:', error);
        // Revert optimistic update on error
        setExtension(prev => ({ ...prev, is_public: previousVisibility }));
        alert('Failed to update extension visibility. Please try again.');
      }
    } catch (err) {
      debugError('Error toggling visibility:', err);
      // Revert optimistic update on error
      setExtension(prev => ({ ...prev, is_public: previousVisibility }));
      alert('Failed to update extension visibility. Please try again.');
    } finally {
      setIsUpdatingVisibility(false);
    }
  };


  if (loading.extension) {
    return (
      <ExtensionDetailSkeleton 
        showRevisions={loading.revisions}
        showParent={loading.parent}
      />
    );
  }

  if (error === 'private_extension') {
    // Show private extension message for unauthenticated users
    return (
      <PageContainer>
        <Header
          onShowFeaturesModal={() => setShowFeaturesModal(true)}
          onShowLoginModal={onShowLoginModal}
        />

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl text-center">
          <div className="mb-6">
            <EyeOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">This Extension is Private</h1>
            <p className="text-gray-300 text-lg mb-6">
              This extension is not publicly available. Check out the Gallery to discover amazing public extensions created by our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/gallery')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Browse Gallery
              </button>
              <button
                onClick={handleBack}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Go to Gallery
              </button>
            </div>
          </div>
        </div>

        <FeaturesModal isOpen={showFeaturesModal} onClose={() => setShowFeaturesModal(false)} />
      </PageContainer>
    );
  }

  if (error || !extension) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">{error || 'Extension not found'}</div>
          <button
            onClick={handleBack}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            Go to Gallery
          </button>
        </div>
      </div>
    );
  }

  // Check if this is a private extension that the user doesn't own
  const isPrivateAndNotOwner = extension && !extension.is_public && session?.user?.id !== extension.user_id;

  if (isPrivateAndNotOwner) {
    return (
      <PageContainer>
        <Header
          onShowFeaturesModal={() => setShowFeaturesModal(true)}
          onShowLoginModal={onShowLoginModal}
        />

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl text-center">
          <div className="mb-6">
            <EyeOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">This Extension is Private</h1>
            <p className="text-gray-300 text-lg mb-6">
              This extension is not publicly available. Check out the Gallery to discover amazing public extensions created by our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/gallery')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Browse Gallery
              </button>
              <button
                onClick={handleBack}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Go to Gallery
              </button>
            </div>
          </div>
        </div>

        <FeaturesModal isOpen={showFeaturesModal} onClose={() => setShowFeaturesModal(false)} />
      </PageContainer>
    );
  }

  // SEO Meta Tags and Structured Data
  const seoTitle = extension ? `${extension.name} - Chrome Extension | Kromio` : 'Chrome Extension - Kromio';
  const seoDescription = extension ? 
    `${extension.description} Download this Chrome extension created with Kromio AI.` :
    'Chrome extension details and download';
  const extensionUrl = `https://kromio.ai/extension/${id}`;

  const structuredData = extension ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": extension.name,
    "description": extension.description,
    "applicationCategory": "BrowserApplication",
    "operatingSystem": "Chrome Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Kromio.ai"
    },
    "url": extensionUrl,
    "dateCreated": extension.created_at,
    "dateModified": extension.updated_at || extension.created_at
  } : null;

  return (
    <PageContainer>
      {/* SEO Meta Tags */}
      {extension && (
        <>
          <title>{seoTitle}</title>
          <meta name="description" content={seoDescription} />
          <meta property="og:title" content={seoTitle} />
          <meta property="og:description" content={seoDescription} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={extensionUrl} />
          <meta property="og:image" content="https://kromio.ai/kromio.webp" />
          <meta property="twitter:card" content="summary" />
          <meta property="twitter:title" content={seoTitle} />
          <meta property="twitter:description" content={seoDescription} />
          <meta property="twitter:image" content="https://kromio.ai/kromio.webp" />
          <link rel="canonical" href={extensionUrl} />
          
          {/* Structured Data */}
          {structuredData && (
            <script type="application/ld+json">
              {JSON.stringify(structuredData)}
            </script>
          )}
        </>
      )}
      
      <Header 
        onShowFeaturesModal={() => setShowFeaturesModal(true)}
        onShowLoginModal={onShowLoginModal}
      />
        
      {/* Completion Notice */}
      {showCompletionNotice && (
        <div className="mb-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 sm:p-6 backdrop-blur-lg shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                  {completionType === 'generation' ? '🎉 Extension Generated Successfully!' : '✨ Revision Completed Successfully!'}
                </h3>
                <p className="text-green-200 text-sm sm:text-base">
                  {completionType === 'generation' 
                    ? 'Your Chrome extension has been created and is ready to download and install!' 
                    : 'Your extension has been updated with the requested changes!'}
                </p>
              </div>
            </div>
            <button
              onClick={handleDismissCompletionNotice}
              className="text-green-300 hover:text-white transition-colors ml-4 flex-shrink-0"
              aria-label="Dismiss notice"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-8 border border-white/20 shadow-2xl">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4 md:justify-center md:space-x-4">
              <div className="w-1/5 flex justify-center md:w-auto">
                <LetterSquare title={extension.name} />
              </div>
              <div className="w-3/5 md:w-auto">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">
                  {extension.name}
                </h1>
              </div>
              <div className="w-1/5 flex flex-col items-center md:w-auto">
                {extension.version && (
                  <span className="text-yellow-400 text-lg sm:text-xl md:text-2xl font-bold">v{extension.version}</span>
                )}

                {/* Visibility Toggle - Only show for extension owners */}
                {!sessionLoading && session?.user?.id === extension.user_id && (
                  <button
                    onClick={toggleVisibility}
                    disabled={isUpdatingVisibility}
                    className={`mt-2 flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      extension.is_public
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                    } ${isUpdatingVisibility ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {isUpdatingVisibility ? (
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : extension.is_public ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                    <span>{extension.is_public ? 'Public' : 'Private'}</span>
                  </button>
                )}
              </div>
            </div>
            
            <p className="text-gray-300 text-center mb-4 text-lg sm:text-xl">{extension.description}</p>
            
            {/* Stats Row - Favorites and Revisions */}
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-12 sm:space-x-16">
                {sessionLoading ? (
                  <>
                    {/* Loading placeholder for favorite button */}
                    <div className="flex flex-col items-center space-y-2 min-w-[80px]">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-600 rounded animate-pulse"></div>
                      <div className="w-16 h-6 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-2 min-w-[80px]">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-600 rounded animate-pulse"></div>
                      <div className="w-20 h-6 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={session ? toggleFavorite : onShowLoginModal}
                      disabled={favoriteLoading}
                      className="flex flex-col items-center hover:text-yellow-400 transition-colors disabled:opacity-50 min-w-[100px]"
                      aria-label={session ? (isFavorited ? 'Remove from favorites' : 'Add to favorites') : 'Login to favorite this extension'}
                    >
                      <Star 
                        className={`w-9 h-9 sm:w-10 sm:h-10 ${
                          isFavorited 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-400'
                        }`} 
                      />
                      <div className="text-xl sm:text-2xl text-gray-400 mt-2 font-medium">
                        {favoriteCount} <span className="text-base sm:text-lg">favorites</span>
                      </div>
                    </button>
                    
                    <div className="flex flex-col items-center text-gray-400 min-w-[100px]">
                      <GitBranch className="w-9 h-9 sm:w-10 sm:h-10" />
                      <div className="text-xl sm:text-2xl mt-2 font-medium">
                        {countDescendants(extension?.id, allRevisions)} <span className="text-base sm:text-lg">revisions</span>
                      </div>
                    </div>
                    
                    <div className="hidden sm:flex flex-col items-center text-gray-400 min-w-[120px]">
                      {extension?.ai_model && (
                        <>
                          <Sparkles className="w-9 h-9 sm:w-10 sm:h-10" />
                          <div className="text-base sm:text-lg font-medium text-center mt-2 whitespace-nowrap">{getModelDisplayName(extension.ai_model)}</div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              {/* Mobile-only model display - centered on separate line */}
              {!sessionLoading && extension?.ai_model && (
                <div className="sm:hidden flex items-center justify-center mt-6 text-gray-400">
                  <Sparkles className="w-6 h-6 mr-3" />
                  <span className="text-base font-medium">{getModelDisplayName(extension.ai_model)}</span>
                </div>
              )}
            </div>
            
            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
              {sessionLoading ? (
                <>
                  {/* Loading placeholders for action buttons */}
                  <div className="flex-1 bg-gray-600 rounded-lg animate-pulse py-4 sm:py-3 px-4"></div>
                  <div className="flex-1 bg-gray-600 rounded-lg animate-pulse py-4 sm:py-3 px-4"></div>
                  <div className="flex-1 bg-gray-600 rounded-lg animate-pulse py-4 sm:py-3 px-4"></div>
                </>
              ) : (
                <>
                  <DownloadButton 
                    extension={extension} 
                    files={extensionFiles}
                    className="flex-1 justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-4 sm:py-3 px-4 rounded-lg transition-colors text-base sm:text-sm" 
                    onShowLoginModal={onShowLoginModal} 
                  />
                  <button 
                    onClick={() => session ? onRevise(extension) : onShowLoginModal()} 
                    className="flex-1 px-4 py-4 sm:py-3 bg-purple-600 rounded-lg text-white font-semibold hover:bg-purple-700 flex items-center justify-center space-x-2 transition-colors text-base sm:text-sm"
                  >
                    <GitBranch className="w-5 h-5" />
                    <span>Revise</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className={`flex-1 px-4 py-4 sm:py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-200 text-base sm:text-sm ${
                      shareStatus === 'success' 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : shareStatus === 'error'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {shareStatus === 'success' ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Link Copied!</span>
                      </>
                    ) : shareStatus === 'error' ? (
                      <>
                        <Share2 className="w-5 h-5" />
                        <span>Copy Failed</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-5 h-5" />
                        <span>Share</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Monetize & Publish Buttons */}
            {!sessionLoading && (
              <div className="flex flex-row gap-3 mb-6">
                <button
                  onClick={() => window.open('https://www.kromio.ai/learn#monetize-chrome-extension', '_blank')}
                  className="flex-1 px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-emerald-400 font-medium flex items-center justify-center space-x-2 transition-colors text-sm"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Monetize</span>
                </button>
                <button
                  onClick={() => window.open('https://www.kromio.ai/learn#submission-guide', '_blank')}
                  className="flex-1 px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded-lg text-blue-300 font-medium flex items-center justify-center space-x-2 transition-colors text-sm"
                >
                  <ChromeIcon className="w-4 h-4" />
                  <span>Submit to Store</span>
                </button>
              </div>
            )}

            {/* Support & Feedback Buttons */}
            {!sessionLoading && (
              <div className="flex flex-row gap-3 mb-6">
                <button
                  onClick={() => session ? setShowSupportModal(true) : onShowLoginModal()}
                  className="flex-1 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 font-medium flex items-center justify-center space-x-2 transition-colors text-sm"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Report Issue</span>
                </button>
                <button
                  onClick={() => session ? setShowFeedbackModal(true) : onShowLoginModal()}
                  className="flex-1 px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 font-medium flex items-center justify-center space-x-2 transition-colors text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Feedback</span>
                </button>
              </div>
            )}

            {parentExtension && (
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">This is a revision of:</p>
                <button
                  onClick={() => navigate(`/extension/${parentExtension.id}`)}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  {parentExtension.name} v{parentExtension.version}
                </button>
              </div>
            )}
          </div>

          {/* Customize Extension Section */}
          {!sessionLoading && (
            <CustomizeExtensionSection
              extension={extension}
              extensionFiles={extensionFiles}
              session={session}
              onShowLoginModal={onShowLoginModal}
            />
          )}

          {/* Extension Preview - Full Width */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-white mb-4 text-center">Extension Preview</h3>
            <div className="bg-white rounded-lg shadow-xl">
              <iframe
                srcDoc={createPreviewHtml()}
                style={{ width: '100%', height: '300px', border: 'none', borderRadius: '8px' }}
                title={`Preview of ${extension.name}`}
                sandbox="allow-scripts"
              />
            </div>
          </div>

          {/* Details and Files Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Extension Details</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-6">
                  <div>
                    <div className="text-center mb-3">
                      <p className="text-white text-lg font-semibold mb-2">Original Prompt</p>
                    </div>
                    <p className="text-gray-300 whitespace-pre-line bg-gray-900/50 rounded-lg p-4 border-l-4 border-blue-500 text-base leading-relaxed">{extension.prompt}</p>
                    {extension.has_uploaded_image && (
                      <div className="flex items-center justify-center space-x-2 mt-3 text-sm text-blue-400">
                        <span>📸</span>
                        <span>Created with uploaded image guidance</span>
                      </div>
                    )}
                    <div className="text-center mt-4">
                      <button 
                        onClick={handleCopyPrompt} 
                        className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 text-base mx-auto"
                      >
                        <Clipboard className="w-5 h-5" />
                        <span>Copy Original Prompt</span>
                      </button>
                    </div>
                  </div>
                  {extension.revision_prompt && (
                    <div>
                      <div className="text-center mb-3">
                        <p className="text-white text-lg font-semibold mb-2">Revision Prompt</p>
                      </div>
                      <p className="text-gray-300 whitespace-pre-line bg-gray-900/50 rounded-lg p-4 border-l-4 border-purple-500 text-base leading-relaxed">{extension.revision_prompt}</p>
                      <div className="text-center mt-4">
                        <button 
                          onClick={handleCopyRevisionPrompt} 
                          className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 text-base mx-auto"
                        >
                          <Clipboard className="w-5 h-5" />
                          <span>Copy Revision Prompt</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <RevisionTree 
                revisions={allRevisions}
                onSelectExtension={handleSelectExtension}
                currentExtensionId={extension.id}
                title="All Versions"
              />

              <InstallationInstructions instructions={extensionFiles?.instructions || extension.instructions} />
            </div>

            <div className="flex flex-col space-y-6">
              <FilesDisplay files={extensionFiles} title="Extension Files" />
            </div>
          </div>
        </div>
      
      <FeaturesModal isOpen={showFeaturesModal} onClose={() => setShowFeaturesModal(false)} />
      <MyExtensions isOpen={showMyExtensions} onClose={() => setShowMyExtensions(false)} extensions={userExtensions} onSelectExtension={handleSelectExtension} />
      <Gallery isOpen={showGallery} onClose={() => setShowGallery(false)} onSelectExtension={handleSelectExtension} />
      
      {/* Support & Feedback Modals */}
      <SupportFeedbackModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        type="support"
        extensionId={extension?.id}
        extensionTitle={extension?.name}
      />
      
      <SupportFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        type="feedback"
        extensionId={extension?.id}
        extensionTitle={extension?.name}
      />

      {/* What's Next Modal for new extensions */}
      <WhatsNextModal
        isOpen={showWhatsNextModal}
        onClose={() => setShowWhatsNextModal(false)}
        extensionName={extension?.name}
        extension={extension}
      />
    </PageContainer>
  );
}

export default React.memo(ExtensionDetail);
