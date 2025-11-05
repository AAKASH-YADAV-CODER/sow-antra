import React from 'react';

const CustomTemplateModal = ({
  showCustomTemplateModal,
  setShowCustomTemplateModal,
  customTemplateSize,
  setCustomTemplateSize,
  createCustomTemplate
}) => {
  if (!showCustomTemplateModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Custom Template Size</h2>
          <button
            onClick={() => setShowCustomTemplateModal(false)}
            className="p-1 rounded hover:bg-gray-200"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Width</label>
              <input
                type="number"
                value={customTemplateSize.width}
                onChange={(e) => setCustomTemplateSize(prev => ({
                  ...prev,
                  width: parseInt(e.target.value) || 800
                }))}
                className="w-full p-2 border rounded"
                min="100"
                max="10000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select
                value={customTemplateSize.unit}
                onChange={(e) => setCustomTemplateSize(prev => ({
                  ...prev,
                  unit: e.target.value
                }))}
                className="w-full p-2 border rounded"
              >
                <option value="px">px</option>
                <option value="in">in</option>
                <option value="mm">mm</option>
                <option value="cm">cm</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Height</label>
              <input
                type="number"
                value={customTemplateSize.height}
                onChange={(e) => setCustomTemplateSize(prev => ({
                  ...prev,
                  height: parseInt(e.target.value) || 600
                }))}
                className="w-full p-2 border rounded"
                min="100"
                max="10000"
              />
            </div>
            <div />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowCustomTemplateModal(false)}
              className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={createCustomTemplate}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomTemplateModal;
