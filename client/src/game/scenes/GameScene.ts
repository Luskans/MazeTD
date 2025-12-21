import { GameState } from "../../../../server/src/rooms/schema/GameState";
import { getStateCallbacks, Room } from "colyseus.js";
import type { PlayerState } from "../../../../server/src/rooms/schema/PlayerState";
import { SetupService } from "../services/SetupService";
import { CameraService } from '../services/CameraService';
import { PathRenderer } from "../services/PathRenderer";

export class GameScene extends Phaser.Scene {
  room!: Room<GameState>;
  private setupService!: SetupService;
  private cameraService!: CameraService;
  private pathRenderer!: PathRenderer;

  constructor() {
    super("GameScene");
  }

  init(data: any) {
    this.room = data.room;
    this.setupService = new SetupService(this);
    this.cameraService = new CameraService(this);
    this.pathRenderer = new PathRenderer(this);
    console.log("Dans game scene, le state de la game : ", this.room.state.toJSON())
  }

  create() {
    const $ = getStateCallbacks(this.room);

    // this.setupService.createPlayersZone(this.room.state.players);
    this.setupService.createPlayersGrid(this.room.state);

    const player = this.room.state.players.get(this.room.sessionId)
    const playerIndex = Array.from(this.room.state.players.keys()).indexOf(this.room.sessionId);
    const playerPosition = this.setupService.getPlayerOffsets(this.room.state, playerIndex);
    console.log(`Player connected : ${player} with index ${playerIndex}`)
    // this.cameras.main.centerOn(player.tower.position.x, player.tower.position.y);

    $(this.room.state).players.onRemove((p: PlayerState, id: string) => {
      // updatePlayersUI(); // modifier affichage liste des joueurs
      // waveService(); // enlever la vague sur ce joueur
    });

    $(player).currentPath.onChange(() => {
      this.pathRenderer.drawPath(
        Array.from(player.currentPath.values()),
        playerPosition.offsetX,
        playerPosition.offsetY
      );
    });

    this.pathRenderer.drawPath(
      Array.from(player.currentPath.values()),
      playerPosition.offsetX,
      playerPosition.offsetY
    );

    this.game.events.on('choose-building', (data: any) => {
      console.log("Création de :", data.buildingId);
      // Votre logique de jeu ici
    });
  }

  update(time: number, delta: number) {
    if (this.cameraService) {
      this.cameraService.update(time, delta);
    }
  }
}
