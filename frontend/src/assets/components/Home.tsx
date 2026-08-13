import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  Star,
  ShieldCheck,
  Mail,
  Palette,
  Recycle,
  Leaf,
  Users,
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
import LoadingScreen from "../../components/Loading/LoadingScreen";

interface User {
  id: number;
  name: string;
  avatar?: string;
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

const fallbackHomepageData: HomepageData = {
  stats: { total_products: 0, total_users: 0, total_donations: 0 },
  featured_categories: [],
  popular_products: [],
  new_arrivals: [],
  products_by_category: {},
  recent_reviews: [],
  nearby_products: [],
  free_items: [],
  hero_sliders: [{
    id: 0,
    headline: "Good things deserve a second life.",
    subline: "Donate what you no longer need, discover affordable finds, and keep more value in your community.",
    cta1_text: "Browse marketplace",
    cta1_link: "/announcements",
    cta2_text: "Donate an item",
    cta2_link: "/add_announcement",
  }],
  banners: [],
};

const APP_NAME = import.meta.env.VITE_APP_NAME || "Let's be us";
const APP_TAGLINE = import.meta.env.VITE_APP_TAGLINE || "The marketplace to pass on your best things";
const APP_HERO_PILL = import.meta.env.VITE_APP_HERO_PILL || "Ranked #1 local circular marketplace";
const APP_COPYRIGHT = import.meta.env.VITE_APP_COPYRIGHT || APP_NAME;
const APP_FOOTER_BLURB = import.meta.env.VITE_APP_FOOTER_BLURB || "A local place to sell, donate, and discover useful things while supporting a more circular community.";

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
        console.log("home fa" , data);
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
        // Keep the home experience useful while the optional Laravel API is
        // unavailable. Marketplace sections simply render when data arrives.
        setHomepageData(fallbackHomepageData);
        setActiveCategoryTab(null);
        setError(null);
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

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement | HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

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
    const baseUrl = import.meta.env.VITE_API_URL || "";
    return `${baseUrl}/storage/${media.file_path?.replace("public/", "")}`;
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
    const catColors = [colors.primary, colors.coral, colors.success || '#10b981', colors.warning || '#f59e0b', (colors as any).error || '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];
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
      <LoadingScreen
        isLoading={true}
        variant="wave"
        label={import.meta.env.VITE_APP_NAME || "Let's be us"}
        hint={import.meta.env.VITE_APP_TAGLINE || "Pass on your best things"}
      />
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
      
      {/* Magnific-Style Hero Section */}
      <section className="hero-magnific">
        <div className="hero-magnific-bg">
          <img
            src="/close-up-woman-front-clothing-pile.jpg"
            alt="Hero background"
            className="hero-magnific-image"
          />
          <div className="hero-magnific-scrim"></div>
        </div>

        <div className="hero-magnific-container">
          {/* Left content */}
          <div className="hero-magnific-left">
            <div className="hero-magnific-pill">
              <span>{APP_HERO_PILL}</span>
              <Link to="/our_partners" className="hero-magnific-pill-link">
                Meet our partners
                <ArrowRight size={16} />
              </Link>
            </div>

            <h1 className="hero-magnific-headline">
              {APP_TAGLINE}
            </h1>

            <p className="hero-magnific-subline">
              Every listing, donation and exchange supports your community.
              Intelligent filters, verified sellers, and charity partners built in —
              for meaningful second lives at any scale.
            </p>

            <div className="hero-magnific-actions">
              <Link
                to="/announcements"
                className="hero-magnific-btn hero-magnific-btn-primary"
                style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
              >
                Browse marketplace
              </Link>
              <Link
                to="/add_announcement"
                className="hero-magnific-btn hero-magnific-btn-outline"
              >
                <span className="hero-magnific-play-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <polygon points="3,1 14,8 3,15" />
                  </svg>
                </span>
                Start donating
              </Link>
            </div>
          </div>

          {/* Right feature list */}
          <div className="hero-magnific-right">
            <ul className="hero-magnific-features">
              <li className="hero-magnific-feature">
                <span className="hero-magnific-feature-name faded">Donate clothes &amp; toys</span>
              </li>
              <li className="hero-magnific-feature">
                <span className="hero-magnific-feature-name faded">Sell pre-loved furniture</span>
              </li>
              <li className="hero-magnific-feature">
                <span className="hero-magnific-feature-name faded">Support local families</span>
              </li>
              <li className="hero-magnific-feature hero-magnific-feature-active">
                <span className="hero-magnific-feature-arrow">
                  <svg width="28" height="28" viewBox="0 0 28 28">
                    <polygon points="6,4 24,14 6,24" fill="#ff4d8d" />
                  </svg>
                </span>
                <span className="hero-magnific-feature-name hero-magnific-feature-highlight">
                  Keep value in your community
                </span>
              </li>
              <li className="hero-magnific-feature">
                <span className="hero-magnific-feature-name faded">Fund verified charities</span>
              </li>
              <li className="hero-magnific-feature">
                <span className="hero-magnific-feature-name faded">Track your impact</span>
              </li>
              <li className="hero-magnific-feature">
                <span className="hero-magnific-feature-name faded">Ship or local pickup</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="purpose-section tt-container">
        <div className="purpose-heading">
          <span className="eyebrow">A better way to pass things on</span>
          <h2 className="editorial-title gradient-reveal">From your home to a home that needs it.</h2>
          <p>Sell useful items, donate generously, and make local connections without the clutter.</p>
        </div>
        <div className="purpose-grid">
          <article className="purpose-card purpose-card--mint gloweffect-light" onMouseMove={handleCardMouseMove}>
            <div className="purpose-icon"><Gift size={25} /></div>
            <span className="purpose-number">01</span>
            <h3>Give with purpose</h3>
            <p>Turn things you no longer use into practical support for people and charities nearby.</p>
            <Link to="/add_announcement">Start donating <ArrowRight size={16} /></Link>
          </article>
          <article className="purpose-card purpose-card--peach gloweffect-light" onMouseMove={handleCardMouseMove}>
            <div className="purpose-icon"><Store size={25} /></div>
            <span className="purpose-number">02</span>
            <h3>Find more for less</h3>
            <p>Discover pre-loved clothes, furniture, toys, and everyday essentials from your community.</p>
            <Link to="/announcements">Explore listings <ArrowRight size={16} /></Link>
          </article>
          <article className="purpose-card purpose-card--blue gloweffect-light" onMouseMove={handleCardMouseMove}>
            <div className="purpose-icon"><MapPin size={25} /></div>
            <span className="purpose-number">03</span>
            <h3>Keep it close</h3>
            <p>Make simple, local exchanges that save time, reduce waste, and build trust.</p>
            <Link to="/our_partners">Meet our partners <ArrowRight size={16} /></Link>
          </article>
        </div>
      </section>

      {/* Stats Band */}
      <div className="stats-band" style={{ backgroundColor: colors.bgSecondary, borderBottom: `1px solid ${colors.border}` }}>
        <div className="stats-container">
              <div className="stat-item">
            <Box size={24} color={colors.coral} />
            <div>
              <strong>{homepageData?.stats?.total_products?.toLocaleString() || 0}</strong>
              <span>Items Listed</span>
            </div>
          </div>
          <div className="stat-item">
            <UsersGroupRounded size={24} color={colors.coral} />
            <div>
              <strong>{homepageData?.stats?.total_users?.toLocaleString() || 0}</strong>
              <span>Active Parents</span>
            </div>
          </div>
          <div className="stat-item">
            <Heart size={24} color={colors.coral} />
            <div>
              <strong>{homepageData?.stats?.total_donations?.toLocaleString() || 0}</strong>
              <span>Donations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Impact section with bg-attachment: fixed DIRECTLY on the section — full-width
           on main page bg #F5EFE8, no wrapper capsules, content flows naturally */}
      <section className="impact-parallax">
        <div className="impact-parallax-inner">
          <div className="impact-grid">
            <div className="impact-copy">
              <span className="eyebrow">Real community impact</span>
              <h2 className="gradient-reveal">Every item passed on is a small win for everyone.</h2>
              <p>
                Together we've kept gently used things in circulation, supported local families,
                and raised meaningful funds for verified charities — one donation at a time.
              </p>
              <Link to="/add_announcement" className="impact-cta">
                Donate something today <ArrowRight size={16} />
              </Link>
            </div>
            <div className="impact-metrics">
              <div className="metric-card metric-1 gloweffect-light" onMouseMove={handleCardMouseMove}>
                <div className="metric-icon"><Heart size={22} fill="currentColor" /></div>
                <span className="metric-value">{(homepageData?.stats?.total_donations || 0) + 1280}</span>
                <span className="metric-label">Items donated &amp; re-loved</span>
              </div>
              <div className="metric-card metric-2 gloweffect-light" onMouseMove={handleCardMouseMove}>
                <div className="metric-icon"><Recycle size={22} /></div>
                <span className="metric-value">2.4t</span>
                <span className="metric-label">CO₂e diverted from landfill</span>
              </div>
              <div className="metric-card metric-3 gloweffect-light" onMouseMove={handleCardMouseMove}>
                <div className="metric-icon"><Users size={22} /></div>
                <span className="metric-value">{(homepageData?.stats?.total_users || 0) + 340}</span>
                <span className="metric-label">Families supported locally</span>
              </div>
              <div className="metric-card metric-4 gloweffect-light" onMouseMove={handleCardMouseMove}>
                <div className="metric-icon"><Leaf size={22} /></div>
                <span className="metric-value">82%</span>
                <span className="metric-label">Of proceeds to charity partners</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category Tabs — no encapsulation, sits on the same page bg */}
      <section className="shop-by-tabs-section tt-container">
        <div className="section-header-editorial">
          <h2 className="editorial-title gradient-reveal">Shop by Category</h2>
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
                <div className="category-scroll-row" ref={el => { categoryRefs.current[cat.id] = el; }}>
                  {productsByCategory[cat.id]?.map((product) => (
                    <div 
                      key={product.id} 
                      className="home-card-wrapper gloweffect-light" 
                      onMouseMove={handleCardMouseMove}
                    >
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
          <h2 className="editorial-title gradient-reveal">Browse Collections</h2>
          <p>Explore our curated selections for every stage.</p>
        </div>
        <div className="collections-grid-redesign">
          {homepageData?.featured_categories?.slice(0, 8).map((cat) => (
            <Link 
              key={cat.id} 
              to={`/category/${cat.slug}`} 
              className="collection-tile"
              onMouseMove={handleCardMouseMove}
            >
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
            <h2 className="editorial-title gradient-reveal">Trending Now</h2>
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
              <div 
                key={product.id} 
                className="home-card-wrapper gloweffect-light" 
                onMouseMove={handleCardMouseMove}
              >
                <MarketplaceCard product={product} view="grid" getImageUrl={getImageUrl} colors={colors} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="trending-row-section tt-container">
        <div className="section-header-editorial with-nav">
          <div>
            <h2 className="editorial-title gradient-reveal">New Arrivals</h2>
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
              <div 
                key={product.id} 
                className="home-card-wrapper gloweffect-light" 
                onMouseMove={handleCardMouseMove}
              >
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
              <h2 className="editorial-title gradient-reveal">Nearby Treasures</h2>
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
                <div 
                  key={product.id} 
                  className="home-card-wrapper gloweffect-light" 
                  onMouseMove={handleCardMouseMove}
                >
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
              <h2 className="editorial-title gradient-reveal">Free for All</h2>
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
                <div 
                  key={product.id} 
                  className="home-card-wrapper gloweffect-light" 
                  onMouseMove={handleCardMouseMove}
                >
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

      {/* Second parallax moment – bg-fixed directly on the section, full width,
           no wrapper capsules, sits on page flow */}
      <section className="second-parallax">
        <div className="second-parallax-card gloweffect-light" onMouseMove={handleCardMouseMove}>
          <span className="eyebrow">How it all works</span>
          <h3 className="gradient-reveal">
            Snap a photo → Share locally → Someone's day gets better.
          </h3>
          <p>
            It really is that simple. Upload your gently used items in under a minute,
            and we'll match them with a local parent or verified charity partner nearby.
          </p>
        </div>
      </section>

      {/* ============ BENTO GRID – inserted BELOW "How TinyTrove Works" (second-parallax) ============ */}
      <section className="bento-section">
        <div className="bento-hero-row">
          <div>
            <h2>
              Every wardrobe, home and community.<br />On one marketplace.
            </h2>
            <p>From a single donation to a complete circular lifestyle, at your own pace.</p>
          </div>
          <Link to="/add_announcement" className="bento-cta-btn">
            Start creating <ArrowRight size={18} />
          </Link>
        </div>

        <div className="bento-grid">

          {/* CELL A – top-left text block */}
          <article className="bento-cell bento-a" onMouseMove={handleCardMouseMove}>
            <span className="bento-eyebrow">Give &amp; Sell</span>
            <h3 className="bento-title">Every category, ready to go.</h3>
            <p className="bento-sub">
              Clothes, toys, furniture, books, baby gear — every day essentials.
              No setup. Open what you need, list what you don't.
            </p>
          </article>

          {/* CELL B – top-right merged 2-col dark canvas block */}
          <article className="bento-cell bento-b" onMouseMove={handleCardMouseMove}>
            <span className="bento-eyebrow" style={{ color: '#FF8FA8' }}>Your community canvas</span>
            <h3 className="bento-title">
              Your entire donation journey<br />on one connected board.
            </h3>
            <p className="bento-sub" style={{ maxWidth: 480 }}>
              All your listings. All your favourite causes. One board. Branch ideas, compare versions,
              work with your group — all in the same community.
            </p>
            <div className="bento-canvas">
              <div className="canvas-flow">
                <svg className="canvas-bezier" viewBox="0 0 800 400" preserveAspectRatio="none" fill="none">
                  <path d="M 340 80 C 500 80, 560 120, 620 200 C 660 250, 580 260, 520 300 C 480 328, 360 310, 240 280 C 140 256, 60 300, 40 360"
                        stroke="url(#g1)" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 620 200 C 640 210, 660 220, 680 240"
                        stroke="url(#g2)" strokeWidth="6" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="g1" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#7C8CFF" />
                      <stop offset="60%" stopColor="#FF6FB1" />
                      <stop offset="100%" stopColor="#59BFA4" />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#7C8CFF" />
                      <stop offset="100%" stopColor="#59BFA4" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="canvas-photo cp-a">
                  <img src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=neatly%20folded%20children%20clothes%20on%20wooden%20table%20pastel%20jerseys%20onesies%20soft%20natural%20light%20cozy%20premium&image_size=square" alt="" />
                </div>
                <div className="canvas-photo cp-b">
                  <img src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=young%20child%20playing%20with%20colorful%20wooden%20toys%20soft%20morning%20light%20cozy%20nursery%20warm%20tones&image_size=square" alt="" />
                </div>
                <div className="canvas-photo cp-c">
                  <img src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=happy%20family%20unboxing%20second%20hand%20kids%20furniture%20bookshelf%20assembly%20sunny%20living%20room%20warm%20tones&image_size=square" alt="" />
                </div>

                <span className="canvas-node na">+</span>
                <span className="canvas-node nb">+</span>
                <span className="canvas-node nc">+</span>

                <span className="canvas-label la">Paplio</span>
                <span className="canvas-label lb">Marina</span>
                <span className="canvas-label lc">GreenStitch</span>
              </div>
            </div>
          </article>

          {/* CELL C – bottom-left tabs + thumbs */}
          <article className="bento-cell bento-c" onMouseMove={handleCardMouseMove}>
            <span className="bento-eyebrow">Fresh picks</span>
            <div className="bento-tabs">
              <button className="bento-tab active" type="button">ALL</button>
              <button className="bento-tab" type="button">CLOTHES</button>
              <button className="bento-tab" type="button">TOYS</button>
              <button className="bento-tab" type="button">HOME</button>
            </div>
            <div className="bento-thumbs">
              <div className="bento-thumb">
                <img src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=vibrant%20marbled%20textile%20art%20paint%20pour%20abstract%20pink%20blue%20swirls%20close%20up%20detail&image_size=square_hd" alt="" />
                <span className="bento-thumb-fav">♥</span>
              </div>
              <div className="bento-thumb">
                <img src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=stylish%20kids%20fashion%20portrait%20colorful%20hoodie%20studio%20lighting%20warm&image_size=square_hd" alt="" />
                <span className="bento-thumb-fav">♡</span>
              </div>
            </div>
          </article>

          {/* CELL D – bottom-mid team block */}
          <article className="bento-cell bento-d" onMouseMove={handleCardMouseMove}>
            <span className="bento-eyebrow" style={{ color: '#FFB89A' }}>Your charity hub</span>
            <h3 className="bento-title">One place.<br />Whole community.</h3>
            <p className="bento-sub" style={{ opacity: .8 }}>
              Organize donations, track impact and raise funds with Projects.
              Your team works together, your impact stays together.
            </p>
          </article>

          {/* CELL E – bottom-right workflow block */}
          <article className="bento-cell bento-e" onMouseMove={handleCardMouseMove}>
            <span className="bento-eyebrow" style={{ color: '#8FD0E8' }}>Smart workflows</span>
            <h3 className="bento-title">Impact in<br />one click.</h3>
            <p className="bento-sub" style={{ opacity: .8 }}>
              Save any recurring give-back as a one-tap App.
              The next donor runs it in one click.
            </p>
          </article>

        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-redesign tt-container">
        <div className="section-header-editorial centered">
          <h2 className="editorial-title gradient-reveal">Trust Reviews</h2>
          <p>Join thousands of families making a difference.</p>
        </div>
        <div className="testimonials-grid-redesign">
          {homepageData?.recent_reviews?.slice(0, 3).map((review) => (
            <div key={review.id} className="testimonial-editorial-card testimonial-glass-card gloweffect-light" onMouseMove={handleCardMouseMove}>
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
              <h2 className="editorial-title" style={{ color: colors.bgPrimary }}>Stay close to what matters</h2>
              <p>Get thoughtful updates, local finds, and stories of impact in your inbox.</p>
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
               <h3 className="editorial-title">{APP_NAME}</h3>
               <p>{APP_FOOTER_BLURB}</p>
            </div>
            <div className="footer-links">
              <h4>Explore</h4>
               <Link to="/announcements">Marketplace</Link>
               <Link to="/add_announcement">Donations</Link>
               <Link to="/announcements">Categories</Link>
            </div>
            <div className="footer-links">
              <h4>Support</h4>
              <Link to="/faq">Help Center</Link>
               <Link to="/faq">How it Works</Link>
               <Link to="/faq">Safety</Link>
            </div>
            <div className="footer-links">
              <h4>Connect</h4>
               <Link to="/our_partners">About Us</Link>
               <Link to="/our_partners">Charity Partners</Link>
               <Link to="/faq">Contact</Link>
            </div>
          </div>
          <div className="footer-bottom" style={{ borderTop: `1px solid ${colors.border}` }}>
             <p>&copy; 2026 {APP_COPYRIGHT}. All rights reserved.</p>
            <div className="footer-legal">
               <Link to="/terms_conditions">Terms</Link>
               <Link to="/privacy_policy">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}

export default Home;
