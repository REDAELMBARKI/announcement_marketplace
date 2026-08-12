import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Heart, ChatCircleText, SignOut, User, List, CaretDown, X, MagnifyingGlass } from "@phosphor-icons/react";
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

const APP_NAME = import.meta.env.VITE_APP_NAME || "Let's be us";

interface HeaderProps {
  transparentOnHero?: boolean;
}

function Header({ transparentOnHero = false }: HeaderProps) {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [user, setUser] = useState<UserData | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const displayName = user?.name || user?.user_name || "";
  const displayEmail = user?.email || user?.user_email || "";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!transparentOnHero) {
      setScrolled(true);
      return;
    }
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparentOnHero]);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!storedUser || !token) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('role_name');
          localStorage.removeItem('claims');
          localStorage.removeItem('admin');
          setUser(null);
          return;
        }

        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && parsed.id) {
            setUser(parsed);
          } else {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('role_name');
            localStorage.removeItem('claims');
            localStorage.removeItem('admin');
            setUser(null);
          }
        } catch {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('role_name');
          localStorage.removeItem('claims');
          localStorage.removeItem('admin');
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('auth-change', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    }
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const closeMenuOnResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", closeMenuOnResize);
    return () => window.removeEventListener("resize", closeMenuOnResize);
  }, []);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

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
    return `hsl(${h}, 65%, 45%)`;
  };

  const isTransparent = transparentOnHero && !scrolled;
  const headerClasses = [
    'header',
    transparentOnHero ? 'header-hero-overlay' : '',
    scrolled ? 'scrolled' : ''
  ].filter(Boolean).join(' ');

  const textColorLight = isTransparent ? '#ffffff' : colors.textPrimary;
  const textColorMuted = isTransparent ? 'rgba(255,255,255,0.85)' : colors.textSecondary;
  const headerBg = isTransparent ? 'transparent' : colors.bgSecondary;
  const borderColor = isTransparent ? 'transparent' : colors.border;
  const searchBg = isTransparent ? 'rgba(255,255,255,0.1)' : colors.bgTertiary;
  const searchBorder = isTransparent ? 'rgba(255,255,255,0.2)' : colors.border;

  return (
    <header
      className={headerClasses}
      style={{
        backgroundColor: headerBg,
        borderBottom: `1px solid ${borderColor}`,
        color: textColorLight,
      }}
    >
      <div className="top_navbar magnific-navbar">
        <div className="magnific-brand">
          <Link to="/" className="magnific-logo" style={{ color: textColorLight }}>
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" style={{ marginRight: '10px' }}>
              <path d="M4 10 L12 26 L20 10 L28 26 L36 10" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="4" cy="30" r="3" fill="currentColor"/>
              <circle cx="20" cy="30" r="3" fill="currentColor"/>
              <circle cx="36" cy="30" r="3" fill="currentColor"/>
            </svg>
            <span style={{ fontWeight: 700, fontSize: '22px', letterSpacing: '-0.5px' }}>{APP_NAME}</span>
          </Link>

          <nav className="magnific-nav-links">
            <Link to="/" onClick={handleNavClick} style={{ color: textColorLight }}>Home</Link>
            <Link to="/announcements" onClick={handleNavClick} style={{ color: textColorLight }}>Marketplace</Link>
            <Link to="/our_partners" onClick={handleNavClick} style={{ color: textColorLight }}>Our Partners</Link>
            <Link to="/faq" onClick={handleNavClick} style={{ color: textColorLight }}>FAQ</Link>
            <Link to="/faq_chatbot" onClick={handleNavClick} style={{ color: textColorLight }}>Chatbot</Link>
          </nav>
        </div>

        <div className="magnific-right-section">
          <div className="magnific-search" style={{
            backgroundColor: searchBg, border: `1px solid ${searchBorder}`}}>
            <MagnifyingGlass size={18} style={{ color: textColorMuted }} weight="bold" />
            <input
              type="text"
              placeholder="Search or create"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: textColorLight,
                fontSize: '15px',
                width: '100%',
              }}
            />
          </div>

          <button
            type="button"
            className="mobile_menu_toggle magnific-mobile-toggle md:!hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="main-navigation"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileMenuOpen((open) => !open)}
            style={{
              color: textColorLight,
              borderColor: searchBorder,
              backgroundColor: searchBg,
            }}
          >
            {mobileMenuOpen ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
          </button>

          <nav
            id="main-navigation"
            className={`main_links ${mobileMenuOpen ? "mobile-menu-open" : ""} magnific-mobile-nav`}
            aria-label="Main navigation"
          >
            <Link to="/" onClick={handleNavClick} style={{ color: colors.textSecondary }}>Home</Link>
            <Link to="/announcements" onClick={handleNavClick} style={{ color: colors.textSecondary }}>Marketplace</Link>
            <Link to="/our_partners" onClick={handleNavClick} style={{ color: colors.textSecondary }}>Our Partners</Link>
            <Link to="/faq" onClick={handleNavClick} style={{ color: colors.textSecondary }}>FAQ</Link>
            {!user && (
              <>
                <Link to="/login" className="mobile-auth-link" onClick={handleNavClick} style={{ color: colors.textSecondary }}>Log In</Link>
                <Link
                  to="/sign_up"
                  className="mobile-auth-link mobile-auth-link--primary"
                  onClick={handleNavClick}
                  style={{ color: "white", backgroundColor: colors.primary }}
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>

          <div className="magnific-auth-actions">
            {user ? (
              <>
                <Link
                  to="/add_announcement"
                  className="magnific-signup-btn"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                  }}
                >
                  + Publish
                </Link>

                <div ref={dropdownRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      backgroundColor: searchBg,
                      border: `1px solid ${searchBorder}`,
                      borderRadius: '999px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {user.avatar || user.avatar_url ? (
                      <img
                        src={user.avatar || user.avatar_url}
                        alt={displayName}
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '30px',
                        height: '30px',
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
                      color: textColorLight,
                      fontSize: '14px',
                      fontWeight: '600',
                      maxWidth: '100px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {displayName}
                    </span>
                    <CaretDown size={16} color={textColorMuted} style={{
                      transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }} />
                  </button>

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
                        to="/favorites" onClick={handleNavClick}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: colors.textPrimary, textDecoration: 'none', fontSize: '14px', transition: 'background-color 0.2s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bgTertiary)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Heart size={20} color={colors.primary} /> Favorites
                      </Link>
                      <Link
                        to="/my-listings" onClick={handleNavClick}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: colors.textPrimary, textDecoration: 'none', fontSize: '14px', transition: 'background-color 0.2s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bgTertiary)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <List size={20} color={colors.primary} /> My Listings
                      </Link>
                      <Link
                        to="/chat" onClick={handleNavClick}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: colors.textPrimary, textDecoration: 'none', fontSize: '14px', transition: 'background-color 0.2s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bgTertiary)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <ChatCircleText size={20} color={colors.primary} /> Messages
                      </Link>
                      <Link
                        to="/profile" onClick={handleNavClick}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: colors.textPrimary, textDecoration: 'none', fontSize: '14px', transition: 'background-color 0.2s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bgTertiary)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <User size={20} color={colors.primary} /> Profile
                      </Link>
                      <div style={{ borderTop: `1px solid ${colors.border}` }}>
                        <button
                          onClick={handleLogout}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                            width: '100%', border: 'none', backgroundColor: 'transparent',
                            color: colors.error || '#dc2626', fontSize: '14px', cursor: 'pointer',
                            transition: 'background-color 0.2s', textAlign: 'left',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bgTertiary)}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <SignOut size={20} /> Log Out
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
                  className="magnific-login-btn"
                  onClick={handleNavClick}
                  style={{ color: textColorLight }}
                >
                  Log in
                </Link>
                <Link
                  to="/sign_up"
                  className="magnific-signup-btn"
                  onClick={handleNavClick}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                  }}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
