import React, { forwardRef, ButtonHTMLAttributes, useMemo } from 'react';
import { useTheme } from '../../../context/ThemeContext';

export type AppButtonVariant =
  | 'primary'
  | 'secondary'
  | 'coral'
  | 'success'
  | 'outline'
  | 'ghost'
  | 'pill'
  | 'pillActive'
  | 'chevron'
  | 'icon'
  | 'floating';

export type AppButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';

export interface AppButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  square?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const sizeMap: Record<AppButtonSize, { px: string; py: string; fs: string; gap: string; icon: string }> = {
  xs: { px: '10px 14px', py: '', fs: '12px', gap: '6px', icon: '14px' },
  sm: { px: '12px 18px', py: '', fs: '13.5px', gap: '8px', icon: '15px' },
  md: { px: '14px 22px', py: '', fs: '15px', gap: '10px', icon: '17px' },
  lg: { px: '18px 30px', py: '', fs: '16.5px', gap: '12px', icon: '19px' },
  xl: { px: '22px 36px', py: '', fs: '18px', gap: '14px', icon: '20px' },
  icon: { px: '0', py: '0', fs: '14px', gap: '0', icon: '18px' },
};

const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      fullWidth = false,
      square = false,
      leftIcon,
      rightIcon,
      loading = false,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const { colors } = useTheme();
    const sz = sizeMap[size];

    const styles = useMemo<React.CSSProperties>(() => {
      const base: React.CSSProperties = {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sz.gap,
        fontFamily: 'var(--font-official)',
        fontWeight: 700,
        letterSpacing: variant === 'pill' || variant === 'pillActive' ? '-0.01em' : '-0.015em',
        lineHeight: 1,
        textDecoration: 'none',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        transition:
          'background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        opacity: disabled ? 0.45 : 1,
        width: fullWidth ? '100%' : undefined,
        borderRadius: 0,
        border: '1px solid transparent',
        padding: size === 'icon' ? '0' : sz.px,
        fontSize: sz.fs,
        whiteSpace: 'nowrap',
        overflow: 'visible',
      };

      if (size === 'icon' || square) {
        const dims: Record<AppButtonSize, number> = { xs: 30, sm: 36, md: 42, lg: 48, xl: 56, icon: 40 };
        const d = dims[size];
        base.width = `${d}px`;
        base.height = `${d}px`;
        base.padding = '0';
        base.minWidth = `${d}px`;
      }

      switch (variant) {
        case 'primary':
          base.backgroundColor = colors.buttonPrimary;
          base.color = colors.buttonPrimaryContrast;
          base.borderColor = colors.buttonPrimary;
          break;
        case 'secondary':
          base.backgroundColor = colors.buttonSecondary;
          base.color = colors.buttonSecondaryContrast;
          base.borderColor = colors.border;
          break;
        case 'coral':
          base.backgroundColor = colors.coral;
          base.color = colors.coralContrast;
          base.borderColor = colors.coral;
          break;
        case 'success':
          base.backgroundColor = colors.success;
          base.color = colors.successContrast;
          base.borderColor = colors.success;
          break;
        case 'outline':
          base.backgroundColor = 'transparent';
          base.color = colors.textPrimary;
          base.borderColor = colors.border;
          break;
        case 'ghost':
          base.backgroundColor = 'transparent';
          base.color = colors.textPrimary;
          base.borderColor = 'transparent';
          break;
        case 'pill':
          base.backgroundColor = colors.bgTertiary;
          base.color = colors.textSecondary;
          base.borderColor = colors.border;
          base.borderRadius = 999;
          base.fontWeight = 600;
          base.letterSpacing = '0';
          base.fontSize = size === 'sm' ? '13px' : '14px';
          base.padding = '8px 18px';
          break;
        case 'pillActive':
          base.backgroundColor = colors.coral;
          base.color = colors.coralContrast;
          base.borderColor = colors.coral;
          base.borderRadius = 999;
          base.fontWeight = 700;
          base.fontSize = size === 'sm' ? '13px' : '14px';
          base.padding = '8px 18px';
          base.boxShadow = `0 4px 14px ${colors.shadow}`;
          break;
        case 'chevron':
          base.backgroundColor = colors.bgPrimary;
          base.color = colors.textPrimary;
          base.borderColor = colors.border;
          base.borderRadius = 999;
          base.boxShadow = `0 4px 12px ${colors.shadow}`;
          base.width = size === 'icon' ? '44px' : base.width;
          base.height = size === 'icon' ? '44px' : base.height;
          break;
        case 'icon':
          base.backgroundColor = 'rgba(255,255,255,0.88)';
          base.color = colors.textPrimary;
          base.borderColor = 'rgba(0,0,0,0.06)';
          base.borderRadius = 0;
          break;
        case 'floating':
          base.backgroundColor = colors.bgPrimary;
          base.color = colors.textPrimary;
          base.borderColor = colors.border;
          base.borderRadius = 999;
          base.boxShadow = `0 4px 12px ${colors.shadow}`;
          break;
      }

      return base;
    }, [variant, size, disabled, loading, fullWidth, square, sz, colors]);

    const hoverClasses: Record<AppButtonVariant, React.CSSProperties> = useMemo(() => ({
      primary: { backgroundColor: colors.buttonPrimaryHover, borderColor: colors.buttonPrimaryHover },
      secondary: { backgroundColor: colors.buttonSecondaryHover, borderColor: colors.borderDark },
      coral: { backgroundColor: colors.coralHover, borderColor: colors.coralHover },
      success: { backgroundColor: colors.successHover, borderColor: colors.successHover },
      outline: { backgroundColor: colors.bgSecondary, borderColor: colors.borderDark },
      ghost: { backgroundColor: colors.bgTertiary },
      pill: { backgroundColor: colors.bgSecondary, borderColor: colors.borderDark },
      pillActive: { filter: 'brightness(1.05)', boxShadow: `0 6px 18px ${colors.shadow}` },
      chevron: { backgroundColor: colors.coral, borderColor: colors.coral, color: colors.coralContrast, transform: 'scale(1.05)' },
      icon: { backgroundColor: '#ffffff', borderColor: colors.coral },
      floating: { backgroundColor: colors.coral, borderColor: colors.coral, color: colors.coralContrast },
    }), [colors]);

    const focusRingStyle: React.CSSProperties = useMemo(() => ({
      boxShadow: `0 0 0 3px ${colors.focusRing}`,
    }), [colors.focusRing]);

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={['app-btn', `app-btn--${variant}`, className].filter(Boolean).join(' ')}
        style={{ ...styles, ...style }}
        onMouseEnter={(e) => {
          if (disabled || loading) return;
          const h = hoverClasses[variant];
          Object.entries(h).forEach(([k, v]) => {
            (e.currentTarget.style as any)[k] = v;
          });
        }}
        onMouseLeave={(e) => {
          // Re-apply computed base styles by resetting touched props via a minimal re-render trick:
          const base = hoverClasses[variant];
          Object.keys(base).forEach((k) => {
            (e.currentTarget.style as any)[k] = '';
          });
        }}
        onFocus={(e) => {
          const r = focusRingStyle.boxShadow;
          e.currentTarget.style.setProperty('box-shadow', r);
        }}
        onBlur={(e) => {
          e.currentTarget.style.removeProperty('box-shadow');
        }}
        {...rest}
      >
        {loading && (
          <span
            aria-hidden="true"
            style={{
              width: sz.icon,
              height: sz.icon,
              border: `2px solid currentColor`,
              borderRightColor: 'transparent',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'app-btn-spin 0.7s linear infinite',
            }}
          />
        )}
        {!loading && leftIcon && (
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: sz.icon }}>
            {leftIcon}
          </span>
        )}
        {children && <span style={{ display: 'inline-block' }}>{children}</span>}
        {!loading && rightIcon && (
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: sz.icon }}>
            {rightIcon}
          </span>
        )}
        <style>{`
          @keyframes app-btn-spin { to { transform: rotate(360deg); } }
          .app-btn:focus-visible { box-shadow: 0 0 0 3px var(--focusRing, rgba(224,107,136,0.45)) !important; }
          .app-btn::-moz-focus-inner { border: 0; }
        `}</style>
      </button>
    );
  },
);

AppButton.displayName = 'AppButton';
export default AppButton;
