import React, { useState, useMemo } from 'react';
import { Eye } from 'lucide-react';

function ExtensionTree({ 
  extensions, 
  onSelectExtension, 
  onPreviewExtension, 
  currentExtensionId,
  showActions = true,
  title = "Extensions"
}) {
  const [previewExtension, setPreviewExtension] = useState(null);

  // Process extensions into nested tree structure with unlimited depth
  const treeData = useMemo(() => {
    if (!extensions || extensions.length === 0) return [];

    const extensionsById = extensions.reduce((acc, ext) => {
      acc[ext.id] = { ...ext, revisions: [] };
      return acc;
    }, {});

    // Build the tree recursively
    const buildTree = () => {
      // First pass: attach each extension to its parent
      for (const ext of extensions) {
        if (ext.parent_id && extensionsById[ext.parent_id]) {
          extensionsById[ext.parent_id].revisions.push(extensionsById[ext.id]);
        }
      }

      // Sort revisions at each level
      const sortRevisions = (node) => {
        if (node.revisions && node.revisions.length > 0) {
          node.revisions.sort((a, b) => {
            // Sort by creation date to maintain chronological order
            return new Date(a.created_at) - new Date(b.created_at);
          });
          // Recursively sort children
          node.revisions.forEach(sortRevisions);
        }
      };

      // Find root extensions (those with no parent_id OR whose parent is not in the current extension list)
      const rootExtensions = [];
      for (const ext of extensions) {
        if (!ext.parent_id || !extensionsById[ext.parent_id]) {
          const rootNode = extensionsById[ext.id];
          sortRevisions(rootNode);
          rootExtensions.push(rootNode);
        }
      }

      return rootExtensions;
    };

    return buildTree();
  }, [extensions]);

  const createPreviewHtml = (extension) => {
    if (!extension || !extension.files) return '';
    const htmlFile = Object.keys(extension.files).find(name => name.endsWith('.html'));
    if (!htmlFile) return '<div style="padding: 20px; font-family: Arial; color: #333;">Preview unavailable: No HTML file found.</div>';
    let html = extension.files[htmlFile];
    const cssFile = Object.keys(extension.files).find(name => name.endsWith('.css'));
    const css = cssFile ? extension.files[cssFile] : '';
    html = html.replace(/<link.*rel="stylesheet".*>/g, '');
    const fallbackCss = `body { margin: 0; padding: 10px; font-family: Arial, sans-serif; background-color: #ffffff; color: #333333; }`;
    const combinedCss = fallbackCss + '\n' + (css || '');
    if (html.includes('</head>')) {
      return html.replace('</head>', `<style>${combinedCss}</style></head>`);
    } else {
      return `<!DOCTYPE html><html><head><style>${combinedCss}</style></head><body>${html}</body></html>`;
    }
  };

  const handlePreview = (extension) => {
    if (onPreviewExtension) {
      onPreviewExtension(extension);
    } else {
      setPreviewExtension(extension);
    }
  };

  const renderExtension = (ext, isRevision = false) => {
    const isCurrent = ext.id === currentExtensionId;
    
    return (
      <div key={ext.id} className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 ${isRevision ? 'ml-8' : ''} ${isCurrent ? 'ring-2 ring-purple-400' : ''}`}>
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="w-24 h-24 bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center">
              <iframe
                srcDoc={createPreviewHtml(ext)}
                style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                title={`Preview of ${ext.name}`}
                sandbox="allow-scripts"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-semibold text-white truncate">
                {ext.name} 
                {isRevision && <span className="text-sm text-gray-400"> v{ext.version}</span>}
                {isCurrent && <span className="ml-2 text-purple-400 text-sm">(Current)</span>}
              </h3>
              <p className="text-gray-400 text-sm truncate">
                {isRevision ? `Revision: ${ext.revision_prompt}` : `Prompt: ${ext.prompt}`}
              </p>
            </div>
          </div>
          {showActions && (
            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
              {!isCurrent && (
                <button 
                  onClick={() => onSelectExtension(ext)} 
                  className="p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600"
                  title="View Extension"
                >
                  <Eye className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
        {ext.revisions && ext.revisions.length > 0 && (
          <div className="mt-4 pl-8 border-l-2 border-gray-700">
            {ext.revisions.map(rev => renderExtension(rev, true))}
          </div>
        )}
      </div>
    );
  };

  if (!extensions || extensions.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p>No extensions found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {title && <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>}
        {treeData.map(ext => renderExtension(ext))}
      </div>
      
      {/* Preview Modal - only show if we're handling preview internally */}
      {!onPreviewExtension && previewExtension && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-60 p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg relative">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Preview: {previewExtension.name}</h3>
              <button onClick={() => setPreviewExtension(null)} className="text-gray-400 hover:text-white">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20">
              <p className="text-yellow-300 text-sm text-center">
                ⚠️ Preview may not render accurately. Data fetching doesn't work and button clicks won't respond properly.
              </p>
            </div>
            <div className="p-4 bg-white" style={{ height: '60vh' }}>
              <iframe
                srcDoc={createPreviewHtml(previewExtension)}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title={`Preview of ${previewExtension.name}`}
                sandbox="allow-scripts allow-modals"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ExtensionTree;