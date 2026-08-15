import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  MessageCircle,
  Share2,
  ChevronLeft,
  Clock,
  Star,
  Heart,
  Phone,
  Eye,
  AlertTriangle,
  Flag,
} from "lucide-react";
import {
  MapPoint as MapPin,
  Bag as ShoppingBag,
  User,
} from "@solar-icons/react";
import { Product, ApiResponse } from "./User/announcement/types";
import { useTheme } from "../../context/ThemeContext";
import OfferModal from "./OfferModal";
import LoadingScreen from "../../components/Loading/LoadingScreen";
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

const APP_LOCALE = (import.meta.env.VITE_APP_LOCALE || 'fr-FR').replace('_', '-');
const LOCALE_SHORT = APP_LOCALE.split('-')[0] || 'fr';

const formatRelativeTime = (iso: string): string => {
  try {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';
    const diffMs = then - Date.now();
    const rtf = new (Intl as any).RelativeTimeFormat(LOCALE_SHORT, { numeric: 'auto' });
    const abs = Math.abs(diffMs);
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    if (abs < minute) return rtf.format(Math.round(diffMs / 1000), 'second');
    if (abs < hour) return rtf.format(Math.round(diffMs / minute), 'minute');
    if (abs < day) return rtf.format(Math.round(diffMs / hour), 'hour');
    if (abs < week) return rtf.format(Math.round(diffMs / day), 'day');
    if (abs < 31 * day) return rtf.format(Math.round(diffMs / week), 'week');
    return new Date(iso).toLocaleDateString(LOCALE_SHORT, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
};

const getCurrentUserId = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.id || 1;
};

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

const formatWhatsAppLink = (phone: string, title: string): string => {
  const digits = phone.replace(/\D/g, '');
  const text = `Bonjour, je suis intéressé(e) par votre annonce : ${title}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
};

const formatLocation = (product: Product): string | null => {
  const addr = (product as any).city?.name
    || (product as any).city_name
    || product.pickup_address
    || (product as any).location;
  if (!addr) return null;
  const clean = String(addr).trim();
  if (!clean) return null;
  const parts = clean.split(',').map((s) => s.trim()).filter(Boolean);
  return parts.slice(0, 2).join(', ');
};

const Product_Details: React.FC = () => {
  const { colors } = useTheme();
  const { announcementSlug } = useParams<{ announcementSlug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  const handleChatWithSeller = async () => {
    if (!product) return;
    try {
      const res = await axios.post(`/api/announcements/${product.slug}/conversation`);
      if (res.data.status === 'success') {
        const conversationSlug = res.data.conversation.slug;
        navigate(`/chat/${conversationSlug}`);
      }
    } catch (err: any) {
      const sellerId = product.user_id || product.user?.id;
      navigate(`/chat?with=${sellerId}&announcement=${product.id}`);
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
      if (!announcementSlug) return;
      try {
        const res = await axios.get(`/api/announcements/${announcementSlug}`, { timeout: 10000 });
        if (res.data.status === "success" && (res.data.product?.data || res.data.product)) {
          const productData = res.data.product?.data || res.data.product;
          setProduct(productData);
          setIsFavorited(Boolean(productData.is_favorited));
          if (productData.thumbnail) {
            setActiveImage(getImageUrl(productData.thumbnail));
          }
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
        setLoading(false);
      }
    };
    fetchProduct();
  }, [announcementSlug]);

  if (loading) return (
    <LoadingScreen
      isLoading={true}
      variant="wave"
      label={import.meta.env.VITE_APP_NAME || "Let's be us"}
      hint="Loading product details..."
    />
  );
  if (!product) return <div style={{ textAlign: 'center', padding: '100px' }}>Product not found.</div>;

  const gallery = product.gallery || [];
  const allImages = [
    ...(product.thumbnail ? [getImageUrl(product.thumbnail)] : []),
    ...gallery.map(img => getImageUrl(img))
  ].filter(Boolean) as string[];

  // --- Contact info from API (backend) ---
  const hasPhone = Boolean((product as any).contact_phone && String((product as any).contact_phone).trim() !== '');
  const phoneRaw = hasPhone ? String((product as any).contact_phone).trim() : '';
  const whatsappLink = hasPhone ? formatWhatsAppLink(phoneRaw, product.title) : '';
  const telLink = hasPhone ? `tel:${encodeURIComponent(phoneRaw)}` : '';
  const sellerEmail = product.user?.email;

  const sellerName = product.user?.name || 'Vendeur';
  const isSell = product.listing_mode !== 'donate';
  const price = isSell
    ? (Number.isFinite(Number(product.price)) ? `${Math.floor(Number(product.price))} ${product.currency || 'DH'}` : 'Prix libre')
    : 'GRATUIT';
  const priceColor = isSell ? (colors.primary || '#2970e6') : (colors.success || '#10b981');
  const locationLine = formatLocation(product);
  const relativeTime = formatRelativeTime(product.created_at);
  const viewsCount = product.views_count || (product as any).views || 0;
  const isUrgent = (product as any).is_urgent || (product as any).is_boosted;
  const favoritesCount = product.favorites_count || 0;

  // Categories breadcrumb (uses first category name if exists)
  const categoriesList = (product as any).categories || (product as any).product_categories || [];
  const categoryName = categoriesList?.[0]?.name || (product as any).super_category_name || 'Annonce';
  const categoryLabel = `${categoryName}, ${isSell ? 'à vendre' : 'à donner'}`;

  return (
    <div className="announcement-detail-page" style={{
      backgroundColor: colors.bgSecondary || '#ffffff',
      minHeight: '100vh',
      color: colors.textPrimary,
    }}>
      <div style={{
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '20px 24px 80px',
      }}>
        {/* Breadcrumb / Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: colors.textSecondary,
            fontWeight: '500',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '18px',
          }}
        >
          <ChevronLeft size={18} strokeWidth={2} />
          Retour aux résultats
        </button>

        {/* ====== MAIN GRID — image left, summary right ====== */}
        <div className="pd-main-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
          gap: '32px',
          alignItems: 'flex-start',
        }}>
          {/* =============== LEFT: GALLERY =============== */}
          <div className="pd-gallery-wrap">
            <div className="pd-main-image" style={{
              width: '100%',
              aspectRatio: '4 / 3',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: colors.bgTertiary,
              position: 'relative',
            }}>
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <ShoppingBag size={80} color={colors.textMuted} weight="BoldDuotone" />
                </div>
              )}
            </div>

            {/* Thumbnails row */}
            {allImages.length > 1 && (
              <div className="pd-thumbnails" style={{
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                padding: '14px 0 4px',
                scrollbarWidth: 'none',
              }}>
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    style={{
                      width: '78px',
                      height: '78px',
                      borderRadius: '10px',
                      border: activeImage === img
                        ? `2px solid ${colors.primary || '#3a7afe'}`
                        : `1px solid ${colors.border || 'rgba(0,0,0,0.08)'}`,
                      overflow: 'hidden',
                      padding: '0',
                      cursor: 'pointer',
                      flexShrink: 0,
                      backgroundColor: colors.bgSecondary,
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* =============== RIGHT: SUMMARY CARD =============== */}
          <div className="pd-summary-card" style={{
            backgroundColor: colors.bgPrimary || '#ffffff',
            border: `1px solid ${colors.border || 'rgba(0,0,0,0.06)'}`,
            borderRadius: '12px',
            padding: '22px 24px',
            position: 'sticky',
            top: '80px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            {/* Row 1: Urgent badge + favorite/share */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isUrgent && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}>
                    <Clock size={12} strokeWidth={2.4} /> Urgent
                  </span>
                )}
                {!isSell && (
                  <span style={{
                    padding: '5px 12px',
                    backgroundColor: colors.success || '#10b981',
                    color: '#ffffff',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}>
                    Donation
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  style={{
                    background: 'none', border: 'none',
                    color: colors.textSecondary, cursor: 'pointer',
                    padding: 0, display: 'inline-flex',
                  }}
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: product.title, url: window.location.href }).catch(() => {});
                    } else {
                      navigator.clipboard?.writeText(window.location.href);
                    }
                  }}
                  title="Partager"
                >
                  <Share2 size={19} strokeWidth={2} />
                </button>
                <button
                  onClick={toggleFavorite}
                  style={{
                    background: 'none', border: 'none',
                    color: isFavorited ? '#ef4444' : colors.textSecondary,
                    cursor: 'pointer', padding: 0, display: 'inline-flex',
                  }}
                  title={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  <Heart size={20} fill={isFavorited ? '#ef4444' : "none"} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Row 2: Title + Price (flex wrap → stacks on mobile) */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}>
              <h1 style={{
                fontSize: '22px',
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
                color: colors.textPrimary,
                margin: 0,
                flex: '1 1 320px',
              }}>
                {product.title}
              </h1>
              <div style={{
                fontSize: '30px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                color: priceColor,
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}>
                {price}
                {product.price_negotiable && (
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: colors.textMuted,
                    marginLeft: '8px',
                  }}>(négociable)</span>
                )}
              </div>
            </div>

            {/* Row 3: meta line — location · time · views */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '18px',
              fontSize: '13.5px',
              color: colors.textSecondary,
              paddingBottom: '2px',
            }}>
              {locationLine && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: priceColor,
                  fontWeight: 500,
                }}>
                  <MapPin size={15} weight="BoldDuotone" /> {locationLine}
                </div>
              )}
              {relativeTime && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={15} strokeWidth={2} /> il y a {relativeTime.replace('il y a ', '').replace('ago', '')}
                </div>
              )}
              {viewsCount > 0 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Eye size={15} strokeWidth={2} />
                  {viewsCount} vues {favoritesCount > 0 ? `· ♥ ${favoritesCount}` : ''}
                </div>
              )}
            </div>

            {/* =============== SELLER + CONTACT BUTTONS (reference UI block) =============== */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              padding: '12px 0 6px',
            }}>
              {/* Seller (left) */}
              <Link
                to={`/profile/${product.user?.id || product.user_id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  textDecoration: 'none',
                  color: 'inherit',
                  minWidth: 0,
                  flex: '1 1 auto',
                }}
              >
                <div style={{
                  width: '46px', height: '46px', borderRadius: '50%',
                  backgroundColor: colors.bgTertiary, overflow: 'hidden',
                  flexShrink: 0,
                  border: `2px solid ${colors.cardBorder || colors.border || 'rgba(0,0,0,0.06)'}`,
                }}>
                  {product.user?.avatar ? (
                    <img src={product.user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      height: '100%', width: '100%',
                      background: `linear-gradient(135deg, ${colors.primary || '#3a7afe'}, ${colors.coral || '#ff6b6b'})`,
                      color: '#fff', fontWeight: 800, fontSize: '16px', letterSpacing: '0.02em',
                    }}>
                      {sellerName.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: colors.textPrimary,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {sellerName}
                    {((product as any).user?.store || (product as any).user?.is_pro) && (
                      <span style={{
                        marginLeft: '6px',
                        display: 'inline-block',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: (colors.warning || '#f59e0b'),
                        color: '#1a1208',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                        verticalAlign: 'middle',
                      }}>
                        PRO
                      </span>
                    )}
                  </div>
                  {(product.user as any)?.store_name ? (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      marginTop: '2px',
                      padding: '3px 9px',
                      background: '#111827',
                      color: '#ffffff',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}>
                      🛍 Voir la boutique
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      marginTop: '2px', fontSize: '12px', color: colors.textMuted,
                    }}>
                      <Star size={11} fill={colors.warning || '#f59e0b'} color={colors.warning || '#f59e0b'} strokeWidth={0} />
                      <span style={{ fontWeight: 600 }}>4.8</span>
                      <span>· Vendeur vérifié</span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Contact buttons (right) — circles + big blue button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexShrink: 0,
              }}>
                {/* WhatsApp (green circle) — only if phone provided */}
                {hasPhone && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="WhatsApp"
                    style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      backgroundColor: 'rgba(37,211,102,0.14)',
                      color: '#25d366',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      textDecoration: 'none',
                      transition: 'background-color 120ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(37,211,102,0.24)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(37,211,102,0.14)')}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.52 3.48A11.82 11.82 0 0 0 12.04 0C5.46 0 .1 5.37.1 11.95c0 2.1.55 4.16 1.6 5.97L0 24l6.23-1.64a11.94 11.94 0 0 0 5.8 1.49h.01c6.58 0 11.94-5.37 11.94-11.95 0-3.19-1.24-6.19-3.46-8.42zM12.04 21.8h-.01a9.84 9.84 0 0 1-5.02-1.39l-.36-.22-3.7.98 1-3.6-.24-.37a9.85 9.85 0 0 1-1.51-5.26c0-5.46 4.44-9.9 9.9-9.9 2.64 0 5.13 1.03 7 2.9a9.84 9.84 0 0 1 2.9 7c0 5.45-4.44 9.9-9.9 9.86zm5.41-7.39c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15s-.77.97-.95 1.17-.35.22-.65.07c-.3-.15-1.26-.47-2.4-1.48-.89-.78-1.48-1.75-1.66-2.04-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.09 3.19 5.06 4.47.7.31 1.25.49 1.67.63.7.22 1.34.19 1.84.12.56-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z"/>
                    </svg>
                  </a>
                )}

                {/* Message (blue circle) — ALWAYS */}
                <button
                  type="button"
                  onClick={handleChatWithSeller}
                  title="Message"
                  style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    backgroundColor: (colors.primary ? `${colors.primary}1a` : 'rgba(58,122,254,0.12)'),
                    color: colors.primary || '#3a7afe',
                    border: 'none',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 120ms ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = (colors.primary ? `${colors.primary}33` : 'rgba(58,122,254,0.22)'))}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = (colors.primary ? `${colors.primary}1a` : 'rgba(58,122,254,0.12)'))}
                >
                  <MessageCircle size={21} strokeWidth={2.1} />
                </button>

                {/* Big blue button — Contacter le Vendeur (phone+text) — if phone, tel else chat */}
                {hasPhone ? (
                  <a
                    href={telLink}
                    title={phoneRaw}
                    style={{
                      padding: '0 22px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: colors.primary || '#3a7afe',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '14.5px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: 'filter 120ms ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                  >
                    <Phone size={18} strokeWidth={2.2} />
                    Contacter le Vendeur
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={handleChatWithSeller}
                    style={{
                      padding: '0 22px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: colors.primary || '#3a7afe',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '14.5px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'filter 120ms ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                  >
                    <MessageCircle size={18} strokeWidth={2.2} />
                    Contacter le Vendeur
                  </button>
                )}
              </div>
            </div>

            {/* Ref # + Signal abus */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              paddingTop: '14px',
              paddingBottom: '4px',
              borderTop: `1px solid ${colors.border || 'rgba(0,0,0,0.06)'}`,
              fontSize: '13px',
              color: colors.textSecondary,
            }}>
              <div>Réf. de l'annonce : <strong style={{ color: colors.textPrimary }}>#{product.id}</strong></div>
              <button
                type="button"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: colors.textSecondary,
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  fontSize: '13px',
                  padding: 0,
                }}
              >
                <Flag size={14} strokeWidth={2} />
                <span style={{ textDecoration: 'underline' }}>Signaler un abus</span>
              </button>
            </div>

            {/* Safety warning */}
            <div style={{
              display: 'flex',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '10px',
              backgroundColor: (colors.bgTertiary || '#f6f6f8'),
              alignItems: 'flex-start',
              fontSize: '13px',
              color: colors.textSecondary,
              lineHeight: 1.45,
            }}>
              <AlertTriangle size={18} strokeWidth={2} style={{ color: colors.warning || '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
              <div>
                Il ne faut jamais envoyer de l'argent à l'avance au vendeur par virement bancaire ou à travers une agence de transfert d'argent lors de l'achat des biens disponibles sur le site.
                {sellerEmail && <div style={{ marginTop: '4px' }}>Email du vendeur : <strong style={{ color: colors.textPrimary }}>{sellerEmail}</strong></div>}
              </div>
            </div>

            {/* Secondary: Condition/Age/Brand */}
            <div className="pd-specs-block" style={{
              paddingTop: '16px',
              borderTop: `1px solid ${colors.border || 'rgba(0,0,0,0.06)'}`,
            }}>
              <div style={{
                fontSize: '12.5px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: colors.textMuted,
                marginBottom: '10px',
              }}>
                Détails du produit
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
                gap: '12px 24px',
                fontSize: '13.5px',
              }}>
                {product.condition && (
                  <div>
                    <div style={{ color: colors.textMuted, fontSize: '12px', marginBottom: '2px' }}>État</div>
                    <div style={{ fontWeight: 600, color: colors.textPrimary }}>{product.condition}</div>
                  </div>
                )}
                {product.age_range && (
                  <div>
                    <div style={{ color: colors.textMuted, fontSize: '12px', marginBottom: '2px' }}>Âge recommandé</div>
                    <div style={{ fontWeight: 600, color: colors.textPrimary }}>{product.age_range}</div>
                  </div>
                )}
                {product.brand && (
                  <div>
                    <div style={{ color: colors.textMuted, fontSize: '12px', marginBottom: '2px' }}>Marque</div>
                    <div style={{ fontWeight: 600, color: colors.textPrimary }}>{product.brand}</div>
                  </div>
                )}
                {product.gender && (
                  <div>
                    <div style={{ color: colors.textMuted, fontSize: '12px', marginBottom: '2px' }}>Genre</div>
                    <div style={{ fontWeight: 600, color: colors.textPrimary }}>{product.gender}</div>
                  </div>
                )}
                {product.handover_method && (
                  <div>
                    <div style={{ color: colors.textMuted, fontSize: '12px', marginBottom: '2px' }}>Remise</div>
                    <div style={{ fontWeight: 600, color: colors.textPrimary }}>
                      {product.handover_method === 'pickup' ? 'Retrait sur place' :
                        product.handover_method === 'delivery' ? 'Livraison' : 'Retrait ou Livraison'}
                    </div>
                  </div>
                )}
                <div>
                  <div style={{ color: colors.textMuted, fontSize: '12px', marginBottom: '2px' }}>Catégorie</div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    fontWeight: 600, color: colors.textPrimary,
                  }}>
                    {categoryLabel}
                  </div>
                </div>
              </div>
            </div>

            {/* Offer + Make offer row */}
            <div className="pd-offer-row" style={{
              display: 'flex',
              gap: '10px',
              paddingTop: '18px',
              flexWrap: 'wrap',
            }}>
              <button
                type="button"
                onClick={() => setShowOfferModal(true)}
                style={{
                  flex: '1 1 0',
                  minWidth: '180px',
                  padding: '0 22px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: colors.bgSecondary || '#ffffff',
                  color: colors.primary || '#3a7afe',
                  border: `2px solid ${colors.primary || '#3a7afe'}`,
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background-color 120ms ease',
                }}
              >
                Faire une offre
              </button>
            </div>
          </div>
        </div>

        {/* ====== DESCRIPTION SECTION (full-width below) ====== */}
        <section className="pd-description" style={{
          marginTop: '56px',
          backgroundColor: colors.bgPrimary || '#ffffff',
          border: `1px solid ${colors.border || 'rgba(0,0,0,0.06)'}`,
          borderRadius: '12px',
          padding: '24px 26px',
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            margin: 0,
            marginBottom: '12px',
            color: colors.textPrimary,
          }}>
            Description
          </h2>
          <p style={{
            color: colors.textSecondary,
            lineHeight: 1.65,
            fontSize: '14.5px',
            margin: 0,
            whiteSpace: 'pre-line',
          }}>
            {product.description || 'Aucune description fournie par le vendeur.'}
          </p>
        </section>

        {/* ====== REVIEWS ====== */}
        <section className="pd-reviews" style={{ marginTop: '56px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '22px',
            color: colors.textPrimary,
          }}>
            Avis & Commentaires ({reviews.length})
          </h2>

          <div style={{
            backgroundColor: colors.bgTertiary,
            padding: '24px 26px',
            borderRadius: '12px',
            marginBottom: '28px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px', color: colors.textPrimary }}>
              Donner votre avis
            </h3>
            <form onSubmit={submitReview}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: colors.textSecondary, fontSize: '13.5px' }}>Note</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <Star
                        size={22}
                        fill={star <= newRating ? (colors.warning || '#f59e0b') : 'none'}
                        color={star <= newRating ? (colors.warning || '#f59e0b') : colors.textMuted}
                        strokeWidth={2}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: colors.textSecondary, fontSize: '13.5px' }}>Votre commentaire</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Partagez votre expérience..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.bgSecondary,
                    color: colors.textPrimary,
                    fontSize: '14px',
                    minHeight: '100px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview || !newComment.trim()}
                style={{
                  padding: '11px 24px',
                  backgroundColor: colors.primary || '#3a7afe',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: submittingReview || !newComment.trim() ? 0.6 : 1,
                }}
              >
                {submittingReview ? 'Envoi...' : 'Publier'}
              </button>
            </form>
          </div>

          <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {reviews.length === 0 ? (
              <p style={{ color: colors.textSecondary, fontStyle: 'italic', padding: '20px' }}>
                Pas encore d'avis. Soyez le premier à commenter !
              </p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  style={{
                    backgroundColor: colors.bgSecondary,
                    padding: '18px 20px',
                    borderRadius: '12px',
                    border: `1px solid ${colors.border || 'rgba(0,0,0,0.06)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: colors.bgTertiary, overflow: 'hidden' }}>
                        {review.reviewer?.avatar ? (
                          <img src={review.reviewer.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: colors.textMuted }}>
                            <User size={18} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: colors.textPrimary }}>{review.reviewer?.name || 'Anonyme'}</div>
                        <div style={{ fontSize: '12px', color: colors.textMuted }}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          fill={i < review.rating ? (colors.warning || '#f59e0b') : 'none'}
                          color={i < review.rating ? (colors.warning || '#f59e0b') : colors.textMuted}
                          strokeWidth={0}
                        />
                      ))}
                    </div>
                  </div>
                  <p style={{ color: colors.textSecondary, lineHeight: 1.6, margin: 0, fontSize: '14px' }}>
                    {review.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* ------ Responsive + detail page CSS-injected style ------ */}
      <style>{`
        @media (max-width: 960px) {
          .pd-main-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .pd-summary-card {
            position: static !important;
            top: auto !important;
          }
        }
        @media (max-width: 640px) {
          .announcement-detail-page > div {
            padding: 14px 16px 60px !important;
          }
          .pd-main-image {
            border-radius: 10px !important;
          }
          .pd-thumbnails button {
            width: 62px !important;
            height: 62px !important;
            border-radius: 8px !important;
          }
          .pd-summary-card {
            padding: 18px 18px !important;
            gap: 12px !important;
            border-radius: 10px !important;
          }
          .pd-summary-card h1 {
            font-size: 19px !important;
          }
          .pd-summary-card h1 + div {
            font-size: 26px !important;
          }
          .pd-specs-block > div:last-child {
            grid-template-columns: 1fr !important;
            gap: 10px 18px !important;
          }
          .pd-offer-row button {
            width: 100% !important;
            min-width: 0 !important;
          }
        }
        .pd-thumbnails::-webkit-scrollbar { display: none; }
      `}</style>

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
          onSuccess={() => alert('Offre envoyée avec succès !')}
        />
      )}
    </div>
  );
};

export default Product_Details;
