import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Type,
  Image as ImageIcon,
  LayoutTemplate,
  Upload,
  Folder,
  Check,
  Plus,
  Trash2,
  Grid,
  Award,
  Maximize2,
  Film,
  Music,
  Video,
  Box,
  Tv,
  MoreHorizontal,
  Calendar,
  Camera,
  Palette,
  Zap,
  RotateCcw
} from 'lucide-react';
import { shapeCategories } from '../../../config/shapesLibrary';
import { frameCategories } from '../../../config/frameLibrary';

import { fontCombinations } from '../../../config/fontCombinations';
import { editableTemplates } from '../../../config/editableTemplates';
import ColorPanel from './ColorPanel';
import BrandKitPanelSection from './BrandKitPanelSection';
import EditImagePanel from './EditImagePanel';
import BlendImagePanel from './BlendImagePanel';
import MeshGradientPanel from './MeshGradientPanel';
import FrameMakerPanel from './FrameMakerPanel';
import { TypeExtrudePanel } from './TypeExtrudePanel';
import TransformImagePanel from './TransformImagePanel';
import { TextStudioPanel } from './TextStudioPanel';
import EasyReflectionPanel from './EasyReflectionPanel';
import Model3DPanel from './Model3DPanel';
import ColorPopPanel from './ColorPopPanel';
import CartoonifyPanel from './CartoonifyPanel';
import PhotoEnhancerPanel from './PhotoEnhancerPanel';
import BadTVPanel from './BadTVPanel';
import TypeFillPanel from './TypeFillPanel';
import { TypeWarpPanel } from './TypeWarpPanel';
import DuotonePanel from './DuotonePanel';
import MagicResizePanel from './MagicResizePanel';
import RGBGlitchPanel from './RGBGlitchPanel';

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
  audioInputRef,
  handleImageUpload,
  handleAudioUpload,
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
  uploads,
  activeSidePanel,
  setActiveSidePanel,
  pages,
  currentPage,
  updateElement,
  updateElements,
  selectedElement,
  selectedElementData,
  lastColorChange,
  setLastColorChange,
  setPages,
  updatePageBackground,
  handleRemoveBackground,
  isProcessingBG,
  handleRevertBackground,
  bgProcessingStatus,
  setUploads, // New prop for folder updates
  canvasSize,
  setCanvasSize,
  setShowContentPlannerModal,
}) => {
  const [activePanel, setActivePanel] = useState('elements');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('All');
  const [selectedElementCategory, setSelectedElementCategory] = useState('All');
  const [brandKits, setBrandKits] = useState([]);
  const [openBrandSections, setOpenBrandSections] = useState({});

  // Uploads State
  const [uploadsTab, setUploadsTab] = useState('All');
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);

  // Modal State
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showMoveFolderModal, setShowMoveFolderModal] = useState(false);
  const [folderModalInputValue, setFolderModalInputValue] = useState('');
  const [moveTargetAssetId, setMoveTargetAssetId] = useState(null);

  // Initialize Storage and Load Folders
  useEffect(() => {
    const loadFolders = async () => {
      try {
        const { storage } = await import('../../../utils/storage');
        const folderList = await storage.getFolders();
        setFolders(folderList);
      } catch (e) {
        console.error("Failed to load folders", e);
      }
    };
    if (activePanel === 'uploads') {
      loadFolders();
    }
  }, [activePanel]);

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm("Delete this upload?")) return;
    try {
      const { storage } = await import('../../../utils/storage');
      await storage.deleteAsset(assetId);
      if (setUploads) {
        setUploads(prev => prev.filter(a => a.id !== assetId));
      }
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  const handleCreateFolder = async (name) => {
    try {
      const { storage } = await import('../../../utils/storage');
      const newFolder = await storage.createFolder(name);
      setFolders(prev => [newFolder, ...prev]);
    } catch (e) {
      console.error("Failed to create folder", e);
    }
  };

  const handleDeleteFolder = async (id) => {
    if (!window.confirm("Delete folder? contents will be moved to root.")) return;
    try {
      const { storage } = await import('../../../utils/storage');
      await storage.deleteFolder(id);
      setFolders(prev => prev.filter(f => f.id !== id));
      if (currentFolder && currentFolder.id === id) setCurrentFolder(null);
    } catch (e) {
      console.error("Failed to delete folder", e);
    }
  };

  const handleMoveToFolder = async (assetId, folderId) => {
    try {
      const { storage } = await import('../../../utils/storage');
      await storage.moveAssetToFolder(assetId, folderId);
      // Update UI
      if (setUploads) {
        setUploads(prev => prev.map(a => a.id === assetId ? { ...a, folderId } : a));
      }
    } catch (e) {
      console.error("Failed to move asset", e);
    }
  };

  // Fetch brand kits from localStorage
  useEffect(() => {
    const savedKits = JSON.parse(localStorage.getItem('sowntra_brand_kits') || '[]');
    setBrandKits(savedKits);
    if (savedKits.length > 0) {
      setOpenBrandSections({ [savedKits[0].id]: true });
    }
  }, []);

  // Sync with global activeSidePanel
  useEffect(() => {
    if (activeSidePanel === 'none') {
      setActivePanel(null);
    } else if (['design', 'elements', 'text', 'uploads', 'color', 'crop', 'editImage', 'blendImage', 'meshGradient', 'brandkit', 'apps', 'typeExtrude', 'transformImage', 'textStudio', 'easyReflection', 'more', 'typeFill', 'typeWarp', 'photoEnhancer', 'duotone'].includes(activeSidePanel)) {
      setActivePanel(activeSidePanel);
    }
  }, [activeSidePanel]);

  // Custom Icon for Elements (Circle, Triangle, Square)
  const CustomShapesIcon = ({ size, strokeWidth }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {/* Square */}
      <rect x="3" y="3" width="7" height="7" rx="1" />
      {/* Triangle */}
      <path d="M14 3l7 7H14V3z" />
      {/* Circle */}
      <circle cx="10" cy="17" r="4" />
      {/* Alternative Triangle if the above looks like a corner wedge? 
          Let's try a standard equilateral-ish triangle.
          Actually, let's do:
          Square: Top Left
          Triangle: Top Right
          Circle: Bottom Center? Or Bottom Left?
      */}
    </svg>
  );

  const CustomPenIcon = ({ size, strokeWidth }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );

  // Main Navigation Tabs
  const navTabs = [
    { id: 'design', icon: LayoutTemplate, label: 'Design' },
    { id: 'elements', icon: CustomShapesIcon, label: 'Elements' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'pen', icon: CustomPenIcon, label: 'Pen' }, // Pen Tool Added
    { id: 'uploads', icon: Upload, label: 'Uploads' },
    { id: 'video', icon: Film, label: 'Videos' },
    { id: 'audio', icon: Music, label: 'Audio' },
    { id: 'brandkit', icon: Award, label: 'Brand Kit' },
    { id: 'apps', icon: Grid, label: 'Apps' },
    { id: 'more', icon: MoreHorizontal, label: 'More' },
  ];

  const handleTabClick = (id) => {
    if (activePanel === id) {
      setActivePanel(null);
      if (activeSidePanel === id) setActiveSidePanel('none');
      // If closing pen panel, switch back to select tool? 
      // Maybe not, user might want to keep drawing
    } else {
      setActivePanel(id);
      setActiveSidePanel(id); // Force update global state to keep panel open

      // Auto-activate pen tool when tab is selected
      if (id === 'pen') {
        // Optimization: Small delay to avoid blocking the sidebar transition
        setTimeout(() => setCurrentTool('pen'), 50);
      } else if (currentTool === 'pen') {
        setCurrentTool('select');
      }
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
      {activePanel && activePanel !== 'editImage' && activePanel !== 'blendImage' && activePanel !== 'meshGradient' && (
        <div className="w-80 bg-white h-full flex flex-col animate-slide-in-left overflow-hidden shadow-xl border-r border-gray-100 z-30">

          {/* Panel Header - Hidden for TypeFill & TypeWarp as they have their own back headers */}
          {activePanel !== 'typeFill' && activePanel !== 'typeWarp' && activePanel !== 'colorPop' && activePanel !== 'photoEnhancer' && (
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold capitalize text-gray-800">
                {activePanel === 'color' ? 'Colour' :
                  activePanel === 'crop' ? 'Crop' :
                    activePanel === 'frameMaker' ? 'Frame Maker' :
                      activePanel === 'typeExtrude' ? 'TypeExtrude' :
                        activePanel === 'textStudio' ? 'Text Studio Maker' :
                          activePanel === 'transformImage' ? 'Transform Image' :
                            activePanel === 'typeFill' ? 'TypeFill Pattern' :
                              activePanel === 'typeWarp' ? 'TypeWarp' :
                                (navTabs.find(t => t.id === activePanel)?.label || 'Panel')}
              </h2>
              <button
                onClick={() => {
                  setActivePanel(null);
                  if (activeSidePanel === activePanel) setActiveSidePanel('none');
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Panel Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 light-scrollbar">
            {/* ... Content remains the same ... */}

            {/* TEXT STUDIO PANEL */}
            {activePanel === 'textStudio' && (
              <div className="h-full -mx-4 -mt-4">
                <TextStudioPanel
                  isOpen={activePanel === 'textStudio'}
                  onClose={() => {
                    setActivePanel(null);
                    setActiveSidePanel('none');
                  }}
                  addElement={addElement}
                  updateElement={updateElement}
                  selectedElement={selectedElement}
                  selectedElementData={selectedElementData}
                  canvasSize={canvasSize}
                />
              </div>
            )}

            {/* TYPEFILL PANEL */}
            {activePanel === 'typeFill' && (
              <div className="h-full -mx-4 -mt-4">
                <TypeFillPanel
                  isOpen={activePanel === 'typeFill'}
                  onClose={() => {
                    // Go back to apps panel instead of closing completely
                    setActivePanel('apps');
                    setActiveSidePanel('apps');
                  }}
                  addElement={addElement}
                  canvasSize={canvasSize}
                />
              </div>
            )}

            {/* TYPEWARP PANEL */}
            {activePanel === 'typeWarp' && (
              <div className="h-full -mx-4 -mt-4">
                <TypeWarpPanel
                  isOpen={activePanel === 'typeWarp'}
                  onClose={() => {
                    // Go back to apps panel instead of closing completely
                    setActivePanel('apps');
                    setActiveSidePanel('apps');
                  }}
                  addElement={addElement}
                  updateElement={updateElement}
                  selectedElement={selectedElement}
                  selectedElementData={selectedElementData}
                  canvasSize={canvasSize}
                />
              </div>
            )}

            {/* DESIGN PANEL */}
            {activePanel === 'design' && (
              <div className="space-y-6">
                {/* Template Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Template Categories Tab-style list */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {['All', 'Social Media', 'Marketing', 'Business', 'Education', 'Personal', 'Food', 'Fashion', 'Travel'].map(cat => (
                    <button
                      key={cat}
                      id={`template-cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => setSelectedTemplateCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${selectedTemplateCategory === cat
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-700 text-sm">
                    {selectedTemplateCategory === 'All' ? 'Templates' : `${selectedTemplateCategory}`}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {Object.values(editableTemplates)
                    .filter(t => {
                      const query = searchQuery.toLowerCase();
                      const matchesSearch = t.name.toLowerCase().includes(query) ||
                        (t.category && t.category.toLowerCase().includes(query)) ||
                        (t.subcategory && t.subcategory.toLowerCase().includes(query));
                      const matchesCategory = selectedTemplateCategory === 'All' || t.category === selectedTemplateCategory;
                      return matchesSearch && matchesCategory;
                    })
                    .map(template => (
                      <div
                        key={template.id}
                        onClick={() => addElement('template', { templateId: template.id })}
                        className="group cursor-pointer"
                      >
                        <div className="aspect-[3/4] bg-gray-50 rounded-xl mb-2 overflow-hidden border border-gray-100 shadow-sm transition-all group-hover:shadow-lg group-hover:border-blue-200 flex flex-col items-center justify-center relative">
                          {template.previewImage ? (
                            <img
                              src={template.previewImage}
                              alt={template.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{template.thumbnail}</span>
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-gray-700 line-clamp-1 group-hover:text-blue-600 transition-colors uppercase tracking-wider">{template.name}</p>
                      </div>
                    ))}
                </div>

                {/* Quick Styles */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-700 text-sm mb-4">Styles</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'Warm Sunset', colors: ['#f83600', '#f9d423'] },
                      { name: 'Ocean Mist', colors: ['#48c6ef', '#6f86d6'] },
                      { name: 'Forest Rain', colors: ['#134e5e', '#71b280'] },
                      { name: 'Dark Soul', colors: ['#000000', '#434343'] }
                    ].map(style => (
                      <div key={style.name} className="flex flex-col gap-2 cursor-pointer group"
                        onClick={() => updatePageBackground(style.colors[1], { type: 'linear', colors: style.colors, angle: 45 })}
                      >
                        <div className="h-14 rounded-xl overflow-hidden border border-gray-100 group-hover:border-blue-300 shadow-sm transition-all flex">
                          <div className="flex-1" style={{ backgroundColor: style.colors[0] }} />
                          <div className="flex-1" style={{ backgroundColor: style.colors[1] }} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter text-center">{style.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MORE PANEL */}
            {activePanel === 'more' && (
              <div className="space-y-6">
                 <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-2xl text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                           Discover More
                        </h3>
                        <p className="text-[11px] opacity-90 leading-relaxed font-medium">
                           Powerful tools to take Sowntra further.
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                   <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Apps & Integrations</h3>
                   <button 
                     onClick={() => setShowContentPlannerModal && setShowContentPlannerModal(true)}
                     className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-purple-200 hover:shadow-md transition-all group text-left"
                   >
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform shrink-0">
                         <Calendar size={24} />
                      </div>
                      <div>
                         <h4 className="text-sm font-bold text-gray-800 group-hover:text-purple-700 transition-colors">Content Planner</h4>
                         <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Schedule and publish your designs directly.</p>
                      </div>
                   </button>
                </div>
              </div>
            )}

            {/* BRAND KIT PANEL */}
            {activePanel === 'brandkit' && (
              <div className="space-y-6">
                {brandKits.length > 0 ? (
                  brandKits.map(kit => (
                    <BrandKitPanelSection
                      key={kit.id}
                      title={kit.name}
                      badge="Brand"
                      isOpen={openBrandSections[kit.id]}
                      onToggle={() => setOpenBrandSections(prev => ({ ...prev, [kit.id]: !prev[kit.id] }))}
                    >
                      <div className="space-y-6">
                        {/* Logos */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logos</h4>
                          {kit.logos && kit.logos.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                              {kit.logos.map((logo, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => addElement('image', { src: logo })}
                                  className="aspect-square p-2 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-center group"
                                >
                                  <img src={logo} alt="Brand" className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[9px] text-gray-400 italic">No logos added</p>
                          )}
                        </div>

                        {/* Colors Shortcut */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Colors</h4>
                          {kit.colors && kit.colors.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {kit.colors.slice(0, 8).map((color, idx) => (
                                <div
                                  key={idx}
                                  className="w-6 h-6 rounded-full border border-gray-100 shadow-sm transition-transform hover:scale-125 cursor-pointer"
                                  style={{ backgroundColor: color }}
                                  onClick={() => setActiveSidePanel('color')}
                                />
                              ))}
                              {kit.colors.length > 8 && <span className="text-[10px] text-gray-400 flex items-center">+{kit.colors.length - 8}</span>}
                            </div>
                          ) : (
                            <p className="text-[9px] text-gray-400 italic">No colors added</p>
                          )}
                        </div>

                        {/* Fonts Shortcut */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fonts</h4>
                          {kit.fonts && kit.fonts.length > 0 ? (
                            <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => setActiveSidePanel('text')}
                            >
                              <span className="text-xs font-bold text-gray-700">{kit.fonts[0]?.fontFamily || 'Inter'}</span>
                              <Type size={14} className="text-gray-400" />
                            </div>
                          ) : (
                            <p className="text-[9px] text-gray-400 italic">No fonts added</p>
                          )}
                        </div>

                        {/* Photos */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Photos</h4>
                          {kit.photos && kit.photos.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                              {kit.photos.map((photo, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => addElement('image', { src: photo })}
                                  className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                                >
                                  <img src={photo} alt="Brand" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[9px] text-gray-400 italic">No photos added</p>
                          )}
                        </div>

                        {/* Graphics */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Graphics</h4>
                          {kit.graphics && kit.graphics.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                              {kit.graphics.map((graphic, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => addElement('image', { src: graphic })}
                                  className="aspect-square p-2 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-center group"
                                >
                                  <img src={graphic} alt="Brand" className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[9px] text-gray-400 italic">No graphics added</p>
                          )}
                        </div>

                        {/* Icons */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Icons</h4>
                          {kit.icons && kit.icons.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                              {kit.icons.map((icon, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => addElement('image', { src: icon })}
                                  className="aspect-square p-2 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-center group"
                                >
                                  <img src={icon} alt="Brand" className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[9px] text-gray-400 italic">No icons added</p>
                          )}
                        </div>
                      </div>
                    </BrandKitPanelSection>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-12 px-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-[#8b3dff] mb-4">
                      <Award size={32} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">No Brand Kits yet</h3>
                    <p className="text-xs text-gray-500 mb-6">Create your brand kit to access colors, fonts, and assets here.</p>
                    <button
                      onClick={() => window.location.href = '/brand-kit'}
                      className="px-6 py-2 bg-[#8b3dff] text-white text-xs font-bold rounded-lg shadow-lg shadow-purple-200"
                    >
                      Go to Brand Kits
                    </button>
                  </div>
                )}
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

                {/* Elements Category */}
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Elements</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {['All', 'Shapes', 'Frames', 'Devices', 'Organic', 'Fraction', 'Text', 'Grids', 'Lines', 'Arrows', 'Callouts', 'Social'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedElementCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${selectedElementCategory === cat
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Categories */}
                {[...shapeCategories, ...frameCategories].filter(cat => {
                  if (selectedElementCategory === 'All') return true;
                  if (selectedElementCategory === 'Shapes') return ['basic', 'design', 'ui'].includes(cat.id);
                  if (selectedElementCategory === 'Frames') return ['basic_frames'].includes(cat.id);
                  if (selectedElementCategory === 'Devices') return ['device_frames'].includes(cat.id);
                  if (selectedElementCategory === 'Organic') return ['organic_frames'].includes(cat.id);
                  if (selectedElementCategory === 'Fraction') return ['fraction_frames'].includes(cat.id);
                  if (selectedElementCategory === 'Text') return ['text_mask_frames', 'number_frames'].includes(cat.id);
                  if (selectedElementCategory === 'Grids') return ['grid_frames', 'collage_frames'].includes(cat.id);
                  if (selectedElementCategory === 'Lines') return ['lines'].includes(cat.id);
                  if (selectedElementCategory === 'Arrows') return ['arrows'].includes(cat.id);
                  if (selectedElementCategory === 'Callouts') return ['callouts'].includes(cat.id);
                  if (selectedElementCategory === 'Social') return ['social_frames'].includes(cat.id);
                  return false;
                }).map((category) => (
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
                {/* Brand Fonts Integration */}
                {brandKits.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-500 mb-6">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Brand fonts</h3>
                    {brandKits.map(kit => (
                      <BrandKitPanelSection
                        key={kit.id}
                        title={kit.name}
                        badge="Brand"
                        isOpen={openBrandSections[kit.id]}
                        onToggle={() => setOpenBrandSections(prev => ({ ...prev, [kit.id]: !prev[kit.id] }))}
                      >
                        <div className="space-y-2">
                          {[
                            { id: 'title', fontSize: 52, fontWeight: 'bold', label: 'Title' },
                            { id: 'heading', fontSize: 36, fontWeight: 'bold', label: 'Heading' },
                            { id: 'subheading', fontSize: 24, fontWeight: 'bold', label: 'Subheading' },
                            { id: 'body', fontSize: 16, fontWeight: 'normal', label: 'Body' }
                          ].map(style => {
                            const fontData = (kit.fonts || []).find(f => f.id === style.id);
                            const fontFamily = fontData?.fontFamily || 'Inter';
                            return (
                              <button
                                key={style.id}
                                onClick={() => addElement('text', {
                                  fontSize: style.fontSize,
                                  fontWeight: style.fontWeight,
                                  fontFamily: fontFamily,
                                  content: `Add a brand ${style.label.toLowerCase()}`
                                })}
                                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group"
                              >
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">{style.label}</span>
                                <span
                                  className="text-gray-900 group-hover:text-blue-600 transition-colors"
                                  style={{ fontFamily: fontFamily, fontSize: Math.min(style.fontSize, 24), fontWeight: style.fontWeight }}
                                >
                                  {fontFamily}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </BrandKitPanelSection>
                    ))}
                  </div>
                )}

                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Default styles</h3>
                <button
                  onClick={() => addElement('text', { fontSize: 52, fontWeight: 'bold', content: 'Add a heading' })}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-lg shadow-sm transition-colors text-left"
                >
                  Add a heading
                </button>
                <button
                  onClick={() => addElement('text', { fontSize: 28, content: 'Add a subheading' })}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg text-base transition-colors text-left"
                >
                  Add a subheading
                </button>
                <button
                  onClick={() => addElement('text', { fontSize: 18, content: 'Add a little bit of body text' })}
                  className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 py-2 px-4 rounded-lg text-sm transition-colors text-left"
                >
                  Add a little bit of body text
                </button>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Font Combinations ({fontCombinations.length})</h3>
                  <div className="space-y-3">
                    {fontCombinations.map((combo) => (
                      <div
                        key={combo.id}
                        className="p-4 rounded border border-gray-100 hover:border-blue-200 cursor-pointer transition-colors group"
                        style={{ backgroundColor: combo.bg }}
                        onClick={() => {
                          const headingProps = {
                            type: 'text',
                            ...combo.heading,
                            y: 100
                          };
                          const subheadingProps = {
                            type: 'text',
                            ...combo.subheading,
                            y: 160
                          };

                          addElement('multiple', [headingProps, subheadingProps]);
                        }}
                      >
                        <p style={{
                          fontFamily: combo.heading.fontFamily,
                          fontWeight: combo.heading.fontWeight,
                          color: combo.heading.color
                        }} className="text-xl leading-tight group-hover:text-blue-600 transition-colors">
                          {combo.heading.content}
                        </p>
                        <p style={{
                          fontFamily: combo.subheading.fontFamily,
                          fontWeight: combo.subheading.fontWeight,
                          color: combo.subheading.color
                        }} className="text-xs uppercase tracking-widest mt-1">
                          {combo.subheading.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PEN PANEL */}
            {activePanel === 'pen' && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-blue-800">Vector Draw</h3>
                  </div>
                  <p className="text-xs text-blue-600 leading-relaxed">
                    Click on the canvas to add anchor points. Click and drag to create smooth Bezier curves. Use handles to refine your path.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setCurrentTool('pen')}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${currentTool === 'pen'
                      ? 'bg-blue-600 text-white shadow-blue-200'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <CustomPenIcon size={20} strokeWidth={2} />
                    {currentTool === 'pen' ? 'Pen Tool Active' : 'Activate Pen Tool'}
                  </button>

                  <button
                    onClick={() => setCurrentTool('select')}
                    className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${currentTool === 'select'
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    Switch to Select Tool
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Tips</h4>
                  <ul className="space-y-2 text-xs text-gray-500">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1" />
                      <span>Double click the last point to finish drawing.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1" />
                      <span>Press `Esc` to cancel the current path.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* UPLOADS PANEL */}
            {activePanel === 'uploads' && (
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-2">
                  {['All', 'Images', 'Videos', 'Folders'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setUploadsTab(tab)}
                      className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${uploadsTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {uploadsTab !== 'Folders' && !currentFolder && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors shrink-0"
                  >
                    <Upload size={20} />
                    Upload files
                  </button>
                )}

                {currentFolder && (
                  <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-600">
                    <button onClick={() => setCurrentFolder(null)} className="hover:text-purple-600 hover:underline">Uploads</button>
                    <span className="text-gray-400">/</span>
                    <span className="text-purple-600">{currentFolder.name}</span>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto min-h-0 pr-1 light-scrollbar">
                  {(uploadsTab === 'Folders' || (uploadsTab === 'All' && !currentFolder)) && (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <button
                        onClick={() => {
                          setFolderModalInputValue('');
                          setShowCreateFolderModal(true);
                        }}
                        className="aspect-[4/3] bg-purple-50 rounded-lg border-2 border-dashed border-purple-200 flex flex-col items-center justify-center text-purple-600 hover:bg-purple-100 transition-colors gap-2"
                      >
                        <div className="p-2 bg-white rounded-full shadow-sm">
                          <Plus size={18} />
                        </div>
                        <span className="text-xs font-bold">New Folder</span>
                      </button>

                      {folders.map(folder => (
                        <div
                          key={folder.id}
                          onClick={() => setCurrentFolder(folder)}
                          className="aspect-[4/3] bg-gray-50 rounded-lg border border-gray-100 p-3 hover:border-purple-300 hover:shadow-md cursor-pointer transition-all group relative"
                        >
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                              className="p-1 hover:bg-red-100 rounded text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-3">
                            <Folder size={20} fill="currentColor" fillOpacity={0.2} />
                          </div>
                          <h4 className="text-xs font-bold text-gray-700 truncate">{folder.name}</h4>
                          <p className="text-[10px] text-gray-400 mt-1">{uploads.filter(u => u.folderId === folder.id).length} items</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {(uploadsTab !== 'Folders') && (
                    <>
                      {uploadsTab === 'All' && !currentFolder && folders.length > 0 && (
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recent Uploads</h3>
                      )}

                      <div className="grid grid-cols-2 gap-3 pb-6">
                        {uploads
                          .filter(asset => {
                            if (currentFolder) return asset.folderId === currentFolder.id;
                            if (asset.folderId) return false;
                            if (uploadsTab === 'Images') return asset.type === 'image';
                            if (uploadsTab === 'Videos') return asset.type === 'video';
                            return true;
                          })
                          .map((asset) => (
                            <div
                              key={asset.id}
                              className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-purple-500 transition-all"
                              onClick={() => {
                                if (asset.type === 'video') {
                                  addElement('video', { src: asset.src });
                                } else {
                                  addElement('image', { src: asset.src });
                                }
                              }}
                            >
                              {asset.type === 'video' ? (
                                <div className="w-full h-full relative">
                                  <video src={asset.src} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 flex items-center justify-center text-white bg-black/30">
                                    <span className="text-white text-xs font-bold tracking-wider px-2 py-1 bg-black/50 rounded">VIDEO</span>
                                  </div>
                                </div>
                              ) : (
                                <img
                                  src={asset.src}
                                  alt={asset.name}
                                  className="w-full h-full object-cover"
                                />
                              )}

                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2 gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAsset(asset.id);
                                  }}
                                  className="p-1.5 bg-white/90 rounded-md text-red-500 hover:bg-white hover:text-red-600 transition-colors shadow-sm"
                                  title="Delete"
                                >
                                  <Trash2 size={12} />
                                </button>
                                {folders.length > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMoveTargetAssetId(asset.id);
                                      setShowMoveFolderModal(true);
                                    }}
                                    className="p-1.5 bg-white/90 rounded-md text-gray-700 hover:bg-white hover:text-blue-600 transition-colors shadow-sm"
                                    title="Move to Folder"
                                  >
                                    <Folder size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>

                      {uploads.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                          <Upload size={32} className="mb-2 opacity-50" />
                          <p className="text-xs">No uploads yet</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* CROP PANEL */}
            {activePanel === 'crop' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setActivePanel(null);
                        setActiveSidePanel('none');
                        updateElement(selectedElement, { isCropping: false });
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Check size={18} />
                      Done
                    </button>
                    <button
                      onClick={() => {
                        setActivePanel(null);
                        setActiveSidePanel('none');
                        updateElement(selectedElement, { isCropping: false });
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Aspect Ratio</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {['Free', '1:1', '16:9', '9:16', '4:3', '3:4'].map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => {
                            if (ratio === 'Free') {
                              updateElement(selectedElement, { crop: null });
                            } else {
                              const [w, h] = ratio.split(':').map(Number);
                              updateElement(selectedElement, {
                                crop: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 * (w / h) }
                              });
                            }
                          }}
                          className="py-2 bg-gray-50 border border-gray-200 rounded hover:bg-white hover:border-purple-300 hover:shadow-sm text-xs font-medium text-gray-600 transition-all"
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* APPS PANEL */}
            {activePanel === 'apps' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg mb-6">
                  <h3 className="text-lg font-bold mb-2">Discover Apps</h3>
                  <p className="text-sm opacity-90 leading-relaxed">Enhance your designs with powerful photo editing tools and creative utilities.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Magic Resize App */}
                  <div
                    onClick={() => {
                      setActivePanel('resize');
                      setActiveSidePanel('resize');
                    }}
                    className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-indigo-500 hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
                  >
                    <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Maximize2 size={28} className="group-hover:rotate-12 transition-transform" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Magic Resize Pro</h4>
                      <p className="text-xs text-gray-500">Smartly scale your designs for any platform</p>
                    </div>
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded tracking-widest">MAGIC</div>
                  </div>

                  {/* Magic Glitch App */}
                  <div
                    onClick={() => {
                      setActivePanel('glitch');
                      setActiveSidePanel('glitch');
                    }}
                    className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-red-500 hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
                  >
                    <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center text-cyan-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <Zap size={28} className="group-hover:skew-x-12 transition-transform" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">Magic Glitch (3D)</h4>
                      <p className="text-xs text-gray-500">Add cinematic RGB shift and glitch effects</p>
                    </div>
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded tracking-widest">HOT</div>
                  </div>

                  <div
                    onClick={() => {
                      setActivePanel('textStudio');
                      setActiveSidePanel('textStudio');
                    }}
                    className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-pink-500 hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
                  >
                    <div className="w-14 h-14 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                      <Type size={28} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-pink-600 transition-colors">Text Studio</h4>
                      <p className="text-xs text-gray-500">Create beautiful 3D text and typography</p>
                    </div>
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-pink-100 text-pink-700 text-[10px] font-bold rounded">HOT</div>
                  </div>

                  <div
                    onClick={() => {
                      setActivePanel('frameMaker');
                      setActiveSidePanel('frameMaker');
                    }}
                    className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
                  >
                    <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <ImageIcon size={28} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Frame Maker</h4>
                      <p className="text-xs text-gray-500">Create custom shapes and text frames</p>
                    </div>
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">HOT</div>
                  </div>

                  <div
                    onClick={() => {
                      setActivePanel('blendImage');
                      setActiveSidePanel('blendImage');
                    }}
                    className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
                  >
                    <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <img src="https://cdn-icons-png.flaticon.com/512/3592/3592186.png" alt="Blend" className="w-8 h-8 group-hover:invert transition-all" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Blend Image</h4>
                      <p className="text-xs text-gray-500">Merge two images with beautiful filters</p>
                    </div>
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">New</div>
                  </div>

                  <div
                    onClick={() => {
                      setActivePanel('meshGradient');
                      setActiveSidePanel('meshGradient');
                    }}
                    className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-purple-500 hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
                  >
                    <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <img src="https://cdn-icons-png.flaticon.com/512/3617/3617255.png" alt="Mesh" className="w-8 h-8 group-hover:invert transition-all" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Mesh Gradient</h4>
                      <p className="text-xs text-gray-500">Create trendy, colorful mesh gradients in seconds</p>
                    </div>
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">Hot</div>
                  </div>

                  <div
                    onClick={() => {
                      setActivePanel('typeExtrude');
                      setActiveSidePanel('typeExtrude');
                    }}
                    className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-purple-600 hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
                  >
                    <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <Type size={28} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">TypeExtrude</h4>
                      <p className="text-xs text-gray-500">Add 3D depth and dimension to your text</p>
                    </div>
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded">HOT</div>
                  </div>

                  <div
                    onClick={() => {
                      setActivePanel('typeFill');
                      setActiveSidePanel('typeFill');
                    }}
                    className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-indigo-600 hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
                  >
                    <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors overflow-hidden">
                      <div className="text-xs font-black rotate-[-15deg] group-hover:scale-125 transition-transform text-indigo-600 group-hover:text-white">ABC</div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors text-sm">TypeFill Pattern</h4>
                      <p className="text-[10px] text-gray-500">Fill text with tiny repeating images</p>
                    </div>
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded">NEW</div>
                  </div>

                  <div
                    onClick={() => {
                      setActivePanel('transformImage');
                      setActiveSidePanel('transformImage');
                    }}
                    className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-600 hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
                  >
                    <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Maximize2 size={28} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Transform Image</h4>
                      <p className="text-xs text-gray-500">Add 3D perspective to your photos</p>
                    </div>
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">NEW</div>
                  </div>

                    <div
                      onClick={() => {
                        setActivePanel('easyReflection');
                        setActiveSidePanel('easyReflection');
                      }}
                      className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-purple-600 hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
                    >
                      <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                          <path d="M4 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8"/>
                          <path d="M4 16v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>
                          <line x1="2" y1="14" x2="22" y2="14"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Easy Reflections</h4>
                        <p className="text-xs text-gray-500">Create beautiful fades and reflections</p>
                      </div>
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded">NEW</div>
                    </div>

                    <div
                      onClick={() => {
                        setActivePanel('model3d');
                        setActiveSidePanel('model3d');
                      }}
                      className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-600 hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
                    >
                      <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Box size={28} className="group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">3D Model Viewer</h4>
                        <p className="text-xs text-gray-500">Upload and preview STL, OBJ, GLB models</p>
                      </div>
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">NEW</div>
                    </div>

                    <div
                      onClick={() => {
                        setActivePanel('typeWarp');
                        setActiveSidePanel('typeWarp');
                      }}
                      className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-purple-600 hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
                    >
                      <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Type size={28} className="group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">TypeWarp</h4>
                        <p className="text-xs text-gray-500">Bend, wave, and distort your text creatively</p>
                      </div>
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded">NEW</div>
                    </div>

                    <div
                      onClick={() => {
                        setActivePanel('badTV');
                        setActiveSidePanel('badTV');
                      }}
                      className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#ff4b2b] hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
                    >
                      <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center text-[#ff4b2b] group-hover:bg-[#ff4b2b] group-hover:text-white transition-colors">
                        <Tv size={28} className="group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-[#ff4b2b] transition-colors">Bad TV</h4>
                        <p className="text-xs text-gray-500">Add retro TV glitch and noise effects</p>
                      </div>
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">NEW</div>
                    </div>

                    <div
                      onClick={() => {
                        setActivePanel('colorPop');
                        setActiveSidePanel('colorPop');
                      }}
                      className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-teal-600 hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
                    >
                      <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                        <Camera size={28} className="group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">Color Pop</h4>
                        <p className="text-xs text-gray-500">B&W backgrounds, vivid foregrounds</p>
                      </div>
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-bold rounded">NEW</div>
                    </div>

                    <div
                      onClick={() => {
                        setActivePanel('cartoonify');
                        setActiveSidePanel('cartoonify');
                      }}
                      className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-orange-500 hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
                    >
                      <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        <ImageIcon size={28} className="group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-orange-500 transition-colors">Cartoonify</h4>
                        <p className="text-xs text-gray-500">Turn your photos into comic art</p>
                      </div>
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded">NEW</div>
                    </div>

                    <div
                      onClick={() => {
                        setActivePanel('photoEnhancer');
                        setActiveSidePanel('photoEnhancer');
                      }}
                      className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-violet-500 hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
                    >
                      <div className="w-14 h-14 bg-violet-50 rounded-xl flex items-center justify-center text-violet-500 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-violet-500 transition-colors">Photo Enhancer</h4>
                        <p className="text-xs text-gray-500">Upscale low quality to HD quality</p>
                      </div>
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-bold rounded">NEW</div>
                    </div>
                    
                    <div
                      onClick={() => {
                        setActivePanel('duotone');
                        setActiveSidePanel('duotone');
                      }}
                      className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-teal-500 hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
                    >
                      <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                        <Palette size={28} className="group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">Duotone</h4>
                        <p className="text-xs text-gray-500">Apply high-contrast color effects</p>
                      </div>
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-bold rounded">NEW</div>
                    </div>



                </div>
              </div>
            )}

            {/* COLOR PANEL */}
            {activePanel === 'color' && (
              <ColorPanel
                pages={pages}
                currentPage={currentPage}
                updateElement={updateElement}
                selectedElement={selectedElement}
                selectedElementData={selectedElementData}
                lastColorChange={lastColorChange}
                setLastColorChange={setLastColorChange}
                setPages={setPages}
                updatePageBackground={updatePageBackground}
              />
            )}

            {activePanel === 'frameMaker' && (
              <FrameMakerPanel
                isOpen={true}
                onClose={() => {
                  setActivePanel('apps');
                  setActiveSidePanel('apps');
                }}
                addElement={addElement}
                canvasSize={canvasSize}
              />
            )}

            {activePanel === 'typeExtrude' && (
              <TypeExtrudePanel
                isOpen={true}
                onClose={() => {
                  setActivePanel('apps');
                  setActiveSidePanel('apps');
                }}
                addElement={addElement}
                updateElement={updateElement}
                selectedElement={selectedElement}
                selectedElementData={selectedElementData}
                canvasSize={canvasSize}
              />
            )}

            {activePanel === 'transformImage' && (
              <TransformImagePanel
                isOpen={true}
                onClose={() => {
                  setActivePanel('apps');
                  setActiveSidePanel('apps');
                }}
                addElement={addElement}
                selectedElementData={selectedElementData}
              />
            )}

            {activePanel === 'easyReflection' && (
              <EasyReflectionPanel
                isOpen={true}
                onClose={() => {
                  setActivePanel('apps');
                  setActiveSidePanel('apps');
                }}
                selectedElement={selectedElement}
                selectedElementData={selectedElementData}
                updateElement={updateElement}
              />
            )}

            {activePanel === 'model3d' && (
              <Model3DPanel
                isOpen={true}
                onClose={() => {
                  setActivePanel('apps');
                  setActiveSidePanel('apps');
                }}
                addElement={addElement}
              />
            )}

            {activePanel === 'badTV' && (
              <BadTVPanel
                isOpen={true}
                onClose={() => {
                  setActivePanel('apps');
                  setActiveSidePanel('apps');
                }}
                addElement={addElement}
              />
            )}

            {activePanel === 'colorPop' && (
              <ColorPopPanel
                isOpen={true}
                onClose={() => {
                  setActivePanel('apps');
                  setActiveSidePanel('apps');
                }}
                selectedElement={selectedElement}
                selectedElementData={selectedElementData}
                updateElement={updateElement}
                addElement={addElement}
              />
            )}

            {activePanel === 'cartoonify' && (
              <CartoonifyPanel
                isOpen={true}
                onClose={() => {
                  setActivePanel('apps');
                  setActiveSidePanel('apps');
                }}
                selectedElement={selectedElement}
                selectedElementData={selectedElementData}
                updateElement={updateElement}
                addElement={addElement}
              />
            )}

            {activePanel === 'photoEnhancer' && (
              <PhotoEnhancerPanel
                isOpen={true}
                onClose={() => {
                  setActivePanel('apps');
                  setActiveSidePanel('apps');
                }}
                selectedElement={selectedElement}
                selectedElementData={selectedElementData}
                updateElement={updateElement}
                addElement={addElement}
              />
            )}

            {activePanel === 'glitch' && (
              <RGBGlitchPanel
                isOpen={true}
                onClose={() => setActivePanel('elements')}
                selectedElement={selectedElement}
                selectedElementData={selectedElementData}
                updateElement={updateElement}
                addElement={addElement}
              />
            )}

            {activePanel === 'resize' && (
              <MagicResizePanel
                isOpen={true}
                onClose={() => setActivePanel('elements')}
                canvasSize={canvasSize}
                setCanvasSize={setCanvasSize}
                pages={pages}
                setPages={setPages}
                currentPage={currentPage}
                updateElements={updateElements}
              />
            )}

            {activePanel === 'duotone' && (
              <DuotonePanel
                isOpen={true}
                onClose={() => {
                  setActivePanel('apps');
                  setActiveSidePanel('apps');
                }}
                selectedElement={selectedElement}
                selectedElementData={selectedElementData}
                updateElement={updateElement}
                addElement={addElement}
              />
            )}



            {/* VIDEO PANEL */}
            {activePanel === 'video' && (
              <div className="space-y-6">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all"
                >
                  <Upload size={20} />
                  Upload Video
                </button>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'v1', name: 'Nature', thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200', src: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { id: 'v2', name: 'City', thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200', src: 'https://www.w3schools.com/html/movie.mp4' },
                    { id: 'v3', name: 'abstract', thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=200', src: 'https://www.sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4' },
                  ].map(video => (
                    <div
                      key={video.id}
                      onClick={() => addElement('video', { src: video.src })}
                      className="group cursor-pointer relative aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-100 hover:border-blue-500 transition-all"
                    >
                      <img src={video.thumbnail} alt={video.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Video className="text-white" size={24} />
                      </div>
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-[10px] font-bold rounded uppercase">{video.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUDIO PANEL */}
            {activePanel === 'audio' && (
              <div className="space-y-6">
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-purple-100 flex items-center justify-center gap-2 transition-all"
                >
                  <Upload size={20} />
                  Upload Audio
                </button>

                <div className="space-y-3">
                  {[
                    { id: 'a1', name: 'Lofi Study', duration: '2:34', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
                    { id: 'a2', name: 'Nature Relax', duration: '3:15', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
                    { id: 'a3', name: 'Corporate Beat', duration: '1:45', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
                  ].map(audio => (
                    <div
                      key={audio.id}
                      onClick={() => addElement('audio', { name: audio.name, src: audio.url })}
                      className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-purple-500 hover:shadow-md cursor-pointer transition-all group"
                    >
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                        <Music size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-gray-800">{audio.name}</h4>
                        <p className="text-[10px] text-gray-500">{audio.duration}</p>
                      </div>
                      <Plus size={16} className="text-gray-400 group-hover:text-purple-600" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INDEPENDENT PANELS (Outside Generic Sidebar) */}
      {activePanel === 'editImage' && (
        <EditImagePanel
          isOpen={true}
          onClose={() => setActiveSidePanel('none')}
          selectedElement={selectedElement}
          selectedElementData={selectedElementData}
          updateElement={updateElement}
          handleRemoveBackground={handleRemoveBackground}
          isProcessingBG={isProcessingBG}
          handleRevertBackground={handleRevertBackground}
          bgProcessingStatus={bgProcessingStatus}
        />
      )}

      {activePanel === 'blendImage' && (
        <BlendImagePanel
          isOpen={true}
          onClose={() => {
            setActivePanel('apps');
            setActiveSidePanel('apps');
          }}
          selectedElement={selectedElement}
          selectedElementData={selectedElementData}
          addElement={addElement}
          uploads={uploads}
        />
      )}

      {activePanel === 'meshGradient' && (
        <MeshGradientPanel
          isOpen={true}
          onClose={() => {
            setActivePanel('apps');
            setActiveSidePanel('apps');
          }}
          addElement={addElement}
          canvasSize={canvasSize}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*, .mp3, .wav, .ogg, .m4a"
        onChange={handleAudioUpload}
        className="hidden"
      />
      <input
        ref={loadProjectInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleProjectFileLoad}
        className="hidden"
      />

      {/* --- MODALS --- */}
      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-80 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">New Folder</h3>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
              placeholder="Folder Name"
              autoFocus
              value={folderModalInputValue}
              onChange={(e) => setFolderModalInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && folderModalInputValue.trim()) {
                  handleCreateFolder(folderModalInputValue.trim());
                  setShowCreateFolderModal(false);
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateFolderModal(false)}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (folderModalInputValue.trim()) {
                    handleCreateFolder(folderModalInputValue.trim());
                    setShowCreateFolderModal(false);
                  }
                }}
                disabled={!folderModalInputValue.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move to Folder Modal */}
      {showMoveFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-80 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Move to Folder</h3>
            <div className="max-h-60 overflow-y-auto space-y-2 mb-4 light-scrollbar">
              {folders.length > 0 ? (
                folders.map(f => (
                  <button
                    key={f.id}
                    onClick={() => {
                      if (moveTargetAssetId) handleMoveToFolder(moveTargetAssetId, f.id);
                      setShowMoveFolderModal(false);
                      setMoveTargetAssetId(null);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 rounded-lg text-left group transition-colors border border-transparent hover:border-purple-100"
                  >
                    <Folder size={18} className="text-purple-400 group-hover:text-purple-600" />
                    <span className="text-sm text-gray-700 font-medium group-hover:text-purple-800">{f.name}</span>
                  </button>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400 text-sm">
                  <Folder size={24} className="mx-auto mb-2 opacity-30" />
                  <p>No folders created yet.</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowMoveFolderModal(false);
                  setMoveTargetAssetId(null);
                }}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div >
  );
};

// Custom Equality Function for React.memo
const arePropsEqual = (prevProps, nextProps) => {
  // Always re-render if these props change
  if (prevProps.activeSidePanel !== nextProps.activeSidePanel) return false;
  if (prevProps.currentTool !== nextProps.currentTool) return false;
  if (prevProps.historyIndex !== nextProps.historyIndex) return false;
  if (prevProps.showGrid !== nextProps.showGrid) return false;
  if (prevProps.snapToGrid !== nextProps.snapToGrid) return false;
  if (prevProps.uploads !== nextProps.uploads) return false; // Uploads array ref should satisfy

  // Specific checks based on active panel
  const panel = nextProps.activeSidePanel;

  if (panel === 'color' || panel === 'design') {
    // These panels depend on pages/selection/colors
    if (prevProps.pages !== nextProps.pages) return false;
    if (prevProps.currentPage !== nextProps.currentPage) return false;
    if (prevProps.selectedElement !== nextProps.selectedElement) return false;
    if (prevProps.selectedElementData !== nextProps.selectedElementData) return false;
    if (prevProps.lastColorChange !== nextProps.lastColorChange) return false;
  }

  if (panel === 'crop' || panel === 'editImage' || panel === 'model3d') {
    if (prevProps.selectedElement !== nextProps.selectedElement) return false;
    if (prevProps.selectedElementData !== nextProps.selectedElementData) return false;
    if (prevProps.isProcessingBG !== nextProps.isProcessingBG) return false;
    if (prevProps.bgProcessingStatus !== nextProps.bgProcessingStatus) return false;
  }

  // 'elements', 'text', 'uploads', 'pen' panels do NOT depend on pages/selection (mostly)
  // 


  return true;
};

export default React.memo(ToolsSidebar, arePropsEqual);
