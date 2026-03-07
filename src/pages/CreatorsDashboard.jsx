import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BarChart3,
    Layers,
    DollarSign,
    UploadCloud,
    ArrowLeft,
    MoreVertical,
    ExternalLink,
    ChevronRight,
    Search,
    TrendingUp,
    Users,
    Smartphone,
    Youtube,
    Maximize,
    X,
    FileText
} from 'lucide-react';
import { socialMediaTemplates } from '../utils/constants';

const CreatorsDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [customSize, setCustomSize] = useState({ width: 1080, height: 1080 });

    const sizePresets = Object.entries(socialMediaTemplates).map(([key, template]) => ({
        id: key,
        name: template.name,
        width: template.width,
        height: template.height,
        icon: template.icon,
        desc: `${template.width} x ${template.height} px`
    }));

    const handleStartDesign = (width, height) => {
        window.open(`/main?width=${width}&height=${height}&isCreatorMode=true`, '_blank');
        setShowSizeModal(false);
    };

    // Mock Analytics Data
    const stats = [
        { label: 'Total Uses', value: '12,450', change: '+12%', icon: <TrendingUp className="text-green-500" size={20} />, trend: 'up' },
        { label: 'Followers', value: '2,891', change: '+5%', icon: <Users className="text-blue-500" size={20} />, trend: 'up' },
        { label: 'Published Items', value: '24', change: '0%', icon: <Layers className="text-purple-500" size={20} />, trend: 'neutral' },
        { label: 'Est. Earnings', value: '$1,240.50', change: '+18%', icon: <DollarSign className="text-orange-500" size={20} />, trend: 'up' },
    ];

    const mockSubmissions = [
        { id: 1, title: 'Minimalist Instagram Story', status: 'Published', uses: '4.2k', rating: 4.8, date: '2024-02-15' },
        { id: 2, title: 'Modern Business Card', status: 'Published', uses: '1.1k', rating: 4.5, date: '2024-02-10' },
        { id: 3, title: 'Artistic Poster A2', status: 'Under Review', uses: '0', rating: 0, date: '2024-02-18' },
        { id: 4, title: 'Flat Design Logo Set', status: 'Published', uses: '890', rating: 4.9, date: '2024-01-25' },
    ];

    return (
        <div className="min-h-screen bg-[#f9fafb] flex">
            {/* Dashboard Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col py-8 px-4 h-screen sticky top-0">
                <div className="flex items-center gap-3 px-4 mb-10">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">C</span>
                    </div>
                    <span className="font-bold text-gray-900">Creator Hub</span>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { id: 'overview', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
                        { id: 'analytics', name: 'Detailed Analytics', icon: <BarChart3 size={20} /> },
                        { id: 'content', name: 'My Content', icon: <Layers size={20} /> },
                        { id: 'payments', name: 'Earning & Payments', icon: <DollarSign size={20} /> },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all
                                ${activeTab === item.id ? 'bg-purple-50 text-purple-600' : 'text-gray-500 hover:bg-gray-50'}
                            `}
                        >
                            {item.icon}
                            <span className="text-sm">{item.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto px-4 space-y-2">
                    <button
                        onClick={() => navigate('/creators/profile/my_profile')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 transition-all border border-purple-100"
                    >
                        <ExternalLink size={18} />
                        <span className="text-sm">View my Profile</span>
                    </button>
                    <button
                        onClick={() => navigate('/creators')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all border border-gray-100"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-sm">Back to Discovery</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:p-10 p-4">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900">Welcome back, Creator!</h2>
                        <p className="text-gray-500 font-medium">Your designs reached over 1,200 new users this week.</p>
                    </div>
                    <button
                        onClick={() => setShowSizeModal(true)}
                        className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-extrabold shadow-lg shadow-purple-100 transition-all active:scale-95"
                    >
                        <UploadCloud size={20} />
                        <span>Publish New Design</span>
                    </button>
                </header>

                {/* Size Selection Modal */}
                {showSizeModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">What are you creating?</h3>
                                    <p className="text-gray-500 font-medium">Select a size to start your master template.</p>
                                </div>
                                <button onClick={() => setShowSizeModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={24} /></button>
                            </div>

                            <div className="p-8">
                                <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                        {sizePresets.map(preset => (
                                            <button
                                                key={preset.id}
                                                onClick={() => handleStartDesign(preset.width, preset.height)}
                                                className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all text-left group"
                                            >
                                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform text-purple-600">
                                                    {preset.icon}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{preset.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold tracking-tight">{preset.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-2xl">
                                    <h4 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                                        <Maximize size={16} /> Custom Size
                                    </h4>
                                    <div className="flex gap-4 items-end">
                                        <div className="flex-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Width</label>
                                            <input
                                                type="number"
                                                value={customSize.width}
                                                onChange={(e) => setCustomSize({ ...customSize, width: e.target.value })}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none font-bold"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Height</label>
                                            <input
                                                type="number"
                                                value={customSize.height}
                                                onChange={(e) => setCustomSize({ ...customSize, height: e.target.value })}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none font-bold"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleStartDesign(customSize.width, customSize.height)}
                                            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-sm hover:bg-gray-800 transition-all"
                                        >
                                            Create
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    {stat.icon}
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                                    {stat.change}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-gray-400 mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Content Section Split */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Management Table */}
                    <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="font-extrabold text-gray-900 text-lg">My Submissions</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search submissions..."
                                    className="pl-9 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm focus:ring-2 focus:ring-purple-200 outline-none w-48"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Template Title</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Total Uses</th>
                                        <th className="px-6 py-4">Rating</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {mockSubmissions.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold">T</div>
                                                    <span className="font-bold text-gray-800 text-sm">{item.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded-full 
                                                    ${item.status === 'Published' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}
                                                `}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-600">{item.uses}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-600">⭐ {item.rating > 0 ? item.rating : 'N/A'}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-gray-400">{item.date}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-purple-600 shadow-sm border border-transparent hover:border-gray-100">
                                                        <ExternalLink size={16} />
                                                    </button>
                                                    <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-100">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button className="w-full py-4 text-sm font-bold text-purple-600 hover:bg-purple-50 transition-colors border-t border-gray-50">
                            View All Submissions
                        </button>
                    </div>

                    {/* Right Side Cards */}
                    <div className="space-y-8">
                        {/* Featured Tips */}
                        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-[32px] text-white overflow-hidden relative group">
                            <div className="relative z-10">
                                <h4 className="text-xl font-extrabold mb-4">Level up your designs</h4>
                                <p className="text-indigo-200 text-sm mb-6 leading-relaxed">Discover our new guide on "How to make templates that sell" and boost your monthly earnings by 20%.</p>
                                <button className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-extrabold text-sm hover:bg-indigo-50 transition-all flex items-center gap-2">
                                    Read Guide <ChevronRight size={16} />
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 opacity-10 group-hover:scale-110 transition-transform">
                                <BarChart3 size={150} />
                            </div>
                        </div>

                        {/* Recent Activity Mini */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h4 className="font-extrabold text-gray-900 mb-6">Recent Activity</h4>
                            <div className="space-y-6">
                                {[
                                    { title: 'Payment processed', time: '2 hours ago', icon: '💰' },
                                    { title: 'New review on Poster A2', time: '5 hours ago', icon: '📝' },
                                    { title: 'Review approved', time: '1 day ago', icon: '✅' },
                                ].map((act, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-lg">{act.icon}</div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{act.title}</p>
                                            <p className="text-xs text-gray-400 font-medium">{act.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreatorsDashboard;
