import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import route from "../../../utils/route";
import { 
  FileEdit as Edit3, 
  Trash, 
  Eye, 
  Heart,
  Plus
} from "lucide-react";
import {
  Box as Package
} from "@solar-icons/react";
import "../../../css/records.css";
import { Product, ApiResponse } from "./announcement/types";
import { useTheme } from "../../../context/ThemeContext";

const My_Announcements: React.FC = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'sell' | 'donate'>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const getImageUrl = (media: any) => {
    if (!media) return null;
    if (media.url && media.url.startsWith('http')) return media.url;
    return `http://127.0.0.1:8000/storage/${media.file_path.replace("public/", "")}`;
  };

  useEffect(() => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    axios.get(route('user.announcements', { userId: user.id }).toString())
      .then((res) => {
        if (res.data.status === "success") {
          const productsArray = res.data.products?.data || res.data.products;
          setProducts(Array.isArray(productsArray) ? productsArray : []);
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
        const res = await axios.delete(route('announcements.destroy', { id }).toString());
        if (res.data.status === "success") {
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
    <main className="my-announcements" style={{ backgroundColor: colors.bgPrimary, minHeight: '100vh', padding: '20px' }}>
      <div className="records-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div className="header-left">
          <h2 style={{ color: colors.textPrimary }}>My Announcements</h2>
          <p className="subtitle" style={{ color: colors.textSecondary }}>Manage your items for sale and donation</p>
        </div>

        <div className="return-right">
          <Link to="/add_announcement" className="post_btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', backgroundColor: colors.primary, color: colors.bgSecondary, textDecoration: 'none' }}>
            <Plus size={18} strokeWidth={2} />
            Post New Item
          </Link>
        </div>
      </div>

      <div className="filter-bar" style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', backgroundColor: colors.bgTertiary, borderRadius: '12px' }}>
        <div className="filter-group">
          <label style={{ fontSize: '14px', fontWeight: '600', color: colors.textSecondary, marginBottom: '5px', display: 'block' }}>Listing Type</label>
          <select 
            className="status-filter" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${colors.border}`, backgroundColor: colors.bgSecondary, color: colors.textPrimary }}
          >
            <option value="all">All Items</option>
            <option value="sell">For Sale</option>
            <option value="donate">For Donation</option>
          </select>
        </div>

        <div className="filter-group">
          <label style={{ fontSize: '14px', fontWeight: '600', color: colors.textSecondary, marginBottom: '5px', display: 'block' }}>Status</label>
          <select 
            className="status-filter" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${colors.border}`, backgroundColor: colors.bgSecondary, color: colors.textPrimary }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="donated">Donated</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>
      </div>

      <div className="table-container" style={{ backgroundColor: colors.bgSecondary, borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textSecondary }}>Loading your announcements...</div>
        ) : filteredProducts.length > 0 ? (
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, fontSize: '13px' }}>
                <th style={{ padding: '12px' }}>Product</th>
                <th style={{ padding: '12px' }}>Type</th>
                <th style={{ padding: '12px' }}>Price</th>
                <th style={{ padding: '12px' }}>Stats</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
                    <div className="product-img-wrapper">
                      {p.thumbnail ? (
                        <img 
                          src={getImageUrl(p.thumbnail) || ""} 
                          alt={p.title} 
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      ) : (
                        <div style={{ width: '60px', height: '60px', backgroundColor: colors.bgTertiary, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                          <Package size={24} color={colors.textMuted} weight="BoldDuotone" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: colors.textPrimary }}>{p.title}</div>
                      <div style={{ fontSize: '12px', color: colors.textSecondary }}>{p.condition}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`pill ${p.listing_mode}`} style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      backgroundColor: p.listing_mode === 'sell' ? colors.successLight + '33' : colors.warningLight + '33',
                      color: p.listing_mode === 'sell' ? colors.success : colors.warning
                    }}>
                      {p.listing_mode === 'sell' ? 'Selling' : 'Donating'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {p.listing_mode === 'sell' ? (
                      <span style={{ fontWeight: '700', color: colors.textPrimary }}>{p.price} {p.currency}</span>
                    ) : (
                      <span style={{ color: colors.textMuted }}>Free</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', color: colors.textSecondary, fontSize: '13px' }}>
                      <span title="Views" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={14} strokeWidth={2} /> {p.views_count}</span>
                      <span title="Favorites" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Heart size={14} strokeWidth={2} /> {p.favorites_count}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`status-tag ${p.status}`} style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      textTransform: 'capitalize',
                      backgroundColor: p.status === 'active' ? colors.infoBg : colors.bgTertiary,
                      color: p.status === 'active' ? colors.infoText : colors.textSecondary
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: colors.textSecondary, padding: '12px' }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => navigate(`/product/${p.id}`)}
                        className="action-btn"
                        title="View details"
                        style={{ padding: '6px', border: `1px solid ${colors.border}`, borderRadius: '6px', backgroundColor: colors.bgSecondary, cursor: 'pointer' }}
                      >
                        <Eye size={16} color={colors.textSecondary} strokeWidth={2} />
                      </button>
                      <button 
                        className="action-btn"
                        title="Edit listing"
                        style={{ padding: '6px', border: `1px solid ${colors.border}`, borderRadius: '6px', backgroundColor: colors.bgSecondary, cursor: 'pointer' }}
                      >
                        <Edit3 size={16} color={colors.textSecondary} strokeWidth={2} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="action-btn delete"
                        title="Delete listing"
                        style={{ padding: '6px', border: `1px solid ${colors.danger}33`, borderRadius: '6px', backgroundColor: colors.danger + '11', cursor: 'pointer' }}
                      >
                        <Trash size={16} color={colors.danger} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: colors.bgTertiary, borderRadius: '12px', border: `2px dashed ${colors.border}` }}>
            <Package size={48} color={colors.textMuted} style={{ marginBottom: '16px' }} weight="BoldDuotone" />
            <h3 style={{ color: colors.textPrimary, marginBottom: '8px' }}>No announcements found</h3>
            <p style={{ color: colors.textSecondary, marginBottom: '24px' }}>You haven't posted any items yet. Start sharing today!</p>
            <Link to="/add_announcement" className="post_btn" style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: colors.primary, color: colors.bgSecondary, textDecoration: 'none' }}>
              Publish your first announcement
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default My_Announcements;
