import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Quick, smooth progress animation (1.2 seconds total)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 6;
      });
    }, 45);

    const finishTimer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }, 250);
    }, 1100);

    return () => {
      clearInterval(interval);
      clearTimeout(finishTimer);
    };
  }, []);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }, 100);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-[#0e031c] via-[#080112] to-[#04000a] text-white p-6 cursor-pointer select-none transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Bar with Skip */}
      <div className="w-full flex items-center justify-between pt-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400/80 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> Pulse VIP Edition
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-purple-200 transition active:scale-95 flex items-center gap-1"
        >
          <span>Skip</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Center Branding */}
      <div className="flex flex-col items-center text-center space-y-4 my-auto">
        {/* Glowing App Icon */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-pink-600 via-purple-600 to-amber-500 rounded-full blur-xl opacity-60 animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-pink-600 via-purple-700 to-amber-500 p-[2px] shadow-2xl">
            <div className="w-full h-full bg-[#120426] rounded-3xl flex items-center justify-center">
              <Crown className="w-12 h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-bounce" />
            </div>
          </div>
        </div>

        {/* App Title */}
        <div>
          <h1 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-purple-300 font-heading">
            PULSE VIP
          </h1>
          <p className="text-xs text-purple-300 font-medium tracking-wide mt-1">
            Live Party • 12-Seat Voice Rooms • Trending Reels
          </p>
        </div>

        {/* VIP Badge */}
        <div className="px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-pink-500/20 border border-amber-500/40 text-[11px] font-bold text-amber-300 flex items-center gap-1.5 shadow">
          <span>👑 Official App by Muhammad Sharif</span>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="w-full max-w-xs space-y-2 pb-6 text-center">
        <div className="w-full h-1.5 bg-purple-950/80 rounded-full overflow-hidden border border-purple-800/40">
          <div
            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 rounded-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-purple-400 font-mono tracking-widest">
          Loading {progress}%
        </p>
      </div>
    </div>
  );
};
