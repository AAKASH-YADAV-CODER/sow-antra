import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { boardAPI, invitationAPI, projectAPI } from '../services/api';
import collaborationService from '../services/collaboration';
import MainPage from './MainPage';
import { 
  Users, Mail, ArrowLeft
} from 'lucide-react';
import ActiveUsersList from '../features/collaboration/components/ActiveUsersList';

const WhiteboardPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [userRole, setUserRole] = useState('viewer');
  const [projectDataLoaded, setProjectDataLoaded] = useState(false);
  const [boardMembers, setBoardMembers] = useState([]);

  // Load board data and project data
  useEffect(() => {
    const loadBoardData = async () => {
      if (!boardId || !currentUser) return;

      try {
        // Load board information
        const boardResponse = await boardAPI.getBoard(boardId);
        const boardData = boardResponse.data;
        setBoard(boardData);
        
        // Determine user role
        const isOwner = boardData.owner?.firebaseUid === currentUser?.uid;
        const member = boardData.members?.find(m => 
          m.user?.email === currentUser?.email || m.user?.firebaseUid === currentUser?.uid
        );
        const role = isOwner ? 'owner' : (member?.role || 'viewer');
        setUserRole(role);
        
        // Store board members for display
        if (boardData.members) {
          setBoardMembers(boardData.members.map(m => ({
            id: m.user?.id,
            name: m.user?.name || m.user?.email || 'Anonymous',
            email: m.user?.email,
            role: m.role,
            joinedAt: m.joinedAt,
            profileImage: m.user?.profileImage
          })));
        }

        // Load project data from board
        try {
          const projectResponse = await projectAPI.loadBoardProject(boardId);
          const { projectData } = projectResponse.data;
          
          if (projectData) {
            // Set project data in URL params so MainPage can load it
            const params = new URLSearchParams();
            params.set('project', boardId);
            if (projectData.pages) params.set('pages', JSON.stringify(projectData.pages));
            if (projectData.currentPage) params.set('currentPage', projectData.currentPage);
            setSearchParams(params, { replace: true });
          } else {
            // No project data yet, just set the boardId
            setSearchParams({ project: boardId }, { replace: true });
          }
          setProjectDataLoaded(true);
        } catch (projectError) {
          console.error('Error loading project data:', projectError);
          // Still allow access, just without project data
          setSearchParams({ project: boardId }, { replace: true });
          setProjectDataLoaded(true);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading board:', error);
        setLoading(false);
      }
    };

    loadBoardData();
  }, [boardId, currentUser, setSearchParams]);

  // Initialize collaboration
  useEffect(() => {
    if (!boardId || !currentUser || !projectDataLoaded) return;

    // Connect to collaboration service
    collaborationService.connect(
      boardId,
      currentUser.uid,
      currentUser.displayName || currentUser.email,
      currentUser.email
    );

    // Listen to collaboration events
    collaborationService.on('active-users', (users) => {
      // Replace the entire list to avoid duplicates on refresh
      const usersArray = Array.isArray(users) ? users : [];
      // Deduplicate by socketId, userId, or userEmail
      const uniqueUsers = usersArray.reduce((acc, user) => {
        const key = user.socketId || user.userId || user.userEmail;
        if (key && !acc.find(u => 
          u.socketId === user.socketId || 
          (u.userId && user.userId && u.userId === user.userId) ||
          (u.userEmail && user.userEmail && u.userEmail === user.userEmail)
        )) {
          acc.push(user);
        }
        return acc;
      }, []);
      setActiveUsers(uniqueUsers);
    });

    collaborationService.on('user-joined', (user) => {
      setActiveUsers(prev => {
        // Check if user already exists to avoid duplicates
        const exists = prev.find(u => 
          u.socketId === user.socketId || 
          (u.userId && user.userId && u.userId === user.userId) ||
          (u.userEmail && user.userEmail && u.userEmail === user.userEmail)
        );
        if (exists) {
          // Update existing user instead of adding duplicate
          return prev.map(u => 
            (u.socketId === user.socketId || 
             (u.userId && user.userId && u.userId === user.userId) ||
             (u.userEmail && user.userEmail && u.userEmail === user.userEmail))
              ? { ...u, ...user } 
              : u
          );
        }
        return [...prev, user];
      });
    });

    collaborationService.on('user-left', (data) => {
      setActiveUsers(prev => prev.filter(u => 
        u.socketId !== data.socketId &&
        !(data.userId && u.userId === data.userId) &&
        !(data.userEmail && u.userEmail === data.userEmail)
      ));
    });

    collaborationService.on('user-role', (data) => {
      if (data.role) {
        setUserRole(data.role);
      }
    });

    return () => {
      collaborationService.disconnect();
    };
  }, [boardId, currentUser, projectDataLoaded]);

  // Send invitation
  const handleSendInvitation = async () => {
    if (!inviteEmail.trim()) return;

    setSendingInvite(true);
    try {
      await invitationAPI.sendInvitation(boardId, inviteEmail.trim(), inviteRole);
      alert('Invitation sent successfully!');
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (error) {
      console.error('Error sending invitation:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send invitation';
      alert(errorMessage);
    } finally {
      setSendingInvite(false);
    }
  };

  if (loading || !projectDataLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading board...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Board not found</p>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const canEdit = userRole === 'owner' || userRole === 'editor';

  return (
    <div className="h-screen flex flex-col">
      {/* Collaboration Header Overlay */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/home')}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">{board.title}</h1>
            {board.description && (
              <p className="text-xs text-gray-500">{board.description}</p>
            )}
            {boardMembers.length > 0 && (
              <div className="mt-1">
                <p className="text-xs text-gray-500">
                  {boardMembers.length} {boardMembers.length === 1 ? 'member' : 'members'} • 
                  {boardMembers.filter(m => m.role === 'editor').length} editor
                  {boardMembers.filter(m => m.role === 'viewer').length > 0 && 
                    ` • ${boardMembers.filter(m => m.role === 'viewer').length} viewer`}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Active Users List - Clickable to see details */}
          <ActiveUsersList
            activeUsers={activeUsers}
            currentUser={currentUser}
            boardMembers={boardMembers}
            totalMembers={boardMembers.length}
          />

          {/* Invite Button */}
          {canEdit && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
            >
              <Mail className="w-4 h-4" />
              <span>Invite</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Page Content - offset by header height */}
      <div className="flex-1 pt-16 overflow-hidden">
        <MainPage />
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Invite by Email</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && inviteEmail.trim() && !sendingInvite) {
                    handleSendInvitation();
                  }
                }}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            {/* Board Members List */}
            {boardMembers.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Members ({boardMembers.length})
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-2 bg-gray-50">
                  {boardMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-white rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-semibold">
                          {(member.name || member.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name || member.email}</p>
                          <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvitation}
                disabled={sendingInvite || !inviteEmail.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingInvite ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhiteboardPage;
