import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Active3DGiftPayload } from '../../types';
import { soundService } from '../../services/soundService';
import { Sparkles, Coins, X, Flame, Crown, Heart, Send } from 'lucide-react';

interface GiftAnimation3DProps {
  payload: Active3DGiftPayload | null;
  onComplete: () => void;
}

export const GiftAnimation3D: React.FC<GiftAnimation3DProps> = ({
  payload,
  onComplete,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!payload) return;

    // Trigger Sound
    soundService.playVIP3DGiftSound(payload.gift.rarity);

    // Trigger Confetti Bursts
    const giftColor = payload.gift.color || '#FFD700';
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.5, x: 0.5 },
      colors: [giftColor, '#FFD700', '#FFFFFF', '#EC4899', '#38BDF8'],
      zIndex: 9999,
    });

    // Secondary cannon burst
    const timerSide = setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: [giftColor, '#F59E0B', '#A855F7'],
        zIndex: 9999,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: [giftColor, '#F59E0B', '#3B82F6'],
        zIndex: 9999,
      });
    }, 450);

    // Progress bar countdown (4000ms total)
    const interval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - 2.5));
    }, 100);

    // Auto dismiss after 4 seconds
    const dismissTimer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(timerSide);
      clearTimeout(dismissTimer);
      clearInterval(interval);
    };
  }, [payload, onComplete]);

  if (!payload) return null;

  const { gift, sender, targetName, quantity } = payload;
  const totalCoins = gift.coinValue * quantity;
  const giftColor = gift.color || '#FFD700';

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'Legendary':
        return 'from-amber-400 via-rose-500 to-purple-600';
      case 'Mythic':
        return 'from-fuchsia-400 via-pink-500 to-amber-400';
      case 'Epic':
        return 'from-purple-500 via-indigo-500 to-cyan-400';
      case 'Rare':
        return 'from-cyan-400 to-blue-600';
      default:
        return 'from-pink-400 to-rose-500';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
        {/* Dark radial glow backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto"
          onClick={onComplete}
        />

        {/* Ambient colored lighting pulse */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.35, 0.7, 0.35],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            background: `radial-gradient(circle, ${giftColor}55 0%, transparent 70%)`,
          }}
          className="absolute w-[480px] h-[480px] rounded-full pointer-events-none -z-0"
        />

        {/* Centered 3D Animation Stage */}
        <div className="relative z-10 w-full max-w-sm sm:max-w-md px-4 flex flex-col items-center pointer-events-auto">
          {/* Top VIP Announcement Banner */}
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            transition={{ type: 'spring', damping: 14, stiffness: 180 }}
            className="w-full rounded-2xl bg-[#17072b]/90 border border-amber-400/70 p-3 shadow-[0_0_30px_rgba(251,191,36,0.4)] backdrop-blur-md mb-4 relative overflow-hidden"
          >
            {/* Top glowing shimmer line */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent animate-pulse" />

            {/* Rarity Pill Badge */}
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full text-white bg-gradient-to-r ${getRarityGradient(
                  gift.rarity
                )} shadow-md flex items-center gap-1`}
              >
                <Crown className="w-3 h-3" /> VIP {gift.rarity}
              </span>

              {/* Close Button */}
              <button
                onClick={onComplete}
                className="p-1 rounded-full text-purple-300 hover:text-white hover:bg-purple-900/50 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sender -> Gift -> Receiver row */}
            <div className="flex items-center justify-between gap-2 text-xs">
              {/* Sender */}
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={sender.avatar}
                  alt={sender.name}
                  className="w-8 h-8 rounded-full border-2 border-amber-400 object-cover shrink-0 shadow-md"
                />
                <div className="truncate">
                  <div className="text-[10px] text-purple-300 font-medium">Sender</div>
                  <div className="font-bold text-white truncate text-xs">{sender.name}</div>
                </div>
              </div>

              {/* Transfer Arrow & Gift Badge */}
              <div className="flex flex-col items-center shrink-0 px-1">
                <div className="flex items-center gap-1 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-700/60 text-[10px] text-amber-300 font-bold">
                  <span>{gift.icon}</span>
                  <span>x{quantity}</span>
                </div>
                <span className="text-[9px] text-amber-400 font-semibold flex items-center gap-0.5 mt-0.5">
                  <Coins className="w-2.5 h-2.5" /> {totalCoins.toLocaleString()}
                </span>
              </div>

              {/* Receiver */}
              <div className="flex items-center gap-2 min-w-0 text-right justify-end">
                <div className="truncate">
                  <div className="text-[10px] text-purple-300 font-medium">To</div>
                  <div className="font-bold text-amber-300 truncate text-xs">{targetName}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 border-2 border-pink-400 flex items-center justify-center text-white shrink-0 shadow-md font-bold text-xs">
                  🎁
                </div>
              </div>
            </div>

            {/* Countdown timer line */}
            <div className="w-full bg-purple-950/80 h-1 rounded-full mt-2.5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-pink-500"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>
          </motion.div>

          {/* 3D FLOATING GIFT HERO CONTAINER */}
          <div
            className="relative flex items-center justify-center"
            style={{ perspective: 1200 }}
          >
            {/* Spinning Rotating 3D Particle Rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border-2 border-dashed border-amber-400/30 pointer-events-none"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-pink-400/40 pointer-events-none"
            />

            {/* Multi-layered 3D Gift Orb */}
            <motion.div
              initial={{ scale: 0, rotateY: -180, y: 50 }}
              animate={{
                scale: [0, 1.2, 1],
                rotateY: [180, 0, 15, -15, 0],
                y: [50, -15, 0, -10, 0],
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                duration: 1.2,
                times: [0, 0.4, 0.6, 0.8, 1],
                type: 'spring',
                damping: 12,
              }}
              className="relative z-20 flex flex-col items-center justify-center"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Pulsing Neon Pod Platform under the 3D Gift */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  boxShadow: [
                    `0 0 25px ${giftColor}66`,
                    `0 0 50px ${giftColor}aa`,
                    `0 0 25px ${giftColor}66`,
                  ],
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-b from-[#2a0e44]/90 via-[#18082a]/95 to-black/90 border-2 flex items-center justify-center relative p-3"
                style={{ borderColor: giftColor }}
              >
                {/* 3D Main Icon Display with Drop Shadow and Scale Pulse */}
                <motion.div
                  animate={{
                    y: [0, -12, 0],
                    rotateZ: [-3, 3, -3],
                    scale: [1, 1.08, 1],
                  }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="text-7xl sm:text-8xl select-none filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
                >
                  {gift.icon}
                </motion.div>

                {/* Floating sparkle dots */}
                <motion.div
                  animate={{
                    scale: [0.8, 1.3, 0.8],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="absolute -top-2 -right-1 text-amber-300"
                >
                  <Sparkles className="w-7 h-7 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                </motion.div>
                <motion.div
                  animate={{
                    scale: [1.2, 0.7, 1.2],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{ duration: 1.6, repeat: Infinity, delay: 0.3 }}
                  className="absolute -bottom-1 -left-2 text-pink-400"
                >
                  <Sparkles className="w-6 h-6 filter drop-shadow-[0_0_8px_rgba(236,72,153,0.9)]" />
                </motion.div>
              </motion.div>

              {/* Gift Name & Coin Banner directly below 3D model */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="mt-3 px-4 py-1.5 rounded-full bg-[#110520]/90 border border-amber-400/80 shadow-[0_4px_20px_rgba(0,0,0,0.8)] flex items-center gap-2"
              >
                <span className="font-black text-white text-sm sm:text-base font-heading">
                  {gift.name}
                </span>
                <span className="text-amber-400 font-extrabold text-xs sm:text-sm flex items-center gap-1">
                  🪙 {gift.coinValue.toLocaleString()}
                </span>
              </motion.div>

              {/* Gift Description / Visual Flare */}
              {gift.description && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-[11px] text-purple-200/90 text-center max-w-[280px] mt-1.5 font-medium drop-shadow"
                >
                  {gift.description}
                </motion.p>
              )}
            </motion.div>

            {/* Dynamic floating coin particles around the 3D model */}
            {[
              { x: -90, y: -60, delay: 0 },
              { x: 90, y: -70, delay: 0.2 },
              { x: -110, y: 40, delay: 0.4 },
              { x: 105, y: 50, delay: 0.6 },
              { x: 0, y: -100, delay: 0.3 },
            ].map((coin, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0.8, 1],
                  scale: [0, 1.2, 1],
                  y: [coin.y, coin.y - 12, coin.y],
                }}
                transition={{
                  delay: coin.delay,
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  position: 'absolute',
                  transform: `translate(${coin.x}px, ${coin.y}px)`,
                }}
                className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] flex items-center gap-0.5 font-bold text-xs"
              >
                <Coins className="w-4 h-4 fill-amber-400/30" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
