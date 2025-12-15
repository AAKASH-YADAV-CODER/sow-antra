import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { invitationAPI } from '../services/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const InviteAcceptPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('validating'); // validating, valid, invalid, accepted, expired
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleInvitation = async () => {
      if (!token) {
        setStatus('invalid');
        setError('No invitation token provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Validating invitation token:', token);
        // First, validate the invitation token
        const validateResponse = await invitationAPI.validateInvitation(token);
        
        console.log('Validation response:', validateResponse.data);
        
        if (validateResponse.data.success) {
          setInvitation(validateResponse.data.invitation);
          setStatus('valid');

          // If user is logged in, automatically accept
          if (isAuthenticated && currentUser) {
            // Call acceptInvitation after a short delay to ensure state is set
            setTimeout(async () => {
              await acceptInvitation();
            }, 100);
          }
        } else {
          setStatus('invalid');
          setError(validateResponse.data.message || 'Invalid invitation');
        }
      } catch (error) {
        console.error('Error validating invitation:', error);
        console.error('Error details:', {
          response: error.response?.data,
          status: error.response?.status,
          message: error.message
        });
        
        setStatus('invalid');
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error ||
                           error.message || 
                           'Failed to validate invitation';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    handleInvitation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAuthenticated, currentUser]);

  const acceptInvitation = useCallback(async () => {
    if (!token) {
      setError('No invitation token provided');
      return;
    }

    try {
      setLoading(true);
      console.log('Accepting invitation with token:', token);
      console.log('Current user:', currentUser);
      console.log('Invitation details:', invitation);
      const response = await invitationAPI.acceptInvitation(token);
      
      console.log('Accept invitation response:', response.data);
      
      if (response.data.success) {
        setStatus('accepted');
        
        // Redirect to whiteboard after a short delay
        setTimeout(() => {
          if (response.data.board) {
            navigate(`/whiteboard/${response.data.board.id}`);
          } else {
            navigate('/home');
          }
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to accept invitation');
        setStatus('error');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      console.error('Error details:', {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Failed to accept invitation';
      setError(errorMessage);
      setStatus('error');
      
      // If it's a 403 error about email mismatch, show a more helpful message
      if (error.response?.status === 403) {
        console.error('403 Forbidden - Email mismatch or permission issue');
        console.error('User email:', currentUser?.email);
        console.error('Invitation email:', invitation?.email);
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate, currentUser, invitation]);

  const handleLoginRedirect = () => {
    // Store the invitation token in localStorage to accept after login
    localStorage.setItem('pending_invitation_token', token);
    navigate('/');
  };

  if (loading || status === 'validating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (status === 'invalid' || status === 'expired' || status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'error' ? 'Error Accepting Invitation' : 'Invalid Invitation'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'This invitation link is invalid or has expired.'}
          </p>
          {status === 'error' && invitation && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Invitation Details:</strong>
              </p>
              <p className="text-sm text-gray-600">
                Invited email: <strong>{invitation.email}</strong>
              </p>
              {currentUser && (
                <p className="text-sm text-gray-600 mt-1">
                  Your email: <strong>{currentUser.email}</strong>
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                If these emails don't match, please log out and log in with the correct email address.
              </p>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Go to Home
            </button>
            {status === 'error' && (
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Accepted!</h1>
          <p className="text-gray-600 mb-6">
            You've been added to the workspace. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  // Valid invitation, user not logged in
  if (status === 'valid' && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You've Been Invited!</h1>
            {invitation?.board && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Workspace:</p>
                <p className="font-semibold text-gray-900">{invitation.board.title}</p>
                {invitation.board.description && (
                  <p className="text-sm text-gray-600 mt-1">{invitation.board.description}</p>
                )}
                {invitation.board.owner && (
                  <p className="text-sm text-gray-500 mt-2">
                    Invited by: {invitation.board.owner.name || invitation.board.owner.email}
                  </p>
                )}
              </div>
            )}
            <p className="text-gray-600 mt-4">
              Please log in or sign up to accept this invitation and join the workspace.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleLoginRedirect}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
            >
              Log In / Sign Up
            </button>
            <button
              onClick={() => navigate('/home')}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Valid invitation, user logged in but not yet accepted
  if (status === 'valid' && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Accept Invitation</h1>
            {invitation?.board && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Workspace:</p>
                <p className="font-semibold text-gray-900">{invitation.board.title}</p>
                {invitation.board.description && (
                  <p className="text-sm text-gray-600 mt-1">{invitation.board.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Role: <span className="font-semibold capitalize">{invitation.role}</span>
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={acceptInvitation}
              disabled={loading}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold disabled:opacity-50"
            >
              {loading ? 'Accepting...' : 'Accept Invitation'}
            </button>
            <button
              onClick={() => navigate('/home')}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InviteAcceptPage;
