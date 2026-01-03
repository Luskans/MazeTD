export type GameStore = {
  players: PlayerStore[],
  me: MyselfStore | null,
  waves: WaveConfigStore[],
  currentWaveIndex: number,
  waveCount: number,
  wavePhase: "waiting" | "countdown" | "running",
  countdown: number,
  countdownMax: number
}
export type PlayerStore = {
  sessionId: string,
  username: string,
  elo: number,
  isDefeated: boolean,
  isDisconnected: boolean,
  isReady: boolean,
  lives: number,
  kills: number,
  damage: number,
  mazeDuration: number,
  incomeBonus: number
}
export type MyselfStore = {
  sessionId: string,
  username: string,
  elo: number,
  rank: number | null,
  isDefeated: boolean,
  isReady: boolean,
  viewers: string[],
  lives: number,
  gold: number,
  income: number,
  population: number,
  maxPopulation: number,
  upgrades: UpgradeStore[]
}
export type WaveConfigStore = {
  index: number,
  enemyId: string
}
export type UpgradeStore = {
  id: string,
  level: number,
  currentCost: number,
  nextCost: number,
  currentValue: number,
  nextValue: number
}
// export type ShopStore = {
//   towers: TowerConfigStore[];
//   upgrades: UpgradeConfigStore[];
//   walls: WallConfigStore[];
// };
// export type TowerConfigStore = {
//   id: string,
//   price: number
// }
// export type WallConfigStore = {
//   id: string,
//   price: number
// }
// export type UpgradeConfigStore = {
//   id: string,
//   price: number
// }

export const gameStore: GameStore = $state({
  players: [],
  me: null,
  waves: [],
  currentWaveIndex: 0,
  waveCount: 0,
  wavePhase: 'waiting',
  countdown: 0,
  countdownMax: 0
});
// export const shopStore: ShopStore = $state({
//   towers: [],
//   upgrades: [],
//   walls: []
// });