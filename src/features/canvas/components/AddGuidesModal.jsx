import React, { useState } from 'react';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';

const AddGuidesModal = ({ onClose, setGuides, canvasSize, setShowRulers }) => {
  const [selectedType, setSelectedType] = useState('12'); // '12', '3', '3x3', 'custom'
  
  const [customSettings, setCustomSettings] = useState({
    columns: 6,
    colGap: 18,
    colMargin: 0,
    rows: 0,
    rowGap: 0,
    rowMargin: 0,
  });

  const handleAddGuides = () => {
    let cols = 0;
    let colGap = 0;
    let colMargin = 0;
    let rows = 0;
    let rowGap = 0;
    let rowMargin = 0;

    if (selectedType === '12') {
      cols = 12; colGap = 18; colMargin = 0;
    } else if (selectedType === '3') {
      cols = 3; colGap = 18; colMargin = 0;
    } else if (selectedType === '3x3') {
      cols = 3; colGap = 18; colMargin = 0;
      rows = 3; rowGap = 18; rowMargin = 0;
    } else {
      cols = customSettings.columns; colGap = customSettings.colGap; colMargin = customSettings.colMargin;
      rows = customSettings.rows; rowGap = customSettings.rowGap; rowMargin = customSettings.rowMargin;
    }

    const newGuides = [];

    // Columns
    if (cols > 0) {
      const W = canvasSize.width - (2 * colMargin);
      const totalGapW = (cols - 1) * colGap;
      const colWidth = (W - totalGapW) / cols;
      let currX = colMargin;
      
      // Starting margin guide
      newGuides.push({ id: `guide-${Date.now()}-x-margin-start`, axis: 'x', position: currX });

      for (let i = 0; i < cols; i++) {
        // Start of column (already covered if i=0 by margin guide, but let's add gap end guides here)
        if (i > 0) {
          currX += colGap;
          newGuides.push({ id: `guide-${Date.now()}-x-col-${i}-start`, axis: 'x', position: currX });
        }
        
        currX += colWidth;
        newGuides.push({ id: `guide-${Date.now()}-x-col-${i}-end`, axis: 'x', position: currX });
      }
    }

    // Rows
    if (rows > 0) {
      const H = canvasSize.height - (2 * rowMargin);
      const totalGapH = (rows - 1) * rowGap;
      const rowHeight = (H - totalGapH) / rows;
      let currY = rowMargin;
      
      // Starting margin guide
      newGuides.push({ id: `guide-${Date.now()}-y-margin-start`, axis: 'y', position: currY });

      for (let i = 0; i < rows; i++) {
        if (i > 0) {
          currY += rowGap;
          newGuides.push({ id: `guide-${Date.now()}-y-row-${i}-start`, axis: 'y', position: currY });
        }
        currY += rowHeight;
        newGuides.push({ id: `guide-${Date.now()}-y-row-${i}-end`, axis: 'y', position: currY });
      }
    }

    if (setGuides) {
      setGuides((prev) => [...prev, ...newGuides]);
    }
    if (setShowRulers) {
      setShowRulers(true); // Always show rulers when guides are added
    }
    onClose();
  };

  const handleInputChange = (field, value) => {
    setCustomSettings((prev) => ({
      ...prev,
      [field]: parseInt(value) || 0,
    }));
  };

  return (
    <div className="absolute left-[calc(100%+8px)] top-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[70] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 py-2">
      <div className="flex items-center px-4 py-3 border-b border-gray-100 mb-2">
        <button onClick={onClose} className="mr-3 text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <span className="text-[15px] font-bold text-gray-800">Add guides</span>
      </div>

      <div className="px-4">
        {/* Type Selection */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button 
            onClick={() => setSelectedType('12')} 
            className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${selectedType === '12' ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:bg-gray-50'}`}
          >
            <div className="w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center mb-1">
              <span className="text-xs font-bold text-gray-500">12</span>
            </div>
            <span className="text-[10px] font-semibold text-gray-600 truncate w-full text-center">12 Columns</span>
          </button>
          <button 
            onClick={() => setSelectedType('3')} 
            className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${selectedType === '3' ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:bg-gray-50'}`}
          >
            <div className="w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center mb-1">
              <span className="text-xs font-bold text-gray-500">3</span>
            </div>
            <span className="text-[10px] font-semibold text-gray-600 truncate w-full text-center">3 Columns</span>
          </button>
          <button 
            onClick={() => setSelectedType('3x3')} 
            className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${selectedType === '3x3' ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:bg-gray-50'}`}
          >
            <div className="w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center mb-1">
              <span className="text-xs font-bold text-gray-500">3x3</span>
            </div>
            <span className="text-[10px] font-semibold text-gray-600 truncate w-full text-center">3x3 Grid</span>
          </button>
          <button 
            onClick={() => setSelectedType('custom')} 
            className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${selectedType === 'custom' ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:bg-gray-50'}`}
          >
            <div className="w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center mb-1">
              <SlidersHorizontal size={14} className="text-gray-500" />
            </div>
            <span className="text-[10px] font-semibold text-gray-600 truncate w-full text-center">Custom</span>
          </button>
        </div>

        {/* Custom Settings */}
        {selectedType === 'custom' && (
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Columns</label>
                <input 
                  type="number" 
                  value={customSettings.columns} 
                  onChange={(e) => handleInputChange('columns', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm font-medium outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Gap (px)</label>
                <input 
                  type="number" 
                  value={customSettings.colGap} 
                  onChange={(e) => handleInputChange('colGap', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm font-medium outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Margin (px)</label>
                <input 
                  type="number" 
                  value={customSettings.colMargin} 
                  onChange={(e) => handleInputChange('colMargin', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm font-medium outline-none focus:border-purple-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Rows</label>
                <input 
                  type="number" 
                  value={customSettings.rows} 
                  onChange={(e) => handleInputChange('rows', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm font-medium outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Gap (px)</label>
                <input 
                  type="number" 
                  value={customSettings.rowGap} 
                  onChange={(e) => handleInputChange('rowGap', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm font-medium outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Margin (px)</label>
                <input 
                  type="number" 
                  value={customSettings.rowMargin} 
                  onChange={(e) => handleInputChange('rowMargin', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm font-medium outline-none focus:border-purple-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2 mt-4 mb-2">
          <button 
            onClick={handleAddGuides} 
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold transition-colors"
          >
            Add guides
          </button>
          <button 
            onClick={onClose} 
            className="w-full py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGuidesModal;
