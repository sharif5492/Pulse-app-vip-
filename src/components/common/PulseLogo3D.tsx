import React from 'react';

interface PulseLogo3DProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  withGlow?: boolean;
}

export const PulseLogo3D: React.FC<PulseLogo3DProps> = ({
  size = 'md',
  showText = true,
  withGlow = true,
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', crown: 'w-3 h-3 -top-2', text: 'text-sm', sub: 'text-[8px]' },
    md: { box: 'w-8 h-8', crown: 'w-3.5 h-3.5 -top-2', text: 'text-base', sub: 'text-[8px]' },
    lg: { box: 'w-16 h-16', crown: 'w-6 h-6 -top-3.5', text: 'text-2xl', sub: 'text-[11px]' },
    xl: { box: 'w-24 h-24', crown: 'w-8 h-8 -top-5', text: 'text-4xl', sub: 'text-xs' },
  };

  const current = sizeMap[size];

  return (
    <div className="flex items-center gap-2.5 select-none group cursor-pointer">
      {/* 3D VIP Logo Emblem */}
      <div className="relative">
        {/* Ambient Neon Backglow */}
        {withGlow && (
          <div
            className={`absolute inset-0 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-amber-400 blur-md opacity-60 group-hover:opacity-90 transition duration-500 animate-pulse-ring`}
          />
        )}

        {/* 3D Floating Gold Crown */}
        <div
          className={`absolute ${current.crown} left-1/2 -translate-x-1/2 z-20 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]`}
        >
          <svg viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M 6 12 L 14 20 L 24 8 L 34 20 L 42 12 L 39 30 L 9 30 Z"
              fill="url(#crownGold)"
              stroke="#FFF"
              strokeWidth="1.5"
            />
            <circle cx="6" cy="10" r="3.5" fill="#00F0FF" />
            <circle cx="24" cy="6" r="4.5" fill="#FF007F" />
            <circle cx="42" cy="10" r="3.5" fill="#00F0FF" />
            <rect x="9" y="27" width="30" height="4" rx="2" fill="#FFE072" />
            <defs>
              <linearGradient id="crownGold" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFF8D6" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 3D Beveled Medallion Box */}
        <div
          className={`relative ${current.box} rounded-2xl p-[2px] bg-gradient-to-tr from-[#FFD700] via-[#EC4899] to-[#8B5CF6] shadow-[0_8px_20px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.4)] transform group-hover:scale-105 transition-transform duration-300`}
        >
          {/* Inner 3D Mirror Face */}
          <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-[#1E0836] via-[#100320] to-[#06000C] flex items-center justify-center relative overflow-hidden shadow-inner">
            {/* 3D Diagonal Glass Sheen */}
            <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/20 to-transparent rotate-45 pointer-events-none group-hover:translate-x-full transition-transform duration-1000" />

            {/* 3D Embossed Stylized 'P' with Heartbeat Soundwave */}
            <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)]">
              <defs>
                <linearGradient id="pGold3D" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="35%" stopColor="#FDE047" />
                  <stop offset="70%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#92400E" />
                </linearGradient>
                <linearGradient id="pulseWave3D" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00F0FF" />
                  <stop offset="50%" stopColor="#FF007F" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>

              {/* Dynamic Sound Pulse Behind Letter */}
              <path
                d="M 10 58 L 26 58 L 34 38 L 44 76 L 56 22 L 68 70 L 78 52 L 90 58"
                fill="none"
                stroke="url(#pulseWave3D)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-90"
              />
              <path
                d="M 10 58 L 26 58 L 34 38 L 44 76 L 56 22 L 68 70 L 78 52 L 90 58"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />

              {/* Bold 3D Letter P with Gold Metallic Finish */}
              <path
                d="M 32 24 L 56 24 C 68 24, 76 32, 76 44 C 76 56, 68 64, 56 64 L 44 64 L 44 80 L 32 80 Z"
                fill="url(#pGold3D)"
                stroke="#FFEAA7"
                strokeWidth="2.5"
              />
              <path
                d="M 44 36 L 54 36 C 60 36, 64 39, 64 44 C 64 49, 60 52, 54 52 L 44 52 Z"
                fill="#150524"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400 font-heading ${current.text} drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]`}
            >
              PULSE
            </span>
            <span className="px-1.5 py-0.2 rounded-md bg-gradient-to-r from-amber-500 to-pink-500 text-white font-black text-[9px] uppercase tracking-wider shadow-sm shrink-0">
              VIP
            </span>
          </div>
          <span className={`text-purple-300 font-bold tracking-widest uppercase ${current.sub} -mt-0.5 truncate hidden sm:block`}>
            Party Rooms & Live
          </span>
        </div>
      )}
    </div>
  );
};
