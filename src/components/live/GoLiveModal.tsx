import React, { useState, useRef, useEffect } from 'react';
import { User, LiveStream } from '../../types';
import { Radio, Camera, Sparkles, X, SwitchCamera, Mic, MicOff } from 'lucide-react';

interface GoLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onStartLive: (newStream: LiveStream) => void;
}

const CATEGORIES = ['Singing', 'ChitChat', 'Gaming', 'DJ Club', 'Dancing', 'Talent'];

export const GoLiveModal: React.FC<GoLiveModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onStartLive,
}) => {
  const [title, setTitle] = useState(`${currentUser.name} Live ✨ Welcome!`);
  const [category, setCategory] = useState('Singing');
  const [beautyFilter, setBeautyFilter] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      return;
    }

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode }, audio: true })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.warn('Live preview camera error or denied', err);
      });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();

    const newStream: LiveStream = {
      id: `live_${Date.now()}`,
      streamer: currentUser,
      title: title.trim() || `${currentUser.name} Live Party`,
      category,
      viewerCount: 1,
      likesCount: 120,
      previewUrl: currentUser.avatar,
      isPKBattle: false,
    };

    onStartLive(newStream);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#140827] border border-purple-800/80 p-5 shadow-2xl relative max-h-[92vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-purple-300 hover:text-white z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Live Camera Viewfinder */}
        <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-black mb-4 border border-purple-700/50 shadow-inner">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover -scale-x-100 ${
              beautyFilter ? 'filter brightness-105 contrast-95 saturate-110 blur-[0.2px]' : ''
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

          {/* Camera controls overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase flex items-center gap-1 animate-pulse">
              <Radio className="w-3 h-3" /> PREVIEW
            </span>
            {beautyFilter && (
              <span className="px-2 py-0.5 rounded-full bg-pink-500/80 text-white text-[10px] font-bold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Beauty ON
              </span>
            )}
          </div>

          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBeautyFilter(!beautyFilter)}
              className={`p-2 rounded-full backdrop-blur-md text-xs font-bold transition ${
                beautyFilter ? 'bg-pink-600 text-white' : 'bg-black/60 text-purple-300'
              }`}
              title="Toggle Beauty Filter"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
              }
              className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition"
              title="Flip Camera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-2 rounded-full backdrop-blur-md transition ${
                isMicOn ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
              }`}
              title="Toggle Mic"
            >
              {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Live Setup Form */}
        <form onSubmit={handleLaunch} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-purple-200 mb-1.5 block">Live Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you doing today?"
              className="w-full bg-purple-950/70 border border-purple-800/70 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
              required
            />
          </div>

          {/* Category selection */}
          <div>
            <label className="text-xs font-bold text-purple-200 mb-1.5 block">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition ${
                    category === cat
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 border-pink-400 text-white shadow-md'
                      : 'bg-purple-950/40 border-purple-800/40 text-purple-300 hover:bg-purple-900/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-black text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Radio className="w-4 h-4 animate-pulse" /> Go Live Now!
          </button>
        </form>
      </div>
    </div>
  );
};
