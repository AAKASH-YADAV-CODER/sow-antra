import React, { useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import PagePreview from './PagePreview';

const PagesStrip = ({
    pages,
    currentPage,
    setCurrentPage,
    addNewPage,
    renderElement,
    onClose,
    canvasSize
}) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="absolute left-0 right-0 bottom-10 h-32 bg-white border-t border-gray-200 z-[1002] flex items-center px-4 gap-4 animate-in slide-in-from-bottom duration-300">
            <button
                onClick={() => scroll('left')}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
                <ChevronLeft size={24} />
            </button>

            <div
                ref={scrollRef}
                className="flex-1 flex items-center gap-6 overflow-x-auto no-scrollbar py-2 h-full"
            >
                {pages.map((page, index) => {
                    const isSelected = page.id === currentPage;
                    return (
                        <div
                            key={page.id}
                            className="flex flex-col items-center group flex-shrink-0 relative"
                            onClick={() => setCurrentPage(page.id)}
                        >
                            <div
                                className={`
                  relative cursor-pointer transition-all duration-200 rounded-md overflow-hidden
                  ${isSelected
                                        ? 'ring-2 ring-purple-500 ring-offset-1 scale-100'
                                        : 'ring-1 ring-gray-200 hover:ring-purple-300'
                                    }
                `}
                            >
                                <PagePreview
                                    page={page}
                                    width={140}
                                    height={100}
                                    canvasSize={canvasSize}
                                    renderElement={renderElement}
                                />
                                {/* Page Number Overlay */}
                                <div className="absolute bottom-1 left-1 bg-white/90 rounded-sm px-1.5 py-0.5 text-[10px] font-bold text-gray-700 shadow-sm">
                                    {index + 1}
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div className="flex items-center gap-1 flex-shrink-0 mr-4">
                    <button
                        onClick={addNewPage}
                        className="w-[100px] h-[100px] border-2 border-dashed border-gray-200 rounded-md flex items-center justify-center text-gray-400 hover:border-purple-300 hover:text-purple-500 hover:bg-purple-50 transition-all"
                        title="Add page"
                    >
                        <Plus size={24} />
                    </button>
                    <button className="h-[100px] px-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400">
                        <ChevronDown size={16} />
                    </button>
                </div>
            </div>

            <button
                onClick={() => scroll('right')}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
                <ChevronRight size={24} />
            </button>
        </div>
    );
};

export default PagesStrip;
