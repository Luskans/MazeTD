import type { Room } from "colyseus.js";
import type { TowerState } from "../../../server/src/rooms/schema/TowerState";
import type { WallState } from "../../../server/src/rooms/schema/WallState";
import { PathfindingService } from "../../../server/src/services/PathfindingService";
import type { GameState } from "../../../server/src/rooms/schema/GameState";
import type { SetupService } from "./SetupService";

export class UpgradeService {
  private scene: Phaser.Scene;
  private room: Room<GameState>;

  constructor(scene: Phaser.Scene, room: Room<GameState>) {
    this.scene = scene;
    this.room = room;

    // Écouteurs
    this.scene.game.events.on('choose_upgrade', this.startPreparation, this);
    // this.scene.input.on('pointermove', this.updatePreview, this);
    // this.scene.input.on('pointerdown', this.placeBuilding, this);
    // this.scene.input.keyboard!.on('keydown-ESC', this.cancelPreparation, this);
    // this.scene.input.on('pointerdown', (p: any) => { if (p.rightButtonDown()) this.cancelPreparation(); });
  }

  private startPreparation(event: any) {
    if (event.buildingId === "destroy") {
      this.previewDestroy();
    } else {
      this.room.send("buy_upgrade", {
        buildingId: event.buildingId,
        buildingType: event.buildingType
      });
    }
  }

  private previewDestroy() {

  }

  public destroy() {
    this.scene.game.events.off('choose-tower');
    this.scene.game.events.off('choose-wall');
    this.scene.input.off('pointermove');
    this.scene.input.off('pointerdown');
  }
}