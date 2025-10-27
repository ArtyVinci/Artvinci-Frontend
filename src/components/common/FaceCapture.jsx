import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Check, RefreshCw, AlertCircle } from 'lucide-react';

const FaceCapture = ({ onCapture, onClose, isRegistering = false }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
    setError('');
  };

  const handleConfirm = async () => {
    if (!imgSrc) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await onCapture(imgSrc);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to process image');
      setIsLoading(false);
    }
  };

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
          className="bg-white dark:bg-[#2d2a27] rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#e8e7e5] dark:border-[#4a4642] flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#2d2a27] dark:text-[#fafaf9]">
              {isRegistering ? 'Register Your Face' : 'Face Login'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#f5f5f3] dark:hover:bg-[#3a3633] rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-[#5d5955] dark:text-[#c4bfb9]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Instructions */}
            <div className="mb-4 p-4 bg-[#f5f5f3] dark:bg-[#3a3633] rounded-xl">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-[#6d2842] dark:text-[#d4a343] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                    {isRegistering
                      ? 'Position your face in the center of the frame. Make sure you are in a well-lit area and your face is clearly visible.'
                      : 'Look directly at the camera. Your face will be recognized automatically.'}
                  </p>
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
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Camera/Preview */}
            <div className="relative aspect-video bg-[#1a1816] rounded-2xl overflow-hidden">
              {!imgSrc ? (
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
              ) : (
                <img
                  src={imgSrc}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Overlay guide */}
              {!imgSrc && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-80 border-4 border-white/50 rounded-full"></div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              {!imgSrc ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={capture}
                  className="flex-1 py-4 bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] hover:from-[#5a2338] hover:via-[#6d2842] hover:to-[#8b3654] text-white font-semibold rounded-xl shadow-lg shadow-[#6d2842]/30 hover:shadow-xl hover:shadow-[#6d2842]/40 flex items-center justify-center gap-2 transition-all"
                >
                  <Camera className="w-5 h-5" />
                  <span>Capture Photo</span>
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={retake}
                    disabled={isLoading}
                    className="flex-1 py-4 border-2 border-[#e8e7e5] dark:border-[#4a4642] hover:border-[#6d2842] dark:hover:border-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9] font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Retake</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="flex-1 py-4 bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] hover:from-[#5a2338] hover:via-[#6d2842] hover:to-[#8b3654] text-white font-semibold rounded-xl shadow-lg shadow-[#6d2842]/30 hover:shadow-xl hover:shadow-[#6d2842]/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Confirm</span>
                      </>
                    )}
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FaceCapture;
