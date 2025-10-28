import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Image as ImageIcon,
  DollarSign,
  Tag,
  FileText,
  Calendar,
  Ruler,
  Palette,
  Sparkles,
  Wand2,
  Loader2
} from 'lucide-react';
import { artworkService } from '../../services/api';
import { toast } from 'react-hot-toast';
import { Loading, Button } from '../../components/common';
import { ART_CATEGORIES, CURRENCY_OPTIONS } from '../../utils/constants';

const ArtworkForm = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEditMode = !!slug;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [enhancingDesc, setEnhancingDesc] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    currency: 'USD',
    dimensions: '',
    medium: '',
    year_created: new Date().getFullYear(),
    tags: '',
    status: 'published',
    is_available: true
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchArtwork();
    }
  }, [slug]);

  const fetchArtwork = async () => {
    try {
      const data = await artworkService.getArtworkBySlug(slug);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        price: data.price || '',
        currency: data.currency || 'USD',
        dimensions: data.dimensions || '',
        medium: data.medium || '',
        year_created: data.year_created || new Date().getFullYear(),
        tags: data.tags ? data.tags.join(', ') : '',
        status: data.status || 'published',
        is_available: data.is_available !== undefined ? data.is_available : true
      });
      setExistingImage(data.primary_image);
    } catch (error) {
      console.error('Error fetching artwork:', error);
      toast.error('Failed to load artwork');
      navigate('/dashboard/artworks');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
  };

  // ============================================================================
  // AI FEATURES
  // ============================================================================

  const handleAIAnalysis = async () => {
    if (!imagePreview && !existingImage) {
      toast.error('Please upload an image first');
      return;
    }

    setAnalyzingAI(true);
    const loadingToast = toast.loading('🤖 AI is analyzing your artwork...');

    try {
      let imageUrl = existingImage;
      
      // If it's a new image (not yet uploaded), we need to upload to Cloudinary first
      if (imageFile && !existingImage) {
        toast.loading('📤 Uploading image to analyze...', { id: loadingToast });
        
        // Create artwork first to get slug, then upload
        if (!formData.title.trim()) {
          toast.error('Please enter a title first to analyze new images', { id: loadingToast });
          return;
        }

        // Create a temporary artwork
        const tempData = {
          title: formData.title || 'Temporary Artwork',
          description: formData.description || 'Analyzing...',
          category: formData.category || 'other',
          price: parseFloat(formData.price) || 0,
          currency: formData.currency || 'USD',
          status: 'draft',
          tags: [],
        };

        try {
          const tempArtwork = await artworkService.createArtwork(tempData);
          
          // Upload image to this artwork
          await artworkService.uploadArtworkImages(tempArtwork.slug, [imageFile]);
          
          // Fetch the artwork to get the image URL
          const updated = await artworkService.getArtworkBySlug(tempArtwork.slug);
          imageUrl = updated.primary_image;
          
          // Store the slug for later update
          if (!slug) {
            // If we're in create mode, navigate to edit this artwork
            toast.loading('🎨 Analyzing artwork...', { id: loadingToast });
            window.history.replaceState(null, '', `/dashboard/artworks/edit/${tempArtwork.slug}`);
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('Failed to upload image. Please save the artwork first, then use AI analysis.', { id: loadingToast });
          return;
        }
      }

      if (!imageUrl) {
        toast.error('Please save the artwork first, then use AI analysis', { id: loadingToast });
        return;
      }

      toast.loading('🎨 Analyzing style, colors, and mood...', { id: loadingToast });

      // Call AI analysis API
      const result = await artworkService.analyzeArtwork({
        image_url: imageUrl
      });

      if (result.success) {
        const analysis = result.analysis;
        
        // Update form with AI suggestions
        setFormData(prev => ({
          ...prev,
          tags: analysis.tags ? analysis.tags.join(', ') : prev.tags,
          description: analysis.description || prev.description,
          medium: analysis.technique || prev.medium,
        }));

        toast.success(
          `🎉 AI Analysis Complete!\nStyle: ${analysis.style}\nMood: ${analysis.mood}`,
          { id: loadingToast, duration: 5000 }
        );

        // Show detailed results
        console.log('🎨 AI Analysis Results:', {
          style: analysis.style,
          colors: analysis.colors,
          mood: analysis.mood,
          tags: analysis.tags,
          price_suggestion: analysis.suggested_price_range,
          complexity: analysis.complexity
        });

        // Optionally show in a more detailed toast
        toast.success(
          `💡 Suggested Price: ${analysis.suggested_price_range || 'N/A'}\n🎨 Colors: ${analysis.colors?.slice(0, 3).join(', ') || 'N/A'}`,
          { duration: 4000 }
        );
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('AI Analysis error:', error);
      const errorMsg = error.message || 'AI analysis failed. Make sure GEMINI_API_KEY is set in backend .env';
      toast.error(errorMsg, { id: loadingToast });
    } finally {
      setAnalyzingAI(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title first');
      return;
    }

    setGeneratingTags(true);
    const loadingToast = toast.loading('🏷️ Generating tags...');

    try {
      const result = await artworkService.suggestTags({
        title: formData.title,
        description: formData.description
      });

      if (result.success && result.tags) {
        setFormData(prev => ({
          ...prev,
          tags: result.tags.join(', ')
        }));
        toast.success(`✨ Generated ${result.tags.length} tags!`, { id: loadingToast });
      } else {
        throw new Error(result.error || 'Tag generation failed');
      }
    } catch (error) {
      console.error('Tag generation error:', error);
      toast.error(
        error.message || 'Failed to generate tags',
        { id: loadingToast }
      );
    } finally {
      setGeneratingTags(false);
    }
  };

  const handleEnhanceDescription = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title first');
      return;
    }

    setEnhancingDesc(true);
    const loadingToast = toast.loading('✍️ Enhancing description...');

    try {
      const result = await artworkService.enhanceDescription({
        title: formData.title,
        description: formData.description
      });

      if (result.success && result.description) {
        setFormData(prev => ({
          ...prev,
          description: result.description
        }));
        toast.success('✨ Description enhanced!', { id: loadingToast });
      } else {
        throw new Error(result.error || 'Description enhancement failed');
      }
    } catch (error) {
      console.error('Description enhancement error:', error);
      toast.error(
        error.message || 'Failed to enhance description',
        { id: loadingToast }
      );
    } finally {
      setEnhancingDesc(false);
    }
  };

  const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'artvinci';
    
    // Check if Cloudinary is configured
    if (!cloudName || cloudName === 'your-cloud-name-here') {
      console.warn('Cloudinary not configured. Using local preview.');
      // Return a placeholder - the backend will handle storage
      return {
        url: URL.createObjectURL(file),
        public_id: `local_${Date.now()}`
      };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'artworks');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        // Detailed error message from Cloudinary
        console.error('Cloudinary error response:', data);
        const errorMsg = data.error?.message || 'Upload failed';
        throw new Error(errorMsg);
      }

      return {
        url: data.secure_url,
        public_id: data.public_id
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      
      // Check for specific errors
      if (error.message.includes('Invalid upload preset')) {
        throw new Error('Upload preset "artvinci" not found. Please create it in Cloudinary dashboard (Settings → Upload → Upload Presets)');
      }
      
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      toast.error('Valid price is required');
      return;
    }
    if (!isEditMode && !imageFile) {
      toast.error('Artwork image is required');
      return;
    }

    setSubmitting(true);
    try {
      // Prepare data
      const dataToSubmit = {
        ...formData,
        price: parseFloat(formData.price),
        year_created: parseInt(formData.year_created) || new Date().getFullYear(),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      };

      let result;
      if (isEditMode) {
        // Update existing artwork
        result = await artworkService.updateArtwork(slug, dataToSubmit);
        
        // Upload new image if selected (backend handles Cloudinary)
        if (imageFile) {
          setUploadingImage(true);
          toast.loading('Uploading image...', { id: 'upload' });
          await artworkService.uploadArtworkImages(result.slug, [imageFile]);
          toast.success('Image uploaded!', { id: 'upload' });
          setUploadingImage(false);
        }
        
        toast.success('Artwork updated successfully!');
      } else {
        // Create new artwork
        result = await artworkService.createArtwork(dataToSubmit);
        
        // Upload image (backend handles Cloudinary)
        if (imageFile) {
          setUploadingImage(true);
          toast.loading('Uploading image...', { id: 'upload' });
          await artworkService.uploadArtworkImages(result.slug, [imageFile]);
          toast.success('Image uploaded!', { id: 'upload' });
          setUploadingImage(false);
        }
        
        toast.success('Artwork created successfully!');
      }

      navigate('/dashboard/artworks');
    } catch (error) {
      console.error('Error saving artwork:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save artwork';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loading text="Loading artwork..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/dashboard/artworks')}
          className="p-2 hover:bg-[#f5f5f3] dark:hover:bg-[#3a3633] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#2d2a27] dark:text-[#fafaf9]" />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-[#2d2a27] dark:text-[#fafaf9]">
            {isEditMode ? 'Edit Artwork' : 'Create New Artwork'}
          </h2>
          <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">
            {isEditMode ? 'Update your artwork details' : 'Share your creativity with the world'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="bg-white dark:bg-[#1a1816] rounded-2xl p-6 border border-[#e8e7e5] dark:border-[#4a4642]">
          <label className="flex items-center gap-2 text-lg font-semibold text-[#2d2a27] dark:text-[#fafaf9] mb-4">
            <ImageIcon className="w-5 h-5 text-[#6d2842]" />
            Artwork Image {!isEditMode && <span className="text-red-500">*</span>}
          </label>
          
          {(imagePreview || existingImage) ? (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={imagePreview || existingImage}
                  alt="Preview"
                  className="w-full max-h-96 object-contain rounded-xl border-2 border-[#e8e7e5] dark:border-[#4a4642]"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* AI Analyze Button */}
              <motion.button
                type="button"
                onClick={handleAIAnalysis}
                disabled={analyzingAI}
                whileHover={{ scale: analyzingAI ? 1 : 1.02 }}
                whileTap={{ scale: analyzingAI ? 1 : 0.98 }}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {analyzingAI ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI is analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    ✨ Analyze with AI
                  </>
                )}
              </motion.button>
              
              <p className="text-xs text-center text-[#5d5955] dark:text-[#c4bfb9]">
                {existingImage 
                  ? 'AI will auto-detect style, colors, mood, and suggest tags & description'
                  : 'For new images: Enter a title, then click. AI will save & analyze.'}
              </p>
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#e8e7e5] dark:border-[#4a4642] rounded-xl p-12 text-center hover:border-[#6d2842] dark:hover:border-[#d4a343] transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="artwork-image"
              />
              <label htmlFor="artwork-image" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-[#5d5955] dark:text-[#c4bfb9]" />
                <p className="text-lg font-medium text-[#2d2a27] dark:text-[#fafaf9] mb-2">
                  Click to upload artwork image
                </p>
                <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                  PNG, JPG or WEBP (MAX. 10MB)
                </p>
              </label>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="bg-white dark:bg-[#1a1816] rounded-2xl p-6 border border-[#e8e7e5] dark:border-[#4a4642] space-y-4">
          <h3 className="text-xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-4">Basic Information</h3>
          
          {/* Title */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#2d2a27] dark:text-[#fafaf9] mb-2">
              <FileText className="w-4 h-4 text-[#6d2842]" />
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter artwork title"
              className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#2d2a27] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
              required
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#2d2a27] dark:text-[#fafaf9]">
                <FileText className="w-4 h-4 text-[#6d2842]" />
                Description
              </label>
              <button
                type="button"
                onClick={handleEnhanceDescription}
                disabled={enhancingDesc || !formData.title}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enhancingDesc ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3 h-3" />
                    ✍️ AI Enhance
                  </>
                )}
              </button>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your artwork..."
              rows="4"
              className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#2d2a27] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9] resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#2d2a27] dark:text-[#fafaf9] mb-2">
              <Tag className="w-4 h-4 text-[#6d2842]" />
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#2d2a27] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
              required
            >
              <option value="">Select a category</option>
              {ART_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white dark:bg-[#1a1816] rounded-2xl p-6 border border-[#e8e7e5] dark:border-[#4a4642] space-y-4">
          <h3 className="text-xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-4">Pricing</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#2d2a27] dark:text-[#fafaf9] mb-2">
                <DollarSign className="w-4 h-4 text-[#6d2842]" />
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#2d2a27] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
                required
              />
            </div>

            {/* Currency */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#2d2a27] dark:text-[#fafaf9] mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#2d2a27] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
              >
                {CURRENCY_OPTIONS.map(curr => (
                  <option key={curr.value} value={curr.value}>
                    {curr.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_available"
              name="is_available"
              checked={formData.is_available}
              onChange={handleChange}
              className="w-5 h-5 text-[#6d2842] bg-[#f5f5f3] dark:bg-[#2d2a27] border-[#e8e7e5] dark:border-[#4a4642] rounded focus:ring-2 focus:ring-[#6d2842]"
            />
            <label htmlFor="is_available" className="text-sm font-medium text-[#2d2a27] dark:text-[#fafaf9] cursor-pointer">
              Available for purchase
            </label>
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white dark:bg-[#1a1816] rounded-2xl p-6 border border-[#e8e7e5] dark:border-[#4a4642] space-y-4">
          <h3 className="text-xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-4">Additional Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Medium */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#2d2a27] dark:text-[#fafaf9] mb-2">
                <Palette className="w-4 h-4 text-[#6d2842]" />
                Medium
              </label>
              <input
                type="text"
                name="medium"
                value={formData.medium}
                onChange={handleChange}
                placeholder="e.g., Oil on canvas, Digital art"
                className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#2d2a27] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
              />
            </div>

            {/* Dimensions */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#2d2a27] dark:text-[#fafaf9] mb-2">
                <Ruler className="w-4 h-4 text-[#6d2842]" />
                Dimensions
              </label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleChange}
                placeholder="e.g., 24 x 36 inches"
                className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#2d2a27] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
              />
            </div>

            {/* Year Created */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#2d2a27] dark:text-[#fafaf9] mb-2">
                <Calendar className="w-4 h-4 text-[#6d2842]" />
                Year Created
              </label>
              <input
                type="number"
                name="year_created"
                value={formData.year_created}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#2d2a27] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
              />
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#2d2a27] dark:text-[#fafaf9] mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#2d2a27] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#2d2a27] dark:text-[#fafaf9]">
                <Tag className="w-4 h-4 text-[#6d2842]" />
                Tags
              </label>
              <button
                type="button"
                onClick={handleGenerateTags}
                disabled={generatingTags || !formData.title}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingTags ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    🏷️ AI Generate
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Enter tags separated by commas (e.g., abstract, colorful, modern)"
              className="w-full px-4 py-3 bg-[#f5f5f3] dark:bg-[#2d2a27] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d2842] dark:focus:ring-[#d4a343] text-[#2d2a27] dark:text-[#fafaf9]"
            />
            <p className="text-xs text-[#5d5955] dark:text-[#c4bfb9] mt-1">
              Separate tags with commas
            </p>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center gap-4">
          <motion.button
            type="submit"
            disabled={submitting || uploadingImage}
            whileHover={{ scale: submitting ? 1 : 1.02 }}
            whileTap={{ scale: submitting ? 1 : 0.98 }}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-[#6d2842] to-[#8b3654] text-white font-semibold rounded-xl shadow-lg shadow-[#6d2842]/30 hover:shadow-xl hover:shadow-[#6d2842]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {uploadingImage ? 'Uploading Image...' : 'Saving...'}
              </span>
            ) : (
              isEditMode ? 'Update Artwork' : 'Create Artwork'
            )}
          </motion.button>

          <button
            type="button"
            onClick={() => navigate('/dashboard/artworks')}
            className="px-6 py-4 bg-[#f5f5f3] dark:bg-[#3a3633] text-[#2d2a27] dark:text-[#fafaf9] font-semibold rounded-xl hover:bg-[#e8e7e5] dark:hover:bg-[#4a4642] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ArtworkForm;
