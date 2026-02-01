import React from 'react';
import { useTranslation } from 'react-i18next';

const VideoSettings = ({ 
  videoFormat, 
  videoQuality, 
  recordingDuration,
  onFormatChange, 
  onQualityChange, 
  onDurationChange 
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 md:p-4 sm:p-2">
      <h3 className="font-semibold mb-3 text-gray-700 text-base md:text-lg sm:text-sm">
        {t('export.videoSettings') || 'Video Settings'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 sm:gap-2">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 md:text-base sm:text-xs">
            {t('recording.format') || 'Format'}
          </label>
          <select
            value={videoFormat}
            onChange={(e) => onFormatChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg 
                       focus:border-blue-500 focus:outline-none
                       text-sm text-gray-700
                       md:p-2 sm:p-1.5 sm:text-xs"
          >
            <option value="webm">{t('export.webmRecommended') || 'WebM (Recommended)'}</option>
            <option value="mp4">{t('export.mp4Limited') || 'MP4 (Limited)'}</option>
            <option value="gif">{t('export.gifAnimated') || 'GIF (Animated)'}</option>
          </select>
          {videoFormat === 'mp4' && (
            <p className="text-xs text-orange-600 mt-1 md:text-sm sm:text-xs">
              {t('export.mp4Warning') || 'MP4 support is limited in browsers'}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 md:text-base sm:text-xs">
            {t('recording.quality') || 'Quality'}
          </label>
          <select
            value={videoQuality}
            onChange={(e) => onQualityChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg 
                       focus:border-blue-500 focus:outline-none
                       text-sm text-gray-700
                       md:p-2 sm:p-1.5 sm:text-xs"
          >
            <option value="low">{t('export.lowQuality') || 'Low (1 Mbps)'}</option>
            <option value="medium">{t('export.mediumQuality') || 'Medium (2.5 Mbps)'}</option>
            <option value="high">{t('export.highQuality') || 'High (5 Mbps)'}</option>
          </select>
        </div>
      </div>
      
      <div className="mt-3">
        <label className="block text-sm font-medium mb-1 text-gray-700 md:text-base sm:text-xs">
          Animation Loop: <span className="text-blue-600">{recordingDuration}s</span>
        </label>
        <input
          type="range"
          min="3"
          max="30"
          value={recordingDuration}
          onChange={(e) => onDurationChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gradient-to-r from-blue-400 to-blue-600 
                     rounded-lg appearance-none cursor-pointer
                     slider-thumb"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(recordingDuration - 3) / 27 * 100}%, #e5e7eb ${(recordingDuration - 3) / 27 * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1 md:text-sm sm:text-xs">
          <span>3s</span>
          <span>15s</span>
          <span>30s</span>
        </div>
        <p className="text-xs text-gray-500 mt-2 md:text-sm sm:text-xs">
          Duration for animations to loop (not recording length)
        </p>
      </div>

      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .slider-thumb::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          border: none;
        }

        @media (max-width: 640px) {
          .slider-thumb::-webkit-slider-thumb {
            width: 14px;
            height: 14px;
          }
          .slider-thumb::-moz-range-thumb {
            width: 14px;
            height: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default VideoSettings;
