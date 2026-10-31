import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Active3DGiftPayload } from '../types';
import { Sparkles, X, Crown, ChevronRight, Flame } from 'lucide-react';

export interface CinematicGiftPlayerProps {
  payload: Active3DGiftPayload | null;
  onComplete: () => void;
  onPhaseChange?: (phase: 'box_3d' | 'box_flash' | 'reveal_grid' | 'cinematic') => void;
}

interface RewardCircleItem {
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
  // Steps:
  // 'box_3d' (0 - 3s): 3D CSS Cube rotating with '?'
  // 'box_flash' (3 - 3.8s): White flash div scaling 0 to 5
  // 'reveal_grid' (3.8 - 7.5s): Clean Congratulations panel with 8 reward circles
  // 'cinematic' (7.5 - 16s): 100% Silent pure CSS + Canvas 3D particle animation
  const [step, setStep] = useState<'box_3d' | 'box_flash' | 'reveal_grid' | 'cinematic'>('box_3d');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [countdown, setCountdown] = useState(4);
  const [cameraShake, setCameraShake] = useState(false);
  const [lionStage, setLionStage] = useState<'sleep' | 'eyes_glow' | 'stand' | 'roar'>('sleep');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Notify parent component of current phase
  useEffect(() => {
    onPhaseChange?.(step);
  }, [step, onPhaseChange]);

