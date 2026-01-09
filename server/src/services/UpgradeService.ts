import { TowerState } from "../rooms/schema/TowerState";
import { EnemyState } from "../rooms/schema/EnemyState";
import { UpgradeState } from "../rooms/schema/UpgradeState";
import { PlayerState } from "../rooms/schema/PlayerState";
import { logger } from "./utils";

export class UpgradeService {
  
  // Appelé quand une tour est posée
  public applyUpgradesToTower(tower: TowerState, player: PlayerState): void {
    const upgrades = player.upgrades;
    if (!upgrades) logger.error(`Joueur ${player.sessionId} : upgrades state non trouvée.`);
    upgrades.forEach(upgrade => {        
      this.applyEffect(tower, upgrade, 'enemy');
    });
  }

  // Appelé par le loop du serveur pour les ennemis
  public updateUpgradesToEnemies(enemies: Map<string, EnemyState>, player: PlayerState): void {
    const upgrades = player.upgrades;
    if (!upgrades) logger.error(`Joueur ${player.sessionId} : upgrades state non trouvée.`);
    enemies.forEach(enemy => {
      upgrades.forEach(upgrade => {        
        this.applyEffect(enemy, upgrade, 'enemy');
      });
    });
  }

  private applyEffect(entity: TowerState | EnemyState, upgrade: UpgradeState, type: string) {
    if (type === 'tower') {
      if (upgrade.dataId === "damage") entity.upgradeModifiers.damageMultiplier = upgrade.currentValue;
      if (upgrade.dataId === "attackSpeed") entity.upgradeModifiers.attackSpeedMultiplier = upgrade.currentValue;
    } else {
      if (upgrade.dataId === "speed") entity.upgradeModifiers.speedMultiplier = upgrade.currentValue;
    }
  }
}