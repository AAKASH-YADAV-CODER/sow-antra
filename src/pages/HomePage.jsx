import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, CheckCircle, LogOut, FolderOpen, Clock, Trash2, Plus, Search, X, Layout, Monitor, Smartphone, Palette, FileText, ArrowLeft, ChevronLeft } from 'lucide-react';
import { socialMediaTemplates } from '../utils/constants';
import { projectAPI, boardAPI } from '../services/api';
import { editableTemplates, templateCategories } from '../config/editableTemplates';
import { LayoutTemplate, Home, FolderHorizontal, Trash, Settings, Award } from 'lucide-react';

const HomePage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showProjects, setShowProjects] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [isCustomSizeView, setIsCustomSizeView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customDimensions, setCustomDimensions] = useState({
    width: 800,
    height: 600,
    unit: 'px'
  });
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'templates', 'projects'
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('all');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleGetStarted = () => {
    navigate('/main');
  };

  const handleStartDesigning = () => {
    navigate('/main');
  };

  const handleMyProjects = async () => {
    setShowProjects(true);
    setLoading(true);
    try {
      const response = await projectAPI.loadProjects();
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectAPI.deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const handleOpenProject = (projectId) => {
    window.open(`/main?project=${projectId}`, '_blank');
  };

  const handleCreateWithTemplate = (templateKey) => {
    window.open(`/main?template=${templateKey}`, '_blank');
    setShowCreatePopup(false);
    setIsCustomSizeView(false);
  };

  const handleCreateCustomSize = () => {
    const { width, height, unit } = customDimensions;
    let finalWidth = parseFloat(width);
    let finalHeight = parseFloat(height);

    // Standard DPI conversion (96 DPI)
    const DPI = 96;
    if (unit === 'in') {
      finalWidth *= DPI;
      finalHeight *= DPI;
    } else if (unit === 'cm') {
      finalWidth *= (DPI / 2.54);
      finalHeight *= (DPI / 2.54);
    } else if (unit === 'mm') {
      finalWidth *= (DPI / 25.4);
      finalHeight *= (DPI / 25.4);
    }

    window.open(`/main?width=${Math.round(finalWidth)}&height=${Math.round(finalHeight)}`, '_blank');
    setShowCreatePopup(false);
    setIsCustomSizeView(false);
  };

  const handleTeamCollaboration = async () => {
    try {
      // Create a new board/workspace for collaboration
      const response = await boardAPI.createBoard({
        title: `${currentUser?.displayName || 'My'} Workspace`,
        description: 'Collaborative whiteboard workspace',
        isPublic: false
      });

      // Navigate to the whiteboard
      navigate(`/whiteboard/${response.data.id}`);
    } catch (error) {
      console.error('Error creating workspace:', error);
      alert('Failed to create workspace. Please try again.');
    }
  };

  const getJoinedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUserInitial = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName.charAt(0).toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    return currentUser?.displayName || currentUser?.email || 'User';
  };

  return (
    <div className="min-h-screen bg-white text-[#0e1217]">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/home')}>
              <div className="w-10 h-10 bg-[#8b3dff] rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                <span className="text-2xl font-bold text-white leading-none">S</span>
              </div>
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Sowntra</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowCreatePopup(true)}
              className="px-5 h-10 bg-[#8b3dff] hover:bg-[#7a34e5] text-white font-semibold rounded-lg transition-all shadow-md shadow-purple-100 flex items-center gap-2"
            >
              Create
            </button>
            <nav className="hidden md:flex items-center gap-6">
              <button className="text-sm font-semibold text-gray-600 hover:text-[#8b3dff] transition-colors">Templates</button>
              <button onClick={handleMyProjects} className="text-sm font-semibold text-gray-600 hover:text-[#8b3dff] transition-colors">Projects</button>
              <button className="text-sm font-semibold text-gray-600 hover:text-[#8b3dff] transition-colors">RTC</button>
            </nav>
            <div className="w-px h-6 bg-gray-200 mx-2 hidden md:block" />
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                {getUserInitial()}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-bold leading-tight">{getUserDisplayName()}</p>
                <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Sign out</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-72px)]">
        {/* Unified Sidebar Navigation */}
        <aside className="w-[72px] lg:w-[240px] border-r border-gray-100 flex flex-col py-6 bg-gray-50/30 sticky top-[72px] h-[calc(100vh-72px)] transition-all">
          <div className="flex-1 px-3 space-y-2">
            {[
              { id: 'home', name: 'Home', icon: <Home size={22} /> },
              { id: 'templates', name: 'Templates', icon: <LayoutTemplate size={22} /> },
              { id: 'projects', name: 'Projects', icon: <FolderOpen size={22} /> },
              { id: 'brand', name: 'Brand', icon: <Award size={22} /> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'projects') handleMyProjects();
                  if (item.id === 'brand') navigate('/brand-kit');
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all
                  ${activeTab === item.id ? 'bg-purple-50 text-[#8b3dff]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}
                `}
              >
                <span className={activeTab === item.id ? 'text-[#8b3dff]' : 'text-gray-400'}>{item.icon}</span>
                <span className="hidden lg:block text-sm">{item.name}</span>
              </button>
            ))}
          </div>

          <div className="px-3 pt-6 border-t border-gray-100">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all">
              <Settings size={22} className="text-gray-400" />
              <span className="hidden lg:block text-sm">Settings</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 pb-20 overflow-y-auto">
          {activeTab === 'home' && (
            <>
              {/* Banner Section */}
              <section className="bg-gradient-to-br from-[#8b3dff] to-[#6a11cb] py-16 px-6 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[100px]" />
                  <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto">
                  <h1 className="text-4xl md:text-5xl font-extrabold mb-8 tracking-tight">What will you design today?</h1>

                  {/* Massive Search Bar */}
                  <div className="relative max-w-2xl mx-auto shadow-2xl">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <Search className="text-gray-400" size={24} />
                    </div>
                    <input
                      type="text"
                      placeholder="Try 'Instagram post', Whiteboard, 'Pitch deck'"
                      className="w-full h-14 pl-14 pr-6 rounded-full text-gray-900 text-lg border-none focus:ring-4 focus:ring-purple-300 transition-all outline-none"
                    />
                  </div>

                  {/* Category Quick Links */}
                  <div className="flex flex-wrap justify-center gap-8 mt-12">
                    {[
                      { name: 'Design', icon: <Palette size={28} />, bg: 'bg-purple-500' },
                      { name: 'Whiteboard', icon: <Layout size={28} />, bg: 'bg-blue-500' },
                      { name: 'Presentation', icon: <Monitor size={28} />, bg: 'bg-green-500' },
                      { name: 'Social Post', icon: <Smartphone size={28} />, bg: 'bg-pink-500' },
                      { name: 'Custom Size', icon: <FileText size={28} />, bg: 'bg-orange-500' }
                    ].map(cat => (
                      <div
                        key={cat.name}
                        className="flex flex-col items-center gap-3 group cursor-pointer"
                        onClick={() => {
                          if (cat.name === 'Custom Size') {
                            setShowCreatePopup(true);
                            setIsCustomSizeView(true);
                          } else {
                            setActiveTab('templates');
                          }
                        }}
                      >
                        <div className={`w-16 h-16 ${cat.bg} rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-all shadow-xl border border-white/20`}>
                          {cat.icon}
                        </div>
                        <span className="text-sm font-bold opacity-90 group-hover:opacity-100">{cat.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Content Section */}
              <div className="max-w-[1440px] mx-auto px-6 mt-12">
                {/* Recent Designs */}
                <section className="mb-16">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-extrabold tracking-tight">Recent designs</h2>
                    <button onClick={() => setActiveTab('projects')} className="text-[#8b3dff] font-bold hover:underline flex items-center gap-1">
                      See all <ArrowRight size={16} />
                    </button>
                  </div>

                  <div className="flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 scrollbar-hide">
                    {/* Add New Project Card */}
                    <div
                      onClick={() => setShowCreatePopup(true)}
                      className="flex-shrink-0 w-[240px] h-[300px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer group"
                    >
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl text-purple-600 shadow-sm transition-transform group-hover:scale-110">
                        <Plus size={32} />
                      </div>
                      <span className="font-bold text-gray-500">Create new</span>
                    </div>

                    {/* User Projects */}
                    {projects.length > 0 ? projects.slice(0, 10).map(project => (
                      <div
                        key={project.id}
                        onClick={() => handleOpenProject(project.id)}
                        className="flex-shrink-0 w-[240px] group cursor-pointer"
                      >
                        <div className="w-full h-[300px] bg-gray-100 rounded-2xl mb-3 overflow-hidden border border-gray-100 shadow-sm transition-all group-hover:shadow-xl group-hover:-translate-y-1 relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                            <span className="text-4xl opacity-20">🎨</span>
                          </div>
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleDeleteProject(project.id, e)}
                              className="p-2 bg-white/90 backdrop-blur rounded-lg text-red-500 hover:bg-white shadow-sm"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <h3 className="font-bold text-gray-800 line-clamp-1">{project.title}</h3>
                        <p className="text-sm text-gray-400 font-medium">
                          {new Date(project.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                    )) : !loading && (
                      <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
                        <FolderOpen className="mb-4" size={48} />
                        <p className="font-medium text-center">No designs yet. Start one today!</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Create a design (Templates Showcase) */}
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-extrabold tracking-tight">Suggested for you</h2>
                    <button onClick={() => setActiveTab('templates')} className="text-gray-500 font-bold hover:text-purple-600 flex items-center gap-1 text-sm">
                      More like this <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 scrollbar-hide">
                    {Object.values(editableTemplates).map((template) => (
                      <div
                        key={template.id}
                        onClick={() => handleCreateWithTemplate(template.id)}
                        className="flex-shrink-0 w-[220px] group cursor-pointer"
                      >
                        <div className="w-full aspect-[4/5] bg-gray-50 rounded-2xl mb-3 overflow-hidden border border-gray-100 transition-all group-hover:shadow-md relative flex items-center justify-center">
                          {template.previewImage ? (
                            <img
                              src={template.previewImage}
                              alt={template.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="text-5xl group-hover:scale-110 transition-transform">
                              {template.thumbnail}
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                            {template.width} x {template.height}
                          </div>
                        </div>
                        <h3 className="font-bold text-sm text-gray-700">{template.name}</h3>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}

          {activeTab === 'templates' && (
            <div className="p-8">
              <div className="max-w-6xl mx-auto">
                <header className="mb-12">
                  <h1 className="text-3xl font-extrabold mb-4">Templates</h1>
                  <p className="text-gray-500 font-medium">Browse dynamic, editable templates to kickstart your next design project.</p>
                </header>

                {/* Template Categories Mini Nav */}
                <div className="flex gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                  {templateCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedTemplateCategory(cat.id)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap border
                        ${selectedTemplateCategory === cat.id
                          ? 'bg-[#8b3dff] text-white border-[#8b3dff] shadow-lg shadow-purple-100'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}
                      `}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {Object.values(editableTemplates)
                    .filter(t => selectedTemplateCategory === 'all' || t.category === selectedTemplateCategory)
                    .map(template => (
                      <div
                        key={template.id}
                        onClick={() => handleCreateWithTemplate(template.id)}
                        className="group cursor-pointer"
                      >
                        <div className="aspect-[4/5] bg-gray-50 rounded-2xl mb-4 overflow-hidden border border-gray-100 shadow-sm transition-all group-hover:shadow-xl group-hover:-translate-y-1 relative flex items-center justify-center">
                          {template.previewImage ? (
                            <img
                              src={template.previewImage}
                              alt={template.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                              {template.thumbnail}
                            </div>
                          )}

                          {/* Apply Overlay */}
                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white text-[#8b3dff] px-8 py-3 rounded-full font-extrabold text-sm shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all">
                              Use template
                            </div>
                          </div>
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">{template.name}</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                          {template.width} x {template.height} • {template.category}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="p-8">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-3xl font-extrabold">Your Projects</h1>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search your designs..."
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none w-64"
                      />
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                    <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold text-lg">You haven't created any projects yet</p>
                    <p className="text-gray-400 mb-6">Start a new project from a template or a custom size.</p>
                    <button
                      onClick={() => setActiveTab('home')}
                      className="bg-[#8b3dff] text-white px-10 py-4 rounded-full font-extrabold shadow-lg shadow-purple-100 hover:scale-105 transition-transform"
                    >
                      Create your first design
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {projects.map(project => (
                      <div
                        key={project.id}
                        onClick={() => handleOpenProject(project.id)}
                        className="group cursor-pointer"
                      >
                        <div className="aspect-[4/3] bg-white rounded-3xl mb-4 overflow-hidden border border-gray-200 shadow-sm transition-all group-hover:shadow-xl group-hover:-translate-y-1 relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
                            <span className="text-5xl opacity-10">🎨</span>
                          </div>
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleDeleteProject(project.id, e)}
                              className="p-2.5 bg-white rounded-full text-red-500 hover:bg-red-50 shadow-md transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg line-clamp-1 px-1">{project.title}</h3>
                        <p className="text-sm text-gray-400 font-bold px-1">
                          Modified {new Date(project.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Design Popup */}
      {showCreatePopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-extrabold text-[#0e1217]">
                {isCustomSizeView ? (
                  <button onClick={() => setIsCustomSizeView(false)} className="flex items-center gap-2 hover:text-[#8b3dff] transition-colors">
                    <ChevronLeft size={18} /> Custom size
                  </button>
                ) : 'Create a design'}
              </h3>
              <button
                onClick={() => {
                  setShowCreatePopup(false);
                  setIsCustomSizeView(false);
                }}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-white">
              {!isCustomSizeView ? (
                <>
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-1 max-h-[400px] overflow-y-auto pr-2 light-scrollbar">
                    {Object.entries(socialMediaTemplates)
                      .filter(([_, t]) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(([key, template]) => (
                        <button
                          key={key}
                          onClick={() => handleCreateWithTemplate(key)}
                          className="flex items-center gap-4 p-3 hover:bg-purple-50 rounded-xl transition-all group text-left"
                        >
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                            {template.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-sm text-gray-800">{template.name}</p>
                            <p className="text-xs text-gray-400 font-medium">{template.width} x {template.height} px</p>
                          </div>
                        </button>
                      ))}
                  </div>

                  <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-center mt-4 -mx-4 -mb-4">
                    <button
                      onClick={() => setIsCustomSizeView(true)}
                      className="flex items-center gap-2 text-[#8b3dff] font-bold text-sm hover:underline"
                    >
                      <Plus size={16} /> Custom size
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Width</label>
                      <input
                        type="number"
                        className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold"
                        value={customDimensions.width}
                        onChange={(e) => setCustomDimensions({ ...customDimensions, width: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Height</label>
                      <input
                        type="number"
                        className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold"
                        value={customDimensions.height}
                        onChange={(e) => setCustomDimensions({ ...customDimensions, height: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Unit</label>
                      <select
                        className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold appearance-none cursor-pointer"
                        value={customDimensions.unit}
                        onChange={(e) => setCustomDimensions({ ...customDimensions, unit: e.target.value })}
                      >
                        <option value="px">px</option>
                        <option value="in">in</option>
                        <option value="cm">cm</option>
                        <option value="mm">mm</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleCreateCustomSize}
                    className="w-full h-12 bg-[#8b3dff] hover:bg-[#7a34e5] text-white font-bold rounded-xl shadow-lg shadow-purple-100 transition-all transform active:scale-[0.98]"
                  >
                    Create new design
                  </button>

                  <p className="text-center text-xs text-gray-400 font-medium">
                    This will open a new design with your specified dimensions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Projects Modal */}
      {showProjects && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">My Projects</h3>
              <button
                onClick={() => setShowProjects(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No projects found</p>
                <p className="text-gray-400 text-sm">Create your first design to see it here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleOpenProject(project.id)}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 line-clamp-1">{project.title}</h4>
                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {project.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">{project.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(project.lastModified).toLocaleDateString()}
                      </span>
                      <span>{project.isPublic ? 'Public' : 'Private'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;

