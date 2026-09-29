export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'WIN' | 'GAMEOVER';

export type EnemyType = 'shadow' | 'apple_heartless' | 'armored_heartless' | 'boss_queen';

export interface Enemy {
  id: string;
  type: EnemyType;
  name: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  atk: number;
  radius: number;
  attackTimer: number;
  maxAttackTimer: number;
  isAttacking: boolean;
  floatOffset: number;
  isFrozen?: number; // frames frozen
  scale?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  life: number;
  maxLife: number;
  type?: 'spark' | 'petal' | 'slash' | 'ice' | 'darkness' | 'orb';
}

export interface SlashEffect {
  x: number;
  y: number;
  angle: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  vy: number;
  isCrit?: boolean;
}

export interface PrizeOrb {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'hp' | 'mp' | 'purity';
  value: number;
  life: number;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  purity: number;
  maxPurity: number;
  atk: number;
  guardTime: number; // if > 0 player is guarding
  dodgeTime: number; // if > 0 invulnerable dodge roll
  comboHits: number;
  comboTimer: number;
}

export interface MedalSkill {
  id: 'doc' | 'grumpy' | 'snow' | 'blizzard' | 'dopey';
  name: string;
  sub: string;
  icon: string;
  mpCost: number;
  cdMax: number;
  description: string;
}

export interface Keyblade {
  id: string;
  name: string;
  desc: string;
  atk: number;
  bonusPurity: number;
  color: string;
  unlocked: boolean;
}
