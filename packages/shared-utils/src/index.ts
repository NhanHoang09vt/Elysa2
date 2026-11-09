export function calculateCombatPower(stats: {
  hp?: number;
  atk?: number;
  def?: number;
  matk?: number;
  mdef?: number;
  crit?: number;
}): number {
  const hp = stats.hp || 100;
  const atk = stats.atk || 10;
  const def = stats.def || 5;
  const matk = stats.matk || 0;
  const mdef = stats.mdef || 5;
  const crit = stats.crit || 0.05;

  return Math.floor(hp * 0.2 + (atk + matk) * 2.5 + (def + mdef) * 1.8 + crit * 1000);
}

export function formatGold(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount);
}
