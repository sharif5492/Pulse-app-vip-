import React, { useState } from 'react';
import { VoiceRoom, User, getRoomMaxSeats } from '../../types';
import { Radio, Plus, Users, Lock, Sparkles, Crown, Flame } from 'lucide-react';

interface PartyRoomsListProps {
  rooms: VoiceRoom[];
  currentUser: User;
  onJoinRoom: (room: VoiceRoom) => void;
  onOpenCreateModal: () => void;
}

const CATEGORIES = ['All', 'Pulse VIP', 'Singing', 'DJ Club', 'Gaming', 'ChitChat'];

export const PartyRoomsList: React.FC<PartyRoomsListProps> = ({
  rooms,
  currentUser,
  onJoinRoom,
  onOpenCreateModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredRooms = rooms.filter(
    (r) => selectedCategory === 'All' || r.category === selectedCategory
  );

  return (
    <div className="flex-1 w-full h-full bg-[#090314] text-white px-3 py-3 max-w-md mx-auto overflow-y-auto no-scrollbar overflow-x-hidden">
      {/* Header banner */}
      <div className="relative rounded-2xl p-3.5 mb-3.5 bg-gradient-to-r from-purple-900/60 via-pink-900/40 to-amber-900/40 border border-purple-700/40 overflow-hidden shadow-xl w-full">
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
              <Sparkles className="w-3 h-3 shrink-0" /> 6, 12 & 20 Seat Arenas
            </div>
            <h2 className="text-base sm:text-lg font-black text-white font-heading truncate">
              Pulse VIP Lounges
            </h2>
            <p className="text-[11px] text-purple-200 mt-0.5 line-clamp-2">
              Dynamic 6, 12 & 20 seat duo arenas! Voice party & live audio.
            </p>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white font-black text-[11px] shadow-lg hover:scale-105 active:scale-95 transition shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-pink-500 to-amber-500 text-white shadow-md'
                : 'bg-purple-950/60 text-purple-300 hover:bg-purple-900/60 border border-purple-900/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Rooms Grid */}
      <div className="space-y-3.5 pb-6">
        {filteredRooms.map((room) => {
          const roomLevel = room.level || 1;
          const maxSeats = getRoomMaxSeats(roomLevel);
          const seatedCount = room.seats.filter((s) => s.user !== null).length;
          const savedDp = typeof window !== 'undefined' ? localStorage.getItem(`room_dp_${room.id}`) : null;
          const savedTitle = typeof window !== 'undefined' ? localStorage.getItem(`room_title_${room.id}`) : null;
          const displayDp = savedDp || room.coverImage || room.host.avatar;
          const displayTitle = savedTitle || room.title;

          return (
            <div
              key={room.id}
              onClick={() => onJoinRoom(room)}
              className="p-3.5 rounded-2xl bg-[#140827] border border-purple-900/50 hover:border-pink-500/50 transition cursor-pointer group shadow-xl hover:shadow-purple-900/20 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 mb-2.5">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <img
                      src={displayDp}
                      alt={displayTitle}
                      className="w-11 h-11 rounded-xl object-cover border-2 border-amber-400 shadow-md group-hover:scale-105 transition"
                    />
                    <div className="absolute -bottom-1 -right-1 p-0.5 bg-amber-500 rounded-full">
                      <Crown className="w-2.5 h-2.5 text-white fill-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-white group-hover:text-pink-300 transition flex items-center gap-1 font-heading truncate">
                      <span className="truncate">{displayTitle}</span>
                      {room.isLocked && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-amber-400 font-semibold truncate max-w-[110px]">
                        {room.host.name}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border flex items-center gap-1 shrink-0 ${
                        roomLevel >= 30
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                          : roomLevel >= 10
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                          : 'bg-purple-900/60 text-purple-200 border-purple-700/50'
                      }`}>
                        <Radio className="w-2.5 h-2.5" />
                        Lv.{roomLevel} • {maxSeats} Seats
                      </span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 font-medium shrink-0">
                        {room.wallpaper === 'lion'
                          ? '🦁 Lion'
                          : room.wallpaper === 'castle'
                          ? '🏰 Castle'
                          : room.wallpaper === 'arena'
                          ? '🏟️ Arena'
                          : room.wallpaper === 'love'
                          ? '💖 Love'
                          : room.wallpaper === 'fight'
                          ? '🥊 Fight'
                          : '💜 Room'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-[11px] font-bold shrink-0">
                  <Flame className="w-3 h-3 text-pink-400" />
                  <span>{room.listenersCount}</span>
                </div>
              </div>

              {/* Seated Avatars preview & Join Button */}
              <div className="flex items-center justify-between pt-2 border-t border-purple-900/40 gap-2 w-full">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <div className="flex -space-x-1.5 shrink-0">
                    {room.seats
                      .filter((s) => s.user !== null)
                      .slice(0, 3)
                      .map((s, idx) => (
                        <img
                          key={idx}
                          src={s.user!.avatar}
                          alt="seat"
                          className="w-6 h-6 rounded-full object-cover border border-[#140827]"
                        />
                      ))}
                  </div>
                  <div className="text-[10px] text-purple-200 font-semibold truncate">
                    {seatedCount}/{maxSeats} Seats
                  </div>
                </div>

                <button className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs shadow-md shrink-0 active:scale-95 transition">
                  Join Room
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
