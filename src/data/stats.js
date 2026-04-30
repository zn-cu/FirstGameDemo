import { MAX_HP } from '../core/config.js';

export const playerStats = {
  maxHp: MAX_HP,
  attack: 3,
  defense: 1,
  magicAttack: 5,
  magicDefense: 1
};

export const enemyStats = {
  slime: {
    maxHp: 2,
    attack: 2,
    defense: 1,
    magicAttack: 2,
    magicDefense: 0
  },
  goblin: {
    maxHp: 3,
    attack: 3,
    defense: 1,
    magicAttack: 0,
    magicDefense: 1
  },
  bookMonster: {
    maxHp: 3,
    attack: 3,
    defense: 1,
    magicAttack: 3,
    magicDefense: 1
  },
  eliteBook: {
    maxHp: 8,
    attack: 4,
    defense: 1,
    magicAttack: 4,
    magicDefense: 2
  },
  yukino: {
    maxHp: 20,
    attack: 4,
    defense: 1,
    magicAttack: 4,
    magicDefense: 2
  },
  boss: {
    maxHp: 10,
    attack: 3,
    defense: 1,
    magicAttack: 3,
    magicDefense: 1
  },
  elderBoss: {
    maxHp: 15,
    attack: 4,
    defense: 1,
    magicAttack: 4,
    magicDefense: 1
  }
};

export function enemyStatKey(enemyOrKind) {
  if (typeof enemyOrKind === 'string') return enemyOrKind;
  return enemyOrKind?.kind || 'slime';
}

export function getEnemyStats(enemyOrKind) {
  const key = enemyStatKey(enemyOrKind);
  const base = enemyStats[key] ?? enemyStats.slime;
  if (typeof enemyOrKind === 'string' || !enemyOrKind) return base;
  return {
    maxHp: enemyOrKind.maxHp ?? base.maxHp,
    attack: enemyOrKind.attack ?? base.attack,
    defense: enemyOrKind.defense ?? base.defense,
    magicAttack: enemyOrKind.magicAttack ?? base.magicAttack,
    magicDefense: enemyOrKind.magicDefense ?? base.magicDefense
  };
}

export function calculateDamage(attacker, defender, type = 'physical') {
  if (type === 'magic') return Math.max(1, attacker.magicAttack - defender.magicDefense);
  return Math.max(1, attacker.attack - defender.defense);
}

export function calculatePlayerDamage(enemy, type = 'physical') {
  return calculateDamage(playerStats, getEnemyStats(enemy), type);
}

export function calculateEnemyDamage(enemyOrKind, type = 'physical') {
  return calculateDamage(getEnemyStats(enemyOrKind), playerStats, type);
}
