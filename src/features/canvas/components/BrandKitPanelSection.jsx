import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Reusable section for Brand Kit items in sidebar panels
 * Supports titles, toggles, and grid/list layouts for brand assets
 */
const BrandKitPanelSection = ({
    title,
    isOpen,
    onToggle,
    children,
    badge
}) => {
    return (
        <div className="border-b border-gray-100 last:border-0 pb-4 mb-4">
            <div
                className="flex items-center justify-between py-2 cursor-pointer group"
                onClick={onToggle}
            >
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                        {title}
                    </h3>
                    {badge && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-purple-100 text-[#8b3dff] rounded font-bold uppercase tracking-wider">
                            {badge}
                        </span>
                    )}
                </div>
                <button className="text-gray-400 group-hover:text-gray-600 transition-colors">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            {isOpen && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {children}
                </div>
            )}
        </div>
    );
};

export default BrandKitPanelSection;
