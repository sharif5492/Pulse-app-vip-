import React, { useState, useEffect, useRef, useMemo } from 'react';
import { VoiceRoom, User, Seat, GiftItem, BlockedUser, RoomAllowances, RoomSong, getRoomMaxSeats, Active3DGiftPayload, VIP_LUXURY_GIFTS } from '../../types';
import { soundService } from '../../services/soundService';
import { agoraService } from '../../services/agoraService';
import { DEMO_USERS } from '../../services/storage';
import { GiftModal } from '../common/GiftModal';
import { CinematicGiftPlayer } from './CinematicGiftPlayer';
import { LudoDiceGame } from './LudoDiceGame';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  LogOut,
  Gift,
  Dices,
  Lock,
  Unlock,
  UserX,
  Crown,
  Sparkles,
  Music,
  Share2,
  Users,
  Send,
  Palette,
  Check,
  X,
  Heart,
  MessageCircle,
  MoreVertical,
  ChevronLeft,
  Copy,
  Settings,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Ban,
  UserMinus,
  UserCheck,
  Radio,
  ToggleLeft,
  ToggleRight,
  Search,
  UserPlus,
  AlertTriangle,
  Camera,
  Edit2,
  Play,
  Pause,
  Disc3,
  FolderOpen,
  Upload,
  Trash2,
  Volume1,
  Music2,
  Award,
  Zap,
  TrendingUp,
  Flame,
} from 'lucide-react';

interface VoiceRoomViewProps {
  room: VoiceRoom;
  currentUser: User;
  onLeaveRoom: () => void;
  onUpdateRoom: (room: VoiceRoom) => void;
  onSendCoinsReward: (amount: number) => void;
}

export interface RoomThemeConfig {
  id: VoiceRoom['wallpaper'];
  name: string;
  tagline: string;
  icon: string;
  bgImage: string;
  bgGradient: string;
  tableOuterBorder: string;
  tableOuterShadow: string;
  tableSurfaceBg: string;
  stageDiscBorder: string;
  stageDiscShadow: string;
  stageMicColor: string;
  pedestalBorder: string;
  pedestalGlow: string;
  pedestalIcon: string;
  pulseBeamStart: string;
  pulseBeamEnd: string;
  speakingRipple: string;
  headerAccent: string;
  chatBubbleGift: string;
}

export const ROOM_THEMES: Record<VoiceRoom['wallpaper'], RoomThemeConfig> = {
  lion: {
    id: 'lion',
    name: '3D Golden Lion King',
    tagline: 'Imperial gold palace hall & crowned lion king',
    icon: '🦁',
    bgImage: '/themes/lion.jpg',
    bgGradient: 'from-amber-950/60 via-[#120703]/80 to-black',
    tableOuterBorder: 'border-amber-400/80',
    tableOuterShadow: 'shadow-[0_0_50px_rgba(251,191,36,0.4),inset_0_2px_15px_rgba(255,255,255,0.2)]',
    tableSurfaceBg: 'from-[#2b1604]/90 via-[#180a01]/95 to-[#080300]',
    stageDiscBorder: 'border-amber-400',
    stageDiscShadow: 'shadow-[0_0_35px_rgba(245,158,11,0.7)]',
    stageMicColor: 'text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,1)]',
    pedestalBorder: 'border-amber-400/70 hover:border-amber-300',
    pedestalGlow: 'shadow-[0_6px_22px_rgba(245,158,11,0.45)]',
    pedestalIcon: 'text-amber-200',
    pulseBeamStart: '#fbbf24',
    pulseBeamEnd: '#f59e0b',
    speakingRipple: 'border-amber-400',
    headerAccent: 'text-amber-300 border-amber-500/40 bg-amber-500/20',
    chatBubbleGift: 'from-amber-500/40 to-yellow-600/40 border-amber-400/60 text-amber-200',
  },
  castle: {
    id: 'castle',
    name: '3D Moonlight Castle',
    tagline: 'Fairy-tale royal castle illuminated under starlight',
    icon: '🏰',
    bgImage: '/themes/castle.jpg',
    bgGradient: 'from-blue-950/60 via-[#070b24]/80 to-black',
    tableOuterBorder: 'border-sky-400/70',
    tableOuterShadow: 'shadow-[0_0_50px_rgba(56,189,248,0.4),inset_0_2px_15px_rgba(255,255,255,0.2)]',
    tableSurfaceBg: 'from-[#0d163d]/90 via-[#060a21]/95 to-[#02040f]',
    stageDiscBorder: 'border-sky-400',
    stageDiscShadow: 'shadow-[0_0_35px_rgba(56,189,248,0.65)]',
    stageMicColor: 'text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,1)]',
    pedestalBorder: 'border-sky-400/70 hover:border-sky-300',
    pedestalGlow: 'shadow-[0_6px_22px_rgba(56,189,248,0.4)]',
    pedestalIcon: 'text-sky-200',
    pulseBeamStart: '#38bdf8',
    pulseBeamEnd: '#a855f7',
    speakingRipple: 'border-sky-400',
    headerAccent: 'text-sky-300 border-sky-500/40 bg-sky-500/20',
    chatBubbleGift: 'from-sky-500/40 to-indigo-600/40 border-sky-400/60 text-sky-200',
  },
  arena: {
    id: 'arena',
    name: '3D Cyber Battle Arena',
    tagline: 'Futuristic holographic esports stadium & laser towers',
    icon: '🏟️',
    bgImage: '/themes/arena.jpg',
    bgGradient: 'from-cyan-950/60 via-[#0b0324]/80 to-black',
    tableOuterBorder: 'border-cyan-400/80',
    tableOuterShadow: 'shadow-[0_0_55px_rgba(6,182,212,0.45),inset_0_2px_15px_rgba(255,255,255,0.2)]',
    tableSurfaceBg: 'from-[#07243a]/90 via-[#041221]/95 to-[#01060d]',
    stageDiscBorder: 'border-cyan-400',
    stageDiscShadow: 'shadow-[0_0_35px_rgba(6,182,212,0.7)]',
    stageMicColor: 'text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,1)]',
    pedestalBorder: 'border-cyan-400/70 hover:border-cyan-300',
    pedestalGlow: 'shadow-[0_6px_22px_rgba(6,182,212,0.45)]',
    pedestalIcon: 'text-cyan-200',
    pulseBeamStart: '#00e5ff',
    pulseBeamEnd: '#ec4899',
    speakingRipple: 'border-cyan-400',
    headerAccent: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/20',
    chatBubbleGift: 'from-cyan-500/40 to-fuchsia-600/40 border-cyan-400/60 text-cyan-200',
  },
  love: {
    id: 'love',
    name: '3D Romantic Neon Love',
    tagline: 'Glowing neon heart terrace with rose petals & starry sky',
    icon: '💖',
    bgImage: '/themes/love.jpg',
    bgGradient: 'from-pink-950/60 via-[#210419]/80 to-black',
    tableOuterBorder: 'border-pink-500/80',
    tableOuterShadow: 'shadow-[0_0_55px_rgba(236,72,153,0.45),inset_0_2px_15px_rgba(255,255,255,0.2)]',
    tableSurfaceBg: 'from-[#38092a]/90 via-[#210418]/95 to-[#0f010b]',
    stageDiscBorder: 'border-pink-500',
    stageDiscShadow: 'shadow-[0_0_35px_rgba(236,72,153,0.75)]',
    stageMicColor: 'text-pink-400 drop-shadow-[0_0_12px_rgba(236,72,153,1)]',
    pedestalBorder: 'border-pink-400/70 hover:border-pink-300',
    pedestalGlow: 'shadow-[0_6px_22px_rgba(236,72,153,0.45)]',
    pedestalIcon: 'text-pink-200',
    pulseBeamStart: '#ec4899',
    pulseBeamEnd: '#f43f5e',
    speakingRipple: 'border-pink-400',
    headerAccent: 'text-pink-300 border-pink-500/40 bg-pink-500/20',
    chatBubbleGift: 'from-pink-500/40 to-rose-600/40 border-pink-400/60 text-pink-200',
  },
  fight: {
    id: 'fight',
    name: '3D Fire Dragon Fight',
    tagline: 'Volcanic lava battle arena with steel ropes & roaring dragons',
    icon: '🥊',
    bgImage: '/themes/fight.jpg',
    bgGradient: 'from-red-950/60 via-[#1f0502]/80 to-black',
    tableOuterBorder: 'border-orange-500/80',
    tableOuterShadow: 'shadow-[0_0_55px_rgba(249,115,22,0.45),inset_0_2px_15px_rgba(255,255,255,0.2)]',
    tableSurfaceBg: 'from-[#3b0d06]/90 via-[#210502]/95 to-[#0d0200]',
    stageDiscBorder: 'border-red-500',
    stageDiscShadow: 'shadow-[0_0_35px_rgba(239,68,68,0.75)]',
    stageMicColor: 'text-orange-400 drop-shadow-[0_0_12px_rgba(249,115,22,1)]',
    pedestalBorder: 'border-orange-500/70 hover:border-orange-400',
    pedestalGlow: 'shadow-[0_6px_22px_rgba(249,115,22,0.45)]',
    pedestalIcon: 'text-orange-200',
    pulseBeamStart: '#f97316',
    pulseBeamEnd: '#ef4444',
    speakingRipple: 'border-orange-500',
    headerAccent: 'text-orange-300 border-orange-500/40 bg-orange-500/20',
    chatBubbleGift: 'from-orange-500/40 to-red-600/40 border-orange-400/60 text-orange-200',
  },
  sultan: {
    id: 'sultan',
    name: '3D Dubai Sultan Palace',
    tagline: 'Grand marble hall with crystal chandelier & crescent dome',
    icon: '👑',
    bgImage: '/themes/sultan.jpg',
    bgGradient: 'from-amber-950/60 via-[#170e03]/80 to-black',
    tableOuterBorder: 'border-amber-400/80',
    tableOuterShadow: 'shadow-[0_0_50px_rgba(251,191,36,0.4)]',
    tableSurfaceBg: 'from-[#2a1705]/90 via-[#150a01]/95 to-[#070300]',
    stageDiscBorder: 'border-amber-400',
    stageDiscShadow: 'shadow-[0_0_35px_rgba(245,158,11,0.7)]',
    stageMicColor: 'text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,1)]',
    pedestalBorder: 'border-amber-400/70 hover:border-amber-300',
    pedestalGlow: 'shadow-[0_6px_22px_rgba(245,158,11,0.4)]',
    pedestalIcon: 'text-amber-200',
    pulseBeamStart: '#eab308',
    pulseBeamEnd: '#f59e0b',
    speakingRipple: 'border-amber-400',
    headerAccent: 'text-amber-300 border-amber-500/40 bg-amber-500/20',
    chatBubbleGift: 'from-amber-500/40 to-yellow-600/40 border-amber-400/60 text-amber-200',
  },
  galaxy: {
    id: 'galaxy',
    name: '3D Cosmic Stargate',
    tagline: 'Surreal portal gate through celestial nebulae & stellar dust',
    icon: '🌌',
    bgImage: '/themes/galaxy.jpg',
    bgGradient: 'from-indigo-950/60 via-[#0b062b]/80 to-black',
    tableOuterBorder: 'border-indigo-400/80',
    tableOuterShadow: 'shadow-[0_0_55px_rgba(99,102,241,0.45)]',
    tableSurfaceBg: 'from-[#140c3d]/90 via-[#080424]/95 to-[#030112]',
    stageDiscBorder: 'border-indigo-400',
    stageDiscShadow: 'shadow-[0_0_35px_rgba(99,102,241,0.7)]',
    stageMicColor: 'text-indigo-300 drop-shadow-[0_0_12px_rgba(99,102,241,1)]',
    pedestalBorder: 'border-indigo-400/70 hover:border-indigo-300',
    pedestalGlow: 'shadow-[0_6px_22px_rgba(99,102,241,0.4)]',
    pedestalIcon: 'text-indigo-200',
    pulseBeamStart: '#818cf8',
    pulseBeamEnd: '#06b6d4',
    speakingRipple: 'border-indigo-400',
    headerAccent: 'text-indigo-300 border-indigo-500/40 bg-indigo-500/20',
    chatBubbleGift: 'from-indigo-500/40 to-sky-600/40 border-indigo-400/60 text-indigo-200',
  },
  emerald: {
    id: 'emerald',
    name: '3D Emerald Temple',
    tagline: 'Mystic jade crystal caverns with gem waterfalls',
    icon: '💎',
    bgImage: '/themes/emerald.jpg',
    bgGradient: 'from-emerald-950/60 via-[#021c15]/80 to-black',
    tableOuterBorder: 'border-emerald-400/80',
    tableOuterShadow: 'shadow-[0_0_55px_rgba(16,185,129,0.45)]',
    tableSurfaceBg: 'from-[#052e24]/90 via-[#021c16]/95 to-[#010d0a]',
    stageDiscBorder: 'border-emerald-400',
    stageDiscShadow: 'shadow-[0_0_35px_rgba(16,185,129,0.7)]',
    stageMicColor: 'text-emerald-300 drop-shadow-[0_0_12px_rgba(16,185,129,1)]',
    pedestalBorder: 'border-emerald-400/70 hover:border-emerald-300',
    pedestalGlow: 'shadow-[0_6px_22px_rgba(16,185,129,0.4)]',
    pedestalIcon: 'text-emerald-200',
    pulseBeamStart: '#10b981',
    pulseBeamEnd: '#14b8a6',
    speakingRipple: 'border-emerald-400',
    headerAccent: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/20',
    chatBubbleGift: 'from-emerald-500/40 to-teal-600/40 border-emerald-400/60 text-emerald-200',
  },
  ocean: {
    id: 'ocean',
    name: '3D Atlantis Ocean',
    tagline: 'Deep turquoise aquatic palace with glowing coral reefs',
    icon: '🌊',
    bgImage: '/themes/ocean.jpg',
    bgGradient: 'from-teal-950/60 via-[#021f24]/80 to-black',
    tableOuterBorder: 'border-teal-400/80',
    tableOuterShadow: 'shadow-[0_0_55px_rgba(20,184,166,0.45)]',
    tableSurfaceBg: 'from-[#042e36]/90 via-[#021d21]/95 to-[#010e11]',
    stageDiscBorder: 'border-teal-400',
    stageDiscShadow: 'shadow-[0_0_35px_rgba(20,184,166,0.7)]',
    stageMicColor: 'text-teal-300 drop-shadow-[0_0_12px_rgba(20,184,166,1)]',
    pedestalBorder: 'border-teal-400/70 hover:border-teal-300',
    pedestalGlow: 'shadow-[0_6px_22px_rgba(20,184,166,0.4)]',
    pedestalIcon: 'text-teal-200',
    pulseBeamStart: '#06b6d4',
    pulseBeamEnd: '#3b82f6',
    speakingRipple: 'border-teal-400',
    headerAccent: 'text-teal-300 border-teal-500/40 bg-teal-500/20',
    chatBubbleGift: 'from-teal-500/40 to-blue-600/40 border-teal-400/60 text-teal-200',
  },
  supercar: {
    id: 'supercar',
    name: '3D Cyber Supercar',
    tagline: 'High-speed neon expressway over futuristic cyberpunk city',
    icon: '🏎️',
    bgImage: '/themes/supercar.jpg',
    bgGradient: 'from-cyan-950/60 via-[#110526]/80 to-black',
    tableOuterBorder: 'border-cyan-400/80',
    tableOuterShadow: 'shadow-[0_0_55px_rgba(6,182,212,0.45)]',
    tableSurfaceBg: 'from-[#0e173d]/90 via-[#080d24]/95 to-[#020512]',
    stageDiscBorder: 'border-cyan-400',
    stageDiscShadow: 'shadow-[0_0_35px_rgba(6,182,212,0.7)]',
    stageMicColor: 'text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,1)]',
    pedestalBorder: 'border-cyan-400/70 hover:border-cyan-300',
    pedestalGlow: 'shadow-[0_6px_22px_rgba(6,182,212,0.45)]',
    pedestalIcon: 'text-cyan-200',
    pulseBeamStart: '#00e5ff',
    pulseBeamEnd: '#d946ef',
    speakingRipple: 'border-cyan-400',
    headerAccent: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/20',
    chatBubbleGift: 'from-cyan-500/40 to-fuchsia-600/40 border-cyan-400/60 text-cyan-200',
  },
  pulse: {
    id: 'pulse',
    name: '3D Pulse Duo Lounge',
    tagline: 'VIP Pulse Duo Arena with neon hearts & dual sofa pods',
    icon: '💜',
    bgImage: '/themes/pulse_duo_arena.png',
    bgGradient: 'from-purple-950/60 via-[#120626]/80 to-black',
    tableOuterBorder: 'border-pink-500/70',
    tableOuterShadow: 'shadow-[0_0_50px_rgba(236,72,153,0.4)]',
    tableSurfaceBg: 'from-[#1e0736]/90 via-[#120321]/95 to-[#07010f]',
    stageDiscBorder: 'border-pink-500',
    stageDiscShadow: 'shadow-[0_0_35px_rgba(236,72,153,0.7)]',
    stageMicColor: 'text-pink-400 drop-shadow-[0_0_12px_rgba(236,72,153,1)]',
    pedestalBorder: 'border-cyan-400/70 hover:border-cyan-300',
    pedestalGlow: 'shadow-[0_6px_20px_rgba(0,229,255,0.4)]',
    pedestalIcon: 'text-cyan-200',
    pulseBeamStart: '#00e5ff',
    pulseBeamEnd: '#ec4899',
    speakingRipple: 'border-cyan-400',
    headerAccent: 'text-pink-300 border-pink-500/40 bg-pink-500/20',
    chatBubbleGift: 'from-pink-500/40 to-purple-600/40 border-pink-400/60 text-pink-200',
  },
  royal: {
    id: 'royal',
    name: '3D Golden Lion Kingdom',
    tagline: 'Imperial gold palace hall & crowned lion king',
    icon: '👑',
    bgImage: '/themes/lion.jpg',
    bgGradient: 'from-amber-950/60 via-[#120703]/80 to-black',
    tableOuterBorder: 'border-amber-400/80',
    tableOuterShadow: 'shadow-[0_0_50px_rgba(251,191,36,0.4)]',
    tableSurfaceBg: 'from-[#2b1604]/90 via-[#180a01]/95 to-[#080300]',
    stageDiscBorder: 'border-amber-400',
    stageDiscShadow: 'shadow-[0_0_35px_rgba(245,158,11,0.7)]',
    stageMicColor: 'text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,1)]',
    pedestalBorder: 'border-amber-400/70 hover:border-amber-300',
    pedestalGlow: 'shadow-[0_6px_22px_rgba(245,158,11,0.45)]',
    pedestalIcon: 'text-amber-200',
    pulseBeamStart: '#fbbf24',
    pulseBeamEnd: '#f59e0b',
    speakingRipple: 'border-amber-400',
    headerAccent: 'text-amber-300 border-amber-500/40 bg-amber-500/20',
    chatBubbleGift: 'from-amber-500/40 to-yellow-600/40 border-amber-400/60 text-amber-200',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: '3D Cyber Supercar',
    tagline: 'High-speed neon expressway over futuristic city',
    icon: '⚡',
    bgImage: '/themes/supercar.jpg',
    bgGradient: 'from-cyan-950/60 via-[#110526]/80 to-black',
    tableOuterBorder: 'border-cyan-400/80',
    tableOuterShadow: 'shadow-[0_0_55px_rgba(6,182,212,0.45)]',
    tableSurfaceBg: 'from-[#0e173d]/90 via-[#080d24]/95 to-[#020512]',
    stageDiscBorder: 'border-cyan-400',
    stageDiscShadow: 'shadow-[0_0_35px_rgba(6,182,212,0.7)]',
    stageMicColor: 'text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,1)]',
    pedestalBorder: 'border-cyan-400/70 hover:border-cyan-300',
    pedestalGlow: 'shadow-[0_6px_22px_rgba(6,182,212,0.45)]',
    pedestalIcon: 'text-cyan-200',
    pulseBeamStart: '#00e5ff',
    pulseBeamEnd: '#d946ef',
    speakingRipple: 'border-cyan-400',
    headerAccent: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/20',
    chatBubbleGift: 'from-cyan-500/40 to-fuchsia-600/40 border-cyan-400/60 text-cyan-200',
  },
  arabian: {
    id: 'arabian',
    name: '3D Moonlight Castle',
    tagline: 'Fairy-tale royal castle illuminated under starlight',
    icon: '🕌',
    bgImage: '/themes/castle.jpg',
    bgGradient: 'from-blue-950/60 via-[#070b24]/80 to-black',
    tableOuterBorder: 'border-sky-400/70',
    tableOuterShadow: 'shadow-[0_0_50px_rgba(56,189,248,0.4)]',
    tableSurfaceBg: 'from-[#0d163d]/90 via-[#060a21]/95 to-[#02040f]',
    stageDiscBorder: 'border-sky-400',
    stageDiscShadow: 'shadow-[0_0_35px_rgba(56,189,248,0.65)]',
    stageMicColor: 'text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,1)]',
    pedestalBorder: 'border-sky-400/70 hover:border-sky-300',
    pedestalGlow: 'shadow-[0_6px_22px_rgba(56,189,248,0.4)]',
    pedestalIcon: 'text-sky-200',
    pulseBeamStart: '#38bdf8',
    pulseBeamEnd: '#a855f7',
    speakingRipple: 'border-sky-400',
    headerAccent: 'text-sky-300 border-sky-500/40 bg-sky-500/20',
    chatBubbleGift: 'from-sky-500/40 to-indigo-600/40 border-sky-400/60 text-sky-200',
  },
  sunset: {
    id: 'sunset',
    name: '3D Romantic Neon Love',
    tagline: 'Glowing neon heart terrace with rose petals',
    icon: '🌅',
    bgImage: '/themes/love.jpg',
    bgGradient: 'from-pink-950/60 via-[#210419]/80 to-black',
    tableOuterBorder: 'border-pink-500/80',
    tableOuterShadow: 'shadow-[0_0_55px_rgba(236,72,153,0.45)]',
    tableSurfaceBg: 'from-[#38092a]/90 via-[#210418]/95 to-[#0f010b]',
    stageDiscBorder: 'border-pink-500',
    stageDiscShadow: 'shadow-[0_0_35px_rgba(236,72,153,0.75)]',
    stageMicColor: 'text-pink-400 drop-shadow-[0_0_12px_rgba(236,72,153,1)]',
    pedestalBorder: 'border-pink-400/70 hover:border-pink-300',
    pedestalGlow: 'shadow-[0_6px_22px_rgba(236,72,153,0.45)]',
    pedestalIcon: 'text-pink-200',
    pulseBeamStart: '#ec4899',
    pulseBeamEnd: '#f43f5e',
    speakingRipple: 'border-pink-400',
    headerAccent: 'text-pink-300 border-pink-500/40 bg-pink-500/20',
    chatBubbleGift: 'from-pink-500/40 to-rose-600/40 border-pink-400/60 text-pink-200',
  },
};

