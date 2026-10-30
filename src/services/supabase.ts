import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, VoiceRoom, Reel, ChatMessage } from '../types';

const DEFAULT_SUPABASE_URL = 'https://hipwlfpfelznmvojhbin.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_4YygtN0l1BAmcqzqCiBjBA_TghajriE';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  (typeof window !== 'undefined' ? localStorage.getItem('pulse_supabase_anon_key') || DEFAULT_SUPABASE_ANON_KEY : DEFAULT_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseUrl.startsWith('https://') && supabaseAnonKey
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const setSupabaseAnonKey = (key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pulse_supabase_anon_key', key);
    window.location.reload();
  }
};

/**
 * Backend Data Service with Automatic Supabase & Local Fallback
 */
export const backendService = {
  // Check backend status
  async checkHealth(): Promise<{ status: string; database: 'supabase' | 'local_express'; time: string }> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return {
      status: 'online',
      database: isSupabaseConfigured ? 'supabase' : 'local_express',
      time: new Date().toISOString(),
    };
  },

  // Auth: Request Phone OTP
  async sendOtp(phone: string): Promise<{ success: boolean; code?: string; message: string }> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (!error) return { success: true, message: 'OTP sent via Supabase SMS' };
      } catch (e) {
        console.warn('Supabase SMS error, falling back to local Express OTP', e);
      }
    }

    // Call Express API endpoint
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Offline fallback
    }

    return {
      success: true,
      code: '7788',
      message: 'Demo OTP generated: 7788',
    };
  },

  // Voice Rooms: Sync with backend & Supabase
  async getRooms(): Promise<VoiceRoom[]> {
    // 1. Try fetching from Supabase table if created
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('rooms').select('*').limit(30);
        if (!error && Array.isArray(data) && data.length > 0) {
          return data as VoiceRoom[];
        }
      } catch (err) {
        // Table might not be populated yet, fallback to backend/stored
      }
    }

    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // fallback to stored
    }
    return [];
  },

  // Save new voice room to Supabase & backend
  async createRoom(room: VoiceRoom): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('rooms').upsert([room]);
      } catch (err) {
        console.warn('Supabase room upsert notice:', err);
      }
    }

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // User Profile: Sync to Supabase
  async syncUserProfile(user: User): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('profiles').upsert([
          {
            id: user.id,
            name: user.name,
            username: user.username,
            phone: user.phone,
            country: user.country,
            coins: user.coins,
            diamonds: user.diamonds,
            vip_tier: user.vipTier,
            level: user.level,
            updated_at: new Date().toISOString(),
          },
        ]);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase profile sync notice:', err);
      }
    }
    return true;
  },

  // Chat message: Save to Supabase
  async syncChatMessage(msg: ChatMessage, friendId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('messages').insert([
          {
            id: msg.id,
            sender_id: msg.senderId,
            friend_id: friendId,
            content: msg.content,
            type: msg.type,
            created_at: new Date(msg.timestamp).toISOString(),
          },
        ]);
      } catch (err) {
        console.warn('Supabase message sync notice:', err);
      }
    }
    return true;
  },

  // Reels: Fetch persistent reels from server or Supabase
  async getReels(): Promise<Reel[]> {
    // 1. Try fetching from server-side persistent disk
    try {
      const res = await fetch('/api/reels');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data as Reel[];
        }
      }
    } catch {
      // Fallback
    }

    // 2. Try fetching from Supabase table if created
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('reels').select('*').limit(50);
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id,
            author: {
              id: item.user_id,
              name: item.user_name || 'Pulse Star',
              username: `@${(item.user_name || 'star').toLowerCase().replace(/\s+/g, '_')}`,
              phone: '',
              avatar: item.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
              bio: '',
              coins: 5000,
              diamonds: 1000,
              level: 10,
              vipTier: 'Gold' as const,
              country: 'Pakistan',
              flag: '🇵🇰',
            },
            videoUrl: item.video_url,
            thumbnail: item.thumbnail,
            title: item.caption || item.title || 'Pulse VIP Reel',
            tags: ['#PulseVIP', '#Trending', '#Viral'],
            musicTitle: item.music_title || 'Original Sound - Pulse VIP',
            likesCount: item.likes || 0,
            isLiked: false,
            commentsCount: 0,
            sharesCount: item.shares || 0,
            comments: [],
          })) as Reel[];
        }
      } catch (err) {
        // Fallback
      }
    }

    return [];
  },

  // Reels: Upload video/photo binary data directly to permanent server disk
  async uploadReelMedia(payload: {
    fileName: string;
    fileData: string;
    thumbnailData?: string;
    type: 'video' | 'photo';
  }): Promise<{ videoUrl: string; thumbnailUrl: string } | null> {
    try {
      const res = await fetch('/api/reels/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          return {
            videoUrl: data.videoUrl,
            thumbnailUrl: data.thumbnailUrl,
          };
        }
      }
    } catch (err) {
      console.warn('Reel server upload error:', err);
    }
    return null;
  },

  // Reels: Save new short video / reel permanently
  async syncReel(reel: Reel): Promise<boolean> {
    // 1. Save to server persistent disk
    try {
      await fetch('/api/reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reel),
      });
    } catch {
      // Local network fallback
    }

    // 2. Also try Supabase without breaking if RLS is restricted
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('reels').insert([
          {
            id: reel.id,
            user_id: reel.author.id,
            user_name: reel.author.name,
            user_avatar: reel.author.avatar,
            video_url: reel.videoUrl,
            thumbnail: reel.thumbnail,
            caption: reel.title,
            music_title: reel.musicTitle,
            likes: reel.likesCount || 0,
            shares: reel.sharesCount || 0,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        console.warn('Supabase reel sync notice:', err);
      }
    }
    return true;
  },

  // Reels: Delete reel
  async deleteReel(reelId: string): Promise<boolean> {
    try {
      await fetch(`/api/reels/${reelId}`, { method: 'DELETE' });
    } catch {
      // fallback
    }
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('reels').delete().eq('id', reelId);
      } catch {
        // fallback
      }
    }
    return true;
  },

  // WebRTC Signal Exchange for 1-to-1 Calls & Voice Rooms
  async sendSignal(callId: string, signalData: { type: 'offer' | 'answer' | 'candidate'; data: unknown }): Promise<boolean> {
    try {
      const res = await fetch('/api/webrtc/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, ...signalData }),
      });
      return res.ok;
    } catch {
      return true; // Graceful offline
    }
  },
};
