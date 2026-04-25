import React, { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import route from '../../utils/route';
import { 
  ChevronLeft,
  ChevronRight,
  Camera,
  Heart
} from "lucide-react";
import { MapPoint as MapPin, ChatLine } from "@solar-icons/react";
import { useTheme } from '../../context/ThemeContext';
import { 
  Button, 
} from '@mui/material';
import { Product } from "./User/announcement/types";

interface MarketplaceCardProps {
  product: Product;
  view: 'grid' | 'list';
  getImageUrl: (m: any) => string | null;
  colors: any;
}

const MarketplaceCard: React.FC<MarketplaceCardProps> = memo(({ product, view, getImageUrl, colors }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(product.is_favorited || false);
  
  const gallery = product.gallery || [];
  const allImages = [
    ...(product.thumbnail ? [getImageUrl(product.thumbnail)] : []),
    ...gallery.map(img => getImageUrl(img))
  ].filter(Boolean) as string[];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newStatus = !isFavorited;
    setIsFavorited(newStatus);
    
    // Proactively implement the API call (even if endpoint is pending)
    axios.post(route('announcements.favorite', { productId: product.id }).toString(), { favorite: newStatus })
      .catch(err => console.error("Favorite toggle error:", err));
  };

  if (view === 'list') {
    return (
      <Link to={`/product/${product.id}`} style={{ display: 'flex', backgroundColor: colors.bgSecondary, borderRadius: '20px', overflow: 'hidden', textDecoration: 'none', color: 'inherit', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', transition: 'transform 0.2s' }}>
        <div style={{ width: '280px', height: '210px', position: 'relative', flexShrink: 0 }}>
          <img src={allImages[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: '15px', left: '15px', padding: '5px 12px', borderRadius: '8px', backgroundColor: product.listing_mode === 'sell' ? colors.primary : colors.success, color: colors.bgSecondary, fontSize: '11px', fontWeight: '900' }}>
            {product.listing_mode === 'sell' ? 'À VENDRE' : 'GRATUIT'}
          </div>
        </div>
        <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: colors.coral, color: colors.bgSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>
                {product.user?.name?.charAt(0)}
              </div>
              <span style={{ fontSize: '14px', fontWeight: '700', color: colors.textPrimary }}>{product.user?.name}</span>
            </div>
            <button 
              onClick={toggleFavorite}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
            >
              <Heart size={20} color={colors.coral} fill={isFavorited ? colors.coral : "none"} strokeWidth={2} />
            </button>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: colors.textPrimary, marginBottom: '12px' }}>{product.title}</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <span style={{ padding: '5px 12px', backgroundColor: colors.bgTertiary, borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: colors.textSecondary }}>{product.condition}</span>
            <span style={{ padding: '5px 12px', backgroundColor: colors.bgTertiary, borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: colors.textSecondary }}>{product.age_range}</span>
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '900', color: product.listing_mode === 'sell' ? colors.coral : colors.success }}>
              {product.listing_mode === 'sell' ? `${Math.floor(Number(product.price))} MAD` : 'GRATUIT'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.textMuted, fontSize: '13px' }}>
                <MapPin size={14} weight="BoldDuotone" /> Agadir, Maroc
              </div>
              <Button 
                variant="contained" 
                size="small"
                startIcon={<ChatLine size={16} weight="BoldDuotone" />}
                sx={{ 
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: colors.coral,
                  '&:hover': {
                    bgcolor: colors.coralHover,
                  },
                  boxShadow: 'none',
                  px: 2.5
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Contact logic
                }}
              >
                Contact
              </Button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/product/${product.id}`} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        backgroundColor: colors.bgSecondary, 
        borderRadius: '20px', 
        overflow: 'hidden', 
        textDecoration: 'none', 
        color: 'inherit',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Seller Row */}
      <div style={{ padding: '12px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: colors.coral, color: colors.bgSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>
            {product.user?.name?.charAt(0)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: colors.textPrimary }}>{product.user?.name}</span>
            <span style={{ fontSize: '10px', color: colors.textMuted }}>il y a 2h</span>
          </div>
        </div>
        <Button 
          variant="contained" 
          size="small"
          startIcon={<ChatLine size={16} weight="BoldDuotone" />}
          sx={{ 
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 700,
            bgcolor: colors.coral,
            '&:hover': {
              bgcolor: colors.coralHover,
            },
            boxShadow: 'none',
            px: 1.5,
            minWidth: 'auto',
            height: '30px',
            fontSize: '11px'
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Contact logic
          }}
        >
          Contact
        </Button>
      </div>

      {/* Image Carousel */}
      <div style={{ position: 'relative', height: '200px', backgroundColor: colors.bgTertiary }}>
        <img 
          src={allImages[currentImageIndex]} 
          alt={product.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        
        <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '5px 10px', borderRadius: '8px', backgroundColor: product.listing_mode === 'sell' ? colors.primary : colors.success, color: colors.bgSecondary, fontSize: '10px', fontWeight: '900' }}>
          {product.listing_mode === 'sell' ? 'À VENDRE' : 'GRATUIT'}
        </div>
        
        <button onClick={toggleFavorite} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '5px' }}>
          <Heart size={18} color={colors.coral} fill={isFavorited ? colors.coral : "none"} strokeWidth={2} />
        </button>

        {allImages.length > 1 && (
          <>
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.5)', color: colors.bgSecondary, fontSize: '10px', fontWeight: '600' }}>
              <Camera size={10} style={{ marginRight: '4px' }} strokeWidth={2} /> {currentImageIndex + 1}/{allImages.length}
            </div>
            {isHovered && (
              <>
                <button onClick={prevImage} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronLeft size={20} strokeWidth={2} /></button>
                <button onClick={nextImage} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronRight size={20} strokeWidth={2} /></button>
              </>
            )}
          </>
        )}
      </div>

      {/* Info Section */}
      <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.textMuted, fontSize: '11px', marginBottom: '6px' }}>
          <MapPin size={12} weight="BoldDuotone" /> <span>Agadir, Maroc</span>
        </div>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.textPrimary, marginBottom: '10px', height: '40px', overflow: 'hidden' }}>{product.title}</h3>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '15px' }}>
          <span style={{ fontSize: '10px', padding: '4px 8px', backgroundColor: colors.bgTertiary, borderRadius: '6px', color: colors.textSecondary, fontWeight: '700' }}>{product.condition}</span>
          <span style={{ fontSize: '10px', padding: '4px 8px', backgroundColor: colors.bgTertiary, borderRadius: '6px', color: colors.textSecondary, fontWeight: '700' }}>{product.age_range}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div style={{ fontSize: '20px', fontWeight: '900', color: product.listing_mode === 'sell' ? colors.coral : colors.success }}>
            {product.listing_mode === 'sell' ? `${Math.floor(Number(product.price))} MAD` : 'GRATUIT'}
          </div>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: colors.coral, color: colors.bgSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>
            {product.user?.name?.charAt(0)}
          </div>
        </div>
      </div>
    </Link>
  );
});
export default MarketplaceCard;
