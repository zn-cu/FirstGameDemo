export function createAttack() {
  return {
    duration: .24,
    activeFrom: .05,
    activeTo: .18,
    cooldownTime: .34,
    w: 58,
    h: 42,
    drawW: 88,
    drawH: 58,
    frames: 4,
    timer: 0,
    cooldown: 0,
    dir: 1,
    hitIds: new Set()
  };
}

export function resetAttack(attack) {
  Object.assign(attack, { timer: 0, cooldown: 0, dir: 1 });
  attack.hitIds.clear();
}

export function attackElapsed(attack) {
  return attack.duration - attack.timer;
}

export function attackRect(attack, player) {
  const x = attack.dir > 0 ? player.x + player.w - 2 : player.x - attack.w + 2;
  return { x, y: player.y + 8, w: attack.w, h: attack.h };
}

export function attackActive(attack) {
  const elapsed = attackElapsed(attack);
  return attack.timer > 0 && elapsed >= attack.activeFrom && elapsed <= attack.activeTo;
}

export function updateAttack(attack, dt) {
  attack.timer = Math.max(0, attack.timer - dt);
  attack.cooldown = Math.max(0, attack.cooldown - dt);
}

export function startAttack(attack, player) {
  attack.timer = attack.duration;
  attack.cooldown = attack.cooldownTime;
  attack.dir = player.dir;
  attack.hitIds.clear();
}

export function drawAttack(ctx, attack, player, cameraX, attackSlash) {
  if (attack.timer <= 0) return;

  const elapsed = attackElapsed(attack);
  const t = Math.min(1, elapsed / attack.duration);
  const frame = Math.min(attack.frames - 1, Math.floor(t * attack.frames));
  const sw = attackSlash.width / attack.frames;
  const sh = attackSlash.height;
  const centerX = Math.floor(player.x + player.w / 2 - cameraX + attack.dir * 34);
  const centerY = Math.floor(player.y + player.h / 2 + 2);

  ctx.save();
  ctx.globalAlpha = 1 - t * .35;
  ctx.translate(centerX, centerY);
  if (attack.dir < 0) ctx.scale(-1, 1);
  ctx.drawImage(attackSlash, frame*sw, 0, sw, sh, -attack.drawW/2, -attack.drawH/2, attack.drawW, attack.drawH);
  ctx.restore();
}
