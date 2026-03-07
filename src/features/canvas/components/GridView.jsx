import React from 'react';
import { X, Plus } from 'lucide-react';
import PagePreview from './PagePreview';

const GridView = ({ isOpen, onClose, pages, currentPage, setCurrentPage, addNewPage, renderElement, canvasSize }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[3000] bg-white flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white sticky top-0 z-10">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                    Grid View <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">{pages.length} Pages</span>
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={24} className="text-gray-600" />
                </button>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto p-12 bg-gray-50">
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 justify-items-center">
                    {pages.map((page, index) => {
                        const isSelected = page.id === currentPage;

                        return (
                            <div key={page.id} className="flex flex-col items-center gap-4 group">
                                <div
                                    onClick={() => {
                                        setCurrentPage(page.id);
                                        onClose();
                                    }}
                                    className={`
                    relative cursor-pointer transition-all duration-300 rounded-lg overflow-hidden
                    ${isSelected
                                            ? 'ring-4 ring-purple-500 ring-offset-8 scale-100 shadow-2xl'
                                            : 'ring-1 ring-gray-200 hover:scale-105 shadow-md hover:shadow-xl'
                                        }
                  `}
                                    style={{
                                        width: '240px',
                                        height: '180px',
                                    }}
                                >
                                    <PagePreview
                                        page={page}
                                        width={240}
                                        height={180}
                                        canvasSize={canvasSize}
                                        renderElement={renderElement}
                                    />
                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
                                        <span className="bg-white/90 px-4 py-2 rounded-full text-sm font-bold text-gray-800 shadow-lg">Edit Page</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors
                    ${isSelected ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}
                  `}>
                                        {index + 1}
                                    </span>
                                    <span className={`text-sm font-medium ${isSelected ? 'text-purple-600 font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                        {page.name || `Page ${index + 1}`}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add Page Button */}
                    <div className="flex flex-col items-center gap-4 group">
                        <button
                            onClick={addNewPage}
                            className="w-[240px] h-[180px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-purple-300 hover:text-purple-500 hover:bg-purple-50 transition-all group-hover:scale-105"
                        >
                            <Plus size={32} />
                            <span className="text-sm font-bold">Add Page</span>
                        </button>
                        <div className="h-6" /> {/* Spacer for label alignment */}
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="h-12 border-t border-gray-100 flex items-center justify-center px-6 bg-white text-xs text-gray-400 font-medium">
                Select a page to jump directly to it
            </div>
        </div>
    );
};

export default GridView;
