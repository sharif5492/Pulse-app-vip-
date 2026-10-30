import React, { useRef, useEffect } from 'react';
import { Camera, VideoOff } from 'lucide-react';

interface VideoFeedProps {
  stream: MediaStream | null;
  isFrontCamera?: boolean;
  className?: string;
  fallbackAvatar?: string;
  fallbackName?: string;
  filter?: 'none' | 'beauty' | 'rosy' | 'golden' | 'cyber' | 'noir';
}

const FILTER_STYLES: Record<string, string> = {
  none: '',
  beauty: 'contrast(106%) brightness(108%) saturate(112%)',
  rosy: 'brightness(104%) saturate(125%) hue-rotate(-8deg)',
  golden: 'sepia(22%) saturate(125%) brightness(106%)',
  cyber: 'contrast(115%) saturate(135%) hue-rotate(170deg)',
  noir: 'grayscale(100%) contrast(120%)',
};

export const VideoFeed: React.FC<VideoFeedProps> = ({
  stream,
  isFrontCamera = true,
  className = '',
  fallbackAvatar,
  fallbackName,
  filter = 'beauty',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream) {
      video.srcObject = stream;
      video.play().catch((err) => {
        console.warn('Video play interrupted or muted required', err);
      });
    } else {
      video.srcObject = null;
    }
  }, [stream]);

  if (!stream) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-[#0d041e] text-center p-4 ${className}`}
      >
        {fallbackAvatar ? (
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-600/50 shadow-xl">
              <img
                src={fallbackAvatar}
                alt={fallbackName || 'User'}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-red-600 text-white shadow">
              <VideoOff className="w-3.5 h-3.5" />
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-purple-400">
            <Camera className="w-8 h-8 mb-2 opacity-60" />
            <span className="text-xs font-semibold">Camera Off</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-black ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ filter: FILTER_STYLES[filter] || undefined }}
        className={`w-full h-full object-cover ${
          isFrontCamera ? 'scale-x-[-1]' : 'scale-x-100'
        } transition-transform duration-300`}
      />
    </div>
  );
};
