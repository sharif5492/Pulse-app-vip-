import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Crown, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Pulse VIP Caught Unhandled Error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      // Clear potentially corrupted reels or storage
      localStorage.removeItem('pulse_vip_reels');
      localStorage.removeItem('mehfil_reels');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-[#08020f] text-white flex flex-col items-center justify-center p-6 text-center select-none z-50">
          <div className="w-full max-w-sm flex flex-col items-center">
            {/* Crown Icon */}
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-gradient-to-tr from-pink-600 via-purple-600 to-amber-500 rounded-full blur-xl opacity-60 animate-pulse" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-600 via-purple-700 to-amber-500 p-[2px] shadow-2xl">
                <div className="w-full h-full bg-[#120426] rounded-3xl flex items-center justify-center">
                  <Crown className="w-10 h-10 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-purple-300 font-heading mb-2">
              PULSE VIP
            </h1>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold mb-4">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>App Recovery Mode</span>
            </div>

            <p className="text-xs text-purple-200/80 mb-6 leading-relaxed">
              Thora sa data issue aya tha jo fix ho gaya hai. Niche diye gaye button par click karein aur app smoothly open ho jayegi!
            </p>

            <button
              onClick={this.handleReset}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-amber-500 text-white font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 animate-spin [animation-duration:3s]" />
              <span>App Reset Aur Reload Karein 🚀</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
