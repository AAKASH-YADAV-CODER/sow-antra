import React from 'react';
import {
  Copy, Trash2, Lock, Unlock, MinusCircle, PlusCircle,
  Download, Sparkles, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Film, Square, Save, FolderOpen
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GradientPicker from './GradientPicker';
import VideoSettings from './VideoSettings';

/**
 * Properties Panel Component
 * Displays and manages properties of the selected element
 */
const PropertiesPanel = ({
  selectedElement,
  selectedElementData,
  animations,
  filterOptions,
  fontFamilies,
  stickerOptions,
  showEffectsPanel,
  setShowEffectsPanel,
  gradientPickerKey,
  lockedElements,
  updateElement,
  updateFilter,
  duplicateElement,
  deleteElement,
  toggleElementLock,
  changeZIndex,
  exportAsImage,
  exportAsPDF,
  handleSaveClick,
  loadProject,
  TransliterationToggle,
  recording,
  startRecording,
  stopRecording,
  recordingTimeElapsed,
  videoFormat,
  setVideoFormat,
  videoQuality,
  setVideoQuality,
  recordingDuration,
  setRecordingDuration,
}) => {
  const { t } = useTranslation();

  return (
    <div className="properties-panel hidden md:block">
      {/* Properties Section */}
      {!selectedElementData ? (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4">{t('properties.title')}</h2>
          <p className="text-gray-500 text-sm">{t('properties.selectElement')}</p>
        </div>
      ) : (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4">{t('properties.title')}</h2>

        {/* Animation Selection */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">{t('properties.animation')}</label>
          <select
            value={selectedElementData.animation || ''}
            onChange={(e) => updateElement(selectedElement, { animation: e.target.value || null })}
            className="w-full p-2 border rounded text-sm"
          >
            <option value="">{t('effects.none')}</option>
            {Object.entries(animations).map(([key, anim]) => (
              <option key={key} value={key}>
                {anim.name}
              </option>
            ))}
          </select>
        </div>

        {/* Effects Quick Access */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">{t('properties.quickEffects')}</label>
          <button
            onClick={() => setShowEffectsPanel(!showEffectsPanel)}
            className="w-full p-2 bg-purple-100 text-purple-600 rounded text-sm hover:bg-purple-200 flex items-center justify-center"
          >
            <Sparkles size={14} className="mr-1" />
            {t('properties.openEffectsPanel')}
          </button>
        </div>

        {/* Position and Size */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="block text-sm font-medium mb-1">{t('properties.x')}</label>
            <input
              type="number"
              value={selectedElementData.x}
              onChange={(e) => updateElement(selectedElement, { x: parseInt(e.target.value) })}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('properties.y')}</label>
            <input
              type="number"
              value={selectedElementData.y}
              onChange={(e) => updateElement(selectedElement, { y: parseInt(e.target.value) })}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="block text-sm font-medium mb-1">{t('properties.width')}</label>
            <input
              type="number"
              value={selectedElementData.width}
              onChange={(e) => updateElement(selectedElement, { width: parseInt(e.target.value) })}
              className="w-full p-2 border rounded text-sm"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('properties.height')}</label>
            <input
              type="number"
              value={selectedElementData.height}
              onChange={(e) => updateElement(selectedElement, { height: parseInt(e.target.value) })}
              className="w-full p-2 border rounded text-sm"
              min="1"
            />
          </div>
        </div>

        {/* Rotation */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">{t('properties.rotation')}</label>
          <input
            type="range"
            min="0"
            max="360"
            value={selectedElementData.rotation || 0}
            onChange={(e) => updateElement(selectedElement, { rotation: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="text-xs text-center">{selectedElementData.rotation || 0}°</div>
        </div>

        {/* Filters */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Filters</label>
          {Object.entries(selectedElementData.filters || filterOptions).map(([key, filter]) => (
            <div key={key} className="filter-slider">
              <label>{filter.name}</label>
              <input
                type="range"
                min="0"
                max={filter.max}
                value={filter.value}
                onChange={(e) => updateFilter(selectedElement, key, parseInt(e.target.value))}
                className="w-full"
              />
              <div className="filter-value">{filter.value}{filter.unit}</div>
            </div>
          ))}
        </div>

        {/* Fill Type Selection for Shapes */}
        {['rectangle', 'circle', 'triangle', 'star', 'hexagon', 'sticker'].includes(selectedElementData.type) && (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Fill Type</label>
              <div className="flex space-x-2 mb-3">
                <button
                  onClick={() => updateElement(selectedElement, { fillType: 'solid' })}
                  className={`p-2 rounded text-xs flex-1 ${
                    selectedElementData.fillType === 'solid' ? 'bg-blue-100 text-blue-600 border border-blue-300' : 'bg-gray-100 border border-gray-300'
                  }`}
                >
                  Solid Color
                </button>
                <button
                  onClick={() => updateElement(selectedElement, { fillType: 'gradient' })}
                  className={`p-2 rounded text-xs flex-1 ${
                    selectedElementData.fillType === 'gradient' ? 'bg-blue-100 text-blue-600 border border-blue-300' : 'bg-gray-100 border border-gray-300'
                  }`}
                >
                  Gradient
                </button>
              </div>
            </div>

            {/* Solid Color Picker */}
            {selectedElementData.fillType === 'solid' && (
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Fill Color</label>
                <input
                  type="color"
                  value={selectedElementData.fill}
                  onChange={(e) => updateElement(selectedElement, { fill: e.target.value })}
                  className="w-full p-2 border rounded text-sm h-10 cursor-pointer"
                />
              </div>
            )}

            {/* Gradient Picker */}
            {selectedElementData.fillType === 'gradient' && (
              <GradientPicker
                key={gradientPickerKey}
                gradient={selectedElementData.gradient}
                onGradientChange={(gradient) => updateElement(selectedElement, { gradient })}
              />
            )}
          </>
        )}

        {/* Text Properties */}
        {selectedElementData.type === 'text' && (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">{t('text.fontSize')}</label>
              <input
                type="number"
                value={selectedElementData.fontSize}
                onChange={(e) => updateElement(selectedElement, { fontSize: parseInt(e.target.value) })}
                className="w-full p-2 border rounded text-sm"
                min="8"
                max="72"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">{t('text.fontFamily')}</label>
              <select
                value={selectedElementData.fontFamily}
                onChange={(e) => updateElement(selectedElement, { fontFamily: e.target.value })}
                className="w-full p-2 border rounded text-sm"
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">{t('text.color')}</label>
              <input
                type="color"
                value={selectedElementData.color}
                onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                className="w-full p-2 border rounded text-sm h-10"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">{t('text.textAlign')}</label>
              <div className="flex space-x-1">
                <button
                  onClick={() => updateElement(selectedElement, { textAlign: 'left' })}
                  className={`flex-1 p-2 rounded ${
                    selectedElementData.textAlign === 'left' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
                  }`}
                >
                  <AlignLeft size={16} className="mx-auto" />
                </button>
                <button
                  onClick={() => updateElement(selectedElement, { textAlign: 'center' })}
                  className={`flex-1 p-2 rounded ${
                    selectedElementData.textAlign === 'center' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
                  }`}
                >
                  <AlignCenter size={16} className="mx-auto" />
                </button>
                <button
                  onClick={() => updateElement(selectedElement, { textAlign: 'right' })}
                  className={`flex-1 p-2 rounded ${
                    selectedElementData.textAlign === 'right' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
                  }`}
                >
                  <AlignRight size={16} className="mx-auto" />
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">{t('text.textStyle')}</label>
              <div className="flex space-x-1">
                <button
                  onClick={() => updateElement(selectedElement, { fontWeight: selectedElementData.fontWeight === 'bold' ? 'normal' : 'bold' })}
                  className={`flex-1 p-2 rounded ${
                    selectedElementData.fontWeight === 'bold' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
                  }`}
                >
                  <Bold size={16} className="mx-auto" />
                </button>
                <button
                  onClick={() => updateElement(selectedElement, { fontStyle: selectedElementData.fontStyle === 'italic' ? 'normal' : 'italic' })}
                  className={`flex-1 p-2 rounded ${
                    selectedElementData.fontStyle === 'italic' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
                  }`}
                >
                  <Italic size={16} className="mx-auto" />
                </button>
                <button
                  onClick={() => updateElement(selectedElement, { textDecoration: selectedElementData.textDecoration === 'underline' ? 'none' : 'underline' })}
                  className={`flex-1 p-2 rounded ${
                    selectedElementData.textDecoration === 'underline' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
                  }`}
                >
                  <Underline size={16} className="mx-auto" />
                </button>
              </div>
            </div>
            <TransliterationToggle />
          </>
        )}

        {/* Shape Properties */}
        {['rectangle', 'circle', 'triangle', 'star', 'hexagon'].includes(selectedElementData.type) && (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Stroke Color</label>
              <input
                type="color"
                value={selectedElementData.stroke}
                onChange={(e) => updateElement(selectedElement, { stroke: e.target.value })}
                className="w-full p-2 border rounded text-sm h-10 cursor-pointer"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Stroke Width</label>
              <input
                type="number"
                value={selectedElementData.strokeWidth}
                onChange={(e) => updateElement(selectedElement, { strokeWidth: parseInt(e.target.value) })}
                className="w-full p-2 border rounded text-sm"
                min="0"
              />
            </div>
            {selectedElementData.type === 'rectangle' && (
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Border Radius</label>
                <input
                  type="number"
                  value={selectedElementData.borderRadius}
                  onChange={(e) => updateElement(selectedElement, { borderRadius: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded text-sm"
                  min="0"
                />
              </div>
            )}
            {selectedElementData.type === 'star' && (
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Points</label>
                <input
                  type="number"
                  value={selectedElementData.points || 5}
                  onChange={(e) => updateElement(selectedElement, { points: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded text-sm"
                  min="3"
                  max="20"
                />
              </div>
            )}
          </>
        )}

        {/* Image Properties */}
        {selectedElementData.type === 'image' && (
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Border Radius</label>
            <input
              type="number"
              value={selectedElementData.borderRadius}
              onChange={(e) => updateElement(selectedElement, { borderRadius: parseInt(e.target.value) })}
              className="w-full p-2 border rounded text-sm"
              min="0"
            />
          </div>
        )}

        {/* Sticker Properties */}
        {selectedElementData.type === 'sticker' && stickerOptions && (
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Sticker</label>
            <div className="sticker-grid">
              {stickerOptions.map(sticker => (
                <button
                  key={sticker.name}
                  onClick={() => updateElement(selectedElement, { sticker: sticker.name })}
                  className={`sticker-button ${selectedElementData.sticker === sticker.name ? 'bg-blue-100 border-blue-300' : ''}`}
                >
                  {sticker.icon}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => duplicateElement(selectedElement)}
            className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center"
            disabled={lockedElements.has(selectedElement)}
          >
            <Copy size={14} className="mr-1" />
            Duplicate
          </button>
          <button
            onClick={() => toggleElementLock(selectedElement)}
            className={`p-2 rounded text-sm flex items-center justify-center ${
              lockedElements.has(selectedElement) 
                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {lockedElements.has(selectedElement) ? (
              <>
                <Unlock size={14} className="mr-1" />
                Unlock
              </>
            ) : (
              <>
                <Lock size={14} className="mr-1" />
                Lock
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => changeZIndex(selectedElement, 'backward')}
            className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center"
            disabled={lockedElements.has(selectedElement)}
          >
            <MinusCircle size={14} className="mr-1" />
            Backward
          </button>
          <button
            onClick={() => changeZIndex(selectedElement, 'forward')}
            className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center"
            disabled={lockedElements.has(selectedElement)}
          >
            <PlusCircle size={14} className="mr-1" />
            Forward
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => changeZIndex(selectedElement, 'back')}
            className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center"
            disabled={lockedElements.has(selectedElement)}
          >
            To Back
          </button>
          <button
            onClick={() => changeZIndex(selectedElement, 'front')}
            className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center"
            disabled={lockedElements.has(selectedElement)}
          >
            To Front
          </button>
        </div>

        <button
          onClick={() => deleteElement(selectedElement)}
          className="w-full p-2 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 flex items-center justify-center"
          disabled={lockedElements.has(selectedElement)}
        >
          <Trash2 size={14} className="mr-1" />
          {t('properties.delete')}
        </button>
        </div>
      )}

      {/* Export Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-4 text-gray-700">{t('export.title')}</h2>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => exportAsImage('png')}
            className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center text-gray-700"
          >
            <Download size={14} className="mr-1" />
            PNG
          </button>
          <button
            onClick={() => exportAsImage('jpeg')}
            className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center text-gray-700"
          >
            <Download size={14} className="mr-1" />
            JPEG
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => exportAsImage('webp')}
            className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center text-gray-700"
          >
            <Download size={14} className="mr-1" />
            WebP
          </button>
          <button
            onClick={() => exportAsImage('svg')}
            className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center text-gray-700"
          >
            <Download size={14} className="mr-1" />
            SVG
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2 mb-3">
          <button
            onClick={exportAsPDF}
            className="p-2 bg-blue-100 rounded text-sm hover:bg-blue-200 flex items-center justify-center text-blue-700 font-medium"
          >
            <Download size={14} className="mr-1" />
            PDF
          </button>
        </div>
        
        {/* Video Export Settings */}
        <VideoSettings 
          videoFormat={videoFormat}
          videoQuality={videoQuality}
          recordingDuration={recordingDuration}
          onFormatChange={setVideoFormat}
          onQualityChange={setVideoQuality}
          onDurationChange={setRecordingDuration}
        />
        
        {!recording ? (
          <button
            onClick={startRecording}
            className="w-full p-2 rounded text-sm flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600"
          >
            <Film size={14} className="mr-1" />
            {t('export.exportVideo')}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="w-full p-2 bg-red-50 border border-red-200 rounded text-sm flex items-center justify-center text-red-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                {t('recording.recording')}: {Math.floor(recordingTimeElapsed / 60)}:{(recordingTimeElapsed % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <button
              onClick={stopRecording}
              className="w-full p-2 rounded text-sm flex items-center justify-center bg-red-500 text-white hover:bg-red-600"
            >
              <Square size={14} className="mr-1" />
              {t('recording.stop')}
            </button>
          </div>
        )}
      </div>

      {/* Project Actions */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-gray-700">{t('project.title')}</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSaveClick}
            className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center text-gray-700"
          >
            <Save size={14} className="mr-1" />
            {t('project.save')}
          </button>
          <button
            onClick={loadProject}
            className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center justify-center text-gray-700"
          >
            <FolderOpen size={14} className="mr-1" />
            {t('project.load')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
