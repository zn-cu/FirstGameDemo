import { createAudio } from './core/audio.js';
import { loadAssets } from './core/assets.js';
import { rects } from './core/collision.js';
import { back, coins, doubleJumpItem, enemyStart, flowers, goal, grounds, healthPotions, levelInfo, levels, loadLevel, markCoinCollected, npcs, platforms, progress, rivers, spikes, staffItem, start, tutorials, world } from './data/levels.js';
import { createRenderer } from './render/renderer.js';
import { attackActive, attackRect, createAttack, resetAttack, startAttack, updateAttack } from './systems/attack.js';
import { createEnemies, updateEnemies } from './systems/enemies.js';
import { addHealthPotion, createPlayer, footRect, refreshJumps, resetPlayer, takePlayerDamage, updatePlayer, useHealthPotion } from './systems/player.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const W = canvas.width, H = canvas.height;
const keys = new Set();
const audio = createAudio();

loadLevel(0);
const assets = await loadAssets();
const renderer = createRenderer(ctx, canvas, assets, { back, coins, doubleJumpItem, flowers, goal, grounds, healthPotions, levelInfo, npcs, platforms, rivers, spikes, staffItem, tutorials });

let enemies = [], bubbles = [], materialDrops = [], particles = [], playerProjectiles = [];
let cameraX = 0, screenShake = 0, hurtFlash = 0, modal = null, dialogue = null, last = performance.now();
let inventoryOpen = false;
let jumpLatch = false, attackLatch = false, dashLatch = false, staffLatch = false, interactLatch = false, staffCooldown = 0;
let introDialogueShown = false, introMoveDistance = 0, lastPlayerX = 0;
const attack = createAttack();
const staffCast = { duration: .38, releaseAt: .18, timer: 0, frames: 6, drawW: 150, drawH: 94, dir: 1, fired: false };
const player = createPlayer(start);
const inventory = { slimeMucus: 0 };
const quest = { oldVillageChiefIntroDone: false, staffRewarded: false };
lastPlayerX = player.x;

const introDialogue = [
  {
    speaker: '玩家',
    text: '我不是在工位上敲代码吗，怎么突然穿越了，不管了，既来之则安之，前方有一个老爷子，先问下现在是哪里吧。'
  },
];

const staffRewardDialogue = [
  { speaker: '老村长', text: '年轻人你非常的勇敢，这个新手法杖就交给你了。' },
];

function makeEnemies() { enemies = createEnemies(enemyStart); }
function musicForLevel(index) { return index === 3 ? 'elderBoss' : (index === 1 ? 'boss' : 'scene'); }
function resetEphemeral() {
  resetAttack(attack);
  makeEnemies();
  bubbles = [];
  materialDrops = [];
  particles = [];
  playerProjectiles = [];
  screenShake = 0;
  hurtFlash = 0;
  modal = null;
  dialogue = null;
  inventoryOpen = false;
  attackLatch = false;
  dashLatch = false;
  staffLatch = false;
  interactLatch = false;
  staffCooldown = 0;
  staffCast.timer = 0;
  staffCast.fired = false;
}
function reset() {
  loadLevel(levelInfo.index);
  resetPlayer(player, start, { keepAbilities: true });
  resetEphemeral();
  cameraX = 0;
  lastPlayerX = player.x;
  if (levelInfo.index === 0) {
    introDialogueShown = false;
    introMoveDistance = 0;
  }
}
function enterLevel(index, spawn = start) {
  loadLevel(index);
  audio.setMusic(musicForLevel(index));
  resetPlayer(player, spawn, { keepProgress: true });
  resetEphemeral();
  player.invincible = Math.max(player.invincible, .85);
  cameraX = Math.max(0, Math.min(world.w - W, spawn.x - W * .36));
  lastPlayerX = player.x;
}

makeEnemies();
audio.setMusic(musicForLevel(levelInfo.index));
document.querySelector('#restartBtn').onclick = reset;

function closeModal() {
  modal = null;
  jumpLatch = true;
  keys.delete('Space');
}

function startDialogue(lines, onComplete = null) {
  dialogue = { lines, index: 0, onComplete };
  player.vx = 0;
}

function advanceDialogue() {
  if (!dialogue) return false;
  if (dialogue.index < dialogue.lines.length - 1) dialogue.index++;
  else {
    const onComplete = dialogue.onComplete;
    dialogue = null;
    onComplete?.();
  }
  keys.delete('Space');
  keys.delete('Enter');
  keys.delete('KeyE');
  jumpLatch = true;
  interactLatch = true;
  return true;
}

