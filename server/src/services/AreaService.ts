import { AreaState } from "../rooms/schema/AreaState";
import { TowerState } from "../rooms/schema/TowerState";
import { EnemyState } from "../rooms/schema/EnemyState";

export class AreaService {
  
  // Appelé quand une tour est posée
  public applyAreasToTower(tower: TowerState, areas: AreaState[]) {
    for (const area of areas) {
      if (this.isInside(tower, area)) {
        this.applyEffect(tower, area, 'tower');
      }
    };
  }

  // Appelé par le loop du serveur pour les ennemis
  public updateAreasToEnemies(enemies: Map<string, EnemyState>, areas: AreaState[]) {
    enemies.forEach(enemy => {
      areas.forEach(area => {        
        if (this.isInside(enemy, area)) {
          this.applyEffect(enemy, area, 'enemy');
        }
      });
    });
  }

  private isInside(entity: TowerState | EnemyState, area: AreaState): boolean {
    const areaCenterX = area.gridX * 32;
    const areaCenterY = area.gridY * 32;
    const entityCenterX = (entity.gridX * 32) + 32;
    const entityCenterY = (entity.gridY * 32) + 32;
    const dx = areaCenterX - entityCenterX;
    const dy = areaCenterY - entityCenterY;

    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= area.radius;
  }

  private applyEffect(entity: TowerState | EnemyState, area: AreaState, type: string) {
    if (type === 'tower') {
      if (area.type === "damage") entity.areaModifiers.damageMultiplier += area.multiplier;
      if (area.type === "attackSpeed") entity.areaModifiers.attackSpeedMultiplier += area.multiplier;
      if (area.type === "range") entity.areaModifiers.rangeMultiplier += area.multiplier;
    } else {
      if (area.type === "speed") entity.areaModifiers.speedMultiplier += area.multiplier;
    }
  }
}