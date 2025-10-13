import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, CheckCircle, LogOut, FolderOpen, Clock, Trash2 } from 'lucide-react';
import { projectAPI } from '../services/api';

const HomePage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showProjects, setShowProjects] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

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
    navigate(`/main?project=${projectId}`);
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
                  <span className="text-lg font-bold text-white" style={{fontFamily: 'cursive'}}>S</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900" style={{fontFamily: 'cursive'}}>Sowntra</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {currentUser?.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">
                      {getUserInitial()}
                    </span>
                  </div>
                )}
                <span className="text-gray-700 text-sm font-medium hidden sm:inline">
                  {getUserDisplayName()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Sowntra{currentUser?.displayName ? `, ${currentUser.displayName.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            You're all set! Start creating amazing designs with our powerful tools and templates.
          </p>
          <p className="text-sm text-gray-500 mb-12">
            Member since {getJoinedDate()}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div 
              onClick={handleStartDesigning}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Designing</h3>
              <p className="text-gray-600 text-sm">Create a new design from scratch or choose a template</p>
            </div>
            
            <div 
              onClick={handleMyProjects}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">📁</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">My Projects</h3>
              <p className="text-gray-600 text-sm">Access your saved designs and continue working</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all cursor-pointer">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Collaboration</h3>
              <p className="text-gray-600 text-sm">Invite team members and work together in real-time</p>
            </div>
          </div>

          <div className="mt-12">
            <button 
              onClick={handleGetStarted}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </main>

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