function unlockStaffReward() {
  if (quest.staffRewarded) return;
  quest.staffRewarded = true;
  player.hasStaff = true;
  progress.staffUnlocked = true;
  modal = { title: '获得武器', message: '你获得了新手法杖，可以释放法球', hint: '按空格或点击确定继续' };
}

function nearbyNpc() {
  const playerCenter = player.x + player.w / 2;
  return npcs.find(npc => {
    const npcCenter = npc.x + npc.w / 2;
    const dx = npcCenter - playerCenter;
    const close = Math.abs(dx) < 92 && Math.abs((player.y + player.h) - (npc.y + npc.h)) < 48;
    const facing = Math.abs(dx) < 18 || Math.sign(dx) === player.dir;
    return close && facing;
  });
}

addEventListener('keydown', e => {
  audio.unlock();
  if (dialogue && ['Space', 'Enter', 'KeyE'].includes(e.code)) { advanceDialogue(); return; }
  if (e.code === 'KeyB' && !e.repeat && !modal) {
    inventoryOpen = !inventoryOpen;
    keys.delete('KeyB');
    return;
  }
  if (modal && e.code === 'Space') { closeModal(); return; }
  if (e.code === 'KeyR' && !e.repeat) {
    if (player.gameOver || player.won) reset();
    else if (useHealthPotion(player)) spawnHealFx();
    return;
  }
  keys.add(e.code);
});
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('mousedown', e => { audio.unlock(); if (dialogue) { advanceDialogue(); return; } if (modal) { closeModal(); return; } if (e.button === 0) keys.add('MouseLeft'); });
addEventListener('mouseup', e => { if (e.button === 0) keys.delete('MouseLeft'); });

function takeDamage(source = 'hit') {
  if (takePlayerDamage(player, source)) {
    screenShake = .28;
    hurtFlash = .32;
    if (source === 'fall') bubbles = [];
  }
}
function spawnDeathFx(x, y) {
  for (let i = 0; i < 14; i++) particles.push({ x: x + 24, y: y + 18, vx: (Math.random() * 2 - 1) * 150, vy: -100 - Math.random() * 170, life: .45 + Math.random() * .35, size: 3 + Math.random() * 5 });
}
function spawnHealFx() {
  for (let i = 0; i < 12; i++) particles.push({ x: player.x + player.w / 2, y: player.y + player.h / 2, vx: (Math.random() * 2 - 1) * 70, vy: -40 - Math.random() * 100, life: .35 + Math.random() * .25, size: 2 + Math.random() * 4, color: 'rgba(248,113,113,' });
}
function spawnPickupFx(item, color = 'rgba(132,204,22,') {
  for (let i = 0; i < 18; i++) particles.push({ x: item.x + item.w / 2, y: item.y + item.h / 2, vx: (Math.random() * 2 - 1) * 120, vy: -60 - Math.random() * 150, life: .5 + Math.random() * .3, size: 2 + Math.random() * 4, color });
}
function spawnSlimeMucusDrops(e, amount) {
  for (let i = 0; i < amount; i++) {
    materialDrops.push({
      kind: 'slimeMucus',
      amount: 1,
      x: e.x + e.w / 2 - 12 + (i - (amount - 1) / 2) * 18,
      y: e.y + e.h / 2 - 12,
      w: 24,
      h: 24,
      vx: (Math.random() * 2 - 1) * 80,
      vy: -180 - Math.random() * 80,
      taken: false,
      float: Math.random() * 6
    });
  }
}
function defeatEnemy(e) {
  if (e.hp && e.hp > 1) {
    e.hp--;
    screenShake = .18;
    player.stompCount++;
    return;
  }
  e.alive = false;
  e.deadTimer = .45;
  player.stompCount++;
  spawnDeathFx(e.x, e.y);
  if (!e.kind || e.kind === 'slime') spawnSlimeMucusDrops(e, 1);
  if (e.kind === 'boss') spawnSlimeMucusDrops(e, 3);
  if (e.kind === 'boss' || e.kind === 'elderBoss') {
    audio.bossDefeated();
    if (e.kind === 'boss') progress.bossDefeated = true;
    if (e.kind === 'elderBoss') progress.elderBossDefeated = true;
    levelInfo.goalUnlocked = true;
    screenShake = .38;
    if (e.kind === 'boss' && !player.hasDoubleJump) Object.assign(doubleJumpItem, { active: true, x: e.x + e.w / 2 - 17, y: e.y - 34, w: 34, h: 28, taken: false, float: Math.random() * 6 });
  }
}
function popBubble(b) {
  for (let i = 0; i < 7; i++) particles.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, vx: (Math.random() * 2 - 1) * 80, vy: (Math.random() * 2 - 1) * 80, life: .25 + Math.random() * .25, size: 2 + Math.random() * 3 });
}
function spawnStaffProjectile() {
  playerProjectiles.push({
    x: staffCast.dir > 0 ? player.x + player.w + 8 : player.x - 42,
    y: player.y + 12,
    w: 34,
    h: 34,
    vx: staffCast.dir * 500,
    life: 1.35,
    age: 0,
    hitIds: new Set()
  });
}
function fireStaff() {
  staffCooldown = .56;
  staffCast.timer = staffCast.duration;
  staffCast.dir = player.dir;
  staffCast.fired = false;
  audio.staffAttack();
}

