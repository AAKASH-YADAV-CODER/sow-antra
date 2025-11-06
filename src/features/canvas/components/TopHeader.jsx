import React from 'react';
import {
  ArrowLeft, ZoomIn, ZoomOut, Maximize, Layers, Sparkles, Play, Pause,
  Square, Film, Languages, User, LogOut, Settings, HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ShareButton from '../../../components/common/ShareButton';

/**
 * TopHeader Component
 * Main header with navigation, zoom controls, templates, recording, language selector, and account menu
 * Responsive design for both desktop and mobile
 */
const TopHeader = ({
  // Navigation
  t,
  navigate,
  
  // Zoom controls
  zoom,
  zoomLevel,
  centerCanvas,
  
  // Templates & Effects
  showTemplates,
  setShowTemplates,
  showEffectsPanel,
  setShowEffectsPanel,
  
  // Animations & Recording
  playAnimations,
  resetAnimations,
  isPlaying,
  recording,
  recordingTimeElapsed,
  startRecording,
  stopRecording,
  
  // Language
  supportedLanguages,
  currentLanguage,
  setCurrentLanguage,
  i18n,
  showLanguageMenu,
  setShowLanguageMenu,
  setShowLanguageHelp,
  setGradientPickerKey,
  
  // Account
  currentUser,
  showAccountMenu,
  setShowAccountMenu,
  handleLogout
}) => {
  return (
    <div className="main-header flex">
      {/* Left Section: Logo and Zoom Controls */}
      <div className="flex items-center space-x-2 md:space-x-4">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors p-2 touch-manipulation"
          title="Back to Home"
        >
          <ArrowLeft className="w-5 h-5 md:mr-1" />
        </button>
        
        <h1 className="text-base md:text-xl font-bold flex items-center">
          <span className="handwritten-logo">Sowntra</span>
        </h1>
        
        {/* Desktop Zoom Controls */}
        <div className="hidden md:flex space-x-2">
          <button
            onClick={() => zoom('in')}
            className="p-2 rounded hover:bg-white/20 touch-manipulation"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={() => zoom('out')}
            className="p-2 rounded hover:bg-white/20 touch-manipulation"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={centerCanvas}
            className="p-2 rounded hover:bg-white/20 touch-manipulation"
            title="Fit to Viewport"
          >
            <Maximize size={18} />
          </button>
          <span className="px-2 py-1 bg-white/20 rounded text-sm">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>
      </div>

      {/* Center Section: Templates, Effects, Animations, Recording */}
      <div className="hidden md:flex space-x-2">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className={`px-3 py-2 rounded flex items-center touch-manipulation ${showTemplates ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'}`}
        >
          <Layers size={16} className="mr-1" />
          {t('toolbar.templates')}
        </button>
        
        <button
          onClick={() => setShowEffectsPanel(!showEffectsPanel)}
          className={`px-3 py-2 rounded flex items-center touch-manipulation ${showEffectsPanel ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'}`}
        >
          <Sparkles size={16} className="mr-1" />
          {t('toolbar.effects')}
        </button>
        
        <button
          onClick={playAnimations}
          disabled={isPlaying}
          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center touch-manipulation"
        >
          <Play size={16} className="mr-1" />
          {t('toolbar.play')}
        </button>
        
        <button
          onClick={resetAnimations}
          className="px-3 py-2 bg-white/20 text-white rounded hover:bg-white/30 flex items-center touch-manipulation"
        >
          <Pause size={16} className="mr-1" />
          {t('toolbar.reset')}
        </button>
        
        {recording ? (
          <div className="flex items-center space-x-2">
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded flex items-center text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              Recording: {Math.floor(recordingTimeElapsed / 60)}:{(recordingTimeElapsed % 60).toString().padStart(2, '0')}
            </div>
            <button
              onClick={stopRecording}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center touch-manipulation"
            >
              <Square size={16} className="mr-1" />
              Stop
            </button>
          </div>
        ) : (
          <button
            onClick={startRecording}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center touch-manipulation"
          >
            <Film size={16} className="mr-1" />
            {t('toolbar.record')}
          </button>
        )}
      </div>

      {/* Right Section: Language Selector, Share, Account */}
      <div className="flex items-center space-x-1 md:space-x-2">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="px-2 md:px-3 py-1.5 md:py-2 rounded bg-white/10 hover:bg-white/20 flex items-center gap-1 md:gap-2 touch-manipulation transition-colors"
            title="Language"
          >
            <Languages size={16} className="md:w-[18px] md:h-[18px]" />
            <span className="text-xs md:text-sm font-medium hidden sm:inline">
              {supportedLanguages[currentLanguage]?.name}
            </span>
          </button>
          
          {showLanguageMenu && (
            <>
              {/* Mobile: Full screen overlay */}
              <div 
                className="md:hidden fixed inset-0 bg-black/50 z-50"
                onClick={() => setShowLanguageMenu(false)}
              />
              <div className="md:dropdown-menu md:relative md:w-[200px] md:shadow-lg md:border md:border-gray-200 fixed md:static left-0 right-0 top-0 bottom-0 md:top-auto md:left-auto md:right-auto md:bottom-auto bg-white md:rounded-lg z-50 flex flex-col md:max-h-96 max-h-screen overflow-hidden">
                <div className="font-semibold px-4 py-3 border-b text-gray-700 flex items-center justify-between sticky top-0 bg-white z-10">
                  <div className="text-base md:text-sm font-bold">{t('language.title')}</div>
                  <button 
                    onClick={() => setShowLanguageMenu(false)}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 touch-manipulation text-2xl leading-none min-h-[44px] min-w-[44px]"
                  >
                    ×
                  </button>
                </div>
                <div className="overflow-y-auto flex-1">
                  {Object.entries(supportedLanguages).map(([code, lang]) => (
                    <div
                      key={code}
                      className={`dropdown-item md:px-3 md:py-2 px-4 py-3 cursor-pointer touch-manipulation ${currentLanguage === code ? 'bg-blue-50 text-blue-800' : 'hover:bg-gray-50'}`}
                      onClick={() => {
                        setCurrentLanguage(code);
                        i18n.changeLanguage(code);
                        setShowLanguageMenu(false);
                        setGradientPickerKey(prev => prev + 1);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm md:text-xs">{lang.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5 md:hidden">{lang.nativeName}</div>
                        </div>
                        {currentLanguage === code && (
                          <div className="text-blue-500 text-lg md:text-sm ml-2">✓</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t bg-white sticky bottom-0">
                  <div
                    className="dropdown-item md:px-3 md:py-2 px-5 py-3.5 text-blue-500 cursor-pointer hover:bg-blue-50 touch-manipulation flex items-center gap-3"
                    onClick={() => {
                      setShowLanguageHelp(true);
                      setShowLanguageMenu(false);
                    }}
                  >
                    <HelpCircle size={20} className="md:w-4 md:h-4" />
                    <div>
                      <div className="font-medium text-sm md:text-xs">Typing Help</div>
                      <div className="text-xs text-gray-500 md:hidden">Learn how to type in your language</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Share Button - Desktop only */}
        <ShareButton 
          url={window.location.href}
          title="Check out my design on Sowntra!"
          text="I created this amazing design on Sowntra. Check it out!"
          className="px-2 md:px-3 py-1.5 hidden md:flex"
        />
        
        {/* Account Menu */}
        <div className="relative">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="px-2 md:px-3 py-1.5 md:py-2 rounded bg-white/10 hover:bg-white/20 flex items-center gap-1 md:gap-2 touch-manipulation transition-colors min-h-[36px]"
            title="Account"
          >
            <User size={16} className="md:w-[18px] md:h-[18px]" />
            <span className="text-xs md:text-sm font-medium hidden sm:inline truncate max-w-[60px] sm:max-w-[80px] md:max-w-[100px] lg:max-w-[120px]">
              {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Account'}
            </span>
          </button>
          
          {showAccountMenu && (
            <>
              {/* Mobile: Full screen overlay */}
              <div 
                className="md:hidden fixed inset-0 bg-black/50 z-50"
                onClick={() => setShowAccountMenu(false)}
              />
              {/* Dropdown menu - Full screen on mobile, normal dropdown on desktop */}
              <div className="fixed md:absolute md:right-0 left-0 right-0 top-0 bottom-0 md:top-full md:mt-2 md:left-auto md:bottom-auto md:w-56 bg-white shadow-lg border border-gray-200 z-50 md:rounded-lg flex flex-col md:max-h-96 max-h-screen overflow-hidden">
                {/* Mobile header */}
                <div className="md:hidden font-semibold px-4 py-3 border-b text-gray-700 flex items-center justify-between sticky top-0 bg-white z-10">
                  <div className="text-base font-bold">Account</div>
                  <button 
                    onClick={() => setShowAccountMenu(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 touch-manipulation text-2xl leading-none min-h-[44px] min-w-[44px]"
                  >
                    ×
                  </button>
                </div>
                
                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto">
                  {/* User Info Card - Mobile only */}
                  <div className="px-4 py-3 border-b bg-gray-50 md:hidden">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {currentUser?.displayName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{currentUser?.displayName || 'User'}</div>
                        <div className="text-xs text-gray-500 truncate">{currentUser?.email}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu items */}
                  <div className="py-1">
                    <div className="dropdown-item md:px-3 md:py-2 px-4 py-3 cursor-pointer touch-manipulation hover:bg-gray-50">
                      <User size={18} className="md:w-4 md:h-4" />
                      <span className="text-sm md:text-xs font-medium">Profile</span>
                    </div>
                    <div className="dropdown-item md:px-3 md:py-2 px-4 py-3 cursor-pointer touch-manipulation hover:bg-gray-50">
                      <Settings size={18} className="md:w-4 md:h-4" />
                      <span className="text-sm md:text-xs font-medium">Settings</span>
                    </div>
                    <div className="border-t my-1 md:my-0"></div>
                    <div 
                      className="dropdown-item text-red-600 hover:bg-red-50 md:px-3 md:py-2 px-4 py-3 cursor-pointer touch-manipulation"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} className="md:w-4 md:h-4" />
                      <span className="text-sm md:text-xs font-medium">Logout</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
