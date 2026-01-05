import type { Room } from "colyseus.js";
import type { TowerState } from "../../../server/src/rooms/schema/TowerState";
import type { WallState } from "../../../server/src/rooms/schema/WallState";
import { PathfindingService } from "../../../server/src/services/PathfindingService";
import type { GameState } from "../../../server/src/rooms/schema/GameState";
import type { SetupService } from "./SetupService";
import { getPlayerOffset } from "./utils";
import type { PlayerState } from "../../../server/src/rooms/schema/PlayerState";

export class BuildService {
  private scene: Phaser.Scene;
  private room: Room<GameState>;
  private pathfindingService: PathfindingService;
  private startClickPos = { x: 0, y: 0 };

  private isPreparing = false;
  private previewContainer: Phaser.GameObjects.Container;
  private ghostSprite: Phaser.GameObjects.Sprite;
  private gridRect: Phaser.GameObjects.Rectangle;
  private currentBuildingId: string | null = null;
  private currentBuildingType: string | null = null;
  private currentBuildingSize: number | null = null;
  private buildingsSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();

  private selectionGraphics: Phaser.GameObjects.Graphics;
  private selectedBuildingId: string | null = null;

  constructor(scene: Phaser.Scene, room: Room<GameState>, pathfindingService: PathfindingService) {
    this.scene = scene;
    this.room = room;
    this.pathfindingService = pathfindingService;

    this.previewContainer = scene.add.container(0, 0).setVisible(false).setDepth(100);
    this.gridRect = scene.add.rectangle(0, 0, 64, 64, 0x00ff00, 0.4);
    this.gridRect.setOrigin(0, 0);
    this.ghostSprite = scene.add.sprite(32, 32, "").setAlpha(0.6); // Centré dans le 64x64
    this.previewContainer.add([this.gridRect, this.ghostSprite]);

    this.selectionGraphics = this.scene.add.graphics().setDepth(5);

    // Écouteurs
    this.scene.game.events.on('choose_tower', this.startPreparation, this);
    this.scene.game.events.on('choose_wall', this.startPreparation, this);
    this.scene.input.on('pointermove', this.updatePreview, this);
    this.scene.input.on('pointerdown', this.placeBuilding, this);
    this.scene.input.keyboard!.on('keydown-ESC', this.cancelPreparation, this);
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.startClickPos.x = pointer.x;
        this.startClickPos.y = pointer.y;
      }
    });
    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonReleased()) {
        const distanceMoved = Phaser.Math.Distance.Between(
          this.startClickPos.x, this.startClickPos.y,
          pointer.x, pointer.y
        );
        if (distanceMoved < 10) {
          this.cancelPreparation();
          this.deselectBuilding();
        }
      }
    });
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
    const playerOffset = getPlayerOffset(this.room);

    const relativeX = pointer.worldX - playerOffset.x;
    const relativeY = pointer.worldY - playerOffset.y;

    const gridX = Math.floor(relativeX / 32);
    const gridY = Math.floor(relativeY / 32);

    this.previewContainer.x = (gridX * 32) + playerOffset.x;
    this.previewContainer.y = (gridY * 32) + playerOffset.y;

    const isValid = this.checkLocalValidity(gridX, gridY);
    this.gridRect.setFillStyle(isValid ? 0x00ff00 : 0xff0000, 0.4);
  }

  private checkLocalValidity(gridX: number, gridY: number): boolean {
    const player = this.room.state.players.get(this.room.sessionId);
    const gridSize = this.currentBuildingSize!;

    if (gridX < 0 || gridY < 0 || 
      gridX + gridSize > this.room.state.grid.col || 
      gridY + gridSize > this.room.state.grid.row) {
      return false;
    }

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

    for (const wall of player.walls.values()) {
      if (hasCollision(wall.gridX, wall.gridY, wall.size)) return false;
    }

    return true;
  }

  private placeBuilding(pointer: Phaser.Input.Pointer) {
    if (!this.isPreparing || pointer.rightButtonDown()) return;
    const playerOffset = getPlayerOffset(this.room)

    const player = this.room.state.players.get(this.room.sessionId);
    const gridX = Math.floor((pointer.worldX - playerOffset.x) / 32);
    const gridY = Math.floor((pointer.worldY - playerOffset.y) / 32);

    if (!this.checkLocalValidity(gridX, gridY)) return;

    const isDuringWave = this.room.state.wavePhase === 'running';
    const isPathPossible = this.pathfindingService.validatePlacement(this.room.state, player, gridX, gridY, this.currentBuildingSize as number, isDuringWave);

    if (!isPathPossible) {
      console.log('Construction impossible : chemin bloqué.')
      return;
    }

    this.room.send("place_building", {
      buildingId: this.currentBuildingId,
      x: gridX,
      y: gridY,
      buildingSize: this.currentBuildingSize,
      buildingType: this.currentBuildingType
    });
  }

  private cancelPreparation() {
    this.isPreparing = false;
    this.previewContainer.setVisible(false);
  }

  public addBuildingSprite(buildingState: TowerState | WallState, type: "tower" | "wall", playerOffset: {x: number, y: number}, player: PlayerState) {
    const x = (buildingState.gridX * 32) + playerOffset.x;
    const y = (buildingState.gridY * 32) + playerOffset.y;

    const sprite = this.scene.add.sprite(x, y, buildingState.dataId).setOrigin(0, 0);
    sprite.setData('ownerId', player.sessionId);
    sprite.setInteractive();
    // sprite.on('pointerdown', () => {
    //   window.dispatchEvent(new CustomEvent('select-building', { 
    //     detail: { 
    //       id: buildingState.id, 
    //       type: type,
    //       // level: buildingState.level,
    //       // price: buildingState.price,
    //       // owner: buildingState.owner // important pour savoir si c'est à moi !
    //     } 
    //   }));
    // });
    sprite.on('pointerdown', (pointer: Phaser.Input.Pointer, event: Phaser.Types.Input.EventData) => {
      if (pointer.leftButtonDown()) {
        // event.stopPropagation(); // Empêche d'autres clics
        this.selectBuilding(buildingState, player.sessionId, type, sprite);
      }
    });

    if (buildingState.placingPending) {
        sprite.setAlpha(0.5);
        sprite.setTint(0xFFF3A0);
    }
    sprite.setDepth(10);

    this.buildingsSprites.set(buildingState.id, sprite);
  }

  public removeBuildingSprite(id: string) {
    const sprite = this.buildingsSprites.get(id);
    if (sprite) {
      sprite.destroy();
      this.buildingsSprites.delete(id);
    }
  }

  public updateBuildingSprite(id: string, action: "placing" | "selling") {
    const sprite = this.buildingsSprites.get(id);
    if (!sprite) return;
    if (action === "placing") {
      sprite.setAlpha(1);
      sprite.clearTint();
    } else if (action === "selling") {
      sprite.setAlpha(0.5);
      sprite.setTint(0xF8BBD0);
    }
  }

  selectBuilding(buildingState: TowerState | WallState, ownerId: string, type: "tower" | "wall", sprite: Phaser.GameObjects.Sprite) {
    this.selectedBuildingId = buildingState.id;
    
    // Dessiner l'aura
    this.selectionGraphics.clear();
    this.selectionGraphics.lineStyle(2, 0x00ffff, 1);
    const centerX = sprite.x + sprite.displayWidth / 2;
    const centerY = sprite.y + sprite.displayHeight / 2;
    this.selectionGraphics.strokeCircle(centerX, centerY, sprite.displayWidth * 0.8);
    
    // Animation de pulsation
    this.scene.tweens.add({
      targets: this.selectionGraphics,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    window.dispatchEvent(new CustomEvent('select-building', { 
      detail: { 
        isVisible: true,
        buildingId: buildingState.id,
        type: type,
        ownerId: ownerId
      } 
    }));
  }

  deselectBuilding() {
    if (!this.selectedBuildingId) return;
    this.selectedBuildingId = null;
    this.selectionGraphics.clear();
    this.scene.tweens.killTweensOf(this.selectionGraphics);
    this.selectionGraphics.alpha = 1;

    window.dispatchEvent(new CustomEvent('select-building', { 
      detail: { isVisible: false } 
    }));
  }

  public destroy() {
    this.scene.game.events.off('choose-tower');
    this.scene.game.events.off('choose-wall');
    this.scene.input.off('pointermove');
    this.scene.input.off('pointerdown');
    this.previewContainer.destroy();
  }
}