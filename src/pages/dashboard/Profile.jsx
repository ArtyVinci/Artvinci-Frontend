import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, User, Mail, FileText, X, AlertCircle, Edit2, Loader, Palette, Briefcase, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import showToast from '../../services/toast';

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
      </motion.div>
    </motion.div>
  );
};

export default Profile;
