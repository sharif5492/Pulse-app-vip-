import React, { useState } from 'react';
import { User, ChatMessage } from '../../types';
import { DEMO_USERS } from '../../services/storage';
import { Search, MessageSquare, Phone, Video, Plus } from 'lucide-react';

interface ChatListProps {
  currentUser: User;
  chats: Record<string, ChatMessage[]>;
  onSelectFriend: (friend: User) => void;
  onStartCall: (friend: User, type: 'audio' | 'video') => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  currentUser,
  chats,
  onSelectFriend,
  onStartCall,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Friends excluding current user
  const friends = DEMO_USERS.filter((u) => u.id !== currentUser.id).filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 w-full h-full bg-[#090314] text-white p-3.5 sm:p-4 max-w-md mx-auto overflow-y-auto no-scrollbar overflow-x-hidden">
      {/* Title & Search */}
      <div className="mb-4">
        <h2 className="text-xl font-bold font-heading mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-pink-500" /> Messages & Friends
        </h2>

        <div className="relative">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends or username..."
            className="w-full bg-[#140827] border border-purple-900/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* Online Friends Story Bubbles */}
      <div className="mb-5">
        <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block mb-2">
          Active Now
        </span>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {DEMO_USERS.filter((u) => u.id !== currentUser.id).map((friend) => (
            <button
              key={friend.id}
              onClick={() => onSelectFriend(friend)}
              className="flex flex-col items-center gap-1 shrink-0 group"
            >
              <div className="relative">
                <div className="w-13 h-13 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 via-purple-600 to-amber-400">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-full h-full rounded-full object-cover border-2 border-[#090314]"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#090314]" />
              </div>
              <span className="text-[10px] text-purple-200 truncate max-w-[60px]">
                {friend.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Threads List */}
      <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
        <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
          Recent Chats
        </span>

        {friends.map((friend) => {
          const threadMessages = chats[friend.id] || [];
          const lastMsg = threadMessages[threadMessages.length - 1];

          return (
            <div
              key={friend.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#140827] border border-purple-900/40 hover:border-purple-700/60 transition group cursor-pointer"
              onClick={() => onSelectFriend(friend)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-11 h-11 rounded-full object-cover border border-purple-500/50"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#140827]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white group-hover:text-pink-300 transition">
                      {friend.name}
                    </span>
                    {friend.vipTier === 'Crown' && <span className="text-xs">👑</span>}
                  </div>
                  <p className="text-[11px] text-purple-300 truncate max-w-[170px] mt-0.5">
                    {lastMsg
                      ? lastMsg.type === 'voice'
                        ? '🎤 Voice note'
                        : lastMsg.type === 'image'
                        ? '📷 Photo'
                        : lastMsg.content
                      : friend.bio}
                  </p>
                </div>
              </div>

              {/* Direct call buttons */}
              <div
                className="flex items-center gap-1 text-purple-400"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onStartCall(friend, 'audio')}
                  className="p-2 rounded-full hover:bg-purple-900/60 hover:text-emerald-400 transition"
                  title="Audio Call"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onStartCall(friend, 'video')}
                  className="p-2 rounded-full hover:bg-purple-900/60 hover:text-pink-400 transition"
                  title="Video Call"
                >
                  <Video className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
