import { createAudio } from './core/audio.js';
import { loadAssets } from './core/assets.js';
import { rects } from './core/collision.js';
import { back, coins, doubleJumpItem, enemyStart, flowers, goal, grounds, levelInfo, levels, loadLevel, platforms, spikes, start, tutorials, world } from './data/levels.js';
import { createRenderer } from './render/renderer.js';
import { attackActive, attackRect, createAttack, resetAttack, startAttack, updateAttack } from './systems/attack.js';
import { createEnemies, updateEnemies } from './systems/enemies.js';
import { createPlayer, footRect, refreshJumps, resetPlayer, takePlayerDamage, updatePlayer } from './systems/player.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const W = canvas.width, H = canvas.height;
const keys = new Set();
const audio = createAudio();
loadLevel(0);
const assets = await loadAssets();
const renderer = createRenderer(ctx, canvas, assets, { back, coins, doubleJumpItem, flowers, goal, grounds, levelInfo, platforms, spikes, tutorials });

// 所有空中台阶都经过跳跃距离校验：垂直高度差 <= 96px，水平间距 <= 260px
let enemies = [], bubbles = [], particles = [], cameraX = 0, screenShake = 0, hurtFlash = 0, modal = null, last = performance.now(), jumpLatch = false, attackLatch = false, dashLatch = false;
const attack = createAttack();
const player = createPlayer(start);
function makeEnemies(){ enemies = createEnemies(enemyStart); }
function reset(){ loadLevel(levelInfo.index); resetPlayer(player,start); resetAttack(attack); makeEnemies(); bubbles=[]; particles=[]; cameraX=0; screenShake=0; hurtFlash=0; modal=null; attackLatch=false; dashLatch=false; }
makeEnemies();
audio.setMusic(levelInfo.index === 1 ? 'boss' : 'scene');
function enterLevel(index, spawn=start){ loadLevel(index); audio.setMusic(index === 1 ? 'boss' : 'scene'); resetPlayer(player,spawn,{keepProgress:true}); resetAttack(attack); makeEnemies(); bubbles=[]; particles=[]; cameraX=Math.max(0,Math.min(world.w-W,spawn.x-W*.36)); screenShake=0; hurtFlash=0; modal=null; attackLatch=false; dashLatch=false; }
document.querySelector('#restartBtn').onclick = reset;
function closeModal(){ modal=null; jumpLatch=true; keys.delete('Space'); }
addEventListener('keydown', e => { audio.unlock(); if(modal && e.code === 'Space'){ closeModal(); return; } keys.add(e.code); if(e.code === 'KeyR') reset(); });
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('mousedown', e => { audio.unlock(); if(modal){ closeModal(); return; } if(e.button === 0) keys.add('MouseLeft'); });
addEventListener('mouseup', e => { if(e.button === 0) keys.delete('MouseLeft'); });
function takeDamage(source='hit'){ if(takePlayerDamage(player,source)){ screenShake=.28; hurtFlash=.32; if(source==='fall') bubbles=[]; } }
function spawnDeathFx(x,y){ for(let i=0;i<14;i++) particles.push({x:x+24,y:y+18,vx:(Math.random()*2-1)*150,vy:-100-Math.random()*170,life:.45+Math.random()*.35,size:3+Math.random()*5}); }
function defeatEnemy(e){ if(e.hp && e.hp>1){ e.hp--; screenShake=.18; player.stompCount++; return; } e.alive=false; e.deadTimer=.45; player.stompCount++; spawnDeathFx(e.x,e.y); if(e.kind==='boss'){ audio.bossDefeated(); levelInfo.goalUnlocked=true; screenShake=.38; Object.assign(doubleJumpItem,{active:true,x:e.x+e.w/2-17,y:e.y-34,w:34,h:28,taken:false,float:Math.random()*6}); } }
function popBubble(b){ for(let i=0;i<7;i++) particles.push({x:b.x+b.w/2,y:b.y+b.h/2,vx:(Math.random()*2-1)*80,vy:(Math.random()*2-1)*80,life:.25+Math.random()*.25,size:2+Math.random()*3}); }
function update(dt){ if(player.gameOver || player.won || modal) return; const left=keys.has('ArrowLeft')||keys.has('KeyA'), right=keys.has('ArrowRight')||keys.has('KeyD'), jumpDown=keys.has('Space')||keys.has('ArrowUp')||keys.has('KeyW'), down=keys.has('ArrowDown')||keys.has('KeyS'), attackDown=keys.has('KeyJ')||keys.has('MouseLeft'), dashDown=keys.has('ShiftLeft')||keys.has('ShiftRight')||keys.has('KeyK'); const jumpPressed=jumpDown&&!jumpLatch, attackPressed=attackDown&&!attackLatch, dashPressed=dashDown&&!dashLatch; jumpLatch=jumpDown; attackLatch=attackDown; dashLatch=dashDown;
  screenShake=Math.max(0,screenShake-dt); hurtFlash=Math.max(0,hurtFlash-dt); updateAttack(attack, dt); if(attackPressed && !player.crouching && attack.cooldown<=0){ startAttack(attack, player); audio.playerAttack(); }
  updatePlayer(player,{dashPressed,down,jumpPressed,left,right},dt,{grounds,platforms,spikes,world});
  if(player.y>H+80){ takeDamage('fall'); return; }
  if(spikes.some(s=>rects(footRect(player),s))){ takeDamage(); return; }
  for(const c of coins) if(!c.taken && rects(player,c)){ c.taken=true; player.coins++; }
  if(doubleJumpItem.active && !doubleJumpItem.taken && rects(player,doubleJumpItem)){ doubleJumpItem.taken=true; player.hasDoubleJump=true; refreshJumps(player); modal={title:'获得能力',message:'你获得了二段跳能力',hint:'按空格或点击确定继续'}; for(let i=0;i<18;i++) particles.push({x:doubleJumpItem.x+doubleJumpItem.w/2,y:doubleJumpItem.y+doubleJumpItem.h/2,vx:(Math.random()*2-1)*120,vy:-60-Math.random()*150,life:.5+Math.random()*.3,size:2+Math.random()*4}); }
  const hitbox = attackActive(attack) ? attackRect(attack, player) : null;
  const attackHitbox = hitbox ? { ...hitbox, hitIds: attack.hitIds } : null;
  if(!updateEnemies({ bubbles, dt, enemies, hitbox: attackHitbox, onBossMelee: audio.bossMelee, onBossRanged: audio.bossRanged, onDamage: takeDamage, onEnemyDefeated: defeatEnemy, player, spikes })) return;
  for(const b of bubbles){ b.x+=b.vx*dt; b.y+=b.vy*dt+Math.sin(player.time*7+b.float)*10*dt; b.vy+=42*dt; b.life-=dt; if(rects(player,b)){ popBubble(b); b.life=0; takeDamage(); return; } if(grounds.some(g=>rects(b,g)) || platforms.some(p=>rects(b,p)) || b.x<cameraX-80 || b.x>cameraX+W+80) { popBubble(b); b.life=0; } }
  bubbles=bubbles.filter(b=>b.life>0);
  for(const p of particles){ p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=480*dt; p.life-=dt; } particles=particles.filter(p=>p.life>0); if(back.w>0 && rects(player,back)){ const targetIndex=Math.max(0,levelInfo.index-1); enterLevel(targetIndex, levels[targetIndex].returnStart ?? start); return; } if(levelInfo.goalUnlocked && rects(player,goal)){ if(levelInfo.index < levels.length-1){ enterLevel(levelInfo.index+1); return; } player.won=true; }
  cameraX += ((player.x+player.w/2) - W*.36 - cameraX)*.12; cameraX = Math.max(0, Math.min(world.w-W, cameraX));
}
function draw(){ renderer.draw({ attack, bubbles, cameraX, enemies, hurtFlash, modal, particles, player, screenShake }); }
function loop(now){ const dt=Math.min((now-last)/1000,.033); last=now; update(dt); draw(); requestAnimationFrame(loop); } requestAnimationFrame(loop);
