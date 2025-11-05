import React from 'react';
import {
  MousePointer, Type, Square, Circle, Triangle, Star, Image, Layers,
  ZoomIn, ZoomOut, Undo, Redo, Save, Film, Play, Pause, Sparkles, Copy, Trash2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GradientPicker from './GradientPicker';

const MobileToolsDrawer = ({
  showMobileTools,
  setShowMobileTools,
  currentTool,
  setCurrentTool,
  addElement,
  fileInputRef,
  setShowTemplates,
  showTemplates,
  zoom,
  undo,
  redo,
  historyIndex,
  history,
  handleSaveClick,
  recording,
  recordingTimeElapsed,
  startRecording,
  stopRecording,
  playAnimations,
  resetAnimations,
  isPlaying,
  setShowEffectsPanel,
  showEffectsPanel
}) => {
  const { t } = useTranslation();

  if (!showMobileTools) return null;

  return (
    <>
      <div 
        className="md:hidden fixed inset-0 bg-black/50 z-50"
        onClick={() => setShowMobileTools(false)}
      />
      <div className="md:hidden fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t('tools.title')}</h2>
          <button
            onClick={() => setShowMobileTools(false)}
            className="p-3 rounded-lg hover:bg-gray-100 text-2xl leading-none touch-manipulation min-h-[44px] min-w-[44px]"
          >
            ×
          </button>
        </div>
        
        <div className="p-4 space-y-2">
          {/* Recording & Playback Controls */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg mb-3">
            <h3 className="text-xs font-semibold text-gray-600 mb-2">RECORDING & PLAYBACK</h3>
            {!recording ? (
              <button onClick={() => { startRecording(); setShowMobileTools(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 touch-manipulation mb-2">
                <Film size={20} /> <span className="font-medium">Start Recording</span>
              </button>
            ) : (
              <button onClick={() => { stopRecording(); setShowMobileTools(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 touch-manipulation mb-2">
                <Square size={20} /> <span className="font-medium">Stop Recording ({Math.floor(recordingTimeElapsed / 60)}:{(recordingTimeElapsed % 60).toString().padStart(2, '0')})</span>
              </button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { playAnimations(); setShowMobileTools(false); }} disabled={isPlaying} className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 touch-manipulation">
                <Play size={18} /> <span>Play</span>
              </button>
              <button onClick={() => { resetAnimations(); setShowMobileTools(false); }} className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 touch-manipulation">
                <Pause size={18} /> <span>Reset</span>
              </button>
            </div>
          </div>
          
          {/* Templates & Effects */}
          <button onClick={() => { setShowTemplates(!showTemplates); setShowMobileTools(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50 hover:bg-purple-100 touch-manipulation">
            <Layers size={20} className="text-purple-600" /> <span className="font-medium">Templates</span>
          </button>
          
          <button onClick={() => { setShowEffectsPanel(!showEffectsPanel); setShowMobileTools(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 touch-manipulation">
            <Sparkles size={20} className="text-indigo-600" /> <span className="font-medium">Effects</span>
          </button>
          
          <div className="border-t my-3" />
          
          {/* Add Elements */}
          <h3 className="text-xs font-semibold text-gray-500 mb-2">ADD ELEMENTS</h3>
          <button onClick={() => { setCurrentTool('select'); setShowMobileTools(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg touch-manipulation ${currentTool === 'select' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
            <MousePointer size={20} /> <span>Select</span>
          </button>
          <button onClick={() => { addElement('text'); setShowMobileTools(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 touch-manipulation">
            <Type size={20} /> <span>Add Text</span>
          </button>
          <button onClick={() => { addElement('rectangle'); setShowMobileTools(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 touch-manipulation">
            <Square size={20} /> <span>Rectangle</span>
          </button>
          <button onClick={() => { addElement('circle'); setShowMobileTools(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 touch-manipulation">
            <Circle size={20} /> <span>Circle</span>
          </button>
          <button onClick={() => { addElement('triangle'); setShowMobileTools(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 touch-manipulation">
            <Triangle size={20} /> <span>Triangle</span>
          </button>
          <button onClick={() => { addElement('star'); setShowMobileTools(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 touch-manipulation">
            <Star size={20} /> <span>Star</span>
          </button>
          <button onClick={() => { fileInputRef.current?.click(); setShowMobileTools(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 touch-manipulation">
            <Image size={20} /> <span>Add Image</span>
          </button>
          
          <div className="border-t my-3" />
          
          {/* Zoom Controls */}
          <h3 className="text-xs font-semibold text-gray-500 mb-2">VIEW</h3>
          <div className="flex gap-2">
            <button onClick={() => { zoom('in'); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg hover:bg-gray-100 touch-manipulation">
              <ZoomIn size={20} /> <span>Zoom In</span>
            </button>
            <button onClick={() => { zoom('out'); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg hover:bg-gray-100 touch-manipulation">
              <ZoomOut size={20} /> <span>Zoom Out</span>
            </button>
          </div>
          
          <div className="border-t my-3" />
          
          {/* Undo/Redo & Save */}
          <h3 className="text-xs font-semibold text-gray-500 mb-2">ACTIONS</h3>
          <div className="flex gap-2">
            <button onClick={undo} disabled={historyIndex <= 0} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 touch-manipulation">
              <Undo size={20} /> <span>Undo</span>
            </button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 touch-manipulation">
              <Redo size={20} /> <span>Redo</span>
            </button>
          </div>
          
          <button onClick={() => { handleSaveClick(); setShowMobileTools(false); }} className="w-full flex items-center gap-3 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 touch-manipulation">
            <Save size={20} /> <span>Save Project</span>
          </button>
        </div>
      </div>
    </>
  );
};

const MobilePropertiesDrawer = ({
  showMobileProperties,
  setShowMobileProperties,
  selectedElementData,
  selectedElement,
  updateElement,
  duplicateElement,
  deleteElement,
  animations,
  gradientPickerKey
}) => {
  const { t } = useTranslation();

  if (!showMobileProperties || !selectedElementData) return null;

  return (
    <>
      <div 
        className="md:hidden fixed inset-0 bg-black/50 z-50"
        onClick={() => setShowMobileProperties(false)}
      />
      <div className="md:hidden fixed right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t('properties.title')}</h2>
          <button onClick={() => setShowMobileProperties(false)} className="p-3 rounded-lg hover:bg-gray-100 text-2xl leading-none touch-manipulation min-h-[44px] min-w-[44px]">
            ×
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-2">X</label>
              <input type="number" value={Math.round(selectedElementData.x)} onChange={(e) => updateElement(selectedElement, { x: parseInt(e.target.value) })} className="w-full px-3 py-3 text-base border rounded-lg touch-manipulation" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2">Y</label>
              <input type="number" value={Math.round(selectedElementData.y)} onChange={(e) => updateElement(selectedElement, { y: parseInt(e.target.value) })} className="w-full px-3 py-3 text-base border rounded-lg touch-manipulation" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2">Width</label>
              <input type="number" value={Math.round(selectedElementData.width)} onChange={(e) => updateElement(selectedElement, { width: parseInt(e.target.value) })} className="w-full px-3 py-3 text-base border rounded-lg touch-manipulation" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2">Height</label>
              <input type="number" value={Math.round(selectedElementData.height)} onChange={(e) => updateElement(selectedElement, { height: parseInt(e.target.value) })} className="w-full px-3 py-3 text-base border rounded-lg touch-manipulation" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-2">Rotation</label>
            <div className="flex items-center gap-3">
              <input type="range" min="0" max="360" value={selectedElementData.rotation || 0} onChange={(e) => updateElement(selectedElement, { rotation: parseInt(e.target.value) })} className="flex-1 h-8 touch-manipulation" />
              <span className="text-base font-medium min-w-[50px]">{selectedElementData.rotation || 0}°</span>
            </div>
          </div>

          {/* Animation Selection for Mobile */}
          <div>
            <label className="block text-xs font-medium mb-2">Animation</label>
            <select
              value={selectedElementData.animation || ''}
              onChange={(e) => updateElement(selectedElement, { animation: e.target.value || null })}
              className="w-full px-3 py-3 text-base border rounded-lg touch-manipulation"
            >
              <option value="">None</option>
              {Object.entries(animations).map(([key, anim]) => (
                <option key={key} value={key}>
                  {anim.name}
                </option>
              ))}
            </select>
          </div>

          {selectedElementData.type === 'text' && (
            <>
              <div>
                <label className="block text-xs font-medium mb-2">Font Size</label>
                <input type="number" value={selectedElementData.fontSize} onChange={(e) => updateElement(selectedElement, { fontSize: parseInt(e.target.value) })} className="w-full px-3 py-3 text-base border rounded-lg touch-manipulation" min="8" max="200" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2">Color</label>
                <input type="color" value={selectedElementData.color} onChange={(e) => updateElement(selectedElement, { color: e.target.value })} className="w-full h-12 rounded-lg cursor-pointer touch-manipulation" />
              </div>
            </>
          )}

          {['rectangle', 'circle', 'triangle', 'star', 'hexagon'].includes(selectedElementData.type) && (
            <>
              {/* Fill Type Selection for Mobile */}
              <div>
                <label className="block text-xs font-medium mb-2">Fill Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateElement(selectedElement, { fillType: 'solid' })}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium touch-manipulation ${
                      selectedElementData.fillType === 'solid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Solid Color
                  </button>
                  <button
                    onClick={() => updateElement(selectedElement, { fillType: 'gradient' })}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium touch-manipulation ${
                      selectedElementData.fillType === 'gradient' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Gradient
                  </button>
                </div>
              </div>

              {/* Solid Color Picker for Mobile */}
              {selectedElementData.fillType === 'solid' && (
                <div>
                  <label className="block text-xs font-medium mb-2">Fill Color</label>
                  <input type="color" value={selectedElementData.fill} onChange={(e) => updateElement(selectedElement, { fill: e.target.value })} className="w-full h-12 rounded-lg cursor-pointer touch-manipulation" />
                </div>
              )}

              {/* Gradient Picker for Mobile */}
              {selectedElementData.fillType === 'gradient' && (
                <div>
                  <label className="block text-xs font-medium mb-2">Gradient Fill</label>
                  <GradientPicker
                    key={gradientPickerKey}
                    gradient={selectedElementData.gradient}
                    onGradientChange={(gradient) => updateElement(selectedElement, { gradient })}
                  />
                </div>
              )}
            </>
          )}

          <div className="border-t pt-4 flex gap-2">
            <button onClick={() => { duplicateElement(selectedElement); setShowMobileProperties(false); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 text-blue-600 rounded-lg touch-manipulation">
              <Copy size={18} /> <span>Duplicate</span>
            </button>
            <button onClick={() => { deleteElement(selectedElement); setShowMobileProperties(false); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-600 rounded-lg touch-manipulation">
              <Trash2 size={18} /> <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export { MobileToolsDrawer, MobilePropertiesDrawer };
