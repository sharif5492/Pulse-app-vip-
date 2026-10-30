export interface User {
  id: string;
  name: string;
  phone: string;
  username: string;
  avatar: string;
  bio: string;
  coins: number;
  diamonds: number;
  level: number;
  vipTier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Crown';
  isHost?: boolean;
  country?: string;
  flag?: string;
  email?: string;
  authProvider?: 'phone' | 'google' | 'facebook' | 'demo';
}

export interface Seat {
  id: number; // 0 to 9 (10 seats)
  user: User | null;
  isLocked: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  role: 'host' | 'co-host' | 'speaker' | 'none';
  pulseStatus?: 'sending' | 'receiving' | 'synced' | 'none';
}

export interface BlockedUser {
  id: string;
  name: string;
  avatar: string;
  blockedAt: string;
  reason?: string;
}

export interface RoomAllowances {
  allowAdminKick: boolean;
  allowAdminBan: boolean;
  allowAdminMuteMic: boolean;
  allowAdminLockSeats: boolean;
  requireMicApproval: boolean;
  allowChat: boolean;
  allowGifts: boolean;
  allowGuestsToJoin: boolean;
}

export interface RoomSong {
  id: string;
  title: string;
  artist?: string;
  url: string;
  duration?: string;
  addedBy: string;
  isCustom?: boolean;
}

export interface VoiceRoom {
  id: string;
  title: string;
  host: User;
  coverImage?: string; // Room DP - stays permanent until user updates it
  category: 'Gaming' | 'Singing' | 'Pulse VIP' | 'ChitChat' | 'Dating' | 'DJ Club';
  wallpaper:
    | 'lion'
    | 'castle'
    | 'arena'
    | 'love'
    | 'fight'
    | 'sultan'
    | 'galaxy'
    | 'emerald'
    | 'ocean'
    | 'supercar'
    | 'pulse'
    | 'royal'
    | 'cyberpunk'
    | 'arabian'
    | 'sunset';
  listenersCount: number;
  seats: Seat[];
  isLocked: boolean;
  password?: string;
  tags: string[];
  currentBgTrack?: string;
  playlist?: RoomSong[];
  currentSong?: RoomSong | null;
  isSongPlaying?: boolean;
  activeAnnouncements: string[];
  blockedUsers?: BlockedUser[];
  allowances?: RoomAllowances;
  coHostIds?: string[];
  level?: number; // Room level: 1-9 (6 seats), 10-29 (12 seats), 30+ (20 seats)
  exp?: number;
  maxExp?: number;
}

export const getRoomMaxSeats = (level: number = 1): number => {
  if (level >= 30) return 20;
  if (level >= 10) return 12;
  return 6;
};

export interface ReelComment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
}

export interface Reel {
  id: string;
  author: User;
  videoUrl: string; // real video or canvas visualizer
  thumbnail: string;
  title: string;
  tags: string[];
  musicTitle: string;
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  sharesCount: number;
  comments: ReelComment[];
}

