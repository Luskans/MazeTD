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
  private ySortGroup!: Phaser.GameObjects.Group;

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
    const player = this.room.state.players.get(this.room.sessionId)
    const playerIndex = Array.from(this.room.state.players.keys()).indexOf(this.room.sessionId);
    const playerOffset = this.setupService.getPlayerOffset(playerIndex);
    console.log(`Player number ${playerIndex} named ${player.username} with ID ${player.sessionId} connected.`)

    // INIT SERVICES
    this.cameraService = new CameraService(this, this.room);
    this.pathRenderer = new PathRenderer(this, this.room);
    this.pathfindingService = new PathfindingService();
    this.buildService = new BuildService(this, this.room, this.pathfindingService);
    this.upgradeService = new UpgradeService(this, this.room);
    this.waveService = new WaveService(this);
    this.enemyService = new EnemyService(this, this.room);

    // GROUP OF ALL SPRITES TO Y SORT THEM
    this.ySortGroup = this.add.group();

    this.setupService.createPlayersGrid(this.room, this.ySortGroup);   // draw the grid
    // this.pathRenderer.drawPath(
    //   Array.from(this.player.currentPath.values()),
    //   this.playerOffset.x,
    //   this.playerOffset.y
    // );
    // this.cameraService.handleFocus(playerIndex);   // center camera on player grid
    this.cameraService.handleFocus(playerOffset);

    // LISTEN CHANGES AND EVENTS
    $(this.room.state).players.onAdd((player: PlayerState, sessionId: string) => {
      const playerIndex = Array.from(this.room.state.players.keys()).indexOf(sessionId);
      const playerOffset = this.setupService.getPlayerOffset(playerIndex);

      $(player).listen("currentPathVersion", () => {
        this.pathRenderer.drawPath(Array.from(player.currentPath.values()), playerOffset, "current", sessionId);
        //@ts-ignore
        console.log("Current Chemin changé, nouvelle state de la game : ", this.room.state.toJSON())
      });

      $(player).listen("pendingPathVersion", () => {
        this.pathRenderer.drawPath(Array.from(player.pendingPath.values()), playerOffset, "pending", sessionId);
        //@ts-ignore
        console.log("Pending Chemin changé, nouvelle state de la game : ", this.room.state.toJSON())
      });

      $(player).towers.onAdd((tower: TowerState, towerId: string) => {
        this.buildService.addBuildingSprite(tower, "tower", playerOffset, player, this.ySortGroup);

        $(tower).listen("placingPending", (pending) => {
          if (!pending) {
            this.buildService.updateBuildingSprite(tower.id, "placing");
          }
        });

        $(tower).listen("sellingPending", (pending) => {
          if (pending) {
            this.buildService.updateBuildingSprite(tower.id, "selling");
            if (this.buildService.getSelectedId() === tower.id) {
              this.buildService.deselectBuilding();
            }
          }
        });
      });

      $(player).towers.onRemove((tower: TowerState, towerId: string) => {
        this.buildService.removeBuildingSprite(towerId);
        this.buildService.deselectBuilding();
      });

      $(player).walls.onAdd((wall: WallState, wallId: string) => {
        this.buildService.addBuildingSprite(wall, "wall", playerOffset, player, this.ySortGroup);

        $(wall).listen("placingPending", (pending) => {
          if (!pending) {
            this.buildService.updateBuildingSprite(wall.id, "placing");
          }
        });

        $(wall).listen("sellingPending", (pending) => {
          if (pending) {
            this.buildService.updateBuildingSprite(wall.id, "selling");
            if (this.buildService.getSelectedId() === wall.id) {
              this.buildService.deselectBuilding();
            }
          }
        });
      });

      $(player).walls.onRemove((wall: WallState, wallId: string) => {
        this.buildService.removeBuildingSprite(wallId);
        this.buildService.deselectBuilding();
      });

      $(player).enemies.onAdd((enemy: EnemyState, enemyId: string) => {
        this.enemyService.createEnemySprite(enemy, enemyId, playerOffset, this.ySortGroup);

        $(enemy).listen("gridX", (value) => {
            this.enemyService.updateTargetPosition(enemyId, value, enemy.gridY, playerOffset);
        });

        $(enemy).listen("gridY", (value) => {
            this.enemyService.updateTargetPosition(enemyId, enemy.gridX, value, playerOffset);
        });
      });

      $(player).enemies.onRemove((enemy: EnemyState, enemyId: string) => {
        this.enemyService.destroyEnemySprite(enemyId);
      });
    });

    $(this.room.state).players.onRemove((p: PlayerState, id: string) => {
      this.pathRenderer.cleanupPath(`${p.sessionId}_current`);
      this.pathRenderer.cleanupPath(`${p.sessionId}_pending`);
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
    this.room.onMessage("error_sell_building", () => {
      console.log("erreur vente building")
    });
    this.game.events.on('choose-building', (data: any) => {
      console.log("Création de :", data.buildingId);
    });
    this.game.events.on('focus_on_player', (playerIndex: number) => {
      const playerOffset = this.setupService.getPlayerOffset(playerIndex);
      this.cameraService.handleFocus(playerOffset);
    });
    this.game.events.on('upgrade_building', (data: { buildingId: string }) => {
      this.room.send("upgrade_building", { buildingId: data.buildingId });
    });
    this.game.events.on('sell_building', (data: { buildingId: string, buildingType: string }) => {
      this.room.send("sell_building", { buildingId: data.buildingId, buildingType: data.buildingType });
    });
    this.game.events.on('rotate_building', (data: { buildingId: string }) => {
      this.room.send("rotate_building", { buildingId: data.buildingId });
    });
    this.game.events.on('rotate_building', (data: { buildingId: string }) => {
      const player = this.room.state.players.get(this.room.sessionId);
      const tower = player?.towers.get(data.buildingId);
      const sprite = this.buildService.getSprite(data.buildingId);

      if (tower && sprite) {
        tower.direction = (tower.direction + 1) % 4;
        this.buildService.selectBuilding(tower, player.sessionId, "tower", sprite);
      }
    });


    // CLEAN WHEN CHANGE SCENE
    this.events.once('shutdown', () => this.destroy());
  }

  update(time: number, delta: number) {
    this.cameraService.update(time, delta);
    this.enemyService.update(time, delta);
    this.ySortGroup.getChildren().forEach((child: any) => {
      child.setDepth(child.y);
    });
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
