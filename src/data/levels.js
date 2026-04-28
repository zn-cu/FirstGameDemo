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

export const flowers = [[78,356],[405,354],[725,356],[1030,356],[1360,356],[1690,356],[2070,356],[2570,356],[2920,356]].map(([x,y]) => [x, y + GROUND_SHIFT]);

export const tutorials = [
  { x: 210, y: 282 + GROUND_SHIFT, keys: ['空格'], label: '跳跃' },
  { x: 785, y: 214 + GROUND_SHIFT, keys: ['空格', 'Shift'], label: '跳跃冲刺' },
];

export const coins = [];
function addCoinLine(x, y, n, gap=42) {
  for (let i = 0; i < n; i++) coins.push({ x:x+i*gap, y, w:24, h:24, taken:false, float:Math.random()*6 });
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

export const enemyStart = [
  { x: 890, y: GROUND_Y-38, w: 48, h: 38, vx: -55, min: 700, max: 1020 },
  { x: 1440, y: GROUND_Y-38, w: 48, h: 38, vx: -65, min: 1388, max: 1700 },
  { x: 2020, y: GROUND_Y-38, w: 48, h: 38, vx: -60, min: 1980, max: 2290 },
  { x: 2670, y: GROUND_Y-38, w: 48, h: 38, vx: -75, min: 2550, max: 2920 },
];

export const levelInfo = { index: 0, name: '森林集市', goalUnlocked: true };

const levelOne = {
  name: '森林集市',
  world: { w: 3000, h: 540 },
  start: { x: 96, y: GROUND_Y - STAND_H },
  returnStart: { x: 2700, y: GROUND_Y - STAND_H },
  goal: { x: 2860, y: 332 + GROUND_SHIFT, w: 44, h: 88 },
  goalLocked: false,
  back: null,
  grounds: grounds.map(g => ({ ...g })),
  platforms: platforms.map(p => ({ ...p })),
  spikes: spikes.map(s => ({ ...s })),
  flowers: flowers.map(f => [...f]),
  tutorials: tutorials.map(t => ({ ...t, keys: [...t.keys] })),
  doubleJumpItem: null,
  enemyStart: enemyStart.map(e => ({ ...e })),
  coins: coins.map(c => ({ ...c })),
};

const levelTwo = {
  name: '史莱姆王庭',
  world: { w: 1700, h: 540 },
  start: { x: 96, y: GROUND_Y - STAND_H },
  returnStart: { x: 96, y: GROUND_Y - STAND_H },
  goal: { x: 1540, y: 332 + GROUND_SHIFT, w: 44, h: 88 },
  goalLocked: true,
  back: { x: 28, y: 332 + GROUND_SHIFT, w: 44, h: 88 },
  grounds: [{ x: 0, y: GROUND_Y, w: 1700, h: TILE }],
  platforms: [],
  spikes: [],
  flowers: [[120,356],[360,356],[620,356],[1180,356],[1490,356]].map(([x,y]) => [x, y + GROUND_SHIFT]),
  tutorials: [],
  doubleJumpItem: null,
  enemyStart: [
    { kind: 'boss', x: 960, y: GROUND_Y-72, w: 96, h: 72, vx: -42, min: 720, max: 1340, hp: 5, maxHp: 5, attackTimer: 1.4 },
  ],
  coins: [],
};

export const levels = [levelOne, levelTwo];
export const back = { x: -999, y: -999, w: 0, h: 0 };

function replaceArray(target, source) {
  target.splice(0, target.length, ...source.map(item => Array.isArray(item) ? [...item] : { ...item }));
}

export function loadLevel(index) {
  const data = levels[index];
  levelInfo.index = index;
  levelInfo.name = data.name;
  levelInfo.goalUnlocked = !data.goalLocked;
  Object.assign(world, data.world);
  Object.assign(start, data.start);
  Object.assign(goal, data.goal);
  Object.assign(back, data.back ?? { x: -999, y: -999, w: 0, h: 0 });
  Object.assign(doubleJumpItem, data.doubleJumpItem ?? { active: false, x: 0, y: 0, w: 34, h: 28, taken: true, float: 0 });
  replaceArray(grounds, data.grounds);
  replaceArray(platforms, data.platforms);
  replaceArray(spikes, data.spikes);
  replaceArray(flowers, data.flowers);
  replaceArray(tutorials, data.tutorials);
  replaceArray(enemyStart, data.enemyStart);
  coins.splice(0, coins.length, ...data.coins.map(c => ({ ...c, taken: false, float: Math.random() * 6 })));
}
