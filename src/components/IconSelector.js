import React, { useState, useMemo } from 'react';
import { Lock, Upload, Search, Crown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getAllLucideIconNames, getIconCategory, validateImageFile, isIconFreeForFreeUsers } from '../utils/IconProcessor';

function IconSelector({
  planName,
  selectedIcon,
  onSelectIcon,
  iconType,
  onIconTypeChange,
  customIconFile,
  onCustomIconUpload,
  customIconPreview,
  onShowUpgradePrompt
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadError, setUploadError] = useState(null);

  // Determine tier capabilities
  const canSelectAllIcons = planName === 'pro' || planName === 'unlimited';
  const canUploadCustomIcon = planName === 'unlimited';

  // Get all Lucide icon names
  const allIconNames = useMemo(() => getAllLucideIconNames(), []);

  // Filter icons by search and category
  const filteredIcons = useMemo(() => {
    return allIconNames.filter(name => {
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' ||
                             getIconCategory(name) === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allIconNames, searchQuery, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(['all']);
    allIconNames.forEach(name => {
      cats.add(getIconCategory(name));
    });
    return Array.from(cats).sort();
  }, [allIconNames]);

  // Handle custom icon upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadError(null);

    // Validate file
    const validation = await validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      event.target.value = ''; // Clear input
      return;
    }

    // File is valid, pass to parent
    onCustomIconUpload(file);
    onIconTypeChange('custom');
  };

  // Handle icon selection from grid
  const handleIconSelect = (iconName) => {
    // Check if user can select this icon
    if (!canSelectAllIcons && !isIconFreeForFreeUsers(iconName)) {
      onShowUpgradePrompt('Upgrade to Pro to unlock all icons');
      return;
    }

    onSelectIcon(iconName);
    onIconTypeChange('lucide');
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        <button
          onClick={() => onIconTypeChange('lucide')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            iconType === 'lucide'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          Choose Icon
        </button>
        <button
          onClick={() => {
            if (!canUploadCustomIcon) {
              onShowUpgradePrompt('Upgrade to Max to upload custom icons');
              return;
            }
            onIconTypeChange('custom');
          }}
          className={`px-4 py-2 rounded-t-lg transition-colors flex items-center gap-2 ${
            iconType === 'custom'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload
          {!canUploadCustomIcon && (
            <Lock className="w-3 h-3 text-yellow-400" />
          )}
        </button>
      </div>

      {/* Choose Icon Tab */}
      {iconType === 'lucide' && (
        <>
          {/* Free Tier Notice */}
          {!canSelectAllIcons && (
            <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Crown className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-white font-semibold">Free Plan: Limited Icons</p>
                  <p className="text-gray-300">
                    You can select from {isIconFreeForFreeUsers.length || 8} free icons. Upgrade to Pro to unlock all 1,850+ icons.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search icons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Icons Grid */}
          <div className="bg-gray-800/50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {filteredIcons.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No icons found matching "{searchQuery}"
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {filteredIcons.map(iconName => {
                  const IconComponent = LucideIcons[iconName];
                  const isSelected = selectedIcon === iconName && iconType === 'lucide';
                  const isLocked = !canSelectAllIcons && !isIconFreeForFreeUsers(iconName);

                  return (
                    <button
                      key={iconName}
                      onClick={() => handleIconSelect(iconName)}
                      className={`p-3 rounded-lg border-2 transition-all relative group ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/20'
                          : isLocked
                          ? 'border-gray-700 bg-gray-800/50 opacity-60 hover:opacity-80'
                          : 'border-gray-600 hover:border-purple-400 bg-gray-800 hover:scale-105'
                      }`}
                      title={iconName}
                    >
                      <IconComponent className={`w-8 h-8 mx-auto ${isLocked ? 'text-gray-500' : 'text-white'}`} />

                      {/* Lock Badge */}
                      {isLocked && (
                        <div className="absolute top-1 right-1 bg-gray-900/90 rounded-full p-0.5">
                          <Lock className="w-3 h-3 text-yellow-400" />
                        </div>
                      )}

                      <p className={`text-xs mt-1 truncate ${isLocked ? 'text-gray-500' : 'text-gray-400'}`}>
                        {iconName}
                      </p>

                      {/* Upgrade tooltip on hover for locked icons */}
                      {isLocked && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          Upgrade to Pro
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Icon Info */}
          {selectedIcon && iconType === 'lucide' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-green-400 text-sm">
                Selected: <span className="font-semibold">{selectedIcon}</span>
              </p>
            </div>
          )}

          {/* Upgrade CTA for Free Users */}
          {!canSelectAllIcons && (
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-4 border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-semibold mb-1">Unlock All 1,850+ Icons</h4>
                  <p className="text-gray-300 text-sm">Upgrade to Pro for full icon library access</p>
                </div>
                <button
                  onClick={() => onShowUpgradePrompt('Unlock all icons with Pro')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex-shrink-0"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Upload Tab */}
      {iconType === 'custom' && (
        <div className="space-y-4">
          {/* Locked for Free/Pro Users */}
          {!canUploadCustomIcon ? (
            <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 relative">
              {/* Lock Overlay */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                <div className="text-center p-6">
                  <Lock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-bold mb-2">
                    Custom Icon Upload
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Upgrade to Max to upload your own custom icons
                  </p>
                  <button
                    onClick={() => onShowUpgradePrompt('Upload custom icons with Max')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Upgrade to Max
                  </button>
                </div>
              </div>

              {/* Blurred Preview */}
              <div className="opacity-50 pointer-events-none">
                <label className="border-2 border-dashed border-purple-500 rounded-lg p-8 cursor-pointer block">
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-purple-400 mb-3" />
                    <p className="text-white font-medium mb-1">Upload Custom Icon</p>
                    <p className="text-gray-400 text-sm">PNG, JPG, or WebP</p>
                    <p className="text-gray-500 text-xs mt-1">Max 100KB</p>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            // Max users - fully functional upload
            <>
              {!customIconFile ? (
                <label className="border-2 border-dashed border-purple-500 rounded-lg p-8 cursor-pointer hover:bg-purple-500/10 transition-colors block">
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-purple-400 mb-3" />
                    <p className="text-white font-medium mb-1">Upload Custom Icon</p>
                    <p className="text-gray-400 text-sm">PNG, JPG, or WebP</p>
                    <p className="text-gray-500 text-xs mt-1">Max 100KB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-4">
                  {/* Preview */}
                  <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <p className="text-gray-400 text-sm mb-3">Preview</p>
                    {customIconPreview && (
                      <img
                        src={customIconPreview}
                        alt="Custom icon preview"
                        className="w-24 h-24 mx-auto rounded-lg object-cover"
                      />
                    )}
                    <p className="text-white mt-3 text-sm font-medium">{customIconFile.name}</p>
                    <p className="text-gray-400 text-xs">
                      {(customIconFile.size / 1024).toFixed(1)}KB
                    </p>
                  </div>

                  {/* Change Button */}
                  <label className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    Change Icon
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Upload Error */}
              {uploadError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{uploadError}</p>
                </div>
              )}

              {/* Success Message */}
              {customIconFile && !uploadError && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <p className="text-green-400 text-sm">
                    Custom icon uploaded successfully!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default IconSelector;
