
import React from 'react';
import ShareButton from '../components/common/ShareButton';


const ShareButtonDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            ShareButton Component Demo
          </h1>
          <p className="text-lg text-gray-600">
            Professional share button with Web Share API and beautiful fallback
            modal
          </p>
        </div>

        {/* Demo Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1 - Basic Share Button */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Basic Share Button
            </h2>
            <p className="text-gray-600 mb-6">
              Click to share this page. On mobile devices, it will open the
              native share sheet. On desktop, it will show a custom modal with
              share options.
            </p>
            <ShareButton
              url={window.location.href}
              title="Check out Sowntra!"
              text="Amazing design tool for creating beautiful content"
            />
          </div>

          {/* Card 2 - Custom Share Button */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Custom URL Share
            </h2>
            <p className="text-gray-600 mb-6">
              Share a custom project URL with specific parameters. Perfect for
              sharing individual projects or designs.
            </p>
            <ShareButton
              url="https://sowntra.com/project?id=123&name=MyAwesomeDesign"
              title="Check out my design!"
              text="I created this amazing design on Sowntra. Take a look!"
            />
          </div>

          {/* Card 3 - Compact Share Button */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Compact Version
            </h2>
            <p className="text-gray-600 mb-6">
              Smaller version for toolbars and compact interfaces. Perfect for
              integration into existing UIs.
            </p>
            <ShareButton
              url={window.location.href}
              title="Sowntra Design Tool"
              text="Create amazing designs with Sowntra!"
              className="px-3 py-1.5 text-sm"
            />
          </div>

          {/* Card 4 - Features List */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
            <h2 className="text-2xl font-semibold mb-4">✨ Features</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="mr-2">🚀</span>
                <span>Native Web Share API support for mobile devices</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🎨</span>
                <span>Beautiful custom modal fallback for desktop</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📱</span>
                <span>Share via WhatsApp, Telegram, Twitter, Email</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📋</span>
                <span>One-click copy to clipboard</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🎉</span>
                <span>Toast notification on successful copy</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">💎</span>
                <span>Fully responsive and accessible</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-12 bg-gray-800 rounded-2xl shadow-xl p-8 text-white overflow-x-auto">
          <h2 className="text-2xl font-semibold mb-4">💻 Usage Example</h2>
          <pre className="text-sm">
            <code>{`import ShareButton from '../components/ShareButton';

// Basic usage
<ShareButton />

// Custom configuration
<ShareButton 
  url="https://myapp.com/project?id=123"
  title="Check this out!"
  text="I want to share this with you"
  className="px-3 py-1.5"
/>`}</code>
          </pre>
        </div>

        {/* Browser Support Info */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            🌐 Browser Support
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-green-600 mb-2">
                ✅ Native Share API Supported
              </h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Safari (iOS and macOS)</li>
                <li>• Chrome (Android)</li>
                <li>• Edge (Windows)</li>
                <li>• Samsung Internet</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-600 mb-2">
                🎨 Custom Modal Fallback
              </h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Chrome (Desktop)</li>
                <li>• Firefox</li>
                <li>• Safari (older versions)</li>
                <li>• All other desktop browsers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareButtonDemo;
