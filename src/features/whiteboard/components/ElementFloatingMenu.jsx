import React from 'react';
import { Trash2, Type, PaintBucket, Edit2 } from 'lucide-react';

const ElementFloatingMenu = ({ element, stageScale, stagePosition, updateElement, removeElement }) => {
  if (!element) return null;

  // Calculate screen position for the menu to float above the element
  let x = element.x * stageScale + stagePosition.x;
  let y = element.y * stageScale + stagePosition.y;

  // Adjust Y to place menu *above* the element
  if (element.type === 'rect' || element.type === 'sticky') {
    y -= 45; // Height of menu + spacing
    // x is okay, maybe center it based on width
    x += (element.width * stageScale) / 2 - 80; 
  } else if (element.type === 'circle' || element.type === 'triangle' || element.type === 'diamond') {
    y -= (element.radius * stageScale) + 45;
    x -= 80; // approximate half width of menu
  } else if (element.type === 'text') {
    y -= 45;
  }

  const colors = ['#000000', '#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#FFFFFF'];

  return (
    <div
      className="absolute bg-white rounded-xl shadow-xl border border-gray-100 flex items-center p-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{ top: `${y}px`, left: `${Math.max(10, x)}px` }}
    >
      <div className="flex items-center gap-1">
        {colors.map(color => (
          <button
            key={color}
            onClick={() => updateElement(element.id, { fill: color })}
            className={`w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform ${element.fill === color ? 'ring-2 ring-purple-500 ring-offset-1' : ''}`}
            style={{ backgroundColor: color }}
            title="Fill Color"
          />
        ))}
      </div>
      
      <div className="w-px h-6 bg-gray-200 mx-2" />
      
      <button
        onClick={() => {
          const newSize = (element.fontSize || 16) + 4;
          updateElement(element.id, { fontSize: newSize > 72 ? 12 : newSize });
        }}
        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
        title="Cycle Font Size"
      >
        <Type size={18} />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-2" />

      <button
        onClick={() => removeElement(element.id)}
        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
        title="Delete"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default ElementFloatingMenu;
