import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

import { Camera, Save, User, Mail, FileText, X, AlertCircle, Edit2, Loader, Palette, Briefcase, CheckCircle2, Scan, Upload, Shield, Sparkles, Wand2, Lightbulb } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import showToast from '../../services/toast';
import { SimpleFaceCapture } from '../../components/common';
import api from '../../services/api';


const Profile = () => {
  const { user, updateProfile, refreshUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    bio: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedBio, setGeneratedBio] = useState('');
  const [artworkAnalysis, setArtworkAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
      });
      setImagePreview(user.profile_image_url || null);
      // Check if user has face registered
      setFaceRegistered(user.face_registered || false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profile_image: 'Please select an image file' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profile_image: 'Image size must be less than 5MB' }));
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, profile_image: '' }));
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setImagePreview(user?.profile_image_url || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      if (formData.first_name) formDataToSend.append('first_name', formData.first_name);
      if (formData.last_name) formDataToSend.append('last_name', formData.last_name);
      if (formData.bio) formDataToSend.append('bio', formData.bio);
      if (profileImage) formDataToSend.append('profile_image', profileImage);

      const result = await updateProfile(formDataToSend);
      
      if (result.success) {
        showToast.success('Profile updated successfully!');
        setIsEditing(false);
        setProfileImage(null);
        setTimeout(() => refreshUserProfile(), 1000);
      } else {
        if (result.errors) {
          const backendErrors = {};
          Object.keys(result.errors).forEach(key => {
            backendErrors[key] = Array.isArray(result.errors[key]) ? result.errors[key][0] : result.errors[key];
          });
          setErrors(backendErrors);
        }
        showToast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      showToast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: user?.username || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      bio: user?.bio || '',
    });
    handleRemoveImage();
    setErrors({});
  };

  const handleFaceCapture = async (imageData) => {
    try {
      console.log('🎯 Starting face registration...');
      const response = await api.post('/auth/face/register/', {
        image: imageData
      });

      if (response.data) {
        console.log('✅ Face registration response:', response.data);
        setFaceRegistered(true);
        showToast.success(response.data.message || 'Face registered successfully!');
        setShowFaceCapture(false);
        
        // Refresh user profile to get updated data
        await refreshUserProfile();
      }
    } catch (error) {
      console.error('❌ Face registration error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      let errorMsg = 'Failed to register face';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.error) {
          errorMsg = error.response.data.error;
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      showToast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // AI Service Functions
  const handleGenerateBio = async () => {
    setAiLoading(true);
    try {
      const response = await api.post('/auth/ai/generate-bio/');
      setGeneratedBio(response.data.bio);
      showToast.success('AI-generated bio created successfully!');
    } catch (error) {
      console.error('Generate bio error:', error);
      showToast.error('Failed to generate bio. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAnalyzeArtwork = async () => {
    const title = prompt('Enter artwork title:');
    if (!title) return;

    const description = prompt('Enter artwork description (optional):');

    setAiLoading(true);
    try {
      const response = await api.post('/auth/ai/analyze-artwork/', {
        title: title,
        description: description || ''
      });
      setArtworkAnalysis(response.data.analysis);
      showToast.success('Artwork analyzed successfully!');
    } catch (error) {
      console.error('Analyze artwork error:', error);
      showToast.error('Failed to analyze artwork. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    setAiLoading(true);
    try {
      const response = await api.get('/auth/ai/recommendations/');
      setRecommendations(response.data.recommendations);
      showToast.success('Personalized recommendations generated!');
    } catch (error) {
      console.error('Get recommendations error:', error);
      showToast.error('Failed to get recommendations. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyGeneratedBio = () => {
    if (generatedBio) {
      setFormData(prev => ({ ...prev, bio: generatedBio }));
      setGeneratedBio('');
      showToast.success('Bio applied to your profile!');
    }
  };

  const getRoleInfo = () => {
    if (user?.role === 'artist') {
      return {
        label: 'Artist',
        icon: Palette,
        color: '#a64d6d', // Burgundy pink
        bgColor: 'rgba(109, 40, 66, 0.2)' // Burgundy with opacity
      };
    }
    return {
      label: 'Art Lover',
      icon: Briefcase,
      color: '#70a596', // Sage green
      bgColor: 'rgba(80, 137, 120, 0.2)' // Sage with opacity
    };
  };

  const roleInfo = getRoleInfo();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-[#6d2842] to-[#a64d6d] rounded-2xl shadow-lg shadow-[#6d2842]/50">
            <User className="w-6 h-6 text-[#fafaf9]" />
          </div>
          <h2 className="text-3xl font-bold text-[#2d2a27] dark:text-[#fafaf9]">My Profile</h2>
        </div>
        
        {!isEditing && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6d2842] to-[#a64d6d] text-white rounded-xl font-medium shadow-lg shadow-[#6d2842]/30 hover:shadow-xl hover:shadow-[#6d2842]/40 transition-all"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </motion.button>
        )}
      </div>

      {/* Profile Card */}
      <motion.div layout className="bg-[#f5f5f3] dark:bg-gradient-to-br dark:from-[#3a3633] dark:to-[#2d2a27] backdrop-blur-xl rounded-3xl shadow-xl dark:shadow-2xl border border-[#e8e7e5] dark:border-[#4a4642] p-8">
        <form onSubmit={handleSubmit}>
          {/* Profile Image */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#6d2842] to-[#b8862f] flex items-center justify-center ring-4 ring-[#e8e7e5] dark:ring-[#4a4642] shadow-xl dark:shadow-2xl shadow-black/10 dark:shadow-black/50">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : user?.profile_image ? (
                  <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-[#fafaf9]" />
                )}
              </div>

              {isEditing && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-3 bg-gradient-to-br from-[#b8862f] to-[#d4a343] rounded-full text-[#1a1816] shadow-lg hover:shadow-xl transition-all"
                >
                  <Camera className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            {isEditing && profileImage && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleRemoveImage}
                className="mt-3 flex items-center gap-2 text-sm text-[#6d2842] dark:text-[#d4a343] hover:text-[#8b3654] dark:hover:text-[#b8862f] transition-colors"
              >
                <X className="w-4 h-4" />
                Remove new image
              </motion.button>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

            {errors.profile_image && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.profile_image}
              </p>
            )}
          </div>

          {/* Role Badge */}
          <div className="flex justify-center mb-6">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#4a4642]"
              style={{ backgroundColor: roleInfo.bgColor }}
            >
              <roleInfo.icon 
                className="w-4 h-4" 
                style={{ color: roleInfo.color }}
              />
              <span 
                className="text-sm font-semibold" 
                style={{ color: roleInfo.color }}
              >
                {roleInfo.label}
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9b9791] dark:text-[#6d6762]" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-12 pr-4 py-3 bg-[#e8e7e5] dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl text-[#9b9791] dark:text-[#6d6762] cursor-not-allowed"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">Username *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9b9791] dark:text-[#6d6762]" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all ${
                    isEditing
                      ? 'bg-white dark:bg-[#1a1816] border-[#6d2842] focus:border-[#a64d6d] focus:ring-2 focus:ring-[#6d2842]/20 text-[#2d2a27] dark:text-[#fafaf9]'
                      : 'bg-[#e8e7e5] dark:bg-[#1a1816] border-[#e8e7e5] dark:border-[#4a4642] cursor-not-allowed text-[#9b9791] dark:text-[#6d6762]'
                  } ${errors.username ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.username}
                </p>
              )}
            </div>

            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-xl transition-all ${
                    isEditing
                      ? 'bg-white dark:bg-[#1a1816] border-[#6d2842] focus:border-[#a64d6d] focus:ring-2 focus:ring-[#6d2842]/20 text-[#2d2a27] dark:text-[#fafaf9]'
                      : 'bg-[#e8e7e5] dark:bg-[#1a1816] border-[#e8e7e5] dark:border-[#4a4642] cursor-not-allowed text-[#9b9791] dark:text-[#6d6762]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-xl transition-all ${
                    isEditing
                      ? 'bg-white dark:bg-[#1a1816] border-[#6d2842] focus:border-[#a64d6d] focus:ring-2 focus:ring-[#6d2842]/20 text-[#2d2a27] dark:text-[#fafaf9]'
                      : 'bg-[#e8e7e5] dark:bg-[#1a1816] border-[#e8e7e5] dark:border-[#4a4642] cursor-not-allowed text-[#9b9791] dark:text-[#6d6762]'
                  }`}
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9] mb-2">Bio</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-[#9b9791] dark:text-[#6d6762]" />
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={4}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all resize-none ${
                    isEditing
                      ? 'bg-white dark:bg-[#1a1816] border-[#6d2842] focus:border-[#a64d6d] focus:ring-2 focus:ring-[#6d2842]/20 text-[#2d2a27] dark:text-[#fafaf9]'
                      : 'bg-[#e8e7e5] dark:bg-[#1a1816] border-[#e8e7e5] dark:border-[#4a4642] cursor-not-allowed text-[#9b9791] dark:text-[#6d6762]'
                  }`}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 mt-8">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6d2842] to-[#a64d6d] text-white rounded-xl font-medium shadow-lg shadow-[#6d2842]/20 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-[#e8e7e5] dark:bg-[#3a3633] text-[#2d2a27] dark:text-[#fafaf9] rounded-xl font-medium hover:bg-[#d4d2ce] dark:hover:bg-[#4a4642] transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-[#e8e7e5] dark:border-[#4a4642]"
              >
                Cancel
              </motion.button>
            </motion.div>
          )}
        </form>
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 bg-[#f5f5f3] dark:bg-gradient-to-br dark:from-[#3a3633] dark:to-[#2d2a27] backdrop-blur-xl rounded-2xl p-6 border border-[#e8e7e5] dark:border-[#4a4642] shadow-lg"
      >
        <h3 className="text-lg font-semibold text-[#2d2a27] dark:text-[#fafaf9] mb-4">Account Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#9b9791] dark:text-[#9b9791]">Account Status</p>
            <p className="font-medium text-[#508978] dark:text-[#70a596] flex items-center gap-2 mt-1">
              <CheckCircle2 className="w-4 h-4" />
              {user?.is_verified ? 'Verified' : 'Not Verified'}
            </p>
          </div>
          <div>
            <p className="text-[#9b9791] dark:text-[#9b9791]">Member Since</p>
            <p className="font-medium text-[#5d5955] dark:text-[#c4bfb9] mt-1">
              {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Face Recognition Section */}
        <div className="mt-6 pt-6 border-t border-[#e8e7e5] dark:border-[#4a4642]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-[#2d2a27] dark:text-[#fafaf9]">Face Recognition Login</h4>
              <p className="text-sm text-[#9b9791] dark:text-[#9b9791] mt-1">
                Register your face to enable quick login
              </p>
            </div>
            {faceRegistered && (
              <span className="px-3 py-1 bg-[#508978]/10 dark:bg-[#70a596]/10 text-[#508978] dark:text-[#70a596] text-xs font-medium rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Registered
              </span>
            )}
          </div>

          {/* Simple Face Registration */}
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowFaceCapture(true)}
              className="w-full py-4 bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] hover:from-[#5a2338] hover:via-[#6d2842] hover:to-[#8b3654] text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Scan className="w-5 h-5" />
              <span>{faceRegistered ? 'Update Face Recognition' : 'Register Face Recognition'}</span>
            </motion.button>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Secure Face Recognition</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Your face data is stored securely and only used for login authentication. 
                    You can update or remove it anytime.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Security Note</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Webcam capture is secure and recommended for face login.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Assistant Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 bg-[#f5f5f3] dark:bg-gradient-to-br dark:from-[#3a3633] dark:to-[#2d2a27] backdrop-blur-xl rounded-2xl p-6 border border-[#e8e7e5] dark:border-[#4a4642] shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-[#2d2a27] dark:text-[#fafaf9]">AI Assistant</h4>
            <p className="text-sm text-[#9b9791] dark:text-[#9b9791] mt-1">
              Get AI-powered help with your profile and artwork
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#b8862f] to-[#d4a343] text-[#1a1816] text-xs font-medium rounded-full">
            <Sparkles className="w-3 h-3" />
            Powered by Gemini AI
          </div>
        </div>

        {/* AI Features */}
        <div className="space-y-4">
          {/* Generate Bio */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateBio}
              disabled={aiLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#6d2842] to-[#a64d6d] hover:from-[#5a2338] hover:to-[#8b3654] text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              Generate Bio
            </motion.button>

            {generatedBio && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleApplyGeneratedBio}
                className="px-4 py-3 bg-[#508978] hover:bg-[#70a596] text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Apply
              </motion.button>
            )}
          </div>

          {/* Generated Bio Display */}
          {generatedBio && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-[#e8e7e5] dark:bg-[#1a1816] rounded-xl border border-[#d4d2ce] dark:border-[#4a4642]"
            >
              <p className="text-sm text-[#2d2a27] dark:text-[#fafaf9] italic">"{generatedBio}"</p>
            </motion.div>
          )}

          {/* Analyze Artwork */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyzeArtwork}
            disabled={aiLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#508978] to-[#70a596] hover:from-[#3a5a4a] hover:to-[#508978] text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {aiLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Palette className="w-4 h-4" />
            )}
            Analyze Artwork
          </motion.button>

          {/* Artwork Analysis Display */}
          {artworkAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-[#e8e7e5] dark:bg-[#1a1816] rounded-xl border border-[#d4d2ce] dark:border-[#4a4642] space-y-3"
            >
              <div>
                <h5 className="font-medium text-[#2d2a27] dark:text-[#fafaf9] mb-1">Description:</h5>
                <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">{artworkAnalysis.description}</p>
              </div>
              <div>
                <h5 className="font-medium text-[#2d2a27] dark:text-[#fafaf9] mb-1">Tags:</h5>
                <div className="flex flex-wrap gap-2">
                  {artworkAnalysis.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-[#6d2842]/10 dark:bg-[#a64d6d]/10 text-[#6d2842] dark:text-[#a64d6d] text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="font-medium text-[#2d2a27] dark:text-[#fafaf9] mb-1">Style:</h5>
                <span className="px-2 py-1 bg-[#b8862f]/10 dark:bg-[#d4a343]/10 text-[#b8862f] dark:text-[#d4a343] text-xs font-medium rounded-full">
                  {artworkAnalysis.style}
                </span>
              </div>
            </motion.div>
          )}

          {/* Get Recommendations */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGetRecommendations}
            disabled={aiLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#b8862f] to-[#d4a343] hover:from-[#a0712a] hover:to-[#b8862f] text-[#1a1816] font-medium rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {aiLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Lightbulb className="w-4 h-4" />
            )}
            Get Recommendations
          </motion.button>

          {/* Recommendations Display */}
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-[#e8e7e5] dark:bg-[#1a1816] rounded-xl border border-[#d4d2ce] dark:border-[#4a4642]"
            >
              <h5 className="font-medium text-[#2d2a27] dark:text-[#fafaf9] mb-3">Personalized Recommendations:</h5>
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-[#5d5955] dark:text-[#c4bfb9] flex items-start gap-2">
                    <span className="text-[#6d2842] dark:text-[#a64d6d] font-medium">{index + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* AI Info Box */}
          <div className="p-4 bg-gradient-to-r from-[#6d2842]/10 to-[#a64d6d]/10 dark:from-[#6d2842]/20 dark:to-[#a64d6d]/20 border border-[#6d2842]/20 dark:border-[#a64d6d]/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#6d2842] dark:text-[#a64d6d] mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#6d2842] dark:text-[#a64d6d]">AI-Powered Features</p>
                <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9] mt-1">
                  Generate personalized bios, analyze your artwork with professional insights, and discover new art recommendations tailored to your interests.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Face Capture Modal */}
      {showFaceCapture && (
        <SimpleFaceCapture
          onCapture={handleFaceCapture}
          onClose={() => setShowFaceCapture(false)}
          isRegistering={true}
          title="Register Your Face"
        />
      )}
    </motion.div>
    

  );
};

export default Profile;

