import React from 'react';

/**
 * PageContainer - Consistent layout wrapper for all pages
 * Prevents layout shift and provides smooth transitions
 */
function PageContainer({ children, className = "" }) {
  return (
    <div className={`min-h-screen transition-opacity duration-200 ease-in-out ${className}`}>
      <div className="relative z-10 container mx-auto px-4 py-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}

export default PageContainer;