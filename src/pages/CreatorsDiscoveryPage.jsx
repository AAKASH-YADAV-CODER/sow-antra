import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, LayoutGrid, Heart, Eye, ArrowLeft, LayoutTemplate, Palette, Smartphone, Monitor } from 'lucide-react';
import { editableTemplates, templateCategories } from '../config/editableTemplates';

const CreatorsDiscoveryPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [likedTemplates, setLikedTemplates] = useState({});
    const [communityTemplates, setCommunityTemplates] = useState([]);

    React.useEffect(() => {
        // Load community templates from localStorage
        const stored = JSON.parse(localStorage.getItem('community_templates') || '[]');
        setCommunityTemplates(stored);
    }, []);

    // Merge static and community templates
    const allTemplates = [...communityTemplates, ...Object.values(editableTemplates)];

    const toggleLike = (id, e) => {
        e.stopPropagation();
        setLikedTemplates(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const trendingCreators = [
        { id: 'sarah_design', name: 'Sarah Ahmed', avatar: 'S', color: 'bg-pink-500' },
        { id: 'alex_ux', name: 'Alex Rivera', avatar: 'A', color: 'bg-blue-500' },
        { id: 'priya_creative', name: 'Priya K.', avatar: 'P', color: 'bg-green-500' },
        { id: 'mike_minimal', name: 'Mike Ross', avatar: 'M', color: 'bg-orange-500' },
    ];

    // Filter and Search Logic
    const filteredTemplates = allTemplates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (template.author && template.author.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = activeCategory === 'All' || template.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Discovery Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/home')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Creators Marketplace</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/creators/dashboard')}
                            className="px-4 py-2 bg-purple-50 text-purple-600 font-bold rounded-lg hover:bg-purple-100 transition-colors text-sm"
                        >
                            Creator Dashboard
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8">
                {/* Hero / Search Section */}
                <section className="mb-12 text-center py-10 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[32px] text-white overflow-hidden relative shadow-2xl shadow-purple-200">
                    <div className="relative z-10 px-4">
                        <h2 className="text-4xl font-extrabold mb-4">Discover community templates</h2>
                        <p className="text-purple-100 mb-8 max-w-xl mx-auto">Browse thousands of professional templates for your next project, created by the Sowntra community.</p>

                        <div className="relative max-w-2xl mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by style, category, or creator..."
                                className="w-full h-14 pl-12 pr-6 rounded-2xl text-gray-900 text-lg border-none focus:ring-4 focus:ring-purple-300 transition-all outline-none shadow-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    {/* Abstract shapes */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>
                </section>

                {/* Trending Creators */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-gray-900">Trending Creators</h3>
                        <button className="text-sm font-bold text-purple-600 hover:underline">View all</button>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                        {trendingCreators.map(creator => (
                            <div
                                key={creator.id}
                                onClick={() => navigate(`/creators/profile/${creator.id}`)}
                                className="flex flex-col items-center gap-3 group cursor-pointer"
                            >
                                <div className={`w-16 h-16 ${creator.color} rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                                    {creator.avatar}
                                </div>
                                <span className="text-xs font-black text-gray-800">{creator.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Filters / Categories */}
                <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar">
                    {templateCategories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all whitespace-nowrap border
                                ${activeCategory === cat.id
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-100'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600'}
                            `}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredTemplates.map(template => (
                        <div key={template.id} className="group cursor-pointer">
                            <div className="aspect-[4/5] bg-white rounded-2xl mb-4 overflow-hidden border border-gray-100 shadow-sm transition-all group-hover:shadow-xl group-hover:-translate-y-1 relative flex items-center justify-center">
                                {template.previewImage ? (
                                    <img
                                        src={template.previewImage}
                                        alt={template.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-4xl">{template.thumbnail || '🎨'}</div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => window.open(`/main?template=${template.id}`, '_blank')}
                                        className="bg-purple-600 text-white px-6 py-2 rounded-xl font-black transform translate-y-4 group-hover:translate-y-0 transition-all hover:bg-purple-700"
                                    >
                                        Use Template
                                    </button>
                                </div>
                                <div className="absolute top-3 right-3 flex flex-col gap-2">
                                    <button
                                        onClick={(e) => toggleLike(template.id, e)}
                                        className={`p-2 bg-white/90 backdrop-blur rounded-full shadow-sm transition-all hover:scale-110 active:scale-95
                                            ${likedTemplates[template.id] ? 'text-red-500' : 'text-gray-400'}
                                        `}
                                    >
                                        <Heart size={16} fill={likedTemplates[template.id] ? "currentColor" : "none"} />
                                    </button>
                                </div>
                            </div>
                            <div className="px-1">
                                <h3 className="font-bold text-gray-800 truncate mb-0.5">{template.name}</h3>
                                <p
                                    onClick={() => navigate(`/creators/profile/${template.authorId || 'community_designer'}`)}
                                    className="text-[10px] font-black text-purple-600 hover:underline mb-1 inline-block"
                                >
                                    {template.author ? `by ${template.author}` : 'by Sowntra Community'}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-bold tracking-tight">
                                        {template.category}
                                    </span>
                                    <div className="flex items-center gap-1 text-gray-400 text-[10px] font-black uppercase tracking-tighter">
                                        <Eye size={10} />
                                        {template.views || '0'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredTemplates.length === 0 && (
                    <div className="text-center py-20 flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4 text-3xl">🏜️</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">No templates found</h3>
                        <p className="text-gray-400">Try searching for something else or browse different categories.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CreatorsDiscoveryPage;
