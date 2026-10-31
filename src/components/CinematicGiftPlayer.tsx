import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Active3DGiftPayload } from '../types';
import { soundService } from '../services/soundService';
import { Sparkles, X, Crown, ChevronRight, Volume2, VolumeX, Flame } from 'lucide-react';

export interface CinematicGiftPlayerProps {
  payload: Active3DGiftPayload | null;
  onComplete: () => void;
  onPhaseChange?: (phase: 'box_3d' | 'box_flash' | 'reveal_grid' | 'cinematic_video') => void;
}

interface RewardItem {
  id: string;
  name: string;
  icon: string;
  multiplier: string;
  highlight?: boolean;
}

export const CinematicGiftPlayer: React.FC<CinematicGiftPlayerProps> = ({
  payload,
  onComplete,
  onPhaseChange,
}) => {
  // 4 Steps:
  // Step 1: 'box_3d' (0 - 3s) -> 3D purple-gold box rotating with '?'
  // Step 2: 'box_flash' (3 - 4s) -> White flash explosion burst
  // Step 3: 'reveal_grid' (4 - 8s) -> Congratulations banner + 8 rewards grid
  // Step 4: 'cinematic_video' (8 - 18s) -> Full-screen real video playback
  const [step, setStep] = useState<'box_3d' | 'box_flash' | 'reveal_grid' | 'cinematic_video'>('box_3d');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [countdown, setCountdown] = useState(4);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [cameraShake, setCameraShake] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Notify parent of phase changes (e.g. for background video in room)
  useEffect(() => {
    onPhaseChange?.(step);
  }, [step, onPhaseChange]);

  // Elapsed timer for unskippable 2s rule & step progress
  useEffect(() => {
    if (!payload) {
      setElapsedSeconds(0);
      setStep('box_3d');
      setVideoError(false);
      return;
    }

    setElapsedSeconds(0);
    setStep('box_3d');
    setCountdown(4);
    setVideoError(false);

    // Audio for Step 1
    soundService.playMysteryBoxHum();

    const secondInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // Step 2 at 3.0s: Flash explosion
    const tFlash = setTimeout(() => {
      setStep('box_flash');
      soundService.playBoxExplosion();
    }, 3000);

    // Step 3 at 3.8s: Reveal Grid
    const tGrid = setTimeout(() => {
      setStep('reveal_grid');
      soundService.playGiftFanfare();
    }, 3800);

    return () => {
      clearInterval(secondInterval);
      clearTimeout(tFlash);
      clearTimeout(tGrid);
    };
  }, [payload]);

  // Step 3 Countdown timer (4s -> 0s) then transition to Step 4
  useEffect(() => {
    if (step !== 'reveal_grid') return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setStep('cinematic_video');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  // Step 4: Cinematic Video audio & duration handling
  useEffect(() => {
    if (step !== 'cinematic_video' || !payload) return;

    const giftId = (payload.gift.id || '').toLowerCase();
    const animType = (payload.gift['3dAnimationType'] || payload.gift.animationType || '').toLowerCase();
    const giftName = (payload.gift.name || '').toLowerCase();

    const isLion = giftId.includes('lion') || giftId.includes('tiger') || animType.includes('lion') || giftName.includes('lion') || giftName.includes('tiger');
    const isButterfly = giftId.includes('butterfly') || animType.includes('butterfly') || giftName.includes('butterfly') || giftName.includes('jungle');

    if (isLion) {
      soundService.playLionRoarSound();
      // Screen shake when lion roars
      const shakeT = setTimeout(() => {
        setCameraShake(true);
        setTimeout(() => setCameraShake(false), 900);
      }, 4500);
      return () => clearTimeout(shakeT);
    } else if (isButterfly) {
      soundService.playNatureChimeSound();
    } else {
      soundService.playVIP3DGiftSound(payload.gift.rarity);
    }

    // Auto complete after 10 seconds of cinematic (8s to 18s total)
    const endT = setTimeout(() => {
      onComplete();
    }, 10000);

    return () => clearTimeout(endT);
  }, [step, payload, onComplete]);

  // Particle Canvas for Bokeh / Stardust / Money Rain
  useEffect(() => {
    if (!payload) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const isMoney = (payload.gift.name || '').toLowerCase().includes('money');

    // Particles
    const count = isMoney ? 60 : 45;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: isMoney ? Math.random() * 8 + 6 : Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 1.5,
      speedY: isMoney ? Math.random() * 3 + 2 : -Math.random() * 2 - 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      rotation: Math.random() * 360,
      char: isMoney ? (Math.random() > 0.5 ? '💵' : '🪙') : null,
      color: ['#FBBF24', '#F59E0B', '#A855F7', '#EC4899', '#38BDF8', '#FFFFFF'][
        Math.floor(Math.random() * 6)
      ],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (isMoney) {
          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          ctx.font = `${p.size * 2}px sans-serif`;
          ctx.fillText(p.char || '🪙', p.x, p.y);
        } else {
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
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [payload, step]);

  if (!payload) return null;

  const { gift, sender, targetName, quantity } = payload;
  const giftId = (gift.id || '').toLowerCase();
  const animType = (gift['3dAnimationType'] || gift.animationType || '').toLowerCase();
  const giftName = (gift.name || '').toLowerCase();

  // Determine video asset & fallbacks
  const isLionOrTiger =
    giftId.includes('lion') ||
    giftId.includes('tiger') ||
    animType.includes('lion') ||
    giftName.includes('lion') ||
    giftName.includes('tiger');

  const isButterflyOrNature =
    giftId.includes('butterfly') ||
    animType.includes('butterfly') ||
    giftName.includes('butterfly') ||
    giftName.includes('rose') ||
    giftName.includes('jungle');

  const isFerrari =
    giftId.includes('ferrari') ||
    animType.includes('ferrari') ||
    giftName.includes('ferrari') ||
    giftName.includes('bike');

  const isUniverse =
    giftId.includes('universe') ||
    animType.includes('universe') ||
    giftName.includes('universe') ||
    giftName.includes('galaxy');

  // Video paths with guaranteed working local files and online fallbacks
  let videoSrc = '/assets/gifts/cinematic_lion.mp4';
  let fallbackGif = 'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif';

  if (isLionOrTiger) {
    videoSrc = '/assets/gifts/cinematic_lion.mp4';
    fallbackGif = 'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif';
  } else if (isButterflyOrNature) {
    videoSrc = '/assets/gifts/cinematic_butterfly.mp4';
    fallbackGif = 'https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif';
  } else if (isFerrari) {
    videoSrc = 'https://cdn.pixabay.com/video/2019/10/17/28090-367411065_large.mp4';
    fallbackGif = 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif';
  } else if (isUniverse) {
    videoSrc = 'https://cdn.pixabay.com/video/2023/06/23/168447-839221898_large.mp4';
    fallbackGif = 'https://media.giphy.com/media/3ov9jZafE8K0S8qFPy/giphy.gif';
  }

  // 8 Reward icons for the reveal grid matching video reference
  const rewardGrid: RewardItem[] = [
    { id: 'r1', name: gift.name || 'Jackpot', icon: gift.icon || '🎁', multiplier: 'x8', highlight: true },
    { id: 'r2', name: 'Lion King', icon: '🦁', multiplier: 'x6' },
    { id: 'r3', name: 'Diamond Ring', icon: '💍', multiplier: 'x3' },
    { id: 'r4', name: 'VIP Crown', icon: '👑', multiplier: 'x2' },
    { id: 'r5', name: 'Ferrari', icon: '🏎️', multiplier: 'x2' },
    { id: 'r6', name: 'Royal Castle', icon: '🏰', multiplier: 'x1' },
    { id: 'r7', name: 'Fire Dragon', icon: '🐉', multiplier: 'x1' },
    { id: 'r8', name: 'Universe', icon: '🌌', multiplier: 'x1' },
  ];

  const isSkippable = elapsedSeconds >= 2;

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden flex flex-col items-center justify-center select-none pointer-events-auto ${
        cameraShake ? 'animate-[bounce_0.15s_infinite]' : ''
      }`}
    >
      {/* Particle Canvas for ambient sparks */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10 w-full h-full" />

      {/* Dimmed backdrop when not in video phase */}
      {step !== 'cinematic_video' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm -z-10 transition-opacity duration-500" />
      )}

      {/* ======================================================== */}
      {/* TOP BAR: Sender info + Skip Button (unskippable for 2s)  */}
      {/* ======================================================== */}
      <div className="absolute top-14 sm:top-16 inset-x-3 z-50 flex items-center justify-between pointer-events-auto max-w-lg mx-auto">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1b0833]/90 border border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.6)] backdrop-blur-md"
        >
          <img
            src={sender.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
            alt={sender.name}
            className="w-7 h-7 rounded-full border-2 border-amber-400 object-cover"
          />
          <div className="text-left text-xs leading-tight pr-1">
            <span className="font-extrabold text-amber-300 flex items-center gap-1 drop-shadow">
              <Crown className="w-3 h-3 text-amber-400" /> {sender.name}
            </span>
            <span className="text-[10px] text-purple-200">
              sent <strong className="text-white">{quantity}x Mystery Gift Box ({gift.name})</strong> to {targetName}
            </span>
          </div>
        </motion.div>

        {/* Skip button with 2-second lock constraint */}
        <button
          onClick={() => {
            if (isSkippable) onComplete();
          }}
          disabled={!isSkippable}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 backdrop-blur-md shadow-lg ${
            isSkippable
              ? 'bg-black/75 border border-amber-400/80 text-amber-300 hover:text-white hover:bg-black/95 active:scale-95'
              : 'bg-black/40 border border-white/20 text-purple-400/60 cursor-not-allowed'
          }`}
          title={isSkippable ? 'Skip Animation' : 'Skippable in 2s'}
        >
          <span>{isSkippable ? 'Skip' : `Skip (${2 - elapsedSeconds}s)`}</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* STEP 1: 3D ROTATING PURPLE-GOLD MYSTERY BOX (0 - 3s)     */}
      {/* ======================================================== */}
      {step === 'box_3d' && (
        <motion.div
          key="step_box"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          className="relative z-20 flex flex-col items-center justify-center"
          style={{ perspective: 1200 }}
        >
          {/* Outer glowing particle rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border-2 border-dashed border-amber-400/60 pointer-events-none shadow-[0_0_50px_rgba(251,191,36,0.4)]"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
            className="absolute w-60 h-60 rounded-full border border-purple-400/50 pointer-events-none"
          />

          {/* 3D Box shaking & rotating */}
          <motion.div
            animate={{
              rotateY: [0, 180, 360],
              x: [-4, 4, -3, 3, 0],
              y: [0, -12, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{
              rotateY: { duration: 3, repeat: Infinity, ease: 'linear' },
              x: { duration: 0.25, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl bg-gradient-to-tr from-[#2d094d] via-[#5b148c] to-[#9333ea] border-4 border-amber-400 shadow-[0_0_70px_rgba(251,191,36,0.8),inset_0_0_30px_rgba(255,215,0,0.5)] flex flex-col items-center justify-center p-4"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Golden Question Mark with pulse */}
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                filter: [
                  'drop-shadow(0 0 10px rgba(251,191,36,0.8))',
                  'drop-shadow(0 0 30px rgba(251,191,36,1))',
                  'drop-shadow(0 0 10px rgba(251,191,36,0.8))',
                ],
              }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="text-7xl sm:text-8xl font-black text-amber-300 font-heading select-none"
            >
              ?
            </motion.div>

            {/* Ribbons */}
            <div className="absolute inset-x-0 h-4 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 shadow-md pointer-events-none" />
            <div className="absolute inset-y-0 w-4 bg-gradient-to-b from-amber-500 via-yellow-300 to-amber-500 shadow-md pointer-events-none" />
            <div className="absolute -top-3 w-12 h-6 rounded-full bg-amber-400 border-2 border-yellow-200 shadow-[0_0_15px_rgba(251,191,36,1)] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-purple-950 fill-purple-950" />
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="mt-6 px-5 py-1.5 rounded-full bg-[#18052a]/95 border border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.6)] text-center"
          >
            <span className="text-xs sm:text-sm font-black text-amber-300 font-heading tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" /> Unlocking Mystery Box...
            </span>
          </motion.div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* STEP 2: BURST LIGHT FLASH DIV (3 - 4s)                   */}
      {/* ======================================================== */}
      {step === 'box_flash' && (
        <motion.div
          key="step_flash"
          initial={{ scale: 0.1, opacity: 1 }}
          animate={{ scale: [0.1, 3.5], opacity: [1, 0.9, 0] }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 bg-gradient-to-r from-yellow-100 via-white to-amber-200 pointer-events-none z-40 flex items-center justify-center"
        />
      )}

      {/* ======================================================== */}
      {/* STEP 3: CONGRATULATIONS & 8 REWARDS GRID (4 - 8s)        */}
      {/* ======================================================== */}
      {step === 'reveal_grid' && (
        <motion.div
          key="step_grid"
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
          transition={{ type: 'spring', damping: 14, stiffness: 170 }}
          className="relative z-30 w-full max-w-sm px-4 flex flex-col items-center pointer-events-auto"
        >
          {/* Top Golden Light Rays */}
          <div className="absolute -top-16 w-72 h-72 rounded-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 filter blur-2xl pointer-events-none -z-10 animate-pulse" />

          {/* Golden Banner */}
          <div className="w-full relative mb-4">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative mx-auto max-w-[280px] py-2 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 border-2 border-yellow-200 shadow-[0_0_40px_rgba(251,191,36,0.9)] text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
              <div className="text-base sm:text-lg font-black text-purple-950 font-heading uppercase tracking-wider drop-shadow flex items-center justify-center gap-1.5">
                <Crown className="w-5 h-5 text-purple-950 fill-purple-950" />
                Congratulations!
                <Crown className="w-5 h-5 text-purple-950 fill-purple-950" />
              </div>
            </motion.div>
          </div>

          {/* 8 Reward Icons in Grid */}
          <div className="grid grid-cols-4 gap-2.5 w-full bg-[#1b0833]/95 p-3.5 rounded-3xl border border-amber-400/80 shadow-[0_0_40px_rgba(251,191,36,0.5)] backdrop-blur-md">
            {rewardGrid.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.05 + 0.1, type: 'spring' }}
                className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${
                  item.highlight
                    ? 'bg-gradient-to-b from-amber-500/30 to-purple-900/70 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.7)] ring-2 ring-amber-300'
                    : 'bg-purple-950/60 border-purple-800/60'
                }`}
              >
                <span
                  className={`absolute -top-1.5 -right-1 text-[9px] font-black px-1.5 py-0.2 rounded-full border shadow ${
                    item.highlight
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-purple-950 border-amber-200'
                      : 'bg-purple-900 text-amber-300 border-purple-700'
                  }`}
                >
                  {item.multiplier}
                </span>
                <span className="text-2xl select-none filter drop-shadow">{item.icon}</span>
                <span className="text-[9px] font-bold text-white truncate max-w-full mt-1">
                  {item.name}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Auto Close Timer Bar */}
          <div className="mt-4 flex items-center justify-between w-full px-2 text-xs">
            <span className="text-purple-200 font-medium">
              Cinematic starts in: <strong className="text-amber-400 font-bold">{countdown}s</strong>
            </span>
            <button
              onClick={() => setStep('cinematic_video')}
              className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-purple-950 font-black text-xs shadow-md hover:brightness-110 flex items-center gap-1 active:scale-95"
            >
              <span>Play Now</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* STEP 4: FULL-SCREEN CINEMATIC VIDEO (8 - 18s)            */}
      {/* ======================================================== */}
      {step === 'cinematic_video' && (
        <motion.div
          key="step_cinematic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden bg-black"
        >
          {/* Audio toggle button */}
          <div className="absolute bottom-6 right-6 z-40">
            <button
              onClick={() => {
                setIsVideoMuted(!isVideoMuted);
                if (videoRef.current) {
                  videoRef.current.muted = !isVideoMuted;
                }
              }}
              className="p-2.5 rounded-full bg-black/75 border border-amber-400/80 text-amber-300 shadow-xl backdrop-blur-md hover:bg-black"
              title={isVideoMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isVideoMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* REAL FULL-SCREEN VIDEO PLAYER */}
          {!videoError ? (
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              playsInline
              loop
              muted={isVideoMuted}
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover filter contrast-110 brightness-105"
            />
          ) : (
            /* Fallback high-quality GIF if video fails to load */
            <img
              src={fallbackGif}
              alt={gift.name}
              className="w-full h-full object-cover filter contrast-110 brightness-105"
            />
          )}

          {/* Dark gradient overlay so top avatars and seats stay clearly visible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />

          {/* Electric Blue / Golden particles aura for cosmic lion or enchanted butterfly */}
          {isLionOrTiger && (
            <motion.div
              animate={{ opacity: [0.15, 0.45, 0.15] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-blue-600/25 via-purple-600/20 to-amber-600/25 mix-blend-screen pointer-events-none"
            />
          )}

          {isButterflyOrNature && (
            <motion.div
              animate={{ opacity: [0.15, 0.4, 0.15] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-yellow-500/20 to-pink-500/20 mix-blend-screen pointer-events-none"
            />
          )}

          {/* Bottom VIP Badge */}
          <div className="absolute bottom-8 inset-x-4 flex flex-col items-center text-center z-30 pointer-events-none">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="px-5 py-2.5 rounded-2xl bg-black/80 border border-amber-400/80 shadow-[0_0_35px_rgba(251,191,36,0.7)] backdrop-blur-md"
            >
              <div className="text-base sm:text-xl font-black text-amber-300 font-heading tracking-widest uppercase flex items-center justify-center gap-2">
                <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                {isLionOrTiger
                  ? 'COSMIC ROARING LION KING 🦁'
                  : isButterflyOrNature
                  ? 'ENCHANTED AMBER BUTTERFLY 🦋'
                  : isFerrari
                  ? 'SUPERCAR VIP SPEED 🏎️'
                  : isUniverse
                  ? 'CELESTIAL COSMIC UNIVERSE 🌌'
                  : `${gift.name.toUpperCase()} VIP 👑`}
                <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <div className="text-xs text-purple-200 mt-0.5">
                Sent to <strong className="text-white">{targetName}</strong> ({((gift.coinValue || 1000) * quantity).toLocaleString()} Coins)
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
