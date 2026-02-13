import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
// JSZip will be loaded dynamically when download is clicked
import { supabase } from './supabaseClient';
import InstallationModal from './components/InstallationModal';

const toKebabCase = (str) => str
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

function DownloadButton({ extension, files, className, size = "default", onShowLoginModal }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [session, setSession] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleDownloadClick = () => {
    const extensionFiles = files || extension?.files;
    if (!extension || !extensionFiles) return;
    
    // Check if user is logged in, show login modal if not
    if (!session && onShowLoginModal) {
      onShowLoginModal();
      return;
    }

    downloadExtension();
  };

  const downloadExtension = async () => {
    const extensionFiles = files || extension?.files;
    if (!extension || !extensionFiles) return;
    
    setIsDownloading(true);
    try {
      // Dynamically import JSZip only when downloading
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const extensionVersion = extension.version || '1.0';
      const safeVersion = extensionVersion.replace(/\./g, '_');
      const folderName = `${extension.name.replace(/[^a-zA-Z0-9]/g, '_')}_v${safeVersion}`;
      
      // Handle Shopify Theme App Extensions with proper folder structure
      if (extension.platform === 'shopify') {
        const slug = toKebabCase(extension.name);

        // Remap AI-generated files to proper Shopify CLI structure
        Object.entries(extensionFiles).forEach(([filename, content]) => {
          if (content && typeof content === 'string' && content.trim()) {
            if (filename.startsWith('blocks/')) {
              // Move blocks to extensions/{slug}/blocks/
              zip.file(`${folderName}/extensions/${slug}/${filename}`, content);
            } else if (filename.startsWith('assets/')) {
              // Move assets to extensions/{slug}/assets/
              zip.file(`${folderName}/extensions/${slug}/${filename}`, content);
            } else if (filename.startsWith('locales/')) {
              // Move locales to extensions/{slug}/locales/
              zip.file(`${folderName}/extensions/${slug}/${filename}`, content);
            } else if (filename.startsWith('snippets/')) {
              // Move snippets to extensions/{slug}/snippets/
              zip.file(`${folderName}/extensions/${slug}/${filename}`, content);
            } else {
              // Other files go to root
              zip.file(`${folderName}/${filename}`, content);
            }
          } else {
            console.warn(`Skipping file ${filename} - invalid content`);
          }
        });

        // Generate shopify.extension.toml
        const shopifyExtensionToml = `api_version = "2024-01"

[[extensions]]
type = "theme"
name = "${extension.name}"
handle = "${slug}"

[[extensions.blocks]]
name = "${extension.name}"
target = "section"
template = "blocks/${slug}.liquid"
`;
        zip.file(`${folderName}/extensions/${slug}/shopify.extension.toml`, shopifyExtensionToml);

        // Generate shopify.app.toml
        const shopifyAppToml = `# Run: shopify app config link
# This will connect to your Shopify Partner app

name = "${extension.name}"
client_id = "YOUR_CLIENT_ID"
application_url = "https://localhost"

[access_scopes]
scopes = ""

[auth]
redirect_urls = ["https://localhost/callback"]

[webhooks]
api_version = "2024-01"
`;
        zip.file(`${folderName}/shopify.app.toml`, shopifyAppToml);

        // Generate package.json
        const packageJson = JSON.stringify({
          name: slug,
          version: "1.0.0"
        }, null, 2);
        zip.file(`${folderName}/package.json`, packageJson);

      } else {
        // Non-Shopify platforms: use existing simple file copying
        Object.entries(extensionFiles).forEach(([filename, content]) => {
          if (content && typeof content === 'string' && content.trim()) {
            zip.file(`${folderName}/${filename}`, content);
          } else {
            console.warn(`Skipping file ${filename} - invalid content`);
          }
        });
      }
      
      const defaultInstructions = extension?.platform === 'figma'
        ? 'Installation Instructions (Figma Plugin):\n1. Extract this ZIP file to a folder\n2. Open Figma Desktop App\n3. Go to Plugins > Development > Import plugin from manifest\n4. Select the manifest.json file from the extracted folder\n5. Run via Plugins > Development > Your Plugin Name'
        : extension?.platform === 'blender'
        ? 'Installation Instructions (Blender Add-on):\n1. Open Blender > Edit > Preferences > Add-ons\n2. Click "Install..." button\n3. Select this ZIP file\n4. Enable the add-on checkbox\n5. Find panel in 3D Viewport sidebar (press N)\n6. Save Preferences'
        : extension?.platform === 'google-sheets-addon'
        ? 'Installation Instructions (Workspace Add-on):\n1. Open Google Sheets > Extensions > Apps Script\n2. Delete default code, paste Code.gs contents\n3. Enable "Show appsscript.json" in Project Settings (gear icon)\n4. Replace appsscript.json content with the provided manifest\n5. Save the project\n6. Go to Deploy > Test deployments > Install\n7. Refresh your spreadsheet - sidebar opens automatically!\n\nMarketplace Submission:\n1. Complete testing with Deploy > Test deployments\n2. Go to Deploy > New deployment > Select type: Add-on\n3. Fill in deployment details and submit for review'
        : extension?.platform === 'google-sheets'
        ? 'Installation Instructions:\n1. Open Google Sheets > Extensions > Apps Script\n2. Delete default code, paste Code.gs contents\n3. Add other .gs files via File > New > Script\n4. Save, then refresh your spreadsheet\n5. Find your add-on in the custom menu'
        : 'Installation Instructions:\n1. Go to WordPress Admin > Plugins > Add New > Upload Plugin\n2. Choose the ZIP file and click Install Now\n3. Activate the plugin after installation';

      // Generate README - markdown for Shopify, text for others
      if (extension.platform === 'shopify') {
        const slug = toKebabCase(extension.name);
        const shopifyReadme = `# ${extension.name}

## Setup

1. \`cd ${folderName}\`
2. \`shopify app config link\` (connect to your Shopify Partner app)
3. \`shopify app dev\` (start development server)
4. Open your dev store's theme customizer
5. Go to a product page → Add block → Look under "Apps" section

## Files

- \`extensions/${slug}/blocks/\` - Liquid block templates
- \`extensions/${slug}/assets/\` - CSS and JS files

## Generated by plugin.new
`;
        zip.file(`${folderName}/README.md`, shopifyReadme);
      } else {
        zip.file(`${folderName}/README.txt`,
          `${extension.name} v${extensionVersion}\n${extension.description}\n\n${extension.instructions || defaultInstructions}\n\nGenerated by plugin.new\n`
        );
      }
      
      const content = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
      
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${extension.name.replace(/[^a-zA-Z0-9]/g, '_')}_v${safeVersion}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show installation modal after successful download
      setTimeout(() => {
        setShowInstallModal(true);
      }, 500); // Small delay to ensure download starts
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download plugin. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };


  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "py-1 px-3 text-sm";
      case "large":
        return "py-3 px-6 text-lg";
      default:
        return "py-2 px-4";
    }
  };

  const baseClasses = "bg-green-500 hover:bg-green-600 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-300 flex items-center space-x-2";
  const sizeClasses = getSizeClasses();
  const finalClassName = className ? `${baseClasses} ${sizeClasses} ${className}` : `${baseClasses} ${sizeClasses}`;

  return (
    <>
      <button
        onClick={handleDownloadClick}
        disabled={isDownloading || (!files && !extension?.files)}
        className={finalClassName}
        data-download-button
      >
        <Download className="w-4 h-4" />
        <span>{isDownloading ? 'Downloading...' : 'Download ZIP'}</span>
      </button>
      
      <InstallationModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        extensionName={extension?.name || 'Your Extension'}
        platform={extension?.platform || 'wordpress'}
      />
    </>
  );
}

export default DownloadButton;