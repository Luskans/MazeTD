import { GameState } from "../../../server/src/rooms/schema/GameState";
import { getStateCallbacks, Room } from "colyseus.js";
import type { PlayerState } from "../../../server/src/rooms/schema/PlayerState";
import { GridService } from "../services/GridService";
import { CameraService } from '../services/CameraService';
import { PathService } from "../services/PathService";
import { BuildingService } from "../services/BuildingService";
import { WaveService } from "../services/WaveService";
import { PathfindingService } from "../../../server/src/services/PathfindingService";
import { getGameRoom } from "../colyseus/gameRoomService";
import { UpgradeService } from "../services/UpgradeService";
import type { EnemyState } from "../../../server/src/rooms/schema/EnemyState";
import { EnemyService } from "../services/EnemyService";
import type { TowerState } from "../../../server/src/rooms/schema/TowerState";
import type { WallState } from "../../../server/src/rooms/schema/WallState";
import type { RockState } from "../../../server/src/rooms/schema/RockState";
import { GridService2 } from "../services/GridService2";
import { GridService3 } from "../services/GridService3";
import { PathService2 } from "../services/PathService2";
import { EnemyUIService } from "../services/EnemyUIService";

export class GameScene extends Phaser.Scene {
  private room!: Room<GameState>;
  private gridService!: GridService;
  private gridService2!: GridService2;
  private gridService3!: GridService3;
  private cameraService!: CameraService;
  private pathService!: PathService;
  private pathService2!: PathService2;
  private buildingService!: BuildingService;
  private upgradeService!: UpgradeService;
  private waveService!: WaveService;
  private pathfindingService!: PathfindingService;
  private enemyService!: EnemyService;
  private enemyUIService!: EnemyUIService;
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
    this.gridService = new GridService(this, this.room);
    this.gridService2 = new GridService2(this, this.room);
    this.gridService3 = new GridService3(this, this.room);
    const player = this.room.state.players.get(this.room.sessionId)
    const playerIndex = Array.from(this.room.state.players.keys()).indexOf(this.room.sessionId);
    const playerOffset = this.gridService.getPlayerOffset(playerIndex);
    console.log(`Player number ${playerIndex} named ${player.username} with ID ${player.sessionId} connected.`)

    // INIT SERVICES
    this.cameraService = new CameraService(this, this.room);
    this.pathService = new PathService(this, this.room);
    this.pathService2 = new PathService2(this, this.room);
    this.pathfindingService = new PathfindingService(this.room);
    this.buildingService = new BuildingService(this, this.room, this.pathfindingService);
    this.upgradeService = new UpgradeService(this, this.room);
    this.waveService = new WaveService(this);
    this.enemyService = new EnemyService(this, this.room);
    this.enemyUIService = new EnemyUIService(this);

    // GROUP OF ALL SPRITES TO Y SORT THEM
    this.ySortGroup = this.add.group();
    this.gridService3.createPlayersGrid(this.room, this.ySortGroup);
    this.cameraService.handleFocus(playerOffset);

