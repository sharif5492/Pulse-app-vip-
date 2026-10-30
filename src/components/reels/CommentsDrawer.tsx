import React, { useState } from 'react';
import { Reel, ReelComment, User } from '../../types';
import { X, Send, Heart } from 'lucide-react';

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reel: Reel;
  currentUser: User;
  onAddComment: (reelId: string, comment: ReelComment) => void;
  onLikeComment: (reelId: string, commentId: string) => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  isOpen,
  onClose,
  reel,
  currentUser,
  onAddComment,
  onLikeComment,
}) => {
  const [commentText, setCommentText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: ReelComment = {
      id: `c_${Date.now()}`,
      user: currentUser,
      text: commentText.trim(),
      timestamp: 'Just now',
      likes: 0,
      isLiked: false,
    };

    onAddComment(reel.id, newComment);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-t-3xl bg-[#140827] border-t border-purple-800/60 p-4 shadow-2xl flex flex-col h-[70vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
          <div className="text-center w-full">
            <span className="font-bold text-white text-sm">
              {reel.comments.length} Comments
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-purple-950/60 text-purple-300 hover:text-white absolute right-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 no-scrollbar">
          {reel.comments.length === 0 ? (
            <div className="text-center py-10 text-purple-400 text-xs">
              No comments yet. Be the first to start the conversation!
            </div>
          ) : (
            reel.comments.map((comment) => (
              <div key={comment.id} className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.name}
                    className="w-8 h-8 rounded-full object-cover border border-purple-500/50"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">
                        {comment.user.name}
                      </span>
                      <span className="text-[10px] text-purple-400">
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-purple-100 mt-0.5">{comment.text}</p>
                  </div>
                </div>

                <button
                  onClick={() => onLikeComment(reel.id, comment.id)}
                  className="flex flex-col items-center gap-0.5 pt-1 text-purple-400 hover:text-pink-500 transition"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      comment.isLiked ? 'fill-pink-500 text-pink-500' : ''
                    }`}
                  />
                  <span className="text-[10px] font-semibold">{comment.likes}</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Comment input form */}
        <form
          onSubmit={handleSubmit}
          className="pt-3 border-t border-purple-900/40 flex items-center gap-2"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover border border-amber-400"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment on this reel..."
              className="w-full bg-purple-950/70 border border-purple-800/60 rounded-full px-4 py-2 text-xs text-white placeholder-purple-400/60 focus:outline-none focus:border-pink-500"
            />
          </div>
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white disabled:opacity-40 transition shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
