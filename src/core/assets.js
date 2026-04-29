const img = (src) => new Promise(resolve => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.src = src;
});

export async function loadAssets() {
  const [
    heroWalk,
    heroIdle,
    heroJump,
    heroSwordAttack,
    heroMagicAttack,
    heroCrouch,
    tiles,
    enemySlime,
    bossSlimeKing,
    bossSlimeKingAttack,
    enemyGoblinWalk,
    enemyGoblinAttack,
    forestBackground,
    riverStrip,
    healthPotion,
    bossGoblinElder,
    bossGoblinElderSkill,
    magicStaff,
    magicProjectile
  ] = await Promise.all([
    img('/assets/images/hero_walk.png'),
    img('/assets/images/hero_idle.png'),
    img('/assets/images/hero_jump.png'),
    img('/assets/images/hero_sword_attack.png'),
    img('/assets/images/hero_magic_attack.png'),
    img('/assets/images/hero_crouch.png'),
    img('/assets/images/tiles.png'),
    img('/assets/images/enemy_slime.png'),
    img('/assets/images/boss_slime_king.png'),
    img('/assets/images/boss_slime_king_attack.png'),
    img('/assets/images/enemy_goblin_walk.png'),
    img('/assets/images/enemy_goblin_attack.png'),
    img('/assets/images/forest_background.png'),
    img('/assets/images/river_strip.png'),
    img('/assets/images/health_potion.png'),
    img('/assets/images/boss_goblin_elder.png'),
    img('/assets/images/boss_goblin_elder_skill.png'),
    img('/assets/images/magic_staff.png'),
    img('/assets/images/magic.png')
  ]);

  return {
    heroWalk,
    heroIdle,
    heroJump,
    heroSwordAttack,
    heroMagicAttack,
    heroCrouch,
    tiles,
    enemySlime,
    bossSlimeKing,
    bossSlimeKingAttack,
    enemyGoblinWalk,
    enemyGoblinAttack,
    forestBackground,
    riverStrip,
    healthPotion,
    bossGoblinElder,
    bossGoblinElderSkill,
    magicStaff,
    magicProjectile
  };
}
