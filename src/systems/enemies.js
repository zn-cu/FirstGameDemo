import { rects } from '../core/collision.js';
import { enemyStatKey, getEnemyStats } from '../data/stats.js';

export function createEnemies(enemyStart) {
  return enemyStart.map((e, index) => ({
    ...e,
    id: `${e.kind || 'enemy'}-${index}`,
    statKey: enemyStatKey(e),
    hp: e.hp ?? getEnemyStats(e).maxHp,
    maxHp: e.maxHp ?? e.hp ?? getEnemyStats(e).maxHp,
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

function pushEnemyOutOfSpike(e, spikes) {
  const spike = spikes.find(s => rects(e, s));
  if (!spike) return false;
  const enemyCenter = e.x + e.w / 2;
  const spikeCenter = spike.x + spike.w / 2;
  if (enemyCenter < spikeCenter) {
    e.x = spike.x - e.w - 2;
    e.vx = -Math.abs(e.vx || 40);
  } else {
    e.x = spike.x + spike.w + 2;
    e.vx = Math.abs(e.vx || 40);
  }
  return true;
}

function spawnBubble(bubbles, e, dir = Math.sign(e.vx) || 1) {
  bubbles.push({
    ownerKind: e.kind || 'slime',
    damageType: 'magic',
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

function spawnBookPage(bubbles, e, dir = Math.sign(e.vx) || 1) {
  bubbles.push({
    kind: 'bookPage',
    ownerKind: 'bookMonster',
    damageType: 'magic',
    x: e.x + e.w / 2 - 10 + dir * 20,
    y: e.y + 10,
    w: 24,
    h: 18,
    vx: dir * 285,
    vy: -22,
    life: 2.2,
    spin: 0,
    float: Math.random() * Math.PI * 2
  });
}

function spawnEliteChain(bubbles, e, dir = Math.sign(e.vx) || 1) {
  bubbles.push({
    kind: 'eliteChain',
    ownerKind: 'eliteBook',
    damageType: 'physical',
    x: e.x + e.w / 2 + dir * 10,
    y: e.y + 20,
    w: 78,
    h: 18,
    vx: dir * 360,
    vy: 0,
    dir,
    life: .72,
    age: 0,
    float: Math.random() * Math.PI * 2
  });
}

function spawnYukinoBag(bubbles, e, player) {
  const dir = player.x + player.w / 2 < e.x + e.w / 2 ? -1 : 1;
  e.attackDir = dir;
  bubbles.push({
    kind: 'yukinoBag',
    ownerKind: 'yukino',
    damageType: 'physical',
    x: e.x + e.w / 2 + dir * 26 - 15,
    y: e.y + 42,
    w: 46,
    h: 30,
    vx: dir * 320,
    vy: 0,
    gravity: 0,
    life: 2.8,
    age: 0,
    float: Math.random() * Math.PI * 2
  });
}

function spawnBossShot(bubbles, e, player) {
  const dir = player.x + player.w / 2 < e.x + e.w / 2 ? -1 : 1;
  e.attackDir = dir;
  bubbles.push({
    kind: 'bossShot',
    ownerKind: 'boss',
    damageType: 'magic',
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
    ownerKind: 'elderBoss',
    damageType: 'magic',
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
    const isBookMonster = e.kind === 'bookMonster';
    const isEliteBook = e.kind === 'eliteBook';
    const isYukino = e.kind === 'yukino';
    if (isBoss || isYukino) e.meleeCooldown = Math.max(0, e.meleeCooldown - dt);
    const canMove = (!isBoss || (e.attackWarmup <= 0 && e.attackReleaseTimer <= 0 && e.meleeWarmup <= 0 && e.meleeTimer <= 0))
      && (!isYukino || (e.attackWarmup <= 0 && e.attackReleaseTimer <= 0))
      && (!isGoblin || (e.attackWarmup <= 0 && e.attackReleaseTimer <= 0));
    if (canMove) {
      const previousX = e.x;
      if (pushEnemyOutOfSpike(e, spikes)) continue;
      if (enemyNearSpike(e, spikes)) e.vx *= -1;
      e.x += e.vx * dt;
      if (e.x < e.min || e.x > e.max || spikes.some(s => rects(e, s))) {
        e.x = previousX;
        e.vx *= -1;
      }
    }

    e.frame = Math.floor(player.time * 8) % (isEliteBook ? 8 : 4);
    if (isYukino) {
      const playerCenter = player.x + player.w / 2;
      const yukinoCenter = e.x + e.w / 2;
      if (e.attackWarmup > 0) {
        e.attackWarmup -= dt;
        e.attackDir = playerCenter < yukinoCenter ? -1 : 1;
        if (e.attackWarmup <= 0) {
          spawnYukinoBag(bubbles, e, player);
          e.attackReleaseTimer = .32;
          e.attackTimer = 1.25 + Math.random() * .4;
        }
      } else if (e.attackReleaseTimer > 0) {
        e.attackReleaseTimer -= dt;
      } else {
        e.attackTimer -= dt;
        if (e.attackTimer <= 0) {
          e.attackDir = playerCenter < yukinoCenter ? -1 : 1;
          e.attackWarmup = .56;
        }
      }
    } else if (isBoss) {
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
          onDamage({ attacker: e, type: 'physical' });
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
          onDamage({ attacker: e, type: 'physical' });
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
    } else if (isEliteBook && e.attackWarmup > 0) {
      e.attackWarmup -= dt;
      e.attackDir = player.x + player.w / 2 < e.x + e.w / 2 ? -1 : 1;
      if (e.attackWarmup <= 0) {
        spawnEliteChain(bubbles, e, e.attackDir);
        e.attackTimer = 1.35 + Math.random() * .45;
      }
    } else if (isEliteBook) {
      e.attackTimer -= dt;
      if (e.attackTimer <= 0) {
        e.attackDir = player.x + player.w / 2 < e.x + e.w / 2 ? -1 : 1;
        e.attackWarmup = .58;
      }
    } else if (isBookMonster && e.attackWarmup > 0) {
      e.attackWarmup -= dt;
      if (e.attackWarmup <= 0) {
        spawnBookPage(bubbles, e, e.attackDir);
        e.attackTimer = 1.05 + Math.random() * .55;
      }
    } else if (isBookMonster) {
      e.attackTimer -= dt;
      if (e.attackTimer <= 0) {
        e.attackDir = Math.sign(e.vx) || 1;
        e.attackWarmup = .38;
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
        onEnemyDefeated(e, 'physical');
        player.vy = -430;
      } else {
        onDamage({ attacker: e, type: 'physical' });
        return false;
      }
    }
  }
  return true;
}
