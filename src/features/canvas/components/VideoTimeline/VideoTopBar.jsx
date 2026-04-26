import React from 'react';
import { 
  Home, 
  ChevronDown, 
  Cloud, 
  Crown, 
  Play, 
  Share2, 
  Undo2, 
  Redo2, 
  MoreHorizontal,
  BarChart2,
  MessageSquare as MessageSquareIcon
} from 'lucide-react';

const MessageSquare = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

export const VideoTopBar = () => {
  return (
    <div className="h-[56px] bg-white border-b border-gray-200 flex items-center justify-between px-4 text-black">
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
          <Home size={20} />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-md cursor-pointer transition-colors">
          <span className="text-sm font-medium">File</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-md cursor-pointer transition-colors">
          <span className="text-sm font-medium">Resize</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-md cursor-pointer transition-colors">
          <span className="text-sm font-medium">Editing</span>
          <ChevronDown size={14} />
        </div>
        <div className="h-4 w-[1px] bg-gray-200 mx-2" />
        <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
          <Undo2 size={18} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-md transition-colors opacity-50">
          <Redo2 size={18} />
        </button>
        <div className="h-4 w-[1px] bg-gray-200 mx-2" />
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Cloud size={14} />
          <span>All changes saved</span>
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <span className="text-sm font-medium truncate max-w-[300px]">The Art of Noticing General TikTok Video in Hook-driven Style</span>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-1.5 bg-[#8b3dff] hover:bg-[#7a35e0] rounded-md text-sm font-semibold transition-colors">
          <Crown size={14} />
          <span>Start your trial for ₹0</span>
        </button>
        <div className="flex items-center -space-x-2">
          <img src="https://picsum.photos/seed/user1/32/32" className="w-8 h-8 rounded-full border-2 border-white" alt="User" />
        </div>
        <div className="h-4 w-[1px] bg-gray-200 mx-1" />
        <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
          <BarChart2 size={18} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
          <MessageSquareIcon size={18} />
        </button>
        <button className="flex items-center gap-2 px-4 py-1.5 bg-black text-white hover:bg-gray-800 rounded-md text-sm font-semibold transition-colors">
          <Play size={14} fill="currentColor" />
          <span>Preview</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-1.5 bg-[#8b3dff] hover:bg-[#7a35e0] rounded-md text-sm font-semibold transition-colors">
          <Share2 size={14} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default VideoTopBar;
