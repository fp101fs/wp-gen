import React, { useMemo } from 'react';
import { Eye } from 'lucide-react';

function RevisionTree({ revisions, onSelectExtension, currentExtensionId, title = "Revision History" }) {
  // Build nested tree structure like ExtensionTree
  const treeData = useMemo(() => {
    if (!revisions || revisions.length === 0) return [];

    const revisionsById = revisions.reduce((acc, rev) => {
      acc[rev.id] = { ...rev, children: [] };
      return acc;
    }, {});

    // Build the tree recursively
    const buildTree = () => {
      // First pass: attach each revision to its immediate parent
      for (const rev of revisions) {
        if (rev.parent_id && revisionsById[rev.parent_id]) {
          revisionsById[rev.parent_id].children.push(revisionsById[rev.id]);
        }
      }

      // Sort children at each level
      const sortChildren = (node) => {
        if (node.children && node.children.length > 0) {
          node.children.sort((a, b) => {
            return new Date(a.created_at) - new Date(b.created_at);
          });
          // Recursively sort children
          node.children.forEach(sortChildren);
        }
      };

      // Find root revisions (those with no parent_id OR whose parent is not in the current revision list)
      const rootRevisions = [];
      for (const rev of revisions) {
        if (!rev.parent_id || !revisionsById[rev.parent_id]) {
          const rootNode = revisionsById[rev.id];
          sortChildren(rootNode);
          rootRevisions.push(rootNode);
        }
      }

      return rootRevisions;
    };

    return buildTree();
  }, [revisions]);

  if (!revisions || revisions.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-gray-400">No revisions yet.</p>
        </div>
      </div>
    );
  }

  const renderRevision = (revision, isChild = false) => {
    const isCurrent = revision.id === currentExtensionId;
    
    return (
      <div key={revision.id} className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 ${isChild ? 'ml-8' : ''} ${isCurrent ? 'ring-2 ring-purple-400' : ''}`}>
        <div className="flex items-center justify-between min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-white">
                {revision.name}
                {isChild && <span className="text-sm text-gray-400"> v{revision.version}</span>}
                {isCurrent && <span className="ml-2 text-purple-400 text-sm">(Current)</span>}
              </p>
              <span className="text-gray-400 text-sm">
                {new Date(revision.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-300 mt-1 truncate">
              {isChild ? `Revision: ${revision.revision_prompt || revision.prompt}` : `Original: ${revision.prompt}`}
            </p>
          </div>
          {!isCurrent && (
            <button
              onClick={() => onSelectExtension(revision)}
              className="ml-4 p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 flex-shrink-0"
              title="View Extension"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
        {revision.children && revision.children.length > 0 && (
          <div className="mt-4 pl-8 border-l-2 border-gray-700">
            {revision.children.map(child => renderRevision(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
        {treeData.map(revision => renderRevision(revision))}
      </div>
    </div>
  );
}

export default RevisionTree;