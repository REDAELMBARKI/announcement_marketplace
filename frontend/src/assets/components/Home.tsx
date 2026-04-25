import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  Zap,
  Star,
  ShieldCheck,
  Mail,
  Palette,
} from "lucide-react";
import {
  Shop as Store,
  Gift,
  Heart,
  Bag as ShoppingBag,
  MapPoint as MapPin,
  Gamepad,
  TShirt,
  Book,
  Home2,
  UserRounded,
  Walking,
  Box,
  UsersGroupRounded,
} from "@solar-icons/react";
import MarketplaceCard from "./MarketplaceCard";
import { Product } from "./User/announcement/types";
import homeApi from "../../services/homeApi";
import "../../css/home.css";
import { useTheme } from "../../context/ThemeContext";

interface User {
  id: number;
  name: string;
  avatar?: string;
}

interface Address {
  city: string;
  district?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  thumbnail?: { url: string };
  products_count?: number;
}


interface Review {
  id: number;
  rating: number;
  comment: string;
  reviewer?: User;
}

interface Stats {
  total_products: number;
  total_users: number;
  total_donations: number;
}

interface HeroSlide {
  id: number;
  thumbnail?: any;
  headline: string;
  subline: string;
  cta1_text: string;
  cta1_link: string;
  cta2_text: string;
  cta2_link: string;
}

interface BannerStep {
  num: string;
  title: string;
  description: string;
}

interface Banner {
  id: number;
  type: 'split' | 'simple';
  title: string;
  subtitle?: string;
  thumbnail?: any;
  badge_text?: string;
  cta_text?: string;
  cta_link?: string;
  steps?: BannerStep[];
}

interface HomepageData {
  stats: Stats;
  featured_categories: Category[];
  popular_products: Product[];
  new_arrivals: Product[];
  products_by_category: Record<number, Product[]>;
  recent_reviews: Review[];
  nearby_products: Product[];
  free_items: Product[];
  hero_sliders: HeroSlide[];
  banners: Banner[];
}

