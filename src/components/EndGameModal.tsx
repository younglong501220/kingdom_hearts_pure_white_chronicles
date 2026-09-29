import React from 'react';
import { Trophy, RefreshCw, Flame, KeyRound, Sparkles } from 'lucide-react';
import { Keyblade } from '../types/game';

interface EndGameModalProps {
  isOpen: boolean;
  isWin: boolean;
  scoreWave: number;
  highestCombo: number;
  onRestart: (endless?: boolean) => void;
  unlockedKeyblade: Keyblade | null;
}

export const EndGameModal: React.FC<EndGameModalProps> = ({
  isOpen,
  isWin,
  scoreWave,
  highestCombo,
  onRestart,
  unlockedKeyblade,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(234,179,8,0.25)] flex flex-col items-center">
        {/* Glow Crown Icon */}
        <div className="w-20 h-20 rounded-full border-2 border-amber-400 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(250,204,21,0.6)]">
          {isWin ? (
            <Trophy className="w-10 h-10 text-amber-950" />
          ) : (
            <span className="text-4xl">💔</span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-amber-300 font-serif tracking-wider mb-2">
          {isWin ? '✨ 林地淨化成功！世界重獲光明 ✨' : '💔 心被黑暗吞噬...'}
        </h2>

        {/* Message */}
        <p className="text-sm text-slate-300 leading-relaxed max-w-md mb-6">
          {isWin
            ? '你成功擊敗了邪惡皇后的魔鏡幻影，驅散了覆蓋在森林上的暗影黑魔法！白雪公主的純潔之心綻放出永恆的光輝，世界恢復了平靜與生機。'
            : '純潔的光芒被皇后的黑魔法籠罩...但心靈深處微弱的光芒仍未熄滅！握緊鑰刃，不要放棄心之光芒！'}
        </p>

        {/* Battle Stats */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-semibold">突破波次</div>
            <div className="text-xl font-bold text-amber-400 font-mono">Wave {scoreWave}</div>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-semibold">最高連擊 (Max Combo)</div>
            <div className="text-xl font-bold text-emerald-400 font-mono">{highestCombo} Hits</div>
          </div>
        </div>

        {/* Keyblade Unlocked Notification */}
        {isWin && unlockedKeyblade && (
          <div className="w-full p-4 mb-6 bg-gradient-to-r from-emerald-950/60 to-slate-900 rounded-2xl border border-emerald-500/50 flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
              <KeyRound className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>獲得全新鑰刃獎勵！</span>
              </div>
              <div className="text-sm font-bold text-white mt-0.5">{unlockedKeyblade.name}</div>
              <div className="text-xs text-slate-400">{unlockedKeyblade.desc}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <button
            onClick={() => onRestart(false)}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-sm tracking-wide shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isWin ? '再次展開冒險' : '重新挑戰'}</span>
          </button>

          {isWin && (
            <button
              onClick={() => onRestart(true)}
              className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 border border-purple-400/40"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>挑戰無盡黑暗深淵</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
