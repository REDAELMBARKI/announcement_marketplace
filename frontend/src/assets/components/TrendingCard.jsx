import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Gift } from 'lucide-react';

const TrendingCard = ({ item }) => {
  return (
    <Link to={`/product/${item.id}`} className="product-card-link">
      <article className="trending-card">
        {/* User info row */}
        <div className="card-header">
          <div className="user-info">
            <div className="user-avatar">{item.seller.avatar}</div>
            <div className="user-details">
              <span className="username">{item.seller.name}</span>
              <span className="time-posted">{item.timePosted}</span>
            </div>
          </div>
          {item.is_boosted && (
            <div className="premium-badge">Premium</div>
          )}
        </div>

        {/* Product image */}
        <div className={`product-image ${item.tone}`}>
          {item.image && item.image !== '??' ? (
            <img src={item.image} alt={item.title} />
          ) : (
            <div>??</div>
          )}
        </div>

        {/* Product details */}
        <div className="card-body">
          <div className="location-line">
            <MapPin size={12} />
            <span>{item.city}, {item.district}</span>
          </div>
          <h4 className="product-title">{item.title}</h4>
          <div className="tags-row">
            {item.condition && (
              <span className="tag">{item.condition}</span>
            )}
            {item.age_range && (
              <span className="tag">{item.age_range}</span>
            )}
          </div>
        </div>

        {/* Price/FREE at bottom */}
        <div className="price-section">
          {item.price ? (
            <span className="price-tag">£{item.price}</span>
          ) : (
            <span className="free-tag">FREE</span>
          )}
        </div>
      </article>
    </Link>
  );
};

export default TrendingCard;
