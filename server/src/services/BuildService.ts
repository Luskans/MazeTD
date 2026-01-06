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

  public validatePayment(state: GameState, player: PlayerState, buildingId: string, buildingType: string): number | null {
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
    upgrade.nextCost = Math.round(upgrade.currentCost * upgradeConfig.upgradeMultiplier / 100);
    upgrade.nextCost = upgrade.currentCost + Math.round(upgradeData.price * upgradeConfig.upgradeMultiplier / 100);

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