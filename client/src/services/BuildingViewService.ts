import type { TowerState } from "../../../server/src/rooms/schema/TowerState";
import type { WallState } from "../../../server/src/rooms/schema/WallState";

export class BuildingViewService {
  private buildingsSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private buildingsParticles: Map<string, Phaser.GameObjects.Particles.ParticleEmitter> = new Map();

  constructor(private scene: Phaser.Scene) {
    this.initAllAnimations();
  }

  private initAllAnimations() {
    const types = ['basic', 'fire', 'ice', 'air', 'nature', 'earth', 'water', 'electric', 
      'ghost', 'arcane', 'fairy', 'light', 'dark', 'poison', 'blood', 'metal'];
    types.forEach(type => this.createAnimations(type, 12));
  }

  private createAnimations(dataId: string, frames: number) {
    const animKey = `${dataId}_anim`;
    if (!this.scene.anims.exists(animKey)) {
      this.scene.anims.create({
        key: animKey,
        frames: this.scene.anims.generateFrameNumbers(dataId, { start: 0, end: (frames - 1) }),
        frameRate: 8,
        repeat: -1
      });
    }
  }

  public addBuildingSprite(buildingState: TowerState | WallState, type: "tower" | "wall", pos: { x: number, y: number }, ownerId: string, ySortGroup: Phaser.GameObjects.Group, onSelect: (sprite: Phaser.GameObjects.Sprite) => void) {
    const buildingSize = (type === 'wall') ? (buildingState as WallState).size : 2;
    const texture = (type === 'wall') ? `${buildingState.dataId}_icon` : buildingState.dataId;
  
    const sprite = this.scene.add.sprite(pos.x + (buildingSize * 16), pos.y + (buildingSize * 16), texture);
    if (type === "tower") {
      sprite.play(`${buildingState.dataId}_anim`);
    }
    sprite.setOrigin(0.5, 0.75);
    sprite.setData('ownerId', ownerId);
    sprite.setInteractive({
      pixelPerfect: true,
      alphaTolerance: 1,
      cursor: 'url(assets/cursors/hand_point.png) 6 4, pointer'
    });

    sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown() && !buildingState.sellingPending) {
        onSelect(sprite);
      }
    });

    if (buildingState.placingPending) sprite.setTint(0x8CD1FF);
    if (buildingState.sellingPending) {
      sprite.setTint(0xF8BBD0);
      sprite.input!.cursor ='url(assets/cursors/pointer.png) 4 4, auto';
    }

    this.buildingsSprites.set(buildingState.id, sprite);
    ySortGroup.add(sprite);

    this.playConstructionEffect(sprite);
    
    return sprite;
  }

  public addTowerParticles(id: string, x: number, y: number, colors: number[]) {
    if (colors.length === 0) return;

    const emitter = this.scene.add.particles(x, y, 'dot', {
      speed: { min: 10, max: 20 },
      scale: { start: 0.25, end: 0 },
      angle: { min: 260, max: 280 },
      alpha: 1,
      lifespan: { min: 800, max: 1200 },
      tint: colors,
      frequency: 40,
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Circle(0, 0, 32),
        quantity: 1
      }
    }).setDepth(8000);

    this.buildingsParticles.set(id, emitter);
  }

  public updateStatus(id: string, action: "placing" | "selling") {
    const sprite = this.buildingsSprites.get(id);
    if (!sprite) return;

    if (action === "placing") {
      sprite.setAlpha(1).clearTint();
      sprite.input!.cursor = 'url(assets/cursors/hand_point.png) 6 4, pointer';
      this.playEndPlacingEffect(sprite);
    } else if (action === "selling") {
      sprite.setAlpha(1).setTint(0xF8BBD0);
      sprite.input!.cursor ='url(assets/cursors/pointer.png) 4 4, auto';
      this.playSellingEffect(sprite);
    }
  }

  public remove(id: string) {
    const sprite = this.buildingsSprites.get(id);
    if (sprite) {
      sprite.destroy();
      this.buildingsSprites.delete(id);
    }
    // if (sprite) {
    //   if (!sprite.active) {
    //       this.buildingsSprites.delete(id);
    //   } else {
    //       sprite.destroy();
    //       this.buildingsSprites.delete(id);
    //   }
    // }
    const emitter = this.buildingsParticles.get(id);
    if (emitter) {
      emitter.destroy();
      this.buildingsParticles.delete(id);
    }
  }

  public getSprite(id: string) {
    return this.buildingsSprites.get(id);
  }

  private playConstructionEffect(sprite: Phaser.GameObjects.Sprite) {
    sprite.setScale(1.5);
    this.scene.tweens.add({
      targets: sprite,
      scale: 1,
      ease: 'Back.out',
      duration: 300
    });
  }

  private playSellingEffect(sprite: Phaser.GameObjects.Sprite) {
    const originalScale = sprite.scale;
    sprite.setScale(originalScale + 1);
    this.scene.tweens.add({
      targets: sprite,
      scale: originalScale,
      ease: 'Back.out',
      duration: 300
    });
  }

  private playEndPlacingEffect(sprite: Phaser.GameObjects.Sprite) {
    const originalScale = sprite.scale;
    sprite.setScale(originalScale + 1);
    this.scene.tweens.add({
      targets: sprite,
      scale: originalScale,
      ease: 'Back.out',
      duration: 300
    });
  }

  private playEndSellingEffect(sprite: Phaser.GameObjects.Sprite) {
    const originalY = sprite.y;
    this.scene.tweens.add({
      targets: sprite,
      y: originalY + 120,
      ease: 'Back.out',
      duration: 300,
      onComplete: () => {
        sprite.destroy(); 
      }
    });
  }
}