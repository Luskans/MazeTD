import { TOWERS_DATA } from "../../../server/src/datas/towersData";

export class BuildingSelectionService {
  private selectionGraphics: Phaser.GameObjects.Graphics;
  private selectedSprite: Phaser.GameObjects.Sprite | null = null;
  private selectedBuildingId: string | null = null;

  constructor(private scene: Phaser.Scene) {
    // Initialisation du calque de dessin pour les portées
    this.selectionGraphics = this.scene.add.graphics().setDepth(3);
  }

  /**
   * Sélectionne un bâtiment et dessine sa portée
   */
  public select(sprite: Phaser.GameObjects.Sprite, buildingState: any, type: "tower" | "wall", ownerId: string) {
    // 1. Nettoyage de la sélection précédente
    this.deselect();

    // 2. Application de l'effet visuel sur le nouveau sprite
    this.selectedSprite = sprite;
    this.selectedBuildingId = buildingState.id;
    this.selectedSprite.postFX.addGlow(0xffffff, 2);

    // 3. Dessin de la portée si c'est une tour
    if (type === "tower") {
      this.drawTowerRange(sprite, buildingState);
    }

    // 4. Notification pour l'UI (React/Vue/etc.)
    window.dispatchEvent(new CustomEvent('select-building', {
      detail: { 
        isVisible: true, 
        buildingId: buildingState.id, 
        type: type, 
        ownerId: ownerId 
      }
    }));
  }

  /**
   * Logique de dessin géométrique des portées
   */
  private drawTowerRange(sprite: Phaser.GameObjects.Sprite, buildingState: any) {
    const towerData = TOWERS_DATA[buildingState.dataId];
    if (!towerData) return;

    const centerX = sprite.x;
    const centerY = sprite.y;
    const range = buildingState.range;
    const fillColor = 0xffffff;
    const fillAlpha = 0.2;

    this.selectionGraphics.clear();
    this.selectionGraphics.fillStyle(fillColor, fillAlpha);

    // Calcul de l'angle de base selon la direction (0=E, 1=S, 2=W, 3=N)
    const baseAngle = (buildingState.direction || 0) * (Math.PI / 2);
    const coneAngleRad = Phaser.Math.DegToRad(towerData.attack.angle || 90);

    switch (towerData.attack.mode) {
      case 'circle':
        this.selectionGraphics.fillCircle(centerX, centerY, range);
        break;

      case 'cone':
        this.drawCone(centerX, centerY, range, baseAngle, coneAngleRad);
        if (towerData.attack.dual) {
          this.drawCone(centerX, centerY, range, baseAngle + Math.PI, coneAngleRad);
        }
        break;

      case 'line':
        const lineWidth = 64;
        this.drawLine(centerX, centerY, range, baseAngle, lineWidth);
        if (towerData.attack.dual) this.drawLine(centerX, centerY, range, baseAngle + Math.PI, lineWidth);
        if (towerData.attack.quad) {
          this.drawLine(centerX, centerY, range, baseAngle + Math.PI, lineWidth);
          this.drawLine(centerX, centerY, range, baseAngle + Math.PI / 2, lineWidth);
          this.drawLine(centerX, centerY, range, baseAngle - Math.PI / 2, lineWidth);
        }
        break;
    }

    // Animation de pulsation sur la zone dessinée
    this.scene.tweens.add({
      targets: this.selectionGraphics,
      alpha: 0.4,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  private drawCone(x: number, y: number, range: number, rotation: number, coneAngle: number) {
    const start = rotation - (coneAngle / 2);
    const end = rotation + (coneAngle / 2);
    this.selectionGraphics.beginPath();
    this.selectionGraphics.moveTo(x, y);
    this.selectionGraphics.arc(x, y, range, start, end);
    this.selectionGraphics.closePath();
    this.selectionGraphics.fillPath();
  }

  private drawLine(x: number, y: number, range: number, rotation: number, width: number) {
    const vec = new Phaser.Math.Vector2().setToPolar(rotation, range);
    const perpVec = new Phaser.Math.Vector2().setToPolar(rotation + Math.PI / 2, width / 2);

    const p1 = { x: x + perpVec.x, y: y + perpVec.y };
    const p2 = { x: x - perpVec.x, y: y - perpVec.y };
    const p3 = { x: p2.x + vec.x, y: p2.y + vec.y };
    const p4 = { x: p1.x + vec.x, y: p1.y + vec.y };

    this.selectionGraphics.fillPoints([p1, p2, p3, p4], true);
  }

  /**
   * Désélectionne le bâtiment actuel et nettoie les visuels
   */
  public deselect() {
    this.selectedBuildingId = null;
    this.selectionGraphics.clear();
    this.scene.tweens.killTweensOf(this.selectionGraphics);
    this.selectionGraphics.setAlpha(1);

    if (this.selectedSprite) {
      this.selectedSprite.postFX.clear();
      this.selectedSprite = null;
    }

    window.dispatchEvent(new CustomEvent('select-building', {
      detail: { isVisible: false }
    }));
  }

  public getSelectedId(): string | null {
    return this.selectedBuildingId;
  }
}