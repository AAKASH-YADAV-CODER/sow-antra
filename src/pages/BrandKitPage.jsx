import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Palette,
    ChevronRight,
    Grid,
    List,
    Award,
    Trash2
} from 'lucide-react';
import CreateBrandKitModal from '../components/CreateBrandKitModal';

const BrandKitPage = () => {
    const navigate = useNavigate();
    const [brandKits, setBrandKits] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        const savedKits = localStorage.getItem('sowntra_brand_kits');
        if (savedKits) {
            setBrandKits(JSON.parse(savedKits));
        } else {
            // Mock initial data if empty
            const initialKits = [];
            setBrandKits(initialKits);
        }
    }, []);

    const handleDeleteKit = (e, kitId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this brand kit?')) {
            const updatedKits = brandKits.filter(k => k.id !== kitId);
            setBrandKits(updatedKits);
            localStorage.setItem('sowntra_brand_kits', JSON.stringify(updatedKits));
        }
    };

    const handleCreateKit = (name) => {
        const newKit = {
            id: Date.now().toString(),
            name,
            logos: [],
            colors: [],
            fonts: [],
            photos: [],
            graphics: [],
            icons: [],
            voice: '',
            lastModified: new Date().toISOString()
        };
        const updatedKits = [...brandKits, newKit];
        setBrandKits(updatedKits);
        localStorage.setItem('sowntra_brand_kits', JSON.stringify(updatedKits));
        navigate(`/brand-kit/${newKit.id}`);
    };

    return (
        <div className="min-h-screen bg-white text-[#0e1217]">
            {/* Header */}
            <header className="h-[72px] border-b border-gray-100 flex items-center px-6 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <button
                    onClick={() => navigate('/home')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-4"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold">Brand Kit</h1>
            </header>

            <main className="max-w-[1100px] mx-auto py-6 px-6">
                {/* Banner */}
                <div className="relative h-[180px] rounded-[24px] overflow-hidden mb-10 bg-gradient-to-br from-[#8b3dff] via-[#b682ff] to-[#6a11cb] shadow-xl shadow-purple-200/50">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[100px]" />
                        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[100px]" />
                    </div>

                    <div className="relative z-10 h-full flex flex-col justify-center px-10 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                <Award size={18} className="text-white" />
                            </div>
                            <span className="text-[10px] font-extrabold uppercase tracking-[.25em] opacity-80">Pro Feature</span>
                        </div>
                        <h2 className="text-3xl font-black mb-2 tracking-tight">Brand Kits</h2>
                        <p className="text-lg font-medium opacity-90 max-w-lg leading-relaxed">
                            Stay on brand every time. Save your logos, colors, and fonts for quick access in all your designs.
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-extrabold tracking-tight">Your Brand Kits</h3>
                        <div className="w-px h-6 bg-gray-200" />
                        <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#8b3dff]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Grid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#8b3dff]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <List size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-[#8b3dff] hover:bg-[#7a34e5] text-white px-5 h-10 rounded-lg font-extrabold flex items-center gap-2 transition-all shadow-md shadow-purple-100 active:scale-95 text-sm"
                        >
                            <Plus size={18} /> Add new
                        </button>
                    </div>
                </div>

                {/* Grid/List View */}
                {brandKits.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                            <Palette size={32} className="text-gray-300" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-800 mb-1">Build your brand identity</h4>
                        <p className="text-gray-400 mb-6 text-center max-w-xs font-medium text-sm">
                            Add your logos, brand colors, and fonts to keep your team's designs consistent and professional.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="text-[#8b3dff] font-extrabold flex items-center gap-2 hover:underline text-sm"
                        >
                            <Plus size={18} /> Create a brand kit
                        </button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" : "space-y-3"}>
                        {brandKits.map(kit => (
                            <div
                                key={kit.id}
                                onClick={() => navigate(`/brand-kit/${kit.id}`)}
                                className={`group cursor-pointer bg-white border border-gray-100 rounded-[24px] p-4 transition-all hover:shadow-xl hover:shadow-purple-100 hover:-translate-y-1 relative overflow-hidden ${viewMode === 'list' ? 'flex items-center justify-between py-3' : ''}`}
                            >
                                {/* Visual Preview (Abstract) */}
                                {viewMode === 'grid' && (
                                    <div className="h-32 bg-gray-50 rounded-xl mb-4 relative overflow-hidden group-hover:bg-purple-50 transition-colors">
                                        <div className="absolute inset-0 p-3 flex flex-wrap gap-1.5">
                                            {kit.colors && kit.colors.length > 0 ? kit.colors.slice(0, 4).map((col, idx) => (
                                                <div key={idx} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: col }} />
                                            )) : (
                                                <div className="flex gap-1.5">
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white shadow-sm" />
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white shadow-sm" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex-1">
                                    <h4 className="text-base font-black text-gray-800 group-hover:text-[#8b3dff] transition-colors">{kit.name}</h4>
                                    <p className="text-xs text-gray-400 font-bold mt-0.5">
                                        {kit.logos?.length || 0} logos • {kit.colors?.length || 0} colors
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => handleDeleteKit(e, kit.id)}
                                        className={`p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all ${viewMode === 'list' ? '' : 'absolute bottom-4 right-12 z-10'}`}
                                        title="Delete Brand Kit"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <div className={`p-1.5 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-[#8b3dff] group-hover:text-white transition-all ${viewMode === 'list' ? 'ml-0' : 'absolute bottom-4 right-4'}`}>
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            {showCreateModal && (
                <CreateBrandKitModal
                    onClose={() => setShowCreateModal(false)}
                    onConfirm={handleCreateKit}
                />
            )}
        </div>
    );
};

export default BrandKitPage;
