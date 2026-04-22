import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
} from "lucide-react";
import {
  Shop as Store,
  Gift,
  Heart,
  Bag as ShoppingBag,
  MapPoint as MapPin,
} from "@solar-icons/react";
import TrendingCard from "./TrendingCard";
import MarketplaceCard from "./MarketplaceCard";
import homeApi from "../../services/homeApi";
import "../../css/home.css";
import { useTheme } from "../../context/ThemeContext";


function Home() {
  const { colors } = useTheme();
  const [homepageData, setHomepageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const trendingScrollRef = useRef(null);
  const marketScrollRef = useRef(null);
  const donationCausesScrollRef = useRef(null);
  const categoryRefs = useRef({});

  // Fetch homepage data from API
  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        setLoading(true);
        const data = await homeApi.getHomepageData({});
        setHomepageData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch homepage data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageData();
  }, []);

  const scrollTrending = (direction) => {
    const container = trendingScrollRef.current;
    if (!container) return;
    
    const scrollAmount = 300;
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else if (direction === 'right') {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollDonationCauses = (direction) => {
    const container = donationCausesScrollRef.current;
    if (!container) return;
    
    const scrollAmount = 300;
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else if (direction === 'right') {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollCategory = (categoryId, direction) => {
    const container = categoryRefs.current[categoryId];
    if (!container) return;
    
    const scrollAmount = 300;
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else if (direction === 'right') {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollMarket = (direction) => {
    const container = marketScrollRef.current;
    if (!container) return;
    
    const scrollAmount = 300;
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else if (direction === 'right') {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getCategoryColor = (categoryId) => {
    const colors = [
      '#667eea', '#f093fb', '#10b981', '#f59e0b', 
      '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'
    ];
    return colors[categoryId % colors.length] || '#667eea';
  };

  const getCategoryEmoji = (categoryName) => {
    const emojiMap = {
      'Jouets 🧸': '🧸',
      'Vêtements 👕': '👕', 
      'Livres 📚': '📚',
      'Mobilier 🛏️': '🛏️',
      'Bébé 🍼': '🍼',
      'Jeux 🎮': '🎮',
      'Chaussures 👟': '👟',
      'Activités 🎨': '🎨'
    };
    return emojiMap[categoryName] || '📦';
  };

  const getCardCountClass = (count) => {
    if (count === 1) return 'single-card';
    if (count >= 2 && count <= 4) return 'few-cards';
    return 'many-cards';
  };

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 0, minutes: 0, seconds: 0 });

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const totalSeconds = prev.days * 86400 + prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;
        if (totalSeconds <= 0) {
          clearInterval(timer);
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        return {
          days: Math.floor(totalSeconds / 86400),
          hours: Math.floor((totalSeconds % 86400) / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  
  if (loading) {
    return (
      <main className="home" id="home" style={{ backgroundColor: colors.bgPrimary }}>
        <div className="loading-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: colors.textSecondary }}>
          <div className="loading-spinner">Loading...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="home" id="home" style={{ backgroundColor: colors.bgPrimary }}>
        <div className="error-container" style={{ textAlign: 'center', padding: '100px', color: colors.danger }}>
          <div className="error-message">{error}</div>
          <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: colors.primary, color: colors.bgSecondary, border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Try Again</button>
        </div>
      </main>
    );
  }

  return (
    <main className="home" id="home" style={{ backgroundColor: colors.bgPrimary }}>
      <section className="hero_v2" style={{ backgroundColor: colors.bgSecondary }}>
        <div className="hero_copy">
          <p className="eyebrow" style={{ color: colors.coral }}>PRE-LOVED KIDS CLOTHES</p>
          <h1 style={{ color: colors.textPrimary }}>
            Find Great Deals.
            <br />
            Help Local Families.
          </h1>
          <p className="tagline" style={{ color: colors.textSecondary }}>
            Buy affordable kids clothes or donate to families in need.
          </p>
          <div className="hero_actions">
            <Link to="/marketplace" className="hero_primary" style={{ backgroundColor: colors.coral, color: colors.bgSecondary }}>
              Browse Items
            </Link>
            <Link to="/donate" className="hero_secondary" style={{ backgroundColor: colors.bgTertiary, color: colors.textPrimary }}>
              Donate Now
            </Link>
          </div>
        </div>
        <div className="hero_visual">
          <div className="floating-cards">
            <div className="floating-card" style={{ backgroundColor: colors.bgSecondary, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>👕</div>
            <div className="floating-card" style={{ backgroundColor: colors.bgSecondary, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>👟</div>
            <div className="floating-card" style={{ backgroundColor: colors.bgSecondary, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>🧸</div>
          </div>
          <div className="hero_image" style={{ backgroundColor: colors.bgTertiary }}>
            <span>👨‍👩‍👧‍👦</span>
          </div>
          <div className="hero_stats" style={{ backgroundColor: colors.bgSecondary, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div className="hero_stat">
              <strong style={{ color: colors.textPrimary }}>{homepageData?.stats?.total_products?.toLocaleString() || 0}</strong>
              <span style={{ color: colors.textSecondary }}>Items Available</span>
            </div>
            <div className="hero_stat">
              <strong style={{ color: colors.textPrimary }}>{homepageData?.stats?.total_users?.toLocaleString() || 0}</strong>
              <span style={{ color: colors.textSecondary }}>Active Users</span>
            </div>
            <div className="hero_stat">
              <strong style={{ color: colors.textPrimary }}>{homepageData?.stats?.total_donations?.toLocaleString() || 0}</strong>
              <span style={{ color: colors.textSecondary }}>Donations</span>
            </div>
          </div>
        </div>
      </section>

      
      <section className="season_banner" style={{ backgroundColor: colors.bgTertiary, borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
        <span className="season_icon" aria-hidden="true" style={{ fontSize: '32px' }}>
          ⭐
        </span>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: colors.textPrimary, margin: 0 }}>Summer Clothing Drive - ends July 31</h3>
          <p style={{ color: colors.textSecondary, margin: '5px 0' }}>Donate summer essentials for kids heading back to school.</p>
          <div className="countdown-timer" style={{ fontWeight: '700', color: colors.coral }}>
            {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')} left
          </div>
        </div>
        <Link to="/sign_up" style={{ padding: '10px 20px', backgroundColor: colors.coral, color: colors.bgSecondary, borderRadius: '8px', textDecoration: 'none', fontWeight: '700' }}>Donate now</Link>
      </section>

      {homepageData?.featured_categories?.map((category) => (
        <section key={category.id} className="category-section">
          <div className="section-header">
            <div className="category-title">
              <span className="category-icon">{category.icon}</span>
              <h3>{category.name}</h3>
            </div>
            <Link to={`/category/${category.slug}`} className="see-all-link">
              See all →
            </Link>
          </div>
          <div className="scroll-container">
            <button 
              className="scroll-btn left" 
              onClick={() => scrollCategory(category.id, 'left')}
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} strokeWidth={2} />
            </button>
            <div className="category-scroll" ref={el => categoryRefs.current[category.id] = el}>
              {(homepageData?.products_by_category?.[category.id]?.length >= 3 ? homepageData?.products_by_category?.[category.id] : homepageData?.products_by_category?.[category.id]?.slice(0, 3))?.map((item) => (
                <div key={item.id} className="category-product-card">
                  <div className="product-header">
                    <div className="user-avatar">
                      <img src={item.user?.avatar || 'https://picsum.photos/seed/user/30/30.jpg'} alt={item.user?.name} />
                    </div>
                    <div className="user-details">
                      <span className="username">{item.user?.name || 'Unknown'}</span>
                      <span className="time-posted">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently'}</span>
                    </div>
                  </div>
                  <div className="product-image">
                    {item.thumbnail?.url ? (
                      <img src={item.thumbnail.url} alt={item.title} />
                    ) : (
                      <div>??</div>
                    )}
                  </div>
                  <div className="product-details">
                    <div className="location-line">
                      <MapPin size={12} weight="BoldDuotone" />
                      <span>{item.addresses?.[0]?.city || 'Unknown'}, {item.addresses?.[0]?.district || 'Unknown'}</span>
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
                    <div className="price-section">
                      {item.price ? (
                        <span className="price-tag">£{item.price}</span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Gift size={16} weight="BoldDuotone" />
                          <span className="free-tag">FREE</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="scroll-btn right" 
              onClick={() => scrollCategory(category.id, 'right')}
              aria-label="Scroll right"
            >
              <ChevronRight size={20} strokeWidth={2} />
            </button>
          </div>
        </section>
      ))}

      <section className="collections-section">
        <div className="section-header">
          <p className="eyebrow">FEATURED COLLECTIONS</p>
          <h3>Browse by category</h3>
        </div>
        <div className="collections-grid">
          {homepageData?.featured_categories?.slice(0, 8)?.map((category) => (
            <Link key={category.id} to={`/category/${category.slug}`} className="collection-card">
              <div className="collection-image" style={{ background: `linear-gradient(135deg, ${getCategoryColor(category.id)} 0%, ${getCategoryColor(category.id, 0.8)} 100%)` }}>
                <span className="category-emoji">{getCategoryEmoji(category.name)}</span>
              </div>
              <div className="collection-content">
                <h4>{category.name}</h4>
                <p>Browse {category.name} items</p>
                <div className="collection-meta">
                  <span>{category.products_count || 0} items</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {homepageData?.featured_categories?.length > 8 && (
          <button className="show-more-btn" onClick={() => setShowMoreCategories(!showMoreCategories)}>
            {showMoreCategories ? 'Show less' : 'Show more categories'}
          </button>
        )}
      </section>

      <section className="trending-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">TRENDING NOW</p>
            <h3>Popular this week</h3>
          </div>
          {homepageData?.popular_products?.length > 4 && (
            <div className="scroll-controls">
              <button 
                className="scroll-btn left" 
                onClick={() => scrollTrending('left')}
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} strokeWidth={2} />
              </button>
              <button 
                className="scroll-btn right" 
                onClick={() => scrollTrending('right')}
                aria-label="Scroll right"
              >
                <ChevronRight size={20} strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
        <div className="scroll-container">
          <div className={`trending-scroll ${getCardCountClass(homepageData?.popular_products?.length || 0)}`} ref={trendingScrollRef}>
            {homepageData?.popular_products?.map((item) => (
              <TrendingCard key={item.id} item={{
                id: item.id,
                title: item.title,
                price: item.price,
                timePosted: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently',
                is_boosted: item.is_boosted || false,
                city: item.addresses?.[0]?.city || 'Unknown',
                district: item.addresses?.[0]?.district || 'Unknown',
                condition: item.condition || 'Good',
                age_range: item.age_range || 'Unknown',
                badge: item.views_count > 100 ? 'TRENDING' : 'NEW',
                image: item.thumbnail?.url || '??',
                tone: 'blue',
                likes: item.favorites_count || 0,
                seller: {
                  name: item.user?.name || 'Unknown',
                  avatar: '??'
                }
              }} />
            ))}
          </div>
        </div>
      </section>

      <section className="donation-causes-section">
        <div className="section-header">
          <p className="eyebrow">URGENT DONATION CAUSES</p>
          <h3>Support families in need</h3>
        </div>
        <div className="scroll-container">
          <button 
            className="scroll-btn left" 
            onClick={() => scrollDonationCauses('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <div className="donation-causes-scroll" ref={donationCausesScrollRef}>
            {(homepageData?.donation_causes?.length >= 3 ? homepageData?.donation_causes : homepageData?.donation_causes?.slice(0, 3))?.map((cause) => {
              const daysAgo = Math.floor((Date.now() - new Date(cause.created_at)) / (1000 * 60 * 60 * 24));
              const urgencyColor = daysAgo <= 1 ? 'green' : daysAgo <= 4 ? 'yellow' : 'red';
              
              return (
                <div key={cause.id} className="donation-cause-card">
                  <div className="cause-image">
                    {cause.thumbnail?.url ? (
                      <img src={cause.thumbnail.url} alt={cause.title} />
                    ) : (
                      <div>??</div>
                    )}
                  </div>
                  <div className="cause-details">
                    <h4>{cause.title}</h4>
                    <div className="cause-location">
                      <MapPin size={12} weight="BoldDuotone" />
                      <span>{cause.addresses?.[0]?.city || 'Unknown'}, {cause.addresses?.[0]?.district || 'Unknown'}</span>
                    </div>
                    <div className="cause-time">
                      Posted {new Date(cause.created_at).toLocaleDateString()}
                      <span className={`urgency-indicator ${urgencyColor}`}></span>
                    </div>
                    <div className="cause-stats">
                      <span>{cause.favorites_count || 0} interested</span>
                      <span>{cause.views_count || 0} views</span>
                    </div>
                    <button className="support-btn">Support</button>
                  </div>
                </div>
              );
            })}
          </div>
          <button 
            className="scroll-btn right" 
            onClick={() => scrollDonationCauses('right')}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} strokeWidth={2} />
          </button>
        </div>
      </section>

      <section className="tt-section dark_section">
        <div className="tt-section-head market_head">
          <div>
            <p className="eyebrow">MARKETPLACE</p>
            <h3>New arrivals</h3>
          </div>
          <Link to="/add_announcement">See all</Link>
        </div>
        <div className="scroll-container">
          <button 
            className="scroll-btn left" 
            onClick={() => scrollMarket('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <div className="market_grid_v2" ref={marketScrollRef}>
            {(homepageData?.new_arrivals?.length >= 3 ? homepageData?.new_arrivals : homepageData?.new_arrivals?.slice(0, 3))?.map((item) => (
              <MarketplaceCard key={item.id} item={{
                id: item.id,
                title: item.title,
                price: item.price,
                timePosted: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently',
                is_boosted: item.is_boosted || false,
                city: item.addresses?.[0]?.city || 'Unknown',
                district: item.addresses?.[0]?.district || 'Unknown',
                condition: item.condition || 'Good',
                age_range: item.age_range || 'Unknown',
                badge: item.views_count > 100 ? 'TRENDING' : 'NEW',
                image: item.thumbnail?.url || '??',
                tone: 'blue',
                likes: item.favorites_count || 0,
                seller: {
                  name: item.user?.name || 'Unknown',
                  avatar: '??'
                }
              }} />
            ))}
          </div>
          <button 
            className="scroll-btn right" 
            onClick={() => scrollMarket('right')}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} strokeWidth={2} />
          </button>
        </div>
      </section>

      <section className="tt-how-it-works upgraded">
        <h3>How TinyTrove Works</h3>
        <div className="tt-how-grid">
          <article>
            <span>01</span>
            <h4>Gather Gear</h4>
            <p>Find gently used outfits and toys your kids have outgrown.</p>
          </article>
          <article>
            <span>02</span>
            <h4>Choose Your Path</h4>
            <p>Sell them for cash or donate them instantly to a verified cause.</p>
          </article>
          <article>
            <span>03</span>
            <h4>Make an Impact</h4>
            <p>Every item sold extends its life and supports children in need.</p>
    </article>
  </div>
</section>

<section className="tt-how-it-works upgraded">
  <h3>How TinyTrove Works</h3>
  <div className="tt-how-grid">
    <article>
      <span>01</span>
      <h4>Gather Gear</h4>
      <p>Find gently used outfits and toys your kids have outgrown.</p>
    </article>
    <article>
      <span>02</span>
      <h4>Choose Your Path</h4>
      <p>Sell them for cash or donate them instantly to a verified cause.</p>
    </article>
    <article>
      <span>03</span>
      <h4>Make an Impact</h4>
      <p>Every item sold extends its life and supports children in need.</p>
    </article>
  </div>
</section>

<section className="testimonials">
  <h3>Trusted by local parents</h3>
  <div className="testimonials-grid">
    {homepageData?.recent_reviews?.map((review) => (
      <article className="testimonial-card" key={review.id}>
        <div className="testimonial-quote-icon">??</div>
        <p>"{review.comment || 'Great product!'}</p>
        <strong>{review.reviewer?.name || 'Happy Customer'}</strong>
        <div className="rating">{'?'.repeat(review.rating || 5)}</div>
      </article>
    ))}
  </div>
</section>

<section className="tt-main-footer">
  <div>
    <h4>TinyTrove</h4>
    <p>
      Buy and donate pre-loved kids essentials while supporting verified local
      causes.
    </p>
  </div>
  <div>
    <h5>Quick Links</h5>
    <ul>
      <li>
        <Link to="/our_partners">About Us</Link>
      </li>
      <li>
        <Link to="/faq">How to Donate</Link>
      </li>
      <li>
        <Link to="/faq">Seller Fees</Link>
      </li>
      <li>
        <Link to="/faq">Safety</Link>
      </li>
    </ul>
  </div>
  <div>
    <h5>Trusted Badges</h5>
    <p>?? Secure Payments</p>
    <p>?? Nonprofit Verified</p>
    <p>?? App Store / Google Play</p>
    <input type="email" placeholder="Join our newsletter" aria-label="Newsletter email" />
  </div>
</section>
    </main>
  );
}

export default Home;
