import { STAND_H, TILE } from '../core/config.js';

const GROUND_Y = 492;
const GROUND_SHIFT = GROUND_Y - 394;
const HIDDEN_RECT = { x: -999, y: -999, w: 0, h: 0 };

export const world = { w: 4400, h: 540 };
export const start = { x: 96, y: GROUND_Y - STAND_H };
export const goal = { x: 4260, y: 332 + GROUND_SHIFT, w: 44, h: 88 };

export const grounds = [
  { x: 0, y: GROUND_Y, w: 520, h: TILE },
  { x: 670, y: GROUND_Y, w: 420, h: TILE },
  { x: 1240, y: GROUND_Y, w: 520, h: TILE },
  { x: 1940, y: GROUND_Y, w: 400, h: TILE },
  { x: 2520, y: GROUND_Y, w: 480, h: TILE },
  { x: 3180, y: GROUND_Y, w: 400, h: TILE },
  { x: 3740, y: GROUND_Y, w: 660, h: TILE },
];

export const platforms = [
  { x: 500, y: 318 + GROUND_SHIFT, w: 115, h: 30 },
  { x: 618, y: 250 + GROUND_SHIFT, w: 115, h: 30 },
  { x: 960, y: 210 + GROUND_SHIFT, w: 110, h: 30 },
  { x: 1378, y: 314 + GROUND_SHIFT, w: 115, h: 30 },
  { x: 1655, y: 266 + GROUND_SHIFT, w: 110, h: 30 },
  { x: 1938, y: 316 + GROUND_SHIFT, w: 115, h: 30 },
  { x: 2320, y: 304 + GROUND_SHIFT, w: 120, h: 30 },
  { x: 2575, y: 272 + GROUND_SHIFT, w: 110, h: 30 },
  { x: 3020, y: 310 + GROUND_SHIFT, w: 130, h: 30 },
  { x: 3240, y: 260 + GROUND_SHIFT, w: 130, h: 30 },
  { x: 3470, y: 220 + GROUND_SHIFT, w: 140, h: 30 },
  { x: 3710, y: 260 + GROUND_SHIFT, w: 130, h: 30 },
  { x: 3930, y: 308 + GROUND_SHIFT, w: 130, h: 30 },
];

export const spikes = [
  { x: 730, y: 352 + GROUND_SHIFT, w: 116, h: 42 },
  { x: 1300, y: 352 + GROUND_SHIFT, w: 64, h: 42 },
  { x: 2114, y: 352 + GROUND_SHIFT, w: 138, h: 42 },
];

export const rivers = [];
export const flowers = [[78,356],[405,354],[725,356],[1030,356],[1360,356],[1690,356],[2070,356],[2570,356],[2920,356],[3260,356],[3520,356],[3820,356],[4140,356],[4330,356]].map(([x,y]) => [x, y + GROUND_SHIFT]);

export const tutorials = [];

export const coins = [];
export const healthPotions = [];
function addCoinLine(x, y, n, gap = 42) {
  for (let i = 0; i < n; i++) coins.push({ x: x + i * gap, y, w: 24, h: 24, taken: false, float: Math.random() * 6 });
}

addCoinLine(504, 276 + GROUND_SHIFT, 3);
addCoinLine(622, 208 + GROUND_SHIFT, 3);
addCoinLine(962, 168 + GROUND_SHIFT, 3);
addCoinLine(1382, 272 + GROUND_SHIFT, 3);
addCoinLine(1658, 224 + GROUND_SHIFT, 3);
addCoinLine(2322, 262 + GROUND_SHIFT, 3);
addCoinLine(2578, 230 + GROUND_SHIFT, 3);
addCoinLine(2750, 350 + GROUND_SHIFT, 3);
addCoinLine(3026, 268 + GROUND_SHIFT, 3);
addCoinLine(3246, 218 + GROUND_SHIFT, 3);
addCoinLine(3484, 178 + GROUND_SHIFT, 4);
addCoinLine(3938, 266 + GROUND_SHIFT, 3);
addCoinLine(4140, 350 + GROUND_SHIFT, 4);

