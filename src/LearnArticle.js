import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from './Header';
import useDocumentTitle from './hooks/useDocumentTitle';

// Import all article components from LearnPage
import {
  GettingStartedArticle,
  UsingTokensArticle,
  FeaturesArticle,
  FAQArticle,
  DevelopmentTipsArticle,
  TroubleshootingArticle,
  QuickStartArticle,
  PrivacyArticle,
  TermsArticle,
  ExamplesArticle,
  SubmissionWalkthroughArticle,
  PlasmoAlternativesArticle,
  NoCodeChromeExtensionArticle,
  MonetizeChromeExtensionArticle,
  SubmitWebStoreArticle
} from './LearnPage';

// Article metadata for SEO and navigation
const ARTICLE_METADATA = {
  'quick-start': {
    title: 'Quick Start Guide - Kromio',
    description: 'Get started with Kromio in minutes. Learn how to create your first Chrome extension with AI.',
    component: 'QuickStartArticle'
  },
  'examples': {
    title: 'Extension Examples - Kromio',
    description: 'Explore real Chrome extension examples built with Kromio AI. Get inspiration for your next project.',
    component: 'ExtensionExamplesArticle'
  },
  'getting-started': {
    title: 'Getting Started - Kromio',
    description: 'Complete getting started guide for Kromio. Create account, explore dashboard, and get credits.',
    component: 'GettingStartedArticle'
  },
  'credits': {
    title: 'How to Use Credits - Kromio',
    description: 'Learn how the credit system works in Kromio. Get, use, and manage your credits effectively.',
    component: 'UsingTokensArticle'
  },
  'features': {
    title: 'Platform Features - Kromio',
    description: 'Discover all the powerful features of Kromio AI Chrome extension builder.',
    component: 'FeaturesArticle'
  },
  'faq': {
    title: 'Frequently Asked Questions - Kromio',
    description: 'Find answers to common questions about Kromio Chrome extension builder.',
    component: 'FAQArticle'
  },
  'troubleshooting': {
    title: 'Troubleshooting Guide - Kromio',
    description: 'Solve common issues and get help with Kromio Chrome extension development.',
    component: 'TroubleshootingArticle'
  },
  'tips': {
    title: 'Chrome Extension Development Tips - Kromio',
    description: 'Pro tips for developing better Chrome extensions with Kromio AI.',
    component: 'TipsArticle'
  },
  'privacy': {
    title: 'Privacy Policy - Kromio',
    description: 'Read Kromio\'s privacy policy and learn how we protect your data.',
    component: 'PrivacyPolicyArticle'
  },
  'terms': {
    title: 'Terms of Service - Kromio',
    description: 'Kromio terms of service and user agreement.',
    component: 'TermsOfServiceArticle'
  },
  'submission-guide': {
    title: 'Chrome Store Submission Guide - Kromio',
    description: 'Step-by-step guide to submit your Kromio-built extension to Chrome Web Store.',
    component: 'StoreSubmissionArticle'
  },
  'plasmo-alternatives': {
    title: 'Best Plasmo Alternatives for Chrome Extension Development - Kromio',
    description: 'Discover top Plasmo alternatives with Kromio as the #1 AI-powered no-code solution for browser extension development.',
    component: 'PlasmoAlternativesArticle'
  },
  'no-code-chrome-extension-builder': {
    title: 'No Code Chrome Extension Builder Guide - Kromio',
    description: 'Build powerful Chrome extensions without coding. Learn how no-code tools like Kromio revolutionize browser extension development.',
    component: 'NoCodeChromeExtensionArticle'
  },
  'monetize-chrome-extension': {
    title: 'How to Monetize Your Chrome Extension - Kromio',
    description: 'Turn your Chrome extension into profitable business. Learn monetization strategies, revenue models, and best practices.',
    component: 'MonetizeChromeExtensionArticle'
  },
  'submit-chrome-web-store': {
    title: 'How to Submit Extension to Chrome Web Store - Kromio',
    description: 'Complete guide to publishing your Chrome extension. Learn submission process, requirements, and approval tips.',
    component: 'SubmitWebStoreArticle'
  }
};

