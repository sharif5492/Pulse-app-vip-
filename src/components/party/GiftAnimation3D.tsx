import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Active3DGiftPayload, GiftItem } from '../../types';
import { soundService } from '../../services/soundService';
import { Sparkles, Coins, X, Crown, ChevronRight, Volume2, VolumeX, Flame, Zap } from 'lucide-react';

interface GiftAnimation3DProps {
  payload: Active3DGiftPayload | null;
  onComplete: () => void;
}

interface RewardItem {
  id: string;
  name: string;
  icon: string;
  multiplier: string;
  color: string;
  highlight?: boolean;
}

export const GiftAnimation3D: React.FC<GiftAnimation3DProps> = ({
  payload,
  onComplete,
}) => {
  // Phases: 'mystery_box' (0-3.8s) -> 'reveal_board' (3.8-7.5s) -> 'cinematic' (7.5s+)
  const [phase, setPhase] = useState<'mystery_box' | 'reveal_board' | 'cinematic'>('mystery_box');
  const [closeCountdown, setCloseCountdown] = useState(4);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [cameraShake, setCameraShake] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Determine cinematic scene
  const giftId = payload?.gift.id || '';
  const animType = payload?.gift['3dAnimationType'] || payload?.gift.animationType || '';
  
  const isLionOrTiger =
    giftId.includes('lion') ||
    giftId.includes('tiger') ||
    animType === 'lion_king' ||
    animType === 'tiger';

  const isButterflyOrNature =
    giftId.includes('butterfly') ||
    giftId.includes('rose') ||
    animType === 'butterfly' ||
    animType === 'rose_bouquet';

  // 8 Reward icons for the reveal grid matching video reference
  const rewardGrid: RewardItem[] = [
    {
      id: 'r1',
      name: payload?.gift.name || 'Jackpot Gift',
      icon: payload?.gift.icon || '🎁',
      multiplier: 'x8',
      color: '#FBBF24',
      highlight: true,
    },
    { id: 'r2', name: 'Lion King', icon: '🦁', multiplier: 'x6', color: '#EAB308' },
    { id: 'r3', name: 'Diamond Ring', icon: '💍', multiplier: 'x3', color: '#60A5FA' },
    { id: 'r4', name: 'Imperial Crown', icon: '👑', multiplier: 'x2', color: '#F59E0B' },
    { id: 'r5', name: 'Ferrari', icon: '🏎️', multiplier: 'x2', color: '#EF4444' },
    { id: 'r6', name: 'Royal Castle', icon: '🏰', multiplier: 'x1', color: '#A855F7' },
    { id: 'r7', name: 'Fire Dragon', icon: '🐉', multiplier: 'x1', color: '#DC2626' },
    { id: 'r8', name: 'Universe', icon: '🌌', multiplier: 'x1', color: '#818CF8' },
  ];

  // Canvas particle system for sparkling aura, bokeh, and gold rays
  useEffect(() => {
    if (!payload) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate floating luxury stardust particles
    const particles = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 1.2,
      speedY: -Math.random() * 2 - 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      color: ['#FBBF24', '#F59E0B', '#A855F7', '#EC4899', '#38BDF8', '#FFFFFF'][
        Math.floor(Math.random() * 6)
      ],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render radial glow at center
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.45
      );
      grad.addColorStop(0, 'rgba(168, 85, 247, 0.18)');
      grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Render particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [payload]);

  // Phase sequencing
  useEffect(() => {
    if (!payload) return;

    // Phase 1: Mystery Box (0 - 3.8s)
    setPhase('mystery_box');
    setCloseCountdown(4);
    soundService.playMysteryBoxHum();

    // Transition to Phase 2: Reveal Board at 3.8s
    const timerPhase2 = setTimeout(() => {
      setPhase('reveal_board');
      soundService.playBoxExplosion();
    }, 3800);

    return () => {
      clearTimeout(timerPhase2);
    };
  }, [payload]);

  // Phase 2 countdown timer
  useEffect(() => {
    if (phase !== 'reveal_board') return;

    const interval = setInterval(() => {
      setCloseCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Transition to Phase 3: Full-Screen Cinematic Animation
          setPhase('cinematic');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // Phase 3: Cinematic sound and camera shake triggers
  useEffect(() => {
    if (phase !== 'cinematic') return;

    if (isLionOrTiger) {
      soundService.playLionRoarSound();
      // Screen shake at 5.5s when lion roars
      const shakeTimer = setTimeout(() => {
        setCameraShake(true);
        setTimeout(() => setCameraShake(false), 900);
      }, 5000);
      return () => clearTimeout(shakeTimer);
    } else if (isButterflyOrNature) {
      soundService.playNatureChimeSound();
    } else {
      soundService.playVIP3DGiftSound(payload?.gift.rarity);
    }

    // Auto complete after cinematic duration
    const cinematicDuration = isLionOrTiger ? 10700 : isButterflyOrNature ? 7700 : 7000;
    const endTimer = setTimeout(() => {
      onComplete();
    }, cinematicDuration);

    return () => clearTimeout(endTimer);
  }, [phase, isLionOrTiger, isButterflyOrNature, onComplete, payload]);

  if (!payload) return null;

  const { gift, sender, targetName, quantity } = payload;
  const totalCoins = gift.coinValue * quantity;

  return (
    <AnimatePresence>
      <div
        className={`fixed inset-0 z-40 overflow-hidden flex flex-col items-center justify-center select-none pointer-events-auto ${
          cameraShake ? 'animate-[bounce_0.15s_infinite]' : ''
        }`}
      >
        {/* Background Canvas Particles & Ambient Glow */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-10 w-full h-full"
        />

        {/* Backdrop overlay (Allows top room bar to remain visible) */}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[4px] -z-10" />

        {/* Global Floating Sender Announcement Pill (Always visible across all phases) */}
        <div className="absolute top-16 inset-x-3 z-30 flex items-center justify-between pointer-events-auto max-w-md mx-auto">
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1e0836]/90 border border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.5)] backdrop-blur-md"
          >
            <img
              src={sender.avatar}
              alt={sender.name}
              className="w-7 h-7 rounded-full border-2 border-amber-400 object-cover"
            />
            <div className="text-left text-xs leading-tight">
              <span className="font-extrabold text-amber-300 drop-shadow flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" /> {sender.name}
              </span>
              <span className="text-[10px] text-purple-200">
                sent <span className="font-bold text-white">{quantity}x {gift.name}</span> {gift.icon} to {targetName}
              </span>
            </div>
          </motion.div>

          {/* Quick Skip / Close Button */}
          <button
            onClick={onComplete}
            className="px-3 py-1 rounded-full bg-black/60 border border-purple-500/50 text-xs text-purple-200 hover:text-white hover:bg-purple-900/60 transition shadow-lg flex items-center gap-1 backdrop-blur-md"
          >
            <span>Skip</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* PHASE 1: MYSTERY GIFT BOX PHASE (0 - 3.8s)              */}
        {/* ======================================================== */}
        {phase === 'mystery_box' && (
          <motion.div
            key="phase_box"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.3, filter: 'blur(8px)' }}
            transition={{ duration: 0.5 }}
            className="relative z-20 flex flex-col items-center justify-center"
            style={{ perspective: 1200 }}
          >
            {/* Spinning Golden Energy Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border-2 border-dashed border-amber-400/50 pointer-events-none shadow-[0_0_40px_rgba(251,191,36,0.3)]"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute w-60 h-60 rounded-full border border-purple-400/40 pointer-events-none"
            />

            {/* 3D Rotating Purple-Gold Mystery Box */}
            <motion.div
              animate={{
                rotateY: [0, 360],
                y: [0, -15, 0],
                scale: [1, 1.06, 1],
              }}
              transition={{
                rotateY: { duration: 3.5, repeat: Infinity, ease: 'linear' },
                y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
                scale: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl bg-gradient-to-tr from-[#380e5c] via-[#5c138b] to-[#a855f7] border-4 border-amber-400 shadow-[0_0_60px_rgba(251,191,36,0.7),inset_0_0_30px_rgba(255,215,0,0.5)] flex flex-col items-center justify-center p-4"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Golden Question Mark */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  filter: [
                    'drop-shadow(0 0 10px rgba(251,191,36,0.8))',
                    'drop-shadow(0 0 25px rgba(251,191,36,1))',
                    'drop-shadow(0 0 10px rgba(251,191,36,0.8))',
                  ],
                }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="text-7xl sm:text-8xl font-black text-amber-300 font-heading select-none"
              >
                ?
              </motion.div>

              {/* Box Ribbons & Golden Lock */}
              <div className="absolute inset-x-0 h-4 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 shadow-md" />
              <div className="absolute inset-y-0 w-4 bg-gradient-to-b from-amber-500 via-yellow-300 to-amber-500 shadow-md" />
              
              <div className="absolute -top-3 w-12 h-6 rounded-full bg-amber-400 border-2 border-yellow-200 shadow-[0_0_15px_rgba(251,191,36,0.9)] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-purple-950 fill-purple-950" />
              </div>
            </motion.div>

            {/* Pulsing Text */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="mt-6 px-5 py-1.5 rounded-full bg-[#18052a]/90 border border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.5)] text-center"
            >
              <span className="text-xs sm:text-sm font-black text-amber-300 font-heading tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" /> Unlocking Mystery Box...
              </span>
            </motion.div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* PHASE 2: BOX OPENING & REVEAL (3.8s - 7.5s)              */}
        {/* ======================================================== */}
        {phase === 'reveal_board' && (
          <motion.div
            key="phase_reveal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 14, stiffness: 160 }}
            className="relative z-20 w-full max-w-sm px-4 flex flex-col items-center pointer-events-auto"
          >
            {/* Top Golden Light Rays Explosion */}
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: [0, 2.5], opacity: [1, 0] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute -top-12 w-64 h-64 rounded-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 filter blur-xl pointer-events-none -z-10"
            />

            {/* "Congratulations!" Ornate Golden Banner */}
            <div className="w-full relative mb-4">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative mx-auto max-w-[280px] py-2 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 border-2 border-yellow-200 shadow-[0_0_35px_rgba(251,191,36,0.8)] text-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
                <div className="text-base sm:text-lg font-black text-purple-950 font-heading uppercase tracking-wide drop-shadow flex items-center justify-center gap-1.5">
                  <Crown className="w-5 h-5 text-purple-950 fill-purple-950" />
                  Congratulations!
                  <Crown className="w-5 h-5 text-purple-950 fill-purple-950" />
                </div>
              </motion.div>
            </div>

            {/* 8 Reward Icons in 4x2 Grid with Multipliers */}
            <div className="grid grid-cols-4 gap-2.5 w-full bg-[#1a082e]/90 p-3.5 rounded-3xl border border-amber-400/70 shadow-[0_0_35px_rgba(251,191,36,0.4)] backdrop-blur-md">
              {rewardGrid.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.06 + 0.1, type: 'spring' }}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${
                    item.highlight
                      ? 'bg-gradient-to-b from-amber-500/30 to-purple-900/60 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] ring-2 ring-amber-300'
                      : 'bg-purple-950/60 border-purple-800/60'
                  }`}
                >
                  {/* Multiplier Badge in Top Corner */}
                  <span
                    className={`absolute -top-1.5 -right-1 text-[9px] font-black px-1.5 py-0.2 rounded-full border shadow ${
                      item.highlight
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-purple-950 border-amber-200'
                        : 'bg-purple-900 text-amber-300 border-purple-700'
                    }`}
                  >
                    {item.multiplier}
                  </span>

                  {/* Icon */}
                  <span className="text-2xl select-none filter drop-shadow">
                    {item.icon}
                  </span>

                  {/* Name */}
                  <span className="text-[9px] font-bold text-white truncate max-w-full mt-1">
                    {item.name}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Auto Close Timer Bar */}
            <div className="mt-4 flex items-center justify-between w-full px-2 text-xs">
              <span className="text-purple-300 font-medium">
                Cinematic starts in: <strong className="text-amber-400">{closeCountdown}s</strong>
              </span>
              <button
                onClick={() => setPhase('cinematic')}
                className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-purple-950 font-black text-xs shadow-md hover:brightness-110 flex items-center gap-1"
              >
                <span>Play Now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* PHASE 3: FULL-SCREEN CINEMATIC ANIMATION                 */}
        {/* ======================================================== */}
        {phase === 'cinematic' && (
          <motion.div
            key="phase_cinematic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Audio Toggle control for video */}
            <div className="absolute bottom-6 right-6 z-40">
              <button
                onClick={() => {
                  setIsVideoMuted(!isVideoMuted);
                  if (videoRef.current) {
                    videoRef.current.muted = !isVideoMuted;
                  }
                }}
                className="p-2.5 rounded-full bg-black/70 border border-amber-400/60 text-amber-300 shadow-xl backdrop-blur-md hover:bg-black"
                title={isVideoMuted ? 'Unmute' : 'Mute'}
              >
                {isVideoMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {/* SCENE A: COSMIC LION / TIGER CINEMATIC CLIP */}
            {isLionOrTiger && (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src="/assets/gifts/cinematic_lion.mp4"
                  autoPlay
                  playsInline
                  muted={isVideoMuted}
                  className="w-full h-full object-cover filter contrast-110 brightness-105"
                  onEnded={onComplete}
                />

                {/* Electric Blue Lighting Trails and Glow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />

                {/* Roar Flame Vibration Flare */}
                <motion.div
                  animate={{ opacity: [0.1, 0.4, 0.1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-amber-600/20 mix-blend-screen pointer-events-none"
                />

                {/* Bottom Cinematic Badge */}
                <div className="absolute bottom-8 inset-x-4 flex flex-col items-center text-center z-30 pointer-events-none">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="px-5 py-2 rounded-2xl bg-black/75 border border-amber-400/80 shadow-[0_0_30px_rgba(251,191,36,0.6)] backdrop-blur-md"
                  >
                    <div className="text-base sm:text-xl font-black text-amber-300 font-heading tracking-widest uppercase flex items-center justify-center gap-2">
                      <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                      COSMIC ROARING LION KING
                      <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                    </div>
                    <div className="text-[11px] text-purple-200 mt-0.5">
                      Transferred to <strong className="text-white">{targetName}</strong> ({totalCoins.toLocaleString()} Coins)
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* SCENE B: ENCHANTED BUTTERFLY / JUNGLE AMBER CRYSTAL CLIP */}
            {isButterflyOrNature && (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src="/assets/gifts/cinematic_butterfly.mp4"
                  autoPlay
                  playsInline
                  muted={isVideoMuted}
                  className="w-full h-full object-cover filter contrast-105 brightness-110"
                  onEnded={onComplete}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />

                {/* Bottom Cinematic Badge */}
                <div className="absolute bottom-8 inset-x-4 flex flex-col items-center text-center z-30 pointer-events-none">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="px-5 py-2 rounded-2xl bg-black/75 border border-emerald-400/80 shadow-[0_0_30px_rgba(52,211,153,0.6)] backdrop-blur-md"
                  >
                    <div className="text-base sm:text-xl font-black text-emerald-300 font-heading tracking-widest uppercase flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-300 animate-spin" />
                      ENCHANTED AMBER BUTTERFLY JUNGLE
                      <Sparkles className="w-5 h-5 text-emerald-300 animate-spin" />
                    </div>
                    <div className="text-[11px] text-emerald-100 mt-0.5">
                      Transferred to <strong className="text-white">{targetName}</strong> ({totalCoins.toLocaleString()} Coins)
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* SCENE C: CUSTOM 3D LUXURY CINEMATIC FOR ALL OTHER VIP BIG GIFTS */}
            {!isLionOrTiger && !isButterflyOrNature && (
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#120326] via-[#090214] to-black">
                {/* 3D Depth Field Rings */}
                <motion.div
                  animate={{ scale: [0.9, 1.3, 0.9], rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-96 h-96 rounded-full border-4 border-dashed border-amber-400/40 pointer-events-none shadow-[0_0_60px_rgba(251,191,36,0.3)]"
                />
                <motion.div
                  animate={{ scale: [1.2, 0.8, 1.2], rotate: -360 }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-80 h-80 rounded-full border-2 border-purple-400/30 pointer-events-none"
                />

                {/* 3D Center Stage Hero */}
                <motion.div
                  initial={{ scale: 0.2, rotateY: 180, y: 80 }}
                  animate={{
                    scale: [0.2, 1.3, 1],
                    rotateY: [180, 0, 10, -10, 0],
                    y: [80, -20, 0],
                  }}
                  transition={{ duration: 1.4, type: 'spring', damping: 12 }}
                  className="relative z-30 flex flex-col items-center justify-center"
                  style={{ perspective: 1000 }}
                >
                  {/* Glowing 3D Pod Platform */}
                  <div
                    className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-[#2b0d4d] to-black border-4 flex items-center justify-center shadow-[0_0_80px_rgba(251,191,36,0.6)] relative"
                    style={{ borderColor: gift.color || '#FFD700' }}
                  >
                    <motion.div
                      animate={{
                        y: [-8, 8, -8],
                        rotateZ: [-4, 4, -4],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-8xl sm:text-9xl select-none filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
                    >
                      {gift.icon}
                    </motion.div>

                    {/* Orbiting Coin Particles */}
                    {[0, 72, 144, 216, 288].map((deg, i) => (
                      <motion.div
                        key={i}
                        animate={{ rotate: [deg, deg + 360] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 pointer-events-none flex items-start justify-center"
                      >
                        <div className="w-4 h-4 rounded-full bg-amber-400 border border-yellow-200 shadow-[0_0_12px_rgba(251,191,36,1)] -mt-2" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Title & Coin Value */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 px-6 py-2 rounded-2xl bg-black/80 border border-amber-400/80 shadow-[0_0_30px_rgba(251,191,36,0.6)] text-center backdrop-blur-md"
                  >
                    <div className="text-xl sm:text-2xl font-black text-white font-heading tracking-wide uppercase drop-shadow">
                      {gift.name}
                    </div>
                    <div className="text-xs text-amber-300 font-extrabold flex items-center justify-center gap-1 mt-1">
                      <Coins className="w-3.5 h-3.5" /> {totalCoins.toLocaleString()} Coins
                      <span className="text-purple-300 font-normal">| VIP {gift.rarity}</span>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};
