import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  Package,
  Zap,
  Star,
  Users,
  Heart as HeartIcon,
  ShieldCheck,
  Mail,
} from "lucide-react";
import {
  Shop as Store,
  Gift,
  Heart,
  Bag as ShoppingBag,
  MapPoint as MapPin,
} from "@solar-icons/react";
import homeApi from "../../services/homeApi";
import "../../css/home.css";
import { useTheme } from "../../context/ThemeContext";

const HERO_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=2000",
    headline: "Pre-loved Treasures for Little Ones",
    subline: "Quality kids' gear that grows with them. Buy, sell, or donate today.",
    cta1: "Shop Marketplace",
    link1: "/marketplace",
    cta2: "Donate Gear",
    link2: "/donate",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=2000",
    headline: "Join the Circular Kids Community",
    subline: "Reduce waste and support local families by giving clothes a second life.",
    cta1: "How it Works",
    link1: "/how-it-works",
    cta2: "Sign Up",
    link2: "/sign_up",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1522771935876-2497116a7a9e?auto=format&fit=crop&q=80&w=2000",
    headline: "Summer Adventures Await",
    subline: "Find everything they need for the perfect outdoor summer.",
    cta1: "Summer Shop",
    link1: "/category/summer",
    cta2: "Browse All",
    link2: "/marketplace",
  }
];

