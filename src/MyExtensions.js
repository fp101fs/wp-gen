import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from './supabaseClient';
import ExtensionTree from './ExtensionTree';

function MyExtensions({ isOpen, onClose, onSelectExtension }) {
  const [extensions, setExtensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewExtension, setPreviewExtension] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchExtensions();
    }
  }, [isOpen]);

  const fetchExtensions = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('extensions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching extensions:', error);
      } else {
        setExtensions(data);
      }
    }
    setLoading(false);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-8 max-w-4xl w-full relative border border-gray-700 shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-white mb-8 text-center">My Plugins</h2>
        <div className="max-h-[70vh] overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-400">Loading...</p>
          ) : (
            <ExtensionTree 
              extensions={extensions}
              onSelectExtension={onSelectExtension}
              onPreviewExtension={setPreviewExtension}
              title=""
            />
          )}
        </div>
      </div>

      {previewExtension && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-60 p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg relative">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Preview: {previewExtension.name}</h3>
              <button onClick={() => setPreviewExtension(null)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 bg-white" style={{ height: '60vh' }}>
              <iframe
                srcDoc={(() => {
                  if (!previewExtension || !previewExtension.files) return 'No preview available';
                  const htmlFile = Object.keys(previewExtension.files).find(name => name.endsWith('.html'));
                  if (!htmlFile) return '<div style="padding: 20px; font-family: Arial; color: #333;">Preview unavailable: No HTML file found.</div>';
                  let html = previewExtension.files[htmlFile];
                  const cssFile = Object.keys(previewExtension.files).find(name => name.endsWith('.css'));
                  const css = cssFile ? previewExtension.files[cssFile] : '';
                  html = html.replace(/<link.*rel="stylesheet".*>/g, '');
                  const fallbackCss = `body { margin: 0; padding: 10px; font-family: Arial, sans-serif; background-color: #ffffff; color: #333333; }`;
                  const combinedCss = fallbackCss + '\n' + (css || '');
                  if (html.includes('</head>')) {
                    return html.replace('</head>', `<style>${combinedCss}</style></head>`);
                  } else {
                    return `<!DOCTYPE html><html><head><style>${combinedCss}</style></head><body>${html}</body></html>`;
                  }
                })()}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title={`Preview of ${previewExtension.name}`}
                sandbox="allow-scripts allow-modals"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyExtensions;
