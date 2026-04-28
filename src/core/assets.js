const img = (src) => new Promise(resolve => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.src = src;
});

export async function loadAssets() {
  const [heroWalk, heroIdle, heroCrouch, tiles, enemySlime, bossSlimeKing, bossSlimeKingAttack, attackSlash] = await Promise.all([
    img('/assets/images/hero_walk.png'),
    img('/assets/images/hero_idle.png'),
    img('/assets/images/hero_crouch.png'),
    img('/assets/images/tiles.png'),
    img('/assets/images/enemy_slime.png'),
    img('/assets/images/boss_slime_king.png'),
    img('/assets/images/boss_slime_king_attack.png'),
    img('/assets/images/attack_slash.png')
  ]);

  return { heroWalk, heroIdle, heroCrouch, tiles, enemySlime, bossSlimeKing, bossSlimeKingAttack, attackSlash };
}
