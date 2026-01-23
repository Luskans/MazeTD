export class BuildingViewService {
  private buildingsSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private buildingsParticles: Map<string, Phaser.GameObjects.Particles.ParticleEmitter> = new Map();

  constructor(private scene: Phaser.Scene) {
    // On peut initialiser les animations communes ici ou via une méthode dédiée
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
        frameRate: 16,
        repeat: -1
      });
    }
  }

  /**
   * Crée le sprite et les particules associées pour un bâtiment
   */
  public addBuildingSprite(buildingState: any, type: "tower" | "wall", pos: { x: number, y: number }, ownerId: string, ySortGroup: Phaser.GameObjects.Group, onSelect: (sprite: Phaser.GameObjects.Sprite) => void) {
    const buildingSize = (type === 'wall') ? buildingState.size : 2;
    const texture = (type === 'wall') ? `${buildingState.dataId}_icon` : buildingState.dataId;
    
    // Positionnement (centré sur la case)
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

    // Gestion du clic pour la sélection
    sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown() && !buildingState.sellingPending) {
        onSelect(sprite);
      }
    });

    // État visuel initial (si en attente de pose)
    if (buildingState.placingPending) sprite.setAlpha(1).setTint(0x8CD1FF);
    if (buildingState.sellingPending) {
      sprite.setAlpha(1).setTint(0xF8BBD0);
      sprite.input!.cursor ='url(assets/cursors/pointer.png) 4 4, auto';
    }

    this.buildingsSprites.set(buildingState.id, sprite);
    ySortGroup.add(sprite);
    
    return sprite;
  }

  /**
   * Ajoute l'effet de particules sous une tour
   */
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

  /**
   * Met à jour l'aspect visuel selon l'état (Vente, Pose terminée)
   */
  public updateStatus(id: string, action: "placing" | "selling") {
    const sprite = this.buildingsSprites.get(id);
    if (!sprite) return;

    if (action === "placing") {
      sprite.setAlpha(1).clearTint();
      sprite.input!.cursor = 'url(assets/cursors/hand_point.png) 6 4, pointer';
    } else if (action === "selling") {
      sprite.setAlpha(1).setTint(0xF8BBD0);
      sprite.input!.cursor ='url(assets/cursors/pointer.png) 4 4, auto';
    }
  }

  public remove(id: string) {
    const sprite = this.buildingsSprites.get(id);
    if (sprite) {
      sprite.destroy();
      this.buildingsSprites.delete(id);
    }
    const emitter = this.buildingsParticles.get(id);
    if (emitter) {
      emitter.destroy();
      this.buildingsParticles.delete(id);
    }
  }

  public getSprite(id: string) {
    return this.buildingsSprites.get(id);
  }
}