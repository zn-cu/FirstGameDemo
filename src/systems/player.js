import {
  CROUCH_H,
  DASH_COOLDOWN,
  DASH_DISTANCE,
  DASH_DURATION,
  GRAVITY,
  JUMP_V,
  MAX_HP,
  MAX_POTIONS,
  PLAYER_W,
  STAND_H,
} from '../core/config.js';
import { rects } from '../core/collision.js';

export function createPlayer(start) {
  return {
    x: start.x,
    y: start.y,
    w: PLAYER_W,
    h: STAND_H,
    vx: 0,
    vy: 0,
    dir: 1,
    onGround: false,
    onPlatform: false,
    frame: 0,
    time: 0,
    coins: 0,
    healthPotions: 0,
    won: false,
    crouching: false,
    stompCount: 0,
    hp: MAX_HP,
    invincible: 0,
    dashTimer: 0,
    dashCooldown: 0,
    platformDropTimer: 0,
    hasDoubleJump: false,
    hasStaff: false,
    jumpsLeft: 1,
    gameOver: false,
    respawnX: start.x,
    respawnY: start.y
  };
}

export function resetPlayer(player, spawn, { keepProgress = false, keepAbilities = keepProgress } = {}) {
  Object.assign(player, {
    x: spawn.x,
    y: spawn.y,
    w: PLAYER_W,
    h: STAND_H,
    vx: 0,
    vy: 0,
    dir: 1,
    onGround: false,
    onPlatform: false,
    frame: 0,
    time: keepProgress ? player.time : 0,
    coins: keepProgress ? player.coins : 0,
    healthPotions: keepProgress ? player.healthPotions : 0,
    won: false,
    crouching: false,
    stompCount: keepProgress ? player.stompCount : 0,
    hp: keepProgress ? player.hp : MAX_HP,
    invincible: 0,
    dashTimer: 0,
    dashCooldown: 0,
    platformDropTimer: 0,
    hasDoubleJump: keepAbilities ? player.hasDoubleJump : false,
    hasStaff: keepAbilities ? player.hasStaff : false,
    jumpsLeft: keepAbilities && player.hasDoubleJump ? 2 : 1,
    gameOver: false,
    respawnX: spawn.x,
    respawnY: spawn.y
  });
}

export function footRect(player) {
  return { x: player.x + 3, y: player.y + player.h - 4, w: player.w - 6, h: 5 };
}

export function maxJumps(player) {
  return player.hasDoubleJump ? 2 : 1;
}

export function refreshJumps(player) {
  player.jumpsLeft = maxJumps(player);
}

function canStand(player, grounds) {
  const t = { ...player, y: player.y - (STAND_H - player.h), h: STAND_H };
  return !grounds.some(s => rects(t, s));
}

function setCrouch(player, on, grounds) {
  if (on === player.crouching) return;
  if (!on && !canStand(player, grounds)) return;
  const bottom = player.y + player.h;
  player.crouching = on;
  player.h = on ? CROUCH_H : STAND_H;
  player.y = bottom - player.h;
}

export function updateSafeLanding(player, spikes) {
  if (!player.onGround || spikes.some(s => rects(footRect(player), s))) return;
  player.respawnX = player.x;
  player.respawnY = player.y + player.h - STAND_H;
}

export function takePlayerDamage(player, source = 'hit') {
  if (player.invincible > 0 || player.gameOver || player.won) return false;
  player.hp--;
  if (player.hp <= 0) {
    player.gameOver = true;
    player.vx = 0;
    player.vy = 0;
    return true;
  }

  const common = { invincible: 1.25, jumpsLeft: maxJumps(player) };
  if (source === 'fall') {
    Object.assign(player, {
      x: player.respawnX,
      y: player.respawnY,
      w: PLAYER_W,
      h: STAND_H,
      vx: 0,
      vy: 0,
      crouching: false,
      onGround: false,
      onPlatform: false,
      ...common
    });
  } else {
    Object.assign(player, common);
  }
  return true;
}

export function addHealthPotion(player) {
  if (player.healthPotions >= MAX_POTIONS) return false;
  player.healthPotions++;
  return true;
}

