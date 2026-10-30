import React, { useState, useEffect } from 'react';

export type LightingTheme = 'gold' | 'neon' | 'fire' | 'diamond' | 'emerald';

interface Avatar3DRingProps {
  avatarUrl: string;
  altText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  level?: number;
  vipTier?: string;
  isInteractive?: boolean; // Clicking ring toggles lighting theme
  initialTheme?: LightingTheme;
  className?: string;
  showOrbitalSparks?: boolean;
}

export const Avatar3DRing: React.FC<Avatar3DRingProps> = ({
  avatarUrl,
  altText = 'User Avatar',
  size = 'xl',
  level,
  vipTier,
  isInteractive = true,
  initialTheme = 'gold',
  className = '',
  showOrbitalSparks = true,
}) => {
  const [theme, setTheme] = useState<LightingTheme>(initialTheme);
  const [showTooltip, setShowTooltip] = useState(false);

  // Sync with prop changes
  useEffect(() => {
    if (initialTheme) {
      setTheme(initialTheme);
    }
  }, [initialTheme]);

  // Cycle themes on click
  const handleRingClick = () => {
    if (!isInteractive) return;
    const themes: LightingTheme[] = ['gold', 'neon', 'fire', 'diamond', 'emerald'];
    const nextIdx = (themes.indexOf(theme) + 1) % themes.length;
    setTheme(themes[nextIdx]);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  // Dimensions based on size
  const sizeMap = {
    sm: { container: 'w-11 h-11', ringBevel: 'p-[2.5px]', avatar: 'w-8 h-8', badgeText: 'text-[7px]' },
    md: { container: 'w-16 h-16', ringBevel: 'p-[3.5px]', avatar: 'w-12 h-12', badgeText: 'text-[8px]' },
    lg: { container: 'w-22 h-22', ringBevel: 'p-[4.5px]', avatar: 'w-17 h-17', badgeText: 'text-[9px]' },
    xl: { container: 'w-26 h-26', ringBevel: 'p-[5.5px]', avatar: 'w-21 h-21', badgeText: 'text-[10px]' },
    '2xl': { container: 'w-34 h-34', ringBevel: 'p-[7px]', avatar: 'w-28 h-28', badgeText: 'text-xs' },
  };

  const currentSize = sizeMap[size];

  // Theme-specific 3D lighting colors & glows
  const themeStyles = {
    gold: {
      name: '3D Royal Gold Ring',
      conicGradient:
        'conic-gradient(from 0deg, #FFE259 0%, #FFA751 25%, #FFFFFF 50%, #FFB300 75%, #FFE259 100%)',
      glowColor: 'rgba(255, 215, 0, 0.85)',
      ambientGlow:
        '0 0 20px rgba(255, 215, 0, 0.6), 0 0 45px rgba(255, 160, 0, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.5)',
      sparkColor: '#FFF8DC',
      sparkGlow: '0 0 10px #FFD700',
      badgeBg: 'from-amber-400 via-yellow-500 to-amber-600',
      laserBorder: 'border-amber-400/80',
    },
    neon: {
      name: '3D Cyber Neon Ring',
      conicGradient:
        'conic-gradient(from 0deg, #00F0FF 0%, #D500F9 25%, #FFFFFF 50%, #FF007F 75%, #00F0FF 100%)',
      glowColor: 'rgba(0, 240, 255, 0.9)',
      ambientGlow:
        '0 0 20px rgba(0, 240, 255, 0.7), 0 0 45px rgba(213, 0, 249, 0.45), inset 0 0 15px rgba(255, 255, 255, 0.6)',
      sparkColor: '#00F0FF',
      sparkGlow: '0 0 10px #00F0FF',
      badgeBg: 'from-cyan-400 via-pink-500 to-purple-600',
      laserBorder: 'border-cyan-400/80',
    },
    fire: {
      name: '3D Dragon Flame Ring',
      conicGradient:
        'conic-gradient(from 0deg, #FF3B30 0%, #FF9500 25%, #FFFFFF 50%, #FF2D55 75%, #FF3B30 100%)',
      glowColor: 'rgba(255, 59, 48, 0.9)',
      ambientGlow:
        '0 0 20px rgba(255, 59, 48, 0.75), 0 0 45px rgba(255, 149, 0, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.5)',
      sparkColor: '#FFCC00',
      sparkGlow: '0 0 10px #FF3B30',
      badgeBg: 'from-red-500 via-orange-500 to-amber-500',
      laserBorder: 'border-red-400/80',
    },
    diamond: {
      name: '3D Celestial Diamond Ring',
      conicGradient:
        'conic-gradient(from 0deg, #A855F7 0%, #EC4899 25%, #FFFFFF 50%, #38BDF8 75%, #A855F7 100%)',
      glowColor: 'rgba(168, 85, 247, 0.85)',
      ambientGlow:
        '0 0 20px rgba(168, 85, 247, 0.65), 0 0 45px rgba(236, 72, 153, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.6)',
      sparkColor: '#E0E7FF',
      sparkGlow: '0 0 10px #C084FC',
      badgeBg: 'from-purple-500 via-pink-500 to-sky-400',
      laserBorder: 'border-purple-400/80',
    },
    emerald: {
      name: '3D Emerald Laser Ring',
      conicGradient:
        'conic-gradient(from 0deg, #10B981 0%, #059669 25%, #FFFFFF 50%, #34D399 75%, #10B981 100%)',
      glowColor: 'rgba(16, 185, 129, 0.9)',
      ambientGlow:
        '0 0 20px rgba(16, 185, 129, 0.7), 0 0 45px rgba(52, 211, 153, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.6)',
      sparkColor: '#6EE7B7',
      sparkGlow: '0 0 10px #10B981',
      badgeBg: 'from-emerald-400 via-teal-500 to-green-600',
      laserBorder: 'border-emerald-400/80',
    },
  };

  const currentTheme = themeStyles[theme];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      onClick={handleRingClick}
      title={isInteractive ? 'Tap 3D Ring to switch Lighting Mode' : undefined}
    >
      {/* Tooltip feedback on theme tap */}
      {showTooltip && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/95 border border-amber-400 text-[10px] font-bold text-amber-300 whitespace-nowrap shadow-2xl z-50 animate-bounce">
          {currentTheme.name}
        </div>
      )}

      {/* 1. OUTSIDE AMBIENT VOLUMETRIC LIGHTING BLOOM */}
      <div
        style={{
          boxShadow: currentTheme.ambientGlow,
        }}
        className="absolute inset-0 rounded-full filter blur-[4px] opacity-90 transition-all duration-500 pointer-events-none"
      />

      {/* 2. 3D ROUND TORUS / RING CONTAINER */}
      <div
        className={`relative ${currentSize.container} rounded-full flex items-center justify-center cursor-pointer group p-1`}
        style={{
          perspective: '1000px',
        }}
      >
        {/* Dynamic Rotating 3D Conic Light Beam (Laser Circulation) */}
        <div
          style={{
            background: currentTheme.conicGradient,
          }}
          className="absolute inset-0 rounded-full animate-spin [animation-duration:4s] transition-all duration-700 shadow-2xl"
        />

        {/* 3. 3D METALLIC BEVEL & REFLECTIVE HIGHLIGHTS (Produces the tubular, 3D curved round ring look) */}
        <div
          style={{
            boxShadow:
              'inset 0 3px 6px rgba(255,255,255,0.85), inset 0 -3px 6px rgba(0,0,0,0.9), 0 6px 14px rgba(0,0,0,0.7)',
          }}
          className="absolute inset-0 rounded-full border border-white/40 pointer-events-none transition-all duration-300"
        />

        {/* 4. LIGHTING PHOTON 1: Fast orbiting spark */}
        {showOrbitalSparks && (
          <div className="absolute inset-[-5px] rounded-full animate-spin [animation-duration:2.8s] pointer-events-none">
            <div
              style={{
                backgroundColor: currentTheme.sparkColor,
                boxShadow: currentTheme.sparkGlow,
              }}
              className="w-2.5 h-2.5 rounded-full absolute -top-1 left-1/2 -translate-x-1/2 filter blur-[0.5px] ring-2 ring-white"
            />
          </div>
        )}

        {/* 5. LIGHTING PHOTON 2: Counter-orbiting spark */}
        {showOrbitalSparks && (
          <div className="absolute inset-[-5px] rounded-full animate-spin [animation-duration:4.2s] [animation-direction:reverse] pointer-events-none">
            <div
              style={{
                backgroundColor: currentTheme.sparkColor,
                boxShadow: currentTheme.sparkGlow,
              }}
              className="w-2 h-2 rounded-full absolute -bottom-1 left-1/2 -translate-x-1/2 filter blur-[0.5px]"
            />
          </div>
        )}

        {/* 6. INNER CAVITY WITH METALLIC SHADOW (Sunken 3D profile picture well) */}
        <div
          className={`relative z-10 rounded-full bg-[#090214] overflow-hidden p-0.5 shadow-[inset_0_3px_10px_rgba(0,0,0,0.95)]`}
        >
          {/* Avatar Image */}
          <img
            src={avatarUrl}
            alt={altText}
            className={`${currentSize.avatar} rounded-full object-cover border border-black/80 transition transform group-hover:scale-105 duration-300`}
          />

          {/* Inner perimeter specular glass shine */}
          <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/30 pointer-events-none" />
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/20 to-transparent rounded-full pointer-events-none" />
        </div>
      </div>

      {/* 7. VIP CROWN LIGHTING PIN (If Crown tier) */}
      {vipTier === 'Crown' && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none filter drop-shadow-[0_0_10px_#FFD700] animate-bounce-short">
          <span className="text-base">👑</span>
        </div>
      )}

      {/* 8. LEVEL BADGE WITH 3D NEON LIGHTING (Bottom Right) */}
      {typeof level === 'number' && (
        <div
          className={`absolute -bottom-1 -right-1 z-20 px-2 py-0.5 rounded-full bg-gradient-to-r ${currentTheme.badgeBg} text-white font-black uppercase shadow-lg shadow-black/90 border border-white/50 flex items-center gap-0.5 ${currentSize.badgeText}`}
        >
          <span>Lv.{level}</span>
        </div>
      )}
    </div>
  );
};
