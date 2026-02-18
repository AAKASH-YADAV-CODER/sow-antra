import React from 'react';
import { getBackgroundStyle } from '../../../utils/helpers';

const PagePreview = ({ page, width = 200, height = 150, canvasSize, renderElement }) => {
    if (!page) return null;

    const canvasWidth = canvasSize?.width || 800;
    const canvasHeight = canvasSize?.height || 600;

    const scaleX = width / canvasWidth;
    const scaleY = height / canvasHeight;
    const scale = Math.min(scaleX, scaleY);

    return (
        <div
            className="relative overflow-hidden shadow-sm"
            style={{
                width: `${width}px`,
                height: `${height}px`,
                background: page.backgroundGradient
                    ? getBackgroundStyle({ fillType: 'gradient', gradient: page.backgroundGradient })
                    : (page.backgroundColor || 'white'),
            }}
        >
            <div
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: `${canvasWidth}px`,
                    height: `${canvasHeight}px`,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: `-${(canvasHeight * scale) / 2}px`,
                    marginLeft: `-${(canvasWidth * scale) / 2}px`,
                }}
            >
                {(page.elements || [])
                    .filter(el => !el.groupId)
                    .map(el => renderElement(el))}
            </div>
        </div>
    );
};

export default PagePreview;
