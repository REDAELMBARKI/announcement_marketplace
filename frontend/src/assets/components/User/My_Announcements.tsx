import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Package, 
  Edit3, 
  Trash2, 
  Eye, 
  Heart,
  PlusCircle
} from "lucide-react";
import "../../../css/records.css";
import { Product, ApiResponse } from "./announcement/types";

const My_Announcements: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'sell' | 'donate'>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const getImageUrl = (media: any) => {
    if (!media) return null;
    if (media.url && media.url.startsWith('http')) return media.url;
    return `http://localhost:8000/storage/${media.file_path.replace("public/", "")}`;
  };

  useEffect(() => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    fetch(`http://localhost:8000/api/user/announcements/${user.id}`)
      .then((res) => res.json())
      .then((data: ApiResponse<{ products: Product[] }>) => {
        if (data.status === "success" && data.products) {
          setProducts(data.products);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch announcements error:", err);
        setLoading(false);
      });
  }, [user.id, navigate]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/announcements/${id}`, {
          method: "DELETE",
        });
        const result: ApiResponse<any> = await response.json();
        if (result.status === "success") {
          setProducts(products.filter((p) => p.id !== id));
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesMode = filter === "all" || p.listing_mode === filter;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesMode && matchesStatus;
  });

  return (
    <main className="my-announcements">
      <div className="records-container">
        <div className="header-left">
          <h2>My Announcements</h2>
          <p className="subtitle">Manage your items for sale and donation</p>
        </div>

        <div className="return-right">
          <Link to="/add_announcement" className="post_btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', backgroundColor: '#4f46e5', color: 'white', textDecoration: 'none' }}>
            <PlusCircle size={18} />
            Post New Item
          </Link>
        </div>
      </div>

      <div className="filter-bar" style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
        <div className="filter-group">
          <label style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', marginBottom: '5px', display: 'block' }}>Listing Type</label>
          <select 
            className="status-filter" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
          >
            <option value="all">All Items</option>
            <option value="sell">For Sale</option>
            <option value="donate">For Donation</option>
          </select>
        </div>

        <div className="filter-group">
          <label style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', marginBottom: '5px', display: 'block' }}>Status</label>
          <select 
            className="status-filter" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="donated">Donated</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading your announcements...</div>
        ) : filteredProducts.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Price</th>
                <th>Stats</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="product-img-wrapper">
                      {p.thumbnail ? (
                        <img 
                          src={getImageUrl(p.thumbnail) || ""} 
                          alt={p.title} 
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      ) : (
                        <div style={{ width: '60px', height: '60px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                          <Package size={24} color="#9ca3af" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>{p.title}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{p.condition}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`pill ${p.listing_mode}`} style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      backgroundColor: p.listing_mode === 'sell' ? '#dcfce7' : '#fef9c3',
                      color: p.listing_mode === 'sell' ? '#166534' : '#854d0e'
                    }}>
                      {p.listing_mode === 'sell' ? 'Selling' : 'Donating'}
                    </span>
                  </td>
                  <td>
                    {p.listing_mode === 'sell' ? (
                      <span style={{ fontWeight: '700', color: '#111827' }}>{p.price} {p.currency}</span>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>Free</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '12px', color: '#6b7280', fontSize: '13px' }}>
                      <span title="Views" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={14} /> {p.views_count}</span>
                      <span title="Favorites" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Heart size={14} /> {p.favorites_count}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-tag ${p.status}`} style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      textTransform: 'capitalize',
                      backgroundColor: p.status === 'active' ? '#e0f2fe' : '#f3f4f6',
                      color: p.status === 'active' ? '#0369a1' : '#4b5563'
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: '#6b7280' }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => navigate(`/product/${p.id}`)}
                        className="action-btn"
                        title="View details"
                        style={{ padding: '6px', border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer' }}
                      >
                        <Eye size={16} color="#4b5563" />
                      </button>
                      <button 
                        className="action-btn"
                        title="Edit listing"
                        style={{ padding: '6px', border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer' }}
                      >
                        <Edit3 size={16} color="#4b5563" />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="action-btn delete"
                        title="Delete listing"
                        style={{ padding: '6px', border: '1px solid #fee2e2', borderRadius: '6px', backgroundColor: '#fef2f2', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} color="#dc2626" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '2px dashed #e5e7eb' }}>
            <Package size={48} color="#9ca3af" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: '#374151', marginBottom: '8px' }}>No announcements found</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>You haven't posted any items yet. Start sharing today!</p>
            <Link to="/add_announcement" className="post_btn" style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: '#4f46e5', color: 'white', textDecoration: 'none' }}>
              Publish your first announcement
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default My_Announcements;
