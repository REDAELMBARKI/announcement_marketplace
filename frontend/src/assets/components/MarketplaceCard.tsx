import React, { memo, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  Heart
} from "lucide-react";
import { MapPoint as MapPin, ChatLine } from "@solar-icons/react";
import { useTheme } from '../../context/ThemeContext';
import { Product } from "./User/announcement/types";
import AppButton from './Common/AppButton';

interface MarketplaceCardProps {
  product: Product;
  view: 'grid' | 'list';
  getImageUrl: (m: any) => string | null;
  colors: any;
  tileIndex?: number;
}

const APP_LOCALE = (import.meta.env.VITE_APP_LOCALE || 'fr-FR').replace('_', '-');
const LOCALE_SHORT = APP_LOCALE.split('-')[0] || 'fr';

// Project convention pastel palette (#F4DED3, #DCE9DE, #D9E4EC, #F5E4D3)
const PASTEL_TILES = [
  '--cardPastelPeach',
  '--cardPastelMint',
  '--cardPastelBlue',
  '--cardPastelCream',
] as const;

const tileBg = (idx: number | undefined): string => {
  const i = typeof idx === 'number' ? Math.max(0, idx) : 0;
  return `var(${PASTEL_TILES[i % PASTEL_TILES.length]})`;
};

// Relative timestamp formatter (graceful fallback for older browsers)
const formatRelativeTime = (iso: string): string => {
  try {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';
    const diffMs = then - Date.now();
    const rtf = new (Intl as any).RelativeTimeFormat(LOCALE_SHORT, { numeric: 'auto' });
    const abs = Math.abs(diffMs);
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    if (abs < minute) return rtf.format(Math.round(diffMs / 1000), 'second');
    if (abs < hour) return rtf.format(Math.round(diffMs / minute), 'minute');
    if (abs < day) return rtf.format(Math.round(diffMs / hour), 'hour');
    if (abs < week) return rtf.format(Math.round(diffMs / day), 'day');
    if (abs < 31 * day) return rtf.format(Math.round(diffMs / week), 'week');
    return new Date(iso).toLocaleDateString(LOCALE_SHORT, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
};

// Format location/city line from whatever data we actually have
const formatLocation = (product: Product): string | null => {
  const addr = (product as any).city?.name
    || (product as any).city_name
    || product.pickup_address
    || (product as any).location;
  if (!addr) return null;
  const clean = String(addr).trim();
  if (!clean) return null;
  // Show only first 1-2 comma-delimited parts, drop postal noise
  const parts = clean.split(',').map((s) => s.trim()).filter(Boolean);
  return parts.slice(0, 2).join(', ');
};

export const cardInlineStyles = (colors: any, tileIndex?: number) => ({
  '--tileBg': tileBg(tileIndex),
  '--coral': colors.coral as string,
  '--coralHover': colors.coralHover as string,
  '--coralContrast': colors.coralContrast as string,
  '--success': colors.success as string,
  '--successContrast': colors.successContrast as string,
  '--primary': colors.primary as string,
  '--primaryContrast': colors.primaryContrast as string,
  '--textPrimary': colors.textPrimary as string,
  '--textSecondary': colors.textSecondary as string,
  '--textMuted': colors.textMuted as string,
  '--bgPrimary': colors.bgPrimary as string,
  '--bgSecondary': colors.bgSecondary as string,
  '--bgTertiary': colors.bgTertiary as string,
  '--border': colors.border as string,
  '--cardBorder': colors.cardBorder as string,
  '--focusRing': colors.focusRing as string,
  '--mouse-x': '50%' as any,
  '--mouse-y': '50%' as any,
} as React.CSSProperties);

const MarketplaceCardInner: React.FC<MarketplaceCardProps> = ({ product, view, getImageUrl, colors, tileIndex }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(product.is_favorited || false);
  const [imgErrored, setImgErrored] = useState<Record<number, boolean>>({});

  const gallery = product.gallery || [];
  const allImages = useMemo(() => {
    const raw = [
      ...(product.thumbnail ? [getImageUrl(product.thumbnail)] : []),
      ...gallery.map(img => getImageUrl(img)),
    ].filter(Boolean) as string[];
    return raw;
  }, [product.thumbnail, gallery, getImageUrl]);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (allImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };
  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (allImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = !isFavorited;
    setIsFavorited(newStatus);
    api.post(`/api/announcements/${product.slug}/favorite`, { favorite: newStatus })
      .catch(() => setIsFavorited(!newStatus));
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  const getAvatarColor = (name: string) => {
    if (!name) return colors.primary;
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 55%, 58%)`;
  };

  const sellerName = product.user?.name || 'Membre';
  const avatarBg = getAvatarColor(sellerName);
  const avatarInitials = getInitials(sellerName);
  const relativeTime = formatRelativeTime(product.created_at);
  const locationLine = formatLocation(product);
  const isSell = product.listing_mode !== 'donate';
  const modeLabel = isSell ? 'À VENDRE' : 'GRATUIT';
  const price = isSell
    ? (Number.isFinite(Number(product.price)) ? `${Math.floor(Number(product.price))} ${product.currency || 'MAD'}` : 'Prix libre')
    : 'GRATUIT';

  const detailLink = `/announcements/${product.slug}`;

  if (view === 'list') {
    return (
      <Link
        to={detailLink}
        className="mc-list-link"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          ...cardInlineStyles(colors, tileIndex),
          display: 'flex',
          backgroundColor: 'var(--tileBg)',
          border: '1px solid var(--cardBorder)',
          textDecoration: 'none',
          color: 'inherit',
          transition: 'border-color 180ms ease, transform 180ms ease',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 0,
          boxShadow: 'none',
        }}
      >
        {/* Radial hover glow */}
        <span
          aria-hidden="true"
          className="mc-glow"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.55), rgba(255,255,255,0) 55%)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 220ms ease',
            pointerEvents: 'none',
          }}
        />
        <div style={{ width: '320px', flexShrink: 0, position: 'relative', aspectRatio: '4 / 3', backgroundColor: 'var(--bgTertiary)', overflow: 'hidden', borderRight: '1px solid var(--cardBorder)' }}>
          {allImages.length > 0 && !imgErrored[currentImageIndex] ? (
            <img
              src={allImages[currentImageIndex]}
              alt={product.title}
              loading="lazy"
              decoding="async"
              onError={() => setImgErrored((s) => ({ ...s, [currentImageIndex]: true }))}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 420ms ease, opacity 300ms ease',
                transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                opacity: 1,
              }}
            />
          ) : (
            <FallbackMedia colors={colors} label={product.title} />
          )}
          <div style={{
            position: 'absolute',
            top: '14px',
            left: '14px',
            padding: '4px 10px',
            backgroundColor: isSell ? 'var(--primary)' : 'var(--success)',
            color: isSell ? 'var(--primaryContrast)' : 'var(--successContrast)',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.01em',
            textTransform: 'uppercase',
          }}>
            {modeLabel}
          </div>
          {allImages.length > 1 && isHovered && (
            <>
              <AppButton
                variant="icon"
                size="icon"
                square
                aria-label="Image précédente"
                onClick={prevImage}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 4 }}
              >
                <ChevronLeft size={18} strokeWidth={2.25} />
              </AppButton>
              <AppButton
                variant="icon"
                size="icon"
                square
                aria-label="Image suivante"
                onClick={nextImage}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 4 }}
              >
                <ChevronRight size={18} strokeWidth={2.25} />
              </AppButton>
            </>
          )}
        </div>
        <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                backgroundColor: avatarBg, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 800, letterSpacing: '0.01em',
              }}>
                {avatarInitials}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--textPrimary)' }}>{sellerName}</span>
              {relativeTime && <span style={{ fontSize: '12px', color: 'var(--textMuted)' }}>· {relativeTime}</span>}
            </div>
            <AppButton
              type="button"
              variant="icon"
              size="icon"
              square
              aria-label={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              onClick={toggleFavorite}
              style={{
                backgroundColor: isFavorited ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.78)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                border: `1px solid ${isFavorited ? colors.coral : 'rgba(0,0,0,0.06)'}`,
              }}
            >
              <Heart size={18} strokeWidth={2} color="var(--coral)" fill={isFavorited ? 'var(--coral)' : 'none'} />
            </AppButton>
          </div>

          <h3 style={{
            fontSize: '19px',
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            color: 'var(--textPrimary)',
            margin: 0,
          }}>
            {product.title}
          </h3>

          {(locationLine || product.condition || product.age_range) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {product.condition && (
                <span style={pillTag(colors)}>{product.condition}</span>
              )}
              {product.age_range && (
                <span style={pillTag(colors)}>{product.age_range}</span>
              )}
              {locationLine && (
                <span style={{ ...pillTag(colors), display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={12} weight="BoldDuotone" /> {locationLine}
                </span>
              )}
            </div>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1,
              color: isSell ? 'var(--coral)' : 'var(--success)',
            }}>
              {price}
            </div>
            <Link
              to={`/chat?with=${product.user_id || product.user?.id || ''}&announcement=${product.id}`}
              onClick={(e) => e.stopPropagation()}
              style={{ textDecoration: 'none' }}
            >
              <AppButton
                variant="coral"
                size="sm"
                leftIcon={<ChatLine size={15} weight="BoldDuotone" />}
              >
                Contacter
              </AppButton>
            </Link>
          </div>
        </div>
      </Link>
    );
  }

  // --- GRID VIEW (default, premium card) ---
  return (
    <Link
      to={detailLink}
      className="mc-grid-link"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setCurrentImageIndex(0); }}
      style={{
        ...cardInlineStyles(colors, tileIndex),
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--tileBg)',
        border: '1px solid var(--cardBorder)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 180ms ease, transform 200ms ease',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 0,
        boxShadow: 'none',
        height: '100%',
      }}
    >
      {/* Radial hover glow */}
      <span
        aria-hidden="true"
        className="mc-glow"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(380px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.62), rgba(255,255,255,0) 58%)',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 220ms ease',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Seller header */}
      <div style={{
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 3,
        borderBottom: '1px solid var(--cardBorder)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '50%',
            backgroundColor: avatarBg, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: 800, letterSpacing: '0.01em',
            flexShrink: 0,
          }}>
            {avatarInitials}
          </div>
          <div style={{ minWidth: 0, lineHeight: 1.05 }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--textPrimary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {sellerName}
            </div>
            {relativeTime && (
              <div style={{ fontSize: '11px', color: 'var(--textMuted)', marginTop: '2px' }}>
                {relativeTime}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media block */}
      <div style={{
        position: 'relative',
        aspectRatio: '1 / 1',
        backgroundColor: 'var(--bgTertiary)',
        overflow: 'hidden',
        zIndex: 1,
      }}>
        {allImages.length > 0 && !imgErrored[currentImageIndex] ? (
          <img
            src={allImages[currentImageIndex]}
            alt={product.title}
            loading="lazy"
            decoding="async"
            onError={() => setImgErrored((s) => ({ ...s, [currentImageIndex]: true }))}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 500ms cubic-bezier(.2,.7,.2,1), opacity 300ms ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              opacity: 1,
            }}
          />
        ) : (
          <FallbackMedia colors={colors} label={product.title} />
        )}

        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          padding: '3px 8px',
          backgroundColor: isSell ? 'var(--primary)' : 'var(--success)',
          color: isSell ? 'var(--primaryContrast)' : 'var(--successContrast)',
          fontSize: '10px',
          fontWeight: 900,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          zIndex: 3,
        }}>
          {modeLabel}
        </div>

        <AppButton
          type="button"
          variant="icon"
          size="icon"
          square
          aria-label={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          onClick={toggleFavorite}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            zIndex: 3,
            backgroundColor: isFavorited ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.78)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: `1px solid ${isFavorited ? colors.coral : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          <Heart size={17} strokeWidth={2} color="var(--coral)" fill={isFavorited ? 'var(--coral)' : 'none'} />
        </AppButton>

        {allImages.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            padding: '3px 6px',
            backgroundColor: 'rgba(30, 20, 16, 0.72)',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            zIndex: 3,
          }}>
            <Camera size={10} strokeWidth={2} /> {currentImageIndex + 1}/{allImages.length}
          </div>
        )}

        {allImages.length > 1 && isHovered && (
          <>
            <AppButton
              variant="icon"
              size="icon"
              square
              aria-label="Image précédente"
              onClick={prevImage}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 4 }}
            >
              <ChevronLeft size={18} strokeWidth={2.25} />
            </AppButton>
            <AppButton
              variant="icon"
              size="icon"
              square
              aria-label="Image suivante"
              onClick={nextImage}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 4 }}
            >
              <ChevronRight size={18} strokeWidth={2.25} />
            </AppButton>
          </>
        )}
      </div>

      {/* Info body */}
      <div style={{
        padding: '12px 12px 14px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative',
        zIndex: 3,
      }}>
        {locationLine && (
          <div style={{
            fontSize: '11px',
            color: 'var(--textMuted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            lineHeight: 1.1,
          }}>
            <MapPin size={12} weight="BoldDuotone" /> {locationLine}
          </div>
        )}
        <h3 style={{
          fontSize: '14.5px',
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: '-0.015em',
          color: 'var(--textPrimary)',
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.3em',
        }}>
          {product.title}
        </h3>
        {(product.condition || product.age_range) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {product.condition && <span style={miniTag(colors)}>{product.condition}</span>}
            {product.age_range && <span style={miniTag(colors)}>{product.age_range}</span>}
          </div>
        )}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          paddingTop: '6px',
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1,
            color: isSell ? 'var(--coral)' : 'var(--success)',
          }}>
            {price}
          </div>
          {(product.favorites_count || product.views_count) ? (
            <div style={{ fontSize: '11px', color: 'var(--textMuted)' }}>
              {product.favorites_count ? `♥ ${product.favorites_count}` : null}
              {product.views_count ? ` · 👁 ${product.views_count}` : null}
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
};

function FallbackMedia({ colors, label }: { colors: any; label: string }) {
  return (
    <div aria-hidden="true" style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: `linear-gradient(135deg, ${colors.imageFallback1}, ${colors.imageFallback2})`,
      textAlign: 'center',
      padding: '20px',
    }}>
      <span style={{
        fontSize: '13px',
        fontWeight: 700,
        letterSpacing: '-0.01em',
        lineHeight: 1.2,
        color: colors.textSecondary,
        maxWidth: '80%',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {label || 'Photo à venir'}
      </span>
    </div>
  );
}

function chevronBtn(side: 'left' | 'right', colors: any, smallPadding = false) {
  const pad = smallPadding ? '0' : '0';
  return {
    position: 'absolute' as const,
    [side]: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    color: colors.textPrimary,
    border: '1px solid rgba(0,0,0,0.06)',
    width: '30px',
    height: '30px',
    padding: pad,
    display: 'inline-flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 4,
    boxShadow: 'none',
    borderRadius: 0,
  } as React.CSSProperties;
}

function favoriteBtn(colors: any, active: boolean): React.CSSProperties {
  return {
    backgroundColor: active ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.78)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    border: `1px solid ${active ? colors.coral : 'rgba(0,0,0,0.06)'}`,
    width: '30px',
    height: '30px',
    padding: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: 'none',
    borderRadius: 0,
  };
}

function pillTag(colors: any): React.CSSProperties {
  return {
    padding: '4px 10px',
    backgroundColor: 'var(--bgSecondary)',
    border: '1px solid var(--cardBorder)',
    color: 'var(--textSecondary)',
    fontSize: '12px',
    fontWeight: 700,
    lineHeight: 1,
    borderRadius: 0,
  };
}

function miniTag(colors: any): React.CSSProperties {
  return {
    padding: '3px 7px',
    backgroundColor: 'var(--bgSecondary)',
    border: '1px solid var(--cardBorder)',
    color: 'var(--textSecondary)',
    fontSize: '10.5px',
    fontWeight: 700,
    lineHeight: 1,
    borderRadius: 0,
  };
}

const MarketplaceCard = memo(MarketplaceCardInner);
export default MarketplaceCard;
export { cardInlineStyles as getCardInlineStyles };
