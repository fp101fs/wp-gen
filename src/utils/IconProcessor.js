import React from 'react';
import ReactDOMServer from 'react-dom/server';
import * as LucideIcons from 'lucide-react';

/**
 * IconProcessor - Utility for converting icons to Chrome extension format
 * Generates PNG icons in required sizes: 16x16, 48x48, 128x128
 */

/**
 * Convert a Lucide React icon to PNG at specified size
 * @param {string} iconName - Name of the Lucide icon
 * @param {number} size - Target size (16, 48, or 128)
 * @param {string} color - Icon color (default: Chrome blue #4285F4)
 * @returns {Promise<string>} Base64 PNG data URL
 */
export async function lucideIconToPng(iconName, size, color = '#4285F4') {
  return new Promise((resolve, reject) => {
    try {
      // Get the Lucide icon component
      const IconComponent = LucideIcons[iconName];
      if (!IconComponent) {
        throw new Error(`Icon "${iconName}" not found in Lucide library`);
      }

      // Render icon to SVG string
      const svgString = ReactDOMServer.renderToStaticMarkup(
        React.createElement(IconComponent, {
          size: size,
          color: color,
          strokeWidth: 2
        })
      );

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Fill with transparent background
      ctx.clearRect(0, 0, size, size);

      // Create image from SVG
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, size, size);
        URL.revokeObjectURL(url);

        // Convert canvas to base64 PNG
        const pngDataUrl = canvas.toDataURL('image/png');
        resolve(pngDataUrl);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Failed to load SVG for icon "${iconName}"`));
      };

      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Resize an uploaded image to target size with center crop
 * @param {File} file - Image file to resize
 * @param {number} targetSize - Target size (16, 48, or 128)
 * @returns {Promise<string>} Base64 PNG data URL
 */
export async function resizeImage(file, targetSize) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');

          // Calculate crop dimensions (center crop to square)
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          // Draw cropped and resized image
          ctx.drawImage(
            img,
            sx, sy, minDim, minDim,  // Source crop
            0, 0, targetSize, targetSize  // Destination
          );

          // Export as PNG base64
          const pngDataUrl = canvas.toDataURL('image/png');
          resolve(pngDataUrl);
        } catch (error) {
          reject(new Error(`Failed to resize image: ${error.message}`));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for resizing'));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Generate all 3 icon sizes from a Lucide icon
 * @param {string} iconName - Name of the Lucide icon
 * @param {string} color - Icon color (default: Chrome blue)
 * @returns {Promise<Object>} Object with keys '16', '48', '128' containing base64 PNGs
 */
export async function generateIconSetFromLucide(iconName, color = '#4285F4') {
  try {
    const sizes = [16, 48, 128];
    const iconSet = {};

    for (const size of sizes) {
      iconSet[size.toString()] = await lucideIconToPng(iconName, size, color);
    }

    return iconSet;
  } catch (error) {
    throw new Error(`Failed to generate icon set from Lucide: ${error.message}`);
  }
}

/**
 * Generate all 3 icon sizes from an uploaded file
 * @param {File} file - Image file to process
 * @returns {Promise<Object>} Object with keys '16', '48', '128' containing base64 PNGs
 */
export async function generateIconSetFromUpload(file) {
  try {
    const sizes = [16, 48, 128];
    const iconSet = {};

    for (const size of sizes) {
      iconSet[size.toString()] = await resizeImage(file, size);
    }

    return iconSet;
  } catch (error) {
    throw new Error(`Failed to generate icon set from upload: ${error.message}`);
  }
}

/**
 * Generate default Kromio icon set
 * Uses the Package icon from Lucide as the default
 * @returns {Promise<Object>} Object with keys '16', '48', '128' containing base64 PNGs
 */
export async function generateDefaultIconSet() {
  try {
    // Use Package icon with purple gradient color
    return await generateIconSetFromLucide('Package', '#9333ea');
  } catch (error) {
    throw new Error(`Failed to generate default icon set: ${error.message}`);
  }
}

/**
 * Validate an uploaded image file
 * @param {File} file - Image file to validate
 * @returns {Promise<Object>} { valid: boolean, error: string|null }
 */
export async function validateImageFile(file) {
  // Check file type
  const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload PNG, JPG, or WebP images only.'
    };
  }

  // Check file size (100KB max)
  const maxSize = 100 * 1024; // 100KB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Please compress your image to under 100KB.'
    };
  }

  // Test if image is valid by trying to load it
  try {
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = () => reject(new Error('Invalid or corrupted image'));
      img.src = URL.createObjectURL(file);
    });

    return { valid: true, error: null };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid or corrupted image file. Please try a different image.'
    };
  }
}

/**
 * Get all available Lucide icon names
 * Filters out non-icon exports from the Lucide library
 * @returns {string[]} Array of icon names
 */
export function getAllLucideIconNames() {
  return Object.keys(LucideIcons).filter(
    name => {
      // Filter out non-icon exports
      if (name === 'createLucideIcon' || name === 'default' || name === 'icons') {
        return false;
      }

      // Filter out the "Icon" suffix duplicates (keep only base names like "Activity", not "ActivityIcon")
      if (name.endsWith('Icon')) {
        return false;
      }

      // Check if it's a valid React component (object with $$typeof or function)
      const component = LucideIcons[name];
      return component && (typeof component === 'function' || typeof component === 'object');
    }
  );
}

/**
 * Simple icon categorization
 * @returns {Object} Icon name -> category mapping
 */
export function getIconCategories() {
  const categories = {
    // Arrows & Navigation
    'ArrowUp': 'arrows', 'ArrowDown': 'arrows', 'ArrowLeft': 'arrows', 'ArrowRight': 'arrows',
    'ChevronUp': 'arrows', 'ChevronDown': 'arrows', 'ChevronLeft': 'arrows', 'ChevronRight': 'arrows',
    'ChevronsUp': 'arrows', 'ChevronsDown': 'arrows', 'ChevronsLeft': 'arrows', 'ChevronsRight': 'arrows',
    'MoveUp': 'arrows', 'MoveDown': 'arrows', 'MoveLeft': 'arrows', 'MoveRight': 'arrows',

    // Files & Folders
    'File': 'files', 'FileText': 'files', 'Folder': 'files', 'FolderOpen': 'files',
    'Files': 'files', 'FilePlus': 'files', 'FileMinus': 'files', 'FileCheck': 'files',
    'Save': 'files', 'Download': 'files', 'Upload': 'files',

    // UI Elements
    'Star': 'ui', 'Heart': 'ui', 'Settings': 'ui', 'Menu': 'ui',
    'Grid': 'ui', 'List': 'ui', 'Layout': 'ui', 'Maximize': 'ui',
    'Minimize': 'ui', 'X': 'ui', 'Check': 'ui', 'Plus': 'ui',
    'Minus': 'ui', 'Edit': 'ui', 'Trash': 'ui', 'Search': 'ui',

    // Communication
    'Mail': 'communication', 'MessageSquare': 'communication', 'MessageCircle': 'communication',
    'Phone': 'communication', 'Video': 'communication', 'Bell': 'communication',
    'Send': 'communication', 'Share': 'communication', 'Share2': 'communication',

    // Media
    'Play': 'media', 'Pause': 'media', 'Volume': 'media', 'Volume2': 'media',
    'Music': 'media', 'Image': 'media', 'Camera': 'media', 'Film': 'media',

    // Shopping & Commerce
    'ShoppingCart': 'shopping', 'ShoppingBag': 'shopping', 'CreditCard': 'shopping',
    'DollarSign': 'shopping', 'Tag': 'shopping', 'Package': 'shopping',

    // Development
    'Code': 'development', 'Terminal': 'development', 'GitBranch': 'development',
    'Database': 'development', 'Server': 'development', 'Cpu': 'development',

    // Business
    'Briefcase': 'business', 'Calendar': 'business', 'Clock': 'business',
    'TrendingUp': 'business', 'TrendingDown': 'business', 'BarChart': 'business',

    // Social
    'Users': 'social', 'User': 'social', 'UserPlus': 'social', 'UserMinus': 'social',
    'ThumbsUp': 'social', 'ThumbsDown': 'social', 'Smile': 'social',

    // Tools
    'Tool': 'tools', 'Wrench': 'tools', 'Hammer': 'tools', 'Scissors': 'tools',
    'Palette': 'tools', 'Pen': 'tools', 'Pencil': 'tools',

    // Security
    'Lock': 'security', 'Unlock': 'security', 'Key': 'security', 'Shield': 'security',
    'Eye': 'security', 'EyeOff': 'security',

    // Misc
    'Home': 'misc', 'Globe': 'misc', 'Map': 'misc', 'Compass': 'misc',
    'Zap': 'misc', 'Sun': 'misc', 'Moon': 'misc', 'Cloud': 'misc'
  };

  return categories;
}

/**
 * Get category for an icon name
 * @param {string} iconName - Name of the icon
 * @returns {string} Category name or 'other'
 */
export function getIconCategory(iconName) {
  const categories = getIconCategories();
  return categories[iconName] || 'other';
}

/**
 * Get list of icons available for free tier users
 * @returns {string[]} Array of icon names allowed for free users
 */
export function getFreeIcons() {
  return [
    'Package',
    'Box',
    'Archive',
    'Star',
    'Heart',
    'Zap',
    'Settings',
    'Code'
  ];
}

/**
 * Check if an icon is available for free tier users
 * @param {string} iconName - Name of the icon
 * @returns {boolean} True if available for free users
 */
export function isIconFreeForFreeUsers(iconName) {
  return getFreeIcons().includes(iconName);
}
