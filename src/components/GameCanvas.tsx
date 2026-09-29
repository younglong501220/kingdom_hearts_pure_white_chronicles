import React, { useEffect, useRef } from 'react';
import { sound } from '../audio/sound';
import { MEDAL_SKILLS } from '../data/skills';
import { DamageNumber, Enemy, Keyblade, Particle, PlayerStats, PrizeOrb, SlashEffect } from '../types/game';

interface GameCanvasProps {
  player: PlayerStats;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerStats>>;
  currentWave: number;
  setCurrentWave: React.Dispatch<React.SetStateAction<number>>;
  activeKeyblade: Keyblade;
  cooldowns: Record<string, number>;
  setCooldowns: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  onWaveChange: (wave: number) => void;
  onGameOver: () => void;
  onVictory: () => void;
  bossHpPercent: number;
  setBossHpPercent: (val: number) => void;
  onAttackTriggered?: () => void;
  onDeflectSuccess?: () => void;
  gameStarted: boolean;
  gamePaused: boolean;
  endlessMode: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  player,
  setPlayer,
  currentWave,
  setCurrentWave,
  activeKeyblade,
  cooldowns,
  setCooldowns,
  onGameOver,
  onVictory,
  setBossHpPercent,
  gameStarted,
  gamePaused,
  endlessMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable game simulation state preserved across frames
  const stateRef = useRef<{
    enemies: Enemy[];
    particles: Particle[];
    slashes: SlashEffect[];
    damageTexts: DamageNumber[];
    orbs: PrizeOrb[];
    selectedTargetId: string | null;
    screenFlash: number;
    shake: number;
    playerAnimFrame: number;
    playerSwingTimer: number;
    bgSparks: { x: number; y: number; s: number; vy: number; alpha: number }[];
  }>({
    enemies: [],
    particles: [],
    slashes: [],
    damageTexts: [],
    orbs: [],
    selectedTargetId: null,
    screenFlash: 0,
    shake: 0,
    playerAnimFrame: 0,
    playerSwingTimer: 0,
    bgSparks: Array.from({ length: 30 }, () => ({
      x: Math.random() * 960,
      y: Math.random() * 560,
      s: Math.random() * 2 + 1,
      vy: Math.random() * 0.4 + 0.1,
      alpha: Math.random() * 0.7 + 0.3,
    })),
  });

  // Track latest props in ref for animation frame loop
  const propsRef = useRef({
    player,
    activeKeyblade,
    cooldowns,
    currentWave,
    gameStarted,
    gamePaused,
    endlessMode,
  });

  useEffect(() => {
    propsRef.current = {
      player,
      activeKeyblade,
      cooldowns,
      currentWave,
      gameStarted,
      gamePaused,
      endlessMode,
    };
  }, [player, activeKeyblade, cooldowns, currentWave, gameStarted, gamePaused, endlessMode]);

