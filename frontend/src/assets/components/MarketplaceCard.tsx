import React, { memo, useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Heart,
  Phone,
  MessageCircle,
  Star,
} from "lucide-react";
import { MapPoint as MapPin } from "@solar-icons/react";
import { Product } from "./User/announcement/types";

interface MarketplaceCardProps {
  product: Product;
  view: 'grid' | 'list';
  getImageUrl: (m: any) => string | null;
  colors: any;
  tileIndex?: number;
}

const APP_LOCALE = (import.meta.env.VITE_APP_LOCALE || 'fr-FR').replace('_', '-');
const LOCALE_SHORT = APP_LOCALE.split('-')[0] || 'fr';

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

const formatLocation = (product: Product): string | null => {
  const addr = (product as any).city?.name
    || (product as any).city_name
    || product.pickup_address
    || (product as any).location;
  if (!addr) return null;
  const clean = String(addr).trim();
  if (!clean) return null;
  const parts = clean.split(',').map((s) => s.trim()).filter(Boolean);
  return parts.slice(0, 2).join(', ');
};

const formatWhatsAppLink = (phone: string, title: string): string => {
  const digits = phone.replace(/\D/g, '');
  const text = `Bonjour, je suis intéressé(e) par votre annonce : ${title}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
};

const MarketplaceCardInner: React.FC<MarketplaceCardProps> = ({ product, view, getImageUrl, colors }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(product.is_favorited || false);
  const [imgErrored, setImgErrored] = useState<Record<number, boolean>>({});
  const autoSlideRef = useRef<number | null>(null);

  const gallery = product.gallery || [];
  const allImages = useMemo(() => {
    const raw = [
      ...(product.thumbnail ? [getImageUrl(product.thumbnail)] : []),
      ...gallery.map(img => getImageUrl(img)),
    ].filter(Boolean) as string[];
    return raw;
  }, [product.thumbnail, gallery, getImageUrl]);

  // Auto-slide images every 2 seconds — ONLY when card is hovered
  useEffect(() => {
    if (allImages.length <= 1) return;
    if (!isHovered) {
      // Not hovered → stop timer and reset to first image so next hover starts fresh
      if (autoSlideRef.current) {
        window.clearInterval(autoSlideRef.current);
        autoSlideRef.current = null;
      }
      setCurrentImageIndex(0);
      return;
    }
    // Hovered + multiple images → start auto slide
    if (autoSlideRef.current) window.clearInterval(autoSlideRef.current);
    autoSlideRef.current = window.setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 2000);
    return () => {
      if (autoSlideRef.current) {
        window.clearInterval(autoSlideRef.current);
        autoSlideRef.current = null;
      }
    };
  }, [isHovered, allImages.length]);

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
  const price = isSell
    ? (Number.isFinite(Number(product.price)) ? `${Math.floor(Number(product.price))} ${product.currency || 'DH'}` : 'Prix libre')
    : 'GRATUIT';

  const detailLink = `/announcements/${product.slug}`;

  // --- Contact info from backend API ---
  const hasPhone = Boolean((product as any).contact_phone && String((product as any).contact_phone).trim() !== '');
  const phoneRaw = hasPhone ? String((product as any).contact_phone).trim() : '';
  const chatLink = `/chat?with=${product.user_id || product.user?.id || ''}&announcement=${product.id}`;

  const whatsappLink = hasPhone ? formatWhatsAppLink(phoneRaw, product.title) : '';

  // Build metadata line like "3 chambres · 2 sdb · 132 m² · Étage 3"
  const metaParts = useMemo(() => {
    const parts: string[] = [];
    if (product.condition) parts.push(String(product.condition));
    if (product.age_range) parts.push(String(product.age_range));
    if (product.brand) parts.push(String(product.brand));
    return parts;
  }, [product.condition, product.age_range, product.brand]);

  const isUrgent = (product as any).is_urgent || (product as any).is_boosted;

  const CARD_BG = colors.bgSecondary || '#ffffff';
  const CARD_BORDER = colors.cardBorder || colors.border || 'rgba(0,0,0,0.08)';
  const CARD_RADIUS = 12;
  const PRICE_COLOR = isSell ? (colors.primary || '#2970e6') : (colors.success || '#10b981');

  // ---- Large circular contact buttons (like reference) ----
  const bigCircleBtn = (bg: string, fg: string = '#ffffff'): React.CSSProperties => ({
    width: '38px',
    height: '38px',
    minWidth: '38px',
    borderRadius: '50%',
    backgroundColor: bg,
    color: fg,
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 120ms ease, filter 120ms ease',
    textDecoration: 'none',
  });

  // ---------------------------------------------------------------- //
  //                           LIST VIEW                              //
  // ---------------------------------------------------------------- //
  if (view === 'list') {
    return (
      <Link
        to={detailLink}
        className="mc-list-link"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex',
          backgroundColor: CARD_BG,
          border: `1px solid ${CARD_BORDER}`,
          textDecoration: 'none',
          color: 'inherit',
          transition: 'border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: CARD_RADIUS,
          boxShadow: isHovered ? '0 8px 28px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        }}
      >
        {/* IMAGE BLOCK */}
        <div style={{
          width: '320px',
          flexShrink: 0,
          position: 'relative',
          aspectRatio: '4 / 3',
          backgroundColor: colors.bgTertiary,
          overflow: 'hidden',
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
                transition: 'opacity 400ms ease',
                opacity: 1,
              }}
            />
          ) : (
            <FallbackMedia colors={colors} label={product.title} />
          )}

          {/* Heart favorite */}
          <button
            type="button"
            onClick={toggleFavorite}
            aria-label={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 5,
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
          >
            <Heart size={18} strokeWidth={2.2} color={isFavorited ? '#ef4444' : '#222'} fill={isFavorited ? '#ef4444' : 'none'} />
          </button>

          {/* Gallery dot pagination */}
          {allImages.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '14px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 5,
            }}>
              {allImages.map((_, idx) => (
                <span
                  key={idx}
                  style={{
                    width: idx === currentImageIndex ? '22px' : '7px',
                    height: '7px',
                    borderRadius: idx === currentImageIndex ? '4px' : '50%',
                    backgroundColor: idx === currentImageIndex ? '#ffffff' : 'rgba(255,255,255,0.55)',
                    transition: 'all 220ms ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* CONTENT BLOCK */}
        <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0, flex: 1 }}>
              <h3 style={{
                fontSize: '17px',
                fontWeight: 600,
                lineHeight: 1.25,
                letterSpacing: '-0.01em',
                color: colors.textPrimary,
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {product.title}
              </h3>

              {metaParts.length > 0 && (
                <div style={{
                  fontSize: '13px',
                  color: colors.textSecondary,
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  {metaParts.map((m, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span style={{ opacity: 0.4 }}>·</span>}
                      <span>{m}</span>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {isUrgent && (
              <span style={{
                padding: '4px 10px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                borderRadius: '6px',
                flexShrink: 0,
              }}>
                URGENT
              </span>
            )}
          </div>

          <div style={{
            fontSize: '26px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: PRICE_COLOR,
          }}>
            {price}
          </div>

          <div style={{
            fontSize: '13px',
            color: colors.textMuted,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            marginTop: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {locationLine && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} weight="BoldDuotone" /> {locationLine}
                </span>
              )}
              {relativeTime && (
                <span>il y a {relativeTime.replace('il y a ', '').replace('ago ', '')}</span>
              )}
            </div>
          </div>

          {/* Seller + contact buttons row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginTop: '8px',
            paddingTop: '14px',
            borderTop: `1px solid ${CARD_BORDER}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                backgroundColor: avatarBg, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 800, flexShrink: 0,
              }}>
                {avatarInitials}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: colors.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {sellerName}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Message ALWAYS */}
              <Link to={chatLink} onClick={(e) => e.stopPropagation()} style={{ ...bigCircleBtn(colors.primary || '#3a7afe'), textDecoration: 'none' }} aria-label="Message">
                <MessageCircle size={18} strokeWidth={2.1} />
              </Link>
              {/* WhatsApp only if phone provided */}
              {hasPhone && (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  style={{ ...bigCircleBtn('#25d366'), textDecoration: 'none' }} aria-label="WhatsApp" title={phoneRaw}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.52 3.48A11.82 11.82 0 0 0 12.04 0C5.46 0 .1 5.37.1 11.95c0 2.1.55 4.16 1.6 5.97L0 24l6.23-1.64a11.94 11.94 0 0 0 5.8 1.49h.01c6.58 0 11.94-5.37 11.94-11.95 0-3.19-1.24-6.19-3.46-8.42zM12.04 21.8h-.01a9.84 9.84 0 0 1-5.02-1.39l-.36-.22-3.7.98 1-3.6-.24-.37a9.85 9.85 0 0 1-1.51-5.26c0-5.46 4.44-9.9 9.9-9.9 2.64 0 5.13 1.03 7 2.9a9.84 9.84 0 0 1 2.9 7c0 5.45-4.44 9.9-9.9 9.86zm5.41-7.39c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15s-.77.97-.95 1.17-.35.22-.65.07c-.3-.15-1.26-.47-2.4-1.48-.89-.78-1.48-1.75-1.66-2.04-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.09 3.19 5.06 4.47.7.31 1.25.49 1.67.63.7.22 1.34.19 1.84.12.56-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z"/>
                  </svg>
                </a>
              )}
              {/* Phone only if provided */}
              {hasPhone && (
                <a href={`tel:${encodeURIComponent(phoneRaw)}`} onClick={(e) => e.stopPropagation()}
                  style={{ ...bigCircleBtn(colors.primary || '#3a7afe'), textDecoration: 'none' }} aria-label="Appeler" title={phoneRaw}>
                  <Phone size={17} strokeWidth={2.1} />
                </a>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ---------------------------------------------------------------- //
  //                          GRID VIEW (DEFAULT)                     //
  // ---------------------------------------------------------------- //
  return (
    <Link
      to={detailLink}
      className="mc-grid-link"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 180ms ease, transform 200ms ease, box-shadow 200ms ease',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: CARD_RADIUS,
        boxShadow: isHovered ? '0 10px 28px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.04)',
        height: '100%',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >
      {/* ============ IMAGE ============ */}
      <div style={{
        position: 'relative',
        aspectRatio: '4 / 3',
        backgroundColor: colors.bgTertiary,
        overflow: 'hidden',
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
              transition: 'opacity 400ms ease, transform 500ms ease',
              transform: isHovered ? 'scale(1.04)' : 'scale(1)',
              opacity: 1,
            }}
          />
        ) : (
          <FallbackMedia colors={colors} label={product.title} />
        )}

        {/* Heart fav top-right */}
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 5,
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          <Heart size={17} strokeWidth={2.2} color={isFavorited ? '#ef4444' : '#222'} fill={isFavorited ? '#ef4444' : 'none'} />
        </button>

        {/* Star / URGENT badge top-left */}
        {isUrgent && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 5,
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Star size={14} fill="#ffffff" strokeWidth={0} />
          </div>
        )}

        {/* URGENT tag below image on overlay bottom */}
        {isUrgent && (
          <span style={{
            position: 'absolute',
            bottom: '44px',
            left: '10px',
            zIndex: 5,
            padding: '3px 9px',
            borderRadius: '6px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}>
            URGENT
          </span>
        )}

        {/* Gallery dot pagination */}
        {allImages.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '14px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            zIndex: 5,
          }}>
            {allImages.map((_, idx) => (
              <span
                key={idx}
                style={{
                  width: idx === currentImageIndex ? '20px' : '6px',
                  height: '6px',
                  borderRadius: idx === currentImageIndex ? '3px' : '50%',
                  backgroundColor: idx === currentImageIndex ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  transition: 'all 220ms ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ============ TEXT CONTENT ============ */}
      <div style={{
        padding: '12px 14px 14px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '7px',
      }}>
        {/* Title */}
        <h3 style={{
          fontSize: '14px',
          fontWeight: 500,
          lineHeight: 1.25,
          color: colors.textPrimary,
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.5em',
        }}>
          {product.title}
        </h3>

        {/* Meta line (condition/age) */}
        {metaParts.length > 0 && (
          <div style={{
            fontSize: '12px',
            color: colors.textSecondary,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '6px',
          }}>
            {metaParts.map((m, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ opacity: 0.35 }}>·</span>}
                <span>{m}</span>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Price */}
        <div style={{
          fontSize: '17px',
          fontWeight: 800,
          letterSpacing: '-0.015em',
          lineHeight: 1.1,
          color: PRICE_COLOR,
          marginTop: '2px',
        }}>
          {price}
        </div>

        {/* Location + time */}
        <div style={{
          fontSize: '12px',
          color: colors.textMuted,
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          marginTop: '2px',
        }}>
          {locationLine && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} weight="BoldDuotone" /> {locationLine}
            </div>
          )}
          {relativeTime && (
            <div>il y a {relativeTime.replace('il y a ', '').replace('ago ', '')}</div>
          )}
        </div>

        {/* ============ SELLER + CONTACT BUTTONS ============ */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
        }}>
          {/* Seller name + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 1, overflow: 'hidden' }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              backgroundColor: avatarBg, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10.5px', fontWeight: 800, flexShrink: 0,
            }}>
              {avatarInitials}
            </div>
            <span style={{
              fontSize: '12.5px',
              fontWeight: 500,
              color: colors.textSecondary,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {sellerName}
            </span>
          </div>

          {/* Contact buttons (big circles like reference) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* MESSAGE — ALWAYS */}
            <Link
              to={chatLink}
              onClick={(e) => e.stopPropagation()}
              aria-label="Envoyer un message"
              title="Message"
              style={{ ...bigCircleBtn(colors.primary || '#3a7afe'), textDecoration: 'none' }}
            >
              <MessageCircle size={17} strokeWidth={2.1} />
            </Link>

            {/* WHATSAPP — only if phone provided */}
            {hasPhone && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                aria-label="WhatsApp"
                title={phoneRaw}
                style={{ ...bigCircleBtn('#25d366'), textDecoration: 'none' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.52 3.48A11.82 11.82 0 0 0 12.04 0C5.46 0 .1 5.37.1 11.95c0 2.1.55 4.16 1.6 5.97L0 24l6.23-1.64a11.94 11.94 0 0 0 5.8 1.49h.01c6.58 0 11.94-5.37 11.94-11.95 0-3.19-1.24-6.19-3.46-8.42zM12.04 21.8h-.01a9.84 9.84 0 0 1-5.02-1.39l-.36-.22-3.7.98 1-3.6-.24-.37a9.85 9.85 0 0 1-1.51-5.26c0-5.46 4.44-9.9 9.9-9.9 2.64 0 5.13 1.03 7 2.9a9.84 9.84 0 0 1 2.9 7c0 5.45-4.44 9.9-9.9 9.86zm5.41-7.39c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15s-.77.97-.95 1.17-.35.22-.65.07c-.3-.15-1.26-.47-2.4-1.48-.89-.78-1.48-1.75-1.66-2.04-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.09 3.19 5.06 4.47.7.31 1.25.49 1.67.63.7.22 1.34.19 1.84.12.56-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z"/>
                </svg>
              </a>
            )}

            {/* PHONE — only if provided */}
            {hasPhone && (
              <a
                href={`tel:${encodeURIComponent(phoneRaw)}`}
                onClick={(e) => e.stopPropagation()}
                aria-label="Appeler"
                title={phoneRaw}
                style={{ ...bigCircleBtn(colors.primary || '#3a7afe'), textDecoration: 'none' }}
              >
                <Phone size={16} strokeWidth={2.1} />
              </a>
            )}
          </div>
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
      backgroundImage: `linear-gradient(135deg, ${colors.imageFallback1 || '#e5e7eb'}, ${colors.imageFallback2 || '#f3f4f6'})`,
      textAlign: 'center',
      padding: '20px',
    }}>
      <span style={{
        fontSize: '13px',
        fontWeight: 600,
        lineHeight: 1.25,
        color: colors.textSecondary || '#4b5563',
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

const MarketplaceCard = memo(MarketplaceCardInner);
export default MarketplaceCard;