// 2-Seat Duo Pods Configuration across Levels (6, 12, and 20 Seats)
export interface DuoPodConfig {
  podIndex: number;
  seatAId: number;
  seatBId: number;
  leftPct: number;
  topPct: number;
  label: string;
}

// Tier 1: 6 Seats (3 Duo Pods: Seat 1-2, Seat 3-4, Seat 5-6)
const DUO_PODS_6: DuoPodConfig[] = [
  { podIndex: 0, seatAId: 0, seatBId: 1, leftPct: 50, topPct: 20, label: 'Seat 1 - 2' },
  { podIndex: 1, seatAId: 2, seatBId: 3, leftPct: 76, topPct: 68, label: 'Seat 3 - 4' },
  { podIndex: 2, seatAId: 4, seatBId: 5, leftPct: 24, topPct: 68, label: 'Seat 5 - 6' },
];

// Tier 2: 12 Seats (6 Duo Pods: 1-2, 3-4, 5-6, 7-8, 9-10, 11-12) - Unlocked at Level 10
const DUO_PODS_12: DuoPodConfig[] = [
  { podIndex: 0, seatAId: 0, seatBId: 1, leftPct: 50, topPct: 18, label: 'Seat 1 - 2' },
  { podIndex: 1, seatAId: 2, seatBId: 3, leftPct: 80, topPct: 34, label: 'Seat 3 - 4' },
  { podIndex: 2, seatAId: 4, seatBId: 5, leftPct: 80, topPct: 66, label: 'Seat 5 - 6' },
  { podIndex: 3, seatAId: 6, seatBId: 7, leftPct: 50, topPct: 80, label: 'Seat 7 - 8' },
  { podIndex: 4, seatAId: 8, seatBId: 9, leftPct: 20, topPct: 66, label: 'Seat 9 - 10' },
  { podIndex: 5, seatAId: 10, seatBId: 11, leftPct: 20, topPct: 34, label: 'Seat 11 - 12' },
];

// Tier 3: 20 Seats Super VIP Arena (10 Duo Pods: exactly matching user reference photo) - Unlocked at Level 30
const DUO_PODS_20: DuoPodConfig[] = [
  { podIndex: 0, seatAId: 0, seatBId: 1, leftPct: 50, topPct: 15, label: 'Seat 1 - 2' },
  { podIndex: 1, seatAId: 2, seatBId: 3, leftPct: 74, topPct: 21, label: 'Seat 3 - 4' },
  { podIndex: 2, seatAId: 4, seatBId: 5, leftPct: 86, topPct: 35, label: 'Seat 5 - 6' },
  { podIndex: 3, seatAId: 6, seatBId: 7, leftPct: 86, topPct: 53, label: 'Seat 7 - 8' },
  { podIndex: 4, seatAId: 8, seatBId: 9, leftPct: 75, topPct: 68, label: 'Seat 9 - 10' },
  { podIndex: 5, seatAId: 10, seatBId: 11, leftPct: 50, topPct: 78, label: 'Seat 11 - 12' },
  { podIndex: 6, seatAId: 12, seatBId: 13, leftPct: 25, topPct: 68, label: 'Seat 13 - 14' },
  { podIndex: 7, seatAId: 14, seatBId: 15, leftPct: 14, topPct: 53, label: 'Seat 15 - 16' },
  { podIndex: 8, seatAId: 16, seatBId: 17, leftPct: 14, topPct: 35, label: 'Seat 17 - 18' },
  { podIndex: 9, seatAId: 18, seatBId: 19, leftPct: 26, topPct: 21, label: 'Seat 19 - 20' },
];

