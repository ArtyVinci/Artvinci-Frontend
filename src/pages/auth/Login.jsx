import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { Mail, Lock, LogIn, Palette, Eye, EyeOff, AlertCircle, Scan } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail } from '../../utils/helpers';
import showToast from '../../services/toast';
import api from '../../services/api';
import { SimpleFaceCapture } from '../../components/common';

const Login = () => {
  const navigate = useNavigate();
  const { login, authenticateUser } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showFaceCapture, setShowFaceCapture] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
    setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!isValidEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      console.log('🔐 Login attempt:', formData.email);
      const result = await login(formData);
      
      if (result.success) {
        console.log('✅ Login successful');
        showToast.success('Welcome back to Artvinci!');
        navigate('/dashboard', { replace: true });
      } else {
        console.error('❌ Login failed:', result.error);
        const errorMessage = result.error || 'Login failed. Please check your credentials.';
        setApiError(errorMessage);
        showToast.error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Login exception:', error);
      const errorMessage = 'An error occurred during login.';
      setApiError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setApiError('');
      
      // Get Google OAuth URL from backend
      const response = await api.get('/auth/google/login/');
      const { auth_url } = response.data;
      
      // Redirect to Google OAuth
      window.location.href = auth_url;
    } catch (error) {
      console.error('❌ Google login error:', error);
      const errorMessage = 'Failed to initiate Google login';
      setApiError(errorMessage);
      showToast.error(errorMessage);
      setGoogleLoading(false);
    }
  };

  const handleFaceLogin = async (imageData) => {
    try {
      console.log('🔐 Face login attempt');
      const response = await api.post('/auth/face/login/', {
        image: imageData
      });

      if (response.data && response.data.tokens) {
        const { user, tokens, message, match_info } = response.data;
        
        // Authenticate user with tokens using auth context
        authenticateUser(user, tokens);
        
        console.log('✅ Face login successful:', match_info);
        
        // Show enhanced success message
        let successMessage = `Welcome back, ${user.first_name || user.email}!`;
        if (match_info?.method === 'profile_image') {
          successMessage += ' (Recognized from your profile photo)';
        }
        
        showToast.success(successMessage);
        setShowFaceCapture(false);
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('❌ Face login error:', error);
      let errorMsg = error.response?.data?.error || 'Face recognition failed';
      
      // Add debug info if available
      if (error.response?.data?.debug_info) {
        const debug = error.response.data.debug_info;
        console.log('Debug info:', debug);
        
        if (debug.users_checked === 0) {
          errorMsg = 'No registered faces found. Please register your face first or upload a profile photo.';
        } else {
          errorMsg += ` (Checked ${debug.users_checked} users, best match: ${debug.best_distance})`;
        }
      }
      
      showToast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafaf9] via-[#f5f5f3] to-[#e8e7e5] dark:from-[#1a1816] dark:via-[#2d2a27] dark:to-[#3a3633] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #6d2842 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6d2842]/5 via-transparent to-[#b8862f]/5 dark:from-[#6d2842]/10 dark:to-[#b8862f]/10"></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
          <div className="p-3 bg-gradient-to-br from-[#6d2842] to-[#a64d6d] rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
            <Palette className="w-8 h-8 text-white" />
          </div>
          <span className="text-3xl font-display font-extrabold bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] bg-clip-text text-transparent tracking-tight">
            Artvinci
          </span>
        </Link>

        <div className="bg-white/80 dark:bg-[#2d2a27]/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#e8e7e5] dark:border-[#4a4642] p-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-3 text-[#2d2a27] dark:text-[#fafaf9]">Welcome Back</h2>
            <p className="text-[#5d5955] dark:text-[#c4bfb9]">Sign in to your account</p>
          </div>

          <AnimatePresence>
            {apiError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-400 text-sm">{apiError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9b9791] dark:text-[#6d6762]" />
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3.5 bg-[#f5f5f3] dark:bg-[#1a1816] border rounded-xl transition-all text-[#2d2a27] dark:text-[#fafaf9] placeholder-[#9b9791] dark:placeholder-[#6d6762] outline-none ${errors.email ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-[#e8e7e5] dark:border-[#4a4642] focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343]'}`}
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9b9791] dark:text-[#6d6762]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3.5 bg-[#f5f5f3] dark:bg-[#1a1816] border rounded-xl transition-all text-[#2d2a27] dark:text-[#fafaf9] placeholder-[#9b9791] dark:placeholder-[#6d6762] outline-none ${errors.password ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-[#e8e7e5] dark:border-[#4a4642] focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343]'}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9b9791] dark:text-[#6d6762] hover:text-[#6d2842] dark:hover:text-[#d4a343] transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-[#e8e7e5] dark:border-[#4a4642] text-[#6d2842] focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343]" />
                <span className="ml-2 text-sm text-[#5d5955] dark:text-[#c4bfb9] group-hover:text-[#6d2842] dark:group-hover:text-[#d4a343] transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-[#6d2842] dark:text-[#d4a343] hover:text-[#a64d6d] dark:hover:text-[#b8862f] transition-colors">
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] hover:from-[#5a2338] hover:via-[#6d2842] hover:to-[#8b3654] text-white font-semibold rounded-xl shadow-lg shadow-[#6d2842]/30 hover:shadow-xl hover:shadow-[#6d2842]/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e8e7e5] dark:border-[#4a4642]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white dark:bg-[#2d2a27] text-[#9b9791] dark:text-[#6d6762] text-sm">Or continue with</span>
            </div>
          </div>

          {/* Google Login Button */}
          <motion.button
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-white dark:bg-[#1a1816] border-2 border-[#e8e7e5] dark:border-[#4a4642] hover:border-[#6d2842] dark:hover:border-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9] font-medium rounded-xl shadow-sm hover:shadow-md flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {googleLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-[#6d2842]/30 border-t-[#6d2842] rounded-full animate-spin" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </motion.button>

          {/* Face Recognition Login Button */}
          <motion.button
            onClick={() => setShowFaceCapture(true)}
            disabled={loading || googleLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-white dark:bg-[#1a1816] border-2 border-[#e8e7e5] dark:border-[#4a4642] hover:border-[#508978] dark:hover:border-[#70a596] text-[#2d2a27] dark:text-[#fafaf9] font-medium rounded-xl shadow-sm hover:shadow-md flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Scan className="w-5 h-5 text-[#508978] dark:text-[#70a596]" />
            <span>Sign in with Face Recognition</span>
          </motion.button>

          {/* Forgot Password Link - Removed duplicate */}

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#e8e7e5] dark:border-[#4a4642]"></div></div>
            <div className="relative flex justify-center"><span className="px-4 bg-white dark:bg-[#2d2a27] text-[#9b9791] dark:text-[#6d6762] text-sm">Don't have an account?</span></div>
          </div>

          <Link to="/signup">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-4 border-2 border-[#e8e7e5] dark:border-[#4a4642] hover:border-[#6d2842] dark:hover:border-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9] font-medium rounded-xl transition-all">
              Create Account
            </motion.button>
          </Link>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="text-sm text-[#5d5955] dark:text-[#c4bfb9] hover:text-[#6d2842] dark:hover:text-[#d4a343] font-medium transition-colors">
            ← Back to Home
          </Link>
        </div>
      </motion.div>

      {/* Face Capture Modal */}
      {showFaceCapture && (
        <SimpleFaceCapture
          onCapture={handleFaceLogin}
          onClose={() => setShowFaceCapture(false)}
          isRegistering={false}
          title="Face Recognition Login"
        />
      )}

    </div>
  );
};

export default Login;

