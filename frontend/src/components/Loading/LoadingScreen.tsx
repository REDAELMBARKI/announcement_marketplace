import React, { useEffect, useState } from "react";
import "./LoadingScreen.css";

const APP_NAME = import.meta.env.VITE_APP_NAME || "Let's be us";

interface LoadingScreenProps {
  /** Whether the loader is visible */
  isLoading: boolean;
  /** Optional text shown under the animation (default: the app name) */
  label?: string;
  /** Optional subtitle/hint line */
  hint?: string;
  /** Variant of the animation: 'wave' is full-page brand takeover, 'spinner' is a minimal inline variant */
  variant?: "wave" | "spinner";
}

/**
 * A reusable, premium loading animation built with pure CSS @keyframes
 * (no animation libraries — avoids Vite optimize-dep 504 crashes).
 *
 *   - Full-page variant ("wave"): takeover overlay, brand text, 3 orbiting cards +
 *     shimmer ring + animated slogan reveal. Used during navigation or page data load.
 *   - Minimal variant ("spinner"): compact inline loader used inside cards / skeletons.
 *
 * Used globally via <LoadingProvider> — call useLoading().show() / .hide() anywhere.
 */
export default function LoadingScreen({
  isLoading,
  label,
  hint,
  variant = "wave",
}: LoadingScreenProps) {
  // Mount/unmount with fade transition handled by CSS classes + delay-unmount state
  const [mounted, setMounted] = useState(isLoading);
  const [visible, setVisible] = useState(isLoading);

  useEffect(() => {
    let mountT: ReturnType<typeof setTimeout> | null = null;
    let fadeT: ReturnType<typeof setTimeout> | null = null;
    if (isLoading) {
      setMounted(true);
      mountT = setTimeout(() => setVisible(true), 16);
    } else {
      setVisible(false);
      fadeT = setTimeout(() => setMounted(false), 380);
    }
    return () => {
      if (mountT) clearTimeout(mountT);
      if (fadeT) clearTimeout(fadeT);
    };
  }, [isLoading]);

  if (!mounted) return null;
  const cls = ["ls-fade", visible ? "ls-in" : "ls-out"].filter(Boolean).join(" ");

  if (variant === "spinner") {
    return (
      <div className={`loading-spinner-wrap ${cls}`}>
        <svg className="loading-spinner-ring" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="26" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="3" />
          <circle
            className="loading-spinner-dash"
            cx="30" cy="30" r="26"
            fill="none"
            stroke="var(--primary, #C45E7A)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        {label && <span className="loading-spinner-label">{label}</span>}
      </div>
    );
  }

  const tagline = hint ?? "Pass on your best things";

  return (
    <div className={`loading-overlay ${cls}`} role="status" aria-live="polite">
      {/* Soft dual radial gradient blobs behind */}
      <div className="loading-bg-blob loading-blob-a" />
      <div className="loading-bg-blob loading-blob-b" />

      <div className="loading-inner">
        {/* 3 brand cards orbit ring */}
        <div className="loading-orbit-stage">
          {/* Orbit ring */}
          <div className="loading-orbit-ring">
            <div className="orbit-path" />
            <div className="orbit-card orbit-card--a">
              <div className="orbit-card-inner orbit-card--donate" />
            </div>
            <div className="orbit-card orbit-card--b">
              <div className="orbit-card-inner orbit-card--home" />
            </div>
            <div className="orbit-card orbit-card--c">
              <div className="orbit-card-inner orbit-card--community" />
            </div>
          </div>

          {/* Center shimmer logo mark */}
          <div className="loading-center-brand">
            <svg width="52" height="52" viewBox="0 0 40 40" fill="none" aria-hidden>
              <path
                d="M4 10 L12 26 L20 10 L28 26 L36 10"
                className="loading-logo-path"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle className="loading-logo-dot dot-a" cx="4" cy="30" r="3" fill="currentColor" />
              <circle className="loading-logo-dot dot-b" cx="20" cy="30" r="3" fill="currentColor" />
              <circle className="loading-logo-dot dot-c" cx="36" cy="30" r="3" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Brand wordmark */}
        <h1 className="loading-wordmark">{label ?? APP_NAME}</h1>

        {/* Shimmer tagline letter by letter */}
        <p className="loading-tagline">
          {tagline.split("").map((ch, i) => (
            <span
              key={i}
              className="tagline-char"
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </p>

        {/* Progress bar shimmer */}
        <div className="loading-progress-wrap">
          <div className="loading-progress-track">
            <div className="loading-progress-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}
