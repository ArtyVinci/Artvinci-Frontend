import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Eye,
  Share2,
  MapPin,
  Calendar,
  Ruler,
  Palette,
  Tag,
  User,
  ImageIcon,
} from "lucide-react";
import { artworkService } from "../../services/api";
import { toast } from "react-hot-toast";
import { Loading } from "../../components/common";
import AddToCartButton from "../../components/common/AddToCartButton";
import { formatPrice } from "../../utils/helpers";
import { useAuth } from "../../hooks/useAuth";

const ArtworkDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchArtwork();
  }, [slug]);

  const fetchArtwork = async () => {
    try {
      setLoading(true);
      const data = await artworkService.getArtworkBySlug(slug);
      setArtwork(data);
    } catch (error) {
      console.error("Error fetching artwork:", error);
      toast.error("Failed to load artwork");
      navigate("/gallery");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to like artworks");
      return;
    }

    try {
      setLiking(true);
      await artworkService.likeArtwork(slug);
      // Refresh artwork data
      await fetchArtwork();
      toast.success("Artwork liked!");
    } catch (error) {
      console.error("Error liking artwork:", error);
      toast.error("Failed to like artwork");
    } finally {
      setLiking(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: artwork.title,
          text: artwork.description,
          url: url,
        })
        .catch((err) => console.log("Error sharing:", err));
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const formatCategory = (category) => {
    if (!category) return "";
    return category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Loading artwork..." />
      </div>
    );
  }

  if (!artwork) {
    return null;
  }

  const images =
    artwork.images?.length > 0
      ? artwork.images
      : artwork.primary_image
      ? [{ url: artwork.primary_image, is_primary: true }]
      : [];

  const isOwner = isAuthenticated && user?.id === artwork.artist?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafaf9] via-[#f5f5f4] to-[#e7e5e4] dark:from-[#1a1816] dark:via-[#2d2a27] dark:to-[#3a3633]">
      <div className="container-custom py-8 md:py-12">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/gallery")}
          className="flex items-center gap-2 text-[#5d5955] dark:text-[#c4bfb9] hover:text-[#6d2842] dark:hover:text-[#d4a343] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Gallery</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 shadow-2xl">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]?.url}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextElementSibling.style.display = "flex";
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                  <ImageIcon className="w-24 h-24 mb-4" />
                  <span className="text-lg font-medium">
                    No Image Available
                  </span>
                </div>
              )}

              {/* Hidden fallback */}
              <div className="w-full h-full hidden flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                <ImageIcon className="w-24 h-24 mb-4" />
                <span className="text-lg font-medium">Image Unavailable</span>
              </div>

              {/* Status Badge */}
              {artwork.status === "sold" && (
                <div className="absolute top-4 left-4 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-xl shadow-lg">
                  SOLD
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-[#6d2842] dark:border-[#d4a343] shadow-lg"
                        : "border-gray-300 dark:border-gray-700 hover:border-[#6d2842] dark:hover:border-[#d4a343]"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-4xl md:text-5xl font-bold text-[#2d2a27] dark:text-[#fafaf9]">
                  {artwork.title}
                </h1>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLike}
                    disabled={liking}
                    className="p-3 bg-white dark:bg-[#3a3633] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl hover:bg-[#f5f5f3] dark:hover:bg-[#4a4642] transition-colors disabled:opacity-50"
                  >
                    <Heart className="w-5 h-5 text-red-500" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 bg-white dark:bg-[#3a3633] border border-[#e8e7e5] dark:border-[#4a4642] rounded-xl hover:bg-[#f5f5f3] dark:hover:bg-[#4a4642] transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-[#6d2842] dark:text-[#d4a343]" />
                  </button>
                </div>
              </div>

              {/* Artist */}
              <Link
                to={`/artists/${artwork.artist?.id}`}
                className="flex items-center gap-3 mb-4 group w-fit"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6d2842] to-[#8b3654] flex items-center justify-center text-white font-bold shadow-lg">
                  {artwork.artist?.username?.charAt(0).toUpperCase() || "A"}
                </div>
                <div>
                  <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9]">
                    Artist
                  </p>
                  <p className="text-lg font-semibold text-[#2d2a27] dark:text-[#fafaf9] group-hover:text-[#6d2842] dark:group-hover:text-[#d4a343] transition-colors">
                    {artwork.artist?.username || "Unknown Artist"}
                  </p>
                </div>
              </Link>

              {/* Stats */}
              <div className="flex items-center gap-6 text-[#5d5955] dark:text-[#c4bfb9]">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span className="text-sm">
                    {artwork.views_count || 0} views
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">
                    {artwork.likes_count || 0} likes
                  </span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-br from-[#f5f5f3] to-white dark:from-[#3a3633] dark:to-[#2d2a27] p-6 rounded-2xl border border-[#e8e7e5] dark:border-[#4a4642] shadow-lg">
              <p className="text-sm text-[#5d5955] dark:text-[#c4bfb9] mb-2">
                Price
              </p>
              <p className="text-4xl font-bold text-[#6d2842] dark:text-[#d4a343] mb-4">
                {formatPrice(artwork.price, artwork.currency)}
              </p>

              {artwork.available && artwork.status !== "sold" ? (
                <AddToCartButton
                  artwork={artwork}
                  variant="primary"
                  size="lg"
                  className="w-full py-4 bg-gradient-to-r from-[#6d2842] to-[#8b3654] text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-[#6d2842]/30 transition-all flex items-center justify-center gap-2"
                />
              ) : (
                <div className="w-full py-4 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-semibold rounded-xl text-center">
                  Not Available
                </div>
              )}

              {isOwner && (
                <button
                  onClick={() => navigate(`/dashboard/artworks/edit/${slug}`)}
                  className="w-full mt-3 py-3 bg-white dark:bg-[#3a3633] border-2 border-[#6d2842] dark:border-[#d4a343] text-[#6d2842] dark:text-[#d4a343] font-semibold rounded-xl hover:bg-[#6d2842] hover:text-white dark:hover:bg-[#d4a343] dark:hover:text-[#1a1816] transition-all"
                >
                  Edit Artwork
                </button>
              )}
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-[#1a1816] p-6 rounded-2xl border border-[#e8e7e5] dark:border-[#4a4642] shadow-lg">
              <h3 className="text-xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-3">
                Description
              </h3>
              <p className="text-[#5d5955] dark:text-[#c4bfb9] leading-relaxed whitespace-pre-wrap">
                {artwork.description || "No description provided."}
              </p>
            </div>

            {/* Details */}
            <div className="bg-white dark:bg-[#1a1816] p-6 rounded-2xl border border-[#e8e7e5] dark:border-[#4a4642] shadow-lg space-y-4">
              <h3 className="text-xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-4">
                Details
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {/* Category */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#b8862f] to-[#d4a343] flex items-center justify-center">
                    <Tag className="w-5 h-5 text-[#1a1816]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#5d5955] dark:text-[#c4bfb9]">
                      Category
                    </p>
                    <p className="font-semibold text-[#2d2a27] dark:text-[#fafaf9]">
                      {formatCategory(artwork.category)}
                    </p>
                  </div>
                </div>

                {/* Medium */}
                {artwork.medium && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#508978] to-[#70a596] flex items-center justify-center">
                      <Palette className="w-5 h-5 text-[#1a1816]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-[#5d5955] dark:text-[#c4bfb9]">
                        Medium
                      </p>
                      <p className="font-semibold text-[#2d2a27] dark:text-[#fafaf9]">
                        {artwork.medium}
                      </p>
                    </div>
                  </div>
                )}

                {/* Dimensions */}
                {artwork.dimensions && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6d2842] to-[#8b3654] flex items-center justify-center">
                      <Ruler className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-[#5d5955] dark:text-[#c4bfb9]">
                        Dimensions
                      </p>
                      <p className="font-semibold text-[#2d2a27] dark:text-[#fafaf9]">
                        {artwork.dimensions}
                      </p>
                    </div>
                  </div>
                )}

                {/* Year Created */}
                {artwork.year_created && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4a4642] to-[#6d6762] flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-[#5d5955] dark:text-[#c4bfb9]">
                        Year Created
                      </p>
                      <p className="font-semibold text-[#2d2a27] dark:text-[#fafaf9]">
                        {artwork.year_created}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {artwork.tags && artwork.tags.length > 0 && (
              <div className="bg-white dark:bg-[#1a1816] p-6 rounded-2xl border border-[#e8e7e5] dark:border-[#4a4642] shadow-lg">
                <h3 className="text-xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-3">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {artwork.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#f5f5f3] dark:bg-[#3a3633] text-[#5d5955] dark:text-[#c4bfb9] rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetail;