  // Setup wave enemies
  const setupWave = (wave: number) => {
    const s = stateRef.current;
    s.enemies = [];

    if (wave === 1) {
      // 4 Shadows
      for (let i = 0; i < 4; i++) {
        s.enemies.push({
          id: `shadow-${i}`,
          type: 'shadow',
          name: '暗影無心者 (Shadow)',
          x: 480 + (i % 2) * 160 + (i > 1 ? 50 : 0),
          y: 240 + Math.floor(i / 2) * 110,
          hp: 55,
          maxHp: 55,
          atk: 6,
          radius: 26,
          attackTimer: 80 + i * 25,
          maxAttackTimer: 120,
          isAttacking: false,
          floatOffset: i * 1.2,
        });
      }
    } else if (wave === 2) {
      // Poison Apple Heartless + Armored
      s.enemies.push({
        id: 'apple-1',
        type: 'apple_heartless',
        name: '毒蘋果幻影 (Poison Apple)',
        x: 480,
        y: 200,
        hp: 120,
        maxHp: 120,
        atk: 9,
        radius: 34,
        attackTimer: 90,
        maxAttackTimer: 130,
        isAttacking: false,
        floatOffset: 0.5,
      });
      s.enemies.push({
        id: 'armored-1',
        type: 'armored_heartless',
        name: '黑甲兵長 (Armored Knight)',
        x: 620,
        y: 330,
        hp: 180,
        maxHp: 180,
        atk: 14,
        radius: 38,
        attackTimer: 120,
        maxAttackTimer: 150,
        isAttacking: false,
        floatOffset: 2.1,
      });
      s.enemies.push({
        id: 'apple-2',
        type: 'apple_heartless',
        name: '毒蘋果幻影 (Poison Apple)',
        x: 740,
        y: 220,
        hp: 120,
        maxHp: 120,
        atk: 9,
        radius: 34,
        attackTimer: 110,
        maxAttackTimer: 130,
        isAttacking: false,
        floatOffset: 3.5,
      });
    } else if (wave === 3) {
      // Boss: The Evil Queen & Magic Mirror
      s.enemies.push({
        id: 'boss-queen',
        type: 'boss_queen',
        name: '邪惡皇后與魔鏡 (The Evil Queen & Magic Mirror)',
        x: 670,
        y: 260,
        hp: 600,
        maxHp: 600,
        atk: 18,
        radius: 65,
        attackTimer: 100,
        maxAttackTimer: 140,
        isAttacking: false,
        floatOffset: 0,
      });
      setBossHpPercent(100);
    } else {
      // Endless Abyss Scaling Waves
      const count = Math.min(3 + wave, 8);
      for (let i = 0; i < count; i++) {
        const isBoss = i === 0 && wave % 2 === 0;
        s.enemies.push({
          id: `endless-${wave}-${i}`,
          type: isBoss ? 'boss_queen' : (i % 2 === 0 ? 'apple_heartless' : 'armored_heartless'),
          name: isBoss ? `深淵魔后 Lv.${wave}` : `暗影軍團 Lv.${wave}`,
          x: 450 + (i % 3) * 120,
          y: 190 + Math.floor(i / 3) * 90,
          hp: 70 + wave * 30 + (isBoss ? 200 : 0),
          maxHp: 70 + wave * 30 + (isBoss ? 200 : 0),
          atk: 8 + wave * 2,
          radius: isBoss ? 55 : 30,
          attackTimer: 60 + Math.random() * 80,
          maxAttackTimer: 110,
          isAttacking: false,
          floatOffset: Math.random() * 5,
        });
      }
    }

    if (s.enemies.length > 0) {
      s.selectedTargetId = s.enemies[0].id;
    }
  };

  // Re-init wave when currentWave changes or game starts
  useEffect(() => {
    if (gameStarted) {
      setupWave(currentWave);
    }
  }, [currentWave, gameStarted]);

  // Execute attack against targeted or clicked enemy
  const attackEnemy = (enemy: Enemy) => {
    const s = stateRef.current;
    const { player, activeKeyblade } = propsRef.current;

    s.playerSwingTimer = 16;
    s.selectedTargetId = enemy.id;

    // Calculate damage
    const baseAtk = activeKeyblade.atk;
    const isCrit = Math.random() < 0.28;
    const variance = (Math.random() - 0.5) * 4;
    const finalDmg = Math.round(isCrit ? (baseAtk + variance) * 1.6 : baseAtk + variance);

    enemy.hp = Math.max(0, enemy.hp - finalDmg);

    // Floating text
    s.damageTexts.push({
      id: Math.random().toString(),
      x: enemy.x + (Math.random() - 0.5) * 30,
      y: enemy.y - 25,
      text: `${finalDmg}${isCrit ? '!' : ''}`,
      color: isCrit ? '#f1c40f' : '#ffffff',
      life: 36,
      vy: -2,
      isCrit,
    });

    // Combo progression
    const newHits = player.comboHits + 1;
    const bonusPurity = (5 + (activeKeyblade.bonusPurity / 100) * 5) * (isCrit ? 1.5 : 1);
    const newPurity = Math.min(player.maxPurity, player.purity + bonusPurity);

    setPlayer(prev => ({
      ...prev,
      comboHits: newHits,
      comboTimer: 90,
      purity: newPurity,
    }));

    // Slash and sparks
    s.slashes.push({
      x: enemy.x,
      y: enemy.y,
      angle: Math.random() * Math.PI,
      radius: enemy.radius + 20,
      color: activeKeyblade.color,
      life: 14,
      maxLife: 14,
    });

    for (let i = 0; i < (isCrit ? 16 : 8); i++) {
      s.particles.push({
        x: enemy.x,
        y: enemy.y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color: isCrit ? '#ffeaa7' : activeKeyblade.color,
        radius: Math.random() * 3 + 2,
        life: 20,
        maxLife: 20,
      });
    }

    sound.play('hit');

    // Defeat check
    if (enemy.hp <= 0) {
      sound.play('magic');
      s.shake = 6;
      spawnPrizeOrbs(enemy.x, enemy.y, enemy.type === 'boss_queen' ? 12 : 4);

      for (let i = 0; i < 24; i++) {
        s.particles.push({
          x: enemy.x,
          y: enemy.y,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          color: '#a855f7',
          radius: Math.random() * 4 + 2,
          life: 30,
          maxLife: 30,
        });
      }
    }
  };

