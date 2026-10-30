import { User, VoiceRoom, Reel, LiveStream, ChatThread, ChatMessage, GiftItem, Seat, getRoomMaxSeats, VIP_LUXURY_GIFTS, CLASSIC_GIFTS } from '../types';

export const DEMO_USERS: User[] = [
  {
    id: 'user_me',
    name: 'Muhammad Sharif',
    username: '@muhammad_sharif',
    phone: '+92 300 1234567',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    bio: 'Founder & Creator of Pulse App 👑 VIP Host & Community Leader ✨',
    coins: 99999,
    diamonds: 50000,
    level: 99,
    vipTier: 'Crown',
    isHost: true,
    country: 'Pakistan',
    flag: '🇵🇰',
  },
  {
    id: 'user_zara',
    name: 'Zara Khan',
    username: '@zarakhan_live',
    phone: '+971 50 123 4567',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    bio: 'Sufi Singer & Live Streamer 🌸 Top 1 Pulse VIP Host',
    coins: 48900,
    diamonds: 18500,
    level: 48,
    vipTier: 'Crown',
    isHost: true,
    country: 'United Arab Emirates',
    flag: '🇦🇪',
  },
  {
    id: 'user_kabir',
    name: 'DJ Kabir',
    username: '@djkabir_remix',
    phone: '+966 50 234 5678',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
    bio: 'Late night drops & Bollywood beats 🎧 Let the party roll!',
    coins: 22000,
    diamonds: 9200,
    level: 28,
    vipTier: 'Gold',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
  },
  {
    id: 'user_ananya',
    name: 'Ananya Roy',
    username: '@ananya_vibes',
    phone: '+44 7911 123456',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    bio: 'Poetess 🌙 Chai and Shayari lover ☕ Drop gifts for duet',
    coins: 8700,
    diamonds: 3100,
    level: 19,
    vipTier: 'Silver',
    country: 'United Kingdom',
    flag: '🇬🇧',
  },
  {
    id: 'user_farhan',
    name: 'Farhan Zaidi',
    username: '@farhan_pro',
    phone: '+92 321 9876543',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    bio: 'Ludo Master & Casual Gamer 🏆 Challenge me in room!',
    coins: 31000,
    diamonds: 11000,
    level: 38,
    vipTier: 'Diamond',
    country: 'Pakistan',
    flag: '🇵🇰',
  },
  {
    id: 'user_meera',
    name: 'Meera Rajput',
    username: '@meeraclicks',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    bio: 'Fashion & Vlogs 💄 Daily lives at 9 PM',
    coins: 14500,
    diamonds: 5600,
    level: 24,
    vipTier: 'Gold',
    country: 'United States',
    flag: '🇺🇸',
  }
];

export const LUXURY_GIFTS: GiftItem[] = [...VIP_LUXURY_GIFTS, ...CLASSIC_GIFTS];

