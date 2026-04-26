import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { boardAPI } from '../services/api';
import {
  Settings,
  Share2,
  Home,
  Plus,
  Download,
  X,
  UserPlus,
  Copy,
  Check,
  Trash2
} from 'lucide-react';
import WhiteboardWorkspace from '../features/whiteboard/components/WhiteboardWorkspace';

const WhiteboardPage = () => {
  const { boardId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [copied, setCopied] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [boardMembers, setBoardMembers] = useState([]);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');

  const stageRef = useRef(null);

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        setLoading(true);
        if (boardId?.startsWith('local_')) {
           setBoard({ id: boardId, title: 'Local Whiteboard' });
           setBoardTitle('Local Whiteboard');
           setBoardMembers([]);
        } else {
           try {
             const response = await boardAPI.getBoard(boardId);
             setBoard(response.data);
             setBoardTitle(response.data.title || 'Untitled Whiteboard');
             const membersResponse = await boardAPI.listBoardMembers(boardId);
             setBoardMembers(Array.isArray(membersResponse.data) ? membersResponse.data : []);
           } catch (apiErr) {
             console.warn("API board fetch failed, treating as local board.", apiErr);
             setBoard({ id: boardId, title: 'Untitled Whiteboard (Local)' });
             setBoardTitle('Untitled Whiteboard (Local)');
             setBoardMembers([]);
           }
        }
        setError(null);
      } catch (err) {
        console.error('Error in board logic:', err);
        setError('Failed to setup whiteboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (boardId) {
      fetchBoardData();
    }
  }, [boardId]);

  const handleTitleSave = async () => {
    if (!boardTitle.trim() || boardTitle === board.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await boardAPI.updateBoard(boardId, { title: boardTitle.trim() });
      setBoard(prev => ({ ...prev, title: boardTitle.trim() }));
      setIsEditingTitle(false);
    } catch (err) {
      console.error('Error updating board title:', err);
      alert('Failed to update title');
      setBoardTitle(board.title);
      setIsEditingTitle(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvitation = async () => {
    if (!inviteEmail.trim()) return;

    try {
      setSendingInvite(true);
      await boardAPI.inviteUser(boardId, {
        email: inviteEmail,
        role: inviteRole
      });
      alert('Invitation sent successfully!');
      setInviteEmail('');
      setShowInviteModal(false);

      // Refresh members
      const membersResponse = await boardAPI.listBoardMembers(boardId);
      setBoardMembers(Array.isArray(membersResponse.data) ? membersResponse.data : []);
    } catch (err) {
      console.error('Error sending invitation:', err);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setSendingInvite(false);
    }
  };

  const handleDownload = (quality = 'high') => {
    if (!stageRef.current) return;
    
    // High quality export
    const pixelRatio = quality === 'high' ? 3 : 1;
    const uri = stageRef.current.toDataURL({ pixelRatio });
    const link = document.createElement('a');
    link.download = `${boardTitle.replace(/\s+/g, '_')}_${quality}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading your infinite canvas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <X size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-gray-500 text-center mb-8 max-w-md">{error}</p>
        <button
          onClick={() => navigate('/home')}
          className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fa] overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <button
              onClick={() => navigate('/home')}
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-all active:scale-95"
            >
              <Home size={18} />
            </button>
            <span className="handwritten-logo select-none">Sowntra</span>
          </div>

          <div className="h-8 w-px bg-gray-100 mx-1" />

          {/* Project Info & Quick Menus */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {isEditingTitle ? (
                <input
                  autoFocus
                  type="text"
                  value={boardTitle}
                  onChange={(e) => setBoardTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                  className="text-sm font-black text-gray-900 bg-gray-50 border-none focus:ring-2 focus:ring-purple-200 rounded px-1 -ml-1 outline-none w-full max-w-[200px]"
                />
              ) : (
                <h1
                  onClick={() => setIsEditingTitle(true)}
                  className="text-sm font-black text-gray-900 leading-tight cursor-pointer hover:bg-gray-50 px-2 -ml-2 rounded-lg transition-colors truncate max-w-[300px]"
                >
                  {board?.title || 'Untitled Whiteboard'}
                </h1>
              )}
              <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-1.5 py-0.5 border border-gray-100">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Live</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-0.5">
              {['File', 'Edit', 'View', 'Canvas'].map(item => (
                <button key={item} className="text-[10px] font-bold text-gray-400 hover:text-purple-600 transition-colors uppercase tracking-widest">{item}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* User Presence */}
          <div className="flex -space-x-2 mr-2">
            {boardMembers.slice(0, 3).map((member, i) => (
              <div
                key={member.id}
                className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-black shadow-sm transition-transform hover:scale-110 hover:z-10
                  ${['bg-purple-500', 'bg-indigo-500', 'bg-pink-500', 'bg-amber-500'][i % 4]}
                `}
                title={member.name || member.email}
              >
                {(member.name || member.email || 'U').charAt(0).toUpperCase()}
              </div>
            ))}
            {boardMembers.length > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-gray-500 text-[10px] font-bold shadow-sm">
                +{boardMembers.length - 3}
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-gray-100" />

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-5 h-10 bg-gray-900 hover:bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
            >
              <Share2 size={14} /> Share
            </button>
            
            <div className="group relative">
              <button 
                className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500 transition-all active:scale-95"
                title="Download Options"
              >
                <Download size={20} />
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0 z-[100]">
                 <button onClick={() => handleDownload('standard')} className="w-full text-left p-3 hover:bg-gray-50 rounded-xl flex flex-col">
                   <span className="text-xs font-black text-gray-800 uppercase tracking-tighter">Standard (1x)</span>
                   <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Fast & Lightweight</span>
                 </button>
                 <button onClick={() => handleDownload('high')} className="w-full text-left p-3 hover:bg-purple-50 rounded-xl flex flex-col">
                   <span className="text-xs font-black text-purple-600 uppercase tracking-tighter">Studio Quality (3x)</span>
                   <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest">Pixel Perfect PNG</span>
                 </button>
              </div>
            </div>

            <button className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500 transition-all active:scale-95">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Canvas Area */}
      <WhiteboardWorkspace stageRef={stageRef} />

      {/* Share Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-black text-[#0e1217]">Share with others</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Share via Link</label>
                <div className="flex gap-2">
                  <div className="flex-1 h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 flex items-center text-sm text-gray-500 truncate font-medium">
                    {window.location.href}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center transition-all ${copied ? 'bg-green-600' : 'hover:bg-black'}`}
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Send Invite</label>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:ring-4 focus:ring-purple-100 outline-none transition-all font-bold text-sm"
                  />
                  <div className="flex gap-2">
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none font-bold text-sm text-gray-600 appearance-none flex-1 cursor-pointer"
                    >
                      <option value="editor">As Editor</option>
                      <option value="viewer">As Viewer</option>
                    </select>
                    <button
                      onClick={handleSendInvitation}
                      disabled={sendingInvite || !inviteEmail.trim()}
                      className="px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-purple-100 flex items-center gap-2"
                    >
                      {sendingInvite ? 'Sending...' : <UserPlus size={18} />}
                      {!sendingInvite && 'Invite'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Board Members List */}
              {boardMembers.length > 0 && (
                <div className="pt-4 space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Current Collaborators</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 light-scrollbar">
                    {boardMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#8b3dff] font-bold text-sm border border-gray-100 shadow-sm">
                            {(member.name || member.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{member.name || member.email}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{member.role}</p>
                          </div>
                        </div>
                        {member.userId !== currentUser?.uid && (
                          <button className="text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhiteboardPage;