export interface LiveStream {
  id: string;
  streamer: User;
  title: string;
  category: string;
  viewerCount: number;
  likesCount: number;
  previewUrl: string;
  isPKBattle?: boolean;
  pkOpponent?: User;
  pkScoreUser?: number;
  pkScoreOpponent?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  type: 'text' | 'voice' | 'image' | 'video' | 'call_log';
  content: string; // text or media url/base64
  voiceDuration?: number; // seconds
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatThread {
  id: string;
  participant: User;
  lastMessage: ChatMessage;
  unreadCount: number;
  isOnline: boolean;
}

export interface ActiveCall {
  id: string;
  remoteUser: User;
  type: 'audio' | 'video';
  direction: 'incoming' | 'outgoing' | 'connected';
  duration: number;
  isMuted: boolean;
  isSpeakerOn: boolean;
}

export type GiftRarity = 'Classic' | 'Rare' | 'Epic' | 'Mythic' | 'Legendary';

export interface GiftItem {
  id: string;
  name: string;
  icon: string;
  coinValue: number;
  coins: number; // Backwards compatible alias
  '3dAnimationType': string;
  animationType?: string; // Backwards compatible alias
  color: string;
  rarity: GiftRarity;
  category?: 'classic' | 'vip';
  description?: string;
}

export interface Active3DGiftPayload {
  id: string;
  gift: GiftItem;
  quantity: number;
  sender: User;
  targetName: string;
  targetSeatId?: number;
  timestamp: number;
}

// 20 NEW VIP BIG LUXURY GIFTS
export const VIP_LUXURY_GIFTS: GiftItem[] = [
  {
    id: 'vip_ferrari',
    name: 'Ferrari',
    icon: '🏎️',
    coinValue: 10000,
    coins: 10000,
    '3dAnimationType': 'ferrari',
    animationType: 'ferrari',
    color: '#EF4444',
    rarity: 'Legendary',
    category: 'vip',
    description: '3D red Ferrari supercar cruising with glowing neon rims',
  },
  {
    id: 'vip_kiss',
    name: 'Kiss',
    icon: '💋',
    coinValue: 100,
    coins: 100,
    '3dAnimationType': 'kiss',
    animationType: 'kiss',
    color: '#EC4899',
    rarity: 'Classic',
    category: 'vip',
    description: '3D flying kiss with floating holographic hearts',
  },
  {
    id: 'vip_perfume',
    name: 'Perfume',
    icon: '🧴',
    coinValue: 500,
    coins: 500,
    '3dAnimationType': 'perfume',
    animationType: 'perfume',
    color: '#F472B6',
    rarity: 'Rare',
    category: 'vip',
    description: '3D Chanel luxury perfume bottle with sparkling scent spray',
  },
  {
    id: 'vip_taj_mahal',
    name: 'Taj Mahal',
    icon: '🕌',
    coinValue: 5000,
    coins: 5000,
    '3dAnimationType': 'taj_mahal',
    animationType: 'taj_mahal',
    color: '#FDE047',
    rarity: 'Mythic',
    category: 'vip',
    description: '3D Taj Mahal golden glowing marble domes under starlight',
  },
  {
    id: 'vip_burj_khalifa',
    name: 'Burj Khalifa',
    icon: '🏙️',
    coinValue: 7000,
    coins: 7000,
    '3dAnimationType': 'burj_khalifa',
    animationType: 'burj_khalifa',
    color: '#38BDF8',
    rarity: 'Legendary',
    category: 'vip',
    description: '3D Dubai skyscraper with animated light shows and laser beams',
  },
  {
    id: 'vip_tiger',
    name: 'Tiger',
    icon: '🐅',
    coinValue: 3000,
    coins: 3000,
    '3dAnimationType': 'tiger',
    animationType: 'tiger',
    color: '#F97316',
    rarity: 'Epic',
    category: 'vip',
    description: '3D roaring golden Bengal tiger leaping with flame auras',
  },
  {
    id: 'vip_lion_king',
    name: 'Lion King',
    icon: '🦁',
    coinValue: 4000,
    coins: 4000,
    '3dAnimationType': 'lion_king',
    animationType: 'lion_king',
    color: '#EAB308',
    rarity: 'Mythic',
    category: 'vip',
    description: '3D golden royal lion crowned with solar diamond brilliance',
  },
  {
    id: 'vip_private_jet',
    name: 'Private Jet',
    icon: '🛩️',
    coinValue: 10000,
    coins: 10000,
    '3dAnimationType': 'private_jet',
    animationType: 'private_jet',
    color: '#60A5FA',
    rarity: 'Legendary',
    category: 'vip',
    description: '3D supersonic luxury private jet with supersonic sonic rings',
  },
  {
    id: 'vip_yacht',
    name: 'Yacht',
    icon: '🛥️',
    coinValue: 8000,
    coins: 8000,
    '3dAnimationType': 'yacht',
    animationType: 'yacht',
    color: '#06B6D4',
    rarity: 'Legendary',
    category: 'vip',
    description: '3D Monaco luxury superyacht gliding across illuminated sea waves',
  },
  {
    id: 'vip_diamond_ring',
    name: 'Diamond Ring',
    icon: '💍',
    coinValue: 2000,
    coins: 2000,
    '3dAnimationType': 'diamond_ring',
    animationType: 'diamond_ring',
    color: '#E0E7FF',
    rarity: 'Epic',
    category: 'vip',
    description: '3D 24k solitaire diamond ring rotating with rainbow refractive flares',
  },
  {
    id: 'vip_crown',
    name: 'Crown',
    icon: '👑',
    coinValue: 1500,
    coins: 1500,
    '3dAnimationType': 'crown',
    animationType: 'crown',
    color: '#FBBF24',
    rarity: 'Rare',
    category: 'vip',
    description: '3D sovereign imperial crown encrusted with ruby gems',
  },
  {
    id: 'vip_castle',
    name: 'Castle',
    icon: '🏰',
    coinValue: 6000,
    coins: 6000,
    '3dAnimationType': 'castle',
    animationType: 'castle',
    color: '#A855F7',
    rarity: 'Mythic',
    category: 'vip',
    description: '3D magical royal palace towers with celebration fireworks',
  },
  {
    id: 'vip_rose_bouquet',
    name: 'Rose Bouquet',
    icon: '💐',
    coinValue: 300,
    coins: 300,
    '3dAnimationType': 'rose_bouquet',
    animationType: 'rose_bouquet',
    color: '#F43F5E',
    rarity: 'Classic',
    category: 'vip',
    description: '3D 100 scarlet velvet roses with falling crystal petals',
  },
  {
    id: 'vip_sports_bike',
    name: 'Sports Bike',
    icon: '🏍️',
    coinValue: 4500,
    coins: 4500,
    '3dAnimationType': 'sports_bike',
    animationType: 'sports_bike',
    color: '#10B981',
    rarity: 'Epic',
    category: 'vip',
    description: '3D Hayabusa superbike with turbo nitro boost glow',
  },
  {
    id: 'vip_helicopter',
    name: 'Helicopter',
    icon: '🚁',
    coinValue: 9000,
    coins: 9000,
    '3dAnimationType': 'helicopter',
    animationType: 'helicopter',
    color: '#6366F1',
    rarity: 'Legendary',
    category: 'vip',
    description: '3D stealth executive helicopter with spinning 3D blades',
  },
  {
    id: 'vip_golden_heart',
    name: 'Golden Heart',
    icon: '💛',
    coinValue: 1000,
    coins: 1000,
    '3dAnimationType': 'golden_heart',
    animationType: 'golden_heart',
    color: '#F59E0B',
    rarity: 'Rare',
    category: 'vip',
    description: '3D beating golden heart radiating warm pulse waves',
  },
  {
    id: 'vip_money_rain',
    name: 'Money Rain',
    icon: '💸',
    coinValue: 2500,
    coins: 2500,
    '3dAnimationType': 'money_rain',
    animationType: 'money_rain',
    color: '#34D399',
    rarity: 'Epic',
    category: 'vip',
    description: '3D hundred dollar bills raining down with golden coins',
  },
  {
    id: 'vip_unicorn',
    name: 'Unicorn',
    icon: '🦄',
    coinValue: 3500,
    coins: 3500,
    '3dAnimationType': 'unicorn',
    animationType: 'unicorn',
    color: '#D946EF',
    rarity: 'Mythic',
    category: 'vip',
    description: '3D celestial unicorn galloping through starlight constellations',
  },
  {
    id: 'vip_dragon',
    name: 'Dragon',
    icon: '🐉',
    coinValue: 5500,
    coins: 5500,
    '3dAnimationType': 'dragon',
    animationType: 'dragon',
    color: '#DC2626',
    rarity: 'Legendary',
    category: 'vip',
    description: '3D ferocious fire dragon spiraling over the room with flame breaths',
  },
  {
    id: 'vip_universe',
    name: 'Universe',
    icon: '🌌',
    coinValue: 10000,
    coins: 10000,
    '3dAnimationType': 'universe',
    animationType: 'universe',
    color: '#818CF8',
    rarity: 'Legendary',
    category: 'vip',
    description: '3D swirling cosmic galaxy with rotating planets and aurora borealis',
  },
];

// CLASSIC GIFTS
export const CLASSIC_GIFTS: GiftItem[] = [
  {
    id: 'classic_rose',
    name: 'Love Rose',
    icon: '🌹',
    coinValue: 10,
    coins: 10,
    '3dAnimationType': 'rose_bouquet',
    animationType: 'rose',
    color: '#F43F5E',
    rarity: 'Classic',
    category: 'classic',
    description: 'Romantic single rose',
  },
  {
    id: 'classic_coffee',
    name: 'Warm Coffee',
    icon: '☕',
    coinValue: 25,
    coins: 25,
    '3dAnimationType': 'perfume',
    animationType: 'coffee',
    color: '#D97706',
    rarity: 'Classic',
    category: 'classic',
    description: 'Fresh warm morning coffee',
  },
  {
    id: 'classic_lucky_star',
    name: 'Lucky Star',
    icon: '⭐',
    coinValue: 50,
    coins: 50,
    '3dAnimationType': 'universe',
    animationType: 'star',
    color: '#FBBF24',
    rarity: 'Classic',
    category: 'classic',
    description: 'Shining lucky wishing star',
  },
  {
    id: 'classic_diamond',
    name: 'Blue Diamond',
    icon: '💎',
    coinValue: 100,
    coins: 100,
    '3dAnimationType': 'diamond_ring',
    animationType: 'diamond',
    color: '#38BDF8',
    rarity: 'Rare',
    category: 'classic',
    description: 'Sparkling gem token',
  },
  {
    id: 'classic_teddy',
    name: 'Cute Teddy',
    icon: '🧸',
    coinValue: 200,
    coins: 200,
    '3dAnimationType': 'unicorn',
    animationType: 'teddy',
    color: '#F472B6',
    rarity: 'Rare',
    category: 'classic',
    description: 'Warm fluffy teddy bear hug',
  },
  {
    id: 'classic_fireworks',
    name: 'Party Fireworks',
    icon: '🎆',
    coinValue: 500,
    coins: 500,
    '3dAnimationType': 'money_rain',
    animationType: 'fireworks',
    color: '#EC4899',
    rarity: 'Epic',
    category: 'classic',
    description: 'Room-wide celebration fireworks',
  },
  {
    id: 'classic_sports_car',
    name: 'Sports Car',
    icon: '🏎️',
    coinValue: 2000,
    coins: 2000,
    '3dAnimationType': 'ferrari',
    animationType: 'supercar',
    color: '#EF4444',
    rarity: 'Epic',
    category: 'classic',
    description: 'Speedy sports racer',
  },
  {
    id: 'classic_rocket',
    name: 'Space Rocket',
    icon: '🚀',
    coinValue: 5000,
    coins: 5000,
    '3dAnimationType': 'private_jet',
    animationType: 'rocket',
    color: '#6366F1',
    rarity: 'Legendary',
    category: 'classic',
    description: 'Blast off to the moon',
  },
];

