import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import UserFeedPage from "./pages/UserFeedPage";
import Login from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

import theme from "./theme/theme";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import BottomNav from "./components/BottomNav";


// Layout for all protected pages
const ProtectedLayout = ({ children }) => (
  <>
    {children}
    <BottomNav />
  </>
);

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/register" element={<SignUpPage />} />
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />

            {/* Protected */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <FeedPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <ProfilePage />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/:userId/feed"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <UserFeedPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
