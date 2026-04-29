import { rects } from '../core/collision.js';

export function createEnemies(enemyStart) {
  return enemyStart.map((e, index) => ({
    ...e,
    id: `${e.kind || 'enemy'}-${index}`,
    alive: true,
    deadTimer: 0,
    frame: 0,
    attackTimer: e.attackTimer ?? (.5 + Math.random() * 1.2),
    attackWarmup: 0,
    attackReleaseTimer: 0,
    attackDir: Math.sign(e.vx) || 1,
    baseY: e.y,
    meleeCooldown: .8,
    meleeWarmup: 0,
    meleeTimer: 0,
    meleeDuration: .78,
    meleeStartX: e.x,
    meleeTargetX: e.x,
    meleeHitDone: false
  }));
}

function enemyNearSpike(e, spikes) {
  const dir = Math.sign(e.vx) || 1;
  const probe = { x: dir > 0 ? e.x + e.w : e.x - 18, y: e.y + e.h - 18, w: 18, h: 20 };
  return spikes.some(s => rects(probe, s));
}

function spawnBubble(bubbles, e, dir = Math.sign(e.vx) || 1) {
  bubbles.push({
    x: e.x + e.w / 2 - 8 + dir * 18,
    y: e.y + 4,
    w: 16,
    h: 16,
    vx: dir * (175 + Math.random() * 35),
    vy: -35 - Math.random() * 35,
    life: 2.5,
    float: Math.random() * Math.PI * 2
  });
}

function spawnBossShot(bubbles, e, player) {
  const dir = player.x + player.w / 2 < e.x + e.w / 2 ? -1 : 1;
  e.attackDir = dir;
  bubbles.push({
    kind: 'bossShot',
    x: e.x + e.w / 2 + dir * 34 - 16,
    y: e.y + 28,
    w: 32,
    h: 24,
    vx: dir * 230,
    vy: -18,
    life: 3.2,
    float: Math.random() * Math.PI * 2
  });
}

function spawnElderShot(bubbles, e, player) {
  const dir = player.x + player.w / 2 < e.x + e.w / 2 ? -1 : 1;
  e.attackDir = dir;
  bubbles.push({
    kind: 'elderShot',
    x: e.x + e.w / 2 + dir * 38 - 28,
    y: e.y + 20,
    w: 56,
    h: 38,
    vx: dir * 265,
    vy: -12,
    life: 3.0,
    float: Math.random() * Math.PI * 2
  });
}

