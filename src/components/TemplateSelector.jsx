import React from 'react';

const TemplateSelector = ({ showTemplates, socialMediaTemplates, applyTemplate }) => {
  if (!showTemplates) return null;

  return (
    <div className="bg-white shadow-sm p-3 border-b">
      <h3 className="font-semibold mb-2">Select Template</h3>
      <div className="template-grid">
        <button onClick={() => applyTemplate('custom')} className="template-button">
          <div className="mb-1">+</div>
          <div className="text-xs text-center">Custom Size</div>
          <div className="text-xs text-gray-500 mt-1">Create your own</div>
        </button>

        {Object.entries(socialMediaTemplates).map(([key, template]) => (
          <button key={key} onClick={() => applyTemplate(key)} className="template-button">
            <div className="mb-1">{template.icon}</div>
            <div className="text-xs text-center">{template.name}</div>
            <div className="text-xs text-gray-500 mt-1">{template.width}×{template.height}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
