import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import route from "../../utils/route";
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
  Star,
  ChatLine
} from "@solar-icons/react";
import { Button } from "@mui/material";
import "../../css/home.css"; 
import { useTheme } from "../../context/ThemeContext";
import Sidebar from "./Marketplace/Sidebar";
import { Product } from "./User/announcement/types";
import MarketplaceCard from "./MarketplaceCard";
import CustomSelect from "./common/CustomSelect";

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
    api.get(route('marketplace.init-data').toString())
      .then(res => {
        console.log("Marketplace Init Data:", res.data);
        if (res.data.status === "success") {
          setInitData(res.data);
        }
      })
      .catch(err => console.error("Init error:", err));
  }, []);

  // Fetch Listings
  const fetchListings = useCallback(() => {
    setListingsLoading(true);
    const params: any = {
      search: filters.search,
      category: filters.category,
      gender: filters.gender,
      condition: filters.condition,
      min_price: filters.min_price,
      max_price: filters.max_price,
      free_only: filters.free_only ? "1" : undefined,
      sort: filters.sort,
    };
    
    // Arrays
    if (filters.cities.length > 0) params['cities'] = filters.cities;
    if (filters.mode.length > 0) params['mode'] = filters.mode;
    if (filters.age_range.length > 0) params['age_range'] = filters.age_range;
    if (filters.sizes.length > 0) params['sizes'] = filters.sizes;

    api.get(route('marketplace.listings', params).toString())
      .then(res => {
        if (res.data.status === "success") {
          const productsArray = res.data.data.data || res.data.data;
          console.log(productsArray)
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
          zIndex: 5,
          backgroundColor: colors.bgPrimary, 
          padding: '20px 40px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: `1px solid ${colors.sidebarBorder || colors.border}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: colors.textPrimary, margin: 0 }}>Marketplace</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', width: '300px' }}>
                <Search 
                  size={18} 
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: colors.textMuted,
                    zIndex: 1
                  }} 
                />
                <input 
                  type="text"
                  placeholder="Rechercher un article..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 15px 10px 40px',
                    borderRadius: '12px',
                    border: `1px solid ${colors.sidebarBorder || colors.border}`,
                    backgroundColor: colors.bgSecondary,
                    color: colors.textPrimary,
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = colors.coral}
                  onBlur={(e) => e.target.style.borderColor = colors.sidebarBorder || colors.border}
                />
              </div>

              <div style={{ width: '200px' }}>
                <CustomSelect 
                  multiple={true}
                  searchable={true}
                  options={initData?.cities || []}
                  value={filters.cities || []}
                  onChange={(val) => handleFilterChange('cities', val)}
                  placeholder="Toutes les villes"
                  icon={<MapPin size={18} weight="BoldDuotone" color={colors.iconCoral} />}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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



export default Marketplace;
