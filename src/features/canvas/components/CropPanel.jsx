import React from 'react';
import { X, Check } from 'lucide-react';

const CropPanel = ({ onClose, selectedElement, selectedElementData, updateElement }) => {
    if (!selectedElement || selectedElementData.type !== 'image') return null;

    const handleCrop = () => {
        // Implement actual crop logic here or toggle mode
        onClose();
    };

    return (
        <div className="absolute top-[64px] left-[72px] w-[320px] h-[calc(100vh-64px)] bg-white shadow-xl border-r border-gray-200 z-30 flex flex-col animate-slide-right">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <h2 className="font-bold text-gray-800">Crop Image</h2>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={20} className="text-gray-500" />
                </button>
            </div>

            <div className="p-6 flex flex-col items-center justify-center h-full text-center text-gray-500">
                <p className="mb-4">Crop functionality is currently active on the canvas.</p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-bold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCrop}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-bold flex items-center gap-2"
                    >
                        <Check size={16} />
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CropPanel;
