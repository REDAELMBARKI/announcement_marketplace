import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
  Sparkles,
  Package,
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
import AppButton from "./Common/AppButton";

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

interface ScrollState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  percent: number;
}

const initialScrollState: ScrollState = { canScrollLeft: false, canScrollRight: false, percent: 0 };

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

  // Scroll row visibility states
  const [trendingScroll, setTrendingScroll] = useState<ScrollState>(initialScrollState);
  const [marketScroll, setMarketScroll] = useState<ScrollState>(initialScrollState);
  const [nearbyScroll, setNearbyScroll] = useState<ScrollState>(initialScrollState);
  const [freeScroll, setFreeScroll] = useState<ScrollState>(initialScrollState);
  const [categoryScroll, setCategoryScroll] = useState<Record<number, ScrollState>>({});

  // rAF frame ref for mouse-glow throttling
  const mouseGlowFrameRef = useRef<number>(0);
  const mouseGlowPendingRef = useRef<{ el: HTMLElement; x: number; y: number } | null>(null);

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
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error('[Home] fetch failed:', err?.response?.data || err?.message || err);
        }
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

  // ----- rAF-throttled mouse glow (P3-14) -----
  const flushMouseGlow = useCallback(() => {
    mouseGlowFrameRef.current = 0;
    const pending = mouseGlowPendingRef.current;
    if (!pending) return;
    mouseGlowPendingRef.current = null;
    pending.el.style.setProperty('--mouse-x', `${pending.x}px`);
    pending.el.style.setProperty('--mouse-y', `${pending.y}px`);
  }, []);

  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement | HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseGlowPendingRef.current = { el, x, y };
    if (mouseGlowFrameRef.current) return;
    mouseGlowFrameRef.current = window.requestAnimationFrame(flushMouseGlow);
  }, [flushMouseGlow]);

  useEffect(() => () => {
    if (mouseGlowFrameRef.current) cancelAnimationFrame(mouseGlowFrameRef.current);
  }, []);

  // ----- Scroll state updater factory (P2-8) -----
  const updateScrollState = useCallback(
    (container: HTMLDivElement | null, setter: React.Dispatch<React.SetStateAction<ScrollState>>) => {
      if (!container) return;
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const maxScroll = scrollWidth - clientWidth;
      const percent = maxScroll <= 0 ? 0 : Math.min(100, Math.round((scrollLeft / maxScroll) * 100));
      setter({
        canScrollLeft: scrollLeft > 1,
        canScrollRight: scrollLeft < maxScroll - 1,
        percent,
      });
    },
    [],
  );

  const updateCategoryScrollState = useCallback((catId: number) => {
    const container = categoryRefs.current[catId];
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScroll = scrollWidth - clientWidth;
    const percent = maxScroll <= 0 ? 0 : Math.min(100, Math.round((scrollLeft / maxScroll) * 100));
    setCategoryScroll(prev => ({
      ...prev,
      [catId]: {
        canScrollLeft: scrollLeft > 1,
        canScrollRight: scrollLeft < maxScroll - 1,
        percent,
      },
    }));
  }, []);

  // Dynamic scroll amount = 90% of the visible row width, so we snap ~a page at a time
  const getDynamicScrollAmount = useCallback((container: HTMLDivElement | null): number => {
    if (!container) return 400;
    const cardEl = container.querySelector('.home-card-wrapper, .view-more-card') as HTMLElement | null;
    const gap = 24;
    const cardWidth = cardEl ? cardEl.getBoundingClientRect().width + gap : 280;
    const clientWidth = container.clientWidth;
    const cardsPerView = Math.max(1, Math.floor((clientWidth + gap) / cardWidth));
    return Math.max(200, Math.round(cardsPerView * cardWidth - gap));
  }, []);

  const scrollTrending = (direction: 'left' | 'right') => {
    const container = trendingScrollRef.current;
    if (!container) return;
    const scrollAmount = getDynamicScrollAmount(container);
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  const scrollCategory = (categoryId: number, direction: 'left' | 'right') => {
    const container = categoryRefs.current[categoryId];
    if (!container) return;
    const scrollAmount = getDynamicScrollAmount(container);
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
    const scrollAmount = getDynamicScrollAmount(container);
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  const scrollNearby = (direction: 'left' | 'right') => {
    const container = nearbyScrollRef.current;
    if (!container) return;
    const scrollAmount = getDynamicScrollAmount(container);
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  const scrollFree = (direction: 'left' | 'right') => {
    const container = freeScrollRef.current;
    if (!container) return;
    const scrollAmount = getDynamicScrollAmount(container);
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  // ----- Attach scroll listeners + initial state read (P2-8) -----
  useEffect(() => {
    const entries: Array<[React.RefObject<HTMLDivElement>, React.Dispatch<React.SetStateAction<ScrollState>>]> = [
      [trendingScrollRef, setTrendingScroll],
      [marketScrollRef, setMarketScroll],
      [nearbyScrollRef, setNearbyScroll],
      [freeScrollRef, setFreeScroll],
    ];
    const listeners: Array<() => void> = [];
    entries.forEach(([ref, setter]) => {
      const el = ref.current;
      if (!el) return;
      updateScrollState(el, setter);
      const handler = () => updateScrollState(el, setter);
      el.addEventListener('scroll', handler, { passive: true });
      listeners.push(() => el.removeEventListener('scroll', handler));
    });
    // Category rows
    Object.keys(categoryRefs.current).forEach(k => {
      const catId = Number(k);
      const el = categoryRefs.current[catId];
      if (!el) return;
      updateCategoryScrollState(catId);
      const handler = () => updateCategoryScrollState(catId);
      el.addEventListener('scroll', handler, { passive: true });
      listeners.push(() => el.removeEventListener('scroll', handler));
    });
    const ro = new ResizeObserver(() => {
      entries.forEach(([ref, setter]) => updateScrollState(ref.current, setter));
      Object.keys(categoryRefs.current).forEach(k => updateCategoryScrollState(Number(k)));
    });
    entries.forEach(([ref]) => ref.current && ro.observe(ref.current));
    Object.values(categoryRefs.current).forEach(el => el && ro.observe(el));
    return () => {
      listeners.forEach(fn => fn());
      ro.disconnect();
    };
  // Re-run after homepage data renders rows
  }, [homepageData, updateScrollState, updateCategoryScrollState]);

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

  const heroSlides = useMemo<HeroSlide[]>(() => homepageData?.hero_sliders || fallbackHomepageData.hero_sliders, [homepageData]);
  const activeHero = heroSlides[activeSlide % heroSlides.length] || heroSlides[0];

  const renderHeroProgress = () => (
    <div className="hero-progress-track">
      {heroSlides.map((slide, idx) => (
        <div key={slide.id} className="hero-progress-segment" aria-hidden="true">
          <div
            className="hero-progress-fill"
            style={{
              width: idx === activeSlide ? `${slideProgress}%` : idx < activeSlide ? '100%' : '0%',
              backgroundColor: colors.coral,
            }}
          />
        </div>
      ))}
    </div>
  );

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
          <AppButton variant="coral" onClick={() => window.location.reload()}>Try Again</AppButton>
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
      
      {/* Hero – now wired to hero_sliders rotation (P2-9) */}
      <section className="hero-magnific">
        <div className="hero-magnific-bg">
          <img
            src={activeHero.thumbnail?.url || "/src/images/hero.png"}
            alt="Hero background"
            className="hero-magnific-image"
            key={activeHero.id}
          />
          <div className="hero-magnific-scrim"></div>
          <div className="hero-magnific-glow"></div>
        </div>

        <div className="hero-magnific-container">
          {/* Left content – populated by current hero_slider entry */}
          <div className="hero-magnific-left">
            <div className="hero-magnific-pill">
              <span>{APP_HERO_PILL}</span>
              <Link to="/our_partners" className="hero-magnific-pill-link">
                Meet our partners
                <ArrowRight size={16} />
              </Link>
            </div>

            <h1 className="hero-magnific-headline" key={`h-${activeHero.id}`}>
              {activeHero.headline || APP_TAGLINE}
            </h1>

            <p className="hero-magnific-subline" key={`s-${activeHero.id}`}>
              {activeHero.subline || "Every listing, donation and exchange supports your community. Intelligent filters, verified sellers, and charity partners built in — for meaningful second lives at any scale."}
            </p>

            <div className="hero-magnific-actions">
              <Link to={activeHero.cta1_link || "/announcements"} style={{ textDecoration: 'none' }}>
                <AppButton variant="primary" size="lg">
                  {activeHero.cta1_text || "Browse marketplace"}
                </AppButton>
              </Link>
              <Link to={activeHero.cta2_link || "/add_announcement"} style={{ textDecoration: 'none' }}>
                <AppButton variant="outline" size="lg" leftIcon={
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <polygon points="3,1 14,8 3,15" />
                  </svg>
                }>
                  {activeHero.cta2_text || "Start donating"}
                </AppButton>
              </Link>
            </div>

            {/* Slider controls + percent progress */}
            {heroSlides.length > 1 && (
              <div className="hero-slider-controls">
                <div className="hero-slide-dots">
                  {heroSlides.map((slide, idx) => (
                    <button
                      key={slide.id}
                      className={`hero-slide-dot ${idx === activeSlide ? 'active' : ''}`}
                      aria-label={`Go to slide ${idx + 1}`}
                      onClick={() => { setActiveSlide(idx); setSlideProgress(0); }}
                      style={{
                        backgroundColor: idx === activeSlide ? colors.coral : 'rgba(255,255,255,0.35)',
                      }}
                    />
                  ))}
                </div>
                {renderHeroProgress()}
              </div>
            )}
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
                  <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
                    <polygon points="6,4 24,14 6,24" fill={colors.coral} />
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
            <Link to="/add_announcement" style={{ textDecoration: 'none' }}>
              <AppButton variant="ghost" size="sm" rightIcon={<ArrowRight size={16} />}>Start donating</AppButton>
            </Link>
          </article>
          <article className="purpose-card purpose-card--peach gloweffect-light" onMouseMove={handleCardMouseMove}>
            <div className="purpose-icon"><Store size={25} /></div>
            <span className="purpose-number">02</span>
            <h3>Find more for less</h3>
            <p>Discover pre-loved clothes, furniture, toys, and everyday essentials from your community.</p>
            <Link to="/announcements" style={{ textDecoration: 'none' }}>
              <AppButton variant="ghost" size="sm" rightIcon={<ArrowRight size={16} />}>Explore listings</AppButton>
            </Link>
          </article>
          <article className="purpose-card purpose-card--blue gloweffect-light" onMouseMove={handleCardMouseMove}>
            <div className="purpose-icon"><MapPin size={25} /></div>
            <span className="purpose-number">03</span>
            <h3>Keep it close</h3>
            <p>Make simple, local exchanges that save time, reduce waste, and build trust.</p>
            <Link to="/our_partners" style={{ textDecoration: 'none' }}>
              <AppButton variant="ghost" size="sm" rightIcon={<ArrowRight size={16} />}>Meet our partners</AppButton>
            </Link>
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

      {/* Impact parallax */}
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
              <Link to="/add_announcement" style={{ textDecoration: 'none' }}>
                <AppButton variant="coral" size="md" rightIcon={<ArrowRight size={16} />}>
                  Donate something today
                </AppButton>
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

      {/* Better Environment Visual Story */}
      <section className="better-environment-section">
        <div className="better-environment-image">
          <img src="/betterenvirement.png" alt="Together we can make a difference - Your donation brings hope, happiness and a better tomorrow" />
        </div>
      </section>

      {/* Shop by Category Tabs */}
      <section className="shop-by-tabs-section tt-container">
        <div className="section-header-editorial">
          <h2 className="editorial-title gradient-reveal">Shop by Category</h2>
          <p>Find exactly what they need, sorted by category.</p>
        </div>

        <div className="tabs-wrapper">
          <div className="pill-tabs no-scrollbar">
            {homepageData?.featured_categories?.map((cat) => (
              <AppButton
                key={cat.id}
                variant={activeCategoryTab === cat.id ? 'pillActive' : 'pill'}
                size="sm"
                onClick={() => setActiveCategoryTab(cat.id)}
                style={{ '--active-color': colors.coral } as React.CSSProperties}
                leftIcon={<span className="tab-emoji">{getCategoryIcon(cat.name)}</span>}
              >
                {cat.name}
              </AppButton>
            ))}
          </div>
        </div>

        <div className="tab-content-area">
          {homepageData?.featured_categories?.map((cat) => {
            const items = productsByCategory[cat.id] || [];
            const isEmpty = items.length === 0;
            const cs = categoryScroll[cat.id] || initialScrollState;
            return (
              <div 
                key={cat.id} 
                className={`tab-pane ${activeCategoryTab === cat.id ? 'active' : ''}`}
              >
                <div className="scroll-container no-scrollbar">
                  <AppButton
                    variant="chevron"
                    size="icon"
                    square
                    className={`scroll-btn left ${!cs.canScrollLeft ? 'is-disabled' : ''}`}
                    onClick={() => scrollCategory(cat.id, 'left')}
                    disabled={!cs.canScrollLeft}
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={20} />
                  </AppButton>
                  <div 
                    className={`category-scroll-row scroll-snap-row no-scrollbar ${isEmpty ? 'has-empty' : ''}`} 
                    ref={el => { categoryRefs.current[cat.id] = el; }}
                  >
                    {isEmpty ? (
                      <EmptyRowState icon={<Package size={28} />} title={`Nothing yet in ${cat.name}`} hint="Check back soon or explore other categories." />
                    ) : (
                      items.map((product) => (
                        <div 
                          key={product.id} 
                          className="home-card-wrapper gloweffect-light scroll-snap-item" 
                          onMouseMove={handleCardMouseMove}
                        >
                          <MarketplaceCard product={product} view="grid" getImageUrl={getImageUrl} colors={colors} />
                        </div>
                      ))
                    )}
                    {!isEmpty && (
                      <Link to={`/category/${cat.slug}`} className="view-more-card scroll-snap-item">
                        <div className="view-more-inner">
                          <div className="icon-circle"><ArrowRight /></div>
                          <span>View all {cat.name}</span>
                        </div>
                      </Link>
                    )}
                  </div>
                  <AppButton
                    variant="chevron"
                    size="icon"
                    square
                    className={`scroll-btn right ${!cs.canScrollRight ? 'is-disabled' : ''}`}
                    onClick={() => scrollCategory(cat.id, 'right')}
                    disabled={!cs.canScrollRight}
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={20} />
                  </AppButton>
                  <ScrollPercentBar percent={cs.percent} />
                </div>
              </div>
            );
          })}
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

      {/* Trending Now – with chevron enable/disable + percent + scroll-snap */}
      <section className="trending-row-section tt-container">
        <div className="section-header-editorial with-nav">
          <div>
            <h2 className="editorial-title gradient-reveal">Trending Now</h2>
            <p>The most loved items in our community this week.</p>
          </div>
          <div className="row-nav">
            <AppButton
              variant="chevron"
              size="icon"
              square
              disabled={!trendingScroll.canScrollLeft}
              className={!trendingScroll.canScrollLeft ? 'is-disabled' : ''}
              onClick={() => scrollTrending('left')}
              aria-label="Scroll trending left"
            >
              <ChevronLeft />
            </AppButton>
            <AppButton
              variant="chevron"
              size="icon"
              square
              disabled={!trendingScroll.canScrollRight}
              className={!trendingScroll.canScrollRight ? 'is-disabled' : ''}
              onClick={() => scrollTrending('right')}
              aria-label="Scroll trending right"
            >
              <ChevronRight />
            </AppButton>
          </div>
        </div>
        <div className="scroll-container no-scrollbar">
          <div className={`trending-scroll-row scroll-snap-row no-scrollbar ${popularProducts.length === 0 ? 'has-empty' : ''}`} ref={trendingScrollRef}>
            {popularProducts.length === 0 ? (
              <EmptyRowState icon={<Sparkles size={28} />} title="Trending picks are warming up" hint="Come back soon for community favorites." />
            ) : (
              popularProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="home-card-wrapper gloweffect-light scroll-snap-item" 
                  onMouseMove={handleCardMouseMove}
                >
                  <MarketplaceCard product={product} view="grid" getImageUrl={getImageUrl} colors={colors} />
                </div>
              ))
            )}
          </div>
          <ScrollPercentBar percent={trendingScroll.percent} />
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
            <AppButton
              variant="chevron"
              size="icon"
              square
              disabled={!marketScroll.canScrollLeft}
              className={!marketScroll.canScrollLeft ? 'is-disabled' : ''}
              onClick={() => scrollMarket('left')}
              aria-label="Scroll new arrivals left"
            >
              <ChevronLeft />
            </AppButton>
            <AppButton
              variant="chevron"
              size="icon"
              square
              disabled={!marketScroll.canScrollRight}
              className={!marketScroll.canScrollRight ? 'is-disabled' : ''}
              onClick={() => scrollMarket('right')}
              aria-label="Scroll new arrivals right"
            >
              <ChevronRight />
            </AppButton>
          </div>
        </div>
        <div className="scroll-container no-scrollbar">
          <div className={`trending-scroll-row scroll-snap-row no-scrollbar ${newArrivals.length === 0 ? 'has-empty' : ''}`} ref={marketScrollRef}>
            {newArrivals.length === 0 ? (
              <EmptyRowState icon={<Package size={28} />} title="No new arrivals yet" hint="Fresh finds will land here throughout the day." />
            ) : (
              newArrivals.map((product) => (
                <div 
                  key={product.id} 
                  className="home-card-wrapper gloweffect-light scroll-snap-item" 
                  onMouseMove={handleCardMouseMove}
                >
                  <MarketplaceCard product={product} view="grid" getImageUrl={getImageUrl} colors={colors} />
                </div>
              ))
            )}
          </div>
          <ScrollPercentBar percent={marketScroll.percent} />
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
              <AppButton
                variant="chevron"
                size="icon"
                square
                disabled={!nearbyScroll.canScrollLeft}
                className={!nearbyScroll.canScrollLeft ? 'is-disabled' : ''}
                onClick={() => scrollNearby('left')}
                aria-label="Scroll nearby left"
              >
                <ChevronLeft />
              </AppButton>
              <AppButton
                variant="chevron"
                size="icon"
                square
                disabled={!nearbyScroll.canScrollRight}
                className={!nearbyScroll.canScrollRight ? 'is-disabled' : ''}
                onClick={() => scrollNearby('right')}
                aria-label="Scroll nearby right"
              >
                <ChevronRight />
              </AppButton>
            </div>
          </div>
          <div className="scroll-container no-scrollbar">
            <div className="trending-scroll-row scroll-snap-row no-scrollbar" ref={nearbyScrollRef}>
              {nearbyProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="home-card-wrapper gloweffect-light scroll-snap-item" 
                  onMouseMove={handleCardMouseMove}
                >
                  <MarketplaceCard product={product} view="grid" getImageUrl={getImageUrl} colors={colors} />
                </div>
              ))}
            </div>
            <ScrollPercentBar percent={nearbyScroll.percent} />
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
              <AppButton
                variant="chevron"
                size="icon"
                square
                disabled={!freeScroll.canScrollLeft}
                className={!freeScroll.canScrollLeft ? 'is-disabled' : ''}
                onClick={() => scrollFree('left')}
                aria-label="Scroll free items left"
              >
                <ChevronLeft />
              </AppButton>
              <AppButton
                variant="chevron"
                size="icon"
                square
                disabled={!freeScroll.canScrollRight}
                className={!freeScroll.canScrollRight ? 'is-disabled' : ''}
                onClick={() => scrollFree('right')}
                aria-label="Scroll free items right"
              >
                <ChevronRight />
              </AppButton>
            </div>
          </div>
          <div className="scroll-container no-scrollbar">
            <div className="trending-scroll-row scroll-snap-row no-scrollbar" ref={freeScrollRef}>
              {freeItems.map((product) => (
                <div 
                  key={product.id} 
                  className="home-card-wrapper gloweffect-light scroll-snap-item" 
                  onMouseMove={handleCardMouseMove}
                >
                  <MarketplaceCard product={product} view="grid" getImageUrl={getImageUrl} colors={colors} />
                </div>
              ))}
            </div>
            <ScrollPercentBar percent={freeScroll.percent} />
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

      {/* Second parallax */}
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

      {/* BENTO GRID */}
      <section className="bento-section">
        <div className="bento-hero-row">
          <div>
            <h2>
              Every wardrobe, home and community.<br />On one marketplace.
            </h2>
            <p>From a single donation to a complete circular lifestyle, at your own pace.</p>
          </div>
          <Link to="/add_announcement" style={{ textDecoration: 'none' }}>
            <AppButton variant="coral" size="lg" rightIcon={<ArrowRight size={18} />}>
              Start creating
            </AppButton>
          </Link>
        </div>

        <div className="bento-grid">

          <article className="bento-cell bento-a" onMouseMove={handleCardMouseMove}>
            <span className="bento-eyebrow">Give &amp; Sell</span>
            <h3 className="bento-title">Every category, ready to go.</h3>
            <p className="bento-sub">
              Clothes, toys, furniture, books, baby gear — every day essentials.
              No setup. Open what you need, list what you don't.
            </p>
          </article>

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
              <div className="canvas-single-image">
                <img src="/donanJourneytio.png" alt="Donation journey visualization" />
              </div>
            </div>
          </article>

          <article className="bento-cell bento-c" onMouseMove={handleCardMouseMove}>
            <span className="bento-eyebrow">Fresh picks</span>
            <div className="bento-tabs">
              <AppButton variant="pillActive" size="xs" className="bento-tab" type="button">ALL</AppButton>
              <AppButton variant="pill" size="xs" className="bento-tab" type="button">CLOTHES</AppButton>
              <AppButton variant="pill" size="xs" className="bento-tab" type="button">TOYS</AppButton>
              <AppButton variant="pill" size="xs" className="bento-tab" type="button">HOME</AppButton>
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

          <article className="bento-cell bento-d" onMouseMove={handleCardMouseMove}>
            <span className="bento-eyebrow" style={{ color: '#FFB89A' }}>Your charity hub</span>
            <h3 className="bento-title">One place.<br />Whole community.</h3>
            <p className="bento-sub" style={{ opacity: .8 }}>
              Organize donations, track impact and raise funds with Projects.
              Your team works together, your impact stays together.
            </p>
          </article>

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

      {/* Community Impact Image Section */}
      <section className="community-impact-section">
        <div className="community-impact-image">
          <img src="/comunity.png" alt="Join thousands of families making a difference" />
        </div>
      </section>

      {/* Newsletter with Visual Impact Background */}
      <section className="newsletter-visual-section">
        <div className="newsletter-visual-bg">
          <img src="/src/images/Group6.png" alt="Community Impact Visualization" />
        </div>
        <div className="tt-container">
          <div className="newsletter-box">
            <div className="newsletter-content">
              <h2 className="editorial-title">Stay close to what matters</h2>
              <p>Get thoughtful updates, local finds, and stories of impact in your inbox.</p>
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <div className="input-with-icon">
                  <Mail size={18} />
                  <input type="email" placeholder="Your email address" />
                </div>
                <AppButton type="submit" variant="coral" size="md">
                  Subscribe
                </AppButton>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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

/* ---------- small sub-components used above ---------- */

function ScrollPercentBar({ percent }: { percent: number }) {
  const { colors } = useTheme();
  return (
    <div className="scroll-percent-track" aria-hidden="true">
      <div
        className="scroll-percent-fill"
        style={{
          width: `${percent}%`,
          backgroundColor: colors.coral,
        }}
      />
    </div>
  );
}

function EmptyRowState({
  icon,
  title,
  hint,
  wide = false,
}: {
  icon?: React.ReactNode;
  title: string;
  hint?: string;
  wide?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <div
      className={`empty-row-state ${wide ? 'wide' : ''}`}
      style={{
        color: colors.textSecondary,
        borderColor: colors.border,
        backgroundColor: colors.bgSecondary,
      }}
      aria-live="polite"
    >
      <div className="empty-row-icon" style={{ color: colors.coral, backgroundColor: colors.coralLight }}>
        {icon}
      </div>
      <div className="empty-row-title" style={{ color: colors.textPrimary }}>{title}</div>
      {hint && <div className="empty-row-hint">{hint}</div>}
    </div>
  );
}

export default Home;
