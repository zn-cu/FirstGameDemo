import {
  HERO_CROUCH_DRAW_H,
  HERO_DRAW_H,
  HERO_DRAW_W,
  MAX_HP,
  TILE
} from '../core/config.js';
import { drawAttack as drawAttackEffect } from '../systems/attack.js';

export function createRenderer(ctx, canvas, assets, level) {
  const { heroWalk, heroIdle, heroCrouch, tiles, enemySlime, bossSlimeKing, bossSlimeKingAttack, attackSlash } = assets;
  const { back, coins, doubleJumpItem, flowers, goal, grounds, levelInfo, platforms, spikes, tutorials } = level;
  const W = canvas.width;
  const H = canvas.height;

  function sx(i) { return i * 64; }

  function drawSpriteTile(tileIndex, x, y, cameraX, w = TILE, h = TILE) {
    ctx.drawImage(tiles, sx(tileIndex), 0, 64, 64, Math.floor(x - cameraX), Math.floor(y), w, h);
  }

  function drawGround(g, cameraX) {
    const startX = Math.floor(g.x / TILE) * TILE;
    for (let x = startX; x < g.x + g.w; x += TILE) {
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
      ctx.drawImage(tiles, sx(4), 0, 64, 64, Math.floor(x - cameraX), s.y - 16, 48, 58);
    }
  }

  function drawBackground(cameraX) {
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

  function drawTutorials(cameraX) {
    for (const tutorial of tutorials) {
      const x = Math.floor(tutorial.x - cameraX);
      if (x < -160 || x > W + 160) continue;
      const y = tutorial.y;
      ctx.save();
      ctx.font = '14px system-ui';
      ctx.textBaseline = 'middle';
      let cursor = x;
      for (const key of tutorial.keys) {
        const width = Math.max(46, ctx.measureText(key).width + 22);
        ctx.fillStyle = 'rgba(248,250,252,.92)';
        ctx.strokeStyle = 'rgba(15,23,42,.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cursor, y, width, 30, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#0f172a';
        ctx.fillText(key, cursor + 11, y + 15);
        cursor += width + 8;
        if (key !== tutorial.keys[tutorial.keys.length - 1]) {
          ctx.fillStyle = '#e2e8f0';
          ctx.fillText('+', cursor - 2, y + 15);
          cursor += 16;
        }
      }
      ctx.fillStyle = '#f8fafc';
      ctx.font = '13px system-ui';
      ctx.fillText(tutorial.label, x, y + 45);
      ctx.restore();
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

  function drawBubble(b) {
    const x = Math.floor(b.x);
    const y = Math.floor(b.y);
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

  function drawHero(player, cameraX) {
    const center = Math.floor(player.x + player.w / 2 - cameraX);
    const bottom = Math.floor(player.y + player.h);
    let source = heroIdle;
    let sw = 180;
    let sh = 360;
    let sx0 = 0;
    let dw = HERO_DRAW_W;
    let dh = HERO_DRAW_H;

    if (player.crouching) {
      source = heroCrouch;
      sh = 260;
      dw = 42;
      dh = HERO_CROUCH_DRAW_H;
    } else if (!player.onGround) {
      source = heroWalk;
      sx0 = 2 * sw;
    } else if (Math.abs(player.vx) > 20) {
      source = heroWalk;
      sx0 = player.frame * sw;
    }

    const py = bottom - dh;
    if (player.invincible > 0 && Math.floor(player.time * 18) % 2 === 0) ctx.globalAlpha = .45;
    if (player.dashTimer > 0) ctx.globalAlpha = .35;
    ctx.save();
    if (player.dir > 0) {
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
      const bossMelee = isBoss && e.meleeTimer > 0;
      const bossAttacking = isBoss && (e.attackWarmup > 0 || e.attackReleaseTimer > 0 || bossMelee);
      let f = isBoss ? Math.floor(player.time * 6) % 5 : (e.alive ? e.frame : 4);
      if (bossMelee) {
        const t = 1 - e.meleeTimer / e.meleeDuration;
        f = t < .35 ? 1 : (t < .62 ? 2 : 3);
      } else if (bossAttacking) {
        f = e.attackReleaseTimer > 0 ? 4 : Math.min(3, Math.floor((1 - e.attackWarmup / .68) * 4));
      }
      const flip = bossAttacking ? e.attackDir < 0 : e.vx > 0;
      const sprite = bossAttacking ? bossSlimeKingAttack : (isBoss ? bossSlimeKing : enemySlime);
      const sw = bossAttacking ? 128 : (isBoss ? 96 : 64);
      const sh = isBoss ? 96 : 64;
      const drawW = bossAttacking ? 128 : e.w;
      const drawY = isBoss ? e.y - 18 : e.y - 16;
      const drawH = isBoss ? e.h + 24 : e.h + 22;
      const drawX = bossAttacking ? e.x - 16 : e.x;
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

      if (isBoss && e.alive) {
        const hpRatio = Math.max(0, e.hp || 0) / (e.maxHp || 1);
        ctx.fillStyle = 'rgba(15,23,42,.72)';
        ctx.fillRect(e.x + 8, e.y - 18, e.w - 16, 7);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(e.x + 9, e.y - 17, (e.w - 18) * hpRatio, 5);
      }

      if (e.alive && e.attackWarmup > 0) {
        const t = e.kind === 'boss' ? e.attackWarmup / .68 : e.attackWarmup / .38;
        ctx.fillStyle = `rgba(186,230,253,${.45 + (1 - t) * .45})`;
        ctx.beginPath();
        ctx.arc(e.x + e.w / 2 + e.attackDir * 17, e.y + 8, 5 + (1 - t) * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawHud(player) {
    ctx.fillStyle = 'rgba(10,14,24,.62)';
    ctx.fillRect(18, 18, 220, 36);
    ctx.fillStyle = '#fff7dc';
    ctx.font = '15px system-ui';
    ctx.fillText(`生命 ${'❤'.repeat(Math.max(0, player.hp))}${'♡'.repeat(Math.max(0, MAX_HP - player.hp))}`, 30, 41);
    ctx.fillStyle = '#fde68a';
    ctx.fillText(`金币 ${player.coins}/${coins.length}`, 128, 41);

    const levelText = `关卡 ${levelInfo.index + 1}-${levelInfo.name}`;
    ctx.font = '15px system-ui';
    const levelW = ctx.measureText(levelText).width;
    ctx.fillStyle = 'rgba(10,14,24,.62)';
    ctx.fillRect(W - levelW - 42, 18, levelW + 24, 36);
    ctx.fillStyle = '#d8b4fe';
    ctx.fillText(levelText, W - levelW - 30, 41);

  }

  function drawBossHud(enemies) {
    const boss = enemies.find(e => e.kind === 'boss' && e.alive);
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
    ctx.fillText('史莱姆国王', x, y + 2);
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

  return {
    draw(state) {
      const { attack, bubbles, cameraX, enemies, hurtFlash, modal, particles, player, screenShake } = state;
      const shake = screenShake > 0 ? screenShake / .28 : 0;
      ctx.setTransform(1, 0, 0, 1, (Math.random() * 2 - 1) * 8 * shake, (Math.random() * 2 - 1) * 5 * shake);
      drawBackground(cameraX);
      for (const g of grounds) drawGround(g, cameraX);
      for (const p of platforms) drawPlatform(p, cameraX);
      for (const s of spikes) drawSpike(s, cameraX);
      drawDeco(cameraX);
      drawTutorials(cameraX);
      drawDoubleJumpItem(cameraX);

      ctx.save();
      ctx.translate(-cameraX, 0);
      for (const c of coins) {
        if (!c.taken) {
          const bob = Math.sin(performance.now() / 220 + c.float) * 4;
          ctx.drawImage(tiles, sx(5), 0, 64, 64, c.x, c.y + bob, 28, 28);
        }
      }
      drawEnemies(enemies, player);
      for (const b of bubbles) drawBubble(b);
      for (const p of particles) {
        ctx.fillStyle = `rgba(34,211,238,${Math.max(0, p.life / .7)})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.restore();

      drawAttackEffect(ctx, attack, player, cameraX, attackSlash);
      drawHero(player, cameraX);
      if (hurtFlash > 0) {
        ctx.fillStyle = `rgba(239,68,68,${hurtFlash / .32 * .22})`;
        ctx.fillRect(0, 0, W, H);
      }
      drawHud(player);
      drawBossHud(enemies);
      drawOverlay(player);
      drawModal(modal);
    }
  };
}
