import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  MapPin, 
  Heart, 
  MessageCircle, 
  Share2, 
  ChevronLeft,
  ShoppingBag,
  Clock,
  User,
  Star
} from "lucide-react";
import { Product, ApiResponse } from "./User/announcement/types";

const Product_Details: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);

  const getImageUrl = (media: any) => {
    if (!media) return null;
    if (media.url && media.url.startsWith('http')) return media.url;
    return `http://127.0.0.1:8000/storage/${media.file_path.replace("public/", "")}`;
  };

  useEffect(() => {
    if (!id) return;
    
    fetch(`http://127.0.0.1:8000/api/announcements/${id}`)
      .then((res) => res.json())
      .then((data: any) => {
        if (data.status === "success" && (data.product?.data || data.product)) {
          const productData = data.product?.data || data.product;
          setProduct(productData);
          // Set initial active image
          if (productData.thumbnail) {
            setActiveImage(getImageUrl(productData.thumbnail));
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch product error:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading product details...</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '100px' }}>Product not found.</div>;

  const gallery = product.gallery || [];
  const allImages = [
    ...(product.thumbnail ? [getImageUrl(product.thumbnail)] : []),
    ...gallery.map(img => getImageUrl(img))
  ].filter(Boolean) as string[];

  return (
    <div className="product-details-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Breadcrumb / Back button */}
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'none', 
          border: 'none', 
          color: '#4f46e5', 
          fontWeight: '600', 
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        <ChevronLeft size={20} />
        Back to results
      </button>

      <div className="product-main" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Left: Images */}
        <div className="image-section">
          <div className="main-image" style={{ width: '100%', height: '500px', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#f3f4f6', marginBottom: '15px' }}>
            {activeImage ? (
              <img src={activeImage} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <ShoppingBag size={100} color="#d1d5db" />
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
                  border: activeImage === img ? '2px solid #4f46e5' : '1px solid #e5e7eb',
                  overflow: 'hidden',
                  padding: '0',
                  cursor: 'pointer',
                  flexShrink: '0'
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
              backgroundColor: product.listing_mode === 'sell' ? '#4f46e5' : '#10b981',
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {product.listing_mode === 'sell' ? 'For Sale' : 'Free / Donation'}
            </span>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><Share2 size={20} /></button>
              <button 
                onClick={() => setIsFavorited(!isFavorited)}
                style={{ background: 'none', border: 'none', color: isFavorited ? '#ef4444' : '#6b7280', cursor: 'pointer' }}
              >
                <Heart size={20} fill={isFavorited ? "#ef4444" : "none"} />
              </button>
            </div>
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', marginTop: '15px', marginBottom: '10px' }}>
            {product.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={16} /> Agadir, Morocco</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16} /> Posted {new Date(product.created_at).toLocaleDateString()}</div>
          </div>

          <div style={{ fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '25px' }}>
            {product.listing_mode === 'sell' ? `${product.price} ${product.currency}` : 'FREE'}
            {product.price_negotiable && <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginLeft: '10px' }}>(Negotiable)</span>}
          </div>

          <div className="action-buttons" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
            <button style={{ 
              padding: '15px', 
              backgroundColor: '#4f46e5', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: '700', 
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer'
            }}>
              <MessageCircle size={20} />
              Chat with Seller
            </button>
            <button style={{ 
              padding: '15px', 
              backgroundColor: 'white', 
              color: '#4f46e5', 
              border: '2px solid #4f46e5', 
              borderRadius: '12px', 
              fontWeight: '700', 
              fontSize: '16px',
              cursor: 'pointer'
            }}>
              Make Offer
            </button>
          </div>

          {/* Details Table */}
          <div className="product-specs" style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>Product Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <div style={{ color: '#6b7280', fontSize: '13px' }}>Condition</div>
                <div style={{ fontWeight: '600' }}>{product.condition}</div>
              </div>
              <div>
                <div style={{ color: '#6b7280', fontSize: '13px' }}>Age Recommended</div>
                <div style={{ fontWeight: '600' }}>{product.age_range}</div>
              </div>
              <div>
                <div style={{ color: '#6b7280', fontSize: '13px' }}>Brand</div>
                <div style={{ fontWeight: '600' }}>{product.brand || 'No brand'}</div>
              </div>
              <div>
                <div style={{ color: '#6b7280', fontSize: '13px' }}>Gender</div>
                <div style={{ fontWeight: '600' }}>{product.gender || 'Unisexe'}</div>
              </div>
            </div>
          </div>

          <div className="description">
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>Description</h3>
            <p style={{ color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {product.description || 'No description provided.'}
            </p>
          </div>
        </div>
      </div>

      {/* Seller Section */}
      <div className="seller-section" style={{ marginTop: '50px', padding: '30px', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#e5e7eb', overflow: 'hidden' }}>
            {product.user?.avatar ? (
              <img src={product.user.avatar} alt="" style={{ width: '100%', height: '100%' }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '24px', color: '#9ca3af' }}>
                <User size={32} />
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{product.user?.name || 'Seller'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f59e0b', fontSize: '14px' }}>
              <Star size={14} fill="#f59e0b" />
              <span style={{ fontWeight: '600' }}>4.8</span>
              <span style={{ color: '#6b7280' }}>(24 reviews)</span>
            </div>
          </div>
        </div>
        
        <Link to={`/profile/${product.user?.id}`} style={{ 
          padding: '10px 20px', 
          border: '1px solid #d1d5db', 
          borderRadius: '8px', 
          textDecoration: 'none', 
          color: '#374151',
          fontWeight: '600'
        }}>
          View Profile
        </Link>
      </div>
    </div>
  );
}

export default Product_Details;
