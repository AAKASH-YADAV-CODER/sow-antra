import React from 'react';
import TrackLane from './TrackLane';

const TimelineTracks = ({
    elements = [],
    duration,
    zoomLevel,
    onUpdateElement,
    selectedElement,
    setSelectedElement
}) => {
    // Filter out elements that shouldn't appear on timeline if needed
    // For now, show all legitimate canvas elements
    const trackElements = elements.filter(el =>
        ['image', 'video', 'text', 'shape', 'group'].includes(el.type)
    );

    return (
        <div className="flex flex-col min-h-full pb-10">
            {trackElements.map((element) => (
                <TrackLane
                    key={element.id}
                    element={element}
                    duration={duration}
                    zoomLevel={zoomLevel}
                    onUpdateElement={onUpdateElement}
                    isSelected={selectedElement === element.id}
                    onSelect={() => setSelectedElement(element.id)}
                />
            ))}

            {/* Empty space filler / Drop zone potential */}
            <div className="flex-1 min-h-[50px] bg-[#1e1f22] opacity-50 border-t border-[#2a2b2e]/50"></div>
        </div>
    );
};

export default TimelineTracks;