export const INITIAL_ROOMS: VoiceRoom[] = [
  {
    id: '4587',
    title: 'Voice Chat Room',
    host: DEMO_USERS[0],
    category: 'ChitChat',
    wallpaper: 'lion',
    listenersCount: 10,
    isLocked: false,
    tags: ['Lion3D', '12Seats', 'Live'],
    currentBgTrack: 'Midnight Chill',
    activeAnnouncements: ['Welcome to 3D Golden Lion Kingdom! 12 Seats (6 Duo Pods) open for royal chats.'],
    allowances: {
      allowAdminKick: true,
      allowAdminBan: true,
      allowAdminMuteMic: true,
      allowAdminLockSeats: true,
      requireMicApproval: false,
      allowChat: true,
      allowGifts: true,
      allowGuestsToJoin: true,
    },
    blockedUsers: [
      {
        id: 'user_troll_99',
        name: 'Troll User 🚫',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
        blockedAt: 'Just now',
        reason: 'Rule violation & noise in mic',
      },
    ],
    coHostIds: ['user_zara'],
    level: 12, // Level 12 -> 12 Seats unlocked (6 Duo Pods)!
    exp: 480,
    maxExp: 1000,
    seats: [
      { id: 0, user: DEMO_USERS[0], isLocked: false, isMuted: false, isSpeaking: true, role: 'host', pulseStatus: 'sending' },
      { id: 1, user: DEMO_USERS[1], isLocked: false, isMuted: false, isSpeaking: false, role: 'co-host', pulseStatus: 'receiving' },
      { id: 2, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 3, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 4, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 5, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 6, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 7, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 8, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 9, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 10, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 11, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
    ]
  },
  {
    id: 'room_2',
    title: '🏰 Moonlight Castle Antakshari',
    host: DEMO_USERS[1],
    category: 'Singing',
    wallpaper: 'castle',
    listenersCount: 96,
    isLocked: false,
    level: 3, // Level 3 -> 6 Seats (3 Duo Pods)
    exp: 150,
    maxExp: 300,
    tags: ['Castle3D', 'Singing', '6Seats'],
    currentBgTrack: 'Sufi Soul',
    activeAnnouncements: ['Take a seat in the 3D Castle to sing your heart out! 6 Seats (3 Duo Pods).'],
    seats: [
      { id: 0, user: DEMO_USERS[1], isLocked: false, isMuted: false, isSpeaking: true, role: 'host', pulseStatus: 'sending' },
      { id: 1, user: DEMO_USERS[5], isLocked: false, isMuted: false, isSpeaking: false, role: 'speaker', pulseStatus: 'receiving' },
      { id: 2, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 3, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 4, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 5, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
    ]
  },
  {
    id: 'room_3',
    title: '🥊 Fire Dragon Fight Arena',
    host: DEMO_USERS[2],
    category: 'DJ Club',
    wallpaper: 'fight',
    listenersCount: 215,
    isLocked: false,
    level: 35, // Level 35 -> 20 Seats Max Super Arena!
    exp: 2400,
    maxExp: 3000,
    tags: ['Fight3D', 'Dragons', '20Seats'],
    currentBgTrack: 'Cyber Rave',
    activeAnnouncements: ['Enter the Dragon fight ring and battle with gifts!'],
    seats: [
      { id: 0, user: DEMO_USERS[2], isLocked: false, isMuted: false, isSpeaking: true, role: 'host', pulseStatus: 'sending' },
      { id: 1, user: DEMO_USERS[0], isLocked: false, isMuted: false, isSpeaking: false, role: 'speaker', pulseStatus: 'receiving' },
      { id: 2, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 3, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 4, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 5, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 6, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 7, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 8, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 9, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 10, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 11, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 12, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 13, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 14, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 15, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 16, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 17, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 18, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
      { id: 19, user: null, isLocked: false, isMuted: false, isSpeaking: false, role: 'none' },
    ]
  }
];

export const INITIAL_REELS: Reel[] = [
  {
    id: 'reel_1',
    author: DEMO_USERS[1],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-video-call-with-her-phone-41584-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    title: 'Singing my latest acoustic version 🎵 Who wants a duet in the Pulse VIP room tonight? ❤️',
    tags: ['#PulseVIP', '#Singing', '#Acoustic', '#Viral'],
    musicTitle: 'Zara Khan - Raataan Lambiyan (Acoustic Unplugged)',
    likesCount: 14200,
    isLiked: false,
    commentsCount: 382,
    sharesCount: 1205,
    comments: [
      { id: 'c1', user: DEMO_USERS[0], text: 'Mesmerizing voice Zara! Join our 9 PM room today 🔥', timestamp: '2h ago', likes: 24, isLiked: false },
      { id: 'c2', user: DEMO_USERS[2], text: 'That pitch control is top tier! 👏', timestamp: '1h ago', likes: 11, isLiked: false },
      { id: 'c3', user: DEMO_USERS[3], text: 'So proud of you queen 👑', timestamp: '30m ago', likes: 5, isLiked: false },
    ]
  },
  {
    id: 'reel_2',
    author: DEMO_USERS[2],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-dj-playing-music-on-a-sound-mixer-41908-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    title: 'When the bass drops in our 20-seat party arena! 🎧 Full crowd went wild!',
    tags: ['#DJLife', '#Remix', '#PulseClub', '#PartyMode'],
    musicTitle: 'DJ Kabir - Midnight Dubai Mashup 2026',
    likesCount: 28900,
    isLiked: true,
    commentsCount: 654,
    sharesCount: 3410,
    comments: [
      { id: 'c4', user: DEMO_USERS[4], text: 'I sent the dragon during that drop! Unbelievable energy 🐉', timestamp: '3h ago', likes: 88, isLiked: true },
      { id: 'c5', user: DEMO_USERS[5], text: 'Best DJ on the Pulse VIP app hands down 🔥', timestamp: '2h ago', likes: 19, isLiked: false }
    ]
  },
  {
    id: 'reel_3',
    author: DEMO_USERS[5],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-smiling-while-taking-a-selfie-with-a-smartphone-41618-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80',
    title: 'Testing out the new Beauty Glow camera filter on Pulse VIP! What do you guys think? ✨',
    tags: ['#GlowUp', '#BeautyFilter', '#Vlog', '#PulseCamera'],
    musicTitle: 'Original Audio - Meera Rajput',
    likesCount: 9400,
    isLiked: false,
    commentsCount: 198,
    sharesCount: 420,
    comments: [
      { id: 'c6', user: DEMO_USERS[1], text: 'Looking gorgeous Meera! Let us video call soon 💕', timestamp: '1h ago', likes: 14, isLiked: false }
    ]
  }
];

export const FALLBACK_REEL_VIDEOS: string[] = [
  'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-video-call-with-her-phone-41584-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-dj-playing-music-on-a-sound-mixer-41908-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-girl-smiling-while-taking-a-selfie-with-a-smartphone-41618-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-neon-lights-42506-large.mp4',
];

export const FALLBACK_THUMBNAILS: string[] = [
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
];

export const INITIAL_LIVES: LiveStream[] = [
  {
    id: 'live_1',
    streamer: DEMO_USERS[1],
    title: '🌟 Sufi Night & Duets with Fans! 🎤',
    category: 'Singing',
    viewerCount: 1840,
    likesCount: 38200,
    previewUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    isPKBattle: true,
    pkOpponent: DEMO_USERS[2],
    pkScoreUser: 12500,
    pkScoreOpponent: 9800,
  },
  {
    id: 'live_2',
    streamer: DEMO_USERS[2],
    title: '🔥 Live Electronic Remix & PK Battle',
    category: 'DJ Club',
    viewerCount: 980,
    likesCount: 14500,
    previewUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    isPKBattle: true,
    pkOpponent: DEMO_USERS[1],
    pkScoreUser: 9800,
    pkScoreOpponent: 12500,
  },
  {
    id: 'live_3',
    streamer: DEMO_USERS[3],
    title: '☕ Late Night Shayari & Life Conversations',
    category: 'Pulse VIP',
    viewerCount: 420,
    likesCount: 6300,
    previewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  }
];

export const INITIAL_CHATS: Record<string, ChatMessage[]> = {
  user_zara: [
    {
      id: 'm1',
      senderId: 'user_zara',
      receiverId: 'user_me',
      type: 'text',
      content: 'Hey Sharif! Are you opening the Dubai Royal room tonight? 🎲',
      timestamp: '8:45 PM',
      status: 'read'
    },
    {
      id: 'm2',
      senderId: 'user_me',
      receiverId: 'user_zara',
      type: 'text',
      content: 'Yes Zara! Starting at 9:30 PM. Kabir and Farhan will be on seats 2 and 6.',
      timestamp: '8:48 PM',
      status: 'read'
    },
    {
      id: 'm3',
      senderId: 'user_zara',
      receiverId: 'user_me',
      type: 'voice',
      content: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
      voiceDuration: 6,
      timestamp: '8:50 PM',
      status: 'read'
    },
    {
      id: 'm4',
      senderId: 'user_zara',
      receiverId: 'user_me',
      type: 'text',
      content: 'Listen to my vocal warmup above! Call me on video when you are ready to rehearse.',
      timestamp: '8:51 PM',
      status: 'read'
    }
  ],
  user_kabir: [
    {
      id: 'm5',
      senderId: 'user_kabir',
      receiverId: 'user_me',
      type: 'text',
      content: 'Yo brother! Loaded the new festival bass tracks for our party room.',
      timestamp: 'Yesterday',
      status: 'read'
    },
    {
      id: 'm6',
      senderId: 'user_me',
      receiverId: 'user_kabir',
      type: 'text',
      content: 'Awesome! Seat 2 is reserved for you as usual DJ 🎧',
      timestamp: 'Yesterday',
      status: 'read'
    }
  ],
  user_ananya: [
    {
      id: 'm7',
      senderId: 'user_ananya',
      receiverId: 'user_me',
      type: 'text',
      content: 'Loved the poetry session yesterday! Thanks for the diamond gift 💎',
      timestamp: '2 days ago',
      status: 'read'
    }
  ]
};

// Storage helper for Pulse VIP
const STORAGE_KEY_USER = 'pulse_vip_user_profile';
const STORAGE_KEY_ROOMS = 'pulse_vip_rooms';
const STORAGE_KEY_REELS = 'pulse_vip_reels';
const STORAGE_KEY_CHATS = 'pulse_vip_chats';

export function getStoredUser(): User {
  try {
    const data = localStorage.getItem(STORAGE_KEY_USER) || localStorage.getItem('mehfil_user_profile');
    if (data) {
      const parsed: User = JSON.parse(data);
      // Migrate old default or +91 cached profile to Muhammad Sharif, Pakistan (+92)
      const isOldIndianNumber = parsed.phone && parsed.phone.includes('+91');
      const isOldSami = parsed.name === 'Sami Malik' || parsed.username === '@samimalik';
      const isDefaultMe = parsed.id === 'user_me';

      if (isOldIndianNumber || isOldSami || (isDefaultMe && parsed.name !== 'Muhammad Sharif') || !parsed.country) {
        if (isOldSami || isDefaultMe || !parsed.name) {
          parsed.name = 'Muhammad Sharif';
          parsed.username = '@muhammad_sharif';
          parsed.bio = 'Founder & Creator of Pulse App 👑 VIP Host & Community Leader ✨';
        }
        if (isOldIndianNumber || !parsed.phone || parsed.phone.includes('+91')) {
          parsed.phone = '+92 300 1234567';
        }
        if (!parsed.country || parsed.phone?.startsWith('+92')) {
          parsed.country = 'Pakistan';
          parsed.flag = '🇵🇰';
        }
        saveStoredUser(parsed);
      }
      return parsed;
    }
  } catch (e) {
    console.error('Storage error', e);
  }
  return DEMO_USERS[0];
}

export function saveStoredUser(user: User) {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } catch (e) {
    console.error('Storage error', e);
  }
}

export function getStoredRooms(): VoiceRoom[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_ROOMS) || localStorage.getItem('mehfil_rooms');
    if (data) {
      const parsed: VoiceRoom[] = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let needsSave = false;
        const upgraded = parsed.map((room) => {
          const savedLevel = typeof window !== 'undefined' ? localStorage.getItem(`room_level_${room.id}`) : null;
          const level = savedLevel
            ? Number(savedLevel)
            : room.level || (room.id === '4587' ? 12 : room.id === 'room_3' ? 35 : room.id === 'room_2' ? 3 : 1);
          const maxSeats = getRoomMaxSeats(level);

          const currentSeats = room.seats || [];
          const hasWrongSeatCount = currentSeats.length !== maxSeats || currentSeats.length === 8;
          const hasNoLevel = !room.level || room.level !== level;

          if (hasWrongSeatCount || hasNoLevel) {
            needsSave = true;
            const newSeats: Seat[] = Array.from({ length: maxSeats }, (_, i) => {
              if (currentSeats[i]) {
                return {
                  ...currentSeats[i],
                  id: i,
                };
              }
              return {
                id: i,
                user: i === 0 ? room.host : null,
                isLocked: false,
                isMuted: false,
                isSpeaking: false,
                role: i === 0 ? 'host' : 'none',
                pulseStatus: i === 0 ? 'sending' : i === 1 ? 'receiving' : 'none',
              };
            });

            return {
              ...room,
              level,
              seats: newSeats,
              tags: (room.tags || []).map((t) => (t === '8Seats' ? `${maxSeats}Seats` : t)),
            };
          }
          return room;
        });

        if (needsSave) {
          saveStoredRooms(upgraded);
        }
        return upgraded;
      }
    }
  } catch (e) {
    console.error('Storage error', e);
  }
  return INITIAL_ROOMS;
}

