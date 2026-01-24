import type { Room } from "colyseus.js";
import type { GameState } from "../../../server/src/rooms/schema/GameState";
import type { EnemyState } from "../../../server/src/rooms/schema/EnemyState";
import { COLORS } from "../styles/theme";

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

  createEnemySprite(enemy: EnemyState, enemyId: string, playerOffset: {x: number, y: number}, ySortGroup: Phaser.GameObjects.Group) {
    const x = (enemy.gridX * 32) + playerOffset.x + 16;
    const y = (enemy.gridY * 32) + playerOffset.y + 16;
    const sprite = this.scene.add.sprite(x, y, enemy.dataId);
    sprite.setDisplaySize(32, 32);
    sprite.setDepth(3);
    sprite.setOrigin(0.5, 0.75);
    sprite.setData('targetX', x);
    sprite.setData('targetY', y);
    sprite.setScale(1.5);
    sprite.play(`${enemy.dataId}_walk_down`);
    this.enemySprites.set(enemyId, sprite);
    ySortGroup.add(sprite);
    this.playSpawnEffect(sprite);

    this.scene.events.emit('enemy_spawned', {
      id: enemyId,
      sprite,
      maxHp: enemy.maxHp
    });
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

  public destroyEnemySprite(id: string) {
    const sprite = this.enemySprites.get(id);
    if (!sprite) return;

    sprite.setTintFill(COLORS.GLOW);

    this.scene.tweens.add({
      targets: sprite,
      scale: 0,
      alpha: 0,
      duration: 200,
      ease: 'Back.In',
      onComplete: () => {
        sprite.destroy();
        this.enemySprites.delete(id);
      }
    });

    this.scene.events.emit('enemy_despawned', id);
  }

  private playSpawnEffect(sprite: Phaser.GameObjects.Sprite) {
    sprite.setScale(0);
    sprite.setAlpha(0);
    sprite.setTintFill(COLORS.GLOW);

    this.scene.tweens.add({
      targets: sprite,
      scale: 1.5,
      alpha: 1,
      duration: 250,
      ease: 'Back.Out',
      onComplete: () => {
        sprite.clearTint();
      }
    });
  }
}