function settleDrop(drop, solids) {
  for (const solid of solids) {
    if (!rects(drop, solid)) continue;
    if (drop.vy >= 0) {
      drop.y = solid.y - drop.h;
      drop.vy = 0;
      drop.vx *= .72;
    }
  }
}

function updateMaterialDrops(dt) {
  const solids = [...grounds, ...platforms];
  for (const drop of materialDrops) {
    if (drop.taken) continue;
    drop.vy += 900 * dt;
    drop.vy = Math.min(drop.vy, 520);
    drop.x += drop.vx * dt;
    drop.y += drop.vy * dt;
    settleDrop(drop, solids);
    if (drop.y > H + 80) {
      drop.taken = true;
      continue;
    }
    if (rects(player, drop)) {
      drop.taken = true;
      inventory.slimeMucus += drop.amount;
      spawnPickupFx(drop, 'rgba(56,189,248,');
    }
  }
  materialDrops = materialDrops.filter(drop => !drop.taken);
}

function update(dt) {
  if (player.gameOver || player.won || modal || dialogue || inventoryOpen) return;
  const left = keys.has('ArrowLeft') || keys.has('KeyA');
  const right = keys.has('ArrowRight') || keys.has('KeyD');
  const jumpDown = keys.has('Space') || keys.has('ArrowUp') || keys.has('KeyW');
  const down = keys.has('ArrowDown') || keys.has('KeyS');
  const attackDown = keys.has('KeyJ') || keys.has('MouseLeft');
  const dashDown = keys.has('ShiftLeft') || keys.has('ShiftRight');
  const staffDown = keys.has('KeyK');
  const interactDown = keys.has('KeyE');
  const jumpPressed = jumpDown && !jumpLatch;
  const attackPressed = attackDown && !attackLatch;
  const dashPressed = dashDown && !dashLatch;
  const staffPressed = staffDown && !staffLatch;
  const interactPressed = interactDown && !interactLatch;
  jumpLatch = jumpDown; attackLatch = attackDown; dashLatch = dashDown; staffLatch = staffDown; interactLatch = interactDown;

  if (interactPressed) {
    const npc = nearbyNpc();
    if (npc?.dialogue) {
      if (npc.kind === 'oldVillageChief' && !quest.staffRewarded && quest.oldVillageChiefIntroDone && inventory.slimeMucus >= 10) {
        startDialogue(staffRewardDialogue, unlockStaffReward);
      } else if (npc.kind === 'oldVillageChief' && !quest.oldVillageChiefIntroDone) {
        startDialogue(npc.dialogue, () => { quest.oldVillageChiefIntroDone = true; });
      } else {
        startDialogue(npc.dialogue);
      }
      return;
    }
  }

  screenShake = Math.max(0, screenShake - dt);
  hurtFlash = Math.max(0, hurtFlash - dt);
  staffCooldown = Math.max(0, staffCooldown - dt);
  if (staffCast.timer > 0) {
    const elapsed = staffCast.duration - staffCast.timer;
    staffCast.timer = Math.max(0, staffCast.timer - dt);
    if (!staffCast.fired && elapsed >= staffCast.releaseAt) {
      staffCast.fired = true;
      spawnStaffProjectile();
    }
  }
  updateAttack(attack, dt);
  if (attackPressed && !player.crouching && attack.cooldown <= 0 && staffCast.timer <= 0) { startAttack(attack, player); audio.playerAttack(); }
  if (staffPressed && player.hasStaff && !player.crouching && staffCooldown <= 0 && attack.timer <= 0) fireStaff();

  updatePlayer(player, { dashPressed, down, jumpPressed, left, right }, dt, { grounds, platforms, spikes, world });
  if (levelInfo.index === 0 && !introDialogueShown) {
    introMoveDistance += Math.abs(player.x - lastPlayerX);
    lastPlayerX = player.x;
    if (introMoveDistance >= 96) {
      introDialogueShown = true;
      startDialogue(introDialogue);
      return;
    }
  } else {
    lastPlayerX = player.x;
  }
  if (player.y > H + 80) { takeDamage('fall'); return; }
  if (spikes.some(s => rects(footRect(player), s))) { takeDamage(); return; }
  const riverUnderfoot = rivers.find(r => rects(footRect(player), r));
  if (riverUnderfoot?.hiddenLevel !== undefined) { enterLevel(riverUnderfoot.hiddenLevel); return; }
  if (riverUnderfoot) { takeDamage('fall'); return; }

  for (const [coinIndex, c] of coins.entries()) if (!c.taken && rects(player, c)) { c.taken = true; markCoinCollected(levelInfo.index, coinIndex); player.coins++; }
  for (const potion of healthPotions) if (!potion.taken && rects(player, potion) && addHealthPotion(player)) { potion.taken = true; spawnPickupFx(potion, 'rgba(248,113,113,'); }
  updateMaterialDrops(dt);
  if (doubleJumpItem.active && !doubleJumpItem.taken && rects(player, doubleJumpItem)) {
    doubleJumpItem.taken = true;
    player.hasDoubleJump = true;
    refreshJumps(player);
    modal = { title: '获得能力', message: '你获得了二段跳能力', hint: '按空格或点击确定继续' };
    spawnPickupFx(doubleJumpItem, 'rgba(56,189,248,');
  }
  if (staffItem.active && !staffItem.taken && rects(player, staffItem)) {
    staffItem.taken = true;
    player.hasStaff = true;
    progress.staffUnlocked = true;
    modal = { title: '获得武器', message: '你获得了法杖，可以释放法球', hint: '按空格或点击确定继续' };
    spawnPickupFx(staffItem);
  }

  const hitbox = attackActive(attack) ? attackRect(attack, player) : null;
  const attackHitbox = hitbox ? { ...hitbox, hitIds: attack.hitIds } : null;
  if (!updateEnemies({ bubbles, dt, enemies, hitbox: attackHitbox, onBossMelee: audio.bossMelee, onBossRanged: audio.bossRanged, onElderBossCast: audio.elderBossCast, onDamage: takeDamage, onEnemyDefeated: defeatEnemy, player, spikes })) return;

  for (const shot of playerProjectiles) {
    shot.x += shot.vx * dt;
    shot.life -= dt;
    shot.age += dt;
    for (const e of enemies) {
      if (!e.alive || shot.hitIds.has(e.id) || !rects(shot, e)) continue;
      shot.hitIds.add(e.id);
      shot.life = 0;
      defeatEnemy(e);
      break;
    }
    if (grounds.some(g => rects(shot, g)) || platforms.some(p => rects(shot, p))) shot.life = 0;
  }
  playerProjectiles = playerProjectiles.filter(p => p.life > 0 && p.x > cameraX - 120 && p.x < cameraX + W + 140);

  for (const b of bubbles) {
    b.x += b.vx * dt;
    b.y += b.vy * dt + Math.sin(player.time * 7 + b.float) * 10 * dt;
    b.vy += 42 * dt;
    b.life -= dt;
    if (rects(player, b)) { popBubble(b); b.life = 0; takeDamage(); return; }
    if (grounds.some(g => rects(b, g)) || platforms.some(p => rects(b, p)) || b.x < cameraX - 80 || b.x > cameraX + W + 80) { popBubble(b); b.life = 0; }
  }
  bubbles = bubbles.filter(b => b.life > 0);
  for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 480 * dt; p.life -= dt; }
  particles = particles.filter(p => p.life > 0);

  if (back.w > 0 && rects(player, back)) { const targetIndex = Math.max(0, levelInfo.index - 1); enterLevel(targetIndex, levels[targetIndex].returnStart ?? start); return; }
  if (levelInfo.goalUnlocked && rects(player, goal)) {
    const currentLevel = levels[levelInfo.index];
    if (currentLevel.goalAction === 'win') { player.won = true; return; }
    if (currentLevel.goalAction === 'returnToLevel') {
      const targetIndex = currentLevel.returnLevelIndex ?? 0;
      enterLevel(targetIndex, levels[targetIndex].start ?? start);
      return;
    }
    if (levelInfo.index < levels.length - 1) { enterLevel(levelInfo.index + 1); return; }
    player.won = true;
  }
  cameraX += ((player.x + player.w / 2) - W * .36 - cameraX) * .12;
  cameraX = Math.max(0, Math.min(world.w - W, cameraX));
}

function draw() { renderer.draw({ attack, bubbles, cameraX, dialogue, enemies, hurtFlash, inventory, inventoryOpen, materialDrops, modal, particles, player, playerProjectiles, screenShake, staffCast }); }
function loop(now) { const dt = Math.min((now - last) / 1000, .033); last = now; update(dt); draw(); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
