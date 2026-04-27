import React, { Suspense } from "react";
import lazyWithRetry from "./utils/lazyWithRetry";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import LoadingSpinner from "./components/common/LoadingSpinner";
import ErrorBoundary from "./components/common/ErrorBoundary";
import CreatorsDiscoveryPage from "./pages/CreatorsDiscoveryPage.jsx";
import CreatorsDashboard from "./pages/CreatorsDashboard.jsx";
import CreatorProfilePage from "./pages/CreatorProfilePage.jsx";

console.log('--- Sowntra MP v1.1 - Refined Pen Tool Loaded ---');

// Lazy load route components with retry logic to handle ChunkLoadError
const SignupPage = lazyWithRetry(() => import("./features/auth/components/SignupPage"));
const HomePage = lazyWithRetry(() => import("./pages/HomePage"));
const MainPage = lazyWithRetry(() => import("./pages/MainPage"));
const WhiteboardPage = lazyWithRetry(() => import("./pages/WhiteboardPage"));
const InviteAcceptPage = lazyWithRetry(() => import("./pages/InviteAcceptPage"));
const BrandKitPage = lazyWithRetry(() => import("./pages/BrandKitPage"));
const BrandKitDetailPage = lazyWithRetry(() => import("./pages/BrandKitDetailPage"));

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
              <Route
                path="/brand-kit"
                element={
                  <ProtectedRoute>
                    <BrandKitPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/brand-kit/:id"
                element={
                  <ProtectedRoute>
                    <BrandKitDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/creators"
                element={
                  <ProtectedRoute>
                    <CreatorsDiscoveryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/creators/dashboard"
                element={
                  <ProtectedRoute>
                    <CreatorsDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/creators/profile/:id"
                element={
                  <ProtectedRoute>
                    <CreatorProfilePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
