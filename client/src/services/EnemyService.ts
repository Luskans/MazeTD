import type { Room } from "colyseus.js";
import type { GameState } from "../../../server/src/rooms/schema/GameState";
import type { EnemyState } from "../../../server/src/rooms/schema/EnemyState";

export class EnemyService {
  private scene: Phaser.Scene;
  private room: Room<GameState>;
  private enemySprites: Map<string, Phaser.GameObjects.Sprite> = new Map();

  constructor(scene: Phaser.Scene, room: Room<GameState>) {
      this.scene = scene;
      this.room = room;
  }

  // createEnemySprite(enemy: EnemyState, enemyId: string) {
  //     // On crée le sprite à la position initiale
  //     const sprite = this.scene.add.sprite(enemy.gridX * 32, enemy.gridY * 32, 'enemy');
      
  //     // On stocke la référence
  //     this.enemySprites.set(enemyId, sprite);

  //     // On attache les données du serveur au sprite pour y accéder dans l'update
  //     // 'targetX' et 'targetY' sont en pixels
  //     sprite.setData('targetX', enemy.gridX * 32);
  //     sprite.setData('targetY', enemy.gridY * 32);

  //     // On écoute les changements de position de cet ennemi précis
  //     (enemy as any).onChange(() => {
  //         // Optionnel : On peut utiliser un tween ici pour plus de fluidité
  //         // sprite.x = state.gridX * 32; 
  //         // sprite.y = state.gridY * 32;

  //         // À chaque changement côté serveur, on met à jour la CIBLE, pas la position
  //         sprite.setData('targetX', enemy.gridX * 32);
  //         sprite.setData('targetY', enemy.gridY * 32);
  //     });
  // }

  createEnemySprite(enemy: EnemyState, enemyId: string, playerOffset: {x: number, y: number}) {
    const x = (enemy.gridX * 32) + playerOffset.x;
    const y = (enemy.gridY * 32) + playerOffset.y;
    const sprite = this.scene.add.sprite(x + 16, y + 16, enemy.dataId);
    sprite.setDisplaySize(32, 32);
    sprite.setData('targetX', x);
    sprite.setData('targetY', y);
    this.enemySprites.set(enemyId, sprite);
  }

  // Cette fonction sera appelée par la Scene à chaque changement
  updateTargetPosition(enemyId: string, gridX: number, gridY: number, playerOffset: {x: number, y: number}) {
    const x = (gridX * 32) + playerOffset.x;
    const y = (gridY * 32) + playerOffset.y;
    const sprite = this.enemySprites.get(enemyId);
    if (sprite) {
      sprite.setData('targetX', x + 16);
      sprite.setData('targetY', y + 16);
    }
  }

  update(time: number, delta: number) {
    const LERP_FACTOR = 0.15; // Entre 0 et 1. Plus c'est bas, plus c'est fluide mais "mou"

    this.enemySprites.forEach((sprite, id) => {
      const tx = sprite.getData('targetX');
      const ty = sprite.getData('targetY');

      // Math.abs pour éviter les micro-mouvements inutiles
      if (Math.abs(sprite.x - tx) > 0.1 || Math.abs(sprite.y - ty) > 0.1) {
        // Formule : Position = Position + (Cible - Position) * Facteur
        sprite.x += (tx - sprite.x) * LERP_FACTOR;
        sprite.y += (ty - sprite.y) * LERP_FACTOR;
      } else {
        // On force la position finale pour stopper le calcul
        sprite.x = tx;
        sprite.y = ty;
      }
    });
  }

  destroyEnemySprite(id: string) {
      const sprite = this.enemySprites.get(id);
      if (sprite) {
          sprite.destroy();
          this.enemySprites.delete(id);
      }
  }
}