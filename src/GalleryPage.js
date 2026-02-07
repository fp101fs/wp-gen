import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import useDocumentTitle from './hooks/useDocumentTitle';
import { debugLog, debugError } from './utils/debugUtils';
import { Star, Eye, Search, X, ChevronDown, ArrowUpDown, GitBranch } from 'lucide-react';
import { supabase } from './supabaseClient';
import Header from './Header';
import FeaturesModal from './FeaturesModal';
import MyExtensions from './MyExtensions';
import PageContainer from './components/PageContainer';
import ExtensionCardSkeleton from './components/ExtensionCardSkeleton';

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

// Sorting configuration
const SORT_OPTIONS = [
  { value: 'favorites_desc', label: '# Favorites (Most)', field: 'favorite_count', direction: 'desc' },
  { value: 'favorites_asc', label: '# Favorites (Least)', field: 'favorite_count', direction: 'asc' },
  { value: 'revisions_desc', label: '# Revisions (Most)', field: 'revision_count', direction: 'desc' },
  { value: 'revisions_asc', label: '# Revisions (Least)', field: 'revision_count', direction: 'asc' },
  { value: 'name_asc', label: 'Title (A-Z)', field: 'name', direction: 'asc' },
  { value: 'name_desc', label: 'Title (Z-A)', field: 'name', direction: 'desc' },
  { value: 'created_desc', label: 'Date Created (Newest)', field: 'created_at', direction: 'desc' },
  { value: 'created_asc', label: 'Date Created (Oldest)', field: 'created_at', direction: 'asc' },
];

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
      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
      style={{
        background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`
      }}
    >
      {firstLetter}
    </div>
  );
};

// Pagination constants
const EXTENSIONS_PER_PAGE = 21;

function GalleryPage({ session, sessionLoading, defaultViewMode = 'all', onShowLoginModal, onRevise }) {
  const [extensions, setExtensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [showMyExtensions, setShowMyExtensions] = useState(false);
  const [userExtensions, setUserExtensions] = useState([]);
  
  // Set page title based on view mode
  useDocumentTitle(defaultViewMode === 'my' ? 'My Extensions' : 'Extension Gallery');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreExtensions, setHasMoreExtensions] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  
  // Load saved state from localStorage
  const loadSavedState = () => {
    try {
      const saved = localStorage.getItem('gallery-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          viewMode: parsed.viewMode || defaultViewMode,
          favoriteFilter: parsed.favoriteFilter || 'all',
          searchQuery: parsed.searchQuery || '',
          sortBy: parsed.sortBy || 'favorites_desc'
        };
      }
    } catch (err) {
      debugError('Error loading saved gallery state:', err);
    }
    return {
      viewMode: defaultViewMode,
      favoriteFilter: 'all',
      searchQuery: '',
      sortBy: 'favorites_desc'
    };
  };

  const savedState = loadSavedState();

  // Filter states
  const [viewMode, setViewMode] = useState(savedState.viewMode); // 'my' or 'all'
  const [favoriteFilter, setFavoriteFilter] = useState(savedState.favoriteFilter); // 'favorites' or 'all'
  const [searchQuery, setSearchQuery] = useState(savedState.searchQuery);
  const [favorites, setFavorites] = useState(new Set()); // Database favorites state
  const [previewExtension, setPreviewExtension] = useState(null);
  const [previewFiles, setPreviewFiles] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [lastLocationChange, setLastLocationChange] = useState(Date.now());
  
  // Sorting states
  const [sortBy, setSortBy] = useState(savedState.sortBy); // Default to favorites descending
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const sortDropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Save state to localStorage
  const saveState = (newState) => {
    try {
      const stateToSave = {
        viewMode: newState.viewMode || viewMode,
        favoriteFilter: newState.favoriteFilter || favoriteFilter,
        searchQuery: newState.searchQuery !== undefined ? newState.searchQuery : searchQuery,
        sortBy: newState.sortBy || sortBy
      };
      localStorage.setItem('gallery-state', JSON.stringify(stateToSave));
    } catch (err) {
      debugError('Error saving gallery state:', err);
    }
  };


  useEffect(() => {
    fetchExtensions();
  }, [session, viewMode, lastLocationChange, searchQuery, favoriteFilter, sortBy]);

  // Listen for forced refresh events from navigation
  useEffect(() => {
    const handleForceRefresh = (event) => {
      const { viewMode: newViewMode } = event.detail;
      setViewMode(newViewMode);
      setFavoriteFilter('all');
      setSearchQuery('');
      setLastLocationChange(Date.now());
    };

    window.addEventListener('forceGalleryRefresh', handleForceRefresh);
    return () => {
      window.removeEventListener('forceGalleryRefresh', handleForceRefresh);
    };
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both the button and the dropdown (which is portaled)
      const isClickInsideButton = sortDropdownRef.current && sortDropdownRef.current.contains(event.target);
      const isClickInsideDropdown = event.target.closest('[data-sort-dropdown]');
      
      if (!isClickInsideButton && !isClickInsideDropdown) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch user favorites when session is available
  useEffect(() => {
    if (session) {
      fetchUserFavorites();
    } else {
      setFavorites(new Set());
    }
  }, [session]);

  // Refetch extensions when favorites are loaded (needed for favorites filter)
  useEffect(() => {
    if (session && favorites.size > 0 && favoriteFilter === 'favorites') {
      fetchExtensions();
    }
  }, [favorites]);

  // Ensure viewMode is set correctly when location changes
  useEffect(() => {
    // Determine viewMode based on current path
    const correctViewMode = location.pathname === '/my-extensions' ? 'my' : 'all';
    setViewMode(correctViewMode);
    setLastLocationChange(Date.now());
    
    // Reset other filters when navigation occurs
    setFavoriteFilter('all');
    setSearchQuery('');
  }, [location.pathname]);

  // Also set viewMode when defaultViewMode prop changes (for initial load)
  useEffect(() => {
    setViewMode(defaultViewMode);
  }, [defaultViewMode]);

  const fetchExtensions = async (isLoadingMore = false) => {
    if (isLoadingMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      // Always reset pagination for fresh searches/sorts
      setCurrentPage(0);
      setHasMoreExtensions(true);
    }
    
    try {
      // If viewing "My Extensions" but not logged in, return empty array
      if (viewMode === 'my' && !session) {
        setExtensions([]);
        setLoading(false);
        setLoadingMore(false);
        return;
      }
      
      // For fresh loads, always start from page 0. For load more, use the current page + 1
      const pageToLoad = isLoadingMore ? currentPage + 1 : 0;
      const startIndex = pageToLoad * EXTENSIONS_PER_PAGE;
      const endIndex = startIndex + EXTENSIONS_PER_PAGE - 1;
      
      let query = supabase
        .from('extensions')
        .select('id, name, description, created_at, user_id, version, favorite_count, ai_model, is_public, parent_id, prompt, revision_prompt')
        .range(startIndex, endIndex);
      
      // Apply view mode filter
      if (viewMode === 'my' && session) {
        query = query.eq('user_id', session.user.id);
      } else if (viewMode === 'all') {
        query = query.eq('is_public', true);
      }
      
      // Apply favorite filter
      if (favoriteFilter === 'favorites' && session) {
        // This requires a join with favorites table - for now, we'll handle this client-side
        // TODO: Implement server-side favorites filtering with a join
      }
      
      // Apply search filter
      if (searchQuery.trim()) {
        const search = searchQuery.trim();
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,prompt.ilike.%${search}%,revision_prompt.ilike.%${search}%`);
      }
      
      // Apply sorting
      const sortOption = SORT_OPTIONS.find(option => option.value === sortBy);
      if (sortOption) {
        const ascending = sortOption.direction === 'asc';
        if (sortOption.field === 'favorite_count') {
          query = query.order('favorite_count', { ascending, nullsFirst: false });
        } else if (sortOption.field === 'created_at') {
          query = query.order('created_at', { ascending });
        } else if (sortOption.field === 'name') {
          query = query.order('name', { ascending });
        }
        // Note: revision_count sorting still needs to be handled client-side for now
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) {
        debugError('Error fetching extensions:', error);
      } else {
        // Check if we have more extensions to load
        const hasMore = data && data.length === EXTENSIONS_PER_PAGE;
        setHasMoreExtensions(hasMore);
        
        // Debug: Log the actual data received from database
        debugLog('GalleryPage data received:', data?.slice(0, 2)); // Log first 2 items
        debugLog('First item favorite_count:', data?.[0]?.favorite_count);
        
        // For now, skip revision count calculation to improve performance
        // We'll add it back in a future optimization phase
        let extensionsWithRevisionCounts = (data || []).map((extension) => {
          return { ...extension, revision_count: 0 }; // Temporarily set to 0
        });
        
        // Apply client-side favorites filter if needed
        if (favoriteFilter === 'favorites' && session) {
          extensionsWithRevisionCounts = extensionsWithRevisionCounts.filter(ext => 
            favorites.has(ext.id)
          );
        }
        
        if (isLoadingMore) {
          // Append new extensions to existing ones
          setExtensions(prev => [...prev, ...extensionsWithRevisionCounts]);
          setCurrentPage(pageToLoad); // Set to the page we just loaded
        } else {
          // Replace extensions for fresh load
          setExtensions(extensionsWithRevisionCounts);
          setCurrentPage(0);
        }
      }
    } catch (err) {
      debugError('Error:', err);
    } finally {
      if (isLoadingMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };
  
  // Load more extensions function
  const loadMoreExtensions = () => {
    if (!loadingMore && hasMoreExtensions) {
      fetchExtensions(true);
    }
  };
  

  const fetchUserFavorites = async () => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('extension_id')
        .eq('user_id', session.user.id);
      
      if (error) {
        debugError('Error fetching favorites:', error);
      } else {
        const favoriteIds = new Set(data.map(fav => fav.extension_id));
        setFavorites(favoriteIds);
      }
    } catch (err) {
      debugError('Error fetching favorites:', err);
    }
  };

  // Fetch files for preview on-demand
  const fetchPreviewFiles = async (extensionId) => {
    setLoadingPreview(true);
    try {
      const { data, error } = await supabase
        .from('extensions')
        .select('files')
        .eq('id', extensionId)
        .single();
      
      if (error) {
        debugError('Error fetching preview files:', error);
        setPreviewFiles(null);
      } else {
        setPreviewFiles(data.files);
      }
    } catch (err) {
      debugError('Error loading preview files:', err);
      setPreviewFiles(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const createPreviewHtml = () => {
    if (loadingPreview) {
      return '<div style="padding: 20px; font-family: Arial; color: #666; text-align: center;">Loading preview...</div>';
    }
    
    if (!previewFiles) {
      return '<div style="padding: 20px; font-family: Arial; color: #333;">Preview unavailable: No files found.</div>';
    }

    const htmlFile = Object.keys(previewFiles).find(name => name.endsWith('.html'));
    if (!htmlFile) {
      return '<div style="padding: 20px; font-family: Arial; color: #333;">Preview unavailable: No HTML file found.</div>';
    }

    let html = previewFiles[htmlFile];
    const cssFile = Object.keys(previewFiles).find(name => name.endsWith('.css'));
    const css = cssFile ? previewFiles[cssFile] : '';

    html = html.replace(/<link.*rel="stylesheet".*>/g, '');

    const fallbackCss = `
      body {
        margin: 0;
        padding: 10px;
        font-family: Arial, sans-serif;
        background-color: #ffffff;
        color: #333333;
        min-width: 0;
        overflow-x: auto;
      }
      
      /* Mobile-responsive fixes */
      @media (max-width: 768px) {
        body {
          padding: 5px;
        }
        
        /* Scale down fixed-width elements on mobile */
        * {
          max-width: 100% !important;
          box-sizing: border-box;
        }
        
        /* Handle common fixed-width patterns */
        [style*="width: 400px"], [style*="width:400px"],
        [style*="width: 500px"], [style*="width:500px"] {
          width: 100% !important;
          max-width: 100% !important;
        }
        
        /* Responsive text sizing */
        body {
          font-size: 14px;
        }
        
        /* Handle absolute positioning issues */
        [style*="position: absolute"], [style*="position:absolute"] {
          position: relative !important;
        }
      }
    `;
    const combinedCss = fallbackCss + '\n' + (css || '');

    if (html.includes('</head>')) {
      // Add viewport meta tag and CSS to existing head
      let updatedHtml = html;
      if (!html.includes('viewport')) {
        updatedHtml = html.replace('<head>', '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes, minimum-scale=0.5, maximum-scale=2.0">');
      }
      return updatedHtml.replace('</head>', `<style>${combinedCss}</style></head>`);
    } else {
      return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes, minimum-scale=0.5, maximum-scale=2.0">
<style>${combinedCss}</style></head><body>${html}</body></html>`;
    }
  };

  // Extensions are now filtered and sorted at the database level
  const filteredExtensions = extensions;

  const toggleFavorite = async (extensionId) => {
    if (!session) {
      onShowLoginModal();
      return;
    }
    
    const isFavorited = favorites.has(extensionId);
    
    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('extension_id', extensionId);
        
        if (error) {
          debugError('Error removing from favorites:', error);
        } else {
          setFavorites(prev => {
            const newFavorites = new Set(prev);
            newFavorites.delete(extensionId);
            return newFavorites;
          });
          // Note: Database trigger will update favorite_count automatically, but for immediate UI feedback:
          setExtensions(prev => prev.map(ext => 
            ext.id === extensionId 
              ? { ...ext, favorite_count: Math.max(0, (ext.favorite_count || 1) - 1) }
              : ext
          ));
        }
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{
            user_id: session.user.id,
            extension_id: extensionId
          }]);
        
        if (error) {
          debugError('Error adding to favorites:', error);
        } else {
          setFavorites(prev => {
            const newFavorites = new Set(prev);
            newFavorites.add(extensionId);
            return newFavorites;
          });
          // Note: Database trigger will update favorite_count automatically, but for immediate UI feedback:
          setExtensions(prev => prev.map(ext => 
            ext.id === extensionId 
              ? { ...ext, favorite_count: (ext.favorite_count || 0) + 1 }
              : ext
          ));
        }
      }
    } catch (err) {
      debugError('Error toggling favorite:', err);
    }
  };

  const handleSelectExtension = (extension) => {
    setShowMyExtensions(false);
    navigate(`/extension/${extension.id}`);
  };

  const handleViewExtension = (extension) => {
    navigate(`/extension/${extension.id}`);
  };

  return (
    <PageContainer>
      <Header 
        onShowFeaturesModal={() => setShowFeaturesModal(true)}
        onShowLoginModal={onShowLoginModal}
      />
      <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 bg-gradient-to-r from-lime-400 to-white bg-clip-text text-transparent px-2 pb-2 text-center">
            Extension Gallery
          </h1>
          <p className="text-xl text-gray-300 text-center max-w-2xl mx-auto mb-6">
            Create. Revise. Repeat.
          </p>

        {/* Filter Controls */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-xl mb-8">
          {sessionLoading ? (
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Loading placeholders for filter controls */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-4 bg-gray-600 rounded animate-pulse"></div>
                <div className="w-40 h-10 bg-gray-600 rounded-lg animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-4 bg-gray-600 rounded animate-pulse"></div>
                <div className="w-32 h-10 bg-gray-600 rounded-lg animate-pulse"></div>
              </div>
              <div className="w-60 h-10 bg-gray-600 rounded-lg animate-pulse"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-4 bg-gray-600 rounded animate-pulse"></div>
                <div className="w-32 h-10 bg-gray-600 rounded-lg animate-pulse"></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center justify-between">
              
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 w-full lg:w-auto">
                <span className="text-white text-sm font-medium w-1/5 lg:w-auto flex-shrink-0">View:</span>
                <div className="bg-gray-800 rounded-lg p-1 flex w-4/5 lg:flex-initial lg:w-auto">
                  <button
                    onClick={() => {
                      setViewMode('my');
                      saveState({ viewMode: 'my' });
                    }}
                    className={`flex-1 lg:flex-initial px-2 lg:px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'my'
                        ? 'bg-lime-400 text-black'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    My Extensions
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('all');
                      saveState({ viewMode: 'all' });
                    }}
                    className={`flex-1 lg:flex-initial px-2 lg:px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'all'
                        ? 'bg-lime-400 text-black'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>

              {/* Favorites Toggle */}
              <div className="flex items-center space-x-2 w-full lg:w-auto">
                <span className="text-white text-sm font-medium w-1/5 lg:w-auto flex-shrink-0">Show:</span>
                <div className="bg-gray-800 rounded-lg p-1 flex w-4/5 lg:flex-initial lg:w-auto">
                  <button
                    onClick={() => {
                      setFavoriteFilter('all');
                      saveState({ favoriteFilter: 'all' });
                    }}
                    className={`flex-1 lg:flex-initial px-2 lg:px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      favoriteFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => {
                      setFavoriteFilter('favorites');
                      saveState({ favoriteFilter: 'favorites' });
                    }}
                    className={`flex-1 lg:flex-initial px-2 lg:px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      favoriteFilter === 'favorites'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    My Favorites
                  </button>
                </div>
              </div>

              {/* Search Input */}
              <div className="flex items-center space-x-2 w-full lg:flex-1 lg:max-w-md">
                <span className="text-white text-sm font-medium whitespace-nowrap w-1/5 lg:w-auto flex-shrink-0">Search:</span>
                <div className="relative w-4/5 lg:flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Name, prompt, or description..."
                    value={searchQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchQuery(value);
                      saveState({ searchQuery: value });
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="relative z-50 w-full lg:w-auto">
                <div className="flex items-center space-x-2 w-full lg:w-auto">
                  <span className="text-white text-sm font-medium w-1/5 lg:w-auto flex-shrink-0">Sort:</span>
                  <div className="relative w-4/5 lg:flex-initial lg:w-auto" ref={sortDropdownRef}>
                    <button
                      onClick={() => {
                        if (!showSortDropdown && sortDropdownRef.current) {
                          const rect = sortDropdownRef.current.getBoundingClientRect();
                          setDropdownPosition({
                            top: rect.bottom + 8,
                            right: window.innerWidth - rect.right
                          });
                        }
                        setShowSortDropdown(!showSortDropdown);
                      }}
                      className="flex items-center space-x-2 px-2 lg:px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-colors w-full lg:w-auto"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                      <span className="text-sm flex-1 lg:flex-initial text-left lg:text-center">
                        {SORT_OPTIONS.find(option => option.value === sortBy)?.label || 'Sort by...'}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Extension Cards Grid */}
        <div className="mb-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: EXTENSIONS_PER_PAGE }, (_, index) => (
                <ExtensionCardSkeleton key={index} />
              ))}
            </div>
          ) : filteredExtensions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">
                {searchQuery.trim()
                  ? 'No extensions match your filters.'
                  : favoriteFilter === 'favorites'
                    ? !session
                      ? "You must log in to view your favorite extensions."
                      : 'No favorite extensions found.'
                    : viewMode === 'my' 
                      ? !session 
                        ? "You must log in and create an extension to view your extensions."
                        : "You haven't created any extensions yet."
                      : 'No public extensions available.'
                }
              </p>
              {!session && (viewMode === 'my' || favoriteFilter === 'favorites') && (
                <button
                  onClick={onShowLoginModal}
                  className="bg-lime-400 hover:bg-lime-500 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {viewMode === 'my' ? 'Log In to View Your Extensions' : 'Log In to View Your Favorites'}
                </button>
              )}
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredExtensions.map((extension) => (
                <a
                  key={extension.id}
                  href={`/extension/${extension.id}`}
                  className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 shadow-xl hover:shadow-2xl hover:bg-white/10 transition-all duration-300 block no-underline text-inherit"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1 mr-2 min-w-0">
                      <div>
                        <LetterSquare title={extension.name} />
                      </div>
                      <h3 
                        className="text-lg font-semibold text-white flex-1 min-w-0 line-clamp-2 leading-tight text-center"
                      >
                        {extension.name}
                      </h3>
                    </div>
                    <div className="flex flex-col items-center">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(extension.id);
                        }}
                        className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
                        aria-label={session ? (favorites.has(extension.id) ? 'Remove from favorites' : 'Add to favorites') : 'Login to favorite this extension'}
                      >
                        <Star 
                          className={`w-7 h-7 ${
                            favorites.has(extension.id) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-400 hover:text-yellow-400'
                          }`} 
                        />
                      </button>
                      <span className="text-lg text-gray-400 mt-1">
                        {extension.favorite_count || 0}
                      </span>
                    </div>
                  </div>
                  
                  <p 
                    className="text-gray-300 text-sm mb-4 line-clamp-3 h-16 overflow-hidden"
                  >
                    {extension.description}
                  </p>
                  
                  {extension.ai_model && (
                    <div className="text-center mb-3">
                      <span className="text-xs text-gray-300 bg-gray-800/50 px-2 py-1 rounded-full">
                        Generated with ✨ {getModelDisplayName(extension.ai_model)}
                      </span>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {/* Top row: # Revisions and Version */}
                    <div className="flex items-center justify-between">
                      <div 
                        className="text-xl text-gray-400"
                      >
                        <span className="text-gray-200">{extension.revision_count || 0}</span> revisions
                      </div>
                      <div 
                        className="text-xl text-yellow-400"
                      >
                        v{extension.version || '1.0'}
                      </div>
                    </div>
                    
                    {/* Bottom row: Preview, Revise, and View buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPreviewExtension(extension);
                          setPreviewFiles(null); // Reset previous files
                          fetchPreviewFiles(extension.id);
                        }}
                        className="flex items-center justify-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white px-2 py-2 rounded-lg transition-colors text-sm font-medium flex-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          session ? onRevise(extension) : onShowLoginModal();
                        }}
                        className="flex items-center justify-center space-x-1 bg-lime-400 hover:bg-lime-500 text-black px-2 py-2 rounded-lg transition-colors text-sm font-medium flex-1"
                      >
                        <GitBranch className="w-4 h-4" />
                        <span>Revise</span>
                      </button>
                      <a
                        href={`/extension/${extension.id}`}
                        className="flex items-center justify-center space-x-1 bg-lime-400 hover:bg-lime-500 text-black px-2 py-2 rounded-lg transition-colors text-sm font-medium flex-1 no-underline"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </a>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            
            {/* Loading More Skeletons */}
            {loadingMore && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                {Array.from({ length: 8 }, (_, index) => (
                  <ExtensionCardSkeleton key={`loading-${index}`} />
                ))}
              </div>
            )}
            
            {/* Load More Button */}
            {!loading && filteredExtensions.length > 0 && hasMoreExtensions && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreExtensions}
                  disabled={loadingMore}
                  className="bg-lime-400 hover:bg-lime-500 disabled:bg-lime-300 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {loadingMore ? 'Loading...' : 'Load More Extensions'}
                </button>
              </div>
            )}
            
            {/* No More Extensions Message */}
            {!loading && filteredExtensions.length > 0 && !hasMoreExtensions && (
              <div className="text-center mt-8 py-4">
                <p className="text-gray-400 text-sm">
                  {searchQuery.trim() 
                    ? `Showing all ${filteredExtensions.length} result${filteredExtensions.length !== 1 ? 's' : ''} for "${searchQuery}"`
                    : 'You\'ve reached the end! No more extensions to show.'
                  }
                </p>
              </div>
            )}
            </>
          )}
        </div>

      </div>
      <FeaturesModal isOpen={showFeaturesModal} onClose={() => setShowFeaturesModal(false)} />
      <MyExtensions 
        isOpen={showMyExtensions} 
        onClose={() => setShowMyExtensions(false)} 
        extensions={userExtensions} 
        onSelectExtension={handleSelectExtension} 
      />

      {/* Preview Modal */}
      {previewExtension && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] p-2 sm:p-4"
          onClick={() => setPreviewExtension(null)}
        >
          <div 
            className="bg-neutral-900 rounded-lg shadow-2xl w-full max-w-6xl relative h-[90vh] sm:max-h-[90vh] flex flex-col border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700 flex-shrink-0">
              <h3 className="text-lg sm:text-xl font-bold text-white truncate mr-4">Preview: {previewExtension.name}</h3>
              <button onClick={() => setPreviewExtension(null)} className="text-gray-400 hover:text-white flex-shrink-0">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="px-3 sm:px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20 flex-shrink-0">
              <p className="text-yellow-300 text-sm text-center">
                ⚠️ Preview may not render accurately. Data fetching doesn't work and button clicks won't respond properly.
              </p>
            </div>
            <div className="p-2 sm:p-4 bg-white flex-1 min-h-0">
              <iframe
                srcDoc={createPreviewHtml()}
                className="w-full h-full border-none rounded"
                title={`Preview of ${previewExtension.name}`}
                sandbox="allow-scripts allow-modals"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Sort Dropdown Portal */}
      {showSortDropdown && createPortal(
        <div 
          data-sort-dropdown
          className="fixed w-56 bg-neutral-900 border border-white/10 rounded-lg shadow-2xl"
          style={{ 
            top: dropdownPosition.top + 'px',
            right: dropdownPosition.right + 'px',
            zIndex: 99999
          }}
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSortBy(option.value);
                saveState({ sortBy: option.value });
                setShowSortDropdown(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                sortBy === option.value ? 'bg-lime-400 text-black' : 'text-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </PageContainer>
  );
}

export default GalleryPage;