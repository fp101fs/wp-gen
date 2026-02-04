import { useEffect } from 'react';

/**
 * Custom hook to dynamically update document title
 * @param {string} title - The title to set for the page
 * @param {boolean} includeSiteName - Whether to include "Kromio" in the title
 */
export const useDocumentTitle = (title, includeSiteName = true) => {
  useEffect(() => {
    const originalTitle = document.title;
    
    const newTitle = includeSiteName && !title.includes('Kromio') 
      ? `${title} - Kromio` 
      : title;
    
    document.title = newTitle;
    
    // Optional: Update og:title meta tag dynamically
    const ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (ogTitleTag) {
      ogTitleTag.setAttribute('content', newTitle);
    }
    
    const twitterTitleTag = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitleTag) {
      twitterTitleTag.setAttribute('content', newTitle);
    }
    
    // Cleanup function to restore original title if needed
    return () => {
      // Don't restore original title on unmount to allow page titles to persist
      // document.title = originalTitle;
    };
  }, [title, includeSiteName]);
};

export default useDocumentTitle;