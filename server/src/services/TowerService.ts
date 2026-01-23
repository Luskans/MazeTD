import { generateId, Room } from "colyseus";
import { GameState } from "../rooms/schema/GameState";
import { TypedEventEmitter } from "./EventBus";
import { PlayerState } from "../rooms/schema/PlayerState";
import { TowerState } from "../rooms/schema/TowerState";
import { WallState } from "../rooms/schema/WallState";
import { TOWERS_DATA } from "../datas/towersData";
import { logger } from "./utils";
import { WALLS_DATA } from "../datas/wallsData";

export class TowerService {
  private room: Room<GameState>;

  constructor(room: Room<GameState>) {
    this.room = room;
  }

  public getTower(player: PlayerState, id: string): TowerState {
    return player.towers.get(id);
  }

  public removeTower(player: PlayerState, id: string): void {
    player.towers.delete(id);
    player.population--;
  }

  public createTower(player: PlayerState, dataId: string, x: number, y: number, paymentCost: number, isDuringWave: boolean): TowerState {
    const newTower = new TowerState({
      id: generateId(),
      dataId: dataId,
      gridX: x,
      gridY: y,
      level: 1,
      totalCost: paymentCost,
      placingPending: isDuringWave,
      sellingPending: false
    });

    player.towers.set(newTower.id, newTower);
    player.population++;
    return newTower;
  }

  public createWall(player: PlayerState, dataId: string, x: number, y: number, size: number, paymentCost: number, isDuringWave: boolean): void {
    const newWall = new WallState({
      id: generateId(),
      dataId: dataId,
      gridX: x,
      gridY: y,
      size: size,
      placingPending: isDuringWave,
      sellingPending: false
    });

    player.walls.set(newWall.id, newWall);
    player.population++;
  }

  public updateTower(tower: TowerState): void {
    const data = TOWERS_DATA[tower.dataId];
    if (!data) {
      logger.error(`Data non trouvée pour la tour ${tower.dataId}`);
      return;
    }
    console.log("dans update tower server")
      
    // tower.damage = Math.round((tower.level * data.damageMultiplier) * tower.upgradeModifiers.damageMultiplier / 100 * tower.areaModifiers.damageMultiplier / 100);
    // tower.attackSpeed = Math.round((tower.level * data.attackSpeedMultiplier) * tower.upgradeModifiers.attackSpeedMultiplier / 100 * tower.areaModifiers.attackSpeedMultiplier / 100);
    // tower.range = Math.round(data.range * tower.upgradeModifiers.rangeMultiplier / 100 * tower.areaModifiers.rangeMultiplier / 100);
    const damageArea = (tower.upgradeModifiers.damageMultiplier + 100) / 100;
    const attackSpeedArea = (tower.upgradeModifiers.attackSpeedMultiplier + 100) / 100;
    const rangeArea = (tower.upgradeModifiers.rangeMultiplier + 100) / 100;
    // const speedArea = 100 / (tower.upgradeModifiers.rangeMultiplier + 100); // A mettre pour update des enemies

    tower.damage = Math.round((tower.level * (data.stats.damageMultiplier / 100)) * damageArea);
    tower.attackSpeed = Math.round((tower.level * (data.stats.attackSpeedMultiplier / 100)) * attackSpeedArea);
    tower.range = Math.round(data.stats.range * rangeArea);
    console.log("dans update tower server, damage", tower.damage)
  }

  public checkLevelupPayment(player: PlayerState, buildingId: string): number | null {
    const tower = player.towers.get(buildingId);
    if (!tower) {
      logger.error(`Joueur ${player.sessionId} : tower state non trouvée pour l'id ${buildingId}`);
      return null;
    }

    if (tower.sellingPending) {
      logger.warn(`Joueur ${player.sessionId} : Tentative de level up pour la tour d'id ${buildingId} pendant le pending.`);
      return null;
    }

    const price = tower.level * 4;
    if (player.gold < price) {
      logger.warn(`Joueur ${player.sessionId} : gold insuffisants pour construire level up la tour d'id ${buildingId}.`);
      return null;
    } 
    return price;
  }

  public makeLevelupPayment(player: PlayerState, paymentCost: number): void {
    player.gold -= paymentCost;
  }

  public levelupTower(player: PlayerState, paymentCost: number, tower: TowerState): void {
    const data = TOWERS_DATA[tower.dataId];
    if (!data) {
      logger.error(`Joueur ${player.sessionId} : data non trouvée pour la tour d'id ${tower.id}`);
      return null;
    }
    tower.level++;
    tower.totalCost += paymentCost;
  }

  public sellBuilding(player: PlayerState, buildingId: string, buildingType: string, isDuringWave: boolean): number | null {
    const building = buildingType === "tower" 
      ? player.towers.get(buildingId) 
      : player.walls.get(buildingId);
    if (!building) {
      logger.error(`Joueur ${player.sessionId} : building non trouvé pour l'id ${buildingId}`);
      return null;
    }

    if (building.sellingPending) {
      logger.warn(`Joueur ${player.sessionId} : Tentative de vente du building d'id ${buildingId} pendant le sell pending.`);
      return null;
    }

    const data = buildingType === "tower" 
      ? TOWERS_DATA[building.dataId] 
      : WALLS_DATA[building.dataId];
    if (!data) {
      logger.error(`Joueur ${player.sessionId} : data non trouvée pour le building d'id ${buildingId}`);
      return null;
    }

    let goldReceived = 0;
    if (buildingType === "tower") {
      goldReceived = Math.round((building as TowerState).totalCost * data.sellPercentage / 100);
    } else {
      const config = this.room.state.shop.wallsConfig.get(building.dataId);
      if (config) {
        goldReceived = Math.round(config.price * data.sellPercentage / 100);
      }
    }

    if (isDuringWave && !building.placingPending) {
      building.sellingPending = true;
    } else {
      if (buildingType === "tower") {
        player.towers.delete(buildingId);
      } else {
        player.walls.delete(buildingId);
      }
    }

    player.gold += goldReceived;
    player.population--;
    return goldReceived;
  }

  public rotateTower(player: PlayerState, towerId: string, isDuringWave: boolean): void {
    const tower = player.towers.get(towerId);
    if (!tower) {
      logger.error(`Joueur ${player.sessionId} : tour non trouvée pour l'id ${towerId}`);
      return;
    }
      
    if (!tower.sellingPending && !isDuringWave) {
      tower.direction = (tower.direction + 1) % 4;
    }
  }
}