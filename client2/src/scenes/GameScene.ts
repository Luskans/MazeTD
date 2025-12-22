import { GameState } from "../../../server/src/rooms/schema/GameState";
import { getStateCallbacks, Room } from "colyseus.js";
import type { PlayerState } from "../../../server/src/rooms/schema/PlayerState";
import { SetupService } from "../services/SetupService";
import { CameraService } from '../services/CameraService';
import { PathRenderer } from "../services/PathRenderer";
import { currentScene } from "../stores/GlobalVariables";
import { BuildService } from "../services/BuildService";
import { WaveService } from "../services/WaveService";

export class GameScene extends Phaser.Scene {
  room!: Room<GameState>;
  private setupService!: SetupService;
  private cameraService!: CameraService;
  private pathRenderer!: PathRenderer;
  private buildService!: BuildService;
  private waveService!: WaveService;

  constructor() {
    super("GameScene");
  }

  init(data: any) {
    this.room = data.room;
    currentScene.set('GameScene');
    //@ts-ignore
    console.log("Dans game scene, le state de la game : ", this.room.state.toJSON())
  }

  create() {
    const $ = getStateCallbacks(this.room);
    const player = this.room.state.players.get(this.room.sessionId)
    const playerIndex = Array.from(this.room.state.players.keys()).indexOf(this.room.sessionId);
    this.setupService = new SetupService(this);
    const playerOffset = this.setupService.getPlayerOffsets(this.room.state, playerIndex);
    console.log(`Player number ${playerIndex} named ${player.username} with ID ${player.sessionId} connected.`)

    // INIT SERVICES
    this.cameraService = new CameraService(this);
    this.pathRenderer = new PathRenderer(this);
    this.buildService = new BuildService(this, this.room,playerOffset.x, playerOffset.y);
    this.waveService = new WaveService(this);

    // FIRST DRAWS
    this.setupService.createPlayersGrid(this.room.state);
    this.pathRenderer.drawPath(
      Array.from(player.currentPath.values()),
      playerOffset.x,
      playerOffset.y
    );
    // this.cameras.main.centerOn(player.tower.position.x, player.tower.position.y);

    // LISTEN CHANGES AND EVENTS
    $(this.room.state).players.onRemove((p: PlayerState, id: string) => {
      // updatePlayersUI(); // modifier affichage liste des joueurs
      // waveService(); // enlever la vague sur ce joueur
    });
    $(player).listen("pathVersion", () => {
      this.pathRenderer.drawPath(
        Array.from(player.currentPath.values()),
        playerOffset.x,
        playerOffset.y
      );
      //@ts-ignore
      console.log("Chemin changé, nouvelle state de la game : ", this.room.state.toJSON())
    });
    $(player).towers.onAdd((towerState: any, key: string) => {
      this.buildService.addBuildingSprite(towerState, "tower");
    });
    $(player).walls.onAdd((wallState: any, key: string) => {
      this.buildService.addBuildingSprite(wallState, "wall");
    });
    $(player).towers.onRemove((towerState: any, key: string) => {
      this.buildService.removeBuildingSprite(key);
    });
    $(player).walls.onRemove((wallState: any, key: string) => {
      this.buildService.removeBuildingSprite(key);
    });
    this.room.onMessage("not_enough_population", () => {
      console.log("popolutation max atteinte")
    });
    this.room.onMessage("not_enough_gold", () => {
      console.log("pas assez de thune")
    });
    this.room.onMessage("path_blocked", () => {
      console.log("chemin bloquette")
    });
    this.game.events.on('choose-building', (data: any) => {
      console.log("Création de :", data.buildingId);
    });

    // CLEAN WHEN CHANGE SCENE
    this.events.once('shutdown', () => this.destroy());
  }

  update(time: number, delta: number) {
    if (this.cameraService) {
      this.cameraService.update(time, delta);
    }
  }

  private destroy() {
    // this.setupService.destroy();
    // this.cameraService.destroy();
    // this.pathRenderer.destroy();
    // this.buildService.destroy();
    // this.waveService.destroy();
    this.game.events.off('choose-building');
  }
}
