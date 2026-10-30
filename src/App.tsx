import React, { useState, useEffect } from 'react';
import {
  User,
  VoiceRoom,
  Reel,
  LiveStream,
  ChatMessage,
  ActiveCall,
  GiftItem,
} from './types';
import {
  getStoredUser,
  saveStoredUser,
  getStoredRooms,
  saveStoredRooms,
  getStoredReels,
  saveStoredReels,
  sanitizeReel,
  getStoredChats,
  saveStoredChats,
  INITIAL_LIVES,
  DEMO_USERS,
} from './services/storage';
import { Header } from './components/common/Header';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';
import { AuthModal } from './components/auth/AuthModal';
import { ReelsFeed } from './components/reels/ReelsFeed';
import { PartyRoomsList } from './components/party/PartyRoomsList';
import { VoiceRoomView } from './components/party/VoiceRoomView';
import { CreateRoomModal } from './components/party/CreateRoomModal';
import { ChatList } from './components/chat/ChatList';
import { ChatConversation } from './components/chat/ChatConversation';
import { CallScreen } from './components/calls/CallScreen';
import { LiveStreamView } from './components/live/LiveStreamView';
import { GoLiveModal } from './components/live/GoLiveModal';
import { CameraCreator } from './components/camera/CameraCreator';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsScreen } from './components/profile/SettingsScreen';
import { SplashScreen } from './components/common/SplashScreen';
import { backendService } from './services/supabase';
import { Radio, Flame, Sparkles } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(getStoredUser);
  const [rooms, setRooms] = useState<VoiceRoom[]>(getStoredRooms);
  const [reels, setReels] = useState<Reel[]>(getStoredReels);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(getStoredChats);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>(INITIAL_LIVES);

  // Animated Splash Screen
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  // Settings Screen
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<NavTab>('reels');
  const [activeVoiceRoom, setActiveVoiceRoom] = useState<VoiceRoom | null>(null);
  const [activeLiveStream, setActiveLiveStream] = useState<LiveStream | null>(null);
  const [activeChatFriend, setActiveChatFriend] = useState<User | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [isGoLiveModalOpen, setIsGoLiveModalOpen] = useState(false);
  const [isCameraCreatorOpen, setIsCameraCreatorOpen] = useState(false);

  // Auto clean-up bad cached test items in localStorage on boot
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pulse_vip_reels');
      if (raw && (raw.includes('"id":"test_1"') || raw.includes('test_1'))) {
        localStorage.removeItem('pulse_vip_reels');
        setReels(getStoredReels());
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch persisted reels from server disk and remote store on startup
  useEffect(() => {
    backendService.getReels().then((remoteReels) => {
      if (remoteReels && remoteReels.length > 0) {
        setReels((current) => {
          const currentIds = new Set(current.map((r) => r.id));
          const cleanRemote = remoteReels
            .filter((r) => r && r.id && r.id !== 'test_1')
            .map((r, i) => sanitizeReel(r, i));
          const newItems = cleanRemote.filter((r) => !currentIds.has(r.id));
          if (newItems.length > 0) {
            const merged = [...newItems, ...current];
            saveStoredReels(merged);
            return merged;
          }
          return current;
        });
      }
    }).catch(console.error);
  }, []);

  // Sync state changes to storage & Supabase
  const handleUpdateUser = (updated: User) => {
    setCurrentUser(updated);
    saveStoredUser(updated);
    backendService.syncUserProfile(updated);
  };

  const handleUpdateRooms = (updatedRooms: VoiceRoom[]) => {
    setRooms(updatedRooms);
    saveStoredRooms(updatedRooms);
    if (updatedRooms.length > 0) {
      backendService.createRoom(updatedRooms[0]);
    }
  };

  const handleUpdateReels = (updatedReels: Reel[]) => {
    setReels(updatedReels);
    saveStoredReels(updatedReels);
  };

  const handleUpdateChats = (updatedChats: Record<string, ChatMessage[]>) => {
    setChats(updatedChats);
    saveStoredChats(updatedChats);
  };

  // Wallet Coins Operations
  const handleModifyCoins = (amount: number) => {
    const nextCoins = Math.max(0, currentUser.coins + amount);
    handleUpdateUser({
      ...currentUser,
      coins: nextCoins,
    });
  };

  // Start outgoing call
  const handleStartCall = (friend: User, type: 'audio' | 'video') => {
    setActiveCall({
      id: `call_${Date.now()}`,
      remoteUser: friend,
      type,
      direction: 'outgoing',
      duration: 0,
      isMuted: false,
      isSpeakerOn: true,
    });

    // Simulate friend answering after 3.5 seconds
    setTimeout(() => {
      setActiveCall((prev) => {
        if (!prev || prev.direction !== 'outgoing') return prev;
        return {
          ...prev,
          direction: 'connected',
        };
      });
    }, 3500);
  };

  const handleAcceptIncomingCall = () => {
    if (!activeCall) return;
    setActiveCall({
      ...activeCall,
      direction: 'connected',
    });
  };

  const handleEndCall = () => {
    setActiveCall(null);
  };

  // Chat message send
  const handleSendMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (!activeChatFriend) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      ...msg,
      id: `m_${Date.now()}`,
      timestamp: timeStr,
    };

    const currentFriendMsgs = chats[activeChatFriend.id] || [];
    const updatedChats = {
      ...chats,
      [activeChatFriend.id]: [...currentFriendMsgs, newMsg],
    };

    handleUpdateChats(updatedChats);

    // Auto simulated reply from friend after 2 seconds
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `m_rep_${Date.now()}`,
        senderId: activeChatFriend.id,
        receiverId: currentUser.id,
        type: 'text',
        content: `Loved that! Let's talk in the voice room or jump on a call 💕`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered',
      };
      setChats((prev) => {
        const friendMsgs = prev[activeChatFriend.id] || [];
        const next = {
          ...prev,
          [activeChatFriend.id]: [...friendMsgs, replyMsg],
        };
        saveStoredChats(next);
        return next;
      });
    }, 2000);
  };

  // Send Gift to Reel Author
  const handleSendGiftToAuthor = (author: User, gift: GiftItem, quantity: number) => {
    const totalCost = gift.coins * quantity;
    handleModifyCoins(-totalCost);
  };

  // Create new Voice Room
  const handleCreateRoom = (newRoom: VoiceRoom) => {
    const updated = [newRoom, ...rooms];
    handleUpdateRooms(updated);
    setActiveVoiceRoom(newRoom);
  };

  // Launch Live Stream
  const handleStartLive = (newStream: LiveStream) => {
    setLiveStreams([newStream, ...liveStreams]);
    setActiveLiveStream(newStream);
  };

  // Publish new Reel from Camera or Phone Gallery
  const handlePublishReel = (newReel: Reel) => {
    const updated = [newReel, ...reels];
    handleUpdateReels(updated);
    backendService.syncReel(newReel);
    setActiveTab('reels');
  };

  return (
    <div className="fixed inset-0 bg-[#08020f] text-white flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Maximum Mobile App Container Frame */}
      <div className="w-full max-w-md h-full flex flex-col bg-[#08020f] relative shadow-2xl overflow-hidden">
        {/* PWA Install Banner & Offline Alert */}
        <PWAInstallBanner />

        {/* Header (hidden inside voice room or live viewer for full immersion) */}
        {!activeVoiceRoom && !activeLiveStream && !activeCall && !activeChatFriend && !isSettingsOpen && (
          <Header
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onGoLiveClick={() => setIsGoLiveModalOpen(true)}
          />
        )}

        {/* Main Body Routing */}
        <main className="flex-1 min-h-0 w-full relative flex flex-col overflow-hidden">
          {/* 1. Inside 10-20 Seat Voice Room */}
          {activeVoiceRoom ? (
            <VoiceRoomView
              room={activeVoiceRoom}
              currentUser={currentUser}
              onLeaveRoom={() => setActiveVoiceRoom(null)}
              onUpdateRoom={(updated) => {
                setActiveVoiceRoom(updated);
                handleUpdateRooms(
                  rooms.map((r) => (r.id === updated.id ? updated : r))
                );
              }}
              onSendCoinsReward={(amt) => handleModifyCoins(amt)}
            />
          ) : activeLiveStream ? (
            /* 2. Inside Live Stream */
            <LiveStreamView
              stream={activeLiveStream}
              currentUser={currentUser}
              onClose={() => setActiveLiveStream(null)}
              onSendCoinsReward={(amt) => handleModifyCoins(amt)}
            />
          ) : activeChatFriend ? (
            /* 3. Inside 1-on-1 Chat Conversation */
            <ChatConversation
              friend={activeChatFriend}
              currentUser={currentUser}
              messages={chats[activeChatFriend.id] || []}
              onSendMessage={handleSendMessage}
              onBack={() => setActiveChatFriend(null)}
              onStartCall={(type) => handleStartCall(activeChatFriend, type)}
            />
          ) : isSettingsOpen ? (
            /* 4. Inside User Settings & Preferences Screen */
            <SettingsScreen
              currentUser={currentUser}
              onBack={() => setIsSettingsOpen(false)}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onSwitchUser={(user) => {
                handleUpdateUser(user);
              }}
              onLogout={() => {
                setIsSettingsOpen(false);
                setIsAuthModalOpen(true);
              }}
              onReplayIntro={() => setShowSplashScreen(true)}
              onUpdateUser={handleUpdateUser}
            />
          ) : (
            /* 5. Tab Based Views */
            <>
              {activeTab === 'reels' && (
                <ReelsFeed
                  reels={reels}
                  currentUser={currentUser}
                  onUpdateReels={handleUpdateReels}
                  onSendGiftToAuthor={handleSendGiftToAuthor}
                  onOpenUpload={() => setActiveTab('camera')}
                />
              )}

              {activeTab === 'party' && (
                <PartyRoomsList
                  rooms={rooms}
                  currentUser={currentUser}
                  onJoinRoom={(room) => setActiveVoiceRoom(room)}
                  onOpenCreateModal={() => setIsCreateRoomModalOpen(true)}
                />
              )}

              {activeTab === 'camera' && (
                <CameraCreator
                  currentUser={currentUser}
                  onClose={() => setActiveTab('reels')}
                  onPublishReel={handlePublishReel}
                />
              )}

              {activeTab === 'live' && (
                /* Live Streaming Explorer */
                <div className="flex-1 w-full h-full p-3 sm:p-4 overflow-y-auto no-scrollbar overflow-x-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                        <Flame className="w-5 h-5 text-red-500" /> Live Streams
                      </h2>
                      <p className="text-xs text-purple-300">
                        Join PK Battles, send gifts & chat live
                      </p>
                    </div>
                    <button
                      onClick={() => setIsGoLiveModalOpen(true)}
                      className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-xs shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 transition flex items-center gap-1.5"
                    >
                      <Radio className="w-4 h-4 animate-pulse" /> Go Live
                    </button>
                  </div>

                  {/* Live Streams Grid */}
                  <div className="grid grid-cols-2 gap-3 pb-6">
                    {liveStreams.map((stream) => (
                      <div
                        key={stream.id}
                        onClick={() => setActiveLiveStream(stream)}
                        className="relative aspect-3/4 rounded-2xl overflow-hidden bg-purple-950/60 border border-purple-800/40 cursor-pointer group shadow-xl hover:border-pink-500 transition"
                      >
                        <img
                          src={stream.previewUrl}
                          alt={stream.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 p-2.5 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase flex items-center gap-1 animate-pulse">
                              LIVE
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold">
                              👁️ {stream.viewerCount}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <img
                                src={stream.streamer.avatar}
                                alt="avatar"
                                className="w-5 h-5 rounded-full object-cover border border-amber-400"
                              />
                              <span className="text-xs font-bold text-white truncate">
                                {stream.streamer.name}
                              </span>
                            </div>
                            <p className="text-[11px] text-purple-200 line-clamp-1">
                              {stream.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <ChatList
                  currentUser={currentUser}
                  chats={chats}
                  onSelectFriend={(friend) => setActiveChatFriend(friend)}
                  onStartCall={(friend, type) => handleStartCall(friend, type)}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileView
                  currentUser={currentUser}
                  myReels={reels.filter((r) => r.author.id === currentUser.id)}
                  onOpenAuth={() => setIsAuthModalOpen(true)}
                  onAddCoins={(amt) => handleModifyCoins(amt)}
                  onReplayIntro={() => setShowSplashScreen(true)}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation */}
        {!activeVoiceRoom && !activeLiveStream && !activeCall && !activeChatFriend && !isSettingsOpen && (
          <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
        )}

        {/* 1-to-1 Audio or Video Call Screen Overlay */}
        {activeCall && (
          <CallScreen
            call={activeCall}
            currentUser={currentUser}
            onEndCall={handleEndCall}
            onAcceptIncomingCall={handleAcceptIncomingCall}
          />
        )}

        {/* Auth / Profile Switcher Modal */}
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            currentUser={currentUser}
            onLoginSuccess={handleUpdateUser}
          />
        )}

        {/* Create Party Room Modal */}
        {isCreateRoomModalOpen && (
          <CreateRoomModal
            isOpen={isCreateRoomModalOpen}
            onClose={() => setIsCreateRoomModalOpen(false)}
            currentUser={currentUser}
            onCreateRoom={handleCreateRoom}
          />
        )}

        {/* Go Live Setup Modal */}
        {isGoLiveModalOpen && (
          <GoLiveModal
            isOpen={isGoLiveModalOpen}
            onClose={() => setIsGoLiveModalOpen(false)}
            currentUser={currentUser}
            onStartLive={handleStartLive}
          />
        )}

        {/* Animated 3D Countdown Splash Screen */}
        {showSplashScreen && (
          <SplashScreen onComplete={() => setShowSplashScreen(false)} />
        )}
      </div>
    </div>
  );
}