export function useHealthPotion(player) {
  if (player.healthPotions <= 0 || player.hp >= MAX_HP || player.gameOver || player.won) return false;
  player.healthPotions--;
  player.hp = Math.min(MAX_HP, player.hp + 1);
  return true;
}

function moveX(player, dx, grounds) {
  player.x += dx;
  for (const s of grounds) {
    if (!rects(player, s)) continue;
    if (dx > 0) player.x = s.x - player.w;
    if (dx < 0) player.x = s.x + s.w;
    player.vx = 0;
  }
}

function moveY(player, dy, ignorePlatforms, grounds, platforms) {
  const oldBottom = player.y + player.h;
  player.y += dy;
  player.onGround = false;
  player.onPlatform = false;

  for (const s of grounds) {
    if (!rects(player, s)) continue;
    if (dy > 0) {
      player.y = s.y - player.h;
      player.onGround = true;
    }
    if (dy < 0) player.y = s.y + s.h;
    player.vy = 0;
  }

  if (dy < 0 || ignorePlatforms) return;
  for (const p of platforms) {
    const overlapX = player.x < p.x + p.w && player.x + player.w > p.x;
    const crossed = oldBottom <= p.y + 8 && player.y + player.h >= p.y;
    if (overlapX && crossed) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
      player.onPlatform = true;
    }
  }
}

export function startDash(player) {
  player.dashTimer = DASH_DURATION;
  player.dashCooldown = DASH_COOLDOWN;
  player.vx = player.dir * (DASH_DISTANCE / DASH_DURATION);
}

export function updatePlayer(player, input, dt, level) {
  const { grounds, platforms, spikes, world } = level;
  const { dashPressed, down, jumpPressed, left, right } = input;
  player.invincible = Math.max(0, player.invincible - dt);
  player.dashTimer = Math.max(0, player.dashTimer - dt);
  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  player.platformDropTimer = Math.max(0, player.platformDropTimer - dt);

  const dropThrough = down && jumpPressed && player.onPlatform;
  if (dropThrough) {
    player.platformDropTimer = .18;
    player.vy = Math.max(player.vy, 80);
  }

  setCrouch(player, down && player.onGround && !dropThrough, grounds);
  if (dashPressed && !player.crouching && player.dashCooldown <= 0) startDash(player);

  const accel = player.crouching ? 650 : 1750;
  const friction = player.onGround ? 1400 : 410;
  const max = player.crouching ? 82 : 255;

  if (player.dashTimer > 0) {
    player.vx = player.dir * (DASH_DISTANCE / DASH_DURATION);
  } else if (!player.crouching) {
    if (left) {
      player.vx -= accel * dt;
      player.dir = -1;
    }
    if (right) {
      player.vx += accel * dt;
      player.dir = 1;
    }
  }

  if (player.dashTimer <= 0 && ((!left && !right) || player.crouching)) {
    const s = Math.sign(player.vx);
    player.vx -= s * friction * dt;
    if (Math.sign(player.vx) !== s) player.vx = 0;
  }

  if (player.onGround) refreshJumps(player);
  if (player.dashTimer <= 0) player.vx = Math.max(-max, Math.min(max, player.vx));
  if (jumpPressed && !player.crouching && !dropThrough) {
    if (player.onGround) {
      player.vy = JUMP_V;
      player.onGround = false;
      player.onPlatform = false;
      player.jumpsLeft = maxJumps(player) - 1;
    } else if (player.hasDoubleJump && player.jumpsLeft > 0) {
      player.vy = JUMP_V;
      player.jumpsLeft--;
    }
  }

  player.vy += GRAVITY * dt;
  player.vy = Math.min(player.vy, 900);
  moveX(player, player.vx * dt, grounds);
  moveY(player, player.vy * dt, player.platformDropTimer > 0, grounds, platforms);

  if (player.onGround) {
    refreshJumps(player);
    updateSafeLanding(player, spikes);
  }
  player.x = Math.max(0, Math.min(world.w - player.w, player.x));
  player.time += dt;
  player.frame = player.crouching ? 0 : (Math.abs(player.vx) > 20 && player.onGround ? Math.floor(player.time * 10) % 6 : 0);

  return { dropThrough };
}
