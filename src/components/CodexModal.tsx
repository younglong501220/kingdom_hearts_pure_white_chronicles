import React, { useState } from 'react';
import { BookOpen, X, Shield, Swords, Sparkles, KeyRound } from 'lucide-react';
import { INITIAL_KEYBLADES, MEDAL_SKILLS } from '../data/skills';
import { Keyblade } from '../types/game';

interface CodexModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyblades: Keyblade[];
  activeKeyblade: Keyblade;
  onSelectKeyblade: (kb: Keyblade) => void;
}

export const CodexModal: React.FC<CodexModalProps> = ({
  isOpen,
  onClose,
  keyblades,
  activeKeyblade,
  onSelectKeyblade,
}) => {
  const [activeTab, setActiveTab] = useState<'story' | 'controls' | 'medals' | 'keyblades'>('story');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-amber-300 font-serif tracking-wide">
              吉米尼日記 · 童話林地編年史 (Jiminy's Journal)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 gap-2 bg-slate-950/40">
          {[
            { id: 'story', label: '世界物語', icon: Sparkles },
            { id: 'controls', label: '戰鬥操作指南', icon: Swords },
            { id: 'medals', label: '矮人戰術勳章', icon: Shield },
            { id: 'keyblades', label: '鑰刃寶庫', icon: KeyRound },
          ].map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs font-bold transition-all ${
                  isCurrent
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-300 leading-relaxed">
          {activeTab === 'story' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <h3 className="font-bold text-amber-300 text-base mb-1 font-serif">
                  ✨ 純潔之心七公主與矮人林地
                </h3>
                <p className="text-xs text-amber-100/90 leading-relaxed">
                  在浩瀚的世界之海中，白雪公主擁有未受絲毫黑暗侵蝕的無垢之「純潔之心」，是維繫世界光芒的關鍵七公主之一。
                  然而，嫉妒與對永恆青春的執念讓邪惡皇后墮入了黑暗，她以黑魔法結合無心者力量煉成了「暗影毒蘋果」，企圖藉由魔鏡的詛咒吞噬這座森林的光芒。
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white">🗝️ 鑰刃勇者的誓言</h4>
                <p className="text-xs text-slate-400">
                  作為被光之鑰刃選中的冒險者，你來到矮人林地與七個小矮人並肩作戰。唯有擊破魔鏡的幻境障壁、驅散盤踞的無心者，才能守護白雪公主的純潔之光！
                </p>
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div className="font-bold text-amber-400 text-xs mb-1">⚔️ 普通攻擊 (Attack)</div>
                  <p className="text-xs text-slate-300">
                    按鍵 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-amber-300">Z</kbd> 或 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-amber-300">空白鍵</kbd>，或直接點擊敵人。連續攻擊可積累連擊數（Combo）！
                  </p>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div className="font-bold text-sky-400 text-xs mb-1">🛡️ 防禦反擊 (Parry Guard)</div>
                  <p className="text-xs text-slate-300">
                    按鍵 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-sky-300">X</kbd>。在敵人紅圈蓄力攻擊瞬間防禦，可格擋所有傷害並立即震退敵人反彈35點重擊！
                  </p>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div className="font-bold text-emerald-400 text-xs mb-1">💨 翻滾閃避 (Dodge Roll)</div>
                  <p className="text-xs text-slate-300">
                    按鍵 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-emerald-300">C</kbd>。迅速進行無敵幀翻滾，規避全螢幕危險魔法或首領重擊。
                  </p>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div className="font-bold text-yellow-400 text-xs mb-1">🎯 目標切換 (Lock-on)</div>
                  <p className="text-xs text-slate-300">
                    按鍵 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-yellow-300">Q</kbd> 或 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-yellow-300">Tab</kbd>。黃色鎖定環可精確指定優先殲滅的高威脅無心者。
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-xs text-slate-400">
                💡 <b>提示</b>：拾取擊敗敵人掉落的彩色光球（綠色 HP、藍色 MP、金色 純潔之光），能迅速恢復戰力。
              </div>
            </div>
          )}

          {activeTab === 'medals' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MEDAL_SKILLS.map(m => (
                <div key={m.id} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-3">
                  <div className="text-3xl p-1 bg-slate-950 rounded-lg border border-slate-700">{m.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{m.name}</span>
                      <span className="text-[10px] text-sky-400 font-mono">MP {m.mpCost}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'keyblades' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                擊敗第 3 波魔鏡邪惡皇后，即可解鎖森林傳奇鑰刃！點擊即可裝備：
              </p>
              <div className="space-y-2">
                {keyblades.map(kb => {
                  const isActive = activeKeyblade.id === kb.id;
                  return (
                    <div
                      key={kb.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-amber-500/15 border-amber-400 shadow-md'
                          : kb.unlocked
                          ? 'bg-slate-900/80 border-slate-800 hover:border-slate-600'
                          : 'bg-slate-950/40 border-slate-900 opacity-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{kb.name}</span>
                          {isActive && (
                            <span className="text-[10px] px-2 py-0.5 bg-amber-500 text-black font-black rounded-full">
                              裝備中
                            </span>
                          )}
                          {!kb.unlocked && (
                            <span className="text-[10px] text-rose-400 font-bold">未解鎖 (需通關)</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{kb.desc}</p>
                        <div className="flex gap-3 text-[11px] text-amber-300/90 mt-1 font-mono">
                          <span>基礎攻擊: {kb.atk}</span>
                          <span>純潔之光蓄能: +{kb.bonusPurity}%</span>
                        </div>
                      </div>

                      {kb.unlocked && !isActive && (
                        <button
                          onClick={() => onSelectKeyblade(kb)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-black shadow transition-transform active:scale-95"
                        >
                          裝備
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
