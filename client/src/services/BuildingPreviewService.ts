export class BuildingPreviewService {
  private previewContainer: Phaser.GameObjects.Container;
  private ghostSprite: Phaser.GameObjects.Sprite;
  private ghostParticles: Phaser.GameObjects.Particles.ParticleEmitter;
  private gridRect: Phaser.GameObjects.Rectangle;

  private currentSize: number = 1;
  private currentType: string = 'tower';

  constructor(private scene: Phaser.Scene) {
    // 1. Initialisation du container de preview
    this.previewContainer = scene.add.container(0, 0).setVisible(false).setDepth(8000);

    // 2. Le rectangle de la grille (feedback de validité)
    this.gridRect = scene.add.rectangle(0, 0, 64, 64, 0x00ff00, 0.4).setOrigin(0, 0);

    // 3. Le sprite fantôme
    this.ghostSprite = scene.add.sprite(0, 0, "").setAlpha(0.6).setOrigin(0, 0);

    this.previewContainer.add([this.gridRect, this.ghostSprite]);

    // 4. Les particules de feedback (buffs)
    this.ghostParticles = scene.add.particles(0, 0, 'dot', {
      speed: { min: 10, max: 20 },
      lifespan: { min: 800, max: 1200 },
      angle: { min: 260, max: 280 },
      scale: { start: 0.25, end: 0 },
      alpha: 1,
      tint: [0xff0000, 0x00ff00],
      frequency: 40,
      emitting: false,
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Circle(0, 0, 32),
        quantity: 1
      }
    }).setDepth(8001);
  }

  /**
   * Active la preview et configure les visuels selon l'objet choisi
   */
  public activate(dataId: string, type: string, size: number) {
    this.currentSize = size;
    this.currentType = type;

    // Configurer le rectangle de grille
    this.gridRect.setSize(size * 32, size * 32);

    // Configurer le ghost
    this.ghostSprite.setTexture(`${dataId}_icon`);
    this.ghostSprite.setScale(1);
    this.ghostSprite.setOrigin(0.5, 0.75);
    
    // Logique spécifique aux types (reprise de ton code)
    if (type === "tower") {
      this.ghostSprite.setScale(2);
      this.ghostSprite.setPosition(32, 16);
    } else {
      this.ghostSprite.setPosition(size * 16, size * 16);
    }

    this.previewContainer.setVisible(true);
    this.scene.input.setDefaultCursor('url(assets/cursors/open.png) 6 8, auto');
  }

  /**
   * Met à jour la position et les feedbacks visuels (couleur grille et particules)
   */
  public update(x: number, y: number, isValid: boolean, activeBuffColors: number[]) {
    if (!this.previewContainer.visible) return;

    // Positionnement du container
    this.previewContainer.setPosition(x, y);

    // Couleur de validité (vert si ok, rouge si collision/bloqué)
    this.gridRect.setFillStyle(isValid ? 0x00ff00 : 0xff0000, 0.4);

    // Gestion des particules de buffs (uniquement pour les tours)
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

  /**
   * Désactive et cache la preview
   */
  public deactivate() {
    this.previewContainer.setVisible(false);
    this.ghostParticles.stop();
    this.scene.input.setDefaultCursor('default'); // Ou ton curseur de base
  }

  public isVisible(): boolean {
    return this.previewContainer.visible;
  }
}