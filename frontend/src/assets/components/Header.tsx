import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Heart, Store, ChatCircleText, SignOut, User, List, CaretDown } from "@phosphor-icons/react";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import route from "../../utils/route";
import "../../css/header.css";

interface UserData {
  id: number;
  name?: string;
  user_name?: string;
  email?: string;
  user_email?: string;
  avatar?: string;
  avatar_url?: string;
}

function Header() {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [user, setUser] = useState<UserData | null>(null);

  const displayName = user?.name || user?.user_name || "";
  const displayEmail = user?.email || user?.user_email || "";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
   
      const token = localStorage.getItem('token');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };
    
    checkAuth();

    
    // Listen for storage changes (login/logout across tabs)
    window.addEventListener('storage', checkAuth);
    // Listen for auth changes in same tab
    window.addEventListener('auth-change', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    }
  }, []);

  useEffect(()=> {
      console.log('user' , user)
  },[user])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.post(route('logout').toString());
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      setUser(null);
      setDropdownOpen(false);
      window.dispatchEvent(new Event('auth-change'));
      navigate('/');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    return name.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    if (!name) return colors.primary;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 65%, 45%)`; // Persistent color based on name
  };

  return (
    <header className="header" style={{ backgroundColor: colors.bgSecondary }}>
      <div className="top_navbar" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div className="brand">
          <Link to="/" className="brand_logo" style={{ color: colors.textPrimary }}>
            Donate&Sell<Leaf size={24} weight="BoldDuotone" style={{ marginLeft: '8px', color: colors.primary }} />
          </Link>
        </div>

        <nav className="main_links" aria-label="Main navigation">
          <Link to="/" style={{ color: colors.textSecondary }}>Home</Link>
          <Link to="/announcements" style={{ color: colors.textSecondary }}>Marketplace</Link>
          <Link to="/our_partners" style={{ color: colors.textSecondary }}>Our Partners</Link>
          <Link to="/faq" style={{ color: colors.textSecondary }}>FAQ</Link>
          <Link to="/faq_chatbot" style={{ color: colors.textSecondary }}>FAQ Chatbot</Link>
        </nav>

        <div className="nav_actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <>
              <Link 
                to="/add_announcement" 
                className="post_btn"
                style={{
                  padding: '10px 16px',
                  backgroundColor: colors.primary,
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                + Publish
              </Link>

              {/* Avatar Dropdown */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    backgroundColor: colors.bgTertiary,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {user.avatar || user.avatar_url ? (
                    <img
                      src={user.avatar || user.avatar_url}
                      alt={displayName}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: getAvatarColor(displayName),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      {getInitials(displayName)}
                    </div>
                  )}
                  <span style={{ 
                    color: colors.textPrimary, 
                    fontSize: '14px', 
                    fontWeight: '600',
                    maxWidth: '100px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {displayName}
                  </span>
                  <CaretDown size={16} color={colors.textSecondary} style={{ 
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    backgroundColor: colors.bgSecondary,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    minWidth: '200px',
                    zIndex: 1000,
                    overflow: 'hidden',
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.border}` }}>
                      <p style={{ margin: 0, fontWeight: '600', color: colors.textPrimary, fontSize: '14px' }}>
                        {displayName}
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: colors.textMuted }}>
                        {displayEmail}
                      </p>
                    </div>

                    <Link
                      to="/favorites"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: colors.textPrimary,
                        textDecoration: 'none',
                        fontSize: '14px',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bgTertiary)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Heart size={20} color={colors.primary} />
                      Favorites
                    </Link>

                    <Link
                      to="/my-listings"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: colors.textPrimary,
                        textDecoration: 'none',
                        fontSize: '14px',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bgTertiary)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <List size={20} color={colors.primary} />
                      My Listings
                    </Link>

                    <Link
                      to="/chat"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: colors.textPrimary,
                        textDecoration: 'none',
                        fontSize: '14px',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bgTertiary)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <ChatCircleText size={20} color={colors.primary} />
                      Messages
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: colors.textPrimary,
                        textDecoration: 'none',
                        fontSize: '14px',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bgTertiary)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <User size={20} color={colors.primary} />
                      Profile
                    </Link>

                    <div style={{ borderTop: `1px solid ${colors.border}` }}>
                      <button
                        onClick={handleLogout}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          width: '100%',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: colors.error || '#dc2626',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bgTertiary)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <SignOut size={20} />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="login_btn"
                style={{
                  padding: '10px 20px',
                  color: colors.textPrimary,
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                Log In
              </Link>
              <Link 
                to="/sign_up" 
                style={{
                  padding: '10px 20px',
                  backgroundColor: colors.primary,
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                Join Us
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
