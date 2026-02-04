import React, { useState } from 'react';
import { Download, Eye, Copy, X, FileText, Code, Image, Settings, FileIcon } from 'lucide-react';

function FilesDisplay({ files, title = "Generated Files" }) {
  const [showModal, setShowModal] = useState(false);
  const [currentFile, setCurrentFile] = useState({ name: '', content: '' });
  const [copyStatus, setCopyStatus] = useState(null);

  if (!files || Object.keys(files).length === 0) {
    return null;
  }

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'html':
        return <Code className="w-4 h-4 text-orange-400" />;
      case 'css':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'js':
        return <Code className="w-4 h-4 text-yellow-400" />;
      case 'json':
        return <Settings className="w-4 h-4 text-green-400" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <Image className="w-4 h-4 text-purple-400" />;
      default:
        return <FileIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatFileSize = (content) => {
    if (!content || typeof content !== 'string') return '0 B';
    const bytes = new Blob([content]).size;
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const downloadFile = (filename, content) => {
    if (!content || typeof content !== 'string') {
      alert('File content is not available for download');
      return;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const viewFile = (filename, content) => {
    setCurrentFile({ name: filename, content: content || 'File content unavailable' });
    setShowModal(true);
  };

  const copyFileContent = async () => {
    try {
      await navigator.clipboard.writeText(currentFile.content);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (err) {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCopyStatus(null);
  };

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="space-y-3">
            {Object.entries(files).map(([filename, content]) => (
              <div key={filename} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors">
                <div className="flex items-center space-x-3">
                  {getFileIcon(filename)}
                  <div className="flex flex-col">
                    <span className="text-sm font-mono text-white">{filename}</span>
                    <span className="text-xs text-gray-400 ml-1">{formatFileSize(content)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => viewFile(filename, content)}
                    className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
                    title={`View ${filename}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => downloadFile(filename, content)}
                    className="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-colors"
                    title={`Download ${filename}`}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* File Content Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                {getFileIcon(currentFile.name)}
                <h3 className="text-xl font-semibold text-white">{currentFile.name}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyFileContent}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all ${
                    copyStatus === 'success'
                      ? 'bg-green-600 text-white'
                      : copyStatus === 'error'
                      ? 'bg-red-600 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  <span>
                    {copyStatus === 'success' ? 'Copied!' : copyStatus === 'error' ? 'Failed' : 'Copy'}
                  </span>
                </button>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-auto">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-900 p-4 rounded-lg overflow-auto">
                {currentFile.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FilesDisplay;