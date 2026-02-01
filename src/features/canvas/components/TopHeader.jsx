import React, { useState } from 'react';
import {
  ArrowLeft, ZoomIn, ZoomOut, Maximize, Layers, Sparkles, Play, Pause,
  Square, Film, Languages, User, LogOut, Settings, HelpCircle, Download,
  Save, FolderOpen
} from 'lucide-react';
import ShareButton from '../../../components/common/ShareButton';
import VideoSettings from './VideoSettings';

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
  handleLogout,

  // Project
  onSaveProject,
  loadProject,

  // Export
  exportAsImage,
  exportAsPDF,
  exportAsVideo,
  videoFormat,
  setVideoFormat,
  videoQuality,
  setVideoQuality,
  recordingDuration,
  setRecordingDuration
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="main-header">
      {/* Left Section: Logo and Zoom Controls */}

      <div className="flex items-center gap-1 md:gap-2 min-w-0 flex-shrink-0">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors p-2 touch-manipulation flex-shrink-0"
          title="Back to Home"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        <h1 className="text-sm md:text-xl font-bold flex items-center flex-shrink-0 mr-2">
          <span className="handwritten-logo text-base md:text-2xl">Sowntra</span>
        </h1>

        {/* Project Actions (Save/Load) */}
        <div className="flex items-center border-l border-gray-300 pl-2 gap-1">
          <button
            onClick={onSaveProject}
            className="p-1.5 rounded hover:bg-white/20 touch-manipulation text-gray-600"
            title="Save Project"
          >
            <Save size={18} />
          </button>
          <button
            onClick={loadProject}
            className="p-1.5 rounded hover:bg-white/20 touch-manipulation text-gray-600"
            title="Load Project"
          >
            <FolderOpen size={18} />
          </button>
        </div>

        {/* Desktop Zoom Controls */}
        <div className="hidden lg:flex items-center gap-1 ml-2 border-l border-gray-300 pl-2">
          <button
            onClick={() => zoom('in')}
            className="p-1.5 rounded hover:bg-white/20 touch-manipulation"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => zoom('out')}
            className="p-1.5 rounded hover:bg-white/20 touch-manipulation"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={centerCanvas}
            className="p-1.5 rounded hover:bg-white/20 touch-manipulation"
            title="Fit to Viewport"
          >
            <Maximize size={16} />
          </button>
        </div>

      </div>

      {/* Center Section: Templates, Effects, Animations, Recording */}
      <div className="hidden lg:flex items-center gap-1.5 flex-shrink min-w-0">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className={`px-2 py-1.5 rounded flex items-center touch-manipulation text-sm whitespace-nowrap ${showTemplates ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'}`}
        >
          <Layers size={14} className="mr-1" />
          <span className="hidden xl:inline">{t('toolbar.templates')}</span>
        </button>


        <button
          onClick={() => setShowEffectsPanel(!showEffectsPanel)}
          className={`px-2 py-1.5 rounded flex items-center touch-manipulation text-sm whitespace-nowrap ${showEffectsPanel ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'}`}
        >
          <Sparkles size={14} className="mr-1" />
          <span className="hidden xl:inline">{t('toolbar.effects')}</span>
        </button>


        <button
          onClick={playAnimations}
          disabled={isPlaying}
          className="px-2 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center touch-manipulation text-sm whitespace-nowrap"
        >
          <Play size={14} className="xl:mr-1" />
          <span className="hidden xl:inline">Preview</span>
        </button>


        <button
          onClick={resetAnimations}
          className="px-2 py-1.5 bg-white/20 text-white rounded hover:bg-white/30 flex items-center touch-manipulation text-sm whitespace-nowrap"
        >
          <Pause size={14} className="xl:mr-1" />
          <span className="hidden xl:inline">{t('toolbar.reset')}</span>
        </button>

      </div>

      {/* Right Section: Language Selector, Share, Account */}
      <div className="flex items-center gap-1 md:gap-1.5 flex-shrink-0 ml-auto">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="px-2 py-1.5 rounded bg-white/10 hover:bg-white/20 flex items-center gap-1 touch-manipulation transition-colors"
            title="Language"
          >
            <Languages size={16} className="flex-shrink-0" />
            <span className="text-xs font-medium hidden md:inline truncate max-w-[60px]">
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
              <div className="fixed md:absolute md:right-0 left-0 right-0 top-0 bottom-0 md:top-full md:mt-2 md:left-auto md:bottom-auto md:w-56 bg-white shadow-lg border border-gray-200 z-50 md:rounded-lg flex flex-col md:max-h-96 max-h-screen overflow-hidden">
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
          className="px-2 py-1.5 hidden lg:flex"
        />

        {/* Export / Download Button */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-2 py-1.5 rounded bg-white/10 hover:bg-white/20 flex items-center gap-1 touch-manipulation transition-colors"
            title="Download"
          >
            <Download size={16} className="flex-shrink-0" />
            <span className="text-xs font-medium hidden lg:inline">Download</span>
          </button>

          {showExportMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-3 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-sm font-bold text-gray-700 mb-2 px-1">Download</h3>

                {/* Image Exports */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button onClick={() => { exportAsImage('png'); setShowExportMenu(false); }} className="p-2 bg-gray-50 hover:bg-gray-100 rounded text-xs text-gray-700 font-medium border border-gray-200 transition-colors">PNG</button>
                  <button onClick={() => { exportAsImage('jpeg'); setShowExportMenu(false); }} className="p-2 bg-gray-50 hover:bg-gray-100 rounded text-xs text-gray-700 font-medium border border-gray-200 transition-colors">JPEG</button>
                  <button onClick={() => { exportAsImage('webp'); setShowExportMenu(false); }} className="p-2 bg-gray-50 hover:bg-gray-100 rounded text-xs text-gray-700 font-medium border border-gray-200 transition-colors">WebP</button>
                  <button onClick={() => { exportAsImage('svg'); setShowExportMenu(false); }} className="p-2 bg-gray-50 hover:bg-gray-100 rounded text-xs text-gray-700 font-medium border border-gray-200 transition-colors">SVG</button>
                </div>

                <button
                  onClick={() => { exportAsPDF(); setShowExportMenu(false); }}
                  className="w-full p-2 mb-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-sm font-medium border border-blue-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={14} /> Download PDF
                </button>

                <div className="h-px bg-gray-200 my-2" />

                <h3 className="text-sm font-bold text-gray-700 mb-2 px-1">Video / GIF</h3>
                <VideoSettings
                  videoFormat={videoFormat}
                  videoQuality={videoQuality}
                  recordingDuration={recordingDuration}
                  onFormatChange={setVideoFormat}
                  onQualityChange={setVideoQuality}
                  onDurationChange={setRecordingDuration}
                />

                {!recording ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      onClick={() => {
                        exportAsVideo(recordingDuration * 1000, (prog) => console.log(prog), 'video/mp4');
                        setShowExportMenu(false);
                      }}
                      className="w-full p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Film size={14} /> Download Video (MP4)
                    </button>

                    <button
                      onClick={() => {
                        // GIF export requires complex encoding, for now we will use video 
                        // or we'd need to inject gif.js. Use MP4 for best quality.
                        alert("GIF export is coming soon! Downloading as Video for now.");
                        exportAsVideo(recordingDuration * 1000, undefined, 'video/mp4');
                        setShowExportMenu(false);
                      }}
                      className="w-full p-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Film size={14} /> Download GIF
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { stopRecording(); setShowExportMenu(false); }}
                    className="w-full mt-2 p-2 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Square size={14} className="fill-current" /> Stop Recording
                  </button>
                )}
              </div>
            </>
          )}
        </div>


        {/* Account Menu */}
        <div className="relative">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="px-2 py-1.5 rounded bg-white/10 hover:bg-white/20 flex items-center gap-1 touch-manipulation transition-colors"
            title="Account"
          >
            <User size={16} className="flex-shrink-0" />
            <span className="text-xs font-medium hidden lg:inline truncate max-w-[80px]">
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
