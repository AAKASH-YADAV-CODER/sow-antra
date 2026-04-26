import React, { useState } from 'react';
import { Plus, MoreHorizontal, Copy, Trash2, Eye } from 'lucide-react';

export const PageStrip = ({ 
    pages, 
    currentPage, 
    setCurrentPage, 
    onAddPage,
    onDeletePage,
    onDuplicatePage
}) => {
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null);

    return (
        <div className="bg-gray-50 border-b border-gray-200 h-28 flex items-center px-4 gap-3 overflow-x-auto no-scrollbar select-none transition-all duration-300 ease-in-out">
            {pages.map((page, index) => {
                const isActive = page.id === currentPage;
                
                return (
                    <div 
                        key={page.id}
                        className={`relative group flex-shrink-0 cursor-pointer h-20 w-32 rounded-lg border-2 transition-all overflow-hidden ${
                            isActive ? 'border-[#8b3dff] shadow-md scale-[1.02]' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setCurrentPage(page.id)}
                    >
                        {/* Thumbnail Background */}
                        <div 
                            className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-400"
                            style={{ backgroundColor: page.backgroundColor || '#ffffff' }}
                        >
                           {page.name || `Page ${index + 1}`}
                        </div>

                        {/* Page Number Badge */}
                        <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            isActive ? 'bg-[#8b3dff] text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                            {index + 1}
                        </div>

                        {/* More Actions Menu */}
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                className="p-1 bg-white/90 backdrop-blur-sm rounded shadow-sm hover:bg-white"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(activeMenuId === page.id ? null : page.id);
                                }}
                            >
                                <MoreHorizontal size={12} className="text-gray-600" />
                            </button>
                        </div>

                        {/* Scene Context Menu Popup */}
                        {activeMenuId === page.id && (
                            <>
                                <div 
                                    className="fixed inset-0 z-[100]" 
                                    onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} 
                                />
                                <div 
                                    className="absolute top-8 right-1 w-28 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-[110] text-[10px]"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button 
                                        className="w-full px-2 py-1.5 text-left hover:bg-gray-50 flex items-center gap-2"
                                        onClick={() => {
                                            onDuplicatePage(page.id);
                                            setActiveMenuId(null);
                                        }}
                                    >
                                        <Copy size={10} />
                                        Duplicate
                                    </button>
                                    <button 
                                        className="w-full px-2 py-1.5 text-left hover:bg-gray-50 flex items-center gap-2 text-red-500"
                                        onClick={() => {
                                            onDeletePage(page.id);
                                            setActiveMenuId(null);
                                        }}
                                    >
                                        <Trash2 size={10} />
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                );
            })}

            {/* ── Add Page Button ── */}
            <div className="relative flex-shrink-0">
                <button 
                    className="w-10 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-[#8b3dff] hover:bg-[#f8f6ff] transition-all text-gray-400 hover:text-[#8b3dff]"
                    onClick={() => setShowAddMenu(!showAddMenu)}
                >
                    <Plus size={20} />
                </button>

                {/* Add Page Modal Menu */}
                {showAddMenu && (
                    <>
                        <div 
                            className="fixed inset-0 z-[100]" 
                            onClick={() => setShowAddMenu(false)} 
                        />
                        <div className="absolute bottom-full left-0 mb-2 w-32 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-[110] animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="px-3 pb-1 border-b border-gray-50 mb-1">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">New Page</span>
                            </div>
                            <button 
                                className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-[#f8f6ff] hover:text-[#8b3dff] flex items-center gap-2 transition-colors"
                                onClick={() => {
                                    onAddPage('blank');
                                    setShowAddMenu(false);
                                }}
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                Blank Page
                            </button>
                            <button 
                                className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-[#f8f6ff] hover:text-[#8b3dff] flex items-center gap-2 transition-colors"
                                onClick={() => {
                                    onAddPage('import');
                                    setShowAddMenu(false);
                                }}
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Import Media
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
