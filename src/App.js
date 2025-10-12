import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import MainPage from "./pages/MainPage";

function App() {
  return (
    <Router>
      <AuthProvider>
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
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
