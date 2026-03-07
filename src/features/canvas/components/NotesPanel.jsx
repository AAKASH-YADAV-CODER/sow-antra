import React from 'react';
import { X } from 'lucide-react';

const NotesPanel = ({ isOpen, onClose, page, onUpdateNotes }) => {
    if (!isOpen) return null;

    const notes = page?.notes || '';
    const charCount = notes.length;

    return (
        <div className="absolute left-0 top-[64px] bottom-10 w-80 bg-white border-r border-gray-200 shadow-xl z-[1002] flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">
                        {page?.name || 'Page 1'} - Add page title
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={20} className="text-gray-500" />
                </button>
            </div>

            <div className="flex-1 p-4 flex flex-col bg-gray-50">
                <textarea
                    autoFocus
                    className="flex-1 bg-transparent outline-none resize-none text-gray-700 text-sm leading-relaxed placeholder:text-gray-400"
                    placeholder="Add notes to your design"
                    value={notes}
                    onChange={(e) => onUpdateNotes(e.target.value)}
                    maxLength={5000}
                />
                <div className="mt-4 flex justify-end">
                    <span className="text-xs text-gray-400 font-medium">
                        {charCount}/5000
                    </span>
                </div>
            </div>


        </div>
    );
};

export default NotesPanel;
