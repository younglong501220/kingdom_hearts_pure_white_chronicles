import { Keyblade, MedalSkill } from '../types/game';

export const MEDAL_SKILLS: MedalSkill[] = [
  {
    id: 'doc',
    name: '萬事通重擊',
    sub: 'Doc Smash',
    icon: '👓',
    mpCost: 15,
    cdMax: 180, // ~3s
    description: '萬事通的智慧震擊！對全體敵人造成魔法光波傷害並造成短暫暈眩。',
  },
  {
    id: 'grumpy',
    name: '生氣鬼破甲',
    sub: 'Grumpy Cleave',
    icon: '⛏️',
    mpCost: 20,
    cdMax: 240, // ~4s
    description: '揮動精鋼十字鎬沉重砸擊！對鎖定目標造成毀滅性物理暴擊。',
  },
  {
    id: 'snow',
    name: '純白祈願',
    sub: 'Pure Prayer',
    icon: '🍎',
    mpCost: 25,
    cdMax: 300, // ~5s
    description: '喚起白雪公主純潔之心的庇佑，回復45 HP並注入25%純潔之光。',
  },
  {
    id: 'blizzard',
    name: '暴風雪魔法',
    sub: 'Blizzard',
    icon: '❄️',
    mpCost: 30,
    cdMax: 320, // ~5.3s
    description: '召喚冰晶風暴！對全場敵人造成冰屬性傷害並凍結攻擊蓄力。',
  },
  {
    id: 'dopey',
    name: '糊塗蛋幸運',
    sub: 'Lucky Roll',
    icon: '💎',
    mpCost: 12,
    cdMax: 200,
    description: '糊塗蛋淘金奇蹟！擊落周圍敵人的心之光球與生命寶石。',
  },
];

export const INITIAL_KEYBLADES: Keyblade[] = [
  {
    id: 'kingdom_key',
    name: '王國之鑰 (Kingdom Key)',
    desc: '象徵光之勇者的初始鑰刃，平衡且堅韌。',
    atk: 15,
    bonusPurity: 0,
    color: '#f1c40f',
    unlocked: true,
  },
  {
    id: 'woodland_oath',
    name: '林地之誓 (Woodland Oath)',
    desc: '白雪公主贈予的鑰刃，凝聚純潔之心與森林綠意，斬擊帶有光芒花瓣。',
    atk: 25,
    bonusPurity: 35,
    color: '#2ecc71',
    unlocked: false,
  },
  {
    id: 'starlight',
    name: '星光之約 (Starlight)',
    desc: '古老童話之光凝聚而成的鑰刃，攻擊大幅增強純潔之光累積。',
    atk: 32,
    bonusPurity: 60,
    color: '#60a5fa',
    unlocked: false,
  },
];
