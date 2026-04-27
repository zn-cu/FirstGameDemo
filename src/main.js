const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const W = canvas.width, H = canvas.height;
const keys = new Set();
const img = (src) => new Promise(resolve => { const i = new Image(); i.onload = () => resolve(i); i.src = src; });
const [heroWalk, heroIdle, heroCrouch, tiles, enemySlime, attackSlash] = await Promise.all([
  img('/assets/hero_walk.png'), img('/assets/hero_idle.png'), img('/assets/hero_crouch.png'), img('/assets/tiles.png'), img('/assets/enemy_slime.png'), img('/assets/attack_slash.png')
]);

const TILE = 48;
const MAX_HP = 3;
const GRAVITY = 1450;
const JUMP_V = -610; // 最大跳高约 128px；本关平台高度差均 <= 96px
const STAND_H = 56, CROUCH_H = 36;
const PLAYER_W = 24;
const HERO_DRAW_W = 40, HERO_DRAW_H = 78, HERO_CROUCH_DRAW_H = 55;

const world = { w: 3000, h: 540 };
const start = { x: 96, y: 394 - STAND_H };
const goal = { x: 2860, y: 332, w: 44, h: 88 };

// 所有空中台阶都经过跳跃距离校验：垂直高度差 <= 96px，水平间距 <= 260px
const grounds = [
  { x: 0, y: 394, w: 520, h: TILE },
  { x: 670, y: 394, w: 420, h: TILE },
  { x: 1240, y: 394, w: 520, h: TILE },
  { x: 1940, y: 394, w: 400, h: TILE },
  { x: 2520, y: 394, w: 480, h: TILE },
];
const platforms = [
  { x: 260, y: 318, w: 230, h: 30 },
  { x: 560, y: 286, w: 230, h: 30 },
  { x: 880, y: 318, w: 220, h: 30 },
  { x: 1320, y: 314, w: 230, h: 30 },
  { x: 1600, y: 266, w: 220, h: 30 },
  { x: 1880, y: 316, w: 230, h: 30 },
  { x: 2260, y: 304, w: 240, h: 30 },
  { x: 2520, y: 272, w: 220, h: 30 },
];
const spikes = [
  { x: 730, y: 352, w: 116, h: 42 },
  { x: 1248, y: 352, w: 64, h: 42 },
  { x: 2114, y: 352, w: 138, h: 42 },
];
const flowers = [[78,356],[405,354],[725,356],[1030,356],[1360,356],[1690,356],[2070,356],[2570,356],[2920,356]];
const coins = [];
function addCoinLine(x, y, n, gap=42){ for(let i=0;i<n;i++) coins.push({x:x+i*gap, y, w:24, h:24, taken:false, float:Math.random()*6}); }
addCoinLine(315, 276, 3); addCoinLine(620, 244, 3); addCoinLine(941, 276, 3); addCoinLine(1395, 272, 3); addCoinLine(1665, 224, 3); addCoinLine(2318, 262, 3); addCoinLine(2585, 230, 3); addCoinLine(2750, 350, 3);
const doubleJumpItem = { x: 603, y: 238, w: 34, h: 28, taken: false, float: Math.random()*6 };

