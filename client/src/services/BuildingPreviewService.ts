import { COLORS } from "../styles/theme";

export class BuildingPreviewService {
  private previewContainer: Phaser.GameObjects.Container;
  private ghostSprite: Phaser.GameObjects.Sprite;
  private ghostParticles: Phaser.GameObjects.Particles.ParticleEmitter;
  private gridRect: Phaser.GameObjects.Rectangle;

  private currentSize: number = 1;
  private currentType: string = 'tower';

  constructor(private scene: Phaser.Scene) {
    this.previewContainer = scene.add.container(0, 0).setVisible(false).setDepth(8000);
    this.gridRect = scene.add.rectangle(0, 0, 64, 64, 0x00ff00, 0.4).setOrigin(0, 0);
    this.ghostSprite = scene.add.sprite(0, 0, "").setAlpha(0.6).setOrigin(0, 0);
    this.previewContainer.add([this.gridRect, this.ghostSprite]);
    this.ghostParticles = scene.add.particles(0, 0, 'dot', {
      speed: { min: 10, max: 20 },
      lifespan: { min: 800, max: 1200 },
      angle: { min: 260, max: 280 },
      scale: { start: 0.25, end: 0 },
      alpha: 1,
      tint: [COLORS.DAMAGE, COLORS.ATTACK_SPEED],
      frequency: 40,
      emitting: false,
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Circle(0, 0, 32),
        quantity: 1
      }
    }).setDepth(8001);
  }

  public activate(dataId: string, type: string, size: number) {
    this.currentSize = size;
    this.currentType = type;
    this.gridRect.setSize(size * 32, size * 32);
    this.ghostSprite.setTexture(`${dataId}_icon`);
    this.ghostSprite.setScale(1);
    this.ghostSprite.setOrigin(0.5, 0.75);
    
    if (type === "tower") {
      this.ghostSprite.setScale(2);
      this.ghostSprite.setPosition(32, 16);
    } else {
      this.ghostSprite.setPosition(size * 16, size * 16);
    }

    this.previewContainer.setVisible(true);
    this.scene.input.setDefaultCursor('url(assets/cursors/open.png) 6 8, auto');
  }

  public update(x: number, y: number, isValid: boolean, activeBuffColors: number[]) {
    if (!this.previewContainer.visible) return;

    this.previewContainer.setPosition(x, y);
    this.gridRect.setFillStyle(isValid ? COLORS.VALID : COLORS.INVALID, 0.4);

    if (this.currentType === 'tower' && activeBuffColors.length > 0) {
      const centerX = x + (this.currentSize * 16);
      const centerY = y + (this.currentSize * 16);
      
      this.ghostParticles.setPosition(centerX, centerY);
      this.ghostParticles.updateConfig({ tint: activeBuffColors });
      
      if (!this.ghostParticles.emitting) this.ghostParticles.start();
    } else {
      this.ghostParticles.stop();
    }
  }

  public deactivate() {
    this.previewContainer.setVisible(false);
    this.ghostParticles.stop();
    this.scene.input.setDefaultCursor('default');
  }

  public isVisible(): boolean {
    return this.previewContainer.visible;
  }
}