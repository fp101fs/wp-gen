// Platform configurations for multi-platform plugin support

export const PLATFORMS = {
  wordpress: {
    id: 'wordpress',
    name: 'WordPress',
    description: 'WordPress Plugin',
    placeholders: [
      "Create a plugin that adds a custom dashboard widget showing site stats",
      "Build a contact form plugin with email notifications",
      "Make a plugin that adds social sharing buttons to posts",
      "Create a custom post type for testimonials with star ratings",
      "Build a plugin that optimizes images on upload",
      "Make a shortcode that displays a pricing table",
      "Create a plugin that adds a maintenance mode page",
      "Build a widget that shows recent posts with thumbnails"
    ],
    heading: 'No Code WordPress Plugin Builder',
    inputPlaceholder: 'Ask AI to create a WordPress plugin that...',
  },
  'google-sheets': {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Apps Script Add-on',
    placeholders: [
      "Create an add-on that formats selected cells as currency",
      "Build a script that imports data from a public API",
      "Make an add-on that highlights duplicate values",
      "Create a sidebar that shows cell statistics",
      "Build a script that generates charts from selected data",
      "Make an add-on that exports sheets to JSON format",
      "Create a custom menu with data validation tools",
      "Build a script that merges data from multiple sheets"
    ],
    heading: 'No Code Google Sheets Add-on Builder',
    inputPlaceholder: 'Ask AI to create a Google Sheets add-on that...',
  },
  'google-sheets-addon': {
    id: 'google-sheets-addon',
    name: 'Google Sheets Add-on',
    description: 'Workspace Marketplace Add-on',
    placeholders: [
      "Create a Workspace add-on with a sidebar for data analysis",
      "Build a Marketplace-ready add-on for project tracking",
      "Make a card-based add-on for invoice generation",
      "Create a professional add-on with settings and preferences",
      "Build a Workspace add-on that syncs data with external APIs",
      "Make a sidebar add-on for team collaboration features",
      "Create a CardService-based add-on for expense tracking",
      "Build a Marketplace add-on with custom card actions"
    ],
    heading: 'No Code Google Sheets Add-on Builder',
    inputPlaceholder: 'Ask AI to create a Google Sheets add-on that...',
  },
  'blender': {
    id: 'blender',
    name: 'Blender',
    description: 'Blender Add-on',
    placeholders: [
      "Create an add-on that generates random low-poly terrain meshes",
      "Build a batch exporter that exports selected objects to multiple formats",
      "Make an add-on that creates a custom procedural texture node setup",
      "Create a rigging tool that auto-generates IK controls for armatures",
      "Build an add-on that imports reference images as camera backgrounds",
      "Make a tool that converts mesh objects to grease pencil strokes",
      "Create an add-on that randomizes material properties across selected objects",
      "Build a scene organizer that groups objects by type into collections"
    ],
    heading: 'No Code Blender Add-on Builder',
    inputPlaceholder: 'Ask AI to create a Blender add-on that...',
  },
  'figma': {
    id: 'figma',
    name: 'Figma',
    description: 'Figma Plugin',
    placeholders: [
      "Create a plugin that generates random color palettes from selection",
      "Build a plugin that batch renames layers with a prefix/suffix",
      "Make a plugin that exports selected frames as optimized SVGs",
      "Create a plugin that aligns and distributes objects evenly",
      "Build a plugin that generates placeholder text in text layers",
      "Make a plugin that creates a style guide from selected elements",
      "Create a plugin that converts frames to auto-layout",
      "Build a plugin that finds and replaces text across the document"
    ],
    heading: 'No Code Figma Plugin Builder',
    inputPlaceholder: 'Ask AI to create a Figma plugin that...',
  }
};

export const DEFAULT_PLATFORM = 'wordpress';

// Get platform config by ID
export const getPlatform = (platformId) => {
  return PLATFORMS[platformId] || PLATFORMS[DEFAULT_PLATFORM];
};

// Get all platform IDs
export const getPlatformIds = () => Object.keys(PLATFORMS);

export default PLATFORMS;
