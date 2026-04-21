import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  Heart, 
  ShoppingBag,
  Gift
} from "lucide-react";
import "../../css/home.css"; 
import { Product, ApiResponse } from "./User/announcement/types";

const Marketplace: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [modeFilter, setModeFilter] = useState<'all' | 'sell' | 'donate'>("all");
  
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/announcements")
      .then((res) => res.json())
      .then((data: any) => {
        console.log("Marketplace data:", data);
        if (data.status === "success") {
          // Check if data is wrapped in 'products' or 'products.data'
          const productsArray = data.products?.data || data.products;
          setProducts(Array.isArray(productsArray) ? productsArray : []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch marketplace error:", err);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (p.description?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesMode = modeFilter === "all" || p.listing_mode === modeFilter;
    return matchesSearch && matchesMode;
  });

  const getImageUrl = (path: string | undefined, url: string | undefined) => {
    if (url && url.startsWith('http')) return url;
    if (!path) return null;
    return `http://127.0.0.1:8000/storage/${path.replace("public/", "")}`;
  };

  return (
    <div className="marketplace-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header & Search */}
      <div className="marketplace-header" style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '10px' }}>Kids Marketplace</h1>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>Discover the best pre-loved items for your little ones.</p>
        
        <div className="search-and-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
          <div className="search-wrapper" style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
            <input 
              type="text" 
              placeholder="Search for toys, clothes, shoes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px 12px 12px 45px', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb',
                fontSize: '16px',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            />
          </div>
          
          <div className="filter-chips" style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setModeFilter("all")}
              style={{ 
                padding: '8px 16px', 
                borderRadius: '20px', 
                border: '1px solid #e5e7eb',
                backgroundColor: modeFilter === "all" ? '#4f46e5' : 'white',
                color: modeFilter === "all" ? 'white' : '#4b5563',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              All
            </button>
            <button 
              onClick={() => setModeFilter("sell")}
              style={{ 
                padding: '8px 16px', 
                borderRadius: '20px', 
                border: '1px solid #e5e7eb',
                backgroundColor: modeFilter === "sell" ? '#4f46e5' : 'white',
                color: modeFilter === "sell" ? 'white' : '#4b5563',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ShoppingBag size={16} />
              Buy
            </button>
            <button 
              onClick={() => setModeFilter("donate")}
              style={{ 
                padding: '8px 16px', 
                borderRadius: '20px', 
                border: '1px solid #e5e7eb',
                backgroundColor: modeFilter === "donate" ? '#4f46e5' : 'white',
                color: modeFilter === "donate" ? 'white' : '#4b5563',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Gift size={16} />
              Free / Donate
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '20px', color: '#6b7280' }}>Loading amazing deals...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="products-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
          gap: '25px' 
        }}>
          {filteredProducts.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id} className="product-card" style={{ 
              textDecoration: 'none', 
              color: 'inherit',
              backgroundColor: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
              transition: 'transform 0.2s, boxShadow 0.2s',
              position: 'relative'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
            }}
            >
              {/* Image Container */}
              <div className="card-image-wrapper" style={{ position: 'relative', height: '220px', backgroundColor: '#f3f4f6' }}>
                {product.thumbnail ? (
                  <img 
                    src={getImageUrl(product.thumbnail.file_path, product.thumbnail.url) || ""} 
                    alt={product.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <ShoppingBag size={48} color="#d1d5db" />
                  </div>
                )}
                
                {/* Badge for Mode */}
                <div style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  left: '12px',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  backgroundColor: product.listing_mode === 'sell' ? '#4f46e5' : '#10b981',
                  color: 'white'
                }}>
                  {product.listing_mode === 'sell' ? 'For Sale' : 'Free'}
                </div>
                
                {/* Favorite Button */}
                <button 
                  className="fav-btn" 
                  style={{ 
                    position: 'absolute', 
                    top: '12px', 
                    right: '12px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    // Favorite logic
                  }}
                >
                  <Heart size={18} color="#ef4444" />
                </button>
              </div>

              {/* Content */}
              <div className="card-content" style={{ padding: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>
                  <MapPin size={12} />
                  <span>{product.pickup_address || 'Agadir, Morocco'}</span>
                </div>
                
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {product.title}
                </h3>
                
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: '#f3f4f6', borderRadius: '4px', color: '#4b5563' }}>{product.condition}</span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: '#f3f4f6', borderRadius: '4px', color: '#4b5563' }}>{product.age_range}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                  <div className="price" style={{ fontSize: '20px', fontWeight: '800', color: '#111827' }}>
                    {product.listing_mode === 'sell' ? `${product.price} ${product.currency}` : 'FREE'}
                  </div>
                  <div className="user-avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#e5e7eb', overflow: 'hidden' }}>
                    {product.user?.avatar ? (
                      <img src={product.user.avatar} alt="" style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '10px', color: '#9ca3af' }}>
                        {product.user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '100px 20px', backgroundColor: '#f9fafb', borderRadius: '24px' }}>
          <ShoppingBag size={64} color="#d1d5db" style={{ marginBottom: '20px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#374151', marginBottom: '10px' }}>No items found</h2>
          <p style={{ color: '#6b7280', marginBottom: '30px' }}>Try adjusting your search or filters to find what you're looking for.</p>
          <button 
            onClick={() => { setSearchTerm(""); setModeFilter("all"); }}
            style={{ 
              padding: '12px 30px', 
              backgroundColor: '#4f46e5', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: '700', 
              cursor: 'pointer' 
            }}
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

export default Marketplace;
