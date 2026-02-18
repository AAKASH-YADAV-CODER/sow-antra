import React from 'react';


const TimelineClip = ({
    element,
    zoomLevel,
    onUpdateElement,
    isSelected,
    onSelect
}) => {
    const startTime = element.startTime || 0;
    const duration = element.duration || 5; // Default 5s if custom duration not set

    const widthPixels = duration * 100 * zoomLevel; // Base 100px per sec
    const leftPixels = startTime * 100 * zoomLevel;

    const handleDragStart = (e) => {
        e.stopPropagation();
        onSelect();
        // Implement drag logic
    };

    return (
        <div
            className={`absolute h-full rounded-md overflow-hidden cursor-pointer border-2 transition-all group
        ${isSelected ? 'border-blue-500 z-10' : 'border-transparent hover:border-gray-500'}
        ${element.type === 'video' ? 'bg-purple-900/50' :
                    element.type === 'audio' ? 'bg-green-900/50' :
                        element.type === 'text' ? 'bg-orange-900/50' : 'bg-blue-900/50'}
      `}
            style={{
                left: `${leftPixels}px`,
                width: `${widthPixels}px`
            }}
            onMouseDown={handleDragStart}
        >
            <div className="flex items-center px-2 h-full gap-2">
                {/* Icon based on type */}
                <span className="text-xs font-medium truncate text-white/90 drop-shadow-md select-none">
                    {element.type === 'text' ? (element.text || 'Text') : element.type}
                </span>

                {/* Thumbnail (if image/video) */}
                {(element.type === 'image' || element.type === 'video') && element.src && (
                    <img src={element.src} className="h-8 w-8 object-cover rounded opacity-80" alt="" />
                )}
            </div>

            {/* Resize Handles */}
            {isSelected && (
                <>
                    <div className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize hover:bg-white/20 active:bg-white/40"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize hover:bg-white/20 active:bg-white/40"></div>
                </>
            )}
        </div>
    );
};

export default TimelineClip;
