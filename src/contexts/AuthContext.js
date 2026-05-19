import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const AuthContext = createContext();
const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:4001').trim();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const syncUserWithBackend = async (token, { strict = false } = {}) => {
  const maxAttempts = strict ? 12 : 8;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/sync`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        return {
          role: data?.role || 'NORMAL',
          dbUserId: data?.dbUserId || null,
          synced: true
        };
      }
      const errBody = await response.text().catch(() => '');
      console.warn(`[sync] attempt ${attempt}/${maxAttempts} failed`, response.status, errBody);
    } catch (error) {
      if (attempt === maxAttempts) {
        console.error('Failed to sync user with backend:', error);
      }
    }
    if (attempt < maxAttempts) {
      await wait(Math.min(350 * attempt, 2800));
    }
  }

  if (strict) {
    throw new Error('Unable to sync your account with server. Please try again.');
  }

  return { role: 'NORMAL', dbUserId: null, synced: false };
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('sowntra_auth_token');
    const storedUser = localStorage.getItem('sowntra_user');

    if (storedToken && storedUser && storedUser !== 'undefined') {
      try {
        setAuthToken(storedToken);
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('sowntra_auth_token');
        localStorage.removeItem('sowntra_user');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken(true);
          const synced = await syncUserWithBackend(token, { strict: false });
          if (!synced.synced) {
            console.error(
              'Could not persist your account on the server. Check backend is running and migrations are applied.'
            );
            setCurrentUser(null);
            setAuthToken(null);
            localStorage.removeItem('sowntra_auth_token');
            localStorage.removeItem('sowntra_user');
          } else {
            const userData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              emailVerified: user.emailVerified,
              role: synced.role,
              dbUserId: synced.dbUserId
            };

            setCurrentUser(userData);
            setAuthToken(token);

            localStorage.setItem('sowntra_auth_token', token);
            localStorage.setItem('sowntra_user', JSON.stringify(userData));
          }
        } catch (error) {
          console.error('Error getting token:', error);
          setCurrentUser(null);
          setAuthToken(null);
          localStorage.removeItem('sowntra_auth_token');
          localStorage.removeItem('sowntra_user');
        }
      } else {
        setCurrentUser(null);
        setAuthToken(null);
        localStorage.removeItem('sowntra_auth_token');
        localStorage.removeItem('sowntra_user');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }

      await userCredential.user.reload();
      const token = await userCredential.user.getIdToken(true);
      const synced = await syncUserWithBackend(token, { strict: true });
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName || userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified,
        role: synced.role,
        dbUserId: synced.dbUserId
      };

      setCurrentUser(userData);
      setAuthToken(token);

      localStorage.setItem('sowntra_auth_token', token);
      localStorage.setItem('sowntra_user', JSON.stringify(userData));

      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken(true);
      const synced = await syncUserWithBackend(token, { strict: true });
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified,
        role: synced.role,
        dbUserId: synced.dbUserId
      };

      setCurrentUser(userData);
      setAuthToken(token);

      localStorage.setItem('sowntra_auth_token', token);
      localStorage.setItem('sowntra_user', JSON.stringify(userData));

      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const token = await userCredential.user.getIdToken(true);
      const synced = await syncUserWithBackend(token, { strict: true });
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified,
        role: synced.role,
        dbUserId: synced.dbUserId
      };

      setCurrentUser(userData);
      setAuthToken(token);

      localStorage.setItem('sowntra_auth_token', token);
      localStorage.setItem('sowntra_user', JSON.stringify(userData));

      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setAuthToken(null);
      localStorage.removeItem('sowntra_auth_token');
      localStorage.removeItem('sowntra_user');
    } catch (error) {
      throw error;
    }
  };

  const refreshToken = async () => {
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken(true);
        setAuthToken(token);
        localStorage.setItem('sowntra_auth_token', token);
        return token;
      } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
      }
    }
  };

  const syncCurrentUserRole = async ({ strict = false } = {}) => {
    if (!auth.currentUser) return null;
    const token = await auth.currentUser.getIdToken(true);
    const synced = await syncUserWithBackend(token, { strict });
    const userData = {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: auth.currentUser.displayName,
      photoURL: auth.currentUser.photoURL,
      emailVerified: auth.currentUser.emailVerified,
      role: synced.role,
      dbUserId: synced.dbUserId
    };

    setCurrentUser(userData);
    setAuthToken(token);
    localStorage.setItem('sowntra_auth_token', token);
    localStorage.setItem('sowntra_user', JSON.stringify(userData));
    return userData;
  };

  const value = {
    currentUser,
    authToken,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    refreshToken,
    syncCurrentUserRole,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

