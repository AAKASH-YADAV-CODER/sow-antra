import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Using environment variables for security (values from .env file)
// Fallback to your actual values if .env is not set up yet
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDQe5xUq-FbvCjmEdS7o1g4qLkBVQpDjQs",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "sowntra.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "sowntra",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "sowntra.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "511222821943",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:511222821943:web:857ec95d5409364a57bbb2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);

export default app;