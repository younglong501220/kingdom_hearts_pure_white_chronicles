import React from 'react';
import { Sparkles, Shield, Wind, Crosshair, Sword } from 'lucide-react';
import { MEDAL_SKILLS } from '../data/skills';
import { Keyblade, PlayerStats } from '../types/game';

interface KingdomHeartsHUDProps {
  player: PlayerStats;
  currentWave: number;
  totalWaves: number;
  endlessMode: boolean;
  bossHpPercent: number;
  cooldowns: Record<string, number>;
  onUseSkill: (id: 'doc' | 'grumpy' | 'snow' | 'blizzard' | 'dopey') => void;
  onTriggerUltimate: () => void;
  onAttackClick: () => void;
  onGuardClick: () => void;
  onDodgeClick: () => void;
  onTargetCycle: () => void;
  activeKeyblade: Keyblade;
}

export const KingdomHeartsHUD: React.FC<KingdomHeartsHUDProps> = ({
  player,
  currentWave,
  totalWaves,
  endlessMode,
  bossHpPercent,
  cooldowns,
  onUseSkill,
  onTriggerUltimate,
  onAttackClick,
  onGuardClick,
  onDodgeClick,
  onTargetCycle,
  activeKeyblade,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const mpPercent = Math.max(0, Math.min(100, (player.mp / player.maxMp) * 100));
  const purityPercent = Math.max(0, Math.min(100, (player.purity / player.maxPurity) * 100));
  const isUltimateReady = player.purity >= 100;
  const isBossWave = currentWave === 3 && !endlessMode;

  // Combo Rank title
  const getComboRank = (hits: number) => {
    if (hits >= 15) return { title: 'SSS SUPREME LIGHT', color: 'text-amber-300' };
    if (hits >= 10) return { title: 'EXCELLENT COMBO', color: 'text-yellow-400' };
    if (hits >= 6) return { title: 'GREAT STRIKE', color: 'text-sky-400' };
    if (hits >= 3) return { title: 'GOOD HIT', color: 'text-emerald-400' };
    return null;
  };

  const comboInfo = getComboRank(player.comboHits);

  return (
    <div className="absolute inset-0 pointer-events-none p-3 sm:p-5 flex flex-col justify-between overflow-hidden select-none">
      {/* TOP ROW: PLAYER STATUS & BOSS BAR */}
      <div className="flex justify-between items-start w-full">
        {/* PLAYER STATUS (Classic Kingdom Hearts Gauge) */}
        <div className="flex items-center gap-3 bg-slate-950/70 backdrop-blur-md p-2.5 rounded-2xl border border-amber-500/40 shadow-xl">
          {/* Avatar frame */}
          <div className="relative w-14 h-14 rounded-full border-2 border-amber-400 bg-gradient-to-br from-indigo-900 via-slate-900 to-black flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-2xl filter drop-shadow">🗝️</span>
            {player.guardTime > 0 && (
              <div className="absolute inset-0 rounded-full border-2 border-yellow-300 animate-ping" />
            )}
            {player.dodgeTime > 0 && (
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-pulse" />
            )}
          </div>

          {/* Health, MP, and Pure Light Bars */}
          <div className="flex flex-col gap-1.5 w-44 sm:w-56">
            {/* HP Bar */}
            <div className="relative w-full h-3.5 bg-slate-800/90 rounded-full border border-emerald-900 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 via-green-400 to-emerald-300 transition-all duration-150"
                style={{ width: `${hpPercent}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-bold text-white tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                HP {Math.ceil(player.hp)} / {player.maxHp}
              </span>
            </div>

            {/* MP Bar */}
            <div className="relative w-full h-3.5 bg-slate-800/90 rounded-full border border-sky-900 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300 transition-all duration-150"
                style={{ width: `${mpPercent}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-bold text-white tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                MP {Math.floor(player.mp)} / {player.maxMp}
              </span>
            </div>

            {/* Pure Light (Drive Bar) */}
            <div className="relative w-full h-3.5 bg-slate-800/90 rounded-full border border-amber-700 overflow-hidden shadow-inner">
              <div
                className={`h-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-200 transition-all duration-150 ${
                  isUltimateReady ? 'animate-pulse' : ''
                }`}
                style={{ width: `${purityPercent}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-bold text-amber-100 tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                純潔之光 {Math.floor(purityPercent)}%
              </span>
            </div>
          </div>
        </div>

        {/* TOP CENTER: WAVE INFO */}
        <div className="bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-500/30 text-xs font-semibold text-amber-300 tracking-wider shadow-md">
          {endlessMode ? `無盡深淵 · WAVE ${currentWave}` : `童話林地 · WAVE ${currentWave} / ${totalWaves}`}
        </div>

        {/* TOP RIGHT: BOSS HEALTH BAR */}
        {isBossWave && (
          <div className="w-56 sm:w-72 bg-slate-950/80 backdrop-blur-md p-2 rounded-2xl border border-red-500/50 shadow-xl flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs font-bold text-red-400 tracking-wide px-1">
              <span>🦹 邪惡皇后 & 魔鏡</span>
              <span>{Math.ceil(bossHpPercent)}%</span>
            </div>
            <div className="relative w-full h-3.5 bg-slate-900 rounded-full border border-red-800 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-red-700 via-rose-500 to-red-400 transition-all duration-150"
                style={{ width: `${bossHpPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* COMBO COUNTER DISPLAY */}
      {player.comboHits > 1 && comboInfo && (
        <div className="absolute left-8 top-28 pointer-events-none flex flex-col items-start animate-bounce">
          <div className="text-3xl font-black italic tracking-tighter text-amber-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {player.comboHits} <span className="text-xl">HITS!</span>
          </div>
          <div className={`text-xs font-bold tracking-widest uppercase ${comboInfo.color} drop-shadow`}>
            {comboInfo.title}
          </div>
        </div>
      )}

      {/* BOTTOM ROW: CONTROLS & COMMAND DECK */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
        {/* KH Classic Action Buttons (Attack, Guard, Dodge, Lock-On) */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-950/80 backdrop-blur-md p-2 rounded-2xl border border-amber-500/30 shadow-2xl">
          <button
            onClick={onAttackClick}
            title="快捷鍵: Z / 空白鍵"
            className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 active:scale-95 text-white font-bold border border-amber-400/60 shadow-lg transition-transform"
          >
            <Sword className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">攻擊 [Z]</span>
          </button>

          <button
            onClick={onGuardClick}
            title="快捷鍵: X"
            className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-b from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 active:scale-95 text-white font-bold border border-sky-400/60 shadow-lg transition-transform"
          >
            <Shield className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">防禦 [X]</span>
          </button>

          <button
            onClick={onDodgeClick}
            title="快捷鍵: C"
            className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-b from-emerald-700 to-emerald-900 hover:from-emerald-600 hover:to-emerald-800 active:scale-95 text-white font-bold border border-emerald-400/60 shadow-lg transition-transform"
          >
            <Wind className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">閃避 [C]</span>
          </button>

          <button
            onClick={onTargetCycle}
            title="快捷鍵: Q / Tab"
            className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 active:scale-95 text-white font-bold border border-slate-500/60 shadow-lg transition-transform"
          >
            <Crosshair className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">鎖定 [Q]</span>
          </button>
        </div>

        {/* COMMAND DECK MEDALS (The 7 Dwarfs & Magic) */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-950/80 backdrop-blur-md p-2 rounded-2xl border border-amber-500/30 shadow-2xl">
          {MEDAL_SKILLS.map((skill, index) => {
            const cd = cooldowns[skill.id] || 0;
            const hasMp = player.mp >= skill.mpCost;
            const cdSeconds = Math.ceil(cd / 60);

            return (
              <button
                key={skill.id}
                onClick={() => onUseSkill(skill.id)}
                disabled={cd > 0 || !hasMp}
                title={`${skill.description} (快捷鍵: ${index + 1})`}
                className="relative group w-14 h-16 sm:w-16 sm:h-20 rounded-xl bg-gradient-to-b from-slate-800 to-slate-950 hover:from-slate-700 hover:to-slate-900 disabled:opacity-40 disabled:cursor-not-allowed border border-amber-500/40 hover:border-amber-400 active:scale-95 transition-all flex flex-col items-center justify-center p-1 shadow-lg"
              >
                {/* Hotkey tag */}
                <span className="absolute top-1 left-1.5 text-[9px] font-bold text-amber-400/70 font-mono">
                  {index + 1}
                </span>

                <div className="text-xl sm:text-2xl mb-0.5">{skill.icon}</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-white text-center leading-tight truncate w-full px-0.5">
                  {skill.name}
                </div>
                <div className="text-[9px] text-sky-400 font-mono mt-0.5">
                  MP {skill.mpCost}
                </div>

                {/* Cooldown Overlay */}
                {cd > 0 && (
                  <div className="absolute inset-0 bg-black/80 rounded-xl flex items-center justify-center font-bold text-amber-300 text-lg sm:text-xl font-mono">
                    {cdSeconds}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ULTIMATE BUTTON (Pure White Light / Trinity Limit) */}
        <div className="pointer-events-auto">
          {isUltimateReady ? (
            <button
              onClick={onTriggerUltimate}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 border-2 border-white shadow-[0_0_25px_rgba(250,204,21,0.9)] flex flex-col items-center justify-center active:scale-95 transition-transform hover:scale-105 cursor-pointer animate-pulse"
            >
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-amber-950" />
              <span className="text-[9px] sm:text-[10px] font-black text-amber-950 tracking-wider">
                純白之光
              </span>
            </button>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900/60 border border-slate-700/60 flex flex-col items-center justify-center text-slate-500">
              <Sparkles className="w-5 h-5 opacity-40" />
              <span className="text-[9px] font-bold">蓄能中</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