function Home() {
  const { colors } = useTheme();
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const marketScrollRef = useRef<HTMLDivElement>(null);
  const collectionsScrollRef = useRef<HTMLDivElement>(null);
  const nearbyScrollRef = useRef<HTMLDivElement>(null);
  const freeScrollRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Hero Slider State
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [slideProgress, setSlideProgress] = useState<number>(0);

  // Tabs State
  const [activeCategoryTab, setActiveCategoryTab] = useState<number | null>(null);

  // Fetch homepage data from API
  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        setLoading(true);
        const data = await homeApi.getHomepageData({});
        setHomepageData(data as HomepageData);
        if (data?.featured_categories?.length > 0) {
          setActiveCategoryTab(data.featured_categories[0].id);
        }
        setError(null);
      } catch (err: any) {
        console.error('Detailed fetch error:', err);
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
        }
        setError(`Failed to load data: ${err.message}. Check console for details.`);
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
    const slidesCount = homepageData?.hero_sliders?.length || 0;

    if (slidesCount === 0) return;

    const timer = setInterval(() => {
      setSlideProgress(prev => {
        if (prev >= 100) {
          setActiveSlide(s => (s + 1) % slidesCount);
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeSlide, homepageData?.hero_sliders]);

  const scrollTrending = (direction: 'left' | 'right') => {
    const container = trendingScrollRef.current;
    if (!container) return;
    const scrollAmount = 400;
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  const scrollCategory = (categoryId: number, direction: 'left' | 'right') => {
    const container = categoryRefs.current[categoryId];
    if (!container) return;
    const scrollAmount = 400;
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  const getImageUrl = (media: any) => {
    if (!media) return null;
    if (media.url && media.url.startsWith('http')) return media.url;
    return `http://127.0.0.1:8000/storage/${media.file_path?.replace("public/", "")}`;
  };

  const scrollMarket = (direction: 'left' | 'right') => {
    const container = marketScrollRef.current;
    if (!container) return;
    const scrollAmount = 400;
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  const scrollNearby = (direction: 'left' | 'right') => {
    const container = nearbyScrollRef.current;
    if (!container) return;
    const scrollAmount = 400;
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  const scrollFree = (direction: 'left' | 'right') => {
    const container = freeScrollRef.current;
    if (!container) return;
    const scrollAmount = 400;
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  const getCategoryColor = (categoryId: number) => {
    const catColors = [colors.primary, colors.coral, colors.success || '#10b981', colors.warning || '#f59e0b', colors.error || '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];
    return catColors[categoryId % catColors.length] || colors.primary;
  };

  const getCategoryIcon = (categoryName: string, size = 20) => {
    const name = categoryName.toLowerCase();
    if (name.includes('jouet') || name.includes('toy')) return <Gamepad size={size} />;
    if (name.includes('vêtement') || name.includes('cloth')) return <TShirt size={size} />;
    if (name.includes('livre') || name.includes('book')) return <Book size={size} />;
    if (name.includes('mobilier') || name.includes('furniture')) return <Home2 size={size} />;
    if (name.includes('bébé') || name.includes('baby')) return <UserRounded size={size} />;
    if (name.includes('jeu') || name.includes('game')) return <Gamepad size={size} />;
    if (name.includes('chaussure') || name.includes('shoe')) return <Walking size={size} />;
    if (name.includes('activité') || name.includes('activit') || name.includes('art')) return <Palette size={size} />;
    return <Box size={size} />;
  };

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({ days: 3, hours: 0, minutes: 0, seconds: 0 });
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

  const popularProducts = useMemo<Product[]>(() => 
    homepageData?.popular_products || [], 
    [homepageData?.popular_products]
  );

  const newArrivals = useMemo<Product[]>(() => 
    homepageData?.new_arrivals || [], 
    [homepageData?.new_arrivals]
  );

  const nearbyProducts = useMemo<Product[]>(() => 
    homepageData?.nearby_products || [], 
    [homepageData?.nearby_products]
  );

  const freeItems = useMemo<Product[]>(() => 
    homepageData?.free_items || [], 
    [homepageData?.free_items]
  );

  const productsByCategory = useMemo<Record<number, Product[]>>(() => {
    return homepageData?.products_by_category || {};
  }, [homepageData?.products_by_category]);

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
          {homepageData?.hero_sliders?.map((slide, index) => (
            <div 
              key={slide.id} 
              className={`slide ${index === activeSlide ? 'active' : ''}`}
            >
              <img src={getImageUrl(slide.thumbnail) || ''} alt={slide.headline} className="slide-image" />
              <div className="slide-scrim"></div>
              <div className="slide-content">
                <h1 className="editorial-title">{slide.headline}</h1>
                <p className="slide-subline">{slide.subline}</p>
                <div className="slide-actions">
                  {slide.cta1_text && <Link to={slide.cta1_link} className="btn-primary" style={{ backgroundColor: colors.coral, color: '#fff' }}>{slide.cta1_text}</Link>}
                  {slide.cta2_text && <Link to={slide.cta2_link} className="btn-outline" style={{ borderColor: '#fff', color: '#fff' }}>{slide.cta2_text}</Link>}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="slider-nav">
          <div className="slider-dots">
            {homepageData?.hero_sliders?.map((_, i) => (
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
            <Box size={24} iconContext={{ color: colors.coral }} />
            <div>
              <strong>{homepageData?.stats?.total_products?.toLocaleString() || 0}</strong>
              <span>Items Listed</span>
            </div>
          </div>
          <div className="stat-item">
            <UsersGroupRounded size={24} iconContext={{ color: colors.coral }} />
            <div>
              <strong>{homepageData?.stats?.total_users?.toLocaleString() || 0}</strong>
              <span>Active Parents</span>
            </div>
          </div>
          <div className="stat-item">
            <Heart size={24} iconContext={{ color: colors.coral }} />
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
                <span className="tab-emoji">{getCategoryIcon(cat.name)}</span>
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
                  {productsByCategory[cat.id]?.map((product) => (
                    <div key={product.id} className="home-card-wrapper">
                      <MarketplaceCard product={product} view="grid" getImageUrl={getImageUrl} colors={colors} />
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
              <div className="tile-bg-wrap">
                {cat.thumbnail?.url ? (
                  <img src={cat.thumbnail.url} alt={cat.name} className="tile-image" />
                ) : (
                  <div className="tile-bg" style={{ background: `linear-gradient(135deg, ${getCategoryColor(cat.id)} 0%, ${getCategoryColor(cat.id)}cc 100%)` }}>
                    <span className="tile-emoji">{getCategoryIcon(cat.name, 32)}</span>
                  </div>
                )}
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
            {popularProducts.map((product) => (
              <div key={product.id} className="home-card-wrapper">
                <MarketplaceCard product={product} view="grid" getImageUrl={getImageUrl} colors={colors} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Banners Section */}
      {homepageData?.banners?.map((banner) => (
        <section key={banner.id} className={`banner-section ${banner.type}-banner`} style={{ backgroundColor: colors.bgTertiary, padding: '60px 0' }}>
          <div className="tt-container">
            {banner.type === 'split' ? (
              <div className="editorial-split">
                <div className="split-image">
                  {banner.thumbnail && <img src={getImageUrl(banner.thumbnail) || ''} alt={banner.title} />}
                  {banner.badge_text && <div className="floating-badge" style={{ backgroundColor: colors.coral }}>{banner.badge_text}</div>}
                </div>
                <div className="split-content">
                  <h2 className="editorial-title">{banner.title}</h2>
                  {banner.subtitle && <p className="banner-subtitle">{banner.subtitle}</p>}
                  {banner.steps && (
                    <div className="steps-list">
                      {banner.steps.map((step, idx) => (
                        <div key={idx} className="step-item">
                          <span className="step-num">{step.num}</span>
                          <div>
                            <h4>{step.title}</h4>
                            <p>{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {banner.cta_text && (
                    <Link to={banner.cta_link || '#'} className="btn-text">
                      {banner.cta_text} <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="simple-banner-content" style={{ textAlign: 'center' }}>
                <div className="simple-banner-inner" style={{ 
                  backgroundImage: banner.thumbnail ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${getImageUrl(banner.thumbnail)})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  padding: '80px 40px',
                  borderRadius: '24px',
                  color: '#fff'
                }}>
                  {banner.badge_text && <span className="banner-badge" style={{ backgroundColor: colors.coral, padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px', display: 'inline-block' }}>{banner.badge_text}</span>}
                  <h2 className="editorial-title" style={{ color: '#fff', marginBottom: '16px' }}>{banner.title}</h2>
                  {banner.subtitle && <p style={{ fontSize: '18px', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>{banner.subtitle}</p>}
                  {banner.cta_text && (
                    <Link to={banner.cta_link || '#'} className="btn-primary" style={{ backgroundColor: colors.coral, color: '#fff', padding: '12px 32px', borderRadius: '12px', textDecoration: 'none', display: 'inline-block', fontWeight: 'bold' }}>
                      {banner.cta_text}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      ))}

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
            {newArrivals.map((product) => (
              <div key={product.id} className="home-card-wrapper">
                <MarketplaceCard product={product} view="grid" getImageUrl={getImageUrl} colors={colors} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nearby Products */}
      {nearbyProducts.length > 0 && (
        <section className="trending-row-section tt-container">
          <div className="section-header-editorial with-nav">
            <div>
              <h2 className="editorial-title">Nearby Treasures</h2>
              <p>Find great deals from parents in your city.</p>
            </div>
            <div className="row-nav">
              <button onClick={() => scrollNearby('left')}><ChevronLeft /></button>
              <button onClick={() => scrollNearby('right')}><ChevronRight /></button>
            </div>
          </div>
          <div className="scroll-container no-scrollbar">
            <div className="trending-scroll-row" ref={nearbyScrollRef}>
              {nearbyProducts.map((product) => (
                <div key={product.id} className="home-card-wrapper">
                  <MarketplaceCard product={product} view="grid" getImageUrl={getImageUrl} colors={colors} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Free Items */}
      {freeItems.length > 0 && (
        <section className="trending-row-section tt-container">
          <div className="section-header-editorial with-nav">
            <div>
              <h2 className="editorial-title">Free for All</h2>
              <p>Generous donations looking for a new home.</p>
            </div>
            <div className="row-nav">
              <button onClick={() => scrollFree('left')}><ChevronLeft /></button>
              <button onClick={() => scrollFree('right')}><ChevronRight /></button>
            </div>
          </div>
          <div className="scroll-container no-scrollbar">
            <div className="trending-scroll-row" ref={freeScrollRef}>
              {freeItems.map((product) => (
                <div key={product.id} className="home-card-wrapper">
                  <MarketplaceCard product={product} view="grid" getImageUrl={getImageUrl} colors={colors} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
          <h2 className="editorial-title">Trust Reviews</h2>
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
