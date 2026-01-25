import type { TowerState } from "../../../server/src/rooms/schema/TowerState";
import type { WallState } from "../../../server/src/rooms/schema/WallState";
import { COLORS } from "../styles/theme";
import { FloatingTextService } from "./FloatingTextService";

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

    if (buildingState.placingPending) sprite.setTint(COLORS.PENDING_PLACE);
    if (buildingState.sellingPending) {
      sprite.setTint(COLORS.PENDING_SELL);
      sprite.input!.cursor ='url(assets/cursors/pointer.png) 4 4, auto';
    }

    this.buildingsSprites.set(buildingState.id, sprite);
    ySortGroup.add(sprite);

    this.playBuildEffect(sprite);
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

  public updateStatus(id: string, action: "placing" | "selling" | "levelup") {
    const sprite = this.buildingsSprites.get(id);
    if (!sprite) return;

    if (action === "placing") {
      sprite.setAlpha(1).clearTint();
      sprite.input!.cursor = 'url(assets/cursors/hand_point.png) 6 4, pointer';
      // this.playEndPlacingEffect(sprite);
    } else if (action === "selling") {
      sprite.setAlpha(1).setTint(COLORS.PENDING_SELL);
      sprite.input!.cursor ='url(assets/cursors/pointer.png) 4 4, auto';
      this.playSellEffect(sprite);
    } else if (action === "levelup") {
      this.playLevelupEffect(sprite);
      // this.test(sprite);
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

  public playBuildEffect(sprite: Phaser.GameObjects.Sprite) {
    sprite.setScale(0);
    this.scene.tweens.add({
        targets: sprite,
        scaleX: 1,
        scaleY: 1,
        duration: 400,
        ease: 'Back.easeOut',
        easeParams: [2.5],
    });
  }

  public playSellEffect(sprite: Phaser.GameObjects.Sprite) {
    const x = sprite.x;
    const y = sprite.y;

    const particles = this.scene.add.particles(x, y, 'dot', {
      speed: { min: 160, max: 220 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      tint: COLORS.ROCK,
      gravityY: 200,
      frequency: -1,
    });

    particles.setDepth(sprite.depth + 1);
    particles.explode(20);

    this.scene.tweens.add({
      targets: sprite,
      x: x + 4,
      yoyo: true,
      duration: 50,
      repeat: 3,
      onComplete: () => {
        particles.destroy();
      }
    });
  }

  public playLevelupEffect(sprite: Phaser.GameObjects.Sprite) {
    const { x, y, width, height } = sprite;
    
    const beam = this.scene.add.graphics();
    beam.fillStyle(0xffffff, 0.8);
    beam.fillRect(-32, 0, width / 2, height - 32); 
    beam.setPosition(x, y - 64);
    beam.setDepth(sprite.depth + 1);

    beam.postFX.addBloom(0xffffff, 1, 1, 2, 3);

    this.scene.tweens.add({
        targets: beam,
        y: y - (height * 1.5),
        scaleX: 0.1,
        alpha: 0,
        duration: 800,
        ease: 'Expo.easeOut',
        onComplete: () => beam.destroy()
    });

    sprite.setTint(0xffff00);
    this.scene.tweens.add({
        targets: sprite,
        scale: 1.2,
        duration: 100,
        yoyo: true,
        onComplete: () => sprite.clearTint()
    });
  }
  public test(sprite: Phaser.GameObjects.Sprite) {
    // sprite.postFX.addShine(0.5, 0.5, 0xff00ff, false); // fais disparaitre en true, marche pas en false
    // sprite.postFX.addGradient(0xff00ff, 0x00ff00, 0.4, 0, 0, 0.7, 0.7); // baisser l'alpha pour plus de visibilité
    // sprite.postFX.addWipe(0.2, 0, 0); // marche pas
    // sprite.postFX.addBarrel(10); // fais disparaitre
    // sprite.postFX.addBloom(0xff00ff); // fais une coloration flou par dessus
    // sprite.postFX.addCircle(8, 0xff00ff, 0xff0000, 1);
    const effect = sprite.postFX.addColorMatrix();
    effect.lsd(false);

  }
}