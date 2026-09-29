/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, BookOpen, KeyRound, Maximize2, Sparkles, Swords, RefreshCw, Trophy, Download } from 'lucide-react';
import { GameCanvas } from './components/GameCanvas';
import { KingdomHeartsHUD } from './components/KingdomHeartsHUD';
import { CodexModal } from './components/CodexModal';
import { EndGameModal } from './components/EndGameModal';
import { INITIAL_KEYBLADES } from './data/skills';
import { Keyblade, PlayerStats } from './types/game';
import { sound } from './audio/sound';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [currentWave, setCurrentWave] = useState(1);
  const [endlessMode, setEndlessMode] = useState(false);
  const [bossHpPercent, setBossHpPercent] = useState(100);

  const [isMuted, setIsMuted] = useState(false);
  const [isBgmOn, setIsBgmOn] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [endGameModalOpen, setEndGameModalOpen] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [maxCombo, setMaxCombo] = useState(0);

  const [keyblades, setKeyblades] = useState<Keyblade[]>(INITIAL_KEYBLADES);
  const [activeKeyblade, setActiveKeyblade] = useState<Keyblade>(INITIAL_KEYBLADES[0]);
  const [justUnlockedKeyblade, setJustUnlockedKeyblade] = useState<Keyblade | null>(null);

  const [player, setPlayer] = useState<PlayerStats>({
    hp: 100,
    maxHp: 100,
    mp: 60,
    maxMp: 60,
    purity: 0,
    maxPurity: 100,
    atk: INITIAL_KEYBLADES[0].atk,
    guardTime: 0,
    dodgeTime: 0,
    comboHits: 0,
    comboTimer: 0,
  });

  const [cooldowns, setCooldowns] = useState<Record<string, number>>({
    doc: 0,
    grumpy: 0,
    snow: 0,
    blizzard: 0,
    dopey: 0,
  });

  // Track max combo
  useEffect(() => {
    if (player.comboHits > maxCombo) {
      setMaxCombo(player.comboHits);
    }
  }, [player.comboHits, maxCombo]);

  // Update player ATK if Keyblade changes
  useEffect(() => {
    setPlayer(p => ({ ...p, atk: activeKeyblade.atk }));
  }, [activeKeyblade]);

  // Mute toggle
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  // BGM toggle
  const toggleBgm = () => {
    const next = !isBgmOn;
    setIsBgmOn(next);
    sound.toggleBGM(next);
  };

  // Start / Restart game
  const startGame = (endless: boolean = false) => {
    setEndlessMode(endless);
    setCurrentWave(1);
    setBossHpPercent(100);
    setPlayer({
      hp: 100,
      maxHp: 100,
      mp: 60,
      maxMp: 60,
      purity: 0,
      maxPurity: 100,
      atk: activeKeyblade.atk,
      guardTime: 0,
      dodgeTime: 0,
      comboHits: 0,
      comboTimer: 0,
    });
    setCooldowns({ doc: 0, grumpy: 0, snow: 0, blizzard: 0, dopey: 0 });
    setEndGameModalOpen(false);
    setGameStarted(true);
    setGamePaused(false);
  };

  const handleGameOver = () => {
    setIsWin(false);
    setEndGameModalOpen(true);
  };

  const handleVictory = () => {
    setIsWin(true);
    sound.play('victory');

    // Unlock Woodland Oath keyblade
    setKeyblades(prev => {
      return prev.map(kb => {
        if (kb.id === 'woodland_oath') {
          return { ...kb, unlocked: true };
        }
        return kb;
      });
    });

    const oath = keyblades.find(k => k.id === 'woodland_oath') || null;
    setJustUnlockedKeyblade(oath);
    setEndGameModalOpen(true);
  };

  // Trigger Ultimate (Pure White Light / Trinity Limit)
  const triggerUltimate = () => {
    if (player.purity < 100) return;
    sound.play('ultimate');
    setPlayer(p => ({ ...p, purity: 0 }));

    // Send synthetic key event or let GameCanvas handle via window dispatch
    window.dispatchEvent(new CustomEvent('kh-trigger-ultimate'));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col items-center justify-between font-sans selection:bg-amber-500 selection:text-black">
      {/* TOP HEADER BAR */}
      <header className="w-full max-w-5xl px-4 py-3 flex items-center justify-between border-b border-amber-500/20 bg-slate-950/40 backdrop-blur-md">
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl border border-amber-400 bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-xl">🗝️</span>
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-amber-300 font-serif tracking-wide flex items-center gap-2">
              <span>王國之心：純白編年史</span>
              <span className="text-[10px] hidden sm:inline px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30">
                HTML5 Action RPG
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Kingdom Hearts: Pure White Chronicles · 童話林地純潔之誓
            </p>
          </div>
        </div>

        {/* Action Controls (Audio, BGM, Journal, Weapons) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mute button */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1 ${
              isMuted
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                : 'bg-slate-900 border-slate-700 hover:border-amber-400 text-slate-300'
            }`}
            title={isMuted ? '取消靜音' : '靜音'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Ambient BGM button */}
          <button
            onClick={toggleBgm}
            className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1 ${
              isBgmOn
                ? 'bg-amber-950/60 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-400'
            }`}
            title={isBgmOn ? '停止童話背景旋律' : '開啟童話背景旋律 (Web Audio)'}
          >
            <Music className="w-4 h-4" />
            <span className="text-[10px] hidden md:inline">{isBgmOn ? '音樂: 開' : '音樂: 關'}</span>
          </button>

          {/* Jiminy's Journal Codex */}
          <button
            onClick={() => setIsCodexOpen(true)}
            className="p-2 sm:px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
            title="開啟吉米尼日記與操作指南"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] hidden sm:inline">吉米尼日記</span>
          </button>

          {/* Download Standalone Single HTML File */}
          <a
            href="/kh_game.html"
            download="kh_game.html"
            className="p-2 sm:px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-400 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
            title="下載獨立單檔 HTML (雙擊即可遊玩)"
          >
            <Download className="w-4 h-4" />
            <span className="text-[11px] hidden lg:inline">下載單檔 HTML</span>
          </a>

          {/* Keyblade Selector */}
          <button
            onClick={() => setIsCodexOpen(true)}
            className="p-2 sm:px-3 rounded-xl bg-gradient-to-r from-amber-600/30 to-yellow-500/30 border border-amber-400/50 hover:border-amber-300 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
            title="查看或更換鑰刃"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] hidden sm:inline truncate max-w-[90px]">
              {activeKeyblade.name.split(' ')[0]}
            </span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white transition-all"
            title="全螢幕切換"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN GAME CONTAINER */}
      <main className="w-full max-w-5xl px-2 sm:px-4 py-3 flex-1 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-[920px] aspect-[900/560] max-h-[580px] rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/50 bg-[#070e17]">
          {/* Canvas Gameplay Engine */}
          <GameCanvas
            player={player}
            setPlayer={setPlayer}
            currentWave={currentWave}
            setCurrentWave={setCurrentWave}
            activeKeyblade={activeKeyblade}
            cooldowns={cooldowns}
            setCooldowns={setCooldowns}
            onWaveChange={setCurrentWave}
            onGameOver={handleGameOver}
            onVictory={handleVictory}
            bossHpPercent={bossHpPercent}
            setBossHpPercent={setBossHpPercent}
            gameStarted={gameStarted}
            gamePaused={gamePaused}
            endlessMode={endlessMode}
          />

          {/* Kingdom Hearts In-Game HUD Layer */}
          {gameStarted && (
            <KingdomHeartsHUD
              player={player}
              currentWave={currentWave}
              totalWaves={3}
              endlessMode={endlessMode}
              bossHpPercent={bossHpPercent}
              cooldowns={cooldowns}
              onUseSkill={id => {
                // Synthetic keyboard dispatch to GameCanvas
                const keyMap: Record<string, string> = {
                  doc: '1',
                  grumpy: '2',
                  snow: '3',
                  blizzard: '4',
                  dopey: '5',
                };
                window.dispatchEvent(new KeyboardEvent('keydown', { key: keyMap[id] }));
              }}
              onTriggerUltimate={triggerUltimate}
              onAttackClick={() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }));
              }}
              onGuardClick={() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
              }}
              onDodgeClick={() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }));
              }}
              onTargetCycle={() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q' }));
              }}
              activeKeyblade={activeKeyblade}
            />
          )}

          {/* TITLE & START OVERLAY */}
          {!gameStarted && (
            <div className="absolute inset-0 bg-[#080d19]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none z-30">
              {/* Decorative Keyblade Crest */}
              <div className="w-16 h-16 rounded-full border-2 border-amber-400 bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(250,204,21,0.6)]">
                <span className="text-3xl filter drop-shadow">🗝️</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-amber-300 font-serif tracking-wider mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                王國之心：純白編年史
              </h2>
              <div className="text-xs sm:text-sm font-semibold tracking-widest text-amber-200/80 uppercase font-serif mb-4">
                Kingdom Hearts: Pure White Chronicles
              </div>

              <p className="max-w-xl text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 px-4">
                邪惡皇后利用黑魔法煉製暗影毒蘋果，企圖吞噬「純潔之心七公主」之一的白雪公主！
                <br className="hidden sm:inline" />
                拿起鑰刃，與七個小矮人守護森林的純潔之光，擊破皇后的魔鏡幻術！
              </p>

              {/* Start Button */}
              <button
                onClick={() => startGame(false)}
                className="py-3 px-8 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-base tracking-wider shadow-[0_0_25px_rgba(234,179,8,0.7)] active:scale-95 transition-all transform hover:scale-105 mb-4 cursor-pointer"
              >
                踏上光之冒險
              </button>

              {/* Quick instructions strip */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 max-w-lg">
                <span className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">滑鼠左鍵 / Z</span>
                  <span>攻擊</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono">X</span>
                  <span>防禦反擊</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">C</span>
                  <span>翻滾閃避</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">1-5</span>
                  <span>勳章技能</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM FEATURE TIPS & CONTROLS FOOTER */}
        <div className="w-full max-w-5xl mt-3 px-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>原生 Web Audio API 合成音效 · 無外部資源依賴 · 支援鍵盤/滑鼠/觸控</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>當前裝備：<b className="text-amber-300">{activeKeyblade.name}</b></span>
            <span>最高連擊：<b className="text-emerald-300">{maxCombo} Hits</b></span>
          </div>
        </div>
      </main>

      {/* CODEX & LORE MODAL */}
      <CodexModal
        isOpen={isCodexOpen}
        onClose={() => setIsCodexOpen(false)}
        keyblades={keyblades}
        activeKeyblade={activeKeyblade}
        onSelectKeyblade={kb => {
          setActiveKeyblade(kb);
          sound.play('hit');
        }}
      />

      {/* VICTORY / GAMEOVER MODAL */}
      <EndGameModal
        isOpen={endGameModalOpen}
        isWin={isWin}
        scoreWave={currentWave}
        highestCombo={maxCombo}
        onRestart={startGame}
        unlockedKeyblade={justUnlockedKeyblade}
      />
    </div>
  );
}
