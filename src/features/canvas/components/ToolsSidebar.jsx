import React, { useState } from 'react';
import {
  MousePointer, Type, Square, Image, Upload, LayoutTemplate,
  FolderOpen, X, Search, Sticker, Shapes
} from 'lucide-react';
import { shapeEffects } from '../../../types/types';
import { shapeCategories } from '../../../config/shapesLibrary';
import { frameCategories } from '../../../config/frameLibrary';

/**
 * ToolsSidebar Component
 * Canva-style Left Sidebar
 * - Navigation Strip (Leftmost): Categories (Design, Elements, Text, Uploads, etc.)
 * - Side Panel (Slide-out): Content for the selected category

 */
const ToolsSidebar = ({
  t,
  currentTool,
  setCurrentTool,
  addElement,
  fileInputRef,
  handleImageUpload,
  loadProjectInputRef,
  handleProjectFileLoad,
  undo,
  redo,
  historyIndex,
  history,
  showGrid,
  setShowGrid,
  snapToGrid,
  setSnapToGrid,
  uploads
}) => {
  const [activePanel, setActivePanel] = useState('elements');
  const [searchQuery, setSearchQuery] = useState('');

  // Main Navigation Tabs
  const navTabs = [
    { id: 'design', icon: LayoutTemplate, label: 'Design' },
    { id: 'elements', icon: Shapes, label: 'Elements' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'uploads', icon: Upload, label: 'Uploads' },
    // { id: 'projects', icon: FolderOpen, label: 'Projects' },
  ];

  const handleTabClick = (id) => {
    if (activePanel === id) {
      setActivePanel(null);
    } else {
      setActivePanel(id);
    }
  };

  return (
    <div className="flex h-full bg-white border-r border-gray-200 shadow-sm z-30 transition-all duration-300 relative">

      {/* 1. Navigation Strip (Fixed Width) */}
      <div className="w-[72px] flex flex-col items-center py-4 gap-4 bg-gray-50 border-r border-gray-200 z-40 relative">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activePanel === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-colors gap-1
                ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}
              `}
              title={tab.label}
            >
              <Icon size={24} strokeWidth={1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}

        {/* Spacer */}
        <div className="flex-grow" />
      </div>

      {/* 2. Expandable Side Panel */}
      {/* We use absolute positioning for the panel to slide out next to the nav strip, 
          but 'relative' container might clip it if we are not careful. 
          Actually, standard flex layout 'pushes' the canvas, which is what Canva does (canvas shrinks/shifts).
          So we keep it in flow.
      */}
      {activePanel && (
        <div className="w-80 bg-white h-full flex flex-col animate-slide-in-left overflow-hidden shadow-xl border-r border-gray-100 z-30">

          {/* Panel Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <h2 className="text-lg font-bold capitalize text-gray-800">
              {navTabs.find(t => t.id === activePanel)?.label}
            </h2>
            <button
              onClick={() => setActivePanel(null)}
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Panel Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">

            {/* DESIGN PANEL */}
            {activePanel === 'design' && (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-center">
                  <LayoutTemplate className="mx-auto text-blue-500 mb-2" size={32} />
                  <h3 className="font-semibold text-blue-900 mb-1">Templates</h3>
                  <p className="text-sm text-blue-700 mb-3">Custom templates coming soon!</p>
                </div>
              </div>
            )}

            {/* ELEMENTS PANEL */}
            {activePanel === 'elements' && (
              <div className="space-y-6">

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search shapes, icons..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Categories */}
                {[...shapeCategories, ...frameCategories].map((category) => (
                  <div key={category.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-700 text-sm">{category.title}</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {category.items.map((item, idx) => {
                        const Icon = item.icon;
                        // For regular shapes, just add. For special variants, pass props.
                        // addElement needs to be updated to handle these props spread
                        return (
                          <button
                            key={item.id}
                            onClick={() => addElement(item.type, item.props)}
                            className="aspect-square flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600 border border-transparent hover:border-gray-200 transition-all bg-gray-50"
                            title={item.label}
                          >
                            <div style={{ transform: item.id === 'diamond' ? 'rotate(45deg)' : 'none' }}>
                              <Icon size={24} strokeWidth={1.5} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TEXT PANEL */}
            {activePanel === 'text' && (
              <div className="space-y-4">
                <button
                  onClick={() => addElement('text', { fontSize: 32, fontWeight: 'bold', content: 'Add a heading' })}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-lg shadow-sm transition-colors text-left"
                >
                  Add a heading
                </button>
                <button
                  onClick={() => addElement('text', { fontSize: 24, content: 'Add a subheading' })}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg text-base transition-colors text-left"
                >
                  Add a subheading
                </button>
                <button
                  onClick={() => addElement('text', { fontSize: 16, content: 'Add a little bit of body text' })}
                  className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 py-2 px-4 rounded-lg text-sm transition-colors text-left"
                >
                  Add a little bit of body text
                </button>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Font Combinations</h3>
                  {/* Mock combinations */}
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 rounded border border-gray-100 hover:border-blue-200 cursor-pointer transition-colors"
                      onClick={() => {
                        addElement('text', { fontSize: 32, fontFamily: 'Playfair Display', content: 'Merry Christmas' });
                        setTimeout(() => addElement('text', { fontSize: 16, fontFamily: 'Lato', content: 'AND HAPPY NEW YEAR', y: 100 }), 100);
                      }}
                    >
                      <p className="font-serif text-xl text-gray-800 leading-tight">Merry Christmas</p>
                      <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">And Happy New Year</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded border border-yellow-100 hover:border-yellow-300 cursor-pointer transition-colors"
                      onClick={() => {
                        addElement('text', { fontSize: 48, fontWeight: '900', color: '#B7791F', content: 'SALE' });
                      }}
                    >
                      <p className="font-black text-2xl text-yellow-600 uppercase">Sale</p>
                      <p className="text-sm font-bold text-yellow-800">Up to 50% off</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* UPLOADS PANEL */}
            {activePanel === 'uploads' && (
              <div className="space-y-6">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload size={20} />
                  Upload files
                </button>

                {uploads && uploads.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 pb-6">
                    {uploads.map((asset) => (
                      <div
                        key={asset.id}
                        className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-purple-500 transition-all"
                        onClick={() => addElement('image', { src: asset.src })}
                      >
                        <img
                          src={asset.src}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <Image size={48} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No uploads yet</p>
                    <p className="text-xs mt-1">Upload images to use in your design</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Hidden File Inputs (Preserved from original) */}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <input
        ref={loadProjectInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleProjectFileLoad}
        className="hidden"
      />
    </div>
  );
};


export default ToolsSidebar;
