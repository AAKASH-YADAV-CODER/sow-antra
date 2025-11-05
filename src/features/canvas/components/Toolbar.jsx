import React from 'react';
import {
  MousePointer, Type, Square, Circle, Triangle, Image, Hexagon,
  ArrowRight, ArrowLeft, Music, Film, FileText, BookOpen,
  Printer, Heart, Zap, CreditCard, Tv, Smartphone, Monitor, Megaphone
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Toolbar Component
 * Displays the main tool selection bar for canvas operations
 */
const Toolbar = ({ currentTool, onToolChange }) => {
  const { t } = useTranslation();

  const tools = [
    { id: 'select', icon: MousePointer, label: t('toolbar.select') },
    { id: 'text', icon: Type, label: t('toolbar.text') },
    { id: 'shape', icon: Square, label: t('toolbar.shape') },
    { id: 'image', icon: Image, label: t('toolbar.image') },
  ];

  const shapes = [
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'triangle', icon: Triangle, label: 'Triangle' },
    { id: 'hexagon', icon: Hexagon, label: 'Hexagon' },
    { id: 'arrow-right', icon: ArrowRight, label: 'Arrow Right' },
    { id: 'arrow-left', icon: ArrowLeft, label: 'Arrow Left' },
  ];

  const stickers = [
    { emoji: '❤️', label: 'Heart' },
    { emoji: '⭐', label: 'Star' },
    { emoji: '🎵', label: 'Music' },
    { emoji: '🎬', label: 'Film' },
    { emoji: '📝', label: 'Note' },
    { emoji: '📚', label: 'Book' },
    { emoji: '🖨️', label: 'Print' },
    { emoji: '💖', label: 'Pink Heart' },
    { emoji: '⚡', label: 'Lightning' },
    { emoji: '💳', label: 'Card' },
    { emoji: '📺', label: 'TV' },
    { emoji: '📱', label: 'Phone' },
    { emoji: '💻', label: 'Computer' },
    { emoji: '📢', label: 'Megaphone' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Main Tools */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className={`p-2 rounded hover:bg-gray-100 touch-manipulation transition-colors ${
                  currentTool === tool.id ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
                }`}
                title={tool.label}
              >
                <Icon size={20} />
              </button>
            );
          })}
        </div>

        {/* Shape Tools */}
        {currentTool === 'shape' && (
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            {shapes.map((shape) => {
              const Icon = shape.icon;
              return (
                <button
                  key={shape.id}
                  onClick={() => onToolChange(shape.id)}
                  className="p-2 rounded hover:bg-gray-100 touch-manipulation transition-colors text-gray-700"
                  title={shape.label}
                >
                  <Icon size={20} />
                </button>
              );
            })}
          </div>
        )}

        {/* Stickers */}
        <div className="flex items-center gap-1 flex-wrap">
          {stickers.slice(0, 8).map((sticker, index) => (
            <button
              key={index}
              onClick={() => onToolChange('sticker', sticker.emoji)}
              className="p-2 rounded hover:bg-gray-100 touch-manipulation transition-colors text-xl"
              title={sticker.label}
            >
              {sticker.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
