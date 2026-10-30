import React, { useState } from 'react';
import { soundService } from '../../services/soundService';
import confetti from 'canvas-confetti';
import { Dices, Sparkles, X, Trophy } from 'lucide-react';

interface LudoDiceGameProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardCoins: (amount: number) => void;
  onBroadcastRoll: (dice1: number, dice2: number, total: number) => void;
}

export const LudoDiceGame: React.FC<LudoDiceGameProps> = ({
  isOpen,
  onClose,
  onRewardCoins,
  onBroadcastRoll,
}) => {
  const [dice1, setDice1] = useState(6);
  const [dice2, setDice2] = useState(6);
  const [isRolling, setIsRolling] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);

  if (!isOpen) return null;

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    soundService.playDiceRoll();

    let count = 0;
    const interval = setInterval(() => {
      setDice1(Math.floor(Math.random() * 6) + 1);
      setDice2(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 8) {
        clearInterval(interval);
        const final1 = Math.floor(Math.random() * 6) + 1;
        const final2 = Math.floor(Math.random() * 6) + 1;
        setDice1(final1);
        setDice2(final2);
        setIsRolling(false);

        const total = final1 + final2;
        onBroadcastRoll(final1, final2, total);

        // Win calculation
        let reward = total * 50;
        if (final1 === 6 && final2 === 6) {
          reward = 2000; // Double Six Jackpot
          confetti({ particleCount: 100, spread: 80 });
          soundService.playGiftFanfare();
        } else if (final1 === final2) {
          reward = total * 150; // Pair bonus
          confetti({ particleCount: 50 });
        }
        setLastWin(reward);
        onRewardCoins(reward);
      }
    }, 80);
  };

  const renderDiceFace = (val: number) => {
    return (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 border-2 border-white shadow-xl flex items-center justify-center text-3xl font-black text-purple-950 font-mono shadow-amber-500/20">
        {val}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl bg-[#17092e] border border-amber-500/40 p-6 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-purple-950/60 text-purple-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-2 text-amber-400">
          <Dices className="w-6 h-6 animate-spin [animation-duration:6s]" />
          <h3 className="text-xl font-black font-heading tracking-wide text-white">
            Pulse VIP Lucky Dice
          </h3>
        </div>
        <p className="text-xs text-purple-300 mb-6">
          Roll for good luck in the room! Double six wins 2,000 Coins 🪙
        </p>

        {/* Dice Visuals */}
        <div className="flex items-center justify-center gap-6 my-6">
          <div className={isRolling ? 'animate-bounce' : ''}>
            {renderDiceFace(dice1)}
          </div>
          <div className={isRolling ? 'animate-bounce' : ''}>
            {renderDiceFace(dice2)}
          </div>
        </div>

        {/* Roll Total */}
        <div className="text-sm font-bold text-purple-200 mb-4">
          Total:{' '}
          <span className="text-amber-400 text-lg font-mono">
            {dice1 + dice2}
          </span>
        </div>

        {lastWin !== null && (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>You won +{lastWin} Coins!</span>
          </div>
        )}

        {/* Roll Button */}
        <button
          onClick={rollDice}
          disabled={isRolling}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:opacity-95 text-white font-black text-sm shadow-xl shadow-amber-500/20 transition active:scale-95 disabled:opacity-50"
        >
          {isRolling ? 'Rolling Dice...' : 'Roll Dice (Free) 🎲'}
        </button>
      </div>
    </div>
  );
};
