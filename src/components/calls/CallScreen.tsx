import React, { useState, useEffect, useRef } from 'react';
import { ActiveCall, User } from '../../types';
import { soundService } from '../../services/soundService';
import { agoraService } from '../../services/agoraService';
import { VideoFeed } from './VideoFeed';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  PhoneCall,
  Volume2,
  VolumeX,
  SwitchCamera,
  ChevronDown,
  Maximize2,
  MessageSquare,
  Heart,
  Camera,
  Layers,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';

interface CallScreenProps {
  call: ActiveCall;
  currentUser: User;
  onEndCall: () => void;
  onAcceptIncomingCall: () => void;
}

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
}

export const CallScreen: React.FC<CallScreenProps> = ({
  call,
  currentUser,
  onEndCall,
  onAcceptIncomingCall,
}) => {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(call.type === 'video');
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLocalMain, setIsLocalMain] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [quickReplyText, setQuickReplyText] = useState<string | null>(null);

  // Agora Beauty & Voice Filters
  const [selectedFilter, setSelectedFilter] = useState<'beauty' | 'rosy' | 'golden' | 'cyber' | 'noir' | 'none'>('beauty');
  const [selectedVoiceEffect, setSelectedVoiceEffect] = useState<'normal' | 'echo' | 'bass' | 'robot' | 'studio'>('normal');
  const [showFilterPicker, setShowFilterPicker] = useState(false);

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Sound effects & ringtone lifecycle
  useEffect(() => {
    if (call.direction === 'outgoing') {
      soundService.startOutgoingRing();
    } else if (call.direction === 'incoming') {
      soundService.startIncomingRing();
    } else if (call.direction === 'connected') {
      soundService.stopRing();
      soundService.playCallConnect();
    }

    return () => {
      soundService.stopRing();
    };
  }, [call.direction]);

  // Duration counter when connected
  useEffect(() => {
    if (call.direction !== 'connected') return;
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [call.direction]);

  const [isAgoraConnected, setIsAgoraConnected] = useState(false);

  // Agora RTC Real-Time Call Channel Integration
  useEffect(() => {
    if (call.direction !== 'connected') return;

    let isMounted = true;
    const channelName = `call_${call.id.replace(/[^a-zA-Z0-9]/g, '_')}`;

    agoraService
      .joinChannel({
        channel: channelName,
        mode: 'rtc',
      })
      .then(async (res) => {
        if (!isMounted) return;
        if (res.success) {
          setIsAgoraConnected(true);
          await agoraService.publishMicrophone();
          if (isVideoEnabled) {
            await agoraService.publishCamera(isFrontCamera);
          }
        }
      })
      .catch((err) => {
        console.warn('[Agora RTC] Connect fallback:', err);
      });

    return () => {
      isMounted = false;
      agoraService.leaveChannel();
      setIsAgoraConnected(false);
    };
  }, [call.direction, call.id]);

  // Local camera media stream management
  useEffect(() => {
    if (!isVideoEnabled) {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      setCameraStream(null);
      agoraService.setVideoEnabled(false);
      return;
    }

    let isMounted = true;
    navigator.mediaDevices
      ?.getUserMedia({
        video: { facingMode: isFrontCamera ? 'user' : 'environment' },
        audio: true,
      })
      .then((stream) => {
        if (!isMounted) return;
        localStreamRef.current = stream;
        setCameraStream(stream);
        agoraService.setVideoEnabled(true);
      })
      .catch((err) => {
        console.warn('Camera access unavailable or simulated', err);
      });

    return () => {
      isMounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      setCameraStream(null);
    };
  }, [isVideoEnabled, isFrontCamera]);

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    agoraService.setMute(nextMute);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMute;
      });
    }
  };

  const toggleVideo = () => {
    const nextVideo = !isVideoEnabled;
    setIsVideoEnabled(nextVideo);
    agoraService.setVideoEnabled(nextVideo);
  };

  const handleEnd = () => {
    agoraService.leaveChannel();
    soundService.playCallHangup();
    onEndCall();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const triggerReaction = (emoji: string) => {
    soundService.playCoinSound();
    const newReaction: FloatingReaction = {
      id: Date.now() + Math.random(),
      emoji,
      x: 20 + Math.random() * 60,
    };
    setFloatingReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2000);
  };

  // =========================================================================
  // 1. MINIMIZED FLOATING BUBBLE (Compact Mode)
  // =========================================================================
  if (isMinimized) {
    return (
      <div className="fixed top-20 right-4 z-50 animate-bounce-short">
        <div
          onClick={() => setIsMinimized(false)}
          className="relative w-18 h-18 rounded-3xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-0.5 shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition group"
        >
          <div className="w-full h-full rounded-[22px] overflow-hidden bg-black relative">
            <img
              src={call.remoteUser.avatar}
              alt={call.remoteUser.name}
              className="w-full h-full object-cover"
            />
            {/* Active connection pulse dot */}
            <span className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-black animate-pulse" />

            {/* Muted badge */}
            {isMuted && (
              <span className="absolute bottom-1.5 left-1.5 p-1 rounded-full bg-red-600 text-white">
                <MicOff className="w-2.5 h-2.5" />
              </span>
            )}

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Duration badge */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/90 border border-amber-400/60 text-[9px] font-mono font-bold text-amber-300 whitespace-nowrap shadow">
            {formatTime(duration)}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. INCOMING CALL SCREEN
  // =========================================================================
  if (call.direction === 'incoming') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0e071e] text-white overflow-hidden p-6 select-none animate-fade-in">
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#180838] via-[#0d041c] to-black" />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-400 to-pink-500 text-white font-black flex items-center justify-center text-xs shadow-md">
              <PhoneCall className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
              Incoming Call
            </span>
          </div>
          <span className="text-xs text-purple-300 font-medium">
            {call.type === 'video' ? 'HD Video Call' : 'HD Voice Call'}
          </span>
        </div>

        {/* Caller Avatar & Presence */}
        <div className="relative z-10 flex flex-col items-center text-center my-auto">
          {/* Animated pulsing rings */}
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-full border-2 border-amber-400/40 animate-ping opacity-60" />
            <div className="absolute -inset-8 rounded-full border border-pink-500/30 animate-pulse" />
            <div className="w-36 h-36 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 shadow-2xl">
              <img
                src={call.remoteUser.avatar}
                alt={call.remoteUser.name}
                className="w-full h-full rounded-full object-cover border-4 border-black"
              />
            </div>
            {/* Country flag indicator */}
            <span className="absolute -bottom-1 right-2 text-xl filter drop-shadow">
              {call.remoteUser.flag || '🇵🇰'}
            </span>
          </div>

          <h1 className="text-2xl font-black text-white font-heading tracking-wide">
            {call.remoteUser.name}
          </h1>
          <p className="text-sm font-semibold text-amber-300/90 mt-1">
            {call.remoteUser.username}
          </p>
          <p className="text-xs text-purple-300 mt-2 flex items-center gap-1.5 animate-pulse">
            <span>Incoming {call.type === 'video' ? 'Video' : 'Audio'} Call</span>
            <span>·</span>
            <span>Ringing...</span>
          </p>

          {/* Quick Decline Reply Toast */}
          {quickReplyText && (
            <div className="mt-4 px-4 py-2 rounded-2xl bg-purple-950/90 border border-purple-800 text-xs text-pink-300 shadow-xl">
              {quickReplyText}
            </div>
          )}
        </div>

        {/* Bottom Actions: Green Accept & Red Decline */}
        <div className="relative z-10 pb-8 flex flex-col items-center gap-6">
          <div className="w-full max-w-xs flex items-center justify-around">
            {/* Decline Button */}
            <button
              onClick={handleEnd}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-18 h-18 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-2xl shadow-red-600/50 group-active:scale-90 transition">
                <PhoneOff className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-red-300 group-hover:text-white transition">
                Decline
              </span>
            </button>

            {/* Quick Message Button */}
            <button
              onClick={() => {
                setQuickReplyText('Sent: "Can\'t talk right now, message me! 💬"');
                setTimeout(() => handleEnd(), 1200);
              }}
              className="flex flex-col items-center gap-2 text-purple-300 hover:text-white transition cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-purple-950/80 border border-purple-800 flex items-center justify-center shadow-lg active:scale-95">
                <MessageSquare className="w-5 h-5 text-amber-300" />
              </div>
              <span className="text-[11px] font-medium text-purple-300">Message</span>
            </button>

            {/* Accept Button */}
            <button
              onClick={onAcceptIncomingCall}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-18 h-18 rounded-full bg-[#00D06C] hover:bg-emerald-400 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/50 group-active:scale-90 transition animate-bounce">
                <PhoneCall className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-emerald-300 group-hover:text-white transition">
                Accept
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. ACTIVE CONNECTED CALL SCREEN
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white overflow-hidden select-none animate-fade-in">
      {/* Floating Animated Emojis In-Call Reactions */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {floatingReactions.map((reaction) => (
          <div
            key={reaction.id}
            style={{ left: `${reaction.x}%` }}
            className="absolute bottom-28 text-4xl animate-float-up filter drop-shadow-lg"
          >
            {reaction.emoji}
          </div>
        ))}
      </div>

      {/* ========================================== */}
      {/* TOP STATUS BAR                             */}
      {/* ========================================== */}
      <div className="relative z-30 px-4 pt-5 pb-3 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-xs">
        {/* Minimize Button */}
        <button
          onClick={() => setIsMinimized(true)}
          className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10 active:scale-90 transition shadow-lg"
          title="Minimize to floating window"
        >
          <ChevronDown className="w-5 h-5 text-amber-300" />
        </button>

        {/* Remote User Profile & Status */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-sm text-white font-heading">
              {call.remoteUser.name}
            </span>
            <span className="text-xs">{call.remoteUser.flag || '🇵🇰'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            {call.direction === 'connected' ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{formatTime(duration)}</span>
                {isAgoraConnected && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold flex items-center gap-1">
                    <span>⚡ Agora RTC</span>
                  </span>
                )}
              </span>
            ) : (
              <span className="text-amber-300 animate-pulse">Calling...</span>
            )}
          </div>
        </div>

        {/* Top Right Actions: Flip Camera & Heart Reaction */}
        <div className="flex items-center gap-2">
          {isVideoEnabled && (
            <button
              onClick={() => setIsFrontCamera(!isFrontCamera)}
              className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10 active:scale-90 transition shadow-lg"
              title="Flip Front / Rear Camera"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => triggerReaction('💖')}
            className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-pink-400 backdrop-blur-md border border-white/10 active:scale-90 transition shadow-lg"
            title="Send Heart"
          >
            <Heart className="w-5 h-5 fill-pink-500 text-pink-500" />
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* MAIN VIEWPORT                              */}
      {/* ========================================== */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center">
        {call.type === 'video' ? (
          /* VIDEO CALL VIEW */
          <div className="relative w-full h-full bg-[#110524] flex items-center justify-center">
            {/* Background Fullscreen Video Feed */}
            {isLocalMain ? (
              /* Local camera feed in full screen */
              <div className="relative w-full h-full overflow-hidden">
                <VideoFeed
                  stream={cameraStream}
                  isFrontCamera={isFrontCamera}
                  fallbackAvatar={currentUser.avatar}
                  fallbackName={currentUser.name}
                  filter={selectedFilter}
                  className="w-full h-full"
                />
              </div>
            ) : (
              /* Remote friend video feed in full screen */
              <div className="relative w-full h-full overflow-hidden bg-black">
                <img
                  src={call.remoteUser.avatar}
                  alt={call.remoteUser.name}
                  className="w-full h-full object-cover filter blur-[2px] brightness-75 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                {/* Remote Friend Avatar Presence */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 shadow-2xl">
                    <img
                      src={call.remoteUser.avatar}
                      alt={call.remoteUser.name}
                      className="w-full h-full rounded-full object-cover border-2 border-black"
                    />
                  </div>
                  <span className="text-xs font-bold text-white/90 mt-2 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                    Live Video · {call.remoteUser.name}
                  </span>
                </div>
              </div>
            )}

            {/* FLOATING PIP CAMERA CARD (Tap to swap!) */}
            <div
              onClick={() => setIsLocalMain(!isLocalMain)}
              className="absolute bottom-28 right-4 w-28 h-40 rounded-3xl overflow-hidden border-2 border-amber-400/90 shadow-2xl bg-black z-30 cursor-pointer group hover:scale-105 active:scale-95 transition"
              title="Tap to swap main and mini video"
            >
              {isLocalMain ? (
                /* Remote user in PIP */
                <img
                  src={call.remoteUser.avatar}
                  alt={call.remoteUser.name}
                  className="w-full h-full object-cover"
                />
              ) : isVideoEnabled ? (
                /* Local camera feed in PIP */
                <VideoFeed
                  stream={cameraStream}
                  isFrontCamera={isFrontCamera}
                  fallbackAvatar={currentUser.avatar}
                  fallbackName={currentUser.name}
                  filter={selectedFilter}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-purple-950 p-2 text-center">
                  <Camera className="w-6 h-6 text-purple-400 mb-1" />
                  <span className="text-[9px] text-purple-300 font-bold">Cam Off</span>
                </div>
              )}

              {/* Swap indicator badge */}
              <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 backdrop-blur-xs text-white opacity-70 group-hover:opacity-100 transition">
                <Layers className="w-3 h-3 text-amber-300" />
              </div>
            </div>
          </div>
        ) : (
          /* AUDIO CALL VIEW */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-radial from-[#1d083b] via-[#090214] to-black">
            {/* Animated Audio Waveform Ring */}
            <div className="relative mb-6">
              {call.direction === 'connected' && (
                <>
                  <div className="absolute -inset-6 rounded-full border-2 border-amber-400/40 animate-ping opacity-50" />
                  <div className="absolute -inset-12 rounded-full border border-pink-500/20 animate-pulse" />
                </>
              )}
              <div className="w-36 h-36 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 shadow-2xl">
                <img
                  src={call.remoteUser.avatar}
                  alt={call.remoteUser.name}
                  className="w-full h-full rounded-full object-cover border-4 border-black"
                />
              </div>
              <span className="absolute bottom-1 right-2 text-2xl filter drop-shadow">
                {call.remoteUser.flag || '🇵🇰'}
              </span>
            </div>

            <h2 className="text-2xl font-black text-white font-heading">
              {call.remoteUser.name}
            </h2>
            <p className="text-sm font-semibold text-purple-300 mt-1">
              {call.remoteUser.username}
            </p>

            {/* Realtime Waveform Animation */}
            {call.direction === 'connected' && (
              <div className="flex items-center gap-1.5 mt-6 h-8">
                {[14, 28, 20, 32, 16, 24, 30, 18, 26, 12].map((height, i) => (
                  <div
                    key={i}
                    style={{ height: `${height}px` }}
                    className="w-1 rounded-full bg-gradient-to-t from-amber-400 to-pink-500 animate-pulse"
                  />
                ))}
              </div>
            )}

            {/* Upgrade to video button */}
            <button
              onClick={toggleVideo}
              className="mt-6 px-4 py-2 rounded-full bg-purple-950/80 hover:bg-purple-900 border border-purple-700/80 text-xs font-bold text-amber-300 flex items-center gap-2 shadow-lg transition active:scale-95"
            >
              <Video className="w-4 h-4 text-pink-400" />
              <span>Switch to Video Call</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* QUICK REACTIONS BAR                        */}
      {/* ========================================== */}
      <div className="relative z-30 px-4 py-1.5 flex items-center justify-around bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        {['💛', '😂', '🔥', '🎉', '💖', '👏'].map((emoji) => (
          <button
            key={emoji}
            onClick={() => triggerReaction(emoji)}
            className="text-xl p-1.5 hover:scale-130 active:scale-90 transition transform"
            title={`Send ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* ========================================== */}
      {/* BOTTOM ACTION CONTROLS DOCK                */}
      {/* ========================================== */}
      <div className="relative z-30 px-6 pb-8 pt-2 flex items-center justify-around bg-gradient-to-t from-black via-black/95 to-transparent">
        {/* Mic Toggle */}
        <button
          onClick={toggleMute}
          className={`w-13 h-13 rounded-full flex items-center justify-center transition active:scale-90 shadow-xl ${
            isMuted
              ? 'bg-red-600 text-white'
              : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/10'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={toggleVideo}
          className={`w-13 h-13 rounded-full flex items-center justify-center transition active:scale-90 shadow-xl ${
            !isVideoEnabled
              ? 'bg-red-600 text-white'
              : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/10'
          }`}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Agora Beauty & Voice Filters Toggle */}
        <button
          onClick={() => setShowFilterPicker(!showFilterPicker)}
          className={`w-13 h-13 rounded-full flex items-center justify-center transition active:scale-90 shadow-xl ${
            showFilterPicker || selectedFilter !== 'none' || selectedVoiceEffect !== 'normal'
              ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-pink-500/40 ring-2 ring-amber-300'
              : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/10'
          }`}
          title="Agora Beauty & Voice Filters"
        >
          <Sparkles className="w-5 h-5 text-amber-200" />
        </button>

        {/* Swap Main / Mini Video */}
        {call.type === 'video' && (
          <button
            onClick={() => setIsLocalMain(!isLocalMain)}
            className="w-13 h-13 rounded-full flex items-center justify-center transition active:scale-90 shadow-xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/10"
            title="Swap Camera Views"
          >
            <Layers className="w-5 h-5 text-amber-300" />
          </button>
        )}

        {/* Speakerphone Toggle */}
        <button
          onClick={() => setIsSpeakerOn(!isSpeakerOn)}
          className={`w-13 h-13 rounded-full flex items-center justify-center transition active:scale-90 shadow-xl ${
            !isSpeakerOn
              ? 'bg-red-600 text-white'
              : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/10'
          }`}
          title={isSpeakerOn ? 'Mute speaker' : 'Turn on speaker'}
        >
          {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>

        {/* End Call Button */}
        <button
          onClick={handleEnd}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-xl shadow-red-600/50 active:scale-90 transition cursor-pointer"
          title="End Call"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>

      {/* ========================================== */}
      {/* AGORA BEAUTY & VOICE FILTERS DRAWER        */}
      {/* ========================================== */}
      {showFilterPicker && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-[#120524]/95 backdrop-blur-xl border-t border-purple-700/60 p-4 rounded-t-3xl shadow-2xl animate-fade-in-up max-w-md mx-auto">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-purple-800/60">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-gradient-to-tr from-amber-400 to-pink-500 text-white shadow">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-black text-white font-heading">Agora Live Filters & Voice FX</h4>
                <p className="text-[10px] text-purple-300">Beauty enhancement & Studio audio effects</p>
              </div>
            </div>
            <button
              onClick={() => setShowFilterPicker(false)}
              className="p-1 rounded-full bg-purple-950 text-purple-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section 1: Video Beauty Filters */}
          <div className="mb-3.5">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-2">
              ✨ Video Beauty Presets
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'beauty', label: '🌸 Beauty Glow', desc: 'Smooth skin & warm light' },
                { id: 'rosy', label: '🌹 Rosy Blush', desc: 'Natural rosy pink tint' },
                { id: 'golden', label: '☀️ Golden Sun', desc: 'Warm VIP studio' },
                { id: 'cyber', label: '⚡ Cyber Neon', desc: 'Club neon style' },
                { id: 'noir', label: '🎬 Classic Noir', desc: 'Black & white movie' },
                { id: 'none', label: '❌ Normal Feed', desc: 'Raw camera' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedFilter(f.id as any);
                    agoraService.setBeautyEffect(f.id !== 'none');
                    soundService.playCoinSound();
                  }}
                  className={`p-2 rounded-xl text-left border transition ${
                    selectedFilter === f.id
                      ? 'border-amber-400 bg-purple-900/80 shadow-md ring-1 ring-amber-400'
                      : 'border-purple-900/50 bg-purple-950/40 hover:bg-purple-900/40'
                  }`}
                >
                  <div className="text-[11px] font-bold text-white truncate">{f.label}</div>
                  <div className="text-[8px] text-purple-300 truncate">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Audio Voice Effects */}
          <div>
            <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block mb-2">
              🎙️ Voice Changer & Mic FX
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'normal', label: '🎙️ Clean Voice', desc: 'Original sound' },
                { id: 'echo', label: '🌌 Pulse VIP Reverb', desc: 'Auditorium echo' },
                { id: 'bass', label: '👑 VIP Deep Bass', desc: 'Deep warm tone' },
                { id: 'studio', label: '🎧 Studio Mic', desc: 'Pro podcast boost' },
                { id: 'robot', label: '🤖 Cyber Robot', desc: 'Futuristic robotic' },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVoiceEffect(v.id as any);
                    soundService.playCoinSound();
                  }}
                  className={`p-2 rounded-xl text-left border transition ${
                    selectedVoiceEffect === v.id
                      ? 'border-pink-400 bg-purple-900/80 shadow-md ring-1 ring-pink-400'
                      : 'border-purple-900/50 bg-purple-950/40 hover:bg-purple-900/40'
                  }`}
                >
                  <div className="text-[11px] font-bold text-white truncate">{v.label}</div>
                  <div className="text-[8px] text-purple-300 truncate">{v.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowFilterPicker(false)}
            className="w-full mt-3 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-bold text-xs border border-purple-800"
          >
            Apply & Close
          </button>
        </div>
      )}
    </div>
  );
};
