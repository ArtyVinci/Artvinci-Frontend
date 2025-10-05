import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { ELEGANT_STYLES } from '../../utils/elegantTheme';

const OTPModal = ({ isOpen, onClose, email, onVerify, onResend }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  // DEBUG: Log modal render
  useEffect(() => {
    console.log('🎭 OTPModal rendered - isOpen:', isOpen, 'email:', email);
  }, [isOpen, email]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    // Focus first input when modal opens
    if (isOpen && inputRefs.current[0]) {
      console.log('🎯 Focusing first input');
      inputRefs.current[0].focus();
    }
  }, [isOpen]);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const digits = pastedData.match(/\d/g) || [];
    
    const newOtp = [...otp];
    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });
    setOtp(newOtp);

    // Focus last filled input or next empty
    const focusIndex = Math.min(digits.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await onVerify(otpCode);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Invalid verification code');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setError('');

    try {
      await onResend();
      setResendCooldown(60); // 60 second cooldown
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything if modal is closed
  if (!isOpen) {
    console.log('🚫 OTPModal: isOpen is false, not rendering');
    return null;
  }

  console.log('✅ OTPModal: Rendering modal for email:', email);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#2d2a27] rounded-3xl shadow-2xl max-w-md w-full p-8 relative border border-[#e8e7e5] dark:border-[#4a4642]"
        >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-[#7c7771] dark:text-[#a9a5a0] hover:text-[#8b3654] dark:hover:text-[#d4a343] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Success State */}
              {success ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#508978] to-[#70a596] rounded-full mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-2">
                    Verified Successfully!
                  </h3>
                  <p className="text-[#7c7771] dark:text-[#a9a5a0]">
                    Your account has been activated
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#6d2842] to-[#a64d6d] rounded-2xl">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] dark:from-[#c47795] dark:via-[#e1bc5d] dark:to-[#d4a343] bg-clip-text text-transparent">
                    Verify Your Email
                  </h2>
                  
                  <p className="text-center text-[#7c7771] dark:text-[#a9a5a0] mb-8">
                    Enter the 6-digit code sent to<br />
                    <span className="font-semibold text-[#8b3654] dark:text-[#d4a343]">{email}</span>
                  </p>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* OTP Input */}
                  <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={`w-12 h-14 text-center text-2xl font-bold bg-[#f5f5f3] dark:bg-[#383530] border-2 rounded-xl transition-all ${
                          digit
                            ? 'border-[#8b3654] dark:border-[#d4a343] text-[#8b3654] dark:text-[#d4a343]'
                            : 'border-[#d4d2ce] dark:border-[#4a4642] text-[#2d2a27] dark:text-[#fafaf9]'
                        } focus:border-[#8b3654] dark:focus:border-[#d4a343] focus:ring-4 focus:ring-[#8b3654]/20 dark:focus:ring-[#d4a343]/20 outline-none`}
                        disabled={loading || success}
                      />
                    ))}
                  </div>

                  {/* Verify Button */}
                  <motion.button
                    onClick={handleVerify}
                    disabled={loading || otp.join('').length !== 6}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] hover:from-[#5a2338] hover:via-[#6d2842] hover:to-[#8b3654] text-white font-semibold rounded-xl shadow-lg shadow-[#8b3654]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Verify Code</span>
                      </>
                    )}
                  </motion.button>

                  {/* Resend Code */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-[#7c7771] dark:text-[#a9a5a0] mb-2">
                      Didn't receive the code?
                    </p>
                    <button
                      onClick={handleResend}
                      disabled={resendCooldown > 0 || loading}
                      className="text-sm font-semibold text-[#8b3654] dark:text-[#d4a343] hover:text-[#6d2842] dark:hover:text-[#e1bc5d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                      <RotateCcw className="w-4 h-4" />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
    </AnimatePresence>
  );
};

export default OTPModal;
