import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Check, RefreshCw, AlertCircle, Scan, Loader2, User, ShieldCheck } from 'lucide-react';

const RealTimeFaceCapture = ({ onCapture, onClose, isRegistering = false, showAutoDetect = true }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  
  const [imgSrc, setImgSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [detectionAttempts, setDetectionAttempts] = useState(0);
  const [autoCapture, setAutoCapture] = useState(showAutoDetect && !isRegistering);
  const [countdown, setCountdown] = useState(0);

  // Face detection using canvas and basic image analysis
  const detectFace = useCallback(async () => {
    if (!webcamRef.current || !canvasRef.current) return false;

    try {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Fix Canvas2D warning

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Basic face detection heuristic based on image analysis
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Look for face-like patterns (simplified skin tone detection)
      let skinPixels = 0;
      let totalPixels = data.length / 4;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Basic skin tone detection
        if (r > 95 && g > 40 && b > 20 && 
            Math.max(r, g, b) - Math.min(r, g, b) > 15 && 
            Math.abs(r - g) > 15 && r > g && r > b) {
          skinPixels++;
        }
      }

      const skinRatio = skinPixels / totalPixels;
      return skinRatio > 0.02; // If more than 2% skin-like pixels, assume face present
    } catch (err) {
      console.warn('Face detection error:', err);
      return false;
    }
  }, []);

  // Stop detection
  const stopDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsDetecting(false);
    setFaceDetected(false);
    setDetectionAttempts(0);
    setCountdown(0);
  }, []);

  // Manual capture with quality validation
  const capture = useCallback(() => {
    try {
      const imageSrc = webcamRef.current.getScreenshot({
        width: 1280,
        height: 720,
        screenshotFormat: 'image/jpeg',
        screenshotQuality: 0.9
      });
      
      if (!imageSrc) {
        setError('Failed to capture image. Please try again.');
        return;
      }
      
      console.log('📸 Image captured successfully');
      setImgSrc(imageSrc);
      stopDetection();
    } catch (err) {
      console.error('❌ Capture error:', err);
      setError('Failed to capture image. Please ensure camera is working.');
    }
  }, [stopDetection]);

  // Start real-time detection
  const startDetection = useCallback(() => {
    if (intervalRef.current) return;

    setIsDetecting(true);
    setDetectionAttempts(0);

    intervalRef.current = setInterval(async () => {
      setDetectionAttempts(prev => prev + 1);
      
      const facePresent = await detectFace();
      setFaceDetected(facePresent);

      if (facePresent && autoCapture && !imgSrc && countdown === 0) {
        // Start countdown for auto-capture
        console.log('👤 Face detected! Starting countdown...');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsDetecting(false);
        
        setCountdown(3);
        const countdownTimer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownTimer);
              setTimeout(() => {
                console.log('📸 Auto-capturing image...');
                capture();
              }, 100);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }, 800); // Slightly slower detection for better performance
  }, [detectFace, autoCapture, imgSrc, countdown, capture]);

  // Retake photo
  const retake = () => {
    setImgSrc(null);
    setError('');
    setCountdown(0);
    if (autoCapture) {
      startDetection();
    }
  };

  // Confirm capture and process
  const handleConfirm = async () => {
    if (!imgSrc) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🎯 Processing captured image...');
      await onCapture(imgSrc);
      console.log('✅ Image processed successfully');
      onClose();
    } catch (err) {
      console.error('❌ Face processing error:', err);
      
      let errorMessage = 'Failed to process image';
      
      // Extract meaningful error message
      if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Provide more specific error messages based on content
      if (errorMessage.includes('not recognized') || errorMessage.includes('not found')) {
        setError('Face not recognized. Try different lighting or ensure you have registered your face first.');
      } else if (errorMessage.includes('No face detected')) {
        setError('No face detected in the image. Please ensure your face is clearly visible and well-lit.');
      } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        setError('Network error. Please check your connection and try again.');
      } else if (errorMessage.includes('server') || errorMessage.includes('500')) {
        setError('Server error. Please try again in a moment.');
      } else {
        setError(errorMessage);
      }
      
      setIsLoading(false);
      
      // Auto-retry for login attempts (not registration)
      if (!isRegistering && (errorMessage.includes('not recognized') || errorMessage.includes('not found'))) {
        setTimeout(() => {
          console.log('🔄 Auto-retry: clearing error and preparing for retake');
          setError('');
          retake();
        }, 4000);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  // Auto-start detection when component mounts
  useEffect(() => {
    if (autoCapture && !imgSrc) {
      const timer = setTimeout(() => {
        startDetection();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoCapture, imgSrc, startDetection]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#2d2a27] rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#e8e7e5] dark:border-[#4a4642] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-[#508978] to-[#70a596] rounded-xl">
                <Scan className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#2d2a27] dark:text-[#fafaf9]">
                  {isRegistering ? 'Register Your Face' : 'Face Recognition Login'}
                </h3>
                <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                  {autoCapture ? 'Automatic detection enabled' : 'Manual capture mode'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#f5f5f3] dark:hover:bg-[#3a3633] rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-[#5d5955] dark:text-[#c4bfb9]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Status Bar */}
            <div className="mb-4 p-4 bg-[#f5f5f3] dark:bg-[#3a3633] rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isDetecting ? (
                    <>
                      <Loader2 className="w-5 h-5 text-[#508978] animate-spin" />
                      <span className="text-sm font-medium text-[#2d2a27] dark:text-[#fafaf9]">
                        Detecting face... ({detectionAttempts})
                      </span>
                    </>
                  ) : faceDetected ? (
                    <>
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        Face detected!
                      </span>
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <div className="w-5 h-5 rounded-full bg-[#508978] text-white flex items-center justify-center text-xs font-bold">
                        {countdown}
                      </div>
                      <span className="text-sm font-medium text-[#508978] dark:text-[#70a596]">
                        Auto-capturing in {countdown}...
                      </span>
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5 text-[#5d5955] dark:text-[#c4bfb9]" />
                      <span className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                        Position your face in the frame
                      </span>
                    </>
                  )}
                </div>
                
                {/* Auto-detection toggle */}
                {!imgSrc && (
                  <button
                    onClick={() => {
                      setAutoCapture(!autoCapture);
                      if (!autoCapture) {
                        startDetection();
                      } else {
                        stopDetection();
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      autoCapture 
                        ? 'bg-[#508978] text-white' 
                        : 'bg-[#e8e7e5] dark:bg-[#4a4642] text-[#5d5955] dark:text-[#c4bfb9] hover:bg-[#508978] hover:text-white'
                    }`}
                  >
                    {autoCapture ? 'Auto ON' : 'Auto OFF'}
                  </button>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {autoCapture
                      ? isRegistering
                        ? 'Position your face in the center. The system will automatically detect and capture when ready.'
                        : 'Look directly at the camera. The system will automatically recognize and log you in.'
                      : 'Position your face in the center of the frame and click capture when ready.'
                    }
                  </p>
                  {!isRegistering && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Make sure you have registered your face first or uploaded a clear profile photo.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
                  <p className="text-red-600 dark:text-red-500 text-xs mt-1">
                    {error.includes('not recognized') 
                      ? 'Make sure you have registered your face first, or try uploading a clear profile photo.'
                      : 'Try different lighting or adjust your position for better detection.'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Camera/Preview */}
            <div className="relative aspect-video bg-[#1a1816] rounded-2xl overflow-hidden">
              {!imgSrc ? (
                <>
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                    videoConstraints={{
                      width: 1280,
                      height: 720,
                      facingMode: 'user'
                    }}
                  />
                  
                  {/* Face detection overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-64 h-80 border-4 rounded-full transition-all duration-300 ${
                      faceDetected 
                        ? 'border-green-400 shadow-lg shadow-green-400/50' 
                        : countdown > 0
                        ? 'border-yellow-400 shadow-lg shadow-yellow-400/50'
                        : 'border-white/50'
                    }`}>
                      {countdown > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">{countdown}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detection indicator */}
                  {isDetecting && (
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white text-sm">Scanning...</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <img
                  src={imgSrc}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Hidden canvas for face detection */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              {!imgSrc ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={capture}
                    className="flex-1 py-4 bg-gradient-to-r from-[#508978] via-[#5a9984] to-[#70a596] hover:from-[#3d6b5c] hover:via-[#508978] hover:to-[#5a9984] text-white font-semibold rounded-xl shadow-lg shadow-[#508978]/30 hover:shadow-xl hover:shadow-[#508978]/40 flex items-center justify-center gap-2 transition-all"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Capture Photo</span>
                  </motion.button>
                  
                  {/* Detection control buttons */}
                  {autoCapture ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={stopDetection}
                      disabled={!isDetecting}
                      className="px-6 py-4 border-2 border-red-300 hover:border-red-500 text-red-600 hover:text-red-700 font-medium rounded-xl transition-all disabled:opacity-50"
                    >
                      Stop
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={startDetection}
                      disabled={isDetecting}
                      className="px-6 py-4 border-2 border-[#508978] hover:bg-[#508978] hover:text-white text-[#508978] font-medium rounded-xl transition-all disabled:opacity-50"
                    >
                      Scan
                    </motion.button>
                  )}
                </>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={retake}
                    disabled={isLoading}
                    className="flex-1 py-4 border-2 border-[#e8e7e5] dark:border-[#4a4642] hover:border-[#508978] dark:hover:border-[#70a596] text-[#2d2a27] dark:text-[#fafaf9] font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Retake</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="flex-1 py-4 bg-gradient-to-r from-[#508978] via-[#5a9984] to-[#70a596] hover:from-[#3d6b5c] hover:via-[#508978] hover:to-[#5a9984] text-white font-semibold rounded-xl shadow-lg shadow-[#508978]/30 hover:shadow-xl hover:shadow-[#508978]/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>{isRegistering ? 'Register Face' : 'Login'}</span>
                      </>
                    )}
                  </motion.button>
                </>
              )}
            </div>

            {/* Tips */}
            <div className="mt-4 p-3 bg-[#f9f9f8] dark:bg-[#1a1816] rounded-lg">
              <p className="text-xs text-[#5d5955] dark:text-[#c4bfb9] text-center">
                💡 <strong>Tips:</strong> Ensure good lighting, remove glasses if needed, and look directly at the camera
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RealTimeFaceCapture;