let enemies = [], bubbles = [], particles = [], cameraX = 0, screenShake = 0, hurtFlash = 0, last = performance.now(), jumpLatch = false, attackLatch = false, dashLatch = false;
const enemyStart = [
  { x: 770, y: 394-38, w: 48, h: 38, vx: -55, min: 700, max: 1020 },
  { x: 1360, y: 394-38, w: 48, h: 38, vx: -65, min: 1260, max: 1700 },
  { x: 2110, y: 394-38, w: 48, h: 38, vx: -60, min: 1980, max: 2290 },
  { x: 2670, y: 394-38, w: 48, h: 38, vx: -75, min: 2550, max: 2920 },
];
const attack = {
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
  dir: 1
};
const DASH_DURATION = .18;
const DASH_COOLDOWN = .72;
const DASH_SPEED = 520;
const player = { x:start.x, y:start.y, w:PLAYER_W, h:STAND_H, vx:0, vy:0, dir:1, onGround:false, onPlatform:false, frame:0, time:0, coins:0, won:false, crouching:false, stompCount:0, hp:MAX_HP, invincible:0, dashTimer:0, dashCooldown:0, hasDoubleJump:false, jumpsLeft:1, gameOver:false, respawnX:start.x, respawnY:start.y };
function makeEnemies(){ enemies = enemyStart.map(e => ({...e, alive:true, deadTimer:0, frame:0, attackTimer:.5+Math.random()*1.2, attackWarmup:0, attackDir:Math.sign(e.vx)||1})); }
function reset(){ Object.assign(player,{x:start.x,y:start.y,w:PLAYER_W,h:STAND_H,vx:0,vy:0,dir:1,onGround:false,onPlatform:false,frame:0,time:0,coins:0,won:false,crouching:false,stompCount:0,hp:MAX_HP,invincible:0,dashTimer:0,dashCooldown:0,hasDoubleJump:false,jumpsLeft:1,gameOver:false,respawnX:start.x,respawnY:start.y}); Object.assign(attack,{timer:0,cooldown:0,dir:1}); coins.forEach(c=>c.taken=false); doubleJumpItem.taken=false; makeEnemies(); bubbles=[]; particles=[]; cameraX=0; screenShake=0; hurtFlash=0; attackLatch=false; dashLatch=false; }
makeEnemies();
document.querySelector('#restartBtn').onclick = reset;
addEventListener('keydown', e => { keys.add(e.code); if(e.code === 'KeyR') reset(); });
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('mousedown', e => { if(e.button === 0) keys.add('MouseLeft'); });
addEventListener('mouseup', e => { if(e.button === 0) keys.delete('MouseLeft'); });
function rects(a,b){ return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
function footRect(){ return {x:player.x+3, y:player.y+player.h-4, w:player.w-6, h:5}; }
function attackElapsed(){ return attack.duration - attack.timer; }
function attackRect(){ const x = attack.dir > 0 ? player.x + player.w - 2 : player.x - attack.w + 2; return {x, y:player.y + 8, w:attack.w, h:attack.h}; }
function attackActive(){ const elapsed = attackElapsed(); return attack.timer > 0 && elapsed >= attack.activeFrom && elapsed <= attack.activeTo; }
function updateAttack(dt){ attack.timer=Math.max(0,attack.timer-dt); attack.cooldown=Math.max(0,attack.cooldown-dt); }
function startAttack(){ attack.timer = attack.duration; attack.cooldown = attack.cooldownTime; attack.dir = player.dir; }
function canStand(){ const t={...player,y:player.y-(STAND_H-player.h),h:STAND_H}; return !grounds.some(s=>rects(t,s)); }
function setCrouch(on){ if(on === player.crouching) return; if(!on && !canStand()) return; const bottom = player.y + player.h; player.crouching = on; player.h = on ? CROUCH_H : STAND_H; player.y = bottom - player.h; }
function takeDamage(){ if(player.invincible>0 || player.gameOver || player.won) return; player.hp--; screenShake=.28; hurtFlash=.32; if(player.hp<=0){ player.gameOver=true; player.vx=player.vy=0; return; } Object.assign(player,{x:player.respawnX,y:player.respawnY,w:PLAYER_W,h:STAND_H,vx:0,vy:0,crouching:false,onGround:false,onPlatform:false,invincible:1.25,jumpsLeft:maxJumps()}); bubbles=[]; }
function maxJumps(){ return player.hasDoubleJump ? 2 : 1; }
function refreshJumps(){ player.jumpsLeft = maxJumps(); }
function moveX(o, dx){ o.x += dx; for(const s of grounds) if(rects(o,s)){ if(dx>0)o.x=s.x-o.w; if(dx<0)o.x=s.x+s.w; o.vx=0; } }
function moveY(o, dy, downHeld=false){ const oldBottom = o.y + o.h; o.y += dy; o.onGround=false; o.onPlatform=false; for(const s of grounds) if(rects(o,s)){ if(dy>0){ o.y=s.y-o.h; o.onGround=true; } if(dy<0) o.y=s.y+s.h; o.vy=0; }
  if(dy>=0 && !downHeld){ for(const p of platforms){ const overlapX = o.x < p.x+p.w && o.x+o.w > p.x; const crossed = oldBottom <= p.y+8 && o.y+o.h >= p.y; if(overlapX && crossed){ o.y=p.y-o.h; o.vy=0; o.onGround=true; o.onPlatform=true; } } }
}
function spawnDeathFx(x,y){ for(let i=0;i<14;i++) particles.push({x:x+24,y:y+18,vx:(Math.random()*2-1)*150,vy:-100-Math.random()*170,life:.45+Math.random()*.35,size:3+Math.random()*5}); }
function spawnBubble(e, dir=Math.sign(e.vx)||1){ bubbles.push({x:e.x+e.w/2-8+dir*18,y:e.y+4,w:16,h:16,vx:dir*(175+Math.random()*35),vy:-35-Math.random()*35,life:2.5,float:Math.random()*Math.PI*2}); }
function popBubble(b){ for(let i=0;i<7;i++) particles.push({x:b.x+b.w/2,y:b.y+b.h/2,vx:(Math.random()*2-1)*80,vy:(Math.random()*2-1)*80,life:.25+Math.random()*.25,size:2+Math.random()*3}); }
function startDash(){ player.dashTimer = DASH_DURATION; player.dashCooldown = DASH_COOLDOWN; player.vx = player.dir * DASH_SPEED; player.vy = Math.min(player.vy, 70); for(let i=0;i<10;i++) particles.push({x:player.x+player.w/2-player.dir*8,y:player.y+player.h-14,vx:-player.dir*(80+Math.random()*120),vy:-30-Math.random()*60,life:.2+Math.random()*.25,size:2+Math.random()*5}); }
function update(dt){ if(player.gameOver || player.won) return; const left=keys.has('ArrowLeft')||keys.has('KeyA'), right=keys.has('ArrowRight')||keys.has('KeyD'), jumpDown=keys.has('Space')||keys.has('ArrowUp')||keys.has('KeyW'), down=keys.has('ArrowDown')||keys.has('KeyS'), attackDown=keys.has('KeyJ')||keys.has('MouseLeft'), dashDown=keys.has('ShiftLeft')||keys.has('ShiftRight')||keys.has('KeyK'); const jumpPressed=jumpDown&&!jumpLatch, attackPressed=attackDown&&!attackLatch, dashPressed=dashDown&&!dashLatch; jumpLatch=jumpDown; attackLatch=attackDown; dashLatch=dashDown;
  screenShake=Math.max(0,screenShake-dt); hurtFlash=Math.max(0,hurtFlash-dt); player.invincible=Math.max(0,player.invincible-dt); updateAttack(dt); player.dashTimer=Math.max(0,player.dashTimer-dt); player.dashCooldown=Math.max(0,player.dashCooldown-dt); setCrouch(down && player.onGround); if(attackPressed && !player.crouching && attack.cooldown<=0) startAttack(); if(dashPressed && !player.crouching && player.dashCooldown<=0) startDash(); const accel=player.crouching?650:1750, friction=player.onGround?1400:410, max=player.crouching?82:255;
  if(player.dashTimer>0){ player.vx = player.dir * DASH_SPEED; }
  else if(!player.crouching){ if(left){player.vx-=accel*dt; player.dir=-1;} if(right){player.vx+=accel*dt; player.dir=1;} }
  if(player.dashTimer<=0 && ((!left&&!right)||player.crouching)){ const s=Math.sign(player.vx); player.vx-=s*friction*dt; if(Math.sign(player.vx)!==s) player.vx=0; }
  if(player.onGround) refreshJumps();
  player.vx=Math.max(-max,Math.min(max,player.vx)); if(jumpPressed && !player.crouching){ if(player.onGround){ player.vy=JUMP_V; player.onGround=false; player.onPlatform=false; player.jumpsLeft=maxJumps()-1; } else if(player.hasDoubleJump && player.jumpsLeft>0){ player.vy=JUMP_V; player.jumpsLeft--; } }
  player.vy+=GRAVITY*dt*(player.dashTimer>0?.35:1); player.vy=Math.min(player.vy,900); moveX(player,player.vx*dt); moveY(player,player.vy*dt,down && player.onPlatform);
  if(player.onGround) refreshJumps();
  player.x=Math.max(0,Math.min(world.w-player.w,player.x));
  if(player.y>H+80){ takeDamage(); return; }
  if(spikes.some(s=>rects(footRect(),s))){ takeDamage(); return; }
  player.time+=dt; player.frame=player.crouching?0:(Math.abs(player.vx)>20&&player.onGround?Math.floor(player.time*10)%6:0);
  for(const c of coins) if(!c.taken && rects(player,c)){ c.taken=true; player.coins++; }
  if(!doubleJumpItem.taken && rects(player,doubleJumpItem)){ doubleJumpItem.taken=true; player.hasDoubleJump=true; refreshJumps(); for(let i=0;i<18;i++) particles.push({x:doubleJumpItem.x+doubleJumpItem.w/2,y:doubleJumpItem.y+doubleJumpItem.h/2,vx:(Math.random()*2-1)*120,vy:-60-Math.random()*150,life:.5+Math.random()*.3,size:2+Math.random()*4}); }
  const hitbox = attackActive() ? attackRect() : null;
  for(const e of enemies){ if(e.alive){ e.x += e.vx*dt; if(e.x<e.min || e.x>e.max) e.vx *= -1; e.frame = Math.floor(player.time*8)%4; if(e.attackWarmup>0){ e.attackWarmup-=dt; if(e.attackWarmup<=0){ spawnBubble(e,e.attackDir); e.attackTimer=1.25+Math.random()*.75; } } else { e.attackTimer-=dt; if(e.attackTimer<=0){ e.attackDir=Math.sign(e.vx)||1; e.attackWarmup=.38; } } if(hitbox && rects(hitbox,e)){ e.alive=false; e.deadTimer=.45; player.stompCount++; spawnDeathFx(e.x,e.y); continue; } if(rects(player,e)){ const topHit = player.vy>80 && (player.y+player.h-e.y)<24; if(topHit){ e.alive=false; e.deadTimer=.45; player.vy=-430; player.stompCount++; spawnDeathFx(e.x,e.y); } else { takeDamage(); return; } } } else if(e.deadTimer>0) e.deadTimer-=dt; }
  for(const b of bubbles){ b.x+=b.vx*dt; b.y+=b.vy*dt+Math.sin(player.time*7+b.float)*10*dt; b.vy+=42*dt; b.life-=dt; if(rects(player,b)){ popBubble(b); b.life=0; takeDamage(); return; } if(grounds.some(g=>rects(b,g)) || platforms.some(p=>rects(b,p)) || b.x<cameraX-80 || b.x>cameraX+W+80) { popBubble(b); b.life=0; } }
  bubbles=bubbles.filter(b=>b.life>0);
  for(const p of particles){ p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=480*dt; p.life-=dt; } particles=particles.filter(p=>p.life>0); if(rects(player,goal)) player.won=true;
  cameraX += ((player.x+player.w/2) - W*.36 - cameraX)*.12; cameraX = Math.max(0, Math.min(world.w-W, cameraX));
}
function sx(i){return i*64;}
function drawSpriteTile(tileIndex, x, y, w=TILE, h=TILE){ ctx.drawImage(tiles, sx(tileIndex), 0, 64, 64, Math.floor(x-cameraX), Math.floor(y), w, h); }
function drawGround(g){ const startX=Math.floor(g.x/TILE)*TILE; for(let x=startX; x<g.x+g.w; x+=TILE){ const visibleX=x-cameraX; if(visibleX<-TILE||visibleX>W+TILE) continue; const tw=Math.min(TILE,g.x+g.w-x); drawSpriteTile(0,x,g.y,tw,TILE); for(let y=g.y+TILE; y<g.y+g.h; y+=TILE){ drawSpriteTile(0,x,y,tw,TILE); } } }
function drawPlatform(p){ const n=Math.ceil(p.w/TILE); for(let i=0;i<n;i++){ const x=p.x+i*TILE; const w=Math.min(TILE,p.x+p.w-x); drawSpriteTile(i===0?1:(i===n-1?3:2),x,p.y-10,w,48); } }
function drawSpike(s){ for(let x=s.x; x<s.x+s.w; x+=32){ ctx.drawImage(tiles, sx(4),0,64,64,Math.floor(x-cameraX),s.y-16,48,58); } }
function drawBackground(){ const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#13243a'); g.addColorStop(.55,'#0b1b28'); g.addColorStop(1,'#07111b'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  for(let i=0;i<26;i++){ const x=(i*160-cameraX*.16)%1400-120; ctx.drawImage(tiles, sx(3),64,64,64,x,115+(i%4)*20,66,240); }
  for(let i=0;i<34;i++){ const x=(i*116-cameraX*.28)%1350-100; ctx.drawImage(tiles, sx(i%3),64,64,64,x,116+(i%5)*18,120,120); }
  for(let i=0;i<30;i++){ const x=(i*148-cameraX*.55)%1360-80; ctx.drawImage(tiles, sx(1),64,64,64,x,330+(i%3)*14,44,44); }
}
function drawDeco(){ for(const [x,y] of flowers) ctx.drawImage(tiles, sx(6),0,64,64,Math.floor(x-cameraX),y,54,54); ctx.drawImage(tiles, sx(7),0,64,64,Math.floor(goal.x-cameraX),goal.y+25,68,68); }
function drawShoeIcon(x,y,scale=1){ ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale); ctx.fillStyle='#f8fafc'; ctx.strokeStyle='#94a3b8'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(4,18); ctx.lineTo(15,18); ctx.quadraticCurveTo(18,10,24,10); ctx.lineTo(29,18); ctx.quadraticCurveTo(36,19,38,25); ctx.lineTo(10,25); ctx.quadraticCurveTo(4,25,4,18); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#dbeafe'; ctx.fillRect(10,22,28,5); ctx.strokeStyle='#64748b'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(18,15); ctx.lineTo(23,15); ctx.moveTo(20,18); ctx.lineTo(26,18); ctx.stroke(); ctx.restore(); }
function drawDoubleJumpItem(){ if(doubleJumpItem.taken) return; const bob=Math.sin(performance.now()/220+doubleJumpItem.float)*4; const x=Math.floor(doubleJumpItem.x-cameraX), y=Math.floor(doubleJumpItem.y+bob); ctx.save(); ctx.globalAlpha=.45; ctx.fillStyle='#38bdf8'; ctx.beginPath(); ctx.ellipse(x+19,y+32,20,5,0,0,Math.PI*2); ctx.fill(); ctx.restore(); drawShoeIcon(x,y,.9); }
function drawBubble(b){ const x=Math.floor(b.x), y=Math.floor(b.y); ctx.save(); ctx.globalAlpha=Math.min(.85,Math.max(.25,b.life/2.5)); const g=ctx.createRadialGradient(x+5,y+5,2,x+8,y+8,11); g.addColorStop(0,'#f8fafc'); g.addColorStop(.45,'#bae6fd'); g.addColorStop(1,'rgba(56,189,248,.18)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x+8,y+8,8,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#e0f2fe'; ctx.lineWidth=2; ctx.stroke(); ctx.restore(); }
function drawAttack(){ if(attack.timer<=0) return; const elapsed=attackElapsed(), t=Math.min(1,elapsed/attack.duration); const frame=Math.min(attack.frames-1,Math.floor(t*attack.frames)); const sw=attackSlash.width/attack.frames, sh=attackSlash.height; const centerX=Math.floor(player.x+player.w/2-cameraX+attack.dir*34), centerY=Math.floor(player.y+player.h/2+2); ctx.save(); ctx.globalAlpha=1-t*.35; ctx.translate(centerX,centerY); if(attack.dir<0) ctx.scale(-1,1); ctx.drawImage(attackSlash,frame*sw,0,sw,sh,-attack.drawW/2,-attack.drawH/2,attack.drawW,attack.drawH); ctx.restore(); }
function drawHero(){ const center=Math.floor(player.x+player.w/2-cameraX); const bottom=Math.floor(player.y+player.h); let source=heroIdle, sw=180, sh=360, sx0=0, dw=HERO_DRAW_W, dh=HERO_DRAW_H; if(player.crouching){ source=heroCrouch; sh=260; dw=42; dh=HERO_CROUCH_DRAW_H; } else if(player.dashTimer>0){ source=heroWalk; sx0=3*sw; dw=64; dh=48; } else if(!player.onGround){ source=heroWalk; sx0=2*sw; } else if(Math.abs(player.vx)>20){ source=heroWalk; sx0=player.frame*sw; } const py=bottom-dh; if(player.invincible>0 && Math.floor(player.time*18)%2===0) ctx.globalAlpha=.45; ctx.save(); if(player.dashTimer>0){ ctx.translate(center, py+dh/2); ctx.rotate(player.dir*.18); if(player.dir>0) ctx.scale(-1,1); ctx.drawImage(source,sx0,0,sw,sh,-dw/2,-dh/2,dw,dh); } else if(player.dir>0){ ctx.translate(center+dw/2, py); ctx.scale(-1,1); ctx.drawImage(source,sx0,0,sw,sh,0,0,dw,dh); } else ctx.drawImage(source,sx0,0,sw,sh,center-dw/2,py,dw,dh); ctx.restore(); ctx.globalAlpha=1; }
function draw(){ const shake=screenShake>0?screenShake/.28:0; ctx.setTransform(1,0,0,1,(Math.random()*2-1)*8*shake,(Math.random()*2-1)*5*shake); drawBackground(); for(const g of grounds) drawGround(g); for(const p of platforms) drawPlatform(p); for(const s of spikes) drawSpike(s); drawDeco(); drawDoubleJumpItem(); ctx.save(); ctx.translate(-cameraX,0); for(const c of coins) if(!c.taken){ const bob=Math.sin(performance.now()/220+c.float)*4; ctx.drawImage(tiles,sx(5),0,64,64,c.x,c.y+bob,28,28); }
  for(const e of enemies){ if(!e.alive && e.deadTimer<=0) continue; const f=e.alive?e.frame:4, flip=e.vx>0; ctx.save(); if(e.attackWarmup>0){ const pulse=1+Math.sin(player.time*42)*.08; ctx.translate(e.x+e.w/2,e.y+e.h/2); ctx.scale(pulse,1/pulse); ctx.translate(-e.x-e.w/2,-e.y-e.h/2); } if(flip){ctx.translate(e.x+e.w,e.y-16);ctx.scale(-1,1);ctx.drawImage(enemySlime,f*64,0,64,64,0,0,e.w,e.h+22);} else ctx.drawImage(enemySlime,f*64,0,64,64,e.x,e.y-16,e.w,e.h+22); ctx.restore(); if(e.alive && e.attackWarmup>0){ const t=e.attackWarmup/.38; ctx.fillStyle=`rgba(186,230,253,${.45+(1-t)*.45})`; ctx.beginPath(); ctx.arc(e.x+e.w/2+e.attackDir*17,e.y+8,5+(1-t)*5,0,Math.PI*2); ctx.fill(); } }
  for(const b of bubbles) drawBubble(b);
  for(const p of particles){ctx.fillStyle=`rgba(34,211,238,${Math.max(0,p.life/.7)})`;ctx.fillRect(p.x,p.y,p.size,p.size);} ctx.restore(); drawAttack(); drawHero(); if(hurtFlash>0){ ctx.fillStyle=`rgba(239,68,68,${hurtFlash/.32*.22})`; ctx.fillRect(0,0,W,H); }
  ctx.fillStyle='rgba(10,14,24,.74)'; ctx.fillRect(18,18,570,48); ctx.fillStyle='#fff7dc'; ctx.font='20px system-ui'; ctx.fillText(`生命 ${'❤'.repeat(Math.max(0,player.hp))}${'♡'.repeat(Math.max(0,MAX_HP-player.hp))}`,36,49); ctx.fillStyle='#fde68a'; ctx.fillText(`金币 ${player.coins}/${coins.length}`,165,49); ctx.fillStyle='#d8b4fe'; ctx.fillText(`踩怪 ${player.stompCount}`,315,49); ctx.fillText('关卡 1-1 森林集市',410,49);
  ctx.fillStyle='rgba(10,14,24,.58)'; ctx.fillRect(18,H-48,790,30); ctx.fillStyle='#cbd5e1'; ctx.font='15px system-ui'; ctx.fillText('A/D 或 ←/→ 移动｜S/↓ 下蹲；站在空中平台上按下可落下｜W/空格/↑ 跳跃｜地刺/掉坑扣 1 血',30,H-28); if(player.won||player.gameOver){ctx.fillStyle='rgba(0,0,0,.58)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='42px system-ui';ctx.fillText(player.won?'通关成功！按 R 重开':'游戏结束！按 R 重开',300,260);} }
function loop(now){ const dt=Math.min((now-last)/1000,.033); last=now; update(dt); draw(); requestAnimationFrame(loop); } requestAnimationFrame(loop);
