import React, { useState, useRef, useEffect } from 'react';
import { Reel, User, GiftItem, ReelComment } from '../../types';
import { CommentsDrawer } from './CommentsDrawer';
import { GiftModal } from '../common/GiftModal';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Gift, Disc3, Plus, Check, FolderUp, Play, Maximize2, Minimize2 } from 'lucide-react';
import { FALLBACK_REEL_VIDEOS, FALLBACK_THUMBNAILS } from '../../services/storage';

interface ReelsFeedProps {
  reels: Reel[];
  currentUser: User;
  onUpdateReels: (reels: Reel[]) => void;
  onSendGiftToAuthor: (author: User, gift: GiftItem, quantity: number) => void;
  onStartCallWithAuthor?: (author: User, type: 'audio' | 'video') => void;
  onOpenUpload?: () => void;
}

export const ReelsFeed: React.FC<ReelsFeedProps> = ({
  reels,
  currentUser,
  onUpdateReels,
  onSendGiftToAuthor,
  onOpenUpload,
}) => {
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFitMode, setIsFitMode] = useState(true); // true = Natural Social Media Fit (never cropped/zoomed), false = Full Screen Fill
  const [activeCommentReel, setActiveCommentReel] = useState<Reel | null>(null);
  const [activeGiftAuthor, setActiveGiftAuthor] = useState<User | null>(null);
  const [showHeartBurst, setShowHeartBurst] = useState<{ id: string; x: number; y: number } | null>(null);
  const [followedAuthors, setFollowedAuthors] = useState<Record<string, boolean>>({});
  const [shareToast, setShareToast] = useState('');
  const [brokenVideos, setBrokenVideos] = useState<Record<string, boolean>>({});
  const [pausedStates, setPausedStates] = useState<Record<string, boolean>>({});

  const isImageReel = (url?: string) => {
    if (!url) return false;
    return (
      url.startsWith('data:image') ||
      Boolean(url.match(/\.(jpeg|jpg|png|webp|gif|svg)($|\?)/i))
    );
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Observe scroll to pause/play correct active video
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (vid) {
        if (idx === activeReelIndex) {
          vid.currentTime = 0;
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      }
    });
  }, [activeReelIndex]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const height = containerRef.current.clientHeight;
    const scrollTop = containerRef.current.scrollTop;
    const newIndex = Math.round(scrollTop / height);
    if (newIndex !== activeReelIndex && newIndex >= 0 && newIndex < reels.length) {
      setActiveReelIndex(newIndex);
    }
  };

  const handleToggleLike = (reelId: string) => {
    const updated = reels.map((r) => {
      if (r.id === reelId) {
        const isLiked = !r.isLiked;
        return {
          ...r,
          isLiked,
          likesCount: isLiked ? r.likesCount + 1 : r.likesCount - 1,
        };
      }
      return r;
    });
    onUpdateReels(updated);
  };

  // Double tap to like
  const handleDoubleTap = (e: React.MouseEvent<HTMLDivElement>, reelId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setShowHeartBurst({ id: reelId, x, y });
    setTimeout(() => setShowHeartBurst(null), 1000);

    const reel = reels.find((r) => r.id === reelId);
    if (reel && !reel.isLiked) {
      handleToggleLike(reelId);
    }
  };

  const handleAddComment = (reelId: string, comment: ReelComment) => {
    const updated = reels.map((r) => {
      if (r.id === reelId) {
        return {
          ...r,
          commentsCount: r.commentsCount + 1,
          comments: [comment, ...r.comments],
        };
      }
      return r;
    });
    onUpdateReels(updated);
    if (activeCommentReel && activeCommentReel.id === reelId) {
      setActiveCommentReel({
        ...activeCommentReel,
        commentsCount: activeCommentReel.commentsCount + 1,
        comments: [comment, ...activeCommentReel.comments],
      });
    }
  };

  const handleLikeComment = (reelId: string, commentId: string) => {
    const updated = reels.map((r) => {
      if (r.id === reelId) {
        return {
          ...r,
          comments: r.comments.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  isLiked: !c.isLiked,
                  likes: c.isLiked ? c.likes - 1 : c.likes + 1,
                }
              : c
          ),
        };
      }
      return r;
    });
    onUpdateReels(updated);
    if (activeCommentReel && activeCommentReel.id === reelId) {
      setActiveCommentReel(updated.find((r) => r.id === reelId) || null);
    }
  };

  const handleToggleFollow = (authorId: string) => {
    setFollowedAuthors((prev) => ({
      ...prev,
      [authorId]: !prev[authorId],
    }));
  };

  const handleShare = async (reel: Reel) => {
    const shareText = `Watch this trending reel on Pulse VIP: ${reel.title}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pulse VIP Reels',
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard?.writeText(window.location.href);
    setShareToast('Reel link copied to clipboard!');
    setTimeout(() => setShareToast(''), 3000);
  };

  return (
    <div className="relative w-full h-full max-w-md mx-auto bg-black overflow-hidden select-none flex-1">
      {/* Toast */}
      {shareToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full text-xs font-semibold shadow-xl animate-fade-in">
          {shareToast}
        </div>
      )}

      {/* Snap Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full snap-y snap-mandatory overflow-y-scroll no-scrollbar"
      >
        {reels.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-pink-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-1 font-heading">Abhi Koi Reel Nahi Hai</h3>
            <p className="text-xs text-purple-300/80 mb-5 max-w-xs">Pehle VIP creator banein aur apni gallery ya camera se reel upload karein!</p>
            {onOpenUpload && (
              <button
                onClick={onOpenUpload}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 text-white font-bold text-xs shadow-lg active:scale-95 transition flex items-center gap-1.5"
              >
                <FolderUp className="w-4 h-4" />
                <span>+ Upload Pehli Reel</span>
              </button>
            )}
          </div>
        ) : (
          reels.map((reel, index) => {
            const author = reel.author || {
              id: 'user_me',
              name: 'Muhammad Sharif',
              username: '@muhammad_sharif',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
              vipTier: 'Crown',
            };
            const isFollowed = !!followedAuthors[author.id];
            const isImage = isImageReel(reel.videoUrl);
            const isBroken = brokenVideos[reel.id];
            const isPaused = pausedStates[reel.id] ?? false;

            // Resilient video source that NEVER turns black
            const finalVideoSrc = isBroken
              ? FALLBACK_REEL_VIDEOS[index % FALLBACK_REEL_VIDEOS.length]
              : (reel.videoUrl && !reel.videoUrl.startsWith('blob:')
                  ? reel.videoUrl
                  : FALLBACK_REEL_VIDEOS[index % FALLBACK_REEL_VIDEOS.length]);

            // Resilient poster image
            const finalPosterSrc =
              reel.thumbnail &&
              !reel.thumbnail.startsWith('blob:') &&
              !reel.thumbnail.endsWith('.mp4')
                ? reel.thumbnail
                : FALLBACK_THUMBNAILS[index % FALLBACK_THUMBNAILS.length];

            const authorAvatar = author.avatar || FALLBACK_THUMBNAILS[0];
            const authorName = author.name || 'Pulse VIP User';
            const authorUsername = author.username || '@pulse_user';
            const likesCount = typeof reel.likesCount === 'number' ? reel.likesCount : 0;
            const commentsCount = typeof reel.commentsCount === 'number' ? reel.commentsCount : 0;
            const sharesCount = typeof reel.sharesCount === 'number' ? reel.sharesCount : 0;
            const tagsList = Array.isArray(reel.tags) ? reel.tags : ['#PulseVIP', '#Trending'];

            return (
              <div
                key={reel.id || `r_${index}`}
                className="relative w-full h-full snap-start snap-always flex items-center justify-center bg-black overflow-hidden"
                onDoubleClick={(e) => handleDoubleTap(e, reel.id)}
              >
                {/* Media Content: Photo Reel or Video */}
                {isImage ? (
                  <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-black">
                    {/* Ambient Blurred Backdrop Image */}
                    <img
                      src={reel.videoUrl || finalPosterSrc}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-40 scale-110 pointer-events-none"
                    />
                    {/* Crisp Foreground Image (Natural Fit) */}
                    <img
                      src={reel.videoUrl || finalPosterSrc}
                      alt={reel.title || 'Reel Photo'}
                      className={`relative z-10 w-full h-full ${
                        isFitMode ? 'object-contain max-h-full max-w-full' : 'object-cover'
                      } transition-all duration-300`}
                    />
                    <div className="absolute top-16 left-4 z-20 px-2.5 py-1 rounded-full bg-pink-600/80 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow-lg">
                      <span>📸 Photo Reel</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
                    {/* Ambient Blurred Backdrop Video (Fluid color fill like TikTok/IG) */}
                    <video
                      src={finalVideoSrc}
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-35 scale-110 pointer-events-none"
                    />

                    {/* Main Video (Natural Social Media Fit - Zero Awkward Over-Zoom) */}
                    <video
                      ref={(el) => {
                        videoRefs.current[index] = el;
                      }}
                      src={finalVideoSrc}
                      poster={finalPosterSrc}
                      loop
                      muted={isMuted}
                      playsInline
                      autoPlay={index === 0}
                      className={`relative z-10 w-full h-full ${
                        isFitMode ? 'object-contain max-h-full max-w-full' : 'object-cover'
                      } transition-all duration-300 pointer-events-auto`}
                      onError={() => {
                        setBrokenVideos((prev) => ({ ...prev, [reel.id]: true }));
                      }}
                      onPlay={() => setPausedStates((prev) => ({ ...prev, [reel.id]: false }))}
                      onPause={() => setPausedStates((prev) => ({ ...prev, [reel.id]: true }))}
                      onClick={() => {
                        const vid = videoRefs.current[index];
                        if (vid) {
                          if (vid.paused) {
                            vid.play().catch(() => {});
                            setPausedStates((prev) => ({ ...prev, [reel.id]: false }));
                          } else {
                            vid.pause();
                            setPausedStates((prev) => ({ ...prev, [reel.id]: true }));
                          }
                        }
                      }}
                    />

                    {/* Paused Play Icon Overlay */}
                    {isPaused && (
                      <div
                        onClick={() => {
                          const vid = videoRefs.current[index];
                          if (vid) {
                            vid.play().catch(() => {});
                            setPausedStates((prev) => ({ ...prev, [reel.id]: false }));
                          }
                        }}
                        className="absolute inset-0 flex items-center justify-center z-30 pointer-events-auto cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-2xl transition hover:scale-110">
                          <Play className="w-8 h-8 fill-white ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85 pointer-events-none" />

                {/* Double-tap Heart Animation */}
                {showHeartBurst && showHeartBurst.id === reel.id && (
                  <div
                    className="absolute pointer-events-none animate-float-heart z-40"
                    style={{ left: showHeartBurst.x - 30, top: showHeartBurst.y - 30 }}
                  >
                    <Heart className="w-16 h-16 text-pink-500 fill-pink-500 drop-shadow-lg" />
                  </div>
                )}

                {/* Top Left: Direct Upload Reel from Gallery */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <button
                    onClick={onOpenUpload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-purple-500/60 text-white text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition"
                    title="Upload Video from Phone Gallery"
                  >
                    <FolderUp className="w-3.5 h-3.5 text-pink-400" />
                    <span>+ Upload Reel</span>
                  </button>
                </div>

                {/* Top controls: Aspect Fit Toggle & Sound Mute */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  <button
                    onClick={() => setIsFitMode(!isFitMode)}
                    className="p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 hover:bg-black/70 transition shadow-lg active:scale-95"
                    title={isFitMode ? 'Fit: Tap for Fullscreen Fill' : 'Fill: Tap for Natural Aspect Fit'}
                  >
                    {isFitMode ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 hover:bg-black/70 transition shadow-lg active:scale-95"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Right Side Action Bar */}
                <div className="absolute right-2.5 bottom-8 z-20 flex flex-col items-center gap-3">
                  {/* Creator Avatar with follow button */}
                  <div className="relative mb-1">
                    <img
                      src={authorAvatar}
                      alt={authorName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-pink-500 shadow-lg"
                    />
                    <button
                      onClick={() => handleToggleFollow(author.id)}
                      className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shadow-md transition ${
                        isFollowed ? 'bg-purple-600' : 'bg-pink-600 hover:scale-110'
                      }`}
                    >
                      {isFollowed ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={() => handleToggleLike(reel.id)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div
                      className={`p-3 rounded-full backdrop-blur-md transition-all active:scale-125 ${
                        reel.isLiked
                          ? 'bg-pink-600/30 text-pink-500'
                          : 'bg-black/40 text-white hover:bg-black/60'
                      }`}
                    >
                      <Heart
                        className={`w-6 h-6 transition ${
                          reel.isLiked ? 'fill-pink-500 text-pink-500' : ''
                        }`}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-white drop-shadow">
                      {likesCount.toLocaleString()}
                    </span>
                  </button>

                  {/* Comments Button */}
                  <button
                    onClick={() => setActiveCommentReel(reel)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition active:scale-125">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-white drop-shadow">
                      {commentsCount}
                    </span>
                  </button>

                  {/* Send Gift Button */}
                  <button
                    onClick={() => setActiveGiftAuthor(author)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="p-3 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 text-white shadow-lg animate-pulse hover:scale-110 transition active:scale-125">
                      <Gift className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-amber-300 drop-shadow">
                      Gift
                    </span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={() => handleShare(reel)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition active:scale-125">
                      <Share2 className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-white drop-shadow">
                      {sharesCount}
                    </span>
                  </button>

                  {/* Rotating Vinyl Disc */}
                  <div className="relative mt-2">
                    <div className="w-10 h-10 rounded-full bg-neutral-900 border-2 border-purple-400 p-1 flex items-center justify-center animate-spin [animation-duration:4s]">
                      <img
                        src={authorAvatar}
                        alt="album"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <Disc3 className="w-3.5 h-3.5 text-pink-400 absolute -top-1 -right-1" />
                  </div>
                </div>

                {/* Bottom Caption & Audio Info */}
                <div className="absolute left-3.5 bottom-3.5 right-16 z-20 text-left">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-bold text-white text-sm tracking-wide flex items-center gap-1">
                      {authorName}
                      {author.vipTier === 'Crown' && <span>👑</span>}
                    </span>
                    <span className="text-[11px] text-pink-400 font-semibold">
                      {authorUsername}
                    </span>
                  </div>

                  <p className="text-xs text-white/90 line-clamp-2 leading-relaxed mb-2.5 drop-shadow">
                    {reel.title || 'Pulse VIP Trending Reel'}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {tagsList.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[11px] font-semibold text-purple-300 hover:text-white transition"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Music Track */}
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 w-fit max-w-[260px]">
                    <Disc3 className="w-3.5 h-3.5 text-pink-400 shrink-0 animate-spin" />
                    <span className="text-[11px] text-white truncate font-medium">
                      {reel.musicTitle || 'Original Audio - Pulse VIP'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Comments Drawer Modal */}
      {activeCommentReel && (
        <CommentsDrawer
          isOpen={!!activeCommentReel}
          onClose={() => setActiveCommentReel(null)}
          reel={activeCommentReel}
          currentUser={currentUser}
          onAddComment={handleAddComment}
          onLikeComment={handleLikeComment}
        />
      )}

      {/* Gift Modal */}
      {activeGiftAuthor && (
        <GiftModal
          isOpen={!!activeGiftAuthor}
          onClose={() => setActiveGiftAuthor(null)}
          targetName={activeGiftAuthor.name}
          currentUser={currentUser}
          onSendGift={(gift, qty) => onSendGiftToAuthor(activeGiftAuthor, gift, qty)}
        />
      )}
    </div>
  );
};
