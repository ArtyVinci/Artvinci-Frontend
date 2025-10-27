import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, UserPlus, Palette, Eye, EyeOff, AlertCircle, CheckCircle2, Briefcase, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail, isValidPassword } from '../../utils/helpers';
import { ELEGANT_STYLES } from '../../utils/elegantTheme';
import { OTPModal } from '../../components/common';
import { authService } from '../../services/api';
import showToast from '../../services/toast';
import api from '../../services/api';

const Signup = () => {
  const navigate = useNavigate();
  const { register, authenticateWithTokens, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    role: 'visitor',
    bio: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // Check for pending verification on mount
  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingVerificationEmail');
    if (pendingEmail) {
      console.log('🔄 Found pending verification for:', pendingEmail);
      setRegisteredEmail(pendingEmail);
      setShowOTPModal(true);
    }
  }, []);

  const roles = [
    { 
      value: 'visitor', 
      label: 'Art Lover', 
      icon: Sparkles,
      description: 'Browse and purchase artworks',
      color: 'from-[#508978] to-[#70a596]' // Sage green
    },
    { 
      value: 'artist', 
      label: 'Artist', 
      icon: Palette,
      description: 'Showcase and sell your art',
      color: 'from-[#6d2842] to-[#a64d6d]' // Burgundy
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleRoleSelect = (roleValue) => {
    console.log('🎭 Role selected:', roleValue);
    setFormData(prev => ({ ...prev, role: roleValue }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      console.warn('⚠️ Validation failed:', errors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      console.log('📝 Signup attempt:', {
        username: formData.username,
        email: formData.email,
        role: formData.role,
      });

      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        first_name: formData.first_name || '',
        last_name: formData.last_name || '',
        role: formData.role,
        bio: formData.bio || '',
      };

      const result = await register(registrationData);
      
      if (result.success) {
        console.log('✅ Signup successful');
        console.log('🔍 Result data:', result);
        console.log('🔍 requiresVerification:', result.requiresVerification);
        console.log('🔍 email:', result.email);
        
        // Check if verification is required
        if (result.requiresVerification) {
          console.log('📧 Email verification required');
          const emailToUse = result.email || formData.email;
          console.log('📧 Storing email in localStorage:', emailToUse);
          
          // Store in localStorage - will persist across component unmount/remount
          localStorage.setItem('pendingVerificationEmail', emailToUse);
          setRegisteredEmail(emailToUse);
          setShowOTPModal(true);
          
          showToast.success('Account created! Check your email for verification code.');
        } else {
          // Legacy: direct login (if backend returns tokens)
          console.log('✅ User authenticated directly');
          showToast.success('Account created successfully!');
          navigate('/dashboard', { replace: true });
        }
      } else {
        console.error('❌ Signup failed:', result.error, result.errors);
        
        // Handle backend validation errors
        if (result.errors && typeof result.errors === 'object') {
          const backendErrors = {};
          Object.keys(result.errors).forEach(key => {
            if (Array.isArray(result.errors[key])) {
              backendErrors[key] = result.errors[key][0];
            } else {
              backendErrors[key] = result.errors[key];
            }
          });
          setErrors(backendErrors);
          
          // Show the first error as toast
          if (!result.error) {
            const firstError = Object.values(backendErrors)[0];
            const errorMessage = firstError || 'Registration failed. Please check your information.';
            setApiError(errorMessage);
            showToast.error(errorMessage);
          } else {
            setApiError(result.error);
            showToast.error(result.error);
          }
        } else {
          const errorMessage = result.error || 'Registration failed. Please try again.';
          setApiError(errorMessage);
          showToast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('❌ Signup exception:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setApiError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);
      setApiError('');
      
      // Get Google OAuth URL from backend
      const response = await api.get('/auth/google/login/');
      const { auth_url } = response.data;
      
      // Redirect to Google OAuth
      window.location.href = auth_url;
    } catch (error) {
      console.error('❌ Google signup error:', error);
      const errorMessage = 'Failed to initiate Google signup';
      setApiError(errorMessage);
      showToast.error(errorMessage);
      setGoogleLoading(false);
    }
  };

  const handleVerifyOTP = async (code) => {
    try {
      const result = await authService.verifyOTP({
        email: registeredEmail,
        code: code
      });
      
      // Authenticate user with returned data
      if (result.user && result.tokens) {
        // Clear pending verification from localStorage
        localStorage.removeItem('pendingVerificationEmail');
        
        authenticateWithTokens(result.user, result.tokens);
        showToast.success('Email verified successfully! Welcome to Artvinci.');
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Invalid verification code';
      showToast.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const handleResendOTP = async () => {
    try {
      await authService.sendOTP(registeredEmail);
      showToast.success('Verification code resent! Check your email.');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to resend code';
      showToast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleOTPModalClose = () => {
    console.log('🔒 Closing OTP modal and clearing localStorage');
    localStorage.removeItem('pendingVerificationEmail');
    setShowOTPModal(false);
    setRegisteredEmail('');
    // Navigate to dashboard after successful verification
    navigate('/dashboard', { replace: true });
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full relative z-10"
      >
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
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-3 text-[#2d2a27] dark:text-[#fafaf9]">
              Join Artvinci
            </h2>
            <p className="text-[#5d5955] dark:text-[#c4bfb9] text-lg">
              Create your account and start your art journey
            </p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-400 text-sm font-medium">{apiError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Role Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-4">
              I want to join as
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = formData.role === role.value;
                
                return (
                  <motion.button
                    key={role.value}
                    type="button"
                    onClick={() => handleRoleSelect(role.value)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative p-5 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-[#6d2842] dark:border-[#d4a343] bg-[#f5f5f3] dark:bg-[#1a1816] shadow-lg'
                        : 'border-[#e8e7e5] dark:border-[#4a4642] hover:border-[#6d2842] dark:hover:border-[#d4a343] hover:shadow-md bg-white dark:bg-[#2d2a27]'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[#6d2842] dark:text-[#d4a343]" />
                      </motion.div>
                    )}
                    
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-base font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-1">
                      {role.label}
                    </h3>
                    <p className="text-xs text-[#5d5955] dark:text-[#c4bfb9]">
                      {role.description}
                    </p>
                  </motion.button>
                );
              })}
            </div>
            {errors.role && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.role}
              </motion.p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9b9791] dark:text-[#6d6762]" />
                <input
                  type="text"
                  name="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3.5 bg-[#f5f5f3] dark:bg-[#1a1816] border rounded-xl transition-all text-[#2d2a27] dark:text-[#fafaf9] placeholder-[#9b9791] dark:placeholder-[#6d6762] outline-none ${
                    errors.username
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                      : 'border-[#e8e7e5] dark:border-[#4a4642] focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343]'
                  }`}
                />
              </div>
              {errors.username && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.username}
                </motion.p>
              )}
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9b9791] dark:text-[#6d6762]" />
                  <input
                    type="text"
                    name="first_name"
                    placeholder="John"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3.5 bg-[#f5f5f3] dark:bg-[#1a1816] border rounded-xl transition-all text-[#2d2a27] dark:text-[#fafaf9] placeholder-[#9b9791] dark:placeholder-[#6d6762] outline-none ${
                      errors.first_name
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                        : 'border-[#e8e7e5] dark:border-[#4a4642] focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343]'
                    }`}
                  />
                </div>
                {errors.first_name && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.first_name}
                  </motion.p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9b9791] dark:text-[#6d6762]" />
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3.5 bg-[#f5f5f3] dark:bg-[#1a1816] border rounded-xl transition-all text-[#2d2a27] dark:text-[#fafaf9] placeholder-[#9b9791] dark:placeholder-[#6d6762] outline-none ${
                      errors.last_name
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                        : 'border-[#e8e7e5] dark:border-[#4a4642] focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343]'
                    }`}
                  />
                </div>
                {errors.last_name && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.last_name}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9b9791] dark:text-[#6d6762]" />
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3.5 bg-[#f5f5f3] dark:bg-[#1a1816] border rounded-xl transition-all text-[#2d2a27] dark:text-[#fafaf9] placeholder-[#9b9791] dark:placeholder-[#6d6762] outline-none ${
                    errors.email
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                      : 'border-[#e8e7e5] dark:border-[#4a4642] focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343]'
                  }`}
                />
              </div>
              {errors.email && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9b9791] dark:text-[#6d6762]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3.5 bg-[#f5f5f3] dark:bg-[#1a1816] border rounded-xl transition-all text-[#2d2a27] dark:text-[#fafaf9] placeholder-[#9b9791] dark:placeholder-[#6d6762] outline-none ${
                    errors.password
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                      : 'border-[#e8e7e5] dark:border-[#4a4642] focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9b9791] dark:text-[#6d6762] hover:text-[#6d2842] dark:hover:text-[#d4a343] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9b9791] dark:text-[#6d6762]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3.5 bg-[#f5f5f3] dark:bg-[#1a1816] border rounded-xl transition-all text-[#2d2a27] dark:text-[#fafaf9] placeholder-[#9b9791] dark:placeholder-[#6d6762] outline-none ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                      : 'border-[#e8e7e5] dark:border-[#4a4642] focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9b9791] dark:text-[#6d6762] hover:text-[#6d2842] dark:hover:text-[#d4a343] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </motion.p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 rounded border-[#e8e7e5] dark:border-[#4a4642] text-[#6d2842] focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343]"
              />
              <label className="ml-3 text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                I agree to the{' '}
                <Link to="/terms" className="text-[#6d2842] dark:text-[#d4a343] hover:underline font-semibold">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-[#6d2842] dark:text-[#d4a343] hover:underline font-semibold">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
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
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Account</span>
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
              <span className="px-4 bg-white dark:bg-[#2d2a27] text-[#9b9791] dark:text-[#6d6762] text-sm">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Signup Button */}
          <motion.button
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-white dark:bg-[#1a1816] border-2 border-[#e8e7e5] dark:border-[#4a4642] hover:border-[#6d2842] dark:hover:border-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9] font-medium rounded-xl shadow-sm hover:shadow-md flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-6"
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
                <span>Sign up with Google</span>
              </>
            )}
          </motion.button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e8e7e5] dark:border-[#4a4642]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white dark:bg-[#2d2a27] text-[#9b9791] dark:text-[#6d6762] text-sm font-medium">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link to="/login">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 border-2 border-[#e8e7e5] dark:border-[#4a4642] hover:border-[#6d2842] dark:hover:border-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9] font-medium rounded-xl transition-all"
            >
              Log In
            </motion.button>
          </Link>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="text-sm text-[#5d5955] dark:text-[#c4bfb9] hover:text-[#6d2842] dark:hover:text-[#d4a343] font-medium transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>

      {/* OTP Verification Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={handleOTPModalClose}
        email={registeredEmail}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
      />
    </div>
  );
};

export default Signup;
