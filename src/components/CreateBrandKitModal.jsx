import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Award } from 'lucide-react';

const CreateBrandKitModal = ({ onClose, onConfirm }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onConfirm(name.trim());
            onClose();
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9000] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 pb-2 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-[#8b3dff]">
                            <Award size={16} />
                        </div>
                        <h3 className="text-xl font-black text-[#0e1217]">Create Brand Kit</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Name</label>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Name your Brand Kit"
                            className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-[#8b3dff] outline-none transition-all font-bold text-base"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <p className="text-xs text-gray-400 font-medium px-1 leading-relaxed">
                            Keep your designs consistent across teams.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-11 rounded-xl font-black text-gray-500 hover:bg-gray-100 transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="flex-1 h-11 bg-[#8b3dff] hover:bg-[#7a34e5] disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl font-black shadow-lg shadow-purple-50 transition-all active:scale-95 text-sm"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default CreateBrandKitModal;
