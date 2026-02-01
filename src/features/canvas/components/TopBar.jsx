import React from 'react';
import {
  Undo, Redo, Save, FolderOpen, Download, Play, Pause, Film,
  Square, ZoomIn, ZoomOut, Maximize, Grid, Layers, Sparkles,
  Languages, User, LogOut, Settings, HelpCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ShareButton from '../../../components/common/ShareButton';

/**
 * TopBar Component
 * Main application toolbar with file operations, zoom, recording, etc.
 */
const TopBar = ({
  // Actions
  undo,
  redo,
  saveProject,
  loadProject,
  exportAsImage,
  
  // Animation & Recording
  playAnimations,
  resetAnimations,
  isPlaying,
  recording,
  recordingTimeElapsed,
  startRecording,
  stopRecording,
  
  // View Controls
  zoomLevel,
  handleZoom,
  fitToScreen,
  showGrid,
  setShowGrid,
  
  // Panels
  showTemplates,
  setShowTemplates,
  showEffectsPanel,
  setShowEffectsPanel,
  
  // Language
  currentLanguage,
  supportedLanguages,
  showLanguageMenu,
  setShowLanguageMenu,
  handleLanguageChange,
  
  // Account
  currentUser,
  showAccountMenu,
  setShowAccountMenu,
  handleLogout,
  showLanguageHelp,
  setShowLanguageHelp,
  
  // History state
  canUndo,
  canRedo,
}) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="gradient-header text-white px-3 py-2 md:px-4 md:py-3 flex items-center justify-between flex-wrap gap-2">
      {/* Left Section: Logo & Main Actions */}
      <div className="flex items-center space-x-1 md:space-x-2">
        <h1 className="text-lg md:text-xl font-bold mr-2 md:mr-4">
          Sowntra {t('app.title')}
        </h1>
        
        <div className="flex items-center space-x-1 border-r border-white/30 pr-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 md:p-2 rounded hover:bg-white/20 disabled:opacity-50 touch-manipulation transition-colors"
            title={t('toolbar.undo')}
          >
            <Undo size={16} className="md:w-[18px] md:h-[18px]" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 md:p-2 rounded hover:bg-white/20 disabled:opacity-50 touch-manipulation transition-colors"
            title={t('toolbar.redo')}
          >
            <Redo size={16} className="md:w-[18px] md:h-[18px]" />
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-1">
          <button
            onClick={saveProject}
            className="px-2 py-1.5 rounded hover:bg-white/20 flex items-center touch-manipulation transition-colors"
            title={t('toolbar.save')}
          >
            <Save size={16} className="mr-1" />
            <span className="text-xs hidden lg:inline">{t('toolbar.save')}</span>
          </button>
          <button
            onClick={loadProject}
            className="px-2 py-1.5 rounded hover:bg-white/20 flex items-center touch-manipulation transition-colors"
            title={t('toolbar.load')}
          >
            <FolderOpen size={16} className="mr-1" />
            <span className="text-xs hidden lg:inline">{t('toolbar.load')}</span>
          </button>
          <ShareButton
            canvasRef={{ current: null }}
            onShare={exportAsImage}
          />
        </div>
      </div>

      {/* Center Section: Zoom & Grid */}
      <div className="flex items-center space-x-1 md:space-x-2 order-3 md:order-2 w-full md:w-auto justify-center">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-1.5 md:p-2 rounded touch-manipulation transition-colors ${
            showGrid ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'
          }`}
          title="Toggle Grid"
        >
          <Grid size={16} className="md:w-[18px] md:h-[18px]" />
        </button>
        
        <div className="flex items-center bg-white/10 rounded px-1 md:px-2 py-1 space-x-1">
          <button
            onClick={() => handleZoom(-0.1)}
            className="p-1 hover:bg-white/20 rounded touch-manipulation"
          >
            <ZoomOut size={16} className="md:w-[18px] md:h-[18px]" />
          </button>
          <button
            onClick={() => handleZoom(0.1)}
            className="p-1 hover:bg-white/20 rounded touch-manipulation"
          >
            <ZoomIn size={16} className="md:w-[18px] md:h-[18px]" />
          </button>
          <button
            onClick={fitToScreen}
            className="p-1 hover:bg-white/20 rounded touch-manipulation"
          >
            <Maximize size={16} className="md:w-[18px] md:h-[18px]" />
          </button>
          <span className="px-2 py-1 bg-white/20 rounded text-xs md:text-sm">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>
      </div>

      {/* Right Section: Templates, Effects, Recording, Language, Account */}
      <div className="flex items-center space-x-1 md:space-x-2 order-2 md:order-3">
        <div className="hidden md:flex space-x-2">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className={`px-3 py-2 rounded flex items-center touch-manipulation transition-colors ${
              showTemplates ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            <Layers size={16} className="mr-1" />
            {t('toolbar.templates')}
          </button>
          <button
            onClick={() => setShowEffectsPanel(!showEffectsPanel)}
            className={`px-3 py-2 rounded flex items-center touch-manipulation transition-colors ${
              showEffectsPanel ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            <Sparkles size={16} className="mr-1" />
            {t('toolbar.effects')}
          </button>
          <button
            onClick={playAnimations}
            disabled={isPlaying}
            className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center touch-manipulation transition-colors"
          >
            <Play size={16} className="mr-1" />
            {t('toolbar.play')}
          </button>
          <button
            onClick={resetAnimations}
            className="px-3 py-2 bg-white/20 text-white rounded hover:bg-white/30 flex items-center touch-manipulation transition-colors"
          >
            <Pause size={16} className="mr-1" />
            {t('toolbar.reset')}
          </button>
          
          {/* Recording Button */}
          {recording ? (
            <div className="flex items-center space-x-2">
              <div className="px-3 py-2 bg-red-50 border border-red-200 rounded flex items-center text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                Recording: {Math.floor(recordingTimeElapsed / 60)}:{(recordingTimeElapsed % 60).toString().padStart(2, '0')}
              </div>
              <button
                onClick={stopRecording}
                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center touch-manipulation transition-colors"
              >
                <Square size={16} className="mr-1" />
                Stop
              </button>
            </div>
          ) : (
            <button
              onClick={startRecording}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center touch-manipulation transition-colors"
            >
              <Film size={16} className="mr-1" />
              {t('toolbar.record')}
            </button>
          )}
        </div>

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
                      className={`dropdown-item md:px-3 md:py-2 px-4 py-3 cursor-pointer touch-manipulation ${
                        currentLanguage === code ? 'bg-blue-50 text-blue-800' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleLanguageChange(code)}
                    >
                      <div className="font-medium">{lang.nativeName}</div>
                      <div className="text-xs text-gray-500">{lang.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Account Menu */}
        <div className="relative">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="px-2 md:px-3 py-1.5 md:py-2 rounded bg-white/10 hover:bg-white/20 flex items-center gap-1 md:gap-2 touch-manipulation transition-colors"
          >
            <User size={16} className="md:w-[18px] md:h-[18px]" />
            <span className="text-xs md:text-sm hidden lg:inline">
              {currentUser?.email?.split('@')[0] || 'User'}
            </span>
          </button>
          
          {showAccountMenu && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowAccountMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="px-4 py-3 border-b">
                  <div className="font-semibold text-gray-900">{currentUser?.email}</div>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowAccountMenu(false);
                      // Navigate to settings if you have a settings page
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-gray-700"
                  >
                    <Settings size={16} className="mr-2" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowLanguageHelp(true);
                      setShowAccountMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-gray-700"
                  >
                    <HelpCircle size={16} className="mr-2" />
                    Language Help
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-red-600"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
