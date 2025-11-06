import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { socialMediaTemplates } from '../../../../utils/constants';

const TemplatesModal = ({ show, onClose, onApplyTemplate }) => {
  if (!show) return null;

  const handleTemplateClick = (templateKey) => {
    onApplyTemplate(templateKey);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl shadow-2xl 
                      md:p-6 sm:p-4 
                      my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
          <div className="flex items-center">
            <Sparkles className="mr-2 text-purple-500" size={24} />
            <h2 className="text-2xl font-bold md:text-3xl sm:text-lg">
              Choose a Template
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 sm:gap-2">
          {/* Custom Template Button */}
          <button
            onClick={() => handleTemplateClick('custom')}
            className="flex flex-col items-center justify-center p-4 
                       border-2 border-dashed border-purple-300 rounded-lg 
                       hover:border-purple-500 hover:bg-purple-50 
                       transition-all duration-200 min-h-[120px]
                       md:p-6 md:min-h-[140px]
                       sm:p-3 sm:min-h-[100px]
                       group"
          >
            <Sparkles className="text-purple-500 mb-2 group-hover:scale-110 transition-transform" 
                     size={window.innerWidth < 640 ? 20 : 24} />
            <span className="font-semibold text-center text-sm md:text-base sm:text-xs">
              Custom Size
            </span>
            <span className="text-xs text-gray-500 mt-1 md:text-sm sm:text-xs">
              Create your own
            </span>
          </button>

          {/* Social Media Templates */}
          {Object.entries(socialMediaTemplates).map(([key, template]) => (
            <button
              key={key}
              onClick={() => handleTemplateClick(key)}
              className="flex flex-col items-center justify-center p-4 
                         bg-gradient-to-br from-blue-50 to-indigo-50
                         border-2 border-blue-200 rounded-lg 
                         hover:border-blue-500 hover:shadow-lg hover:scale-105
                         transition-all duration-200 min-h-[120px]
                         md:p-6 md:min-h-[140px]
                         sm:p-3 sm:min-h-[100px]
                         group"
            >
              <div className="text-blue-500 mb-2 group-hover:scale-110 transition-transform">
                {React.cloneElement(template.icon, { 
                  size: window.innerWidth < 640 ? 20 : 28 
                })}
              </div>
              <span className="font-semibold text-center text-sm md:text-base sm:text-xs leading-tight">
                {template.name}
              </span>
              <span className="text-xs text-gray-500 mt-1 md:text-sm sm:text-xs">
                {template.width} × {template.height}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full md:w-auto px-6 py-3 bg-gray-200 rounded-lg 
                       hover:bg-gray-300 font-medium transition-colors
                       md:py-3 sm:py-2 sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplatesModal;
