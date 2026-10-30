import React from 'react';
import { User } from '../../types';
import { PulseLogo3D } from './PulseLogo3D';
import { Avatar3DRing } from './Avatar3DRing';
import { Sparkles, Coins, Radio, UserCheck, Flame } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onOpenAuth: () => void;
  onGoLiveClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAuth,
  onGoLiveClick,
}) => {
  return (
    <header className="h-14 px-2.5 sm:px-3.5 flex items-center justify-between bg-[#0e041d]/95 backdrop-blur-md border-b border-purple-950/80 sticky top-0 z-30 max-w-md mx-auto w-full shrink-0 overflow-hidden">
      {/* 3D VIP Logo & Brand */}
      <div className="shrink-0 min-w-0">
        <PulseLogo3D size="sm" showText={true} withGlow={true} />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Go Live Button */}
        <button
          onClick={onGoLiveClick}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600 via-pink-600 to-amber-500 text-white font-black text-[11px] shadow-md hover:scale-105 active:scale-95 transition shrink-0"
        >
          <Radio className="w-3 h-3 animate-pulse" />
          <span>Live</span>
        </button>

        {/* Coins indicator */}
        <div
          onClick={onOpenAuth}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-950/90 border border-purple-800 text-[11px] font-bold text-amber-400 cursor-pointer hover:border-amber-400 transition shrink-0"
          title="Your Coins (Click to Switch Account)"
        >
          <Coins className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="font-mono">
            {currentUser.coins >= 100000
              ? `${(currentUser.coins / 1000).toFixed(0)}k`
              : currentUser.coins.toLocaleString()}
          </span>
        </div>

        {/* User avatar button with 3D Lighting Ring */}
        <div
          onClick={onOpenAuth}
          className="cursor-pointer hover:scale-105 transition active:scale-95 shrink-0 ml-0.5"
          title="Account profile / Switch"
        >
          <Avatar3DRing
            avatarUrl={currentUser.avatar}
            altText={currentUser.name}
            size="sm"
            initialTheme="gold"
            isInteractive={false}
            showOrbitalSparks={false}
          />
        </div>
      </div>
    </header>
  );
};
