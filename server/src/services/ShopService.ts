import { Client, Room } from "colyseus";
import { GameState } from "../rooms/schema/GameState";
import { TypedEventEmitter } from "./EventBus";
import { PlayerState } from "../rooms/schema/PlayerState";
import { logger } from "./utils";
import { UPGRADES_DATA } from "../datas/upgradesData";
import { UpgradeState } from "../rooms/schema/UpgradeState";
import { MAP_DATA } from "../datas/mapData";

export class ShopService {
  private room: Room<GameState>;
  private eventBus: TypedEventEmitter;

  constructor(room: Room<GameState>) {
    this.room = room;
    // this.eventBus = this.eventBus;
    // this.eventBus.on('PATH_VALID', () => {
    
    // });
    // this.eventBus.on('PATH_INVALID', () => {
    
    // });
  }

  public checkMaxPopulation(player: PlayerState): boolean {
    const hasPopulation = player.population < player.maxPopulation;
    if (!hasPopulation) logger.warn(`Joueur ${player.sessionId} : max population insuffisante pour construire le building.`);
    return hasPopulation;
  }

  public checkShopPayment(player: PlayerState, buildingId: string, buildingType: string): number | null {
    const shop = this.room.state.shop;
    const configMap = 
      buildingType === "tower" ? shop.towersConfig :
      buildingType === "wall" ? shop.wallsConfig :
      buildingType === "upgrade" ? shop.upgradesConfig : null;

    const shopConfig = configMap?.get(buildingId);
    if (!shopConfig) {
      logger.error(`Joueur ${player.sessionId} : config state non trouvée pour le building d'id ${buildingId}`);
      return null;
    }

    let buildingPrice = 0;
    if (buildingType === "upgrade") {
      const upgrade = player.upgrades.get(buildingId);
      if (!upgrade) {
        logger.error(`Joueur ${player.sessionId} : upgrade state non trouvée pour l'id ${buildingId}`);
        return null;
      }
      buildingPrice = upgrade.currentCost;
    } else {
      buildingPrice = shopConfig.price;
    }

    if (player.gold < buildingPrice) {
      logger.warn(`Joueur ${player.sessionId} : gold insuffisants pour construire le building d'id ${buildingId}.`);
      return null;
    }
    return buildingPrice;
  }

  public makeShopPayment(player: PlayerState, paymentCost: number): void {
    player.gold -= paymentCost;
  }

  public levelupUpgrade(player: PlayerState, dataId: string): UpgradeState {
    const upgrade = player.upgrades.get(dataId);
    if (!upgrade) {
      logger.error(`Joueur ${player.sessionId} : upgrade state non trouvée pour l'id ${dataId}`);
      return;
    } 
    const upgradeConfig = this.room.state.shop.upgradesConfig.get(dataId);
    if (!upgradeConfig) {
      logger.error(`Joueur ${player.sessionId} : config state non trouvé pour l'id ${dataId}`);
      return;
    }
    const upgradeData = UPGRADES_DATA[dataId];
    if (!upgrade || !upgradeConfig || !upgradeData) {
      logger.error(`Joueur ${player.sessionId} : data non trouvé pour l'id ${dataId}`);
      return
    }
    upgrade.level++;
    upgrade.currentValue += upgradeData.upgradeValue;
    upgrade.currentCost = upgrade.nextCost;
    upgrade.nextValue = upgrade.currentValue + upgradeData.upgradeValue;
    // upgrade.nextCost = Math.round(upgrade.currentCost * upgradeConfig.upgradeMultiplier / 100); // exponential
    upgrade.nextCost = upgrade.currentCost + Math.round(upgradeData.price * upgradeConfig.upgradeMultiplier / 100); // linear
    return upgrade;
  }

  public applyUpgrade(player: PlayerState, upgrade: UpgradeState): void {
    if (upgrade.dataId === "income") {
      player.income = Math.round(MAP_DATA.baseIncome + ((MAP_DATA.baseIncome + this.room.state.waveCount) * upgrade.currentValue) / 100);
    } else if (upgrade.dataId === "population") {
      player.maxPopulation = MAP_DATA.baseMaxPopulation + upgrade.currentValue;
    } else {
      return;
    }
  }
}