import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Share2,
    Heart,
    Users,
    Layers,
    Globe,
    Twitter,
    Instagram,
    Eye,
    CheckCircle2,
    Edit,
    X,
    Save,
    Camera
} from 'lucide-react';
import { editableTemplates } from '../config/editableTemplates';
import { useAuth } from '../contexts/AuthContext';

const CreatorProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // Ownership Check
    const isOwnProfile = currentUser?.uid === id || id === 'my_profile';
    const profileId = id === 'my_profile' ? currentUser?.uid : id;

    const [isFollowing, setIsFollowing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: currentUser?.displayName || 'Creative Designer',
        handle: `@${currentUser?.email?.split('@')[0] || 'creator'}`,
        bio: 'Passionate UI/UX designer and template creator. I love building minimalist and modern designs that help businesses grow.',
        followers: '0',
        following: '0',
        totalUses: '0',
        verified: false,
        website: '',
        joined: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        twitter: '',
        instagram: '',
        profilePicture: null,
        backgroundPicture: null
    });

    const [creatorTemplates, setCreatorTemplates] = useState([]);

    useEffect(() => {
        // Load Profile Data from localStorage
        const allProfiles = JSON.parse(localStorage.getItem('creator_profiles') || '{}');
        const targetId = profileId || 'community_designer';

        if (allProfiles[targetId]) {
            setProfileData(prev => ({ ...prev, ...allProfiles[targetId] }));
        } else if (isOwnProfile && currentUser) {
            // Default for new user profile
            const newData = {
                ...profileData,
                name: currentUser.displayName || profileData.name,
                handle: `@${currentUser.email?.split('@')[0] || 'creator'}`,
            };
            setProfileData(newData);
        }

        // Load Templates
        const community = JSON.parse(localStorage.getItem('community_templates') || '[]');

        // Filter by authorId OR author name (fallback for legacy templates)
        const filtered = community.filter(t => {
            if (t.authorId === targetId) return true;
            // Legacy fallback: If no authorId, check if author name matches
            if (!t.authorId && t.author === profileData.name) return true;
            return false;
        });

        // Fallback to static templates if none found (for demo creators)
        if (filtered.length === 0 && !isOwnProfile) {
            setCreatorTemplates(Object.values(editableTemplates).slice(0, 8));
        } else {
            setCreatorTemplates(filtered);
        }
    }, [profileId, isOwnProfile, currentUser, profileData]);

    const handleSaveProfile = () => {
        const allProfiles = JSON.parse(localStorage.getItem('creator_profiles') || '{}');
        allProfiles[profileId] = profileData;
        localStorage.setItem('creator_profiles', JSON.stringify(allProfiles));
        setIsEditing(false);
    };

    const handleImageUpload = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (limit to 2MB for localStorage safety)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image is too large. Please select an image smaller than 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileData(prev => ({
                ...prev,
                [type]: reader.result
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = (type) => {
        setProfileData(prev => ({
            ...prev,
            [type]: null
        }));
    };

    const handleFollow = () => {
        const newFollowing = !isFollowing;
        setIsFollowing(newFollowing);

        // Update counts in profileData and localStorage
        const updatedProfile = {
            ...profileData,
            followers: String(parseInt(profileData.followers || '0') + (newFollowing ? 1 : -1))
        };
        setProfileData(updatedProfile);

        const allProfiles = JSON.parse(localStorage.getItem('creator_profiles') || '{}');
        allProfiles[profileId] = updatedProfile;
        localStorage.setItem('creator_profiles', JSON.stringify(allProfiles));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Nav Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => navigate('/creators')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        {isOwnProfile && (
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-bold text-sm hover:bg-purple-100 transition-all"
                            >
                                {isEditing ? <X size={18} /> : <Edit size={18} />}
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        )}
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-8">
                {/* Profile Branding Section */}
                <section className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm mb-10">
                    <div className="h-48 relative group">
                        {profileData.backgroundPicture ? (
                            <img
                                src={profileData.backgroundPicture}
                                alt="Background"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500">
                                <div className="absolute inset-0 opacity-20 pattern-dots"></div>
                            </div>
                        )}

                        {isEditing && (
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex flex-col items-center gap-2 text-white">
                                    <Camera size={24} />
                                    <span className="text-xs font-black uppercase tracking-widest">Change Banner</span>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'backgroundPicture')}
                                />
                            </label>
                        )}

                        {isEditing && profileData.backgroundPicture && (
                            <button
                                onClick={() => handleRemoveImage('backgroundPicture')}
                                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-all"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="px-10 pb-10 relative">
                        <div className="relative -mt-16 mb-6 inline-block group">
                            <div className="w-32 h-32 bg-white rounded-3xl p-1.5 shadow-xl relative overflow-hidden">
                                {profileData.profilePicture ? (
                                    <img
                                        src={profileData.profilePicture}
                                        alt="Profile"
                                        className="w-full h-full object-cover rounded-2xl"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-4xl font-black">
                                        {(profileData.name || 'C').charAt(0)}
                                    </div>
                                )}

                                {isEditing && (
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={20} className="text-white" />
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'profilePicture')}
                                        />
                                    </label>
                                )}
                            </div>

                            {profileData.verified && (
                                <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 text-blue-500 shadow-md z-10">
                                    <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                                </div>
                            )}

                            {isEditing && profileData.profilePicture && (
                                <button
                                    onClick={() => handleRemoveImage('profilePicture')}
                                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all z-20"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">Display Name</label>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">Website / Portfolio</label>
                                        <input
                                            type="text"
                                            value={profileData.website}
                                            onChange={e => setProfileData({ ...profileData, website: e.target.value })}
                                            placeholder="https://..."
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none font-bold"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">Bio</label>
                                    <textarea
                                        value={profileData.bio}
                                        onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none font-bold resize-none"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSaveProfile}
                                        className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-xl font-black shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all active:scale-95"
                                    >
                                        <Save size={18} />
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="flex-1">
                                    <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                                        {profileData.name}
                                        {profileData.verified && <CheckCircle2 size={24} className="text-blue-500" />}
                                    </h2>
                                    <p className="text-gray-500 font-bold mb-4">{profileData.handle}</p>
                                    <p className="text-gray-600 max-w-2xl leading-relaxed mb-6 font-medium">
                                        {profileData.bio}
                                    </p>

                                    <div className="flex flex-wrap gap-6 text-sm">
                                        <div className="flex items-center gap-2 text-gray-500 font-bold">
                                            <Users size={16} />
                                            <span className="text-gray-900">{profileData.followers}</span> Followers
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500 font-bold">
                                            <Layers size={16} />
                                            <span className="text-gray-900">{profileData.totalUses}</span> Monthly Uses
                                        </div>
                                        {profileData.website && (
                                            <div className="flex items-center gap-2 text-gray-500 font-bold">
                                                <Globe size={16} />
                                                <a href={profileData.website} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline">Portfolio</a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {!isOwnProfile && (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleFollow}
                                            className={`px-8 py-3 rounded-xl font-black transition-all shadow-lg active:scale-95
                                                ${isFollowing
                                                    ? 'bg-gray-100 text-gray-600 border border-gray-200 shadow-none'
                                                    : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-100'}
                                            `}
                                        >
                                            {isFollowing ? 'Following' : 'Follow'}
                                        </button>
                                        <button className="px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl font-black hover:bg-gray-50 transition-all active:scale-95">
                                            Message
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-4 mt-8 pt-8 border-t border-gray-50">
                            <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors"><Twitter size={20} /></button>
                            <button className="p-2 text-gray-400 hover:text-pink-500 transition-colors"><Instagram size={20} /></button>
                        </div>
                    </div>
                </section>

                {/* Templates Section */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-gray-900">Designs by {profileData.name}</h3>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                            <span className="text-gray-900 border-b-2 border-purple-600 pb-1 cursor-pointer">Templates</span>
                            <span className="hover:text-gray-600 px-4 cursor-pointer">Elements</span>
                        </div>
                    </div>

                    {creatorTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {creatorTemplates.map(template => (
                                <div key={template.id} className="group cursor-pointer">
                                    <div className="aspect-[4/5] bg-white rounded-2xl mb-4 overflow-hidden border border-gray-100 shadow-sm transition-all group-hover:shadow-xl group-hover:-translate-y-1 relative flex items-center justify-center">
                                        {template.previewImage ? (
                                            <img src={template.previewImage} alt={template.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-5xl">{template.thumbnail || '🎨'}</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => navigate(`/main?template=${template.id}`)}
                                                className="bg-white text-purple-600 px-6 py-2 rounded-full font-black text-xs shadow-xl"
                                            >
                                                Customize
                                            </button>
                                        </div>
                                        <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full text-gray-400 hover:text-red-500 shadow-sm transition-colors">
                                            <Heart size={14} />
                                        </button>
                                    </div>
                                    <h4 className="font-bold text-gray-800 truncate px-1">{template.name}</h4>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest px-1 mt-1">
                                        <Eye size={12} /> {template.views || '0'} Views
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-100">
                            <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold text-lg">No published templates yet</p>
                            <p className="text-gray-400 mb-6">When you publish designs, they will appear here.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default CreatorProfilePage;
