import React, { useState, useEffect, useRef } from 'react';
import { LiveStream, User, GiftItem } from '../../types';
import { GiftModal } from '../common/GiftModal';
import { soundService } from '../../services/soundService';
import { agoraService } from '../../services/agoraService';
import confetti from 'canvas-confetti';
import {
  Heart,
  MessageCircle,
  Share2,
  Gift,
  X,
  Users,
  Sparkles,
  Send,
  Radio,
  Swords,
  Crown,
  Volume2,
  VolumeX,
  Settings,
  Shield,
  ShieldAlert,
  UserX,
  Ban,
  Mic,
  MicOff,
  Video,
  VideoOff,
  SwitchCamera,
  Lock,
  Unlock,
  MessageSquareOff,
  UserCheck,
  Check,
  AlertTriangle,
  Sliders,
  Flag,
  LogOut,
  Eye,
  Trash2,
} from 'lucide-react';

interface LiveStreamViewProps {
  stream: LiveStream;
  currentUser: User;
  onClose: () => void;
  onSendCoinsReward: (amount: number) => void;
}

interface LiveViewer {
  id: string;
  name: string;
  username: string;
  avatar: string;
  vipTier: string;
  coins: number;
  country: string;
  flag: string;
  isModerator?: boolean;
}

const INITIAL_VIEWERS: LiveViewer[] = [
  { id: 'v1', name: 'Farhan Akhtar', username: '@farhan_star', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', vipTier: 'Crown', coins: 18400, country: 'Pakistan', flag: '🇵🇰', isModerator: true },
  { id: 'v2', name: 'Ananya Roy', username: '@ananya_music', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', vipTier: 'Diamond', coins: 9200, country: 'Pakistan', flag: '🇵🇰' },
  { id: 'v3', name: 'Zainab Shah', username: '@zainab_99', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', vipTier: 'Gold', coins: 4100, country: 'UAE', flag: '🇦🇪' },
  { id: 'v4', name: 'Kabir Khan', username: '@kabir_dj', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', vipTier: 'Silver', coins: 2500, country: 'Pakistan', flag: '🇵🇰' },
  { id: 'v5', name: 'Spammer_Troll', username: '@spammer_fake', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80', vipTier: 'Free', coins: 150, country: 'Global', flag: '🌐' },
];

export const LiveStreamView: React.FC<LiveStreamViewProps> = ({
  stream,
  currentUser,
  onClose,
  onSendCoinsReward,
}) => {
  const [likes, setLikes] = useState(stream.likesCount);
  const [viewersList, setViewersList] = useState<LiveViewer[]>(INITIAL_VIEWERS);
  const [comments, setComments] = useState<{ id: string; userId: string; user: string; text: string; isGift?: boolean; isSystem?: boolean }[]>([
    { id: '1', userId: 'system', user: 'System', text: 'Welcome to the live stream! Send gifts & support the host ✨', isSystem: true },
    { id: '2', userId: 'v1', user: 'Farhan Akhtar', text: 'Let’s goooo! Amazing vocals tonight 🎤🔥' },
    { id: '3', userId: 'v2', user: 'Ananya Roy', text: 'You look stunning tonight! Glowing ✨' },
    { id: '4', userId: 'v5', user: 'Spammer_Troll', text: 'Spamming messages 12345!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [pkScoreA, setPkScoreA] = useState(stream.pkScoreUser || 12400);
  const [pkScoreB, setPkScoreB] = useState(stream.pkScoreOpponent || 9800);
  const [giftBanner, setGiftBanner] = useState<string | null>(null);

  // Moderation & Stream Settings States
  const isMeHost = stream.streamer.id === currentUser.id;
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showViewersDrawer, setShowViewersDrawer] = useState(false);
  const [showEndStreamConfirm, setShowEndStreamConfirm] = useState(false);
  const [selectedViewer, setSelectedViewer] = useState<LiveViewer | null>(null);
  const [bannedUsers, setBannedUsers] = useState<LiveViewer[]>([]);
  const [mutedUsers, setMutedUsers] = useState<Record<string, boolean>>({});
  const [moderators, setModerators] = useState<Record<string, boolean>>({ v1: true });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Host Stream Control Toggles
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [beautyFilter, setBeautyFilter] = useState<'beauty' | 'rosy' | 'golden' | 'cyber' | 'none'>('beauty');
  const [streamPrivacy, setStreamPrivacy] = useState<'public' | 'followers' | 'vip'>('public');
  const [isChatMutedAll, setIsChatMutedAll] = useState(false);
  const [isSlowMode, setIsSlowMode] = useState(false);
  const [streamQuality, setStreamQuality] = useState<'1080p' | '720p' | '480p'>('1080p');
  const [bgmVolume, setBgmVolume] = useState(60);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isAgoraConnected, setIsAgoraConnected] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Agora Live Streaming Channel Integration
  useEffect(() => {
    let isMounted = true;
    const channelName = `live_${stream.id.replace(/[^a-zA-Z0-9]/g, '_')}`;

    agoraService
      .joinChannel({
        channel: channelName,
        mode: 'live',
        role: isMeHost ? 'host' : 'audience',
      })
      .then(async (res) => {
        if (!isMounted) return;
        if (res.success) {
          setIsAgoraConnected(true);
          if (isMeHost) {
            await agoraService.publishMicrophone();
            await agoraService.publishCamera(isFrontCamera);
            await agoraService.setBeautyEffect(beautyFilter !== 'none');
          }
        }
      })
      .catch((err) => {
        console.warn('[Agora Live Stream] Fallback:', err);
      });

    return () => {
      isMounted = false;
      agoraService.leaveChannel();
      setIsAgoraConnected(false);
    };
  }, [stream.id, isMeHost, isFrontCamera]);

  // Camera preview management
  useEffect(() => {
    if (!isMeHost) return;

    if (isVideoDisabled) {
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((t) => t.stop());
      }
      return;
    }

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: isFrontCamera ? 'user' : 'environment' }, audio: true })
      .then((s) => {
        streamRef.current = s;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = s;
        }
      })
      .catch((err) => {
        console.warn('Live stream camera error, using simulated feed', err);
      });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isMeHost, isFrontCamera, isVideoDisabled]);

  const handleToggleMic = () => {
    const next = !isMicMuted;
    setIsMicMuted(next);
    agoraService.setMute(next);
    showToast(next ? 'Host Microphone Muted 🔇' : 'Microphone Live 🎙️');
  };

  const handleToggleVideo = () => {
    const next = !isVideoDisabled;
    setIsVideoDisabled(next);
    agoraService.setVideoEnabled(!next);
    showToast(next ? 'Camera Turned Off' : 'Camera Live 📹');
  };

  const handleFlipCamera = () => {
    setIsFrontCamera(!isFrontCamera);
    showToast('Camera flipped');
  };

  // Kick User from Live Stream
  const handleKickUser = (viewer: LiveViewer) => {
    soundService.playCallHangup();
    setViewersList((prev) => prev.filter((v) => v.id !== viewer.id));
    setComments((prev) => [
      ...prev,
      {
        id: `sys_${Date.now()}`,
        userId: 'system',
        user: 'System Notice',
        text: `⚠️ @${viewer.name} was removed (kicked) from this live stream by host.`,
        isSystem: true,
      },
    ]);
    setSelectedViewer(null);
    showToast(`🚫 @${viewer.name} stream se bahir nikal diya gaya!`);
  };

  // Permanently Ban User
  const handleBanUser = (viewer: LiveViewer) => {
    soundService.playCallHangup();
    setViewersList((prev) => prev.filter((v) => v.id !== viewer.id));
    setBannedUsers((prev) => [...prev, viewer]);
    setComments((prev) => [
      ...prev,
      {
        id: `sys_${Date.now()}`,
        userId: 'system',
        user: 'System Notice',
        text: `⛔ @${viewer.name} has been permanently BANNED from this live stream.`,
        isSystem: true,
      },
    ]);
    setSelectedViewer(null);
    showToast(`⛔ @${viewer.name} ko stream se BAN kar diya gaya!`);
  };

  // Unban user
  const handleUnbanUser = (userId: string, name: string) => {
    setBannedUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast(`✅ @${name} unbanned successfully`);
  };

  // Mute / Unmute user in chat
  const handleToggleMuteUser = (viewer: LiveViewer) => {
    const isCurrentlyMuted = !!mutedUsers[viewer.id];
    setMutedUsers((prev) => ({
      ...prev,
      [viewer.id]: !isCurrentlyMuted,
    }));
    setSelectedViewer(null);
    if (!isCurrentlyMuted) {
      setComments((prev) => [
        ...prev,
        {
          id: `sys_${Date.now()}`,
          userId: 'system',
          user: 'System Notice',
          text: `🔇 @${viewer.name} has been muted in chat.`,
          isSystem: true,
        },
      ]);
      showToast(`🔇 @${viewer.name} chat me mute ho gaya!`);
    } else {
      showToast(`🔊 @${viewer.name} unmuted!`);
    }
  };

  // Appoint or Remove Moderator
  const handleToggleModerator = (viewer: LiveViewer) => {
    const isMod = !!moderators[viewer.id];
    setModerators((prev) => ({
      ...prev,
      [viewer.id]: !isMod,
    }));
    setSelectedViewer(null);
    showToast(isMod ? `Demoted @${viewer.name}` : `🛡️ @${viewer.name} is now a Live Stream Admin / Moderator!`);
  };

  const handleTapHeart = (e: React.MouseEvent<HTMLDivElement>) => {
    setLikes((prev) => prev + 1);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const heartId = Date.now() + Math.random();
    setFloatingHearts((prev) => [...prev, { id: heartId, x, y }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== heartId));
    }, 1500);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    if (isChatMutedAll && !isMeHost) {
      showToast('Chat is currently disabled by host.');
      return;
    }

    if (mutedUsers[currentUser.id]) {
      showToast('You are muted by the host in this stream.');
      return;
    }

    setComments((prev) => [
      ...prev,
      {
        id: `c_${Date.now()}`,
        userId: currentUser.id,
        user: currentUser.name,
        text: chatInput.trim(),
      },
    ]);
    setChatInput('');
  };

  const handleSendGift = (gift: GiftItem, quantity: number) => {
    const totalCost = gift.coins * quantity;
    onSendCoinsReward(-totalCost);

    setPkScoreA((prev) => prev + totalCost);

    const bannerText = `👑 ${currentUser.name} sent ${quantity}x ${gift.name} ${gift.icon} to ${stream.streamer.name}!`;
    setGiftBanner(bannerText);
    setTimeout(() => setGiftBanner(null), 4500);

    setComments((prev) => [
      ...prev,
      {
        id: `g_${Date.now()}`,
        userId: currentUser.id,
        user: 'GIFT 🎁',
        text: `${currentUser.name} sent ${quantity}x ${gift.name}!`,
        isGift: true,
      },
    ]);
  };

  const totalPK = pkScoreA + pkScoreB;
  const pkPercentA = Math.round((pkScoreA / totalPK) * 100);

  // Helper to open moderation on comment author
  const handleCommentUserClick = (commentUserId: string, commentUserName: string) => {
    if (commentUserId === 'system' || commentUserId === currentUser.id) return;
    const found = viewersList.find((v) => v.id === commentUserId) || {
      id: commentUserId,
      name: commentUserName,
      username: `@${commentUserName.toLowerCase().replace(/\s+/g, '_')}`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      vipTier: 'Gold',
      coins: 3000,
      country: 'Pakistan',
      flag: '🇵🇰',
    };
    setSelectedViewer(found);
  };

  const getFilterStyle = () => {
    switch (beautyFilter) {
      case 'beauty':
        return 'contrast(106%) brightness(108%) saturate(112%)';
      case 'rosy':
        return 'brightness(105%) saturate(125%) hue-rotate(-8deg)';
      case 'golden':
        return 'sepia(22%) saturate(125%) brightness(106%)';
      case 'cyber':
        return 'contrast(115%) saturate(135%) hue-rotate(170deg)';
      default:
        return 'none';
    }
  };

  return (
    <div
      className="relative w-full h-full max-w-md mx-auto bg-black text-white flex flex-col justify-between overflow-hidden select-none flex-1"
      onClick={handleTapHeart}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gradient-to-r from-pink-600 to-amber-500 text-white font-bold text-xs rounded-full shadow-2xl animate-fade-in flex items-center gap-1.5 border border-white/20">
          <Sparkles className="w-3.5 h-3.5" /> {toastMessage}
        </div>
      )}

      {/* Background Live Video / Visualizer */}
      <div className="absolute inset-0 z-0">
        {isMeHost ? (
          isVideoDisabled ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#150728] text-center p-6">
              <VideoOff className="w-16 h-16 text-purple-400/60 mb-2" />
              <h3 className="text-base font-bold text-white">Camera is Off</h3>
              <p className="text-xs text-purple-300">Live audio is still streaming</p>
            </div>
          ) : (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{ filter: getFilterStyle() }}
              className={`w-full h-full object-cover ${isFrontCamera ? '-scale-x-100' : 'scale-x-100'} transition-transform duration-300`}
            />
          )
        ) : (
          <img
            src={stream.previewUrl}
            alt="stream"
            className="w-full h-full object-cover filter brightness-75 scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* Floating Hearts Animation */}
      {floatingHearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute pointer-events-none animate-float-heart z-40"
          style={{ left: heart.x - 20, top: heart.y - 20 }}
        >
          <Heart className="w-10 h-10 text-pink-500 fill-pink-500 drop-shadow-lg" />
        </div>
      ))}

      {/* Gift Banner Notification */}
      {giftBanner && (
        <div className="absolute top-16 left-3 right-3 z-50 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 text-white font-black text-xs shadow-2xl flex items-center gap-2 border border-amber-300 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-200 shrink-0" />
          <span className="truncate">{giftBanner}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="relative z-20 p-3.5 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
        {/* Streamer Info Card */}
        <div className="flex items-center gap-2.5 bg-black/40 backdrop-blur-md p-1.5 pr-3.5 rounded-full border border-white/10">
          <img
            src={stream.streamer.avatar}
            alt={stream.streamer.name}
            className="w-9 h-9 rounded-full object-cover border border-amber-400"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-xs text-white max-w-[100px] truncate">{stream.streamer.name}</span>
              <span className="text-[9px] px-1 bg-red-600 text-white rounded font-mono font-bold animate-pulse">
                LIVE
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-purple-200">
              <span className="text-amber-400 font-semibold">{likes.toLocaleString()} Likes</span>
            </div>
          </div>
        </div>

        {/* Right Header: Agora status, Viewers Count button & Live Settings */}
        <div className="flex items-center gap-1.5">
          {/* Active Viewers Drawer Pill */}
          <button
            onClick={() => setShowViewersDrawer(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-xs text-white font-bold hover:bg-black/70 transition cursor-pointer"
            title="View Active Viewers & Kick/Ban Controls"
          >
            <Users className="w-3.5 h-3.5 text-pink-400" />
            <span>{viewersList.length}</span>
          </button>

          {/* Stream Settings / Moderation Button */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-amber-300 hover:text-white hover:bg-black/70 transition shadow-lg"
            title="Live Stream Settings & Moderation"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Exit / Close button */}
          <button
            onClick={() => {
              if (isMeHost) {
                setShowEndStreamConfirm(true);
              } else {
                agoraService.leaveChannel();
                onClose();
              }
            }}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white hover:bg-red-600/80 transition"
            title="Close Live Stream"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PK Battle Bar Overlay */}
      {stream.isPKBattle && stream.pkOpponent && (
        <div className="relative z-20 mx-4 my-2 p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-purple-500/40">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider mb-1">
            <span className="text-pink-400 flex items-center gap-1">
              {stream.streamer.name.split(' ')[0]} ({pkScoreA.toLocaleString()})
            </span>
            <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-red-600 to-amber-500 text-white font-mono flex items-center gap-1 text-[10px]">
              <Swords className="w-3 h-3" /> PK BATTLE
            </span>
            <span className="text-cyan-400 flex items-center gap-1">
              {stream.pkOpponent.name.split(' ')[0]} ({pkScoreB.toLocaleString()})
            </span>
          </div>

          <div className="h-2.5 w-full bg-cyan-600 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-amber-400 transition-all duration-500"
              style={{ width: `${pkPercentA}%` }}
            />
          </div>
        </div>
      )}

      {/* Center Spacer */}
      <div className="flex-1 pointer-events-none" />

      {/* Live Comments Stream */}
      <div
        className="relative z-20 px-4 py-2 max-h-48 overflow-y-auto no-scrollbar space-y-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        {comments.map((c) => {
          const isUserMuted = !!mutedUsers[c.userId];
          const isUserBanned = bannedUsers.some((u) => u.id === c.userId);
          const isUserAdmin = !!moderators[c.userId];

          return (
            <div
              key={c.id}
              onClick={() => handleCommentUserClick(c.userId, c.user)}
              className={`text-xs px-3 py-1.5 rounded-xl backdrop-blur-md max-w-fit cursor-pointer hover:ring-1 hover:ring-amber-400 transition flex items-center gap-1.5 flex-wrap ${
                c.isSystem
                  ? 'bg-amber-950/60 border border-amber-500/40 text-amber-200 font-semibold'
                  : c.isGift
                  ? 'bg-gradient-to-r from-amber-500/30 to-pink-500/30 border border-amber-400/50 text-amber-200 font-bold'
                  : 'bg-black/60 border border-white/10 text-white'
              }`}
              title="Tap to moderate user (Kick, Ban, Mute, Admin)"
            >
              {isUserAdmin && <span className="text-[9px] bg-cyan-500/30 text-cyan-300 px-1 rounded font-bold">🛡️ MOD</span>}
              {isUserMuted && <span className="text-[9px] bg-red-500/30 text-red-300 px-1 rounded font-bold">🔇 MUTED</span>}
              <span className="font-bold text-pink-400">{c.user}:</span>
              <span>{c.text}</span>
            </div>
          );
        })}
      </div>

      {/* Bottom Controls Bar */}
      <div
        className="relative z-20 p-3 bg-gradient-to-t from-black via-black/85 to-transparent flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSendChat} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isChatMutedAll && !isMeHost}
            placeholder={isChatMutedAll ? 'Chat is disabled by host' : 'Comment on live (Tap username to Ban/Kick)...'}
            className="w-full bg-black/60 border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-purple-300/50 focus:outline-none focus:border-pink-500 disabled:opacity-50"
          />
          <button
            type="submit"
            className="p-2.5 rounded-full bg-purple-900 hover:bg-purple-800 text-white"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Host Quick Controls */}
        {isMeHost && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleMic}
              className={`p-2.5 rounded-full border transition active:scale-95 shadow-md ${
                isMicMuted ? 'bg-red-600 border-red-500 text-white' : 'bg-black/60 border-white/20 text-white'
              }`}
              title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={handleFlipCamera}
              className="p-2.5 rounded-full bg-black/60 border border-white/20 text-white active:scale-95 transition"
              title="Flip Camera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Settings Button */}
        <button
          onClick={() => setShowSettingsModal(true)}
          className="p-2.5 rounded-full bg-purple-950/80 border border-purple-700 text-amber-300 shadow-lg active:scale-95 transition"
          title="Stream Settings & Host Options"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Send Gift Button */}
        <button
          onClick={() => setIsGiftModalOpen(true)}
          className="p-2.5 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 text-white shadow-lg active:scale-95 transition"
        >
          <Gift className="w-4 h-4" />
        </button>

        {/* Heart Tap Button */}
        <button
          onClick={() => setLikes((prev) => prev + 1)}
          className="p-2.5 rounded-full bg-pink-600 text-white shadow-lg active:scale-125 transition"
        >
          <Heart className="w-4 h-4 fill-white" />
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 1. USER MODERATION ACTION SHEET (Kick, Ban, Mute, Admin)              */}
      {/* ===================================================================== */}
      {selectedViewer && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-3 animate-fade-in"
          onClick={() => setSelectedViewer(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[#16062b] border border-purple-700/80 p-5 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* User Profile Header */}
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/60">
              <div className="flex items-center gap-3">
                <img
                  src={selectedViewer.avatar}
                  alt={selectedViewer.name}
                  className="w-13 h-13 rounded-full object-cover border-2 border-amber-400"
                />
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5 font-heading">
                    {selectedViewer.name}
                    <span>{selectedViewer.flag}</span>
                  </h4>
                  <p className="text-xs text-purple-300">{selectedViewer.username}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] px-2 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                      {selectedViewer.vipTier} VIP
                    </span>
                    {moderators[selectedViewer.id] && (
                      <span className="text-[9px] px-2 py-0.2 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 font-bold">
                        🛡️ Moderator
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedViewer(null)}
                className="p-1.5 rounded-full bg-purple-950 text-purple-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Moderation Actions List */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Host Moderation Controls
              </span>

              {/* Action 1: Kick user from live stream */}
              <button
                onClick={() => handleKickUser(selectedViewer)}
                className="w-full p-3 rounded-2xl bg-amber-950/40 hover:bg-amber-900/40 border border-amber-700/60 text-amber-300 font-bold text-xs flex items-center justify-between transition active:scale-95"
              >
                <div className="flex items-center gap-2.5">
                  <UserX className="w-4 h-4 text-amber-400" />
                  <div>
                    <div>Kick from Live Stream</div>
                    <div className="text-[10px] text-purple-300 font-normal">Stream se bahir nikal dein</div>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-400/20 px-2 py-0.5 rounded font-bold">Kick</span>
              </button>

              {/* Action 2: Permanently BAN user */}
              <button
                onClick={() => handleBanUser(selectedViewer)}
                className="w-full p-3 rounded-2xl bg-red-950/50 hover:bg-red-900/50 border border-red-700/80 text-red-300 font-bold text-xs flex items-center justify-between transition active:scale-95"
              >
                <div className="flex items-center gap-2.5">
                  <Ban className="w-4 h-4 text-red-400" />
                  <div>
                    <div className="text-red-200">Permanently Ban User</div>
                    <div className="text-[10px] text-purple-300 font-normal">Is stream me dobara dakhil nahi ho sakega</div>
                  </div>
                </div>
                <span className="text-[10px] bg-red-600 text-white px-2.5 py-0.5 rounded font-bold">BAN</span>
              </button>

              {/* Action 3: Mute user in chat */}
              <button
                onClick={() => handleToggleMuteUser(selectedViewer)}
                className="w-full p-3 rounded-2xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800 text-purple-200 font-bold text-xs flex items-center justify-between transition active:scale-95"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquareOff className="w-4 h-4 text-purple-400" />
                  <div>
                    <div>{mutedUsers[selectedViewer.id] ? 'Unmute User in Chat' : 'Mute in Chat'}</div>
                    <div className="text-[10px] text-purple-300 font-normal">Chat messages bhejne se rokein</div>
                  </div>
                </div>
                <span className="text-[10px] bg-purple-800 px-2 py-0.5 rounded">
                  {mutedUsers[selectedViewer.id] ? 'Unmute' : 'Mute'}
                </span>
              </button>

              {/* Action 4: Make / Remove Moderator */}
              <button
                onClick={() => handleToggleModerator(selectedViewer)}
                className="w-full p-3 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/60 text-cyan-300 font-bold text-xs flex items-center justify-between transition active:scale-95"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div>{moderators[selectedViewer.id] ? 'Remove Moderator' : 'Make Stream Moderator'}</div>
                    <div className="text-[10px] text-purple-300 font-normal">Spam rokne ke liye Admin rights dein</div>
                  </div>
                </div>
                <span className="text-[10px] bg-cyan-500/20 px-2 py-0.5 rounded font-bold">
                  {moderators[selectedViewer.id] ? 'Dismiss' : 'Appoint'}
                </span>
              </button>
            </div>

            <button
              onClick={() => setSelectedViewer(null)}
              className="w-full py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 font-bold text-xs"
            >
              Cancel / Close
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. ACTIVE VIEWERS LIST DRAWER                                         */}
      {/* ===================================================================== */}
      {showViewersDrawer && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-3 animate-fade-in"
          onClick={() => setShowViewersDrawer(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[#16062b] border border-purple-700/80 p-5 shadow-2xl relative max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/60">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-400" />
                <h3 className="font-bold text-sm text-white font-heading">
                  Active Viewers ({viewersList.length})
                </h3>
              </div>
              <button
                onClick={() => setShowViewersDrawer(false)}
                className="p-1.5 rounded-full bg-purple-950 text-purple-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-purple-300 my-2">
              Tap any viewer to <strong>Kick</strong> from stream, <strong>Ban</strong>, or <strong>Mute in Chat</strong>.
            </p>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 py-2">
              {viewersList.map((viewer) => (
                <div
                  key={viewer.id}
                  onClick={() => setSelectedViewer(viewer)}
                  className="p-2.5 rounded-2xl bg-purple-950/50 hover:bg-purple-900/50 border border-purple-900/50 flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={viewer.avatar}
                      alt={viewer.name}
                      className="w-10 h-10 rounded-full object-cover border border-amber-400"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        {viewer.name}
                        <span>{viewer.flag}</span>
                      </div>
                      <div className="text-[10px] text-purple-300 flex items-center gap-1.5">
                        <span className="text-amber-400 font-semibold">{viewer.vipTier}</span>
                        {moderators[viewer.id] && <span className="text-cyan-300">🛡️ Admin</span>}
                        {mutedUsers[viewer.id] && <span className="text-red-300">🔇 Muted</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleKickUser(viewer);
                      }}
                      className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-white text-[10px] font-bold"
                      title="Kick from stream"
                    >
                      Kick
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBanUser(viewer);
                      }}
                      className="p-1.5 rounded-lg bg-red-600/30 text-red-300 hover:bg-red-600 hover:text-white text-[10px] font-bold"
                      title="Ban User"
                    >
                      Ban
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowViewersDrawer(false)}
              className="w-full mt-3 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. COMPLETE LIVE STREAM SETTINGS MODAL                                */}
      {/* ===================================================================== */}
      {showSettingsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[#140626] border border-purple-700/80 p-5 shadow-2xl relative max-h-[88vh] overflow-y-auto no-scrollbar space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-purple-800/60">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-gradient-to-tr from-amber-400 to-pink-500 text-white shadow">
                  <Settings className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-white font-heading">Live Stream Settings</h3>
                  <p className="text-[10px] text-purple-300">Host, Security, Camera & Ban Management</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 rounded-full bg-purple-950 text-purple-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SECTION 1: HOST HARDWARE & CAMERA CONTROLS */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                🎙️ Host Audio & Video Controls
              </span>
              <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60 space-y-2.5">
                {/* Mic Mute */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isMicMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                    <span className="text-xs font-bold text-white">Microphone</span>
                  </div>
                  <button
                    onClick={handleToggleMic}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      isMicMuted ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {isMicMuted ? 'Muted' : 'Live'}
                  </button>
                </div>

                {/* Camera Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isVideoDisabled ? <VideoOff className="w-4 h-4 text-red-400" /> : <Video className="w-4 h-4 text-pink-400" />}
                    <span className="text-xs font-bold text-white">Live Camera</span>
                  </div>
                  <button
                    onClick={handleToggleVideo}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      isVideoDisabled ? 'bg-red-600 text-white' : 'bg-purple-800 text-white'
                    }`}
                  >
                    {isVideoDisabled ? 'Off' : 'On'}
                  </button>
                </div>

                {/* Flip Camera */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SwitchCamera className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">Camera Direction</span>
                  </div>
                  <button
                    onClick={handleFlipCamera}
                    className="px-3 py-1 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold"
                  >
                    {isFrontCamera ? 'Front Camera' : 'Back Camera'}
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 2: BEAUTY FILTERS */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block">
                🌸 Live Beauty & Skin Filters
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'beauty', label: '🌸 Smooth Glow' },
                  { id: 'rosy', label: '🌹 Rosy Blush' },
                  { id: 'golden', label: '☀️ Golden Sun' },
                  { id: 'cyber', label: '⚡ Cyber Neon' },
                  { id: 'none', label: '❌ Normal' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setBeautyFilter(f.id as any);
                      agoraService.setBeautyEffect(f.id !== 'none');
                      showToast(`Filter set to ${f.label}`);
                    }}
                    className={`p-2 rounded-xl text-center text-xs font-bold border transition ${
                      beautyFilter === f.id
                        ? 'border-pink-500 bg-purple-900/80 shadow ring-1 ring-pink-500 text-white'
                        : 'border-purple-900/50 bg-purple-950/40 text-purple-300 hover:bg-purple-900/40'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 3: PRIVACY & CHAT PERMISSIONS */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                🛡️ Chat Moderation & Privacy
              </span>
              <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60 space-y-2.5">
                {/* Mute entire chat */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Mute Entire Chat</div>
                    <div className="text-[10px] text-purple-300">Viewers cannot send messages</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChatMutedAll}
                    onChange={(e) => {
                      setIsChatMutedAll(e.target.checked);
                      showToast(e.target.checked ? 'Chat has been muted for all viewers' : 'Chat enabled');
                    }}
                    className="w-4 h-4 accent-pink-500 cursor-pointer"
                  />
                </div>

                {/* Slow mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Slow Mode (Anti-Spam)</div>
                    <div className="text-[10px] text-purple-300">10-second delay between comments</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSlowMode}
                    onChange={(e) => {
                      setIsSlowMode(e.target.checked);
                      showToast(e.target.checked ? 'Slow Mode On (10s delay)' : 'Slow Mode Off');
                    }}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Stream Privacy */}
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white">Stream Audience</div>
                  <select
                    value={streamPrivacy}
                    onChange={(e) => {
                      setStreamPrivacy(e.target.value as any);
                      showToast(`Audience set to: ${e.target.value}`);
                    }}
                    className="bg-purple-950 border border-purple-800 rounded-xl px-2 py-1 text-xs text-white"
                  >
                    <option value="public">🌍 Public (Everyone)</option>
                    <option value="followers">👥 Followers Only</option>
                    <option value="vip">👑 VIP Tier Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 4: BANNED USERS LIST */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                ⛔ Banned Users List ({bannedUsers.length})
              </span>
              <div className="p-3 rounded-2xl bg-red-950/30 border border-red-800/40 space-y-2">
                {bannedUsers.length === 0 ? (
                  <p className="text-[11px] text-purple-400 text-center py-1">No banned users in this stream.</p>
                ) : (
                  bannedUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{u.name} ({u.username})</span>
                      <button
                        onClick={() => handleUnbanUser(u.id, u.name)}
                        className="px-2 py-0.5 rounded-lg bg-purple-900 hover:bg-emerald-600 text-white font-bold text-[10px]"
                      >
                        Unban
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SECTION 5: END STREAM BUTTON */}
            {isMeHost && (
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setShowEndStreamConfirm(true);
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <LogOut className="w-4 h-4" /> End Live Stream
              </button>
            )}

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-bold text-xs"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. END STREAM SUMMARY CONFIRMATION MODAL                              */}
      {/* ===================================================================== */}
      {showEndStreamConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-xs rounded-3xl bg-[#16062b] border border-purple-700/80 p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto shadow-lg">
              <LogOut className="w-7 h-7" />
            </div>

            <h3 className="text-base font-black text-white font-heading">End Live Stream?</h3>
            <p className="text-xs text-purple-300">
              Are you sure you want to conclude this broadcast? Your stream stats will be saved.
            </p>

            {/* Stream Statistics Summary */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60 text-center">
              <div>
                <div className="text-[10px] text-purple-300">Total Likes</div>
                <div className="text-sm font-bold text-pink-400">{likes.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-purple-300">Peak Viewers</div>
                <div className="text-sm font-bold text-amber-400">{viewersList.length + 8}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowEndStreamConfirm(false)}
                className="w-1/2 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 font-bold text-xs"
              >
                Continue Live
              </button>
              <button
                onClick={() => {
                  setShowEndStreamConfirm(false);
                  agoraService.leaveChannel();
                  onClose();
                }}
                className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/40"
              >
                End Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gift Modal */}
      {isGiftModalOpen && (
        <GiftModal
          isOpen={isGiftModalOpen}
          onClose={() => setIsGiftModalOpen(false)}
          targetName={stream.streamer.name}
          currentUser={currentUser}
          onSendGift={handleSendGift}
        />
      )}
    </div>
  );
};
