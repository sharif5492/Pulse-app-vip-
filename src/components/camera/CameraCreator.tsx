import React, { useState, useRef, useEffect } from 'react';
import { User, Reel } from '../../types';
import { FALLBACK_REEL_VIDEOS, FALLBACK_THUMBNAILS } from '../../services/storage';
import {
  Camera,
  Video,
  SwitchCamera,
  Sparkles,
  Music,
  Smile,
  X,
  Check,
  Disc3,
  Sliders,
  Send,
  Square,
  FolderUp,
  Film,
  UploadCloud,
  Image as ImageIcon,
  Tag,
  Hash,
  Plus,
  FileAudio,
  Globe,
  Lock,
  MessageSquare,
} from 'lucide-react';

interface CameraCreatorProps {
  currentUser: User;
  onClose: () => void;
  onPublishReel: (newReel: Reel) => void;
}

const MUSIC_TRACKS = [
  'Zara Khan - Raataan Lambiyan (Acoustic)',
  'DJ Kabir - Midnight Dubai Bass Mashup',
  'Acoustic Sufi Vibe - Pulse VIP Beats',
  'Trending Chill Hop & Tabla Remix',
  'Punjabi Dhol Beats 2026',
  'Sidhu Legend Instrumental',
  'Romantic Flute & Guitar Melody',
];

const TRENDING_TAGS = [
  '#PulseVIP',
  '#Trending',
  '#ViralReel',
  '#LiveParty',
  '#Music',
  '#Duet',
  '#ForYou',
  '#PakistaniTalent',
  '#Vlog',
  '#Dance',
];

const QUICK_EMOJIS = ['🔥', '❤️', '👑', '✨', '🎵', '🙌', '💃', '🇵🇰'];

