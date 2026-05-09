import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, FolderOpen, Trash2, Plus, Search, X, Layout, Monitor, Smartphone, Palette, FileText, ChevronLeft } from 'lucide-react';
import { socialMediaTemplates } from '../utils/constants';
import { projectAPI, boardAPI, invitationAPI } from '../services/api';
import { editableTemplates, templateCategories } from '../config/editableTemplates';
import { LayoutTemplate, Home, Settings, Award, Users, Loader } from 'lucide-react';

const HomePage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showRTCPopup, setShowRTCPopup] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [isCustomSizeView, setIsCustomSizeView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customDimensions, setCustomDimensions] = useState({
    width: 800,
    height: 600,
    unit: 'px'
  });
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'templates', 'projects'
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('all');
  const [communityTemplates, setCommunityTemplates] = useState([]);

  useEffect(() => {
    // Load community templates from localStorage
    const stored = JSON.parse(localStorage.getItem('community_templates') || '[]');
    setCommunityTemplates(stored);
  }, []);

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [tempTitle, setTempTitle] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRenameProject = async (projectId, newTitle) => {
    if (!newTitle.trim()) {
      setEditingProjectId(null);
      return;
    }

    try {
      const item = projects.find(p => p.id === projectId);
      const isBoard = item?.type === 'board';

      if (isBoard) {
        await boardAPI.updateBoard(projectId, { title: newTitle.trim() });
      } else {
        // Project update might expect a nested projectData object depending on the API
        // For projectAPI.updateProject it usually is { projectData: { ... } }
        // Let's check api.js again
        await projectAPI.updateProject(projectId, { title: newTitle.trim() });
      }

      setProjects(projects.map(p => p.id === projectId ? { ...p, title: newTitle.trim() } : p));
      setEditingProjectId(null);
    } catch (error) {
      console.error('Error renaming project:', error);
      alert('Failed to rename project');
      setEditingProjectId(null);
    }
  };

  // Shared fetching logic
  const refreshDesigns = React.useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, boardRes] = await Promise.allSettled([
        projectAPI.loadProjects(),
        boardAPI.listBoards()
      ]);

      let allItems = [];
      const extractDataList = (obj, depth = 0) => {
        if (!obj || depth > 5) return [];
        if (Array.isArray(obj)) return obj;
        if (typeof obj === 'object') {
          // Check if object itself is a project
          if (obj.title || obj.name || obj.projectData || obj.boardData || (obj.id && obj.pages)) {
            return [obj];
          }
          // Known containers
          const known = ['projects', 'boards', 'data', 'results', 'list', 'items', 'project'];
          for (const key of known) {
            if (obj[key]) {
              const found = extractDataList(obj[key], depth + 1);
              if (found.length > 0) return found;
            }
          }
          // Any array
          const vals = Object.values(obj);
          const firstArr = vals.find(v => Array.isArray(v));
          if (firstArr) return firstArr;
          // Dictionary of objects
          const allObj = vals.length > 0 && vals.every(v => v && typeof v === 'object');
          if (allObj && vals.some(v => v.title || v.name || v.projectData || v.boardData || v.pages)) return vals;
          // Deep search
          for (const v of vals) {
            if (v && typeof v === 'object' && !Array.isArray(v)) {
              const found = extractDataList(v, depth + 1);
              if (found.length > 0) return found;
            }
          }
        }
        return [];
      };

      let projItems = [];
      let boardItems = [];

      if (projRes.status === 'fulfilled') {
        const rawProjData = projRes.value?.data;
        console.log('[HomePage] Raw Project Data:', rawProjData);
        projItems = extractDataList(rawProjData).map(p => ({ ...p, _sourceType: 'project' }));
      }
      if (boardRes.status === 'fulfilled') {
        const rawBoardData = boardRes.value?.data;
        console.log('[HomePage] Raw Board Data:', rawBoardData);
        boardItems = extractDataList(rawBoardData).map(p => ({ ...p, _sourceType: 'board' }));
      }

      allItems = [...projItems, ...boardItems];

      const flattened = allItems.map(p => {
        if (!p) return null;
        const data = p.projectData || p.boardData || (typeof p === 'object' ? p : {});
        const id = p.id || p._id || data.id || data._id || p.boardId || (typeof p === 'string' ? p : null);
        const title = p.title || p.name || data.title || data.name || (p.pages ? `Project ${id || ''}` : 'Untitled design');

        let lastMod = p.lastModified || p.timestamp || p.updatedAt || data.updatedAt || Date.now();
        // Ensure valid date for sorting
        if (isNaN(new Date(lastMod).getTime())) lastMod = Date.now();

        return {
          ...p,
          ...data,
          id,
          title: String(title || 'Untitled design'),
          type: p._sourceType || ((p.boardId || p.boardData) ? 'board' : 'project'),
          lastModified: lastMod
        };
      }).filter(p => p && p.id && String(p.id) !== 'undefined');

      const unique = Array.from(new Map(flattened.map(item => [String(item.id), item])).values());
      unique.sort((a, b) => {
        const dateB = new Date(b.lastModified).getTime();
        const dateA = new Date(a.lastModified).getTime();
        return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
      });
      setProjects(unique);

      // Warn if partial failure
      if (projRes.status === 'rejected' || boardRes.status === 'rejected') {
        const failed = [];
        if (projRes.status === 'rejected') failed.push('Projects API');
        if (boardRes.status === 'rejected') failed.push('Boards API');
        console.warn(`Partial sync success. Failed: ${failed.join(', ')}`);
        // Just show a small warning if one worked
        if (unique.length > 0) {
          console.warn(`Partial sync: ${failed.join(', ')} unavailable.`);
        } else {
          console.warn(`Unable to sync designs: ${failed.join(', ')} returned errors.`);
        }
      }
    } catch (error) {
      console.error('Error refreshing designs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load projects on mount and visibility change (tab switch)
  useEffect(() => {
    if (!currentUser) return;

    // Initial load
    refreshDesigns();

    // Refresh when user switches back to this tab from the editor
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab visible: Refreshing designs to sync with editor...');
        refreshDesigns();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser, refreshDesigns]);

  // Unused handlers removed for ESLint

  const handleMyProjects = async () => {
    setActiveTab('projects');
    refreshDesigns();
  };

  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this design?')) return;

    // Find the item to determine its type (hardening with String comparison)
    const item = projects.find(p => String(p.id) === String(projectId));
    const isBoard = item?.type === 'board';

    console.log(`[Delete] ID: ${projectId}, Found Item: ${item?.title}, Type: ${item?.type}, IsBoard: ${isBoard}`);

    try {
      if (isBoard) {
        await boardAPI.deleteBoard(projectId);
      } else {
        await projectAPI.deleteProject(projectId);
      }
      setProjects(projects.filter(p => String(p.id) !== String(projectId)));
    } catch (error) {
      console.error(`Error deleting ${isBoard ? 'board' : 'project'}:`, error);
      const errorMsg = error.response?.data?.message || error.message || 'Server error';
      alert(`Failed to delete design: ${errorMsg}`);
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

  const handleCreateWhiteboard = async () => {
    try {
      const newBoard = { title: 'Untitled Whiteboard' };
      try {
         const response = await boardAPI.createBoard(newBoard);
         const boardId = response.data.id || response.data._id;
         if (boardId) {
           window.open(`/whiteboard/${boardId}`, '_blank');
           return;
         }
      } catch (apiError) {
         console.warn('Backend board creation failed, falling back to local whiteboard...', apiError);
         // Fallback to local isolated board
         const localId = `local_${Date.now()}`;
         window.open(`/whiteboard/${localId}`, '_blank');
      }
    } catch (err) {
      console.error('Failed to create whiteboard:', err);
      // Fallback
      window.open(`/whiteboard/local_${Date.now()}`, '_blank');
    }
  };

  const handleTeamCollaborationClick = () => {
    setShowRTCPopup(true);
    setInviteEmail('');
    setInviteError('');
    setIsInviting(false);
  };

  const handleSendInviteAndCreate = async () => {
    if (!inviteEmail.trim()) {
      setInviteError('Please enter at least one email address to invite.');
      return;
    }
    
    const emails = inviteEmail.split(',').map(e => e.trim()).filter(e => e);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(e => !emailRegex.test(e));
    
    if (emails.length === 0) {
       setInviteError('Please enter at least one valid email address.');
       return;
    }
    if (invalidEmails.length > 0) {
       setInviteError(`Invalid email(s): ${invalidEmails.join(', ')}`);
       return;
    }
    
    setInviteError('');
    setIsInviting(true);
    
    try {
      // 1. Create a new board/workspace for collaboration
      const response = await boardAPI.createBoard({
        title: `${currentUser?.displayName || 'My'} Workspace`,
        description: `Collaborative workspace with ${emails.length > 1 ? 'team' : emails[0]}`,
        isPublic: false
      });
      const boardId = response.data?.id || response.data?._id;
      
      if (boardId) {
         // 2. Send the actual email invite(s) using the backend API
         try {
           await Promise.all(emails.map(email => invitationAPI.sendInvitation(boardId, email, 'editor')));
         } catch (inviteErr) {
           console.error('Failed to send email invite:', inviteErr);
           // We silently fail the email sending to ensure the workspace still opens without ugly alerts.
         }
         
         // 3. Open in Main Design editor
         setShowRTCPopup(false);
         window.open(`/main?project=${boardId}`, '_blank');
      } else {
         setShowRTCPopup(false);
         window.open(`/main?project=local_${Date.now()}`, '_blank');
      }
    } catch (err) {
      console.error('Failed to create collaboration board:', err);
      setShowRTCPopup(false);
      window.open(`/main?project=local_${Date.now()}`, '_blank');
    } finally {
      setIsInviting(false);
    }
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

  const isCreator = currentUser?.role === 'CREATOR';

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
              disabled={!isCreator}
              className="px-5 h-10 bg-[#8b3dff] hover:bg-[#7a34e5] text-white font-semibold rounded-lg transition-all shadow-md shadow-purple-100 flex items-center gap-2"
            >
              Create
            </button>
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => (isCreator ? handleMyProjects() : navigate('/creator-application'))}
                className="text-sm font-semibold text-gray-600 hover:text-[#8b3dff] transition-colors"
              >
                Projects
              </button>
              <button
                onClick={() => (isCreator ? handleTeamCollaborationClick() : navigate('/creator-application'))}
                className="text-sm font-semibold text-gray-600 hover:text-[#8b3dff] transition-colors"
              >
                RTC
              </button>
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
              { id: 'creators', name: 'Creators', icon: <Users size={22} /> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'projects') handleMyProjects();
                  if (item.id === 'brand') navigate('/brand-kit');
                  if (item.id === 'creators') navigate('/creators');
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
                  {!isCreator && (
                    <div className="mb-8 bg-white/15 border border-white/25 rounded-2xl px-6 py-4 text-left flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-sm font-black uppercase tracking-wider">Creator access required for publishing and advanced tools</p>
                        <p className="text-sm text-purple-100">Apply from inside app and get reviewed by admin.</p>
                      </div>
                      <button
                        onClick={() => navigate('/creator-application')}
                        className="px-5 py-2.5 bg-white text-[#6a11cb] rounded-xl font-black hover:bg-purple-50 transition-colors"
                      >
                        Apply for Creator
                      </button>
                    </div>
                  )}
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
                            if (isCreator) {
                              setShowCreatePopup(true);
                              setIsCustomSizeView(true);
                            } else {
                              navigate('/creator-application');
                            }
                          } else if (cat.name === 'Whiteboard') {
                            if (isCreator) {
                              handleCreateWhiteboard();
                            } else {
                              navigate('/creator-application');
                            }
                          } else {
                            if (isCreator) {
                              setActiveTab('templates');
                            } else {
                              navigate('/creator-application');
                            }
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
                    <button
                      onClick={() => {
                        handleMyProjects();
                        setActiveTab('projects');
                      }}
                      className="text-[#8b3dff] font-bold hover:underline flex items-center gap-1"
                    >
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
                    {loading ? (
                      // Skeleton Loader
                      [1, 2, 3, 4].map(i => (
                        <div key={i} className="flex-shrink-0 w-[240px] animate-pulse">
                          <div className="w-full h-[300px] bg-gray-100 rounded-2xl mb-3 border border-gray-100" />
                          <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
                          <div className="h-4 bg-gray-50 rounded w-1/2" />
                        </div>
                      ))
                    ) : projects.length > 0 ? (
                      projects.map(project => (
                        <div
                          key={project.id}
                          onClick={() => handleOpenProject(project.id)}
                          className="flex-shrink-0 w-[240px] group cursor-pointer"
                        >
                          <div className="w-full h-[300px] bg-gray-100 rounded-2xl mb-3 overflow-hidden border border-gray-100 shadow-sm transition-all group-hover:shadow-xl group-hover:-translate-y-1 relative flex items-center justify-center">
                            {project.thumbnail ? (
                              <img
                                src={project.thumbnail}
                                alt={project.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                                <span className="text-4xl opacity-20">🎨</span>
                              </div>
                            )}
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => handleDeleteProject(project.id, e)}
                                className="p-2 bg-white/90 backdrop-blur rounded-lg text-red-500 hover:bg-white shadow-sm"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          {editingProjectId === project.id ? (
                            <input
                              autoFocus
                              type="text"
                              value={tempTitle}
                              onChange={(e) => setTempTitle(e.target.value)}
                              onBlur={() => handleRenameProject(project.id, tempTitle)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameProject(project.id, tempTitle);
                                if (e.key === 'Escape') setEditingProjectId(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full bg-purple-50 border-none focus:ring-2 focus:ring-purple-200 rounded px-1 -ml-1 text-sm font-bold text-gray-900 outline-none"
                            />
                          ) : (
                            <h3
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingProjectId(project.id);
                                setTempTitle(project.title);
                              }}
                              className="font-bold text-gray-800 line-clamp-1 hover:text-[#8b3dff] transition-colors"
                              title="Click to rename"
                            >
                              {project.title}
                            </h3>
                          )}
                          <p className="text-sm text-gray-400 font-medium">
                            {new Date(project.lastModified || project.timestamp || project.updatedAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    ) : (
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
                    {[...communityTemplates, ...Object.values(editableTemplates).slice(0, 10)].map((template) => (
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
                              {template.thumbnail || '🎨'}
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
                  {[...communityTemplates, ...Object.values(editableTemplates)]
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
                              {template.thumbnail || '🎨'}
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
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                  </div>
                ) : projects.length > 0 && projects.filter(p => !searchQuery || (p.title || '').toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold text-lg">No results for "{searchQuery}"</p>
                    <button onClick={() => setSearchQuery('')} className="text-[#8b3dff] font-bold mt-2">Clear search</button>
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
                    {projects
                      .filter(p => {
                        const search = (searchQuery || '').toLowerCase();
                        if (!search) return true;
                        const title = (p.title || '').toLowerCase();
                        const id = String(p.id || '').toLowerCase();
                        return title.includes(search) || id.includes(search);
                      })
                      .map(project => (
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
                            Modified {new Date(project.lastModified || project.timestamp || project.updatedAt || Date.now()).toLocaleDateString()}
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

      {/* RTC Invite Popup */}
      {showRTCPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-extrabold text-[#0e1217]">
                Invite to Collaborate
              </h3>
              <button
                onClick={() => setShowRTCPopup(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 bg-white space-y-6">
              <div className="text-center mb-2">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#8b3dff]">
                  <Users size={32} />
                </div>
                <p className="text-gray-500 font-medium text-sm">
                  Enter email addresses separated by commas to invite your team to a real-time collaborative design session.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Email Addresses</label>
                <input
                  type="text"
                  placeholder="colleague1@example.com, colleague2@example.com"
                  className={`w-full h-12 px-4 bg-gray-50 border ${inviteError ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-purple-500'} rounded-xl focus:ring-2 outline-none transition-all font-medium`}
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    if (inviteError) setInviteError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isInviting) handleSendInviteAndCreate();
                  }}
                  disabled={isInviting}
                  autoFocus
                />
                {inviteError && <p className="text-red-500 text-xs font-bold mt-1">{inviteError}</p>}
              </div>

              <button
                onClick={handleSendInviteAndCreate}
                disabled={isInviting}
                className="w-full h-12 bg-[#8b3dff] hover:bg-[#7a34e5] disabled:bg-purple-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-purple-100 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isInviting ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Sending Invite...
                  </>
                ) : (
                  'Send Invite & Start Session'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
