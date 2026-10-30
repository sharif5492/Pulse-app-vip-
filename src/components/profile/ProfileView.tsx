import React, { useState } from 'react';
import { User, Reel } from '../../types';
import { Avatar3DRing, LightingTheme } from '../common/Avatar3DRing';
import {
  Coins,
  Gem,
  Crown,
  Sparkles,
  Edit3,
  Users,
  Settings,
  Shield,
  Download,
  Gift,
  PlusCircle,
  Share2,
  Eye,
  EyeOff,
  Lock,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  X,
  MoreVertical,
} from 'lucide-react';
import { soundService } from '../../services/soundService';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface ProfileViewProps {
  currentUser: User;
  myReels: Reel[];
  onOpenAuth: () => void;
  onAddCoins: (amount: number) => void;
  onReplayIntro?: () => void;
  onOpenSettings: () => void;
}

const getLiveAppUrl = () => {
  if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')) {
    return window.location.origin;
  }
  return 'https://ais-dev-rrijt33ycs4s3acziuivep-146866587777.asia-northeast1.run.app';
};

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  myReels,
  onOpenAuth,
  onAddCoins,
  onReplayIntro,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'reels' | 'wallet' | 'badges'>('reels');
  const [ringTheme, setRingTheme] = useState<LightingTheme>('gold');
  const [coinRewardAlert, setCoinRewardAlert] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPwaGuide, setShowPwaGuide] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const { isInstallable, install } = usePWAInstall();

  // Deterministic clean numeric VIP User ID
  const getNumericUserId = (user: User) => {
    if (user.id === 'user_me') return '89338501';
    if (user.id === 'user_zara') return '78190422';
    if (user.id === 'user_kabir') return '65431890';
    if (user.id === 'user_ananya') return '43219088';
    let hash = 0;
    for (let i = 0; i < user.id.length; i++) {
      hash = (hash << 5) - hash + user.id.charCodeAt(i);
      hash |= 0;
    }
    return (Math.abs(hash) % 90000000 + 10000000).toString();
  };

  const numericUserId = getNumericUserId(currentUser);
  const pwaDemoUrl = getLiveAppUrl();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyUserId = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(numericUserId);
      }
    } catch {
      // fallback
    }
    soundService.playCoinSound();
    setCopiedId(true);
    showToast(`User ID: ${numericUserId} Copy Ho Chuka Hai! 📋`);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleCopyMobileLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(pwaDemoUrl);
      }
    } catch {
      // fallback
    }
    soundService.playCoinSound();
    setCopiedLink(true);
    showToast('📱 Mobile PWA Link Copy Ho Gaya! Apne phone browser me open karein');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleClaimFreeCoins = () => {
    onAddCoins(1000);
    setCoinRewardAlert(true);
    setTimeout(() => setCoinRewardAlert(false), 3000);
  };

  const getMaskedPhone = (phone?: string) => {
    if (!phone) return '+92 300 •••••••';
    const parts = phone.split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[1]?.slice(0, 3) || '300'} •••••••`;
    }
    return `${phone.slice(0, 6)}••••••`;
  };

  return (
    <div className="flex-1 w-full h-full bg-[#090314] text-white p-3.5 sm:p-4 max-w-md mx-auto overflow-y-auto no-scrollbar overflow-x-hidden">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs rounded-full shadow-2xl flex items-center gap-1.5 animate-bounce whitespace-nowrap">
          <CheckCircle2 className="w-4 h-4" /> {toastMessage}
        </div>
      )}

      {/* Coin reward Alert */}
      {coinRewardAlert && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gradient-to-r from-amber-500 to-pink-500 text-white font-bold text-xs rounded-full shadow-2xl flex items-center gap-1.5 animate-bounce">
          <Sparkles className="w-4 h-4" /> Claimed +1,000 Free Coins!
        </div>
      )}

      {/* Profile Header */}
      <div className="relative rounded-3xl p-5 mb-4 bg-[#140827] border border-purple-900/60 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            {/* 3D Volumetric Lighting Ring Around User Avatar */}
            <Avatar3DRing
              avatarUrl={currentUser.avatar}
              altText={currentUser.name}
              size="xl"
              level={currentUser.level}
              vipTier={currentUser.vipTier}
              initialTheme={ringTheme}
              isInteractive={true}
              showOrbitalSparks={true}
            />

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black text-white font-heading">
                  {currentUser.name}
                </h2>
                {currentUser.vipTier === 'Crown' && <span>👑</span>}
              </div>

              {/* Username & User ID with Copy Button */}
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <p className="text-xs text-purple-300 font-semibold">{currentUser.username}</p>
                
                {/* Dedicated User ID Pill with Copy button */}
                <div className="flex items-center gap-1 bg-purple-950/90 px-2 py-0.5 rounded-lg border border-purple-800/80 text-[11px] font-mono shadow-inner">
                  <span className="text-[9px] uppercase font-bold text-purple-400">ID:</span>
                  <span className="text-amber-300 font-black tracking-wider">{numericUserId}</span>
                  <button
                    onClick={handleCopyUserId}
                    className="p-0.5 rounded text-purple-300 hover:text-white transition active:scale-90"
                    title="Copy User ID"
                  >
                    {copiedId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 hover:text-amber-300" />
                    )}
                  </button>
                </div>
                {copiedId && (
                  <span className="text-[10px] text-emerald-400 font-bold animate-fade-in">
                    Copied!
                  </span>
                )}
              </div>

              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                {currentUser.authProvider && (
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                    currentUser.authProvider === 'google'
                      ? 'bg-blue-950/80 text-blue-300 border border-blue-700/60'
                      : currentUser.authProvider === 'facebook'
                      ? 'bg-[#1877F2]/20 text-[#60a5fa] border border-[#1877F2]/40'
                      : currentUser.authProvider === 'demo'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                      : 'bg-purple-950/80 text-purple-300 border border-purple-700/60'
                  }`}>
                    {currentUser.authProvider === 'google' && '🔵 Google'}
                    {currentUser.authProvider === 'facebook' && '🔷 Facebook'}
                    {currentUser.authProvider === 'demo' && '⚡ Demo VIP'}
                    {currentUser.authProvider === 'phone' && '📱 Phone'}
                  </span>
                )}
                <div className="flex items-center gap-1.5 bg-purple-950/90 px-2.5 py-0.5 rounded-full border border-purple-800/80 text-purple-200 text-[10px] font-mono shadow-inner">
                  <span>{currentUser.flag || '🇵🇰'}</span>
                  <span className="tracking-wider">
                    {showPhone ? currentUser.phone : getMaskedPhone(currentUser.phone)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPhone(!showPhone);
                    }}
                    className="ml-0.5 p-0.5 text-purple-400 hover:text-amber-300 transition"
                    title={showPhone ? 'Hide phone number' : 'Show private phone number'}
                  >
                    {showPhone ? <EyeOff className="w-3 h-3 text-pink-400" /> : <Eye className="w-3 h-3 text-amber-300" />}
                  </button>
                  <span className="text-[9px] bg-purple-900/90 text-amber-300 font-semibold px-1.5 py-0.2 rounded-full border border-amber-500/30 flex items-center gap-0.5" title="Only you can see this phone number">
                    <Lock className="w-2.5 h-2.5" /> Only You
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowProfileMenu(true)}
            className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 hover:text-white transition border border-purple-800 shrink-0 shadow-md active:scale-95 ml-1"
            title="Profile Menu & Ring Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Bio */}
        <p className="text-xs text-purple-200 mt-3 leading-relaxed">
          {currentUser.bio}
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-purple-900/40 text-center">
          <div>
            <div className="text-sm font-black text-white">4.8k</div>
            <div className="text-[10px] text-purple-300 font-medium">Followers</div>
          </div>
          <div>
            <div className="text-sm font-black text-white">312</div>
            <div className="text-[10px] text-purple-300 font-medium">Following</div>
          </div>
          <div>
            <div className="text-sm font-black text-amber-400">84.2k</div>
            <div className="text-[10px] text-purple-300 font-medium">Charm / Likes</div>
          </div>
        </div>
      </div>

      {/* Replay Cinematic Intro Bar */}
      {onReplayIntro && (
        <button
          onClick={onReplayIntro}
          className="w-full mb-4 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500/20 via-purple-600/30 to-amber-500/20 border border-pink-500/40 hover:border-pink-400 text-xs font-bold text-pink-300 hover:text-white flex items-center justify-between transition shadow-lg group active:scale-95"
        >
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-pink-600 text-white shadow">
              <Sparkles className="w-3.5 h-3.5 animate-spin [animation-duration:4s]" />
            </span>
            <span>Replay 3D Countdown Intro & Audio</span>
          </div>
          <span className="text-[10px] uppercase font-black text-amber-300">
            PLAY ▶
          </span>
        </button>
      )}

      {/* Mobile PWA App Link & Demo Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1a0833] via-[#120424] to-[#1c0828] border border-amber-500/40 shadow-2xl mb-4 relative overflow-hidden group">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-pink-600/10 rounded-full blur-2xl group-hover:bg-pink-600/20 transition" />
        
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-lg shrink-0">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-white font-heading">
                  Mobile PWA Demo App
                </span>
                <span className="text-[9px] bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-0.2 rounded-full font-bold shadow">
                  Live Mobile Link
                </span>
              </div>
              <p className="text-[11px] text-purple-200 mt-0.5">
                Apne mobile pe app chalane aur Home Screen pe install karne k liye
              </p>
            </div>
          </div>
        </div>

        {/* URL Box */}
        <div className="mt-3 p-2.5 rounded-2xl bg-purple-950/80 border border-purple-800/80 flex items-center justify-between gap-2 shadow-inner relative z-10">
          <div className="truncate flex-1 min-w-0 pr-1">
            <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
              PWA Demo URL:
            </span>
            <span className="text-xs font-mono text-purple-200 truncate block select-all">
              {pwaDemoUrl}
            </span>
          </div>
          <button
            onClick={handleCopyMobileLink}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-md active:scale-95 ${
              copiedLink
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-amber-400 to-pink-500 text-white hover:opacity-90'
            }`}
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Action Buttons: Open & Install Guide */}
        <div className="mt-2.5 grid grid-cols-2 gap-2 relative z-10">
          <a
            href={pwaDemoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 rounded-xl bg-purple-900/60 hover:bg-purple-800/90 text-purple-200 hover:text-white border border-purple-800/60 text-[11px] font-bold text-center flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5 text-pink-400" />
            <span>Open Link</span>
          </a>

          {isInstallable ? (
            <button
              onClick={install}
              className="py-2 px-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-[11px] font-bold text-center flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install PWA</span>
            </button>
          ) : (
            <button
              onClick={() => setShowPwaGuide(true)}
              className="py-2 px-3 rounded-xl bg-purple-900/60 hover:bg-purple-850 text-amber-300 border border-amber-500/30 text-[11px] font-bold text-center flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mobile Guide</span>
            </button>
          )}
        </div>
      </div>

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Coins Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-purple-950/40 border border-amber-500/30 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
              <Coins className="w-4 h-4" /> Coin Balance
            </div>
            <div className="text-lg font-black text-white font-mono">
              {currentUser.coins.toLocaleString()}
            </div>
          </div>
          <button
            onClick={handleClaimFreeCoins}
            className="mt-3 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 text-white font-bold text-[11px] shadow hover:scale-105 active:scale-95 transition"
          >
            + Claim Free
          </button>
        </div>

        {/* Diamonds Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-purple-950/40 border border-cyan-500/30 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold mb-1">
              <Gem className="w-4 h-4" /> Diamonds
            </div>
            <div className="text-lg font-black text-white font-mono">
              {currentUser.diamonds.toLocaleString()}
            </div>
          </div>
          <button
            onClick={() => alert('Diamonds can be exchanged for cash or luxury gifts!')}
            className="mt-3 py-1.5 px-3 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-cyan-300 font-bold text-[11px] border border-cyan-500/30 transition"
          >
            Exchange
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-purple-900/50 mb-3">
        <button
          onClick={() => setActiveTab('reels')}
          className={`flex-1 pb-2 text-xs font-bold text-center border-b-2 transition ${
            activeTab === 'reels'
              ? 'border-pink-500 text-white'
              : 'border-transparent text-purple-400'
          }`}
        >
          My Reels ({myReels.length})
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`flex-1 pb-2 text-xs font-bold text-center border-b-2 transition ${
            activeTab === 'badges'
              ? 'border-pink-500 text-white'
              : 'border-transparent text-purple-400'
          }`}
        >
          VIP & Badges
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'reels' ? (
        <div className="grid grid-cols-3 gap-2 pb-6">
          {myReels.map((reel) => (
            <div
              key={reel.id}
              className="relative aspect-3/4 rounded-xl overflow-hidden bg-purple-950/60 border border-purple-800/40 group cursor-pointer"
            >
              <img
                src={reel.thumbnail}
                alt="thumbnail"
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                <span className="text-[10px] font-bold text-white flex items-center gap-1">
                  ❤️ {reel.likesCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VIP & Badges tab */
        <div className="space-y-3 pb-6">
          {[
            { title: 'Crown VIP', desc: 'Top tier status with custom entrance animation', icon: '👑', active: true },
            { title: 'Ludo King 🎲', desc: 'Rolled over 50 double sixes in party rooms', icon: '🎲', active: true },
            { title: 'Super Gifter 🏎️', desc: 'Sent more than 10 Ferrari and Dragon gifts', icon: '🏎️', active: true },
            { title: 'Antakshari Master 🎤', desc: 'Hosted 20+ live music rooms', icon: '🎤', active: false },
          ].map((badge, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-2xl bg-[#140827] border border-purple-900/40"
            >
              <span className="text-2xl">{badge.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{badge.title}</span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      badge.active
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-gray-800 text-gray-500'
                    }`}
                  >
                    {badge.active ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>
                <p className="text-[10px] text-purple-300 mt-0.5">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* App Creator Badge Footer */}
      <div className="pt-2 pb-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-800/60 text-[11px] text-purple-300 shadow-md">
          <span>Pulse VIP • Created with ❤️ by</span>
          <span className="font-bold text-amber-400 font-heading">Muhammad Sharif</span>
        </div>
      </div>

      {/* PWA Mobile Installation Guide Modal */}
      {showPwaGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in select-none">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1c0836] to-[#0e031c] border border-amber-500/50 p-5 shadow-2xl relative text-left">
            <button
              onClick={() => setShowPwaGuide(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-purple-950 text-purple-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-pink-500 flex items-center justify-center text-black font-black">
                <Smartphone className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white font-heading">
                  Mobile Pe App Kaise Chalayein
                </h3>
                <span className="text-[10px] text-purple-300">
                  Android Chrome aur iPhone Safari PWA Guide
                </span>
              </div>
            </div>

            <div className="space-y-3 my-4">
              {/* Android Guide */}
              <div className="p-3 rounded-2xl bg-purple-950/70 border border-purple-800/80">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                  <span>🤖 Android (Google Chrome)</span>
                </div>
                <ol className="text-[11px] text-purple-200 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Upar diye gaye link ko apne phone Chrome me open karein.</li>
                  <li>Upar right side <strong>3 dots (⋮)</strong> par tap karein.</li>
                  <li><strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> par click karein.</li>
                </ol>
              </div>

              {/* iPhone Guide */}
              <div className="p-3 rounded-2xl bg-purple-950/70 border border-purple-800/80">
                <div className="text-xs font-bold text-pink-300 flex items-center gap-1.5 mb-1">
                  <span>🍎 iPhone / iPad (Safari Browser)</span>
                </div>
                <ol className="text-[11px] text-purple-200 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Safari me link open karein.</li>
                  <li>Neeche <strong>Share button</strong> (Square with Arrow ⬆️) dabayein.</li>
                  <li>Scroll karke <strong>"Add to Home Screen"</strong> par tap karein.</li>
                </ol>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyMobileLink}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-pink-500 text-white font-bold text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <button
                onClick={() => setShowPwaGuide(false)}
                className="px-4 py-2.5 rounded-xl bg-purple-900/80 text-white font-bold text-xs hover:bg-purple-800"
              >
                Theek Hai
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 3-Dot Profile Menu Modal (Ring Options, Edit Profile, Settings) */}
      {showProfileMenu && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-fade-in select-none">
          <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-gradient-to-b from-[#1c0836] via-[#120424] to-[#0a0117] border border-amber-500/40 p-5 shadow-2xl relative max-h-[88vh] overflow-y-auto no-scrollbar">
            {/* Header with Close */}
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/50 mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-pink-500 text-black flex items-center justify-center font-black shadow-md">
                  <Sparkles className="w-4 h-4 text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white font-heading">
                    Profile Options & Ring
                  </h3>
                  <p className="text-[10px] text-purple-300">
                    Edit account, settings & 3D lighting rings
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowProfileMenu(false)}
                className="p-1.5 rounded-full bg-purple-950/80 text-purple-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action 1: Edit Profile / Switch Account */}
            <button
              onClick={() => {
                setShowProfileMenu(false);
                onOpenAuth();
              }}
              className="w-full mb-2.5 p-3 rounded-2xl bg-purple-950/70 hover:bg-purple-900/80 border border-purple-800/60 text-white flex items-center justify-between transition group active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-600/30 border border-pink-500/40 flex items-center justify-center text-pink-400 group-hover:scale-105 transition shrink-0">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Edit Profile & Account</div>
                  <div className="text-[10px] text-purple-300">Name, bio, switch Google / FB / Demo</div>
                </div>
              </div>
              <span className="text-[10px] text-pink-400 font-bold">Open ▶</span>
            </button>

            {/* Action 2: App & Account Settings */}
            <button
              onClick={() => {
                setShowProfileMenu(false);
                onOpenSettings();
              }}
              className="w-full mb-3.5 p-3 rounded-2xl bg-purple-950/70 hover:bg-purple-900/80 border border-purple-800/60 text-white flex items-center justify-between transition group active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">App & Account Settings</div>
                  <div className="text-[10px] text-purple-300">Privacy, cache, audio, notifications</div>
                </div>
              </div>
              <span className="text-[10px] text-amber-400 font-bold">Open ▶</span>
            </button>

            {/* SECTION: 3D Lighting Ring Themes */}
            <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-800/60 mb-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> 3D Avatar Lighting Ring:
                  </span>
                </div>
                <span className="text-[10px] text-purple-300 capitalize font-mono">
                  Active: {ringTheme}
                </span>
              </div>

              {/* 5 Themes Grid */}
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'gold', label: '👑 Gold', border: 'border-yellow-400' },
                  { id: 'neon', label: '⚡ Neon', border: 'border-cyan-400' },
                  { id: 'fire', label: '🔥 Fire', border: 'border-red-400' },
                  { id: 'diamond', label: '💎 Diamond', border: 'border-purple-400' },
                  { id: 'emerald', label: '🟢 Emerald', border: 'border-emerald-400' },
                ].map((r) => {
                  const isSelected = ringTheme === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        setRingTheme(r.id as LightingTheme);
                        soundService.playCoinSound();
                        showToast(`Ring Theme changed to ${r.label}! ✨`);
                      }}
                      className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition flex flex-col items-center justify-center gap-1 active:scale-95 ${
                        isSelected
                          ? 'bg-yellow-400/20 text-yellow-300 shadow-md ring-1 ring-amber-400 ' + r.border
                          : 'bg-purple-950/60 border-purple-800 text-purple-300 hover:text-white hover:bg-purple-900/60'
                      }`}
                    >
                      <span>{r.label.split(' ')[0]}</span>
                      <span className="text-[9px]">{r.label.split(' ')[1]}</span>
                      {isSelected && (
                        <Check className="w-3 h-3 text-emerald-400 -mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action 3: Replay Intro Button (if available) */}
            {onReplayIntro && (
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onReplayIntro();
                }}
                className="w-full mb-3 p-2.5 rounded-xl bg-gradient-to-r from-pink-600/30 to-purple-600/30 border border-pink-500/40 text-pink-300 hover:text-white text-xs font-bold flex items-center justify-between transition active:scale-95"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Replay 3D Countdown Intro
                </span>
                <span className="text-[10px] text-amber-300 font-black">PLAY ▶</span>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={() => setShowProfileMenu(false)}
              className="w-full py-2.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-white text-xs font-bold transition active:scale-95 shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
