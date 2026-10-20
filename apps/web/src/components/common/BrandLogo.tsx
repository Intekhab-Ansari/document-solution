import React from "react";

interface BrandLogoMarkProps {
  size?: number;
  className?: string;
}

export function BrandLogoMark({ size = 36, className = "" }: BrandLogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Dark Emerald-Teal Squircle Background */}
        <linearGradient id="eaBgGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="50%" stopColor="#042f2e" />
          <stop offset="100%" stopColor="#0c1a2e" />
        </linearGradient>

        {/* Outer Glowing Border */}
        <linearGradient id="eaBorderGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
        </linearGradient>

        {/* Back document page shadow */}
        <linearGradient id="eaBackPage" x1="10" y1="8" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0.3" />
        </linearGradient>

        {/* Forefront main document facet */}
        <linearGradient id="eaMainPage" x1="12" y1="10" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="60%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Folded corner flap */}
        <linearGradient id="eaFoldFlap" x1="22" y1="10" x2="27" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="100%" stopColor="#6ee7b7" />
        </linearGradient>

        {/* Core Radiance Spark Glow */}
        <filter id="eaSparkGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Rounded Squircle Container */}
      <rect
        x="1.25"
        y="1.25"
        width="37.5"
        height="37.5"
        rx="10"
        fill="url(#eaBgGrad)"
        stroke="url(#eaBorderGrad)"
        strokeWidth="1.5"
      />

      {/* Glossy Top Sheen */}
      <rect
        x="2.5"
        y="2.5"
        width="35"
        height="17"
        rx="8.5"
        fill="white"
        fillOpacity="0.06"
      />

      {/* Back Layer: Secondary Document Page */}
      <path
        d="M10 14C10 11.7909 11.7909 10 14 10H22L27 15V26C27 28.2091 25.2091 30 23 30H14C11.7909 30 10 28.2091 10 26V14Z"
        fill="url(#eaBackPage)"
      />

      {/* Front Layer: Primary Document with Cutaway Corner */}
      <path
        d="M13 13.5C13 11.567 14.567 10 16.5 10H23L28.5 15.5V26.5C28.5 28.433 26.933 30 25 30H16.5C14.567 30 13 28.433 13 26.5V13.5Z"
        fill="url(#eaMainPage)"
      />

      {/* Folded Corner Tab */}
      <path
        d="M23 10V14.5C23 15.0523 23.4477 15.5 24 15.5H28.5L23 10Z"
        fill="url(#eaFoldFlap)"
      />

      {/* Precision Edit Text Lines (Vector Guides) */}
      <rect x="16" y="18" width="5" height="1.8" rx="0.9" fill="#042f2e" fillOpacity="0.4" />
      <rect x="16" y="22" width="7.5" height="1.8" rx="0.9" fill="#042f2e" fillOpacity="0.4" />

      {/* Radiant Precision Spark / Star (Symbolizing Editing & AI) */}
      <path
        d="M21.5 15C21.8 17.5 23.5 19.2 26 19.5C23.5 19.8 21.8 21.5 21.5 24C21.2 21.5 19.5 19.8 17 19.5C19.5 19.2 21.2 17.5 21.5 15Z"
        fill="#ffffff"
        filter="url(#eaSparkGlow)"
      />
      <circle cx="21.5" cy="19.5" r="1.2" fill="#ecfdf5" />
    </svg>
  );
}

interface BrandLogoProps {
  size?: number;
  showBadge?: boolean;
  className?: string;
}

export function BrandLogo({ size = 36, showBadge = true, className = "" }: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      <BrandLogoMark
        size={size}
        className="group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(16,185,129,0.35)] shrink-0"
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-lg text-white tracking-tight flex items-center">
            <span>Edit</span>
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Anything
            </span>
          </span>
          {showBadge && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>100% Private</span>
            </span>
          )}
        </div>
        <span className="text-[10px] text-zinc-500 font-mono tracking-tight -mt-0.5 hidden xl:block">
          Local-First Vector & Image Engine
        </span>
      </div>
    </div>
  );
}
