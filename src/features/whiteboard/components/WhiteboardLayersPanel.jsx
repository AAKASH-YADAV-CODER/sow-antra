import React from 'react';
import { Layers, Eye, EyeOff, Lock, Unlock, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

const WhiteboardLayersPanel = ({ 
  layers, 
  setLayers, 
  activeLayerId, 
  setActiveLayerId 
}) => {
  const addLayer = () => {
    const newId = `layer-${Date.now()}`;
    setLayers([...layers, { id: newId, name: `Layer ${layers.length}`, visible: true, locked: false }]);
    setActiveLayerId(newId);
  };

  const toggleVisibility = (id) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const toggleLock = (id) => {
    setLayers(layers.map(l => l.id === id ? { ...l, locked: !l.locked } : l));
  };

  const deleteLayer = (id) => {
    if (layers.length <= 1) return;
    setLayers(layers.filter(l => l.id !== id));
    if (activeLayerId === id) {
      setActiveLayerId(layers.find(l => l.id !== id).id);
    }
  };

  const moveLayer = (index, direction) => {
    const newLayers = [...layers];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= layers.length) return;
    [newLayers[index], newLayers[targetIndex]] = [newLayers[targetIndex], newLayers[index]];
    setLayers(newLayers);
  };

  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 w-64 z-40 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-purple-600" />
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-tighter">Layers</h3>
        </div>
        <button 
          onClick={addLayer}
          className="p-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
          title="Add Layer"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
        {[...layers].reverse().map((layer, revIndex) => {
          const index = layers.length - 1 - revIndex;
          const isActive = activeLayerId === layer.id;
          
          return (
            <div 
              key={layer.id}
              onClick={() => setActiveLayerId(layer.id)}
              className={`group flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer border-2 ${
                isActive 
                  ? 'bg-purple-50 border-purple-200' 
                  : 'bg-gray-50/50 border-transparent hover:bg-gray-100'
              }`}
            >
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); moveLayer(index, 1); }} className="text-gray-400 hover:text-gray-600"><ChevronUp size={12} /></button>
                <button onClick={(e) => { e.stopPropagation(); moveLayer(index, -1); }} className="text-gray-400 hover:text-gray-600"><ChevronDown size={12} /></button>
              </div>

              <div className="flex-1 flex flex-col gap-0.5">
                <span className={`text-xs font-bold truncate ${isActive ? 'text-purple-700' : 'text-gray-600'}`}>
                  {layer.name}
                </span>
                <span className="text-[9px] text-gray-400 font-medium">
                  {layer.locked ? 'Locked' : (layer.visible ? 'Visible' : 'Hidden')}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleVisibility(layer.id); }}
                  className={`p-1 rounded-md transition-colors ${layer.visible ? 'text-gray-400 hover:bg-gray-200' : 'text-purple-500 bg-purple-100'}`}
                >
                  {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleLock(layer.id); }}
                  className={`p-1 rounded-md transition-colors ${layer.locked ? 'text-amber-500 bg-amber-50' : 'text-gray-400 hover:bg-gray-200'}`}
                >
                  {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
                {layers.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                    className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-purple-600/5 rounded-xl p-3 border border-purple-100">
        <p className="text-[10px] leading-relaxed text-purple-600 font-medium italic">
          Tip: Lock layers you are not working on to boost drawing performance!
        </p>
      </div>
    </div>
  );
};

export default WhiteboardLayersPanel;
