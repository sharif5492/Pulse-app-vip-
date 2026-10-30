import React, { useState } from 'react';
import { usePWAInstall, useOnlineStatus } from '../../hooks/usePWAInstall';
import { Download, WifiOff, X, Sparkles } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  return (
    <>
      {/* Offline Alert */}
      {!isOnline && (
        <div className="fixed top-2 left-4 right-4 z-50 flex items-center justify-between p-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-2xl animate-pulse">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>Offline Mode — Cached party data is active</span>
          </div>
        </div>
      )}

      {/* PWA Install Button Banner */}
      {!isInstalled && !dismissed && (isInstallable || isIOS) && (
        <div className="fixed top-16 left-3 right-3 z-40 p-2.5 rounded-2xl bg-gradient-to-r from-purple-900/90 via-pink-900/90 to-amber-900/90 border border-amber-400/50 shadow-2xl backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500 text-white">
              <Download className="w-3.5 h-3.5" />
            </span>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                Install Pulse VIP App <Sparkles className="w-3 h-3 text-amber-300" />
              </div>
              <div className="text-[10px] text-purple-200">
                Faster launch, fullscreen & works offline!
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isInstallable ? (
              <button
                onClick={install}
                className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 text-white text-xs font-bold shadow hover:scale-105 active:scale-95 transition"
              >
                Install
              </button>
            ) : (
              <button
                onClick={() => setShowIOSGuide(true)}
                className="px-3 py-1 rounded-xl bg-purple-800 text-white text-xs font-bold hover:bg-purple-700 transition"
              >
                How to Install
              </button>
            )}

            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-full text-purple-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#17092e] border border-purple-800 p-6 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-white mb-2">Install on iPhone / iPad</h3>
            <p className="text-xs text-purple-200 leading-relaxed mb-4">
              1. Tap the <strong className="text-pink-400">Share button</strong> (square with arrow) in Safari.<br />
              2. Scroll down and tap <strong className="text-amber-400">Add to Home Screen</strong>.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-purple-900 text-white text-xs font-bold hover:bg-purple-800"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
