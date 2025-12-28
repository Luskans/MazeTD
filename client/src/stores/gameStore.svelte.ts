import type { UpgradeConfig } from "../../../server/src/rooms/schema/UpgradeConfig"
import type { WallConfig } from "../../../server/src/rooms/schema/WallConfig"

export type GameStore = {
  players: PlayerStore[],
  me: MyselfStore | null,
  waves: WaveConfigStore[],
  currentWaveIndex: number,
  waveCount: number,
  countdown: number | null,
  // towerConfigs: TowerConfigStore[],
  // wallConfigs: WallConfigStore[],
  // upgradeConfigs: UpgradeConfigStore[] 
}
export type PlayerStore = {
  sessionId: string,
  username: string,
  elo: number,
  isDefeated: boolean,
  isDisconnected: boolean,
  isReady: boolean,
  // viewers: Record<string, boolean>,
  lives: number,
  kills: number,
  damage: number,
  mazeTime: number,
  incomeBonus: number
}
export type MyselfStore = {
  sessionId: string,
  username: string,
  elo: number,
  rank: number | null,
  isDefeated: boolean,
  isReady: boolean,
  // viewers: Record<string, boolean>,
  viewers: string[],
  lives: number,
  gold: number,
  income: number,
  population: number,
  maxPopulation: number
}
export type WaveConfigStore = {
  index: number,
  enemyId: string
}
export type ShopStore = {
  towers: TowerConfigStore[];
  upgrades: UpgradeConfigStore[];
  walls: WallConfigStore[];
};
export type TowerConfigStore = {
  id: string,
  price: number
}
export type WallConfigStore = {
  id: string,
  price: number
}
export type UpgradeConfigStore = {
  id: string,
  price: number,
  multiplier: number;
}

export const gameStore: GameStore = $state({
  players: [],
  me: null,
  waves: [],
  currentWaveIndex: 0,
  waveCount: 0,
  countdown: null,
  // towerConfigs: [],
  // wallConfigs: [],
  // upgradeConfigs: [] 
});
export const shopStore: ShopStore = $state({
  towers: [],
  upgrades: [],
  walls: []
});