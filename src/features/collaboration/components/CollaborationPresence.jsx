import React from 'react';
import { Users } from 'lucide-react';

/**
 * Component to display active collaborators and their cursors
 * Similar to Figma's collaboration features
 */
const CollaborationPresence = ({ 
  activeUsers = [], 
  cursors = new Map(),
  currentUser,
  onCanvasMouseMove,
  zoomLevel = 1,
  canvasOffset = { x: 0, y: 0 },
  canvasRef
}) => {
  // Get unique users (avoid duplicates)
  const uniqueUsers = activeUsers.reduce((acc, user) => {
    if (!acc.find(u => u.userId === user.userId || u.socketId === user.socketId)) {
      acc.push(user);
    }
    return acc;
  }, []);

  // Get user initials for avatar
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
      {/* Active Users List */}
      {uniqueUsers.length > 0 && (
        <div className="fixed top-20 right-4 z-50 bg-white rounded-lg shadow-lg p-3 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              {uniqueUsers.length} {uniqueUsers.length === 1 ? 'collaborator' : 'collaborators'}
            </h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uniqueUsers.map((user, index) => {
              const color = getUserColor(user);
              const initials = getUserInitials(user.userName || user.userEmail || 'Anonymous');
              
              return (
                <div
                  key={user.socketId || user.userId || index}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-50"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                    style={{ backgroundColor: color }}
                    title={user.userName || user.userEmail || 'Anonymous'}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.userName || user.userEmail || 'Anonymous'}
                      {currentUser && (user.userId === currentUser.uid || user.userEmail === currentUser.email) && (
                        <span className="text-xs text-gray-500 ml-1">(You)</span>
                      )}
                    </p>
                    {user.role && (
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    )}
                  </div>
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                    title="Active"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cursor Overlays */}
      {Array.from(cursors.entries()).map(([socketId, cursor]) => {
        // Filter out invalid cursors (stuck or undefined)
        if (!cursor || cursor.x === undefined || cursor.y === undefined || 
            isNaN(cursor.x) || isNaN(cursor.y)) return null;
        
        // Filter out current user's cursor
        if (currentUser && (
          (cursor.userId && cursor.userId === currentUser.uid) ||
          (cursor.userEmail && cursor.userEmail === currentUser.email)
        )) return null;
        
        const color = cursor.color || '#6366f1';
        const userName = cursor.userName || 'Anonymous';
        
        // Try to find canvas element - use ref if provided, otherwise query selector
        let canvasElement = null;
        if (canvasRef && canvasRef.current) {
          canvasElement = canvasRef.current;
        } else {
          canvasElement = document.querySelector('.bg-white.shadow-lg');
        }
        
        if (!canvasElement) {
          // Fallback: use fixed positioning relative to viewport
          // Cursor coordinates are in canvas space, convert to screen
          const adjustedX = window.innerWidth / 2 + (cursor.x * zoomLevel) + canvasOffset.x;
          const adjustedY = window.innerHeight / 2 + (cursor.y * zoomLevel) + canvasOffset.y;
          
          return (
            <div
              key={socketId}
              className="fixed pointer-events-none z-40"
              style={{
                left: `${adjustedX}px`,
                top: `${adjustedY}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" className="absolute" style={{ color }}>
                <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill={color} stroke="white" strokeWidth="1" />
              </svg>
              <div className="absolute top-6 left-0 whitespace-nowrap px-2 py-1 rounded text-xs font-medium text-white shadow-lg" style={{ backgroundColor: color }}>
                {userName}
              </div>
            </div>
          );
        }
        
        const canvasRect = canvasElement.getBoundingClientRect();
        
        // Convert canvas coordinates to screen coordinates
        // cursor.x and cursor.y are in canvas coordinate system (0 to canvasSize.width/height)
        // We need to apply zoom and offset, then add canvas position
        const adjustedX = canvasRect.left + (cursor.x * zoomLevel) + canvasOffset.x;
        const adjustedY = canvasRect.top + (cursor.y * zoomLevel) + canvasOffset.y;
        
        return (
          <div
            key={socketId}
            className="fixed pointer-events-none z-40"
            style={{
              left: `${adjustedX}px`,
              top: `${adjustedY}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Cursor */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              className="absolute"
              style={{ color }}
            >
              <path
                d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
                fill={color}
                stroke="white"
                strokeWidth="1"
              />
            </svg>
            
            {/* User Label */}
            <div
              className="absolute top-6 left-0 whitespace-nowrap px-2 py-1 rounded text-xs font-medium text-white shadow-lg"
              style={{ backgroundColor: color }}
            >
              {userName}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default CollaborationPresence;

