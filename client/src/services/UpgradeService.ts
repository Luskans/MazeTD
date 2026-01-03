import type { Room } from "colyseus.js";
import type { TowerState } from "../../../server/src/rooms/schema/TowerState";
import type { WallState } from "../../../server/src/rooms/schema/WallState";
import { PathfindingService } from "../../../server/src/services/PathfindingService";
import type { GameState } from "../../../server/src/rooms/schema/GameState";
import type { SetupService } from "./SetupService";
import type { RockState } from "../../../server/src/rooms/schema/RockState";
import { getPlayerOffset } from "./utils";

export class UpgradeService {
  private scene: Phaser.Scene;
  private room: Room<GameState>;

  private isPreparing = false;
  private currentBuildingId: string | null = null;
  private currentBuildingType: string | null = null;
  private hoveredRockId: string | null = null;
  private highlightedSprite: Phaser.GameObjects.Sprite | null = null;
  private gridRect: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, room: Room<GameState>) {
    this.scene = scene;
    this.room = room;

    this.gridRect = scene.add.rectangle(0, 0, 32, 32, 0x00ff00, 0.4);
    this.gridRect.setOrigin(0, 0).setDepth(4);
    this.gridRect.setVisible(false);

    // Écouteurs
    this.scene.game.events.on('choose_upgrade', this.startPreparation, this);
    this.scene.input.on('pointermove', this.updateHover, this);
    this.scene.input.on('pointerdown', this.tryDestroy, this);
    this.scene.input.keyboard?.on('keydown-ESC', this.cancelPreparation, this);
    this.scene.input.on('pointerdown', (p: any) => { if (p.rightButtonDown()) this.cancelPreparation(); });

    // this.scene.input.on('pointermove', this.updatePreview, this);
    // this.scene.input.on('pointerdown', this.placeBuilding, this);
    // this.scene.input.keyboard!.on('keydown-ESC', this.cancelPreparation, this);
    // this.scene.input.on('pointerdown', (p: any) => { if (p.rightButtonDown()) this.cancelPreparation(); });
  }

  // private startPreparation(event: any) {
  //   if (event.buildingId === "destroy") {
  //     this.previewDestroy();
  //   } else {
  //     this.room.send("buy_upgrade", {
  //       buildingId: event.buildingId,
  //       buildingType: event.buildingType
  //     });
  //   }
  // }

  private startPreparation(event: any) {
    if (event.buildingId !== "destroy") {
      this.room.send("buy_upgrade", {
        buildingId: event.buildingId,
        buildingType: event.buildingType
      });

    } else {
      this.isPreparing = true;
      this.currentBuildingId = event.buildingId;
      this.currentBuildingType = event.buildingType;
      this.scene.input.setDefaultCursor('pointer'); // futur marteau 🛠️
      this.gridRect.setVisible(true);
    }
  }

  private updateHover(pointer: Phaser.Input.Pointer) {
    if (!this.isPreparing) return;

    const player = this.room.state.players.get(this.room.sessionId);
    if (!player) return;
    const playerOffset = getPlayerOffset(this.room);

    const relativeX = pointer.worldX - playerOffset.x;
    const relativeY = pointer.worldY - playerOffset.y;

    const gridX = Math.floor(relativeX / 32);
    const gridY = Math.floor(relativeY / 32);

    this.gridRect.x = (gridX * 32) + playerOffset.x;
    this.gridRect.y = (gridY * 32) + playerOffset.y;

    // const gridX = Math.floor(pointer.worldX / 32);
    // const gridY = Math.floor(pointer.worldY / 32);

    let foundRock: RockState | null = null;
    for (const rock of player.rocks.values()) {
      if (
        gridX >= rock.gridX &&
        gridX < rock.gridX + 2 &&
        gridY >= rock.gridY &&
        gridY < rock.gridY + 2
      ) {
        foundRock = rock;
        break;
      }
    }

    this.gridRect.setFillStyle(foundRock ? 0x00ff00 : 0xff0000, 0.4);

    if (!foundRock) {
      this.clearHighlight();
      return;
    }

    if (this.hoveredRockId === foundRock.id) return;

    this.clearHighlight();

    this.hoveredRockId = foundRock.id;
    console.log("found rock", foundRock)

    // const sprite = this.scene.children.getByName(foundRock.id) as Phaser.GameObjects.Sprite;
    // if (sprite) {
    //   sprite.setTint(0xff4444);
    //   this.highlightedSprite = sprite;
    // }
  }

  private tryDestroy(pointer: Phaser.Input.Pointer) {
    if (!this.isPreparing || pointer.rightButtonDown()) return;
    if (!this.hoveredRockId) return;

    this.room.send("destroy_rock", {
      buildingId: this.currentBuildingId,
      buildingType: this.currentBuildingType,
      rockId: this.hoveredRockId
    });

    this.cancelPreparation();
  }

  private clearHighlight() {
    // if (this.highlightedSprite) {
    //   this.highlightedSprite.clearTint();
    //   this.highlightedSprite = null;
    // }
    this.hoveredRockId = null;
  }

  private cancelPreparation() {
    this.isPreparing = false;
    this.scene.input.setDefaultCursor('default');
    this.gridRect.setVisible(false);
    this.clearHighlight();
  }

  public destroy() {
    this.scene.game.events.off('choose_upgrade', this.startPreparation, this);
    this.scene.input.off('pointermove', this.updateHover, this);
    this.scene.input.off('pointerdown', this.tryDestroy, this);
    this.scene.input.keyboard?.off('keydown-ESC', this.cancelPreparation, this);
  }
}