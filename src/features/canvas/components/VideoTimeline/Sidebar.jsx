import React from 'react';
import { 
  LayoutTemplate, 
  Shapes, 
  Type, 
  CloudUpload, 
  Wrench, 
  FolderOpen, 
  LayoutGrid,
  Search,
  Video as VideoIcon,
  Image as ImageIcon,
  Music
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { id: 'design', icon: LayoutTemplate, label: 'Templates' },
  { id: 'video', icon: VideoIcon, label: 'Video' },
  { id: 'images', icon: ImageIcon, label: 'Images' }, 
  { id: 'audio', icon: Music, label: 'Audio' },
  { id: 'elements', icon: Shapes, label: 'Elements' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'uploads', icon: CloudUpload, label: 'Uploads' },
  { id: 'wrench', icon: Wrench, label: 'Tools' },
  { id: 'projects', icon: FolderOpen, label: 'Projects' },
  { id: 'apps', icon: LayoutGrid, label: 'Apps' },
];

export const Sidebar = ({ activeTab, onTabChange }) => {
  return (
    <div className="w-[72px] bg-white flex flex-col items-center py-4 gap-6 h-full border-r border-gray-200">
      {SIDEBAR_ITEMS.map((item, index) => (
        <button 
          key={index} 
          onClick={() => onTabChange(item.id)}
          className={`flex flex-col items-center gap-1 group transition-colors ${
            activeTab === item.id ? 'text-black' : 'text-gray-500 hover:text-black'
          }`}
        >
          <item.icon 
            size={24} 
            className={`transition-transform ${activeTab === item.label ? 'scale-110' : 'group-hover:scale-110'}`} 
          />
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
