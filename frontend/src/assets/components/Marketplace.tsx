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
import LoadingScreen from "../../components/Loading/LoadingScreen";
import Sidebar from "./Marketplace/Sidebar";
import { Product } from "./User/announcement/types";
import MarketplaceCard from "./MarketplaceCard";
import CustomSelect from "./Common/CustomSelect";

// --- Types ---
interface InitData {
  categories: any[];
  cities: any[];
  ageRanges: any[];
  clothingSizes: any[];
  shoeSizes: any[];
  conditions: any[];
  listingTypes: any[];
  materials?: any[];
  colors?: any[];
  genders?: any[];
  sortOptions?: any[];
}

interface PaginationState {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
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
  const [initLoading, setInitLoading] = useState<boolean>(true);
  const [listingsLoading, setListingsLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    lastPage: 1,
    perPage: 12,
    total: 0,
    from: 0,
    to: 0,
  });

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

  // Fetch Initialization Data (selects & options data)
  useEffect(() => {
    setInitLoading(true);
    api.get(route('marketplace.init-data').toString())
      .then(res => {
        if (res.data.status === "success") {
          setInitData(res.data);
        }
      })
      .catch(err => console.error("Init error:", err))
      .finally(() => setInitLoading(false));
  }, []);

  // Fetch Listings (products read data with pagination)
  const fetchListings = useCallback((targetPage?: number) => {
    setListingsLoading(true);
    const pageToFetch = targetPage ?? 1;
    const params: any = {
      search: filters.search,
      category: filters.category,
      gender: filters.gender,
      condition: filters.condition,
      min_price: filters.min_price,
      max_price: filters.max_price,
      free_only: filters.free_only ? "1" : undefined,
      sort: filters.sort,
      page: pageToFetch,
      per_page: 12,
    };
    
    // Arrays
    if (filters.cities.length > 0) params['cities'] = filters.cities;
    if (filters.mode.length > 0) params['mode'] = filters.mode;
    if (filters.age_range.length > 0) params['age_range'] = filters.age_range;
    if (filters.sizes.length > 0) params['sizes'] = filters.sizes;

    api.get(route('marketplace.listings', params).toString())
      .then(res => {
        if (res.data.status === "success") {
          const responseData = res.data.data;
          const productsArray = responseData?.data || (Array.isArray(responseData) ? responseData : []);
          setProducts(Array.isArray(productsArray) ? productsArray : []);

          if (responseData && responseData.meta) {
            setPagination({
              currentPage: responseData.meta.current_page || 1,
              lastPage: responseData.meta.last_page || 1,
              perPage: responseData.meta.per_page || 12,
              total: responseData.meta.total || 0,
              from: responseData.meta.from || 0,
              to: responseData.meta.to || 0,
            });
          } else {
            setPagination({
              currentPage: 1,
              lastPage: 1,
              perPage: productsArray.length,
              total: productsArray.length,
              from: productsArray.length > 0 ? 1 : 0,
              to: productsArray.length,
            });
          }
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
    fetchListings(1);
  }, [fetchListings]);

  // Handlers
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
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
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.lastPage || newPage === pagination.currentPage) return;
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    fetchListings(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const getImageUrl = (media: any) => {
    if (!media) return null;
    if (media.url && media.url.startsWith('http')) return media.url;
    const baseUrl = import.meta.env.VITE_API_URL || "";
    return `${baseUrl}/storage/${media.file_path.replace("public/", "")}`;
  };

  return (
    <div className="marketplace-page" style={{ 
      display: 'flex', 
      backgroundColor: colors.bgPrimary, 
      minHeight: '100vh',
      fontFamily: 'var(--font-official)'
    }}>
      {/* --- Sidebar with Selects from initData --- */}
      <Sidebar 
        initData={initData}
        filters={filters}
        onFilterChange={handleFilterChange}
        onToggleArrayFilter={handleToggleArrayFilter}
        onReset={handleReset}
        onApply={() => fetchListings(1)}
        resultsCount={pagination.total}
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
          borderBottom: `1px solid ${colors.sidebarBorder || colors.border}`,
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: colors.textPrimary, margin: 0 }}>Marketplace</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '260px' }}>
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

              <div style={{ width: '180px' }}>
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

              <div style={{ width: '170px' }}>
                <CustomSelect 
                  options={initData?.sortOptions || []}
                  value={filters.sort}
                  onChange={(val) => handleFilterChange('sort', val)}
                  placeholder="Trier par"
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
        <div style={{ padding: '30px 40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {loading || listingsLoading || initLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', flex: 1, minHeight: '420px' }}>
              <LoadingScreen
                isLoading={true}
                variant="spinner"
                label={initLoading ? "Chargement du marché…" : listingsLoading ? "Chargement des annonces…" : "Chargement…"}
              />
            </div>
          ) : products.length > 0 ? (
            <>
              <div
                className="marketplace-listings-grid"
                style={{
                  display: filters.view === 'grid' ? 'grid' : 'flex',
                  flexDirection: filters.view === 'list' ? 'column' : undefined,
                  gridTemplateColumns: filters.view === 'grid' ? 'repeat(4, minmax(0, 1fr))' : undefined,
                  gap: filters.view === 'grid' ? '24px' : '20px',
                  flex: 1,
                }}
              >
                {products.map(product => (
                  <MarketplaceCard key={product.id} product={product} view={filters.view} getImageUrl={getImageUrl} colors={colors} />
                ))}
              </div>

              {/* --- Pagination Bar --- */}
              <div style={{
                marginTop: '40px',
                paddingTop: '20px',
                borderTop: `1px solid ${colors.sidebarBorder || colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '15px'
              }}>
                <div style={{ fontSize: '14px', color: colors.textSecondary, fontWeight: '500' }}>
                  Affichage de {pagination.from} à {pagination.to} sur {pagination.total} annonces
                </div>

                {pagination.lastPage > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: `1px solid ${colors.border}`,
                        backgroundColor: colors.bgSecondary,
                        color: pagination.currentPage === 1 ? colors.textMuted : colors.textPrimary,
                        cursor: pagination.currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '13px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <ChevronLeft size={16} style={{ marginRight: '4px' }} /> Précédent
                    </button>

                    {Array.from({ length: pagination.lastPage }, (_, i) => i + 1)
                      .filter(page => page === 1 || page === pagination.lastPage || Math.abs(page - pagination.currentPage) <= 1)
                      .reduce((acc: (number | string)[], page, index, array) => {
                        if (index > 0 && page - (array[index - 1] as number) > 1) {
                          acc.push('...');
                        }
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((item, index) => {
                        if (typeof item === 'string') {
                          return (
                            <span key={`ellipsis-${index}`} style={{ padding: '0 4px', color: colors.textMuted }}>
                              ...
                            </span>
                          );
                        }
                        const isSelected = item === pagination.currentPage;
                        return (
                          <button
                            key={item}
                            onClick={() => handlePageChange(item)}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              border: isSelected ? 'none' : `1px solid ${colors.border}`,
                              backgroundColor: isSelected ? colors.coral : colors.bgSecondary,
                              color: isSelected ? colors.bgSecondary : colors.textPrimary,
                              cursor: 'pointer',
                              fontWeight: isSelected ? '700' : '500',
                              fontSize: '14px',
                              transition: 'all 0.2s'
                            }}
                          >
                            {item}
                          </button>
                        );
                      })}

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.lastPage}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: `1px solid ${colors.border}`,
                        backgroundColor: colors.bgSecondary,
                        color: pagination.currentPage === pagination.lastPage ? colors.textMuted : colors.textPrimary,
                        cursor: pagination.currentPage === pagination.lastPage ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '13px',
                        transition: 'all 0.2s'
                      }}
                    >
                      Suivant <ChevronRight size={16} style={{ marginLeft: '4px' }} />
                    </button>
                  </div>
                )}
              </div>
            </>
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
