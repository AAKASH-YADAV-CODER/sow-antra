import React from 'react';
import { 
  ArrowLeft, ZoomIn, ZoomOut, Maximize, Layers, Sparkles, 
  Play, Pause, Square, Film, Languages, User, LogOut, Settings, HelpCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ShareButton from '../ShareButton';

const Header = ({
  zoomLevel,
  zoom,
  centerCanvas,
  showTemplates,
  setShowTemplates,
  showEffectsPanel,
  setShowEffectsPanel,
  playAnimations,
  resetAnimations,
  isPlaying,
  recording,
  recordingTimeElapsed,
  startRecording,
  stopRecording,
  showLanguageMenu,
  setShowLanguageMenu,
  supportedLanguages,
  currentLanguage,
  setCurrentLanguage,
  setShowLanguageHelp,
  setGradientPickerKey,
  showAccountMenu,
  setShowAccountMenu,
  handleLogout
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="main-header flex">
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

      <div className="flex items-center space-x-1 md:space-x-2">
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="p-2 rounded hover:bg-white/20 touch-manipulation"
            title="Language"
          >
            <Languages size={18} className="md:w-5 md:h-5" />
          </button>
          {showLanguageMenu && (
            <div className="dropdown-menu" style={{ width: '200px' }}>
              <div className="font-semibold px-3 py-2 border-b text-gray-700">{t('language.title')}</div>
              {Object.entries(supportedLanguages).map(([code, lang]) => (
                <div
                  key={code}
                  className={`dropdown-item ${currentLanguage === code ? 'bg-blue-100 text-blue-800' : ''}`}
                  onClick={() => {
                    setCurrentLanguage(code);
                    i18n.changeLanguage(code);
                    setShowLanguageMenu(false);
                    setGradientPickerKey(prev => prev + 1);
                  }}
                >
                  <span>{lang.name}</span>
                </div>
              ))}
              <div className="border-t mt-1">
                <div
                  className="dropdown-item text-blue-500"
                  onClick={() => {
                    setShowLanguageHelp(true);
                    setShowLanguageMenu(false);
                  }}
                >
                  <HelpCircle size={16} className="mr-2" />
                  Typing Help
                </div>
              </div>
            </div>
          )}
        </div>

        <ShareButton 
          url={window.location.href}
          title="Check out my design on Sowntra!"
          text="I created this amazing design on Sowntra. Check it out!"
          className="px-2 md:px-3 py-1.5 hidden md:flex"
        />
        
        <div className="relative">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="p-2 rounded hover:bg-white/20 touch-manipulation"
            title="Account"
          >
            <User size={18} className="md:w-5 md:h-5" />
          </button>
          {showAccountMenu && (
            <div className="dropdown-menu">
              <div className="dropdown-item">
                <User size={16} />
                Profile
              </div>
              <div className="dropdown-item">
                <Settings size={16} />
                Settings
              </div>
              <div 
                className="dropdown-item text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
