import React from 'react';
import PageContainer from './PageContainer';

const ExtensionDetailSkeleton = ({ showRevisions = true, showParent = false }) => {
  return (
    <PageContainer>
      {/* Header Skeleton */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-8 border border-white/20 shadow-2xl animate-pulse">
        <div className="mb-6">
          {/* Title and Icon Row */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gray-600 rounded-lg flex-shrink-0"></div>
            <div className="text-center">
              <div className="h-8 sm:h-10 bg-gray-600 rounded w-64 mb-2"></div>
              <div className="h-5 bg-gray-700 rounded w-16 mx-auto"></div>
            </div>
          </div>
          
          {/* Description */}
          <div className="text-center mb-4">
            <div className="h-5 bg-gray-600 rounded w-96 mx-auto mb-2"></div>
            <div className="h-5 bg-gray-600 rounded w-80 mx-auto"></div>
          </div>
          
          {/* Stats Row - Favorites, Revisions, Model */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-12 sm:space-x-16">
              <div className="flex flex-col items-center space-y-2 min-w-[100px]">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-600 rounded"></div>
                <div className="h-6 w-20 bg-gray-600 rounded"></div>
              </div>
              
              <div className="flex flex-col items-center space-y-2 min-w-[100px]">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-600 rounded"></div>
                <div className="h-6 w-20 bg-gray-600 rounded"></div>
              </div>
              
              <div className="hidden sm:flex flex-col items-center space-y-2 min-w-[120px]">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-600 rounded"></div>
                <div className="h-5 w-24 bg-gray-600 rounded"></div>
              </div>
            </div>
            
            {/* Mobile Model Display */}
            <div className="sm:hidden flex items-center justify-center mt-6">
              <div className="w-6 h-6 bg-gray-600 rounded mr-3"></div>
              <div className="h-4 w-20 bg-gray-600 rounded"></div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
            <div className="flex-1 bg-gray-600 rounded-lg py-4 sm:py-3"></div>
            <div className="flex-1 bg-gray-600 rounded-lg py-4 sm:py-3"></div>
            <div className="flex-1 bg-gray-600 rounded-lg py-4 sm:py-3"></div>
          </div>
          
          {/* Parent Extension Link */}
          {showParent && (
            <div className="text-center">
              <div className="h-4 w-32 bg-gray-700 rounded mx-auto mb-2"></div>
              <div className="h-5 w-48 bg-gray-600 rounded mx-auto"></div>
            </div>
          )}
        </div>

        {/* Extension Preview Section */}
        <div className="mb-8">
          <div className="h-7 w-48 bg-gray-600 rounded mb-4 mx-auto"></div>
          <div className="bg-gray-700 rounded-lg h-[300px] flex items-center justify-center">
            <div className="text-gray-500 text-lg">Loading preview...</div>
          </div>
        </div>

        {/* Details and Files Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Extension Details */}
            <div>
              <div className="h-6 w-40 bg-gray-600 rounded mb-4"></div>
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
                <div>
                  <div className="h-5 w-32 bg-gray-600 rounded mb-2"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-4/5"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/5"></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-24 bg-gray-600 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Revision Tree */}
            {showRevisions && (
              <div>
                <div className="h-6 w-32 bg-gray-600 rounded mb-4"></div>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  {Array.from({ length: 3 }, (_, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-600 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-600 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                      <div className="h-6 w-12 bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Installation Instructions */}
            <div>
              <div className="h-6 w-48 bg-gray-600 rounded mb-4"></div>
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex-shrink-0 mt-0.5"></div>
                    <div className="h-4 bg-gray-700 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Files Section */}
          <div className="flex flex-col space-y-6">
            <div>
              <div className="h-6 w-32 bg-gray-600 rounded mb-4"></div>
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-gray-600 rounded"></div>
                      <div className="h-4 bg-gray-600 rounded w-24"></div>
                    </div>
                    <div className="h-8 w-16 bg-gray-600 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ExtensionDetailSkeleton;