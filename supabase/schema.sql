-- ============================================================================
-- PULSE LIVE & VIP PARTY ROOMS - SUPABASE COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Run this entire script in Supabase Dashboard -> "SQL Editor" -> "Run"
-- It creates all required tables and enables public access policies for anon key.

-- 1. PROFILES TABLE (User Accounts, VIP Tiers, Coins & Levels)
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

-- 2. VOICE PARTY ROOMS TABLE (6, 12, 20 Seats Duo VIP Pods)
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  host_id TEXT,
  host_name TEXT,
  host_avatar TEXT,
  category TEXT DEFAULT 'Mehfil',
  max_seats INT DEFAULT 12,
  seats JSONB DEFAULT '[]'::jsonb,
  listeners_count INT DEFAULT 1,
  is_locked BOOLEAN DEFAULT false,
  theme TEXT DEFAULT 'royal_gold',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CHAT MESSAGES TABLE (1-to-1 DMs & Room Messages)
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  friend_id TEXT NOT NULL,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. REELS (SHORT VIDEOS) TABLE
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

-- 5. GIFT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.gifts (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_id TEXT,
  room_id TEXT,
  gift_name TEXT NOT NULL,
  coins BIGINT NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures anon key (sb_publishable_...) can read and write without permission errors
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access for profiles" ON public.profiles;
CREATE POLICY "Public access for profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for rooms" ON public.rooms;
CREATE POLICY "Public access for rooms" ON public.rooms FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for messages" ON public.messages;
CREATE POLICY "Public access for messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for reels" ON public.reels;
CREATE POLICY "Public access for reels" ON public.reels FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for gifts" ON public.gifts;
CREATE POLICY "Public access for gifts" ON public.gifts FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- INITIAL SEED DATA (Demo VIP Users & Sample Party Room)
-- ============================================================================

INSERT INTO public.profiles (id, name, username, phone, country, flag, coins, diamonds, vip_tier, level)
VALUES
  ('user_me', 'Muhammad Sharif', '@sharif_vip', '+92 300 1234567', 'Pakistan', '🇵🇰', 25000, 5000, 'Crown', 10),
  ('user_1', 'Ayesha Malik', '@ayesha_live', '+92 301 9876543', 'Pakistan', '🇵🇰', 12000, 1800, 'Diamond', 8),
  ('user_2', 'Hamza Khan', '@hamza_king', '+92 302 5551234', 'Pakistan', '🇵🇰', 8500, 950, 'Gold', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rooms (id, title, host_id, host_name, category, max_seats, listeners_count, theme)
VALUES
  ('room_1', '🔥 VIP Mehfil & Late Night Chai', 'user_me', 'Muhammad Sharif', 'ChitChat', 12, 14, 'royal_gold'),
  ('room_2', '🎤 Coke Studio & Ghazal Jam', 'user_1', 'Ayesha Malik', 'Singing', 6, 8, 'cyber_neon')
ON CONFLICT (id) DO NOTHING;
