import React from 'react';

const ExtensionCardSkeleton = () => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1 mr-2 min-w-0">
          {/* Letter Square Skeleton */}
          <div className="w-10 h-10 bg-gray-600 rounded-lg flex-shrink-0"></div>
          {/* Title Skeleton */}
          <div className="flex-1 min-w-0">
            <div className="h-5 bg-gray-600 rounded w-3/4 mb-1"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          {/* Star Icon Skeleton */}
          <div className="w-7 h-7 bg-gray-600 rounded flex-shrink-0 mb-1"></div>
          {/* Favorite Count Skeleton */}
          <div className="h-4 w-6 bg-gray-700 rounded"></div>
        </div>
      </div>
      
      {/* Description Skeleton */}
      <div className="mb-4 space-y-2">
        <div className="h-3 bg-gray-600 rounded w-full"></div>
        <div className="h-3 bg-gray-600 rounded w-4/5"></div>
        <div className="h-3 bg-gray-600 rounded w-2/3"></div>
      </div>
      
      {/* AI Model Badge Skeleton */}
      <div className="text-center mb-3">
        <div className="h-5 w-32 bg-gray-700 rounded-full mx-auto"></div>
      </div>
      
      <div className="space-y-3">
        {/* Top row: # Revisions and Version */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-20 bg-gray-600 rounded"></div>
          <div className="h-5 w-12 bg-gray-600 rounded"></div>
        </div>
        
        {/* Bottom row: Preview and View buttons */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 h-10 bg-gray-600 rounded-lg"></div>
          <div className="flex-1 h-10 bg-gray-600 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default ExtensionCardSkeleton;