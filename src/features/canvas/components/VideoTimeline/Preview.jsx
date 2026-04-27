import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  RotateCw, 
  Maximize2, 
  MoreHorizontal,
  X,
  Type,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Layout,
  Upload,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Shapes
} from 'lucide-react';

export const Preview = ({ 
  currentTime, 
  previewImage, 
  previewVideo, 
  onImageChange,
  onVideoChange,
  selectedClip,
  activeClips,
  onTrimChange,
  onClipUpdate,
  onAddText,
  onAddClip,
  isLibraryOpen,
  onLibraryToggle
}) => {
  const [editingTextId, setEditingTextId] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const activeVideoClip = activeClips.find(c => c.type === 'video');
  const activeTextClips = activeClips.filter(c => c.type === 'text');
  const activeImageClips = activeClips.filter(c => c.type === 'image');
  const activeElementClips = activeClips.filter(c => c.type === 'element');

  // Sync video playback with timeline currentTime
  useEffect(() => {
    if (videoRef.current && activeVideoClip) {
      const clipOffset = currentTime - activeVideoClip.startTime;
      // Only seek if the difference is significant to avoid stuttering
      if (Math.abs(videoRef.current.currentTime - clipOffset) > 0.1) {
        videoRef.current.currentTime = clipOffset;
      }
    }
  }, [currentTime, activeVideoClip]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          if (isVideo) {
            onVideoChange(e.target.result);
          } else {
            onImageChange(e.target.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const libraryVideos = [
    "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-1282-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-sky-at-night-11206-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-ocean-11204-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-underwater-view-of-a-swimming-pool-11208-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-a-man-skateboarding-11209-large.mp4"
  ];

  const currentSrc = previewVideo || activeVideoClip?.src;
  const currentImage = previewImage || (!previewVideo && activeImageClips.length > 0 ? activeImageClips[0].src : (!previewVideo && activeVideoClip ? null : `https://picsum.photos/seed/${Math.floor(currentTime)}/1080/1920`));

  return (
    <div className="flex-1 bg-[#f8f9fa] flex flex-col relative overflow-hidden">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*,video/*" 
        className="hidden" 
      />
      
      {/* Canvas Header */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 text-black">
        <div className="flex items-center gap-4">
          {selectedClip?.type === 'text' ? (
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-md">
              <button 
                onClick={() => onClipUpdate(selectedClip.id, { bold: !selectedClip.bold })}
                className={`p-1.5 rounded transition-colors ${selectedClip.bold ? 'bg-white shadow-sm text-[#8b3dff]' : 'hover:bg-gray-200 text-gray-600'}`}
              >
                <Bold size={16} />
              </button>
              <button 
                onClick={() => onClipUpdate(selectedClip.id, { italic: !selectedClip.italic })}
                className={`p-1.5 rounded transition-colors ${selectedClip.italic ? 'bg-white shadow-sm text-[#8b3dff]' : 'hover:bg-gray-200 text-gray-600'}`}
              >
                <Italic size={16} />
              </button>
              <div className="w-[1px] h-4 bg-gray-300 mx-1" />
              <button 
                onClick={() => onClipUpdate(selectedClip.id, { alignment: 'left' })}
                className={`p-1.5 rounded transition-colors ${selectedClip.alignment === 'left' ? 'bg-white shadow-sm text-[#8b3dff]' : 'hover:bg-gray-200 text-gray-600'}`}
              >
                <AlignLeft size={16} />
              </button>
              <button 
                onClick={() => onClipUpdate(selectedClip.id, { alignment: 'center' })}
                className={`p-1.5 rounded transition-colors ${selectedClip.alignment === 'center' ? 'bg-white shadow-sm text-[#8b3dff]' : 'hover:bg-gray-200 text-gray-600'}`}
              >
                <AlignCenter size={16} />
              </button>
              <button 
                onClick={() => onClipUpdate(selectedClip.id, { alignment: 'right' })}
                className={`p-1.5 rounded transition-colors ${selectedClip.alignment === 'right' ? 'bg-white shadow-sm text-[#8b3dff]' : 'hover:bg-gray-200 text-gray-600'}`}
              >
                <AlignRight size={16} />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md text-xs font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                <Layout size={14} />
                <span>Position</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md text-xs font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                <RotateCcw size={14} />
                <span>Flip</span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleUploadClick}
            className="flex items-center gap-2 px-3 py-1 bg-[#8b3dff] rounded-md text-xs font-medium cursor-pointer hover:bg-[#7a35e0] text-white transition-colors"
          >
            <Upload size={14} />
            <span>Upload</span>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-8 relative bg-white">
        <div className="aspect-[9/16] h-full max-h-[600px] bg-black shadow-2xl relative group overflow-hidden rounded-sm">
          {currentSrc ? (
            <video 
              ref={videoRef}
              src={currentSrc} 
              className="w-full h-full object-cover opacity-90"
              autoPlay
              muted
              loop
            />
          ) : (
            <img 
              src={currentImage || ''} 
              alt="Preview" 
              className="w-full h-full object-cover opacity-90 transition-opacity duration-300" 
              referrerPolicy="no-referrer"
            />
          )}

          {/* Element Overlays */}
          {activeElementClips.map((clip) => (
            <div 
              key={clip.id}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <div className="w-32 h-32 bg-pink-500 rounded-lg flex items-center justify-center text-white/80 shadow-lg">
                <Shapes size={64} />
              </div>
            </div>
          ))}
          
          {/* Text Overlays */}
          {activeTextClips.map((clip) => (
            <div 
              key={clip.id}
              className={`absolute top-1/2 -translate-y-1/2 left-0 w-full px-4 cursor-text z-20`}
              style={{
                textAlign: clip.alignment || 'center',
                color: clip.textColor || '#ffffff',
                fontWeight: clip.bold ? 'bold' : 'normal',
                fontStyle: clip.italic ? 'italic' : 'normal',
                fontSize: clip.fontSize ? `${clip.fontSize}px` : '48px',
              }}
              onDoubleClick={() => setEditingTextId(clip.id)}
            >
              {editingTextId === clip.id ? (
                <textarea
                  autoFocus
                  className="bg-black/50 border-none outline-none w-full resize-none text-center p-2 rounded"
                  value={clip.content}
                  onChange={(e) => onClipUpdate(clip.id, { content: e.target.value })}
                  onBlur={() => setEditingTextId(null)}
                  rows={2}
                />
              ) : (
                <div className="drop-shadow-lg leading-tight">
                  {clip.content}
                </div>
              )}
            </div>
          ))}

          {/* Canvas Controls */}
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 gap-4">
            <button className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform">
              <Play size={32} fill="white" className="text-white ml-1" />
            </button>
            <div className="flex gap-2">
              <button 
                onClick={handleUploadClick}
                className="px-4 py-2 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Upload size={16} />
                Replace
              </button>
              <button 
                onClick={() => onLibraryToggle(true)}
                className="px-4 py-2 bg-black/50 backdrop-blur-md text-white border border-white/20 rounded-full text-sm font-bold hover:bg-black/70 transition-colors flex items-center gap-2"
              >
                <VideoIcon size={16} />
                Library
              </button>
            </div>
          </div>

          {/* Trimmer UI */}
          {selectedClip && (
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[10px] font-bold text-white/70 uppercase tracking-widest">
                  <span>Trim Clip</span>
                  <span>{selectedClip.duration.toFixed(1)}s</span>
                </div>
                <div className="h-8 bg-white/10 rounded-md relative border border-white/20 overflow-hidden">
                  {/* Clip Background */}
                  <div className="absolute inset-0 flex gap-1 p-1 opacity-30">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="flex-1 bg-white/20 rounded-sm" />
                    ))}
                  </div>
                  
                  {/* Trimmer Handles */}
                  <div className="absolute inset-0 flex">
                    <div 
                      className="w-2 h-full bg-[#8b3dff] cursor-ew-resize hover:bg-[#a366ff] transition-colors relative"
                      onMouseDown={(e) => {
                        const startX = e.clientX;
                        const startVal = selectedClip.startTime;
                        const startDur = selectedClip.duration;
                        
                        const handleMouseMove = (moveEvent) => {
                          const delta = (moveEvent.clientX - startX) / 20; // Scale factor
                          const newStart = Math.max(0, startVal + delta);
                          const newDur = Math.max(0.1, startDur - (newStart - startVal));
                          onTrimChange(selectedClip.id, newStart, newDur);
                        };
                        
                        const handleMouseUp = () => {
                          window.removeEventListener('mousemove', handleMouseMove);
                          window.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        window.addEventListener('mousemove', handleMouseMove);
                        window.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-3 bg-white/50 rounded-full" />
                    </div>
                    
                    <div className="flex-1" />
                    
                    <div 
                      className="w-2 h-full bg-[#8b3dff] cursor-ew-resize hover:bg-[#a366ff] transition-colors relative"
                      onMouseDown={(e) => {
                        const startX = e.clientX;
                        const startDur = selectedClip.duration;
                        
                        const handleMouseMove = (moveEvent) => {
                          const delta = (moveEvent.clientX - startX) / 20; // Scale factor
                          const newDur = Math.max(0.1, startDur + delta);
                          onTrimChange(selectedClip.id, selectedClip.startTime, newDur);
                        };
                        
                        const handleMouseUp = () => {
                          window.removeEventListener('mousemove', handleMouseMove);
                          window.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        window.addEventListener('mousemove', handleMouseMove);
                        window.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-3 bg-white/50 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Library Modal */}
        {isLibraryOpen && (
          <div className="absolute inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-8">
            <div className="bg-[#18191b] border border-[#252b33] rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-[#252b33] flex items-center justify-between">
                <h3 className="text-xl font-bold">Video Library</h3>
                <button 
                  onClick={() => onLibraryToggle(false)}
                  className="p-2 hover:bg-[#252b33] rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-3 gap-4">
                  {libraryVideos.map((videoUrl, i) => (
                    <div 
                      key={i}
                      className="aspect-[9/16] bg-[#252b33] rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#8b3dff] transition-all group relative"
                      onClick={() => {
                        onAddClip('track-1', 'video', videoUrl);
                        onLibraryToggle(false);
                      }}
                    >
                      <video 
                        src={videoUrl} 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                        muted
                        loop
                        onMouseOver={(e) => e.currentTarget.play()}
                        onMouseOut={(e) => e.currentTarget.pause()}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Toolbar */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white border border-gray-200 p-1.5 rounded-full shadow-2xl">
          <button 
            onClick={onAddText}
            className="p-2.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-black transition-all"
          >
            <Type size={20} />
          </button>
          <button 
            onClick={handleUploadClick}
            className="p-2.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-black transition-all"
          >
            <ImageIcon size={20} />
          </button>
          <button className="p-2.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-black transition-all">
            <VideoIcon size={20} />
          </button>
          <button className="p-2.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-black transition-all">
            <Music size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Preview;
