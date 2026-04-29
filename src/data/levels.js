import { STAND_H, TILE } from '../core/config.js';

const GROUND_Y = 492;
const GROUND_SHIFT = GROUND_Y - 394;

export const world = { w: 3000, h: 540 };
export const start = { x: 96, y: GROUND_Y - STAND_H };
export const goal = { x: 2860, y: 332 + GROUND_SHIFT, w: 44, h: 88 };

export const grounds = [
  { x: 0, y: GROUND_Y, w: 520, h: TILE },
  { x: 670, y: GROUND_Y, w: 420, h: TILE },
  { x: 1240, y: GROUND_Y, w: 520, h: TILE },
  { x: 1940, y: GROUND_Y, w: 400, h: TILE },
  { x: 2520, y: GROUND_Y, w: 480, h: TILE },
];

export const platforms = [
  { x: 318, y: 318 + GROUND_SHIFT, w: 115, h: 30 },
  { x: 618, y: 250 + GROUND_SHIFT, w: 115, h: 30 },
  { x: 960, y: 210 + GROUND_SHIFT, w: 110, h: 30 },
  { x: 1378, y: 314 + GROUND_SHIFT, w: 115, h: 30 },
  { x: 1655, y: 266 + GROUND_SHIFT, w: 110, h: 30 },
  { x: 1938, y: 316 + GROUND_SHIFT, w: 115, h: 30 },
  { x: 2320, y: 304 + GROUND_SHIFT, w: 120, h: 30 },
  { x: 2575, y: 272 + GROUND_SHIFT, w: 110, h: 30 },
];

export const spikes = [
  { x: 730, y: 352 + GROUND_SHIFT, w: 116, h: 42 },
  { x: 1300, y: 352 + GROUND_SHIFT, w: 64, h: 42 },
  { x: 2114, y: 352 + GROUND_SHIFT, w: 138, h: 42 },
];

export const rivers = [];
export const flowers = [[78,356],[405,354],[725,356],[1030,356],[1360,356],[1690,356],[2070,356],[2570,356],[2920,356]].map(([x,y]) => [x, y + GROUND_SHIFT]);

export const tutorials = [
  { x: 210, y: 282 + GROUND_SHIFT, keys: ['空格'], label: '跳跃' },
  { x: 785, y: 214 + GROUND_SHIFT, keys: ['空格', 'Shift'], label: '跳跃冲刺' },
];

export const coins = [];
export const healthPotions = [];
function addCoinLine(x, y, n, gap = 42) {
  for (let i = 0; i < n; i++) coins.push({ x: x + i * gap, y, w: 24, h: 24, taken: false, float: Math.random() * 6 });
}

addCoinLine(322, 276 + GROUND_SHIFT, 3);
addCoinLine(622, 208 + GROUND_SHIFT, 3);
addCoinLine(962, 168 + GROUND_SHIFT, 3);
addCoinLine(1382, 272 + GROUND_SHIFT, 3);
addCoinLine(1658, 224 + GROUND_SHIFT, 3);
addCoinLine(2322, 262 + GROUND_SHIFT, 3);
addCoinLine(2578, 230 + GROUND_SHIFT, 3);
addCoinLine(2750, 350 + GROUND_SHIFT, 3);

export const doubleJumpItem = { active: false, x: 0, y: 0, w: 34, h: 28, taken: true, float: 0 };
export const staffItem = { active: false, x: 0, y: 0, w: 34, h: 34, taken: true, float: 0 };

export const enemyStart = [
  { x: 890, y: GROUND_Y - 38, w: 48, h: 38, vx: -55, min: 700, max: 1020 },
  { x: 1440, y: GROUND_Y - 38, w: 48, h: 38, vx: -65, min: 1388, max: 1700 },
  { x: 2020, y: GROUND_Y - 38, w: 48, h: 38, vx: -60, min: 1980, max: 2290 },
  { x: 2670, y: GROUND_Y - 38, w: 48, h: 38, vx: -75, min: 2550, max: 2920 },
];

