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
  price: number
}

export const shopStore: ShopStore = $state({
  towers: [],
  upgrades: [],
  walls: []
});