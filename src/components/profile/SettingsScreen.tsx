import React, { useState } from 'react';
import { User } from '../../types';
import { DEMO_USERS } from '../../services/storage';
import { soundService } from '../../services/soundService';
import { CountryItem, GLOBAL_COUNTRIES, getCountryByDialCode } from '../../services/countries';
import { CountryPickerModal } from '../common/CountryPickerModal';
import { Avatar3DRing } from '../common/Avatar3DRing';
import {
  ArrowLeft,
  User as UserIcon,
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  Bell,
  Volume2,
  Sliders,
  Globe,
  Trash2,
  LogOut,
  LogIn,
  UserPlus,
  RefreshCw,
  Sparkles,
  Camera,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  PhoneCall,
  Radio,
  FileText,
  AlertTriangle,
  Crown,
  X,
  Phone,
  Edit3,
  Database,
  Key,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { getIntegrationStatus, ENV_TEMPLATE, SUPABASE_SCHEMA_SQL } from '../../services/integrations';

interface SettingsScreenProps {
  currentUser: User;
  onBack: () => void;
  onOpenAuth: () => void;
  onSwitchUser: (user: User) => void;
  onLogout: () => void;
  onReplayIntro: () => void;
  onUpdateUser: (user: User) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  currentUser,
  onBack,
  onOpenAuth,
  onSwitchUser,
  onLogout,
  onReplayIntro,
  onUpdateUser,
}) => {
  // Privacy & Calling toggles
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [allowCallsFromStrangers, setAllowCallsFromStrangers] = useState(true);
  const [stealthEntrance, setStealthEntrance] = useState(currentUser.vipTier === 'Crown');
  const [beautyCameraDefault, setBeautyCameraDefault] = useState(true);
  const [hdStreaming, setHdStreaming] = useState(true);

  // Notifications
  const [pushNotifications, setPushNotifications] = useState(true);
  const [roomAlerts, setRoomAlerts] = useState(true);
  const [giftSoundAlerts, setGiftSoundAlerts] = useState(true);

  // Volumes
  const [sfxVolume, setSfxVolume] = useState(80);
  const [bgmVolume, setBgmVolume] = useState(60);

  // Language & Cache
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'ur' | 'ar'>('en');
  const [cacheSize, setCacheSize] = useState('42.8 MB');
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals inside settings
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [showSecurityPinModal, setShowSecurityPinModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState<string | null>(null);
  const [showApiKeysModal, setShowApiKeysModal] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedSettingsId, setCopiedSettingsId] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const integrations = getIntegrationStatus();

  // Phone Privacy
  const [showSettingsPhone, setShowSettingsPhone] = useState(false);

  // App Creator Access Security (Section 6B Gate for Muhammad Sharif)
  const isCreatorAccount =
    currentUser.name.toLowerCase().includes('sharif') ||
    currentUser.username.toLowerCase().includes('sharif');
  const [isCreatorUnlocked, setIsCreatorUnlocked] = useState(false);
  const [showCreatorPinModal, setShowCreatorPinModal] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [creatorPinInput, setCreatorPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [creatorPinError, setCreatorPinError] = useState<string | null>(null);

  const getStoredCreatorPin = () => {
    try {
      return localStorage.getItem('pulse_creator_secret_pin') || '7788';
    } catch {
      return '7788';
    }
  };

  const getMaskedPhone = (phone?: string) => {
    if (!phone) return '+92 300 •••••••';
    const parts = phone.split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[1]?.slice(0, 3) || '300'} •••••••`;
    }
    return `${phone.slice(0, 6)}••••••`;
  };

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

  const handleCopySettingsUserId = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(numericUserId);
      }
    } catch {
      // fallback
    }
    soundService.playCoinSound();
    setCopiedSettingsId(true);
    showToast(`User ID: ${numericUserId} Copied! 📋`);
    setTimeout(() => setCopiedSettingsId(false), 2500);
  };

  const handleUnlockCreator = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pin = creatorPinInput.trim();
    const secretPin = getStoredCreatorPin();
    // Validate secret PIN or auto-verify only if current user is Creator Muhammad Sharif
    if (pin === secretPin || (isCreatorAccount && pin === '')) {
      setIsCreatorUnlocked(true);
      setShowCreatorPinModal(false);
      setCreatorPinInput('');
      setCreatorPinError(null);
      soundService.playCoinSound();
      showToast('👑 Creator Mode Unlocked! Welcome Muhammad Sharif');
    } else {
      setCreatorPinError('Ghalat Secret PIN! Sirf App Creator Muhammad Sharif access kar sakte hain.');
      soundService.playErrorSound();
    }
  };

  const handleChangeCreatorPin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = newPinInput.trim();
    if (cleanPin.length < 4) {
      showToast('PIN kam az kam 4 digits ka hona chahiye');
      return;
    }
    try {
      localStorage.setItem('pulse_creator_secret_pin', cleanPin);
      showToast('Naya Secret PIN kamyabi se save ho gaya!');
      setShowChangePinModal(false);
      setNewPinInput('');
    } catch {
      showToast('PIN save nahi ho saka.');
    }
  };

  const handleLockCreator = () => {
    setIsCreatorUnlocked(false);
    setShowApiKeysModal(false);
    showToast('🔒 Developer keys locked successfully.');
  };

  // Edit Profile & Country Modals
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showCountryPickerModal, setShowCountryPickerModal] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editUsername, setEditUsername] = useState(currentUser.username);
  const [editPhone, setEditPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(() => {
    return (
      GLOBAL_COUNTRIES.find((c) => c.name === currentUser.country) ||
      GLOBAL_COUNTRIES.find((c) => c.code === 'PK') ||
      GLOBAL_COUNTRIES[0]
    );
  });
  const [editBio, setEditBio] = useState(currentUser.bio || '');
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);

  const [blockedList, setBlockedList] = useState<string[]>([
    'Spammer_99',
    'Troll_User_21',
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenEditProfile = () => {
    setEditName(currentUser.name);
    setEditUsername(currentUser.username);
    const matched =
      GLOBAL_COUNTRIES.find((c) => c.name === currentUser.country) ||
      GLOBAL_COUNTRIES.find((c) => currentUser.phone?.startsWith(c.dialCode)) ||
      GLOBAL_COUNTRIES.find((c) => c.code === 'PK') ||
      GLOBAL_COUNTRIES[0];
    setSelectedCountry(matched);

    let digits = currentUser.phone || '300 1234567';
    if (matched && digits.startsWith(matched.dialCode)) {
      digits = digits.replace(matched.dialCode, '').trim();
    }
    setEditPhone(digits);
    setEditBio(currentUser.bio || '');
    setEditAvatar(currentUser.avatar);
    setShowEditProfileModal(true);
  };

  const handleSaveProfileChanges = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = editPhone.trim();
    const finalPhone = `${selectedCountry.dialCode} ${cleanDigits}`;
    const updated: User = {
      ...currentUser,
      name: editName.trim() || 'Pulse VIP User',
      username: editUsername.startsWith('@') ? editUsername.trim() : `@${editUsername.trim()}`,
      phone: finalPhone,
      country: selectedCountry.name,
      flag: selectedCountry.flag,
      bio: editBio.trim(),
      avatar: editAvatar,
    };
    onUpdateUser(updated);
    setShowEditProfileModal(false);
    showToast(`Profile updated! Country set to ${selectedCountry.flag} ${selectedCountry.name}`);
  };

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(ENV_TEMPLATE);
    soundService.playCoinSound();
    setCopiedEnv(true);
    showToast('.env Configuration Template Copied!');
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    soundService.playCoinSound();
    setCopiedSql(true);
    showToast('Supabase SQL Schema Copied to Clipboard!');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearCache = () => {
    setIsClearingCache(true);
    setTimeout(() => {
      setCacheSize('0.0 KB');
      setIsClearingCache(false);
      showToast('Cache cleared successfully! 42.8 MB freed.');
    }, 700);
  };

  const handleUnblock = (username: string) => {
    setBlockedList((prev) => prev.filter((u) => u !== username));
    showToast(`Unblocked @${username}`);
  };

  const handleSaveSecurityPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.length < 4) {
      showToast('PIN must be at least 4 digits');
      return;
    }
    setShowSecurityPinModal(false);
    setPinCode('');
    showToast('Security PIN successfully updated!');
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#07010e] text-white overflow-y-auto no-scrollbar max-w-md mx-auto relative flex-1 overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gradient-to-r from-pink-600 to-amber-500 text-white font-bold text-xs rounded-full shadow-2xl animate-fade-in flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" /> {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <div className="p-4 flex items-center justify-between border-b border-purple-950/80 bg-[#10041d]/90 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-purple-950/80 text-purple-300 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-black text-white font-heading">Settings</h2>
            <p className="text-[11px] text-purple-300">Account, Security & App Preferences</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5 pb-12">
        {/* ========================================== */}
        {/* SECTION 1: ACCOUNT PROFILE OVERVIEW       */}
        {/* ========================================== */}
        <div className="p-4 rounded-3xl bg-[#130623] border border-purple-900/60 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar3DRing
              avatarUrl={currentUser.avatar}
              altText={currentUser.name}
              size="md"
              level={currentUser.level}
              vipTier={currentUser.vipTier}
              initialTheme="gold"
              isInteractive={true}
            />
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1 font-heading">
                {currentUser.name}
                {currentUser.vipTier === 'Crown' && <span className="text-xs">👑</span>}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <p className="text-xs text-purple-300 font-semibold">{currentUser.username}</p>
                <div className="flex items-center gap-1 bg-purple-950/90 px-2 py-0.5 rounded-lg border border-purple-800/80 text-[11px] font-mono shadow-inner">
                  <span className="text-[9px] uppercase font-bold text-purple-400">ID:</span>
                  <span className="text-amber-300 font-black tracking-wider">{numericUserId}</span>
                  <button
                    onClick={handleCopySettingsUserId}
                    className="p-0.5 rounded text-purple-300 hover:text-white transition active:scale-90"
                    title="Copy User ID"
                  >
                    {copiedSettingsId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 hover:text-amber-300" />
                    )}
                  </button>
                </div>
                {copiedSettingsId && (
                  <span className="text-[10px] text-emerald-400 font-bold animate-fade-in">
                    Copied!
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-sm">{currentUser.flag || '🇵🇰'}</span>
                <span className="text-[10px] text-amber-400 font-mono font-bold tracking-wider">
                  {showSettingsPhone ? currentUser.phone : getMaskedPhone(currentUser.phone)}
                </span>
                <button
                  onClick={() => setShowSettingsPhone(!showSettingsPhone)}
                  className="p-0.5 text-purple-400 hover:text-amber-300 transition"
                  title={showSettingsPhone ? 'Hide private number' : 'Show private phone number'}
                >
                  {showSettingsPhone ? (
                    <EyeOff className="w-3 h-3 text-pink-400" />
                  ) : (
                    <Eye className="w-3 h-3 text-amber-300" />
                  )}
                </button>
                <span className="text-[9px] bg-purple-950 text-amber-300 font-semibold px-1.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-0.5" title="Only you can see this phone number">
                  <Lock className="w-2.5 h-2.5" /> Only You
                </span>
                <span className="text-[9px] text-purple-300 font-semibold bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-800">
                  {currentUser.country || 'Pakistan'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenEditProfile}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs shadow hover:scale-105 active:scale-95 transition flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* ========================================== */}
        {/* SECTION 2: AUTHENTICATION & SWITCH ACCOUNT */}
        {/* ========================================== */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider px-1">
            Account & Sign In
          </span>

          <div className="rounded-3xl bg-[#130623] border border-purple-900/50 overflow-hidden divide-y divide-purple-900/40">
            {/* Country & Phone Number Setting */}
            <button
              onClick={handleOpenEditProfile}
              className="w-full p-3.5 flex items-center justify-between hover:bg-purple-950/40 transition group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-950/60 text-blue-400 group-hover:scale-110 transition">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    Country & Phone Number
                    <span className="text-sm">{currentUser.flag || '🇵🇰'}</span>
                  </div>
                  <div className="text-[10px] text-purple-300">
                    {currentUser.country || 'Pakistan'} • {currentUser.phone}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                <span>Change</span>
                <ChevronRight className="w-4 h-4 text-purple-400" />
              </div>
            </button>

            {/* Log In / Sign In button */}
            <button
              onClick={onOpenAuth}
              className="w-full p-3.5 flex items-center justify-between hover:bg-purple-950/40 transition group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-900/60 text-pink-400 group-hover:scale-110 transition">
                  <LogIn className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Log In / Sign In</div>
                  <div className="text-[10px] text-purple-300">Sign in with phone number & OTP</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400" />
            </button>

            {/* Sign Up / Register New Account */}
            <button
              onClick={onOpenAuth}
              className="w-full p-3.5 flex items-center justify-between hover:bg-purple-950/40 transition group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400 group-hover:scale-110 transition">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Sign Up (New Account)</div>
                  <div className="text-[10px] text-purple-300">Create new user identity & wallet</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400" />
            </button>

            {/* Security PIN / Password */}
            <button
              onClick={() => setShowSecurityPinModal(true)}
              className="w-full p-3.5 flex items-center justify-between hover:bg-purple-950/40 transition group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-950/60 text-amber-400 group-hover:scale-110 transition">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Security PIN & Password</div>
                  <div className="text-[10px] text-purple-300">Protect coins wallet & transactions</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400" />
            </button>

            {/* Quick Account Switcher dropdown */}
            <div className="p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-pink-400" /> Quick Switch Account
                </span>
                <span className="text-[10px] text-purple-400">Tap to switch</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onSwitchUser(user);
                      showToast(`Switched account to ${user.name}`);
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center text-center transition ${
                      currentUser.id === user.id
                        ? 'border-amber-400 bg-purple-900/50 shadow-md ring-1 ring-amber-400'
                        : 'border-purple-900/40 bg-purple-950/30 hover:bg-purple-900/30'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover mb-1 border border-amber-400"
                      />
                      <span className="absolute -bottom-1 -right-1 text-[9px]">
                        {user.flag || '🇵🇰'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-white truncate max-w-full">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[8px] text-amber-400 font-semibold">
                      {user.vipTier}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* SECTION 3: PRIVACY & CALLING SETTINGS     */}
        {/* ========================================== */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider px-1">
            Privacy & Calls
          </span>

          <div className="rounded-3xl bg-[#130623] border border-purple-900/50 overflow-hidden divide-y divide-purple-900/40">
            {/* Private Account */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-900/60 text-purple-300">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Private Profile</div>
                  <div className="text-[10px] text-purple-300">Only approved friends can view your reels</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isPrivateAccount}
                onChange={(e) => {
                  setIsPrivateAccount(e.target.checked);
                  showToast(e.target.checked ? 'Private Account Enabled' : 'Public Account Enabled');
                }}
                className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
              />
            </div>

            {/* Allow 1-to-1 Calls */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-900/60 text-emerald-400">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Allow 1-to-1 Calls</div>
                  <div className="text-[10px] text-purple-300">Receive audio & video calls from friends</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={allowCallsFromStrangers}
                onChange={(e) => {
                  setAllowCallsFromStrangers(e.target.checked);
                  showToast(e.target.checked ? 'Calls Allowed' : 'Calls Restricted');
                }}
                className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
              />
            </div>

            {/* Blocked Users */}
            <button
              onClick={() => setShowBlockedUsers(true)}
              className="w-full p-3.5 flex items-center justify-between hover:bg-purple-950/40 transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-900/60 text-red-400">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Blocked Users</div>
                  <div className="text-[10px] text-purple-300">{blockedList.length} accounts blocked</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400" />
            </button>
          </div>
        </div>

        {/* ========================================== */}
        {/* SECTION 4: PARTY ROOM & LIVE PREFERENCES   */}
        {/* ========================================== */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider px-1">
            Party & Stream Preferences
          </span>

          <div className="rounded-3xl bg-[#130623] border border-purple-900/50 overflow-hidden divide-y divide-purple-900/40">
            {/* Stealth Entrance */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-900/60 text-amber-400">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    Stealth VIP Entrance
                    <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-bold">
                      Crown VIP
                    </span>
                  </div>
                  <div className="text-[10px] text-purple-300">Enter rooms without banner splash</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={stealthEntrance}
                onChange={(e) => {
                  setStealthEntrance(e.target.checked);
                  showToast(e.target.checked ? 'Stealth Entrance On' : 'Standard Entrance On');
                }}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            {/* HD Studio Camera Mode */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-900/60 text-pink-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Ultra HD Camera Mode</div>
                  <div className="text-[10px] text-purple-300">Clean crystal-clear natural video quality</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={beautyCameraDefault}
                onChange={(e) => {
                  setBeautyCameraDefault(e.target.checked);
                  showToast(e.target.checked ? 'Ultra HD Camera Enabled' : 'Standard Quality');
                }}
                className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
              />
            </div>

            {/* HD 1080p Streaming */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-900/60 text-cyan-400">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">High Definition (HD) Video</div>
                  <div className="text-[10px] text-purple-300">Stream high quality video in calls & live</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={hdStreaming}
                onChange={(e) => {
                  setHdStreaming(e.target.checked);
                  showToast(e.target.checked ? 'HD Quality Enabled' : 'Standard Quality Enabled');
                }}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* SECTION 5: SOUND & NOTIFICATIONS           */}
        {/* ========================================== */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider px-1">
            Sound & Notifications
          </span>

          <div className="rounded-3xl bg-[#130623] border border-purple-900/50 overflow-hidden divide-y divide-purple-900/40">
            {/* SFX Volume Slider */}
            <div className="p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">DJ & Gift Sound Effects</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">{sfxVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sfxVolume}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSfxVolume(val);
                  soundService.playCoinSound();
                }}
                className="w-full h-1.5 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* BGM Volume Slider */}
            <div className="p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-pink-400" />
                  <span className="text-xs font-bold text-white">Party Room Background Music</span>
                </div>
                <span className="text-xs font-mono font-bold text-pink-400">{bgmVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={bgmVolume}
                onChange={(e) => setBgmVolume(Number(e.target.value))}
                className="w-full h-1.5 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            {/* Push Notifications */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-900/60 text-purple-300">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Direct Message Alerts</div>
                  <div className="text-[10px] text-purple-300">Direct messages and calls</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => {
                  setPushNotifications(e.target.checked);
                  showToast(e.target.checked ? 'Message Alerts On' : 'Message Alerts Muted');
                }}
                className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* SECTION 6: SYSTEM & UTILITIES              */}
        {/* ========================================== */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider px-1">
            System & Utilities
          </span>

          <div className="rounded-3xl bg-[#130623] border border-purple-900/50 overflow-hidden divide-y divide-purple-900/40">
            {/* App Language */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-900/60 text-cyan-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">App Language</div>
                  <div className="text-[10px] text-purple-300">Choose display language</div>
                </div>
              </div>

              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value as typeof selectedLanguage);
                  showToast('Language preference updated');
                }}
                className="bg-purple-950/80 border border-purple-800 text-xs text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
              >
                <option value="en">English</option>
                <option value="ur">اردو (Urdu)</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="ar">العربية (Arabic)</option>
              </select>
            </div>

            {/* Replay 3D Countdown Intro */}
            <button
              onClick={() => {
                onBack();
                onReplayIntro();
              }}
              className="w-full p-3.5 flex items-center justify-between hover:bg-purple-950/40 transition group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-pink-950/60 text-pink-400 group-hover:scale-110 transition">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Replay 3D Countdown Intro</div>
                  <div className="text-[10px] text-purple-300">Play spaceship countdown with robotic voice</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400" />
            </button>

            {/* Clear App Cache */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-900/60 text-purple-300">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">App Cache & Storage</div>
                  <div className="text-[10px] text-purple-300">Cached video reels & temp files: {cacheSize}</div>
                </div>
              </div>

              <button
                onClick={handleClearCache}
                disabled={isClearingCache || cacheSize === '0.0 KB'}
                className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-xs font-bold text-amber-300 disabled:opacity-40 transition active:scale-95"
              >
                {isClearingCache ? 'Clearing...' : 'Clear'}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* SECTION 6B: CLOUD APIS & DEVELOPER KEYS    */}
        {/* ========================================== */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" /> App Creator & Cloud Keys
            </span>
            {isCreatorUnlocked ? (
              <button
                onClick={handleLockCreator}
                className="text-[10px] text-pink-400 hover:text-pink-300 flex items-center gap-1 font-semibold"
              >
                <Lock className="w-3 h-3" /> Hide Keys (Lock)
              </button>
            ) : (
              <span className="text-[10px] text-purple-400 font-medium flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-amber-400" /> Aam Users Se Hidden
              </span>
            )}
          </div>

          {!isCreatorUnlocked ? (
            /* HIDDEN FROM ORDINARY USERS */
            <div className="p-4 rounded-3xl bg-gradient-to-br from-[#160627] via-[#10041d] to-[#07010e] border border-purple-900/60 shadow-xl">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-purple-950/90 border border-purple-800/80 flex items-center justify-center text-amber-400 shadow-inner flex-shrink-0">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-white font-heading">
                      Cloud APIs & .env Developer Keys
                    </h4>
                    <span className="text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      👑 Sirf Creator K Liye
                    </span>
                  </div>
                  <p className="text-[10px] text-purple-300 mt-1.5 leading-relaxed">
                    Ye section aam users se bilkul hide hai. Sirf App Creator <strong className="text-amber-300">Muhammad Sharif</strong> secret button/PIN verify kar ke Agora, OneSignal aur Supabase keys dekh sakte hain.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-purple-900/50 flex items-center justify-between">
                <div className="text-[10px] text-purple-400 flex items-center gap-1 font-medium">
                  {isCreatorAccount ? (
                    <span className="text-amber-300 font-bold flex items-center gap-1">
                      👑 Creator Account (@sharif_vip)
                    </span>
                  ) : (
                    <span>🔒 Restricted Area</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setCreatorPinError(null);
                    setCreatorPinInput('');
                    setShowCreatorPinModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:opacity-90 text-white font-bold text-xs shadow-lg transition active:scale-95 flex items-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" /> Unlock as Creator 👑
                </button>
              </div>
            </div>
          ) : (
            /* VISIBLE ONLY TO APP CREATOR (MUHAMMAD SHARIF) */
            <div className="p-4 rounded-3xl bg-[#130623] border border-amber-500/50 shadow-2xl space-y-3.5 ring-1 ring-amber-500/20 animate-fade-in">
              <div className="flex items-center justify-between pb-2.5 border-b border-purple-900/50 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Creator: Muhammad Sharif
                  </span>
                  <button
                    onClick={() => {
                      setNewPinInput('');
                      setShowChangePinModal(true);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-purple-950/90 text-amber-300 hover:text-white border border-amber-500/40 text-[9px] font-bold flex items-center gap-1 transition"
                    title="Change your secret Creator PIN"
                  >
                    <Key className="w-2.5 h-2.5 text-amber-400" /> Change Secret PIN
                  </button>
                </div>
                <button
                  onClick={handleLockCreator}
                  className="px-2.5 py-1 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 hover:text-white border border-purple-800 text-[10px] font-semibold flex items-center gap-1 transition"
                >
                  <Lock className="w-3 h-3" /> Hide Again
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-heading">
                    <Database className="w-4 h-4 text-pink-400" /> Agora, OneSignal & Supabase
                  </h4>
                  <p className="text-[10px] text-purple-300 mt-0.5">
                    Configure live RTC calling, push notifications, and cloud database
                  </p>
                </div>
                <button
                  onClick={() => setShowApiKeysModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1"
                >
                  <Key className="w-3.5 h-3.5" /> Keys Setup & .env
                </button>
              </div>

              {/* Service Status Cards */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {/* Supabase */}
                <div className="p-2.5 rounded-2xl bg-purple-950/50 border border-purple-800/60 flex flex-col items-center text-center">
                  <span className="text-base mb-1">⚡</span>
                  <span className="text-[10px] font-bold text-white">Supabase</span>
                  <span className={`text-[9px] font-semibold mt-0.5 px-1.5 py-0.2 rounded-full ${
                    integrations.supabase.isConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {integrations.supabase.isConfigured ? '🟢 Live' : '🟡 .env Ready'}
                  </span>
                </div>

                {/* Agora */}
                <div className="p-2.5 rounded-2xl bg-purple-950/50 border border-purple-800/60 flex flex-col items-center text-center">
                  <span className="text-base mb-1">🎙️</span>
                  <span className="text-[10px] font-bold text-white">Agora RTC</span>
                  <span className={`text-[9px] font-semibold mt-0.5 px-1.5 py-0.2 rounded-full ${
                    integrations.agora.isConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {integrations.agora.isConfigured ? '🟢 Live' : '🟡 .env Ready'}
                  </span>
                </div>

                {/* OneSignal */}
                <div className="p-2.5 rounded-2xl bg-purple-950/50 border border-purple-800/60 flex flex-col items-center text-center">
                  <span className="text-base mb-1">🔔</span>
                  <span className="text-[10px] font-bold text-white">OneSignal</span>
                  <span className={`text-[9px] font-semibold mt-0.5 px-1.5 py-0.2 rounded-full ${
                    integrations.onesignal.isConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {integrations.onesignal.isConfigured ? '🟢 Live' : '🟡 .env Ready'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* SECTION 7: ABOUT & CREATOR INFO            */}
        {/* ========================================== */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider px-1">
            About & Community
          </span>

          <div className="rounded-3xl bg-[#130623] border border-purple-900/50 overflow-hidden divide-y divide-purple-900/40">
            <button
              onClick={() => setShowPolicyModal('Community Guidelines: Be respectful in all 10-20 seat party rooms. Hate speech, harassment, and inappropriate media will lead to account suspension.')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-purple-950/40 transition text-left"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">Community Guidelines</span>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400" />
            </button>

            <button
              onClick={() => setShowPolicyModal('Privacy Policy: Pulse App encrypts your messages and private audio notes. Data is stored safely and never sold to third parties.')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-purple-950/40 transition text-left"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">Privacy Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400" />
            </button>

            {/* App Creator Profile */}
            <div className="p-3.5 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-purple-900/20 to-pink-500/10 border-b border-purple-900/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white">App Creator & Founder</span>
                  <div className="text-[10px] text-amber-300 font-semibold">Pulse Live VIP Network</div>
                </div>
              </div>
              <span className="text-xs font-black text-amber-400 font-heading bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                Muhammad Sharif
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <span className="text-xs font-bold text-white">App Version</span>
              <span className="text-xs font-mono text-purple-300 font-bold">Pulse VIP v1.4.0 (Global)</span>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* SECTION 8: LOG OUT                         */}
        {/* ========================================== */}
        <div className="pt-2 space-y-3">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-950/60 to-purple-950/60 border border-red-800/60 hover:bg-red-900/40 text-red-300 font-black text-xs shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
          >
            <LogOut className="w-4 h-4" /> Log Out from Pulse
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* EDIT PROFILE & COUNTRY MODAL               */}
      {/* ========================================== */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#140628] border border-purple-800 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <button
              onClick={() => setShowEditProfileModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-purple-950/60 text-purple-300 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black text-white font-heading mb-1 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-400" /> Edit Profile & Country
            </h3>
            <p className="text-xs text-purple-300 mb-4">
              Set your personal identity, country code, and phone number.
            </p>

            <form onSubmit={handleSaveProfileChanges} className="space-y-4">
              {/* Avatar section */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative group">
                  <img
                    src={editAvatar}
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
                <div className="flex items-center gap-1.5">
                  {PRESET_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditAvatar(av)}
                      className={`w-7 h-7 rounded-full overflow-hidden border-2 transition ${
                        editAvatar === av ? 'border-amber-400 scale-110' : 'border-transparent opacity-60'
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
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-purple-950/70 border border-purple-800/70 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-purple-200 mb-1 block">Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="@username"
                  className="w-full bg-purple-950/70 border border-purple-800/70 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              {/* Country Selection Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-purple-200">Country</label>
                  <span className="text-[10px] text-amber-400">Available worldwide</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCountryPickerModal(true)}
                  className="w-full flex items-center justify-between bg-purple-950/70 border border-purple-800/70 rounded-xl px-3.5 py-2.5 text-xs text-white hover:bg-purple-900 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <span className="font-bold text-white">{selectedCountry.name}</span>
                    <span className="text-amber-400 font-mono font-bold">({selectedCountry.dialCode})</span>
                  </div>
                  <span className="text-[11px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    Change
                  </span>
                </button>
              </div>

              {/* Phone number input */}
              <div>
                <label className="text-xs font-semibold text-purple-200 mb-1 block">Phone Number</label>
                <div className="flex gap-2">
                  <div className="bg-purple-950/80 border border-purple-800 rounded-xl px-3 py-2.5 text-xs text-amber-400 font-mono font-bold flex items-center gap-1.5 shrink-0">
                    <span>{selectedCountry.flag}</span>
                    <span>{selectedCountry.dialCode}</span>
                  </div>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 300 1234567"
                    className="flex-1 bg-purple-950/70 border border-purple-800/70 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-purple-200 mb-1 block">Bio Status</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  placeholder="Tell people about yourself..."
                  className="w-full bg-purple-950/70 border border-purple-800/70 rounded-xl px-3.5 py-2 text-xs text-white resize-none focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-purple-950/80 text-purple-300 font-bold text-xs hover:bg-purple-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <Check className="w-4 h-4" /> Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Country Picker inside Settings */}
      <CountryPickerModal
        isOpen={showCountryPickerModal}
        onClose={() => setShowCountryPickerModal(false)}
        selectedDialCode={selectedCountry.dialCode}
        onSelectCountry={(c) => {
          setSelectedCountry(c);
        }}
      />

      {/* ========================================== */}
      {/* LOGOUT CONFIRMATION MODAL                  */}
      {/* ========================================== */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs rounded-3xl bg-[#16062a] border border-purple-800 p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white font-heading">Log Out?</h3>
            <p className="text-xs text-purple-300 mt-1 mb-5">
              Are you sure you want to log out of {currentUser.name} ({currentUser.username})?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-1/2 py-2.5 rounded-xl bg-purple-950/80 text-purple-300 font-bold text-xs hover:bg-purple-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/40"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* BLOCKED USERS MODAL                        */}
      {/* ========================================== */}
      {showBlockedUsers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#16062a] border border-purple-800 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowBlockedUsers(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-purple-950/60 text-purple-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-black text-white font-heading mb-1">
              Blocked Users List
            </h3>
            <p className="text-xs text-purple-300 mb-4">
              Blocked users cannot call you or enter your private rooms.
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar mb-4">
              {blockedList.length === 0 ? (
                <div className="py-8 text-center text-xs text-purple-400">
                  No blocked users.
                </div>
              ) : (
                blockedList.map((usr) => (
                  <div
                    key={usr}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/50 border border-purple-900/40"
                  >
                    <span className="text-xs font-bold text-white">@{usr}</span>
                    <button
                      onClick={() => handleUnblock(usr)}
                      className="px-2.5 py-1 rounded-lg bg-purple-900/80 text-xs font-bold text-pink-300 hover:text-white hover:bg-pink-600 transition"
                    >
                      Unblock
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowBlockedUsers(false)}
              className="w-full py-2.5 rounded-xl bg-purple-950/80 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SECURITY PIN MODAL                         */}
      {/* ========================================== */}
      {showSecurityPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs rounded-3xl bg-[#16062a] border border-purple-800 p-6 shadow-2xl text-center relative">
            <button
              onClick={() => setShowSecurityPinModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-purple-950/60 text-purple-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-white font-heading">Set Security PIN</h3>
            <p className="text-xs text-purple-300 mt-1 mb-4">
              Enter 4 to 6 digit security code for your coins wallet.
            </p>
            <form onSubmit={handleSaveSecurityPin} className="space-y-4">
              <input
                type="password"
                maxLength={6}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="••••"
                className="w-full py-3 bg-purple-950/80 border border-purple-800 rounded-xl text-center font-mono text-lg text-white tracking-widest focus:outline-none focus:border-amber-400"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 text-white font-black text-xs shadow-lg"
              >
                Save Security PIN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* POLICY MODAL                               */}
      {/* ========================================== */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#16062a] border border-purple-800 p-6 shadow-2xl text-center">
            <h3 className="text-base font-black text-white font-heading mb-3">
              Pulse Policy & Terms
            </h3>
            <p className="text-xs text-purple-200 leading-relaxed mb-6 text-left bg-purple-950/40 p-3.5 rounded-2xl border border-purple-900/50">
              {showPolicyModal}
            </p>
            <button
              onClick={() => setShowPolicyModal(null)}
              className="w-full py-2.5 rounded-xl bg-purple-900 text-white font-bold text-xs"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* CLOUD API KEYS & .ENV CONFIG MODAL         */}
      {/* ========================================== */}
      {showApiKeysModal && isCreatorUnlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#140626] border border-purple-700/80 p-5 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-800/60">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-500 text-white shadow-lg">
                  <Database className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-white font-heading">
                    API & Cloud Keys Setup
                  </h3>
                  <p className="text-[11px] text-purple-300">
                    Agora, OneSignal & Supabase Integration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowApiKeysModal(false)}
                className="p-1.5 rounded-full bg-purple-950 text-purple-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Service Explanations & Status Cards */}
            <div className="space-y-3 mb-4">
              {/* 1. Supabase */}
              <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-800/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>⚡</span> Supabase (PostgreSQL Database & Auth)
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    integrations.supabase.isConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {integrations.supabase.isConfigured ? 'Connected' : 'Missing in .env'}
                  </span>
                </div>
                <p className="text-[10px] text-purple-300 leading-relaxed mb-2">
                  Multi-device real-time sync, user accounts, and permanent chat storage.
                </p>
                <div className="text-[10px] font-mono bg-black/50 p-2 rounded-xl text-purple-200 border border-white/5 space-y-1">
                  <div className="text-emerald-400 font-bold">VITE_SUPABASE_URL="https://hipwlfpfelznmvojhbin.supabase.co"</div>
                  <div>VITE_SUPABASE_ANON_KEY="your-anon-key"</div>
                  <div>SUPABASE_SERVICE_ROLE_KEY="your-secret-key"</div>
                </div>
              </div>

              {/* 2. Agora */}
              <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-800/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🎙️</span> Agora RTC (Audio/Video & Voice Rooms)
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    integrations.agora.isConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {integrations.agora.isConfigured ? 'Connected' : 'Missing in .env'}
                  </span>
                </div>
                <p className="text-[10px] text-purple-300 leading-relaxed mb-2">
                  Ultra-low latency audio/video calling between multiple phones & 10-20 seat rooms.
                </p>
                <div className="text-[10px] font-mono bg-black/50 p-2 rounded-xl text-purple-200 border border-white/5 space-y-1">
                  <div>VITE_AGORA_APP_ID="your_agora_app_id"</div>
                  <div>AGORA_APP_CERTIFICATE="your_agora_certificate"</div>
                </div>
              </div>

              {/* 3. OneSignal */}
              <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-800/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🔔</span> OneSignal (Push Notifications)
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    integrations.onesignal.isConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {integrations.onesignal.isConfigured ? 'Connected' : 'Missing in .env'}
                  </span>
                </div>
                <p className="text-[10px] text-purple-300 leading-relaxed mb-2">
                  Incoming call alerts, party room invite rings, and chat push alerts.
                </p>
                <div className="text-[10px] font-mono bg-black/50 p-2 rounded-xl text-purple-200 border border-white/5 space-y-1">
                  <div>VITE_ONESIGNAL_APP_ID="your_onesignal_app_id"</div>
                  <div>ONESIGNAL_REST_API_KEY="your_rest_api_key"</div>
                </div>
              </div>
            </div>

            {/* Quick Copy Action */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-900/20 to-pink-500/10 border border-amber-400/30 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5" /> .env Keys File Template
                </span>
                <button
                  onClick={handleCopyEnv}
                  className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-1 transition active:scale-95 shadow"
                >
                  {copiedEnv ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Keys Template
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-purple-200 leading-relaxed">
                Ye template copy karein aur project ki <code className="text-amber-300">.env</code> file me paste kar ke apni real keys daal dein. Server proxies (<code className="text-pink-300">/api/agora/token</code> aur <code className="text-pink-300">/api/onesignal/send</code>) automatically inhein connect kar lengi.
              </p>
            </div>

            {/* Supabase SQL Table Creator Action */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-purple-900/20 to-cyan-500/10 border border-emerald-400/30 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" /> Supabase SQL Tables Script
                </span>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs flex items-center gap-1 transition active:scale-95 shadow"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> SQL Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy SQL Script
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-purple-200 leading-relaxed">
                Supabase Dashboard me <code className="text-emerald-300">SQL Editor</code> open karein, yeh script paste karein aur <code className="text-amber-300">Run</code> dabayein. <code className="text-cyan-300">profiles</code>, <code className="text-cyan-300">rooms</code>, <code className="text-cyan-300">messages</code>, aur <code className="text-cyan-300">reels</code> tables foran ban jayenge.
              </p>
            </div>

            <button
              onClick={() => setShowApiKeysModal(false)}
              className="w-full py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* APP CREATOR PIN VERIFICATION MODAL        */}
      {/* ========================================== */}
      {showCreatorPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#18072e] to-[#0c0316] border border-amber-500/50 p-6 shadow-2xl relative text-center">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowCreatorPinModal(false);
                setCreatorPinError(null);
                setCreatorPinInput('');
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-purple-950/80 text-purple-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Crown Icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-pink-500 text-white flex items-center justify-center mx-auto mb-3 shadow-xl ring-4 ring-amber-500/20">
              <Crown className="w-7 h-7 text-white" />
            </div>

            <h3 className="text-lg font-black text-white font-heading">
              App Creator Verification
            </h3>
            <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <span>👑 Muhammad Sharif</span>
            </div>

            <p className="text-xs text-purple-200 mt-2.5 mb-4 leading-relaxed">
              API Keys aur .env details kisi bhi aam insan k liye accessable nahi hain. Sirf App Creator secret PIN enter kar ke unlock kar sakta hai.
            </p>

            {creatorPinError && (
              <div className="mb-3.5 p-2.5 rounded-xl bg-red-950/80 border border-red-700/60 text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 animate-shake">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{creatorPinError}</span>
              </div>
            )}

            <form onSubmit={handleUnlockCreator} className="space-y-4">
              <div className="text-left">
                <label className="text-[11px] font-bold text-purple-300 block mb-1.5">
                  Enter Secret Creator PIN
                </label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={12}
                    autoFocus
                    value={creatorPinInput}
                    onChange={(e) => {
                      setCreatorPinInput(e.target.value);
                      if (creatorPinError) setCreatorPinError(null);
                    }}
                    placeholder="••••••••"
                    className="w-full py-3 px-4 bg-purple-950/90 border border-purple-800 rounded-xl text-center font-mono text-base text-white tracking-widest placeholder:text-purple-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                  <div className="absolute right-3 top-3 text-purple-400">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {isCreatorAccount && (
                <div className="p-2.5 rounded-xl bg-purple-900/40 border border-purple-800 text-[11px] text-purple-200 text-left flex items-center justify-between">
                  <span>Creator Account: <strong>{currentUser.name}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatorUnlocked(true);
                      setShowCreatorPinModal(false);
                      soundService.playCoinSound();
                      showToast('👑 Creator Verified Automatically!');
                    }}
                    className="text-[10px] text-amber-300 font-bold underline hover:text-amber-200"
                  >
                    1-Tap Unlock
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreatorPinModal(false);
                    setCreatorPinError(null);
                    setCreatorPinInput('');
                  }}
                  className="w-1/2 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-300 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white font-black text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" /> Unlock Keys
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* CHANGE CREATOR SECRET PIN MODAL            */}
      {/* ========================================== */}
      {showChangePinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#170529] border border-amber-500/60 p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setShowChangePinModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-purple-950/80 text-purple-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto mb-3">
              <Key className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-white font-heading">
              Change Secret Creator PIN
            </h3>
            <p className="text-xs text-purple-200 mt-1.5 mb-4 leading-relaxed">
              Apna private secret code set karein ta k sirf aap hi developer keys aur .env open kar sakein.
            </p>

            <form onSubmit={handleChangeCreatorPin} className="space-y-4">
              <div className="text-left">
                <label className="text-[11px] font-bold text-purple-300 block mb-1">
                  New Secret PIN (kam az kam 4 digits)
                </label>
                <input
                  type="password"
                  maxLength={12}
                  autoFocus
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="e.g. 9876 ya koi bhi code"
                  className="w-full py-3 px-4 bg-purple-950/90 border border-purple-800 rounded-xl text-center font-mono text-base text-white tracking-widest focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowChangePinModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white font-bold text-xs shadow-lg transition active:scale-95"
                >
                  Save New PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
