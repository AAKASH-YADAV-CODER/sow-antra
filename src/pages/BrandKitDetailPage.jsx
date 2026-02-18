import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Edit2,
    Upload,
    MoreHorizontal,
    ChevronDown,
    ChevronUp,
    Image as ImageIcon,
    Palette,
    Type,
    Share2,
    Check,
    X,
    PlusCircle,
    Hash,
    MessageSquare,
    Camera,
    Shapes,
    Heart,
    Save,
    Search,
    CheckCircle2,
    Award
} from 'lucide-react';
import { fontFamilies } from '../utils/constants';

const BrandKitDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [kit, setKit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('logos');
    const [showFontPicker, setShowFontPicker] = useState(null); // { sectionIdx, fontStyleId }
    const [fontSearch, setFontSearch] = useState('');

    const fileInputRef = useRef(null);
    const uploadTypeRef = useRef(null); // 'logos', 'photos', 'graphics', 'icons'
    const colorInputRef = useRef(null);

    useEffect(() => {
        const savedKits = JSON.parse(localStorage.getItem('sowntra_brand_kits') || '[]');
        const currentKit = savedKits.find(k => k.id === id);
        if (currentKit) {
            setKit(currentKit);
        } else {
            navigate('/brand-kit');
        }
        setLoading(false);
    }, [id, navigate]);

    const updateKit = (updates) => {
        const savedKits = JSON.parse(localStorage.getItem('sowntra_brand_kits') || '[]');
        const updatedKits = savedKits.map(k => k.id === id ? { ...k, ...updates } : k);
        localStorage.setItem('sowntra_brand_kits', JSON.stringify(updatedKits));
        setKit({ ...kit, ...updates });
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this brand kit? This action cannot be undone.')) {
            const savedKits = JSON.parse(localStorage.getItem('sowntra_brand_kits') || '[]');
            const updatedKits = savedKits.filter(k => k.id !== id);
            localStorage.setItem('sowntra_brand_kits', JSON.stringify(updatedKits));
            navigate('/brand-kit');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        const type = uploadTypeRef.current;
        const isSvg = file.type === 'image/svg+xml' || file.name.endsWith('.svg');
        const isImage = file.type.startsWith('image/');

        if (type === 'graphics' && !isSvg) {
            alert('Graphics must be in SVG format.');
            return;
        }

        if (!isImage) {
            alert('File must be an image.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const url = event.target.result;
            const currentAssets = kit[type] || [];
            updateKit({ [type]: [...currentAssets, url] });

            // Navigate to main editor page after upload
            setTimeout(() => {
                navigate('/main');
            }, 500);
        };
        reader.readAsDataURL(file);

        // Reset input
        e.target.value = null;
    };

    const triggerUpload = (type) => {
        uploadTypeRef.current = type;
        fileInputRef.current.click();
    };

    const handleAddColor = (e) => {
        const color = e.target.value;
        if (color) {
            updateKit({ colors: [...(kit.colors || []), color] });
        }
    };

    const selectFont = (fontFamily) => {
        const { fontStyleId } = showFontPicker;
        const currentFonts = kit.fonts || [];
        const existingIdx = currentFonts.findIndex(f => f.id === fontStyleId);

        let updatedFonts;
        if (existingIdx >= 0) {
            updatedFonts = [...currentFonts];
            updatedFonts[existingIdx] = { ...updatedFonts[existingIdx], fontFamily };
        } else {
            updatedFonts = [...currentFonts, { id: fontStyleId, fontFamily }];
        }

        updateKit({ fonts: updatedFonts });
        setShowFontPicker(null);
        setFontSearch('');
    };

    if (loading || !kit) return null;

    const sidebarItems = [
        { id: 'logos', name: 'Logos', icon: <ImageIcon size={18} /> },
        { id: 'colors', name: 'Colors', icon: <Palette size={18} /> },
        { id: 'fonts', name: 'Fonts', icon: <Type size={18} /> },
        { id: 'voice', name: 'Brand voice', icon: <MessageSquare size={18} /> },
        { id: 'photos', name: 'Photos', icon: <Camera size={18} /> },
        { id: 'graphics', name: 'Graphics', icon: <Shapes size={18} /> },
        { id: 'icons', name: 'Icons', icon: <Heart size={18} /> },
    ];

    const fontStyles = [
        { id: 'title', name: 'Title' },
        { id: 'subtitle', name: 'Subtitle' },
        { id: 'heading', name: 'Heading' },
        { id: 'subheading', name: 'Subheading' },
        { id: 'section_header', name: 'Section header' },
        { id: 'body', name: 'Body' },
    ];

    const filteredFonts = fontFamilies.filter(f =>
        f.toLowerCase().includes(fontSearch.toLowerCase())
    ); // Show all 500+ as requested, scroll management handles it

    return (
        <div className="flex min-h-screen bg-white text-[#0e1217]">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*"
            />

            {/* Position color input absolutely near the trigger to help browser anchoring */}
            <input
                type="color"
                ref={colorInputRef}
                onChange={handleAddColor}
                className="opacity-0 pointer-events-none absolute w-0 h-0"
                style={{ left: '50%', top: '50%' }}
            />

            {/* Sidebar - Refined width */}
            <aside className="w-[260px] border-r border-gray-100 flex flex-col py-6 sticky top-0 h-screen bg-gray-50/20">
                <div className="px-5 mb-8">
                    <Link to="/brand-kit" className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-900 transition-colors text-xs mb-6 group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Brand Kits
                    </Link>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-[#8b3dff]">
                            <Award size={16} />
                        </div>
                        <h3 className="font-extrabold text-sm text-gray-900 truncate">{kit.name}</h3>
                    </div>
                </div>

                <nav className="flex-1 px-2 space-y-0.5">
                    {sidebarItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveSection(item.id);
                                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all
                ${activeSection === item.id ? 'bg-purple-50 text-[#8b3dff]' : 'text-gray-500 hover:bg-gray-100/50 hover:text-gray-900'}
              `}
                        >
                            <span className={activeSection === item.id ? 'text-[#8b3dff]' : 'text-gray-400'}>{item.icon}</span>
                            <span className="text-xs">{item.name}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content - Refined padding */}
            <main className="flex-1 p-10 overflow-y-auto">
                <div className="max-w-[900px] mx-auto">
                    {/* Top Bar - Refined sizes */}
                    <div className="flex justify-between items-center mb-12">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black tracking-tight">{kit.name}</h2>
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"><Edit2 size={16} /></button>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-1.5 mr-3">
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-white font-bold text-[10px] shadow-sm">WD</div>
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center text-[#8b3dff] font-bold text-[10px] shadow-sm"><Plus size={12} /></div>
                            </div>
                            <button className="h-9 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-xs transition-all">Share</button>
                            <button
                                onClick={handleDelete}
                                className="p-2 bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                                title="Delete Brand Kit"
                            >
                                <Trash2 size={18} />
                            </button>
                            <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"><MoreHorizontal size={18} /></button>
                        </div>
                    </div>

                    <div className="space-y-16 pb-24">
                        {/* Logos Section */}
                        <section id="logos" className="space-y-4 scroll-mt-12">
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <ChevronDown size={20} className="text-gray-400" />
                                    <h3 className="text-lg font-black text-gray-900">Logos</h3>
                                </div>
                                <button
                                    onClick={() => triggerUpload('logos')}
                                    className="flex items-center gap-1.5 px-3 h-8 bg-gray-50 hover:bg-purple-100 hover:text-[#8b3dff] text-gray-600 rounded-lg font-bold text-xs transition-all"
                                >
                                    <Plus size={16} /> Add new
                                </button>
                            </div>

                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {(kit.logos || []).map((logo, idx) => (
                                    <div key={idx} className="aspect-square bg-white rounded-2xl p-4 relative group border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-center">
                                        <img src={logo} alt="Brand Logo" className="w-full h-full object-contain" />
                                        <button
                                            onClick={() => updateKit({ logos: kit.logos.filter((_, i) => i !== idx) })}
                                            className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-lg opacity-0 group-hover:opacity-100 shadow-sm transition-all hover:bg-red-50 border border-gray-100"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                                <div
                                    onClick={() => triggerUpload('logos')}
                                    className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-1.5 group hover:bg-white hover:border-purple-300 transition-all cursor-pointer"
                                >
                                    <Upload size={20} className="text-gray-300 group-hover:text-[#8b3dff]" />
                                    <span className="text-[8px] font-black uppercase text-gray-400 group-hover:text-[#8b3dff]">PNG, SVG</span>
                                </div>
                            </div>
                        </section>

                        {/* Colors Section */}
                        <section id="colors" className="space-y-4 scroll-mt-12">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <ChevronDown size={20} className="text-gray-400" />
                                    <h3 className="text-lg font-black text-gray-900">Colors ({(kit.colors || []).length})</h3>
                                </div>
                                <button
                                    onClick={() => colorInputRef.current.click()}
                                    className="flex items-center gap-1.5 px-3 h-8 bg-gray-50 hover:bg-purple-100 hover:text-[#8b3dff] text-gray-600 rounded-lg font-bold text-xs transition-all"
                                >
                                    <Plus size={16} /> Add new
                                </button>
                            </div>

                            <div className="bg-gray-50 border border-gray-100 rounded-[24px] p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-gray-600 text-xs">Main Palette</span>
                                        <Edit2 size={12} className="text-gray-400 cursor-pointer hover:text-gray-900" />
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-900"><MoreHorizontal size={16} /></button>
                                </div>

                                <div className="flex flex-wrap gap-6">
                                    {(kit.colors || []).map((color, idx) => (
                                        <div key={idx} className="flex flex-col items-center gap-2 group">
                                            <div
                                                className="w-16 h-16 rounded-full border-4 border-white shadow-lg relative cursor-pointer group-hover:scale-110 transition-transform flex items-center justify-center"
                                                style={{ backgroundColor: color }}
                                            >
                                                <button
                                                    onClick={() => updateKit({ colors: kit.colors.filter((_, i) => i !== idx) })}
                                                    className="absolute -top-1 -right-1 p-1.5 bg-white text-red-500 rounded-full opacity-0 group-hover:opacity-100 shadow-lg transition-all hover:scale-110 border border-gray-100"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                            <span className="font-black text-[9px] text-gray-400 tracking-wider uppercase">{color}</span>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => colorInputRef.current.click()}
                                        className="flex flex-col items-center gap-2 group"
                                    >
                                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 bg-white flex items-center justify-center text-gray-300 group-hover:border-[#8b3dff] group-hover:text-[#8b3dff] transition-all group-hover:scale-110">
                                            <Plus size={24} />
                                        </div>
                                        <span className="font-bold text-[9px] text-gray-400 tracking-wider">ADD</span>
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Fonts Section */}
                        <section id="fonts" className="space-y-4 scroll-mt-12">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <ChevronDown size={20} className="text-gray-400" />
                                    <h3 className="text-lg font-black text-gray-900">Fonts</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-0.5">
                                {fontStyles.map(style => {
                                    const fontData = (kit.fonts || []).find(f => f.id === style.id);
                                    const fontFamily = fontData?.fontFamily || 'Default Font';

                                    return (
                                        <div key={style.id} className="group relative flex items-center justify-between p-6 bg-white hover:bg-gray-50 border-y border-gray-50 transition-all">
                                            <div className="flex-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">{style.name}</span>
                                                <span
                                                    className="text-xl font-bold text-gray-900 transition-colors"
                                                    style={{ fontFamily: fontFamily }}
                                                >
                                                    {fontFamily}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => setShowFontPicker({ fontStyleId: style.id })}
                                                    className="flex items-center gap-2 px-4 h-9 bg-white rounded-lg font-black text-xs text-[#8b3dff] shadow-sm hover:shadow-md border border-gray-100 transition-all active:scale-95"
                                                >
                                                    Choose Font
                                                </button>
                                                <button className="p-2.5 bg-white hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg shadow-sm border border-gray-100 transition-all"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Brand Voice Section */}
                        <section id="voice" className="space-y-4 scroll-mt-12">
                            <div className="flex items-center gap-2 cursor-pointer">
                                <ChevronDown size={20} className="text-gray-400" />
                                <h3 className="text-lg font-black text-gray-900">Brand voice</h3>
                            </div>

                            <div className="bg-gray-50 border border-gray-100 rounded-[24px] p-8">
                                <p className="text-gray-400 font-bold mb-6 text-sm">
                                    Describe your brand's personality and tone.
                                </p>
                                <textarea
                                    className="w-full h-32 p-6 rounded-2xl bg-white border border-gray-200 outline-none focus:ring-4 focus:ring-purple-100 focus:border-[#8b3dff] transition-all font-bold text-sm text-gray-700 resize-none"
                                    placeholder="E.g. Friendly, professional, and helpful."
                                    value={kit.voice || ''}
                                    onChange={(e) => updateKit({ voice: e.target.value })}
                                />
                            </div>
                        </section>

                        {/* Photos, Graphics, Icons Section Generic Handler */}
                        {[
                            { id: 'photos', name: 'Photos' },
                            { id: 'graphics', name: 'Graphics', format: 'SVG ONLY' },
                            { id: 'icons', name: 'Icons' }
                        ].map(section => (
                            <section key={section.id} id={section.id} className="space-y-4 scroll-mt-12">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 cursor-pointer">
                                        <ChevronDown size={20} className="text-gray-400" />
                                        <h3 className="text-lg font-black text-gray-900">{section.name}</h3>
                                    </div>
                                    <button
                                        onClick={() => triggerUpload(section.id)}
                                        className="flex items-center gap-1.5 px-3 h-8 bg-gray-50 hover:bg-purple-100 hover:text-[#8b3dff] text-gray-600 rounded-lg font-bold text-xs transition-all"
                                    >
                                        <Plus size={16} /> Add new
                                    </button>
                                </div>

                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {(kit[section.id] || []).map((asset, idx) => (
                                        <div key={idx} className="aspect-square bg-gray-50 rounded-2xl p-4 relative group flex items-center justify-center border border-gray-100 transition-all hover:bg-white hover:shadow-lg">
                                            <img src={asset} alt={section.name} className="max-w-full max-h-full object-contain" />
                                            <button
                                                onClick={() => updateKit({ [section.id]: kit[section.id].filter((_, i) => i !== idx) })}
                                                className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-lg opacity-0 group-hover:opacity-100 shadow-sm transition-all hover:bg-red-50 border border-gray-100"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <div
                                        onClick={() => triggerUpload(section.id)}
                                        className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 group hover:bg-white hover:border-[#8b3dff] transition-all cursor-pointer"
                                    >
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-200 group-hover:text-[#8b3dff] shadow-sm transition-all">
                                            <Upload size={20} />
                                        </div>
                                        <span className="font-black text-gray-400 group-hover:text-gray-600 text-[8px] uppercase tracking-widest">{section.format || 'Upload'}</span>
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </main>

            {/* Font Picker Modal - Refined Size */}
            {showFontPicker && createPortal(
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9000] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200 h-[70vh] flex flex-col">
                        <div className="p-6 pb-4 flex justify-between items-center border-b border-gray-50">
                            <div>
                                <h3 className="text-xl font-black text-[#0e1217]">Choose Font</h3>
                                <p className="text-gray-400 font-bold mt-0.5 uppercase text-[9px] tracking-widest">500+ Google Fonts</p>
                            </div>
                            <button
                                onClick={() => setShowFontPicker(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 pt-4 flex-1 flex flex-col gap-4 overflow-hidden">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Search fonts..."
                                    className="w-full h-12 pl-12 pr-6 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-purple-100 focus:border-[#8b3dff] transition-all font-bold text-sm"
                                    value={fontSearch}
                                    onChange={(e) => setFontSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 light-scrollbar space-y-1">
                                {filteredFonts.map(font => {
                                    // Dynamically load font on render if not already present
                                    const fontLink = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, '+')}&display=swap`;
                                    return (
                                        <button
                                            key={font}
                                            onClick={() => selectFont(font)}
                                            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-purple-50 transition-all text-left group"
                                        >
                                            <link rel="stylesheet" href={fontLink} />
                                            <span className="text-lg" style={{ fontFamily: font }}>{font}</span>
                                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#8b3dff] opacity-0 group-hover:opacity-100 shadow-sm transition-all">
                                                <CheckCircle2 size={18} />
                                            </div>
                                        </button>
                                    );
                                })}
                                {filteredFonts.length === 0 && (
                                    <div className="py-10 text-center text-gray-400 font-bold text-sm">No fonts found</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default BrandKitDetailPage;
