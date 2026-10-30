import React from 'react';
import { Film, Radio, PlusCircle, MessageCircle, User as UserIcon, Flame } from 'lucide-react';

export type NavTab = 'reels' | 'party' | 'camera' | 'live' | 'chat' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  unreadCount = 2,
}) => {
  return (
    <nav className="w-full h-14 bg-[#10051e]/98 border-t border-purple-950/80 backdrop-blur-lg shrink-0 flex items-center justify-around px-2 z-30 select-none">
      {/* 1. Reels */}
      <button
        onClick={() => onChangeTab('reels')}
        className={`flex flex-col items-center gap-1 transition ${
          activeTab === 'reels' ? 'text-pink-500 scale-105' : 'text-purple-300/70 hover:text-white'
        }`}
      >
        <Film className="w-5 h-5" />
        <span className="text-[10px] font-bold">Reels</span>
      </button>

      {/* 2. Party Rooms (Yalla Ludo) */}
      <button
        onClick={() => onChangeTab('party')}
        className={`flex flex-col items-center gap-1 transition relative ${
          activeTab === 'party' ? 'text-amber-400 scale-105' : 'text-purple-300/70 hover:text-white'
        }`}
      >
        <Radio className="w-5 h-5" />
        <span className="text-[10px] font-bold">Party Room</span>
        <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
      </button>

      {/* 3. Center Camera Creator (+) */}
      <button
        onClick={() => onChangeTab('camera')}
        className="relative -top-2 flex flex-col items-center group active:scale-95 transition"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-amber-400 p-0.5 shadow-lg shadow-pink-500/40">
          <div className="w-full h-full bg-[#16072b] rounded-[14px] flex items-center justify-center group-hover:bg-transparent transition">
            <PlusCircle className="w-6 h-6 text-white" />
          </div>
        </div>
      </button>

      {/* 4. Live Streams */}
      <button
        onClick={() => onChangeTab('live')}
        className={`flex flex-col items-center gap-1 transition ${
          activeTab === 'live' ? 'text-red-500 scale-105' : 'text-purple-300/70 hover:text-white'
        }`}
      >
        <Flame className="w-5 h-5" />
        <span className="text-[10px] font-bold">Live</span>
      </button>

      {/* 5. Messages */}
      <button
        onClick={() => onChangeTab('chat')}
        className={`flex flex-col items-center gap-1 transition relative ${
          activeTab === 'chat' ? 'text-pink-500 scale-105' : 'text-purple-300/70 hover:text-white'
        }`}
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1.5 px-1 py-0.2 rounded-full bg-pink-600 text-white text-[9px] font-black">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold">Chat</span>
      </button>

      {/* 6. Profile */}
      <button
        onClick={() => onChangeTab('profile')}
        className={`flex flex-col items-center gap-1 transition ${
          activeTab === 'profile' ? 'text-amber-400 scale-105' : 'text-purple-300/70 hover:text-white'
        }`}
      >
        <UserIcon className="w-5 h-5" />
        <span className="text-[10px] font-bold">Me</span>
      </button>
    </nav>
  );
};
