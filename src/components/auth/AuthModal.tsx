import React, { useState } from 'react';
import { User } from '../../types';
import { DEMO_USERS } from '../../services/storage';
import {
  Phone,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  Camera,
  ArrowRight,
  X,
  Globe,
  ChevronDown,
  Zap,
  Crown,
  Check,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { PulseLogo3D } from '../common/PulseLogo3D';
import { CountryItem, GLOBAL_COUNTRIES } from '../../services/countries';
import { CountryPickerModal } from '../common/CountryPickerModal';
import { soundService } from '../../services/soundService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onLoginSuccess: (user: User) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
];

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [method, setMethod] = useState<'main' | 'phone'>('main');
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');

  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(() => {
    return (
      GLOBAL_COUNTRIES.find((c) => c.name === currentUser.country) ||
      GLOBAL_COUNTRIES.find((c) => c.code === 'PK') ||
      GLOBAL_COUNTRIES[0]
    );
  });
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('3001234567');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('7788');
  const [displayName, setDisplayName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar);
  const [bio, setBio] = useState(currentUser.bio);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Google Account Chooser Modal state
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('sbh93385@gmail.com');

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3000);
  };

  // 1. GOOGLE LOGIN / SIGNUP
  const handleGoogleAuth = (emailToUse?: string) => {
    const userEmail = emailToUse || customGoogleEmail || 'sbh93385@gmail.com';
    const emailPrefix = userEmail.split('@')[0];
    const isSharifEmail = userEmail.toLowerCase().includes('sbh') || userEmail.toLowerCase().includes('sharif');

    const googleUser: User = {
      ...currentUser,
      id: isSharifEmail ? 'user_me' : `google_${Date.now()}`,
      name: isSharifEmail ? 'Muhammad Sharif' : emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1),
      username: isSharifEmail ? '@muhammad_sharif' : `@${emailPrefix}_vip`,
      phone: currentUser.phone || '+92 300 1234567',
      email: userEmail,
      avatar: isSharifEmail
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
        : PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
      bio: isSharifEmail
        ? 'Founder & Creator of Pulse App 👑 Verified Google Account ✨'
        : 'VIP Member on Pulse 🎵 Connected with Google',
      coins: Math.max(50000, currentUser.coins),
      diamonds: Math.max(20000, currentUser.diamonds),
      level: isSharifEmail ? 50 : 25,
      vipTier: isSharifEmail ? 'Crown' : 'Diamond',
      country: selectedCountry.name,
      flag: selectedCountry.flag,
      authProvider: 'google',
    };

    soundService.playCoinSound();
    onLoginSuccess(googleUser);
    showToast(`Google se ${authMode === 'signin' ? 'Login' : 'Sign Up'} kamyab! Welcome, ${googleUser.name} 🌟`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  // 2. FACEBOOK LOGIN / SIGNUP
  const handleFacebookAuth = () => {
    const fbUser: User = {
      ...currentUser,
      id: `fb_${Date.now()}`,
      name: 'Muhammad Sharif (Facebook)',
      username: '@sharif_fb',
      phone: currentUser.phone || '+92 321 8889999',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
      bio: 'Verified Facebook VIP Member 💙 Enjoying live party rooms!',
      coins: Math.max(50000, currentUser.coins),
      diamonds: Math.max(15000, currentUser.diamonds),
      level: 45,
      vipTier: 'Diamond',
      country: 'Pakistan',
      flag: '🇵🇰',
      authProvider: 'facebook',
    };

    soundService.playCoinSound();
    onLoginSuccess(fbUser);
    showToast(`Facebook se ${authMode === 'signin' ? 'Login' : 'Sign Up'} kamyab! 💙`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  // 3. INSTANT DEMO ACCOUNT LOGIN (1-Click Instant Access)
  const handleInstantDemoLogin = () => {
    const randomGuestNum = Math.floor(1000 + Math.random() * 9000);
    const guestUser: User = {
      ...currentUser,
      id: `guest_${Date.now()}`,
      name: `VIP Guest ${randomGuestNum}`,
      username: `@guest_${randomGuestNum}`,
      phone: '+92 300 0000000',
      avatar: PRESET_AVATARS[randomGuestNum % PRESET_AVATARS.length],
      bio: '🌟 Instant VIP Guest Account • Ready for Voice Rooms & Reels!',
      coins: 50000, // 50,000 Free Welcome Coins!
      diamonds: 10000,
      level: 18,
      vipTier: 'Gold',
      country: selectedCountry.name,
      flag: selectedCountry.flag,
      authProvider: 'demo',
    };

    soundService.playCoinSound();
    onLoginSuccess(guestUser);
    showToast('⚡ Instant Demo Login Kamyab! 50,000 Free Coins added 🪙');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  // Phone OTP Flow handlers
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 6) {
      setErrorMessage('Please enter a valid phone number');
      return;
    }
    setErrorMessage('');
    const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(mockOtp);
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim() !== generatedOtp && otpCode !== '7788' && otpCode !== '1234') {
      setErrorMessage(`Invalid code. Use verification code: ${generatedOtp}`);
      return;
    }
    setErrorMessage('');
    setStep('profile');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.startsWith('0') ? phoneNumber.slice(1) : phoneNumber;
    const updatedUser: User = {
      ...currentUser,
      name: displayName.trim() || 'Pulse Star',
      username: username.startsWith('@') ? username : `@${username}`,
      phone: `${selectedCountry.dialCode} ${cleanPhone}`,
      avatar: selectedAvatar,
      bio: bio.trim() || 'Enjoying life on Pulse VIP 🎵',
      country: selectedCountry.name,
      flag: selectedCountry.flag,
      authProvider: 'phone',
    };
    soundService.playCoinSound();
    onLoginSuccess(updatedUser);
    onClose();
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuickSwitch = (user: User) => {
    soundService.playCoinSound();
    onLoginSuccess(user);
    showToast(`Logged in as ${user.name} ✨`);
    setTimeout(onClose, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#18082e] via-[#100321] to-[#0a0117] border border-purple-800/80 p-5 shadow-2xl relative max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-purple-950/80 text-purple-300 hover:text-white transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Toast Alert */}
        {toastNotice && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-xl animate-bounce flex items-center gap-1.5 whitespace-nowrap">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastNotice}</span>
          </div>
        )}

        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-4">
          <div className="mb-1.5 scale-90">
            <PulseLogo3D size="md" showText={false} withGlow={true} />
          </div>
          <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400 font-heading tracking-wide">
            PULSE VIP
          </h2>
          <p className="text-[11px] text-purple-300 mt-0.5">
            10-20 Seat Voice Rooms • Trending Reels • Crystal HD Calls
          </p>

          {/* Sign In vs Sign Up Tabs */}
          <div className="flex items-center gap-1 p-1 bg-purple-950/80 border border-purple-800/80 rounded-2xl mt-3 w-full max-w-[280px]">
            <button
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authMode === 'signin'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authMode === 'signup'
                  ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-md'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200 text-center animate-shake">
            {errorMessage}
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN VIEW: SOCIAL & INSTANT DEMO OPTIONS                  */}
        {/* ========================================================= */}
        {method === 'main' && (
          <div className="space-y-3.5">
            {/* 1. INSTANT 1-CLICK DEMO LOGIN (HIGHLIGHTED HERO CARD) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-purple-900/40 to-pink-500/20 border border-amber-500/50 shadow-xl relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-pink-500 text-black flex items-center justify-center font-black shadow-lg">
                    <Zap className="w-5 h-5 text-black fill-black" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white font-heading">
                        Instant Demo Account
                      </span>
                      <span className="text-[9px] font-bold bg-amber-400 text-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                        1-Click
                      </span>
                    </div>
                    <p className="text-[10px] text-purple-200 mt-0.5">
                      Bina kisi verification ya password k 1-tap me VIP guest login karein
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-purple-800/40">
                <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> +50,000 Free Coins included
                </span>
                <button
                  type="button"
                  onClick={handleInstantDemoLogin}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 hover:opacity-95 text-white font-black text-xs shadow-lg transition active:scale-95 flex items-center gap-1"
                >
                  <span>1-Tap Demo Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2. SOCIAL BUTTONS (GOOGLE & FACEBOOK) */}
            <div className="space-y-2">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => setShowGoogleChooser(true)}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs flex items-center justify-center gap-3 shadow-md transition active:scale-98 cursor-pointer"
              >
                <GoogleIcon />
                <span className="text-sm font-semibold tracking-wide">
                  {authMode === 'signin' ? 'Continue with Google' : 'Sign Up with Google'}
                </span>
              </button>

              {/* Facebook Button */}
              <button
                type="button"
                onClick={handleFacebookAuth}
                className="w-full py-3 px-4 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs flex items-center justify-center gap-3 shadow-md transition active:scale-98 cursor-pointer"
              >
                <div className="p-0.5 bg-white rounded-full">
                  <FacebookIcon />
                </div>
                <span className="text-sm font-semibold tracking-wide">
                  {authMode === 'signin' ? 'Continue with Facebook' : 'Sign Up with Facebook'}
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2 text-purple-400/80">
              <div className="flex-1 h-[1px] bg-purple-800/60" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-purple-400">
                Or Continue With Phone
              </span>
              <div className="flex-1 h-[1px] bg-purple-800/60" />
            </div>

            {/* 3. Phone Option Trigger Button */}
            <button
              type="button"
              onClick={() => setMethod('phone')}
              className="w-full py-3 px-4 rounded-2xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-200 font-bold text-xs flex items-center justify-center gap-2 shadow transition active:scale-98"
            >
              <Phone className="w-4 h-4 text-pink-400" />
              <span>Use Phone Number & OTP Code</span>
            </button>

            {/* 4. Instant Demo Personas Switcher */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" /> VIP Demo Personas:
                </span>
                <span className="text-[10px] text-purple-400">1-Tap Switch</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_USERS.slice(0, 4).map((demo) => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleQuickSwitch(demo)}
                    className="flex items-center gap-2 p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/50 text-left transition active:scale-95 group"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={demo.avatar}
                        alt={demo.name}
                        className="w-8 h-8 rounded-full object-cover border border-amber-400"
                      />
                      <span className="absolute -bottom-1 -right-1 text-xs">
                        {demo.flag || '🇵🇰'}
                      </span>
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition">
                        {demo.name}
                      </div>
                      <div className="text-[10px] text-purple-300 truncate">
                        {demo.id === 'user_me' ? '👑 App Creator' : demo.country || 'VIP'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHONE NUMBER & OTP FLOW                                   */}
        {/* ========================================================= */}
        {method === 'phone' && (
          <div>
            {/* Back button to social options */}
            <button
              type="button"
              onClick={() => {
                setMethod('main');
                setStep('phone');
                setErrorMessage('');
              }}
              className="text-xs text-purple-300 hover:text-white flex items-center gap-1 mb-3 font-semibold"
            >
              ← Back to Google / Facebook / Demo options
            </button>

            {/* Step 1: Phone input */}
            {step === 'phone' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-purple-200">
                      Country & Phone Number
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCountryPicker(true)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" /> Change Country
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCountryPicker(true)}
                      className="flex items-center gap-1.5 bg-purple-950/70 hover:bg-purple-900 border border-purple-800/70 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition shrink-0"
                    >
                      <span className="text-lg">{selectedCountry.flag}</span>
                      <span className="font-mono font-bold text-xs text-amber-400">
                        {selectedCountry.dialCode}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
                    </button>

                    <div className="relative flex-1">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="Enter phone number"
                        className="w-full bg-purple-950/70 border border-purple-800/70 rounded-xl px-4 py-3 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400 font-mono"
                      />
                      <Phone className="w-4 h-4 text-purple-400 absolute right-3.5 top-3.5" />
                    </div>
                  </div>

                  <p className="text-[11px] text-purple-300 mt-1.5 flex items-center gap-1">
                    <span>Selected:</span>
                    <span className="font-bold text-white">{selectedCountry.flag} {selectedCountry.name}</span>
                    <span className="text-purple-400">({selectedCountry.dialCode})</span>
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 text-white font-bold text-sm shadow-xl shadow-purple-900/30 hover:opacity-95 transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>Send OTP Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Step 2: OTP verification */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-purple-950/40 p-3.5 rounded-xl border border-purple-800/40 text-center">
                  <p className="text-xs text-purple-300">
                    Verification Code sent to{' '}
                    <span className="text-white font-bold font-mono">
                      {selectedCountry.flag} {selectedCountry.dialCode} {phoneNumber}
                    </span>
                  </p>
                  <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-mono font-bold">
                    <Sparkles className="w-3.5 h-3.5" /> Verification Code: {generatedOtp}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-purple-200 mb-1.5 block">
                    Verification Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter code"
                      className="w-full bg-purple-950/70 border border-purple-800/70 rounded-xl px-4 py-3 text-center text-lg tracking-widest text-white font-mono placeholder-purple-400/50 focus:outline-none focus:border-amber-400"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setOtpCode(generatedOtp)}
                      className="px-3.5 bg-purple-900/80 hover:bg-purple-800 text-xs font-bold text-amber-300 rounded-xl transition shrink-0"
                    >
                      Auto-fill
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="w-1/3 py-3 rounded-xl bg-purple-950/80 text-purple-300 font-bold text-sm hover:bg-purple-900"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition"
                  >
                    Verify & Continue <ShieldCheck className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Profile Setup */}
            {step === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                {/* Avatar picker */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative group">
                    <img
                      src={selectedAvatar}
                      alt="avatar"
                      className="w-18 h-18 rounded-full object-cover border-2 border-amber-400 shadow-xl"
                    />
                    <label className="absolute bottom-0 right-0 p-1.5 bg-pink-600 rounded-full text-white cursor-pointer hover:bg-pink-500 shadow-lg">
                      <Camera className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFile}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <span className="text-[11px] text-purple-300">Pick or upload avatar:</span>

                  <div className="flex items-center gap-2">
                    {PRESET_AVATARS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(av)}
                        className={`w-7 h-7 rounded-full overflow-hidden border-2 transition ${
                          selectedAvatar === av ? 'border-amber-400 scale-110' : 'border-transparent opacity-60'
                        }`}
                      >
                        <img src={av} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-purple-200 mb-1 block">Full Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    className="w-full bg-purple-950/70 border border-purple-800/70 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-purple-200 mb-1 block">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@username"
                    className="w-full bg-purple-950/70 border border-purple-800/70 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-purple-200 mb-1 block">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    placeholder="Share a status or music taste..."
                    className="w-full bg-purple-950/70 border border-purple-800/70 rounded-xl px-4 py-2 text-xs text-white resize-none focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition"
                >
                  Complete Profile <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Google Account Selector Dialog */}
      {showGoogleChooser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white text-gray-900 p-5 shadow-2xl relative text-left">
            <button
              onClick={() => setShowGoogleChooser(false)}
              className="absolute top-4 right-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <GoogleIcon />
              <div>
                <h3 className="text-sm font-bold text-gray-900">Sign in with Google</h3>
                <p className="text-[11px] text-gray-500">to continue to Pulse VIP</p>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {/* Account 1: sbh93385@gmail.com (Muhammad Sharif) */}
              <button
                type="button"
                onClick={() => {
                  setShowGoogleChooser(false);
                  handleGoogleAuth('sbh93385@gmail.com');
                }}
                className="w-full p-3 rounded-2xl border border-gray-200 hover:bg-gray-50 flex items-center justify-between text-left transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-amber-400 text-white flex items-center justify-center font-bold text-sm shadow">
                    MS
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Muhammad Sharif</div>
                    <div className="text-[11px] text-gray-500">sbh93385@gmail.com</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">Owner</span>
              </button>

              {/* Custom Google Email input */}
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <span className="text-[11px] font-semibold text-gray-600 block">
                  Or enter another Google Email:
                </span>
                <input
                  type="email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs bg-white text-gray-800 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowGoogleChooser(false);
                    handleGoogleAuth(customGoogleEmail);
                  }}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition active:scale-95"
                >
                  Continue with this Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Country Picker Modal */}
      <CountryPickerModal
        isOpen={showCountryPicker}
        onClose={() => setShowCountryPicker(false)}
        selectedDialCode={selectedCountry.dialCode}
        onSelectCountry={(country) => {
          setSelectedCountry(country);
        }}
      />
    </div>
  );
};
