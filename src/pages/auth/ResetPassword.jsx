import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fafaf9] via-[#f5f5f3] to-[#e8e7e5] dark:from-[#1a1816] dark:via-[#2d2a27] dark:to-[#3a3633] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-[#2d2a27] rounded-3xl shadow-2xl border border-[#e8e7e5] dark:border-[#4a4642] p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#508978] to-[#70a596] rounded-full mb-6 shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-3">
              Password Reset Successful!
            </h2>
            
            <p className="text-[#5d5955] dark:text-[#c4bfb9] mb-6">
              Your password has been reset successfully. Redirecting to login...
            </p>
            
            <div className="w-8 h-8 mx-auto border-4 border-[#508978]/30 border-t-[#508978] rounded-full animate-spin"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafaf9] via-[#f5f5f3] to-[#e8e7e5] dark:from-[#1a1816] dark:via-[#2d2a27] dark:to-[#3a3633] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white dark:bg-[#2d2a27] rounded-3xl shadow-2xl border border-[#e8e7e5] dark:border-[#4a4642] p-8">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#6d2842] to-[#a64d6d] rounded-full mb-6 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-2">
            Reset Password
          </h2>
          <p className="text-[#5d5955] dark:text-[#c4bfb9] mb-8">
            Enter your new password below.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9b9791] dark:text-[#6d6762]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="w-full pl-12 pr-12 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl text-[#2d2a27] dark:text-[#fafaf9] placeholder-[#9b9791] dark:placeholder-[#6d6762] focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9b9791] dark:text-[#6d6762] hover:text-[#6d2842] dark:hover:text-[#d4a343] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-[#9b9791] dark:text-[#6d6762]">
                Must be at least 8 characters
              </p>
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  className="w-full pl-12 pr-12 py-3 bg-[#f5f5f3] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl text-[#2d2a27] dark:text-[#fafaf9] placeholder-[#9b9791] dark:placeholder-[#6d6762] focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9b9791] dark:text-[#6d6762] hover:text-[#6d2842] dark:hover:text-[#d4a343] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6d2842] to-[#a64d6d] text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Reset Password
                </>
              )}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-[#6d2842] dark:text-[#d4a343] hover:text-[#a64d6d] dark:hover:text-[#b8862f] font-medium transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
