import { Client, generateId, Room } from "colyseus";
import { MAP_DATA } from "../datas/mapData";
import { TOWERS_DATA } from "../datas/towersData";
import { UPGRADES_DATA } from "../datas/upgradesData";
import { WALLS_DATA } from "../datas/wallsData";
import { GameState } from "../rooms/schema/GameState";
import { PlayerState } from "../rooms/schema/PlayerState";
import { TowerState } from "../rooms/schema/TowerState";
import { WallState } from "../rooms/schema/WallState";
import { UpgradeState } from "../rooms/schema/UpgradeState";

export class BuildService {
  private room: Room<GameState>;

  constructor(room: Room<GameState>) {
    this.room = room;
  }

  public validatePopulation(player: PlayerState): boolean {
    return player.population < player.maxPopulation;
  }

  public validateShopPayment(state: GameState, player: PlayerState, buildingId: string, buildingType: string): number | null {
    let config: "towersConfig" | "upgradesConfig" | "wallsConfig";
    if (buildingType === "tower") {
      config = "towersConfig";
    } else if (buildingType === "wall") {
      config = "wallsConfig";
    } else if (buildingType === "upgrade") {
      config = "upgradesConfig";
    } else {
      return null;
    }

    const shopConfig = state.shop[config].get(buildingId);
    if (!shopConfig) {
      console.error(`Prix introuvable pour ${buildingId}.`);
      return null;
    }

    let buildingPrice;
    if (buildingType === "upgrade") {
      const upgrade = player.upgrades.get(buildingId);
      buildingPrice = upgrade.currentCost;
    } else {
      buildingPrice = shopConfig.price;
    }

    if (player.gold < buildingPrice) return null;

    player.gold -= buildingPrice;
    return buildingPrice;
  }

  public validateLevelUpPayment(state: GameState, player: PlayerState, buildingId: string): number | null {
    const tower = player.towers.get(buildingId);
    if (!tower) {
      console.error(`Building introuvable pour l'id ${buildingId}`);
      return null;
    }

    if (tower.sellingPending) {
      console.error(`Tentative de level up le building d'id ${buildingId} pendant le pending.`);
      return null;
    }

    const data = TOWERS_DATA[tower.dataId];
    if (!data) {
      console.error(`Data introuvables pour ${tower.dataId}`);
      return null;
    }
    const price = tower.level * 4;
    if (player.gold < price) return null;

    player.gold -= price;
    tower.level++;
    tower.damage = Math.round(data.stats.damageMultiplier * tower.level / 100);
    tower.attackSpeed = Math.round(data.stats.attackSpeedMultiplier * tower.level / 100);
    tower.totalCost += price;

    return price;
  }

  public validateSellPayment(state: GameState, player: PlayerState, buildingId: string, buildingType: string, isDuringWave: boolean): number | null {
    const building = buildingType === "tower" 
      ? player.towers.get(buildingId) 
      : player.walls.get(buildingId);
    if (!building) {
      console.error(`Building introuvable pour l'id ${buildingId}`);
      return null;
    }

    if (building.sellingPending) {
      console.error(`Tentative de sell le building d'id ${buildingId} pendant le pending.`);
      return null;
    }

    const data = buildingType === "tower" 
      ? TOWERS_DATA[building.dataId] 
      : WALLS_DATA[building.dataId];
    if (!data) {
      console.error(`Data introuvables pour ${building.dataId}`);
      return null;
    }

    let goldReceived = 0;
    if (buildingType === "tower") {
      goldReceived = Math.round((building as TowerState).totalCost * data.sellPercentage / 100);
    } else {
      const config = state.shop.wallsConfig.get(building.dataId);
      if (config) {
        goldReceived = Math.round(config.price * data.sellPercentage / 100);
      }
    }

    player.gold += goldReceived;
    player.population--;
    if (isDuringWave) {
      building.sellingPending = true;
    } else {
      if (buildingType === "tower") {
        player.towers.delete(buildingId);
      } else {
        player.walls.delete(buildingId);
      }
    }

    return goldReceived;
  }

  public createTower(player: PlayerState, x: number, y: number, buildingId: string, paymentCost: number, isDuringWave: boolean): void {
    const data = TOWERS_DATA[buildingId];
    if (!data) {
      console.error(`Tour introuvable pour ${buildingId}.`);
      return
    }
    
    const newTower = new TowerState({
      id: generateId(),
      dataId: data.id,
      gridX: x,
      gridY: y,
      level: 1,
      damage: Math.round(data.stats.damageMultiplier * 1 / 100),
      attackSpeed: Math.round(data.stats.attackSpeedMultiplier * 1 / 100),
      range: data.stats.range,
      totalCost: paymentCost,
      placingPending: isDuringWave,
      sellingPending: false
    });

    player.towers.set(newTower.id, newTower);
    player.population++;
  }

  public createWall(player: PlayerState, x: number, y: number, buildingId: string, isDuringWave: boolean): void {
    const data = WALLS_DATA[buildingId];
    if (!data) {
      console.error(`Mur introuvable pour ${buildingId}.`);
      return
    }

    const newWall = new WallState({
      id: generateId(),
      dataId: data.id,
      gridX: x,
      gridY: y,
      size: data.size,
      placingPending: isDuringWave,
      sellingPending: false
    });

    player.walls.set(newWall.id, newWall);
    player.population++;
  }

  public buyUpgrade(state: GameState, player: PlayerState, buildingId: string): void {
    const upgrade = player.upgrades.get(buildingId);
    const upgradeConfig = state.shop.upgradesConfig.get(buildingId);
    const upgradeData = UPGRADES_DATA[buildingId];
    if (!upgrade || !upgradeConfig || !upgradeData) {
      console.error(`Upgrade all introuvable pour ${buildingId}.`);
      return
    }

    upgrade.level++;
    upgrade.currentValue += upgradeData.upgradeValue;
    upgrade.currentCost = upgrade.nextCost;
    upgrade.nextValue = upgrade.currentValue + upgradeData.upgradeValue;
    // upgrade.nextCost = Math.round(upgrade.currentCost * upgradeConfig.upgradeMultiplier / 100); // exponential
    upgrade.nextCost = upgrade.currentCost + Math.round(upgradeData.price * upgradeConfig.upgradeMultiplier / 100); // linear

    this.applyUpgrade(state, player, upgrade);
  }

  private applyUpgrade(state: GameState, player: PlayerState, upgrade: UpgradeState) {
    if (upgrade.dataId === "income") {
      player.income = Math.round(MAP_DATA.baseIncome + ((MAP_DATA.baseIncome + state.waveCount) * upgrade.currentValue) / 100);
    } else if (upgrade.dataId === "population") {
      player.maxPopulation = MAP_DATA.baseMaxPopulation + upgrade.currentValue;
    } else {
      return;
    }
  }
}