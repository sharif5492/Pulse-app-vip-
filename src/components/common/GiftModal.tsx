import React, { useState, useMemo } from 'react';
import { GiftItem, User, Seat, VIP_LUXURY_GIFTS, CLASSIC_GIFTS } from '../../types';
import { soundService } from '../../services/soundService';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Send, Coins, Crown, ChevronDown, Check } from 'lucide-react';

interface GiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  currentUser: User;
  onSendGift: (gift: GiftItem, quantity: number, targetSeatId?: number, targetName?: string) => void;
  seats?: Seat[];
  initialSeatId?: number;
}

export const GiftModal: React.FC<GiftModalProps> = ({
  isOpen,
  onClose,
  targetName,
  currentUser,
  onSendGift,
  seats = [],
  initialSeatId,
}) => {
  const [activeTab, setActiveTab] = useState<'vip' | 'classic'>('vip');
  const [selectedGift, setSelectedGift] = useState<GiftItem>(VIP_LUXURY_GIFTS[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [isSending, setIsSending] = useState(false);

  // Target Seat logic
  const [selectedSeatId, setSelectedSeatId] = useState<number | 'all'>(
    initialSeatId !== undefined ? initialSeatId : 'all'
  );
  const [showSeatDropdown, setShowSeatDropdown] = useState(false);

  if (!isOpen) return null;

  const currentGiftsList = activeTab === 'vip' ? VIP_LUXURY_GIFTS : CLASSIC_GIFTS;
  const coinCostPerItem = selectedGift.coinValue || selectedGift.coins || 0;
  const totalCost = coinCostPerItem * quantity;
  const canAfford = currentUser.coins >= totalCost;

  // Resolve target description
  const targetSeat = typeof selectedSeatId === 'number' ? seats.find((s) => s.id === selectedSeatId) : null;
  const resolvedTargetName =
    selectedSeatId === 'all'
      ? `All ${seats.length || ''} Seats`
      : targetSeat?.user
      ? `${targetSeat.user.name} (Seat ${selectedSeatId + 1})`
      : `Seat ${typeof selectedSeatId === 'number' ? selectedSeatId + 1 : ''}`;

  const sendButtonText =
    selectedSeatId === 'all'
      ? `Send to All Seats`
      : `Send to Seat ${typeof selectedSeatId === 'number' ? selectedSeatId + 1 : ''}`;

  const handleSelectGift = (gift: GiftItem) => {
    setSelectedGift(gift);
    soundService.playCoinSound();
  };

  const handleSend = () => {
    if (!canAfford || isSending) return;
    setIsSending(true);

    const seatIdParam = typeof selectedSeatId === 'number' ? selectedSeatId : undefined;

    // Trigger global cinematic player hook if bound
    if (typeof (window as unknown as { playCinematicGift?: (giftName: string) => void }).playCinematicGift === 'function') {
      (window as unknown as { playCinematicGift: (giftName: string) => void }).playCinematicGift(selectedGift.name);
    }

    onSendGift(selectedGift, quantity, seatIdParam, resolvedTargetName);

    setTimeout(() => {
      setIsSending(false);
      onClose();
    }, 250);
  };

  const getRarityBadgeStyle = (rarity: string) => {
    switch (rarity) {
      case 'Legendary':
        return 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white';
      case 'Mythic':
        return 'bg-gradient-to-r from-fuchsia-500 to-amber-400 text-white';
      case 'Epic':
        return 'bg-gradient-to-r from-purple-600 to-cyan-400 text-white';
      case 'Rare':
        return 'bg-gradient-to-r from-cyan-600 to-blue-500 text-white';
      default:
        return 'bg-purple-900/80 text-purple-200 border border-purple-700/60';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm transition-opacity">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 220 }}
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#130726] border border-purple-800/80 p-4 sm:p-5 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-hidden text-white"
      >
        {/* Header with Title and Close */}
        <div className="flex items-center justify-between border-b border-purple-900/50 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-pink-500 text-white shadow-lg">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-black text-white text-sm sm:text-base font-heading flex items-center gap-1.5">
                VIP Gift Studio
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  3D Animation
                </span>
              </h3>
              <p className="text-[11px] text-purple-300">
                To: <span className="font-bold text-amber-400">{resolvedTargetName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-purple-950/80 hover:bg-purple-900 text-purple-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Balance and Target Seat Selector Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* User Coin Balance */}
          <div className="flex items-center justify-between bg-purple-950/60 border border-purple-800/50 rounded-xl px-3 py-2">
            <div className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] text-purple-200">Balance:</span>
            </div>
            <span className="font-bold text-amber-400 text-xs sm:text-sm">
              {currentUser.coins.toLocaleString()} Coins
            </span>
          </div>

          {/* Seat Picker Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSeatDropdown(!showSeatDropdown)}
              className="w-full flex items-center justify-between bg-purple-950/60 border border-purple-700/60 hover:border-amber-400/70 rounded-xl px-3 py-2 text-xs transition"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-purple-300 text-[11px]">Seat:</span>
                <span className="font-bold text-white truncate text-xs">
                  {selectedSeatId === 'all'
                    ? 'All Seats (Room)'
                    : `Seat ${typeof selectedSeatId === 'number' ? selectedSeatId + 1 : ''} ${
                        targetSeat?.user ? `(${targetSeat.user.name})` : ''
                      }`}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-purple-300 shrink-0 ml-1" />
            </button>

            {/* Dropdown Options */}
            {showSeatDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-[#190933] border border-purple-700 rounded-xl shadow-xl max-h-48 overflow-y-auto p-1.5 no-scrollbar text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSeatId('all');
                    setShowSeatDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                    selectedSeatId === 'all'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-purple-200 hover:bg-purple-900/50'
                  }`}
                >
                  <span>🚀 All Seats (Broadcast Gift)</span>
                  {selectedSeatId === 'all' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>

                {seats.map((seat) => (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => {
                      setSelectedSeatId(seat.id);
                      setShowSeatDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                      selectedSeatId === seat.id
                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                        : 'text-purple-200 hover:bg-purple-900/50'
                    }`}
                  >
                    <div className="truncate">
                      <span className="font-bold text-white">Seat {seat.id + 1}: </span>
                      <span className="text-purple-300">
                        {seat.user ? seat.user.name : '(Empty)'}
                      </span>
                    </div>
                    {selectedSeatId === seat.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2 Navigation Tabs: "VIP Luxury" and "Classic" */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-purple-950/70 border border-purple-800/60 rounded-2xl">
          <button
            onClick={() => {
              setActiveTab('vip');
              setSelectedGift(VIP_LUXURY_GIFTS[0]);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'vip'
                ? 'bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 text-white shadow-lg'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>VIP Luxury (20 Gifts)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('classic');
              setSelectedGift(CLASSIC_GIFTS[0]);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'classic'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-lg'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-pink-300" />
            <span>Classic Gifts</span>
          </button>
        </div>

        {/* Gifts Grid with 3D Preview Cards */}
        <div className="grid grid-cols-4 gap-2 overflow-y-auto max-h-56 py-1 pr-0.5 no-scrollbar">
          {currentGiftsList.map((gift) => {
            const isSelected = selectedGift.id === gift.id;
            return (
              <button
                key={gift.id}
                onClick={() => handleSelectGift(gift)}
                className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border transition-all text-center ${
                  isSelected
                    ? 'border-amber-400 bg-gradient-to-b from-purple-800/80 via-purple-900/60 to-amber-950/40 shadow-lg shadow-amber-500/25 scale-[1.04] ring-1 ring-amber-400'
                    : 'border-purple-900/50 bg-purple-950/30 hover:border-purple-700/60 hover:bg-purple-900/30'
                }`}
              >
                {/* Rarity Pill Badge */}
                <span
                  className={`absolute -top-1.5 inset-x-2 truncate text-[8px] font-black px-1 py-0.2 rounded-full shadow-sm ${getRarityBadgeStyle(
                    gift.rarity
                  )}`}
                >
                  {gift.rarity}
                </span>

                {/* Gift Emoji Icon with 3D drop-shadow */}
                <span className="text-3xl sm:text-4xl mt-2 mb-1 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] select-none">
                  {gift.icon}
                </span>

                {/* Gift Name */}
                <span className="text-[11px] font-bold text-white truncate max-w-full">
                  {gift.name}
                </span>

                {/* Coin Value with 🪙 badge */}
                <span className="text-[10px] font-extrabold text-amber-400 flex items-center gap-0.5 mt-0.5">
                  🪙 {gift.coinValue.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Multiplier / Quantity Pills */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-purple-900/40">
          <span className="text-xs text-purple-300 font-medium">Quantity:</span>
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            {[1, 5, 10, 66, 99, 520].map((qty) => (
              <button
                key={qty}
                onClick={() => setQuantity(qty)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                  quantity === qty
                    ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-md ring-1 ring-amber-400'
                    : 'bg-purple-950/70 text-purple-300 hover:bg-purple-900/60'
                }`}
              >
                x{qty}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions: Total Price and Send Button */}
        <div className="flex items-center justify-between border-t border-purple-900/50 pt-2.5 mt-0.5">
          <div>
            <div className="text-[10px] text-purple-300 font-medium">Total Cost</div>
            <div className="text-sm sm:text-base font-black text-amber-400 flex items-center gap-1">
              🪙 {totalCost.toLocaleString()}
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={!canAfford || isSending}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl transition active:scale-95 ${
              canAfford
                ? 'bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 hover:opacity-95 text-white shadow-amber-500/20'
                : 'bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-700'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{canAfford ? `${sendButtonText}` : 'Insufficient Coins'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