export const levelInfo = { index: 0, name: '森林集市', goalUnlocked: true, theme: 'market' };
export const progress = {
  bossDefeated: false,
  elderBossDefeated: false,
  staffUnlocked: true
};

const levelOne = {
  name: '森林集市',
  theme: 'market',
  world: { w: 3000, h: 540 },
  start: { x: 96, y: GROUND_Y - STAND_H },
  returnStart: { x: 2700, y: GROUND_Y - STAND_H },
  goal: { x: 2860, y: 332 + GROUND_SHIFT, w: 44, h: 88 },
  goalLocked: false,
  back: null,
  grounds: grounds.map(g => ({ ...g })),
  platforms: platforms.map(p => ({ ...p })),
  spikes: spikes.map(s => ({ ...s })),
  rivers: [],
  flowers: flowers.map(f => [...f]),
  tutorials: tutorials.map(t => ({ ...t, keys: [...t.keys] })),
  doubleJumpItem: null,
  staffItem: null,
  enemyStart: enemyStart.map(e => ({ ...e })),
  coins: coins.map(c => ({ ...c })),
  healthPotions: [
    { x: 1018, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
    { x: 2608, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
  ],
};

const levelTwo = {
  name: '史莱姆王庭',
  theme: 'boss',
  world: { w: 1700, h: 540 },
  start: { x: 96, y: GROUND_Y - STAND_H },
  returnStart: { x: 1420, y: GROUND_Y - STAND_H },
  goal: { x: 1540, y: 332 + GROUND_SHIFT, w: 44, h: 88 },
  goalLocked: true,
  back: { x: 28, y: 332 + GROUND_SHIFT, w: 44, h: 88 },
  grounds: [{ x: 0, y: GROUND_Y, w: 1700, h: TILE }],
  platforms: [],
  spikes: [],
  rivers: [],
  flowers: [[120,356],[360,356],[620,356],[1180,356],[1490,356]].map(([x,y]) => [x, y + GROUND_SHIFT]),
  tutorials: [],
  doubleJumpItem: null,
  staffItem: null,
  enemyStart: [
    { kind: 'boss', x: 960, y: GROUND_Y - 72, w: 96, h: 72, vx: -42, min: 720, max: 1340, hp: 5, maxHp: 5, attackTimer: 1.4 },
  ],
  coins: [],
  healthPotions: [
    { x: 430, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
  ],
};

const levelThree = {
  name: '河畔森林',
  theme: 'forest',
  world: { w: 2600, h: 540 },
  start: { x: 96, y: GROUND_Y - STAND_H },
  returnStart: { x: 2320, y: GROUND_Y - STAND_H },
  goal: { x: 2460, y: 332 + GROUND_SHIFT, w: 44, h: 88 },
  goalLocked: false,
  back: { x: 28, y: 332 + GROUND_SHIFT, w: 44, h: 88 },
  grounds: [
    { x: 0, y: GROUND_Y, w: 520, h: TILE },
    { x: 680, y: GROUND_Y, w: 560, h: TILE },
    { x: 1460, y: GROUND_Y, w: 420, h: TILE },
    { x: 2040, y: GROUND_Y, w: 560, h: TILE },
  ],
  platforms: [
    { x: 560, y: 306 + GROUND_SHIFT, w: 130, h: 30 },
    { x: 1260, y: 252 + GROUND_SHIFT, w: 135, h: 30 },
    { x: 1690, y: 286 + GROUND_SHIFT, w: 128, h: 30 },
    { x: 1900, y: 220 + GROUND_SHIFT, w: 120, h: 30 },
  ],
  spikes: [],
  rivers: [
    { x: 520, y: GROUND_Y, w: 160, h: 66 },
    { x: 1240, y: GROUND_Y, w: 220, h: 66 },
    { x: 1880, y: GROUND_Y, w: 160, h: 66 },
  ],
  flowers: [[90,356],[340,356],[760,356],[1040,356],[1500,356],[1760,356],[2120,356],[2380,356]].map(([x,y]) => [x, y + GROUND_SHIFT]),
  tutorials: [
    { x: 540, y: 270 + GROUND_SHIFT, keys: ['空格', 'Shift'], label: '越过河流' },
    { x: 1218, y: 214 + GROUND_SHIFT, keys: ['J'], label: '攻击哥布林' },
  ],
  doubleJumpItem: null,
  staffItem: null,
  enemyStart: [
    { kind: 'goblin', x: 760, y: GROUND_Y - 48, w: 38, h: 48, vx: -62, min: 700, max: 1180, hp: 2, attackTimer: .75 },
    { kind: 'goblin', x: 1510, y: GROUND_Y - 48, w: 38, h: 48, vx: 66, min: 1485, max: 1840, hp: 2, attackTimer: 1.1 },
    { kind: 'goblin', x: 2180, y: GROUND_Y - 48, w: 38, h: 48, vx: -72, min: 2080, max: 2480, hp: 3, attackTimer: 1.0 },
  ],
  coins: [
    { x: 574, y: 264 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 622, y: 264 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 1275, y: 210 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 1322, y: 210 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 1708, y: 244 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 1915, y: 178 + GROUND_SHIFT, w: 24, h: 24 },
    { x: 2280, y: 350 + GROUND_SHIFT, w: 24, h: 24 },
  ],
  healthPotions: [
    { x: 820, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
    { x: 1530, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
    { x: 2208, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
  ],
};

const levelFour = {
  ...levelThree,
  name: '长老密林',
  theme: 'forest',
  goalLocked: true,
  staffItem: null,
  enemyStart: [
    { kind: 'elderBoss', x: 2070, y: GROUND_Y - 86, w: 82, h: 86, vx: -34, min: 2040, max: 2460, hp: 15, maxHp: 15, attackTimer: 1.0 },
  ],
  tutorials: [
    { x: 760, y: 270 + GROUND_SHIFT, keys: ['J'], label: '击败长老' },
    { x: 1420, y: 214 + GROUND_SHIFT, keys: ['Shift'], label: '躲避法术' },
  ],
  coins: [],
  healthPotions: [
    { x: 820, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
    { x: 1530, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
    { x: 2208, y: 350 + GROUND_SHIFT, w: 28, h: 28 },
  ],
};

export const levels = [levelOne, levelTwo, levelThree, levelFour];
export const back = { x: -999, y: -999, w: 0, h: 0 };

function replaceArray(target, source) {
  target.splice(0, target.length, ...source.map(item => Array.isArray(item) ? [...item] : { ...item }));
}

export function loadLevel(index) {
  const data = levels[index];
  levelInfo.index = index;
  levelInfo.name = data.name;
  levelInfo.theme = data.theme ?? 'market';
  levelInfo.goalUnlocked = !data.goalLocked || (index === 1 && progress.bossDefeated) || (index === 3 && progress.elderBossDefeated);
  Object.assign(world, data.world);
  Object.assign(start, data.start);
  Object.assign(goal, data.goal);
  Object.assign(back, data.back ?? { x: -999, y: -999, w: 0, h: 0 });
  Object.assign(doubleJumpItem, data.doubleJumpItem ?? { active: false, x: 0, y: 0, w: 34, h: 28, taken: true, float: 0 });
  Object.assign(staffItem, data.staffItem ?? { active: false, x: 0, y: 0, w: 34, h: 34, taken: true, float: 0 });
  replaceArray(grounds, data.grounds);
  replaceArray(platforms, data.platforms);
  replaceArray(spikes, data.spikes);
  replaceArray(rivers, data.rivers ?? []);
  replaceArray(flowers, data.flowers);
  replaceArray(tutorials, data.tutorials);
  replaceArray(enemyStart, data.enemyStart);
  coins.splice(0, coins.length, ...data.coins.map(c => ({ ...c, taken: false, float: Math.random() * 6 })));
  healthPotions.splice(0, healthPotions.length, ...(data.healthPotions ?? []).map(p => ({ ...p, taken: false, float: Math.random() * 6 })));
}
