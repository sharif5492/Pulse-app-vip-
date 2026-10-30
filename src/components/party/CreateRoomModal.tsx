import React, { useState, useRef } from 'react';
import { VoiceRoom, User, Seat } from '../../types';
import { Sparkles, Lock, X, Radio, Music, Shield, Camera, Upload } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onCreateRoom: (newRoom: VoiceRoom) => void;
}

const CATEGORIES: VoiceRoom['category'][] = [
  'Pulse VIP',
  'Singing',
  'Gaming',
  'DJ Club',
  'ChitChat',
  'Dating',
];

const WALLPAPERS: { id: VoiceRoom['wallpaper']; label: string; preview: string; img: string }[] = [
  { id: 'pulse', label: '💜 3D Pulse Duo Lounge', preview: 'from-purple-950 to-indigo-950', img: '/themes/pulse_duo_arena.png' },
  { id: 'lion', label: '🦁 3D Golden Lion', preview: 'from-amber-950 to-black', img: '/themes/lion.jpg' },
  { id: 'castle', label: '🏰 3D Royal Castle', preview: 'from-blue-950 to-purple-950', img: '/themes/castle.jpg' },
  { id: 'arena', label: '🏟️ 3D Cyber Arena', preview: 'from-cyan-950 to-fuchsia-950', img: '/themes/arena.jpg' },
  { id: 'love', label: '💖 3D Neon Love', preview: 'from-pink-950 to-purple-950', img: '/themes/love.jpg' },
  { id: 'fight', label: '🥊 3D Dragon Fight', preview: 'from-red-950 to-orange-950', img: '/themes/fight.jpg' },
  { id: 'sultan', label: '👑 3D Sultan Palace', preview: 'from-amber-900 to-yellow-950', img: '/themes/sultan.jpg' },
  { id: 'galaxy', label: '🌌 3D Cosmic Galaxy', preview: 'from-indigo-950 to-cyan-950', img: '/themes/galaxy.jpg' },
  { id: 'emerald', label: '💎 3D Emerald Temple', preview: 'from-emerald-950 to-teal-950', img: '/themes/emerald.jpg' },
  { id: 'ocean', label: '🌊 3D Atlantis Ocean', preview: 'from-blue-950 to-teal-950', img: '/themes/ocean.jpg' },
  { id: 'supercar', label: '🏎️ 3D Cyber Supercar', preview: 'from-cyan-950 to-purple-950', img: '/themes/supercar.jpg' },
];

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCreateRoom,
}) => {
  const [title, setTitle] = useState(`${currentUser.name}'s Pulse Lounge 🎙️`);
  const [category, setCategory] = useState<VoiceRoom['category']>('ChitChat');
  const [wallpaper, setWallpaper] = useState<VoiceRoom['wallpaper']>('pulse');
  const [coverImage, setCoverImage] = useState<string>('/themes/pulse_duo_arena.png');
  const [isCustomDp, setIsCustomDp] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const dpInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDpFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setCoverImage(base64);
        setIsCustomDp(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 6 Seats initialized (3 Duo Pods), seat 0 is Host
    const seats: Seat[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      user: i === 0 ? currentUser : null,
      isLocked: false,
      isMuted: false,
      isSpeaking: false,
      role: i === 0 ? 'host' : 'none',
      pulseStatus: i === 0 ? 'sending' : i === 1 ? 'receiving' : 'none',
    }));

    const roomId = `room_${Date.now()}`;
    const roomTitle = title.trim() || `${currentUser.name}'s Room`;

    // Persist permanent DP and Title to localStorage
    localStorage.setItem(`room_dp_${roomId}`, coverImage);
    localStorage.setItem(`room_title_${roomId}`, roomTitle);
    localStorage.setItem(`room_level_${roomId}`, '1');

    const newRoom: VoiceRoom = {
      id: roomId,
      title: roomTitle,
      host: currentUser,
      coverImage: coverImage,
      category,
      wallpaper,
      level: 1,
      exp: 50,
      maxExp: 200,
      listenersCount: 1,
      seats,
      isLocked: isPasswordProtected,
      password: isPasswordProtected ? password : undefined,
      tags: [category, '6Seats', 'Live'],
      currentBgTrack: 'Midnight Chill',
      activeAnnouncements: [`Welcome to ${roomTitle}! Take a duo seat to talk.`],
    };

    onCreateRoom(newRoom);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#140827] border border-purple-800/80 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-purple-950/60 text-purple-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-500 text-white shadow-lg">
            <Radio className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl font-black text-white font-heading">Create Voice Room</h2>
            <p className="text-xs text-purple-300">Set up your 6-20 seat VIP duo lounge (Expands to 12 at Lv.10 & 20 at Lv.30)</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Name */}
          <div>
            <label className="text-xs font-bold text-purple-200 mb-1.5 block">Room Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dubai Ludo & Antakshari"
              className="w-full bg-purple-950/70 border border-purple-800/70 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          {/* Hidden DP input */}
          <input
            ref={dpInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleDpFileChange}
          />

          {/* Room DP / Avatar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-purple-200 block">Room DP (Display Picture)</label>
              <span className="text-[10px] text-amber-300 font-medium">Permanent</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-purple-950/50 border border-purple-800/60 flex items-center gap-3">
              <div
                onClick={() => dpInputRef.current?.click()}
                className="relative group cursor-pointer shrink-0"
                title="Tap to change DP from gallery"
              >
                <img
                  src={coverImage}
                  alt="Room DP"
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-md group-hover:scale-105 transition"
                />
                <div className="absolute -bottom-1 -right-1 p-1 bg-black/90 rounded-full border border-amber-400">
                  <Camera className="w-2.5 h-2.5 text-amber-300" />
                </div>
              </div>

              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => dpInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photo from Gallery</span>
                </button>
                <p className="text-[9px] text-purple-300 mt-1">
                  Ye photo room ki permanent DP ban jayegi aur khud se change nahi hogi.
                </p>
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-purple-200 mb-1.5 block">Category Tag</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition ${
                    category === cat
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 border-pink-400 text-white shadow-md'
                      : 'bg-purple-950/40 border-purple-800/40 text-purple-300 hover:bg-purple-900/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Room Wallpaper Theme */}
          <div>
            <label className="text-xs font-bold text-purple-200 mb-1.5 block">Room 3D Theme</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar">
              {WALLPAPERS.map((wp) => (
                <button
                  key={wp.id}
                  type="button"
                  onClick={() => {
                    setWallpaper(wp.id);
                    if (!isCustomDp) setCoverImage(wp.img);
                  }}
                  className={`p-2 rounded-xl border text-left transition flex items-center gap-2 ${
                    wallpaper === wp.id
                      ? 'border-amber-400 bg-purple-900/60 shadow-lg ring-1 ring-amber-400'
                      : 'border-purple-900/40 bg-purple-950/30 hover:border-purple-700'
                  }`}
                >
                  <img
                    src={wp.img}
                    alt={wp.label}
                    className="w-8 h-8 rounded-lg object-cover border border-white/20 shrink-0"
                  />
                  <span className="text-[11px] text-white font-medium truncate">{wp.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Password Protection */}
          <div className="bg-purple-950/40 border border-purple-900/50 p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Private Room (Password)
              </span>
              <input
                type="checkbox"
                checked={isPasswordProtected}
                onChange={(e) => setIsPasswordProtected(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
            </div>

            {isPasswordProtected && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set 4-digit passcode"
                maxLength={8}
                className="w-full bg-[#140827] border border-purple-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:opacity-95 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition"
          >
            Launch Party Room <Sparkles className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
