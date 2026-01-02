import { GameState } from "../../../server/src/rooms/schema/GameState";
import { getStateCallbacks, Room } from "colyseus.js";
import type { PlayerState } from "../../../server/src/rooms/schema/PlayerState";
import { SetupService } from "../services/SetupService";
import { CameraService } from '../services/CameraService';
import { PathRenderer } from "../services/PathRenderer";
import { BuildService } from "../services/BuildService";
import { WaveService } from "../services/WaveService";
import { PathfindingService } from "../../../server/src/services/PathfindingService";
import { getGameRoom } from "../colyseus/gameRoomService";
import { UpgradeService } from "../services/UpgradeService";
import type { EnemyState } from "../../../server/src/rooms/schema/EnemyState";
import { EnemyService } from "../services/EnemyService";
import type { TowerState } from "../../../server/src/rooms/schema/TowerState";
import type { WallState } from "../../../server/src/rooms/schema/WallState";

export class GameScene extends Phaser.Scene {
  private room!: Room<GameState>;
  private setupService!: SetupService;
  private cameraService!: CameraService;
  private pathRenderer!: PathRenderer;
  private buildService!: BuildService;
  private upgradeService!: UpgradeService;
  private waveService!: WaveService;
  private pathfindingService!: PathfindingService;
  private enemyService!: EnemyService;

  private player!: PlayerState;
  private playerIndex!: number;
  private playerOffset!: {x: number, y: number};

  constructor() {
    super("GameScene");
  }

  init() {
    this.room = getGameRoom();
    //@ts-ignore
    console.log("Dans game scene, le state de la game : ", this.room.state.toJSON());
  }

  create() {
    const $ = getStateCallbacks(this.room);
    // VARIABLES THAT BE SOMEWHERE ELSE
    this.setupService = new SetupService(this, this.room);
    this.player = this.room.state.players.get(this.room.sessionId)
    this.playerIndex = Array.from(this.room.state.players.keys()).indexOf(this.room.sessionId);
    this.playerOffset = this.setupService.getPlayerOffset(this.playerIndex);
    console.log(`Player number ${this.playerIndex} named ${this.player.username} with ID ${this.player.sessionId} connected.`)

    // INIT SERVICES
    this.cameraService = new CameraService(this, this.room, this.playerOffset);
    this.pathRenderer = new PathRenderer(this);
    this.pathfindingService = new PathfindingService();
    this.buildService = new BuildService(this, this.room, this.playerOffset, this.pathfindingService);
    this.upgradeService = new UpgradeService(this, this.room, this.playerOffset);
    this.waveService = new WaveService(this);
    this.enemyService = new EnemyService(this, this.room, this.playerOffset);

    this.setupService.createPlayersGrid(this.room);   // draw the grid
    // this.pathRenderer.drawPath(
    //   Array.from(this.player.currentPath.values()),
    //   this.playerOffset.x,
    //   this.playerOffset.y
    // );
    this.cameraService.handleFocus(this.playerIndex);   // center camera on player grid

    // LISTEN CHANGES AND EVENTS
    $(this.room.state).players.onAdd((player: PlayerState, sessionId: string) => {

      $(player).listen("pathVersion", () => {
        this.pathRenderer.drawPath(Array.from(player.currentPath.values()), this.playerOffset.x, this.playerOffset.y);
        //@ts-ignore
        console.log("Chemin changé, nouvelle state de la game : ", this.room.state.toJSON())
      });

      $(player).towers.onAdd((tower: TowerState, towerId: string) => {
        this.buildService.addBuildingSprite(tower, "tower");
      });

      $(player).towers.onRemove((tower: TowerState, towerId: string) => {
        this.buildService.removeBuildingSprite(towerId);
      });

      $(player).walls.onAdd((wall: WallState, wallId: string) => {
        this.buildService.addBuildingSprite(wall, "wall");
      });

      $(player).walls.onRemove((wall: WallState, wallId: string) => {
        this.buildService.removeBuildingSprite(wallId);
      });

      $(player).enemies.onAdd((enemy: EnemyState, enemyId: string) => {
        this.enemyService.createEnemySprite(enemy, enemyId);

        $(enemy).listen("gridX", (value) => {
            this.enemyService.updateTargetPosition(enemyId, value, enemy.gridY);
        });

        $(enemy).listen("gridY", (value) => {
            this.enemyService.updateTargetPosition(enemyId, enemy.gridX, value);
        });
      });

      $(player).enemies.onRemove((enemy: EnemyState, enemyId: string) => {
        this.enemyService.destroyEnemySprite(enemyId);
      });
    });

    $(this.room.state).players.onRemove((p: PlayerState, id: string) => {

    });
    // $(player).listen("pathVersion", () => {
    //   this.pathRenderer.drawPath(
    //     Array.from(player.currentPath.values()),
    //     playerOffset.x,
    //     playerOffset.y
    //   );
    //   //@ts-ignore
    //   console.log("Chemin changé, nouvelle state de la game : ", this.room.state.toJSON())
    // });
    // $(player).towers.onAdd((towerState: any, key: string) => {
    //   this.buildService.addBuildingSprite(towerState, "tower");
    // });
    // $(player).walls.onAdd((wallState: any, key: string) => {
    //   this.buildService.addBuildingSprite(wallState, "wall");
    // });
    // $(player).towers.onRemove((towerState: any, key: string) => {
    //   this.buildService.removeBuildingSprite(key);
    // });
    // $(player).walls.onRemove((wallState: any, key: string) => {
    //   this.buildService.removeBuildingSprite(key);
    // });
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
      this.enemyService.update(time, delta);
    }
  }

  private destroy() {
    this.room.removeAllListeners()
    // this.setupService.destroy();
    // this.cameraService.destroy();
    // this.pathRenderer.destroy();
    // this.buildService.destroy();
    // this.waveService.destroy();
    this.game.events.off('choose-building');
  }
}