export const doubleJumpItem = { active: false, x: 0, y: 0, w: 34, h: 28, taken: true, float: 0 };
export const staffItem = { active: false, x: 0, y: 0, w: 34, h: 34, taken: true, float: 0 };
export const npcs = [];
export const treehouses = [];
export const bossDoors = [];

export const enemyStart = [
  { x: 410, y: GROUND_Y - 38, w: 48, h: 38, vx: -42, min: 360, max: 500 },
  { x: 890, y: GROUND_Y - 38, w: 48, h: 38, vx: -55, min: 848, max: 1020 },
  { x: 990, y: GROUND_Y - 38, w: 48, h: 38, vx: 48, min: 848, max: 1040 },
  { x: 1440, y: GROUND_Y - 38, w: 48, h: 38, vx: -65, min: 1366, max: 1700 },
  { x: 1580, y: GROUND_Y - 38, w: 48, h: 38, vx: 58, min: 1366, max: 1730 },
  { x: 1700, y: GROUND_Y - 38, w: 48, h: 38, vx: -54, min: 1366, max: 1730 },
  { x: 2020, y: GROUND_Y - 38, w: 48, h: 38, vx: -60, min: 1980, max: 2064 },
  { x: 2268, y: GROUND_Y - 38, w: 48, h: 38, vx: 56, min: 2254, max: 2300 },
  { x: 2670, y: GROUND_Y - 38, w: 48, h: 38, vx: -75, min: 2550, max: 2920 },
  { x: 2880, y: GROUND_Y - 38, w: 48, h: 38, vx: 62, min: 2550, max: 2960 },
  { x: 3260, y: GROUND_Y - 38, w: 48, h: 38, vx: -58, min: 3210, max: 3540 },
  { x: 3480, y: GROUND_Y - 38, w: 48, h: 38, vx: 60, min: 3210, max: 3540 },
  { x: 3860, y: GROUND_Y - 38, w: 48, h: 38, vx: -64, min: 3780, max: 4320 },
  { x: 4140, y: GROUND_Y - 38, w: 48, h: 38, vx: 68, min: 3780, max: 4320 },
];

export const levelInfo = { index: 0, name: '史莱姆森林', goalUnlocked: true, theme: 'market', chapter: 1 };
export const progress = {
  bossDefeated: false,
  elderBossDefeated: false,
  yukinoDefeated: false,
  staffUnlocked: false
};

