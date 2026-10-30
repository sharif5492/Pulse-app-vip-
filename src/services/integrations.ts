/**
 * Cloud Integrations Service: Supabase, Agora RTC & OneSignal Push Notifications
 * Safely accesses client-side public identifiers while keeping secret keys on server.
 */

export interface IntegrationStatus {
  supabase: {
    isConfigured: boolean;
    url: string;
    hasAnonKey: boolean;
  };
  agora: {
    isConfigured: boolean;
    appId: string;
  };
  onesignal: {
    isConfigured: boolean;
    appId: string;
  };
}

export const getIntegrationStatus = (): IntegrationStatus => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hipwlfpfelznmvojhbin.supabase.co';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4YygtN0l1BAmcqzqCiBjBA_TghajriE';
  const agoraAppId = import.meta.env.VITE_AGORA_APP_ID || 'e28d29dbdf2f46718ba508b883885690';
  const oneSignalAppId = import.meta.env.VITE_ONESIGNAL_APP_ID || '';

  return {
    supabase: {
      isConfigured: Boolean(supabaseUrl && supabaseUrl.startsWith('https://') && supabaseKey),
      url: supabaseUrl ? 'https://hipwlfpfelznmvojhbin.supabase.co' : '',
      hasAnonKey: Boolean(supabaseKey),
    },
    agora: {
      isConfigured: Boolean(agoraAppId && agoraAppId.length > 10),
      appId: agoraAppId ? `${agoraAppId.slice(0, 4)}****${agoraAppId.slice(-4)}` : '',
    },
    onesignal: {
      isConfigured: true,
      appId: oneSignalAppId ? `${oneSignalAppId.slice(0, 4)}****${oneSignalAppId.slice(-4)}` : 'In-App Ready',
    },
  };
};

export const ENV_TEMPLATE = `# =========================================================================
# PULSE SOCIAL & VOICE PARTY ROOMS - PRODUCTION ENVIRONMENT KEYS (.env)
# =========================================================================

# --- 1. SUPABASE (CLOUD POSTGRESQL & AUTH) ---
VITE_SUPABASE_URL="https://hipwlfpfelznmvojhbin.supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable_4YygtN0l1BAmcqzqCiBjBA_TghajriE"
SUPABASE_URL="https://hipwlfpfelznmvojhbin.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_4YygtN0l1BAmcqzqCiBjBA_TghajriE"

# --- 2. AGORA RTC (VOICE PARTY ROOMS & HD CALLING ENGINE) ---
VITE_AGORA_APP_ID="e28d29dbdf2f46718ba508b883885690"

PORT=3000
APP_URL="http://localhost:3000"
`;

export const SUPABASE_SCHEMA_SQL = `-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL,
  phone TEXT,
  country TEXT DEFAULT 'Pakistan',
  flag TEXT DEFAULT '🇵🇰',
  avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  bio TEXT DEFAULT 'Vibing on Pulse VIP ✨',
  coins BIGINT DEFAULT 15000,
  diamonds BIGINT DEFAULT 2500,
  level INT DEFAULT 1,
  vip_tier TEXT DEFAULT 'Crown',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. VOICE PARTY ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  host_id TEXT,
  host_name TEXT,
  host_avatar TEXT,
  category TEXT DEFAULT 'Pulse VIP',
  max_seats INT DEFAULT 12,
  seats JSONB DEFAULT '[]'::jsonb,
  listeners_count INT DEFAULT 1,
  is_locked BOOLEAN DEFAULT false,
  theme TEXT DEFAULT 'royal_gold',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  friend_id TEXT NOT NULL,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. REELS TABLE
CREATE TABLE IF NOT EXISTS public.reels (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  video_url TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  caption TEXT DEFAULT '',
  music_title TEXT DEFAULT 'Original Sound - Pulse Music',
  likes INT DEFAULT 0,
  shares INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access for profiles" ON public.profiles;
CREATE POLICY "Public access for profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for rooms" ON public.rooms;
CREATE POLICY "Public access for rooms" ON public.rooms FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for messages" ON public.messages;
CREATE POLICY "Public access for messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for reels" ON public.reels;
CREATE POLICY "Public access for reels" ON public.reels FOR ALL USING (true) WITH CHECK (true);
`;
