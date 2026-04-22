import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Camera,
  Heart
} from "lucide-react";
import { 
  MapPoint as MapPin, 
  Bag as ShoppingBag,
  Star
} from "@solar-icons/react";
import "../../css/home.css"; 
import { useTheme } from "../../context/ThemeContext";
import Sidebar from "./Marketplace/Sidebar";
import { Product } from "./User/announcement/types";

// --- Types ---
interface InitData {
  categories: any[];
  cities: any[];
  ageRanges: any[];
  clothingSizes: any[];
  shoeSizes: any[];
  conditions: any[];
  listingTypes: any[];
}

interface FilterState {
  search: string;
  category: string;
  cities: number[];
  mode: string[];
  age_range: string[];
  gender: string;
  condition: string;
  min_price: string;
  max_price: string;
  sizes: string[];
  free_only: boolean;
  with_media: boolean;
  sort: string;
  view: 'grid' | 'list';
}

const Marketplace: React.FC = () => {
  const { colors } = useTheme();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [initData, setInitData] = useState<InitData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [listingsLoading, setListingsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    cities: [],
    mode: [],
    age_range: [],
    gender: "",
    condition: "",
    min_price: "",
    max_price: "",
    sizes: [],
    free_only: false,
    with_media: false,
    sort: "newest",
    view: 'grid'
  });

  // Fetch Initialization Data
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/marketplace/init-data")
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setInitData(data);
        }
      })
      .catch(err => console.error("Init error:", err));
  }, []);

  // Fetch Listings
  const fetchListings = useCallback(() => {
    setListingsLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.category) params.append("category", filters.category);
    if (filters.gender) params.append("gender", filters.gender);
    if (filters.condition) params.append("condition", filters.condition);
    if (filters.min_price) params.append("min_price", filters.min_price);
    if (filters.max_price) params.append("max_price", filters.max_price);
    if (filters.free_only) params.append("free_only", "1");
    if (filters.sort) params.append("sort", filters.sort);
    
    // Arrays
    filters.cities.forEach(v => params.append("cities[]", String(v)));
    filters.mode.forEach(v => params.append("mode[]", v));
    filters.age_range.forEach(v => params.append("age_range[]", v));
    filters.sizes.forEach(v => params.append("sizes[]", v));

    fetch(`http://127.0.0.1:8000/api/marketplace/listings?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          const productsArray = data.data.data || data.data;
          setProducts(Array.isArray(productsArray) ? productsArray : []);
        }
        setLoading(false);
        setListingsLoading(false);
      })
      .catch(err => {
        console.error("Fetch listings error:", err);
        setLoading(false);
        setListingsLoading(false);
      });
  }, [filters]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Handlers
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleToggleArrayFilter = (key: string, value: any) => {
    setFilters(prev => {
      const current = (prev as any)[key] || [];
      if (!Array.isArray(current)) return prev;
      const next = current.includes(value) 
        ? current.filter(v => v !== value) 
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const handleReset = () => {
    setFilters({
      search: "",
      category: "",
      cities: [],
      mode: [],
      age_range: [],
      gender: "",
      condition: "",
      min_price: "",
      max_price: "",
      sizes: [],
      free_only: false,
      with_media: false,
      sort: "newest",
      view: filters.view
    });
  };

  const getImageUrl = (media: any) => {
    if (!media) return null;
    if (media.url && media.url.startsWith('http')) return media.url;
    return `http://127.0.0.1:8000/storage/${media.file_path.replace("public/", "")}`;
  };

  return (
    <div className="marketplace-page" style={{ 
      display: 'flex', 
      backgroundColor: colors.bgPrimary, 
      minHeight: '100vh', 
      fontFamily: "'Poppins', sans-serif" 
    }}>
      {/* --- Sidebar --- */}
      <Sidebar 
        initData={initData}
        filters={filters}
        onFilterChange={handleFilterChange}
        onToggleArrayFilter={handleToggleArrayFilter}
        onReset={handleReset}
        onApply={fetchListings}
        resultsCount={products.length}
        loading={loading}
      />

      {/* --- Main Content --- */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* --- Top Bar --- */}
        <div style={{ 
          position: 'sticky', 
          top: '80px', 
          zIndex: 100, 
          backgroundColor: colors.bgSecondary, 
          padding: '12px 40px', 
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          {/* Quick filter pills */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'sell', 'donate', 'swap'].map(m => {
              // mode is an array in filters, but for top bar we treat it as single select for simplicity or check if includes
              const active = m === 'all' ? filters.mode.length === 0 : filters.mode.includes(m);
              const labels: any = { all: 'Tous', sell: 'À vendre', donate: 'Gratuit', swap: 'Échange' };
              return (
                <button 
                  key={m}
                  onClick={() => m === 'all' ? handleFilterChange('mode', []) : handleToggleArrayFilter('mode', m)}
                  style={{ 
                    padding: '8px 20px', 
                    borderRadius: '20px', 
                    border: active ? 'none' : `1px solid ${colors.border}`,
                    backgroundColor: active ? colors.coral : colors.bgSecondary,
                    color: active ? colors.bgSecondary : colors.textSecondary,
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {labels[m]}
                </button>
              );
            })}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: colors.textSecondary }}>Trier par:</span>
              <select 
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '13px', color: colors.textPrimary, cursor: 'pointer', outline: 'none', backgroundColor: colors.bgSecondary }}
              >
                <option value="newest">Plus récent</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
              </select>
            </div>

            <div style={{ display: 'flex', backgroundColor: colors.bgTertiary, padding: '4px', borderRadius: '8px' }}>
              <button 
                onClick={() => handleFilterChange('view', 'grid')}
                style={{ padding: '6px', borderRadius: '6px', backgroundColor: filters.view === 'grid' ? colors.bgSecondary : 'transparent', border: 'none', cursor: 'pointer', color: filters.view === 'grid' ? colors.coral : colors.textMuted }}
              >
                <LayoutGrid size={18} strokeWidth={2} />
              </button>
              <button 
                onClick={() => handleFilterChange('view', 'list')}
                style={{ padding: '6px', borderRadius: '6px', backgroundColor: filters.view === 'list' ? colors.bgSecondary : 'transparent', border: 'none', cursor: 'pointer', color: filters.view === 'list' ? colors.coral : colors.textMuted }}
              >
                <List size={18} strokeWidth={2} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: colors.coralLight, color: colors.coral, borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
              <MapPin size={14} weight="BoldDuotone" color={colors.iconCoral} />
              <span>Agadir</span>
            </div>
          </div>
        </div>

        {/* --- Listings Grid --- */}
        <div style={{ padding: '30px 40px', flex: 1 }}>
          {listingsLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: filters.view === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: '25px' }}>
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} style={{ height: '380px', backgroundColor: colors.bgSecondary, borderRadius: '20px', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: filters.view === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', 
              gap: '25px' 
            }}>
              {products.map(product => (
                <MarketplaceCard key={product.id} product={product} view={filters.view} getImageUrl={getImageUrl} colors={colors} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '100px 20px', backgroundColor: colors.bgSecondary, borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <ShoppingBag size={64} color={colors.textMuted} style={{ marginBottom: '20px' }} weight="BoldDuotone" />
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: colors.textPrimary, marginBottom: '10px' }}>Aucun article trouvé</h2>
              <p style={{ color: colors.textSecondary, marginBottom: '30px' }}>Essayez d'ajuster vos filtres pour trouver ce que vous cherchez.</p>
              <button 
                onClick={handleReset}
                style={{ padding: '12px 30px', backgroundColor: colors.coral, color: colors.bgSecondary, border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Card Component ---
const MarketplaceCard: React.FC<{ product: Product, view: 'grid' | 'list', getImageUrl: (m: any) => string | null, colors: any }> = ({ product, view, getImageUrl, colors }) => {
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
    fetch(`http://127.0.0.1:8000/api/announcements/${product.id}/favorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorite: newStatus })
    }).catch(err => console.error("Favorite toggle error:", err));
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
              <div style={{ 
                padding: '8px 20px', 
                borderRadius: '12px', 
                backgroundColor: colors.coral, 
                color: colors.bgSecondary, 
                fontSize: '13px', 
                fontWeight: '700',
                cursor: 'pointer'
              }}>
                Contact
              </div>
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
        <div style={{ 
          padding: '6px 14px', 
          borderRadius: '10px', 
          backgroundColor: colors.coral, 
          color: colors.bgSecondary, 
          fontSize: '11px', 
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          Contact
        </div>
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
        
        <button onClick={toggleFavorite} style={{ position: 'absolute', top: '10px', right: '10px', width: '34px', height: '34px', borderRadius: '50', backgroundColor: colors.bgSecondary, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
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
};

export default Marketplace;
