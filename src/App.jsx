import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout';
import { useAuth } from './hooks/useAuth';

// Pages
import Home from './pages/home/Home';
import About from './pages/home/About';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Gallery from './pages/gallery/Gallery';
import Dashboard from './pages/dashboard/Dashboard';
import EventsPage from './pages/events/EventsPage';
import EventDetailPage from './pages/events/EventDetailPage';
import EventFormPage from './pages/events/EventFormPage';
import EventAttendeesPage from './pages/events/EventAttendeesPage';

// Scroll to Top Component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fafaf9] via-[#f5f5f4] to-[#e7e5e4]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#6d2842]"></div>
          <p className="mt-4 text-[#2d2a27] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Don't show loading for public routes to prevent component unmounting
  // Just render children - the auth check will happen after mount
  if (loading) {
    return children;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<div className="container-custom py-20"><h1 className="text-4xl font-bold">Contact Page - Coming Soon</h1></div>} />
              <Route path="/store" element={<div className="container-custom py-20"><h1 className="text-4xl font-bold">Store Page - Coming Soon</h1></div>} />
              <Route path="/artists" element={<div className="container-custom py-20"><h1 className="text-4xl font-bold">Artists Page - Coming Soon</h1></div>} />
              
              {/* Events Routes */}
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:slug" element={<EventDetailPage />} />
              
              {/* Auth Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PublicRoute>
                    <ResetPassword />
                  </PublicRoute>
                }
              />

              {/* Protected Event Routes */}
              <Route
                path="/events/create"
                element={
                  <ProtectedRoute>
                    <EventFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/edit/:slug"
                element={
                  <ProtectedRoute>
                    <EventFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:slug/attendees"
                element={
                  <ProtectedRoute>
                    <EventAttendeesPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<div className="container-custom py-20 text-center"><h1 className="text-4xl font-bold">404 - Page Not Found</h1></div>} />
            </Routes>
          </Layout>
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              // Default options
              duration: 4000,
              style: {
                borderRadius: '12px',
                background: '#2d2a27',
                color: '#fafaf9',
                padding: '16px',
                boxShadow: '0 10px 25px -5px rgba(109, 40, 66, 0.3)',
                border: '1px solid #4a4642',
              },
              // Success toasts
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#70a596',
                  secondary: '#fafaf9',
                },
                style: {
                  borderLeft: '4px solid #70a596',
                },
              },
              // Error toasts
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fafaf9',
                },
                style: {
                  borderLeft: '4px solid #ef4444',
                },
              },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
