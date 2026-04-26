import React, { useState, useEffect, memo, useMemo } from 'react';
import { 
    Smartphone, 
    Monitor, 
    Laptop, 
    Tablet, 
    Coffee, 
    Image as ImageIcon,
    Check,
    Search,
    ChevronRight,
    Loader2,
    LayoutTemplate
} from 'lucide-react';

const MOCKUP_TEMPLATES = [
    {
        id: 'iphone_15_front',
        name: 'iPhone 15 Pro (Front)',
        category: 'Phone',
        overlay: '/mockups/iphone_front.png',
        screen: { x: 0.075, y: 0.045, width: 0.85, height: 0.91, rx: 45 },
        bgColor: '#ffffff'
    },
    {
        id: 'macbook_air_front',
        name: 'MacBook Air (Front)',
        category: 'Laptop',
        overlay: '/mockups/macbook_front.png',
        screen: { x: 0.12, y: 0.08, width: 0.76, height: 0.53, rx: 6 },
        bgColor: '#ffffff'
    },
    {
        id: 'imac_24_front',
        name: 'iMac 24" (Front)',
        category: 'Monitor',
        overlay: '/mockups/imac_front.png',
        screen: { x: 0.057, y: 0.05, width: 0.886, height: 0.65, rx: 10 },
        bgColor: '#ffffff'
    },
    {
        id: 'ipad_pro_front',
        name: 'iPad Pro (Front)',
        category: 'Tablet',
        overlay: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
        screen: { x: 0.06, y: 0.06, width: 0.88, height: 0.88, rx: 20 },
        bgColor: '#2d2d2d'
    },
    {
        id: 'coffee_mug',
        name: 'Ceramic Mug',
        category: 'Other',
        overlay: 'https://images.unsplash.com/photo-1517254456976-ee8682099819?w=800&q=80',
        screen: { x: 0.3, y: 0.25, width: 0.4, height: 0.5, rx: 10, rotate: 2 },
        bgColor: '#ffffff'
    },
    {
        id: 'responsive_bundle_front',
        name: 'Ultimate Responsive Bundle',
        category: 'Responsive',
        overlay: '/mockups/responsive_bundle_front.png',
        screens: [
            { id: 'imac', x: 0.28, y: 0.08, width: 0.44, height: 0.48, rx: 8 },  // Center iMac
            { id: 'laptop', x: 0.06, y: 0.48, width: 0.32, height: 0.38, rx: 4 }, // Left Laptop
            { id: 'phone', x: 0.82, y: 0.62, width: 0.1, height: 0.28, rx: 18 }   // Right iPhone
        ],
        bgColor: '#f8f9fa'
    }
];

const CATEGORIES = [
    { id: 'All', icon: LayoutTemplate },
    { id: 'Responsive', icon: Monitor },
    { id: 'Phone', icon: Smartphone },
    { id: 'Laptop', icon: Laptop },
    { id: 'Monitor', icon: Monitor },
    { id: 'Tablet', icon: Tablet },
    { id: 'Other', icon: Coffee },
];

