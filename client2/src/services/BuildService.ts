import { PathfindingService } from "../../../server/src/services/PathfindingService";

export class BuildService {
  private scene: Phaser.Scene;
  private room: any;
  private previewContainer: Phaser.GameObjects.Container;
  private ghostSprite: Phaser.GameObjects.Sprite;
  private gridRect: Phaser.GameObjects.Rectangle;
  private pathfindingService;
  private isPreparing = false;
  private currentBuildingId: string | null = null;
  private offsetX: number;
  private offsetY: number;

  constructor(scene: Phaser.Scene, room: any, offsetX: number, offsetY: number) {
    this.scene = scene;
    this.room = room;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.pathfindingService = new PathfindingService();

    // Conteneur pour déplacer le fantôme et le carré d'un coup
    this.previewContainer = scene.add.container(0, 0).setVisible(false).setDepth(100);
    
    // Le carré de couleur (64x64 car une tour = 2x2 cases de 32px)
    this.gridRect = scene.add.rectangle(0, 0, 64, 64, 0x00ff00, 0.4);
    this.gridRect.setOrigin(0, 0);

    // Le sprite de la tour
    this.ghostSprite = scene.add.sprite(32, 32, "").setAlpha(0.6); // Centré dans le 64x64
    
    this.previewContainer.add([this.gridRect, this.ghostSprite]);

    // Écouteurs
    this.scene.game.events.on('choose-tower', this.startPreparation, this);
    this.scene.game.events.on('choose-wall', this.startPreparation, this);
    this.scene.input.on('pointermove', this.updatePreview, this);
    this.scene.input.on('pointerdown', this.placeBuilding, this);
    
    // Annuler avec clic droit ou Echap
    this.scene.input.keyboard!.on('keydown-ESC', this.cancelPreparation, this);
    this.scene.input.on('pointerdown', (p: any) => { if (p.rightButtonDown()) this.cancelPreparation(); });
  }

  private startPreparation(event: any) {
    let buildingId =  event.buildingId;
    this.isPreparing = true;
    this.currentBuildingId = buildingId;
    
    const size = this.getGridSize(buildingId);
    const pixelSize = size * 32;

    this.gridRect.setSize(pixelSize, pixelSize);
    this.ghostSprite.setTexture(buildingId);
    this.ghostSprite.setSize(pixelSize, pixelSize);
    this.ghostSprite.setPosition(pixelSize / 2, pixelSize / 2);

    this.previewContainer.setVisible(true);
    console.log(this.scene.textures.exists(buildingId))
  }

  private updatePreview(pointer: Phaser.Input.Pointer) {
    if (!this.isPreparing) return;

    // 1. Aligner sur la grille (Snap to grid 32px)
    // On soustrait l'offset pour calculer la position relative à la grille du joueur
    const relativeX = pointer.worldX - this.offsetX;
    const relativeY = pointer.worldY - this.offsetY;

    const gridX = Math.floor(relativeX / 32);
    const gridY = Math.floor(relativeY / 32);

    // 2. Repositionner le container (en pixels absolus)
    this.previewContainer.x = (gridX * 32) + this.offsetX;
    this.previewContainer.y = (gridY * 32) + this.offsetY;

    // 3. Vérifier la validité (Côté client pour le feedback visuel immédiat)
    const isValid = this.checkLocalValidity(gridX, gridY);
    this.gridRect.setFillStyle(isValid ? 0x00ff00 : 0xff0000, 0.4);
    // this.gridRect.fillColor = isValid ? 0x00ff00 : 0xff0000;
  }

  // private checkLocalValidity(gridX: number, gridY: number): boolean {
  //   const player = this.room.state.players.get(this.room.sessionId);
  //   const gridSize = 2; // Vos tours font 2x2 (64px)

  //   // 1. Vérification des limites de la grille
  //   if (gridX < 0 || gridY < 0 || 
  //   gridX + gridSize > this.room.state.grid.col || 
  //   gridY + gridSize > this.room.state.grid.row) {
  //     return false;
  //   }

  //   // 2. Vérification des rochers (Rocks)
  //   for (const rock of player.rocks.values()) {
  //     if (!(gridX + gridSize <= rock.gridX || rock.gridX + 2 <= gridX || 
  //     gridY + gridSize <= rock.gridY || rock.gridY + 2 <= gridY)) {
  //       return false; // Collision avec un rocher
  //     }
  //   }

  //   // 3. Vérification des tours existantes
  //   for (const tower of player.towers.values()) {
  //     if (!(gridX + gridSize <= tower.gridX || tower.gridX + 2 <= gridX || 
  //     gridY + gridSize <= tower.gridY || tower.gridY + 2 <= gridY)) {
  //       return false; // Collision avec une autre tour
  //     }
  //   }

  //   return true;
  // }
  private checkLocalValidity(gridX: number, gridY: number): boolean {
    const player = this.room.state.players.get(this.room.sessionId);
    const gridSize = this.getGridSize(this.currentBuildingId);

    // 1. Limites
    if (gridX < 0 || gridY < 0 || 
      gridX + gridSize > this.room.state.grid.col || 
      gridY + gridSize > this.room.state.grid.row) {
      return false;
    }

    // 2. Collision avec Rocks / Towers / Walls
    // Astuce : On utilise une fonction de collision AABB (Axis-Aligned Bounding Box)
    const hasCollision = (otherX: number, otherY: number, otherSize: number) => {
      return !(gridX + gridSize <= otherX || 
              otherX + otherSize <= gridX || 
              gridY + gridSize <= otherY || 
              otherY + otherSize <= gridY);
    };

    for (const rock of player.rocks.values()) {
      if (hasCollision(rock.gridX, rock.gridY, 2)) return false;
    }

    for (const tower of player.towers.values()) {
      if (hasCollision(tower.gridX, tower.gridY, 2)) return false;
    }

    // N'oubliez pas de vérifier les murs déjà posés !
    for (const wall of player.walls.values()) {
      const wallSize = wall.typeId === 'small_wall' ? 1 : 2;
      if (hasCollision(wall.gridX, wall.gridY, wallSize)) return false;
    }

    return true;
  }

  private placeBuilding(pointer: Phaser.Input.Pointer) {
    if (!this.isPreparing || pointer.rightButtonDown()) return;

    const player = this.room.state.players.get(this.room.sessionId);
    const gridSize = this.getGridSize(this.currentBuildingId);
    const gridX = Math.floor((pointer.worldX - this.offsetX) / 32);
    const gridY = Math.floor((pointer.worldY - this.offsetY) / 32);

    if (!this.checkLocalValidity(gridX, gridY)) return;

    const isPathPossible = this.pathfindingService.validatePlacement(this.room.state, player, gridX, gridY, gridSize);

    if (!isPathPossible) {
      console.log('Construction impossible : chemin bloqué.')
      return;
    }

    // Envoyer l'ordre au serveur
    this.room.send("place-building", {
      buildingId: this.currentBuildingId,
      x: gridX,
      y: gridY,
      size: gridSize
    });
  }

  private getGridSize(buildingId: string | null): number {
    return buildingId === 'small_wall' ? 1 : 2;
  }

  private cancelPreparation() {
    this.isPreparing = false;
    this.previewContainer.setVisible(false);
  }

  public destroy() {
    this.scene.game.events.off('choose-tower');
    this.scene.game.events.off('choose-wall');
    this.scene.input.off('pointermove');
    this.scene.input.off('pointerdown');
    this.previewContainer.destroy();
  }
}