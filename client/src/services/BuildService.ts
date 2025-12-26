import type { Room } from "colyseus.js";
import type { TowerState } from "../../../server/src/rooms/schema/TowerState";
import type { WallState } from "../../../server/src/rooms/schema/WallState";
import { PathfindingService } from "../../../server/src/services/PathfindingService";
import type { GameState } from "../../../server/src/rooms/schema/GameState";
import type { SetupService } from "./SetupService";

export class BuildService {
  private scene: Phaser.Scene;
  private room: Room<GameState>;
  private pathfindingService: PathfindingService;
  private setupService: SetupService;

  private previewContainer: Phaser.GameObjects.Container;
  private ghostSprite: Phaser.GameObjects.Sprite;
  private gridRect: Phaser.GameObjects.Rectangle;
  private isPreparing = false;
  private currentBuildingId: string | null = null;
  private currentBuildingType: string | null = null;
  private currentBuildingSize: number | null = null;
  private offsetX: number;
  private offsetY: number;
  private buildingsSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();

  constructor(scene: Phaser.Scene, room: Room<GameState>, setupService: SetupService, pathfindingService: PathfindingService) {
    this.scene = scene;
    this.room = room;
    // this.offsetX = offsetX;
    // this.offsetY = offsetY;
    this.setupService = setupService;
    this.pathfindingService = pathfindingService;

    const playerIndex = Array.from(this.room.state.players.keys()).indexOf(this.room.sessionId);
    const playerOffset = this.setupService.getPlayerOffsets(playerIndex);
    this.offsetX = playerOffset.x;
    this.offsetY = playerOffset.y;

    this.previewContainer = scene.add.container(0, 0).setVisible(false).setDepth(100);
    this.gridRect = scene.add.rectangle(0, 0, 64, 64, 0x00ff00, 0.4);
    this.gridRect.setOrigin(0, 0);
    this.ghostSprite = scene.add.sprite(32, 32, "").setAlpha(0.6); // Centré dans le 64x64
    this.previewContainer.add([this.gridRect, this.ghostSprite]);

    // Écouteurs
    this.scene.game.events.on('choose_tower', this.startPreparation, this);
    this.scene.game.events.on('choose_wall', this.startPreparation, this);
    this.scene.input.on('pointermove', this.updatePreview, this);
    this.scene.input.on('pointerdown', this.placeBuilding, this);
    this.scene.input.keyboard!.on('keydown-ESC', this.cancelPreparation, this);
    this.scene.input.on('pointerdown', (p: any) => { if (p.rightButtonDown()) this.cancelPreparation(); });
  }

  private startPreparation(event: any) {
    this.isPreparing = true;
    this.currentBuildingId = event.buildingId;
    this.currentBuildingType = event.buildingType;
    this.currentBuildingSize = event.buildingSize;
    const pixelSize = event.buildingSize * 32;

    this.gridRect.setSize(pixelSize, pixelSize);
    this.ghostSprite.setTexture(event.buildingId);
    this.ghostSprite.setSize(pixelSize, pixelSize);
    this.ghostSprite.setPosition(pixelSize / 2, pixelSize / 2);
    this.previewContainer.setVisible(true);
  }

  private updatePreview(pointer: Phaser.Input.Pointer) {
    if (!this.isPreparing) return;

    // 1. Aligner sur la grille (Snap to grid 32px)
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
    // const gridSize = this.getGridSize(this.currentBuildingId);
    const gridSize = this.currentBuildingSize!;

    // 1. Limites
    if (gridX < 0 || gridY < 0 || 
      gridX + gridSize > this.room.state.grid.col || 
      gridY + gridSize > this.room.state.grid.row) {
      return false;
    }

    // 2. Collision avec Rocks / Towers / Walls
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
    // const gridSize = this.getGridSize(this.currentBuildingId);
    const gridX = Math.floor((pointer.worldX - this.offsetX) / 32);
    const gridY = Math.floor((pointer.worldY - this.offsetY) / 32);

    if (!this.checkLocalValidity(gridX, gridY)) return;

    const isPathPossible = this.pathfindingService.validatePlacement(this.room.state, player, gridX, gridY, this.currentBuildingSize as number);

    if (!isPathPossible) {
      console.log('Construction impossible : chemin bloqué.')
      return;
    }

    // Envoyer l'ordre au serveur
    this.room.send("place_building", {
      buildingId: this.currentBuildingId,
      x: gridX,
      y: gridY,
      buildingSize: this.currentBuildingSize,
      buildingType: this.currentBuildingType
    });
  }

  // private getGridSize(buildingId: string | null): number {
  //   return buildingId === 'small_wall' ? 1 : 2;
  // }

  private cancelPreparation() {
    this.isPreparing = false;
    this.previewContainer.setVisible(false);
  }

  public addBuildingSprite(buildingState: TowerState | WallState, type: "tower" | "wall") {
    // 1. Calculer la position en pixels
    const x = (buildingState.gridX * 32) + this.offsetX;
    const y = (buildingState.gridY * 32) + this.offsetY;

    // 2. Déterminer la texture
    // const texture = type === "tower" ? buildingState.typeId : buildingState.id;

    // 3. Créer le sprite
    const sprite = this.scene.add.sprite(x, y, buildingState.dataId).setOrigin(0, 0);
    sprite.setDepth(10);

    // 4. Stocker la référence pour plus tard (en utilisant l'ID unique de Colyseus)
    this.buildingsSprites.set(buildingState.id, sprite);
  }

  public removeBuildingSprite(id: string) {
    const sprite = this.buildingsSprites.get(id);
    if (sprite) {
      sprite.destroy();
      this.buildingsSprites.delete(id);
    }
  }

  public destroy() {
    this.scene.game.events.off('choose-tower');
    this.scene.game.events.off('choose-wall');
    this.scene.input.off('pointermove');
    this.scene.input.off('pointerdown');
    this.previewContainer.destroy();
  }
}