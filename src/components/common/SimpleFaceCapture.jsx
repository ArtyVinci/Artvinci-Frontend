import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Check, RefreshCw, AlertCircle, User, Eye, Scan } from 'lucide-react';

const SimpleFaceCapture = ({ onCapture, onClose, isRegistering = false, title }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('detecting'); // detecting, face_found, captured, processing
  const [faceDetected, setFaceDetected] = useState(false);
  const [autoCapture, setAutoCapture] = useState(true);
  const [countdown, setCountdown] = useState(0);

  // Face detection function
  const detectFace = useCallback(() => {
    if (!webcamRef.current || !canvasRef.current) return false;

    try {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!video || video.readyState !== 4) return false;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simple face detection using skin color detection and face proportions
      const faceArea = detectSkinAndFaceArea(imageData);
      
      return faceArea > 2000; // Minimum face area threshold
    } catch (error) {
      console.error('Face detection error:', error);
      return false;
    }
  }, []);

  // Basic skin and face area detection
  const detectSkinAndFaceArea = (imageData) => {
    const data = imageData.data;
    let skinPixels = 0;
    const width = imageData.width;
    const height = imageData.height;

    // Check center region for skin tones
    const centerX = width / 2;
    const centerY = height / 2;
    const checkRadius = Math.min(width, height) / 4;

    for (let y = centerY - checkRadius; y < centerY + checkRadius; y += 4) {
      for (let x = centerX - checkRadius; x < centerX + checkRadius; x += 4) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const index = (y * width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          
          // Basic skin color detection
          if (isSkinColor(r, g, b)) {
            skinPixels++;
          }
        }
      }
    }

    return skinPixels;
  };

  // Basic skin color detection
  const isSkinColor = (r, g, b) => {
    return (
      r > 95 && g > 40 && b > 20 &&
      Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
      Math.abs(r - g) > 15 && r > g && r > b
    );
  };

  // Start face detection
  useEffect(() => {
    if (autoCapture && !imgSrc && status !== 'processing') {
      detectionIntervalRef.current = setInterval(() => {
        const faceFound = detectFace();
        setFaceDetected(faceFound);
        
        if (faceFound && status === 'detecting') {
          setStatus('face_found');
          setCountdown(2); // 2 second countdown
        } else if (!faceFound && status === 'face_found') {
          setStatus('detecting');
          setCountdown(0);
        }
      }, 200); // Check every 200ms
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [autoCapture, imgSrc, status, detectFace]);

  // Countdown and auto-capture
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (countdown === 0 && status === 'face_found' && faceDetected && autoCapture) {
      // Auto-capture after countdown
      capture();
    }
  }, [countdown, status, faceDetected, autoCapture]);

  const capture = useCallback(() => {
    try {
      const imageSrc = webcamRef.current.getScreenshot({
        width: 1280,
        height: 720,
        screenshotFormat: 'image/jpeg',
        screenshotQuality: 0.92
      });
      
      if (!imageSrc) {
        setError('Failed to capture image. Please try again.');
        return;
      }

      setImgSrc(imageSrc);
      setStatus('captured');
      setError('');
      
      // Stop face detection
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    } catch (error) {
      console.error('Capture error:', error);
      setError('Failed to capture image. Please ensure your camera is working properly.');
    }
  }, []);

  const retake = () => {
    setImgSrc(null);
    setError('');
    setStatus('detecting');
    setCountdown(0);
    setFaceDetected(false);
  };

  const handleConfirm = async () => {
    if (!imgSrc) return;
    
    setIsLoading(true);
    setError('');
    setStatus('processing');
    
    try {
      console.log('🎯 Processing captured image...');
      await onCapture(imgSrc);
      console.log('✅ Image processed successfully');
      onClose();
    } catch (err) {
      console.error('❌ Face processing error:', err);
      
      let errorMessage = 'Failed to process image';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      setIsLoading(false);
      setStatus('captured');
    }
  };

  const toggleAutoCapture = () => {
    setAutoCapture(!autoCapture);
    if (!autoCapture) {
      setStatus('detecting');
      setCountdown(0);
    } else {
      setStatus('ready');
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Camera className="w-6 h-6" />
                <h2 className="text-xl font-semibold">
                  {title || (isRegistering ? 'Register Your Face' : 'Face Login')}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Status Indicator */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-2">
                {status === 'detecting' && (
                  <>
                    <Scan className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">Looking for face...</span>
                  </>
                )}
                {status === 'face_found' && (
                  <>
                    <Eye className="w-4 h-4 text-green-300" />
                    <span className="text-sm">Face detected! {countdown > 0 && `Capturing in ${countdown}...`}</span>
                  </>
                )}
                {status === 'captured' && (
                  <>
                    <Check className="w-4 h-4 text-green-300" />
                    <span className="text-sm">Image captured</span>
                  </>
                )}
                {status === 'processing' && (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Processing...</span>
                  </>
                )}
              </div>
              
              {/* Auto-capture toggle */}
              <button
                onClick={toggleAutoCapture}
                className={`ml-auto px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  autoCapture 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-500 text-white'
                }`}
              >
                Auto: {autoCapture ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Camera/Preview Area */}
          <div className="p-6">
            <div className="relative bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
              {!imgSrc ? (
                <div className="relative">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    className="w-full h-auto max-h-96 object-cover"
                    videoConstraints={{
                      width: 1280,
                      height: 720,
                      facingMode: "user"
                    }}
                  />
                  
                  {/* Hidden canvas for face detection */}
                  <canvas
                    ref={canvasRef}
                    style={{ display: 'none' }}
                  />
                  
                  {/* Face detection overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-64 h-64 border-2 rounded-full transition-colors ${
                      faceDetected 
                        ? 'border-green-400 shadow-lg shadow-green-400/50' 
                        : 'border-white/50'
                    }`}>
                      {countdown > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/70 rounded-full w-16 h-16 flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">{countdown}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Instructions */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/70 rounded-lg p-3 text-white text-sm">
                      {autoCapture ? (
                        <>
                          {status === 'detecting' && 'Position your face in the circle'}
                          {status === 'face_found' && `Hold still! Capturing in ${countdown}...`}
                        </>
                      ) : (
                        'Click capture when ready'
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img 
                    src={imgSrc} 
                    alt="Captured face" 
                    className="w-full h-auto max-h-96 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="bg-green-500 rounded-full p-2">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              {!imgSrc ? (
                <>
                  {!autoCapture && (
                    <button
                      onClick={capture}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      Capture
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        {isRegistering ? 'Register Face' : 'Login'}
                      </>
                    )}
                  </button>
                  <button
                    onClick={retake}
                    disabled={isLoading}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Retake
                  </button>
                </>
              )}
            </div>

            {/* Tips */}
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>• Face the camera directly for best results</p>
              <p>• Ensure good lighting on your face</p>
              <p>• Remove glasses or hats if possible</p>
              {autoCapture && <p>• The system will automatically capture when a face is detected</p>}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SimpleFaceCapture;