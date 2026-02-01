import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import LoadingSpinner from "./components/common/LoadingSpinner";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Lazy load route components for better 
const SignupPage = lazy(() => import("./features/auth/components/SignupPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const MainPage = lazy(() => import("./pages/MainPage"));
const WhiteboardPage = lazy(() => import("./pages/WhiteboardPage"));
const InviteAcceptPage = lazy(() => import("./pages/InviteAcceptPage"));

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Suspense fallback={<LoadingSpinner message="Loading application..." />}>
            <Routes>
              <Route path="/" element={<SignupPage />} />
              <Route 
                path="/home" 
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/main" 
                element={
                  <ProtectedRoute>
                    <MainPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/whiteboard/:boardId" 
                element={
                  <ProtectedRoute>
                    <WhiteboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/invite/:token" 
                element={<InviteAcceptPage />} 
              />
            </Routes>
          </Suspense>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