  // 100 Star particles for deep space background
  const starField = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => ({
      id: i,
      left: `${(i * 19.7) % 100}%`,
      top: `${(i * 23.3) % 100}%`,
      size: (i % 3) + 1.5,
      delay: (i % 20) * 0.15,
      duration: 1.5 + (i % 4) * 0.6,
      color: i % 3 === 0 ? '#60A5FA' : i % 3 === 1 ? '#C084FC' : '#FDE047',
    }));
  }, []);

  // Sequence controller (100% SILENT - NO AUDIO AT ALL)
  useEffect(() => {
    if (!payload) {
      setElapsedSeconds(0);
      setStep('box_3d');
      setLionStage('sleep');
      setCameraShake(false);
      return;
    }

    setElapsedSeconds(0);
    setStep('box_3d');
    setCountdown(4);
    setLionStage('sleep');
    setCameraShake(false);

    // Elapsed timer for 2-second unskippable rule
    const secTimer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // Step 2: Explosion flash at 3.0s
    const tFlash = setTimeout(() => {
      setStep('box_flash');
    }, 3000);

    // Step 3: Congratulations grid at 3.8s
    const tGrid = setTimeout(() => {
      setStep('reveal_grid');
    }, 3800);

    return () => {
      clearInterval(secTimer);
      clearTimeout(tFlash);
      clearTimeout(tGrid);
    };
  }, [payload]);

  // Countdown in Step 3 before transitioning to Step 4
  useEffect(() => {
    if (step !== 'reveal_grid') return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setStep('cinematic');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  // Lion animation sub-stages in Step 4:
  // 0 - 1.5s: Sleep fading in
  // 1.5 - 3s: Eyes glow with electric cyan
  // 3s - 5s: Stands upright
  // 5s+: Roars (scale 1 to 1.2 with shake) + emits golden particles
  useEffect(() => {
    if (step !== 'cinematic') return;

    const t1 = setTimeout(() => setLionStage('eyes_glow'), 1200);
    const t2 = setTimeout(() => setLionStage('stand'), 2600);
    const t3 = setTimeout(() => {
      setLionStage('roar');
      setCameraShake(true);
      setTimeout(() => setCameraShake(false), 1200);
    }, 4200);

    // Complete after 9.5s of cinematic animation
    const tEnd = setTimeout(() => {
      onComplete();
    }, 9500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(tEnd);
    };
  }, [step, onComplete]);

  // Canvas particle system (clean sparks, electric particles, money or stardust)
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

    const giftName = (payload.gift.name || '').toLowerCase();
    const isMoney = giftName.includes('money');
    const isLion = giftName.includes('lion') || giftName.includes('tiger');

    const particleCount = isMoney ? 60 : 70;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: isMoney ? Math.random() * 8 + 6 : Math.random() * 3 + 1.2,
      speedX: (Math.random() - 0.5) * (isLion ? 2.5 : 1.5),
      speedY: isMoney ? Math.random() * 3 + 2 : (Math.random() - 0.5) * 2 - 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      color: isLion
        ? ['#38BDF8', '#818CF8', '#FBBF24', '#F59E0B', '#FFFFFF'][Math.floor(Math.random() * 5)]
        : ['#FBBF24', '#F59E0B', '#A855F7', '#EC4899', '#38BDF8', '#FFFFFF'][
            Math.floor(Math.random() * 6)
          ],
      char: isMoney ? (Math.random() > 0.5 ? '💵' : '🪙') : null,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Center radial glow
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        30,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.5
      );
      grad.addColorStop(0, isLion ? 'rgba(56, 189, 248, 0.15)' : 'rgba(251, 191, 36, 0.14)');
      grad.addColorStop(0.6, 'rgba(147, 51, 234, 0.06)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Render floating particle sparks
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
          if (p.y < 0) p.y = height + 5;
          if (p.y > height) p.y = -5;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.shadowBlur = 10;
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
  const giftName = (gift.name || '').toLowerCase();
  const giftId = (gift.id || '').toLowerCase();

  const isLionOrTiger = giftName.includes('lion') || giftName.includes('tiger') || giftId.includes('lion') || giftId.includes('tiger');
  const isButterflyOrNature = giftName.includes('butterfly') || giftName.includes('rose') || giftName.includes('jungle');
  const isFerrari = giftName.includes('ferrari') || giftName.includes('bike');
  const isUniverse = giftName.includes('universe') || giftName.includes('galaxy');
  const isMoney = giftName.includes('money');

  // 8 Reward circles for Step 3 Congratulations panel
  const rewardCircles: RewardCircleItem[] = [
    { id: 'r1', name: gift.name, icon: gift.icon, multiplier: 'x8', highlight: true },
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
      className={`fixed inset-0 z-[9999] overflow-hidden flex flex-col items-center justify-center select-none bg-black pointer-events-auto ${
        cameraShake ? 'animate-[bounce_0.15s_infinite]' : ''
      }`}
    >
      {/* 100 Twinkling Background Stars */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {starField.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full animate-pulse"
            style={{
              left: s.left,
              top: s.top,
              width: `${s.size}px`,
              height: `${s.size}px`,
              backgroundColor: s.color,
              boxShadow: `0 0 6px ${s.color}`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Canvas for particle sparks */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10 w-full h-full" />

      {/* Golden/Purple radial ambient atmosphere */}
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 via-purple-950/25 to-black pointer-events-none z-5" />

      {/* ======================================================== */}
      {/* TOP BAR: Sender info + Skip button (2s lock)             */}
      {/* ======================================================== */}
      <div className="absolute top-12 sm:top-14 inset-x-3 z-50 flex items-center justify-between pointer-events-auto max-w-lg mx-auto">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1b0833]/95 border border-amber-400/90 shadow-[0_0_25px_rgba(251,191,36,0.6)] backdrop-blur-md"
        >
          <img
            src={sender.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
            alt={sender.name}
            className="w-7 h-7 rounded-full border-2 border-amber-400 object-cover shrink-0"
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

        {/* Skip button with 2s lock */}
        <button
          onClick={() => {
            if (isSkippable) onComplete();
          }}
          disabled={!isSkippable}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 backdrop-blur-md shadow-lg ${
            isSkippable
              ? 'bg-black/80 border border-amber-400/90 text-amber-300 hover:text-white hover:bg-black active:scale-95'
              : 'bg-black/40 border border-white/20 text-purple-400/60 cursor-not-allowed'
          }`}
          title={isSkippable ? 'Skip Animation' : 'Skippable in 2s'}
        >
          <span>{isSkippable ? 'Skip' : `Skip (${2 - elapsedSeconds}s)`}</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* STEP 1: 3D PURPLE-GOLD MYSTERY BOX CUBE (0 - 3s)         */}
      {/* ======================================================== */}
      {step === 'box_3d' && (
        <motion.div
          key="step1_box"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.3 }}
          className="relative z-30 flex flex-col items-center justify-center"
          style={{ perspective: 1200 }}
        >
          {/* Blue/Gold Energy Circling Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border-2 border-dashed border-amber-400/70 pointer-events-none shadow-[0_0_50px_rgba(251,191,36,0.5)]"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute w-60 h-60 rounded-full border border-cyan-400/50 pointer-events-none shadow-[0_0_30px_rgba(6,182,212,0.4)]"
          />

          {/* 3D Rotating & Shaking Mystery Cube made with pure CSS divs */}
          <motion.div
            animate={{
              rotateY: [0, 180, 360],
              x: [-4, 4, -4, 4, 0],
              y: [0, -12, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{
              rotateY: { duration: 3, repeat: Infinity, ease: 'linear' },
              x: { duration: 0.2, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl bg-gradient-to-tr from-[#2d094d] via-[#5c138b] to-[#9333ea] border-4 border-amber-400 shadow-[0_0_70px_rgba(251,191,36,0.85),inset_0_0_35px_rgba(255,215,0,0.6)] flex flex-col items-center justify-center p-4"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Pulsing Golden ? in Center */}
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                filter: [
                  'drop-shadow(0 0 10px rgba(251,191,36,0.8))',
                  'drop-shadow(0 0 35px rgba(251,191,36,1))',
                  'drop-shadow(0 0 10px rgba(251,191,36,0.8))',
                ],
              }}
              transition={{ duration: 1.1, repeat: Infinity }}
              className="text-7xl sm:text-8xl font-black text-amber-300 font-heading select-none"
            >
              ?
            </motion.div>

            {/* Golden Ribbons */}
            <div className="absolute inset-x-0 h-4 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 shadow-md pointer-events-none" />
            <div className="absolute inset-y-0 w-4 bg-gradient-to-b from-amber-500 via-yellow-300 to-amber-500 shadow-md pointer-events-none" />
            <div className="absolute -top-3 w-12 h-6 rounded-full bg-amber-400 border-2 border-yellow-200 shadow-[0_0_15px_rgba(251,191,36,1)] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-purple-950 fill-purple-950" />
            </div>
          </motion.div>

          {/* Unlocking label */}
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="mt-6 px-5 py-1.5 rounded-full bg-[#18052a]/95 border border-amber-400/90 shadow-[0_0_25px_rgba(251,191,36,0.6)] text-center"
          >
            <span className="text-xs sm:text-sm font-black text-amber-300 font-heading tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" /> Unlocking Mystery Box...
            </span>
          </motion.div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* STEP 2: WHITE FLASH BURST DIV (3 - 3.8s) SCALING 0 TO 5  */}
      {/* ======================================================== */}
      {step === 'box_flash' && (
        <motion.div
          key="step2_flash"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [0, 5], opacity: [1, 0.9, 0] }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 bg-white pointer-events-none z-40 flex items-center justify-center"
        />
      )}

      {/* ======================================================== */}
      {/* STEP 3: CONGRATULATIONS & 8 REWARDS CIRCLES (3.8 - 7.5s) */}
      {/* ======================================================== */}
      {step === 'reveal_grid' && (
        <motion.div
          key="step3_grid"
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.15, filter: 'blur(8px)' }}
          transition={{ type: 'spring', damping: 14, stiffness: 170 }}
          className="relative z-30 w-full max-w-sm px-4 flex flex-col items-center pointer-events-auto"
        >
          {/* Top Golden Light Rays */}
          <div className="absolute -top-16 w-72 h-72 rounded-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 filter blur-2xl pointer-events-none -z-10 animate-pulse" />

          {/* "Congratulations!" Gold Banner */}
          <div className="w-full relative mb-4">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative mx-auto max-w-[280px] py-2 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 border-2 border-yellow-200 shadow-[0_0_40px_rgba(251,191,36,0.95)] text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
              <div className="text-base sm:text-lg font-black text-purple-950 font-heading uppercase tracking-wider drop-shadow flex items-center justify-center gap-1.5">
                <Crown className="w-5 h-5 text-purple-950 fill-purple-950" />
                Congratulations!
                <Crown className="w-5 h-5 text-purple-950 fill-purple-950" />
              </div>
            </motion.div>
          </div>

          {/* 8 Reward Circles Grid */}
          <div className="grid grid-cols-4 gap-2.5 w-full bg-[#1b0833]/95 p-3.5 rounded-3xl border border-amber-400/80 shadow-[0_0_40px_rgba(251,191,36,0.5)] backdrop-blur-md">
            {rewardCircles.map((item, idx) => (
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

          {/* Countdown timer & Play Now button */}
          <div className="mt-4 flex items-center justify-between w-full px-2 text-xs">
            <span className="text-purple-200 font-medium">
              Cinematic starts in: <strong className="text-amber-400 font-bold">{countdown}s</strong>
            </span>
            <button
              onClick={() => setStep('cinematic')}
              className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-purple-950 font-black text-xs shadow-md hover:brightness-110 flex items-center gap-1 active:scale-95"
            >
              <span>Play Now</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* STEP 4: CLEAN 3D CSS + PARTICLES ANIMATION (7.5 - 16s)   */}
      {/* (NO VIDEO, NO WATERMARK, NO OTHER USERS, 100% SILENT)   */}
      {/* ======================================================== */}
      {step === 'cinematic' && (
        <motion.div
          key="step4_cinematic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-30 w-full h-full flex flex-col items-center justify-center"
        >
          {/* ==================================================== */}
          {/* SCENE A: PURE CSS + CANVAS 3D LION KING / TIGER      */}
          {/* ==================================================== */}
          {isLionOrTiger && (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {/* Outer Blue Energy Ring with border animation */}
              <motion.div
                animate={{ rotate: 360, scale: [0.95, 1.05, 0.95] }}
                transition={{
                  rotate: { duration: 6, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
                }}
                className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full border-4 border-dashed border-cyan-400/80 pointer-events-none shadow-[0_0_60px_rgba(6,182,212,0.6)]"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
                className="absolute w-72 h-72 sm:w-84 sm:h-84 rounded-full border-2 border-indigo-500/60 pointer-events-none shadow-[0_0_35px_rgba(99,102,241,0.5)]"
              />

              {/* Lion Stage Hero: Sleeping -> Eyes Glow -> Stand -> Roar */}
              <motion.div
                animate={{
                  scale: lionStage === 'roar' ? [1, 1.25, 1.2] : lionStage === 'stand' ? 1.08 : 1,
                  y: lionStage === 'sleep' ? 15 : lionStage === 'stand' ? -10 : -15,
                }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="relative flex flex-col items-center justify-center z-20"
              >
                {/* Golden Crown floating down onto Lion */}
                <motion.div
                  initial={{ y: -60, opacity: 0, scale: 0.5 }}
                  animate={{
                    y: lionStage === 'roar' || lionStage === 'stand' ? -20 : -50,
                    opacity: lionStage === 'roar' || lionStage === 'stand' ? 1 : 0.4,
                    scale: lionStage === 'roar' ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.8, type: 'spring' }}
                  className="relative z-30 mb-1"
                >
                  <Crown className="w-14 h-14 sm:w-16 sm:h-16 text-amber-400 fill-amber-300 filter drop-shadow-[0_0_20px_rgba(251,191,36,1)] animate-bounce" />
                </motion.div>

                {/* 3D Lion Visual Graphic */}
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-[#0a192f]/90 via-[#0f274a]/90 to-[#1e1b4b]/90 border-4 border-cyan-400 shadow-[0_0_70px_rgba(6,182,212,0.8),inset_0_0_40px_rgba(6,182,212,0.5)] flex items-center justify-center overflow-hidden">
                  {/* Clean 3D Lion PNG Graphic */}
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/1998/1998610.png"
                    alt="Cosmic Lion King"
                    className={`w-40 h-40 sm:w-44 sm:h-44 object-contain filter transition-all duration-700 select-none ${
                      lionStage === 'roar'
                        ? 'brightness-125 contrast-125 scale-110 drop-shadow-[0_0_25px_rgba(6,182,212,1)]'
                        : lionStage === 'eyes_glow' || lionStage === 'stand'
                        ? 'brightness-110 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                        : 'brightness-75 opacity-80'
                    }`}
                  />

                  {/* Electric Eyes Glow Overlay */}
                  {(lionStage === 'eyes_glow' || lionStage === 'stand' || lionStage === 'roar') && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_15px_#22d3ee] mr-6 -mt-3 animate-ping" />
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_15px_#22d3ee] ml-6 -mt-3 animate-ping" />
                    </div>
                  )}

                  {/* Roar Flame Vibration effect */}
                  {lionStage === 'roar' && (
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 0.4, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-t from-cyan-400/30 via-amber-400/20 to-transparent mix-blend-screen pointer-events-none"
                    />
                  )}
                </div>
              </motion.div>

              {/* Bottom VIP Title Banner */}
              <div className="absolute bottom-10 inset-x-4 flex flex-col items-center text-center z-30 pointer-events-none">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="px-6 py-2.5 rounded-2xl bg-black/85 border border-cyan-400/90 shadow-[0_0_35px_rgba(6,182,212,0.8)] backdrop-blur-md"
                >
                  <div className="text-base sm:text-xl font-black text-cyan-300 font-heading tracking-widest uppercase flex items-center justify-center gap-2">
                    <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                    COSMIC ROARING LION KING 🦁
                    <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                  </div>
                  <div className="text-xs text-purple-200 mt-0.5">
                    Transferred to <strong className="text-white">{targetName}</strong> ({((gift.coinValue || 4000) * quantity).toLocaleString()} Coins)
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SCENE B: ENCHANTED AMBER BUTTERFLY / JUNGLE          */}
          {/* ==================================================== */}
          {isButterflyOrNature && !isLionOrTiger && (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {/* Golden Floral Energy Rings */}
              <motion.div
                animate={{ rotate: 360, scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full border-4 border-dashed border-emerald-400/70 pointer-events-none shadow-[0_0_50px_rgba(52,211,153,0.5)]"
              />

              {/* Luminous Amber Orb Pedestal */}
              <motion.div
                animate={{ y: [-8, 8, -8], scale: [1, 1.06, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 border-4 border-yellow-200 shadow-[0_0_80px_rgba(251,191,36,0.9),inset_0_0_40px_rgba(255,255,255,0.7)] flex items-center justify-center"
              >
                <span className="text-8xl sm:text-9xl filter drop-shadow-[0_0_25px_rgba(0,0,0,0.6)] animate-pulse">
                  🦋
                </span>
              </motion.div>

              <div className="absolute bottom-10 inset-x-4 flex flex-col items-center text-center z-30 pointer-events-none">
                <div className="px-6 py-2.5 rounded-2xl bg-black/85 border border-emerald-400/90 shadow-[0_0_35px_rgba(52,211,153,0.8)] backdrop-blur-md">
                  <div className="text-base sm:text-xl font-black text-emerald-300 font-heading tracking-widest uppercase flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" />
                    ENCHANTED AMBER BUTTERFLY 🦋
                    <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" />
                  </div>
                  <div className="text-xs text-purple-200 mt-0.5">
                    Transferred to <strong className="text-white">{targetName}</strong> ({((gift.coinValue || 300) * quantity).toLocaleString()} Coins)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SCENE C: FERRARI / SUPERCAR VIP                      */}
          {/* ==================================================== */}
          {isFerrari && !isLionOrTiger && !isButterflyOrNature && (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <motion.div
                animate={{ x: [-20, 20, -20], scale: [1, 1.08, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-red-900 via-rose-600 to-amber-500 border-4 border-red-400 shadow-[0_0_80px_rgba(239,68,68,0.9)] flex items-center justify-center"
              >
                <span className="text-8xl sm:text-9xl filter drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                  🏎️
                </span>
              </motion.div>

              <div className="absolute bottom-10 inset-x-4 flex flex-col items-center text-center z-30 pointer-events-none">
                <div className="px-6 py-2.5 rounded-2xl bg-black/85 border border-red-500/90 shadow-[0_0_35px_rgba(239,68,68,0.8)] backdrop-blur-md">
                  <div className="text-base sm:text-xl font-black text-rose-300 font-heading tracking-widest uppercase flex items-center justify-center gap-2">
                    <Flame className="w-5 h-5 text-red-500 animate-pulse" />
                    SUPERCAR VIP FERRARI 🏎️
                    <Flame className="w-5 h-5 text-red-500 animate-pulse" />
                  </div>
                  <div className="text-xs text-purple-200 mt-0.5">
                    Transferred to <strong className="text-white">{targetName}</strong> ({((gift.coinValue || 10000) * quantity).toLocaleString()} Coins)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SCENE D: CELESTIAL COSMIC UNIVERSE                   */}
          {/* ==================================================== */}
          {isUniverse && !isLionOrTiger && !isButterflyOrNature && !isFerrari && (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <motion.div
                animate={{ rotate: 360, scale: [0.95, 1.1, 0.95] }}
                transition={{ rotate: { duration: 8, repeat: Infinity, ease: 'linear' }, scale: { duration: 3, repeat: Infinity } }}
                className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-indigo-950 via-purple-800 to-sky-500 border-4 border-indigo-400 shadow-[0_0_80px_rgba(99,102,241,0.9)] flex items-center justify-center"
              >
                <span className="text-8xl sm:text-9xl filter drop-shadow-[0_0_35px_rgba(129,140,248,1)]">
                  🌌
                </span>
              </motion.div>

              <div className="absolute bottom-10 inset-x-4 flex flex-col items-center text-center z-30 pointer-events-none">
                <div className="px-6 py-2.5 rounded-2xl bg-black/85 border border-indigo-400/90 shadow-[0_0_35px_rgba(129,140,248,0.8)] backdrop-blur-md">
                  <div className="text-base sm:text-xl font-black text-indigo-300 font-heading tracking-widest uppercase flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-sky-400 animate-spin" />
                    CELESTIAL COSMIC UNIVERSE 🌌
                    <Sparkles className="w-5 h-5 text-sky-400 animate-spin" />
                  </div>
                  <div className="text-xs text-purple-200 mt-0.5">
                    Transferred to <strong className="text-white">{targetName}</strong> ({((gift.coinValue || 10000) * quantity).toLocaleString()} Coins)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SCENE E: ALL OTHER BIG VIP LUXURY GIFTS               */}
          {/* ==================================================== */}
          {!isLionOrTiger && !isButterflyOrNature && !isFerrari && !isUniverse && (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <motion.div
                animate={{ rotateY: 360, scale: [1, 1.1, 1] }}
                transition={{ rotateY: { duration: 5, repeat: Infinity, ease: 'linear' }, scale: { duration: 2, repeat: Infinity } }}
                className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-gradient-to-tr from-purple-900 via-amber-600 to-yellow-400 border-4 border-amber-300 shadow-[0_0_80px_rgba(251,191,36,0.9)] flex items-center justify-center"
              >
                <span className="text-8xl sm:text-9xl filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
                  {gift.icon}
                </span>
              </motion.div>

              <div className="absolute bottom-10 inset-x-4 flex flex-col items-center text-center z-30 pointer-events-none">
                <div className="px-6 py-2.5 rounded-2xl bg-black/85 border border-amber-400/90 shadow-[0_0_35px_rgba(251,191,36,0.8)] backdrop-blur-md">
                  <div className="text-base sm:text-xl font-black text-amber-300 font-heading tracking-widest uppercase flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                    {gift.name.toUpperCase()} VIP 👑
                    <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                  </div>
                  <div className="text-xs text-purple-200 mt-0.5">
                    Transferred to <strong className="text-white">{targetName}</strong> ({((gift.coinValue || 1000) * quantity).toLocaleString()} Coins)
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