export const VoiceRoomView: React.FC<VoiceRoomViewProps> = ({
  room,
  currentUser,
  onLeaveRoom,
  onUpdateRoom,
  onSendCoinsReward,
}) => {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [selectedSeatForAdmin, setSelectedSeatForAdmin] = useState<Seat | null>(null);
  const [activeGiftTarget, setActiveGiftTarget] = useState<{
    name: string;
    seatId?: number;
    isAll?: boolean;
  } | null>(null);
  const [active3DGift, setActive3DGift] = useState<Active3DGiftPayload | null>(null);
  const [cinematicPhase, setCinematicPhase] = useState<'box_3d' | 'box_flash' | 'reveal_grid' | 'cinematic_video' | null>(null);
  const [isDjBgmActive, setIsDjBgmActive] = useState(false);
  const [showDjBoard, setShowDjBoard] = useState(false);
  const [showLudoDice, setShowLudoDice] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Expose global window.playCinematicGift method for testing & instant playback
  useEffect(() => {
    (window as unknown as { playCinematicGift?: (giftName: string) => void }).playCinematicGift = (giftName: string) => {
      const query = (giftName || '').toLowerCase();
      const matched =
        VIP_LUXURY_GIFTS.find((g) => g.name.toLowerCase().includes(query)) ||
        VIP_LUXURY_GIFTS.find((g) => g.id.toLowerCase().includes(query)) ||
        VIP_LUXURY_GIFTS[0];

      setActive3DGift({
        id: `cinematic_${Date.now()}`,
        gift: matched,
        quantity: 1,
        sender: currentUser,
        targetName: 'All 12 Seats',
        timestamp: Date.now(),
      });
    };

    return () => {
      delete (window as unknown as { playCinematicGift?: (giftName: string) => void }).playCinematicGift;
    };
  }, [currentUser]);

  // Pulse Connection Synergy & Boost State
  const [synergyScore, setSynergyScore] = useState(98);
  const [pulseBoostActive, setPulseBoostActive] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number }[]>([]);

  // Room Settings & Allowances Modal State
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  const [roomSettingsTab, setRoomSettingsTab] = useState<'allowances' | 'profile' | 'members' | 'blocked'>('allowances');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [newBlockInput, setNewBlockInput] = useState('');

  // Room DP & Title (Strict LocalStorage Persistence so DP & Name never change on their own)
  const savedDpKey = `room_dp_${room.id}`;
  const [roomDp, setRoomDp] = useState<string>(() => {
    return (
      localStorage.getItem(savedDpKey) ||
      room.coverImage ||
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80'
    );
  });
  const roomDpInputRef = useRef<HTMLInputElement>(null);

  const savedTitleKey = `room_title_${room.id}`;
  const [roomTitle, setRoomTitle] = useState<string>(() => {
    return localStorage.getItem(savedTitleKey) || room.title || 'Voice Chat Room';
  });
  const [showEditTitleModal, setShowEditTitleModal] = useState(false);
  const [tempTitleInput, setTempTitleInput] = useState(roomTitle);

  // Room Level & Dynamic Seats State (Level 1-9: 10 Seats, Level 10-29: 15 Seats, Level 30+: 20 Seats)
  const savedLevelKey = `room_level_${room.id}`;
  const [roomLevel, setRoomLevel] = useState<number>(() => {
    const saved = localStorage.getItem(savedLevelKey);
    return saved ? Number(saved) : (room.level || 1);
  });
  const [roomExp, setRoomExp] = useState<number>(room.exp || 180);
  const [showLevelModal, setShowLevelModal] = useState(false);

  const maxSeatsCount = getRoomMaxSeats(roomLevel);

  const currentDuoPods = useMemo(() => {
    if (maxSeatsCount === 20) return DUO_PODS_20;
    if (maxSeatsCount === 12) return DUO_PODS_12;
    return DUO_PODS_6;
  }, [maxSeatsCount]);

  const handleUpgradeRoomLevel = (targetLevel: number) => {
    setRoomLevel(targetLevel);
    localStorage.setItem(savedLevelKey, targetLevel.toString());
    const newMaxSeats = getRoomMaxSeats(targetLevel);
    const targetExp = targetLevel >= 30 ? 2500 : targetLevel >= 10 ? 650 : 180;
    setRoomExp(targetExp);

    const newSeats: Seat[] = Array.from({ length: newMaxSeats }, (_, i) => {
      return (
        safeSeats[i] || {
          id: i,
          user: i === 0 ? room.host : null,
          isLocked: false,
          isMuted: false,
          isSpeaking: false,
          role: i === 0 ? 'host' : 'none',
          pulseStatus: i === 0 ? ('sending' as const) : i === 1 ? ('receiving' as const) : ('none' as const),
        }
      );
    });

    onUpdateRoom({
      ...room,
      level: targetLevel,
      exp: targetExp,
      seats: newSeats,
    });

    soundService.playGiftFanfare();
    setRoomBanner(`🎉 ROOM LEVEL UP! Level ${targetLevel} reached! ${newMaxSeats} Seats unlocked! 🚀`);
    setTimeout(() => setRoomBanner(null), 5000);

    setRoomComments((prev) => [
      ...prev,
      {
        id: `lvl_${Date.now()}`,
        user: 'ROOM SYSTEM 👑',
        text: `Room upgraded to Level ${targetLevel}! Arena capacity expanded to ${newMaxSeats} SEATS! 🌟`,
        isGift: true,
      },
    ]);
  };

  // Room Song & Music Player State
  const [showSongModal, setShowSongModal] = useState(false);
  const [roomPlaylist, setRoomPlaylist] = useState<RoomSong[]>(() => {
    return (
      room.playlist || [
        {
          id: 'preset_1',
          title: 'Sufi Soul Pulse VIP (Acoustic)',
          artist: 'Zara Khan & Sufi Duo',
          duration: '03:45',
          addedBy: 'Aryan Khan',
          url: 'https://cdn.freesound.org/previews/612/612621_5674468-lq.mp3',
        },
        {
          id: 'preset_2',
          title: 'Late Night Chill Hop Beats',
          artist: 'DJ Kabir Remix',
          duration: '02:50',
          addedBy: 'DJ Kabir',
          url: 'https://cdn.freesound.org/previews/530/530379_11568288-lq.mp3',
        },
        {
          id: 'preset_3',
          title: 'Cyberpunk Bass Drop Club Mix',
          artist: 'Neon Studio',
          duration: '04:15',
          addedBy: 'Pulse Master',
          url: 'https://cdn.freesound.org/previews/450/450438_6890478-lq.mp3',
        },
      ]
    );
  });
  const [currentSong, setCurrentSong] = useState<RoomSong | null>(null);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [songVolume, setSongVolume] = useState(80);
  const [songProgress, setSongProgress] = useState(0);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const songFileInputRef = useRef<HTMLInputElement>(null);

  // Room DP Update
  const handleUpdateRoomDp = (newDpUrl: string) => {
    setRoomDp(newDpUrl);
    localStorage.setItem(savedDpKey, newDpUrl);
    onUpdateRoom({
      ...room,
      coverImage: newDpUrl,
    });
    soundService.playGiftFanfare();
    setRoomBanner('🖼️ Room DP updated & permanently saved!');
    setTimeout(() => setRoomBanner(null), 3500);
  };

  const handleRoomDpFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        handleUpdateRoomDp(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Room Title Update
  const handleSaveRoomTitle = () => {
    if (!tempTitleInput.trim()) return;
    const newTitle = tempTitleInput.trim();
    setRoomTitle(newTitle);
    localStorage.setItem(savedTitleKey, newTitle);
    onUpdateRoom({
      ...room,
      title: newTitle,
    });
    soundService.playCoinSound();
    setRoomBanner(`🎉 Room Name updated to "${newTitle}"!`);
    setTimeout(() => setRoomBanner(null), 3500);
    setShowEditTitleModal(false);
  };

  // Song Player Handlers
  const handlePlaySong = (song: RoomSong) => {
    setCurrentSong(song);
    setIsPlayingSong(true);
    soundService.playCoinSound();
    setRoomBanner(`🎶 Now Playing: "${song.title}" on Room Mic!`);
    setTimeout(() => setRoomBanner(null), 4000);

    setRoomComments((prev) => [
      ...prev,
      {
        id: `song_${Date.now()}`,
        user: 'MUSIC DJ 🎵',
        text: `${currentUser.name} is now playing "${song.title}" on mic! 🎧`,
        isGift: true,
      },
    ]);

    if (audioPlayerRef.current) {
      audioPlayerRef.current.src = song.url;
      audioPlayerRef.current.volume = songVolume / 100;
      audioPlayerRef.current.play().catch((err) => {
        console.warn('Audio play simulated or blocked by autoplay', err);
      });
    }
  };

  const handleTogglePlayPause = () => {
    if (!currentSong && roomPlaylist.length > 0) {
      handlePlaySong(roomPlaylist[0]);
      return;
    }
    if (isPlayingSong) {
      audioPlayerRef.current?.pause();
      setIsPlayingSong(false);
    } else {
      audioPlayerRef.current?.play().catch(() => {});
      setIsPlayingSong(true);
    }
  };

  const handleStopSong = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    setIsPlayingSong(false);
    setCurrentSong(null);
  };

  // User uploads song from device gallery/files
  const handleDeviceAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    const newSong: RoomSong = {
      id: `dev_${Date.now()}`,
      title: cleanName,
      artist: currentUser.name,
      duration: 'Device Audio',
      addedBy: currentUser.name,
      url: fileUrl,
      isCustom: true,
    };

    setRoomPlaylist((prev) => [newSong, ...prev]);
    handlePlaySong(newSong);
    soundService.playGiftFanfare();
    setRoomBanner(`✅ Song "${cleanName}" added from device!`);
    setTimeout(() => setRoomBanner(null), 3500);
  };

  const [roomComments, setRoomComments] = useState<{
    id: string;
    user: string;
    text: string;
    isGift?: boolean;
    isMysteryBox?: boolean;
    avatar?: string;
    giftStacks?: { icon: string; count: string }[];
  }[]>([
    {
      id: '1',
      user: 'System',
      text: 'Welcome to the 3D Voice Room! 10 seats are active with real audio.',
    },
    {
      id: '2',
      user: room.seats[0]?.user?.name || 'Aryan Khan',
      text: 'Pulse transfer connection is active with Seat 2! Tap any empty seat to join. ⚡💖',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [roomBanner, setRoomBanner] = useState<string | null>(null);

  // Active theme configuration (default to lion)
  const currentTheme: RoomThemeConfig =
    ROOM_THEMES[room.wallpaper] || ROOM_THEMES.lion;

  // Ensure room has dynamic max seats based on room level (10, 15, or 20)
  const safeSeats: Seat[] = Array.from({ length: maxSeatsCount }, (_, i) => {
    return (
      room.seats[i] || {
        id: i,
        user: null,
        isLocked: false,
        isMuted: false,
        isSpeaking: false,
        role: 'none',
        pulseStatus: i === 0 ? ('sending' as const) : i === 1 ? ('receiving' as const) : ('none' as const),
      }
    );
  });

  // Default allowances if room doesn't have them yet
  const defaultAllowances: RoomAllowances = {
    allowAdminKick: true,
    allowAdminBan: true,
    allowAdminMuteMic: true,
    allowAdminLockSeats: true,
    requireMicApproval: false,
    allowChat: true,
    allowGifts: true,
    allowGuestsToJoin: true,
  };
  const allowances: RoomAllowances = room.allowances || defaultAllowances;
  const blockedUsers: BlockedUser[] = room.blockedUsers || [];
  const coHostIds: string[] = room.coHostIds || [];

  // Check if current user is sitting on any seat
  const mySeatIndex = safeSeats.findIndex((s) => s.user?.id === currentUser.id);
  const isUserSeated = mySeatIndex !== -1;
  const isHost = room.host.id === currentUser.id;
  const isCoHost = coHostIds.includes(currentUser.id);
  const hasAdminRights = isHost || isCoHost;

  const canKick = isHost || (isCoHost && allowances.allowAdminKick);
  const canBan = isHost || (isCoHost && allowances.allowAdminBan);
  const canMute = isHost || (isCoHost && allowances.allowAdminMuteMic);
  const canLock = isHost || (isCoHost && allowances.allowAdminLockSeats);

  // Active audience users
  const audienceUsers: User[] = useMemo(() => {
    return DEMO_USERS.filter(
      (u) =>
        u.id !== currentUser.id &&
        u.id !== room.host.id &&
        !safeSeats.some((s) => s.user?.id === u.id) &&
        !blockedUsers.some((b) => b.id === u.id)
    );
  }, [currentUser.id, room.host.id, safeSeats, blockedUsers]);

  // All active members in the room
  const allActiveMembers = useMemo(() => {
    const list: {
      user: User;
      seatNumber?: number;
      role: 'host' | 'co-host' | 'speaker' | 'listener';
      isMuted?: boolean;
    }[] = [];

    // Host
    list.push({
      user: room.host,
      seatNumber: safeSeats.find((s) => s.user?.id === room.host.id)?.id,
      role: 'host',
      isMuted: safeSeats.find((s) => s.user?.id === room.host.id)?.isMuted || false,
    });

    // Current user if not host and not seated
    if (currentUser.id !== room.host.id && !safeSeats.some((s) => s.user?.id === currentUser.id)) {
      list.push({
        user: currentUser,
        role: isCoHost ? 'co-host' : 'listener',
        isMuted: true,
      });
    }

    // Seated users (other than host & currentUser)
    safeSeats.forEach((s) => {
      if (s.user && s.user.id !== room.host.id) {
        list.push({
          user: s.user,
          seatNumber: s.id,
          role: s.role === 'co-host' || coHostIds.includes(s.user.id)
            ? ('co-host' as const)
            : s.role === 'host'
            ? ('host' as const)
            : ('speaker' as const),
          isMuted: s.isMuted,
        });
      }
    });

    // Audience listeners
    audienceUsers.forEach((u) => {
      if (!list.some((item) => item.user.id === u.id)) {
        list.push({
          user: u,
          role: coHostIds.includes(u.id) ? 'co-host' : 'listener',
          isMuted: true,
        });
      }
    });

    return list;
  }, [room.host, currentUser, safeSeats, coHostIds, audienceUsers, isCoHost]);

  // Real microphone audio level detection
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [myVoiceLevel, setMyVoiceLevel] = useState(0);

  // Background audio simulation for other seats speaking
  useEffect(() => {
    const speakInterval = setInterval(() => {
      onUpdateRoom({
        ...room,
        seats: safeSeats.map((seat) => {
          if (seat.user && seat.user.id !== currentUser.id && !seat.isMuted) {
            return {
              ...seat,
              isSpeaking: Math.random() > 0.45,
            };
          }
          return seat;
        }),
      });
    }, 2400);

    return () => clearInterval(speakInterval);
  }, [room]);

  const [isAgoraConnected, setIsAgoraConnected] = useState(false);

  // Agora Voice Room Channel Lifecycle
  useEffect(() => {
    let isMounted = true;
    const channelName = `room_${room.id.replace(/[^a-zA-Z0-9]/g, '_')}`;

    agoraService
      .joinChannel({
        channel: channelName,
        mode: 'live',
        role: isUserSeated ? 'host' : 'audience',
      })
      .then(async (res) => {
        if (!isMounted) return;
        if (res.success) {
          setIsAgoraConnected(true);
          if (isUserSeated && isMicOn) {
            await agoraService.publishMicrophone();
          }
        }
      })
      .catch((err) => {
        console.warn('[Agora Voice Room] Fallback:', err);
      });

    // Audio volume indicator
    agoraService.onVolumeIndicator((volumes) => {
      if (!isMounted) return;
      const myVol = volumes.find((v) => v.uid === 0 || v.level > 10);
      if (myVol) {
        setMyVoiceLevel(myVol.level);
      }
    });

    return () => {
      isMounted = false;
      agoraService.leaveChannel();
      setIsAgoraConnected(false);
    };
  }, [room.id]);

  // When seat or mic state changes, update Agora mic publishing
  useEffect(() => {
    if (isUserSeated && isMicOn) {
      agoraService.publishMicrophone().then(() => {
        agoraService.setMute(false);
      });
    } else {
      agoraService.setMute(true);
    }
  }, [isUserSeated, isMicOn]);

  // Handle local mic stream with AudioContext
  useEffect(() => {
    if (!isUserSeated || !isMicOn) {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      setMyVoiceLevel(0);
      return;
    }

    let isMounted = true;
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => {
        if (!isMounted) return;
        micStreamRef.current = stream;

        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const audioCtx = new AudioContextClass();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
          if (!isMounted) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setMyVoiceLevel(avg);
          animFrameRef.current = requestAnimationFrame(checkVolume);
        };
        checkVolume();
      })
      .catch((err) => {
        console.warn('Microphone permission not granted or simulated', err);
      });

    return () => {
      isMounted = false;
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isUserSeated, isMicOn]);

  const handleSeatClick = (seat: Seat) => {
    soundService.playCoinSound();

    if (seat.user) {
      setSelectedSeatForAdmin(seat);
      return;
    }

    // Check if user is blocked
    if (blockedUsers.some((b) => b.id === currentUser.id)) {
      soundService.playDrumRoll();
      setRoomBanner('🚫 You are currently banned from taking a seat in this room.');
      setTimeout(() => setRoomBanner(null), 3500);
      return;
    }

    if (seat.isLocked) {
      soundService.playDrumRoll();
      setRoomBanner('🔒 This seat is locked by Host or Admin.');
      setTimeout(() => setRoomBanner(null), 3000);
      return;
    }

    // Check if mic approval is required by host
    if (allowances.requireMicApproval && !isHost && !isCoHost) {
      soundService.playCoinSound();
      setRoomBanner('⏳ Request to take mic sent to Room Host! Awaiting approval...');
      setTimeout(() => setRoomBanner(null), 3500);
      return;
    }

    if (isUserSeated) {
      const updatedSeats: Seat[] = safeSeats.map((s) => {
        if (s.id === mySeatIndex) {
          return {
            ...s,
            user: null,
            isSpeaking: false,
            isMuted: false,
            role: 'none',
          };
        }
        if (s.id === seat.id) {
          return {
            ...s,
            user: currentUser,
            role: isHost ? 'host' : isCoHost ? 'co-host' : 'speaker',
            isMuted: false,
            pulseStatus: s.id === 0 ? ('sending' as const) : s.id === 1 ? ('receiving' as const) : ('none' as const),
          };
        }
        return s;
      });
      onUpdateRoom({ ...room, seats: updatedSeats });
      return;
    }

    const updatedSeats: Seat[] = safeSeats.map((s) =>
      s.id === seat.id
        ? {
            ...s,
            user: currentUser,
            role: isHost ? 'host' : isCoHost ? 'co-host' : 'speaker',
            isMuted: false,
            pulseStatus: s.id === 0 ? ('sending' as const) : s.id === 1 ? ('receiving' as const) : ('none' as const),
          }
        : s
    );
    onUpdateRoom({ ...room, seats: updatedSeats });
    setIsMicOn(true);
    soundService.playCoinSound();
  };

  const handleLeaveSeat = () => {
    if (!isUserSeated) return;
    const updatedSeats: Seat[] = safeSeats.map((s) =>
      s.id === mySeatIndex
        ? {
            ...s,
            user: null,
            isSpeaking: false,
            isMuted: false,
            role: 'none',
          }
        : s
    );
    onUpdateRoom({ ...room, seats: updatedSeats });
    setIsMicOn(false);
    setSelectedSeatForAdmin(null);
  };

  // Dedicated Admin Functions: Mic Remove, Mute, Kick, Block, Unblock, Roles
  const handleRemoveFromMic = (seatId: number, targetUser: User) => {
    soundService.playCoinSound();
    const updatedSeats = safeSeats.map((s) =>
      s.id === seatId
        ? {
            ...s,
            user: null,
            role: 'none' as const,
            isSpeaking: false,
            isMuted: false,
          }
        : s
    );
    onUpdateRoom({ ...room, seats: updatedSeats });
    setRoomBanner(`🎙️ ${targetUser.name} ko mic se hata diya gaya!`);
    setTimeout(() => setRoomBanner(null), 3000);
    setSelectedSeatForAdmin(null);
  };

  const handleForceMuteUser = (seatId: number, targetUser: User, shouldMute: boolean) => {
    soundService.playCoinSound();
    const updatedSeats = safeSeats.map((s) =>
      s.id === seatId
        ? {
            ...s,
            isMuted: shouldMute,
            isSpeaking: false,
          }
        : s
    );
    onUpdateRoom({ ...room, seats: updatedSeats });
    setRoomBanner(
      `🔇 ${targetUser.name} ka mic ${shouldMute ? 'mute' : 'unmute'} kar diya gaya!`
    );
    setTimeout(() => setRoomBanner(null), 3000);
    setSelectedSeatForAdmin(null);
  };

  const handleKickUser = (userId: string, userName: string) => {
    soundService.playDrumRoll();
    const updatedSeats = safeSeats.map((s) =>
      s.user?.id === userId
        ? {
            ...s,
            user: null,
            role: 'none' as const,
            isSpeaking: false,
            isMuted: false,
          }
        : s
    );
    onUpdateRoom({ ...room, seats: updatedSeats });
    setRoomBanner(`👢 ${userName} ko room se kick kar diya gaya!`);
    setTimeout(() => setRoomBanner(null), 3500);
    setSelectedSeatForAdmin(null);
  };

  const handleBlockUser = (user: User, reason = 'Room rule violation') => {
    soundService.playDrumRoll();
    const updatedSeats = safeSeats.map((s) =>
      s.user?.id === user.id
        ? {
            ...s,
            user: null,
            role: 'none' as const,
            isSpeaking: false,
            isMuted: false,
          }
        : s
    );
    const existingBlocked = room.blockedUsers || [];
    if (!existingBlocked.some((b) => b.id === user.id)) {
      const newBlockedList: BlockedUser[] = [
        ...existingBlocked,
        {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          blockedAt: 'Just now',
          reason,
        },
      ];
      onUpdateRoom({
        ...room,
        seats: updatedSeats,
        blockedUsers: newBlockedList,
      });
    } else {
      onUpdateRoom({ ...room, seats: updatedSeats });
    }
    setRoomBanner(`🚫 ${user.name} ko room se block/ban kar diya gaya!`);
    setTimeout(() => setRoomBanner(null), 3500);
    setSelectedSeatForAdmin(null);
  };

  const handleUnblockUser = (userId: string, userName: string) => {
    soundService.playCoinSound();
    const updatedBlocked = (room.blockedUsers || []).filter((b) => b.id !== userId);
    onUpdateRoom({
      ...room,
      blockedUsers: updatedBlocked,
    });
    setRoomBanner(`✅ ${userName} ko unblock kar diya gaya!`);
    setTimeout(() => setRoomBanner(null), 3000);
  };

  const handleToggleCoHost = (userId: string, userName: string) => {
    soundService.playGiftFanfare();
    const current = room.coHostIds || [];
    const isAlready = current.includes(userId);
    const updated = isAlready ? current.filter((id) => id !== userId) : [...current, userId];
    const updatedSeats = safeSeats.map((s) => {
      if (s.user?.id === userId) {
        return {
          ...s,
          role: isAlready ? ('speaker' as const) : ('co-host' as const),
        };
      }
      return s;
    });
    onUpdateRoom({
      ...room,
      seats: updatedSeats,
      coHostIds: updated,
    });
    setRoomBanner(
      isAlready
        ? `ℹ️ ${userName} se Admin / Co-Host rights wapas le liye gaye.`
        : `👑 ${userName} ko Room Admin / Co-Host bana diya gaya!`
    );
    setTimeout(() => setRoomBanner(null), 3000);
    setSelectedSeatForAdmin(null);
  };

  const handleToggleAllowance = (key: keyof RoomAllowances) => {
    soundService.playCoinSound();
    const current = room.allowances || defaultAllowances;
    const updated: RoomAllowances = {
      ...current,
      [key]: !current[key],
    };
    onUpdateRoom({
      ...room,
      allowances: updated,
    });
  };

  const handleAdminAction = (
    action: 'lock' | 'unlock' | 'mute' | 'unmute' | 'kick' | 'cohost'
  ) => {
    if (!selectedSeatForAdmin) return;
    const seatId = selectedSeatForAdmin.id;

    const updatedSeats: Seat[] = safeSeats.map((s) => {
      if (s.id === seatId) {
        if (action === 'lock') return { ...s, isLocked: true, user: null };
        if (action === 'unlock') return { ...s, isLocked: false };
        if (action === 'mute') return { ...s, isMuted: true, isSpeaking: false };
        if (action === 'unmute') return { ...s, isMuted: false };
        if (action === 'kick')
          return {
            ...s,
            user: null,
            isSpeaking: false,
            role: 'none',
          };
        if (action === 'cohost') return { ...s, role: 'co-host' };
      }
      return s;
    });

    onUpdateRoom({ ...room, seats: updatedSeats });
    setSelectedSeatForAdmin(null);
  };

  const handleToggleMic = () => {
    if (!isUserSeated) {
      soundService.playDrumRoll();
      setRoomBanner('🎙️ Please tap on any of the 10 seats to start speaking!');
      setTimeout(() => setRoomBanner(null), 3500);
      return;
    }

    const nextMic = !isMicOn;
    setIsMicOn(nextMic);
    if (mySeatIndex !== -1) {
      const updatedSeats = [...safeSeats];
      updatedSeats[mySeatIndex] = {
        ...updatedSeats[mySeatIndex],
        isMuted: !nextMic,
        isSpeaking: false,
      };
      onUpdateRoom({ ...room, seats: updatedSeats });
    }
  };

  const handleToggleSpeaker = () => {
    const next = !isSpeakerOn;
    setIsSpeakerOn(next);
    soundService.playCoinSound();
  };

  const handleToggleDjBgm = () => {
    const nextState = !isDjBgmActive;
    setIsDjBgmActive(nextState);
    soundService.toggleBackgroundMusic(nextState);
  };

  const handleApplyTheme = (themeId: VoiceRoom['wallpaper']) => {
    soundService.playCoinSound();
    const chosenTheme = ROOM_THEMES[themeId] || ROOM_THEMES.lion;
    onUpdateRoom({
      ...room,
      wallpaper: themeId,
    });
    setRoomComments((prev) => [
      ...prev,
      {
        id: `th_${Date.now()}`,
        user: '3D THEME 🎨',
        text: `${currentUser.name} activated ${chosenTheme.name} ${chosenTheme.icon}!`,
        isGift: true,
      },
    ]);
    setShowThemePicker(false);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    if (!allowances.allowChat && !isHost && !isCoHost) {
      soundService.playDrumRoll();
      setRoomBanner('💬 Public chat is currently paused by the room Host.');
      setTimeout(() => setRoomBanner(null), 3000);
      return;
    }

    setRoomComments((prev) => [
      ...prev,
      {
        id: `rc_${Date.now()}`,
        user: currentUser.name,
        text: chatInput.trim(),
      },
    ]);
    setChatInput('');
  };

  const handleSendGift = (
    gift: GiftItem,
    quantity: number,
    targetSeatId?: number,
    targetCustomName?: string
  ) => {
    if (!allowances.allowGifts && !isHost && !isCoHost) {
      soundService.playDrumRoll();
      setRoomBanner('🎁 Gifts are currently disabled by the room Host.');
      setTimeout(() => setRoomBanner(null), 3000);
      return;
    }

    const coinCost = (gift.coinValue || gift.coins || 0) * quantity;
    onSendCoinsReward(-coinCost);

    const targetDesc =
      targetCustomName ||
      (targetSeatId !== undefined
        ? `Seat ${targetSeatId + 1}`
        : activeGiftTarget?.isAll
        ? `ALL ${maxSeatsCount} SEATS ON THE 3D ARENA! 🚀`
        : activeGiftTarget?.name || 'the arena');

    // Trigger full-screen 3D animation system
    setActive3DGift({
      id: `3d_gift_${Date.now()}`,
      gift,
      quantity,
      sender: currentUser,
      targetName: targetDesc,
      targetSeatId,
      timestamp: Date.now(),
    });

    const bannerText = `🔥 ${currentUser.name} sent ${quantity > 1 ? `${quantity}x ` : ''}${gift.name} ${gift.icon}!`;
    setRoomBanner(bannerText);
    setTimeout(() => setRoomBanner(null), 6000);

    // Gain room EXP from gifts and auto level up!
    const expGained = Math.max(25, Math.round(coinCost / 4));
    const newExp = roomExp + expGained;
    setRoomExp(newExp);

    if (roomLevel < 10 && newExp >= 500) {
      handleUpgradeRoomLevel(10);
    } else if (roomLevel < 30 && newExp >= 2000) {
      handleUpgradeRoomLevel(30);
    }

    // Chat feed effect matching video reference:
    // "Gift in Mystery Gift Box - x1, x3, x6, x8" with stacked icons & user avatar
    setRoomComments((prev) => [
      ...prev,
      {
        id: `g_${Date.now()}`,
        user: currentUser.name,
        avatar: currentUser.avatar,
        text: 'Gift in Mystery Gift Box',
        isGift: true,
        isMysteryBox: true,
        giftStacks: [
          { icon: gift.icon, count: `x${quantity}` },
          { icon: '🦁', count: 'x6' },
          { icon: '💍', count: 'x3' },
          { icon: '👑', count: 'x1' },
        ],
      },
    ]);
  };

  // Trigger Pulse Transfer Surge / Boost between Seat 1 and Seat 2
  const handlePulseSurge = () => {
    soundService.playApplause();
    setPulseBoostActive(true);
    setSynergyScore(100);

    // Spawn floating hearts
    const newHearts = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      left: 45 + (Math.random() * 10 - 5),
    }));
    setFloatingHearts(newHearts);

    setTimeout(() => {
      setPulseBoostActive(false);
      setFloatingHearts([]);
    }, 2500);

    const seat1User = safeSeats[0].user?.name || 'Seat 1';
    const seat2User = safeSeats[1].user?.name || 'Seat 2';
    setRoomBanner(`💖 Pulse Energy Surging between ${seat1User} & ${seat2User}! Synergy 100%`);
    setTimeout(() => setRoomBanner(null), 4000);

    setRoomComments((prev) => [
      ...prev,
      {
        id: `pulse_${Date.now()}`,
        user: 'PULSE TRANSFER ⚡💖',
        text: `${currentUser.name} boosted the Pulse Connection to 100% Synergy!`,
        isGift: true,
      },
    ]);
  };

  return (
    <div className="relative w-full h-full max-w-md mx-auto flex flex-col justify-between text-white overflow-hidden select-none font-sans bg-black flex-1">
      {/* ======================================================== */}
      {/* 3D PICTURE THEME WALLPAPER BACKGROUND                    */}
      {/* ======================================================== */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none z-0 overflow-hidden"
        style={{
          backgroundImage: active3DGift && cinematicPhase === 'cinematic_video' ? 'none' : `url(${currentTheme.bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
        }}
      >
        {active3DGift && cinematicPhase === 'cinematic_video' && (
          <video
            src={
              (active3DGift.gift.name || '').toLowerCase().includes('lion') || (active3DGift.gift.name || '').toLowerCase().includes('tiger')
                ? '/assets/gifts/cinematic_lion.mp4'
                : (active3DGift.gift.name || '').toLowerCase().includes('butterfly') || (active3DGift.gift.name || '').toLowerCase().includes('rose')
                ? '/assets/gifts/cinematic_butterfly.mp4'
                : '/assets/gifts/cinematic_lion.mp4'
            }
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover filter brightness-90 contrast-105"
          />
        )}
        {/* Soft atmospheric overlay for clear seat reading and contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/85" />
      </div>

      {/* High-Roller Banner Notification */}
      {roomBanner && (
        <div className="absolute top-14 left-3 right-3 z-50 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 border border-amber-300 text-white shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-200 shrink-0" />
          <span className="text-xs font-black truncate">{roomBanner}</span>
        </div>
      )}

      {/* Hidden Media Inputs & Audio Player */}
      <input
        ref={roomDpInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleRoomDpFileSelect}
      />
      <input
        ref={songFileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleDeviceAudioUpload}
      />
      <audio
        ref={audioPlayerRef}
        onEnded={() => setIsPlayingSong(false)}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (el.duration) setSongProgress((el.currentTime / el.duration) * 100);
        }}
      />

      {/* ======================================================== */}
      {/* TOP HEADER                                               */}
      {/* ======================================================== */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-white/10 bg-black/60 backdrop-blur-md z-30">
        {/* Left: Back button + Room DP + Title + 10 Seats | Live */}
        <div className="flex items-center gap-2 overflow-hidden">
          <button
            onClick={() => {
              agoraService.leaveChannel();
              onLeaveRoom();
            }}
            className="p-1 rounded-xl text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition shrink-0"
            title="Back"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Room DP with Camera change badge */}
          <div
            onClick={() => {
              if (hasAdminRights) {
                roomDpInputRef.current?.click();
              }
            }}
            className="relative group cursor-pointer shrink-0"
            title={hasAdminRights ? 'Click to Change Room DP from Gallery' : 'Room DP'}
          >
            <img
              src={roomDp}
              alt="Room DP"
              className="w-10 h-10 rounded-2xl object-cover border-2 border-amber-400/90 shadow-md group-hover:scale-105 transition"
            />
            {hasAdminRights && (
              <div className="absolute -bottom-1 -right-1 p-1 bg-black/90 rounded-full border border-amber-400 shadow">
                <Camera className="w-2.5 h-2.5 text-amber-300" />
              </div>
            )}
          </div>

          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm text-white tracking-wide leading-tight font-heading truncate max-w-[140px] sm:max-w-[180px]">
                {roomTitle}
              </h1>
              {hasAdminRights && (
                <button
                  onClick={() => {
                    setTempTitleInput(roomTitle);
                    setShowEditTitleModal(true);
                  }}
                  className="p-1 rounded-md text-purple-300 hover:text-amber-300 hover:bg-white/10 transition shrink-0"
                  title="Rename Chat Room"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px] text-purple-200/90 font-medium mt-0.5">
              <button
                onClick={() => setShowLevelModal(true)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold transition hover:scale-105 active:scale-95 ${
                  roomLevel >= 30
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/60 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    : roomLevel >= 10
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                    : 'bg-purple-900/60 text-purple-200 border-purple-700/60'
                }`}
                title="Room Level & Seats Progression"
              >
                <Crown className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                <span>Lv.{roomLevel} • {maxSeatsCount} Seats</span>
              </button>
              <span className="text-white/30">|</span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                Live
              </span>
              {isAgoraConnected && (
                <span className="ml-1 px-1 rounded text-[8px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  RTC
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Room ID badge with Crown + 3-dots Menu */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1e0e38]/85 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-lg shadow-black/40">
            <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="tracking-wide text-[11px]">Room ID: {room.id}</span>
          </div>

          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition"
            title="More Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Active Song Player Banner when music is playing */}
      {isPlayingSong && currentSong && (
        <div
          onClick={() => setShowSongModal(true)}
          className="absolute top-16 left-3 right-3 z-40 p-2.5 rounded-2xl bg-[#120524]/95 border border-cyan-400/80 backdrop-blur-xl flex items-center justify-between text-xs cursor-pointer shadow-2xl animate-fade-in"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-pink-500 flex items-center justify-center text-white shrink-0 shadow">
              <Disc3 className="w-4 h-4 animate-spin" />
            </div>
            <div className="truncate">
              <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                <span className="truncate">{currentSong.title}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-600 font-bold shrink-0">
                  Live on Mic 🎵
                </span>
              </div>
              <p className="text-[10px] text-purple-300 truncate">
                {currentSong.artist || 'Added from Device Gallery'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePlayPause();
              }}
              className="p-1.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shadow active:scale-95 transition"
              title={isPlayingSong ? 'Pause' : 'Play'}
            >
              {isPlayingSong ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStopSong();
              }}
              className="p-1.5 rounded-full bg-purple-900/60 hover:bg-purple-800 text-purple-200 hover:text-white"
              title="Stop Song"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* More Options Dropdown */}
      {showMoreMenu && (
        <div className="absolute top-14 right-3 z-50 w-60 rounded-2xl bg-[#16082e]/98 border border-purple-600/50 backdrop-blur-xl p-2 shadow-2xl space-y-1 animate-fade-in text-xs max-h-[80vh] overflow-y-auto">
          {/* Room Settings & Allowances */}
          <button
            onClick={() => {
              setShowRoomSettings(true);
              setRoomSettingsTab('allowances');
              setShowMoreMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-900/60 transition"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">Room Settings & Rules</span>
          </button>

          {/* Room Level & Seats Progression */}
          <button
            onClick={() => {
              setShowLevelModal(true);
              setShowMoreMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-900/60 transition"
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">Room Level & Seats (Lv.{roomLevel})</span>
          </button>

          {/* Song Player & Gallery */}
          <button
            onClick={() => {
              setShowSongModal(true);
              setShowMoreMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-900/60 transition"
          >
            <Music2 className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold">Play Songs from Gallery 📁</span>
          </button>

          {/* Rename Room Title */}
          {hasAdminRights && (
            <button
              onClick={() => {
                setTempTitleInput(roomTitle);
                setShowEditTitleModal(true);
                setShowMoreMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-900/60 transition"
            >
              <Edit2 className="w-4 h-4 text-emerald-400" />
              <span>Rename Chat Room</span>
            </button>
          )}

          {/* Change Room DP */}
          {hasAdminRights && (
            <button
              onClick={() => {
                roomDpInputRef.current?.click();
                setShowMoreMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-900/60 transition"
            >
              <Camera className="w-4 h-4 text-pink-400" />
              <span>Change Room DP (Gallery)</span>
            </button>
          )}

          {/* 10 3D Themes */}
          <button
            onClick={() => {
              setShowThemePicker(true);
              setShowMoreMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-900/60 transition"
          >
            <Palette className="w-4 h-4 text-pink-400" />
            <span>10 3D Themes ({currentTheme.icon})</span>
          </button>

          {/* Members & Mic Controls */}
          <button
            onClick={() => {
              setShowRoomSettings(true);
              setRoomSettingsTab('members');
              setShowMoreMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-900/60 transition"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Members & Mics</span>
          </button>

          {/* Blocked / Banned List */}
          <button
            onClick={() => {
              setShowRoomSettings(true);
              setRoomSettingsTab('blocked');
              setShowMoreMenu(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-900/60 transition"
          >
            <span className="flex items-center gap-2.5">
              <Ban className="w-4 h-4 text-red-400" />
              <span>Blocked Users</span>
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-red-950/80 text-red-300 text-[10px] border border-red-800/40">
              {blockedUsers.length}
            </span>
          </button>

          {/* DJ Soundboard */}
          <button
            onClick={() => {
              setShowDjBoard(true);
              setShowMoreMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-900/60 transition"
          >
            <Music className="w-4 h-4 text-indigo-400" />
            <span>DJ Soundboard</span>
          </button>

          {/* Ludo Lucky Dice */}
          <button
            onClick={() => {
              setShowLudoDice(true);
              setShowMoreMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-900/60 transition"
          >
            <Dices className="w-4 h-4 text-amber-400" />
            <span>Ludo Lucky Dice</span>
          </button>

          {/* Invite Friends */}
          <button
            onClick={() => {
              setShowInviteModal(true);
              setShowMoreMenu(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-200 hover:text-white hover:bg-purple-900/60 transition"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Invite Friends</span>
          </button>

          <div className="my-1 border-t border-purple-800/60" />

          {/* Leave Room */}
          <button
            onClick={() => {
              setShowMoreMenu(false);
              setShowLeaveConfirm(true);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-300 hover:text-white hover:bg-red-600/80 transition font-bold"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Leave Room</span>
          </button>
        </div>
      )}

      {/* Floating Heart Particles upon Pulse Boost */}
      {floatingHearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute z-40 pointer-events-none animate-float-heart"
          style={{
            left: `${heart.left}%`,
            top: '28%',
          }}
        >
          <Heart className="w-6 h-6 text-pink-500 fill-pink-500 drop-shadow-[0_0_12px_rgba(236,72,153,1)]" />
        </div>
      ))}

      {/* ======================================================== */}
      {/* 3D ARENA STAGE (DUO PODS VIP LOUNGE)                     */}
      {/* ======================================================== */}
      <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden z-10 px-1 py-1">
        {/* Dynamic Oval Perspective Table Container */}
        <div className="relative w-full h-full max-w-[430px] max-h-[560px] mx-auto flex items-center justify-center">
          
          {/* ==================================================== */}
          {/* VIP PENTHOUSE NEON SIGNS (Matches User Reference)    */}
          {/* ==================================================== */}
          {/* Left Wall Neon Sign: "Good Vibes Only 💖" */}
          <div className="absolute left-1.5 sm:left-3 top-2 sm:top-3 z-5 pointer-events-none flex flex-col items-start select-none opacity-85">
            <span className="text-pink-400 font-extrabold italic text-xs sm:text-sm tracking-wider rotate-[-6deg] font-serif leading-tight drop-shadow-[0_0_10px_rgba(244,114,182,0.9)]">
              Good Vibes
            </span>
            <span className="text-pink-400 font-extrabold italic text-xs sm:text-sm tracking-wider rotate-[-6deg] font-serif flex items-center gap-1 leading-tight drop-shadow-[0_0_10px_rgba(244,114,182,0.9)]">
              Only <Heart className="w-3 h-3 text-pink-500 fill-pink-500 inline drop-shadow-[0_0_8px_rgba(236,72,153,1)]" />
            </span>
          </div>

          {/* Right Wall Neon Sign: "Pulse 💖" */}
          <div className="absolute right-1.5 sm:right-3 top-2 sm:top-3 z-5 pointer-events-none flex flex-col items-end select-none opacity-85">
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5 text-cyan-300">
                <span className="w-0.5 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="w-0.5 h-3.5 bg-purple-400 rounded-full animate-pulse [animation-delay:150ms]" />
                <span className="w-0.5 h-2.5 bg-pink-400 rounded-full animate-pulse [animation-delay:300ms]" />
              </div>
              <span className="text-cyan-300 font-black italic text-sm sm:text-base tracking-wider font-heading drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]">
                Pulse
              </span>
            </div>
            <Heart className="w-3 h-3 text-pink-500 fill-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,1)] mr-1 mt-0.5" />
          </div>

          {/* ==================================================== */}
          {/* 3D CONCENTRIC ARENA PODIUM OVER THE 3D SCENE         */}
          {/* ==================================================== */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Outer Glowing Metallic Oval Rim */}
            <div
              className={`w-[95%] h-[82%] rounded-[50%] border-2 ${currentTheme.tableOuterBorder} ${currentTheme.tableOuterShadow} bg-gradient-to-b ${currentTheme.tableSurfaceBg} relative flex items-center justify-center backdrop-blur-[2px] transition-all duration-700`}
            >
              {/* Outer table bevel highlight */}
              <div className="absolute inset-x-8 top-1 h-[2px] bg-white/25 rounded-full blur-[1px]" />
              
              {/* Mid-Tier Concentric Elliptical Ring (Groove) */}
              <div className="w-[82%] h-[78%] rounded-[50%] border border-white/10 bg-black/30 shadow-inner relative flex items-center justify-center">
                {/* Inner Tier Ring */}
                <div className="w-[66%] h-[68%] rounded-[50%] border border-white/5 bg-black/40" />
              </div>

              {/* Table base shadow */}
              <div className="absolute -bottom-6 inset-x-8 h-10 bg-black/80 rounded-[50%] blur-xl pointer-events-none -z-10" />
            </div>
          </div>

          {/* ==================================================== */}
          {/* CENTRAL 3D STAGE DISC & NEON MICROPHONE              */}
          {/* ==================================================== */}
          {/* ==================================================== */}
          {/* CENTRAL 3D PULSE TRANSFER STAGE & GLOWING MIC DISC   */}
          {/* ==================================================== */}
          <div
            onClick={handlePulseSurge}
            className="absolute left-1/2 top-[46.5%] -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group flex flex-col items-center justify-center pointer-events-auto"
            title="Tap to boost Pulse Transfer synergy!"
          >
            {/* Concentric 3D disc with neon cyan & magenta halo rings */}
            <div
              className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-b from-[#220c38] via-[#130522] to-[#080210] border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.55),inset_0_0_15px_rgba(236,72,153,0.35)] flex items-center justify-center transition-transform group-hover:scale-105 active:scale-95`}
            >
              {/* Inner glowing neon concentric ring */}
              <div className="w-full h-full rounded-full border border-pink-500/60 flex flex-col items-center justify-center relative overflow-hidden bg-radial from-purple-950/70 via-black to-black shadow-inner p-1">
                {/* Audio Waveform lines and Microphone */}
                <div className="flex items-center gap-1.5 text-cyan-300">
                  <div className="flex items-center gap-0.5">
                    <span className="w-0.5 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    <span className="w-0.5 h-3.5 bg-cyan-400 rounded-full animate-pulse [animation-delay:150ms]" />
                    <span className="w-0.5 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:300ms]" />
                  </div>
                  <div className={`p-1.5 rounded-full bg-pink-500/15 ${currentTheme.stageMicColor} transition-transform group-hover:scale-110`}>
                    <Mic className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className="w-0.5 h-2 bg-pink-400 rounded-full animate-pulse [animation-delay:300ms]" />
                    <span className="w-0.5 h-3.5 bg-pink-400 rounded-full animate-pulse [animation-delay:150ms]" />
                    <span className="w-0.5 h-2 bg-pink-400 rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Pulse Transfer Text */}
                <span className="text-[7.5px] sm:text-[8.5px] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-pink-300 to-amber-300 uppercase tracking-wider mt-0.5 font-heading">
                  Pulse Transfer
                </span>
              </div>

              {/* Pulsing ring waves radiating out */}
              <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping opacity-25 pointer-events-none" />
            </div>
          </div>

          {/* ==================================================== */}
          {/* NEON RING CONNECTOR FLOOR TRACE AROUND THE ARENA      */}
          {/* ==================================================== */}
          <div className="absolute inset-0 pointer-events-none z-15">
            <svg
              className="w-full h-full"
              viewBox="0 0 1000 1000"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="neonFloorRing" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#ec4899" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <ellipse
                cx="500"
                cy="465"
                rx="390"
                ry="335"
                fill="none"
                stroke="url(#neonFloorRing)"
                strokeWidth="2.5"
                opacity="0.6"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
            </svg>
          </div>

          {/* ==================================================== */}
          {/* DYNAMIC 2-SEAT DUO PODS ARENA (6, 12, OR 20 SEATS) */}
          {/* Exactly matching user VIP Duo Sofa reference photo */}
          {/* ==================================================== */}
          {currentDuoPods.map((pod) => {
            const seatA = safeSeats[pod.seatAId] || {
              id: pod.seatAId,
              user: null,
              isLocked: false,
              isMuted: false,
              isSpeaking: false,
              role: 'none',
            };
            const seatB = safeSeats[pod.seatBId] || {
              id: pod.seatBId,
              user: null,
              isLocked: false,
              isMuted: false,
              isSpeaking: false,
              role: 'none',
            };

            const isUserA = !!seatA.user;
            const isMeA = seatA.user?.id === currentUser.id;
            const isSpeakingA = seatA.isSpeaking || (isMeA && myVoiceLevel > 20);

            const isUserB = !!seatB.user;
            const isMeB = seatB.user?.id === currentUser.id;
            const isSpeakingB = seatB.isSpeaking || (isMeB && myVoiceLevel > 20);

            const is20 = maxSeatsCount === 20;
            const is12 = maxSeatsCount === 12;

            // Responsive pod and seat dimension tuning
            const podWidthClass = is20 ? 'w-[74px] sm:w-[84px]' : is12 ? 'w-[88px] sm:w-[98px]' : 'w-[106px] sm:w-[116px]';
            const avatarSizeClass = is20 ? 'w-7 h-7 sm:w-8 sm:h-8' : is12 ? 'w-8 h-8 sm:w-9 sm:h-9' : 'w-9 h-9 sm:w-10 sm:h-10';
            const numBadgeSize = is20 ? 'w-3.5 h-3.5 text-[7px]' : is12 ? 'w-4 h-4 text-[8px]' : 'w-4.5 h-4.5 text-[9px]';
            const labelTextSize = is20 ? 'text-[7px] sm:text-[8px]' : is12 ? 'text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-[10px]';

            return (
              <div
                key={`pod-${pod.podIndex}`}
                style={{
                  left: `${pod.leftPct}%`,
                  top: `${pod.topPct}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-auto select-none"
              >
                {/* Curved Duo VIP Sofa / Couch Base with Glowing Neon Outline */}
                <div
                  className={`${podWidthClass} rounded-[20px] sm:rounded-[24px] bg-gradient-to-b from-[#1b1035]/95 via-[#0e0720]/95 to-[#06020e] border-2 border-indigo-500/50 shadow-[0_4px_18px_rgba(0,0,0,0.85),0_0_14px_rgba(139,92,246,0.35)] p-1 sm:p-1.5 relative flex items-center justify-between transition-transform hover:scale-105`}
                >
                  {/* Subtle curved neon border highlight */}
                  <div className="absolute inset-0 rounded-[20px] sm:rounded-[24px] border border-cyan-400/20 pointer-events-none" />

                  {/* ================= SEAT A (Left) ================= */}
                  <div
                    onClick={() => handleSeatClick(seatA)}
                    className="relative flex flex-col items-center cursor-pointer group/seatA"
                    title={`Seat ${pod.seatAId + 1}: ${isUserA ? seatA.user?.name : 'Empty (Tap to take seat)'}`}
                  >
                    {/* Crown for Host on Seat 1 */}
                    {pod.seatAId === 0 && (
                      <div className="absolute -top-3 z-30 drop-shadow-[0_0_10px_rgba(245,158,11,1)]">
                        <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400 animate-bounce-short" />
                      </div>
                    )}

                    {/* Speaking Ripple Wave */}
                    {isSpeakingA && (
                      <div className="absolute -inset-1 rounded-full border-2 border-cyan-400 animate-ping opacity-75 pointer-events-none" />
                    )}

                    {/* Avatar Disc OR Empty 3D Disc */}
                    <div
                      className={`${avatarSizeClass} rounded-full p-0.5 transition-all duration-300 relative flex items-center justify-center ${
                        isUserA
                          ? pod.seatAId === 0
                            ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-[0_0_14px_rgba(6,182,212,0.85)]'
                            : 'bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.7)]'
                          : 'bg-gradient-to-b from-[#181a2e] to-[#070914] border border-cyan-500/40 shadow-inner'
                      }`}
                    >
                      {isUserA ? (
                        <img
                          src={seatA.user!.avatar}
                          alt={seatA.user!.name}
                          className="w-full h-full rounded-full object-cover border border-[#120422]"
                        />
                      ) : seatA.isLocked ? (
                        <Lock className="w-3 h-3 text-red-400" />
                      ) : (
                        <Users className="w-3.5 h-3.5 text-cyan-300/80 group-hover/seatA:text-white" />
                      )}

                      {/* Blue Circular Seat Number Badge at bottom (Matches Reference Image) */}
                      <div
                        className={`absolute -bottom-1 -left-0.5 ${numBadgeSize} rounded-full bg-blue-600 border border-white/90 text-white font-black flex items-center justify-center shadow-md`}
                      >
                        {pod.seatAId + 1}
                      </div>

                      {/* Mic Status Badge */}
                      {isUserA && (
                        <div
                          className={`absolute -bottom-1 -right-0.5 w-3.5 h-3.5 rounded-full border border-black/80 flex items-center justify-center shadow-sm ${
                            seatA.isMuted
                              ? 'bg-red-600 text-white'
                              : isSpeakingA
                              ? 'bg-emerald-500 text-white animate-pulse'
                              : 'bg-[#151a30] text-cyan-300'
                          }`}
                        >
                          {seatA.isMuted ? (
                            <MicOff className="w-2 h-2" />
                          ) : (
                            <Mic className="w-2 h-2" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ================= CENTER HEART CONNECTOR ================= */}
                  <div
                    onClick={handlePulseSurge}
                    className="flex flex-col items-center justify-center px-0.5 cursor-pointer group/heart"
                    title="Pulse Duo Synergy - Tap to boost!"
                  >
                    <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-pink-500 fill-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,1)] transition-transform group-hover/heart:scale-125 animate-pulse" />
                  </div>

                  {/* ================= SEAT B (Right) ================= */}
                  <div
                    onClick={() => handleSeatClick(seatB)}
                    className="relative flex flex-col items-center cursor-pointer group/seatB"
                    title={`Seat ${pod.seatBId + 1}: ${isUserB ? seatB.user?.name : 'Empty (Tap to take seat)'}`}
                  >
                    {/* Speaking Ripple Wave */}
                    {isSpeakingB && (
                      <div className="absolute -inset-1 rounded-full border-2 border-pink-500 animate-ping opacity-75 pointer-events-none" />
                    )}

                    {/* Avatar Disc OR Empty 3D Disc */}
                    <div
                      className={`${avatarSizeClass} rounded-full p-0.5 transition-all duration-300 relative flex items-center justify-center ${
                        isUserB
                          ? pod.seatBId === 1
                            ? 'bg-gradient-to-tr from-pink-500 to-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.85)]'
                            : 'bg-gradient-to-tr from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.7)]'
                          : 'bg-gradient-to-b from-[#181a2e] to-[#070914] border border-pink-500/40 shadow-inner'
                      }`}
                    >
                      {isUserB ? (
                        <img
                          src={seatB.user!.avatar}
                          alt={seatB.user!.name}
                          className="w-full h-full rounded-full object-cover border border-[#120422]"
                        />
                      ) : seatB.isLocked ? (
                        <Lock className="w-3 h-3 text-red-400" />
                      ) : (
                        <Users className="w-3.5 h-3.5 text-pink-300/80 group-hover/seatB:text-white" />
                      )}

                      {/* Blue Circular Seat Number Badge at bottom (Matches Reference Image) */}
                      <div
                        className={`absolute -bottom-1 -left-0.5 ${numBadgeSize} rounded-full bg-blue-600 border border-white/90 text-white font-black flex items-center justify-center shadow-md`}
                      >
                        {pod.seatBId + 1}
                      </div>

                      {/* Mic Status Badge */}
                      {isUserB && (
                        <div
                          className={`absolute -bottom-1 -right-0.5 w-3.5 h-3.5 rounded-full border border-black/80 flex items-center justify-center shadow-sm ${
                            seatB.isMuted
                              ? 'bg-red-600 text-white'
                              : isSpeakingB
                              ? 'bg-emerald-500 text-white animate-pulse'
                              : 'bg-[#151a30] text-pink-300'
                          }`}
                        >
                          {seatB.isMuted ? (
                            <MicOff className="w-2 h-2" />
                          ) : (
                            <Mic className="w-2 h-2" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pill Badge Below the Couch: 💖 Seat X - Y (Matches Reference Image) */}
                <div
                  className="mt-1 px-1.5 py-0.5 rounded-full bg-black/85 border border-purple-500/60 shadow-[0_2px_8px_rgba(0,0,0,0.9)] flex items-center gap-1 backdrop-blur-md"
                >
                  <Heart className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-pink-400 fill-pink-400" />
                  <span className={`${labelTextSize} font-black text-white tracking-wide whitespace-nowrap`}>
                    {pod.label}
                  </span>
                </div>
              </div>
            );
          })}

          {/* ==================================================== */}
          {/* BOTTOM FLOOR BRANDING "Pulse - Connect • Talk • Friends" */}
          {/* ==================================================== */}
          <div className="absolute left-4 bottom-2 sm:bottom-4 z-20 pointer-events-none flex flex-col">
            <div className="flex items-center gap-1.5">
              {/* Audio Wave Logo */}
              <div className="flex items-center gap-0.5 text-pink-400">
                <span className="w-1 h-3 bg-cyan-400 rounded-full" />
                <span className="w-1 h-5 bg-purple-400 rounded-full" />
                <span className="w-1 h-4 bg-pink-500 rounded-full" />
              </div>
              <span className="text-xl font-black italic tracking-wide bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent font-heading drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                Pulse
              </span>
            </div>
            <span className="text-[9px] text-purple-200/90 tracking-wider font-medium ml-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,1)]">
              Connect • Talk • Make Friends
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* REAL-TIME MINI CHAT STREAM (Floating overlay)            */}
      {/* ======================================================== */}
      <div className="px-3.5 py-1 z-25 max-h-20 overflow-y-auto no-scrollbar space-y-1 pointer-events-auto">
        {roomComments.slice(-3).map((rc) => {
          if (rc.isMysteryBox && rc.giftStacks) {
            return (
              <div
                key={rc.id}
                className="flex items-center gap-2 px-2.5 py-1 rounded-2xl bg-gradient-to-r from-[#2a0845]/95 via-[#18052a]/95 to-black/90 border border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.35)] backdrop-blur-md max-w-fit"
              >
                {rc.avatar ? (
                  <img
                    src={rc.avatar}
                    alt={rc.user}
                    className="w-5 h-5 rounded-full border border-amber-400 object-cover shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-amber-500/30 border border-amber-400 flex items-center justify-center text-[10px]">
                    🎁
                  </div>
                )}
                <div className="flex flex-col min-w-0 pr-0.5">
                  <span className="font-extrabold text-[10px] text-amber-300 truncate max-w-[90px]">
                    {rc.user}
                  </span>
                  <span className="text-[8px] text-purple-200 font-medium truncate">
                    Gift in Mystery Gift Box
                  </span>
                </div>
                {/* Stacked multiplier badges from video */}
                <div className="flex items-center gap-1 shrink-0 bg-black/60 px-1.5 py-0.5 rounded-lg border border-purple-800/60">
                  {rc.giftStacks.map((stk, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-0.5">
                      <span className="text-[11px]">{stk.icon}</span>
                      <span className="text-[8px] font-black text-amber-400">{stk.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <div
              key={rc.id}
              className={`text-[10px] px-2.5 py-0.5 rounded-xl backdrop-blur-md max-w-fit shadow ${
                rc.isGift
                  ? `bg-gradient-to-r ${currentTheme.chatBubbleGift} font-bold`
                  : 'bg-black/60 border border-white/10 text-purple-200'
              }`}
            >
              <span className="font-bold text-pink-300 mr-1">{rc.user}:</span>
              <span>{rc.text}</span>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* BOTTOM ACTION BAR                                        */}
      {/* Chat | Mute | Speaker | Gift | Invite | Leave             */}
      {/* ======================================================== */}
      <div className="p-3 bg-black/75 border-t border-purple-900/50 backdrop-blur-xl flex items-center justify-between gap-1 z-30">
        {/* Chat Pill Button */}
        <button
          onClick={() => setShowChatDrawer(!showChatDrawer)}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border transition active:scale-95 text-xs font-bold ${
            showChatDrawer
              ? 'bg-purple-900 border-pink-500 text-white'
              : 'bg-[#1a0f30]/80 border-cyan-500/40 text-purple-200 hover:text-white hover:border-cyan-400'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-cyan-300" />
          <span>Chat</span>
        </button>

        {/* Center Icons with labels underneath */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mute Button */}
          <button
            onClick={handleToggleMic}
            className="flex flex-col items-center gap-1 group"
            title="Toggle Microphone"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition active:scale-95 ${
                !isUserSeated
                  ? 'bg-purple-950/70 border-purple-800 text-purple-300'
                  : isMicOn
                  ? 'bg-emerald-600/80 border-emerald-400 text-white shadow-[0_0_14px_rgba(52,211,153,0.7)]'
                  : 'bg-red-600/30 border-red-500 text-red-400'
              }`}
            >
              {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </div>
            <span className="text-[10px] text-purple-200 group-hover:text-white font-medium">
              {isMicOn ? 'Unmuted' : 'Mute'}
            </span>
          </button>

          {/* Speaker Button */}
          <button
            onClick={handleToggleSpeaker}
            className="flex flex-col items-center gap-1 group"
            title="Toggle Speaker"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition active:scale-95 ${
                isSpeakerOn
                  ? 'bg-purple-950/80 border-cyan-500/40 text-cyan-300 hover:border-cyan-300'
                  : 'bg-red-950/40 border-red-600 text-red-400'
              }`}
            >
              {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </div>
            <span className="text-[10px] text-purple-200 group-hover:text-white font-medium">
              Speaker
            </span>
          </button>

          {/* Song / Music Gallery Button */}
          <button
            onClick={() => setShowSongModal(true)}
            className="flex flex-col items-center gap-1 group relative"
            title="Play Songs from Gallery or Presets on Mic"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition active:scale-95 hover:scale-105 ${
                isPlayingSong
                  ? 'bg-gradient-to-tr from-cyan-500 to-pink-500 border-cyan-300 text-white shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse'
                  : isUserSeated
                  ? 'bg-[#1e0e38] border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)] ring-1 ring-cyan-400/50'
                  : 'bg-purple-950/80 border-purple-700/60 text-purple-300 hover:border-cyan-400 hover:text-white'
              }`}
            >
              {isPlayingSong ? (
                <Disc3 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Music2 className="w-4 h-4 text-cyan-300" />
              )}
            </div>
            <span
              className={`text-[10px] font-medium transition ${
                isPlayingSong ? 'text-cyan-300 font-bold' : 'text-purple-200 group-hover:text-cyan-300'
              }`}
            >
              {isPlayingSong ? 'Playing' : 'Song'}
            </span>
            {isUserSeated && !isPlayingSong && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
            )}
          </button>

          {/* Gift Button */}
          <button
            onClick={() =>
              setActiveGiftTarget({
                name: `All ${maxSeatsCount} Seats`,
                isAll: true,
              })
            }
            className="flex flex-col items-center gap-1 group"
            title="Send Gift"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-pink-600/60 to-purple-800/80 border border-pink-500/60 text-pink-300 flex items-center justify-center transition active:scale-95 hover:scale-105 shadow-[0_0_12px_rgba(236,72,153,0.4)]">
              <Gift className="w-4 h-4 text-pink-300" />
            </div>
            <span className="text-[10px] text-pink-300 group-hover:text-pink-200 font-medium">
              Gift
            </span>
          </button>

          {/* Invite Button */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex flex-col items-center gap-1 group"
            title="Invite Friends"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-950/80 border border-purple-700/60 text-purple-300 flex items-center justify-center transition active:scale-95 hover:border-cyan-400 hover:text-white">
              <Users className="w-4 h-4 text-purple-200" />
            </div>
            <span className="text-[10px] text-purple-200 group-hover:text-white font-medium">
              Invite
            </span>
          </button>
        </div>

        {/* Leave Room Pill Button (Matches User Reference Image) */}
        <button
          onClick={() => setShowLeaveConfirm(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 border border-pink-400 text-white shadow-[0_0_14px_rgba(244,63,94,0.6)] transition active:scale-95 text-xs font-bold hover:brightness-110 shrink-0"
          title="Leave Voice Room"
        >
          <LogOut className="w-4 h-4" />
          <span>Leave</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SLIDE-UP CHAT & COMMENT DRAWER                           */}
      {/* ======================================================== */}
      {showChatDrawer && (
        <div className="absolute inset-x-0 bottom-16 z-40 bg-[#150729]/95 border-t border-purple-700/60 rounded-t-3xl p-4 shadow-2xl backdrop-blur-xl max-h-80 flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-800/60">
            <span className="text-xs font-black text-white flex items-center gap-1.5 font-heading">
              <MessageCircle className="w-4 h-4 text-pink-400" /> Room Live Chat (10 Seats)
            </span>
            <button
              onClick={() => setShowChatDrawer(false)}
              className="text-xs text-purple-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto space-y-1.5 mb-3 max-h-44 pr-1">
            {roomComments.map((rc) => {
              if (rc.isMysteryBox && rc.giftStacks) {
                return (
                  <div
                    key={rc.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl bg-gradient-to-r from-[#290a45]/95 via-[#1a072d]/95 to-black/90 border border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.3)] backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {rc.avatar ? (
                        <img
                          src={rc.avatar}
                          alt={rc.user}
                          className="w-7 h-7 rounded-full border-2 border-amber-400 object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-amber-500/30 border border-amber-400 flex items-center justify-center text-xs">
                          🎁
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-xs text-amber-300 truncate">
                          {rc.user}
                        </span>
                        <span className="text-[10px] text-purple-200 font-semibold truncate">
                          Gift in Mystery Gift Box
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 bg-black/60 px-2 py-1 rounded-xl border border-purple-800/60">
                      {rc.giftStacks.map((stk, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-0.5">
                          <span className="text-sm">{stk.icon}</span>
                          <span className="text-[10px] font-black text-amber-400">{stk.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={rc.id}
                  className={`text-xs p-2 rounded-xl backdrop-blur-md ${
                    rc.isGift
                      ? `bg-gradient-to-r ${currentTheme.chatBubbleGift} font-bold`
                      : 'bg-purple-950/50 border border-purple-800/40 text-purple-200'
                  }`}
                >
                  <span className="font-bold text-pink-300 mr-1.5">{rc.user}:</span>
                  <span>{rc.text}</span>
                </div>
              );
            })}
          </div>

          {/* Quick Reaction Emojis */}
          <div className="flex items-center gap-2 mb-2">
            {['🔥', '💖', '👏', '👑', '🎉', '🎵'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setRoomComments((prev) => [
                    ...prev,
                    {
                      id: `re_${Date.now()}`,
                      user: currentUser.name,
                      text: emoji,
                    },
                  ]);
                }}
                className="px-2 py-1 rounded-lg bg-purple-950/80 hover:bg-pink-600 text-sm transition active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendChat} className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Send a message to the arena..."
              className="flex-1 bg-purple-950/80 border border-purple-800/60 rounded-full px-3.5 py-2 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
            />
            <button
              type="submit"
              className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* INVITE FRIENDS MODAL                                     */}
      {/* ======================================================== */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs rounded-3xl bg-[#17082e] border border-purple-700/60 p-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-cyan-400 mx-auto p-0.5 mb-3 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#120422] flex items-center justify-center">
                <Users className="w-6 h-6 text-cyan-300" />
              </div>
            </div>
            <h3 className="text-sm font-black text-white font-heading">
              Invite to 3D Room #{room.id}
            </h3>
            <p className="text-[11px] text-purple-300 mt-1 mb-4">
              Share the room code or link to enjoy 10-seat crystal clear audio together!
            </p>

            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-purple-950/70 border border-purple-800 mb-4">
              <span className="font-mono text-xs font-bold text-amber-300">
                Code: {room.id}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(`https://pulsevip.app/room/${room.id}`);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-3 py-1 rounded-xl bg-purple-900 hover:bg-pink-600 text-xs font-bold text-white flex items-center gap-1 transition"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <button
              onClick={() => setShowInviteModal(false)}
              className="w-full py-2.5 rounded-2xl bg-purple-950 hover:bg-purple-900 text-xs font-bold text-purple-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 10 3D THEMES SELECTOR MODAL (With real 3D Picture Cards) */}
      {/* ======================================================== */}
      {showThemePicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#140727] border border-purple-700/60 p-5 shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-800/60">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-gradient-to-tr from-pink-500 to-amber-500 text-white">
                  <Palette className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white font-heading">
                    10 Stylish 3D Room Themes
                  </h3>
                  <p className="text-[11px] text-purple-300">
                    Choose from 3D Lion, Castle, Arena, Love, Fight & more!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowThemePicker(false)}
                className="p-1.5 rounded-full bg-purple-950 text-purple-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 10 Themes Grid with 3D Picture Previews */}
            <div className="space-y-2.5">
              {(
                [
                  'lion',
                  'castle',
                  'arena',
                  'love',
                  'fight',
                  'sultan',
                  'galaxy',
                  'emerald',
                  'ocean',
                  'supercar',
                ] as const
              ).map((themeKey) => {
                const theme = ROOM_THEMES[themeKey];
                const isActive = (room.wallpaper || 'lion') === theme.id;

                return (
                  <div
                    key={theme.id}
                    onClick={() => handleApplyTheme(theme.id)}
                    className={`p-2.5 rounded-2xl border transition cursor-pointer flex items-center justify-between group ${
                      isActive
                        ? 'bg-purple-900/70 border-amber-400 shadow-xl ring-1 ring-amber-400'
                        : 'bg-purple-950/40 border-purple-800/50 hover:bg-purple-900/40 hover:border-purple-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* 3D Image Preview Thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/20 shrink-0 shadow-md relative group-hover:scale-105 transition-transform">
                        <img
                          src={theme.bgImage}
                          alt={theme.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 bg-black/60 rounded-md px-1 text-[10px]">
                          {theme.icon}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white font-heading">
                            {theme.name}
                          </h4>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Active
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-purple-300 mt-0.5 max-w-[200px] truncate">
                          {theme.tagline}
                        </p>
                      </div>
                    </div>

                    <button className="px-3 py-1 rounded-xl text-xs font-bold bg-white/10 group-hover:bg-pink-600 text-white transition shrink-0">
                      {isActive ? 'Applied' : 'Select'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-purple-800/60 flex items-center justify-between text-[11px] text-purple-300">
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <Sparkles className="w-3.5 h-3.5" /> All 10 themes in photorealistic 3D
              </span>
              <button
                onClick={() => setShowThemePicker(false)}
                className="px-4 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DJ SOUNDBOARD MODAL                                      */}
      {/* ======================================================== */}
      {showDjBoard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#17092e] border border-pink-500/50 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Music className="w-4 h-4 text-pink-400" /> DJ Party Soundboard
              </span>
              <button
                onClick={() => setShowDjBoard(false)}
                className="text-xs text-purple-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/60 mb-3">
              <span className="text-xs text-purple-200 font-medium">Lofi Lounge Loop</span>
              <button
                onClick={handleToggleDjBgm}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  isDjBgmActive ? 'bg-emerald-500 text-white' : 'bg-purple-900 text-purple-300'
                }`}
              >
                {isDjBgmActive ? 'Playing 🎵' : 'Play Music'}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '📯 Horn', fn: () => soundService.playAirHorn() },
                { label: '👏 Cheer', fn: () => soundService.playApplause() },
                { label: '🥁 Drums', fn: () => soundService.playDrumRoll() },
                { label: '🪙 Coins', fn: () => soundService.playCoinSound() },
              ].map((sfx, idx) => (
                <button
                  key={idx}
                  onClick={sfx.fn}
                  className="py-2.5 rounded-xl bg-purple-950/80 hover:bg-pink-600 border border-purple-800 text-[11px] font-bold text-white transition active:scale-95"
                >
                  {sfx.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADMIN / SEAT MANAGEMENT MODAL                            */}
      {/* ======================================================== */}
      {selectedSeatForAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#16082e] border border-purple-700/80 p-5 shadow-2xl text-center">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-800/60">
              <span className="text-xs font-black text-amber-300 font-heading flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                Seat #{selectedSeatForAdmin.id + 1} Control
              </span>
              <button
                onClick={() => setSelectedSeatForAdmin(null)}
                className="text-purple-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedSeatForAdmin.user ? (
              <div className="flex flex-col items-center my-3">
                <div className="relative mb-2">
                  <img
                    src={selectedSeatForAdmin.user.avatar}
                    alt={selectedSeatForAdmin.user.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-lg"
                  />
                  {selectedSeatForAdmin.role === 'host' && (
                    <div className="absolute -top-1.5 -right-1.5 p-1 bg-amber-500 rounded-full shadow">
                      <Crown className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  )}
                  {selectedSeatForAdmin.role === 'co-host' && (
                    <div className="absolute -top-1.5 -right-1.5 p-1 bg-purple-600 rounded-full shadow">
                      <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>

                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  {selectedSeatForAdmin.user.name}
                </span>

                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/80 text-purple-200 border border-purple-700 font-semibold uppercase tracking-wider">
                    {selectedSeatForAdmin.role}
                  </span>
                  {selectedSeatForAdmin.isMuted && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-800 font-semibold flex items-center gap-1">
                      <MicOff className="w-2.5 h-2.5" /> Muted
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <div className="w-12 h-12 rounded-full bg-purple-950/80 border border-dashed border-purple-700 mx-auto flex items-center justify-center text-purple-400 mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-xs text-purple-300">
                  {selectedSeatForAdmin.isLocked ? 'This seat is currently locked.' : 'This seat is currently empty.'}
                </p>
              </div>
            )}

            <div className="space-y-2 mt-4 text-xs font-bold">
              {/* Gift this speaker */}
              {selectedSeatForAdmin.user && (
                <button
                  onClick={() => {
                    setActiveGiftTarget({
                      name: selectedSeatForAdmin.user!.name,
                      seatId: selectedSeatForAdmin.id,
                    });
                    setSelectedSeatForAdmin(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <Gift className="w-4 h-4 text-pink-200" /> Send Gift
                </button>
              )}

              {/* Empty seat actions */}
              {!selectedSeatForAdmin.user && (
                <>
                  {!selectedSeatForAdmin.isLocked && (
                    <button
                      onClick={() => {
                        handleSeatClick(selectedSeatForAdmin);
                        setSelectedSeatForAdmin(null);
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center gap-1.5 active:scale-95 transition"
                    >
                      <Radio className="w-4 h-4" /> Take This Seat
                    </button>
                  )}

                  {canLock && (
                    <button
                      onClick={() => handleAdminAction(selectedSeatForAdmin.isLocked ? 'unlock' : 'lock')}
                      className={`w-full py-2.5 rounded-xl text-white flex items-center justify-center gap-1.5 transition ${
                        selectedSeatForAdmin.isLocked
                          ? 'bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-500'
                          : 'bg-amber-700/80 hover:bg-amber-600 border border-amber-500'
                      }`}
                    >
                      {selectedSeatForAdmin.isLocked ? (
                        <>
                          <Unlock className="w-4 h-4" /> Unlock Seat
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" /> Lock Seat
                        </>
                      )}
                    </button>
                  )}
                </>
              )}

              {/* Host & Admin Controls on Occupied Seat */}
              {selectedSeatForAdmin.user && selectedSeatForAdmin.user.id !== currentUser.id && (
                <div className="pt-2 border-t border-purple-800/60 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Mute / Unmute */}
                    {canMute && (
                      <button
                        onClick={() =>
                          handleForceMuteUser(
                            selectedSeatForAdmin.id,
                            selectedSeatForAdmin.user!,
                            !selectedSeatForAdmin.isMuted
                          )
                        }
                        className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                          selectedSeatForAdmin.isMuted
                            ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 hover:bg-emerald-900'
                            : 'bg-purple-950/80 border-purple-700 text-purple-200 hover:bg-purple-900'
                        }`}
                      >
                        {selectedSeatForAdmin.isMuted ? (
                          <>
                            <Mic className="w-3.5 h-3.5 text-emerald-400" /> Unmute
                          </>
                        ) : (
                          <>
                            <MicOff className="w-3.5 h-3.5 text-purple-400" /> Mute Mic
                          </>
                        )}
                      </button>
                    )}

                    {/* Mic Remove (Drop back to audience) */}
                    {canMute && (
                      <button
                        onClick={() =>
                          handleRemoveFromMic(
                            selectedSeatForAdmin.id,
                            selectedSeatForAdmin.user!
                          )
                        }
                        className="py-2 px-3 rounded-xl bg-orange-950/80 border border-orange-700/70 text-orange-200 hover:bg-orange-900 flex items-center justify-center gap-1.5 transition"
                        title="Remove user from mic back to audience"
                      >
                        <UserMinus className="w-3.5 h-3.5 text-orange-400" /> Remove Mic
                      </button>
                    )}
                  </div>

                  {/* Make Co-Host (Only Host can toggle Co-Host) */}
                  {isHost && (
                    <button
                      onClick={() =>
                        handleToggleCoHost(
                          selectedSeatForAdmin.user!.id,
                          selectedSeatForAdmin.user!.name
                        )
                      }
                      className="w-full py-2 rounded-xl bg-indigo-950/80 border border-indigo-700 text-indigo-200 hover:bg-indigo-900 flex items-center justify-center gap-1.5 transition"
                    >
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                      {coHostIds.includes(selectedSeatForAdmin.user!.id)
                        ? 'Remove Admin / Co-Host'
                        : 'Make Admin / Co-Host'}
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {/* Kick from Room */}
                    {canKick && (
                      <button
                        onClick={() =>
                          handleKickUser(
                            selectedSeatForAdmin.user!.id,
                            selectedSeatForAdmin.user!.name
                          )
                        }
                        className="py-2 rounded-xl bg-red-950/80 border border-red-700 text-red-300 hover:bg-red-900 flex items-center justify-center gap-1.5 transition"
                      >
                        <UserX className="w-3.5 h-3.5 text-red-400" /> Kick
                      </button>
                    )}

                    {/* Block / Ban User */}
                    {canBan && (
                      <button
                        onClick={() =>
                          handleBlockUser(
                            selectedSeatForAdmin.user!,
                            'Violated room rules on mic'
                          )
                        }
                        className="py-2 rounded-xl bg-rose-950 border border-rose-600 text-rose-300 hover:bg-rose-900 flex items-center justify-center gap-1.5 transition"
                      >
                        <Ban className="w-3.5 h-3.5 text-rose-400" /> Block / Ban
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* If it's my own seat on mic */}
              {selectedSeatForAdmin.user?.id === currentUser.id && (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedSeatForAdmin(null);
                      setShowSongModal(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950/60 font-bold active:scale-95 transition"
                  >
                    <Music2 className="w-4 h-4 text-cyan-200" />
                    <span>Play Song from Gallery 📁</span>
                  </button>

                  <button
                    onClick={handleLeaveSeat}
                    className="w-full py-2.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 hover:text-white flex items-center justify-center gap-1.5 transition"
                  >
                    <UserMinus className="w-4 h-4 text-purple-300" /> Leave My Seat
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ROOM SETTINGS & ADMIN PERMISSIONS (ALLOWANCES) MODAL    */}
      {/* ======================================================== */}
      {showRoomSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md max-h-[90vh] rounded-3xl bg-[#140827] border border-purple-600/60 p-4 sm:p-5 shadow-2xl flex flex-col text-white">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-purple-800/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white font-heading">
                    Room Settings & Permissions
                  </h3>
                  <p className="text-[10px] text-purple-300">
                    Host: <span className="text-amber-400 font-bold">{room.host.name}</span> • ID #{room.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowRoomSettings(false)}
                className="p-1 rounded-full text-purple-400 hover:text-white hover:bg-purple-900/40 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs (4 Tabs) */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-purple-950/80 rounded-2xl border border-purple-800/60 my-3 shrink-0">
              <button
                onClick={() => setRoomSettingsTab('allowances')}
                className={`py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                  roomSettingsTab === 'allowances'
                    ? 'bg-gradient-to-r from-amber-500 to-pink-600 text-white shadow-md'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Rules</span>
              </button>

              <button
                onClick={() => setRoomSettingsTab('profile')}
                className={`py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                  roomSettingsTab === 'profile'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>DP & Name</span>
              </button>

              <button
                onClick={() => setRoomSettingsTab('members')}
                className={`py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                  roomSettingsTab === 'members'
                    ? 'bg-gradient-to-r from-amber-500 to-pink-600 text-white shadow-md'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Users ({allActiveMembers.length})</span>
              </button>

              <button
                onClick={() => setRoomSettingsTab('blocked')}
                className={`py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                  roomSettingsTab === 'blocked'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Blocked ({blockedUsers.length})</span>
              </button>
            </div>

            {/* Tab 1: Permissions & Allowances */}
            {roomSettingsTab === 'allowances' && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                {/* Admin Permissions (Co-Host Allowances) */}
                <div className="p-3 rounded-2xl bg-purple-950/50 border border-purple-800/60">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-2.5">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Admin & Co-Host Privileges</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">Allow Admins to Kick Users</p>
                        <p className="text-[10px] text-purple-300">Co-hosts can remove troublemakers</p>
                      </div>
                      <button
                        disabled={!isHost}
                        onClick={() => handleToggleAllowance('allowAdminKick')}
                        className={`text-xl transition ${
                          allowances.allowAdminKick ? 'text-emerald-400' : 'text-purple-600'
                        }`}
                      >
                        {allowances.allowAdminKick ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">Allow Admins to Ban / Block</p>
                        <p className="text-[10px] text-purple-300">Co-hosts can blacklist users</p>
                      </div>
                      <button
                        disabled={!isHost}
                        onClick={() => handleToggleAllowance('allowAdminBan')}
                        className={`text-xl transition ${
                          allowances.allowAdminBan ? 'text-emerald-400' : 'text-purple-600'
                        }`}
                      >
                        {allowances.allowAdminBan ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">Allow Admins to Mute & Drop Mic</p>
                        <p className="text-[10px] text-purple-300">Force mute or remove users from mic</p>
                      </div>
                      <button
                        disabled={!isHost}
                        onClick={() => handleToggleAllowance('allowAdminMuteMic')}
                        className={`text-xl transition ${
                          allowances.allowAdminMuteMic ? 'text-emerald-400' : 'text-purple-600'
                        }`}
                      >
                        {allowances.allowAdminMuteMic ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">Allow Admins to Lock Seats</p>
                        <p className="text-[10px] text-purple-300">Lock or reserve empty stage seats</p>
                      </div>
                      <button
                        disabled={!isHost}
                        onClick={() => handleToggleAllowance('allowAdminLockSeats')}
                        className={`text-xl transition ${
                          allowances.allowAdminLockSeats ? 'text-emerald-400' : 'text-purple-600'
                        }`}
                      >
                        {allowances.allowAdminLockSeats ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Room Rules & Mode Allowances */}
                <div className="p-3 rounded-2xl bg-purple-950/50 border border-purple-800/60">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-2.5">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <span>Room Participation Rules</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">Require Host Approval for Mic</p>
                        <p className="text-[10px] text-purple-300">
                          {allowances.requireMicApproval
                            ? 'ON (Audience must request to speak)'
                            : 'OFF (Free open mic on empty seats)'}
                        </p>
                      </div>
                      <button
                        disabled={!isHost}
                        onClick={() => handleToggleAllowance('requireMicApproval')}
                        className={`text-xl transition ${
                          allowances.requireMicApproval ? 'text-emerald-400' : 'text-purple-600'
                        }`}
                      >
                        {allowances.requireMicApproval ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">Public Chat Allowed</p>
                        <p className="text-[10px] text-purple-300">
                          {allowances.allowChat ? 'Everyone can send messages' : 'Chat paused by Host'}
                        </p>
                      </div>
                      <button
                        disabled={!isHost}
                        onClick={() => handleToggleAllowance('allowChat')}
                        className={`text-xl transition ${
                          allowances.allowChat ? 'text-emerald-400' : 'text-purple-600'
                        }`}
                      >
                        {allowances.allowChat ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">Gifts Delivery Allowed</p>
                        <p className="text-[10px] text-purple-300">Enable audience & speakers to send gifts</p>
                      </div>
                      <button
                        disabled={!isHost}
                        onClick={() => handleToggleAllowance('allowGifts')}
                        className={`text-xl transition ${
                          allowances.allowGifts ? 'text-emerald-400' : 'text-purple-600'
                        }`}
                      >
                        {allowances.allowGifts ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Appointed Co-Hosts List */}
                <div className="p-3 rounded-2xl bg-purple-950/50 border border-purple-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      Appointed Admins ({coHostIds.length})
                    </span>
                    <span className="text-[10px] text-purple-300">Manage from Members tab</span>
                  </div>

                  {coHostIds.length === 0 ? (
                    <p className="text-[11px] text-purple-400/80 italic">
                      No co-hosts appointed yet. Go to the Members tab to promote any user to Admin.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {coHostIds.map((cId) => {
                        const u = DEMO_USERS.find((d) => d.id === cId);
                        if (!u) return null;
                        return (
                          <div
                            key={cId}
                            className="flex items-center justify-between p-2 rounded-xl bg-purple-900/40 border border-purple-800/50"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-7 h-7 rounded-full object-cover border border-purple-400"
                              />
                              <span className="text-xs font-bold text-white">{u.name}</span>
                            </div>
                            {isHost && (
                              <button
                                onClick={() => handleToggleCoHost(u.id, u.name)}
                                className="px-2 py-0.5 rounded-lg bg-red-950/80 border border-red-700 text-red-300 text-[10px] font-bold hover:bg-red-900"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Room DP & Name (Permanent Storage) */}
            {roomSettingsTab === 'profile' && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                {/* Room DP Section */}
                <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <Camera className="w-4 h-4 text-pink-400" /> Room Display Picture (DP)
                    </span>
                    <span className="text-[10px] text-amber-300 font-medium">Permanent</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative group">
                      <img
                        src={roomDp}
                        alt="Room DP"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={() => roomDpInputRef.current?.click()}
                        className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition text-[9px] font-bold text-white"
                      >
                        <Camera className="w-4 h-4 mb-0.5 text-amber-300" /> Change
                      </button>
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => roomDpInputRef.current?.click()}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                      >
                        <Upload className="w-3.5 h-3.5" /> Choose Photo from Gallery
                      </button>
                      <p className="text-[9px] text-purple-300 leading-tight">
                        Aapki gallery se photo room ki permanent DP ban jayegi aur khud se kabhi change nahi hogi.
                      </p>
                    </div>
                  </div>

                  {/* Luxury DP Presets */}
                  <div>
                    <span className="text-[10px] text-purple-300 font-bold block mb-1.5">
                      Or Choose Luxury 3D DP Presets:
                    </span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { name: 'Lion', img: '/themes/lion.jpg' },
                        { name: 'Castle', img: '/themes/castle.jpg' },
                        { name: 'Arena', img: '/themes/arena.jpg' },
                        { name: 'Love', img: '/themes/love.jpg' },
                        { name: 'Sultan', img: '/themes/sultan.jpg' },
                        { name: 'Galaxy', img: '/themes/galaxy.jpg' },
                        { name: 'Fight', img: '/themes/fight.jpg' },
                        { name: 'Supercar', img: '/themes/supercar.jpg' },
                        { name: 'Emerald', img: '/themes/emerald.jpg' },
                        { name: 'Ocean', img: '/themes/ocean.jpg' },
                      ].map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => handleUpdateRoomDp(item.img)}
                          className={`p-1 rounded-xl border flex flex-col items-center gap-1 transition ${
                            roomDp === item.img
                              ? 'border-amber-400 bg-amber-500/20 ring-1 ring-amber-400'
                              : 'border-purple-900 bg-purple-950/40 hover:border-purple-700'
                          }`}
                        >
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover"
                          />
                          <span className="text-[8px] text-white font-medium truncate w-full text-center">
                            {item.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Room Title Edit Section */}
                <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-800/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <Edit2 className="w-4 h-4 text-emerald-400" /> Chat Room Name
                    </span>
                    <span className="text-[10px] text-purple-400">Custom Title</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempTitleInput}
                      onChange={(e) => setTempTitleInput(e.target.value)}
                      placeholder="Enter room name..."
                      maxLength={45}
                      className="flex-1 bg-[#140827] border border-purple-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleSaveRoomTitle}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 hover:opacity-95 text-white font-bold text-xs shadow-md active:scale-95 transition shrink-0"
                    >
                      Save Name
                    </button>
                  </div>
                </div>

                {/* Permanent Guarantee Notice */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-900/30 to-pink-500/10 border border-amber-400/40 text-[10px] text-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Permanent DP & Name Guarantee</span>
                  </div>
                  <p className="text-purple-200">
                    Ek baar room ki DP ya Name change kar lene ke baad ye app me hamesha ke liye save rehta hai. Jab tak aap khud change nahi karenge, ye khud se kabhi change nahi hoga!
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Members & Mic Controls */}
            {roomSettingsTab === 'members' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    placeholder="Search member by name..."
                    className="w-full bg-purple-950/80 border border-purple-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Member List */}
                <div className="space-y-2">
                  {allActiveMembers
                    .filter((m) =>
                      m.user.name.toLowerCase().includes(memberSearchQuery.toLowerCase())
                    )
                    .map((m) => {
                      const isTargetHost = m.user.id === room.host.id;
                      const isTargetMe = m.user.id === currentUser.id;
                      const isTargetAdmin = coHostIds.includes(m.user.id) || m.role === 'co-host';
                      const isTargetSeated = m.seatNumber !== undefined;

                      return (
                        <div
                          key={m.user.id}
                          className="p-2.5 rounded-2xl bg-purple-950/40 border border-purple-800/60 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="relative">
                                <img
                                  src={m.user.avatar}
                                  alt={m.user.name}
                                  className="w-9 h-9 rounded-full object-cover border border-purple-500"
                                />
                                {isTargetHost && (
                                  <div className="absolute -bottom-1 -right-1 p-0.5 bg-amber-500 rounded-full">
                                    <Crown className="w-2.5 h-2.5 text-white fill-white" />
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-white text-xs">
                                    {m.user.name}
                                  </span>
                                  {isTargetMe && (
                                    <span className="text-[9px] px-1 rounded bg-purple-800 text-purple-200">
                                      You
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {isTargetHost ? (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                                      👑 Host
                                    </span>
                                  ) : isTargetAdmin ? (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
                                      🛡️ Admin
                                    </span>
                                  ) : isTargetSeated ? (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                                      🎙️ Seat #{m.seatNumber! + 1}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/40 text-purple-300">
                                      🎧 Listener
                                    </span>
                                  )}

                                  {isTargetSeated && m.isMuted && (
                                    <span className="text-[9px] text-red-400 flex items-center gap-0.5">
                                      <MicOff className="w-2.5 h-2.5" /> Muted
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Gift Action */}
                            {!isTargetMe && (
                              <button
                                onClick={() => {
                                  setActiveGiftTarget({
                                    name: m.user.name,
                                    seatId: m.seatNumber,
                                  });
                                  setShowRoomSettings(false);
                                }}
                                className="p-1.5 rounded-xl bg-pink-600/30 hover:bg-pink-600 border border-pink-500/40 text-pink-300 hover:text-white transition"
                                title="Send Gift"
                              >
                                <Gift className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Host & Admin Actions Row */}
                          {hasAdminRights && !isTargetHost && !isTargetMe && (
                            <div className="flex items-center gap-1.5 pt-2 border-t border-purple-800/40 flex-wrap">
                              {/* Mic Mute / Unmute */}
                              {isTargetSeated && canMute && (
                                <button
                                  onClick={() =>
                                    handleForceMuteUser(
                                      m.seatNumber!,
                                      m.user,
                                      !m.isMuted
                                    )
                                  }
                                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition flex items-center gap-1 ${
                                    m.isMuted
                                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300 hover:bg-emerald-900'
                                      : 'bg-purple-900/60 border-purple-700 text-purple-200 hover:bg-purple-800'
                                  }`}
                                >
                                  {m.isMuted ? <Mic className="w-3 h-3 text-emerald-400" /> : <MicOff className="w-3 h-3 text-purple-400" />}
                                  <span>{m.isMuted ? 'Unmute' : 'Mute'}</span>
                                </button>
                              )}

                              {/* Mic Remove */}
                              {isTargetSeated && canMute && (
                                <button
                                  onClick={() =>
                                    handleRemoveFromMic(m.seatNumber!, m.user)
                                  }
                                  className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-orange-950/70 border border-orange-700/60 text-orange-200 hover:bg-orange-900 flex items-center gap-1 transition"
                                  title="Remove from Mic"
                                >
                                  <UserMinus className="w-3 h-3 text-orange-400" />
                                  <span>Remove Mic</span>
                                </button>
                              )}

                              {/* Toggle Admin */}
                              {isHost && (
                                <button
                                  onClick={() => handleToggleCoHost(m.user.id, m.user.name)}
                                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition flex items-center gap-1 ${
                                    isTargetAdmin
                                      ? 'bg-purple-900/80 border-purple-500 text-purple-200 hover:bg-purple-800'
                                      : 'bg-indigo-950 border-indigo-700 text-indigo-300 hover:bg-indigo-900'
                                  }`}
                                >
                                  <Shield className="w-3 h-3 text-indigo-400" />
                                  <span>{isTargetAdmin ? 'Demote Admin' : 'Make Admin'}</span>
                                </button>
                              )}

                              {/* Kick User */}
                              {canKick && (
                                <button
                                  onClick={() => handleKickUser(m.user.id, m.user.name)}
                                  className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-red-950/80 border border-red-700/70 text-red-300 hover:bg-red-900 flex items-center gap-1 transition"
                                  title="Kick user from room"
                                >
                                  <UserX className="w-3 h-3 text-red-400" />
                                  <span>Kick</span>
                                </button>
                              )}

                              {/* Block User */}
                              {canBan && (
                                <button
                                  onClick={() =>
                                    handleBlockUser(
                                      m.user,
                                      'Removed by room moderator'
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-rose-950 border border-rose-600 text-rose-300 hover:bg-rose-900 flex items-center gap-1 transition"
                                  title="Block and ban user from room"
                                >
                                  <Ban className="w-3 h-3 text-rose-400" />
                                  <span>Block</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Tab 3: Blocked & Banned Users */}
            {roomSettingsTab === 'blocked' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                <div className="p-3 rounded-2xl bg-red-950/30 border border-red-800/40 text-[11px] text-red-200">
                  <div className="flex items-center gap-1.5 font-bold text-red-300 mb-1">
                    <Ban className="w-4 h-4 text-red-400" />
                    <span>Room Ban Blacklist</span>
                  </div>
                  <p className="text-purple-300 text-[10px]">
                    Blocked users cannot enter this room, speak on mic, or send chat messages. You can unblock them at any time.
                  </p>
                </div>

                {/* Quick Block Manual Add Tool */}
                {canBan && (
                  <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/60 flex items-center gap-2">
                    <input
                      type="text"
                      value={newBlockInput}
                      onChange={(e) => setNewBlockInput(e.target.value)}
                      placeholder="Username or ID to ban..."
                      className="flex-1 bg-purple-900/60 border border-purple-700/60 rounded-xl px-3 py-1.5 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-red-500"
                    />
                    <button
                      onClick={() => {
                        if (!newBlockInput.trim()) return;
                        const fakeUser: User = {
                          id: `blocked_${Date.now()}`,
                          name: newBlockInput.trim(),
                          username: `@${newBlockInput.trim().toLowerCase().replace(/\s+/g, '_')}`,
                          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
                          phone: '+92 300 0000000',
                          bio: 'Blocked User',
                          coins: 0,
                          diamonds: 0,
                          level: 1,
                          vipTier: 'Bronze',
                        };
                        handleBlockUser(fakeUser, 'Manually blocked by Host');
                        setNewBlockInput('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" /> Block
                    </button>
                  </div>
                )}

                {/* Blocked Users List */}
                {blockedUsers.length === 0 ? (
                  <div className="py-8 text-center text-purple-400">
                    <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-emerald-400 opacity-80" />
                    <p className="font-bold text-xs text-purple-200">Clean Room!</p>
                    <p className="text-[10px] text-purple-400 mt-0.5">
                      No users are currently blocked or banned in this room.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {blockedUsers.map((b) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={b.avatar}
                            alt={b.name}
                            className="w-10 h-10 rounded-full object-cover border border-red-500/60"
                          />
                          <div>
                            <span className="font-bold text-white text-xs block">
                              {b.name}
                            </span>
                            <span className="text-[10px] text-red-300 block">
                              Reason: {b.reason || 'Blocked by host'}
                            </span>
                            <span className="text-[9px] text-purple-400">
                              Time: {b.blockedAt}
                            </span>
                          </div>
                        </div>

                        {/* Unblock Button */}
                        {canBan && (
                          <button
                            onClick={() => handleUnblockUser(b.id, b.name)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Unblock</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modal Bottom Footer */}
            <div className="mt-4 pt-3 border-t border-purple-800/60 flex items-center justify-between text-[11px] text-purple-300 shrink-0">
              <span className="flex items-center gap-1 text-amber-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Real-time room control
              </span>
              <button
                onClick={() => setShowRoomSettings(false)}
                className="px-4 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* LEAVE ROOM CONFIRMATION MODAL                            */}
      {/* ======================================================== */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-xs rounded-3xl bg-[#17092e] border border-red-600/60 p-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 mx-auto flex items-center justify-center mb-3">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="text-sm font-black text-white font-heading">
              Leave Voice Room?
            </h3>
            <p className="text-[11px] text-purple-300 mt-1 mb-4">
              Aap is room se bahir chale jayenge. Agar aap mic par hain to aapki seat khali ho jayegi.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowLeaveConfirm(false);
                  agoraService.leaveChannel();
                  onLeaveRoom();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/60 active:scale-95 transition"
              >
                <LogOut className="w-4 h-4" /> Yes, Leave Room
              </button>

              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="w-full py-2 text-xs text-purple-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ultra Premium Cinematic Video Gift Player System */}
      <CinematicGiftPlayer
        payload={active3DGift}
        onComplete={() => {
          setActive3DGift(null);
          setCinematicPhase(null);
        }}
        onPhaseChange={(phase) => setCinematicPhase(phase)}
      />

      {/* Gift Studio Modal */}
      {activeGiftTarget && (
        <GiftModal
          isOpen={!!activeGiftTarget}
          onClose={() => setActiveGiftTarget(null)}
          targetName={activeGiftTarget.name}
          currentUser={currentUser}
          onSendGift={handleSendGift}
          seats={safeSeats}
          initialSeatId={activeGiftTarget.seatId}
        />
      )}

      {/* Ludo Lucky Dice Mini-Game Modal */}
      {showLudoDice && (
        <LudoDiceGame
          isOpen={showLudoDice}
          onClose={() => setShowLudoDice(false)}
          onRewardCoins={(reward) => onSendCoinsReward(reward)}
          onBroadcastRoll={(d1, d2, total) => {
            setRoomComments((prev) => [
              ...prev,
              {
                id: `dice_${Date.now()}`,
                user: 'LUDO DICE 🎲',
                text: `${currentUser.name} rolled [${d1}] & [${d2}] = ${total}!`,
                isGift: true,
              },
            ]);
          }}
        />
      )}

      {/* ======================================================== */}
      {/* RENAME ROOM TITLE MODAL                                  */}
      {/* ======================================================== */}
      {showEditTitleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#140827] border border-purple-600/70 p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-purple-800/60 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black font-heading">Change Room Name</h3>
                  <p className="text-[10px] text-purple-300">Custom name for your {maxSeatsCount}-seat room</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditTitleModal(false)}
                className="p-1 rounded-full text-purple-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-purple-200 block mb-1.5">
                  Room Name / Title
                </label>
                <input
                  type="text"
                  value={tempTitleInput}
                  onChange={(e) => setTempTitleInput(e.target.value)}
                  placeholder="e.g. Royal Pulse VIP Lounge 🎙️"
                  maxLength={40}
                  className="w-full bg-purple-950/80 border border-purple-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Quick Preset Ideas */}
              <div>
                <span className="text-[10px] text-purple-300 block mb-1">Quick Name Ideas:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '👑 Royal Sultan Lounge',
                    '🦁 3D Lion King Arena',
                    '🎶 Late Night Pulse VIP',
                    '🎧 DJ Beats & Nonstop',
                    '💖 Love & Shayari Corner',
                  ].map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => setTempTitleInput(idea)}
                      className="px-2 py-1 rounded-lg bg-purple-950/60 border border-purple-800 text-[10px] text-purple-200 hover:text-white hover:border-amber-400 transition"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-[10px] text-amber-200 flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                <span>Once saved, your room name is permanently saved and will never automatically reset!</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditTitleModal(false)}
                  className="flex-1 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRoomTitle}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 hover:opacity-95 text-white text-xs font-bold shadow-lg transition active:scale-95"
                >
                  Save Room Name
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SONG PLAYER & AUDIO GALLERY MODAL                        */}
      {/* ======================================================== */}
      {showSongModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md max-h-[90vh] rounded-3xl bg-[#130726] border border-cyan-500/60 p-4 sm:p-5 shadow-2xl flex flex-col text-white">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-purple-800/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                  <Music2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black font-heading flex items-center gap-1.5">
                    Room Music & Song Player 🎧
                  </h3>
                  <p className="text-[10px] text-cyan-300">
                    Play songs on mic for all {maxSeatsCount} seats in crystal clear audio
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSongModal(false)}
                className="p-1 rounded-full text-purple-400 hover:text-white hover:bg-purple-900/40 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Device Audio Upload Gallery Action Card */}
            <div className="my-3 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-purple-950/80 to-pink-950/70 border border-cyan-500/60 shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Open Phone Gallery / Device Audio</h4>
                    <p className="text-[10px] text-purple-300">
                      Select MP3, WAV or song from your device files
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => songFileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Add Song</span>
                </button>
              </div>
            </div>

            {/* Now Playing Active Player Bar */}
            {currentSong && (
              <div className="p-3 rounded-2xl bg-[#1b0d36] border border-pink-500/50 shadow-inner mb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center text-white shrink-0 shadow">
                      <Disc3 className={`w-5 h-5 ${isPlayingSong ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                        <span className="truncate">{currentSong.title}</span>
                        {isPlayingSong && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-purple-300 flex items-center gap-2 mt-0.5">
                        <span>{currentSong.artist || 'Device Track'}</span>
                        <span>•</span>
                        <span className="text-cyan-300 font-medium">Added by {currentSong.addedBy}</span>
                      </div>
                    </div>
                  </div>

                  {/* Player Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleTogglePlayPause}
                      className="p-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white shadow active:scale-95 transition"
                      title={isPlayingSong ? 'Pause' : 'Play'}
                    >
                      {isPlayingSong ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleStopSong}
                      className="p-2 rounded-full bg-red-950 border border-red-800 text-red-300 hover:text-white"
                      title="Stop"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full h-1.5 rounded-full bg-purple-950 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full transition-all duration-200"
                      style={{ width: `${songProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-purple-400">
                    <span>{isPlayingSong ? 'Live Streaming' : 'Paused'}</span>
                    <span>{currentSong.duration || '03:30'}</span>
                  </div>
                </div>

                {/* Volume Slider & Animated EQ */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-purple-800/40">
                  <div className="flex items-center gap-1.5">
                    <Volume1 className="w-3.5 h-3.5 text-cyan-400" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={songVolume}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSongVolume(val);
                        if (audioPlayerRef.current) audioPlayerRef.current.volume = val / 100;
                      }}
                      className="w-20 sm:w-28 accent-cyan-400 h-1 bg-purple-900 rounded cursor-pointer"
                    />
                    <span className="text-[10px] text-cyan-300 font-mono">{songVolume}%</span>
                  </div>

                  {/* Equalizer Visualizer Bars */}
                  {isPlayingSong && (
                    <div className="flex items-end gap-0.5 h-4">
                      {[12, 16, 8, 14, 10, 16, 12].map((h, i) => (
                        <span
                          key={i}
                          className="w-1 bg-gradient-to-t from-cyan-400 to-pink-500 rounded-full animate-pulse"
                          style={{
                            height: `${h}px`,
                            animationDelay: `${i * 120}ms`,
                            animationDuration: '600ms',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Playlist Library */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <div className="flex items-center justify-between text-xs text-purple-300 px-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-pink-400" /> Room Song Playlist ({roomPlaylist.length})
                </span>
                <span className="text-[10px] text-cyan-300">Tap to Play on Mic</span>
              </div>

              {roomPlaylist.map((s) => {
                const isThisPlaying = currentSong?.id === s.id && isPlayingSong;
                return (
                  <div
                    key={s.id}
                    className={`p-2.5 rounded-2xl border transition flex items-center justify-between gap-2.5 ${
                      currentSong?.id === s.id
                        ? 'bg-purple-900/60 border-cyan-400 shadow-md ring-1 ring-cyan-400/40'
                        : 'bg-purple-950/40 border-purple-800/50 hover:bg-purple-900/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          if (currentSong?.id === s.id) {
                            handleTogglePlayPause();
                          } else {
                            handlePlaySong(s);
                          }
                        }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition shrink-0 ${
                          isThisPlaying
                            ? 'bg-pink-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.8)]'
                            : 'bg-purple-900/80 text-cyan-300 hover:bg-cyan-600 hover:text-white'
                        }`}
                      >
                        {isThisPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>

                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span className="truncate">{s.title}</span>
                          {s.isCustom && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold shrink-0">
                              Gallery 📁
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-purple-300 truncate">
                          {s.artist} • By <span className="text-amber-300 font-medium">{s.addedBy}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-purple-400 font-mono">{s.duration}</span>
                      {s.isCustom && (
                        <button
                          type="button"
                          onClick={() => {
                            setRoomPlaylist((prev) => prev.filter((p) => p.id !== s.id));
                            if (currentSong?.id === s.id) handleStopSong();
                          }}
                          className="p-1 rounded-lg text-purple-400 hover:text-red-400 hover:bg-purple-900/50 transition"
                          title="Remove Song"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="mt-3 pt-3 border-t border-purple-800/60 flex items-center justify-between text-[11px] text-purple-300 shrink-0">
              <span className="flex items-center gap-1 text-cyan-300 font-semibold">
                <Disc3 className="w-3.5 h-3.5" /> Stereo Mic Streaming
              </span>
              <button
                type="button"
                onClick={() => setShowSongModal(false)}
                className="px-4 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs"
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ROOM LEVEL & DYNAMIC SEATS PROGRESSION MODAL            */}
      {/* ======================================================== */}
      {showLevelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#140827] border border-amber-500/70 p-5 shadow-2xl text-white max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-purple-800/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow">
                  <Crown className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black font-heading flex items-center gap-1.5 text-white">
                    Room Level & Seats Capacity 🚀
                  </h3>
                  <p className="text-[10px] text-amber-300 font-medium">
                    Level up to expand arena seats dynamically!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLevelModal(false)}
                className="p-1 rounded-full text-purple-400 hover:text-white hover:bg-purple-900/40 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Status Showcase Card */}
            <div className="my-3 p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-purple-950/80 to-pink-950/70 border border-amber-400/50 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Current Room Tier</span>
                  <div className="text-xl font-black text-white flex items-center gap-2 font-heading">
                    Level {roomLevel}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold">
                      {maxSeatsCount} SEATS ACTIVE
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>
              </div>

              {/* EXP Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] text-purple-200 mb-1">
                  <span>Room EXP: {roomExp} / {roomLevel >= 30 ? '3000' : roomLevel >= 10 ? '2000' : '500'}</span>
                  <span className="text-amber-400 font-bold">
                    {roomLevel >= 30 ? 'Max Capacity 🏆' : roomLevel >= 10 ? 'Next: Lv.30 (20 Seats)' : 'Next: Lv.10 (12 Seats)'}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden p-0.5 border border-purple-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        roomLevel >= 30
                          ? (roomExp / 3000) * 100
                          : roomLevel >= 10
                          ? ((roomExp - 500) / 1500) * 100
                          : (roomExp / 500) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* SEAT MILESTONES (6, 12, 20 SEATS) */}
            <div className="space-y-2.5 my-2">
              <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider">
                Seat Unlock Milestones (Duo Pods VIP)
              </h4>

              {/* Tier 1: 6 Seats */}
              <div className={`p-3 rounded-2xl border transition-all ${
                roomLevel < 10
                  ? 'bg-purple-950/60 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                  : 'bg-purple-950/30 border-purple-900/40 opacity-80'
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-900/80 border border-purple-700 flex items-center justify-center text-purple-200 font-bold text-xs">
                      6
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        6 Seats Arena (3 Duo Pods)
                        {roomLevel < 10 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-600 font-bold">
                            ACTIVE ✅
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-purple-300">Default starting capacity (Levels 1 - 9): Seat 1-2, 3-4, 5-6</p>
                    </div>
                  </div>
                  {roomLevel >= 10 && (
                    <button
                      type="button"
                      onClick={() => handleUpgradeRoomLevel(1)}
                      className="px-2.5 py-1 rounded-lg bg-purple-900/60 border border-purple-700 text-[10px] text-purple-200 hover:text-white"
                    >
                      Switch Lv.1
                    </button>
                  )}
                </div>
              </div>

              {/* Tier 2: 12 Seats (Unlocked at Level 10) */}
              <div className={`p-3 rounded-2xl border transition-all ${
                roomLevel >= 10 && roomLevel < 30
                  ? 'bg-cyan-950/50 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'bg-purple-950/30 border-purple-900/40 opacity-80'
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      roomLevel >= 10
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                        : 'bg-purple-950 text-purple-400 border border-purple-800'
                    }`}>
                      12
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        12 Seats Arena (6 Duo Pods)
                        {roomLevel >= 10 ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-600 font-bold">
                            UNLOCKED 🌟
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-400 border border-amber-700 font-bold">
                            LOCK: LEVEL 10 🔒
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-purple-300">Level 10 reached: 12 Seats (6 Duo Pods) active!</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUpgradeRoomLevel(10)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow transition active:scale-95 ${
                      roomLevel >= 10 && roomLevel < 30
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 cursor-default'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:opacity-90'
                    }`}
                  >
                    {roomLevel >= 10 && roomLevel < 30 ? 'Lv.10 Active' : 'Switch Lv.10 🚀'}
                  </button>
                </div>
              </div>

              {/* Tier 3: 20 Seats Super VIP Arena (Unlocked at Level 30) */}
              <div className={`p-3 rounded-2xl border transition-all ${
                roomLevel >= 30
                  ? 'bg-amber-950/40 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                  : 'bg-purple-950/30 border-purple-900/40 opacity-80'
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      roomLevel >= 30
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400 shadow'
                        : 'bg-purple-950 text-purple-400 border border-purple-800'
                    }`}>
                      20
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        20 Seats Super VIP Arena (10 Duo Pods)
                        {roomLevel >= 30 ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-600 font-bold">
                            MAX VIP 👑
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-400 border border-amber-700 font-bold">
                            LOCK: LEVEL 30 🔒
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-purple-300">Level 30 reached: 20 Seats (10 Duo Pods) full circular VIP arena!</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUpgradeRoomLevel(30)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow transition active:scale-95 ${
                      roomLevel >= 30
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400 cursor-default'
                        : 'bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 text-white hover:opacity-90'
                    }`}
                  >
                    {roomLevel >= 30 ? 'Lv.30 Active' : 'Switch Lv.30 👑'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Fast Actions for Host */}
            <div className="mt-3 p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60 space-y-2">
              <span className="text-[11px] font-bold text-purple-200 block">
                ⚡ Quick Room Level Switcher:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpgradeRoomLevel(1)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition ${
                    roomLevel < 10
                      ? 'bg-purple-800 text-white border-purple-500'
                      : 'bg-purple-900/40 text-purple-300 border-purple-800 hover:bg-purple-900'
                  }`}
                >
                  10 Seats (Lv.1)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpgradeRoomLevel(10)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition ${
                    roomLevel >= 10 && roomLevel < 30
                      ? 'bg-cyan-600 text-white border-cyan-400 shadow'
                      : 'bg-purple-900/40 text-purple-300 border-purple-800 hover:bg-purple-900'
                  }`}
                >
                  15 Seats (Lv.10)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpgradeRoomLevel(30)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition ${
                    roomLevel >= 30
                      ? 'bg-amber-500 text-white border-amber-400 shadow'
                      : 'bg-purple-900/40 text-purple-300 border-purple-800 hover:bg-purple-900'
                  }`}
                >
                  20 Seats (Lv.30)
                </button>
              </div>
              <p className="text-[10px] text-purple-300/80 italic text-center pt-1">
                Aap jab chaho button daba kar ya room me gifts send kar k room level 10 (15 seats) ya level 30 (20 seats) activate kar sakte hain.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="mt-3 pt-3 border-t border-purple-800/60 flex items-center justify-between text-[11px] text-purple-300 shrink-0">
              <span className="flex items-center gap-1 text-amber-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Pulse VIP Arenas
              </span>
              <button
                type="button"
                onClick={() => setShowLevelModal(false)}
                className="px-4 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
