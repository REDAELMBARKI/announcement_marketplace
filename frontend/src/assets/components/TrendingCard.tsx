import React from 'react';
import { Link } from 'react-router-dom';
import { MapPoint as MapPin, Gift } from "@solar-icons/react";
import { useTheme } from '../../context/ThemeContext';

const TrendingCard = ({ item }) => {
  const { colors } = useTheme();
  return (
    <Link to={`/product/${item.id}`} className="product-card-link" style={{ textDecoration: 'none' }}>
      <article className="trending-card" style={{ backgroundColor: colors.bgSecondary, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        {/* User info row */}
        <div className="card-header" style={{ padding: '10px 15px', borderBottom: `1px solid ${colors.border}` }}>
          <div className="user-info">
            <div className="user-avatar" style={{ backgroundColor: colors.bgTertiary, color: colors.textPrimary }}>{item.seller.avatar}</div>
            <div className="user-details">
              <span className="username" style={{ color: colors.textPrimary }}>{item.seller.name}</span>
              <span className="time-posted" style={{ color: colors.textSecondary }}>{item.timePosted}</span>
            </div>
          </div>
          {item.is_boosted && (
            <div className="premium-badge" style={{ backgroundColor: colors.coral, color: colors.bgSecondary }}>Premium</div>
          )}
        </div>

        {/* Product image */}
        <div className={`product-image ${item.tone}`} style={{ backgroundColor: colors.bgTertiary }}>
          {item.image && item.image !== '??' ? (
            <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ color: colors.textMuted }}>??</div>
          )}
        </div>

        {/* Product details */}
        <div className="card-body" style={{ padding: '15px' }}>
          <div className="location-line" style={{ color: colors.textSecondary }}>
            <MapPin size={12} weight="BoldDuotone" color={colors.iconCoral} />
            <span>{item.city}, {item.district}</span>
          </div>
          <h4 className="product-title" style={{ color: colors.textPrimary }}>{item.title}</h4>
          <div className="tags-row">
            {item.condition && (
              <span className="tag" style={{ backgroundColor: colors.bgTertiary, color: colors.textSecondary }}>{item.condition}</span>
            )}
            {item.age_range && (
              <span className="tag" style={{ backgroundColor: colors.bgTertiary, color: colors.textSecondary }}>{item.age_range}</span>
            )}
          </div>
        </div>

        {/* Price/FREE at bottom */}
        <div className="price-section" style={{ padding: '0 15px 15px' }}>
          {item.price ? (
            <span className="price-tag" style={{ color: colors.coral }}>£{item.price}</span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.success }}>
              <Gift size={16} weight="BoldDuotone" />
              <span className="free-tag">FREE</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};

export default TrendingCard;