export const SmartMockupPanel = memo(({ isOpen, onClose, addElement, selectedElementData }) => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    
    // Auto-detect selected image (Avoid using mockups as source to prevent feedback loop)
    useEffect(() => {
        if (selectedElementData?.type === 'image' && 
            selectedElementData?.src && 
            !selectedElementData.isMockup && 
            !selectedElementData.name?.toLowerCase().includes('mockup')) {
            setPreviewImage(selectedElementData.src);
        }
    }, [selectedElementData]);

    const filteredMockups = useMemo(() => {
        return MOCKUP_TEMPLATES.filter(m => {
            const matchesCategory = activeCategory === 'All' || m.category === activeCategory;
            const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchQuery]);

    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            // Don't use anonymous CORS for data URLs (base64)
            if (!src.startsWith('data:')) {
                img.crossOrigin = "anonymous";
            }
            
            const timeout = setTimeout(() => {
                img.src = ""; // Stop loading
                reject(new Error('Timeout'));
            }, 15000);

            img.onload = () => {
                clearTimeout(timeout);
                resolve(img);
            };
            img.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('Failed'));
            };
            img.src = src;
        });
    };

    const generateMockup = async (template) => {
        if (!previewImage) {
            alert('Please select or upload an image first!');
            return;
        }

        setIsGenerating(true);
        
        try {
            // Load both images
            const overlayImg = await loadImage(template.overlay).catch(e => {
                console.error("Overlay failed", e);
                throw new Error("Could not load mockup frame. Please try another one.");
            });

            const userImg = await loadImage(previewImage).catch(e => {
                console.error("User image failed", e);
                throw new Error("Could not load your image. Try uploading a different file.");
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = 1200;
            canvas.height = 1200;

            // Draw sequence
            // 1. Background
            ctx.fillStyle = template.bgColor || '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Overlay Frame (Now drawn BEFORE the user image since we use solid JPEGs)
            ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);

            // 3. User Images (Drawn ON TOP of the frame's screen area)
            const screens = template.screens || (template.screen ? [template.screen] : []);

            for (const screenProps of screens) {
                const { x, y, width: sw, height: sh, rx = 0, rotate = 0 } = screenProps;
                const screenX = x * canvas.width;
                const screenY = y * canvas.height;
                const screenW = sw * canvas.width;
                const screenH = sh * canvas.height;

                ctx.save();
                ctx.translate(screenX + screenW/2, screenY + screenH/2);
                if (rotate) ctx.rotate((rotate * Math.PI) / 180);
                
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(-screenW/2, -screenH/2, screenW, screenH, rx * (canvas.width/800));
                } else {
                    ctx.rect(-screenW/2, -screenH/2, screenW, screenH);
                }
                ctx.clip();

                const imgAspect = userImg.width / userImg.height;
                const screenAspect = screenW / screenH;
                
                let drawW, drawH;
                if (imgAspect > screenAspect) {
                    drawH = screenH;
                    drawW = screenH * imgAspect;
                } else {
                    drawW = screenW;
                    drawH = screenW / imgAspect;
                }
                
                ctx.drawImage(userImg, -drawW/2, -drawH/2, drawW, drawH);
                ctx.restore();
            }

            // Finish
            try {
                const finalDataUrl = canvas.toDataURL('image/png');
                addElement('image', {
                    src: finalDataUrl,
                    name: `${template.name} Mockup`,
                    isMockup: true, // Mark as mockup
                    width: 400,
                    height: 400
                });
            } catch (e) {
                console.error("Canvas Tainted", e);
                throw new Error("Security error: This image cannot be used in a mockup due to cross-origin restrictions.");
            }

        } catch (error) {
            console.error('Mockup Error:', error);
            alert(error.message || 'Something went wrong while generating the mockup.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="w-full h-full bg-white flex flex-col font-sans transition-all animate-in slide-in-from-right duration-300">
            {/* Header Area */}
            <div className="p-5 bg-gradient-to-br from-[#8b3dff] to-[#5e17eb] text-white shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-black tracking-tight">Smartmockups</h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                        <ChevronRight className="rotate-180" size={24} />
                    </button>
                </div>
                
                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white" size={16} />
                    <input 
                        type="text"
                        placeholder="Search devices..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/10 hover:bg-white/20 focus:bg-white/25 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder:text-white/50 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Category Navigation */}
            <div className="flex gap-2 p-4 overflow-x-auto light-scrollbar shrink-0 border-b border-gray-100">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeCategory === cat.id ? 'bg-[#8b3dff] text-white shadow-lg shadow-purple-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                        <cat.icon size={14} />
                        {cat.id}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-5 light-scrollbar space-y-6">
                
                {/* Content Source Selection */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-dashed border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Content Source</span>
                        {previewImage ? (
                            <button 
                                onClick={() => setPreviewImage(null)}
                                className="text-[10px] font-bold text-red-500 hover:underline transition-all"
                            >
                                Clear
                            </button>
                        ) : (
                            <span className="text-[10px] font-bold text-blue-500 animate-pulse">Select an image or upload</span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div 
                            onClick={() => document.getElementById('mockup-upload').click()}
                            className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm cursor-pointer hover:border-blue-400 group transition-all"
                        >
                            {previewImage ? (
                                <img src={previewImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Source" />
                            ) : (
                                <div className="text-gray-300 group-hover:text-blue-400 flex flex-col items-center">
                                    <ImageIcon size={20} />
                                    <span className="text-[8px] mt-1 font-bold">UPLOAD</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-gray-800">
                                {selectedElementData?.type === 'image' && previewImage === selectedElementData.src 
                                    ? (selectedElementData.name || 'Selected Canvas Image')
                                    : (previewImage ? 'Uploaded Content' : 'No Source Selected')}
                            </p>
                            <button 
                                onClick={() => document.getElementById('mockup-upload').click()}
                                className="text-[10px] text-blue-600 font-bold mt-1.5 px-2 py-1 bg-blue-50 rounded-md hover:bg-blue-100 transition-all"
                            >
                                Upload new image
                            </button>
                            <input 
                                id="mockup-upload"
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (re) => setPreviewImage(re.target.result);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="hidden"
                            />
                        </div>
                        {previewImage && <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white"><Check size={14} /></div>}
                    </div>
                </div>

                {/* Mockup Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-gray-800 tracking-tight">Tap to Generate</h3>
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-bold uppercase">{activeCategory}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        {filteredMockups.map(template => (
                            <div 
                                key={template.id}
                                onClick={() => !isGenerating && generateMockup(template)}
                                className={`group relative bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:border-[#8b3dff] hover:shadow-xl transition-all ${isGenerating ? 'opacity-50 grayscale' : ''}`}
                            >
                                 {/* Live Preview Strategy: Place frame first, then user content on top */}
                                <div className="w-full aspect-square relative bg-white flex items-center justify-center overflow-hidden">
                                    {/* Mockup Frame Base */}
                                    <img 
                                        src={template.overlay} 
                                        alt={template.name} 
                                        className="w-full h-full object-cover relative z-0 group-hover:scale-110 transition-all duration-500" 
                                    />

                                     {/* User Content Live Preview (Drawn on top) */}
                                    {previewImage && (template.screens || [template.screen]).map((s, idx) => (
                                        <div 
                                            key={s.id || idx}
                                            className="absolute pointer-events-none z-10"
                                            style={{
                                                top: `${s.y * 100}%`,
                                                left: `${s.x * 100}%`,
                                                width: `${s.width * 100}%`,
                                                height: `${s.height * 100}%`,
                                                borderRadius: `${s.rx / 2}px`,
                                                overflow: 'hidden',
                                                transform: s.rotate ? `rotate(${s.rotate}deg)` : 'none'
                                            }}
                                        >
                                            <img src={previewImage} alt="preview" className="w-full h-full object-cover animate-in fade-in duration-500" />
                                        </div>
                                    ))}
                                    
                                    {/* Glass Reflect Simulation */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent z-20 pointer-events-none" />
                                </div>
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                    <p className="text-white text-[10px] font-black">{template.name}</p>
                                    <p className="text-white/60 text-[8px] uppercase tracking-widest font-bold">Use Template</p>
                                </div>
                                <div className="absolute top-2 right-2 bg-[#8b3dff] px-2 py-0.5 rounded text-[8px] font-black text-white z-30 shadow-sm border border-white/20">MOCKUP</div>
                            </div>
                        ))}
                    </div>

                    {filteredMockups.length === 0 && (
                        <div className="py-16 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-gray-200" size={32} />
                            </div>
                            <p className="text-sm font-bold text-gray-800">No mockups found</p>
                            <p className="text-xs text-gray-400 mt-1">Try searching for something else</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Status */}
            {isGenerating && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center">
                        <Loader2 className="text-[#8b3dff] animate-spin mb-4" size={40} />
                        <p className="text-sm font-black text-gray-800 tracking-tight">Generating Mockup</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Applying perspective...</p>
                    </div>
                </div>
            )}
        </div>
    );
});