    // LISTEN CHANGES AND EVENTS
    $(this.room.state).players.onAdd((player: PlayerState, sessionId: string) => {
      const playerIndex = Array.from(this.room.state.players.keys()).indexOf(sessionId);
      const playerOffset = this.gridService.getPlayerOffset(playerIndex);

      $(player).listen("currentPathVersion", () => {
        this.pathService2.drawPath(Array.from(player.currentPath.values()), playerOffset, "current", sessionId);
        //@ts-ignore
        console.log("Current Chemin changé, nouvelle state de la game : ", this.room.state.toJSON())
      });

      $(player).listen("pendingPathVersion", () => {
        this.pathService2.drawPath(Array.from(player.pendingPath.values()), playerOffset, "pending", sessionId);
        //@ts-ignore
        console.log("Pending Chemin changé, nouvelle state de la game : ", this.room.state.toJSON())
      });

      $(player).rocks.onAdd((rock: RockState, rockId: string) => {
        $(rock).listen("destroyPending", (pending) => {
          if (pending) {
            this.gridService.updateRockSprite(rockId);
          }
        });
      });

      $(player).rocks.onRemove((rock: RockState, rockId: string) => {
        this.gridService.removeRockSprite(rockId);
      });

      $(player).towers.onAdd((tower: TowerState, towerId: string) => {
        this.buildingService.addBuildingSprite(tower, "tower", playerOffset, player, this.ySortGroup);

        $(tower).listen("placingPending", (pending) => {
          if (!pending) {
            this.buildingService.updateBuildingSprite(tower.id, "placing");
          }
        });

        $(tower).listen("sellingPending", (pending) => {
          if (pending) {
            this.buildingService.updateBuildingSprite(tower.id, "selling");
            if (this.buildingService.getSelectedId() === tower.id) {
              this.buildingService.deselectBuilding();
            }
          }
        });
      });

      $(player).towers.onRemove((tower: TowerState, towerId: string) => {
        this.buildingService.removeBuildingSprite(towerId);
        this.buildingService.deselectBuilding();
      });

      $(player).walls.onAdd((wall: WallState, wallId: string) => {
        this.buildingService.addBuildingSprite(wall, "wall", playerOffset, player, this.ySortGroup);

        $(wall).listen("placingPending", (pending) => {
          if (!pending) {
            this.buildingService.updateBuildingSprite(wall.id, "placing");
          }
        });

        $(wall).listen("sellingPending", (pending) => {
          if (pending) {
            this.buildingService.updateBuildingSprite(wall.id, "selling");
            if (this.buildingService.getSelectedId() === wall.id) {
              this.buildingService.deselectBuilding();
            }
          }
        });
      });

      $(player).walls.onRemove((wall: WallState, wallId: string) => {
        this.buildingService.removeBuildingSprite(wallId);
        this.buildingService.deselectBuilding();
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
      this.pathService2.cleanupPath(`${p.sessionId}_current`);
      this.pathService2.cleanupPath(`${p.sessionId}_pending`);
    });
    // $(player).listen("pathVersion", () => {
    //   this.pathService.drawPath(
    //     Array.from(player.currentPath.values()),
    //     playerOffset.x,
    //     playerOffset.y
    //   );
    //   //@ts-ignore
    //   console.log("Chemin changé, nouvelle state de la game : ", this.room.state.toJSON())
    // });
    // $(player).towers.onAdd((towerState: any, key: string) => {
    //   this.buildingService.addBuildingSprite(towerState, "tower");
    // });
    // $(player).walls.onAdd((wallState: any, key: string) => {
    //   this.buildingService.addBuildingSprite(wallState, "wall");
    // });
    // $(player).towers.onRemove((towerState: any, key: string) => {
    //   this.buildingService.removeBuildingSprite(key);
    // });
    // $(player).walls.onRemove((wallState: any, key: string) => {
    //   this.buildingService.removeBuildingSprite(key);
    // });
    this.room.onMessage("error", (message: string) => {
      console.log(`Error from server : ${message}`)
    });
    this.game.events.on('focus_on_player', (playerIndex: number) => {
      const playerOffset = this.gridService.getPlayerOffset(playerIndex);
      this.cameraService.handleFocus(playerOffset);
    });
    this.game.events.on('levelup_building', (data: { buildingId: string }) => {
      this.room.send("levelup_building", { buildingId: data.buildingId });
    });
    this.game.events.on('sell_building', (data: { buildingId: string, buildingType: string }) => {
      this.room.send("sell_building", { buildingId: data.buildingId, buildingType: data.buildingType });
    });
    this.game.events.on('rotate_building', (data: { buildingId: string }) => {
      this.room.send("rotate_building", { buildingId: data.buildingId });
      const player = this.room.state.players.get(this.room.sessionId);
      const tower = player?.towers.get(data.buildingId);
      const sprite = this.buildingService.getSprite(data.buildingId);

      if (tower && sprite) {
        tower.direction = (tower.direction + 1) % 4;
        this.buildingService.selectBuilding(tower, player.sessionId, "tower", sprite);
      }
    });
    this.game.events.on('deselect_building', () => {
      this.buildingService.deselectBuilding();
    });


    // CLEAN WHEN CHANGE SCENE
    this.events.once('shutdown', () => this.destroy());
  }

  update(time: number, delta: number) {
    this.cameraService.update(time, delta);
    this.enemyService.update(time, delta);
    this.enemyUIService.update();
    this.ySortGroup.getChildren().forEach((child: any) => {
      child.setDepth(child.y);
    });
  }

  private destroy() {
    this.room.removeAllListeners()
    // this.gridService.destroy();
    // this.cameraService.destroy();
    // this.pathService.destroy();
    // this.buildingService.destroy();
    // this.waveService.destroy();
    this.game.events.off('choose-building');
  }
}
