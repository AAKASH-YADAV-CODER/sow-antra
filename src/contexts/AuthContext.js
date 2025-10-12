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
    
    if (storedToken && storedUser) {
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
          const token = await user.getIdToken();
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified
          };
          
          setCurrentUser(userData);
          setAuthToken(token);
          
          localStorage.setItem('sowntra_auth_token', token);
          localStorage.setItem('sowntra_user', JSON.stringify(userData));
        } catch (error) {
          console.error('Error getting token:', error);
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
      
      const token = await userCredential.user.getIdToken();
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName || userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified
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
      const token = await userCredential.user.getIdToken();
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified
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
      const token = await userCredential.user.getIdToken();
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified
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

  const value = {
    currentUser,
    authToken,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    refreshToken,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

