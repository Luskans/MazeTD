export type BuildingStore = {
  towers: Record<string, TowerStore>;
  walls: Record<string, WallStore>;
};
export type TowerStore = {
  id: string,
  dataId: string,
  ownerId: string,
  level: number,
  damage: number,
  attackSpeed: number,
  range: number,
  direction: number,
  totalDamage: number,
  totalKills: number,
  totalCost: number
}
export type WallStore = {
  id: string,
  dataId: string,
  ownerId: string,
}

export const buildingStore: BuildingStore = $state({
  towers: {},
  walls: {}
});