export function saveStoredRooms(rooms: VoiceRoom[]) {
  try {
    localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(rooms));
  } catch (e) {
    console.error('Storage error', e);
  }
}

export function sanitizeReel(r: any, i: number = 0): Reel {
  const author: User = {
    id: r?.author?.id || 'user_me',
    name: r?.author?.name || 'Muhammad Sharif',
    username: r?.author?.username || '@muhammad_sharif',
    phone: r?.author?.phone || '+92 300 1234567',
    avatar: r?.author?.avatar || DEMO_USERS[0].avatar,
    bio: r?.author?.bio || 'Pulse VIP Creator ✨',
    coins: typeof r?.author?.coins === 'number' ? r.author.coins : 50000,
    diamonds: typeof r?.author?.diamonds === 'number' ? r.author.diamonds : 10000,
    level: typeof r?.author?.level === 'number' ? r.author.level : 30,
    vipTier: r?.author?.vipTier || 'Crown',
    country: r?.author?.country || 'Pakistan',
    flag: r?.author?.flag || '🇵🇰',
  };

  let video = r?.videoUrl;
  let thumb = r?.thumbnail;
  if (!video || typeof video !== 'string' || video.trim() === '') {
    video = FALLBACK_REEL_VIDEOS[i % FALLBACK_REEL_VIDEOS.length];
  }
  if (!thumb || typeof thumb !== 'string' || thumb.trim() === '' || thumb.endsWith('.mp4')) {
    thumb = FALLBACK_THUMBNAILS[i % FALLBACK_THUMBNAILS.length];
  }

  return {
    id: r?.id || `reel_${Date.now()}_${i}`,
    author,
    videoUrl: video,
    thumbnail: thumb,
    title: r?.title || 'Trending video on Pulse VIP 🎵🔥',
    tags: Array.isArray(r?.tags) && r.tags.length > 0 ? r.tags : ['#PulseVIP', '#Trending', '#Viral'],
    musicTitle: r?.musicTitle || 'Original Audio',
    likesCount: typeof r?.likesCount === 'number' ? r.likesCount : 1200 + i * 500,
    isLiked: !!r?.isLiked,
    commentsCount: typeof r?.commentsCount === 'number' ? r.commentsCount : (Array.isArray(r?.comments) ? r.comments.length : 12),
    sharesCount: typeof r?.sharesCount === 'number' ? r.sharesCount : 45 + i * 10,
    comments: Array.isArray(r?.comments) ? r.comments : [],
  };
}