export const CameraCreator: React.FC<CameraCreatorProps> = ({
  currentUser,
  onClose,
  onPublishReel,
}) => {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [selectedFilter, setSelectedFilter] = useState<'none' | 'beauty' | 'glam' | 'cyber' | 'noir' | 'vintage'>('beauty');
  const [selectedMusic, setSelectedMusic] = useState(MUSIC_TRACKS[0]);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [caption, setCaption] = useState('');
  const [capturedMedia, setCapturedMedia] = useState<{
    url: string;
    thumbnail: string;
    type: 'video' | 'photo';
    fileName?: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Tags & Hashtags state
  const [tags, setTags] = useState<string[]>(['#PulseVIP', '#Trending', '#Viral']);
  const [customTagInput, setCustomTagInput] = useState('');

  // Uploading state for permanent server disk saving
  const [isUploadingServer, setIsUploadingServer] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('Saving Reel permanently... 🚀');

  // Gallery Audio input
  const [customAudioFileName, setCustomAudioFileName] = useState<string | null>(null);

  // Reel privacy & comments settings
  const [allowComments, setAllowComments] = useState(true);
  const [visibility, setVisibility] = useState<'public' | 'friends'>('public');

  const handleAudioFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cleanName = file.name.replace(/\.[^/.]+$/, '').slice(0, 30);
    setCustomAudioFileName(file.name);
    setSelectedMusic(`🎵 ${cleanName} (Gallery Audio)`);
    setShowMusicPicker(false);
  };

  const handleAddTag = (tagToAdd?: string) => {
    const raw = tagToAdd || customTagInput;
    if (!raw.trim()) return;
    let clean = raw.trim();
    if (!clean.startsWith('#')) clean = `#${clean}`;
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setCustomTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    setCaption((prev) => `${prev} ${emoji}`.trim());
  };

  // Helper to extract first frame from video as image thumbnail
  const createThumbnailFromVideo = (videoSource: string, callback: (thumb: string) => void) => {
    try {
      const v = document.createElement('video');
      v.src = videoSource;
      v.muted = true;
      v.crossOrigin = 'anonymous';
      v.currentTime = 0.5;
      v.onloadeddata = () => {
        try {
          const c = document.createElement('canvas');
          c.width = v.videoWidth || 480;
          c.height = v.videoHeight || 640;
          const ctx = c.getContext('2d');
          if (ctx) {
            ctx.drawImage(v, 0, 0, c.width, c.height);
            const thumb = c.toDataURL('image/jpeg', 0.85);
            callback(thumb);
            return;
          }
        } catch {
          // ignore
        }
        callback('');
      };
      v.onerror = () => callback('');
    } catch {
      callback('');
    }
  };

  // Handle phone gallery video or image upload
  const handleGalleryFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video') || Boolean(file.name.match(/\.(mp4|mov|webm|mkv|3gp|avi)$/i));
    const fallbackThumb = FALLBACK_THUMBNAILS[Math.floor(Math.random() * FALLBACK_THUMBNAILS.length)];
    const fallbackVid = FALLBACK_REEL_VIDEOS[Math.floor(Math.random() * FALLBACK_REEL_VIDEOS.length)];

    if (!isVideo) {
      // Photo uploaded: convert to permanent Base64 Data URL so it never expires!
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setCapturedMedia({
          url: dataUrl,
          thumbnail: dataUrl,
          type: 'photo',
          fileName: file.name,
        });
      };
      reader.readAsDataURL(file);
    } else {
      // Video uploaded:
      // If <= 12MB, read as DataURL so it persists permanently without blob expiry
      if (file.size <= 12 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const videoDataUrl = ev.target?.result as string;
          createThumbnailFromVideo(videoDataUrl, (thumb) => {
            setCapturedMedia({
              url: videoDataUrl,
              thumbnail: thumb || fallbackThumb,
              type: 'video',
              fileName: file.name,
            });
          });
        };
        reader.readAsDataURL(file);
      } else {
        // Larger video: create object URL and generate thumbnail, with fallback backup
        const objectUrl = URL.createObjectURL(file);
        createThumbnailFromVideo(objectUrl, (thumb) => {
          setCapturedMedia({
            url: objectUrl,
            thumbnail: thumb || fallbackThumb,
            type: 'video',
            fileName: file.name,
          });
        });
      }
    }

    if (file.name) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setCaption(`🔥 ${cleanName} #PulseVIP #Trending`);
    }
  };

  // Initialize camera stream
  useEffect(() => {
    navigator.mediaDevices
      ?.getUserMedia({
        video: { facingMode },
        audio: true,
      })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.warn('Camera stream error, using canvas fallback', err);
      });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [facingMode]);

  // Record short video clip
  const startRecording = () => {
    if (!streamRef.current) return;
    recordedChunksRef.current = [];
    try {
      const mr = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/mp4' });
        // Snap current camera frame as thumbnail
        let snapThumb = '';
        if (videoRef.current) {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth || 480;
            canvas.height = videoRef.current.videoHeight || 640;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              snapThumb = canvas.toDataURL('image/jpeg', 0.85);
            }
          } catch {
            // ignore
          }
        }
        if (!snapThumb) snapThumb = FALLBACK_THUMBNAILS[0];

        // Convert blob to permanent DataURL
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          setCapturedMedia({
            url: dataUrl,
            thumbnail: snapThumb,
            type: 'video',
          });
        };
        reader.readAsDataURL(blob);
      };
      mr.start();
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordSeconds((s) => {
          if (s >= 15) {
            stopRecording();
            return 15;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      // Fallback photo snap
      snapPhoto();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  // Snap photo fallback
  const snapPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 480;
    canvas.height = videoRef.current.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedMedia({
        url: dataUrl,
        thumbnail: dataUrl,
        type: 'photo',
      });
    }
  };

  const handlePublish = async () => {
    if (!capturedMedia || isUploadingServer) return;

    setIsUploadingServer(true);
    setUploadProgressText('Uploading & saving to server disk... 🚀');

    const fallbackVid = FALLBACK_REEL_VIDEOS[0];
    const fallbackThumb = FALLBACK_THUMBNAILS[0];

    let finalVideo = capturedMedia.url || fallbackVid;
    let finalThumb = capturedMedia.thumbnail || capturedMedia.url || fallbackThumb;

    // If media is a data URL or blob, upload to server disk permanently
    if (finalVideo.startsWith('data:') || finalVideo.startsWith('blob:')) {
      try {
        let uploadPayload = finalVideo;
        if (finalVideo.startsWith('blob:')) {
          const blobRes = await fetch(finalVideo);
          const blobData = await blobRes.blob();
          uploadPayload = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blobData);
          });
        }

        const res = await fetch('/api/reels/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: capturedMedia.fileName || (capturedMedia.type === 'video' ? 'reel_video.mp4' : 'reel_photo.jpg'),
            fileData: uploadPayload,
            thumbnailData: finalThumb.startsWith('data:') ? finalThumb : undefined,
            type: capturedMedia.type,
          }),
        });

        if (res.ok) {
          const uploaded = await res.json();
          if (uploaded.videoUrl) {
            finalVideo = uploaded.videoUrl;
            finalThumb = uploaded.thumbnailUrl || uploaded.videoUrl;
          }
        }
      } catch (err) {
        console.warn('Direct upload error, saving with fallback:', err);
      }
    }

    if (!finalThumb || finalThumb.startsWith('blob:') || finalThumb.endsWith('.mp4')) {
      finalThumb = fallbackThumb;
    }

    const newReel: Reel = {
      id: `reel_${Date.now()}`,
      author: currentUser,
      videoUrl: finalVideo,
      thumbnail: finalThumb,
      title: caption.trim() || 'Vibing on Pulse VIP live! 🎵🔥',
      tags: tags.length > 0 ? tags : ['#PulseVIP', '#Trending', '#Viral'],
      musicTitle: selectedMusic,
      likesCount: 1,
      isLiked: false,
      commentsCount: 0,
      sharesCount: 0,
      comments: [],
    };

    setIsUploadingServer(false);
    onPublishReel(newReel);
    onClose();
  };

  const getFilterStyle = () => {
    switch (selectedFilter) {
      case 'beauty':
        return 'brightness(1.08) contrast(0.96) saturate(1.15)';
      case 'glam':
        return 'contrast(1.15) saturate(1.4) drop-shadow(0 0 10px rgba(255, 105, 180, 0.4))';
      case 'cyber':
        return 'hue-rotate(90deg) contrast(1.4) saturate(1.6)';
      case 'noir':
        return 'grayscale(1) contrast(1.3) brightness(0.9)';
      case 'vintage':
        return 'sepia(0.6) contrast(1.1) brightness(0.95)';
      default:
        return 'none';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white select-none">
      {/* Hidden File Input for Phone Gallery Video/Image */}
      <input
        type="file"
        ref={galleryInputRef}
        accept="video/*,image/*"
        className="hidden"
        onChange={handleGalleryFile}
      />

      {/* Hidden File Input for Phone Audio / Music from Gallery */}
      <input
        type="file"
        ref={audioInputRef}
        accept="audio/*"
        className="hidden"
        onChange={handleAudioFile}
      />

      {/* Top Header */}
      <div className="p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Music selector button */}
        <button
          onClick={() => setShowMusicPicker(!showMusicPicker)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-pink-500/40 text-xs font-semibold text-white max-w-[170px] truncate shadow"
        >
          <Music className="w-3.5 h-3.5 text-pink-400 shrink-0" />
          <span className="truncate">{selectedMusic.split(' - ')[0]}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Quick Upload from Gallery Button */}
          <button
            onClick={() => galleryInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-600 to-amber-500 text-white font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition"
            title="Upload from Phone Gallery"
          >
            <FolderUp className="w-3.5 h-3.5" />
            <span>Gallery</span>
          </button>

          <button
            onClick={() =>
              setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
            }
            className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Music Picker Drawer */}
      {showMusicPicker && (
        <div className="mx-4 p-4 rounded-3xl bg-[#17092e]/98 border border-pink-500/50 backdrop-blur-xl z-30 space-y-2.5 max-h-[70vh] overflow-y-auto no-scrollbar shadow-2xl">
          <div className="flex items-center justify-between border-b border-purple-800/60 pb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Music className="w-4 h-4 text-pink-400" /> Choose Reel Sound / Audio
            </span>
            <button
              onClick={() => setShowMusicPicker(false)}
              className="p-1 rounded-full bg-purple-950 text-purple-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Upload Custom Audio from Phone / Gallery */}
          <button
            onClick={() => audioInputRef.current?.click()}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-amber-500 hover:opacity-95 text-white font-bold text-xs flex items-center justify-between shadow-lg transition active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-white/20">
                <FileAudio className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-black text-xs">📁 Add Music from Phone Gallery</div>
                <div className="text-[10px] text-pink-100 font-normal">Select any MP3, WAV or song from your device</div>
              </div>
            </div>
            <Plus className="w-4 h-4" />
          </button>

          {/* Currently Selected Custom Audio */}
          {customAudioFileName && (
            <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-800 flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center gap-2 truncate">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Loaded: <strong>{customAudioFileName}</strong></span>
              </div>
              <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full font-bold">Active</span>
            </div>
          )}

          <div className="pt-1">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1.5">
              Or Pick Trending Preset Sound
            </span>
            <div className="space-y-1">
              {MUSIC_TRACKS.map((track, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedMusic(track);
                    setShowMusicPicker(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-medium transition flex items-center justify-between ${
                    selectedMusic === track
                      ? 'bg-pink-600 text-white font-bold shadow-md'
                      : 'text-purple-200 hover:bg-purple-900/50'
                  }`}
                >
                  <span className="truncate">🎵 {track}</span>
                  {selectedMusic === track && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Viewfinder / Review Mode */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black">
        {capturedMedia ? (
          <div className="w-full h-full relative">
            {capturedMedia.type === 'video' ? (
              <video
                src={capturedMedia.url}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={capturedMedia.url}
                alt="snap"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ) : (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ filter: getFilterStyle() }}
              className="w-full h-full object-cover -scale-x-100"
            />

            {/* Direct Gallery Upload Floating Pill */}
            {!isRecording && (
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/85 hover:bg-black border border-purple-500/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition group cursor-pointer"
              >
                <FolderUp className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
                <span>Upload Video from Phone Gallery</span>
              </button>
            )}

            {/* Recording timer indicator */}
            {isRecording && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                0:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds} / 0:15
              </div>
            )}
          </div>
        )}
      </div>

      {/* Capture Controls or Publish Editor */}
      <div className="p-4 bg-gradient-to-t from-black via-[#0d0319] to-transparent z-20 max-h-[70vh] overflow-y-auto no-scrollbar border-t border-purple-900/40">
        {capturedMedia ? (
          /* Full Reel Publish Settings Studio */
          <div className="space-y-3.5 animate-fade-in">
            {/* Header Status */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Reel Post Settings
              </span>
              {capturedMedia.fileName ? (
                <span className="text-[10px] text-purple-300 font-medium truncate max-w-[180px] bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-800 flex items-center gap-1">
                  <FolderUp className="w-3 h-3 text-pink-400 shrink-0" />
                  <span className="truncate">{capturedMedia.fileName}</span>
                </span>
              ) : (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ● Camera Clip Ready
                </span>
              )}
            </div>

            {/* 1. Background Music from Gallery or Presets */}
            <div className="p-3 rounded-2xl bg-[#140625] border border-purple-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <div className="p-1.5 rounded-xl bg-pink-500/20 text-pink-400 shrink-0">
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="truncate text-left">
                    <div className="text-[10px] text-purple-400 font-bold uppercase">Reel Music / Audio</div>
                    <div className="text-xs font-bold text-white truncate max-w-[200px]">
                      {selectedMusic}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 hover:opacity-90 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow transition active:scale-95"
                >
                  <FileAudio className="w-3.5 h-3.5 text-amber-300" />
                  <span>Gallery Se Music Lagaen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMusicPicker(true)}
                  className="py-1.5 px-3 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-200 font-semibold text-[11px] transition active:scale-95"
                >
                  Preset Music
                </button>
              </div>
            </div>

            {/* 2. Caption Textarea with Emoji Shortcuts */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                  <span>Reel Caption</span>
                </label>
                <span className="text-[10px] text-purple-400 font-mono">
                  {caption.length}/200
                </span>
              </div>
              <textarea
                value={caption}
                maxLength={200}
                rows={2}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption for your reel... (e.g. Aaj ki zabardast video! 🎵)"
                className="w-full bg-[#140625] border border-purple-800/80 rounded-2xl p-3 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/40 resize-none"
              />

              {/* Quick Emojis Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[10px] text-purple-400 font-semibold shrink-0 mr-1">
                  Quick Emoji:
                </span>
                {QUICK_EMOJIS.map((em, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInsertEmoji(em)}
                    className="w-7 h-7 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-xs flex items-center justify-center transition active:scale-90 shrink-0"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Tags & Hashtags Manager */}
            <div className="space-y-2 p-3 rounded-2xl bg-[#140625] border border-purple-800/80">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-pink-400" />
                  <span>Hashtags & Tags ({tags.length})</span>
                </label>
                <span className="text-[10px] text-purple-400">Click tag to add/remove</span>
              </div>

              {/* Selected Tags Pills */}
              <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-600/30 to-purple-600/30 border border-pink-500/50 text-[11px] font-bold text-pink-200 animate-fade-in"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-pink-400 hover:text-white ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Custom Tag Input */}
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-purple-400 text-xs font-bold">#</span>
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Type custom tag (e.g. PulseVIP)..."
                    className="w-full pl-7 pr-3 py-1.5 bg-purple-950/90 border border-purple-800 rounded-xl text-xs text-white placeholder-purple-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddTag()}
                  className="px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1 transition shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Trending Quick Suggestions */}
              <div>
                <span className="text-[10px] text-purple-400 font-semibold block mb-1">
                  Trending Suggestions:
                </span>
                <div className="flex flex-wrap gap-1">
                  {TRENDING_TAGS.map((sug) => {
                    const isSelected = tags.includes(sug);
                    return (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleToggleTag(sug)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
                          isSelected
                            ? 'bg-amber-500 text-black font-bold shadow'
                            : 'bg-purple-950/90 text-purple-300 hover:text-white border border-purple-800/80'
                        }`}
                      >
                        {isSelected ? `✓ ${sug}` : `+ ${sug}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. Privacy & Permissions */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/40 border border-purple-900/60 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setVisibility(visibility === 'public' ? 'friends' : 'public')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950 border border-purple-800 text-purple-200 font-medium"
                >
                  {visibility === 'public' ? (
                    <>
                      <Globe className="w-3 h-3 text-emerald-400" />
                      <span>Public (Everyone)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Friends Only</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setAllowComments(!allowComments)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
                  allowComments
                    ? 'bg-pink-600/20 border-pink-500/50 text-pink-300'
                    : 'bg-gray-800/40 border-gray-700 text-gray-400'
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                <span>Comments: {allowComments ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* 5. Publish Actions */}
            <div className="flex gap-2 pt-1 pb-1">
              <button
                type="button"
                disabled={isUploadingServer}
                onClick={() => setCapturedMedia(null)}
                className="w-1/3 py-3 rounded-2xl bg-purple-950/90 hover:bg-purple-900 border border-purple-800 text-purple-300 font-bold text-xs transition disabled:opacity-50"
              >
                Retake / Change
              </button>
              <button
                type="button"
                disabled={isUploadingServer}
                onClick={handlePublish}
                className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 hover:opacity-95 text-white font-black text-xs shadow-xl flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-75"
              >
                {isUploadingServer ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{uploadProgressText}</span>
                  </>
                ) : (
                  <>
                    <span>Publish to Reels</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Live Viewfinder Controls */
          <div>
            {/* Filter Pills */}
            <div className="flex gap-2 justify-center mb-4 overflow-x-auto no-scrollbar">
              {[
                { id: 'beauty', label: '🌸 Beauty' },
                { id: 'glam', label: '✨ Glam' },
                { id: 'cyber', label: '⚡ Cyber' },
                { id: 'noir', label: '🖤 Noir' },
                { id: 'vintage', label: '📼 90s' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id as typeof selectedFilter)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    selectedFilter === f.id
                      ? 'bg-gradient-to-r from-pink-500 to-amber-500 text-white shadow-md'
                      : 'bg-black/50 text-purple-300 hover:bg-black/80'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Shutter / Record / Gallery Upload Dock */}
            <div className="flex items-center justify-around">
              {/* Snap Photo */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={snapPhoto}
                  className="w-13 h-13 rounded-2xl bg-black/60 border border-white/15 text-purple-300 hover:text-white flex items-center justify-center transition active:scale-90"
                  title="Snap Photo"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <span className="text-[10px] text-purple-300 font-semibold">Photo</span>
              </div>

              {/* Central Video Recording Shutter */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
                    isRecording
                      ? 'border-red-500 bg-red-600/30 scale-110'
                      : 'border-white bg-gradient-to-tr from-pink-500 to-amber-400 active:scale-95 shadow-xl shadow-pink-500/40'
                  }`}
                  title={isRecording ? 'Stop Recording' : 'Record 15s Video'}
                >
                  {isRecording ? (
                    <Square className="w-8 h-8 fill-red-500 text-red-500" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-white" />
                  )}
                </button>
                <span className="text-[10px] text-amber-300 font-bold">
                  {isRecording ? 'Recording...' : 'Record 15s'}
                </span>
              </div>

              {/* Upload from Phone Gallery Button */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-800 to-pink-600 border border-pink-400/60 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-90 transition group cursor-pointer"
                  title="Choose Video from Phone Gallery"
                >
                  <FolderUp className="w-6 h-6 text-amber-300 group-hover:scale-110 transition" />
                </button>
                <span className="text-[10px] text-amber-300 font-bold">Gallery</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