const levelOne = {
  name: '史莱姆森林',
  chapter: 1,
  theme: 'market',
  world: { w: 4400, h: 540 },
  start: { x: 96, y: GROUND_Y - STAND_H },
  returnStart: { x: 3748, y: GROUND_Y - STAND_H },
  goal: { x: 4260, y: 332 + GROUND_SHIFT, w: 44, h: 88 },
  goalLocked: false,
  goalAction: 'goToLevel',
  targetLevelIndex: 2,
  back: null,
  grounds: grounds.map(g => ({ ...g })),
  platforms: platforms.map(p => ({ ...p })),
  spikes: spikes.map(s => ({ ...s })),
  rivers: [],
  treehouses: [
    {
      x: 3428,
      y: 132,
      w: 190,
      h: 190,
      entry: { x: 3500, y: 238, w: 48, h: 80 },
      targetLevelIndex: 1
    },
  ],
  bossDoors: [],
  flowers: flowers.map(f => [...f]),
  tutorials: [],
  npcs: [
    {
      kind: 'oldVillageChief',
      x: 290,
      y: GROUND_Y - 82,
      w: 58,
      h: 82,
      frames: 4,
      dialogue: [
        { speaker: '玩家', text: '老爷子，这里是什么地方，我应该怎么离开这里。' },
        { speaker: '老村长', text: '这里是巴拉村落东边的史莱姆森林，里面居住着一些史莱姆，穿过这片森林往东走便是巴拉村落。' },
        { speaker: '老村长', text: '年轻人，最近森林里史莱姆繁殖数量越来越多了。你能帮村子收集十个史莱姆粘液吗。作为报答，我会给你我年轻时使用过的法杖（解锁远程攻击）。' },
      ],
    },
  ],
  doubleJumpItem: null,
  staffItem: null,
  enemyStart: enemyStart.map(e => ({ ...e })),
  coins: coins.map(c => ({ ...c })),
  healthPotions: [
    { x: 1018, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
    { x: 2608, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
    { x: 4210, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
  ],
};

const levelTwo = {
  name: '史莱姆王庭',
  chapter: null,
  theme: 'boss',
  world: { w: 1700, h: 540 },
  start: { x: 96, y: GROUND_Y - STAND_H },
  returnStart: { x: 1420, y: GROUND_Y - STAND_H },
  goal: HIDDEN_RECT,
  goalLocked: true,
  back: { x: 1540, y: 332 + GROUND_SHIFT, w: 44, h: 88, dir: 'right' },
  backLocked: true,
  backUnlockProgress: 'bossDefeated',
  backTargetLevelIndex: 0,
  backSpawn: { x: 3736, y: 260 + GROUND_SHIFT - STAND_H },
  grounds: [{ x: 0, y: GROUND_Y, w: 1700, h: TILE }],
  platforms: [],
  spikes: [],
  rivers: [],
  treehouses: [],
  bossDoors: [],
  flowers: [[120,356],[360,356],[620,356],[1180,356],[1490,356]].map(([x,y]) => [x, y + GROUND_SHIFT]),
  tutorials: [],
  npcs: [],
  doubleJumpItem: null,
  staffItem: null,
  enemyStart: [
    { kind: 'boss', x: 960, y: GROUND_Y - 72, w: 96, h: 72, vx: -42, min: 720, max: 1340, hp: 10, maxHp: 10, attackTimer: 1.4 },
  ],
  coins: [],
  healthPotions: [
    { x: 430, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
  ],
};

const levelThree = {
  name: '河畔森林',
  chapter: 2,
  theme: 'forest',
  world: { w: 3900, h: 540 },
  start: { x: 96, y: GROUND_Y - STAND_H },
  returnStart: { x: 3600, y: GROUND_Y - STAND_H },
  goal: { x: 3760, y: 332 + GROUND_SHIFT, w: 44, h: 88 },
  goalLocked: false,
  back: { x: 28, y: 332 + GROUND_SHIFT, w: 44, h: 88 },
  backTargetLevelIndex: 0,
  grounds: [
    { x: 0, y: GROUND_Y, w: 520, h: TILE },
    { x: 680, y: GROUND_Y, w: 560, h: TILE },
    { x: 1460, y: GROUND_Y, w: 420, h: TILE },
    { x: 2040, y: GROUND_Y, w: 560, h: TILE },
    { x: 2720, y: GROUND_Y, w: 460, h: TILE },
    { x: 3340, y: GROUND_Y, w: 560, h: TILE },
  ],
  platforms: [
    { x: 560, y: 306 + GROUND_SHIFT, w: 130, h: 30 },
    { x: 1260, y: 252 + GROUND_SHIFT, w: 135, h: 30 },
    { x: 1690, y: 286 + GROUND_SHIFT, w: 128, h: 30 },
    { x: 1900, y: 220 + GROUND_SHIFT, w: 120, h: 30 },
    { x: 2660, y: 306 + GROUND_SHIFT, w: 130, h: 30 },
    { x: 2920, y: 250 + GROUND_SHIFT, w: 130, h: 30 },
    { x: 3190, y: 286 + GROUND_SHIFT, w: 140, h: 30 },
    { x: 3430, y: 232 + GROUND_SHIFT, w: 130, h: 30 },
    { x: 3620, y: 304 + GROUND_SHIFT, w: 150, h: 30 },
  ],
  spikes: [],
  rivers: [
    { x: 520, y: GROUND_Y, w: 160, h: 66 },
    { x: 1240, y: GROUND_Y, w: 220, h: 66 },
    { x: 1880, y: GROUND_Y, w: 160, h: 66, hiddenLevel: 3 },
    { x: 2600, y: GROUND_Y, w: 120, h: 66 },
    { x: 3180, y: GROUND_Y, w: 160, h: 66 },
  ],
  treehouses: [],
  bossDoors: [],
  flowers: [[90,356],[340,356],[760,356],[1040,356],[1500,356],[1760,356],[2120,356],[2380,356],[2780,356],[3060,356],[3420,356],[3680,356]].map(([x,y]) => [x, y + GROUND_SHIFT]),
  tutorials: [],
  npcs: [],
  doubleJumpItem: null,
  staffItem: null,
  enemyStart: [
    { kind: 'goblin', x: 760, y: GROUND_Y - 48, w: 38, h: 48, vx: -62, min: 700, max: 1180, hp: 2, attackTimer: .75 },
    { kind: 'goblin', x: 1510, y: GROUND_Y - 48, w: 38, h: 48, vx: 66, min: 1485, max: 1840, hp: 2, attackTimer: 1.1 },
    { kind: 'goblin', x: 2180, y: GROUND_Y - 48, w: 38, h: 48, vx: -72, min: 2080, max: 2480, hp: 3, attackTimer: 1.0 },
    { kind: 'goblin', x: 2820, y: GROUND_Y - 48, w: 38, h: 48, vx: -66, min: 2760, max: 3120, hp: 2, attackTimer: .9 },
    { kind: 'goblin', x: 3460, y: GROUND_Y - 48, w: 38, h: 48, vx: 70, min: 3380, max: 3820, hp: 3, attackTimer: 1.0 },
    { kind: 'goblin', x: 3670, y: GROUND_Y - 48, w: 38, h: 48, vx: -58, min: 3380, max: 3820, hp: 2, attackTimer: 1.25 },
  ],
  coins: [
    { x: 574, y: 264 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 622, y: 264 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 1275, y: 210 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 1322, y: 210 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 1708, y: 244 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 1915, y: 178 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 2280, y: 350 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 2676, y: 264 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 2722, y: 264 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 2938, y: 208 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 2984, y: 208 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 3212, y: 244 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 3260, y: 244 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 3448, y: 190 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 3494, y: 190 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 3644, y: 262 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 3690, y: 262 + GROUND_SHIFT, w: 24, h: 24 },
  ],
  healthPotions: [
    { x: 820, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
    { x: 1530, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
    { x: 2208, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
    { x: 3520, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
  ],
  goalAction: 'goToLevel',
  targetLevelIndex: 4,
};

const levelFour = {
  name: '水底洞窟',
  chapter: null,
  theme: 'underwater',
  world: { w: 1800, h: 540 },
  start: { x: 96, y: GROUND_Y - STAND_H },
  returnStart: { x: 1540, y: GROUND_Y - STAND_H },
  goal: { x: 1660, y: 332 + GROUND_SHIFT, w: 44, h: 88 },
  goalLocked: true,
  back: null,
  grounds: [{ x: 0, y: GROUND_Y, w: 1800, h: TILE }],
  platforms: [],
  spikes: [],
  rivers: [],
  treehouses: [],
  bossDoors: [],
  flowers: [],
  tutorials: [],
  npcs: [],
  doubleJumpItem: null,
  staffItem: null,
  enemyStart: [
    { kind: 'elderBoss', x: 1260, y: GROUND_Y - 86, w: 82, h: 86, vx: -34, min: 980, max: 1540, hp: 15, maxHp: 15, attackTimer: 1.0 },
  ],
  coins: [],
  healthPotions: [
    { x: 520, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
    { x: 900, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
  ],
  goalAction: 'returnToLevel',
  returnLevelIndex: 2,
};

const levelFive = {
  name: '千立学校',
  chapter: 3,
  theme: 'school',
  world: { w: 3400, h: 540 },
  start: { x: 96, y: GROUND_Y - STAND_H },
  returnStart: { x: 3100, y: GROUND_Y - STAND_H },
  goal: { x: 3260, y: 332 + GROUND_SHIFT, w: 44, h: 88 },
  goalLocked: true,
  back: { x: 28, y: 332 + GROUND_SHIFT, w: 44, h: 88 },
  backTargetLevelIndex: 2,
  grounds: [
    { x: 0, y: GROUND_Y, w: 720, h: TILE },
    { x: 880, y: GROUND_Y, w: 560, h: TILE },
    { x: 1620, y: GROUND_Y, w: 520, h: TILE },
    { x: 2320, y: GROUND_Y, w: 420, h: TILE },
    { x: 2920, y: GROUND_Y, w: 480, h: TILE },
  ],
  platforms: [
    { x: 520, y: 314 + GROUND_SHIFT, w: 130, h: 30 },
    { x: 790, y: 258 + GROUND_SHIFT, w: 132, h: 30 },
    { x: 1120, y: 220 + GROUND_SHIFT, w: 128, h: 30 },
    { x: 1490, y: 302 + GROUND_SHIFT, w: 136, h: 30 },
    { x: 1840, y: 248 + GROUND_SHIFT, w: 130, h: 30 },
    { x: 2160, y: 300 + GROUND_SHIFT, w: 132, h: 30 },
    { x: 2600, y: 252 + GROUND_SHIFT, w: 140, h: 30 },
    { x: 2860, y: 306 + GROUND_SHIFT, w: 150, h: 30 },
  ],
  spikes: [
    { x: 360, y: 352 + GROUND_SHIFT, w: 64, h: 42 },
    { x: 1320, y: 352 + GROUND_SHIFT, w: 90, h: 42 },
    { x: 2040, y: 352 + GROUND_SHIFT, w: 72, h: 42 },
    { x: 2360, y: 352 + GROUND_SHIFT, w: 72, h: 42 },
    { x: 3180, y: 352 + GROUND_SHIFT, w: 72, h: 42 },
  ],
  rivers: [],
  treehouses: [],
  bossDoors: [
    {
      x: 3050,
      y: GROUND_Y - 164,
      w: 132,
      h: 164,
      entry: { x: 3090, y: GROUND_Y - 112, w: 54, h: 112 },
      targetLevelIndex: 5
    },
  ],
  flowers: [[180,356],[420,356],[980,356],[1280,356],[1700,356],[2020,356],[2400,356],[3040,356],[3220,356]].map(([x,y]) => [x, y + GROUND_SHIFT]),
  tutorials: [],
  npcs: [],
  doubleJumpItem: null,
  staffItem: null,
  enemyStart: [
    { kind: 'bookMonster', x: 960, y: GROUND_Y - 48, w: 42, h: 48, vx: -62, min: 920, max: 1360, hp: 3, attackTimer: .8 },
    { kind: 'bookMonster', x: 1740, y: GROUND_Y - 48, w: 42, h: 48, vx: 66, min: 1660, max: 2080, hp: 3, attackTimer: 1.0 },
    { kind: 'eliteBook', x: 2480, y: GROUND_Y - 68, w: 56, h: 68, vx: -48, min: 2440, max: 2580, hp: 8, maxHp: 8, attackTimer: 1.15 },
    { kind: 'bookMonster', x: 3020, y: GROUND_Y - 48, w: 42, h: 48, vx: -70, min: 2980, max: 3160, hp: 3, attackTimer: .9 },
    { kind: 'bookMonster', x: 3260, y: GROUND_Y - 48, w: 42, h: 48, vx: 58, min: 3220, max: 3300, hp: 3, attackTimer: 1.15 },
  ],
  coins: [
    { x: 536, y: 272 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 582, y: 272 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 806, y: 216 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 852, y: 216 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 1136, y: 178 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 1182, y: 178 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 1856, y: 206 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 1902, y: 206 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 2618, y: 210 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 2664, y: 210 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 2890, y: 264 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 2936, y: 264 + GROUND_SHIFT, w: 24, h: 24 },
  ],
  healthPotions: [
    { x: 1260, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
    { x: 3140, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
  ],
  goalAction: 'win',
};

const levelSix = {
  name: '千立学校Boss房',
  chapter: null,
  theme: 'school',
  world: { w: 1800, h: 540 },
  start: { x: 96, y: GROUND_Y - STAND_H },
  returnStart: { x: 1540, y: GROUND_Y - STAND_H },
  goal: { x: 1660, y: 332 + GROUND_SHIFT, w: 44, h: 88 },
  goalLocked: true,
  back: { x: 28, y: 332 + GROUND_SHIFT, w: 44, h: 88 },
  backTargetLevelIndex: 4,
  backSpawn: { x: 3220, y: GROUND_Y - STAND_H },
  grounds: [{ x: 0, y: GROUND_Y, w: 1800, h: TILE }],
  platforms: [],
  spikes: [],
  rivers: [],
  treehouses: [],
  bossDoors: [],
  flowers: [[180,356],[460,356],[820,356],[1180,356],[1480,356]].map(([x,y]) => [x, y + GROUND_SHIFT]),
  tutorials: [],
  npcs: [],
  doubleJumpItem: null,
  staffItem: null,
  enemyStart: [
    { kind: 'yukino', x: 1120, y: GROUND_Y - 76, w: 46, h: 76, vx: -44, min: 760, max: 1500, hp: 20, maxHp: 20, attackTimer: 1.0 },
  ],
  coins: [],
  healthPotions: [],
  goalAction: 'win',
};

export const levels = [levelOne, levelTwo, levelThree, levelFour, levelFive, levelSix];
export const back = { ...HIDDEN_RECT };
const collectedCoinsByLevel = new Map();

function replaceArray(target, source) {
  target.splice(0, target.length, ...source.map(item => Array.isArray(item) ? [...item] : { ...item }));
}

export function markCoinCollected(levelIndex, coinIndex) {
  if (!collectedCoinsByLevel.has(levelIndex)) collectedCoinsByLevel.set(levelIndex, new Set());
  collectedCoinsByLevel.get(levelIndex).add(coinIndex);
}

export function loadLevel(index) {
  const data = levels[index];
  const collectedCoins = collectedCoinsByLevel.get(index) ?? new Set();
  const backUnlocked = data.back && (!data.backLocked || progress[data.backUnlockProgress]);
  const enemySource = data.enemyStart.filter(enemy => {
    if (enemy.kind === 'boss' && progress.bossDefeated) return false;
    if (enemy.kind === 'yukino' && progress.yukinoDefeated) return false;
    return true;
  });
  levelInfo.index = index;
  levelInfo.name = data.name;
  levelInfo.chapter = data.chapter ?? null;
  levelInfo.theme = data.theme ?? 'market';
  levelInfo.goalUnlocked = !data.goalLocked || (index === 0 && progress.staffUnlocked) || (index === 1 && progress.bossDefeated) || (index === 3 && progress.elderBossDefeated) || (index === 5 && progress.yukinoDefeated);
  Object.assign(world, data.world);
  Object.assign(start, data.start);
  Object.assign(goal, data.goal);
  Object.assign(back, backUnlocked ? data.back : HIDDEN_RECT);
  Object.assign(doubleJumpItem, data.doubleJumpItem ?? { active: false, x: 0, y: 0, w: 34, h: 28, taken: true, float: 0 });
  Object.assign(staffItem, data.staffItem ?? { active: false, x: 0, y: 0, w: 34, h: 34, taken: true, float: 0 });
  replaceArray(grounds, data.grounds);
  replaceArray(platforms, data.platforms);
  replaceArray(spikes, data.spikes);
  replaceArray(rivers, data.rivers ?? []);
  replaceArray(treehouses, data.treehouses ?? []);
  replaceArray(bossDoors, data.bossDoors ?? []);
  replaceArray(flowers, data.flowers);
  replaceArray(tutorials, data.tutorials);
  replaceArray(npcs, data.npcs ?? []);
  replaceArray(enemyStart, enemySource);
  coins.splice(0, coins.length, ...data.coins.map((c, coinIndex) => ({ ...c, taken: collectedCoins.has(coinIndex), float: Math.random() * 6 })));
  healthPotions.splice(0, healthPotions.length, ...(data.healthPotions ?? []).map(p => ({ ...p, taken: false, float: Math.random() * 6 })));
}
