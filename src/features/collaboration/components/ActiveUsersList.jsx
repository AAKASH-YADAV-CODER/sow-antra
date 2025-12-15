import React, { useState } from 'react';
import { Users, X, User } from 'lucide-react';

/**
 * Component to display active collaborators in a room
 * Shows detailed list of who is currently collaborating
 */
const ActiveUsersList = ({ 
  activeUsers = [], 
  currentUser,
  boardMembers = [],
  totalMembers = 0
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Combine active users with board members for complete info
  const allUsers = activeUsers.map(activeUser => {
    const member = boardMembers.find(m => 
      m.email === activeUser.userEmail || 
      m.id === activeUser.userId
    );
    return {
      ...activeUser,
      role: activeUser.role || member?.role || 'viewer',
      name: activeUser.userName || member?.name || activeUser.userEmail || 'Anonymous',
      email: activeUser.userEmail || member?.email,
      isOnline: true
    };
  });

  // Add current user if not in active users
  const currentUserInList = allUsers.find(u => 
    u.userId === currentUser?.uid || 
    u.userEmail === currentUser?.email
  );

  if (!currentUserInList && currentUser) {
    const member = boardMembers.find(m => 
      m.email === currentUser.email
    );
    allUsers.unshift({
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email,
      userEmail: currentUser.email,
      color: '#8b5cf6',
      role: member?.role || 'viewer',
      name: currentUser.displayName || currentUser.email,
      email: currentUser.email,
      isOnline: true,
      isCurrentUser: true
    });
  }

  // Get user initials
  const getUserInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get user color
  const getUserColor = (user) => {
    return user.color || '#6366f1';
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        title="View active collaborators"
      >
        <Users className="w-4 h-4 text-gray-600" />
        <span className="text-sm text-gray-700 font-medium">
          {allUsers.length} {allUsers.length === 1 ? 'active' : 'active'}
        </span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Active Collaborators
                  </h2>
                  <p className="text-sm text-gray-500">
                    {allUsers.length} {allUsers.length === 1 ? 'person' : 'people'} in this room
                    {totalMembers > allUsers.length && (
                      <span> • {totalMembers} total {totalMembers === 1 ? 'member' : 'members'}</span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto p-4">
              {allUsers.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No active collaborators</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allUsers.map((user, index) => {
                    const color = getUserColor(user);
                    const initials = getUserInitials(user.name);
                    const isCurrentUser = user.isCurrentUser || 
                      (currentUser && (user.userId === currentUser.uid || user.userEmail === currentUser.email));
                    
                    return (
                      <div
                        key={user.socketId || user.userId || index}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          isCurrentUser 
                            ? 'bg-purple-50 border-purple-200' 
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative">
                          <div
                            className="w-10 h-10 rounded-full text-white text-sm font-semibold flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: color }}
                          >
                            {initials}
                          </div>
                          {/* Online indicator */}
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.name}
                            </p>
                            {isCurrentUser && (
                              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {user.email && (
                              <p className="text-xs text-gray-500 truncate">
                                {user.email}
                              </p>
                            )}
                            {user.role && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs text-gray-500 capitalize">
                                  {user.role}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-green-700">Active</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                All changes are synced in real-time. You can see other collaborators' cursors on the canvas.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActiveUsersList;

