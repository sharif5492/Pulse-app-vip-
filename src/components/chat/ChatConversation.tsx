import React, { useState, useRef, useEffect } from 'react';
import { User, ChatMessage } from '../../types';
import {
  ArrowLeft,
  Phone,
  Video,
  Mic,
  Square,
  Play,
  Pause,
  Image as ImageIcon,
  Send,
  MoreVertical,
  Paperclip,
  CheckCheck,
} from 'lucide-react';

interface ChatConversationProps {
  friend: User;
  currentUser: User;
  messages: ChatMessage[];
  onSendMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  onBack: () => void;
  onStartCall: (type: 'audio' | 'video') => void;
}

export const ChatConversation: React.FC<ChatConversationProps> = ({
  friend,
  currentUser,
  messages,
  onSendMessage,
  onBack,
  onStartCall,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice note recording logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          onSendMessage({
            senderId: currentUser.id,
            receiverId: friend.id,
            type: 'voice',
            content: base64Audio,
            voiceDuration: recordDuration || 3,
            status: 'sent',
          });
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      recordTimerRef.current = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission denied, using simulated voice note', err);
      // Fallback voice note if mic denied
      setTimeout(() => {
        onSendMessage({
          senderId: currentUser.id,
          receiverId: friend.id,
          type: 'voice',
          content: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
          voiceDuration: 4,
          status: 'sent',
        });
      }, 500);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    setIsRecording(false);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage({
      senderId: currentUser.id,
      receiverId: friend.id,
      type: 'text',
      content: inputText.trim(),
      status: 'sent',
    });

    setInputText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video');
    const reader = new FileReader();
    reader.onload = () => {
      onSendMessage({
        senderId: currentUser.id,
        receiverId: friend.id,
        type: isVideo ? 'video' : 'image',
        content: reader.result as string,
        status: 'sent',
      });
    };
    reader.readAsDataURL(file);
  };

  const togglePlayAudio = (msgId: string, audioUrl: string) => {
    if (playingAudioId === msgId) {
      activeAudioRef.current?.pause();
      setPlayingAudioId(null);
      return;
    }

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    activeAudioRef.current = audio;
    audio.play().catch(() => {});
    setPlayingAudioId(msgId);

    audio.onended = () => {
      setPlayingAudioId(null);
    };
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#0c0419] text-white flex-1 overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3.5 bg-[#140827] border-b border-purple-900/40">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-purple-900/60 text-purple-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative">
            <img
              src={friend.avatar}
              alt={friend.name}
              className="w-10 h-10 rounded-full object-cover border border-amber-400"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#140827]" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1">
              {friend.name}
              {friend.vipTier === 'Crown' && <span>👑</span>}
            </h3>
            <span className="text-[11px] text-emerald-400">Online</span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 text-purple-300">
          <button
            onClick={() => onStartCall('audio')}
            className="p-2 rounded-full hover:bg-purple-900/60 hover:text-white transition"
            title="Audio Call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => onStartCall('video')}
            className="p-2 rounded-full hover:bg-purple-900/60 hover:text-white transition"
            title="Video Call"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUser.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl p-3 shadow-md ${
                  isMine
                    ? 'bg-gradient-to-tr from-purple-700 to-pink-600 text-white rounded-br-xs'
                    : 'bg-[#1b0d35] border border-purple-800/40 text-purple-100 rounded-bl-xs'
                }`}
              >
                {/* Text message */}
                {msg.type === 'text' && (
                  <p className="text-xs leading-relaxed break-words">{msg.content}</p>
                )}

                {/* Voice note message */}
                {msg.type === 'voice' && (
                  <div className="flex items-center gap-3 py-1 min-w-[170px]">
                    <button
                      onClick={() => togglePlayAudio(msg.id, msg.content)}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition shrink-0"
                    >
                      {playingAudioId === msg.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>

                    {/* Waveform graphic */}
                    <div className="flex-1 flex items-center gap-0.5 h-6">
                      {[12, 22, 16, 28, 14, 20, 26, 15, 24, 18, 12].map((height, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full ${
                            playingAudioId === msg.id
                              ? 'bg-amber-400 animate-pulse'
                              : 'bg-white/50'
                          }`}
                          style={{ height: `${height}px` }}
                        />
                      ))}
                    </div>

                    <span className="text-[10px] font-mono opacity-80 shrink-0">
                      0:0{msg.voiceDuration || 4}
                    </span>
                  </div>
                )}

                {/* Image message */}
                {msg.type === 'image' && (
                  <div className="rounded-xl overflow-hidden max-h-60 max-w-xs">
                    <img
                      src={msg.content}
                      alt="shared"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Video message */}
                {msg.type === 'video' && (
                  <div className="rounded-xl overflow-hidden max-h-60 max-w-xs">
                    <video
                      src={msg.content}
                      controls
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Timestamp & status */}
                <div
                  className={`flex items-center gap-1 mt-1 text-[9px] opacity-70 ${
                    isMine ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isMine && <CheckCheck className="w-3 h-3 text-cyan-300" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recording Overlay / Bottom input bar */}
      {isRecording ? (
        <div className="p-3 bg-[#140827] border-t border-purple-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-mono font-bold text-red-400">
              Recording Voice Note: 0:{recordDuration < 10 ? `0${recordDuration}` : recordDuration}
            </span>
          </div>

          <button
            onClick={stopRecording}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg transition"
          >
            <Square className="w-3.5 h-3.5 fill-white" /> Stop & Send
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSendText}
          className="p-3 bg-[#140827] border-t border-purple-900/40 flex items-center gap-2"
        >
          {/* File input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full bg-purple-950/80 text-purple-300 hover:text-white transition"
            title="Attach Image or Video"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-purple-950/70 border border-purple-800/60 rounded-full px-4 py-2.5 text-xs text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500"
          />

          {/* Send Voice Note or Text */}
          {inputText.trim() ? (
            <button
              type="submit"
              className="p-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md active:scale-95 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="p-2.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white shadow-md active:scale-95 transition"
              title="Record Voice Note"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </form>
      )}
    </div>
  );
};
