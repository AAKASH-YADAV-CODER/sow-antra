import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { boardAPI } from '../services/api';
import {
  Users,
  Settings,
  Share2,
  Home,
  Search,
  Plus,
  MoreHorizontal,
  Download,
  X,
  UserPlus,
  Copy,
  Check,
  Trash2
} from 'lucide-react';

const WhiteboardPage = () => {
  const { boardId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [copied, setCopied] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [boardMembers, setBoardMembers] = useState([]);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        setLoading(true);
        const response = await boardAPI.getBoard(boardId);
        setBoard(response.data);
        setBoardTitle(response.data.title || 'Untitled Whiteboard');

        // Fetch board members
        const membersResponse = await boardAPI.listBoardMembers(boardId);
        setBoardMembers(Array.isArray(membersResponse.data) ? membersResponse.data : []);

        setError(null);
      } catch (err) {
        console.error('Error fetching board:', err);
        setError('Failed to load whiteboard. It may have been deleted or you may not have access.');
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/home')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-all"
          >
            <Home size={20} />
          </button>
          <div className="h-6 w-px bg-gray-200 mx-1" />
          <div className="flex flex-col min-w-0">
            {isEditingTitle ? (
              <input
                autoFocus
                type="text"
                value={boardTitle}
                onChange={(e) => setBoardTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                className="text-sm font-bold text-gray-900 bg-gray-50 border-none focus:ring-2 focus:ring-purple-200 rounded px-1 -ml-1 outline-none w-full max-w-[200px]"
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-sm font-bold text-gray-900 leading-tight cursor-pointer hover:bg-gray-50 px-1 -ml-1 rounded transition-colors truncate max-w-[300px]"
                title="Click to rename"
              >
                {board?.title || 'Untitled Whiteboard'}
              </h1>
            )}
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Editing Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* User Presence Mini List */}
          <div className="flex -space-x-2 mr-4">
            {boardMembers.slice(0, 3).map((member, i) => (
              <div
                key={member.id}
                className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm
                  ${['bg-blue-500', 'bg-green-500', 'bg-pink-500'][i % 3]}
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

          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-sm transition-all shadow-md shadow-purple-50"
          >
            <Share2 size={16} /> Share
          </button>
          <button className="p-2.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-all">
            <Download size={20} />
          </button>
          <button className="p-2.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-all">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 relative bg-white overflow-hidden flex items-center justify-center">
        {/* Placeholder for the real Fabric.js or SVG canvas */}
        <div className="text-center">
          <div className="w-24 h-24 bg-purple-50 text-purple-200 rounded-3xl flex items-center justify-center mb-6 mx-auto">
            <Plus size={48} />
          </div>
          <h2 className="text-xl font-bold text-gray-300">Whiteboard Canvas Coming Soon</h2>
          <p className="text-sm text-gray-400 mt-2">The Real-Time Whiteboard engine is initializing...</p>
        </div>

        {/* Floating Toolbars Sidebar */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex flex-col gap-2 z-40">
          {['pointer', 'text', 'image', 'shape', 'pen', 'sticky'].map(tool => (
            <button
              key={tool}
              className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-400 hover:text-purple-600 transition-all"
            >
              <div className="w-6 h-6 border-2 border-current rounded-sm flex items-center justify-center opacity-50">
                {tool.charAt(0).toUpperCase()}
              </div>
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="absolute right-6 bottom-6 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center p-1 z-40">
          <button className="p-2 hover:bg-gray-50 text-gray-500 rounded-lg text-sm font-bold">—</button>
          <span className="px-3 text-xs font-black text-gray-400">100%</span>
          <button className="p-2 hover:bg-gray-50 text-gray-500 rounded-lg text-sm font-bold">+</button>
        </div>
      </main>

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