function Home() {
  const { colors } = useTheme();
  const [homepageData, setHomepageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Refs
  const trendingScrollRef = useRef(null);
  const marketScrollRef = useRef(null);
  const collectionsScrollRef = useRef(null);
  const categoryRefs = useRef({});

  // Hero Slider State
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);

  // Tabs State
  const [activeCategoryTab, setActiveCategoryTab] = useState(null);

  // Fetch homepage data from API
  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        setLoading(true);
        const data = await homeApi.getHomepageData({});
        setHomepageData(data);
        if (data?.featured_categories?.length > 0) {
          setActiveCategoryTab(data.featured_categories[0].id);
        }
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

  // Hero Auto-advance
  useEffect(() => {
    const duration = 5000;
    const interval = 100;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setSlideProgress(prev => {
        if (prev >= 100) {
          setActiveSlide(s => (s + 1) % HERO_SLIDES.length);
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeSlide]);

  const scrollTrending = (direction) => {
    const container = trendingScrollRef.current;
    if (!container) return;
    const scrollAmount = 400;
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  const scrollCategory = (categoryId, direction) => {
    const container = categoryRefs.current[categoryId];
    if (!container) return;
    const scrollAmount = 400;
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  const scrollMarket = (direction) => {
    const container = marketScrollRef.current;
    if (!container) return;
    const scrollAmount = 400;
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  const getCategoryColor = (categoryId) => {
    const catColors = ['#667eea', '#f093fb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];
    return catColors[categoryId % catColors.length] || '#667eea';
  };

  const getCategoryEmoji = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('jouet') || name.includes('toy')) return '🧸';
    if (name.includes('vêtement') || name.includes('cloth')) return '👕';
    if (name.includes('livre') || name.includes('book')) return '📚';
    if (name.includes('mobilier') || name.includes('furniture')) return '🛏️';
    if (name.includes('bébé') || name.includes('baby')) return '🍼';
    if (name.includes('jeu') || name.includes('game')) return '🎮';
    if (name.includes('chaussure') || name.includes('shoe')) return '👟';
    if (name.includes('activité') || name.includes('activit') || name.includes('art')) return '🎨';
    return '📦';
  };

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const totalSeconds = prev.days * 86400 + prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;
        if (totalSeconds <= 0) { clearInterval(timer); return { days: 0, hours: 0, minutes: 0, seconds: 0 }; }
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
      <main className="home loading-state" style={{ backgroundColor: colors.bgPrimary }}>
        <div className="loading-content">
          <div className="pulse-logo">TT</div>
          <p style={{ color: colors.textSecondary }}>Preparing treasures...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="home error-state" style={{ backgroundColor: colors.bgPrimary }}>
        <div className="error-box">
          <h3>Oops!</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} style={{ backgroundColor: colors.coral }}>Try Again</button>
        </div>
      </main>
    );
  }

  return (
    <main className="home redesign" style={{ 
      backgroundColor: colors.bgPrimary,
      '--primary': colors.primary,
      '--coral': colors.coral,
      '--bgSecondary': colors.bgSecondary,
      '--bgTertiary': colors.bgTertiary,
      '--textPrimary': colors.textPrimary,
      '--textSecondary': colors.textSecondary,
      '--border': colors.border,
      '--shadow': colors.shadow || 'rgba(0,0,0,0.05)'
    } as React.CSSProperties}>
      
      {/* Sticky Season Banner */}
      <div className="sticky-season-wrap">
        <div className="season-pill-banner" style={{ backgroundColor: colors.bgSecondary }}>
          <span className="badge">Limited</span>
          <p>Summer Drive: {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')} remaining</p>
          <Link to="/donate" style={{ color: colors.coral }}>Join Now <ArrowRight size={14} /></Link>
        </div>
      </div>

      {/* Hero Slider */}
      <section className="hero-slider">
        <div className="slides-container">
          {HERO_SLIDES.map((slide, index) => (
            <div 
              key={slide.id} 
              className={`slide ${index === activeSlide ? 'active' : ''}`}
            >
              <img src={slide.image} alt={slide.headline} className="slide-image" />
              <div className="slide-scrim"></div>
              <div className="slide-content">
                <h1 className="editorial-title">{slide.headline}</h1>
                <p className="slide-subline">{slide.subline}</p>
                <div className="slide-actions">
                  <Link to={slide.link1} className="btn-primary" style={{ backgroundColor: colors.coral, color: '#fff' }}>{slide.cta1}</Link>
                  <Link to={slide.link2} className="btn-outline" style={{ borderColor: '#fff', color: '#fff' }}>{slide.cta2}</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="slider-nav">
          <div className="slider-dots">
            {HERO_SLIDES.map((_, i) => (
              <button 
                key={i} 
                className={`dot ${i === activeSlide ? 'active' : ''}`} 
                onClick={() => { setActiveSlide(i); setSlideProgress(0); }}
                style={{ backgroundColor: i === activeSlide ? colors.coral : 'rgba(255,255,255,0.5)' }}
              />
            ))}
          </div>
          <div className="slider-progress-bg">
            <div className="slider-progress-bar" style={{ width: `${slideProgress}%`, backgroundColor: colors.coral }}></div>
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <div className="stats-band" style={{ backgroundColor: colors.bgSecondary, borderBottom: `1px solid ${colors.border}` }}>
        <div className="stats-container">
          <div className="stat-item">
            <Package size={20} color={colors.coral} />
            <div>
              <strong>{homepageData?.stats?.total_products?.toLocaleString() || 0}</strong>
              <span>Items Listed</span>
            </div>
          </div>
          <div className="stat-item">
            <Users size={20} color={colors.coral} />
            <div>
              <strong>{homepageData?.stats?.total_users?.toLocaleString() || 0}</strong>
              <span>Active Parents</span>
            </div>
          </div>
          <div className="stat-item">
            <HeartIcon size={20} color={colors.coral} />
            <div>
              <strong>{homepageData?.stats?.total_donations?.toLocaleString() || 0}</strong>
              <span>Donations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shop by Category Tabs */}
      <section className="shop-by-tabs-section tt-container">
        <div className="section-header-editorial">
          <h2 className="editorial-title">Shop by Category</h2>
          <p>Find exactly what they need, sorted by category.</p>
        </div>

        <div className="tabs-wrapper">
          <div className="pill-tabs no-scrollbar">
            {homepageData?.featured_categories?.map((cat) => (
              <button 
                key={cat.id}
                className={`pill-tab ${activeCategoryTab === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategoryTab(cat.id)}
                style={{ '--active-color': colors.coral } as React.CSSProperties}
              >
                <span className="tab-emoji">{getCategoryEmoji(cat.name)}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="tab-content-area">
          {homepageData?.featured_categories?.map((cat) => (
            <div 
              key={cat.id} 
              className={`tab-pane ${activeCategoryTab === cat.id ? 'active' : ''}`}
            >
              <div className="scroll-container no-scrollbar">
                <button className="scroll-btn left" onClick={() => scrollCategory(cat.id, 'left')}><ChevronLeft size={20} /></button>
                <div className="category-scroll-row" ref={el => categoryRefs.current[cat.id] = el}>
                  {homepageData?.products_by_category?.[cat.id]?.map((item) => (
                    <div key={item.id} className="compact-product-card">
                      <Link to={`/product/${item.id}`} className="card-image-wrap">
                        {item.thumbnail?.url ? <img src={item.thumbnail.url} alt={item.title} /> : <div className="placeholder">??</div>}
                        <div className="card-badges">
                          {item.price ? <span className="price-badge">£{item.price}</span> : <span className="free-badge">FREE</span>}
                        </div>
                      </Link>
                      <div className="card-info">
                        <h4 className="card-title">{item.title}</h4>
                        <div className="card-meta">
                          <span className="location"><MapPin size={10} /> {item.addresses?.[0]?.city || 'UK'}</span>
                          <span className="condition-tag">{item.condition || 'Used'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link to={`/category/${cat.slug}`} className="view-more-card">
                    <div className="view-more-inner">
                      <div className="icon-circle"><ArrowRight /></div>
                      <span>View all {cat.name}</span>
                    </div>
                  </Link>
                </div>
                <button className="scroll-btn right" onClick={() => scrollCategory(cat.id, 'right')}><ChevronRight size={20} /></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collections Grid */}
      <section className="collections-grid-section tt-container">
        <div className="section-header-editorial">
          <h2 className="editorial-title">Browse Collections</h2>
          <p>Explore our curated selections for every stage.</p>
        </div>
        <div className="collections-grid-redesign">
          {homepageData?.featured_categories?.slice(0, 8).map((cat) => (
            <Link key={cat.id} to={`/category/${cat.slug}`} className="collection-tile">
              <div className="tile-bg" style={{ background: `linear-gradient(135deg, ${getCategoryColor(cat.id)} 0%, ${getCategoryColor(cat.id)}cc 100%)` }}>
                <span className="tile-emoji">{getCategoryEmoji(cat.name)}</span>
              </div>
              <div className="tile-info">
                <h4>{cat.name}</h4>
                <span>{cat.products_count || 0} treasures</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section className="trending-row-section tt-container">
        <div className="section-header-editorial with-nav">
          <div>
            <h2 className="editorial-title">Trending Now</h2>
            <p>The most loved items in our community this week.</p>
          </div>
          <div className="row-nav">
            <button onClick={() => scrollTrending('left')}><ChevronLeft /></button>
            <button onClick={() => scrollTrending('right')}><ChevronRight /></button>
          </div>
        </div>
        <div className="scroll-container no-scrollbar">
          <div className="trending-scroll-row" ref={trendingScrollRef}>
            {homepageData?.popular_products?.map((item) => (
              <div key={item.id} className="editorial-product-card">
                <div className="card-image-wrap">
                  <Link to={`/product/${item.id}`}>
                    {item.thumbnail?.url ? <img src={item.thumbnail.url} alt={item.title} /> : <div className="placeholder">??</div>}
                  </Link>
                  <div className="seller-overlap">
                    <img src={item.user?.avatar || `https://ui-avatars.com/api/?name=${item.user?.name || 'U'}`} alt={item.user?.name} />
                  </div>
                  <div className="price-tag-float">£{item.price || 0}</div>
                </div>
                <div className="card-content">
                  <span className="card-eyebrow">{item.super_category_name}</span>
                  <h4 className="card-title">{item.title}</h4>
                  <div className="card-footer">
                    <span><MapPin size={12} /> {item.addresses?.[0]?.city || 'UK'}</span>
                    <button className="wishlist-btn"><Heart size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Editorial */}
      <section className="how-it-works-editorial" style={{ backgroundColor: colors.bgTertiary }}>
        <div className="tt-container">
          <div className="editorial-split">
            <div className="split-image">
              <img src="https://images.unsplash.com/photo-1513159419869-623ae1b1a620?auto=format&fit=crop&q=80&w=800" alt="Giving back" />
              <div className="floating-badge" style={{ backgroundColor: colors.coral }}>Circular Kids</div>
            </div>
            <div className="split-content">
              <h2 className="editorial-title">How TinyTrove Works</h2>
              <div className="steps-list">
                <div className="step-item">
                  <span className="step-num">01</span>
                  <div>
                    <h4>Gather Gear</h4>
                    <p>Find gently used outfits and toys your kids have outgrown.</p>
                  </div>
                </div>
                <div className="step-item">
                  <span className="step-num">02</span>
                  <div>
                    <h4>Choose Your Path</h4>
                    <p>Sell them for cash or donate them instantly to a verified cause.</p>
                  </div>
                </div>
                <div className="step-item">
                  <span className="step-num">03</span>
                  <div>
                    <h4>Make an Impact</h4>
                    <p>Every item sold extends its life and supports children in need.</p>
                  </div>
                </div>
              </div>
              <Link to="/how-it-works" className="btn-text">Learn more about our mission <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="trending-row-section tt-container">
        <div className="section-header-editorial with-nav">
          <div>
            <h2 className="editorial-title">New Arrivals</h2>
            <p>Fresh finds uploaded by parents just now.</p>
          </div>
          <div className="row-nav">
            <button onClick={() => scrollMarket('left')}><ChevronLeft /></button>
            <button onClick={() => scrollMarket('right')}><ChevronRight /></button>
          </div>
        </div>
        <div className="scroll-container no-scrollbar">
          <div className="trending-scroll-row" ref={marketScrollRef}>
            {homepageData?.new_arrivals?.map((item) => (
              <div key={item.id} className="editorial-product-card">
                <div className="card-image-wrap">
                  <Link to={`/product/${item.id}`}>
                    {item.thumbnail?.url ? <img src={item.thumbnail.url} alt={item.title} /> : <div className="placeholder">??</div>}
                  </Link>
                  <div className="seller-overlap">
                    <img src={item.user?.avatar || `https://ui-avatars.com/api/?name=${item.user?.name || 'U'}`} alt={item.user?.name} />
                  </div>
                  <div className="price-tag-float">{item.price ? `£${item.price}` : 'FREE'}</div>
                </div>
                <div className="card-content">
                  <span className="card-eyebrow">{item.super_category_name}</span>
                  <h4 className="card-title">{item.title}</h4>
                  <div className="card-footer">
                    <span><MapPin size={12} /> {item.addresses?.[0]?.city || 'UK'}</span>
                    <button className="wishlist-btn"><Heart size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety Band */}
      <section className="trust-band" style={{ backgroundColor: colors.bgSecondary }}>
        <div className="tt-container">
          <div className="trust-grid">
            <div className="trust-item">
              <ShieldCheck size={32} color={colors.coral} />
              <h4>Secure Payments</h4>
              <p>Your transactions are protected with industry-leading encryption.</p>
            </div>
            <div className="trust-item">
              <Star size={32} color={colors.coral} />
              <h4>Quality Checked</h4>
              <p>Verified sellers and community ratings ensure high quality.</p>
            </div>
            <div className="trust-item">
              <Gift size={32} color={colors.coral} />
              <h4>Giving Back</h4>
              <p>Every donation directly supports local verified charities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-redesign tt-container">
        <div className="section-header-editorial centered">
          <h2 className="editorial-title">Trusted by Local Parents</h2>
          <p>Join thousands of families making a difference.</p>
        </div>
        <div className="testimonials-grid-redesign">
          {homepageData?.recent_reviews?.slice(0, 3).map((review) => (
            <div key={review.id} className="testimonial-editorial-card" style={{ backgroundColor: colors.bgSecondary }}>
              <div className="rating-stars">
                {[...Array(review.rating || 5)].map((_, i) => <Star key={i} size={14} fill={colors.coral} color={colors.coral} />)}
              </div>
              <p>"{review.comment || 'Great experience with this community. Found perfect outfits for my toddler!'}"</p>
              <div className="reviewer">
                <img src={review.reviewer?.avatar || `https://ui-avatars.com/api/?name=${review.reviewer?.name || 'U'}`} alt={review.reviewer?.name} />
                <strong>{review.reviewer?.name || 'Happy Customer'}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-editorial">
        <div className="tt-container">
          <div className="newsletter-box" style={{ backgroundColor: colors.primary, color: colors.bgPrimary }}>
            <div className="newsletter-content">
              <h2 className="editorial-title" style={{ color: colors.bgPrimary }}>Join the TinyTrove Newsletter</h2>
              <p>Get weekly curated treasures and impact reports delivered to your inbox.</p>
              <form className="newsletter-form">
                <div className="input-with-icon">
                  <Mail size={18} />
                  <input type="email" placeholder="Your email address" />
                </div>
                <button type="submit" style={{ backgroundColor: colors.coral, color: colors.bgPrimary }}>Subscribe</button>
              </form>
            </div>
            <div className="newsletter-decor">
              <ShoppingBag size={120} opacity={0.1} />
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned Footer */}
      <footer className="footer-redesign" style={{ backgroundColor: colors.bgSecondary, borderTop: `1px solid ${colors.border}` }}>
        <div className="tt-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <h3 className="editorial-title">TinyTrove</h3>
              <p>The marketplace for pre-loved kids' gear. Build a sustainable future for the next generation.</p>
            </div>
            <div className="footer-links">
              <h4>Explore</h4>
              <Link to="/marketplace">Marketplace</Link>
              <Link to="/donate">Donations</Link>
              <Link to="/categories">Categories</Link>
            </div>
            <div className="footer-links">
              <h4>Support</h4>
              <Link to="/faq">Help Center</Link>
              <Link to="/how-it-works">How it Works</Link>
              <Link to="/safety">Safety</Link>
            </div>
            <div className="footer-links">
              <h4>Connect</h4>
              <Link to="/about">About Us</Link>
              <Link to="/partners">Charity Partners</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
          <div className="footer-bottom" style={{ borderTop: `1px solid ${colors.border}` }}>
            <p>&copy; 2026 TinyTrove UK. All rights reserved.</p>
            <div className="footer-legal">
              <Link to="/terms">Terms</Link>
              <Link to="/privacy">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}

export default Home;
