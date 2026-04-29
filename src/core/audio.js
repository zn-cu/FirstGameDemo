const FILES = {
  scene: '/assets/audio/scene_theme.wav',
  boss: '/assets/audio/boss_theme.wav',
  elderBoss: '/assets/audio/elder_boss_theme.wav',
  playerAttack: '/assets/audio/player_attack.wav',
  bossRanged: '/assets/audio/boss_ranged.wav',
  elderBossCast: '/assets/audio/elder_boss_cast.wav',
  bossMelee: '/assets/audio/boss_melee.wav',
  bossDefeated: '/assets/audio/boss_defeated.wav',
};

export function createAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContext();
  const master = ctx.createGain();
  const musicGain = ctx.createGain();
  const sfxGain = ctx.createGain();
  master.gain.value = .72;
  musicGain.gain.value = .42;
  sfxGain.gain.value = .82;
  musicGain.connect(master);
  sfxGain.connect(master);
  master.connect(ctx.destination);

  const buffers = new Map();
  const loading = new Map();
  let unlocked = false;
  let desiredMusic = 'scene';
  let currentMusic = null;

  async function loadBuffer(name) {
    if (buffers.has(name)) return buffers.get(name);
    if (!loading.has(name)) {
      loading.set(name, fetch(FILES[name])
        .then(response => response.arrayBuffer())
        .then(data => ctx.decodeAudioData(data))
        .then(buffer => {
          buffers.set(name, buffer);
          loading.delete(name);
          return buffer;
        }));
    }
    return loading.get(name);
  }

  function stopMusic() {
    if (!currentMusic) return;
    try { currentMusic.stop(); } catch {}
    currentMusic.disconnect();
    currentMusic = null;
  }

  async function playMusic(name) {
    desiredMusic = name;
    if (!unlocked) return;
    if (currentMusic?.name === name) return;
    const buffer = await loadBuffer(name);
    if (desiredMusic !== name) return;
    stopMusic();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(musicGain);
    source.name = name;
    source.start();
    currentMusic = source;
  }

  async function playSfx(name, volume = 1) {
    if (!unlocked) return;
    const buffer = await loadBuffer(name);
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = volume;
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(sfxGain);
    source.start();
  }

  return {
    async unlock() {
      if (ctx.state !== 'running') await ctx.resume();
      unlocked = true;
      playMusic(desiredMusic);
    },
    setMusic(name) {
      playMusic(name);
    },
    playerAttack() {
      playSfx('playerAttack', .78);
    },
    staffAttack() {
      playSfx('bossRanged', .56);
    },
    bossRanged() {
      playSfx('bossRanged', .82);
    },
    elderBossCast() {
      playSfx('elderBossCast', .88);
    },
    bossMelee() {
      playSfx('bossMelee', .9);
    },
    bossDefeated() {
      playSfx('bossDefeated', 1);
    }
  };
}
