import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, User, Mail, FileText, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input, Loading } from '../../components/common';

const ProfileEdit = ({ onClose, onSuccess }) => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.bio || '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profile_image_url || null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profile_image: 'Please select an image file' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profile_image: 'Image size must be less than 5MB' }));
        return;
      }

      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setErrors(prev => ({ ...prev, profile_image: '' }));
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setImagePreview(user?.profile_image_url || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    setApiError('');
    setSuccessMessage('');

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add profile data
      formDataToSend.append('username', formData.username);
      if (formData.first_name) formDataToSend.append('first_name', formData.first_name);
      if (formData.last_name) formDataToSend.append('last_name', formData.last_name);
      if (formData.bio) formDataToSend.append('bio', formData.bio);
      
      // Add profile image if changed
      if (profileImage) {
        formDataToSend.append('profile_image', profileImage);
      }

      const result = await updateProfile(formDataToSend);
      
      if (result.success) {
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 1500);
      } else {
        // Handle validation errors from backend
        if (result.errors) {
          const backendErrors = {};
          Object.keys(result.errors).forEach(key => {
            if (Array.isArray(result.errors[key])) {
              backendErrors[key] = result.errors[key][0];
            } else {
              backendErrors[key] = result.errors[key];
            }
          });
          setErrors(backendErrors);
        }
        setApiError(result.error || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-2xl glass dark:glass-dark rounded-3xl shadow-glass p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold gradient-text">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm"
          >
            {successMessage}
          </motion.div>
        )}

        {/* Error Message */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm"
          >
            {apiError}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary-200 to-secondary-200 dark:from-primary-800 dark:to-secondary-800 flex items-center justify-center">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-primary-600 hover:bg-primary-700 rounded-full shadow-lg transition-colors"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
              {profileImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-0 right-0 p-2 bg-red-600 hover:bg-red-700 rounded-full shadow-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {errors.profile_image && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.profile_image}</p>
            )}
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Click camera icon to upload profile photo
            </p>
          </div>

          {/* Username */}
          <Input
            label="Username"
            type="text"
            name="username"
            placeholder="johndoe"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            icon={User}
            required
          />

          {/* First Name */}
          <Input
            label="First Name"
            type="text"
            name="first_name"
            placeholder="John"
            value={formData.first_name}
            onChange={handleChange}
            error={errors.first_name}
          />

          {/* Last Name */}
          <Input
            label="Last Name"
            type="text"
            name="last_name"
            placeholder="Doe"
            value={formData.last_name}
            onChange={handleChange}
            error={errors.last_name}
          />

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400">
              <Mail className="w-5 h-5" />
              <span>{user?.email}</span>
              <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                Cannot be changed
              </span>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bio
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <textarea
                name="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow resize-none"
              />
            </div>
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bio}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={loading}
              icon={Save}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProfileEdit;
