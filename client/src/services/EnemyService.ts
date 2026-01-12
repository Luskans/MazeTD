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
    this.createAnimations('slime', 6);
    this.createAnimations('orc', 6);
    this.createAnimations('golem', 5);
  }

  private createAnimations(key: string, frames: number) {
    const directions = ['down', 'up', 'left', 'right'];
    directions.forEach((dir, index) => {
      const animKey = `${key}_walk_${dir}`;
      if (!this.scene.anims.exists(animKey)) {
        this.scene.anims.create({
          key: animKey,
          frames: this.scene.anims.generateFrameNumbers(key, { 
            start: index * frames, 
            end: (index * frames) + (frames - 1) 
          }),
          frameRate: 10,
          repeat: -1
        });
      }
    });
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

  createEnemySprite(enemy: EnemyState, enemyId: string, playerOffset: {x: number, y: number}, ySortGroup: Phaser.GameObjects.Group) {
    const x = (enemy.gridX * 32) + playerOffset.x + 16;
    const y = (enemy.gridY * 32) + playerOffset.y + 16;
    const sprite = this.scene.add.sprite(x, y, enemy.dataId);
    sprite.setDisplaySize(32, 32);
    sprite.setDepth(3);
    sprite.setOrigin(0.5, 0.75);
    sprite.setData('targetX', x);
    sprite.setData('targetY', y);
    sprite.play(`${enemy.dataId}_walk_down`);
    this.enemySprites.set(enemyId, sprite);
    ySortGroup.add(sprite);
  }

  // Cette fonction sera appelée par la Scene à chaque changement
  updateTargetPosition(enemyId: string, gridX: number, gridY: number, playerOffset: {x: number, y: number}) {
    const x = (gridX * 32) + playerOffset.x + 16;
    const y = (gridY * 32) + playerOffset.y + 16;
    const sprite = this.enemySprites.get(enemyId);
    if (sprite) {
      sprite.setData('targetX', x);
      sprite.setData('targetY', y);
    }
  }

  // update(time: number, delta: number) {
  //   const LERP_FACTOR = 0.15; // Entre 0 et 1. Plus c'est bas, plus c'est fluide mais "mou"

  //   this.enemySprites.forEach((sprite, id) => {
  //     const tx = sprite.getData('targetX');
  //     const ty = sprite.getData('targetY');

  //     // Math.abs pour éviter les micro-mouvements inutiles
  //     if (Math.abs(sprite.x - tx) > 0.1 || Math.abs(sprite.y - ty) > 0.1) {
  //       // Formule : Position = Position + (Cible - Position) * Facteur
  //       sprite.x += (tx - sprite.x) * LERP_FACTOR;
  //       sprite.y += (ty - sprite.y) * LERP_FACTOR;
  //     } else {
  //       // On force la position finale pour stopper le calcul
  //       sprite.x = tx;
  //       sprite.y = ty;
  //     }
  //   });
  // }

  update(time: number, delta: number) {
    const LERP_FACTOR = 0.15;

    this.enemySprites.forEach((sprite, id) => {
      const tx = sprite.getData('targetX');
      const ty = sprite.getData('targetY');

      const dx = tx - sprite.x;
      const dy = ty - sprite.y;

      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        // Déterminer la direction pour l'animation
        this.updateAnimation(sprite, dx, dy);

        sprite.x += dx * LERP_FACTOR;
        sprite.y += dy * LERP_FACTOR;
      } else {
        sprite.x = tx;
        sprite.y = ty;
        sprite.anims.stop(); // Optionnel : stop l'anim si l'ennemi ne bouge plus
      }
    });
  }

  private updateAnimation(sprite: Phaser.GameObjects.Sprite, dx: number, dy: number) {
    const angle = Math.atan2(dy, dx); // Angle en radians
    const deg = Phaser.Math.RadToDeg(angle); // Conversion en degrés (-180 à 180)
    
    let dir = 'down';
    const key = sprite.texture.key;

    // Découpage par secteurs de 90°
    if (deg >= -46 && deg < 46) {
        dir = 'right';
    } else if (deg >= 44 && deg < 134) {
        dir = 'down';
    } else if (deg >= -134 && deg < -44) {
        dir = 'up';
    } else {
        dir = 'left';
    }

    const animKey = `${key}_walk_${dir}`;
    if (sprite.anims.getName() !== animKey) {
      sprite.play(animKey);
    }
  }

  destroyEnemySprite(id: string) {
    const sprite = this.enemySprites.get(id);
    if (sprite) {
      sprite.destroy();
      this.enemySprites.delete(id);
    }
  }
}