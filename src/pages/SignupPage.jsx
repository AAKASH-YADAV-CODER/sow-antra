import React, { useState, createContext, useContext, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, CheckCircle, LogOut } from 'lucide-react';

// Auth Context
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

// User Storage (In-memory storage for demo - replace with actual backend)
const userStorage = {
  users: new Map(),
  
  register: (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const { email, password, name } = userData;
        
        if (userStorage.users.has(email)) {
          reject(new Error('User already exists with this email'));
          return;
        }
        
        const user = {
          id: Date.now().toString(),
          email,
          name,
          password, // In real app, this should be hashed
          createdAt: new Date().toISOString()
        };
        
        userStorage.users.set(email, user);
        
        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;
        resolve(userWithoutPassword);
      }, 1000);
    });
  },
  
  login: (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = userStorage.users.get(email);
        
        if (!user) {
          reject(new Error('No account found with this email address'));
          return;
        }
        
        if (user.password !== password) {
          reject(new Error('Incorrect password'));
          return;
        }
        
        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;
        resolve(userWithoutPassword);
      }, 1000);
    });
  },
  
  googleSignIn: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const googleUser = {
          id: Date.now().toString(),
          email: 'user@gmail.com',
          name: 'Google User',
          provider: 'google',
          createdAt: new Date().toISOString()
        };
        
        userStorage.users.set(googleUser.email, googleUser);
        resolve(googleUser);
      }, 1500);
    });
  }
};

// Main App Component
const App = () => {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [isLoading, setIsLoading] = useState(false);

  // Check for stored user session on app load
  useEffect(() => {
    const storedUser = sessionStorage.getItem('sowntra_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        sessionStorage.removeItem('sowntra_user');
      }
    }
  }, []);

  // Store user session when user changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('sowntra_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('sowntra_user');
    }
  }, [user]);

  const authContextValue = {
    user,
    setUser,
    currentPage,
    setCurrentPage,
    isLoading,
    setIsLoading
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <div className="min-h-screen bg-white">
        {user ? <Dashboard /> : <AuthContainer />}
      </div>
    </AuthContext.Provider>
  );
};

// Auth Container
const AuthContainer = () => {
  const { currentPage } = useAuth();
  
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-8">
            <span className="text-4xl font-bold text-white" style={{fontFamily: 'cursive'}}>S</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4" style={{fontFamily: 'cursive'}}>Sowntra</h1>
          <p className="text-xl text-white/80 mb-8">Design anything. Publish anywhere.</p>
          <div className="space-y-4 text-left">
            <div className="flex items-center text-white/90">
              <CheckCircle className="w-5 h-5 mr-3 text-green-300" />
              <span>Professional design tools</span>
            </div>
            <div className="flex items-center text-white/90">
              <CheckCircle className="w-5 h-5 mr-3 text-green-300" />
              <span>Thousands of templates</span>
            </div>
            <div className="flex items-center text-white/90">
              <CheckCircle className="w-5 h-5 mr-3 text-green-300" />
              <span>Collaborate in real-time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl mb-4">
              <span className="text-3xl font-bold text-white" style={{fontFamily: 'cursive'}}>S</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{fontFamily: 'cursive'}}>Sowntra</h1>
            <p className="text-gray-600">Design anything. Publish anywhere.</p>
          </div>

          {currentPage === 'login' ? <LoginForm /> : <SignupForm />}
        </div>
      </div>
    </div>
  );
};

// Login Form Component
const LoginForm = () => {
  const { setCurrentPage, setUser, isLoading, setIsLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const userData = await userStorage.login(formData.email, formData.password);
      setUser(userData);
    } catch (error) {
      setErrors({
        general: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const userData = await userStorage.googleSignIn();
      setUser(userData);
    } catch (error) {
      setErrors({
        general: 'Google sign-in failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="hidden lg:block mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Log in to Sowntra</h2>
        <p className="text-gray-600">Welcome back! Sign in to your account</p>
      </div>
      
      <div className="lg:hidden mb-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center">Welcome Back</h2>
      </div>
      
      <div className="space-y-4">
        {/* Error Message */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Google Sign In - Top */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
          ) : (
            <>
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 font-medium">Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="Enter your email"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors pr-12"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <button
            type="button"
            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            Forgot password?
          </button>
        </div>

        {/* Login Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            'Log in'
          )}
        </button>

        {/* Sign Up Link */}
        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => setCurrentPage('signup')}
            className="text-purple-600 hover:text-purple-800 font-semibold"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

// Signup Form Component
const SignupForm = () => {
  const { setCurrentPage, setUser, isLoading, setIsLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const userData = await userStorage.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      setUser(userData);
    } catch (error) {
      setErrors({
        general: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const userData = await userStorage.googleSignIn();
      setUser(userData);
    } catch (error) {
      setErrors({
        general: 'Google sign-in failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="hidden lg:block mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign up for Sowntra</h2>
        <p className="text-gray-600">Create your account and start designing</p>
      </div>
      
      <div className="lg:hidden mb-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center">Create Account</h2>
      </div>
      
      <div className="space-y-4">
        {/* Error Message */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Google Sign In - Top */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
          ) : (
            <>
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 font-medium">Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            placeholder="Enter your full name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors pr-12"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Sign Up Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            'Sign up'
          )}
        </button>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center">
          By continuing, you agree to Sowntra's{' '}
          <button className="text-purple-600 hover:underline bg-transparent border-none p-0 cursor-pointer">Terms of Service</button>{' '}
          and acknowledge you've read our{' '}
          <button className="text-purple-600 hover:underline bg-transparent border-none p-0 cursor-pointer">Privacy Policy</button>.
        </p>

        {/* Sign In Link */}
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => setCurrentPage('login')}
            className="text-purple-600 hover:text-purple-800 font-semibold"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

// Dashboard Component (after successful login)
const Dashboard = () => {
  const { user, setUser } = useAuth();
  
  const handleLogout = () => {
    setUser(null);
  };

  // Show user registration date
  const getJoinedDate = () => {
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'Today';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-purple-600">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-700 text-sm font-medium">{user.name || user.email}</span>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Sowntra, {user.name}!
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            You're all set! Start creating amazing designs with our powerful tools and templates.
          </p>
          <p className="text-sm text-gray-500 mb-12">
            Member since {getJoinedDate()}
          </p>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all cursor-pointer">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Designing</h3>
              <p className="text-gray-600 text-sm">Create a new design from scratch or choose a template</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all cursor-pointer">
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

          {/* Get Started Button */}
          <div className="mt-12">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;