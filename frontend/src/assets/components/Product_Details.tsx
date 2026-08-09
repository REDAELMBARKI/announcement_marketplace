import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  MessageCircle, 
  Share2, 
  ChevronLeft,
  Clock,
  Star,
  Heart
} from "lucide-react";
import { 
  MapPoint as MapPin, 
  Bag as ShoppingBag,
  User
} from "@solar-icons/react";
import { Product, ApiResponse } from "./User/announcement/types";
import { useTheme } from "../../context/ThemeContext";
import OfferModal from "./OfferModal";
// Use global api service or dynamic baseURL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

// Current user ID (get from auth context or localStorage)
const getCurrentUserId = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.id || 1;
};

// Review interface
interface Review {
  id: number;
  rating: number;
  comment: string;
  reviewer: {
    id: number;
    name: string;
    avatar?: string;
  };
  created_at: string;
}

const Product_Details: React.FC = () => {
  const { colors } = useTheme();
  const { announcementSlug } = useParams<{ announcementSlug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  
  // Modal states
  const [showOfferModal, setShowOfferModal] = useState(false);

  console.log("Product_Details mounted, announcementSlug:", announcementSlug);

  const handleChatWithSeller = async () => {
    if (!product) return;
    
    try {
      // Get or create conversation
      const res = await axios.post(`/api/announcements/${product.slug}/conversation`);
      if (res.data.status === 'success') {
        const conversationSlug = res.data.conversation.slug;
        navigate(`/chat/${conversationSlug}`);
      }
    } catch (err: any) {
      console.error("Failed to start conversation:", err);
      const errorMessage = err.response?.data?.message || "Failed to start conversation. Please try again.";
      alert(errorMessage);
    }
  };

  const toggleFavorite = async () => {
    if (!product) return;
    const newStatus = !isFavorited;
    setIsFavorited(newStatus);
    try {
      await axios.post(`/api/announcements/${product.slug}/favorite`, { favorite: newStatus });
    } catch (err) {
      console.error("Favorite toggle error:", err);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !newComment.trim()) return;
    
    setSubmittingReview(true);
    try {
      const res = await axios.post(`/api/announcements/${product.slug}/reviews`, {
        rating: newRating,
        comment: newComment
      });
      
      if (res.data.status === 'success') {
        setReviews([res.data.review, ...reviews]);
        setNewComment('');
        setNewRating(5);
      }
    } catch (err) {
      console.error('Submit review error:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const getImageUrl = (media: any) => {
    if (!media) return null;
    if (media.url && media.url.startsWith('http')) return media.url;
    const baseUrl = import.meta.env.VITE_API_URL || "";
    return `${baseUrl}/storage/${media.file_path.replace("public/", "")}`;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      console.log("fetchProduct called, announcementSlug:", announcementSlug);
      if (!announcementSlug) {
        console.log("No announcementSlug, returning");
        return;
      }
      
      try {
        console.log("Making API call to:", `/api/announcements/${announcementSlug}`);
        const res = await axios.get(`/api/announcements/${announcementSlug}`, { timeout: 10000 });
        console.log("API response received:", res.data);
        if (res.data.status === "success" && (res.data.product?.data || res.data.product)) {
          const productData = res.data.product?.data || res.data.product;
          console.log("Setting product data:", productData);
          setProduct(productData);
          if (productData.thumbnail) {
            setActiveImage(getImageUrl(productData.thumbnail));
          }
          
          // Fetch reviews for this product
          try {
            const reviewsRes = await axios.get(`/api/announcements/${announcementSlug}/reviews`);
            if (reviewsRes.data.status === 'success') {
              setReviews(reviewsRes.data.reviews || []);
            }
          } catch (reviewsErr) {
            console.error('Fetch reviews error:', reviewsErr);
          }
        }
      } catch (err) {
        console.error("Fetch product error:", err);
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [announcementSlug]);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading product details...</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '100px' }}>Product not found.</div>;

  const gallery = product.gallery || [];
  const allImages = [
    ...(product.thumbnail ? [getImageUrl(product.thumbnail)] : []),
    ...gallery.map(img => getImageUrl(img))
  ].filter(Boolean) as string[];

  return (
    <>
      <div className="product-details-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', backgroundColor: colors.bgPrimary }}>
      {/* Breadcrumb / Back button */}
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'none', 
          border: 'none', 
          color: colors.primary, 
          fontWeight: '600', 
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        <ChevronLeft size={20} strokeWidth={2} />
        Back to results
      </button>

      <div className="product-main" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Left: Images */}
        <div className="image-section">
          <div className="main-image" style={{ width: '100%', height: '500px', borderRadius: '16px', overflow: 'hidden', backgroundColor: colors.bgTertiary, marginBottom: '15px' }}>
            {activeImage ? (
              <img src={activeImage} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <ShoppingBag size={100} color={colors.textMuted} weight="BoldDuotone" />
              </div>
            )}
          </div>
          
          <div className="thumbnails" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
            {allImages.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(img)}
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '8px', 
                  border: activeImage === img ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                  overflow: 'hidden',
                  padding: '0',
                  cursor: 'pointer',
                  flexShrink: '0',
                  backgroundColor: colors.bgSecondary
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="info-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '12px', 
              fontWeight: '700',
              backgroundColor: product.listing_mode === 'sell' ? colors.primary : colors.success,
              color: colors.bgSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {product.listing_mode === 'sell' ? 'For Sale' : 'Free / Donation'}
            </span>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer' }}><Share2 size={20} strokeWidth={2} /></button>
              <button 
                onClick={toggleFavorite}
                style={{ background: 'none', border: 'none', color: isFavorited ? colors.danger : colors.textSecondary, cursor: 'pointer' }}
              >
                <Heart size={20} color={isFavorited ? colors.danger : colors.textSecondary} fill={isFavorited ? colors.danger : "none"} strokeWidth={2} />
              </button>
            </div>
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: '800', color: colors.textPrimary, marginTop: '15px', marginBottom: '10px' }}>
            {product.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: colors.textSecondary, fontSize: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={16} weight="BoldDuotone" color={colors.iconCoral} /> Agadir, Morocco</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16} strokeWidth={2} /> Posted {new Date(product.created_at).toLocaleDateString()}</div>
          </div>

          <div style={{ fontSize: '36px', fontWeight: '800', color: colors.textPrimary, marginBottom: '25px' }}>
            {product.listing_mode === 'sell' ? `${product.price} ${product.currency}` : 'FREE'}
            {product.price_negotiable && <span style={{ fontSize: '14px', fontWeight: '500', color: colors.textSecondary, marginLeft: '10px' }}>(Negotiable)</span>}
          </div>

          <div className="action-buttons" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
            <button 
              onClick={handleChatWithSeller}
              style={{ 
                padding: '15px', 
                backgroundColor: colors.primary, 
                color: colors.bgSecondary, 
                border: 'none', 
                borderRadius: '12px', 
                fontWeight: '700', 
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer'
              }}
            >
              <MessageCircle size={20} />
              Chat with Seller
            </button>
            <button 
              onClick={() => setShowOfferModal(true)}
              style={{ 
                padding: '15px', 
                backgroundColor: colors.bgSecondary, 
                color: colors.primary, 
                border: `2px solid ${colors.primary}`, 
                borderRadius: '12px', 
                fontWeight: '700', 
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Make Offer
            </button>
          </div>

          {/* Details Table */}
          <div className="product-specs" style={{ backgroundColor: colors.bgTertiary, padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px', color: colors.textPrimary }}>Product Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <div style={{ color: colors.textSecondary, fontSize: '13px' }}>Condition</div>
                <div style={{ fontWeight: '600', color: colors.textPrimary }}>{product.condition}</div>
              </div>
              <div>
                <div style={{ color: colors.textSecondary, fontSize: '13px' }}>Age Recommended</div>
                <div style={{ fontWeight: '600', color: colors.textPrimary }}>{product.age_range}</div>
              </div>
              <div>
                <div style={{ color: colors.textSecondary, fontSize: '13px' }}>Brand</div>
                <div style={{ fontWeight: '600', color: colors.textPrimary }}>{product.brand || 'No brand'}</div>
              </div>
              <div>
                <div style={{ color: colors.textSecondary, fontSize: '13px' }}>Gender</div>
                <div style={{ fontWeight: '600', color: colors.textPrimary }}>{product.gender || 'Unisexe'}</div>
              </div>
            </div>
          </div>

          <div className="description">
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: colors.textPrimary }}>Description</h3>
            <p style={{ color: colors.textSecondary, lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {product.description || 'No description provided.'}
            </p>
          </div>
        </div>
      </div>

      {/* Seller Section */}
      <div className="seller-section" style={{ marginTop: '50px', padding: '30px', borderTop: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: colors.bgTertiary, overflow: 'hidden' }}>
            {product.user?.avatar ? (
              <img src={product.user.avatar} alt="" style={{ width: '100%', height: '100%' }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '24px', color: colors.textMuted }}>
                <User size={32} weight="BoldDuotone" />
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: colors.textPrimary }}>{product.user?.name || 'Seller'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: colors.warning, fontSize: '14px' }}>
              <Star size={14} fill={colors.warning} strokeWidth={2} />
              <span style={{ fontWeight: '600' }}>4.8</span>
              <span style={{ color: colors.textSecondary }}>(24 reviews)</span>
            </div>
          </div>
        </div>
        
        <Link to={`/profile/${product.user?.id}`} style={{ 
          padding: '10px 20px', 
          border: `1px solid ${colors.border}`, 
          borderRadius: '8px', 
          textDecoration: 'none', 
          color: colors.textPrimary,
          fontWeight: '600',
          backgroundColor: colors.bgSecondary
        }}>
          View Profile
        </Link>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section" style={{ marginTop: '50px', padding: '30px', borderTop: `1px solid ${colors.border}` }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '25px', color: colors.textPrimary }}>
          Reviews & Comments ({reviews.length})
        </h2>

        {/* Add Review Form */}
        <div style={{ backgroundColor: colors.bgTertiary, padding: '25px', borderRadius: '12px', marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px', color: colors.textPrimary }}>Write a Review</h3>
          <form onSubmit={submitReview}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: colors.textSecondary, fontSize: '14px' }}>Rating</label>
              <div style={{ display: 'flex', gap: '5px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                  >
                    <Star 
                      size={24} 
                      fill={star <= newRating ? colors.warning : 'none'} 
                      color={star <= newRating ? colors.warning : colors.textMuted}
                      strokeWidth={2}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: colors.textSecondary, fontSize: '14px' }}>Your Comment</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.bgSecondary,
                  color: colors.textPrimary,
                  fontSize: '14px',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={submittingReview || !newComment.trim()}
              style={{
                padding: '12px 25px',
                backgroundColor: colors.primary,
                color: colors.bgSecondary,
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                opacity: submittingReview || !newComment.trim() ? 0.6 : 1
              }}
            >
              {submittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reviews.length === 0 ? (
            <p style={{ color: colors.textSecondary, fontStyle: 'italic' }}>No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} style={{ backgroundColor: colors.bgSecondary, padding: '20px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: colors.bgTertiary, overflow: 'hidden' }}>
                      {review.reviewer?.avatar ? (
                        <img src={review.reviewer.avatar} alt="" style={{ width: '100%', height: '100%' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: colors.textMuted }}>
                          <User size={20} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: colors.textPrimary }}>{review.reviewer?.name || 'Anonymous'}</div>
                      <div style={{ fontSize: '12px', color: colors.textMuted }}>{new Date(review.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < review.rating ? colors.warning : 'none'} 
                        color={i < review.rating ? colors.warning : colors.textMuted}
                      />
                    ))}
                  </div>
                </div>
                <p style={{ color: colors.textSecondary, lineHeight: '1.6', margin: 0 }}>{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>

    {/* Modals */}
    {showOfferModal && product && (
      <OfferModal
        product={{ 
          id: product.id, 
          title: product.title, 
          price: product.price, 
          slug: product.slug,
          currency: product.currency 
        }}
        onClose={() => setShowOfferModal(false)}
        onSuccess={() => {
          alert('Offer submitted successfully!');
        }}
      />
    )}
  </>);
}

export default Product_Details;