  const spawnPrizeOrbs = (x: number, y: number, count: number) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const type = Math.random() < 0.45 ? 'hp' : Math.random() < 0.8 ? 'mp' : 'purity';
      s.orbs.push({
        id: Math.random().toString(),
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 4 - 2,
        type,
        value: type === 'hp' ? 15 : type === 'mp' ? 10 : 12,
        life: 240,
      });
    }
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!propsRef.current.gameStarted || propsRef.current.gamePaused) return;

      const key = e.key.toLowerCase();
      const s = stateRef.current;

      // Z or Space -> Attack locked target
      if (key === 'z' || key === ' ') {
        e.preventDefault();
        const target = s.enemies.find(en => en.id === s.selectedTargetId) || s.enemies[0];
        if (target) {
          attackEnemy(target);
        }
      }

      // X -> Guard
      if (key === 'x') {
        e.preventDefault();
        triggerGuard();
      }

      // C -> Dodge Roll
      if (key === 'c') {
        e.preventDefault();
        triggerDodge();
      }

      // 1 to 4 -> Skills
      if (key === '1') triggerSkill('doc');
      if (key === '2') triggerSkill('grumpy');
      if (key === '3') triggerSkill('snow');
      if (key === '4') triggerSkill('blizzard');
      if (key === '5') triggerSkill('dopey');

      // Q or Tab -> Target cycle
      if (key === 'q' || key === 'tab') {
        e.preventDefault();
        if (s.enemies.length > 0) {
          const currentIndex = s.enemies.findIndex(en => en.id === s.selectedTargetId);
          const nextIndex = (currentIndex + 1) % s.enemies.length;
          s.selectedTargetId = s.enemies[nextIndex].id;
        }
      }

      // R or F -> Ultimate when ready
      if (key === 'r' || key === 'f') {
        if (propsRef.current.player.purity >= 100) {
          executeUltimate();
        }
      }
    };

    const handleUltimateEvent = () => {
      executeUltimate();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('kh-trigger-ultimate', handleUltimateEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('kh-trigger-ultimate', handleUltimateEvent);
    };
  }, []);

  const executeUltimate = () => {
    const s = stateRef.current;
    sound.play('ultimate');
    s.screenFlash = 25;
    s.shake = 12;

    // Decimate all enemies with holy light
    s.enemies.forEach(en => {
      en.hp = Math.max(0, en.hp - 240);
      s.damageTexts.push({
        id: Math.random().toString(),
        x: en.x,
        y: en.y - 30,
        text: '240 純白神聖之光!',
        color: '#fef08a',
        life: 55,
        vy: -2.5,
        isCrit: true,
      });

      if (en.hp <= 0) {
        spawnPrizeOrbs(en.x, en.y, 6);
      }
    });

    // 80 glowing light rays
    for (let i = 0; i < 80; i++) {
      const angle = (i / 80) * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      s.particles.push({
        x: 450,
        y: 280,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#fef08a',
        radius: Math.random() * 5 + 3,
        life: 45,
        maxLife: 45,
      });
    }

    setPlayer(p => ({ ...p, purity: 0 }));
  };

  // Trigger Guard
  const triggerGuard = () => {
    const { player } = propsRef.current;
    if (player.guardTime > 0 || player.dodgeTime > 0) return;
    setPlayer(p => ({ ...p, guardTime: 35 }));
    sound.play('guard');

    const s = stateRef.current;
    for (let i = 0; i < 15; i++) {
      s.particles.push({
        x: 210,
        y: 340,
        vx: Math.random() * 4 + 1,
        vy: (Math.random() - 0.5) * 5,
        color: '#f1c40f',
        radius: 3,
        life: 20,
        maxLife: 20,
      });
    }
  };

  // Trigger Dodge Roll
  const triggerDodge = () => {
    const { player } = propsRef.current;
    if (player.dodgeTime > 0) return;
    setPlayer(p => ({ ...p, dodgeTime: 30 }));
    sound.play('dodge');
  };

  // Trigger Skill action
  const triggerSkill = (id: 'doc' | 'grumpy' | 'snow' | 'blizzard' | 'dopey') => {
    const skill = MEDAL_SKILLS.find(m => m.id === id);
    if (!skill) return;
    const { player, cooldowns } = propsRef.current;

    if (cooldowns[id] > 0 || player.mp < skill.mpCost) return;

    const s = stateRef.current;

    // Deduct MP & set CD
    setPlayer(p => ({
      ...p,
      mp: p.mp - skill.mpCost,
      purity: Math.min(p.maxPurity, p.purity + (id === 'snow' ? 25 : 10)),
    }));
    setCooldowns(prev => ({ ...prev, [id]: skill.cdMax }));

    if (id === 'doc') {
      sound.play('magic');
      s.shake = 5;
      s.enemies.forEach(en => {
        en.hp = Math.max(0, en.hp - 35);
        en.attackTimer += 60; // stun
        s.damageTexts.push({
          id: Math.random().toString(),
          x: en.x,
          y: en.y - 20,
          text: '35 暈眩!',
          color: '#f1c40f',
          life: 40,
          vy: -2,
          isCrit: true,
        });
      });
      createShockwave(560, 300, '#f1c40f', 40);
    } else if (id === 'grumpy') {
      sound.play('hit');
      s.shake = 8;
      const target = s.enemies.find(en => en.id === s.selectedTargetId) || s.enemies[0];
      if (target) {
        target.hp = Math.max(0, target.hp - 85);
        s.damageTexts.push({
          id: Math.random().toString(),
          x: target.x,
          y: target.y - 25,
          text: '85 破甲重擊!',
          color: '#e67e22',
          life: 45,
          vy: -2.5,
          isCrit: true,
        });
        createShockwave(target.x, target.y, '#e67e22', 50);
      }
    } else if (id === 'snow') {
      sound.play('heal');
      setPlayer(p => ({ ...p, hp: Math.min(p.maxHp, p.hp + 45) }));
      s.damageTexts.push({
        id: Math.random().toString(),
        x: 180,
        y: 300,
        text: '+45 HP',
        color: '#2ecc71',
        life: 45,
        vy: -2,
      });
      // Healing ring
      for (let i = 0; i < 30; i++) {
        const ang = (i / 30) * Math.PI * 2;
        s.particles.push({
          x: 180 + Math.cos(ang) * 40,
          y: 340 + Math.sin(ang) * 40,
          vx: Math.cos(ang) * 2,
          vy: -2.5,
          color: '#2ecc71',
          radius: 3.5,
          life: 35,
          maxLife: 35,
        });
      }
    } else if (id === 'blizzard') {
      sound.play('blizzard');
      s.enemies.forEach(en => {
        en.hp = Math.max(0, en.hp - 42);
        en.attackTimer += 140; // Freeze attack counter
        en.isFrozen = 80;
        s.damageTexts.push({
          id: Math.random().toString(),
          x: en.x,
          y: en.y - 20,
          text: '42 冰封!',
          color: '#60a5fa',
          life: 40,
          vy: -2,
        });
      });
      createShockwave(560, 300, '#60a5fa', 60);
    } else if (id === 'dopey') {
      sound.play('coin');
      s.enemies.forEach(en => {
        spawnPrizeOrbs(en.x, en.y, 3);
      });
      s.damageTexts.push({
        id: Math.random().toString(),
        x: 180,
        y: 280,
        text: '幸運掉落!',
        color: '#fbbf24',
        life: 40,
        vy: -2,
      });
    }
  };

  const createShockwave = (x: number, y: number, color: string, count: number) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = Math.random() * 5 + 3;
      s.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        radius: Math.random() * 4 + 2,
        life: 30,
        maxLife: 30,
      });
    }
  };

  // Main Canvas Render & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      animId = requestAnimationFrame(loop);

      const { gameStarted, gamePaused, currentWave } = propsRef.current;
      if (!gameStarted || gamePaused) {
        return;
      }

      const s = stateRef.current;
      s.playerAnimFrame += 0.05;

      // 1. Natural MP Regeneration
      setPlayer(p => {
        let newMp = p.mp;
        if (p.mp < p.maxMp) {
          newMp = Math.min(p.maxMp, p.mp + 0.04);
        }
        let gTime = Math.max(0, p.guardTime - 1);
        let dTime = Math.max(0, p.dodgeTime - 1);
        let cTimer = Math.max(0, p.comboTimer - 1);
        let hits = cTimer === 0 ? 0 : p.comboHits;

        return {
          ...p,
          mp: newMp,
          guardTime: gTime,
          dodgeTime: dTime,
          comboTimer: cTimer,
          comboHits: hits,
        };
      });

      // 2. Cooldown timer reduction
      setCooldowns(cds => {
        let changed = false;
        const next = { ...cds };
        for (const k in next) {
          if (next[k] > 0) {
            next[k] -= 1;
            changed = true;
          }
        }
        return changed ? next : cds;
      });

      // 3. Enemy AI & Attack logic
      for (let i = s.enemies.length - 1; i >= 0; i--) {
        const en = s.enemies[i];
        en.floatOffset += 0.04;

        if (en.isFrozen && en.isFrozen > 0) {
          en.isFrozen--;
          continue;
        }

        if (en.hp <= 0) {
          s.enemies.splice(i, 1);
          continue;
        }

        en.attackTimer--;
        if (en.attackTimer <= 0) {
          // Attacking player!
          const { player } = propsRef.current;

          if (player.dodgeTime > 0) {
            // Dodged successfully!
            s.damageTexts.push({
              id: Math.random().toString(),
              x: 180,
              y: 310,
              text: 'DODGE!',
              color: '#38bdf8',
              life: 30,
              vy: -1.8,
            });
            en.attackTimer = en.maxAttackTimer;
          } else if (player.guardTime > 0) {
            // Guard Parry Counter!
            sound.play('guard');
            s.shake = 4;
            s.damageTexts.push({
              id: Math.random().toString(),
              x: 180,
              y: 310,
              text: 'PARRY 完美防禦!',
              color: '#facc15',
              life: 35,
              vy: -2,
            });
            // Reflect damage to enemy
            en.hp = Math.max(0, en.hp - 35);
            s.damageTexts.push({
              id: Math.random().toString(),
              x: en.x,
              y: en.y - 20,
              text: '35 反擊!',
              color: '#facc15',
              life: 35,
              vy: -2,
            });
            en.attackTimer = en.maxAttackTimer + 30;
          } else {
            // Player takes damage
            sound.play('bossHit');
            s.screenFlash = 9;
            s.shake = 7;
            const dmg = en.atk;
            setPlayer(p => {
              const updatedHp = Math.max(0, p.hp - dmg);
              if (updatedHp <= 0) {
                onGameOver();
              }
              return { ...p, hp: updatedHp, comboHits: 0 };
            });

            s.damageTexts.push({
              id: Math.random().toString(),
              x: 180,
              y: 320,
              text: `-${dmg}`,
              color: '#ef4444',
              life: 36,
              vy: -2,
            });

            en.attackTimer = en.maxAttackTimer;
          }
        }
      }

      // Update boss health display
      const boss = s.enemies.find(en => en.type === 'boss_queen');
      if (boss) {
        setBossHpPercent(Math.max(0, (boss.hp / boss.maxHp) * 100));
      }

      // Check wave completion
      if (s.enemies.length === 0) {
        if (currentWave < 3 && !propsRef.current.endlessMode) {
          const nextWave = currentWave + 1;
          setCurrentWave(nextWave);
          setupWave(nextWave);
        } else if (propsRef.current.endlessMode) {
          const nextWave = currentWave + 1;
          setCurrentWave(nextWave);
          setupWave(nextWave);
        } else {
          onVictory();
        }
      }

      // 4. Prize Orbs Homing towards Player
      for (let i = s.orbs.length - 1; i >= 0; i--) {
        const orb = s.orbs[i];
        const targetX = 180;
        const targetY = 340;
        const dx = targetX - orb.x;
        const dy = targetY - orb.y;
        const dist = Math.hypot(dx, dy);

        orb.x += orb.vx + (dx / dist) * 4.5;
        orb.y += orb.vy + (dy / dist) * 4.5;
        orb.vx *= 0.95;
        orb.vy *= 0.95;
        orb.life--;

        if (dist < 30 || orb.life <= 0) {
          sound.play('coin');
          setPlayer(p => {
            if (orb.type === 'hp') {
              return { ...p, hp: Math.min(p.maxHp, p.hp + orb.value) };
            } else if (orb.type === 'mp') {
              return { ...p, mp: Math.min(p.maxMp, p.mp + orb.value) };
            } else {
              return { ...p, purity: Math.min(p.maxPurity, p.purity + orb.value) };
            }
          });
          s.orbs.splice(i, 1);
        }
      }

      // 5. Particles & Slashes update
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) s.particles.splice(i, 1);
      }

      for (let i = s.slashes.length - 1; i >= 0; i--) {
        const sl = s.slashes[i];
        sl.life--;
        if (sl.life <= 0) s.slashes.splice(i, 1);
      }

      for (let i = s.damageTexts.length - 1; i >= 0; i--) {
        const dt = s.damageTexts[i];
        dt.y += dt.vy;
        dt.life--;
        if (dt.life <= 0) s.damageTexts.splice(i, 1);
      }

      if (s.playerSwingTimer > 0) s.playerSwingTimer--;
      if (s.shake > 0) s.shake *= 0.85;
      if (s.screenFlash > 0) s.screenFlash--;

      // -------------------------------------------------------------
      // RENDERING PIPELINE
      // -------------------------------------------------------------
      const width = canvas.width;
      const height = canvas.height;

      ctx.save();
      if (s.shake > 0.5) {
        ctx.translate((Math.random() - 0.5) * s.shake * 4, (Math.random() - 0.5) * s.shake * 4);
      }

      // A. Deep Fairytale Mystical Background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#060d1a');
      skyGrad.addColorStop(0.5, '#0d1f2d');
      skyGrad.addColorStop(1, '#11292b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Castle & Tree Silhouettes in distance
      ctx.fillStyle = 'rgba(7, 16, 26, 0.7)';
      // Gothic towers
      ctx.beginPath();
      ctx.rect(360, 220, 45, 180);
      ctx.rect(380, 180, 20, 40);
      ctx.moveTo(375, 180);
      ctx.lineTo(390, 140);
      ctx.lineTo(405, 180);
      ctx.fill();

      // Layered forest crowns
      for (let i = 0; i < 9; i++) {
        ctx.beginPath();
        ctx.arc(i * 125 + 30, 460, 120, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? '#0b1f1f' : '#071719';
        ctx.fill();
      }

      // Ground plane
      const groundGrad = ctx.createLinearGradient(0, 430, 0, height);
      groundGrad.addColorStop(0, '#122521');
      groundGrad.addColorStop(1, '#091513');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, 430, width, height - 430);

      // Golden stone line
      ctx.strokeStyle = '#2d534a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 430);
      ctx.lineTo(width, 430);
      ctx.stroke();

      // Atmospheric glowing motes
      s.bgSparks.forEach(sp => {
        sp.y -= sp.vy;
        if (sp.y < 0) sp.y = height;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(241, 196, 15, ${sp.alpha * 0.6})`;
        ctx.fill();
      });

      // B. Snow White & Player Platform (Station of Awakening aesthetic)
      drawAwakeningRune(ctx, 180, 400);

      // C. Draw Player Character & Keyblade
      drawKeybladeWielder(ctx, 180, 340, s.playerAnimFrame, s.playerSwingTimer, propsRef.current.activeKeyblade, propsRef.current.player);

      // D. Draw Snow White (Pure Heart)
      drawSnowWhite(ctx, 115, 345, s.playerAnimFrame);

      // E. Draw Enemies & Boss
      s.enemies.forEach(en => {
        drawEnemy(ctx, en, s.selectedTargetId === en.id);
      });

      // F. Draw Prize Orbs
      s.orbs.forEach(orb => {
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = orb.type === 'hp' ? '#22c55e' : orb.type === 'mp' ? '#38bdf8' : '#eab308';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // G. Draw Slashes
      s.slashes.forEach(sl => {
        ctx.save();
        ctx.translate(sl.x, sl.y);
        ctx.rotate(sl.angle);
        ctx.beginPath();
        ctx.arc(0, 0, sl.radius, -Math.PI * 0.35, Math.PI * 0.35);
        ctx.lineWidth = 5 * (sl.life / sl.maxLife);
        ctx.strokeStyle = sl.color;
        ctx.shadowColor = sl.color;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.restore();
      });

      // H. Draw Particles
      s.particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * (p.life / p.maxLife), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // I. Damage Numbers
      s.damageTexts.forEach(dt => {
        ctx.font = dt.isCrit ? "bold 20px 'Cinzel', sans-serif" : "bold 16px 'Noto Sans TC', sans-serif";
        ctx.fillStyle = dt.color;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 6;
        ctx.fillText(dt.text, dt.x, dt.y);
        ctx.shadowBlur = 0;
      });

      // J. Flash overlay
      if (s.screenFlash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.8, s.screenFlash / 12)})`;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Station of Awakening circular rune under the heroes
  const drawAwakeningRune = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y, 105, 32, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(234, 179, 8, 0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner ring
    ctx.beginPath();
    ctx.ellipse(x, y, 75, 22, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.25)';
    ctx.stroke();
    ctx.restore();
  };

  // Draw Snow White with pure light aura
  const drawSnowWhite = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
    ctx.save();
    const bob = Math.sin(frame) * 3;

    // Glowing holy aura
    ctx.beginPath();
    ctx.arc(x + 12, y + 5 + bob, 36, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(x + 12, y + 5 + bob, 5, x + 12, y + 5 + bob, 36);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Emoji representation with rich glow
    ctx.font = '40px sans-serif';
    ctx.shadowColor = '#fef08a';
    ctx.shadowBlur = 12;
    ctx.fillText('👸', x - 10, y + 25 + bob);
    ctx.shadowBlur = 0;

    // Mini crown / apple purity spark
    ctx.font = '16px sans-serif';
    ctx.fillText('✨', x + 24, y - 5 + bob);
    ctx.restore();
  };

  // Draw Keyblade Wielder & Keyblade swing
  const drawKeybladeWielder = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    frame: number,
    swingTimer: number,
    keyblade: Keyblade,
    player: PlayerStats
  ) => {
    ctx.save();
    const bob = Math.sin(frame * 1.5) * 2;
    const isGuarding = player.guardTime > 0;
    const isDodging = player.dodgeTime > 0;

    // Dodge blur speedlines
    if (isDodging) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.ellipse(x - 20, y + 10, 45, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Guard barrier
    if (isGuarding) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + 20, y, 42, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.restore();
    }

    // Hero Avatar
    ctx.font = '46px sans-serif';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.fillText('🧙‍♂️', x - 25, y + 26 + bob);
    ctx.shadowBlur = 0;

    // Draw Keyblade
    ctx.save();
    ctx.translate(x + 20, y + bob);

    if (swingTimer > 0) {
      // Slashing forward swing
      const swingRatio = swingTimer / 16;
      ctx.rotate((1 - swingRatio) * 1.8 - 0.6);
      drawKeybladeGraphic(ctx, keyblade.color);
    } else if (isGuarding) {
      // Guard stance raised
      ctx.rotate(-0.8);
      drawKeybladeGraphic(ctx, keyblade.color);
    } else {
      // Idle ready stance
      ctx.rotate(-0.25 + Math.sin(frame) * 0.08);
      drawKeybladeGraphic(ctx, keyblade.color);
    }
    ctx.restore();

    ctx.restore();
  };

  // High quality vector-drawn Keyblade graphic
  const drawKeybladeGraphic = (ctx: CanvasRenderingContext2D, glowColor: string) => {
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10;

    // Shaft (blade)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, -3, 50, 6);

    // Key teeth at tip
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(42, -14, 6, 12);
    ctx.fillRect(34, -10, 6, 8);

    // Guard / Hilt
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(-8, 0, 14, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.stroke();

    // Handle
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-18, -3, 14, 6);

    // Pommel & Keychain
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(-20, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Draw enemy with specific appearances
  const drawEnemy = (ctx: CanvasRenderingContext2D, en: Enemy, isSelected: boolean) => {
    const floatY = en.y + Math.sin(en.floatOffset) * 6;

    ctx.save();

    // Lock-on Target reticle (Kingdom Hearts iconic yellow brackets)
    if (isSelected) {
      ctx.save();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;

      const r = en.radius + 18;
      const angle = en.floatOffset * 1.5;

      ctx.translate(en.x, floatY);
      ctx.rotate(angle);

      // 4 corner brackets
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.arc(0, 0, r, -0.25, 0.25);
        ctx.stroke();
      }

      // Center dot
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#facc15';
      ctx.fill();
      ctx.restore();
    }

    // Pre-attack danger telegraph ring
    if (en.attackTimer < 32 && !en.isFrozen) {
      const dangerRatio = 1 - en.attackTimer / 32;
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + dangerRatio * 0.6})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(en.x, floatY, en.radius + 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = `rgba(239, 68, 68, ${dangerRatio * 0.2})`;
      ctx.fill();
    }

    // Frozen visual tint
    if (en.isFrozen && en.isFrozen > 0) {
      ctx.fillStyle = 'rgba(96, 165, 250, 0.4)';
      ctx.beginPath();
      ctx.arc(en.x, floatY, en.radius + 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // Specific enemy drawings
    if (en.type === 'shadow') {
      // Shadow Heartless with glowing yellow eyes & antennae
      ctx.font = '36px sans-serif';
      ctx.shadowColor = '#9333ea';
      ctx.shadowBlur = 14;
      ctx.fillText('👾', en.x - 18, floatY + 12);
      ctx.shadowBlur = 0;

      // Dark puddle underneath
      ctx.beginPath();
      ctx.ellipse(en.x, floatY + 24, 22, 7, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 5, 29, 0.6)';
      ctx.fill();
    } else if (en.type === 'apple_heartless') {
      // Cursed Poison Apple Heartless
      ctx.font = '46px sans-serif';
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 16;
      ctx.fillText('🍎', en.x - 22, floatY + 16);
      ctx.shadowBlur = 0;

      // Cursed purple mist
      ctx.font = '16px sans-serif';
      ctx.fillText('☠️', en.x - 8, floatY - 24);
    } else if (en.type === 'armored_heartless') {
      // Armored Knight Heartless
      ctx.font = '50px sans-serif';
      ctx.shadowColor = '#d97706';
      ctx.shadowBlur = 16;
      ctx.fillText('🛡️', en.x - 24, floatY + 18);
      ctx.shadowBlur = 0;
    } else if (en.type === 'boss_queen') {
      // The Evil Queen & Colossal Magic Mirror
      // Colossal Magic Mirror Frame
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(en.x - 55, floatY - 5, 42, 60, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 6;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 24;
      ctx.stroke();

      // Spectral Face in Mirror
      ctx.font = '44px sans-serif';
      ctx.fillText('🪞', en.x - 80, floatY + 15);
      ctx.restore();

      // Evil Queen
      ctx.font = '64px sans-serif';
      ctx.shadowColor = '#7e22ce';
      ctx.shadowBlur = 20;
      ctx.fillText('🦹‍♀️', en.x, floatY + 22);
      ctx.shadowBlur = 0;
    }

    // Health Bar overhead (for non-boss)
    if (en.type !== 'boss_queen') {
      const barW = 46;
      const barH = 5;
      const pct = Math.max(0, en.hp / en.maxHp);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(en.x - barW / 2, floatY - en.radius - 16, barW, barH);

      ctx.fillStyle = pct > 0.4 ? '#ef4444' : '#dc2626';
      ctx.fillRect(en.x - barW / 2, floatY - en.radius - 16, barW * pct, barH);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(en.x - barW / 2, floatY - en.radius - 16, barW, barH);
    }

    ctx.restore();
  };

  // Canvas Mouse Click / Touch Handler to target or strike
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!propsRef.current.gameStarted || propsRef.current.gamePaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const s = stateRef.current;

    // Check if clicked an enemy
    let clickedEnemy: Enemy | null = null;
    for (let i = s.enemies.length - 1; i >= 0; i--) {
      const en = s.enemies[i];
      const dist = Math.hypot(mouseX - en.x, mouseY - en.y);
      if (dist < en.radius + 20) {
        clickedEnemy = en;
        break;
      }
    }

    if (clickedEnemy) {
      attackEnemy(clickedEnemy);
    } else {
      // Swung in air or clicked nearest enemy
      if (s.enemies.length > 0) {
        // Find closest
        let closest = s.enemies[0];
        let minDist = 999999;
        s.enemies.forEach(en => {
          const d = Math.hypot(mouseX - en.x, mouseY - en.y);
          if (d < minDist) {
            minDist = d;
            closest = en;
          }
        });
        s.selectedTargetId = closest.id;
        attackEnemy(closest);
      } else {
        // Air slash
        s.playerSwingTimer = 14;
        sound.play('hit');
        s.slashes.push({
          x: mouseX,
          y: mouseY,
          angle: Math.random() * Math.PI,
          radius: 35,
          color: propsRef.current.activeKeyblade.color,
          life: 12,
          maxLife: 12,
        });
      }
    }
  };

  return (
    <div className="relative w-full aspect-[900/560] max-h-[580px] bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/50">
      <canvas
        ref={canvasRef}
        width={900}
        height={560}
        onMouseDown={handleCanvasMouseDown}
        className="w-full h-full block cursor-crosshair select-none"
      />
    </div>
  );
};