export function getStoredReels(): Reel[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_REELS) || localStorage.getItem('mehfil_reels');
    if (data) {
      const parsed: unknown = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out broken test records
        const valid = parsed.filter((r) => r && r.id && r.id !== 'test_1');
        if (valid.length > 0) {
          return valid.map((r, i) => sanitizeReel(r, i));
        }
      }
    }
  } catch (e) {
    console.error('Storage error reading reels', e);
  }
  return INITIAL_REELS.map((r, i) => sanitizeReel(r, i));
}

export function saveStoredReels(reels: Reel[]) {
  try {
    const safeReels = reels
      .filter((r) => r && r.id && r.id !== 'test_1')
      .map((r, i) => sanitizeReel(r, i));

    try {
      localStorage.setItem(STORAGE_KEY_REELS, JSON.stringify(safeReels));
    } catch (quotaError) {
      console.warn('LocalStorage quota reached, pruning bulky data URLs to protect storage', quotaError);
      const lightweight = safeReels.map((r) => {
        let video = r.videoUrl;
        let thumb = r.thumbnail;
        if (video && video.startsWith('data:video') && video.length > 800000) {
          video = FALLBACK_REEL_VIDEOS[0];
        }
        return { ...r, videoUrl: video, thumbnail: thumb };
      });
      try {
        localStorage.setItem(STORAGE_KEY_REELS, JSON.stringify(lightweight.slice(0, 20)));
      } catch (err2) {
        console.error('Secondary storage error', err2);
      }
    }
  } catch (e) {
    console.error('Failed to save reels', e);
  }
}

export function getStoredChats(): Record<string, ChatMessage[]> {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CHATS) || localStorage.getItem('mehfil_chats');
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Storage error', e);
  }
  return INITIAL_CHATS;
}

export function saveStoredChats(chats: Record<string, ChatMessage[]>) {
  try {
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));
  } catch (e) {
    console.error('Storage error', e);
  }
}