const LearnArticle = ({ onShowLoginModal }) => {
  const { article } = useParams();
  const navigate = useNavigate();
  
  // Get article metadata
  const articleData = ARTICLE_METADATA[article];
  
  // Set document title for SEO (must be called before any conditional logic)
  useDocumentTitle(articleData?.title || 'Learn - Kromio');
  
  // Handle hash fragment redirects (preserve existing SEO)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && !article) {
      const hashArticle = hash.replace('#', '');
      // Map common hash fragments to new routes
      const hashMapping = {
        'privacy': 'privacy',
        'terms': 'terms', 
        'getting-started': 'getting-started',
        'features': 'features',
        'faq': 'faq',
        'troubleshooting': 'troubleshooting',
        'quick-start': 'quick-start'
      };
      
      if (hashMapping[hashArticle]) {
        navigate(`/learn/${hashMapping[hashArticle]}`, { replace: true });
      }
    }
  }, [article, navigate]);
  
  // Handle unknown articles - redirect to main learn page
  useEffect(() => {
    if (!articleData) {
      navigate('/learn', { replace: true });
    }
  }, [articleData, navigate]);
  
  // If no article data, don't render anything (redirect is in progress)
  if (!articleData) {
    return null;
  }
  
  // Add structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": articleData.title,
    "description": articleData.description,
    "author": {
      "@type": "Organization",
      "name": "Kromio"
    },
    "publisher": {
      "@type": "Organization", 
      "name": "Kromio",
      "logo": {
        "@type": "ImageObject",
        "url": "https://kromio.ai/kromio.webp"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://kromio.ai/learn/${article}`
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* SEO Meta Tags */}
      <title>{articleData.title}</title>
      <meta name="description" content={articleData.description} />
      <meta property="og:title" content={articleData.title} />
      <meta property="og:description" content={articleData.description} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={`https://kromio.ai/learn/${article}`} />
      <meta property="og:image" content="https://kromio.ai/kromio.webp" />
      <meta property="twitter:card" content="summary" />
      <meta property="twitter:title" content={articleData.title} />
      <meta property="twitter:description" content={articleData.description} />
      <meta property="twitter:image" content="https://kromio.ai/kromio.webp" />
      <link rel="canonical" href={`https://kromio.ai/learn/${article}`} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <Header onShowLoginModal={onShowLoginModal} />
        
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Help Center
          </h1>
        </div>

        {/* Back to Topics Button */}
        <div className="mb-6">
          <button onClick={() => navigate('/learn')} className="flex items-center text-gray-300 hover:text-white transition-colors duration-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help Topics
          </button>
        </div>

        {/* Article Content Container */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <LearnPageArticleRenderer article={article} />
        </div>
      </div>
    </div>
  );
};

// Helper component to render the correct article
const LearnPageArticleRenderer = ({ article }) => {
  // Map article route keys to their corresponding components
  const articleComponents = {
    'quick-start': QuickStartArticle,
    'examples': ExamplesArticle,
    'getting-started': GettingStartedArticle,
    'credits': UsingTokensArticle,
    'features': FeaturesArticle,
    'faq': FAQArticle,
    'troubleshooting': TroubleshootingArticle,
    'tips': DevelopmentTipsArticle,
    'privacy': PrivacyArticle,
    'terms': TermsArticle,
    'submission-guide': SubmissionWalkthroughArticle,
    'plasmo-alternatives': PlasmoAlternativesArticle,
    'no-code-chrome-extension-builder': NoCodeChromeExtensionArticle,
    'monetize-chrome-extension': MonetizeChromeExtensionArticle,
    'submit-chrome-web-store': SubmitWebStoreArticle
  };
  
  // Get the corresponding component for this article
  const ArticleComponent = articleComponents[article];
  
  // If no component found, show error (this shouldn't happen with proper routing)
  if (!ArticleComponent) {
    return (
      <div className="text-gray-300">
        <h1 className="text-3xl font-bold mb-6 text-white">Article Not Found</h1>
        <p>The requested article "{article}" could not be found.</p>
      </div>
    );
  }
  
  // Render the actual article component
  return <ArticleComponent />;
};

export default LearnArticle;