export function updateEnemies({
  bubbles,
  dt,
  enemies,
  hitbox,
  onBossMelee,
  onBossRanged,
  onElderBossCast,
  onDamage,
  onEnemyDefeated,
  player,
  spikes
}) {
  for (const e of enemies) {
    if (!e.alive) {
      if (e.deadTimer > 0) e.deadTimer -= dt;
      continue;
    }

    const isSlimeBoss = e.kind === 'boss';
    const isElderBoss = e.kind === 'elderBoss';
    const isBoss = isSlimeBoss || isElderBoss;
    const isGoblin = e.kind === 'goblin';
    if (isBoss) e.meleeCooldown = Math.max(0, e.meleeCooldown - dt);
    const canMove = (!isBoss || (e.attackWarmup <= 0 && e.attackReleaseTimer <= 0 && e.meleeWarmup <= 0 && e.meleeTimer <= 0))
      && (!isGoblin || (e.attackWarmup <= 0 && e.attackReleaseTimer <= 0));
    if (canMove) {
      const previousX = e.x;
      if (enemyNearSpike(e, spikes)) e.vx *= -1;
      e.x += e.vx * dt;
      if (e.x < e.min || e.x > e.max || spikes.some(s => rects(e, s))) {
        e.x = previousX;
        e.vx *= -1;
      }
    }

    e.frame = Math.floor(player.time * 8) % 4;
    if (isBoss) {
      const playerCenter = player.x + player.w / 2;
      const bossCenter = e.x + e.w / 2;
      const closeToPlayer = Math.abs(playerCenter - bossCenter) < 170;

      if (isElderBoss) {
        if (e.attackWarmup > 0) {
          e.attackWarmup -= dt;
          e.attackDir = playerCenter < bossCenter ? -1 : 1;
          if (e.attackWarmup <= 0) {
            spawnElderShot(bubbles, e, player);
            onElderBossCast?.();
            e.attackReleaseTimer = .36;
            e.attackTimer = 1.05 + Math.random() * .35;
          }
        } else if (e.attackReleaseTimer > 0) {
          e.attackReleaseTimer -= dt;
        } else {
          e.attackTimer -= dt;
          if (e.attackTimer <= 0) {
            e.attackDir = playerCenter < bossCenter ? -1 : 1;
            e.attackWarmup = .62;
          }
        }
      } else if (e.meleeWarmup > 0) {
        e.meleeWarmup -= dt;
        e.attackDir = playerCenter < bossCenter ? -1 : 1;
        if (e.meleeWarmup <= 0) {
          onBossMelee?.();
          e.meleeTimer = e.meleeDuration;
          e.meleeStartX = e.x;
          e.meleeHitDone = false;
        }
      } else if (e.meleeTimer > 0) {
        e.meleeTimer -= dt;
        const t = 1 - Math.max(0, e.meleeTimer) / e.meleeDuration;
        const lift = Math.sin(Math.min(1, t) * Math.PI) * 118;
        e.x = e.meleeStartX + (e.meleeTargetX - e.meleeStartX) * Math.min(1, t);
        e.y = e.baseY - lift;
        if (t > .52 && !e.meleeHitDone && rects(player, e)) {
          e.meleeHitDone = true;
          onDamage();
          return false;
        }
        if (e.meleeTimer <= 0) {
          e.y = e.baseY;
          e.attackTimer = 1.1;
          e.meleeCooldown = 1.4;
        }
      } else if (closeToPlayer && e.meleeCooldown <= 0) {
        e.attackDir = playerCenter < bossCenter ? -1 : 1;
        e.meleeWarmup = .42;
        e.meleeTargetX = Math.max(e.min, Math.min(e.max, playerCenter - e.w / 2));
        e.meleeHitDone = false;
      } else if (e.attackWarmup > 0) {
        e.attackWarmup -= dt;
        if (e.attackWarmup <= 0) {
          spawnBossShot(bubbles, e, player);
          onBossRanged?.();
          e.attackReleaseTimer = .25;
          e.attackTimer = 1.8 + Math.random() * .5;
        }
      } else if (e.attackReleaseTimer > 0) {
        e.attackReleaseTimer -= dt;
      } else {
        e.attackTimer -= dt;
        if (e.attackTimer <= 0) {
          e.attackDir = player.x + player.w / 2 < e.x + e.w / 2 ? -1 : 1;
          e.attackWarmup = .68;
        }
      }
    } else if (isGoblin) {
      const playerCenter = player.x + player.w / 2;
      const goblinCenter = e.x + e.w / 2;
      const closeToPlayer = Math.abs(playerCenter - goblinCenter) < 86 && Math.abs((player.y + player.h / 2) - (e.y + e.h / 2)) < 54;

      if (e.attackWarmup > 0) {
        e.attackWarmup -= dt;
        e.attackDir = playerCenter < goblinCenter ? -1 : 1;
        if (e.attackWarmup <= 0) {
          e.attackReleaseTimer = .22;
          e.meleeHitDone = false;
        }
      } else if (e.attackReleaseTimer > 0) {
        e.attackReleaseTimer -= dt;
        const slash = {
          x: e.attackDir > 0 ? e.x + e.w - 2 : e.x - 38,
          y: e.y + 8,
          w: 40,
          h: 34
        };
        if (!e.meleeHitDone && rects(player, slash)) {
          e.meleeHitDone = true;
          onDamage();
          return false;
        }
        if (e.attackReleaseTimer <= 0) e.attackTimer = .9 + Math.random() * .55;
      } else {
        e.attackTimer -= dt;
        if (closeToPlayer && e.attackTimer <= 0) {
          e.attackDir = playerCenter < goblinCenter ? -1 : 1;
          e.attackWarmup = .28;
        }
      }
    } else if (e.attackWarmup > 0) {
      e.attackWarmup -= dt;
      if (e.attackWarmup <= 0) {
        spawnBubble(bubbles, e, e.attackDir);
        e.attackTimer = 1.25 + Math.random() * .75;
      }
    } else {
      e.attackTimer -= dt;
      if (e.attackTimer <= 0) {
        e.attackDir = Math.sign(e.vx) || 1;
        e.attackWarmup = .38;
      }
    }

    if (hitbox && rects(hitbox, e) && !hitbox.hitIds.has(e.id)) {
      hitbox.hitIds.add(e.id);
      onEnemyDefeated(e);
      continue;
    }

    if (rects(player, e) && e.meleeTimer <= 0) {
      const topHit = player.vy > 80 && (player.y + player.h - e.y) < 24;
      if (topHit) {
        onEnemyDefeated(e);
        player.vy = -430;
      } else {
        onDamage();
        return false;
      }
    }
  }
  return true;
}
