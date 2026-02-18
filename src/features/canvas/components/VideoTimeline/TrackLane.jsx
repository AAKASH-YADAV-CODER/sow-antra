import React from 'react';
import TimelineClip from './TimelineClip';

const TrackLane = ({
    element,
    duration,
    zoomLevel,
    onUpdateElement,
    isSelected,
    onSelect
}) => {

    return (
        <div className={`h-12 border-b border-[#2a2b2e] bg-[#1e1f22] relative hover:bg-[#252629] transition-colors ${isSelected ? 'bg-[#2a2b2e]' : ''}`}>
            {/* Track Header (if split view) */}

            {/* Clip Area */}
            <div className="absolute inset-y-1" style={{ left: 0, right: 0 }}>
                <TimelineClip
                    element={element}
                    zoomLevel={zoomLevel}
                    onUpdateElement={onUpdateElement}
                    isSelected={isSelected}
                    onSelect={onSelect}
                />
            </div>
        </div>
    );
};

export default TrackLane;
