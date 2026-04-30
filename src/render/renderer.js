import {
  HERO_CROUCH_DRAW_H,
  HERO_DRAW_H,
  HERO_DRAW_W,
  MAX_HP,
  MAX_POTIONS,
  TILE
} from '../core/config.js';
import { attackElapsed } from '../systems/attack.js';

export function createRenderer(ctx, canvas, assets, level) {
  const {
    heroWalk,
    heroIdle,
    heroJump,
    heroSwordAttack,
    heroMagicAttack,
    heroCrouch,
    heroAvatar,
    tiles,
    enemySlime,
    bossSlimeKing,
    bossSlimeKingAttack,
    enemyGoblinWalk,
    enemyGoblinAttack,
    forestBackground,
    underwaterBackground,
    stoneTiles,
    riverStrip,
    healthPotion,
    slimeMucus,
    backpackIcon,
    bossGoblinElder,
    bossGoblinElderSkill,
    magicStaff,
    magicProjectile,
    npcOldVillageChiefIdle
  } = assets;
  const { back, coins, doubleJumpItem, flowers, goal, grounds, healthPotions, levelInfo, npcs, platforms, rivers, spikes, staffItem, tutorials } = level;
  const W = canvas.width;
  const H = canvas.height;

  function sx(i) { return i * 64; }

  function terrainTiles() {
    return levelInfo.theme === 'underwater' ? stoneTiles : tiles;
  }

  function drawSpriteTile(tileIndex, x, y, cameraX, w = TILE, h = TILE, source = terrainTiles()) {
    ctx.drawImage(source, sx(tileIndex), 0, 64, 64, Math.floor(x - cameraX), Math.floor(y), w, h);
  }

  function drawGround(g, cameraX) {
    for (let x = g.x; x < g.x + g.w; x += TILE) {
      const visibleX = x - cameraX;
      if (visibleX < -TILE || visibleX > W + TILE) continue;
      const tw = Math.min(TILE, g.x + g.w - x);
      drawSpriteTile(0, x, g.y, cameraX, tw, TILE);
      for (let y = g.y + TILE; y < g.y + g.h; y += TILE) {
        drawSpriteTile(0, x, y, cameraX, tw, TILE);
      }
    }
  }

  function drawPlatform(p, cameraX) {
    const n = Math.ceil(p.w / TILE);
    for (let i = 0; i < n; i++) {
      const x = p.x + i * TILE;
      const w = Math.min(TILE, p.x + p.w - x);
      drawSpriteTile(i === 0 ? 1 : (i === n - 1 ? 3 : 2), x, p.y - 10, cameraX, w, 48);
    }
  }

  function drawSpike(s, cameraX) {
    for (let x = s.x; x < s.x + s.w; x += 32) {
      ctx.drawImage(terrainTiles(), sx(4), 0, 64, 64, Math.floor(x - cameraX), s.y - 16, 48, 58);
    }
  }

  function drawRiver(r, cameraX) {
    ctx.save();
    const top = Math.floor(r.y);
    const time = performance.now() / 1000;
    const drawX = Math.floor(r.x - cameraX);
    const drawH = Math.max(r.h, TILE);
    ctx.beginPath();
    ctx.rect(drawX, top, r.w, drawH);
    ctx.clip();

    const tileW = 256;
    const baseOffset = -((time * 54) % tileW);
    for (let x = drawX + baseOffset - tileW; x < drawX + r.w + tileW; x += tileW) {
      ctx.drawImage(riverStrip, 0, 0, riverStrip.width, riverStrip.height, Math.floor(x), top, tileW, drawH);
    }

    ctx.globalAlpha = .42;
    const topOffset = -((time * 96) % tileW);
    for (let x = drawX + topOffset - tileW; x < drawX + r.w + tileW; x += tileW) {
      ctx.drawImage(riverStrip, 0, 0, riverStrip.width, 42, Math.floor(x), top, tileW, 34);
    }
    const shimmer = Math.sin(time * 8) * 4;
    ctx.globalAlpha = .32;
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(drawX, top + 8 + shimmer, r.w, 3);
    ctx.restore();
  }

  function drawBackground(cameraX) {
    if (levelInfo.theme === 'forest') {
      const offset = -((cameraX * .18) % W);
      ctx.drawImage(forestBackground, offset, 0, W, H);
      ctx.drawImage(forestBackground, offset + W, 0, W, H);
      if (offset > 0) ctx.drawImage(forestBackground, offset - W, 0, W, H);
      ctx.fillStyle = 'rgba(4,19,20,.18)';
      ctx.fillRect(0, 0, W, H);
      return;
    }

    if (levelInfo.theme === 'underwater') {
      const offset = -((cameraX * .12) % W);
      ctx.drawImage(underwaterBackground, offset, 0, W, H);
      ctx.drawImage(underwaterBackground, offset + W, 0, W, H);
      if (offset > 0) ctx.drawImage(underwaterBackground, offset - W, 0, W, H);
      ctx.fillStyle = 'rgba(2,13,25,.16)';
      ctx.fillRect(0, 0, W, H);
      return;
    }

    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#13243a');
    g.addColorStop(.55, '#0b1b28');
    g.addColorStop(1, '#07111b');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 26; i++) {
      const x = (i * 160 - cameraX * .16) % 1400 - 120;
      ctx.drawImage(tiles, sx(3), 64, 64, 64, x, 115 + (i % 4) * 20, 66, 240);
    }
    for (let i = 0; i < 34; i++) {
      const x = (i * 116 - cameraX * .28) % 1350 - 100;
      ctx.drawImage(tiles, sx(i % 3), 64, 64, 64, x, 116 + (i % 5) * 18, 120, 120);
    }
    for (let i = 0; i < 30; i++) {
      const x = (i * 148 - cameraX * .55) % 1360 - 80;
      ctx.drawImage(tiles, sx(1), 64, 64, 64, x, 330 + (i % 3) * 14, 44, 44);
    }
  }

  function drawDeco(cameraX) {
    for (const [x, y] of flowers) {
      ctx.drawImage(tiles, sx(6), 0, 64, 64, Math.floor(x - cameraX), y, 54, 54);
    }
    ctx.save();
    if (!levelInfo.goalUnlocked) ctx.globalAlpha = .38;
    ctx.drawImage(tiles, sx(7), 0, 64, 64, Math.floor(goal.x - cameraX), goal.y + 25, 68, 68);
    if (!levelInfo.goalUnlocked) {
      ctx.fillStyle = 'rgba(15,23,42,.72)';
      ctx.fillRect(Math.floor(goal.x - cameraX) + 12, goal.y + 51, 44, 23);
      ctx.fillStyle = '#facc15';
      ctx.font = '13px system-ui';
      ctx.fillText('LOCK', Math.floor(goal.x - cameraX) + 17, goal.y + 68);
    }
    ctx.restore();
    if (back.w > 0) {
      ctx.save();
      ctx.globalAlpha = .85;
      ctx.translate(Math.floor(back.x - cameraX) + 68, back.y + 25);
      ctx.scale(-1, 1);
      ctx.drawImage(tiles, sx(7), 0, 64, 64, 0, 0, 68, 68);
      ctx.restore();
    }
  }

  function drawNpcs(cameraX, player) {
    const time = performance.now() / 1000;
    for (const npc of npcs) {
      const x = Math.floor(npc.x - cameraX);
      if (x < -npc.w || x > W + npc.w) continue;
      if (npc.kind !== 'oldVillageChief') continue;
      const frames = npc.frames ?? 4;
      const frame = Math.floor(time * 2.4) % frames;
      const sw = npcOldVillageChiefIdle.width / frames;
      const sh = npcOldVillageChiefIdle.height;
      ctx.drawImage(npcOldVillageChiefIdle, frame * sw, 0, sw, sh, x, npc.y, npc.w, npc.h);

      const playerCenter = player.x + player.w / 2;
      const npcCenter = npc.x + npc.w / 2;
      const dx = npcCenter - playerCenter;
      const close = Math.abs(dx) < 92 && Math.abs((player.y + player.h) - (npc.y + npc.h)) < 48;
      const facing = Math.abs(dx) < 18 || Math.sign(dx) === player.dir;
      if (close && facing && levelInfo.index === 0) {
        ctx.save();
        ctx.font = '14px system-ui';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(15,23,42,.72)';
        ctx.fillRect(x + 2, npc.y - 30, 72, 24);
        ctx.fillStyle = '#f8fafc';
        ctx.fillText('E 对话', x + 14, npc.y - 18);
        ctx.restore();
      }
    }
  }

  function drawShoeIcon(x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(4, 18);
    ctx.lineTo(15, 18);
    ctx.quadraticCurveTo(18, 10, 24, 10);
    ctx.lineTo(29, 18);
    ctx.quadraticCurveTo(36, 19, 38, 25);
    ctx.lineTo(10, 25);
    ctx.quadraticCurveTo(4, 25, 4, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#dbeafe';
    ctx.fillRect(10, 22, 28, 5);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(18, 15);
    ctx.lineTo(23, 15);
    ctx.moveTo(20, 18);
    ctx.lineTo(26, 18);
    ctx.stroke();
    ctx.restore();
  }

  function drawDoubleJumpItem(cameraX) {
    if (!doubleJumpItem.active || doubleJumpItem.taken) return;
    const bob = Math.sin(performance.now() / 220 + doubleJumpItem.float) * 4;
    const x = Math.floor(doubleJumpItem.x - cameraX);
    const y = Math.floor(doubleJumpItem.y + bob);
    ctx.save();
    ctx.globalAlpha = .45;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(x + 19, y + 32, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawShoeIcon(x, y, .9);
  }

  function drawHealthPotions(cameraX) {
    for (const potion of healthPotions) {
      if (potion.taken) continue;
      const bob = Math.sin(performance.now() / 230 + potion.float) * 4;
      ctx.drawImage(healthPotion, Math.floor(potion.x - cameraX), Math.floor(potion.y + bob), potion.w, potion.h);
    }
  }

  function drawMaterialDrops(materialDrops, cameraX) {
    for (const drop of materialDrops) {
      if (drop.taken) continue;
      const bob = Math.sin(performance.now() / 220 + drop.float) * 2;
      const source = drop.kind === 'slimeMucus' ? slimeMucus : slimeMucus;
      ctx.drawImage(source, Math.floor(drop.x - cameraX), Math.floor(drop.y + bob), drop.w, drop.h);
    }
  }

  function drawStaffItem(cameraX) {
    if (!staffItem.active || staffItem.taken) return;
    const bob = Math.sin(performance.now() / 220 + staffItem.float) * 4;
    ctx.drawImage(magicStaff, Math.floor(staffItem.x - cameraX), Math.floor(staffItem.y + bob), staffItem.w, staffItem.h);
  }

  function drawPlayerProjectiles(projectiles) {
    for (const p of projectiles) {
      const pulse = 1 + Math.sin(p.age * 18) * .04;
      const drawW = 46 * pulse;
      const drawH = 46 * pulse;
      const drawX = p.x + p.w / 2 - drawW / 2;
      const drawY = p.y + p.h / 2 - drawH / 2;
      ctx.save();
      ctx.drawImage(magicProjectile, 0, 0, magicProjectile.width, magicProjectile.height, drawX, drawY, drawW, drawH);
      ctx.restore();
    }
  }

  function drawBubble(b) {
    const x = Math.floor(b.x);
    const y = Math.floor(b.y);
    if (b.kind === 'elderShot') {
      const frame = Math.floor(performance.now() / 120) % 3;
      const sw = bossGoblinElderSkill.width / 4;
      const sh = bossGoblinElderSkill.height;
      ctx.save();
      ctx.globalAlpha = Math.min(1, Math.max(.35, b.life / 3));
      if (b.vx < 0) {
        ctx.translate(x + b.w + 8, y - 18);
        ctx.scale(-1, 1);
        ctx.drawImage(bossGoblinElderSkill, frame * sw, 0, sw, sh, 0, 0, 76, 58);
      } else {
        ctx.drawImage(bossGoblinElderSkill, frame * sw, 0, sw, sh, x - 8, y - 18, 76, 58);
      }
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.globalAlpha = Math.min(.85, Math.max(.25, b.life / 2.5));
    const size = b.kind === 'bossShot' ? Math.max(b.w, b.h) : 16;
    const cx = x + b.w / 2;
    const cy = y + b.h / 2;
    const g = ctx.createRadialGradient(cx - size * .18, cy - size * .18, 2, cx, cy, size * .58);
    g.addColorStop(0, '#f8fafc');
    g.addColorStop(.45, '#bae6fd');
    g.addColorStop(1, 'rgba(56,189,248,.18)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, b.w / 2, b.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function drawHero(player, cameraX, attack, staffCast) {
    const center = Math.floor(player.x + player.w / 2 - cameraX);
    const bottom = Math.floor(player.y + player.h);
    let source = heroIdle;
    let sw = 180;
    let sh = 360;
    let sx0 = 0;
    let dw = HERO_DRAW_W;
    let dh = HERO_DRAW_H;

    if (staffCast.timer > 0 && !player.crouching) {
      source = heroMagicAttack;
      sw = heroMagicAttack.width / staffCast.frames;
      sh = heroMagicAttack.height;
      sx0 = Math.min(staffCast.frames - 1, Math.floor((staffCast.duration - staffCast.timer) / staffCast.duration * staffCast.frames)) * sw;
      dw = staffCast.drawW;
      dh = staffCast.drawH;
    } else if (attack.timer > 0 && !player.crouching) {
      source = heroSwordAttack;
      sw = heroSwordAttack.width / attack.frames;
      sx0 = Math.min(attack.frames - 1, Math.floor(attackElapsed(attack) / attack.duration * attack.frames)) * sw;
      dw = attack.drawW;
      dh = attack.drawH;
    } else if (player.crouching) {
      source = heroCrouch;
      sh = 260;
      dw = 42;
      dh = HERO_CROUCH_DRAW_H;
    } else if (!player.onGround) {
      source = heroJump;
      sw = heroJump.width / 4;
      sx0 = (player.vy < -360 ? 0 : player.vy < -80 ? 1 : player.vy < 190 ? 2 : 3) * sw;
    } else if (Math.abs(player.vx) > 20) {
      source = heroWalk;
      sw = heroWalk.width / 6;
      sx0 = player.frame * sw;
    } else {
      sw = heroIdle.width / 6;
      sx0 = Math.floor(player.time * 2.4) % 6 * sw;
    }

    const py = bottom - dh;
    if (player.invincible > 0 && Math.floor(player.time * 18) % 2 === 0) ctx.globalAlpha = .45;
    if (player.dashTimer > 0) ctx.globalAlpha = .35;
    ctx.save();
    const shouldFlip = source === heroJump ? player.dir < 0 : player.dir > 0;
    if (shouldFlip) {
      ctx.translate(center + dw / 2, py);
      ctx.scale(-1, 1);
      ctx.drawImage(source, sx0, 0, sw, sh, 0, 0, dw, dh);
    } else {
      ctx.drawImage(source, sx0, 0, sw, sh, center - dw / 2, py, dw, dh);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawEnemies(enemies, player) {
    for (const e of enemies) {
      if (!e.alive && e.deadTimer <= 0) continue;
      const isBoss = e.kind === 'boss';
      const isElderBoss = e.kind === 'elderBoss';
      const anyBoss = isBoss || isElderBoss;
      const isGoblin = e.kind === 'goblin';
      const bossMelee = isBoss && e.meleeTimer > 0;
      const bossAttacking = anyBoss && (e.attackWarmup > 0 || e.attackReleaseTimer > 0 || bossMelee);
      const goblinAttacking = isGoblin && (e.attackWarmup > 0 || e.attackReleaseTimer > 0);
      let f = anyBoss ? Math.floor(player.time * 6) % 4 : (e.alive ? e.frame : 3);
      if (bossMelee) {
        const t = 1 - e.meleeTimer / e.meleeDuration;
        f = t < .35 ? 1 : (t < .62 ? 2 : 3);
      } else if (bossAttacking) {
        f = isElderBoss ? (e.attackReleaseTimer > 0 ? 3 : 2) : (e.attackReleaseTimer > 0 ? 4 : Math.min(3, Math.floor((1 - e.attackWarmup / .68) * 4)));
      } else if (goblinAttacking) {
        f = e.attackReleaseTimer > 0 ? 2 : 1;
      }
      const flip = isGoblin
        ? (goblinAttacking ? e.attackDir < 0 : e.vx < 0)
        : (bossAttacking ? e.attackDir < 0 : e.vx > 0);
      const sprite = isElderBoss ? bossGoblinElder : (bossAttacking ? bossSlimeKingAttack : (isBoss ? bossSlimeKing : (goblinAttacking ? enemyGoblinAttack : (isGoblin ? enemyGoblinWalk : enemySlime))));
      const sw = isElderBoss ? bossGoblinElder.width / 4 : (bossAttacking ? 128 : (isBoss ? 96 : (goblinAttacking ? enemyGoblinAttack.width / 4 : (isGoblin ? enemyGoblinWalk.width / 4 : 64))));
      const sh = isElderBoss ? bossGoblinElder.height : (isBoss ? 96 : (goblinAttacking ? enemyGoblinAttack.height : (isGoblin ? enemyGoblinWalk.height : 64)));
      const drawW = isElderBoss ? 150 : (bossAttacking ? 128 : (goblinAttacking ? 92 : (isGoblin ? 54 : e.w)));
      const drawY = isElderBoss ? e.y - 26 : (isBoss ? e.y - 18 : (isGoblin ? e.y - 18 : e.y - 16));
      const drawH = isElderBoss ? 118 : (isBoss ? e.h + 24 : (isGoblin ? 68 : e.h + 22));
      const drawX = isElderBoss ? e.x - 34 : (bossAttacking ? e.x - 16 : (goblinAttacking ? e.x - 28 : e.x - (isGoblin ? 8 : 0)));
      if (isBoss && (e.meleeWarmup > 0 || e.meleeTimer > 0)) {
        const warningT = e.meleeWarmup > 0 ? 1 - e.meleeWarmup / .42 : 1;
        const cx = e.meleeTargetX + e.w / 2;
        ctx.save();
        ctx.globalAlpha = .28 + warningT * .32;
        ctx.fillStyle = '#f97316';
        ctx.strokeStyle = '#fed7aa';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(cx, e.baseY + e.h + 3, 58 + Math.sin(player.time * 24) * 5, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      if (e.attackWarmup > 0) {
        const pulse = 1 + Math.sin(player.time * 42) * .08;
        ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
        ctx.scale(pulse, 1 / pulse);
        ctx.translate(-e.x - e.w / 2, -e.y - e.h / 2);
      }
      if (flip) {
        ctx.translate(drawX + drawW, drawY);
        ctx.scale(-1, 1);
        ctx.drawImage(sprite, f * sw, 0, sw, sh, 0, 0, drawW, drawH);
      } else {
        ctx.drawImage(sprite, f * sw, 0, sw, sh, drawX, drawY, drawW, drawH);
      }
      ctx.restore();

      if (anyBoss && e.alive) {
        const hpRatio = Math.max(0, e.hp || 0) / (e.maxHp || 1);
        ctx.fillStyle = 'rgba(15,23,42,.72)';
        ctx.fillRect(e.x + 8, e.y - 18, e.w - 16, 7);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(e.x + 9, e.y - 17, (e.w - 18) * hpRatio, 5);
      }

      if (e.alive && e.attackWarmup > 0 && !isGoblin && !isElderBoss) {
        const t = e.kind === 'boss' ? e.attackWarmup / .68 : e.attackWarmup / .38;
        ctx.fillStyle = `rgba(186,230,253,${.45 + (1 - t) * .45})`;
        ctx.beginPath();
        ctx.arc(e.x + e.w / 2 + e.attackDir * 17, e.y + 8, 5 + (1 - t) * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawHud(player) {
    const x = 18;
    const y = 18;
    const avatarSize = 62;
    const hpRatio = Math.max(0, Math.min(1, player.hp / MAX_HP));
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.38)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
    ctx.drawImage(heroAvatar, x, y, avatarSize, avatarSize);
    ctx.restore();

    const barX = x + avatarSize + 14;
    const barY = y + 13;
    const barW = 184;
    const barH = 12;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.34)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = 'rgba(24,11,18,.72)';
    ctx.fillRect(barX + 2, barY + 2, barW - 4, barH - 4);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(barX + 2, barY + 2, (barW - 4) * hpRatio, barH - 4);
    ctx.strokeStyle = 'rgba(254,202,202,.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barX, barY, barW, barH);
    ctx.restore();
    ctx.fillStyle = '#fff7dc';
    ctx.font = '12px system-ui';
    ctx.fillText(`${player.hp}/${MAX_HP}`, barX + barW + 8, barY + 10);

    const rowY = barY + 28;
    ctx.drawImage(tiles, sx(5), 0, 64, 64, barX, rowY - 5, 24, 24);
    ctx.fillStyle = '#fde68a';
    ctx.font = '14px system-ui';
    ctx.fillText(`${player.coins}`, barX + 30, rowY + 13);
    ctx.drawImage(healthPotion, barX + 100, rowY - 3, 22, 22);
    ctx.fillStyle = '#fecdd3';
    ctx.fillText(`${player.healthPotions}/${MAX_POTIONS}`, barX + 128, rowY + 13);

    const levelText = `关卡 ${levelInfo.index + 1}-${levelInfo.name}`;
    ctx.font = '15px system-ui';
    const levelW = ctx.measureText(levelText).width;
    ctx.fillStyle = 'rgba(10,14,24,.62)';
    ctx.fillRect(W - levelW - 42, 18, levelW + 24, 36);
    ctx.fillStyle = '#d8b4fe';
    ctx.fillText(levelText, W - levelW - 30, 41);

  }

  function drawInventoryPanel(inventory) {
    const panelW = 456;
    const panelH = 354;
    const x = W / 2 - panelW / 2;
    const y = H / 2 - panelH / 2;
    const slot = 58;
    const gap = 10;
    const startX = x + 34;
    const startY = y + 88;
    ctx.save();
    ctx.fillStyle = 'rgba(2,6,23,.58)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(15,23,42,.96)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, panelW, panelH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.drawImage(backpackIcon, x + 28, y + 24, 42, 42);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '24px system-ui';
    ctx.fillText('背包', x + 82, y + 52);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px system-ui';
    ctx.fillText('B 关闭', x + panelW - 78, y + 50);

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 6; col++) {
        const sx0 = startX + col * (slot + gap);
        const sy0 = startY + row * (slot + gap);
        ctx.fillStyle = 'rgba(30,41,59,.82)';
        ctx.strokeStyle = 'rgba(148,163,184,.46)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(sx0, sy0, slot, slot, 6);
        ctx.fill();
        ctx.stroke();
      }
    }

    const count = inventory.slimeMucus ?? 0;
    if (count > 0) {
      ctx.drawImage(slimeMucus, startX + 9, startY + 7, 40, 40);
      ctx.fillStyle = 'rgba(2,6,23,.78)';
      ctx.fillRect(startX + 31, startY + 38, 24, 16);
      ctx.fillStyle = '#e0f2fe';
      ctx.font = '13px system-ui';
      ctx.fillText(`${count}`, startX + 36, startY + 51);
      ctx.fillStyle = '#bae6fd';
      ctx.font = '14px system-ui';
      ctx.fillText('史莱姆粘液', startX, startY + slot + 24);
    }
    ctx.restore();
  }

  function drawBossHud(enemies) {
    const boss = enemies.find(e => (e.kind === 'boss' || e.kind === 'elderBoss') && e.alive);
    if (!boss) return;
    const ratio = Math.max(0, boss.hp || 0) / (boss.maxHp || 1);
    const x = 260;
    const y = 62;
    const w = 440;
    const h = 18;
    ctx.fillStyle = 'rgba(15,23,42,.78)';
    ctx.fillRect(x - 10, y - 8, w + 20, 48);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '16px system-ui';
    ctx.fillText(boss.kind === 'elderBoss' ? '哥布林长老' : '史莱姆国王', x, y + 2);
    ctx.fillStyle = '#3f1d22';
    ctx.fillRect(x, y + 13, w, h);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x, y + 13, w * ratio, h);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y + 13, w, h);
  }

  function drawOverlay(player) {
    if (!player.won && !player.gameOver) return;
    ctx.fillStyle = 'rgba(0,0,0,.58)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.font = '42px system-ui';
    ctx.fillText(player.won ? '通关成功！按 R 重开' : '游戏结束！按 R 重开', 300, 260);
  }

  function drawModal(modal) {
    if (!modal) return;
    ctx.save();
    ctx.fillStyle = 'rgba(2,6,23,.58)';
    ctx.fillRect(0, 0, W, H);
    const x = W / 2 - 180;
    const y = H / 2 - 92;
    ctx.fillStyle = 'rgba(15,23,42,.96)';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, 360, 184, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '24px system-ui';
    ctx.fillText(modal.title, x + 32, y + 48);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '17px system-ui';
    ctx.fillText(modal.message, x + 32, y + 84);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px system-ui';
    ctx.fillText(modal.hint, x + 32, y + 116);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + 238, y + 130, 82, 34);
    ctx.fillStyle = '#111827';
    ctx.font = '16px system-ui';
    ctx.fillText('确定', x + 263, y + 152);
    ctx.restore();
  }

  function wrapText(text, maxWidth) {
    const lines = [];
    let line = '';
    for (const ch of Array.from(text)) {
      const next = line + ch;
      if (ctx.measureText(next).width > maxWidth && line) {
        lines.push(line);
        line = ch;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawDialogue(dialogue) {
    if (!dialogue) return;
    const line = dialogue.lines[dialogue.index];
    const x = 82;
    const y = H - 162;
    const w = W - 164;
    const h = 126;
    ctx.save();
    ctx.fillStyle = 'rgba(2,6,23,.76)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(15,23,42,.95)';
    ctx.strokeStyle = line.speaker === '老村长' ? '#38bdf8' : '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = line.speaker === '老村长' ? '#7dd3fc' : '#fde68a';
    ctx.font = '18px system-ui';
    ctx.fillText(line.speaker, x + 24, y + 32);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '18px system-ui';
    const lines = wrapText(line.text, w - 48);
    for (let i = 0; i < Math.min(lines.length, 3); i++) {
      ctx.fillText(lines[i], x + 24, y + 64 + i * 25);
    }
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px system-ui';
    ctx.fillText('E / 空格 / 回车 继续', x + w - 152, y + h - 18);
    ctx.restore();
  }

  return {
    draw(state) {
      const { attack, bubbles, cameraX, dialogue, enemies, hurtFlash, inventory, inventoryOpen, materialDrops, modal, particles, player, playerProjectiles, screenShake, staffCast } = state;
      const shake = screenShake > 0 ? screenShake / .28 : 0;
      ctx.setTransform(1, 0, 0, 1, (Math.random() * 2 - 1) * 8 * shake, (Math.random() * 2 - 1) * 5 * shake);
      drawBackground(cameraX);
      for (const r of rivers) drawRiver(r, cameraX);
      for (const g of grounds) drawGround(g, cameraX);
      for (const p of platforms) drawPlatform(p, cameraX);
      for (const s of spikes) drawSpike(s, cameraX);
      drawDeco(cameraX);
      drawNpcs(cameraX, player);
      drawDoubleJumpItem(cameraX);
      drawHealthPotions(cameraX);
      drawMaterialDrops(materialDrops, cameraX);
      drawStaffItem(cameraX);

      ctx.save();
      ctx.translate(-cameraX, 0);
      for (const c of coins) {
        if (!c.taken) {
          const bob = Math.sin(performance.now() / 220 + c.float) * 4;
          ctx.drawImage(tiles, sx(5), 0, 64, 64, c.x, c.y + bob, 28, 28);
        }
      }
      drawEnemies(enemies, player);
      drawPlayerProjectiles(playerProjectiles);
      for (const b of bubbles) drawBubble(b);
      for (const p of particles) {
        ctx.fillStyle = `${p.color ?? 'rgba(34,211,238,'}${Math.max(0, p.life / .7)})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.restore();

      drawHero(player, cameraX, attack, staffCast);
      if (hurtFlash > 0) {
        ctx.fillStyle = `rgba(239,68,68,${hurtFlash / .32 * .22})`;
        ctx.fillRect(0, 0, W, H);
      }
      drawHud(player);
      drawBossHud(enemies);
      drawOverlay(player);
      drawModal(modal);
      drawDialogue(dialogue);
      if (inventoryOpen) drawInventoryPanel(inventory);
    }
  };
}
